from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth.dependencies import require_role
from app.models.audit import AuditLog
from app.models.user import User

router = APIRouter(prefix="/audit", tags=["Security & Compliance Audit Logs"])

@router.get("/logs", response_model=List[Dict[str, Any]])
async def get_audit_logs(
    current_user: User = Depends(require_role(["SUPER_ADMIN", "UNIVERSITY_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve immutable security and compliance audit logs."""
    res = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100))
    logs = res.scalars().all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "actor_user_id": l.actor_user_id,
            "status": l.status,
            "details": l.details_json,
            "timestamp": l.timestamp.isoformat()
        }
        for l in logs
    ]
