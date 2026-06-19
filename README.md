# Church of St. Peter — Mendota, MN

Marketing/informational website for the Church of St. Peter. Static, multi-page
HTML site (**no build step required**) styled with Tailwind CSS and a small
amount of hand-written CSS. The only dynamic piece is the **Community Life**
events feature, which uses Firebase (see below) — everything else is static
files plus a third-party form backend.

> **Status:** in active development on a **test setup** owned by the developer.
> Before the parish goes live on its own domain, several accounts/links need to
> be migrated — see **[Going live: migration checklist](#going-live-migration-from-test-setup-to-parish-ownership)**.

## What's on the site

- Informational pages grouped under **Mass & Prayer, Sacraments, Faith Life,
  About, News & Events**. Nav + footer are defined once and injected everywhere.
- **Sacraments** — an overview hub plus a separate page per sacrament.
- **Faith Formation** — separate pages for Catechesis of the Good Shepherd,
  Youth Formation, and Adult Formation, plus a dedicated Alpha page.
- **Forms** — Contact, New Parishioner, and Baptism Registration, delivered by
  [Web3Forms](https://web3forms.com) (no mail server needed).
- **Calendar** — embeds a ParishSoft calendar (shows a "coming soon" placeholder
  until the embed URL is set).
- **Bulletins & Newsletters** and a **Uganda Mission** page ("coming soon").
- **Community Life** — a "living" events section with a **password-protected
  admin** where parish staff add/edit/delete events (title, description, date,
  time, and an optional pasted embed code). Backed by Firebase. Full setup +
  how-to: **[`COMMUNITY_LIFE.md`](COMMUNITY_LIFE.md)**.

## Project structure

```
.
├── index.html              # Home page
├── pages/                  # All interior pages (one .html per page)
│   ├── community-life.html     # Community Life — grid of event panes
│   └── community-event.html    # One template renders any event by ?id=
├── admin/                  # Password-protected Community Life admin
│   ├── index.html              # Login + event manager UI
│   └── admin.js                # Admin logic (Firebase auth + Firestore CRUD)
├── css/
│   ├── main.css            # Site styles
│   ├── animations.css      # Scroll/entrance animations
│   └── community.css       # Community Life grid + event page styles
├── js/
│   ├── app.js              # Bootstrap: injects nav/footer, wires up modules
│   ├── navigation.js       # Shared header + footer markup (single source of truth)
│   ├── components.js       # Reusable UI: toasts, modals, accordions, forms
│   ├── animations.js       # Intersection-observer entrance animations
│   ├── calendar.js         # Calendar embed/placeholder controller (ParishSoft)
│   ├── community.js        # Community Life renderer (reads events from Firebase)
│   ├── firebase-config.js  # Firebase project keys + shared admin email
│   └── config.js           # Site-wide config (form recipients, embed URLs, etc.)
├── assets/                 # Images and other static files served from the repo
├── COMMUNITY_LIFE.md       # Community Life + admin setup and usage
└── PROJECT_STATUS.md       # Living status/handoff doc
```

The navigation bar and footer are defined once in `js/navigation.js` and injected
into every page by `js/app.js` (into the `#site-navigation` and `#site-footer`
placeholders). **Edit the menu/footer in one place** rather than per page.

## Running locally

Pages load shared JS/CSS by relative path and `js/community.js` /
`admin/admin.js` are ES modules, so **serve the folder over HTTP** rather than
opening files directly:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Any static file server works (`npx serve`, the VS Code "Live Server" extension,
etc.). The Community Life admin lives at `/admin/`.

## Configuration

Two small files hold everything a non-developer needs to change:

### `js/config.js` — forms & calendar
- **`calendar.parishSoftEmbedUrl`** — ParishSoft calendar embed URL. Blank =
  "calendar coming soon" placeholder.
- **`forms.accessKey`** — Web3Forms access key that delivers form submissions.
  Blank = forms show a friendly "not set up yet" message (they never fail
  silently).
- **`forms.proPlan`** — `true` only on a paid Web3Forms plan (CC is a PRO
  feature; sending the CC list on the free plan makes Web3Forms reject the
  submission). Leave `false` on free.
- **`forms.recipients`** — extra CC addresses; only used when `proPlan` is `true`.

> **Tip — editable recipient list for free:** register the Web3Forms key using a
> shared parish distribution list / Google Group (e.g.
> `web-inquiries@stpetersmendota.org`); staff then manage who gets submissions
> from the email admin, no code changes.

### `js/firebase-config.js` — Community Life backend
Firebase project keys + the single shared admin email. None of these values are
secret (they identify the project in the browser; data is protected by Firestore
**security rules**). Full setup steps in **[`COMMUNITY_LIFE.md`](COMMUNITY_LIFE.md)**.

## Deployment

Static site — hostable anywhere (GitHub Pages, Netlify, Cloudflare Pages, …). No
server-side code for the pages; form delivery is Web3Forms and Community Life is
Firebase.

**Current (test) deployment:** GitHub Pages from `main`, live at
**https://dlb1177.github.io/peter/**.

---

## Going live: migration from test setup to parish ownership

> ⚠️ This whole section is the handoff checklist for when the parish takes over.

Everything below is currently wired to the **developer's** personal accounts/domain
so the parish can preview and test. When the parish approves moving forward, work
through this checklist to hand ownership over. (Cross-check
[`PROJECT_STATUS.md`](PROJECT_STATUS.md) for the latest state.)

### 1. Accounts & services to re-create/transfer under the parish

| Service | What it powers | Currently | Migrate to |
|---|---|---|---|
| **GitHub repo + Pages** | Hosting (`dlb1177/peter` → `dlb1177.github.io/peter/`) | Developer's GitHub | Transfer the repo to a parish GitHub account/org (or chosen host); re-enable Pages; add the parish custom domain. |
| **Firebase** | Community Life events DB + admin login (project `peter-530e5`) | Developer's Google account | Create a parish-owned Firebase project; paste its keys into `js/firebase-config.js`; create the parish office login; set `ADMIN_EMAIL`; re-publish the Firestore security rules; add the parish domain to Authorized domains. Steps mirror [`COMMUNITY_LIFE.md`](COMMUNITY_LIFE.md). |
| **Web3Forms** | Contact / New Parishioner / Baptism form delivery (key in `js/config.js`) | Test key `27774fac-…` | Register a fresh key under a parish receiving address / Google Group; replace `forms.accessKey`. |
| **Canva** *(optional)* | Designs pasted as event "embed code" | n/a | Use the parish's Canva (free **Canva for Nonprofits** / Pro for churches) if staff lean on Canva embeds. |

### 2. Placeholders waiting on parish-provided info

- **ParishSoft calendar** — `calendar.parishSoftEmbedUrl` in `js/config.js` is
  blank → shows the "coming soon" placeholder. Paste the parish's embed URL.
- **Online giving** — the donations page links to `giving.parishsoft.com`;
  confirm it points at the parish's giving page.
- **Bulletins page** — the live bulletin widget is from `parishesonline.com`
  (confirm it's the parish's); several insert/newsletter **download links and the
  "Sponsor Information" link are placeholders (`href="#"`)** awaiting real PDFs/URLs.
- **Uganda Mission** — intentionally a "Coming Soon" page until content is ready.

### 3. Developer/test references to replace

- **`js/firebase-config.js`** → `ADMIN_EMAIL = "dylan@dylanbrowncpa.com"` is the
  **test login**. Replace with the parish office email (and its account in the
  parish Firebase project).
- **`pages/alpha.html`** → two "Register for Alpha" buttons link to
  **`https://dylanbrowncpa.com/alpha`** (developer's domain). Point them at the
  parish's Alpha registration page.
- The Web3Forms key and GitHub/Pages URLs above are likewise developer-owned.

### 4. Externally hosted assets to bring in-house

The parish **logo, several staff photos, and PDFs** (CGS newsletters, wedding
guide, Fr. Steven's story, etc.) are still served from the **previous website
builder's CDN** — `irp.cdn-website.com`, `lirp.cdn-website.com`, and
`irp-cdn.multiscreensite.com` (~20 references across the site). **If the old
site is taken down, these break.** Download them into `assets/` and update the
references. (The Alpha logo is loaded from `alphausa.org` — fine to keep or
localize.)

### 5. Moving to the parish domain (e.g. `stpetersmendota.org`)

1. Add the custom domain on the host (GitHub Pages: add a `CNAME` file + DNS
   records).
2. Add the new domain under **Firebase → Authentication → Settings → Authorized
   domains** so admin login keeps working.
3. The site uses **relative paths**, so it works whether served from a `/peter/`
   subpath or a domain root — no code changes needed for the move itself.

### 6. Production hardening (recommended before a "real" public launch)

- Replace the **Tailwind CDN** (`cdn.tailwindcss.com`) with a compiled/purged
  Tailwind build (removes the CDN dependency + console warning; faster).
- **Optimize images** — the `assets/` watercolors are ~9 MB each.
- **SEO** — Open Graph/canonical tags, `sitemap.xml`, `robots.txt`, structured data.
- **Accessibility** — dropdown ARIA/keyboard support, skip-to-content link,
  finish auditing color contrast.
- Add a **favicon**.
