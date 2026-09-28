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

/* Nav: the link of the section currently in view turns orange (.is-current).
   A section counts as current once its title has scrolled up past the pill;
   at the very bottom of the page the last section wins. */
(function () {
  var items = [];
  Array.prototype.forEach.call(document.querySelectorAll('#site-nav a[href*="#"]'), function (a) {
    if (a.parentNode.classList.contains('masthead__menu-home-item')) return;
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

/* All Publications: tabs + topic filter.
   Inside .pub-tabs, each `### Title` heading and the .pub-list after it become one
   tab and its panel. List items carry their topics as data-topics="agent robotics"
   (kramdown `- {: data-topics="…"}`); a paper may have several. The topic chips
   filter whichever tab is showing and keep their choice when the tab changes.
   Without this script both lists simply show under their headings. */
(function () {
  var box = document.querySelector('.pub-tabs');
  if (!box) return;

  var TOPICS = [
    ['agent', '🤖 Agent'],
    ['robotics', '🦾 Robotics'],
    ['multimedia', '🖼️ Multimedia'],
  ];

  var toolbar = document.createElement('div');
  toolbar.className = 'pub-toolbar';
  var tablist = document.createElement('div');
  tablist.className = 'pub-tablist';
  tablist.setAttribute('role', 'tablist');
  toolbar.appendChild(tablist);

  var tabs = [], panels = [];
  Array.prototype.forEach.call(box.querySelectorAll('h3'), function (heading, i) {
    var panel = heading.nextElementSibling;
    while (panel && !panel.classList.contains('pub-list')) panel = panel.nextElementSibling;
    if (!panel) return;

    var tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'pub-tab';
    tab.id = 'pub-tab-' + i;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'pub-panel-' + i);
    Array.prototype.forEach.call(heading.childNodes, function (node) {
      tab.appendChild(node.cloneNode(true));
    });

    panel.id = 'pub-panel-' + i;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    var empty = document.createElement('p');
    empty.className = 'pub-empty';
    empty.textContent = 'No papers under this topic yet.';
    empty.hidden = true;
    panel.appendChild(empty);
    heading.hidden = true;

    tablist.appendChild(tab);
    tabs.push(tab);
    panels.push(panel);
  });
  if (!tabs.length) return;

  // topic chips: "All" plus every topic that at least one paper uses
  var used = {};
  Array.prototype.forEach.call(box.querySelectorAll('.pub-list li[data-topics]'), function (li) {
    li.getAttribute('data-topics').split(/\s+/).forEach(function (t) { used[t] = true; });
  });
  var filter = document.createElement('div');
  filter.className = 'pub-filter';
  filter.setAttribute('role', 'group');
  filter.setAttribute('aria-label', 'Filter by topic');
  var chips = [];
  [['all', 'All']].concat(TOPICS.filter(function (t) { return used[t[0]]; })).forEach(function (t) {
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'pub-chip';
    chip.setAttribute('data-topic', t[0]);
    chip.textContent = t[1];
    filter.appendChild(chip);
    chips.push(chip);
  });
  toolbar.appendChild(filter);

  var current = 'all';
  function applyFilter() {
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', c.getAttribute('data-topic') === current ? 'true' : 'false');
    });
    panels.forEach(function (panel) {
      var shown = 0;
      Array.prototype.forEach.call(panel.querySelectorAll('li'), function (li) {
        var topics = (li.getAttribute('data-topics') || '').split(/\s+/);
        var on = current === 'all' || topics.indexOf(current) >= 0;
        li.hidden = !on;
        if (on) shown++;
      });
      panel.querySelector('.pub-empty').hidden = shown > 0;
    });
  }

  function select(k, focus) {
    tabs.forEach(function (tab, i) {
      var on = i === k;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    if (focus) tabs[k].focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(i); });
    tab.addEventListener('keydown', function (e) {
      var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      select((i + step + tabs.length) % tabs.length, true);
    });
  });
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      current = chip.getAttribute('data-topic');
      applyFilter();
    });
  });

  box.insertBefore(toolbar, box.firstChild);
  select(0);
  applyFilter();
})();

/* Site statistics under the map: busuanzi fills #busuanzi_value_site_pv and
   #busuanzi_value_site_uv with plain numbers. Show the block only once a number
   has arrived (if the counter service is down it stays hidden), with thousands
   separators. */
(function () {
  var box = document.querySelector('.site-stats');
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
