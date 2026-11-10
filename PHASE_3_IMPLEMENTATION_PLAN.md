# WiFiSense 3D: Phase 3 Implementation Plan
## Backend, Database and API Integration

**Date:** November 2026  
**Status:** In Progress (Stage 1 Complete -> Stage 2 In Progress)  
**Document Purpose:** Comprehensive roadmap for transforming the existing frontend and simulation prototype into a fully integrated, persistent, multi-university research platform.

---

## 1. Existing Implementation Analysis

### 1.1 Frontend Architecture
- **Framework & Tooling:** React 18, TypeScript, Vite, Tailwind CSS, Three.js, React Three Fiber (R3F), Drei, Framer Motion, Zustand, Recharts, Lucide Icons.
- **3D Digital Twin (Centerpiece):**
  - High-performance WebGL 3D building modeling a 9-floor hostel facility.
  - Accurate L-shaped first floor: 28m long corridor, 20m short corridor, L-junction turning point, elevator and staircase cores at the junction, large network cabinet, and Deco mesh nodes (Node 1 at junction, Node 2 at far end).
  - Configurable Floors 2 to 9 as research prototypes.
  - Translucent walls, cutaway views, animated expanding RF signal waves, path loss heatmaps, and 3D occupant avatars.
- **State Management:**
  - `buildingStore.ts`: Building CAD geometry, floor slicing, layer toggles, room selection.
  - `authStore.ts`: 6-tier RBAC (`SUPER_ADMIN`, `UNIVERSITY_ADMIN`, `HOSTEL_ADMIN`, `RESEARCHER`, `REGISTERED_PARTICIPANT`, `GUEST`), consent flags.
  - `sensingStore.ts`: Spatial telemetry, participant positions, anonymous RF perturbation indices.
  - `simulationStore.ts`: Mode A simulation engine (play/pause, occupant surge, node failure injection).
- **Client Services:** `frontend/src/services/api.ts` initialized for authentication, building configuration persistence, and analytics.

### 1.2 Backend Architecture
- **Framework:** Python 3.13 / FastAPI with async endpoints.
- **Database Layer:** SQLAlchemy 2.0 AsyncEngine supporting both PostgreSQL + PostGIS (`postgresql+asyncpg://`) and local async SQLite (`sqlite+aiosqlite://./wifisense.db`) for self-contained testing.
- **Automated Seeding:** `backend/app/core/init_db.py` automatically initializes tables and seeds:
  - 6 system roles
  - University: "Apex Institute of Technology & Science"
  - 9-floor "Hostel Block Alpha"
  - Measured L-shaped Floor 1 geometry (20 rooms, 2 Deco anchor nodes, lift, stairs, cabinet)
  - Configurable Floors 2–9
  - Initial test accounts with bcrypt password hashes.
- **WebSocket Streaming:** `backend/app/websocket/manager.py` connection manager and background telemetry broadcaster.
- **Automated Tests:** `backend/tests/test_backend_full.py` with 6 passing tests covering health, database persistence, login, RBAC, DPDP consent enforcement, and anonymous zero-PII validation.

---

## 2. Missing Implementation & Gaps

1. **Alembic Database Migrations:** Alembic needs to be configured with an initial migration script (`0001_initial_schema.py`) to formally verify database schema versioning.
2. **Dedicated Endpoints for Universities, Floors, and Rooms:** Complete CRUD endpoints for managing universities, individual floors, and individual rooms for tenant administrators.
3. **Frontend Integration Wiring:**
   - On initial load, the frontend should fetch the persisted building structure from `GET /api/v1/buildings/hostel-block-alpha` so that modifications made in the Building Editor persist on page refresh.
   - Connect frontend `DashboardPage.tsx` and `LiveMonitoringPage.tsx` to the live WebSocket stream (`ws://localhost:8000/ws/telemetry`) with automatic reconnection and stale-data indicators.
   - Wire login and role switching to authentic backend token generation.
4. **Enhanced Tenant Isolation & Permission Tests:** Additional automated tests validating strict cross-university query denial.

---

## 3. Backend Architecture Specification

```
backend/
├── app/
│   ├── main.py                     # FastAPI application root, lifespan, CORS, routers
│   ├── core/
│   │   ├── config.py               # Pydantic BaseSettings, secrets, DPDP rules
│   │   ├── database.py             # SQLAlchemy 2.0 AsyncEngine & session dependency
│   │   ├── init_db.py              # Automated database schema & pilot hostel seeder
│   │   ├── security.py             # Bcrypt password hashing & pseudonymization
│   │   └── audit.py                # Audit log helper
│   ├── auth/
│   │   ├── jwt_handler.py          # Cryptographic token encode/decode
│   │   └── dependencies.py         # get_current_user, require_role, tenant isolation
│   ├── models/                     # SQLAlchemy 2.0 ORM entities
│   │   ├── organization.py         # University, Organization, Building, Floor, Room
│   │   ├── user.py                 # User, Role, UserRole, Device, UserSession
│   │   ├── consent.py              # ConsentRecord, PrivacyRequest
│   │   ├── network.py              # NetworkNode, NetworkCabinet, Sensor
│   │   ├── localization.py         # LocalizationEstimate (Consented Stream)
│   │   ├── occupancy.py            # OccupancyRecord (Anonymous Stream)
│   │   └── audit.py                # AuditLog, SystemEvent
│   ├── schemas/                    # Pydantic v2 validation models
│   ├── api/v1/                     # Modular REST Routers
│   │   ├── auth.py                 # /api/v1/auth
│   │   ├── universities.py         # /api/v1/universities
│   │   ├── buildings.py            # /api/v1/buildings
│   │   ├── floors.py               # /api/v1/floors
│   │   ├── rooms.py                # /api/v1/rooms
│   │   ├── networks.py             # /api/v1/networks
│   │   ├── consent.py              # /api/v1/consent
│   │   ├── localization.py         # /api/v1/localization
│   │   ├── occupancy.py            # /api/v1/occupancy
│   │   ├── analytics.py            # /api/v1/analytics
│   │   └── audit.py                # /api/v1/audit
│   └── websocket/
│       └── manager.py              # ConnectionManager & broadcast hub
├── alembic/                        # Migration scripts
└── tests/                          # Automated Pytest suite
```

---

## 4. Database Architecture & Multi-Tenancy

### 4.1 Schema Topology
- **Tenant Isolation:** Hierarchical scoping: `universities` -> `organizations` -> `buildings` -> `floors` -> `rooms`.
- **Dual Pipeline Separation:**
  - `localization_estimates`: Strictly requires foreign key reference to an active `consent_records` row. Contains pseudonymized identifiers.
  - `occupancy_records`: Contains spatial RF perturbation indices, estimated headcount, and confidence score. Has zero references to users, devices, or MAC addresses.
- **Indexes:** Spatial indexes on coordinate fields, foreign key B-tree indexes, and reverse timestamp indexes for telemetry time-series queries.

---

## 5. Authentication & RBAC Plan

1. **Identity Provider:** Keycloak-compatible asymmetric token verification (RS256 / HS256).
2. **Roles:**
   - `SUPER_ADMIN`: Cross-university administration.
   - `UNIVERSITY_ADMIN`: Manages campus buildings and staff.
   - `HOSTEL_ADMIN`: Manages building geometry, rooms, and Deco nodes.
   - `RESEARCHER`: Accesses anonymized measurements and model training.
   - `REGISTERED_PARTICIPANT`: Manages own consent and personal location history.
   - `GUEST`: Read-only access to public previews.
3. **Server-Side Enforcement:** Every endpoint inspects JWT claims through `require_role(...)` and verifies that users cannot read or write data outside their authorized `university_id`.

---

## 6. Real-Time WebSocket Telemetry Plan

1. Client opens connection to `ws://localhost:8000/ws/telemetry`.
2. Server broadcasts periodic packet every 2.0s with:
   - RF noise floor (dBm)
   - Node 1 & Node 2 signal strength
   - Active occupant headcount
   - System health status
3. Frontend listens and dynamically updates `sensingStore`, with a stale-data indicator if no ping arrives within 5 seconds.

---

## 7. Implementation Sequence

| Step | Action | Verification |
|:---|:---|:---:|
| **Step 1** | Configure Alembic migration environment and generate baseline migration | `alembic check` & migration files validated |
| **Step 2** | Implement University, Floor, and Room CRUD endpoints | REST API tests pass |
| **Step 3** | Connect Frontend Building Store to load persisted building from Backend API | Edits survive page refresh |
| **Step 4** | Wire Frontend WebSocket client for live telemetry streaming with stale indicator | Live ping received on Dashboard |
| **Step 5** | Execute comprehensive automated test suite | 100% Pytest pass rate |
| **Step 6** | Update documentation and deliver Phase 3 Completion Report | All docs updated |
