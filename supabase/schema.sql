-- ============================================================================
-- UNICORE: SHARED LAB INFRASTRUCTURE - ENTERPRISE POSTGRESQL SCHEMA
-- Compatible with Supabase (PostgreSQL 15+)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. INSTITUTIONS
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES
CREATE TYPE user_role AS ENUM ('researcher', 'lab_manager', 'dean_admin');

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'researcher',
    org_title TEXT,
    trust_score INT DEFAULT 100 CHECK (trust_score BETWEEN 0 AND 100),
    weekly_peak_quota_hours INT DEFAULT 20,
    current_week_used_hours INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EQUIPMENT & ASSET INVENTORY
CREATE TYPE equipment_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'QUARANTINED');

CREATE TABLE equipment (
    id TEXT PRIMARY KEY, -- e.g. 'zeiss-crossbeam-550'
    institution_id UUID REFERENCES institutions(id),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    unit_id TEXT UNIQUE NOT NULL, -- e.g. 'ZEISS-550-BOM'
    category TEXT NOT NULL, -- 'SEM', 'XRD', 'NMR', 'TEM', 'Raman'
    facility_name TEXT NOT NULL,
    distance_km NUMERIC(5,1) DEFAULT 0.0,
    specs JSONB NOT NULL DEFAULT '[]'::jsonb,
    resolution_nm NUMERIC(6,2),
    max_voltage_kv NUMERIC(6,2),
    rate_per_hour NUMERIC(10,2) NOT NULL,
    credits_per_hour INT NOT NULL,
    peak_buffer_mins INT DEFAULT 30,
    prerequisites TEXT[] NOT NULL DEFAULT '{}',
    supervision_unless TEXT,
    training_level INT DEFAULT 2,
    health_index NUMERIC(5,2) DEFAULT 98.0,
    status equipment_status DEFAULT 'AVAILABLE',
    status_until TIMESTAMPTZ,
    qr_secret TEXT NOT NULL,
    filament_hours NUMERIC(10,2) DEFAULT 0.0,
    filament_limit NUMERIC(10,2) DEFAULT 3000.0,
    clean_streak INT DEFAULT 0,
    custodian_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREDENTIALS & PASSPORT
CREATE TYPE cert_verification_status AS ENUM ('PENDING_OCR', 'VERIFIED', 'REJECTED', 'EXPIRED');

CREATE TABLE user_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL, -- e.g. 'sem-l2', 'lab-safety'
    title TEXT NOT NULL,
    authority TEXT NOT NULL,
    issued_date DATE NOT NULL,
    expires_date DATE,
    sha_hash TEXT NOT NULL,
    status cert_verification_status DEFAULT 'VERIFIED',
    ai_confidence NUMERIC(5,2) DEFAULT 98.4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BOOKINGS & CONCURRENCY
CREATE TYPE booking_status_type AS ENUM ('active', 'approved', 'pending', 'waitlisted', 'completed', 'disputed', 'cancelled');

CREATE TABLE bookings (
    id TEXT PRIMARY KEY, -- e.g. 'BK-9058'
    equipment_id TEXT REFERENCES equipment(id),
    user_id UUID REFERENCES profiles(id),
    date_label TEXT NOT NULL,
    slot_label TEXT NOT NULL,
    slot_start TIMESTAMPTZ NOT NULL,
    slot_end TIMESTAMPTZ NOT NULL,
    status booking_status_type NOT NULL DEFAULT 'pending',
    credits INT NOT NULL,
    purpose_statement TEXT,
    specimen_declaration JSONB,
    fairness_score INT,
    waitlist_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INSPECTIONS & CONDITION CAPTURE
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id TEXT REFERENCES bookings(id),
    stage TEXT CHECK (stage IN ('CHECK_IN', 'RETURN')) NOT NULL,
    captured_by UUID REFERENCES profiles(id),
    photo_urls JSONB NOT NULL, -- {"stage": "...", "objective": "...", "gauge": "..."}
    meter_reading NUMERIC(10,2) NOT NULL,
    ai_anomaly_flag BOOLEAN DEFAULT FALSE,
    ai_anomaly_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LEDGER (Immutable Append-Only)
CREATE TABLE audit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id TEXT REFERENCES bookings(id),
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    lines TEXT[] NOT NULL,
    tone TEXT NOT NULL DEFAULT 'neutral',
    prev_hash TEXT NOT NULL,
    block_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SEED DATA (Direct Match with UniCore Frontend)
-- ============================================================================

INSERT INTO institutions (id, name, short_name, domain, city) VALUES
('11111111-1111-1111-1111-111111111111', 'Indian Institute of Technology Bombay', 'IIT Bombay', 'iitb.ac.in', 'Mumbai'),
('22222222-2222-2222-2222-222222222222', 'Indian Institute of Science Bangalore', 'IISc Bangalore', 'iisc.ac.in', 'Bangalore'),
('33333333-3333-3333-3333-333333333333', 'Tata Institute of Fundamental Research', 'TIFR Mumbai', 'tifr.res.in', 'Mumbai');

INSERT INTO profiles (id, institution_id, full_name, email, role, org_title, trust_score, current_week_used_hours) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Dr. Aris Thorne', 'aris@nanoforge.io', 'researcher', 'External Startup Founder · Nanoforge Materials', 98, 4),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Prof. Chen', 'chen@crn.iitb.ac.in', 'lab_manager', 'Facility Manager · Central Nanofabrication Core', 100, 0),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Dean R. Kulkarni', 'dean@iitb.ac.in', 'dean_admin', 'Dean of R&D · Cross-campus Compliance Office', 100, 0);

INSERT INTO equipment (id, institution_id, name, short_name, unit_id, category, facility_name, distance_km, specs, resolution_nm, max_voltage_kv, rate_per_hour, credits_per_hour, peak_buffer_mins, prerequisites, training_level, status, qr_secret, filament_hours, filament_limit, clean_streak, custodian_name) VALUES
('zeiss-crossbeam-550', '11111111-1111-1111-1111-111111111111', 'Zeiss Crossbeam 550 Focused Ion Beam SEM', 'Zeiss Crossbeam 550 FIB-SEM', 'ZEISS-550-BOM', 'SEM', 'NanoFab Cleanroom Facility', 4.2, '["0.8 nm res", "30 kV max", "SE/BSE detectors", "Max sample: 50 mm"]', 0.8, 30, 120, 15, 30, ARRAY['sem-l2', 'lab-safety', 'nano-waiver'], 2, 'AVAILABLE', 'secret_zeiss_550_bom', 1420.5, 3000, 42, 'Dr. K. Raman'),
('bruker-d8-xrd', '22222222-2222-2222-2222-222222222222', 'Bruker D8 Advance Powder XRD', 'Bruker D8 Advance XRD', 'BRUKER-D8-BLR', 'XRD', 'Materials Research Centre', 12.8, '["Cu-Ka source", "LynxEye XE-T detector", "High-temp stage"]', NULL, 40, 60, 8, 15, ARRAY['radiation', 'affiliated'], 2, 'OCCUPIED', 'secret_bruker_d8_blr', 2210.0, 4000, 18, 'Dr. S. Nair'),
('bruker-avance-500', '33333333-3333-3333-3333-333333333333', 'Bruker Avance III 500 MHz NMR', 'Bruker Avance 500 NMR', 'BRUKER-AV500-TIFR', 'NMR', 'National NMR Facility', 9.6, '["500 MHz", "BBO cryoprobe", "VT: -150 to 150 °C", "24-slot autosampler"]', NULL, NULL, 90, 11, 20, ARRAY['nmr-safety', 'lab-safety'], 2, 'AVAILABLE', 'secret_bruker_nmr_tifr', 812.4, 5000, 64, 'Dr. M. Pillai'),
('jeol-2100f', '11111111-1111-1111-1111-111111111111', 'JEOL JEM-2100F Field Emission TEM', 'JEOL JEM-2100F TEM', 'JEOL-2100F-BOM', 'TEM', 'SAIF Electron Microscopy Suite', 4.6, '["0.19 nm point res", "200 kV", "STEM + EDS", "Gatan OneView camera"]', 0.19, 200, 150, 19, 45, ARRAY['lab-safety', 'affiliated'], 1, 'AVAILABLE', 'secret_jeol_2100f_bom', 3310.2, 6000, 27, 'Dr. A. Deshpande'),
('horiba-labram', '22222222-2222-2222-2222-222222222222', 'Horiba LabRAM HR Evolution Raman', 'Horiba LabRAM HR Raman', 'HORIBA-HR-BLR', 'Raman', 'Centre for Nano Science & Engineering', 14.1, '["532 / 633 / 785 nm lasers", "800 mm focal length", "Confocal mapping"]', NULL, NULL, 45, 6, 10, ARRAY['lab-safety'], 1, 'MAINTENANCE', 'secret_horiba_blr', 4120.0, 5000, 9, 'Dr. V. Rao');

INSERT INTO bookings (id, equipment_id, user_id, date_label, slot_label, slot_start, slot_end, status, credits, purpose_statement) VALUES
('BK-9058', 'zeiss-crossbeam-550', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Today', '14:00 – 17:00', NOW(), NOW() + interval '3 hours', 'active', 45, 'Surface defect analysis on MoS2 monolayer films.'),
('BK-9067', 'jeol-2100f', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sun, Nov 01', '13:00 – 16:00', NOW() + interval '2 days', NOW() + interval '2 days 3 hours', 'approved', 57, 'Atomic resolution STEM imaging of grain boundaries.'),
('BK-9042', 'zeiss-crossbeam-550', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tomorrow', '10:00 – 13:00', NOW() + interval '1 day', NOW() + interval '1 day 3 hours', 'pending', 45, 'Cross-sectional FIB milling on silicon nitride.'),
('BK-9050', 'bruker-d8-xrd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tue, Nov 03', '09:00 – 12:00', NOW() + interval '3 days', NOW() + interval '3 days 3 hours', 'waitlisted', 24, 'Powder phase analysis for high-entropy alloys.'),
('BK-9021', 'zeiss-crossbeam-550', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Thu, Oct 29', '14:00 – 17:00', NOW() - interval '2 days', NOW() - interval '2 days - 3 hours', 'completed', 45, 'Nanopatterning characterization.');
