/**
 * Community Life Admin — Church of St. Peter
 *
 * A simple password-protected screen for parish staff to add / edit / delete
 * events. Data lives in Firebase Firestore; sign-in uses one shared account
 * (its email is set in js/firebase-config.js, so staff only type a password).
 * Staff never interact with GitHub.
 */
import { firebaseConfig, ADMIN_EMAIL, isFirebaseConfigured, FIREBASE_VERSION }
  from '../js/firebase-config.js';

const $ = (id) => document.getElementById(id);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let A, F, auth, db;          // Firebase Auth/Firestore module namespaces + instances
let events = [];             // cache for edit population

function show(id) { $(id).hidden = false; }
function hide(id) { $(id).hidden = true; }

function msg(el, text, kind) {
  el.textContent = text;
  el.className = 'msg ' + (kind || '');
}

function fmtDate(str) {
  const m = String(str || '').slice(0, 10).split('-');
  if (m.length < 3) return '';
  return MONTHS[Number(m[1]) - 1] + ' ' + Number(m[2]) + ', ' + m[0];
}

function isPast(str) {
  const m = String(str || '').slice(0, 10).split('-');
  if (m.length < 3) return false;
  const d = new Date(Number(m[0]), Number(m[1]) - 1, Number(m[2]));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

/* ---------- boot ---------- */

async function boot() {
  if (!isFirebaseConfigured()) { show('not-configured'); return; }
  try {
    const base = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION;
    const [appM, authM, fsM] = await Promise.all([
      import(base + '/firebase-app.js'),
      import(base + '/firebase-auth.js'),
      import(base + '/firebase-firestore.js')
    ]);
    const app = appM.initializeApp(firebaseConfig);
    A = authM; F = fsM;
    auth = A.getAuth(app);
    db = F.getFirestore(app);
    wireUi();
    A.onAuthStateChanged(auth, onAuthChange);
  } catch (err) {
    console.error(err);
    show('not-configured');
  }
}

function onAuthChange(user) {
  if (user) {
    hide('login-view');
    show('topbar'); show('manager-view');
    $('who-email').textContent = user.email || '';
    loadEvents();
  } else {
    hide('topbar'); hide('manager-view');
    show('login-view');
  }
}

/* ---------- auth ---------- */

function wireUi() {
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('login-btn'); btn.disabled = true;
    msg($('login-msg'), '', '');
    try {
      await A.signInWithEmailAndPassword(auth, ADMIN_EMAIL, $('password').value);
      $('password').value = '';
    } catch (err) {
      msg($('login-msg'), 'That password was not accepted. Please try again.', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  $('btn-logout').addEventListener('click', () => A.signOut(auth));

  $('event-form').addEventListener('submit', saveEvent);
  $('cancel-btn').addEventListener('click', resetForm);
}

/* ---------- events CRUD ---------- */

async function loadEvents() {
  const list = $('events-list');
  list.innerHTML = '<p class="empty">Loading…</p>';
  try {
    const q = F.query(F.collection(db, 'events'), F.orderBy('date', 'desc'));
    const snap = await F.getDocs(q);
    events = [];
    snap.forEach((d) => events.push(Object.assign({ id: d.id }, d.data())));
    renderList();
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p class="empty">Could not load events. Refresh to try again.</p>';
  }
}

function renderList() {
  const list = $('events-list');
  if (!events.length) { list.innerHTML = '<p class="empty">No events yet. Add your first one above.</p>'; return; }
  list.innerHTML = '';
  events.forEach((ev) => {
    const row = document.createElement('div');
    row.className = 'ev';
    const past = isPast(ev.date);
    row.innerHTML =
      '<div class="ev-main">' +
        '<div class="ev-title"></div>' +
        '<div class="ev-meta">' + fmtDate(ev.date) + (ev.time ? ' · ' + escapeText(ev.time) : '') +
          '<span class="badge ' + (past ? 'past' : 'upcoming') + '">' + (past ? 'Past' : 'Upcoming') + '</span>' +
          (ev.embed && ev.embed.trim() ? '<span class="badge embed">Embed</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="ev-actions">' +
        '<button title="Edit" class="edit"><i class="fa-solid fa-pen"></i></button>' +
        '<button title="Delete" class="del"><i class="fa-solid fa-trash"></i></button>' +
      '</div>';
    row.querySelector('.ev-title').textContent = ev.title || '(untitled)';
    row.querySelector('.edit').addEventListener('click', () => editEvent(ev.id));
    row.querySelector('.del').addEventListener('click', () => deleteEvent(ev.id, ev.title));
    list.appendChild(row);
  });
}

async function saveEvent(e) {
  e.preventDefault();
  const btn = $('save-btn'); btn.disabled = true;
  const data = {
    title: $('f-title').value.trim(),
    description: $('f-desc').value.trim(),
    date: $('f-date').value,
    time: $('f-time').value.trim(),
    embed: $('f-embed').value.trim()
  };
  try {
    const id = $('event-id').value;
    if (id) {
      await F.updateDoc(F.doc(db, 'events', id), data);
    } else {
      data.createdAt = F.serverTimestamp();
      await F.addDoc(F.collection(db, 'events'), data);
    }
    resetForm();
    msg($('form-msg'), 'Saved. Your change is live on the website.', 'ok');
    setTimeout(() => msg($('form-msg'), '', ''), 4000);
    loadEvents();
  } catch (err) {
    console.error(err);
    msg($('form-msg'), 'Sorry — that could not be saved. Please try again.', 'error');
  } finally {
    btn.disabled = false;
  }
}

function editEvent(id) {
  const ev = events.find((x) => x.id === id);
  if (!ev) return;
  $('event-id').value = ev.id;
  $('f-title').value = ev.title || '';
  $('f-desc').value = ev.description || '';
  $('f-date').value = (ev.date || '').slice(0, 10);
  $('f-time').value = ev.time || '';
  $('f-embed').value = ev.embed || '';
  $('form-title').textContent = 'Edit Event';
  $('cancel-btn').hidden = false;
  msg($('form-msg'), '', '');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteEvent(id, title) {
  if (!window.confirm('Delete "' + (title || 'this event') + '"? This cannot be undone.')) return;
  try {
    await F.deleteDoc(F.doc(db, 'events', id));
    if ($('event-id').value === id) resetForm();
    loadEvents();
  } catch (err) {
    console.error(err);
    alert('Sorry — that could not be deleted. Please try again.');
  }
}

function resetForm() {
  $('event-form').reset();
  $('event-id').value = '';
  $('form-title').textContent = 'Add an Event';
  $('cancel-btn').hidden = true;
}

function escapeText(s) {
  return String(s == null ? '' : s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

boot();
