import base64
import os
from datetime import timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from app.main import app
from app.db import Base, database
from app.identity import current_user
from app.models import User, Document, Grant, AuditEvent, Version, now
from app.config import settings


@pytest.fixture
def setup(tmp_path, monkeypatch):
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    Base.metadata.create_all(engine)
    db=Session(engine)
    user=User(id="alice", name="Fictional Alice", department="DANTIC", roles=["reader","uploader","approver"], clearance=4, compartments=["A"], clearance_expires=now()+timedelta(days=1),active=True)
    bob=User(id="bob",name="Fictional Bob",department="DANTIC",roles=["reader"],clearance=4,compartments=["A"],clearance_expires=now()+timedelta(days=1),active=True)
    db.add_all([user,bob]);db.commit()
    app.dependency_overrides[database]=lambda:db
    app.dependency_overrides[current_user]=lambda:user
    monkeypatch.setattr(settings(),"storage_path",str(tmp_path))
    monkeypatch.setattr(settings(),"development_kek",base64.b64encode(os.urandom(32)).decode())
    client=TestClient(app)
    yield client,db,user,bob
    app.dependency_overrides.clear()
    db.close();engine.dispose()


def test_upload_encrypted_and_idor_denied(setup,monkeypatch):
    client,db,alice,bob=setup
    monkeypatch.setattr("app.main.scan",lambda _:None)
    response=client.post("/api/v1/documents",data={"title":"Fictional report","classification":3,"compartments":"A"},files={"file":("report.txt",b"synthetic data","text/plain")})
    assert response.status_code==201,response.text
    document_id=response.json()["id"]
    version=db.scalar(select(Version))
    from app.integrations import object_path
    assert b"synthetic data" not in object_path(version.object_id).read_bytes()
    assert "wrapped_key" not in response.text and "object_id" not in response.text
    assert client.get(f"/api/v1/documents/{document_id}/content").content==b"synthetic data"
    app.dependency_overrides[current_user]=lambda:bob
    assert client.get("/api/v1/documents").json()==[]
    assert client.get(f"/api/v1/documents/{document_id}").status_code==404
    assert client.get(f"/api/v1/documents/{document_id}/content").status_code==404
    assert db.scalar(select(AuditEvent).where(AuditEvent.allowed==False)) is not None
    request=client.post("/api/v1/access-requests",json={"document_id":document_id,"justification":"Fictional review of the technical report"})
    assert request.status_code==201
    request_id=request.json()["id"]
    assert client.post(f"/api/v1/access-requests/{request_id}/decision",json={"approve":True}).status_code==404
    app.dependency_overrides[current_user]=lambda:alice
    assert client.post(f"/api/v1/access-requests/{request_id}/decision",json={"approve":True}).status_code==200
    assert client.post(f"/api/v1/access-requests/{request_id}/decision",json={"approve":True}).status_code==409
    app.dependency_overrides[current_user]=lambda:bob
    assert client.get(f"/api/v1/documents/{document_id}/content").status_code==200
    app.dependency_overrides[current_user]=lambda:alice
    assert client.post(f"/api/v1/documents/{document_id}/revoke/bob").status_code==200
    app.dependency_overrides[current_user]=lambda:bob
    assert client.get(f"/api/v1/documents/{document_id}/content").status_code==404


def test_scan_failure_never_releases(setup,monkeypatch):
    client,db,*_=setup
    def reject(_):raise OSError("scanner unavailable")
    monkeypatch.setattr("app.main.scan",reject)
    response=client.post("/api/v1/documents",data={"title":"Fictional report","classification":0},files={"file":("report.txt",b"sample","text/plain")})
    assert response.status_code==422
    assert db.scalars(select(Document)).all()==[]


def test_missing_session_rejected(setup):
    client,*_=setup
    del app.dependency_overrides[current_user]
    assert client.get("/api/v1/documents").status_code in [401,403]


@pytest.mark.parametrize("extra", [0, 1])
def test_exact_file_limit_preserved_with_multipart_overhead(setup, monkeypatch, extra):
    client, db, *_ = setup
    monkeypatch.setattr("app.main.scan", lambda _: None)
    limit = settings().max_upload_bytes
    response = client.post("/api/v1/documents", data={"title": "Boundary-size fictional file", "classification": 0}, files={"file": ("boundary.txt", b"a" * (limit + extra), "text/plain")})
    assert response.status_code == (201 if extra == 0 else 413)
