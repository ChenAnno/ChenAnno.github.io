/* ==========================================================================
   Homepage scripts. Plain JS, loaded after the template bundle (main.min.js).
   ========================================================================== */

/* Big screens zoom the whole page (CSS zoom on the root, set in
   _includes/head/custom.html). Chrome then reports getBoundingClientRect() in
   zoomed pixels and Safari in CSS pixels, while innerHeight and scroll offsets
   stay window pixels. rectPerCss / rectPerWindow convert between them. */
function pageScale() {
  var zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  var body = document.body;
  var rectPerCss = body.getBoundingClientRect().width / body.offsetWidth || 1;
  return { zoom: zoom, rectPerCss: rectPerCss, rectPerWindow: rectPerCss / zoom };
}

/* Greedy navigation (template code in main.min.js) moves links that do not fit
   into the menu button all at once, but moves them back only one per resize
   event, so after rotating a phone or zooming the browser the pill could stay
   half empty. Re-run it until it settles, and again once the web fonts have
   loaded, since they change the width of the links. */
(function () {
  if (typeof window.updateNav !== 'function') return;

  function settle() {
    for (var i = 0; i < 12; i++) window.updateNav();
  }

  window.addEventListener('resize', settle);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
  settle();
})();

/* Videos with class "lazy-video" use preload="none", so nothing is downloaded
   until they scroll into view and start playing (muted). Each video is started
   once; a visitor who pauses it stays in control. */
(function () {
  var videos = document.querySelectorAll('video.lazy-video');
  if (!videos.length) return;

  function start(v) {
    if (v.played.length) return;
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(videos, start);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        start(entry.target);
      }
    });
  }, { threshold: 0.25 });

  Array.prototype.forEach.call(videos, function (v) { observer.observe(v); });
})();

/* News: consecutive items from the same month share one date label, and only
   the newest `data-show` items are listed until "Show all news" is clicked. */
(function () {
  var card = document.querySelector('.news-card');
  var list = card && card.querySelector('ul');
  if (!list) return;

  var items = list.children, prev = null, i;
  for (i = 0; i < items.length; i++) {
    var date = items[i].querySelector('code');
    var text = date ? date.textContent.trim() : null;
    if (text && text === prev) items[i].classList.add('news-same-date');
    prev = text;
  }

  var show = parseInt(card.getAttribute('data-show'), 10);
  if (!(show > 0) || items.length <= show) return;

  for (i = show; i < items.length; i++) items[i].classList.add('news-extra');

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'news-more';
  btn.textContent = 'Show all news ↓';
  btn.addEventListener('click', function () {
    var open = card.classList.toggle('news-open');
    btn.textContent = open ? 'Show less ↑' : 'Show all news ↓';
    list.dispatchEvent(new Event('scroll'));
  });
  list.parentNode.insertBefore(btn, list.nextSibling);
})();

/* News list: on wide screens it scrolls inside the card (see _redesign.scss);
   fade its bottom edge while there is more below. */
(function () {
  var list = document.querySelector('.news-card ul');
  if (!list) return;

  function fade() {
    list.classList.toggle('news-fade', list.scrollHeight - list.scrollTop - list.clientHeight > 2);
  }

  list.addEventListener('scroll', fade, { passive: true });
  window.addEventListener('resize', fade);
  fade();
})();

/* Nav: the section in view is marked .is-current (blue) in the top nav pill
   (narrow screens) and in the sidebar outline (wide screens). In the outline the
   sections above it are .is-passed, and each item's --fill (0 to 1) fills the
   rail from its dot toward the next as far as the reader has come: empty at
   the top of the page, at a dot when that section's title reaches LINE (140px
   from the top of the window), full at the bottom. Sections whose titles the
   page cannot scroll up that far share the last stretch of scrolling. */
(function () {
  var sections = [], byId = {};
  Array.prototype.forEach.call(document.querySelectorAll('#site-nav a[href*="#"], .side-nav a[href*="#"]'), function (a) {
    var id = a.getAttribute('href').split('#')[1];
    var target = document.getElementById(id);
    if (!target) return;
    // the anchor is an empty span before the section title; measure the title
    var title = (target.closest('p') && target.closest('p').nextElementSibling) || target;
    if (!byId[id]) sections.push(byId[id] = { target: target, title: title, links: [], item: null });
    byId[id].links.push(a);
    if (a.closest('.side-nav')) byId[id].item = a.parentNode;
  });
  if (!sections.length) return;
  sections.sort(function (x, y) { return x.target.getBoundingClientRect().top - y.target.getBoundingClientRect().top; });

  var LINE = 140, pending = false;
  function update() {
    pending = false;
    // all in the units of getBoundingClientRect (see pageScale)
    var k = pageScale().rectPerWindow, page = document.documentElement.getBoundingClientRect();
    var y = -page.top, line = LINE * k, last = sections.length - 1;
    var end = Math.max(0, page.height - window.innerHeight * k);
    // the scroll position at which each section begins
    var starts = sections.map(function (s, i) { return i ? s.title.getBoundingClientRect().top + y - line : 0; });
    var j = last;
    while (j > 0 && starts[j] > end) j--;
    for (var k = j + 1; k <= last; k++) starts[k] = starts[j] + (end - starts[j]) * (k - j) / (last - j);
    var pos = 0;
    for (var i = 0; i < last; i++) {
      if (y >= starts[i + 1] - 1) { pos = i + 1; continue; }
      pos = i + Math.max(0, (y - starts[i]) / (starts[i + 1] - starts[i]));
      break;
    }
    var current = Math.floor(pos), part = pos - current;
    sections.forEach(function (s, i) {
      s.links.forEach(function (a) {
        a.classList.toggle('is-current', i === current);
        a.classList.toggle('is-passed', i < current);
      });
      if (s.item) s.item.style.setProperty('--fill', i < current ? 1 : i === current ? part.toFixed(3) : 0);
    });
  }

  window.addEventListener('scroll', function () {
    if (!pending) { pending = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* GitHub star counts: a link with data-gh-stars="owner/repo" gets "★ 1.2k"
   appended. Counts are cached for an hour in localStorage (the unauthenticated
   API allows 60 requests per hour per visitor). If anything fails, the link is
   left as it is rather than showing an empty or wrong number. */
(function () {
  var links = document.querySelectorAll('[data-gh-stars]');
  if (!links.length || !window.fetch) return;

  var TTL = 36e5;

  function fmt(n) {
    if (n < 1000) return String(n);
    return (n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, '') + 'k';
  }

  function cached(repo) {
    try {
      var c = JSON.parse(localStorage.getItem('gh-stars:' + repo));
      if (c && Date.now() - c.t < TTL) return c.n;
    } catch (e) {}
    return null;
  }

  function remember(repo, n) {
    try { localStorage.setItem('gh-stars:' + repo, JSON.stringify({ n: n, t: Date.now() })); } catch (e) {}
  }

  var pending = {};
  function stars(repo) {
    var n = cached(repo);
    if (n !== null) return Promise.resolve(n);
    if (!pending[repo]) {
      pending[repo] = fetch('https://api.github.com/repos/' + repo)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          var n = d && typeof d.stargazers_count === 'number' ? d.stargazers_count : null;
          if (n !== null) remember(repo, n);
          return n;
        })
        .catch(function () { return null; });
    }
    return pending[repo];
  }

  Array.prototype.forEach.call(links, function (a) {
    stars(a.getAttribute('data-gh-stars')).then(function (n) {
      if (n === null) return;
      var s = document.createElement('span');
      s.className = 'gh-stars';
      s.textContent = '★ ' + fmt(n);
      a.appendChild(s);
      a.title = n + ' stars on GitHub';
    });
  });
})();

/* All Publications: one list, sorted once for everyone (see CLAUDE.md). Each item
   carries its group, data-group="first" | "collab", and its topics,
   data-topics="agent robotics" (kramdown `- {: data-group="…" data-topics="…"}`).
   The tabs choose a group (or All), the chips a topic, and only matching papers
   are shown. The shown papers are then regrouped on a year timeline: a paper's
   year is its data-year, or else the last year in its venue ("ICML 2026").
   Without this script the whole list simply shows. */
(function () {
  var box = document.querySelector('.pub-tabs');
  var list = box && box.querySelector('.pub-list');
  if (!list) return;

  var GROUPS = [
    ['first', 'First & Co-first'],
    ['collab', 'Collaborations'],
    ['all', 'All'],
  ];
  var TOPICS = [
    ['agent', '🤖 Agent'],
    ['robotics', '🦾 Robotics'],
    ['multimedia', '🖼️ Multimedia'],
  ];
  var items = Array.prototype.slice.call(list.querySelectorAll('li'));

  // year label for every item; CSS shows it only on the first shown paper of a year
  items.forEach(function (li) {
    var year = li.getAttribute('data-year');
    if (!year) {
      var found = (li.querySelector('.venue') || li).textContent.match(/(?:19|20)\d\d/g) || [];
      year = found.length ? found[found.length - 1] : '';
      li.setAttribute('data-year', year);
    }
    var label = document.createElement('span');
    label.className = 'pub-year';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = year;
    li.insertBefore(label, li.firstChild);
  });

  var empty = document.createElement('p');
  empty.className = 'pub-empty';
  empty.textContent = 'No papers under this topic yet.';
  empty.hidden = true;
  list.appendChild(empty);
  list.id = 'pub-list';
  list.setAttribute('role', 'tabpanel');

  // toolbar: group tabs on the left, topic chips on the right
  var toolbar = document.createElement('div');
  toolbar.className = 'pub-toolbar';
  var tablist = document.createElement('div');
  tablist.className = 'pub-tablist';
  tablist.setAttribute('role', 'tablist');
  var tabs = GROUPS.map(function (g, i) {
    var tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'pub-tab';
    tab.id = 'pub-tab-' + g[0];
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', list.id);
    tab.setAttribute('data-group', g[0]);
    tab.textContent = g[1];
    tablist.appendChild(tab);
    return tab;
  });
  toolbar.appendChild(tablist);

  var used = {};
  items.forEach(function (li) {
    (li.getAttribute('data-topics') || '').split(/\s+/).forEach(function (t) { if (t) used[t] = true; });
  });
  var filter = document.createElement('div');
  filter.className = 'pub-filter';
  filter.setAttribute('role', 'group');
  filter.setAttribute('aria-label', 'Filter by topic');
  var chips = [['all', 'All']].concat(TOPICS.filter(function (t) { return used[t[0]]; })).map(function (t) {
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'pub-chip';
    chip.setAttribute('data-topic', t[0]);
    chip.textContent = t[1];
    filter.appendChild(chip);
    return chip;
  });
  toolbar.appendChild(filter);

  var group = GROUPS[0][0], topic = 'all';

  function apply() {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-group') === group;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      if (on) list.setAttribute('aria-labelledby', tab.id);
    });
    chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', chip.getAttribute('data-topic') === topic ? 'true' : 'false');
    });

    var shown = items.filter(function (li) {
      var topics = (li.getAttribute('data-topics') || '').split(/\s+/);
      return (group === 'all' || li.getAttribute('data-group') === group) &&
             (topic === 'all' || topics.indexOf(topic) >= 0);
    });
    items.forEach(function (li) { li.hidden = shown.indexOf(li) < 0; });
    empty.hidden = shown.length > 0;

    // regroup the shown papers by year, and mark the ends of the timeline
    var prevYear = null;
    shown.forEach(function (li, i) {
      var year = li.getAttribute('data-year');
      li.classList.toggle('is-year-first', year !== prevYear);
      li.classList.toggle('is-first', i === 0);
      li.classList.toggle('is-last', i === shown.length - 1);
      prevYear = year;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      group = tab.getAttribute('data-group');
      apply();
    });
    tab.addEventListener('keydown', function (e) {
      var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      var next = tabs[(i + step + tabs.length) % tabs.length];
      group = next.getAttribute('data-group');
      apply();
      next.focus();
    });
  });
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      topic = chip.getAttribute('data-topic');
      apply();
    });
  });

  box.insertBefore(toolbar, box.firstChild);
  apply();
})();

/* Sidebar on wide screens: sticky, and it never moves (the user asked): it
   starts where it sticks, its margin-top set so. The photo sits AIR from the
   top of the window and the rest follows at its own spacing, the outline right
   under the links; what height is left stays below it (the user wanted the
   outline close up, not the sidebar spread out or centered). Without EDGE left
   below, the sidebar moves up, to EDGE from the top at most, and then the photo
   gets smaller (130px at the least). Only a window too short even for that lets
   the sidebar scroll until its end shows. The content column follows the photo
   (--content-shift on #main), so the first section title stays level with the
   top of the photo. Everything here is in CSS pixels, which the big-screen
   zoom scales (see pageScale). */
(function () {
  var sidebar = document.querySelector('.sidebar.sticky');
  var avatar = sidebar && sidebar.querySelector('.author__avatar img');
  var nav = sidebar && sidebar.querySelector('.side-nav');
  var main = document.getElementById('main');
  if (!avatar || !nav || !main) return;
  var wide = window.matchMedia('(min-width: 925px)');
  var AIR = 32, EDGE = 16, SMALLEST = 130;   // AIR: where #main's margin puts the first title

  function layout() {
    avatar.style.maxWidth = '';
    sidebar.style.marginTop = '';
    if (!wide.matches) {
      main.style.removeProperty('--content-shift');
      sidebar.style.top = '';
      return;
    }
    var scale = pageScale();
    var h = window.innerHeight / scale.zoom;
    function column() {
      return (nav.getBoundingClientRect().bottom - avatar.getBoundingClientRect().top) / scale.rectPerCss;
    }
    var height = column(), top = Math.min(AIR, Math.floor(h - height - EDGE));
    if (top < EDGE) {
      avatar.style.maxWidth = Math.max(SMALLEST, avatar.offsetWidth - (EDGE - top)) + 'px';
      height = column();
      top = Math.min(AIR, Math.floor(h - height - EDGE));
    }
    // where it starts is where it sticks: no move when the page scrolls
    var natural = (main.getBoundingClientRect().top - document.documentElement.getBoundingClientRect().top) / scale.rectPerCss;
    if (top >= EDGE) {
      sidebar.style.marginTop = top - natural + 'px';
      main.style.setProperty('--content-shift', top - AIR + 'px');
    } else {
      main.style.setProperty('--content-shift', natural - AIR + 'px');
    }
    sidebar.style.top = top + 'px';
  }

  // again when the web fonts and the photo are in, and while (and once after)
  // the window is resized: sizes can lag a frame behind the resize event
  layout();
  var resizing = 0, settle = 0;
  window.addEventListener('resize', function () {
    if (!resizing) resizing = requestAnimationFrame(function () { resizing = 0; layout(); });
    clearTimeout(settle);
    settle = setTimeout(layout, 250);
  });
  window.addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();

/* Visitor map and Total Views in the footer, from the site's own counter: a
   Cloudflare Worker on the site's domain (worker/; /api/visit, /api/visitors).
   The Worker locates each visit by city, so visits from mainland China count
   too, which the third-party map widget used before missed. Each page load counts
   as a view, and once per browser per day as a visit from its place; only on the
   published domain, so previews do not count. The map shows every place since
   counting began; the more visits, the darker its marker, and a soft halo means
   a visit in the last three days. The
   land is images/visitor-map.svg and the markers use its projection. Map and
   views stay hidden until the numbers arrive. */
(function () {
  var map = document.getElementById('visitor-map');
  var views = document.querySelector('.site-views');
  if (!window.fetch || (!map && !views)) return;

  if (location.hostname === 'chenyanzhe.page') {
    var first = true;
    try {
      first = Date.now() - (+localStorage.getItem('visit:last') || 0) > 864e5;
      if (first) localStorage.setItem('visit:last', Date.now());
    } catch (e) {}
    fetch('/api/visit', {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ first: first }),
    }).catch(function () {});
  }

  fetch('/api/visitors', { headers: { accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;
      if (views && data.pageviews > 0) {
        views.querySelector('.site-views__n').textContent = data.pageviews.toLocaleString('en-US');
        views.hidden = false;
      }
      if (map && data.places && data.places.length) draw(data.places);
    })
    .catch(function () {});

  // jVectorMap's world_mill frame: Miller projection, central meridian 11.5,
  // 900 x 440.7 (the land image is cropped to 409 high)
  function project(lat, lon) {
    var R = 6381372, D = Math.PI / 180;
    if (lon < -168.5) lon += 360;
    var x = R * (lon - 11.5) * D;
    var y = -R * Math.log(Math.tan((45 + 0.4 * lat) * D)) / 0.8;
    return [(x + 20004297.151525836) / 40030869.546275226 * 900,
            (y + 12671671.123330014) / 19602063.148465134 * 440.70631074413296];
  }

  function draw(places) {
    var svg = map.querySelector('svg'), tip = map.querySelector('.visitor-map__tip');
    var names = window.Intl && Intl.DisplayNames ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
    // Hong Kong, Macao and Taiwan as parts of China (the user asked)
    var REGIONS = { HK: 'Hong Kong, China', MO: 'Macao, China', TW: 'Taiwan, China' };
    function country(cc) {
      if (REGIONS[cc]) return REGIONS[cc];
      try { return (names && names.of(cc)) || cc; } catch (e) { return cc; }
    }
    // Every marker the same size; only its colour says how many visits, from the
    // light end of RAMP (one visit) to the dark end (50 or more), on a log scale
    // so that one busy place does not wash out all the others. The site's blue,
    // but vivid (OKLCH chroma .13 to .165), so it stands out from the grey-blue
    // land, and never dark: earlier ramps ending in navy and in #0160c1 looked too
    // heavy, and teal did not match the page.
    var RAMP = ['#72adfb', '#609ef1', '#4d90e7', '#3a81dd', '#2573d2'];
    function shade(n) {
      var t = Math.min(1, Math.log(Math.max(1, n)) / Math.log(50)) * (RAMP.length - 1);
      var i = Math.min(RAMP.length - 2, Math.floor(t)), f = t - i;
      var a = parseInt(RAMP[i].slice(1), 16), b = parseInt(RAMP[i + 1].slice(1), 16);
      return 'rgb(' + [16, 8, 0].map(function (s) {
        return Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f);
      }).join(',') + ')';
    }
    var visits = function (n) { return n + (n > 1 ? ' visits' : ' visit'); };
    // visited in the last three days: a soft halo, on the map and in the list
    var isRecent = function (p) { return p.days < 3; };

    // One place per city: rows of the same city (Cloudflare gives it slightly
    // different coordinates, or a district's name) are added up, at the busiest
    // row's spot. Hong Kong, Macao and Singapore count as one city each, whatever
    // district a visit was put in; ALIAS joins names that mean the same city.
    var WHOLE = { HK: 'Hong Kong', MO: 'Macao', SG: 'Singapore' };
    var ALIAS = { 'US|New York': 'New York City' };
    var byCity = {}, list = [];
    places.forEach(function (p) {
      var city = WHOLE[p.cc] || ALIAS[p.cc + '|' + p.city] || p.city || '';
      var key = p.cc + '|' + city, q = byCity[key];
      if (!q) list.push(q = byCity[key] = { cc: p.cc, city: city, lat: p.lat, lon: p.lon, n: 0, top: 0, days: Infinity });
      if (p.days < q.days) q.days = p.days;
      if (p.n > q.top) { q.lat = p.lat; q.lon = p.lon; q.top = p.n; }
      q.n += p.n;
    });

    // Every marker is a region, and the tooltip always names the region, with the
    // cities listed under it (naming only the markers that happened to overlap
    // left a lone "Kobe, Japan" beside "Japan"). Large countries are split, each
    // place going to the region of its nearest anchor city; any other country is
    // one region. All of a region's places share one marker.
    var AREAS = {   // country: [region, [lat, lon] of its anchor cities...]
      CN: [
        ['Yangtze River Delta', [31.23, 121.47], [32.06, 118.8], [30.27, 120.16], [29.87, 121.55], [31.82, 117.23]],
        ['Greater Bay Area', [23.13, 113.26], [22.54, 114.06], [22.3, 114.17], [22.2, 113.55]],
        ['South China', [22.82, 108.32], [20.04, 110.32], [23.35, 116.68], [25.27, 110.29]],
        ['East China', [36.67, 117], [36.07, 120.38], [26.07, 119.3], [24.48, 118.09], [28.68, 115.86]],
        ['North China', [39.9, 116.4], [39.13, 117.2], [38.04, 114.51], [37.87, 112.55], [40.84, 111.75]],
        ['Northeast China', [41.8, 123.43], [43.82, 125.32], [45.8, 126.53], [38.91, 121.6]],
        ['Central China', [34.75, 113.63], [30.59, 114.31], [28.23, 112.94]],
        ['Sichuan Basin', [30.57, 104.07], [29.56, 106.55], [31.47, 104.68], [30.84, 106.11]],
        ['Southwest China', [25.04, 102.72], [26.65, 106.63], [29.65, 91.1]],
        ['Northwest China', [34.34, 108.94], [36.06, 103.83], [38.49, 106.23], [36.62, 101.78], [43.83, 87.62]],
      ],
      US: [
        ['San Francisco Bay Area', [37.77, -122.42], [37.34, -121.89]],
        ['Southern California', [34.05, -118.24], [32.72, -117.16]],
        ['Pacific Northwest', [47.61, -122.33], [45.52, -122.68], [45.84, -119.7]],
        ['Mountain West', [39.74, -104.99], [40.76, -111.89], [33.45, -112.07], [36.17, -115.14], [35.08, -106.65]],
        ['Midwest', [41.88, -87.63], [41.26, -95.86], [44.98, -93.27], [38.63, -90.2], [42.33, -83.05], [39.96, -83], [39.1, -94.58]],
        ['South Central', [32.78, -96.8], [29.76, -95.37], [36.15, -95.99], [29.95, -90.07]],
        ['Southeast', [35.23, -80.84], [35.45, -78.43], [32.85, -79.97], [33.75, -84.39], [25.76, -80.19], [36.16, -86.78]],
        ['Northeast & Mid-Atlantic', [40.71, -74.01], [42.36, -71.06], [39.95, -75.17], [40.44, -80], [38.9, -77.04]],
      ],
      CA: [
        ['Western Canada', [49.28, -123.12], [51.05, -114.07], [53.55, -113.49]],
        ['Eastern Canada', [43.65, -79.38], [45.5, -73.57], [45.42, -75.7], [44.65, -63.58]],
      ],
      AU: [
        ['Western Australia', [-31.95, 115.86]],
        ['Eastern Australia', [-33.87, 151.21], [-37.81, 144.96], [-27.47, 153.03], [-34.93, 138.6], [-12.46, 130.84]],
      ],
    };
    function km(a, b) {   // great-circle distance
      var D = Math.PI / 180, dLat = (b[0] - a[0]) * D, dLon = (b[1] - a[1]) * D;
      var h = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(a[0] * D) * Math.cos(b[0] * D) * Math.pow(Math.sin(dLon / 2), 2);
      return 12742 * Math.asin(Math.sqrt(h));
    }
    var nation = function (cc) { return REGIONS[cc] ? 'China' : country(cc); };
    function regionOf(p) {
      var table = AREAS[p.cc === 'HK' || p.cc === 'MO' ? 'CN' : p.cc];
      if (!table) return country(p.cc);
      var best = null, nearest = Infinity;
      table.forEach(function (region) {
        region.slice(1).forEach(function (anchor) {
          var d = km([p.lat, p.lon], anchor);
          if (d < nearest) { nearest = d; best = region[0]; }
        });
      });
      return best;
    }

    var byRegion = {}, regions = [];
    list.forEach(function (p) {
      p.at = project(p.lat, p.lon);
      if (p.at[1] > 409) return;
      var name = regionOf(p), r = byRegion[name];
      if (!r) regions.push(r = byRegion[name] = { name: name, nation: nation(p.cc), n: 0, list: [] });
      r.list.push(p);
      r.n += p.n;
    });

    // A region's marker stands on its busiest city (a row without a city has only
    // the country's default spot, in the Australian outback, say). Markers that
    // would overlap join, as on caozhijun.top: from the busiest down, a region
    // joins the first marker within NEAR of it, compared with that marker's first
    // region only, so no chains form.
    var NEAR = 2 * 4.6 + 2, groups = [];
    regions.sort(function (a, b) { return b.n - a.n; }).forEach(function (r) {
      r.list.sort(function (a, b) { return (b.city ? 1 : 0) - (a.city ? 1 : 0) || b.n - a.n; });
      var at = r.list[0].at;
      for (var i = 0; i < groups.length; i++) {
        var g = groups[i];
        if (Math.hypot(at[0] - g.at[0], at[1] - g.at[1]) < NEAR) { g.regions.push(r); g.n += r.n; return; }
      }
      groups.push({ at: at, n: r.n, regions: [r] });
    });

    function join(names) {
      return names.length < 2 ? names[0] : names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
    }
    // "Sichuan Basin, China"; joined regions name their country once if they share
    // it ("Northeast & Southeast, United States"), each their own if not
    function describe(g) {
      var names = g.regions.map(function (r) { return r.name; }), of = g.regions[0].nation;
      var sameNation = g.regions.every(function (r) { return r.nation === of; });
      var title = sameNation
        ? join(names) + (names.some(function (n) { return n.indexOf(of) >= 0; }) ? '' : ', ' + of)
        : join(g.regions.map(function (r) { return r.name.indexOf(r.nation) >= 0 ? r.name : r.name + ', ' + r.nation; }));
      var places = [];
      g.regions.forEach(function (r) { places = places.concat(r.list); });
      places.sort(function (a, b) { return (b.city ? 1 : 0) - (a.city ? 1 : 0) || b.n - a.n; });
      var rows = places.map(function (p) {   // every place, busiest first
        var city = p.city || 'City unknown', from = nation(p.cc);
        return { name: !sameNation && city !== from ? city + ', ' + from : city, n: p.n, recent: isRecent(p) };
      });
      // a marker known only by its country has nothing to list
      if (places.length === 1 && !places[0].city) rows = [];
      return { title: title, total: visits(g.n), rows: rows };
    }

    // A white card like the page's others: the place or region in the headings'
    // blue with its total, then each place with a dot in its marker's shade and
    // its count (two columns past 8 places). Above the marker, or below it when
    // there is no room above in the map; kept inside the map's width (the map is
    // as wide as a phone's screen).
    function showTip(d, at) {
      tip.textContent = '';
      var head = document.createElement('span');
      head.className = 'visitor-map__head';
      head.innerHTML = '<strong></strong> <em></em>';
      head.firstChild.textContent = d.title;
      head.lastChild.textContent = d.total;
      tip.appendChild(head);
      if (d.rows.length) {
        var rows = document.createElement('span');
        rows.className = 'visitor-map__rows' + (d.rows.length > 8 ? ' is-wide' : '');
        d.rows.forEach(function (r) {
          var dot = document.createElement('i'), name = document.createElement('span'), n = document.createElement('b');
          dot.style.background = shade(r.n);
          if (r.recent) dot.className = 'is-recent';
          name.textContent = r.name;
          n.textContent = r.n;
          rows.appendChild(dot);
          rows.appendChild(name);
          rows.appendChild(n);
        });
        tip.appendChild(rows);
      }
      tip.hidden = false;
      var w = map.clientWidth, x = at[0] / 900 * w, y = at[1] / 409 * map.clientHeight, half = tip.offsetWidth / 2;
      tip.classList.toggle('is-below', y - tip.offsetHeight - 12 < 0);
      tip.style.left = Math.max(half, Math.min(w - half, x)) + 'px';
      tip.style.top = y + 'px';
    }

    // the busiest last, on top where markers come close
    groups.sort(function (a, b) { return a.n - b.n; }).forEach(function (g) {
      var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', g.at[0].toFixed(1));
      dot.setAttribute('cy', g.at[1].toFixed(1));
      dot.setAttribute('r', '4.6');
      dot.style.fill = shade(g.n);
      if (g.regions.some(function (r) { return r.list.some(isRecent); })) {
        var halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        halo.setAttribute('class', 'visitor-map__halo');
        halo.setAttribute('cx', g.at[0].toFixed(1));
        halo.setAttribute('cy', g.at[1].toFixed(1));
        halo.setAttribute('r', '8.6');
        svg.insertBefore(halo, svg.firstChild);   // under every marker
      }
      var d = describe(g);
      dot.addEventListener('mouseenter', function () { showTip(d, g.at); });
      dot.addEventListener('mouseleave', function () { tip.hidden = true; });
      svg.appendChild(dot);
    });
    places = list;
    map.setAttribute('aria-label', 'Visitor map: visits from ' + places.length + ' places');
    map.hidden = false;
  }
})();

/* Email links (_includes/email-link.html): the address is not in the page, where
   spam harvesters read it. Each link carries its two halves, reversed; a click
   joins them and shows the address in a small card under the link, with a button
   to copy it (many visitors have no mail app for the mailto link). The card
   closes on a click elsewhere, Escape, or a second click on the link. */
(function () {
  var links = document.querySelectorAll('.js-mail');
  if (!links.length) return;
  var flip = function (s) { return (s || '').split('').reverse().join(''); };
  var COPY = '<i class="fas fa-copy" aria-hidden="true"></i> Copy';
  var DONE = '<i class="fas fa-check" aria-hidden="true"></i> Copied';
  var card = document.createElement('span');
  card.className = 'mail-pop';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-label', 'Email address');
  card.innerHTML = '<a class="mail-pop__addr"></a><button type="button" class="mail-pop__copy"></button>';
  var addr = card.firstChild, copy = card.lastChild, owner = null, reset = 0;

  function close(refocus) {
    if (!owner) return;
    owner.setAttribute('aria-expanded', 'false');
    if (refocus) owner.focus();
    card.remove();
    owner = null;
  }

  function open(link) {
    var mail = flip(link.dataset.u) + '@' + flip(link.dataset.d);
    addr.textContent = mail;
    addr.href = 'mailto:' + mail;
    copy.innerHTML = COPY;
    copy.classList.remove('is-done');
    // Under the link, inside the window (on a phone the link can sit near an
    // edge, or in a row of icons): the card hangs from its holder, centered, and
    // --shift moves it, --arrow points its arrow back at the link. It is measured
    // while fixed and hidden first, since even a moment past the edge widens the
    // page on a phone (and the window then reads wider too).
    var holder = link.closest('.mail-anchor, li, .author__urls_sm');
    var scale = pageScale(), width = document.documentElement.clientWidth;
    card.style.cssText = 'position: fixed; left: 0; top: 0; visibility: hidden; animation: none';
    holder.appendChild(card);
    var px = function (r) { return (r.left + r.right) / 2 / scale.rectPerWindow; };
    var w = card.getBoundingClientRect().width / scale.rectPerWindow;
    var at = px(link.getBoundingClientRect()), base = px(holder.getBoundingClientRect());
    var center = Math.min(Math.max(at, 8 + w / 2), width - 8 - w / 2);
    card.style.cssText = '--shift: ' + (center - base) / scale.zoom + 'px; --arrow: ' + (at - center) / scale.zoom + 'px';
    link.setAttribute('aria-expanded', 'true');
    owner = link;
  }

  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      if (owner === link) return close();
      close();
      open(link);
    });
  });

  copy.addEventListener('click', function () {
    function done() {
      copy.innerHTML = DONE;
      copy.classList.add('is-done');
      clearTimeout(reset);
      reset = setTimeout(function () { copy.innerHTML = COPY; copy.classList.remove('is-done'); }, 1800);
    }
    function select() {   // no clipboard access: select the address for Cmd/Ctrl+C
      var range = document.createRange();
      range.selectNodeContents(addr);
      getSelection().removeAllRanges();
      getSelection().addRange(range);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr.textContent).then(done, select);
    else select();
  });

  // by the path at the time of the click: Copy swaps its icon, so the clicked
  // icon is no longer in the card by the time the click gets here
  document.addEventListener('click', function (e) {
    var path = e.composedPath ? e.composedPath() : [e.target];
    if (owner && path.indexOf(card) < 0 && path.indexOf(owner) < 0) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close(true);
  });
})();

/* Reveal on scroll: blocks that start below the fold fade up as they come into
   view, in document order. Blocks already on screen are never hidden, so the
   first screen does not flash, and without this script nothing is hidden. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var blocks = document.querySelectorAll(
    '.page__content > h1, .page__content > h2, .page__content > h3, .page__content > p,' +
    '.news-card, .pub-card, .pub-toolbar, .pub-list, .edu-card, .info-card, .visitor-map'
  );

  var observer = new IntersectionObserver(function (entries) {
    var shown = entries.filter(function (e) { return e.isIntersecting; });
    shown.sort(function (a, b) {
      return a.target.compareDocumentPosition(b.target) & 4 ? -1 : 1;
    });
    shown.forEach(function (e, i) {
      e.target.style.setProperty('--d', (i * 80) + 'ms');
      e.target.classList.add('in');
      observer.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

  var fold = window.innerHeight * pageScale().rectPerWindow;
  Array.prototype.forEach.call(blocks, function (el) {
    if (el.getBoundingClientRect().top > fold) {
      el.classList.add('rise');
      observer.observe(el);
    }
  });
})();
