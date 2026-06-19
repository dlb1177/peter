# Community Life + Password Admin (Firebase)

Parish staff manage community events from a **password-protected page on your
own site** — no GitHub, no code. Each event is simply **Title · Short
description · Date · Time (optional) · Embed code (optional)**.

## How it works

```
/admin/  (password login)            pages/community-life.html  (grid of event panes)
   index.html + admin.js   ──writes──▶  Firebase   ──read──▶  pages/community-event.html (full page + embed)
                                       (Firestore)            js/community.js
        staff type a password
```

- The **admin page lives in your repo** (`/admin/`). Staff go to
  `yoursite.com/admin/`, type the shared password, and add/edit/delete events.
- Events are stored in **Firebase Firestore** (a tiny free database). This is the
  one small service that lets a static site save data. Staff never see it.
- The public pages read events from Firebase and render them. An event's pasted
  **embed code** (Canva, YouTube, Google Maps, …) shows on its event page.

## One-time setup (~15 minutes, done once)

You'll create a free Firebase project and paste a few values into
[js/firebase-config.js](js/firebase-config.js). Nothing here is secret — your
data is protected by the security rules in step 5.

1. **Create a project** at <https://console.firebase.google.com> → *Add project*
   (a name like `stpeter-community`). Google Analytics is optional; skip it.
2. **Add a Web App:** in the project, click the **`</>`** (Web) icon, give it a
   nickname, and register it. Firebase shows a `firebaseConfig = { ... }` block —
   copy those values into [js/firebase-config.js](js/firebase-config.js)
   (replacing the `PASTE_…` placeholders).
3. **Turn on Authentication:** left menu → **Build → Authentication → Get
   started → Email/Password → Enable → Save.**
4. **Create the shared staff login:** Authentication → **Users → Add user** →
   enter an email (e.g. `office@stpetersmendota.org`) and a password. Put that
   **email** into `ADMIN_EMAIL` in `js/firebase-config.js`. Give the **password**
   to your staff — that's all they type at `/admin/`.
5. **Create the database + lock it down:** Build → **Firestore Database → Create
   database** (Production mode). Then open the **Rules** tab, paste this, and
   **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /events/{doc} {
         allow read: if true;                 // anyone can view events on the site
         allow write: if request.auth != null; // only the signed-in office can change them
       }
     }
   }
   ```

That's it. Visit `/admin/`, sign in with the password, and add an event — it goes
live on the Community Life page immediately.

> **Changing the shared password later:** Firebase Console → Authentication →
> Users → (the account) → reset password. Re-share the new one.
>
> **Want individual logins instead?** Add more users in step 4 and change the
> login form in `admin/index.html` to also ask for an email (instead of using the
> single `ADMIN_EMAIL`). The shared-password setup is the default for simplicity.

## How staff add an event (day-to-day)

1. Go to **`/admin/`** and type the password.
2. Fill in **Title**, **Short description**, **Date**, optional **Time**, and
   optionally paste an **Embed code**.
3. Click **Save Event**. It's live on the website right away.
4. Use **Edit** / **Delete** on any event in the list below the form.

### Getting an embed code
- **Canva:** open the design → **Share → More → Embed** → copy the code. (A Canva
  *design* embeds nicely; a full Canva *website* should instead be linked with a
  button — Canva blocks embedding whole sites.) Your parish likely qualifies for
  free **Canva for Nonprofits** (Canva Pro).
- **YouTube / Google Maps:** use their **Share → Embed** option and copy the
  `<iframe …>` code.

## Notes for developers / maintainers

- **No build step.** Pages load the Firebase SDK on demand from Google's CDN via
  dynamic `import()`; the version is pinned in `js/firebase-config.js`
  (`FIREBASE_VERSION`).
- **Files:** public render = [js/community.js](js/community.js) +
  [css/community.css](css/community.css); admin = [admin/index.html](admin/index.html)
  + [admin/admin.js](admin/admin.js); shared config =
  [js/firebase-config.js](js/firebase-config.js).
- **Before setup**, `isFirebaseConfigured()` is false, so the public pages show
  "events are coming soon" and the admin shows a "not connected yet" notice — no
  errors.
- **Embed safety:** pasted embed code is injected and its `<script>` tags are
  re-executed so embeds work. This is fine because only the password-holding
  office can add events. Don't hand the password out widely.
- **Data shape** (`events` collection): `{ title, description, date (YYYY-MM-DD),
  time, embed, createdAt }`.
