from datetime import timedelta
from types import SimpleNamespace
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.identity import current_user
from app.config import settings
from app.models import now


@pytest.mark.parametrize("change",[{"active":False},{"acr":"1"},{"iss":"https://attacker.invalid"},{"aud":["other"]},{"exp":0}])
def test_bad_identity_context_rejected(monkeypatch,change):
    claims={"active":True,"acr":"2","iss":settings().oidc_issuer,"aud":[settings().oidc_audience],"exp":(now()+timedelta(minutes=1)).timestamp(),"sub":"alice"}
    claims.update(change)
    response=SimpleNamespace(raise_for_status=lambda:None,json=lambda:claims)
    monkeypatch.setattr("app.identity.httpx.post",lambda *a,**k:response)
    with pytest.raises(HTTPException) as error:
        current_user(HTTPAuthorizationCredentials(scheme="Bearer",credentials="fictional"),SimpleNamespace(get=lambda *a:SimpleNamespace(active=True)))
    assert error.value.status_code==401
