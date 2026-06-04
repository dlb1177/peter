/**
 * Church of St. Peter - Site Configuration
 * ----------------------------------------------------------------------------
 * This is the one place non-developers should need to edit. Change the values
 * below and the rest of the site picks them up automatically.
 *
 * Loaded on every page BEFORE the other scripts.
 */
(function () {
  'use strict';

  window.SITE_CONFIG = {
    /* ----------------------------------------------------------------------
     * CALENDAR
     * --------------------------------------------------------------------
     * The parish calendar is hosted by an external provider (ParishSoft).
     *
     *   parishSoftEmbedUrl  The "embed" / iframe URL from the ParishSoft
     *                       calendar. Until this is filled in, the site shows
     *                       a styled "calendar coming soon" placeholder so
     *                       staff can preview where the calendar will appear.
     *
     *   fullCalendarUrl     Optional public link to the full calendar (used by
     *                       "View Full Calendar" buttons). Falls back to the
     *                       on-site events page when blank.
     */
    calendar: {
      parishSoftEmbedUrl: '',
      fullCalendarUrl: ''
    },

    /* ----------------------------------------------------------------------
     * FORMS
     * --------------------------------------------------------------------
     * Form submissions (Contact, New Parishioner, Baptism Registration) are
     * delivered by Web3Forms (https://web3forms.com) so the static site does
     * not need its own mail server.
     *
     *   accessKey   Your Web3Forms access key.
     *               1. Go to https://web3forms.com and enter the email that
     *                  should RECEIVE submissions (see the tip below).
     *               2. Paste the access key you receive here.
     *               Until this is set, forms show a friendly "not yet
     *               configured" message instead of failing silently — they
     *               never lose a submission quietly.
     *
     *   proPlan     Set to true ONLY if this Web3Forms account is on a paid
     *               (PRO) plan. CC'ing extra recipients is a PRO feature — if
     *               you send the CC list on a FREE plan, Web3Forms REJECTS the
     *               whole submission. So we only send the CC list when this is
     *               true. Leave false on the free plan.
     *
     *   recipients  Additional email addresses to copy (CC) on every
     *               submission. Editable here on the fly. ONLY used when
     *               proPlan is true (see above).
     *
     *   TIP — editable recipient list for FREE (no PRO needed): sign up for the
     *   access key using a shared parish distribution list / Google Group
     *   address (e.g. "web-inquiries@stpetersmendota.org"). Then office staff
     *   add or remove who gets the emails from their email admin — no code
     *   changes. On the free plan, mail goes only to the access-key address.
     */
    forms: {
      accessKey: '27774fac-c991-4367-a91e-f737d3ed0ffa',
      proPlan: false,
      recipients: [
        'church@stpetersmendota.org'
      ]
    }
  };
})();
