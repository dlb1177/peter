/**
 * Parish Admin — Church of St. Peter
 *
 * One password-protected screen with two sections (sidebar):
 *   • Community Life  — add/edit/delete events (Firestore `events`)
 *   • Faith Life Pages — edit the content/layout of the Faith Formation pages
 *                        as reorderable sections (Firestore `pages`)
 *
 * Sign-in uses one shared account whose email is set in js/firebase-config.js,
 * so staff only type a password. No GitHub access required.
 */
import { firebaseConfig, ADMIN_EMAIL, isFirebaseConfigured, FIREBASE_VERSION }
  from '../js/firebase-config.js';
import { FAITH_DEFAULTS } from '../js/faith-pages-defaults.js';

const $ = (id) => document.getElementById(id);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FAITH_LABELS = {
  'catechesis-good-shepherd': 'Catechesis of the Good Shepherd',
  'youth-formation': 'Youth Formation',
  'adult-formation': 'Adult Formation',
  'small-groups': 'Small Groups'
};

let A, F, auth, db;          // Firebase module namespaces + instances
let events = [];             // Community Life cache
let editing = null;          // Faith page working copy
let editingKey = null;

function show(id) { $(id).hidden = false; }
function hide(id) { $(id).hidden = true; }
function msg(el, text, kind) { el.textContent = text; el.className = 'msg ' + (kind || ''); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function escText(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(s) { return escText(s).replace(/"/g, '&quot;'); }

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

/* ---------- wiring ---------- */

function wireUi() {
  // login / logout
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('login-btn'); btn.disabled = true;
    msg($('login-msg'), '', '');
    try {
      await A.signInWithEmailAndPassword(auth, ADMIN_EMAIL, $('password').value);
      $('password').value = '';
    } catch (err) {
      msg($('login-msg'), 'That password was not accepted. Please try again.', 'error');
    } finally { btn.disabled = false; }
  });
  $('btn-logout').addEventListener('click', () => A.signOut(auth));

  // Community Life
  $('event-form').addEventListener('submit', saveEvent);
  $('cancel-btn').addEventListener('click', resetForm);

  // sidebar navigation
  $('sidebar').addEventListener('click', (e) => {
    const link = e.target.closest('.side-link');
    if (!link) return;
    document.querySelectorAll('.side-link').forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
    if (link.dataset.nav === 'community') {
      $('view-community').hidden = false; $('view-faith').hidden = true;
    } else {
      $('view-community').hidden = true; $('view-faith').hidden = false;
      loadFaithPage(link.dataset.page);
    }
  });

  // Faith page editor: save / reset + delegated field + structural events
  $('fp-save').addEventListener('click', saveFaithPage);
  $('fp-save-2').addEventListener('click', saveFaithPage);
  $('fp-reset').addEventListener('click', resetFaithPage);

  const ed = $('fp-editor');
  ed.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.path) setByPath(editing, t.dataset.path, t.value);
  });
  ed.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = btn.dataset.action;
    const i = btn.dataset.i !== undefined ? +btn.dataset.i : -1;
    const j = btn.dataset.j !== undefined ? +btn.dataset.j : -1;
    const B = editing.blocks;
    if (a === 'block-up' && i > 0) { [B[i - 1], B[i]] = [B[i], B[i - 1]]; renderEditor(); }
    else if (a === 'block-down' && i < B.length - 1) { [B[i + 1], B[i]] = [B[i], B[i + 1]]; renderEditor(); }
    else if (a === 'block-del') { if (confirm('Delete this section?')) { B.splice(i, 1); renderEditor(); } }
    else if (a === 'add-block') { B.push(newBlock($('fp-add-type').value)); renderEditor(); }
    else if (a === 'item-add') { const blk = B[i]; blk.items = blk.items || []; blk.items.push(blk.type === 'cards' ? newCardItem() : { label: '', url: '' }); renderEditor(); }
    else if (a === 'item-del') { B[i].items.splice(j, 1); renderEditor(); }
  });
}

/* ========================================================================
 * Community Life — events
 * ===================================================================== */

async function loadEvents() {
  const list = $('events-list');
  list.innerHTML = '<p class="empty">Loading…</p>';
  try {
    const q = F.query(F.collection(db, 'events'), F.orderBy('date', 'desc'));
    const snap = await F.getDocs(q);
    events = [];
    snap.forEach((d) => events.push(Object.assign({ id: d.id }, d.data())));
    renderEventList();
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p class="empty">Could not load events. Refresh to try again.</p>';
  }
}

function renderEventList() {
  const list = $('events-list');
  if (!events.length) { list.innerHTML = '<p class="empty">No events yet. Add your first one above.</p>'; return; }
  list.innerHTML = '';
  events.forEach((ev) => {
    const row = document.createElement('div');
    row.className = 'ev';
    const past = isPast(ev.date);
    row.innerHTML =
      '<div class="ev-main"><div class="ev-title"></div>' +
        '<div class="ev-meta">' + fmtDate(ev.date) + (ev.time ? ' · ' + escText(ev.time) : '') +
          '<span class="badge ' + (past ? 'past' : 'upcoming') + '">' + (past ? 'Past' : 'Upcoming') + '</span>' +
          (ev.embed && ev.embed.trim() ? '<span class="badge embed">Embed</span>' : '') +
        '</div></div>' +
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
    if (id) await F.updateDoc(F.doc(db, 'events', id), data);
    else { data.createdAt = F.serverTimestamp(); await F.addDoc(F.collection(db, 'events'), data); }
    resetForm();
    msg($('form-msg'), 'Saved. Your change is live on the website.', 'ok');
    setTimeout(() => msg($('form-msg'), '', ''), 4000);
    loadEvents();
  } catch (err) {
    console.error(err);
    msg($('form-msg'), 'Sorry — that could not be saved. Please try again.', 'error');
  } finally { btn.disabled = false; }
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
  } catch (err) { console.error(err); alert('Sorry — that could not be deleted. Please try again.'); }
}

function resetForm() {
  $('event-form').reset();
  $('event-id').value = '';
  $('form-title').textContent = 'Add an Event';
  $('cancel-btn').hidden = true;
}

/* ========================================================================
 * Faith Life pages — section editor
 * ===================================================================== */

const BLOCK_TYPES = {
  heading: { label: 'Heading', fields: [{ k: 'text', label: 'Heading text', type: 'text' }] },
  text: { label: 'Text', fields: [{ k: 'body', label: 'Text', type: 'textarea' }] },
  image: { label: 'Image', fields: [
    { k: 'src', label: 'Image path or URL', type: 'text' },
    { k: 'caption', label: 'Caption', type: 'text' },
    { k: 'width', label: 'Width', type: 'select', options: ['full', 'centered'] }
  ] },
  button: { label: 'Button', fields: [
    { k: 'label', label: 'Button text', type: 'text' },
    { k: 'url', label: 'Link URL', type: 'text' },
    { k: 'style', label: 'Style', type: 'select', options: ['primary', 'outline'] }
  ] },
  quote: { label: 'Quote', fields: [
    { k: 'text', label: 'Quote', type: 'text' },
    { k: 'attribution', label: 'Attribution', type: 'text' }
  ] },
  cards: { label: 'Cards', fields: [
    { k: 'items', label: 'Cards', type: 'list', itemLabel: 'Card', item: [
      { k: 'title', label: 'Title', type: 'text' },
      { k: 'subtitle', label: 'Subtitle', type: 'text' },
      { k: 'body', label: 'Body', type: 'textarea' },
      { k: 'linkLabel', label: 'Link label', type: 'text' },
      { k: 'linkUrl', label: 'Link URL', type: 'text' }
    ] }
  ] },
  callout: { label: 'Highlight box', fields: [
    { k: 'title', label: 'Title', type: 'text' },
    { k: 'body', label: 'Message', type: 'textarea' },
    { k: 'style', label: 'Color', type: 'select', options: ['gold', 'navy', 'red'] },
    { k: 'linkLabel', label: 'Link label', type: 'text' },
    { k: 'linkUrl', label: 'Link URL', type: 'text' }
  ] },
  links: { label: 'Link list', fields: [
    { k: 'title', label: 'List title', type: 'text' },
    { k: 'items', label: 'Links', type: 'list', itemLabel: 'Link', item: [
      { k: 'label', label: 'Label', type: 'text' },
      { k: 'url', label: 'URL', type: 'text' }
    ] }
  ] },
  contact: { label: 'Contact', fields: [
    { k: 'name', label: 'Name', type: 'text' },
    { k: 'role', label: 'Role', type: 'text' },
    { k: 'email', label: 'Email', type: 'text' },
    { k: 'phone', label: 'Phone', type: 'text' },
    { k: 'note', label: 'Note', type: 'textarea' }
  ] }
};

function newCardItem() { return { title: '', subtitle: '', body: '', linkLabel: '', linkUrl: '' }; }
function newBlock(type) {
  switch (type) {
    case 'heading': return { type, text: '' };
    case 'text': return { type, body: '' };
    case 'image': return { type, src: '', caption: '', width: 'full' };
    case 'button': return { type, label: '', url: '', style: 'primary' };
    case 'quote': return { type, text: '', attribution: '' };
    case 'cards': return { type, items: [newCardItem()] };
    case 'callout': return { type, title: '', body: '', style: 'gold', linkLabel: '', linkUrl: '' };
    case 'links': return { type, title: '', items: [{ label: '', url: '' }] };
    case 'contact': return { type, name: '', role: '', email: '', phone: '', note: '' };
    default: return { type: 'text', body: '' };
  }
}

function setByPath(obj, path, val) {
  const p = path.split('.');
  let o = obj;
  for (let k = 0; k < p.length - 1; k++) o = o[p[k]];
  o[p[p.length - 1]] = val;
}

function fieldInput(path, field, value) {
  value = value == null ? '' : value;
  if (field.type === 'textarea') {
    return '<label>' + field.label + '</label><textarea data-path="' + path + '" rows="4">' + escText(value) + '</textarea>';
  }
  if (field.type === 'select') {
    const opts = field.options.map((o) => '<option value="' + o + '"' + (o === value ? ' selected' : '') + '>' + o + '</option>').join('');
    return '<label>' + field.label + '</label><select data-path="' + path + '">' + opts + '</select>';
  }
  return '<label>' + field.label + '</label><input type="text" data-path="' + path + '" value="' + escAttr(value) + '">';
}

function heroCardHtml(p) {
  return '<div class="fp-block-card"><div class="fp-block-type" style="margin-bottom:0.6rem;">Page header</div>' +
    fieldInput('title', { label: 'Page title', type: 'text' }, p.title) +
    fieldInput('eyebrow', { label: 'Kicker — small line above the title (optional)', type: 'text' }, p.eyebrow) +
    fieldInput('intro', { label: 'Intro paragraph (optional)', type: 'textarea' }, p.intro) +
    fieldInput('heroVariant', { label: 'Header style', type: 'select', options: ['light', 'navy'] }, p.heroVariant || 'light') +
    '</div>';
}

function blockCardHtml(b, i) {
  const meta = BLOCK_TYPES[b.type];
  if (!meta) return '';
  let inner = '';
  meta.fields.forEach((f) => {
    if (f.type === 'list') {
      inner += '<label>' + f.label + '</label>';
      (b[f.k] || []).forEach((item, j) => {
        inner += '<div class="fp-item"><div class="fp-item-head"><span>' + (f.itemLabel || 'Item') + ' ' + (j + 1) +
          '</span><button type="button" data-action="item-del" data-i="' + i + '" data-j="' + j + '">✕ remove</button></div>';
        f.item.forEach((sf) => { inner += fieldInput('blocks.' + i + '.' + f.k + '.' + j + '.' + sf.k, sf, item[sf.k]); });
        inner += '</div>';
      });
      inner += '<button type="button" class="btn btn-ghost" data-action="item-add" data-i="' + i + '" style="margin-top:0.4rem;">+ Add ' + (f.itemLabel || 'item').toLowerCase() + '</button>';
    } else {
      inner += fieldInput('blocks.' + i + '.' + f.k, f, b[f.k]);
    }
  });
  return '<div class="fp-block-card"><div class="fp-block-head"><span class="fp-block-type">' + meta.label + '</span>' +
    '<span class="fp-block-ctrls">' +
      '<button type="button" data-action="block-up" data-i="' + i + '" title="Move up"><i class="fa-solid fa-arrow-up"></i></button>' +
      '<button type="button" data-action="block-down" data-i="' + i + '" title="Move down"><i class="fa-solid fa-arrow-down"></i></button>' +
      '<button type="button" class="del" data-action="block-del" data-i="' + i + '" title="Delete section"><i class="fa-solid fa-trash"></i></button>' +
    '</span></div>' + inner + '</div>';
}

function addRowHtml() {
  const opts = Object.keys(BLOCK_TYPES).map((t) => '<option value="' + t + '">' + BLOCK_TYPES[t].label + '</option>').join('');
  return '<div class="fp-ed-h">Add a section</div><div class="fp-add-row"><select id="fp-add-type">' + opts +
    '</select><button type="button" class="btn btn-ghost" data-action="add-block">+ Add section</button></div>';
}

function renderEditor() {
  $('fp-editor').innerHTML =
    heroCardHtml(editing) +
    '<div class="fp-ed-h">Page sections</div>' +
    (editing.blocks || []).map((b, i) => blockCardHtml(b, i)).join('') +
    addRowHtml();
}

async function loadFaithPage(key) {
  editingKey = key;
  $('fp-page-title').textContent = 'Edit: ' + (FAITH_LABELS[key] || key);
  $('fp-view-link').href = '../pages/' + key + '.html';
  msg($('fp-msg'), '', '');
  $('fp-editor').innerHTML = '<p class="empty">Loading…</p>';
  let data = null;
  try {
    const snap = await F.getDoc(F.doc(db, 'pages', key));
    if (snap.exists()) data = snap.data();
  } catch (err) { console.warn('Loaded default for', key, err); }
  editing = clone(data || FAITH_DEFAULTS[key] || { title: '', eyebrow: '', intro: '', heroVariant: 'light', blocks: [] });
  if (!Array.isArray(editing.blocks)) editing.blocks = [];
  renderEditor();
}

async function saveFaithPage() {
  if (!editingKey) return;
  const btns = [$('fp-save'), $('fp-save-2')];
  btns.forEach((b) => (b.disabled = true));
  try {
    const data = {
      title: editing.title || '',
      eyebrow: editing.eyebrow || '',
      intro: editing.intro || '',
      heroVariant: editing.heroVariant || 'light',
      blocks: editing.blocks || []
    };
    await F.setDoc(F.doc(db, 'pages', editingKey), data);
    msg($('fp-msg'), 'Saved. The page is updated on the website.', 'ok');
    setTimeout(() => msg($('fp-msg'), '', ''), 4000);
  } catch (err) {
    console.error(err);
    msg($('fp-msg'), 'Sorry — could not save. Please try again.', 'error');
  } finally {
    btns.forEach((b) => (b.disabled = false));
  }
}

function resetFaithPage() {
  if (!editingKey || !FAITH_DEFAULTS[editingKey]) return;
  if (!confirm('Replace the current edits with the original page content? You can still review it and choose whether to Save.')) return;
  editing = clone(FAITH_DEFAULTS[editingKey]);
  renderEditor();
  msg($('fp-msg'), 'Loaded the original content. Click Save to publish it.', 'ok');
}

boot();
