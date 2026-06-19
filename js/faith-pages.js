/**
 * Church of St. Peter - Faith Formation pages (public renderer)
 *
 * Each Faith Life page (catechesis-good-shepherd, youth-formation,
 * adult-formation, small-groups) is a thin shell containing
 * `<div id="faith-page" data-page="<key>">`. This module renders that page
 * from data:
 *   1. the live version saved in Firebase (collection `pages`, doc = key), or
 *   2. the baked-in default in faith-pages-defaults.js (so the page always
 *      looks like it does today, even before anyone edits it or sets up Firebase).
 *
 * The same default content pre-fills the admin editor, so staff edit from the
 * current page rather than a blank slate.
 */
import { firebaseConfig, isFirebaseConfigured, FIREBASE_VERSION } from './firebase-config.js';
import { FAITH_DEFAULTS } from './faith-pages-defaults.js';

/* ---------- helpers ---------- */

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function isExternal(u) { return /^https?:/i.test(u || ''); }
function resolveAsset(p) {
  if (!p) return '';
  if (/^https?:\/\//i.test(p) || p.indexOf('data:') === 0) return p;
  return '../' + String(p).replace(/^\/+/, '');
}
function extAttr(u) { return isExternal(u) ? ' target="_blank" rel="noopener"' : ''; }

// Tiny markdown: paragraphs, "## " subheadings, "- " lists, **bold**, *italic*, [text](url).
function mdInline(s) {
  s = escapeHtml(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => '<a href="' + u + '"' + extAttr(u) + '>' + t + '</a>');
  return s;
}
function mdToHtml(md) {
  if (!md) return '';
  return String(md).split(/\n\s*\n/).map((b) => {
    const lines = b.split('\n');
    if (lines.length && lines.every((l) => /^\s*-\s+/.test(l))) {
      return '<ul>' + lines.map((l) => '<li>' + mdInline(l.replace(/^\s*-\s+/, '')) + '</li>').join('') + '</ul>';
    }
    if (/^\s*##\s+/.test(lines[0])) {
      return '<h3>' + mdInline(lines[0].replace(/^\s*##\s+/, '')) + '</h3>';
    }
    return '<p>' + mdInline(b.replace(/\n/g, ' ')) + '</p>';
  }).join('');
}

/* ---------- block rendering ---------- */

function blockHtml(b) {
  if (!b || !b.type) return '';
  switch (b.type) {
    case 'heading':
      return '<h2 class="fp-heading fp-reveal">' + escapeHtml(b.text || '') + '</h2>';
    case 'text':
      return '<div class="fp-block fp-text fp-reveal">' + mdToHtml(b.body) + '</div>';
    case 'image': {
      const src = resolveAsset(b.src);
      if (!src) return '';
      const c = b.width === 'centered' ? ' centered' : '';
      return '<figure class="fp-block fp-image' + c + ' fp-reveal"><img src="' + src + '" alt="' + escapeHtml(b.caption || '') + '" loading="lazy">' +
        (b.caption ? '<figcaption>' + escapeHtml(b.caption) + '</figcaption>' : '') + '</figure>';
    }
    case 'button': {
      if (!b.url) return '';
      const st = b.style === 'outline' ? 'outline' : 'primary';
      return '<div class="fp-block fp-btn-row fp-reveal"><a class="fp-btn ' + st + '" href="' + escapeHtml(b.url) + '"' + extAttr(b.url) + '>' +
        escapeHtml(b.label || 'Learn More') + '</a></div>';
    }
    case 'quote':
      return '<blockquote class="fp-block fp-quote fp-reveal"><p>' + escapeHtml(b.text || '') + '</p>' +
        (b.attribution ? '<cite>' + escapeHtml(b.attribution) + '</cite>' : '') + '</blockquote>';
    case 'cards': {
      const items = (b.items || []).map((it) => {
        const link = it.linkUrl
          ? '<a class="fp-card-link" href="' + escapeHtml(it.linkUrl) + '"' + extAttr(it.linkUrl) + '>' + escapeHtml(it.linkLabel || 'Learn More') + ' &rarr;</a>'
          : '';
        return '<div class="fp-card">' +
          (it.subtitle ? '<div class="fp-card-sub">' + escapeHtml(it.subtitle) + '</div>' : '') +
          '<h3>' + escapeHtml(it.title || '') + '</h3>' +
          (it.body ? '<div class="fp-card-body">' + mdToHtml(it.body) + '</div>' : '') +
          link + '</div>';
      }).join('');
      return '<div class="fp-block fp-cards fp-reveal">' + items + '</div>';
    }
    case 'callout': {
      const st = (b.style === 'navy' || b.style === 'red') ? b.style : 'gold';
      const link = b.linkUrl
        ? '<a class="fp-callout-link" href="' + escapeHtml(b.linkUrl) + '"' + extAttr(b.linkUrl) + '>' + escapeHtml(b.linkLabel || 'Learn More') + ' &rarr;</a>'
        : '';
      return '<div class="fp-block fp-callout ' + st + ' fp-reveal">' +
        (b.title ? '<h4>' + escapeHtml(b.title) + '</h4>' : '') +
        (b.body ? mdToHtml(b.body) : '') + link + '</div>';
    }
    case 'links': {
      const items = (b.items || []).map((it) =>
        '<li><a href="' + escapeHtml(it.url || '#') + '"' + extAttr(it.url) + '>' + escapeHtml(it.label || '') + '</a></li>'
      ).join('');
      return '<div class="fp-block fp-links fp-reveal">' + (b.title ? '<h4>' + escapeHtml(b.title) + '</h4>' : '') + '<ul>' + items + '</ul></div>';
    }
    case 'contact': {
      const cl = [];
      if (b.email) cl.push('<a href="mailto:' + escapeHtml(b.email) + '">' + escapeHtml(b.email) + '</a>');
      if (b.phone) cl.push(escapeHtml(b.phone));
      return '<div class="fp-block fp-contact fp-reveal">' +
        (b.name ? '<p class="fp-contact-name">' + escapeHtml(b.name) + '</p>' : '') +
        (b.role ? '<p class="fp-contact-role">' + escapeHtml(b.role) + '</p>' : '') +
        (cl.length ? '<p class="fp-contact-line">' + cl.join(' &middot; ') + '</p>' : '') +
        (b.note ? '<p class="fp-contact-note">' + escapeHtml(b.note) + '</p>' : '') + '</div>';
    }
    default:
      return '';
  }
}

function render(host, page) {
  if (!page) {
    host.innerHTML = '<div class="fp-container"><p class="fp-empty">This page has no content yet.</p></div>';
    return;
  }
  document.title = (page.title || 'Faith Formation') + ' | Church of St. Peter - Mendota, MN';
  const variant = page.heroVariant === 'navy' ? 'navy' : 'light';
  const hero = '<header class="fp-hero ' + variant + ' fp-reveal">' +
    (page.eyebrow ? '<p class="fp-eyebrow">' + escapeHtml(page.eyebrow) + '</p>' : '') +
    '<h1 class="fp-title">' + escapeHtml(page.title || '') + '</h1>' +
    (page.intro ? '<p class="fp-intro">' + escapeHtml(page.intro) + '</p>' : '') +
    '</header>';
  const body = '<div class="fp-container">' + (page.blocks || []).map(blockHtml).join('') + '</div>';
  host.innerHTML = hero + body;
}

/* ---------- data ---------- */

let _dbPromise = null;
function getDb() {
  if (!_dbPromise) {
    const base = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION;
    _dbPromise = Promise.all([
      import(base + '/firebase-app.js'),
      import(base + '/firebase-firestore.js')
    ]).then((m) => {
      const app = m[0].initializeApp(firebaseConfig);
      return { db: m[1].getFirestore(app), fs: m[1] };
    });
  }
  return _dbPromise;
}
function fetchPage(key) {
  return getDb().then((c) => c.fs.getDoc(c.fs.doc(c.db, 'pages', key)).then((snap) => (snap.exists() ? snap.data() : null)));
}

/* ---------- boot ---------- */

function init() {
  const host = document.getElementById('faith-page');
  if (!host) return;
  const key = host.getAttribute('data-page');
  const fallback = FAITH_DEFAULTS[key] || null;

  if (!isFirebaseConfigured()) { render(host, fallback); return; }

  fetchPage(key)
    .then((data) => render(host, data || fallback))
    .catch((err) => { if (window.console) console.warn('Faith page load fell back to default:', err); render(host, fallback); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
