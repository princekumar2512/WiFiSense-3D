from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth.jwt_handler import decode_access_token, TokenData
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        # Default to guest user for public read endpoints
        guest_res = await db.execute(select(User).where(User.id == "usr-guest-01"))
        guest = guest_res.scalar_one_or_none()
        if guest:
            return guest
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token_data: Optional[TokenData] = decode_access_token(token)
    if not token_data or not token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired, or tampered access token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    res = await db.execute(select(User).where(User.id == token_data.user_id))
    user = res.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or not found"
        )
    return user


def require_role(allowed_roles: List[str]):
    """Enforces server-side Role-Based Access Control (RBAC)."""
    async def role_checker(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        # Super admin has unrestricted bypass across all universities
        res = await db.execute(select(UserRole.role_id).where(UserRole.user_id == current_user.id))
        user_roles = res.scalars().all()

        if "SUPER_ADMIN" in user_roles:
            return current_user

        has_permission = any(role in allowed_roles for role in user_roles)
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires one of roles {allowed_roles}. Your roles: {user_roles}"
            )
        return current_user
    return role_checker


def check_tenant_isolation(user: User, university_id: Optional[str]):
    """Strictly prevents cross-university data leakage."""
    if not university_id:
        return
    # Super admins can access any university
    if user.university_id and user.university_id != university_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant Isolation Violation: Access to other universities is prohibited."
        )

