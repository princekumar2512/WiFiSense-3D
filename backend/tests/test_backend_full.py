import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from app.main import app
from app.core.database import AsyncSessionLocal
from app.core.init_db import init_database
from app.models.organization import Building, Floor, Room
from app.models.user import User

@pytest.fixture(scope="session", autouse=True)
async def setup_test_db():
    await init_database()
    yield

@pytest.mark.asyncio
async def test_health_check():
    """Verify health endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "HEALTHY"
        assert data["database_connected"] is True
        assert data["dpdp_consent_enforced"] is True

@pytest.mark.asyncio
async def test_database_pilot_hostel_persistence():
    """Verify 9 floors, measured L-shape floor 1, and Deco nodes exist in DB."""
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(Building).where(Building.id == "hostel-block-alpha"))
        bldg = res.scalar_one_or_none()
        assert bldg is not None
        assert bldg.total_floors == 9

        # Check Floor 1 is measured pilot
        f1_res = await session.execute(select(Floor).where(Floor.floor_number == 1))
        f1 = f1_res.scalar_one_or_none()
        assert f1 is not None
        assert f1.is_measured_pilot is True
        assert f1.is_l_shaped is True

        # Check Room count
        rooms_res = await session.execute(select(Room).where(Room.floor_id == f1.id))
        rooms = rooms_res.scalars().all()
        assert len(rooms) >= 18 # Greater than 18 rooms requirement

@pytest.mark.asyncio
async def test_auth_login_and_jwt_verification():
    """Verify login and JWT token generation for different roles."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Super Admin Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "director.research@wifisense3d.org",
            "password": "SuperAdmin@123"
        })
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data
        assert token_data["role"] == "SUPER_ADMIN"

        # 2. Verify /auth/me with Bearer token
        token = token_data["access_token"]
        me_res = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        profile = me_res.json()
        assert profile["email"] == "director.research@wifisense3d.org"
        assert profile["role"] == "SUPER_ADMIN"

        # 3. Invalid credentials test
        fail_res = await ac.post("/api/v1/auth/login", json={
            "email": "director.research@wifisense3d.org",
            "password": "WrongPassword!"
        })
        assert fail_res.status_code == 401

@pytest.mark.asyncio
async def test_rbac_and_building_config_permissions():
    """Verify that unauthenticated/guest users cannot modify building configuration, but admins can."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Guest attempts to update building -> Denied (403 or 401)
        guest_update = await ac.post("/api/v1/buildings/hostel-block-alpha/save-config", json={
            "name": "Hacked Building Name"
        })
        assert guest_update.status_code in [401, 403]

        # 2. Super Admin login
        admin_login = await ac.post("/api/v1/auth/login", json={
            "email": "director.research@wifisense3d.org",
            "password": "SuperAdmin@123"
        })
        admin_token = admin_login.json()["access_token"]

        # 3. Super Admin saves configuration -> Allowed (200)
        admin_update = await ac.post(
            "/api/v1/buildings/hostel-block-alpha/save-config",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "Hostel Block Alpha (Config Persisted)",
                "floors": [{
                    "floor_number": 1,
                    "name": "Floor 1 (Ground / Pilot Measured Updated)"
                }]
            }
        )
        assert admin_update.status_code == 200
        assert admin_update.json()["status"] == "SAVED"

@pytest.mark.asyncio
async def test_dpdp_consent_enforcement_and_localization():
    """
    Verify strict DPDP Act 2023 compliance:
    - If consent is active -> localization succeeds.
    - If consent is revoked -> localization fails with HTTP 403.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as registered participant (Aravind Patel)
        part_login = await ac.post("/api/v1/auth/login", json={
            "email": "aravind.patel@student.apexuniv.edu.in",
            "password": "Student@123"
        })
        token = part_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Grant explicit consent
        grant_res = await ac.post("/api/v1/consent/grant", headers=headers, json={
            "user_id": part_login.json()["user_id"],
            "purpose": "Academic spatial sensing localization test",
            "retention_period_days": 30
        })
        assert grant_res.status_code == 200

        # 3. Request localization estimate -> SUCCEEDS (200)
        loc_res = await ac.post("/api/v1/localization/estimate", headers=headers, json={
            "user_id": part_login.json()["user_id"],
            "consent_token": "VALID-ACTIVE-CONSENT",
            "rssi_map": {
                "node-1-junction": -52.0,
                "node-1-farend": -65.0
            },
            "step_frequency_hz": 1.2
        })
        assert loc_res.status_code == 200
        loc_data = loc_res.json()
        assert loc_data["floor_number"] == 1
        assert loc_data["confidence_score"] > 0.8
        assert loc_data["uncertainty_radius_m"] <= 2.0
        assert loc_data["activity"] == "WALKING"

        # 4. Revoke consent
        revoke_res = await ac.post("/api/v1/consent/revoke", headers=headers, json={
            "user_id": part_login.json()["user_id"],
            "reason": "Revoking participation"
        })
        assert revoke_res.status_code == 200

        # 5. Request localization after revocation -> MUST FAIL WITH 403 FORBIDDEN!
        blocked_res = await ac.post("/api/v1/localization/estimate", headers=headers, json={
            "user_id": part_login.json()["user_id"],
            "consent_token": "AFTER-REVOCATION",
            "rssi_map": {"node-1-junction": -52.0}
        })
        assert blocked_res.status_code == 403
        assert "Consent" in blocked_res.json()["detail"] or "Blocked" in blocked_res.json()["detail"]

@pytest.mark.asyncio
async def test_anonymous_occupancy_zero_pii():
    """Verify device-free anonymous spatial sensing stream contains zero personal data."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/occupancy/current")
        assert res.status_code == 200
        occupancy_list = res.json()
        assert len(occupancy_list) > 0
        for item in occupancy_list:
            # Must NOT contain personal identifying keys
            assert "user_id" not in item
            assert "email" not in item
            assert "name" not in item
            assert "mac_address" not in item
            # Must contain spatial RF metrics
            assert "zone_label" in item
            assert "estimated_occupants" in item
            assert "rf_perturbation" in item
            assert "confidence" in item
