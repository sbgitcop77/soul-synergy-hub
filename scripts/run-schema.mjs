/**
 * run-schema.mjs
 * Connects to Neon via pg and executes the full soulsynergy_schema.sql.
 * Safe to re-run — schema uses IF NOT EXISTS throughout.
 *
 * Usage: node scripts/run-schema.mjs
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load connection string from .env.local ──────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) throw new Error('.env.local not found');

  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    process.env[key.trim()] = rest.join('=').trim();
  }
}

loadEnv();

const rawUrl = process.env.NEON_DATABASE_URL
  || process.env.DATABASE_URL
  || process.env.VITE_DATABASE_URL;

if (!rawUrl) {
  console.error('ERROR: No database URL found in .env.local (tried NEON_DATABASE_URL, DATABASE_URL, VITE_DATABASE_URL)');
  process.exit(1);
}

// Strip channel_binding=require — breaks pg driver
const connectionString = rawUrl.replace(/[?&]channel_binding=require/, '');

// ── Connect ─────────────────────────────────────────────────────────────────
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log('Connected to Neon.\n');

// ── Check for existing bookings table ───────────────────────────────────────
const { rows: existing } = await client.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`);
const existingNames = existing.map(r => r.table_name);

console.log('Existing tables before run:');
existingNames.forEach(t => console.log('  -', t));
console.log();

if (existingNames.includes('bookings')) {
  console.warn('⚠️  WARNING: bookings table already exists. Schema run will not touch it (IF NOT EXISTS).');
  console.warn('   Existing booking data is safe.\n');
}

// ── Run schema ───────────────────────────────────────────────────────────────
const schemaPath = path.resolve(__dirname, '../soulsynergy_schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('Running soulsynergy_schema.sql...');
await client.query(schema);
console.log('Schema executed successfully.\n');

// ── Verify tables ────────────────────────────────────────────────────────────
const { rows: after } = await client.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`);

const { rows: enums } = await client.query(`
  SELECT typname FROM pg_type WHERE typcategory = 'E' ORDER BY typname
`);

const { rows: tenants } = await client.query(`SELECT * FROM tenants`);

console.log(`Tables in database (${after.length} total):`);
after.forEach(r => console.log('  ✓', r.table_name));

console.log(`\nEnums (${enums.length} total):`);
enums.forEach(r => console.log('  ✓', r.typname));

console.log('\nTenants seed data:');
tenants.forEach(r => console.log(`  ✓ id=${r.id} | slug=${r.slug} | name=${r.name}`));

await client.end();
console.log('\nDone.');
