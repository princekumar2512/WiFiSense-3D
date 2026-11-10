from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
import jwt
from pydantic import BaseModel
from app.core.config import settings

class TokenData(BaseModel):
    user_id: str
    email: str
    role: str
    organization_id: str
    permissions: List[str]
    university_id: Optional[str] = None
    issuer: Optional[str] = None
    audience: Optional[str] = None

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
    issuer: Optional[str] = None,
    audience: Optional[str] = None
) -> str:
    """Creates a cryptographically signed JWT with explicit issuer, audience, and expiration claims."""
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    expire = now_utc + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    iss = issuer or settings.JWT_ISSUER
    aud = audience or settings.JWT_AUDIENCE
    to_encode.update({
        "exp": expire,
        "iat": now_utc,
        "iss": iss,
        "aud": aud
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(
    token: str,
    expected_issuer: Optional[str] = None,
    expected_audience: Optional[str] = None
) -> Optional[TokenData]:
    """
    Decodes and rigorously validates JWT token:
    - Signature verification (HMAC-SHA256)
    - Expiration verification (exp)
    - Issuer verification (iss)
    - Audience verification (aud)
    """
    try:
        iss = expected_issuer or settings.JWT_ISSUER
        aud = expected_audience or settings.JWT_AUDIENCE
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            issuer=iss,
            audience=aud,
            options={"require": ["exp", "iat", "iss", "aud"]}
        )
        return TokenData(
            user_id=payload.get("sub", ""),
            email=payload.get("email", ""),
            role=payload.get("role", "GUEST"),
            organization_id=payload.get("org_id", ""),
            permissions=payload.get("permissions", []),
            university_id=payload.get("univ_id", None),
            issuer=payload.get("iss", None),
            audience=payload.get("aud", None)
        )
    except Exception:
        return None



