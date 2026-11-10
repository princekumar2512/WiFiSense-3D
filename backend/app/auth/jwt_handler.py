from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import jwt
from pydantic import BaseModel

SECRET_KEY = "wifisense-3d-cryptographically-secure-signing-key-for-research"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

class TokenData(BaseModel):
    user_id: str
    email: str
    role: str
    organization_id: str
    permissions: List[str]

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenData(
            user_id=payload.get("sub", ""),
            email=payload.get("email", ""),
            role=payload.get("role", "GUEST"),
            organization_id=payload.get("org_id", ""),
            permissions=payload.get("permissions", [])
        )
    except Exception:
        return None

