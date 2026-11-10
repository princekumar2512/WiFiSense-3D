-- ==============================================================================
-- WiFiSense 3D Platform - Multi-University Relational & PostGIS Database Schema
-- Standard: PostgreSQL 16+ with PostGIS 3.4+
-- Privacy: Strictly partitioned for DPDP Act 2023 & Zero Unconsented Tracking
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ------------------------------------------------------------------------------
-- 1. ORGANIZATION MANAGEMENT & MULTI-TENANCY HIERARCHY
-- ------------------------------------------------------------------------------

CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) UNIQUE NOT NULL, -- e.g. "APEX-UNIV"
    name VARCHAR(255) NOT NULL,
    country VARCHAR(64) DEFAULT 'India',
    state VARCHAR(64),
    city VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL, -- 'FACULTY_ENGINEERING', 'RESIDENTIAL_HOSTELS', 'RESEARCH_INSTITUTE'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL, -- e.g. "HOSTEL-BLOCK-ALPHA"
    name VARCHAR(255) NOT NULL,
    total_floors INT NOT NULL DEFAULT 9,
    is_pilot_building BOOLEAN DEFAULT FALSE,
    footprint_geom GEOMETRY(Polygon, 4326), -- Geographic spatial boundary
    local_origin_latitude NUMERIC(10, 8),
    local_origin_longitude NUMERIC(11, 8),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number INT NOT NULL, -- 1 through 9
    name VARCHAR(128) NOT NULL,
    elevation_meters NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    height_meters NUMERIC(6, 2) NOT NULL DEFAULT 3.40,
    is_l_shaped BOOLEAN DEFAULT TRUE,
    is_measured_pilot BOOLEAN DEFAULT FALSE, -- True for Floor 1
    slab_thickness_meters NUMERIC(4, 2) DEFAULT 0.35,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(building_id, floor_number)
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    room_number VARCHAR(32) NOT NULL, -- e.g. "101", "102"
    name VARCHAR(128) NOT NULL,
    wing VARCHAR(64) NOT NULL DEFAULT 'long-wing', -- 'long-wing', 'short-wing', 'junction'
    side VARCHAR(32) NOT NULL DEFAULT 'left', -- 'left', 'right'
    capacity INT DEFAULT 2,
    pos_x NUMERIC(8, 3) NOT NULL,
    pos_y NUMERIC(8, 3) NOT NULL,
    pos_z NUMERIC(8, 3) NOT NULL,
    width NUMERIC(6, 2) NOT NULL DEFAULT 4.00,
    height NUMERIC(6, 2) NOT NULL DEFAULT 2.90,
    depth NUMERIC(6, 2) NOT NULL DEFAULT 4.20,
    room_polygon GEOMETRY(Polygon, 0), -- Local coordinate room boundary
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(floor_id, room_number)
);

-- ------------------------------------------------------------------------------
-- 2. AUTHENTICATION, RBAC & PARTICIPANT PROFILES
-- ------------------------------------------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Managed by Keycloak / Argon2
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(32),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id VARCHAR(64) PRIMARY KEY, -- 'SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'HOSTEL_ADMIN', 'RESEARCHER', 'REGISTERED_PARTICIPANT', 'GUEST'
    description TEXT NOT NULL
);

INSERT INTO roles (id, description) VALUES
('SUPER_ADMIN', 'Cross-university platform orchestrator with full administrative privileges'),
('UNIVERSITY_ADMIN', 'Manages university campus infrastructure, buildings, and hostel administrators'),
('HOSTEL_ADMIN', 'Manages building floors, rooms, router registrations, and local configurations'),
('RESEARCHER', 'Accesses authorized research telemetry, algorithmic benchmarking, and CSI feature sets'),
('REGISTERED_PARTICIPANT', 'Explicitly consents to indoor localization and controls personal tracking sessions'),
('GUEST', 'Read-only public demonstrations and platform capability summaries');

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(64) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, role_id)
);

CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_model VARCHAR(128) NOT NULL,
    platform VARCHAR(32) NOT NULL, -- 'ANDROID', 'IOS', 'BROWSER'
    os_version VARCHAR(64),
    app_version VARCHAR(32),
    push_token TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    session_token_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT
);

-- ------------------------------------------------------------------------------
-- 3. CONSENT LIFECYCLE MANAGEMENT (DPDP ACT 2023 COMPLIANCE)
-- ------------------------------------------------------------------------------

CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notice_version VARCHAR(32) NOT NULL DEFAULT '2026-v1',
    purpose TEXT NOT NULL,
    legal_basis VARCHAR(128) DEFAULT 'India DPDP Act 2023 Section 6',
    granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    is_currently_active BOOLEAN DEFAULT TRUE,
    retention_period_days INT DEFAULT 30,
    ip_at_consent INET,
    CONSTRAINT chk_consent_validity CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);

CREATE TABLE privacy_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(64) NOT NULL, -- 'ACCESS_DATA', 'ERASURE', 'PAUSE_TRACKING', 'CORRECTION'
    status VARCHAR(32) DEFAULT 'PENDING', -- 'PENDING', 'PROCESSED', 'REJECTED'
    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    audit_notes TEXT
);

-- ------------------------------------------------------------------------------
-- 4. NETWORK INFRASTRUCTURE & HARDWARE ABSTRACTION
-- ------------------------------------------------------------------------------

CREATE TABLE network_cabinets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL, -- e.g. "Main First-Floor Distribution Cabinet"
    pos_x NUMERIC(8, 3) NOT NULL,
    pos_y NUMERIC(8, 3) NOT NULL,
    pos_z NUMERIC(8, 3) NOT NULL,
    fiber_backhaul_capacity_gbps NUMERIC(6, 2) DEFAULT 10.0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE network_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    node_name VARCHAR(128) NOT NULL, -- e.g. "Deco-F1-01 (L-Junction)"
    hardware_type VARCHAR(64) NOT NULL, -- 'TPLINK_DECO', 'ESP32_CSI', 'BLE_BEACON'
    model VARCHAR(128) NOT NULL DEFAULT 'TP-Link Deco X50',
    mac_address MACADDR,
    ip_address INET,
    band_ghz NUMERIC(3, 1) DEFAULT 2.4, -- 2.4, 5.0, 6.0
    channel INT DEFAULT 6,
    tx_power_dbm NUMERIC(4, 1) DEFAULT 20.0,
    coverage_radius_meters NUMERIC(5, 2) DEFAULT 14.0,
    pos_x NUMERIC(8, 3) NOT NULL,
    pos_y NUMERIC(8, 3) NOT NULL,
    pos_z NUMERIC(8, 3) NOT NULL,
    node_point GEOMETRY(PointZ, 0), -- 3D point in local hostel coordinate system
    status VARCHAR(32) DEFAULT 'ONLINE', -- 'ONLINE', 'DEGRADED', 'OFFLINE'
    is_simulated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. DUAL SENSING PIPELINES: CONSENTED VS ANONYMOUS
-- ------------------------------------------------------------------------------

-- PIPELINE A: CONSENTED PARTICIPANT LOCALIZATION (Strictly consented, purpose-limited)
CREATE TABLE localization_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_id UUID NOT NULL REFERENCES consent_records(id) ON DELETE CASCADE,
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    pos_x NUMERIC(8, 3) NOT NULL,
    pos_y NUMERIC(8, 3) NOT NULL,
    pos_z NUMERIC(8, 3) NOT NULL,
    estimated_point GEOMETRY(PointZ, 0),
    confidence_score NUMERIC(5, 4) NOT NULL, -- 0.0000 to 1.0000
    uncertainty_radius_meters NUMERIC(5, 2) NOT NULL, -- e.g. 1.4m
    activity_category VARCHAR(64) DEFAULT 'UNKNOWN', -- 'STATIONARY', 'WALKING', 'SITTING', 'STANDING'
    data_sources TEXT[] DEFAULT ARRAY['WIFI_RSSI', 'BAROMETER'],
    model_version VARCHAR(32) DEFAULT 'EKF-RF-v1.2',
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- PIPELINE B: DEVICE-FREE ANONYMOUS OCCUPANCY SENSING (Zero PII, aggregated)
CREATE TABLE occupancy_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    zone_label VARCHAR(128) NOT NULL, -- e.g. "L-Junction Corridor", "North Wing Bay 1"
    estimated_occupant_count INT NOT NULL DEFAULT 0,
    motion_detected BOOLEAN DEFAULT FALSE,
    rf_perturbation_intensity NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
    confidence_score NUMERIC(5, 4) NOT NULL,
    uncertainty_meters NUMERIC(5, 2) NOT NULL,
    detection_method VARCHAR(64) DEFAULT 'RF_PERTURBATION',
    is_simulated BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. AUDIT LOGGING & SYSTEM EVENTS
-- ------------------------------------------------------------------------------

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL, -- e.g. 'LOCALIZATION_QUERY', 'CONSENT_REVOCATION', 'EXPORT_DATA'
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128),
    ip_address INET,
    status VARCHAR(32) DEFAULT 'SUCCESS',
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. PERFORMANCE & SPATIAL INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX idx_rooms_floor ON rooms(floor_id);
CREATE INDEX idx_network_nodes_floor ON network_nodes(floor_id);
CREATE INDEX idx_network_nodes_spatial ON network_nodes USING GIST(node_point);
CREATE INDEX idx_loc_estimates_user_time ON localization_estimates(user_id, timestamp DESC);
CREATE INDEX idx_loc_estimates_spatial ON localization_estimates USING GIST(estimated_point);
CREATE INDEX idx_occupancy_floor_time ON occupancy_records(floor_id, timestamp DESC);
CREATE INDEX idx_audit_time ON audit_logs(timestamp DESC);
