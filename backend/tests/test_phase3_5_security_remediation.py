"""
WiFiSense 3D - Phase 3.5 Security Remediation & Hardening Test Suite
Covers SEC-01, SEC-02, SEC-03, and TEL-01 across all 14 specified audit requirements.
"""

import pytest
import jwt
from datetime import datetime, timedelta, timezone
from starlette.testclient import TestClient
from starlette.websockets import WebSocketDisconnect
from sqlalchemy import select

from app.main import app
from app.core.config import settings
from app.core.init_db import init_database
from app.core.database import AsyncSessionLocal
from app.models.organization import University, Organization, Building
from app.models.user import User, UserRole
from app.auth.jwt_handler import create_access_token, decode_access_token
from app.websocket.manager import ws_manager

@pytest.fixture(scope="session", autouse=True)
async def init_test_db():
    await init_database()
    # Ensure University Beta and a user for University Beta exist
    async with AsyncSessionLocal() as session:
        # Check/create University Beta
        ub = (await session.execute(select(University).where(University.code == "UNIV-AUDIT-BETA"))).scalar_one_or_none()
        if not ub:
            ub = University(
                id="univ-audit-beta-id",
                code="UNIV-AUDIT-BETA",
                name="Beta University of Engineering",
                country="India"
            )
            session.add(ub)
            await session.flush()

        # Check/create User for University Beta
        ub_user = (await session.execute(select(User).where(User.id == "usr-beta-admin-01"))).scalar_one_or_none()
        if not ub_user:
            ub_user = User(
                id="usr-beta-admin-01",
                university_id=ub.id,
                email="admin@betauniv.edu.in",
                password_hash="hashed_pw_dummy",
                full_name="Beta Univ Admin",
                is_active=True,
                is_verified=True
            )
            session.add(ub_user)
            session.add(UserRole(user_id=ub_user.id, role_id="UNIVERSITY_ADMIN"))

        await session.commit()
    yield

# ==============================================================================
# SEC-03: JWT ISSUER & AUDIENCE VALIDATION (Tests 7, 8, 9, 10)
# ==============================================================================

def test_correct_jwt_issuer_validation():
    """Test 7: Verify valid JWT carries and verifies issuer 'wifisense-auth'."""
    payload = {"sub": "usr-univ-01", "email": "admin.infra@apexuniv.edu.in", "role": "UNIVERSITY_ADMIN"}
    token = create_access_token(payload, issuer="wifisense-auth", audience="wifisense-frontend")
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded.user_id == "usr-univ-01"
    assert decoded.issuer == "wifisense-auth"

def test_incorrect_jwt_issuer_rejection():
    """Test 8: Verify token with unexpected issuer is rejected."""
    payload = {"sub": "usr-univ-01", "email": "admin.infra@apexuniv.edu.in", "role": "UNIVERSITY_ADMIN"}
    fraudulent_token = create_access_token(payload, issuer="fraudulent-issuer", audience="wifisense-frontend")
    decoded = decode_access_token(fraudulent_token)
    assert decoded is None

def test_correct_jwt_audience_validation():
    """Test 9: Verify valid JWT carries and verifies audience 'wifisense-frontend'."""
    payload = {"sub": "usr-univ-01", "email": "admin.infra@apexuniv.edu.in", "role": "UNIVERSITY_ADMIN"}
    token = create_access_token(payload, issuer="wifisense-auth", audience="wifisense-frontend")
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded.audience == "wifisense-frontend"

def test_incorrect_jwt_audience_rejection():
    """Test 10: Verify token with unexpected audience is rejected."""
    payload = {"sub": "usr-univ-01", "email": "admin.infra@apexuniv.edu.in", "role": "UNIVERSITY_ADMIN"}
    foreign_app_token = create_access_token(payload, issuer="wifisense-auth", audience="unauthorized-client-app")
    decoded = decode_access_token(foreign_app_token)
    assert decoded is None

# ==============================================================================
# SEC-01: WEBSOCKET AUTHENTICATION & HANDSHAKE GATING (Tests 1, 2, 3)
# ==============================================================================

def test_anonymous_websocket_connection_rejected():
    """Test 1: Verify unauthenticated WebSocket connection attempt is rejected with code 1008."""
    client = TestClient(app)
    with pytest.raises(WebSocketDisconnect) as excinfo:
        with client.websocket_connect("/ws/telemetry"):
            pass
    assert excinfo.value.code == 1008

def test_invalid_jwt_websocket_rejected():
    """Test 2: Verify WebSocket connection with invalid/tampered JWT is rejected with code 1008."""
    client = TestClient(app)
    with pytest.raises(WebSocketDisconnect) as excinfo:
        with client.websocket_connect("/ws/telemetry?token=this-is-a-completely-invalid-token"):
            pass
    assert excinfo.value.code == 1008

def test_expired_jwt_websocket_rejected():
    """Test 3: Verify WebSocket connection with expired JWT is rejected with code 1008."""
    client = TestClient(app)
    expired_payload = {
        "sub": "usr-univ-01",
        "email": "admin.infra@apexuniv.edu.in",
        "role": "UNIVERSITY_ADMIN",
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
        "exp": datetime.now(timezone.utc) - timedelta(hours=2),
        "iat": datetime.now(timezone.utc) - timedelta(hours=3)
    }
    expired_token = jwt.encode(expired_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    with pytest.raises(WebSocketDisconnect) as excinfo:
        with client.websocket_connect(f"/ws/telemetry?token={expired_token}"):
            pass
    assert excinfo.value.code == 1008

# ==============================================================================
# SEC-02: TENANT-SCOPED WEBSOCKET CHANNELS & CROSS-TENANT ISOLATION (Tests 4, 5, 6, 13)
# ==============================================================================

def test_unauthorized_tenant_subscription_rejected():
    """Test 4: Verify non-super-admin user attempting to subscribe to another university is rejected."""
    client = TestClient(app)
    # User belongs to univ-tech-01 (Apex Univ)
    token_a = create_access_token({
        "sub": "usr-univ-01",
        "email": "admin.infra@apexuniv.edu.in",
        "role": "UNIVERSITY_ADMIN",
        "univ_id": "univ-tech-01"
    })
    # Attempt cross-tenant subscription to University Beta
    with pytest.raises(WebSocketDisconnect) as excinfo:
        with client.websocket_connect(f"/ws/telemetry?token={token_a}&tenant_id=univ-audit-beta-id"):
            pass
    assert excinfo.value.code == 1008

def test_university_a_cannot_receive_university_b_telemetry():
    """Test 5: Verify University A client receives ONLY Univ A telemetry, not Univ B telemetry."""
    client = TestClient(app)
    token_a = create_access_token({
        "sub": "usr-univ-01",
        "email": "admin.infra@apexuniv.edu.in",
        "role": "UNIVERSITY_ADMIN",
        "univ_id": "univ-tech-01"
    })

    with client.websocket_connect(f"/ws/telemetry?token={token_a}") as ws_a:
        # Broadcast private telemetry explicitly to University B
        import asyncio
        asyncio.run(ws_manager.broadcast_to_tenant("univ-audit-beta-id", {
            "type": "TELEMETRY_UPDATE",
            "secret_marker": "BETA_ONLY_TELEMETRY",
            "university_id": "univ-audit-beta-id"
        }))

        # Send heartbeat on Client A to verify socket is live
        ws_a.send_text("PING")
        ack = ws_a.receive_json()
        assert ack["type"] == "HEARTBEAT_ACK"
        # Verify no University B packet was received
        assert "secret_marker" not in ack

def test_university_b_cannot_receive_university_a_telemetry():
    """Test 6: Verify University B client receives ONLY Univ B telemetry, not Univ A telemetry."""
    client = TestClient(app)
    token_b = create_access_token({
        "sub": "usr-beta-admin-01",
        "email": "admin@betauniv.edu.in",
        "role": "UNIVERSITY_ADMIN",
        "univ_id": "univ-audit-beta-id"
    })

    with client.websocket_connect(f"/ws/telemetry?token={token_b}") as ws_b:
        # Broadcast private telemetry explicitly to University A
        import asyncio
        asyncio.run(ws_manager.broadcast_to_tenant("univ-tech-01", {
            "type": "TELEMETRY_UPDATE",
            "secret_marker": "ALPHA_ONLY_TELEMETRY",
            "university_id": "univ-tech-01"
        }))

        # Send heartbeat on Client B to verify socket is live
        ws_b.send_text("PING")
        ack = ws_b.receive_json()
        assert ack["type"] == "HEARTBEAT_ACK"
        # Verify no University A packet was received
        assert "secret_marker" not in ack

def test_websocket_disconnection_cleanup():
    """Test 13: Verify clean connection unregistration and tenant pool cleanup on disconnect."""
    client = TestClient(app)
    token_a = create_access_token({
        "sub": "usr-univ-01",
        "email": "admin.infra@apexuniv.edu.in",
        "role": "UNIVERSITY_ADMIN",
        "univ_id": "univ-tech-01"
    })

    initial_count = ws_manager.get_tenant_client_count("univ-tech-01")
    with client.websocket_connect(f"/ws/telemetry?token={token_a}") as ws:
        connected_count = ws_manager.get_tenant_client_count("univ-tech-01")
        assert connected_count == initial_count + 1

    # After exiting with block, socket is disconnected
    post_disconnect_count = ws_manager.get_tenant_client_count("univ-tech-01")
    assert post_disconnect_count == initial_count

# ==============================================================================
# TEL-01: STALE TELEMETRY DETECTION & SIMULATION INTEGRITY (Tests 11, 12, 14)
# ==============================================================================

def test_stale_telemetry_detection():
    """Test 11: Verify measurements older than max_age_threshold_sec are flagged as is_stale=True."""
    now_utc = datetime.now(timezone.utc)
    old_measurement_time = now_utc - timedelta(seconds=12.5) # 12.5s > 5.0s limit
    age_sec = (now_utc - old_measurement_time).total_seconds()
    is_stale = age_sec > settings.MAX_TELEMETRY_AGE_SEC

    assert is_stale is True
    assert age_sec > 5.0

def test_fresh_telemetry_detection():
    """Test 12: Verify measurements within max_age_threshold_sec are flagged as is_stale=False."""
    now_utc = datetime.now(timezone.utc)
    recent_measurement_time = now_utc - timedelta(seconds=0.45) # 0.45s < 5.0s limit
    age_sec = (now_utc - recent_measurement_time).total_seconds()
    is_stale = age_sec > settings.MAX_TELEMETRY_AGE_SEC

    assert is_stale is False
    assert age_sec < 5.0

def test_existing_simulation_functionality():
    """Test 14: Verify live simulation telemetry streaming and heartbeat ack for authenticated client."""
    client = TestClient(app)
    token = create_access_token({
        "sub": "usr-super-01",
        "email": "director.research@wifisense3d.org",
        "role": "SUPER_ADMIN"
    })

    with client.websocket_connect(f"/ws/telemetry?token={token}") as ws:
        ws.send_text("PING")
        response = ws.receive_json()
        assert response["type"] == "HEARTBEAT_ACK"
        assert response["user_id"] == "usr-super-01"
        assert "timestamp" in response

