/* Where in mainland China a visitor is, from ip2region (a Chinese IP database,
   Apache-2.0) instead of Cloudflare, which often puts Chinese mobile networks in the
   wrong city. The table (cn-ip.bin, cn-places.json) is built by geo/build-cn.py, with
   city names and coordinates from GeoNames (CC BY 4.0); the address is only looked up
   here, never stored.

   cn-ip.bin, little-endian: "CNIP", the number of IPv4 and of IPv6 ranges (u32 each),
   then the IPv4 ranges (start u32, end u32, place u16), then the IPv6 ranges by their
   first 64 bits (start as two u32, end as two u32, place u16), each list sorted.
   cn-places.json: [name, lat, lon] for each place. */

export function makeLocator(buffer, places) {
  const data = new DataView(buffer);
  const n4 = data.getUint32(4, true), n6 = data.getUint32(8, true);
  const v4 = 12, v6 = v4 + n4 * 10;

  const place = (i) => ({ city: places[i][0], lat: places[i][1], lon: places[i][2] });

  function find4(ip) {
    let lo = 0, hi = n4 - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1, at = v4 + mid * 10;
      if (ip < data.getUint32(at, true)) hi = mid - 1;
      else if (ip > data.getUint32(at + 4, true)) lo = mid + 1;
      else return place(data.getUint16(at + 8, true));
    }
    return null;
  }

  function find6(a, b) {
    let lo = 0, hi = n6 - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1, at = v6 + mid * 18;
      const s0 = data.getUint32(at, true), s1 = data.getUint32(at + 4, true);
      const e0 = data.getUint32(at + 8, true), e1 = data.getUint32(at + 12, true);
      if (a < s0 || (a === s0 && b < s1)) hi = mid - 1;
      else if (a > e0 || (a === e0 && b > e1)) lo = mid + 1;
      else return place(data.getUint16(at + 16, true));
    }
    return null;
  }

  // the place of an address as Cloudflare passes it (cf-connecting-ip), or null
  return function locate(ip) {
    const m = /^(?:::ffff:)?(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/i.exec(ip);
    if (m) {
      const b = m.slice(1).map(Number);
      return b.every((x) => x < 256) ? find4(((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0) : null;
    }
    const g = groups(ip);
    return g ? find6(((g[0] << 16) | g[1]) >>> 0, ((g[2] << 16) | g[3]) >>> 0) : null;
  };
}

// the eight 16-bit groups of an IPv6 address, or null
function groups(ip) {
  const halves = ip.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const fill = 8 - head.length - tail.length;
  if (halves.length === 1 ? fill !== 0 : fill < 1) return null;
  const all = head.concat(Array(halves.length === 2 ? fill : 0).fill('0'), tail);
  return all.every((x) => /^[0-9a-f]{1,4}$/i.test(x)) ? all.map((x) => parseInt(x, 16)) : null;
}
