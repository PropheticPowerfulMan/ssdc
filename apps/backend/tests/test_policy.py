from datetime import timedelta
from types import SimpleNamespace
import pytest
from app.models import now
from app.policy import can_read, can_approve


def fixtures():
    user = SimpleNamespace(id="a", active=True, roles=["reader", "approver"], clearance=4,
                           clearance_expires=now()+timedelta(days=1), compartments=["A", "B"], department="DANTIC")
    doc = SimpleNamespace(owner_id="a", classification=3, compartments=["A"], department="DANTIC", status="released", expires_at=None)
    grant = SimpleNamespace(expires_at=now()+timedelta(hours=1))
    return user, doc, grant


def test_explicit_need_to_know():
    u,d,g = fixtures()
    assert can_read(u,d,g)
    assert not can_read(u,d,None)


@pytest.mark.parametrize("attribute,value", [("active",False),("roles",["admin"]),("clearance",2),("compartments",["B"]),("department","OTHER"),("clearance_expires",now()-timedelta(seconds=1))])
def test_each_user_boundary_denies(attribute,value):
    u,d,g=fixtures()
    setattr(u,attribute,value)
    assert not can_read(u,d,g)


@pytest.mark.parametrize("attribute,value",[("status","quarantine"),("status","archived"),("expires_at",now()-timedelta(seconds=1))])
def test_document_boundaries(attribute,value):
    u,d,g=fixtures()
    setattr(d,attribute,value)
    assert not can_read(u,d,g)


def test_expired_grant_and_self_approval():
    u,d,g=fixtures()
    g.expires_at=now()-timedelta(seconds=1)
    assert not can_read(u,d,g)
    assert not can_approve(u,d,"a")
    assert can_approve(u,d,"b")
    d.owner_id="b"
    assert not can_approve(u,d,"c")
