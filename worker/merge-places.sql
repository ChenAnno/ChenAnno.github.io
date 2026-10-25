-- One row per city: merge the rows that differed only in coordinates (keys were
-- "country|city|lat|lon" until 2026-10-25, when this was applied once; running it
-- again changes nothing). Keeps the busiest row's coordinates. Apply with
--   npx wrangler d1 execute chenyanzhe-visitors --remote --file merge-places.sql
CREATE TABLE merged AS
  SELECT cc || '|' || city AS key, city, cc,
         (SELECT lat FROM places q WHERE q.cc = p.cc AND q.city = p.city ORDER BY q.n DESC, q.last DESC LIMIT 1) AS lat,
         (SELECT lon FROM places q WHERE q.cc = p.cc AND q.city = p.city ORDER BY q.n DESC, q.last DESC LIMIT 1) AS lon,
         SUM(n) AS n, MAX(last) AS last
  FROM places p GROUP BY cc, city;
DELETE FROM places;
INSERT INTO places (key, city, cc, lat, lon, n, last) SELECT key, city, cc, lat, lon, n, last FROM merged;
DROP TABLE merged;
