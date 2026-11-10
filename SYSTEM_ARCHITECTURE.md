# WiFiSense 3D: System Architecture & Technical Specification

## 1. System Overview & Architecture Diagram

WiFiSense 3D is designed with a strictly decoupled, microservices-ready architecture:

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT TIERS                                         |
|  +-------------------------------------+       +-------------------------------------+  |
|  |     React 18+ / Vite / Three.js     |       |       React Native Mobile App       |  |
|  |   (Web Dashboard & 3D Digital Twin) |       |     (Android & iOS Sensor Client)   |  |
|  +------------------+------------------+       +------------------+------------------+  |
+---------------------|---------------------------------------------|---------------------+
                      | HTTPS / WSS                                 | HTTPS / WSS
                      v                                             v
+-----------------------------------------------------------------------------------------+
|                               API GATEWAY & LOAD BALANCER                               |
|                     (NGINX / Reverse Proxy with TLS 1.3 & Rate Limiting)                |
+---------------------+---------------------------------------------+---------------------+
                      |                                             |
                      v                                             v
+------------------------------------+       +--------------------------------------------+
|         KEYCLOAK / OIDC IdP        |       |            FASTAPI BACKEND SERVICE         |
|  - Multi-tenant Realm Management   |       |  - REST Endpoints (OpenAPI 3.1)            |
|  - 6-Tier RBAC & Token Issuance    | <---> |  - WebSocket Telemetry Hub                 |
|  - DPDP Consent Lifecycle Hooks    |       |  - Hardware Abstraction Layer              |
+------------------------------------+       |  - Building & Floor Plan Configuration     |
                                             +----------------------+---------------------+
                                                                    |
                      +---------------------------------------------+---------------------+
                      |                                             |                     |
                      v                                             v                     v
+------------------------------------+       +-----------------------------+       +--------------+
|       AI & LOCALIZATION SERVICE    |       |      DATABASE SUBSYSTEM     |       | REDIS BROKER |
|  - Signal Preprocessing & Filter   |       |  PostgreSQL 16+ with PostGIS|       | & PUBSUB     |
|  - Wi-Fi Fingerprinting & RSSI Map | <---> |  - Tenant Schemas           | <---> | - Live WSS   |
|  - Spatial Zone & Room Classifiers |       |  - Dual Data Pipelines:     |       | - Telemetry  |
|  - Kalman Filter & Particle Fusion |       |     1) Consented Participant|       |   Buffer     |
|  - Uncertainty & Confidence Engine |       |     2) Anonymous Occupancy  |       | - Caching    |
+------------------------------------+       +-----------------------------+       +--------------+
                      ^
                      |
+---------------------+-------------------------------------------------------------------+
|                            HARDWARE ABSTRACTION LAYER (HAL)                             |
|  +--------------------+  +-------------------+  +-------------------+  +-------------+  |
|  | RouterAdapter      |  | CSIAdapter        |  | MobileSensor      |  | Simulation  |  |
|  | (TP-Link Deco)     |  | (ESP32-CSI / IOT) |  | (IMU/Barometer)   |  | Engine      |  |
|  +--------------------+  +-------------------+  +-------------------+  +-------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Hardware-Independent Abstraction Layer (HAL)

Due to diverse networking infrastructure (e.g. TP-Link Deco mesh where low-level proprietary firmware telemetry or CSI might not be natively exposed without experimental hardware), the architecture enforces clean abstraction contracts:

```typescript
// Core Hardware Abstraction Interfaces
interface TelemetryPacket {
  sourceId: string;
  sourceType: 'ROUTER_TELEMETRY' | 'ESP32_CSI' | 'MOBILE_IMU' | 'BLE_BEACON' | 'SIMULATOR';
  timestamp: number;
  qualityMetric: number; // 0.0 - 1.0 signal reliability
  rawPayload: Record<string, unknown>;
}

interface RSSIMeasurement {
  nodeId: string;
  bssid: string;
  rssi: number; // dBm (-100 to 0)
  channel: number;
  snr?: number;
  timestamp: number;
}

interface CSIMeasurement {
  subcarriers: number; // e.g. 64 or 128
  amplitudes: number[];
  phases: number[];
  channel: number;
  rssi: number;
  antennaId: number;
  timestamp: number;
}
```

### Adapters
1. **`RouterAdapter` (TP-Link Deco)**: Polls or receives authorized TR-064 / cloud controller telemetry for connected client tables, RSSI, and topology.
2. **`CSIAdapter` (ESP32-CSI)**: Interfaces with experimental ESP32 nodes running `esp-csi` firmware over serial or UDP sockets for raw subcarrier perturbation capture.
3. **`MobileSensorAdapter`**: Ingests consented device telemetry (Barometer for floor level, IMU step counts, Wi-Fi RTT/RSSI when permitted).
4. **`SimulationAdapter`**: Deterministic physical simulation engine computing radio path loss (Log-Distance Path Loss Model + wall attenuation factors) and moving human body RF shadows.

---

## 3. Dual Data Pipeline & Privacy-First Architecture

To strictly adhere to **India's Digital Personal Data Protection Act, 2023 (DPDP)** and global privacy standards:

```
               [ INCOMING RAW MEASUREMENTS ]
                             |
         +-------------------+-------------------+
         |                                       |
  [ Consented Session? ]               [ Device-Free / Ambient? ]
         | YES                                   |
         v                                       v
+-------------------------------+       +-------------------------------+
|  CONSENTED PARTICIPANT STREAM |       |   ANONYMOUS OCCUPANCY STREAM  |
| - Verifiable Consent Token    |       | - ZERO PII or MAC Storage     |
| - Purpose Limitation Flag     |       | - Differential Privacy Noise  |
| - Auto-Expiring Session (TTL) |       | - Aggregate Room/Floor Count  |
| - Explicit Pause / Revoke     |       | - RF Perturbation Indices     |
| - Personal Location Audit Log |       | - Unlinkable Event Telemetry  |
+-------------------------------+       +-------------------------------+
```

**Absolute Guarantees:**
1. No cross-joining between anonymous RF disturbance records and registered user profiles.
2. Participant localization requires active, unrevoked consent with explicit session initiation.
3. Data retention schedules enforce automated cryptographic shredding of expired historical traces.

---

## 4. Multi-Tenant University & Organization Hierarchy

PostgreSQL multi-tenancy is structured around hierarchical RBAC:

- **Super Administrator**: Platform-wide orchestrator, cross-university health, global policy.
- **University Administrator**: Manages institutions, campuses, buildings, and hostel admins.
- **Hostel Administrator**: Manages building geometry, floors, rooms, router deployments, and local nodes.
- **Researcher**: Authorized access to anonymized research corpora, model benchmarking, CSI feature sets.
- **Registered Participant**: Grants/revokes consent, reviews personal location logs, pauses tracking.
- **Guest**: Public read-only building overviews and platform capability demos.

---

## 5. Technology Stack Summary

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Three.js, React Three Fiber (R3F), Drei, Framer Motion, Zustand, Lucide Icons, Recharts.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (async), Alembic, WebSockets.
- **AI / Scientific Stack**: NumPy, SciPy, scikit-learn, PyTorch, Pandas, filterpy (Kalman / Particle filters).
- **Database & Messaging**: PostgreSQL 16 with PostGIS extension, Redis 7 (Pub/Sub & session cache).
- **Identity & Security**: Keycloak 24+ / OAuth2 + OpenID Connect, JWT (RS256), TLS 1.3.
- **Containerization**: Docker, Docker Compose multi-stage builds.
