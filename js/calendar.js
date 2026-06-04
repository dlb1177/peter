/**
 * Church of St. Peter - Calendar Embed Controller
 * ----------------------------------------------------------------------------
 * The parish calendar is hosted by an external provider (ParishSoft). This
 * module is responsible for dropping that calendar into the page.
 *
 *   - If a calendar embed URL is configured (SITE_CONFIG.calendar.parishSoftEmbedUrl),
 *     it renders the provider's calendar in a responsive iframe.
 *   - If no URL is configured yet, it renders a styled "calendar coming soon"
 *     placeholder so staff can preview the layout before the embed is live.
 *
 * Public API:
 *   CalendarEmbed.renderFull(containerId)      Large calendar (events page)
 *   CalendarEmbed.renderUpcoming(containerId)  Compact card (home page)
 *   CalendarEmbed.getFullCalendarUrl()         Best link to the full calendar
 */
(function () {
  'use strict';

  function getConfig() {
    var cfg = (window.SITE_CONFIG && window.SITE_CONFIG.calendar) || {};
    return {
      embedUrl: (cfg.parishSoftEmbedUrl || '').trim(),
      fullUrl: (cfg.fullCalendarUrl || '').trim()
    };
  }

  function el(id) {
    return document.getElementById(id);
  }

  /**
   * Responsive iframe for the configured provider calendar.
   */
  function buildIframe(url, minHeight) {
    return (
      '<div class="calendar-embed-frame" style="position:relative;width:100%;min-height:' +
      minHeight +
      'px;">' +
      '<iframe src="' + url + '" title="Church of St. Peter parish calendar" ' +
      'loading="lazy" ' +
      'style="width:100%;min-height:' + minHeight + 'px;border:0;display:block;" ' +
      'allowfullscreen></iframe>' +
      '</div>'
    );
  }

  /**
   * Decorative skeleton month grid used behind the placeholder message.
   */
  function buildSkeletonGrid() {
    var cells = '';
    for (var i = 0; i < 35; i++) {
      cells +=
        '<div style="background:#fff;border:1px solid #eef0f2;border-radius:6px;height:64px;padding:6px;">' +
        '<div style="width:18px;height:10px;background:#eef0f2;border-radius:3px;"></div>' +
        (i % 5 === 2
          ? '<div style="margin-top:10px;width:80%;height:8px;background:#f0ead9;border-radius:3px;"></div>'
          : '') +
        (i % 7 === 4
          ? '<div style="margin-top:6px;width:60%;height:8px;background:#e8ecf1;border-radius:3px;"></div>'
          : '') +
        '</div>';
    }
    var dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      .map(function (d) {
        return (
          '<div style="text-align:center;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9aa3ab;padding-bottom:6px;">' +
          d +
          '</div>'
        );
      })
      .join('');
    return (
      '<div aria-hidden="true" style="filter:blur(1px);opacity:.6;">' +
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">' +
      dows +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:4px;">' +
      cells +
      '</div>' +
      '</div>'
    );
  }

  /**
   * Full "coming soon" placeholder for the events page.
   */
  function buildFullPlaceholder() {
    return (
      '<div class="calendar-placeholder" style="position:relative;overflow:hidden;">' +
      buildSkeletonGrid() +
      '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(to bottom,rgba(249,247,242,.55),rgba(249,247,242,.92));">' +
      '<div style="text-align:center;max-width:480px;padding:2rem;">' +
      '<div style="width:64px;height:64px;border-radius:9999px;background:#0d212a;color:#c5a059;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;font-size:1.5rem;">' +
      '<i class="fa-regular fa-calendar"></i></div>' +
      '<h3 style="font-family:\'Cinzel\',serif;color:#0d212a;font-size:1.5rem;margin-bottom:.5rem;">Parish Calendar Coming Soon</h3>' +
      '<p style="color:#4c4c4c;line-height:1.6;">Our live calendar is being connected through ParishSoft. ' +
      'Once it’s ready, Mass times, events, and parish happenings will appear right here.</p>' +
      '<p style="color:#9aa3ab;font-size:.8rem;margin-top:1rem;">In the meantime, please call the parish office at ' +
      '<a href="tel:6514524550" style="color:#c5a059;font-weight:700;">(651) 452-4550</a> with questions.</p>' +
      '</div></div></div>'
    );
  }

  /**
   * Compact "coming soon" card for the home page upcoming-events slot.
   */
  function buildUpcomingPlaceholder() {
    return (
      '<div class="calendar-upcoming-placeholder" style="text-align:center;padding:3rem 1.5rem;border:1px dashed #d8d2c2;border-radius:12px;background:#fff;">' +
      '<div style="width:56px;height:56px;border-radius:9999px;background:#f9f6ed;color:#c5a059;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.4rem;">' +
      '<i class="fa-regular fa-calendar-check"></i></div>' +
      '<h3 style="font-family:\'Cinzel\',serif;color:#0d212a;font-size:1.25rem;margin-bottom:.4rem;">Upcoming Events Coming Soon</h3>' +
      '<p style="color:#4c4c4c;max-width:32rem;margin:0 auto;line-height:1.6;">' +
      'Our parish calendar is being connected through ParishSoft. This space will automatically show the week’s events once it’s live.</p>' +
      '</div>'
    );
  }

  var CalendarEmbed = {
    /**
     * Render the large calendar (events page).
     */
    renderFull: function (containerId) {
      var container = el(containerId);
      if (!container) return;
      var cfg = getConfig();
      container.innerHTML = cfg.embedUrl
        ? buildIframe(cfg.embedUrl, 900)
        : buildFullPlaceholder();
    },

    /**
     * Render the compact upcoming card (home page).
     */
    renderUpcoming: function (containerId) {
      var container = el(containerId);
      if (!container) return;
      var cfg = getConfig();
      container.innerHTML = cfg.embedUrl
        ? buildIframe(cfg.embedUrl, 520)
        : buildUpcomingPlaceholder();
    },

    /**
     * Best available link to the full calendar:
     *   configured full URL > configured embed URL > on-site events page.
     */
    getFullCalendarUrl: function (fallback) {
      var cfg = getConfig();
      return cfg.fullUrl || cfg.embedUrl || fallback || 'pages/events.html';
    },

    /** True once a real provider embed has been configured. */
    isConfigured: function () {
      return !!getConfig().embedUrl;
    }
  };

  window.CalendarEmbed = CalendarEmbed;
})();
