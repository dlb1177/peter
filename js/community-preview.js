/**
 * Church of St. Peter - Community Life preview (home page)
 *
 * Renders a small preview of parish events into #community-preview on the home
 * page: up to three events, upcoming soonest-first, then filling any remaining
 * slots with the most recent past events. Reuses the same Firebase fetch, sort,
 * and formatting helpers as the full Community Life grid (js/community.js).
 *
 * Loaded as an ES module. Links point into pages/ because the home page lives at
 * the site root. Before Firebase is configured (or if there are no events), a
 * friendly placeholder is shown instead.
 */
import { fetchEvents, sortForGrid, parseDate, fmtDate, escapeHtml } from './community.js';
import { isFirebaseConfigured } from './firebase-config.js';

const PREVIEW_COUNT = 3;

function cardHtml(item, index) {
  const e = item.e;
  const href = 'pages/community-event.html?id=' + encodeURIComponent(e.id);
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

function render(container, events) {
  // sortForGrid lists upcoming events soonest-first, then past events
  // most-recent-first — so the first three are exactly what we want to preview.
  const items = sortForGrid(events).slice(0, PREVIEW_COUNT);
  container.innerHTML = items.length
    ? items.map(cardHtml).join('')
    : '<p class="cl-empty">New parish events are coming soon — please check back shortly!</p>';
}

function init() {
  const container = document.getElementById('community-preview');
  if (!container) return;

  if (!isFirebaseConfigured()) {
    container.innerHTML = '<p class="cl-empty">Community Life events are coming soon — please check back shortly!</p>';
    return;
  }

  fetchEvents().then(function (events) {
    render(container, events);
  }).catch(function (err) {
    if (window.console) console.error('Community Life preview load error:', err);
    container.innerHTML = '<p class="cl-empty">Please check back soon for upcoming parish events.</p>';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
