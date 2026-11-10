from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.dependencies import get_current_user
from app.models.user import User, UserRole, Role
from app.models.audit import AuditLog
from app.schemas.auth import LoginRequest, TokenResponse, UserProfileSchema

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user with email/password and issue cryptographically signed JWT."""
    res = await db.execute(select(User).where(User.email == payload.email))
    user = res.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Fetch user roles
    role_res = await db.execute(select(UserRole.role_id).where(UserRole.user_id == user.id))
    roles = role_res.scalars().all()
    primary_role = roles[0] if roles else "GUEST"

    # Issue JWT token
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": primary_role,
        "org_id": user.assigned_building_id,
        "permissions": roles
    }
    access_token = create_access_token(token_data, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    # Audit log entry
    db.add(AuditLog(
        university_id=user.university_id,
        actor_user_id=user.id,
        action="USER_LOGIN_SUCCESS",
        resource_type="AUTH",
        resource_id=user.id,
        status="SUCCESS",
        details_json=f'{{"role": "{primary_role}"}}'
    ))
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id,
        email=user.email,
        role=primary_role,
        organization_id=user.assigned_building_id,
        permissions=roles
    )


@router.get("/me", response_model=UserProfileSchema)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve verified profile of authenticated user."""
    role_res = await db.execute(select(UserRole.role_id).where(UserRole.user_id == current_user.id))
    roles = role_res.scalars().all()
    primary_role = roles[0] if roles else "GUEST"

    return UserProfileSchema(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=primary_role,
        university_id=current_user.university_id,
        assigned_building_id=current_user.assigned_building_id,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        allowed_permissions=roles
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Logs out user and writes audit record."""
    db.add(AuditLog(
        university_id=current_user.university_id,
        actor_user_id=current_user.id,
        action="USER_LOGOUT",
        resource_type="AUTH",
        resource_id=current_user.id,
        status="SUCCESS"
    ))
    await db.commit()
    return {"message": "Logged out successfully", "status": "TERMINATED"}

