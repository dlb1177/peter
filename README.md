# Church of St. Peter — Mendota, MN

Marketing/informational website for the Church of St. Peter. Static, multi-page
HTML site (no build step required) styled with Tailwind CSS and a small amount of
hand-written CSS.

## Project structure

```
.
├── index.html              # Home page
├── pages/                  # All interior pages (one .html per page)
├── css/
│   ├── main.css            # Site styles
│   └── animations.css      # Scroll/entrance animations
├── js/
│   ├── app.js              # Bootstrap: injects nav/footer, wires up modules
│   ├── navigation.js       # Shared header + footer markup (single source of truth)
│   ├── components.js       # Reusable UI: toasts, modals, accordions, forms
│   ├── animations.js       # Intersection-observer entrance animations
│   ├── calendar.js         # Calendar embed/placeholder controller (ParishSoft)
│   └── config.js           # Site-wide config (form recipients, embed URLs, etc.)
└── assets/                 # Images and other static files served from the repo
```

The navigation bar and footer are defined once in `js/navigation.js` and injected
into every page by `js/app.js` (into the `#site-navigation` and `#site-footer`
placeholders). **Edit the menu/footer in one place** rather than per page.

## Running locally

Because pages load shared JS/CSS by relative path, serve the folder over HTTP
rather than opening files directly:

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static file server works (`npx serve`, the VS Code "Live Server" extension, etc.).

## Configuration

Site-wide settings live in **`js/config.js`** so non-developers can change them
without touching page markup:

- **`calendar.parishSoftEmbedUrl`** — the ParishSoft calendar embed URL. Until it
  is set, the site shows a styled "calendar coming soon" placeholder.
- **`forms.accessKey`** — the [Web3Forms](https://web3forms.com) access key that
  delivers form submissions (contact, new-parishioner, baptism registration).
  Until it is set, the forms show a friendly "not set up yet" message and point
  visitors to the office phone/email — they never fail silently.
- **`forms.proPlan`** — set to `true` only if the Web3Forms account is on a paid
  plan. CC'ing extra recipients is a PRO feature; on the free plan, sending the CC
  list makes Web3Forms reject the whole submission, so the CC list is only sent
  when this is `true`. Leave `false` on the free plan.
- **`forms.recipients`** — additional addresses copied (CC) on each submission;
  editable here on the fly. Only used when `proPlan` is `true`.

### Setting up form delivery (one-time)

The site is static, so a third-party service (Web3Forms) sends the emails.

1. Go to [web3forms.com](https://web3forms.com) and enter the address that should
   **receive** submissions to get a free access key.
2. Paste that key into `forms.accessKey` in `js/config.js`.

**Editable recipient list for free:** register the access key using a shared parish
distribution list / Google Group (e.g. `web-inquiries@stpetersmendota.org`). Staff can
then add or remove who receives submissions from the email admin — no code changes.

The `forms.recipients` list is also sent as CC, which lets you drive the recipient
list from `config.js`. Note CC to extra addresses is a **Web3Forms PRO** feature; on
the free plan only the access-key address (or its group members) receives mail.

## Deployment

This is a static site and can be hosted on any static host (GitHub Pages,
Netlify, Cloudflare Pages, etc.). No server-side code is required for the pages
themselves; form delivery is handled by a third-party form backend (see
`js/config.js`).

## Known follow-ups

- The watercolor images in `assets/` are large (~9 MB each) and should be
  optimized/resized for the web.
- Tailwind is currently loaded from the CDN; for production a compiled/purged
  Tailwind build is recommended.
