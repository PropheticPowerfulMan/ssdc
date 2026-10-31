import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.db import database
from app.models import User

bearer = HTTPBearer()


def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(database)):
    cfg = settings()
    # Online introspection makes account/session revocation effective on each request.
    try:
        response = httpx.post(cfg.oidc_internal_url + "/protocol/openid-connect/token/introspect",
                              data={"token": credentials.credentials},
                              auth=(cfg.oidc_client_id, cfg.oidc_client_secret), timeout=5)
        response.raise_for_status()
        claims = response.json()
        audiences = claims.get("aud", [])
        audiences = [audiences] if isinstance(audiences, str) else audiences
        if not (claims.get("active") is True and claims.get("iss") == cfg.oidc_issuer
                and cfg.oidc_audience in audiences and claims.get("acr") == "2"
                and claims.get("exp", 0) > __import__("time").time()):
            raise ValueError("Invalid identity context")
        user = db.get(User, claims["sub"])
        if user is None or not user.active:
            raise ValueError("Unprovisioned or disabled account")
        return user
    except (httpx.HTTPError, ValueError, KeyError, TypeError):
        raise HTTPException(401, "Session invalide ou MFA requis") from None
