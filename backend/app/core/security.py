import hashlib
import bcrypt

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return plain_password == hashed_password

def hash_token(token: str) -> str:
    """SHA-256 hash for secure storage of session/refresh tokens."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def generate_pseudonym(user_id: str, salt: str = "dpdp-2026") -> str:
    """Deterministic pseudonym for researcher views without revealing personal names."""
    raw = f"{user_id}:{salt}".encode("utf-8")
    short_hash = hashlib.sha256(raw).hexdigest()[:6].upper()
    return f"Participant #{short_hash}"
