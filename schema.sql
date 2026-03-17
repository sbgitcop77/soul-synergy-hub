-- Run this against your Neon database to set up the bookings table

CREATE TABLE IF NOT EXISTS bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service           VARCHAR(255)  NOT NULL,
  date              DATE          NOT NULL,
  time              VARCHAR(10)   NOT NULL,
  client_name       VARCHAR(255)  NOT NULL,
  client_email      VARCHAR(255)  NOT NULL,
  amount_paid       INTEGER       NOT NULL, -- stored in cents
  stripe_payment_id VARCHAR(255)  UNIQUE NOT NULL,
  calendar_event_id VARCHAR(255),
  created_at        TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_date         ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_email        ON bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_id    ON bookings(stripe_payment_id);
