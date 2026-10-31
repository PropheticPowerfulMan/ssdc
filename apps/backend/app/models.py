import uuid
from datetime import datetime, timezone
from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, LargeBinary, String, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base


def now():
    return datetime.now(timezone.utc)


def uid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    department: Mapped[str] = mapped_column(String(100))
    roles: Mapped[list] = mapped_column(JSON, default=list)
    clearance: Mapped[int] = mapped_column(Integer, default=0)
    compartments: Mapped[list] = mapped_column(JSON, default=list)
    clearance_expires: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    __table_args__ = (CheckConstraint("clearance BETWEEN 0 AND 4"),)


class Document(Base):
    __tablename__ = "documents"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    title: Mapped[str] = mapped_column(String(200))
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    department: Mapped[str] = mapped_column(String(100))
    classification: Mapped[int] = mapped_column(Integer)
    compartments: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(20), default="released")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    legal_hold: Mapped[bool] = mapped_column(Boolean, default=False)
    __table_args__ = (CheckConstraint("classification BETWEEN 0 AND 4"),)


class Version(Base):
    __tablename__ = "document_versions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"), unique=True)
    object_id: Mapped[str] = mapped_column(String(36), unique=True)
    media_type: Mapped[str] = mapped_column(String(100))
    size: Mapped[int] = mapped_column(Integer)
    nonce: Mapped[bytes] = mapped_column(LargeBinary)
    wrapped_key: Mapped[bytes] = mapped_column(LargeBinary)
    key_reference: Mapped[str] = mapped_column(String(500))


class Grant(Base):
    __tablename__ = "document_permissions"
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class AccessRequest(Base):
    __tablename__ = "access_requests"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    justification: Mapped[str] = mapped_column(String(2000))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    decided_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"))
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class AuditEvent(Base):
    __tablename__ = "audit_logs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    actor: Mapped[str] = mapped_column(String(128), index=True)
    action: Mapped[str] = mapped_column(String(100))
    resource: Mapped[str | None] = mapped_column(String(36))
    allowed: Mapped[bool] = mapped_column(Boolean)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
