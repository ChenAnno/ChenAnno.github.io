"""Build the table that locates visitors from mainland China (src/cn-ip.bin and
src/cn-places.json, used by src/cn-geo.js).

Cloudflare often puts mainland Chinese mobile networks in the wrong city (a visitor in
Beijing showed up in Shanghai, one in Mianyang in Jiaxing), while ip2region, a Chinese
IP database, had both right. So for visitors from China the Worker looks the address
up here, and keeps Cloudflare's place when this table has no answer.

Sources (download first, then run from this folder):
  ip2region (Apache-2.0), https://github.com/lionsoul2014/ip2region/tree/master/data
    ipv4_source.txt, ipv6_source.txt: start|end|country|province|city|isp|cc
  GeoNames (CC BY 4.0), https://download.geonames.org/export/dump/
    cities5000.zip (unzipped): English names and coordinates of the cities

usage: python3 build-cn.py IP2REGION_DIR GEONAMES_DIR

What goes in:
  - IPv4 ranges with a known mainland province.
  - IPv6 ranges of /29 or smaller. The three carriers' big blocks (/18 to /28) are
    filed under one default province (China Mobile: Guangdong, China Telecom and China
    Unicom: Beijing) whatever the user's location; those are left to Cloudflare.
  - The city when ip2region names one and GeoNames finds it in that province, otherwise
    the province, placed at its capital.
"""
import ipaddress, json, math, struct, sys
from collections import defaultdict

IP2R, GEO = sys.argv[1], sys.argv[2]
OUT = __file__.rsplit('/', 2)[0] + '/src'

# ip2region's mainland province names -> GeoNames admin1 code, English name
PROVINCES = {
    '北京市': ('22', 'Beijing'), '天津市': ('28', 'Tianjin'), '河北省': ('10', 'Hebei'),
    '山西省': ('24', 'Shanxi'), '内蒙古': ('20', 'Inner Mongolia'), '辽宁省': ('19', 'Liaoning'),
    '吉林省': ('05', 'Jilin'), '黑龙江省': ('08', 'Heilongjiang'), '上海市': ('23', 'Shanghai'),
    '江苏省': ('04', 'Jiangsu'), '浙江省': ('02', 'Zhejiang'), '安徽省': ('01', 'Anhui'),
    '福建省': ('07', 'Fujian'), '江西省': ('03', 'Jiangxi'), '山东省': ('25', 'Shandong'),
    '河南省': ('09', 'Henan'), '湖北省': ('12', 'Hubei'), '湖南省': ('11', 'Hunan'),
    '广东省': ('30', 'Guangdong'), '广西': ('16', 'Guangxi'), '海南省': ('31', 'Hainan'),
    '重庆市': ('33', 'Chongqing'), '四川省': ('32', 'Sichuan'), '贵州省': ('18', 'Guizhou'),
    '云南省': ('29', 'Yunnan'), '西藏': ('14', 'Tibet'), '陕西省': ('26', 'Shaanxi'),
    '甘肃省': ('15', 'Gansu'), '青海省': ('06', 'Qinghai'), '宁夏': ('21', 'Ningxia'),
    '新疆': ('13', 'Xinjiang'),
}
MUNICIPALITIES = {'北京市', '天津市', '上海市', '重庆市'}
MAX_V6 = 2 ** (128 - 29)   # largest IPv6 range taken: a /29

# GeoNames: cities in China by province, with their Chinese names
cities = defaultdict(list)          # admin1 -> [(rank, population, name, lat, lon, names)]
capitals = {}                       # admin1 -> (name, lat, lon)
RANK = {'PPLC': 0, 'PPLA': 0, 'PPLA2': 1, 'PPLA3': 2}
for line in open(f'{GEO}/cities5000.txt', encoding='utf-8'):
    f = line.rstrip('\n').split('\t')
    if f[8] != 'CN':
        continue
    name, lat, lon, code, admin1, pop = f[1], float(f[4]), float(f[5]), f[7], f[10], int(f[14] or 0)
    names = {n for n in f[3].split(',') if n} | {f[1], f[2]}
    cities[admin1].append((RANK.get(code, 3), -pop, name, lat, lon, names))
    if code in ('PPLC', 'PPLA') and (admin1 not in capitals or pop > capitals[admin1][3]):
        capitals[admin1] = (name, lat, lon, pop)
for rows in cities.values():
    rows.sort(key=lambda r: r[:2])


def find_city(admin1, city):
    """The GeoNames city in this province with this Chinese name (seats of government
    first, then the most populous), or None."""
    stems = {city}
    for suffix in ('市', '地区', '盟', '县', '区'):
        if city.endswith(suffix) and len(city) > len(suffix) + 1:
            stems.add(city[:-len(suffix)])
    wanted = stems | {s + '市' for s in stems}
    for rank, _, name, lat, lon, names in cities[admin1]:
        if names & wanted:
            return name, lat, lon
    return None


places, place_index = [], {}


def place(province, city):
    admin1, province_en = PROVINCES[province]
    if province in MUNICIPALITIES:
        city = province
    hit = find_city(admin1, city) if city not in ('0', '') else None
    if hit is None:                                   # the province, at its capital
        name, lat, lon, _ = capitals[admin1]
        hit = (province_en, lat, lon)
    if province in MUNICIPALITIES:
        hit = (province_en,) + hit[1:]                # "Beijing", not "Beijing (district)"
    key = (hit[0], round(hit[1], 2), round(hit[2], 2))
    if key not in place_index:
        place_index[key] = len(places)
        places.append(list(key))
    return place_index[key]


def ranges(path, v6):
    out, unmatched = [], defaultdict(int)
    for line in open(path, encoding='utf-8'):
        p = line.rstrip('\n').split('|')
        if len(p) < 6 or p[2] != '中国' or p[3] not in PROVINCES:
            continue
        a, b = int(ipaddress.ip_address(p[0])), int(ipaddress.ip_address(p[1]))
        if v6 and b - a + 1 > MAX_V6:
            continue
        if v6:
            a, b = a >> 64, b >> 64                   # the network part is enough
        i = place(p[3], p[4])
        if p[4] not in ('0', '') and p[3] not in MUNICIPALITIES and find_city(PROVINCES[p[3]][0], p[4]) is None:
            unmatched[f'{p[3]}{p[4]}'] += 1
        out.append((a, b, i))
    out.sort()
    merged = []
    for a, b, i in out:                               # join neighbours in the same place
        if merged and merged[-1][2] == i and a <= merged[-1][1] + 1:
            merged[-1][1] = max(merged[-1][1], b)
        else:
            merged.append([a, b, i])
    return merged, unmatched


v4, miss4 = ranges(f'{IP2R}/ipv4_source.txt', False)
v6, miss6 = ranges(f'{IP2R}/ipv6_source.txt', True)

with open(f'{OUT}/cn-ip.bin', 'wb') as f:
    f.write(b'CNIP' + struct.pack('<II', len(v4), len(v6)))
    for a, b, i in v4:
        f.write(struct.pack('<IIH', a, b, i))
    for a, b, i in v6:
        f.write(struct.pack('<IIIIH', a >> 32, a & 0xffffffff, b >> 32, b & 0xffffffff, i))
with open(f'{OUT}/cn-places.json', 'w', encoding='utf-8') as f:
    f.write('[\n' + ',\n'.join(json.dumps(p, ensure_ascii=False) for p in places) + '\n]\n')

miss = defaultdict(int)
for k, n in list(miss4.items()) + list(miss6.items()):
    miss[k] += n
print(f'{len(v4)} IPv4 + {len(v6)} IPv6 ranges, {len(places)} places')
print('cities placed at the province capital (not found in GeoNames):',
      ', '.join(f'{k}({n})' for k, n in sorted(miss.items(), key=lambda kv: -kv[1])[:30]))
