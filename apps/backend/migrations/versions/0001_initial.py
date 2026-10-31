"""Initial application schema (frozen baseline)."""
from alembic import op
import sqlalchemy as sa
revision = "0001"
down_revision = None

def upgrade():
    op.create_table("users", sa.Column("id", sa.String(128), primary_key=True), sa.Column("name", sa.String(200), nullable=False), sa.Column("department", sa.String(100), nullable=False), sa.Column("roles", sa.JSON, nullable=False), sa.Column("clearance", sa.Integer, nullable=False), sa.Column("compartments", sa.JSON, nullable=False), sa.Column("clearance_expires", sa.DateTime(timezone=True), nullable=False), sa.Column("active", sa.Boolean, nullable=False), sa.CheckConstraint("clearance BETWEEN 0 AND 4"))
    op.create_table("documents", sa.Column("id", sa.String(36), primary_key=True), sa.Column("title", sa.String(200), nullable=False), sa.Column("owner_id", sa.String(128), sa.ForeignKey("users.id"), nullable=False), sa.Column("department", sa.String(100), nullable=False), sa.Column("classification", sa.Integer, nullable=False), sa.Column("compartments", sa.JSON, nullable=False), sa.Column("status", sa.String(20), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("expires_at", sa.DateTime(timezone=True)), sa.Column("legal_hold", sa.Boolean, nullable=False), sa.CheckConstraint("classification BETWEEN 0 AND 4"))
    op.create_index("ix_documents_owner_id", "documents", ["owner_id"])
    op.create_table("document_versions", sa.Column("id", sa.String(36), primary_key=True), sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False, unique=True), sa.Column("object_id", sa.String(36), nullable=False, unique=True), sa.Column("media_type", sa.String(100), nullable=False), sa.Column("size", sa.Integer, nullable=False), sa.Column("nonce", sa.LargeBinary, nullable=False), sa.Column("wrapped_key", sa.LargeBinary, nullable=False), sa.Column("key_reference", sa.String(500), nullable=False))
    op.create_table("document_permissions", sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), primary_key=True), sa.Column("user_id", sa.String(128), sa.ForeignKey("users.id"), primary_key=True), sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False))
    op.create_table("access_requests", sa.Column("id", sa.String(36), primary_key=True), sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False), sa.Column("user_id", sa.String(128), sa.ForeignKey("users.id"), nullable=False), sa.Column("justification", sa.String(2000), nullable=False), sa.Column("status", sa.String(20), nullable=False), sa.Column("decided_by", sa.String(128), sa.ForeignKey("users.id")), sa.Column("decided_at", sa.DateTime(timezone=True)))
    op.create_index("ix_access_requests_document_id", "access_requests", ["document_id"])
    op.create_index("ix_access_requests_user_id", "access_requests", ["user_id"])
    op.create_table("audit_logs", sa.Column("id", sa.String(36), primary_key=True), sa.Column("actor", sa.String(128), nullable=False), sa.Column("action", sa.String(100), nullable=False), sa.Column("resource", sa.String(36)), sa.Column("allowed", sa.Boolean, nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False))
    op.create_index("ix_audit_logs_actor", "audit_logs", ["actor"])

def downgrade():
    for name in ["audit_logs", "access_requests", "document_permissions", "document_versions", "documents", "users"]:
        op.drop_table(name)
