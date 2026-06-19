/**
 * Church of St. Peter - Community Life (public site)
 *
 * Loaded as an ES module by community-life.html (the grid) and
 * community-event.html (the detail page). Events are read from Firebase
 * Firestore. The pasted "embed code" for an event is rendered on its detail
 * page. Before Firebase is configured, the pages show a friendly placeholder.
 */
import { firebaseConfig, isFirebaseConfigured, FIREBASE_VERSION } from './firebase-config.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/* ---------- helpers ---------- */

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function parseDate(str) {
  if (!str) return null;
  const m = String(str).slice(0, 10).split('-');
  if (m.length < 3) return null;
  const d = new Date(Number(m[0]), Number(m[1]) - 1, Number(m[2]));
  return isNaN(d.getTime()) ? null : d;
}

function fmtDate(d) {
  return d ? MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() : '';
}

function eventStatus(ev) {
  const ref = parseDate(ev.date);
  if (!ref) return 'upcoming';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return ref.getTime() >= today.getTime() ? 'upcoming' : 'past';
}

// Markup inserted via innerHTML does not run <script> tags. Pasted embed codes
// (Canva, X, Instagram, etc.) often rely on a script, so we re-create them so
// they execute. Content is authored only by password-authenticated staff.
function activateEmbed(container, html) {
  container.innerHTML = html || '';
  container.querySelectorAll('script').forEach(function (oldScript) {
    const s = document.createElement('script');
    for (const attr of oldScript.attributes) s.setAttribute(attr.name, attr.value);
    s.textContent = oldScript.textContent;
    oldScript.parentNode.replaceChild(s, oldScript);
  });
}

/* ---------- data ---------- */

let _dbPromise = null;
function getDb() {
  if (!_dbPromise) {
    const base = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION;
    _dbPromise = Promise.all([
      import(base + '/firebase-app.js'),
      import(base + '/firebase-firestore.js')
    ]).then(function (mods) {
      const appMod = mods[0], fs = mods[1];
      const app = appMod.initializeApp(firebaseConfig);
      return { db: fs.getFirestore(app), fs: fs };
    });
  }
  return _dbPromise;
}

function fetchEvents() {
  return getDb().then(function (ctx) {
    return ctx.fs.getDocs(ctx.fs.collection(ctx.db, 'events')).then(function (snap) {
      const list = [];
      snap.forEach(function (d) { list.push(Object.assign({ id: d.id }, d.data())); });
      return list;
    });
  });
}

/* ---------- grid page ---------- */

function sortForGrid(events) {
  return events.map(function (e) {
    return { e: e, status: eventStatus(e), d: parseDate(e.date) };
  }).sort(function (a, b) {
    if (a.status !== b.status) return a.status === 'upcoming' ? -1 : 1;
    const at = a.d ? a.d.getTime() : 0, bt = b.d ? b.d.getTime() : 0;
    return a.status === 'upcoming' ? at - bt : bt - at; // soonest upcoming first; most recent past first
  });
}

function cardHtml(item, index) {
  const e = item.e;
  const href = 'community-event.html?id=' + encodeURIComponent(e.id);
  const dateText = fmtDate(parseDate(e.date));
  return '' +
    '<article class="cl-card cl-reveal" style="animation-delay:' + (index * 0.05).toFixed(2) + 's">' +
      '<div class="cl-card-top">' +
        (dateText ? '<span class="cl-date">' + escapeHtml(dateText) + '</span>' : '<span></span>') +
        '<span class="cl-status ' + item.status + '">' + (item.status === 'upcoming' ? 'Upcoming' : 'Past') + '</span>' +
      '</div>' +
      '<h3><a href="' + href + '">' + escapeHtml(e.title) + '</a></h3>' +
      (e.time ? '<div class="cl-time"><i class="fa-solid fa-clock"></i>' + escapeHtml(e.time) + '</div>' : '') +
      (e.description ? '<p class="cl-summary">' + escapeHtml(e.description) + '</p>' : '<p class="cl-summary"></p>') +
      '<div class="cl-card-actions"><a class="cl-viewpage" href="' + href + '">View Event</a></div>' +
    '</article>';
}

function renderGrid(container, events) {
  const filterBar = document.getElementById('community-filters');
  const state = { filter: 'upcoming' };

  function draw() {
    const items = sortForGrid(events).filter(function (it) {
      return state.filter === 'all' ? true : it.status === state.filter;
    });
    container.innerHTML = items.length
      ? items.map(cardHtml).join('')
      : '<p class="cl-empty">No ' + (state.filter === 'all' ? '' : state.filter + ' ') +
        'events to show right now. Please check back soon!</p>';
  }

  if (filterBar) {
    filterBar.addEventListener('click', function (ev) {
      const btn = ev.target.closest('.cl-filter');
      if (!btn) return;
      state.filter = btn.getAttribute('data-filter');
      filterBar.querySelectorAll('.cl-filter').forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      draw();
    });
  }
  draw();
}

/* ---------- detail page ---------- */

function renderDetail(container, events) {
  const id = new URLSearchParams(window.location.search).get('id');
  const ev = events.filter(function (e) { return e.id === id; })[0];

  if (!ev) {
    container.innerHTML = '<div class="cl-event-body" style="text-align:center;">' +
      '<h1 style="font-family:Cinzel,serif;color:#0d212a;margin-bottom:1rem;">Event not found</h1>' +
      '<p style="color:#4c4c4c;margin-bottom:1.5rem;">We couldn\'t find that event. It may have been removed.</p>' +
      '<a class="cl-viewpage" href="community-life.html">Back to Community Life</a></div>';
    document.title = 'Event Not Found | Church of St. Peter';
    return;
  }

  document.title = ev.title + ' | Church of St. Peter - Mendota, MN';
  const dateText = fmtDate(parseDate(ev.date));
  const meta = [];
  if (dateText) meta.push('<span><i class="fa-solid fa-calendar-day"></i>' + escapeHtml(dateText) + '</span>');
  if (ev.time) meta.push('<span><i class="fa-solid fa-clock"></i>' + escapeHtml(ev.time) + '</span>');

  container.innerHTML = '' +
    '<header class="cl-event-hero"><div class="cl-event-hero-inner cl-reveal">' +
      '<span class="cl-tag">Community Life</span>' +
      '<h1>' + escapeHtml(ev.title) + '</h1>' +
      (meta.length ? '<div class="cl-event-meta">' + meta.join('') + '</div>' : '') +
    '</div></header>' +
    '<div class="cl-event-body cl-reveal">' +
      (ev.description ? '<p class="cl-event-desc">' + escapeHtml(ev.description) + '</p>' : '') +
      '<div class="cl-embed" id="cl-embed-target"></div>' +
      '<a class="cl-back" href="community-life.html">&larr; Back to Community Life</a>' +
    '</div>';

  if (ev.embed && ev.embed.trim()) {
    activateEmbed(document.getElementById('cl-embed-target'), ev.embed);
  }
}

/* ---------- placeholder / error states ---------- */

function placeholder(grid, detail, msg) {
  const html = '<p class="cl-empty">' + msg + '</p>';
  if (grid) grid.innerHTML = html;
  if (detail) detail.innerHTML = '<div class="cl-event-body">' + html + '</div>';
}

/* ---------- boot ---------- */

function init() {
  const grid = document.getElementById('community-grid');
  const detail = document.getElementById('community-detail');
  if (!grid && !detail) return;

  if (!isFirebaseConfigured()) {
    placeholder(grid, detail, 'Community Life events are coming soon — please check back shortly!');
    return;
  }

  fetchEvents().then(function (events) {
    if (grid) renderGrid(grid, events);
    if (detail) renderDetail(detail, events);
  }).catch(function (err) {
    if (window.console) console.error('Community Life load error:', err);
    placeholder(grid, detail, 'Sorry — we couldn\'t load events right now. Please try again later.');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
