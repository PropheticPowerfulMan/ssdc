from contextlib import asynccontextmanager
from datetime import timedelta
from uuid import UUID
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy import select, func, text
from sqlalchemy.orm import Session
from app.config import settings
from app.body_limit import RequestBodyLimitMiddleware
from app.db import database
from app.models import User, Document, Version, Grant, AccessRequest, AuditEvent, now, uid
from app.identity import current_user
from app.policy import can_read, can_approve, eligible, future
from app.crypto import provider, encrypt, decrypt
from app.integrations import scan, object_path


@asynccontextmanager
async def lifespan(app):
    provider()  # Refuse startup without configured key management.
    if not settings().oidc_client_secret:
        raise RuntimeError("OIDC introspection client secret required")
    if settings().environment != "development":
        if not settings().oidc_issuer.startswith("https://") or not settings().oidc_internal_url.startswith("https://"):
            raise RuntimeError("Production identity transport requires TLS")
    yield


app = FastAPI(title="SSDC-RDC — proposition institutionnelle", version="0.1.0", lifespan=lifespan)
app.add_middleware(RequestBodyLimitMiddleware, max_bytes=settings().max_upload_bytes + 64 * 1024)
app.add_middleware(CORSMiddleware, allow_origins=[settings().frontend_origin],
                   allow_methods=["GET", "POST"], allow_headers=["Authorization", "Content-Type"])


@app.middleware("http")
async def headers(request, call_next):
    response = await call_next(request)
    response.headers.update({"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
                             "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY"})
    return response


def audit(db, user, action, resource=None, allowed=True):
    db.add(AuditEvent(actor=user.id, action=action, resource=resource, allowed=allowed))
    db.commit()


def require(db, user, allowed, action, resource=None):
    if not allowed:
        audit(db, user, action, resource, False)
        raise HTTPException(404, "Ressource indisponible")


def visible(db, user, document):
    return can_read(user, document, db.get(Grant, (document.id, user.id)))


def metadata(doc):
    return {"id": doc.id, "title": doc.title, "classification": doc.classification,
            "compartments": doc.compartments, "status": doc.status, "created_at": doc.created_at}


@app.get("/api/v1/health")
def health():
    return {"status": "alive", "accredited": False}


@app.get("/api/v1/me")
def me(user: User = Depends(current_user)):
    return {"id": user.id, "name": user.name, "department": user.department, "roles": user.roles,
            "clearance": user.clearance, "compartments": user.compartments}


@app.get("/api/v1/documents")
def documents(user: User = Depends(current_user), db: Session = Depends(database)):
    # SQL prefilter limits candidates; policy is always evaluated before serialization.
    candidates = db.scalars(select(Document).join(Grant, Grant.document_id == Document.id)
                           .where(Grant.user_id == user.id)).all()
    result = [metadata(d) for d in candidates if visible(db, user, d)]
    audit(db, user, "document.list")
    return result


@app.get("/api/v1/documents/{document_id}")
def detail(document_id: UUID, user: User = Depends(current_user), db: Session = Depends(database)):
    doc = db.get(Document, str(document_id))
    require(db, user, doc is not None and visible(db, user, doc), "document.metadata", str(document_id))
    audit(db, user, "document.metadata", doc.id)
    return metadata(doc)


@app.get("/api/v1/documents/{document_id}/content")
def content(document_id: UUID, user: User = Depends(current_user), db: Session = Depends(database)):
    doc = db.get(Document, str(document_id))
    require(db, user, doc is not None and visible(db, user, doc), "document.read", str(document_id))
    version = db.scalar(select(Version).where(Version.document_id == doc.id))
    try:
        plaintext = decrypt(object_path(version.object_id).read_bytes(), doc.id, version.nonce,
                            version.wrapped_key, version.key_reference, provider())
    except Exception:
        audit(db, user, "document.integrity_failure", doc.id, False)
        raise HTTPException(503, "Contenu indisponible") from None
    audit(db, user, "document.read", doc.id)
    return Response(plaintext, media_type=version.media_type,
                    headers={"Content-Disposition": 'attachment; filename="document"'})


@app.post("/api/v1/documents", status_code=201)
def upload(title: str = Form(..., min_length=3, max_length=200),
           classification: int = Form(..., ge=0, le=4), compartments: str = Form(""),
           file: UploadFile = File(...), user: User = Depends(current_user), db: Session = Depends(database)):
    labels = sorted(set(x.strip() for x in compartments.split(",") if x.strip()))
    if len(labels) > 20 or any(len(x) > 100 for x in labels):
        raise HTTPException(422, "Compartiments invalides")
    doc = Document(id=uid(), title=title, owner_id=user.id, department=user.department,
                   classification=classification, compartments=labels, status="released")
    require(db, user, "uploader" in user.roles and "reader" in user.roles and eligible(user, doc), "document.upload")
    data = file.file.read(settings().max_upload_bytes + 1)
    if not data or len(data) > settings().max_upload_bytes:
        raise HTTPException(413, "Fichier vide ou trop volumineux")
    media_type = file.content_type
    if media_type == "application/pdf" and data.startswith(b"%PDF-"):
        pass
    elif media_type == "text/plain":
        try:
            decoded = data.decode("utf-8")
            if "\x00" in decoded:
                raise ValueError()
        except (UnicodeError, ValueError):
            raise HTTPException(415, "Texte UTF-8 requis") from None
    else:
        raise HTTPException(415, "Formats autorisés : PDF et texte UTF-8")
    try:
        scan(data)
    except (OSError, ValueError):
        audit(db, user, "document.scan_rejected", doc.id, False)
        raise HTTPException(422, "Analyse antivirus refusée ou indisponible") from None
    ciphertext, nonce, wrapped, reference = encrypt(data, doc.id, provider())
    object_id = uid()
    path = object_path(object_id)
    try:
        with path.open("xb") as stream:
            stream.write(ciphertext)
        db.add(doc)
        db.flush()
        db.add(Version(document_id=doc.id, object_id=object_id, media_type=media_type,
                       size=len(data), nonce=nonce, wrapped_key=wrapped, key_reference=reference))
        db.add(Grant(document_id=doc.id, user_id=user.id, expires_at=now() + timedelta(days=30)))
        audit(db, user, "document.upload", doc.id)
    except Exception:
        db.rollback()
        path.unlink(missing_ok=True)
        raise
    return metadata(doc)


class RequestInput(BaseModel):
    document_id: UUID
    justification: str = Field(min_length=20, max_length=2000)


@app.post("/api/v1/access-requests", status_code=201)
def request_access(body: RequestInput, user: User = Depends(current_user), db: Session = Depends(database)):
    doc = db.get(Document, str(body.document_id))
    require(db, user, doc is not None and eligible(user, doc) and "reader" in user.roles
            and doc.status == "released", "access.request", str(body.document_id))
    request = AccessRequest(document_id=doc.id, user_id=user.id, justification=body.justification)
    db.add(request)
    audit(db, user, "access.request", doc.id)
    return {"id": request.id, "status": request.status}


@app.get("/api/v1/access-requests")
def requests(user: User = Depends(current_user), db: Session = Depends(database)):
    result = []
    for request, doc in db.execute(select(AccessRequest, Document).join(Document, Document.id == AccessRequest.document_id)):
        if request.user_id == user.id or can_approve(user, doc, request.user_id):
            result.append({"id": request.id, "document_id": request.document_id,
                           "user_id": request.user_id, "justification": request.justification, "status": request.status})
    return result


class DecisionInput(BaseModel):
    approve: bool
    hours: int = Field(default=24, ge=1, le=720)


@app.post("/api/v1/access-requests/{request_id}/decision")
def decide(request_id: UUID, body: DecisionInput, user: User = Depends(current_user), db: Session = Depends(database)):
    request = db.scalar(select(AccessRequest).where(AccessRequest.id == str(request_id)).with_for_update())
    doc = db.get(Document, request.document_id) if request else None
    require(db, user, request is not None and can_approve(user, doc, request.user_id), "access.decision", str(request_id))
    if request.status != "pending":
        raise HTTPException(409, "Demande déjà traitée")
    target = db.get(User, request.user_id)
    if body.approve and not eligible(target, doc):
        raise HTTPException(409, "Habilitation du demandeur invalide")
    request.status = "approved" if body.approve else "rejected"
    request.decided_by, request.decided_at = user.id, now()
    if body.approve:
        grant = db.get(Grant, (doc.id, request.user_id))
        if grant is None:
            grant = Grant(document_id=doc.id, user_id=request.user_id)
            db.add(grant)
        grant.expires_at = now() + timedelta(hours=body.hours)
    audit(db, user, "access." + request.status, doc.id)
    return {"status": request.status}


@app.post("/api/v1/documents/{document_id}/revoke/{subject}")
def revoke(document_id: UUID, subject: str, user: User = Depends(current_user), db: Session = Depends(database)):
    doc = db.get(Document, str(document_id))
    require(db, user, doc is not None and can_approve(user, doc, subject), "access.revoke", str(document_id))
    grant = db.get(Grant, (doc.id, subject))
    if grant:
        db.delete(grant)
    audit(db, user, "access.revoke", doc.id)
    return {"status": "revoked"}


@app.get("/api/v1/dashboard")
def dashboard(user: User = Depends(current_user), db: Session = Depends(database)):
    docs = documents(user, db)
    return {"visible_documents": len(docs),
            "by_classification": {str(i): sum(d["classification"] == i for d in docs) for i in range(5)},
            "my_pending_requests": db.scalar(select(func.count()).select_from(AccessRequest)
                .where(AccessRequest.user_id == user.id, AccessRequest.status == "pending")),
            "active_sessions": None, "backup_status": "not_configured"}


@app.get("/api/v1/audit")
def audit_events(user: User = Depends(current_user), db: Session = Depends(database)):
    require(db, user, "auditor" in user.roles, "audit.list")
    # No protected resource identifiers exposed through this operational view.
    return [{"id": e.id, "action": e.action, "allowed": e.allowed, "created_at": e.created_at}
            for e in db.scalars(select(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(200))]
