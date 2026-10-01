/* ==========================================================================
   Homepage scripts. Plain JS, loaded after the template bundle (main.min.js).
   ========================================================================== */

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

/* Nav: the link of the section currently in view turns blue (.is-current).
   A section counts as current once its title has scrolled up past the pill;
   at the very bottom of the page the last section wins. */
(function () {
  var items = [];
  Array.prototype.forEach.call(document.querySelectorAll('#site-nav a[href*="#"]'), function (a) {
    var target = document.getElementById(a.getAttribute('href').split('#')[1]);
    if (target) items.push({ link: a, target: target });
  });
  if (!items.length) return;

  var pending = false;
  function update() {
    pending = false;
    var current = null;
    items.forEach(function (item) {
      if (item.target.getBoundingClientRect().top <= 140) current = item;
    });
    if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2) {
      current = items[items.length - 1];
    }
    items.forEach(function (item) {
      item.link.classList.toggle('is-current', item === current);
    });
  }

  window.addEventListener('scroll', function () {
    if (!pending) { pending = true; window.requestAnimationFrame(update); }
  }, { passive: true });
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

/* Visitor globe: a desk globe drawn on a canvas. The land is a lattice of dots on
   a sphere (kept where images/globe-land.png, a land mask made from Natural Earth
   data, is white), seen in orthographic projection with the axis tilted 12
   degrees (Earth's 23.4 looked too steep), turning slowly from west to east. The visits come from the
   mapmyvisitors globe widget (the user's account, see
   _includes/visitor-globe.html), loaded out of sight: it still counts each visit
   and puts one SVG circle per place on the page, which is read back here, its
   jVectorMap Miller coordinates turned into latitude and longitude.
   Hovering pauses the globe and names the place under the pointer; with reduced
   motion it stands still. */
(function () {
  var foot = document.getElementById('visitor-globe-foot');
  var canvas = document.createElement('canvas');
  if (!foot || !canvas.getContext) return;
  var side = document.getElementById('visitor-globe');
  var sidebar = side && side.closest('.sidebar');
  var avatar = sidebar && sidebar.querySelector('.author__avatar img');
  var profile = sidebar && sidebar.querySelector('.author__urls-wrapper');
  var wide = window.matchMedia('(min-width: 925px)');
  var TALL = 1.14;      // canvas height / width, with the stand
  var GAP = 24;         // between the profile and the globe (.visitor-globe margin)
  var AIR = 84;         // room above the photo and below the globe: the nav's fade ends at 77px
  var BELOW = 24;       // the room below the globe may be up to this much larger
  var MIN = 130;        // smallest globe in the sidebar (and photo, see _redesign.scss)

  var D2R = Math.PI / 180;
  var TILT = 12 * D2R, PITCH = 16 * D2R;          // axial tilt; seen a little from above
  var ct = Math.cos(TILT), st = Math.sin(TILT), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  var SPEED = 9 * D2R / 1000;                     // 9 degrees a second: a turn in 40 s
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var S = 0, H = 0, R = 0, RING = 0, cx = 0, cy = 0, slot = null;
  var spin = 100 * D2R;                           // longitude facing the viewer: Asia first
  var dots = [], places = [];

  var link = document.createElement('a');
  link.className = 'visitor-globe__link';
  link.href = foot.getAttribute('data-stats');
  link.setAttribute('aria-label', 'Visitor map (mapmyvisitors)');
  link.appendChild(canvas);
  var tip = document.createElement('span');
  tip.className = 'visitor-globe__tip';
  tip.hidden = true;
  var ctx = canvas.getContext('2d');

  // Where the globe goes and how big, and where the sticky sidebar sits. On
  // wide screens the globe goes in the sidebar, as wide as the photo and
  // centered under it, if photo, profile and globe fit the window with AIR
  // above and below (windows 768-874px tall shrink the photo in CSS to make it
  // fit); otherwise it goes in the footer. The user wanted the photo high up
  // and about as much room under the globe as above the photo (a little more is
  // fine): spare height first adds up to BELOW under the globe, then goes
  // between the name and the profile and between the profile and the globe
  // (1 : 3, at most 80px together, via --gap-* in CSS; not between photo and
  // name, which looked too far apart), and only the rest above and below.
  // Without the globe the photo simply sits AIR from the top.
  var GAPS = ['--gap-profile', '--gap-globe'], SHARES = [0.25, 0.75];
  function layout() {
    var target = foot, size = 180, width = 180, h = window.innerHeight;
    var placed = sidebar && avatar && profile && wide.matches;
    if (sidebar) GAPS.forEach(function (name) { sidebar.style.setProperty(name, '0px'); });
    if (placed) {
      var used = profile.getBoundingClientRect().bottom - avatar.getBoundingClientRect().top;
      var fit = Math.floor(Math.min(avatar.offsetWidth, (h - 2 * AIR - used - GAP) / TALL));
      if (fit >= MIN) {
        target = side;
        size = fit;
        width = avatar.offsetWidth;
      }
    }

    if (target !== slot) {
      if (slot) slot.style.width = '';
      target.appendChild(link);
      target.appendChild(tip);
      slot = target;
    }
    slot.style.width = width + 'px';
    if (size !== S) {
      S = size;
      H = Math.round(S * TALL);
      R = S * 0.38;
      RING = R + S * 0.045;                       // the meridian ring
      cx = S / 2;
      cy = RING + S * 0.035;
      canvas.width = Math.round(S * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = S + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (dots.length) draw();
    }

    // with the globe in place, measure the column (photo to globe) as it is
    if (placed) {
      var top = AIR;
      if (target === side) {
        var column = canvas.getBoundingClientRect().bottom - avatar.getBoundingClientRect().top;
        var spare = Math.max(0, h - 2 * AIR - column);
        spare -= Math.min(spare, BELOW);
        var spread = Math.min(80, spare);
        GAPS.forEach(function (name, i) { sidebar.style.setProperty(name, spread * SHARES[i] + 'px'); });
        top = AIR + Math.floor((spare - spread) / 2);
      }
      sidebar.style.top = top + 'px';
    } else if (sidebar) {
      sidebar.style.top = '';
      GAPS.forEach(function (name) { sidebar.style.removeProperty(name); });
    }
  }

  // A point of the unit sphere (cos and sin of its latitude and longitude) on
  // the canvas: turned about the axis, pitched toward the viewer, axis tilted.
  // out[2] > 0 on the near side.
  function project(cLat, sLat, sLng, cLng, out) {
    var sa = Math.sin(spin), ca = Math.cos(spin);
    var x0 = cLat * (sLng * ca - cLng * sa), y0 = sLat, z0 = cLat * (cLng * ca + sLng * sa);
    var y1 = y0 * cp - z0 * sp;
    out[0] = cx + R * (x0 * ct + y1 * st);
    out[1] = cy + R * (x0 * st - y1 * ct);
    out[2] = y0 * sp + z0 * cp;
    return out;
  }

  var P = [0, 0, 0];
  function line(points) {
    ctx.beginPath();
    var on = false;
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      project(p[0], p[1], p[2], p[3], P);
      if (P[2] > 0) { on ? ctx.lineTo(P[0], P[1]) : ctx.moveTo(P[0], P[1]); on = true; } else on = false;
    }
    ctx.stroke();
  }

  // graticule every 30 degrees, as cos/sin quadruples
  var grid = [];
  function at(a, b) { return [Math.cos(a * D2R), Math.sin(a * D2R), Math.sin(b * D2R), Math.cos(b * D2R)]; }
  for (var g = -60; g <= 60; g += 30) {
    var par = [];
    for (var lo = -180; lo <= 180; lo += 4) par.push(at(g, lo));
    grid.push(par);
  }
  for (var m = -180; m < 180; m += 30) {
    var mer = [];
    for (var la = -90; la <= 90; la += 4) mer.push(at(la, m));
    grid.push(mer);
  }

  function draw() {
    ctx.clearRect(0, 0, S, H);
    var metal = '#b6c4d4', lw = Math.max(1.6, S * 0.013);

    // stand: a shadow, the base, the stem up to the ring
    var baseY = H - S * 0.04;
    ctx.fillStyle = 'rgba(34, 75, 119, .09)';
    ctx.beginPath(); ctx.ellipse(cx, baseY + S * 0.012, S * 0.2, S * 0.032, 0, 0, 2 * Math.PI); ctx.fill();
    var base = ctx.createLinearGradient(cx - S * 0.17, 0, cx + S * 0.17, 0);
    base.addColorStop(0, '#c4d0dd'); base.addColorStop(.45, '#e9eef4'); base.addColorStop(1, '#b4c3d3');
    ctx.fillStyle = base;
    ctx.beginPath(); ctx.ellipse(cx, baseY, S * 0.16, S * 0.028, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.lineCap = 'round';
    ctx.strokeStyle = metal; ctx.lineWidth = lw * 1.1;
    ctx.beginPath(); ctx.moveTo(cx, cy + RING); ctx.lineTo(cx, baseY - S * 0.012); ctx.stroke();

    // the sphere, lit from the upper left
    var body = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.05, cx, cy, R * 1.02);
    body.addColorStop(0, '#ffffff'); body.addColorStop(.55, '#eef3f9'); body.addColorStop(1, '#d3deea');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.fill();

    ctx.strokeStyle = 'rgba(48, 113, 181, .13)'; ctx.lineWidth = .7;
    for (var i = 0; i < grid.length; i++) line(grid[i]);

    // land: dots shrink and fade toward the rim; six shades, one path each
    var shades = [[], [], [], [], [], []], q = [0, 0, 0], r0 = S * 0.0062;
    for (var d = 0; d < dots.length; d++) {
      var dot = dots[d];
      project(dot[0], dot[1], dot[2], dot[3], q);
      if (q[2] > 0.02) shades[Math.min(5, Math.floor(q[2] * 6))].push(q[0], q[1], r0 * (0.45 + 0.55 * q[2]));
    }
    for (var s = 0; s < 6; s++) {
      var list = shades[s];
      if (!list.length) continue;
      ctx.fillStyle = 'rgba(48, 113, 181, ' + (0.22 + 0.7 * (s + 0.5) / 6).toFixed(2) + ')';
      ctx.beginPath();
      for (var j = 0; j < list.length; j += 3) {
        ctx.moveTo(list[j] + list[j + 2], list[j + 1]);
        ctx.arc(list[j], list[j + 1], list[j + 2], 0, 2 * Math.PI);
      }
      ctx.fill();
    }

    // rim shade and a soft highlight
    var rim = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R);
    rim.addColorStop(0, 'rgba(34, 75, 119, 0)'); rim.addColorStop(1, 'rgba(34, 75, 119, .13)');
    ctx.fillStyle = rim;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.fill();
    var hl = ctx.createRadialGradient(cx - R * 0.42, cy - R * 0.45, 0, cx - R * 0.42, cy - R * 0.45, R * 0.55);
    hl.addColorStop(0, 'rgba(255, 255, 255, .45)'); hl.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hl;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.fill();

    // visits: red, the recent ones orange; larger for more visits
    for (var v = 0; v < places.length; v++) {
      var pl = places[v];
      project(pl.cLat, pl.sLat, pl.sLng, pl.cLng, q);
      pl.x = q[0]; pl.y = q[1]; pl.z = q[2];
      if (q[2] <= 0.05) continue;
      var rad = (2 + Math.min(2.2, Math.log(pl.n + 1) / Math.LN10 * 0.9)) * (0.6 + 0.4 * q[2]);
      ctx.fillStyle = pl.recent ? 'rgba(230, 124, 70, .22)' : 'rgba(216, 94, 93, .2)';
      ctx.beginPath(); ctx.arc(q[0], q[1], rad * 2.3, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = pl.recent ? '#e67c46' : '#d85e5d';
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(q[0], q[1], rad, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    }

    // meridian ring: half a circle from the north pin round the right to the
    // south pin, passing the stem at the bottom
    ctx.strokeStyle = metal; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(cx, cy, RING, TILT - Math.PI / 2, TILT + Math.PI / 2); ctx.stroke();
    ctx.fillStyle = '#9fb1c4';
    for (var e = -1; e <= 1; e += 2) {
      ctx.beginPath(); ctx.arc(cx + e * st * RING, cy - e * ct * RING, lw * 0.95, 0, 2 * Math.PI); ctx.fill();
    }
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

  // Turning: about 30 frames a second, only while the globe is on screen and
  // not under the pointer.
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var onScreen = true, hovered = false, raf = 0, last = 0, drawn = 0;
  function running() { return !still && onScreen && !hovered && dots.length > 0; }
  function frame(t) {
    raf = 0;
    if (last) spin -= Math.min(100, t - last) * SPEED;   // the near side moves east, to the right
    last = t;
    if (t - drawn > 30) { draw(); drawn = t; }
    if (running()) raf = requestAnimationFrame(frame);
  }
  function play() {
    if (running() && !raf) { last = 0; raf = requestAnimationFrame(frame); }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; play(); }).observe(canvas);
  }

  canvas.addEventListener('mouseenter', function () { hovered = true; });
  canvas.addEventListener('mouseleave', function () { hovered = false; tip.hidden = true; play(); });
  canvas.addEventListener('mousemove', function (e) {
    var b = canvas.getBoundingClientRect(), mx = e.clientX - b.left, my = e.clientY - b.top;
    var best = null, bestD = 81;                  // within 9px
    places.forEach(function (pl) {
      var dd = (pl.x - mx) * (pl.x - mx) + (pl.y - my) * (pl.y - my);
      if (pl.z > 0.05 && dd < bestD) { bestD = dd; best = pl; }
    });
    tip.hidden = !best;
    if (best) {
      tip.textContent = best.title;
      // centered over the dot, but kept inside the window
      var half = tip.offsetWidth / 2, left = slot.getBoundingClientRect().left;
      var x = canvas.offsetLeft + best.x;
      x = Math.max(8 + half - left, Math.min(x, window.innerWidth - 8 - half - left));
      tip.style.left = x + 'px';
      tip.style.top = canvas.offsetTop + best.y + 'px';
    }
  });

  // land dots: a Fibonacci lattice on the sphere, kept where the mask is land
  var mask = new Image();
  mask.onload = function () {
    var c = document.createElement('canvas');
    c.width = mask.width; c.height = mask.height;
    var x = c.getContext('2d');
    x.drawImage(mask, 0, 0);
    var data = x.getImageData(0, 0, c.width, c.height).data;
    var n = 9000, golden = Math.PI * (3 - Math.sqrt(5));
    for (var k = 0; k < n; k++) {
      var y = 1 - 2 * (k + 0.5) / n, phi = Math.asin(y), lam = (k * golden) % (2 * Math.PI) - Math.PI;
      var px = Math.floor((lam / (2 * Math.PI) + 0.5) * c.width) % c.width;
      var py = Math.min(c.height - 1, Math.floor((0.5 - phi / Math.PI) * c.height));
      if (data[(py * c.width + px) * 4] > 127) dots.push([Math.cos(phi), y, Math.sin(lam), Math.cos(lam)]);
    }
    draw();
    play();
  };
  mask.src = foot.getAttribute('data-land');

  // The widget: so far below the window that it never starts its own animation
  // (see .visitor-globe__widget), but it still counts the visit and adds its
  // circles: x and y on a 900 x 440.7 Miller map (central meridian 11.5, the
  // bbox below), drawn 6 units low.
  var box = document.createElement('div');
  box.className = 'visitor-globe__widget';
  box.setAttribute('aria-hidden', 'true');
  var script = document.createElement('script');
  script.id = 'mmvst_globe';
  script.src = foot.getAttribute('data-src');
  box.appendChild(script);
  document.body.appendChild(box);

  function place(c) {
    var title = c.getAttribute('title') || '';
    var mx = -20004297.151525836 + c.getAttribute('cx') / 900 * 40030869.546275226;
    var my = -12671671.123330014 + (c.getAttribute('cy') - 6) / 440.70631074413296 * 19602063.148465134;
    var lng = mx / (6381372 * D2R) + 11.5;
    var phi = (Math.atan(Math.exp(-0.8 * my / 6381372)) - Math.PI / 4) / 0.4;
    var lam = (lng > 180 ? lng - 360 : lng) * D2R;
    return {
      title: title, n: parseInt(title, 10) || 1, recent: /\brecent\b/.test(title),
      cLat: Math.cos(phi), sLat: Math.sin(phi), sLng: Math.sin(lam), cLng: Math.cos(lam),
    };
  }
  var pending = 0;
  function readPlaces() {
    pending = 0;
    var group = box.querySelector('.svg_points');
    if (!group) return;
    places = Array.prototype.filter.call(group.querySelectorAll('circle'), function (c) {
      // mapmyvisitors parks the visits it cannot place in the southern ocean
      return !/Unknown Location/.test(c.getAttribute('title'));
    }).map(place);
    var stats = box.querySelector('#mmvst_a');
    if (stats && /\/web\//.test(stats.getAttribute('href'))) link.href = stats.href;
    if (!raf && dots.length) draw();
  }
  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (!pending) pending = requestAnimationFrame(readPlaces);
    }).observe(box, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  }
})();

/* Total views in the footer: busuanzi fills #busuanzi_value_site_pv with a plain
   number. Show the line only once the number has arrived (if the counter service
   is down it stays hidden), with thousands separators. */
(function () {
  var box = document.querySelector('.site-views');
  if (!box) return;
  var values = box.querySelectorAll('[id^="busuanzi_value_"]');

  function update() {
    var ready = true;
    Array.prototype.forEach.call(values, function (el) {
      var n = parseInt(el.textContent.replace(/[^\d]/g, ''), 10);
      if (isNaN(n)) { ready = false; return; }
      var text = n.toLocaleString('en-US');
      if (el.textContent !== text) el.textContent = text;
    });
    if (ready) box.hidden = false;
    return ready;
  }

  if (update() || !window.MutationObserver) return;
  var observer = new MutationObserver(function () {
    if (update()) observer.disconnect();
  });
  Array.prototype.forEach.call(values, function (el) {
    observer.observe(el, { childList: true, characterData: true, subtree: true });
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
    '.news-card, .pub-card, .pub-toolbar, .pub-list, .edu-card, .info-card'
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

  var fold = window.innerHeight;
  Array.prototype.forEach.call(blocks, function (el) {
    if (el.getBoundingClientRect().top > fold) {
      el.classList.add('rise');
      observer.observe(el);
    }
  });
})();
