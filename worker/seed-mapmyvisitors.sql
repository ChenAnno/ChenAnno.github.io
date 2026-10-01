-- Visits recorded by the mapmyvisitors widget from 2026-06-09 (when it was added)
-- to 2026-10-01, imported once so the new map keeps them. Source: the public stats
-- page https://mapmyvisitors.com/web/1c59s (16 places). Adjustments: the two
-- Singapore places are one place counted by unique visitors (19), since most of
-- their 544 visits were test runs while the site was redesigned; "Unknown Location"
-- (placed in the southern ocean by mapmyvisitors) has no coordinates, so it counts
-- but is not on the map. Dated a month back, so they show as earlier visits.
-- Page views start from the visits (a lower bound: each visit viewed a page).
-- Apply once: npx wrangler d1 execute chenyanzhe-visitors --remote --file seed-mapmyvisitors.sql
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('XX||null|null', '', 'XX', NULL, NULL, 39, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 39;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('SG|Singapore|1.29|103.85', 'Singapore', 'SG', 1.29, 103.85, 19, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 19;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('US|Four Oaks|35.4|-78.42', 'Four Oaks', 'US', 35.4, -78.42, 5, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 5;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('GB|Oxford|51.74|-1.21', 'Oxford', 'GB', 51.74, -1.21, 3, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 3;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('US|Council Bluffs|41.26|-95.86', 'Council Bluffs', 'US', 41.26, -95.86, 3, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 3;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('AU||-33.49|143.21', '', 'AU', -33.49, 143.21, 2, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 2;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('GB||51.5|-0.12', '', 'GB', 51.5, -0.12, 2, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 2;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('AU|Perth|-31.97|115.86', 'Perth', 'AU', -31.97, 115.86, 2, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 2;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('US|New York|40.73|-74.0', 'New York', 'US', 40.73, -74.0, 1, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 1;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('GB|London|51.51|-0.06', 'London', 'GB', 51.51, -0.06, 1, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 1;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('PT|Lisbon|38.72|-9.13', 'Lisbon', 'PT', 38.72, -9.13, 1, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 1;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('HK||22.25|114.17', '', 'HK', 22.25, 114.17, 1, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 1;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('US|Los Angeles|34.06|-118.28', 'Los Angeles', 'US', 34.06, -118.28, 1, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 1;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('KR||37.51|126.97', '', 'KR', 37.51, 126.97, 1, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 1;
INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES ('KR|Daejeon|36.32|127.42', 'Daejeon', 'KR', 36.32, 127.42, 1, 1788251279098) ON CONFLICT (key) DO UPDATE SET n = n + 1;
UPDATE totals SET n = n + 82 WHERE name = 'pageviews';
