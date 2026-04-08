-- =============================================================
-- SoulSynergy Coaching — Full Database Schema
-- Target: Neon (PostgreSQL 16)
-- Last updated: 2026-03-22
-- =============================================================
-- Run this entire file once in the Neon SQL editor.
-- Safe to re-run: uses IF NOT EXISTS and CREATE OR REPLACE throughout.
-- =============================================================


-- -------------------------------------------------------------
-- ENUMS
-- -------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE contact_type AS ENUM ('lead', 'consultation', 'paying_client');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE session_type AS ENUM ('free_consultation', 'paid_session');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE interaction_direction AS ENUM ('inbound', 'outbound');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE interaction_channel AS ENUM ('email', 'form', 'webhook', 'manual', 'newsletter', 'nfc');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE goal_status AS ENUM ('active', 'completed', 'dropped');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- -------------------------------------------------------------
-- UTILITY — auto-update updated_at on every table
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- -------------------------------------------------------------
-- TABLE: tenants
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tenants (
  id            SERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,           -- e.g. 'soulsynergy'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed the only tenant
INSERT INTO tenants (id, name, slug)
VALUES (1, 'SoulSynergy Coaching', 'soulsynergy')
ON CONFLICT (id) DO NOTHING;


-- -------------------------------------------------------------
-- TABLE: coaches
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coaches (
  id            SERIAL PRIMARY KEY,
  tenant_id     INT         NOT NULL DEFAULT 1 REFERENCES tenants(id),
  first_name    TEXT        NOT NULL,
  last_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  bio           TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER coaches_updated_at
  BEFORE UPDATE ON coaches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -------------------------------------------------------------
-- TABLE: coach_auth
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coach_auth (
  id              SERIAL PRIMARY KEY,
  coach_id        INT         NOT NULL UNIQUE REFERENCES coaches(id) ON DELETE CASCADE,
  password_hash   TEXT        NOT NULL,
  mfa_secret      TEXT,                                -- TOTP secret, null until MFA enrolled
  mfa_enabled     BOOLEAN     NOT NULL DEFAULT FALSE,
  last_login_at   TIMESTAMPTZ,
  failed_attempts INT         NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,                         -- brute-force lockout
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER coach_auth_updated_at
  BEFORE UPDATE ON coach_auth
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -------------------------------------------------------------
-- TABLE: coach_sessions  (JWT tracking)
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coach_sessions (
  id            SERIAL PRIMARY KEY,
  coach_id      INT         NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  token_hash    TEXT        NOT NULL UNIQUE,           -- SHA-256 of the JWT
  issued_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ,                           -- null = still valid
  user_agent    TEXT,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER coach_sessions_updated_at
  BEFORE UPDATE ON coach_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_coach_sessions_coach_id ON coach_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_sessions_expires_at ON coach_sessions(expires_at);


-- -------------------------------------------------------------
-- TABLE: contacts
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contacts (
  id                SERIAL PRIMARY KEY,
  tenant_id         INT              NOT NULL DEFAULT 1 REFERENCES tenants(id),
  first_name        TEXT             NOT NULL,
  last_name         TEXT,
  email             TEXT             NOT NULL,
  phone             TEXT,
  type              contact_type     NOT NULL DEFAULT 'lead',
  referral_source   TEXT,                              -- how they first heard about SoulSynergy
  lifetime_value    INT              NOT NULL DEFAULT 0, -- total cents paid
  last_interaction  TIMESTAMPTZ,                       -- updated on every interaction log
  mailerlite_id     TEXT,                              -- MailerLite subscriber ID for sync
  notes             TEXT,                              -- freeform coach notes
  created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, email)                            -- one contact per email per tenant
);

CREATE OR REPLACE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_contacts_email        ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_type         ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_last_interaction ON contacts(last_interaction);


-- -------------------------------------------------------------
-- TABLE: coach_clients  (join — which coach owns which contact)
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coach_clients (
  id          SERIAL PRIMARY KEY,
  tenant_id   INT         NOT NULL DEFAULT 1 REFERENCES tenants(id),
  coach_id    INT         NOT NULL REFERENCES coaches(id),
  contact_id  INT         NOT NULL REFERENCES contacts(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (coach_id, contact_id)
);

CREATE OR REPLACE TRIGGER coach_clients_updated_at
  BEFORE UPDATE ON coach_clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -------------------------------------------------------------
-- TABLE: sessions
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sessions (
  id              SERIAL PRIMARY KEY,
  tenant_id       INT             NOT NULL DEFAULT 1 REFERENCES tenants(id),
  contact_id      INT             NOT NULL REFERENCES contacts(id),
  coach_id        INT             REFERENCES coaches(id),
  type            session_type    NOT NULL DEFAULT 'paid_session',
  status          session_status  NOT NULL DEFAULT 'scheduled',
  scheduled_at    TIMESTAMPTZ     NOT NULL,
  duration_mins   INT             NOT NULL DEFAULT 60,
  calendar_event_id TEXT,                              -- Google Calendar event ID
  meeting_url     TEXT,                                -- Teams / Meet link
  recording_id    TEXT,                                -- Teams meeting unique ID
  recording_url   TEXT,                                -- Link to Teams recording
  notes           TEXT,                                -- Coach pre/post notes
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_sessions_contact_id   ON sessions(contact_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status       ON sessions(status);


-- -------------------------------------------------------------
-- TABLE: interactions
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS interactions (
  id          SERIAL PRIMARY KEY,
  tenant_id   INT                   NOT NULL DEFAULT 1 REFERENCES tenants(id),
  contact_id  INT                   NOT NULL REFERENCES contacts(id),
  session_id  INT                   REFERENCES sessions(id),  -- null for non-session interactions
  direction   interaction_direction NOT NULL,
  channel     interaction_channel   NOT NULL,
  subject     TEXT,                                    -- email subject or form name
  body        TEXT,                                    -- full content if relevant
  workflow_id TEXT,                                    -- n8n workflow name/id for tracing
  created_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER interactions_updated_at
  BEFORE UPDATE ON interactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);


-- -------------------------------------------------------------
-- TABLE: payments
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payments (
  id                    SERIAL PRIMARY KEY,
  tenant_id             INT             NOT NULL DEFAULT 1 REFERENCES tenants(id),
  contact_id            INT             NOT NULL REFERENCES contacts(id),
  session_id            INT             REFERENCES sessions(id),
  stripe_payment_intent TEXT            UNIQUE,        -- Stripe PaymentIntent ID
  amount                INT             NOT NULL,      -- cents
  currency              TEXT            NOT NULL DEFAULT 'usd',
  status                payment_status  NOT NULL DEFAULT 'pending',
  stripe_receipt_url    TEXT,
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_payments_contact_id ON payments(contact_id);
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(session_id);


-- -------------------------------------------------------------
-- TABLE: session_transcripts
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS session_transcripts (
  id              SERIAL PRIMARY KEY,
  tenant_id       INT         NOT NULL DEFAULT 1 REFERENCES tenants(id),
  session_id      INT         NOT NULL UNIQUE REFERENCES sessions(id),
  raw_transcript  TEXT,                                -- full transcript text as received
  ai_summary      TEXT,                                -- Claude-generated summary
  action_items    JSONB,                               -- Claude-generated list: [{item, owner, due_date}]
  key_themes      JSONB,                               -- Claude-generated theme tags: ["grief","boundaries"]
  processed_at    TIMESTAMPTZ,                         -- null until Claude has run
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER session_transcripts_updated_at
  BEFORE UPDATE ON session_transcripts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -------------------------------------------------------------
-- TABLE: goals
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS goals (
  id            SERIAL PRIMARY KEY,
  tenant_id     INT         NOT NULL DEFAULT 1 REFERENCES tenants(id),
  contact_id    INT         NOT NULL REFERENCES contacts(id),
  coach_id      INT         REFERENCES coaches(id),
  title         TEXT        NOT NULL,
  description   TEXT,
  status        goal_status NOT NULL DEFAULT 'active',
  progress_notes TEXT,                                 -- coach's running notes
  due_date      DATE,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_goals_contact_id ON goals(contact_id);
CREATE INDEX IF NOT EXISTS idx_goals_status     ON goals(status);


-- -------------------------------------------------------------
-- TABLE: testimonials
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS testimonials (
  id              SERIAL PRIMARY KEY,
  tenant_id       INT         NOT NULL DEFAULT 1 REFERENCES tenants(id),
  contact_id      INT         NOT NULL REFERENCES contacts(id),
  session_id      INT         REFERENCES sessions(id),
  body            TEXT        NOT NULL,
  rating          INT         CHECK (rating BETWEEN 1 AND 5),
  is_published    BOOLEAN     NOT NULL DEFAULT FALSE,  -- coach approves before showing on site
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_testimonials_contact_id   ON testimonials(contact_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_published ON testimonials(is_published);


-- =============================================================
-- END OF SCHEMA
-- =============================================================
