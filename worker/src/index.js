/* Visitor counter for chenyanzhe.page, a Cloudflare Worker on the route
   chenyanzhe.page/api/* (everything else goes on to GitHub Pages).

   POST /api/visit      records a page view; with {"first": true} (the page sends
                        it once per browser per day) also a visit from the
                        visitor's place. Cloudflare puts the city and its
                        coordinates on every request (request.cf); for visitors
                        from mainland China the address is looked up in a bundled
                        Chinese IP table instead (cn-geo.js), which places their
                        mobile networks far better. No IP address is stored.
   GET  /api/visitors   the places and totals, for the map on the page; cached
                        for a minute.

   Visits are recorded on the site's own domain, so they count from mainland
   China and are not stopped by tracker blockers, unlike a third-party widget.
   Storage: the D1 database in wrangler.toml, tables in schema.sql. */

import { makeLocator } from './cn-geo.js';
import cnRanges from './cn-ip.bin';
import cnPlaces from './cn-places.json';

const SITE = 'https://chenyanzhe.page';
const locateCN = makeLocator(cnRanges, cnPlaces);
const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python/i;

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/visit' && request.method === 'POST') return visit(request, env);
    if (pathname === '/api/visitors' && request.method === 'GET') return visitors(env, ctx);
    return new Response('Not found', { status: 404 });
  },
};

// coordinates to two decimals (about a kilometre): the city, not the visitor
function round(value) {
  const x = parseFloat(value);
  return Number.isFinite(x) ? Math.round(x * 100) / 100 : null;
}

async function visit(request, env) {
  // only the site's own pages, and not crawlers
  if (request.headers.get('Origin') !== SITE || BOTS.test(request.headers.get('User-Agent') || '')) {
    return new Response(null, { status: 204 });
  }
  let first = false;
  try {
    first = (await request.json()).first === true;
  } catch (e) {}

  const writes = [env.DB.prepare("UPDATE totals SET n = n + 1 WHERE name = 'pageviews'")];
  if (first) {
    const cf = request.cf || {};
    // Cloudflare put a visitor in Beijing in Shanghai and one in Mianyang in Jiaxing;
    // the Chinese table had both right. Without an answer there, Cloudflare's place.
    const cn = cf.country === 'CN' ? locateCN(request.headers.get('CF-Connecting-IP') || '') : null;
    const lat = cn ? cn.lat : round(cf.latitude), lon = cn ? cn.lon : round(cf.longitude);
    const cc = cf.country || 'XX', city = cn ? cn.city : cf.city || '';
    writes.push(env.DB.prepare(
      'INSERT INTO places (key, city, cc, lat, lon, n, last) VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6) ' +
      'ON CONFLICT (key) DO UPDATE SET n = n + 1, last = ?6'
    ).bind(`${cc}|${city}|${lat}|${lon}`, city, cc, lat, lon, Date.now()));
  }
  await env.DB.batch(writes);
  return new Response(null, { status: 204 });
}

async function visitors(env, ctx) {
  const key = new Request(SITE + '/api/visitors');
  const cached = await caches.default.match(key);
  if (cached) return cached;

  const [places, totals] = await env.DB.batch([
    env.DB.prepare('SELECT city, cc, lat, lon, n, last FROM places ORDER BY n DESC'),
    env.DB.prepare('SELECT name, n FROM totals'),
  ]);
  const now = Date.now();
  const total = (name) => (totals.results.find((t) => t.name === name) || { n: 0 }).n;
  const body = {
    pageviews: total('pageviews'),
    visits: places.results.reduce((sum, p) => sum + p.n, 0),
    // places without coordinates count in visits but are not on the map
    places: places.results.filter((p) => p.lat !== null && p.lon !== null).map((p) => ({
      city: p.city, cc: p.cc, lat: p.lat, lon: p.lon, n: p.n,
      days: Math.floor((now - p.last) / 864e5),   // since the last visit
    })),
  };
  const response = new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=60' },
  });
  ctx.waitUntil(caches.default.put(key, response.clone()));
  return response;
}
