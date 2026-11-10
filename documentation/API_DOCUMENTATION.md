# WiFiSense 3D: API Documentation (OpenAPI v1 Specification)

**Base URL:** `http://localhost:8000/api/v1`  
**Interactive Swagger Docs:** `http://localhost:8000/docs`  
**ReDoc Reference:** `http://localhost:8000/redoc`  
**WebSocket Telemetry Stream:** `ws://localhost:8000/ws/telemetry`

---

## 1. Authentication & RBAC (`/auth`)

### `POST /auth/login`
Authenticate a user via email and password, issuing an asymmetric or signed JWT.
- **Request Body:**
  ```json
  {
    "email": "director.research@wifisense3d.org",
    "password": "SuperAdmin@123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user_id": "usr-super-01",
    "email": "director.research@wifisense3d.org",
    "role": "SUPER_ADMIN",
    "permissions": ["*"]
  }
  ```

### `GET /auth/me`
Retrieve the authenticated profile and server-verified permissions.
- **Header:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "id": "usr-super-01",
    "email": "director.research@wifisense3d.org",
    "full_name": "Dr. Vikram Malhotra",
    "role": "SUPER_ADMIN",
    "allowed_permissions": ["*"]
  }
  ```

---

## 2. Building Architecture & Persistence (`/buildings`)

### `GET /buildings/{building_id}`
Returns the entire 9-floor hostel structure, rooms, dimensions, and network node placements.
- **Response `200 OK`:**
  ```json
  {
    "id": "hostel-block-alpha",
    "name": "Hostel Block Alpha (Pilot Facility)",
    "total_floors": 9,
    "is_pilot_building": true,
    "floors": [...]
  }
  ```

### `POST /buildings/{building_id}/save-config`
Persists modifications made in the Building Editor directly to the relational database.
- **Authorization:** Requires `SUPER_ADMIN` or `HOSTEL_ADMIN`.
- **Request Body:** JSON dictionary containing modified floor labels, room dimensions, and Deco node coordinates.

---

## 3. Consent Management (DPDP Act 2023) (`/consent`)

### `POST /consent/grant`
Grants explicit consent for participant localization.
- **Request Body:**
  ```json
  {
    "user_id": "usr-part-01",
    "purpose": "Academic spatial sensing localization test",
    "notice_version": "2026-v1",
    "retention_period_days": 30
  }
  ```

### `POST /consent/revoke`
Revokes active consent immediately. Blocks all subsequent individual tracking queries with HTTP 403.

---

## 4. Localization & Tracking (`/localization`)

### `POST /localization/estimate`
Calculates indoor participant coordinates from Wi-Fi signal measurements.
- **Pre-condition:** Validates active consent. If consent is revoked or missing, returns **`HTTP 403 Forbidden`**.
- **Response `200 OK`:**
  ```json
  {
    "id": "loc-uuid-1234",
    "pseudonym": "Participant #A829BC",
    "floor_number": 1,
    "room_number": "104",
    "position": {"x": 17.1, "y": 1.7, "z": 4.8},
    "confidence_score": 0.914,
    "uncertainty_radius_m": 1.4,
    "activity": "WALKING",
    "model_version": "EKF-RF-v1.2",
    "timestamp": "2026-11-10T22:30:00Z"
  }
  ```

---

## 5. Device-Free Anonymous Occupancy (`/occupancy`)

### `GET /occupancy/current`
Returns aggregate estimated occupancy derived purely from ambient RF disturbance. **Contains zero personal identifying tokens or device MAC addresses.**

---

## 6. Real-Time Telemetry WebSocket (`/ws/telemetry`)

Connect via `ws://localhost:8000/ws/telemetry` for live streaming:
```json
{
  "type": "TELEMETRY_UPDATE",
  "timestamp": "2026-11-10T22:35:00Z",
  "mode": "SIMULATION",
  "system_health": "OPTIMAL",
  "active_nodes_count": 28,
  "rf_noise_floor_dbm": -92.4,
  "node_signals": {
    "Deco-F1-01": -52.1,
    "Deco-F1-02": -58.4
  },
  "live_occupants_count": 42,
  "confidence_pct": 88.2
}
```
