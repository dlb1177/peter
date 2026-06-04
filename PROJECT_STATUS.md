# Project Status & Handoff

> Living document. Update it as work progresses so any new work session (or new
> collaborator) can pick up without losing context.
>
> **Last updated:** 2026-06-04

## What this is

Marketing/informational website for the **Church of St. Peter** (Mendota, MN).
Static, multi-page HTML site — no build step. Styled with Tailwind (currently via
CDN) plus hand-written CSS. Nav and footer are injected by JS from a single
source so they only need editing in one place.

- **Repo:** https://github.com/dlb1177/peter (branch: `main`)
- **Run locally:** `python3 -m http.server 8000` then open http://localhost:8000
  (serve it — don't open files directly, though forms do also work from `file://`).
- **Architecture details:** see `README.md`.

## The one file to know: `js/config.js`

Site-wide settings live here so you don't have to dig through markup:

- `calendar.parishSoftEmbedUrl` — **currently blank.** When ParishSoft is ready,
  paste the embed URL here and the home + events pages swap from placeholder to a
  live calendar automatically.
- `forms.accessKey` — **set** (Web3Forms key `27774fac-…`). Delivers all form
  submissions.
- `forms.proPlan` — `false`. Keep false on the free plan (sending the CC list on
  free makes Web3Forms reject the submission).
- `forms.recipients` — extra CC addresses; only used when `proPlan` is `true`.

## Done so far (chronological)

1. **Repo stabilized** — added `.gitignore` + `README.md`; removed `.DS_Store`,
   a 225 KB backup HTML, and a stray duplicate; deleted the obsolete localStorage
   `admin.html` page and its footer link.
2. **Assets localized** — the four watercolor images now live in `assets/` and are
   referenced locally (were hosted on a personal CPA domain).
3. **Calendar re-architected** — replaced the localStorage calendar engine with a
   `CalendarEmbed` controller (`js/calendar.js`). Shows a styled "coming soon"
   placeholder until the ParishSoft embed URL is configured. Wired into the home
   page and `pages/events.html`.
4. **Forms working** — contact, new-parishioner, and baptism all submit via a
   shared Web3Forms handler in `js/components.js` (`initParishForms`):
   - JSON API (clean CORS), honeypot spam field, reply-to set to the submitter.
   - Graceful "not set up yet" message if no key — never fails silently.
   - Fixed the baptism form, which had ~17 fields with no `name` (submitted blank).
   - Field names rewritten to **human-readable labels** (Web3Forms uses them as
     the email labels). Sacrament checkboxes aggregate to one line; empty optional
     fields are skipped so emails stay clean.
   - **Verified end-to-end** in a headless browser (all three return HTTP 200 and
     show the Thank-You confirmation panel).

## Outstanding / next steps (roughly prioritized)

**Forms / calendar finishing touches**
- [ ] Paste the ParishSoft embed URL into `js/config.js` when available.
- [ ] Decide recipient strategy: point the Web3Forms key at a parish Google
      Group/alias (editable list, free) **or** upgrade to Web3Forms PRO and set
      `proPlan: true` to use the in-code `recipients` list.

**Polish (from the initial best-practices review)**
- [ ] **Favicon** — currently missing (harmless `/favicon.ico` 404 in console).
- [ ] **Optimize images** — the `assets/` watercolors are ~9 MB each (~36 MB total);
      resize/compress for the web (big page-speed win).
- [ ] **SEO** — add Open Graph/Twitter tags, canonical URLs, `sitemap.xml`,
      `robots.txt`, and `Church`/`LocalBusiness` JSON-LD structured data.
- [ ] **Accessibility** — dropdown menu ARIA + keyboard support, skip-to-content
      link, check gold/navy color contrast (WCAG AA).
- [ ] **Tailwind** — move off the CDN to a compiled/purged build for production.
- [ ] **Templating/build** — the `<head>` boilerplate is duplicated across ~20
      pages; a small build step or includes would remove the copy-paste.
- [ ] **Other still-external assets** — parish logo, some staff photos and PDFs are
      still on `cdn-website.com`; the Alpha logo is on `alphausa.org`; and 3
      "Register for Alpha" links point to `dylanbrowncpa.com/alpha`. Decide which
      to bring in-house / repoint.

## Notes & gotchas

- **Web3Forms free plan:** only the access-key email receives mail; CC (`ccemail`)
  is PRO-only and will reject the whole submission on free — hence the `proPlan`
  gate.
- **Testing forms sends real email** to the access-key inbox. There's no test mode.
- The site must be **served over HTTP(S)** for production; pages load shared JS/CSS
  by relative path.
