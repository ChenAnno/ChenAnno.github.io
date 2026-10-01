-- Tables for the visitor counter (src/index.js). Apply with
--   npx wrangler d1 execute chenyanzhe-visitors --remote --file schema.sql

-- one row per place: city-level coordinates from Cloudflare, visits, last visit (ms)
CREATE TABLE IF NOT EXISTS places (
  key  TEXT PRIMARY KEY,          -- "country|city|lat|lon"
  city TEXT NOT NULL,
  cc   TEXT NOT NULL,             -- ISO country code, XX if unknown
  lat  REAL,
  lon  REAL,
  n    INTEGER NOT NULL DEFAULT 0,
  last INTEGER NOT NULL
);

-- running totals: pageviews (every page load)
CREATE TABLE IF NOT EXISTS totals (
  name TEXT PRIMARY KEY,
  n    INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO totals (name, n) VALUES ('pageviews', 0);
