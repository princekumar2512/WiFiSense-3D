# WiFiSense 3D: Database Schema & Entity-Relationship Specification

## 1. Relational & Spatial Architecture (PostgreSQL 16 + PostGIS)

WiFiSense 3D uses a normalized relational schema with spatial geospatial extensions (`postgis`) for real-world coordinate mapping and indoor zone bounding polygons.

```
+------------------------------------------------------------------------------------------------+
|                                      SCHEMA TOPOLOGY                                           |
|                                                                                                |
|   [ universities ]                                                                             |
|          | 1:N                                                                                 |
|   [ organizations ]                                                                            |
|          | 1:N                                                                                 |
|     [ buildings ]                                                                              |
|          | 1:N                                                                                 |
|      [ floors ] ---------------------------------------------------+                           |
|          | 1:N                                                     | 1:N                       |
|       [ rooms ]                                            [ network_nodes ]                   |
|                                                                                                |
|   [ users ] <====== 1:N ======> [ user_roles ] <====== 1:N ======> [ roles ]                  |
|       |                                                                                        |
|       +--- 1:N ---> [ devices ]                                                                |
|       +--- 1:N ---> [ user_sessions ]                                                          |
|       +--- 1:N ---> [ consent_records ] <----+                                                 |
|                                              | (Foreign Key Enforcement)                       |
|   [ localization_estimates ] ----------------+ (Consented Participant Localization Stream)     |
|                                                                                                |
|   [ occupancy_records ] (Device-Free Anonymous Ambient RF Perturbations - Zero PII)            |
|                                                                                                |
|   [ audit_logs ] & [ system_events ] (Immutable Security Audit Trail)                          |
+------------------------------------------------------------------------------------------------+
```

---

## 2. Table Specifications

### 2.1 Multi-Tenancy & Building Hierarchy
- **`universities`**: Highest-level tenant boundary. Enforces institutional isolation.
- **`organizations`**: Academic faculties, departments, or residential hostel housing directorates.
- **`buildings`**: Specific physical facilities (e.g. `Hostel Block Alpha`). Includes latitude/longitude geographic anchor.
- **`floors`**: 9 stacked elevations. Floor 1 is flagged as `is_measured_pilot = TRUE` with L-shaped corridor geometry. Floors 2–9 are marked as configurable prototypes.
- **`rooms`**: 20 rooms per floor (12 on the 28m long corridor wing, 8 on the 20m short corridor wing), including 3D coordinates `[pos_x, pos_y, pos_z]` and room bounding dimensions `[width, height, depth]`.

### 2.2 Network Infrastructure
- **`network_nodes`**: TP-Link Deco mesh routers and experimental sniffing probes.
  - Pilot Floor 1:
    - **Node 1**: `Deco-F1-01` placed at L-junction turning point (`[X: 1.5m, Z: 1.5m]`).
    - **Node 2**: `Deco-F1-02` placed at far end of corridor (`[X: 26.0m, Z: 0.0m]`).
  - Stores operating band (2.4 GHz vs 5.0 GHz), channel, Tx power (dBm), coverage radius, and real-time status (`ONLINE`, `DEGRADED`, `OFFLINE`).
- **`network_cabinets`**: Core distribution rack (Floor 1 cabinet at `[X: 1.2m, Z: -3.2m]`).

### 2.3 Privacy & DPDP Act 2023 Enforcement
- **`consent_records`**: Records explicit consent timestamp, purpose limitation string, notice version (`2026-v1`), retention period (30 days), and current active boolean flag.
- **`privacy_requests`**: Logs Section 11 access and Section 12 data erasure requests.

### 2.4 Dual Sensing Separation
- **`localization_estimates`**: Consented participant indoor position. Requires valid `consent_id`. Contains estimated floor, room, coordinates, confidence score, and uncertainty bounds (`±1.4m`).
- **`occupancy_records`**: Device-free ambient RF perturbation estimates. Stores **strictly zero personal identifiers, device MACs, or user tokens**.

