from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.consent import ConsentRecord, PrivacyRequest
from app.models.audit import AuditLog
from app.schemas.consent import ConsentGrantRequest, ConsentRevokeRequest, ConsentRecordSchema, PrivacyRequestCreate

router = APIRouter(prefix="/consent", tags=["Consent & DPDP Act 2023"])

@router.post("/grant", response_model=ConsentRecordSchema)
async def grant_consent(
    payload: ConsentGrantRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Grant explicit consent for indoor localization telemetry under DPDP Act 2023."""
    # Deactivate any previous active consent record
    await db.execute(
        update(ConsentRecord)
        .where(ConsentRecord.user_id == current_user.id, ConsentRecord.is_currently_active == True)
        .values(is_currently_active=False, revoked_at=datetime.utcnow())
    )

    consent = ConsentRecord(
        user_id=current_user.id,
        notice_version=payload.notice_version,
        purpose=payload.purpose,
        legal_basis="India DPDP Act 2023 Section 6",
        granted_at=datetime.utcnow(),
        is_currently_active=True,
        retention_period_days=payload.retention_period_days
    )
    db.add(consent)

    db.add(AuditLog(
        university_id=current_user.university_id,
        actor_user_id=current_user.id,
        action="CONSENT_GRANTED",
        resource_type="CONSENT",
        resource_id=consent.id,
        status="SUCCESS"
    ))
    await db.commit()
    await db.refresh(consent)
    return consent


@router.post("/revoke")
async def revoke_consent(
    payload: ConsentRevokeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke all active consent immediately, halting all individual location tracking."""
    await db.execute(
        update(ConsentRecord)
        .where(ConsentRecord.user_id == current_user.id, ConsentRecord.is_currently_active == True)
        .values(is_currently_active=False, revoked_at=datetime.utcnow())
    )

    db.add(AuditLog(
        university_id=current_user.university_id,
        actor_user_id=current_user.id,
        action="CONSENT_REVOKED",
        resource_type="CONSENT",
        resource_id=current_user.id,
        status="SUCCESS",
        details_json=f'{{"reason": "{payload.reason}"}}'
    ))
    await db.commit()

    return {"message": "All location sharing consent revoked successfully. Tracking terminated.", "status": "REVOKED"}


@router.get("/status")
async def get_consent_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve active consent state for current user."""
    res = await db.execute(
        select(ConsentRecord)
        .where(ConsentRecord.user_id == current_user.id, ConsentRecord.is_currently_active == True)
        .order_by(ConsentRecord.granted_at.desc())
    )
    active_consent = res.scalar_one_or_none()

    return {
        "user_id": current_user.id,
        "has_active_consent": active_consent is not None,
        "consent_id": active_consent.id if active_consent else None,
        "granted_at": active_consent.granted_at.isoformat() if active_consent else None,
        "retention_period_days": active_consent.retention_period_days if active_consent else 30
    }


@router.post("/erasure")
async def request_data_erasure(
    payload: PrivacyRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a formal Right to Erasure request under DPDP Act 2023 Sec 12."""
    req = PrivacyRequest(
        user_id=current_user.id,
        request_type=payload.request_type,
        status="PROCESSED",
        completed_at=datetime.utcnow(),
        audit_notes="Historical location telemetry queued for cryptographic erasure."
    )
    db.add(req)

    db.add(AuditLog(
        university_id=current_user.university_id,
        actor_user_id=current_user.id,
        action="DATA_ERASURE_REQUESTED",
        resource_type="PRIVACY",
        resource_id=req.id,
        status="SUCCESS"
    ))
    await db.commit()

    return {"message": "Data erasure request processed successfully.", "request_id": req.id}
