# WiFiSense 3D: Comprehensive Development Roadmap

## Roadmap Overview

WiFiSense 3D follows an incremental, test-driven, phase-by-phase roadmap ensuring every milestone produces functioning, robust software.

---

### Phase 0: System Architecture & Specifications (COMPLETE)
- [x] Workspace inspection and environment verification.
- [x] System Architecture & decoupled Microservices design.
- [x] Database entity-relationship & PostGIS schema definitions.
- [x] Hardware Abstraction Layer (HAL) specifications for TP-Link Deco and ESP-CSI.
- [x] Privacy architecture compliant with DPDP Act 2023.
- [x] Detailed folder structure and dependency specifications.

---

### Phase 1: Frontend Foundation & Scientific Design System (CURRENT)
- [x] Project scaffolding with Vite, React 18, TypeScript, Tailwind CSS.
- [ ] Theme configuration: Dark navy (`#030712`, `#0a192f`), electric cyan (`#00f5ff`), sapphire accents.
- [ ] Header navigation with WiFiSense 3D logo, breadcrumbs, tenant switcher, role selector.
- [ ] High-impact scientific Landing Page featuring:
  - Futuristic hero section with 3D preview teaser.
  - Core capabilities (Device-free RF Sensing, Consented Localization, 3D Digital Twin).
  - Architecture breakdown and technology validation.
  - Interactive privacy & consent explanation (DPDP Act 2023 aligned).
  - Quick launch to live demo & role-based access.
- [ ] Responsive navigation shell and tab routing (Dashboard, Digital Twin, Live Monitoring, Occupancy Analytics, Participants, Networks, Research Lab, Settings).
- [ ] Interactive state stores via Zustand (Auth, Building, Sensing, Simulation).

---

### Phase 2: Interactive 3D Digital Twin (9-Floor Hostel & L-Shape) (CURRENT)
- [ ] React Three Fiber / Drei / Three.js canvas setup with orbit controls and high-tech lighting.
- [ ] 9-Floor Building Model:
  - Realistic floor slabs, transparent outer envelope, cutaway mode.
  - Floor isolation switcher (Floor 1 through Floor 9 or All Floors view).
- [ ] Accurate L-Shaped First Floor:
  - Long corridor leg + short corridor leg with central L-junction turning point.
  - Dual-sided rooms along both corridor segments (18+ rooms per floor).
  - Staircase and elevator shafts placed precisely at the L-junction turning point.
  - Network cabinet located on the 1st floor.
  - TP-Link Deco Node 1 positioned at the L-junction.
  - TP-Link Deco Node 2 positioned at the far end of the corridor.
- [ ] Dynamic 3D Elements:
  - Animated RF signal wave propagation pulses from active Wi-Fi nodes.
  - Signal attenuation contours (Log-distance path loss heatmaps).
  - Human occupancy spheres / holographic markers with confidence rings.
  - Room highlighting on hover/selection with occupancy breakdown cards.
- [ ] Building Layout Editor:
  - Interactive parameter controls for floor heights, room counts, corridor lengths, wall transparency.
  - Dynamic addition/removal of rooms and network node placement.

---

### Phase 3: Backend & Multi-Tenant Database
- [ ] FastAPI application structure with async routes, dependency injection, and Pydantic v2.
- [ ] PostgreSQL + PostGIS schema with Alembic migrations.
- [ ] Dual data pipeline endpoints (Consented vs Anonymous).
- [ ] Redis Pub/Sub integration for real-time telemetry streaming.
- [ ] OpenAPI (Swagger) documentation and health probes.

---

### Phase 4: Authentication, Security & DPDP Consent Subsystem
- [ ] Keycloak / OIDC JWT verification and 6-tier RBAC guards.
- [ ] Participant consent grant, pause, and revocation workflows.
- [ ] Automated cryptographic data-retention purging.
- [ ] Comprehensive audit logs for every localization query.

---

### Phase 5: Simulation Engine (Mode A)
- [ ] High-fidelity radio propagation simulator (Log-distance + Wall Penetration Factor).
- [ ] Dynamic multi-agent pedestrian simulator moving through corridors and rooms.
- [ ] Node failure, signal degradation, and occupancy spike simulations.
- [ ] Clear labeling of all synthetic telemetry to maintain academic integrity.

---

### Phase 6: AI Engine & Localization Algorithms
- [ ] Data preprocessing: Noise filtering (moving average, Hampel filter), missing value imputation.
- [ ] Wi-Fi fingerprinting algorithms (WKNN, Random Forest, SVM).
- [ ] Sensor fusion: Pedestrian Dead Reckoning (PDR) + Wi-Fi RSSI via Extended Kalman Filter (EKF).
- [ ] Uncertainty quantification and confidence score calculation.

---

### Phase 7: Hardware Adapters & ESP32 CSI Research
- [ ] TP-Link Deco network scanner / telemetry client adapter.
- [ ] ESP32 CSI packet parser and subcarrier amplitude analyzer.
- [ ] Fallback interfaces for environments without specialized hardware.

---

### Phase 8: Mobile Companion Roadmap (React Native)
- [ ] Cross-platform client architecture.
- [ ] Transparent permission gates and foreground-only location telemetry.

---

### Phase 9: Testing, Optimization & Deployment
- [ ] Docker Compose orchestration (Frontend, Backend, Postgres, Redis, Keycloak).
- [ ] Performance profiling: 60 FPS 3D rendering and sub-100ms telemetry latency.

