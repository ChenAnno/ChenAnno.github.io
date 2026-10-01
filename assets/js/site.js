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
    var y = window.pageYOffset, last = sections.length - 1;
    var end = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    // the scroll position at which each section begins
    var starts = sections.map(function (s, i) { return i ? s.title.getBoundingClientRect().top + y - LINE : 0; });
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

/* Sidebar on wide screens: sticky, with the photo AIR from the top of the window
   (level with the first section title). The user wanted the photo high up and
   about as much room under the outline as above the photo (a little more is
   fine): spare height first adds up to BELOW under the outline, then goes
   between the name and the profile and between the profile and the outline
   (1 : 3, at most 140px together, via --gap-* in CSS; not between photo and
   name, which looked too far apart), and only the rest above and below.
   Without room for AIR above and below, the sidebar is centered; if it does
   not fit at all, it scrolls until its end shows, then sticks. */
(function () {
  var sidebar = document.querySelector('.sidebar.sticky');
  var avatar = sidebar && sidebar.querySelector('.author__avatar img');
  var nav = sidebar && sidebar.querySelector('.side-nav');
  if (!avatar || !nav) return;
  var wide = window.matchMedia('(min-width: 925px)');
  var AIR = 56, BELOW = 24, GAPS = ['--gap-profile', '--gap-nav'], SHARES = [0.25, 0.75];

  function layout() {
    GAPS.forEach(function (name) { sidebar.style.setProperty(name, '0px'); });
    if (!wide.matches) {
      sidebar.style.top = '';
      GAPS.forEach(function (name) { sidebar.style.removeProperty(name); });
      return;
    }
    var h = window.innerHeight;
    var column = nav.getBoundingClientRect().bottom - avatar.getBoundingClientRect().top;
    var spare = h - 2 * AIR - column;
    if (spare < 0) {
      var top = Math.floor((h - column) / 2);
      sidebar.style.top = (top >= 16 ? top : Math.floor(h - column - 16)) + 'px';
      return;
    }
    spare -= Math.min(spare, BELOW);
    var spread = Math.min(140, spare);
    GAPS.forEach(function (name, i) { sidebar.style.setProperty(name, spread * SHARES[i] + 'px'); });
    sidebar.style.top = AIR + Math.floor((spare - spread) / 2) + 'px';
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

  var fold = window.innerHeight;
  Array.prototype.forEach.call(blocks, function (el) {
    if (el.getBoundingClientRect().top > fold) {
      el.classList.add('rise');
      observer.observe(el);
    }
  });
})();
