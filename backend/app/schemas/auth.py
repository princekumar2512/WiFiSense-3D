from typing import List, Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    email: str
    role: str
    organization_id: Optional[str] = None
    permissions: List[str]

class UserProfileSchema(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    university_id: Optional[str] = None
    assigned_building_id: Optional[str] = None
    is_active: bool
    is_verified: bool
    allowed_permissions: List[str]

