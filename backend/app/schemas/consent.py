from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ConsentGrantRequest(BaseModel):
    user_id: str
    purpose: str = "Indoor spatial localization & emergency safety beacon research inside Hostel Block Alpha"
    notice_version: str = "2026-v1"
    retention_period_days: int = 30

class ConsentRevokeRequest(BaseModel):
    user_id: str
    reason: Optional[str] = "User requested consent revocation"

class ConsentRecordSchema(BaseModel):
    id: str
    user_id: str
    notice_version: str
    purpose: str
    legal_basis: str
    granted_at: datetime
    revoked_at: Optional[datetime] = None
    is_currently_active: bool
    retention_period_days: int
    model_config = {"from_attributes": True}

class PrivacyRequestCreate(BaseModel):
    user_id: str
    request_type: str # 'ACCESS_DATA', 'ERASURE', 'PAUSE_TRACKING', 'CORRECTION'
    audit_notes: Optional[str] = None
