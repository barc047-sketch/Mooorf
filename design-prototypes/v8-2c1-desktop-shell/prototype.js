/* ═══════════════════════════════════════════════════════════════
   MOOORF V8.2C1 — DESKTOP STUDIO SHELL — interaction engine
   Vanilla JS, one IIFE, no dependencies. Forked from V1's camera/
   radial/magnification logic (design-prototypes/v8-2-ui-system).
   ═══════════════════════════════════════════════════════════════ */
(function () {
"use strict";

const qs = (s, r) => (r || document).querySelector(s);
const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = (() => { let n = 0; return (p) => `${p}${++n}`; })();
const rnd = (a, b) => a + Math.random() * (b - a);

/* ── Auto Contrast — V8_2C0_AUTO_CONTRAST_CONTRACT.md Rule 1 ── */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const v = parseInt(n, 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}
function luminance({ r, g, b }) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
function autoContrast(hex) {
  return luminance(hexToRgb(hex)) > 0.36 ? 'dark-label' : 'light-label';
}

/* ── categories / privacy tokens ─────────────────────────────── */
const CATS = [
  { id: 'living', label: 'Living', color: '#C4553B' },
  { id: 'sleep', label: 'Sleep', color: '#46557B' },
  { id: 'service', label: 'Service', color: '#7B8C6F' },
  { id: 'circulation', label: 'Circulation', color: '#8D5A75' },
  { id: 'outdoor', label: 'Outdoor', color: '#3F7A63' },
  { id: 'work', label: 'Work', color: '#B08A3E' },
];
const PRIV = ['Public', 'Shared', 'Private'];
function catOf(id) { return CATS.find(c => c.id === id) || CATS[0]; }

/* ══ STATE ═════════════════════════════════════════════════════ */
const S = {
  mode: 'day',
  workspace: 'canvas',       // canvas | data | dashboard
  railContext: '',           // which subrail is open
  dockExpanded: false,
  activeDock: 'select',      // select|materials|arrange|connect|markup|present
  activeQV: { morph: false, motion: false, grid: false, labels: true, fullscreen: false },
  gridStyle: 'dotted',
  cellShadow: 'off',         // off | soft | defined
  autoContrast: true,
  inspectorPinned: true,
  camera: { x: 0, y: 0, scale: 1 },
  cells: [],
  selected: new Set(),
  primary: null,
  matTarget: 'Space Fill',
  matFav: new Set(['m-clay', 'm-ink-solid']),
  matRecent: [],
  activeMaterialId: 'm-clay',
  floor: { idx: 0, list: ['Ground Floor', 'First Floor', 'Roof Terrace'] },
  history: [],
  future: [],
  dashMode: 'light',
  ctMode: 'compact',
  ctPos: { x: 0, y: 0 },
  exportJobs: [],
  drawerOpen: false,
  drawerSection: 'projects',
  toolRecents: ['Select', 'Materials', 'Arrange'],
};

/* ══ MATERIALS (target-tagged, tiered) ══════════════════════════ */
const M = [];
function addM(id, name, cat, color, targets, tier) { M.push({ id, name, cat, color, targets, tier: tier || 'A' }); }
const ALL_T = ['Space Fill', 'Core Dot', 'Cell Edge', 'Morph Fill', 'Void Fill', 'Canvas', 'Grid', 'Relationship', 'Label'];
addM('m-clay', 'Clay', 'Solid', '#C4553B', ['Space Fill', 'Core Dot'], 'A');
addM('m-slate', 'Slate', 'Solid', '#46557B', ['Space Fill', 'Core Dot'], 'A');
addM('m-moss', 'Moss', 'Solid', '#7B8C6F', ['Space Fill'], 'A');
addM('m-plum', 'Plum', 'Solid', '#8D5A75', ['Space Fill'], 'A');
addM('m-pine', 'Pine', 'Solid', '#3F7A63', ['Space Fill'], 'A');
addM('m-ochre', 'Ochre', 'Solid', '#B08A3E', ['Space Fill'], 'A');
addM('m-bone', 'Bone', 'Solid', '#EDE7D9', ['Space Fill', 'Canvas'], 'A');
addM('m-ink-solid', 'Ink', 'Solid', '#171719', ['Space Fill', 'Core Dot', 'Cell Edge'], 'A');
addM('m-grad1', 'Dusk Field', 'Gradient', 'linear-gradient(135deg,#C4553B,#46557B)', ['Space Fill', 'Morph Fill'], 'B');
addM('m-grad2', 'Coastal', 'Gradient', 'linear-gradient(135deg,#3F7A63,#8FBFD6)', ['Space Fill', 'Morph Fill'], 'B');
addM('m-grad3', 'Amber Line', 'Gradient', 'linear-gradient(135deg,#B08A3E,#E7D400)', ['Space Fill'], 'B');
addM('m-tex1', 'Linen', 'Texture', 'repeating-linear-gradient(45deg,#E7E2D3,#E7E2D3 2px,#DAD4C2 2px,#DAD4C2 4px)', ['Space Fill', 'Canvas'], 'B');
addM('m-tex2', 'Concrete', 'Texture', 'radial-gradient(circle at 30% 30%,#B9B6AC,#8E8B82)', ['Space Fill'], 'B');
addM('m-pat1', 'Hatch', 'Pattern', 'repeating-linear-gradient(60deg,#171719,#171719 1px,transparent 1px,transparent 6px)', ['Space Fill', 'Grid'], 'A');
addM('m-shader1', 'Field Pulse', 'Shader', 'conic-gradient(from 0deg,#C4553B,#46557B,#7B8C6F,#C4553B)', ['Morph Fill'], 'C');
addM('m-shader2', 'Spin Glass', 'Shader', 'conic-gradient(from 90deg,#8D5A75,#3F7A63,#B08A3E,#8D5A75)', ['Morph Fill'], 'C');
addM('m-void', 'Void Hatch', 'Pattern', 'repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(23,23,25,.18) 3px,rgba(23,23,25,.18) 4px)', ['Void Fill'], 'A');
for (let i = 1; i <= 20; i++) {
  const hue = Math.floor(rnd(0, 360));
  addM(`m-custom${i}`, `Custom ${i}`, i % 3 === 0 ? 'Tonal' : i % 3 === 1 ? 'Solid' : 'Procedural', `hsl(${hue} 42% 46%)`, ['Space Fill'], i % 5 === 0 ? 'C' : 'A');
}
function matById(id) { return M.find(m => m.id === id); }

/* ══ SEED CELLS ══════════════════════════════════════════════════ */
function seedCells() {
  const seed = [
    ['Living', 'living', 'Public', 28],
    ['Kitchen', 'service', 'Shared', 12],
    ['Bedroom', 'sleep', 'Private', 16],
    ['Bath', 'service', 'Private', 5],
    ['Terrace', 'outdoor', 'Shared', 18],
    ['Study', 'work', 'Private', 9],
    ['Hall', 'circulation', 'Public', 8],
  ];
  seed.forEach(([nm, cat, priv, area], i) => {
    const ang = (i / seed.length) * Math.PI * 2;
    S.cells.push({
      id: uid('c'), name: nm, category: cat, privacy: priv, area,
      x: Math.cos(ang) * 190, y: Math.sin(ang) * 190,
      kind: 'space', materialId: 'm-clay', locked: false,
    });
  });
  S.cells.push({ id: uid('c'), name: 'Light Well', category: 'outdoor', privacy: 'Public', area: 6, x: 40, y: -20, kind: 'void', materialId: 'm-void', locked: false });
}
seedCells();

const PX_PER_M = 8.6;
function cellR(area) { return Math.sqrt(Math.max(area, 1) / Math.PI) * PX_PER_M * 0.62 + 14; }

/* ══ DOM refs ════════════════════════════════════════════════════ */
const D = {};
['stage', 'world', 'grid-layer', 'top', 'rail', 'subrail', 'sub-body', 'sub-title',
 'material-rail', 'mr-scroll', 'mr-target', 'inspector', 'insp-body', 'insp-obj-name',
 'common-rail', 'cr-inner', 'dock-left', 'dock-right', 'add-space', 'add-tray', 'add-more-tray',
 'project-drawer', 'drawer-scrim', 'drawer-content', 'template-gallery', 'tg-body',
 'material-browser', 'mb-body', 'export-builder', 'eb-body', 'download-center', 'dc-body',
 'notification-stack', 'upload-overlay', 'upload-hint', 'ctx-blank', 'radial', 'cell-editor',
 'ce-name', 'ce-area', 'tip', 'toast-stack', 'data-body', 'dash-body', 'ws-data', 'ws-dashboard',
 'inbox-badge', 'mode-label', 'project-name-btn', 'cl-floor-name'
].forEach(id => D[id.replace(/-/g, '_')] = qs('#' + id));

/* ══ tooltip ═════════════════════════════════════════════════════ */
let tipT;
document.addEventListener('pointerover', e => {
  const t = e.target.closest('[data-tip]');
  if (!t) return;
  clearTimeout(tipT);
  tipT = setTimeout(() => {
    D.tip.textContent = t.dataset.tip;
    const r = t.getBoundingClientRect();
    D.tip.style.left = clamp(r.left + r.width / 2, 40, innerWidth - 40) + 'px';
    D.tip.style.top = (r.top - 8) + 'px';
    D.tip.style.transform = 'translate(-50%,-100%)';
    D.tip.classList.add('show');
  }, 380);
});
document.addEventListener('pointerout', e => {
  if (e.target.closest('[data-tip]')) { clearTimeout(tipT); D.tip.classList.remove('show'); }
});

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  D.toast_stack.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

/* ══ CAMERA (V1 pattern) ═══════════════════════════════════════ */
function applyCam() {
  D.world.style.transform = `translate(${S.camera.x}px,${S.camera.y}px) scale(${S.camera.scale})`;
  D.grid_layer.style.setProperty('--g-px', (S.camera.x % 999) + 'px');
  D.grid_layer.style.setProperty('--g-py', (S.camera.y % 999) + 'px');
}
function toWorld(cx, cy) {
  const r = D.stage.getBoundingClientRect();
  return { x: (cx - r.left - S.camera.x) / S.camera.scale, y: (cy - r.top - S.camera.y) / S.camera.scale };
}
function zoomAt(cx, cy, factor) {
  const before = toWorld(cx, cy);
  S.camera.scale = clamp(S.camera.scale * factor, 0.32, 2.6);
  const after = toWorld(cx, cy);
  S.camera.x += (after.x - before.x) * S.camera.scale;
  S.camera.y += (after.y - before.y) * S.camera.scale;
  applyCam();
}
function fitView() {
  const r = D.stage.getBoundingClientRect();
  S.camera = { x: r.width / 2, y: r.height / 2, scale: 1 };
  applyCam();
}
fitView();

D.stage.addEventListener('wheel', e => {
  if (S.workspace !== 'canvas') return;
  e.preventDefault();
  zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.08 : 0.93);
}, { passive: false });

let panning = null;
D.stage.addEventListener('pointerdown', e => {
  if (e.target !== D.stage && e.target !== D.grid_layer) return;
  closeAllMenus();
  select(null);
  panning = { x: e.clientX, y: e.clientY, cx: S.camera.x, cy: S.camera.y };
  D.stage.classList.add('panning');
  D.stage.setPointerCapture(e.pointerId);
});
D.stage.addEventListener('pointermove', e => {
  if (!panning) return;
  S.camera.x = panning.cx + (e.clientX - panning.x);
  S.camera.y = panning.cy + (e.clientY - panning.y);
  applyCam();
});
D.stage.addEventListener('pointerup', () => { panning = null; D.stage.classList.remove('panning'); });
D.stage.addEventListener('contextmenu', e => {
  if (e.target === D.stage || e.target === D.grid_layer) { e.preventDefault(); openBlankMenu(e.clientX, e.clientY); }
});

/* ══ CELL RENDER + DRAG ═════════════════════════════════════════ */
function renderCells() {
  D.world.innerHTML = '';
  S.cells.forEach(c => D.world.appendChild(renderCell(c)));
  syncRelLines();
}
function renderCell(c) {
  const r = cellR(c.area);
  const el = document.createElement('div');
  el.className = 'cell' + (c.kind === 'void' ? ' is-void' : '') + (S.activeQV.morph ? ' morph-field' : '');
  el.style.left = (c.x - r) + 'px'; el.style.top = (c.y - r) + 'px';
  el.style.width = el.style.height = r * 2 + 'px';
  el.dataset.id = c.id;
  const mat = matById(c.materialId);
  if (c.kind !== 'void') {
    const bg = mat && mat.color.startsWith('#') ? mat.color : (mat ? mat.color : '#C4553B');
    el.style.background = bg;
    if (S.autoContrast && mat && mat.color.startsWith('#')) el.classList.add(autoContrast(mat.color));
    else el.classList.add('light-label');
  }
  if (S.activeQV.labels) {
    el.innerHTML = `<span class="nm">${c.name}</span><span class="ar mono">${c.area} m²</span>`;
  }
  if (S.selected.has(c.id)) el.classList.add('selected');
  bindCell(el, c);
  return el;
}
function bindCell(el, c) {
  let drag = null, moved = false, tapTimer = null;
  el.addEventListener('pointerdown', e => {
    e.stopPropagation();
    if (e.button === 2) return;
    closeAllMenus();
    drag = { sx: e.clientX, sy: e.clientY, ox: c.x, oy: c.y };
    moved = false;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = (e.clientX - drag.sx) / S.camera.scale, dy = (e.clientY - drag.sy) / S.camera.scale;
    if (Math.hypot(dx, dy) > 3) moved = true;
    if (!moved) return;
    c.x = drag.ox + dx; c.y = drag.oy + dy;
    el.style.left = (c.x - cellR(c.area)) + 'px'; el.style.top = (c.y - cellR(c.area)) + 'px';
    syncRelLines();
    if (S.selected.has(c.id) && S.selected.size > 1) {
      const ddx = dx, ddy = dy;
      S.selected.forEach(id => { if (id === c.id) return; const oc = S.cells.find(x => x.id === id); if (!oc) return; });
    }
    positionCompactTable();
  });
  el.addEventListener('pointerup', e => {
    drag = null;
    if (!moved) {
      if (tapTimer) { clearTimeout(tapTimer); tapTimer = null; openEditor(c, el); }
      else { tapTimer = setTimeout(() => { tapTimer = null; select(c.id, e.shiftKey); }, 220); }
    }
  });
  el.addEventListener('contextmenu', e => {
    e.preventDefault(); e.stopPropagation();
    select(c.id);
    openRadial(c, e.clientX, e.clientY);
  });
}
function select(id, additive) {
  if (id == null) { S.selected.clear(); S.primary = null; }
  else if (additive) { S.selected.has(id) ? S.selected.delete(id) : S.selected.add(id); S.primary = id; }
  else { S.selected.clear(); S.selected.add(id); S.primary = id; }
  qsa('.cell').forEach(el => el.classList.toggle('selected', S.selected.has(el.dataset.id)));
  renderInspector();
  renderCommonRail();
}
function syncRelLines() {}

/* ── smart add: near selection / cluster / view centre, avoid overlap ── */
function smartPoint() {
  if (S.primary) { const c = S.cells.find(x => x.id === S.primary); if (c) return { x: c.x + rnd(60, 100), y: c.y + rnd(-40, 40) }; }
  if (S.cells.length) {
    const cx = S.cells.reduce((a, c) => a + c.x, 0) / S.cells.length;
    const cy = S.cells.reduce((a, c) => a + c.y, 0) / S.cells.length;
    return { x: cx + rnd(-60, 60), y: cy + rnd(-60, 60) };
  }
  return { x: 0, y: 0 };
}
function addSpace(kind) {
  kind = kind || 'space';
  const p = smartPoint();
  const c = { id: uid('c'), name: kind === 'void' ? 'New Void' : 'New Space', category: 'living', privacy: 'Public', area: kind === 'void' ? 6 : 10, x: p.x, y: p.y, kind, materialId: kind === 'void' ? 'm-void' : 'm-clay', locked: false };
  S.cells.push(c);
  renderCells();
  select(c.id);
  toast((kind === 'void' ? 'Void' : 'Space') + ' added');
}
function addMultiSpaces(n) {
  const base = smartPoint();
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    S.cells.push({ id: uid('c'), name: 'Space ' + (S.cells.length + 1), category: 'living', privacy: 'Public', area: 9, x: base.x + Math.cos(ang) * 70, y: base.y + Math.sin(ang) * 70, kind: 'space', materialId: 'm-clay', locked: false });
  }
  renderCells();
  toast(n + ' spaces added');
}

/* ══ RADIAL (empty centre — V1 contract, unchanged) ═════════════ */
const RADIAL_ACTIONS = [
  ['edit', 'i-edit', 'Edit'], ['materials', 'i-materials', 'Materials'], ['boundary', 'i-boundary', 'Boundary'],
  ['duplicate', 'i-duplicate', 'Duplicate'], ['lock', 'i-lock', 'Lock'], ['delete', 'i-delete', 'Delete', true],
  ['group', 'i-group', 'Group'], ['more', 'i-more', 'More'],
];
function openRadial(c, cx, cy) {
  const rad = D.radial;
  rad.innerHTML = '';
  rad.style.left = cx + 'px'; rad.style.top = cy + 'px';
  const R = 84, n = RADIAL_ACTIONS.length;
  RADIAL_ACTIONS.forEach(([act, ic, label, danger], i) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
    let tx = Math.cos(ang) * R, ty = Math.sin(ang) * R;
    if (cx + tx < 60) tx += 60 - (cx + tx); if (cx + tx > innerWidth - 60) tx -= (cx + tx) - (innerWidth - 60);
    if (cy + ty < 60) ty += 60 - (cy + ty); if (cy + ty > innerHeight - 100) ty -= (cy + ty) - (innerHeight - 100);
    const b = document.createElement('button');
    b.className = 'rb' + (danger ? ' danger' : '');
    b.style.setProperty('--tx', tx + 'px'); b.style.setProperty('--ty', ty + 'px'); b.style.setProperty('--d', (i * 22) + 'ms');
    b.dataset.tip = label;
    b.innerHTML = `<svg><use href="#${ic}"/></svg>`;
    b.onclick = ev => { ev.stopPropagation(); radialAction(act, c); closeRadial(); };
    rad.appendChild(b);
  });
  rad.hidden = false; rad.classList.remove('closing');
  rad.style.pointerEvents = 'none';
  setTimeout(() => { rad.style.pointerEvents = ''; }, 460);
  requestAnimationFrame(() => requestAnimationFrame(() => rad.classList.add('open')));
}
function closeRadial() {
  const rad = D.radial;
  if (rad.hidden) return;
  rad.classList.remove('open'); rad.classList.add('closing');
  setTimeout(() => { rad.hidden = true; }, 340);
}
function radialAction(act, c) {
  if (act === 'delete') { S.cells = S.cells.filter(x => x.id !== c.id); select(null); renderCells(); toast('Deleted'); }
  else if (act === 'duplicate') { const nc = { ...c, id: uid('c'), x: c.x + 26, y: c.y + 26, name: c.name + ' Copy' }; S.cells.push(nc); renderCells(); select(nc.id); toast('Duplicated'); }
  else if (act === 'lock') { c.locked = !c.locked; toast(c.locked ? 'Locked' : 'Unlocked'); }
  else if (act === 'materials') { setDock('materials'); }
  else if (act === 'edit') { const el = qs(`.cell[data-id="${c.id}"]`); openEditor(c, el); }
  else if (act === 'more') { openBlankMenu(event ? event.clientX : innerWidth / 2, event ? event.clientY : innerHeight / 2, true); }
  else toast(RADIAL_ACTIONS.find(a => a[0] === act)[2] + ' (future)');
}

/* ══ BLANK MENU (compact dropdown — never radial) ═══════════════ */
const BLANK_ITEMS = [
  ['space', 'i-space', 'Add Space', 'A'], ['void', 'i-void', 'Add Void', '⌥A'],
  ['label', 'i-label', 'Add Label'], ['relationship', 'i-connect', 'Add Relationship'],
  ['text', 'i-note', 'Add Note'], ['__sep'],
  ['paste', 'i-copy', 'Paste', '⌘V'], ['import', 'i-upload', 'Import File'], ['__sep'],
  ['view', 'i-fullscreen', 'View', null, true], ['tools', 'i-commands', 'Tools', null, true],
];
function openBlankMenu(cx, cy) {
  const m = D.ctx_blank; m.innerHTML = '';
  BLANK_ITEMS.forEach(item => {
    if (item[0] === '__sep') { const s = document.createElement('div'); s.className = 'msep'; m.appendChild(s); return; }
    const [act, ic, label, key, chev] = item;
    const b = document.createElement('button'); b.className = 'mi';
    b.innerHTML = `<svg><use href="#${ic}"/></svg><span class="sp">${label}</span>${key ? `<kbd class="key">${key}</kbd>` : ''}${chev ? '<svg class="sub"><use href="#i-chevron"/></svg>' : ''}`;
    b.onclick = () => { blankAction(act); closeAllMenus(); };
    m.appendChild(b);
  });
  m.style.left = clamp(cx, 8, innerWidth - 248) + 'px';
  m.style.top = clamp(cy, 8, innerHeight - 320) + 'px';
  m.hidden = false;
}
function blankAction(act) {
  if (act === 'space') addSpace('space');
  else if (act === 'void') addSpace('void');
  else if (act === 'import') toast('Whole-canvas upload — drop a file anywhere');
  else toast(act[0].toUpperCase() + act.slice(1) + ' (future)');
}
function closeAllMenus() { D.ctx_blank.hidden = true; closeRadial(); closeEditor(); D.add_tray.hidden = true; D.add_more_tray.hidden = true; }
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('#ctx-blank') && !e.target.closest('#radial')) { D.ctx_blank.hidden = true; }
  if (!e.target.closest('#add-tray') && !e.target.closest('#add-space')) D.add_tray.hidden = true;
  if (!e.target.closest('#add-more-tray') && !e.target.closest('#add-more')) D.add_more_tray.hidden = true;
});

/* ══ CELL EDITOR (tiny name+area bar) ═══════════════════════════ */
let editingCell = null;
function openEditor(c, el) {
  editingCell = c;
  const r = el.getBoundingClientRect();
  D.cell_editor.style.left = clamp(r.left + r.width / 2 - 90, 8, innerWidth - 190) + 'px';
  D.cell_editor.style.top = (r.bottom + 8) + 'px';
  D.ce_name.value = c.name; D.ce_area.value = c.area;
  D.cell_editor.hidden = false;
  D.ce_name.focus(); D.ce_name.select();
}
function commitEditor() {
  if (!editingCell) return;
  editingCell.name = D.ce_name.value || editingCell.name;
  const a = parseFloat(D.ce_area.value);
  if (!isNaN(a) && a > 0) editingCell.area = a;
  renderCells(); select(editingCell.id); closeEditor();
}
function closeEditor() { D.cell_editor.hidden = true; editingCell = null; }
qs('#ce-ok').onclick = commitEditor;
[D.ce_name, D.ce_area].forEach(inp => inp.addEventListener('keydown', e => {
  if (e.key === 'Enter') commitEditor(); if (e.key === 'Escape') closeEditor();
}));

/* ══ TOP CLUSTERS ════════════════════════════════════════════════ */
qs('#drawer-launcher').onclick = () => openDrawer();
qs('#floor-prev').onclick = () => { S.floor.idx = (S.floor.idx - 1 + S.floor.list.length) % S.floor.list.length; syncFloor(); };
qs('#floor-next').onclick = () => { S.floor.idx = (S.floor.idx + 1) % S.floor.list.length; syncFloor(); };
qs('#floor-add').onclick = () => { S.floor.list.push('Floor ' + (S.floor.list.length + 1)); S.floor.idx = S.floor.list.length - 1; syncFloor(); toast('Floor added'); };
function syncFloor() { D.cl_floor_name.textContent = S.floor.list[S.floor.idx]; }
qs('#undo-btn').onclick = () => toast('Undo');
qs('#redo-btn').onclick = () => toast('Redo');
qs('#history-btn').onclick = () => { setRail('history'); };
qsa('.qv').forEach(b => b.onclick = () => {
  const k = b.dataset.qv;
  if (k === 'fullscreen') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); return; }
  S.activeQV[k] = !S.activeQV[k];
  b.classList.toggle('on', S.activeQV[k]);
  if (k === 'grid') { D.grid_layer.classList.toggle('g-off', !S.activeQV.grid); }
  if (k === 'morph' || k === 'labels') renderCells();
});
qs('#qv-more').onclick = () => toast('More View: Day/Night, Transparent Canvas, Connection/Markup visibility, Core Dot, Interface Scale, Widget Scale, Performance Quality, Reset View');
qs('#mode-switch').onclick = () => {
  S.mode = S.mode === 'day' ? 'night' : 'day';
  document.body.dataset.mode = S.mode;
  D.mode_label.textContent = S.mode === 'day' ? 'Day' : 'Night';
};
qs('#export-btn').onclick = () => openPanel('export-builder');
qs('#inbox-btn').onclick = () => openPanel('download-center');
qs('#account-btn').onclick = () => toast('Account: profile · dashboard · plan · usage · billing · settings · sign out');
qs('#project-name-btn').onclick = () => toast('Project menu: rename · save · save as · open · duplicate · settings · info · recovery · close');
syncFloor();

/* ══ LEFT RAIL + CONTEXTUAL SUBRAIL ══════════════════════════════ */
const SUB_CONTENT = {
  canvas: { title: 'CANVAS', items: [
    ['Current Floor', 'i-floors'], ['Saved Views', 'i-scenes'], ['Selection Filters', 'i-select'],
    ['Object Visibility', 'i-labels'], ['Canvas Settings', 'i-commands'], ['Fit All', 'i-fullscreen', 'F'],
    ['Fit Selection', 'i-fullscreen', '⇧F'], ['Reset View', 'i-history'],
  ] },
  data: { title: 'DATA / TABLE', groups: [
    ['Table Mode', [['Full Detailed Table', 'i-data'], ['Canvas + Bottom Table', 'i-data'], ['Canvas + Right Table', 'i-data'], ['Compact Overlay', 'i-data']]],
    ['', [['Search', 'i-search'], ['Filter', 'i-commands'], ['Columns', 'i-layers'], ['Import', 'i-upload'], ['AI Fill', 'i-datatag']]],
  ] },
  dashboard: { title: 'DASHBOARD', items: [
    ['Overview', 'i-dashboard'], ['Programme', 'i-data'], ['Relationships', 'i-connect'],
    ['Circulation', 'i-arrange'], ['Fields', 'i-grid'], ['Materials', 'i-materials'],
    ['Data Health', 'i-warn'], ['Reports', 'i-export'],
  ] },
  templates: { title: 'TEMPLATES', items: [
    ['Featured', 'i-favourite'], ['Recent', 'i-history'], ['Full Templates', 'i-templates'],
    ['Style Presets', 'i-materials'], ['Arrangement Presets', 'i-arrange'],
    ['Behaviour Presets', 'i-connect'], ['Presentation Presets', 'i-present'],
  ] },
  floors: { title: 'FLOORS', items: [['Add Floor', 'i-add-floor'], ['Rename', 'i-edit'], ['Duplicate', 'i-duplicate'], ['Reorder', 'i-arrange'], ['Show/Hide', 'i-labels'], ['Solo', 'i-select'], ['Lock', 'i-lock'], ['Compare', 'i-data']] },
  scenes: { title: 'SCENES', items: [['Save Current', 'i-scenes'], ['Update', 'i-check'], ['Duplicate', 'i-duplicate'], ['Rename', 'i-edit'], ['Transition', 'i-motion'], ['Delete', 'i-delete']] },
  layers: { title: 'LAYERS', items: [['Spaces', 'i-space'], ['Voids', 'i-void'], ['Morph', 'i-morph'], ['Relationships', 'i-connect'], ['Labels', 'i-label'], ['Notes', 'i-note'], ['Markup', 'i-markup'], ['Panels', 'i-panel'], ['Grid', 'i-grid'], ['Frames', 'i-frame']] },
  history: { title: 'HISTORY', items: [['Undo', 'i-undo'], ['Redo', 'i-redo'], ['Recent Actions', 'i-history'], ['Named Checkpoints', 'i-scenes'], ['Recovery', 'i-warn'], ['Version History', 'i-history']] },
  files: { title: 'FILES', items: [['New', 'i-frame'], ['Open', 'i-files'], ['Save', 'i-check'], ['Save As', 'i-duplicate'], ['Duplicate Project', 'i-duplicate'], ['Import', 'i-upload'], ['Export', 'i-export'], ['Project Settings', 'i-commands'], ['Close', 'i-close']] },
  commands: { title: 'COMMANDS', items: [['Command Palette', 'i-commands', '⌘K']] },
  shortcuts: { title: 'SHORTCUTS', items: [['Open Shortcuts Sheet', 'i-shortcuts', '?']] },
  learn: { title: 'LEARN', items: [['Getting Started', 'i-learn'], ['Guides', 'i-files'], ['Video Library', 'i-play']] },
  help: { title: 'HELP', items: [['Documentation', 'i-help'], ['Contact Support', 'i-account']] },
  feedback: { title: 'FEEDBACK', items: [['Send Feedback', 'i-feedback']] },
};
function setRail(key) {
  qsa('.rw').forEach(b => b.classList.toggle('active', b.dataset.rail === key));
  if (['canvas', 'data', 'dashboard'].includes(key)) setWorkspace(key);
  S.railContext = key;
  buildSubrail(key);
}
function buildSubrail(key) {
  const cfg = SUB_CONTENT[key];
  if (!cfg) { D.subrail.hidden = true; document.body.dataset.subrailOpen = 'false'; return; }
  document.body.dataset.subrailOpen = 'true';
  D.sub_title.textContent = cfg.title;
  D.sub_body.innerHTML = '';
  const renderItem = ([label, ic, shortcut]) => {
    const b = document.createElement('button'); b.className = 'sub-item';
    b.innerHTML = `<svg><use href="#${ic}"/></svg><span>${label}</span>${shortcut ? `<span class="sub-shortcut mono">${shortcut}</span>` : ''}`;
    b.onclick = () => { qsa('.sub-item', D.sub_body).forEach(x => x.classList.remove('active')); b.classList.add('active'); handleSubAction(key, label); };
    return b;
  };
  if (cfg.groups) {
    cfg.groups.forEach(([cap, items]) => {
      if (cap) { const c = document.createElement('div'); c.className = 'cap sub-cap'; c.textContent = cap; D.sub_body.appendChild(c); }
      items.forEach(it => D.sub_body.appendChild(renderItem(it)));
    });
  } else {
    cfg.items.forEach(it => D.sub_body.appendChild(renderItem(it)));
  }
  D.subrail.hidden = false;
}
function handleSubAction(rail, label) {
  if (rail === 'canvas' && label === 'Fit All') fitView();
  else if (rail === 'canvas' && label === 'Reset View') fitView();
  else if (rail === 'data') { const mode = label.match(/Full Detailed|Bottom Table|Right Table|Compact Overlay/); if (mode) toast('Data layout → ' + label); if (label === 'AI Fill') { setWorkspace('data'); setDataTab('metadata'); } }
  else if (rail === 'templates') openPanel(null, 'template-gallery');
  else toast(label);
}
qsa('.rw').forEach(b => b.onclick = () => setRail(b.dataset.rail));
qs('#subrail-close').onclick = () => { D.subrail.hidden = true; document.body.dataset.subrailOpen = 'false'; qsa('.rw').forEach(b => b.classList.remove('active')); qs('.rw[data-rail="canvas"]').classList.add('active'); };
setRail('canvas');

function setWorkspace(w) {
  S.workspace = w;
  document.body.dataset.workspace = w;
  D.ws_data.dataset.open = String(w === 'data');
  D.ws_dashboard.dataset.open = String(w === 'dashboard');
  if (w === 'data') buildDataWorkspace();
  if (w === 'dashboard') buildDashboard();
}

/* ══ RIGHT MATERIAL RAIL ═════════════════════════════════════════ */
function buildMaterialRail() {
  D.mr_target.textContent = S.matTarget;
  D.mr_scroll.innerHTML = '';
  const list = M.filter(m => m.targets.includes(S.matTarget));
  list.slice(0, 26).forEach(m => {
    const s = document.createElement('div'); s.className = 'mr-swatch' + (m.id === S.activeMaterialId ? ' active' : '') + (S.matFav.has(m.id) ? ' fav' : '');
    s.style.background = m.color; s.dataset.tip = m.name;
    s.innerHTML = '<span class="fav-dot"></span>';
    s.onmouseenter = () => magnify(s, D.mr_scroll, true);
    s.onclick = () => applyMaterial(m.id);
    s.oncontextmenu = e => { e.preventDefault(); S.matFav.has(m.id) ? S.matFav.delete(m.id) : S.matFav.add(m.id); s.classList.toggle('fav'); };
    D.mr_scroll.appendChild(s);
  });
}
D.mr_scroll.addEventListener('mousemove', e => magnify(null, D.mr_scroll, false, e));
D.mr_scroll.addEventListener('mouseleave', () => qsa('.mr-swatch', D.mr_scroll).forEach(s => s.style.transform = ''));
function magnify(target, rail, hover, e) {
  const items = qsa('.mr-swatch', rail);
  const my = e ? e.clientY : (target ? target.getBoundingClientRect().top + 17 : 0);
  items.forEach(it => {
    const r = it.getBoundingClientRect();
    const d = Math.abs((r.top + r.height / 2) - my);
    const amp = 0.55 * Math.exp(-(d * d) / (2 * 44 * 44));
    it.style.transform = `scale(${1 + amp}) translateX(${-amp * 10}px)`;
  });
}
function applyMaterial(id) {
  S.activeMaterialId = id;
  if (!S.matRecent.includes(id)) S.matRecent.unshift(id);
  if (S.selected.size) {
    S.selected.forEach(sid => { const c = S.cells.find(x => x.id === sid); if (c) c.materialId = id; });
    renderCells(); select([...S.selected][0]);
  }
  buildMaterialRail();
  toast('Material applied: ' + matById(id).name);
}
qs('#mr-more').onclick = () => openPanel(null, 'material-browser', buildMaterialBrowser);
buildMaterialRail();

/* ══ MATERIAL BROWSER (adapted from V1 studio browser, half-screen) ══ */
const MBR_CATS = ['All', 'Solid', 'Gradient', 'Texture', 'Pattern', 'Shader', 'Tonal', 'Procedural', 'Favourites'];
let mbrCat = 'All', mbrQuery = '';
function buildMaterialBrowser() {
  const wrap = document.createElement('div'); wrap.className = 'mbrowser';
  const search = document.createElement('div'); search.className = 'mbr-search';
  search.innerHTML = `<svg><use href="#i-search"/></svg><input placeholder="Search materials" />`;
  search.querySelector('input').oninput = e => { mbrQuery = e.target.value.toLowerCase(); renderMbrGrid(grid); };
  const cats = document.createElement('div'); cats.className = 'mbr-cats';
  MBR_CATS.forEach(c => {
    const b = document.createElement('button'); b.className = 'mbr-cat' + (c === mbrCat ? ' active' : ''); b.textContent = c;
    b.onclick = () => { mbrCat = c; qsa('.mbr-cat', cats).forEach(x => x.classList.remove('active')); b.classList.add('active'); renderMbrGrid(grid); };
    cats.appendChild(b);
  });
  const grid = document.createElement('div'); grid.className = 'mbr-grid';
  wrap.append(search, cats, grid);
  D.mb_body.innerHTML = ''; D.mb_body.appendChild(wrap);
  renderMbrGrid(grid);
}
function renderMbrGrid(grid) {
  grid.innerHTML = '';
  M.filter(m => (mbrCat === 'All' || (mbrCat === 'Favourites' ? S.matFav.has(m.id) : m.cat === mbrCat)) && m.name.toLowerCase().includes(mbrQuery))
    .forEach(m => {
      const w = document.createElement('div'); w.className = 'mbr-orb-wrap' + (m.id === S.activeMaterialId ? ' active' : '');
      w.innerHTML = `<div class="mbr-orb" style="background:${m.color}"></div><div class="mbr-nm">${m.name}</div>`;
      w.onclick = () => { applyMaterial(m.id); renderMbrGrid(grid); };
      grid.appendChild(w);
    });
}

/* ══ RIGHT INSPECTOR ═════════════════════════════════════════════ */
qs('#insp-pin').onclick = () => { S.inspectorPinned = !S.inspectorPinned; document.body.dataset.inspectorPinned = String(S.inspectorPinned); qs('#insp-pin').classList.toggle('on', S.inspectorPinned); D.inspector.classList.toggle('floating', !S.inspectorPinned); };
qs('#insp-close').onclick = () => { D.inspector.hidden = true; D.material_rail.hidden = true; };
function renderInspector() {
  const c = S.primary ? S.cells.find(x => x.id === S.primary) : null;
  if (!c) {
    D.inspector.hidden = true; D.material_rail.hidden = true;
    D.common_rail.hidden = true;
    return;
  }
  D.inspector.hidden = false;
  D.material_rail.hidden = false;
  S.matTarget = 'Space Fill'; buildMaterialRail();
  D.insp_obj_name.textContent = c.kind === 'void' ? 'Void' : 'Space';
  const mat = matById(c.materialId);
  D.insp_body.innerHTML = `
    <div class="insp-sec">
      <div class="insp-sec-hd">Essentials</div>
      <div class="insp-row2"><label>Name</label><input class="txt" id="iv-name" value="${c.name}"></div>
      <div class="insp-row2"><label>Area</label><input class="txt" id="iv-area" style="max-width:70px" value="${c.area}"><span class="val2">m²</span></div>
      <div class="insp-row2"><label>Category</label>
        <select id="iv-cat" class="cr-chip-select" style="flex:1">${CATS.map(ct => `<option value="${ct.id}" ${ct.id === c.category ? 'selected' : ''}>${ct.label}</option>`).join('')}</select>
      </div>
      <div class="insp-row2"><label>Privacy</label>
        <select id="iv-priv" class="cr-chip-select" style="flex:1">${PRIV.map(p => `<option ${p === c.privacy ? 'selected' : ''}>${p}</option>`).join('')}</select>
      </div>
      <div class="insp-row2"><label>Floor</label><span class="val2" style="margin-left:0">${S.floor.list[S.floor.idx]}</span></div>
    </div>
    <div class="insp-sec">
      <div class="insp-sec-hd">Appearance</div>
      <div class="insp-row2"><label>Material</label><span class="val2" style="margin-left:0">${mat ? mat.name : '—'}</span></div>
      <div class="insp-row2"><label>Core Dot</label><div class="seg mini" id="iv-coredot"><button data-v="off" class="active">Off</button><button data-v="auto">Auto</button><button data-v="material">Material</button></div></div>
      <div class="insp-row2"><label>Label Scale</label><div class="seg mini" id="iv-labelscale"><button data-v="screen" class="active">Screen</button><button data-v="adaptive">Adaptive</button><button data-v="world">World</button></div></div>
    </div>
    <div class="insp-sec">
      <div class="insp-sec-hd">Behaviour</div>
      <div class="insp-row2"><label>Solid+Solid</label><span class="val2" style="margin-left:0">Keep Clear</span></div>
      <div class="insp-row2"><label>Min Gap</label><input type="range" class="rng" min="0" max="40" value="12"><span class="val2">12px</span></div>
    </div>
    <div class="insp-sec">
      <div class="insp-sec-hd advanced" id="iv-adv-hd"><svg><use href="#i-chevron"/></svg>Advanced</div>
      <div class="insp-adv-body" id="iv-adv-body">
        <div class="insp-row2"><label>Locked</label><button class="tgl${c.locked ? ' on' : ''}" id="iv-locked" style="margin-left:auto"></button></div>
        <div class="insp-row2"><label>Relationships</label><span class="val2" style="margin-left:0">${relCountFor(c.id)}</span></div>
        <div class="insp-row2"><label>Warning</label><span class="val2" style="margin-left:0">${c.area <= 0 ? 'Missing area' : 'None'}</span></div>
      </div>
    </div>
    <div class="insp-actions2">
      <button id="iv-dup"><svg><use href="#i-duplicate"/></svg>Duplicate</button>
      <button id="iv-del" class="danger"><svg><use href="#i-delete"/></svg>Delete</button>
    </div>`;
  qs('#iv-name').onchange = e => { c.name = e.target.value; renderCells(); select(c.id); };
  qs('#iv-area').onchange = e => { const a = parseFloat(e.target.value); if (a > 0) { c.area = a; renderCells(); select(c.id); } };
  qs('#iv-cat').onchange = e => { c.category = e.target.value; };
  qs('#iv-priv').onchange = e => { c.privacy = e.target.value; };
  qs('#iv-adv-hd').onclick = () => { qs('#iv-adv-hd').classList.toggle('open'); qs('#iv-adv-body').classList.toggle('open'); };
  qsa('.seg.mini button', D.insp_body).forEach(b => b.onclick = () => { qsa('button', b.parentElement).forEach(x => x.classList.remove('active')); b.classList.add('active'); });
  qs('#iv-locked').onclick = () => { c.locked = !c.locked; qs('#iv-locked').classList.toggle('on', c.locked); };
  qs('#iv-dup').onclick = () => radialAction('duplicate', c);
  qs('#iv-del').onclick = () => radialAction('delete', c);
}
function relCountFor() { return 0; }

/* ══ COMMON CONTEXT RAIL ═════════════════════════════════════════ */
function renderCommonRail() {
  const c = S.primary ? S.cells.find(x => x.id === S.primary) : null;
  if (!c && S.activeDock === 'select') { D.common_rail.hidden = true; return; }
  D.common_rail.hidden = false;
  const mode = c ? (c.kind === 'void' ? 'void' : 'space') : S.activeDock;
  D.cr_inner.innerHTML = renderCrContent(mode, c);
  wireCrContent(mode, c);
}
function renderCrContent(mode, c) {
  if (mode === 'space' && c) return `
    <div class="cr-field"><label>Name</label><input class="txt" id="cr-name" value="${c.name}"></div>
    <div class="cr-field"><label>Area</label><input class="num" id="cr-area" value="${c.area}"></div>
    <div class="cr-field"><label>Category</label><select id="cr-cat" class="cr-chip-select">${CATS.map(ct => `<option value="${ct.id}" ${ct.id === c.category ? 'selected' : ''}>${ct.label}</option>`).join('')}</select></div>
    <div class="cr-field"><label>Privacy</label><select id="cr-priv" class="cr-chip-select">${PRIV.map(p => `<option ${p === c.privacy ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
    <div class="cr-sep2"></div>
    <button class="cr-btn" id="cr-addanother"><svg><use href="#i-space"/></svg>Add Another</button>`;
  if (mode === 'void' && c) return `
    <div class="cr-field"><label>Type</label><span class="mono">Subtractive</span></div>
    <div class="cr-field"><label>Area</label><input class="num" id="cr-area" value="${c.area}"></div>
    <div class="cr-sep2"></div>
    <button class="cr-btn"><svg><use href="#i-void"/></svg>Subtract</button>
    <button class="cr-btn">Buffer</button>`;
  if (mode === 'materials') return `
    <div class="cr-field"><label>Target</label><select class="cr-chip-select">${ALL_T.map(t => `<option ${t === S.matTarget ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    ${M.slice(0, 10).map(m => `<div class="cr-mini-swatch" style="background:${m.color}" data-mid="${m.id}"></div>`).join('')}
    <div class="cr-sep2"></div>
    <button class="cr-btn" id="cr-more-mat">More</button>`;
  if (mode === 'arrange') return `
    ${['Horizontal', 'Vertical', 'Grid', 'Arc', 'Radial', 'Spiral', 'Cluster'].map(p => `<div class="cr-arrange-icon" data-tip="${p}" data-preset="${p}"><svg><use href="#i-arrange"/></svg></div>`).join('')}
    <div class="cr-sep2"></div>
    <div class="cr-field"><label>Spacing</label><input type="range" class="rng" style="width:70px" min="0" max="40" value="12"></div>
    <button class="cr-btn primary" id="cr-apply-arr">Apply</button>`;
  if (mode === 'connect') return `
    <button class="cr-btn" data-conn="relationship"><svg><use href="#i-connect"/></svg>Relationship</button>
    <button class="cr-btn" data-conn="visual">Visual Connection</button>
    <button class="cr-btn" data-conn="bridge">Morph Bridge</button>
    <button class="cr-btn" data-conn="behaviour">Cell Behaviour</button>`;
  if (mode === 'markup') return `
    <button class="cr-btn" data-add="label"><svg><use href="#i-label"/></svg>Label</button>
    <button class="cr-btn" data-add="note"><svg><use href="#i-note"/></svg>Note</button>
    <button class="cr-btn">Dimension</button>
    <button class="cr-btn">Symbols</button>`;
  if (mode === 'present') return `
    <div class="cr-field"><label>Scene</label><span class="mono">None</span></div>
    <button class="cr-btn">Visibility</button>
    <button class="cr-btn">Animation</button>
    <button class="cr-btn primary" id="cr-export-open"><svg><use href="#i-export"/></svg>Export</button>`;
  return `<span class="mono" style="color:var(--text-muted)">Selection count: ${S.selected.size}</span><button class="cr-btn">Duplicate</button><button class="cr-btn">Delete</button><button class="cr-btn">Lock</button>`;
}
function wireCrContent(mode, c) {
  const nm = qs('#cr-name'); if (nm) nm.onchange = e => { c.name = e.target.value; renderCells(); select(c.id); };
  const ar = qs('#cr-area'); if (ar) ar.onchange = e => { const a = parseFloat(e.target.value); if (a > 0) { c.area = a; renderCells(); select(c.id); } };
  const cat = qs('#cr-cat'); if (cat) cat.onchange = e => { c.category = e.target.value; };
  const pv = qs('#cr-priv'); if (pv) pv.onchange = e => { c.privacy = e.target.value; };
  const aa = qs('#cr-addanother'); if (aa) aa.onclick = () => addSpace('space');
  qsa('.cr-mini-swatch', D.cr_inner).forEach(s => s.onclick = () => applyMaterial(s.dataset.mid));
  const mm = qs('#cr-more-mat'); if (mm) mm.onclick = () => openPanel(null, 'material-browser', buildMaterialBrowser);
  qsa('.cr-arrange-icon', D.cr_inner).forEach(b => b.onclick = () => { qsa('.cr-arrange-icon', D.cr_inner).forEach(x => x.classList.remove('active')); b.classList.add('active'); });
  const apArr = qs('#cr-apply-arr'); if (apArr) apArr.onclick = () => applyArrangePreset(qs('.cr-arrange-icon.active', D.cr_inner)?.dataset.preset || 'Grid');
  qsa('[data-add]', D.cr_inner).forEach(b => b.onclick = () => toast(b.dataset.add + ' tool active — click canvas to place'));
  qsa('[data-conn]', D.cr_inner).forEach(b => b.onclick = () => toast(b.dataset.conn + ' (future)'));
  const exOpen = qs('#cr-export-open'); if (exOpen) exOpen.onclick = () => openPanel('export-builder');
}
function applyArrangePreset(name) {
  const list = S.cells.filter(c => c.kind !== 'void');
  const n = list.length;
  list.forEach((c, i) => {
    if (name === 'Horizontal') { c.x = (i - n / 2) * 70; c.y = 0; }
    else if (name === 'Vertical') { c.x = 0; c.y = (i - n / 2) * 70; }
    else if (name === 'Grid') { const cols = Math.ceil(Math.sqrt(n)); c.x = (i % cols - cols / 2) * 76; c.y = (Math.floor(i / cols) - cols / 2) * 76; }
    else if (name === 'Arc') { const a = (i / n) * Math.PI - Math.PI / 2; c.x = Math.cos(a) * 190; c.y = Math.sin(a) * 190 - 60; }
    else if (name === 'Radial') { const a = (i / n) * Math.PI * 2; c.x = Math.cos(a) * 170; c.y = Math.sin(a) * 170; }
    else if (name === 'Spiral') { const a = i * 0.9; c.x = Math.cos(a) * (16 * i + 20); c.y = Math.sin(a) * (16 * i + 20); }
    else { const a = (i / n) * Math.PI * 2; c.x = Math.cos(a) * 90 + rnd(-14, 14); c.y = Math.sin(a) * 90 + rnd(-14, 14); }
  });
  renderCells();
  toast('Arrange: ' + name);
}

/* ══ BOTTOM DOCKS ═════════════════════════════════════════════════ */
function setDock(key) {
  S.activeDock = key;
  document.body.dataset.dock = 'expanded';
  S.dockExpanded = true;
  qsa('.dk').forEach(b => b.classList.toggle('active', b.dataset.dk === key));
  renderCommonRail();
}
qsa('.dk').forEach(b => b.onclick = () => setDock(b.dataset.dk));
qs('#add-space').addEventListener('pointerdown', () => { addSpace('space'); });
let addHoldTimer;
qs('#add-space').addEventListener('pointerdown', () => { addHoldTimer = setTimeout(() => { D.add_tray.hidden = false; }, 420); });
qs('#add-space').addEventListener('pointerup', () => clearTimeout(addHoldTimer));
qsa('#add-tray [data-add]').forEach(b => b.onclick = () => {
  const a = b.dataset.add;
  if (a === 'space') addSpace('space');
  else if (a === 'multi') addMultiSpaces(5);
  else if (a === 'void') addSpace('void');
  else if (a === 'upload') openPanel(null, null, () => {}), showUploadOverlay(1400);
  else if (a === 'template') { setRail('templates'); openPanel(null, 'template-gallery'); }
  else if (a === 'more') { D.add_more_tray.hidden = false; }
  if (a !== 'more') D.add_tray.hidden = true;
});
qsa('#add-more-tray [data-add]').forEach(b => b.onclick = () => { toast('Added ' + b.dataset.add); D.add_more_tray.hidden = true; D.add_tray.hidden = true; });

/* ══ PROJECT DRAWER ═══════════════════════════════════════════════ */
const DRAWER_PROJECTS = [
  { name: 'Coastal House', cells: 24, floors: 2, local: false, fav: true, thumb: 'assets/generated-project-01.svg' },
  { name: 'Urban Infill', cells: 41, floors: 3, local: true, fav: false, thumb: 'assets/generated-project-02.svg' },
  { name: 'Pavilion Study', cells: 9, floors: 1, local: false, fav: false, thumb: 'assets/generated-project-03.svg' },
  { name: 'Community Centre', cells: 68, floors: 2, local: true, fav: true, thumb: 'assets/generated-project-04.svg' },
];
function svgThumb(seed) {
  const hues = [12, 210, 92, 320, 160];
  const h = hues[seed % hues.length];
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='200' height='116'><rect width='200' height='116' fill='hsl(${h} 18% 92%)'/><circle cx='${40 + seed * 12}' cy='60' r='22' fill='hsl(${h} 40% 55%)'/><circle cx='120' cy='40' r='16' fill='hsl(${h + 40} 40% 55%)'/><circle cx='150' cy='80' r='12' fill='hsl(${h - 30} 40% 55%)'/></svg>`)}`;
}
function openDrawer() {
  S.drawerOpen = true;
  document.body.dataset.drawer = 'open';
  D.drawer_scrim.hidden = false; requestAnimationFrame(() => D.drawer_scrim.classList.add('show'));
  D.project_drawer.hidden = false; requestAnimationFrame(() => D.project_drawer.classList.add('open'));
  buildDrawerSection('projects');
  qs('.dn[data-dsec="projects"]').focus();
}
function closeDrawer() {
  S.drawerOpen = false;
  document.body.dataset.drawer = '';
  D.project_drawer.classList.remove('open'); D.drawer_scrim.classList.remove('show');
  setTimeout(() => { D.project_drawer.hidden = true; D.drawer_scrim.hidden = true; }, 220);
}
function buildDrawerSection(sec) {
  S.drawerSection = sec;
  qsa('.dn', D.project_drawer).forEach(b => b.classList.toggle('active', b.dataset.dsec === sec));
  const c = D.drawer_content; c.innerHTML = '';
  if (sec === 'projects') {
    c.innerHTML = `<div class="dr-search"><svg><use href="#i-search"/></svg><input placeholder="Search projects"></div>
      <div class="dr-row-cap"><span class="cap">Recent</span></div>
      <div class="dr-scroll" id="dr-recent"></div>
      <div class="dr-row-cap"><span class="cap">Favourites</span></div>
      <div class="dr-scroll" id="dr-fav"></div>`;
    const recent = qs('#dr-recent'), fav = qs('#dr-fav');
    const nc = document.createElement('div'); nc.className = 'dr-newcard'; nc.innerHTML = `<svg><use href="#i-space"/></svg><span class="mono" style="font-size:10px">New Project</span>`;
    nc.onclick = () => { toast('New blank project'); closeDrawer(); };
    recent.appendChild(nc);
    DRAWER_PROJECTS.forEach((p, i) => recent.appendChild(projectCard(p, i)));
    DRAWER_PROJECTS.filter(p => p.fav).forEach((p, i) => fav.appendChild(projectCard(p, i)));
    if (!DRAWER_PROJECTS.some(p => p.fav)) fav.innerHTML = '<div class="dr-empty">No favourites yet.</div>';
  } else if (sec === 'templates') {
    c.innerHTML = '<div class="dr-empty">Browse the full gallery.</div><button class="cr-btn primary" id="dr-open-tg" style="margin-top:10px">Open Template Gallery</button>';
    qs('#dr-open-tg').onclick = () => { closeDrawer(); setRail('templates'); openPanel(null, 'template-gallery'); };
  } else if (sec === 'files') {
    c.innerHTML = ['New', 'Open', 'Save', 'Save As', 'Duplicate Project', 'Import', 'Export'].map(x => `<div class="dr-list-row">${x}</div>`).join('');
  } else if (sec === 'settings') {
    c.innerHTML = `<div class="dr-list-row">Day / Night <span class="mono">${S.mode}</span></div><div class="dr-list-row">Performance Quality <span class="mono">Automatic</span></div><div class="dr-list-row">Interface Scale <span class="mono">100%</span></div>`;
  } else if (sec === 'account') {
    c.innerHTML = `<div class="dr-list-row">Plan <span class="mono">Studio (prototype)</span></div><div class="dr-list-row">Usage <span class="mono">—</span></div><div class="dr-list-row">Billing <span class="mono">—</span></div>`;
  } else if (sec === 'help') {
    c.innerHTML = `<div class="dr-list-row">Documentation</div><div class="dr-list-row">Contact Support</div>`;
  } else if (sec === 'shortcuts') {
    c.innerHTML = SHORTCUT_ROWS.map(([label, mac, win]) => `<div class="dr-list-row">${label}<span class="mono">${mac} · ${win}</span></div>`).join('');
  } else if (sec === 'commands') {
    c.innerHTML = `<div class="dr-search"><svg><use href="#i-search"/></svg><input placeholder="Type a command…"></div><div class="dr-empty">Command palette (future)</div>`;
  }
}
function projectCard(p, i) {
  const card = document.createElement('div'); card.className = 'pcard';
  card.innerHTML = `<img class="pcard-thumb" src="${p.thumb || svgThumb(i)}" alt=""><button class="pcard-fav ${p.fav ? 'on' : ''}"><svg><use href="#i-favourite"/></svg></button>
    <div class="pcard-body"><div class="pcard-name">${p.name}</div><div class="pcard-meta"><svg><use href="#${p.local ? 'i-local' : 'i-cloud'}"/></svg>${p.cells} cells · ${p.floors} floors</div></div>`;
  card.onclick = e => { if (e.target.closest('.pcard-fav')) return; toast('Opened ' + p.name); closeDrawer(); };
  card.querySelector('.pcard-fav').onclick = e => { e.stopPropagation(); p.fav = !p.fav; card.querySelector('.pcard-fav').classList.toggle('on'); };
  return card;
}
qsa('.dn').forEach(b => b.onclick = () => buildDrawerSection(b.dataset.dsec));
qs('#drawer-upload').onclick = () => { closeDrawer(); showUploadOverlay(1200); };
D.drawer_scrim.addEventListener('click', closeDrawer);
D.project_drawer.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

const SHORTCUT_ROWS = [
  ['Add Space', 'A', 'A'], ['Select', 'V', 'V'], ['Materials', 'B', 'B'], ['Arrange', 'R', 'R'],
  ['Connect', 'C', 'C'], ['Markup', 'X', 'X'], ['Present', 'P', 'P'],
  ['Undo', '⌘Z', 'Ctrl+Z'], ['Redo', '⇧⌘Z', 'Ctrl+Y'], ['Fit All', 'F', 'F'],
  ['Project Drawer', '⌘K', 'Ctrl+K'], ['Export', '⌘E', 'Ctrl+E'], ['Day/Night', '⇧D', 'Shift+D'],
];

/* ══ OVERLAY PANELS (Template Gallery / Material Browser / Export Builder / Download Center) ══ */
function openPanel(id, id2, builder) {
  qsa('.overlay-panel').forEach(p => p.classList.remove('open'));
  const target = id ? qs('#' + id) : (id2 ? qs('#' + id2) : null);
  if (!target) return;
  if (id === 'export-builder') buildExportBuilder();
  if (id === 'download-center') buildDownloadCenter();
  if (id2 === 'template-gallery') buildTemplateGallery();
  if (builder) builder();
  target.classList.add('open');
}
qsa('.op-close').forEach(b => b.onclick = () => qs('#' + b.dataset.close).classList.remove('open'));

/* Template Gallery */
const TEMPLATE_STYLES = ['Minimal Technical', 'Editorial', 'Colour Field', 'Monochrome', 'Soft Glass', 'Dark Cinematic', 'Organic Morph', 'Presentation'];
const TEMPLATE_TYPES = ['House', 'Housing', 'School', 'Hospital', 'Office', 'Hotel', 'Museum', 'Campus'];
let tgFilter = 'Featured';
function buildTemplateGallery() {
  const body = D.tg_body; body.innerHTML = '';
  const startup = document.createElement('div'); startup.className = 'tg-startup';
  startup.innerHTML = `<button class="tg-start-btn" id="tg-blank"><svg><use href="#i-frame"/></svg>Blank Canvas</button>
    <button class="tg-start-btn" id="tg-upload"><svg><use href="#i-upload"/></svg>Upload / Drop</button>`;
  body.appendChild(startup);
  qs('#tg-blank', body).onclick = () => { toast('New blank canvas'); qs('#template-gallery').classList.remove('open'); };
  qs('#tg-upload', body).onclick = () => { qs('#template-gallery').classList.remove('open'); showUploadOverlay(1200); };
  const filters = document.createElement('div'); filters.className = 'tg-filters';
  ['Featured', 'Recent', 'Favourites', ...TEMPLATE_TYPES.slice(0, 4), ...TEMPLATE_STYLES.slice(0, 3)].forEach(f => {
    const chip = document.createElement('button'); chip.className = 'tg-chip' + (f === tgFilter ? ' active' : ''); chip.textContent = f;
    chip.onclick = () => { tgFilter = f; qsa('.tg-chip', filters).forEach(x => x.classList.remove('active')); chip.classList.add('active'); renderTgGrid(grid); };
    filters.appendChild(chip);
  });
  body.appendChild(filters);
  const grid = document.createElement('div'); grid.className = 'tg-grid'; body.appendChild(grid);
  renderTgGrid(grid);
}
function renderTgGrid(grid) {
  grid.innerHTML = '';
  TEMPLATE_TYPES.forEach((t, i) => {
    const card = document.createElement('div'); card.className = 'tg-card';
    card.innerHTML = `<img class="tg-thumb" src="${svgThumb(i)}"><div class="tg-body2"><div class="tg-name">${t} Programme</div><div class="tg-meta">${TEMPLATE_STYLES[i % TEMPLATE_STYLES.length]} · ${8 + i * 3} cells</div></div>`;
    card.onclick = () => { toast('Applied template: ' + t + ' Programme'); qs('#template-gallery').classList.remove('open'); };
    grid.appendChild(card);
  });
}

/* Export Builder */
const EB_PRESETS = ['Minimal Image Pack', 'Presentation Pack', 'Complete Project Pack', 'Analysis Pack', 'Custom'];
const EB_GROUPS = [
  ['Main Visuals', ['Canvas PNG', 'Transparent Canvas PNG', 'SVG (where supported)', 'PDF Sheets', 'GIF Animation']],
  ['Dashboard & Analysis', ['Category Donut', 'Privacy Donut', 'Area Leaders', 'Relationship Graph', 'Adjacency Matrix', 'Data Health Summary']],
  ['Tables & Data', ['Space Schedule', 'Relationship Matrix', 'Project Metadata']],
  ['Editable & Supporting', ['.mooorf Project', 'Manifest', 'README / Index']],
];
let ebPreset = 'Presentation Pack';
let ebChecked = new Set(['Canvas PNG', 'PDF Sheets', 'Space Schedule', '.mooorf Project']);
function buildExportBuilder() {
  const body = D.eb_body; body.innerHTML = '';
  const presets = document.createElement('div'); presets.className = 'eb-presets';
  EB_PRESETS.forEach(p => {
    const b = document.createElement('button'); b.className = 'eb-preset' + (p === ebPreset ? ' active' : '');
    b.innerHTML = `<div class="eb-preset-name">${p}</div><div class="eb-preset-desc">${p === 'Custom' ? 'Choose exactly what you need' : 'Curated selection'}</div>`;
    b.onclick = () => { ebPreset = p; qsa('.eb-preset', presets).forEach(x => x.classList.remove('active')); b.classList.add('active'); };
    presets.appendChild(b);
  });
  body.appendChild(presets);
  EB_GROUPS.forEach(([title, items]) => {
    const g = document.createElement('div'); g.className = 'eb-group';
    g.innerHTML = `<div class="eb-group-title">${title}</div>`;
    items.forEach(it => {
      const row = document.createElement('div'); row.className = 'eb-check' + (ebChecked.has(it) ? ' on' : '');
      row.innerHTML = `<div class="eb-box"><svg><use href="#i-check"/></svg></div><span>${it}</span>`;
      row.onclick = () => { ebChecked.has(it) ? ebChecked.delete(it) : ebChecked.add(it); row.classList.toggle('on'); qs('.eb-size', footer).textContent = 'Estimated size: ' + (ebChecked.size * 0.6).toFixed(1) + ' MB'; };
      g.appendChild(row);
    });
    body.appendChild(g);
  });
  const footer = document.createElement('div'); footer.className = 'eb-footer';
  footer.innerHTML = `<span class="eb-size">Estimated size: ${(ebChecked.size * 0.6).toFixed(1)} MB</span><button class="eb-generate">Generate</button>`;
  footer.querySelector('.eb-generate').onclick = () => { queueExportJob(ebPreset); qs('#export-builder').classList.remove('open'); };
  body.appendChild(footer);
}

/* Export queue + Download Center — V8_2_EXPORT_QUEUE_READINESS.md */
const JOB_STAGES = ['queued', 'preparing', 'rendering', 'packaging', 'ready'];
function queueExportJob(name) {
  const job = { id: uid('j'), name: name + '.zip', status: 'queued', progress: 0 };
  S.exportJobs.unshift(job);
  updateInboxBadge();
  toast('Export queued: ' + job.name);
  stepJob(job);
}
function stepJob(job) {
  let stage = 0;
  const iv = setInterval(() => {
    stage++;
    if (stage >= JOB_STAGES.length) {
      job.status = 'ready'; job.progress = 100;
      clearInterval(iv);
      updateInboxBadge();
      if (qs('#download-center').classList.contains('open')) buildDownloadCenter();
      showExportNotification(job);
      return;
    }
    job.status = JOB_STAGES[stage]; job.progress = Math.round((stage / (JOB_STAGES.length - 1)) * 90);
    updateInboxBadge();
    if (qs('#download-center').classList.contains('open')) buildDownloadCenter();
  }, 620);
}
function updateInboxBadge() {
  const active = S.exportJobs.filter(j => j.status !== 'downloaded').length;
  D.inbox_badge.hidden = active === 0;
  D.inbox_badge.textContent = active;
}
function buildDownloadCenter() {
  const body = D.dc_body;
  if (!S.exportJobs.length) { body.innerHTML = '<div class="dc-empty">No export jobs yet. Use Export to build a pack.</div>'; return; }
  body.innerHTML = '';
  S.exportJobs.forEach(job => {
    const row = document.createElement('div'); row.className = 'dc-job';
    row.innerHTML = `<div class="dc-ic"><svg><use href="#i-zip"/></svg></div>
      <div class="dc-meta"><div class="dc-name">${job.name}</div><div class="dc-status ${job.status === 'ready' ? 'ready' : ''} mono">${job.status}</div>
      ${job.status !== 'ready' ? `<div class="dc-bar"><i style="width:${job.progress}%"></i></div>` : ''}</div>
      <div class="dc-actions">${job.status === 'ready' ? '<button data-dl><svg><use href="#i-export"/></svg></button>' : '<button data-cancel><svg><use href="#i-close"/></svg></button>'}</div>`;
    const dl = row.querySelector('[data-dl]'); if (dl) dl.onclick = () => { job.status = 'downloaded'; updateInboxBadge(); buildDownloadCenter(); toast('Downloaded ' + job.name); };
    const cn = row.querySelector('[data-cancel]'); if (cn) cn.onclick = () => { S.exportJobs = S.exportJobs.filter(j => j !== job); updateInboxBadge(); buildDownloadCenter(); };
    body.appendChild(row);
  });
}
function showExportNotification(job) {
  const n = document.createElement('div'); n.className = 'notif';
  n.innerHTML = `<div class="notif-ic"><svg><use href="#i-zip"/></svg></div>
    <div class="notif-body"><div class="notif-title">Export Ready</div><div class="notif-file">${job.name}</div>
    <div class="notif-actions"><button class="primary" data-dl>Download</button><button data-inbox>Download Center</button><button data-dismiss>Dismiss</button></div></div>`;
  D.notification_stack.appendChild(n);
  n.querySelector('[data-dl]').onclick = () => { job.status = 'downloaded'; updateInboxBadge(); n.remove(); toast('Downloaded ' + job.name); };
  n.querySelector('[data-inbox]').onclick = () => { openPanel('download-center'); n.remove(); };
  n.querySelector('[data-dismiss]').onclick = () => n.remove();
  setTimeout(() => { if (n.isConnected) n.remove(); }, 6000);
}

/* ══ UPLOAD OVERLAY (whole-canvas drop resolver) ═══════════════════ */
let dragDepth = 0;
window.addEventListener('dragenter', e => { e.preventDefault(); dragDepth++; D.upload_overlay.hidden = false; });
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('dragleave', () => { dragDepth--; if (dragDepth <= 0) { dragDepth = 0; D.upload_overlay.hidden = true; } });
window.addEventListener('drop', e => {
  e.preventDefault(); dragDepth = 0; D.upload_overlay.hidden = true;
  const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  resolveDrop(f ? f.name : 'reference.png');
});
function showUploadOverlay(ms) { D.upload_overlay.hidden = false; setTimeout(() => resolveDrop('project.mooorf'), ms); }
function resolveDrop(filename) {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const map = {
    mooorf: 'MOOORF project → validate and open editable project',
    zip: 'ZIP → validate and open editable project',
    json: 'JSON → detect project/config',
    csv: 'CSV → preview, map columns, import',
    xlsx: 'XLSX → preview, map columns, import',
    png: 'PNG → check for MOOORF metadata, else place as reference',
    jpg: 'JPG → place as reference / background',
    svg: 'SVG → place as reference or symbol',
    pdf: 'PDF → choose page, add as reference',
    gif: 'GIF → check for MOOORF metadata, else animated reference',
  };
  const D2 = qs('#uo-detect');
  D2.textContent = map[ext] || 'Unrecognised file — place as reference';
  D.upload_overlay.hidden = false;
  setTimeout(() => { D.upload_overlay.hidden = true; toast('Resolved: ' + filename); }, 1100);
}

/* ══ DATA WORKSPACE ═══════════════════════════════════════════════ */
const DATA_TABS = ['schedule', 'relationships', 'floors', 'materials', 'markup', 'metadata', 'analysis'];
const DATA_TAB_LABELS = { schedule: 'Space Schedule', relationships: 'Relationship Matrix', floors: 'Floor Summary', materials: 'Materials', markup: 'Markup Schedule', metadata: 'Project Metadata', analysis: 'Analysis Results' };
let dataTab = 'schedule';
function setDataTab(t) { dataTab = t; buildDataWorkspace(); }
function buildDataWorkspace() {
  const body = D.data_body; body.innerHTML = '';
  const tabs = document.createElement('div'); tabs.className = 'data-tabs';
  DATA_TABS.forEach(t => { const b = document.createElement('button'); b.className = 'data-tab' + (t === dataTab ? ' active' : ''); b.textContent = DATA_TAB_LABELS[t]; b.onclick = () => setDataTab(t); tabs.appendChild(b); });
  body.appendChild(tabs);
  if (dataTab === 'schedule') body.appendChild(buildScheduleTable());
  else if (dataTab === 'metadata') body.appendChild(buildMetadataForm());
  else if (dataTab === 'relationships') body.appendChild(buildSimpleNote('Relationship Matrix reads live adjacency once relationships are defined via Connect.'));
  else if (dataTab === 'floors') body.appendChild(buildFloorSummary());
  else if (dataTab === 'materials') body.appendChild(buildMaterialsTable());
  else if (dataTab === 'markup') body.appendChild(buildSimpleNote('Markup Schedule lists Labels, Notes, Dimensions, and Symbols placed on the Canvas.'));
  else if (dataTab === 'analysis') body.appendChild(buildSimpleNote('Analysis Results mirror the live Dashboard metrics as an exportable table.'));
  buildCompactTable();
}
function buildScheduleTable() {
  const wrap = document.createElement('div');
  const tb = document.createElement('div'); tb.className = 'data-toolbar';
  tb.innerHTML = `<button class="dtb-btn" id="dtb-add"><svg><use href="#i-space"/></svg>Add Space</button>
    <button class="dtb-btn"><svg><use href="#i-upload"/></svg>Import</button>
    <button class="dtb-btn"><svg><use href="#i-export"/></svg>Export Table</button>
    <div class="dtb-search"><svg><use href="#i-search"/></svg><input placeholder="Search spaces"></div>`;
  wrap.appendChild(tb);
  qs('#dtb-add', tb).onclick = () => addSpace('space');
  const table = document.createElement('table'); table.className = 'dtable';
  table.innerHTML = `<thead><tr><th></th><th>Name</th><th>Area (m²)</th><th>Type</th><th>Category</th><th>Privacy</th><th>Floor</th><th>Health</th></tr></thead><tbody></tbody>`;
  const tbody = table.querySelector('tbody');
  S.cells.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="mono" style="color:var(--text-muted)">${c.id.slice(0, 4)}</td>
      <td><input value="${c.name}" data-f="name"></td>
      <td><input value="${c.area}" data-f="area" style="width:60px"></td>
      <td class="mono">${c.kind}</td>
      <td><select data-f="category">${CATS.map(ct => `<option value="${ct.id}" ${ct.id === c.category ? 'selected' : ''}>${ct.label}</option>`).join('')}</select></td>
      <td><select data-f="privacy">${PRIV.map(p => `<option ${p === c.privacy ? 'selected' : ''}>${p}</option>`).join('')}</select></td>
      <td class="mono">${S.floor.list[S.floor.idx]}</td>
      <td><span class="dhealth-cell"><span class="dhealth-dot ${c.area <= 0 ? 'warn' : ''}"></span>${c.area <= 0 ? 'Missing area' : 'OK'}</span></td>`;
    tr.onclick = e => { if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') { setRail('canvas'); select(c.id); } };
    tr.querySelector('[data-f="name"]').onchange = e => { c.name = e.target.value; renderCells(); };
    tr.querySelector('[data-f="area"]').onchange = e => { const a = parseFloat(e.target.value); if (a > 0) { c.area = a; renderCells(); buildDataWorkspace(); } };
    tr.querySelector('[data-f="category"]').onchange = e => c.category = e.target.value;
    tr.querySelector('[data-f="privacy"]').onchange = e => c.privacy = e.target.value;
    tbody.appendChild(tr);
  });
  wrap.appendChild(table);
  return wrap;
}
function buildMetadataForm() {
  const wrap = document.createElement('div');
  const fields = ['Project Name', 'Subtitle', 'Client', 'Location', 'Architect', 'Site Area', 'FAR / FSI', 'Date', 'Revision'];
  const form = document.createElement('div'); form.className = 'd-meta-form';
  form.innerHTML = fields.map(f => `<div class="d-field"><label>${f}</label><input placeholder="—"></div>`).join('');
  wrap.appendChild(form);
  const ai = document.createElement('div'); ai.className = 'ai-fill-box';
  ai.innerHTML = `<div class="cap" style="margin:26px 0 10px">Import Assistant</div>
    <div class="ai-steps">
      <div class="ai-step"><i>1</i>Download the blank format.</div>
      <div class="ai-step"><i>2</i>Attach it to your preferred AI tool with your project brief.</div>
      <div class="ai-step"><i>3</i>Copy the prompt below.</div>
      <div class="ai-step"><i>4</i>Ask the AI to fill the file without renaming columns.</div>
      <div class="ai-step"><i>5</i>Import the completed file back into MOOORF.</div>
    </div>
    <div class="dl-formats">
      <button class="dtb-btn"><svg><use href="#i-export"/></svg>Download CSV</button>
      <button class="dtb-btn"><svg><use href="#i-export"/></svg>Download XLSX</button>
      <button class="dtb-btn"><svg><use href="#i-export"/></svg>Example Dataset</button>
      <button class="dtb-btn"><svg><use href="#i-export"/></svg>Field Guide</button>
    </div>
    <div class="ai-prompt-box" style="margin-top:14px">
      <textarea id="ai-prompt-text">Fill this space-schedule template for a residential programme. Required columns: name, area (m²), category (living/sleep/service/circulation/outdoor/work), privacy (Public/Shared/Private), floor. Do not rename columns. Preserve any supplied IDs. Leave uncertain values blank rather than inventing regulations.</textarea>
      <button class="ai-copy" id="ai-copy-btn"><svg><use href="#i-copy"/></svg></button>
    </div>
    <div class="ai-copied mono" id="ai-copied">Copied to clipboard</div>`;
  wrap.appendChild(ai);
  qs('#ai-copy-btn', ai).onclick = () => {
    const ta = qs('#ai-prompt-text', ai);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    if (navigator.clipboard) navigator.clipboard.writeText(ta.value).catch(() => {});
    const c = qs('#ai-copied', ai); c.classList.add('show'); setTimeout(() => c.classList.remove('show'), 1600);
  };
  return wrap;
}
function buildFloorSummary() {
  const wrap = document.createElement('div');
  const table = document.createElement('table'); table.className = 'dtable';
  table.innerHTML = `<thead><tr><th>Floor</th><th>Spaces</th><th>Area</th></tr></thead><tbody>${S.floor.list.map((f, i) => `<tr><td>${f}</td><td class="mono">${i === S.floor.idx ? S.cells.filter(c => c.kind !== 'void').length : 0}</td><td class="mono">${i === S.floor.idx ? totalArea() : 0} m²</td></tr>`).join('')}</tbody>`;
  wrap.appendChild(table);
  return wrap;
}
function buildMaterialsTable() {
  const wrap = document.createElement('div');
  const usage = {};
  S.cells.forEach(c => { usage[c.materialId] = (usage[c.materialId] || 0) + 1; });
  const table = document.createElement('table'); table.className = 'dtable';
  table.innerHTML = `<thead><tr><th></th><th>Material</th><th>Category</th><th>Tier</th><th>Used</th></tr></thead><tbody>${Object.entries(usage).map(([id, n]) => { const m = matById(id); return m ? `<tr><td><span class="cr-mini-swatch" style="background:${m.color};width:16px;height:16px;display:inline-block"></span></td><td>${m.name}</td><td class="mono">${m.cat}</td><td class="mono">${m.tier}</td><td class="mono">${n}</td></tr>` : ''; }).join('')}</tbody>`;
  wrap.appendChild(table);
  return wrap;
}
function buildSimpleNote(text) { const d = document.createElement('div'); d.className = 'insp-empty'; d.style.maxWidth = '520px'; d.textContent = text; return d; }

/* Compact canvas data widget — 3 modes, floats over Canvas workspace */
function buildCompactTable() {
  let el = qs('#compact-table');
  if (!el) {
    el = document.createElement('div'); el.id = 'compact-table';
    D.stage.after(el);
    let drag = null;
    el.addEventListener('pointerdown', e => { if (!e.target.closest('.ct-hd') || e.target.closest('.ct-mode-btn')) return; const r = el.getBoundingClientRect(); drag = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top }; });
    window.addEventListener('pointermove', e => { if (!drag) return; el.style.left = (drag.ox + e.clientX - drag.sx) + 'px'; el.style.top = (drag.oy + e.clientY - drag.sy) + 'px'; el.style.right = 'auto'; });
    window.addEventListener('pointerup', () => drag = null);
  }
  el.dataset.ctMode = S.ctMode;
  const modeIcon = S.ctMode === 'compact' ? 'i-data' : S.ctMode === 'expanded' ? 'i-layers' : 'i-dashboard';
  let body = '';
  if (S.ctMode === 'compact') {
    body = S.cells.filter(c => c.kind !== 'void').map(c => `<div class="ct-row"><svg class="ct-drag"><use href="#i-arrange"/></svg><span class="ct-nm">${c.name}</span><span class="ct-ar mono">${c.area}</span></div>`).join('');
  } else if (S.ctMode === 'expanded') {
    body = S.cells.map(c => `<div class="ct-row"><span class="ct-nm">${c.name}</span><span class="ct-ar mono">${catOf(c.category).label} · ${c.privacy}</span></div>`).join('');
  } else {
    body = `<div class="ct-mini-bar"><b>${S.cells.filter(c => c.kind !== 'void').length}</b> spaces<b style="margin-left:8px">${totalArea()}</b> m²<b style="margin-left:8px">${S.floor.list.length}</b> floors</div>`;
  }
  el.innerHTML = `<div class="ct-hd"><svg><use href="#i-arrange"/></svg><span class="cap">Programme</span><button class="ct-mode-btn" id="ct-cycle"><svg><use href="#${modeIcon}"/></svg></button></div>${body}`;
  qs('#ct-cycle', el).onclick = () => { S.ctMode = S.ctMode === 'compact' ? 'expanded' : S.ctMode === 'expanded' ? 'mini' : 'compact'; buildCompactTable(); };
}
function positionCompactTable() {}
function totalArea() { return S.cells.filter(c => c.kind !== 'void').reduce((a, c) => a + c.area, 0).toFixed(1); }

/* ══ DASHBOARD WORKSPACE (live-computed) ═══════════════════════════ */
function buildDashboard() {
  const body = D.dash_body; body.innerHTML = '';
  const spaces = S.cells.filter(c => c.kind !== 'void');
  const total = totalArea();
  const catMix = {};
  spaces.forEach(c => { catMix[c.category] = (catMix[c.category] || 0) + c.area; });
  const privSplit = { Public: 0, Shared: 0, Private: 0 };
  spaces.forEach(c => { privSplit[c.privacy] = (privSplit[c.privacy] || 0) + c.area; });
  const leaders = [...spaces].sort((a, b) => b.area - a.area).slice(0, 6);

  const hd = document.createElement('div'); hd.className = 'dash-hd';
  hd.innerHTML = `<div><div class="dash-title">Programme Intelligence</div><div class="dash-sub">Live-derived from ${spaces.length} spaces across ${S.floor.list.length} floors. Composed hierarchy, not an equal-card grid.</div></div>
    <div class="dash-hd-right"><button class="dash-mode-toggle" id="dash-toggle">${S.dashMode === 'light' ? 'Dark Mode' : 'Light Mode'}</button></div>`;
  body.appendChild(hd);
  qs('#dash-toggle', hd).onclick = () => { S.dashMode = S.dashMode === 'light' ? 'dark' : 'light'; document.body.dataset.dashMode = S.dashMode; buildDashboard(); };
  document.body.dataset.dashMode = S.dashMode;

  const grid = document.createElement('div'); grid.className = 'dash-grid';
  const hero = document.createElement('div'); hero.className = 'dash-hero';
  hero.innerHTML = `<div class="dash-hero-hd"><span class="dash-live"></span><span class="dash-hero-title">Relationship Graph</span></div>${relationshipSVG(spaces)}`;
  const support = document.createElement('div'); support.className = 'dash-support';
  support.innerHTML = `
    <div class="dash-card"><div class="dash-card-title">Total Area</div><div class="big-num dot">${total}</div><div class="delta">m² · live sum</div></div>
    <div class="dash-card"><div class="dash-card-title">Category Mix</div>${mixBar(catMix, total)}</div>
    <div class="dash-card"><div class="dash-card-title">Data Health</div>${healthList(spaces)}</div>`;
  grid.append(hero, support);
  body.appendChild(grid);

  const bottom = document.createElement('div'); bottom.className = 'dash-bottom';
  bottom.innerHTML = `
    <div class="dash-metric"><div class="m-label">Space Count</div><div class="m-val">${spaces.length}</div></div>
    <div class="dash-metric"><div class="m-label">Void Count</div><div class="m-val">${S.cells.length - spaces.length}</div></div>
    <div class="dash-metric"><div class="m-label">Floors</div><div class="m-val">${S.floor.list.length}</div></div>
    <div class="dash-metric"><div class="m-label">Largest Space</div><div class="m-val">${leaders[0] ? leaders[0].name : '—'}</div></div>`;
  body.appendChild(bottom);
}
function mixBar(catMix, total) {
  const t = parseFloat(total) || 1;
  const bars = Object.entries(catMix).map(([id, a]) => `<i style="width:${(a / t * 100).toFixed(1)}%;background:${catOf(id).color}"></i>`).join('');
  const legend = Object.entries(catMix).map(([id, a]) => `<div class="ml"><i style="background:${catOf(id).color}"></i>${catOf(id).label}<span class="mono">${((a / t) * 100).toFixed(0)}%</span></div>`).join('');
  return `<div class="mixbar">${bars}</div><div class="mix-legend" style="display:grid;gap:4px;margin-top:6px">${legend}</div>`;
}
function healthList(spaces) {
  const missingArea = spaces.filter(c => c.area <= 0).length;
  const rows = [
    [missingArea === 0, missingArea === 0 ? 'Area complete' : missingArea + ' missing area'],
    [true, 'Category assigned'],
    [true, 'Privacy assigned'],
  ];
  return `<div class="health-list">${rows.map(([ok, label]) => `<div class="${ok ? 'ok' : 'warn'}">${label}</div>`).join('')}</div>`;
}
function relationshipSVG(spaces) {
  const w = 560, h = 260, cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 40;
  const n = spaces.length || 1;
  const nodes = spaces.map((c, i) => { const a = (i / n) * Math.PI * 2; return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, c }; });
  let links = '';
  nodes.forEach((nd, i) => { const nx = nodes[(i + 1) % nodes.length]; links += `<line class="lk" x1="${nd.x}" y1="${nd.y}" x2="${nx.x}" y2="${nx.y}"/>`; });
  const circles = nodes.map(nd => `<circle class="nd" cx="${nd.x}" cy="${nd.y}" r="14"/><text x="${nd.x}" y="${nd.y + 24}" text-anchor="middle">${nd.c.name}</text>`).join('');
  return `<svg class="relgraph-svg" viewBox="0 0 ${w} ${h}">${links}${circles}</svg>`;
}

/* ══ KEYBOARD SHORTCUTS ═════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'Escape') { closeAllMenus(); if (S.drawerOpen) closeDrawer(); qsa('.overlay-panel.open').forEach(p => p.classList.remove('open')); return; }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openDrawer(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') { e.preventDefault(); openPanel('export-builder'); return; }
  if (e.key === '1') setRail('canvas');
  else if (e.key === '2') setRail('data');
  else if (e.key === '3') setRail('dashboard');
  else if (e.key.toLowerCase() === 't') setRail('templates');
  else if (e.key.toLowerCase() === 'f') fitView();
  else if (e.key.toLowerCase() === 'a' && !e.shiftKey && !e.altKey) addSpace('space');
  else if (e.key.toLowerCase() === 'a' && e.shiftKey) addMultiSpaces(5);
  else if (e.key.toLowerCase() === 'v') setDock('select');
  else if (e.key.toLowerCase() === 'b') setDock('materials');
  else if (e.key.toLowerCase() === 'r') setDock('arrange');
  else if (e.key.toLowerCase() === 'c') setDock('connect');
  else if (e.key.toLowerCase() === 'x') setDock('markup');
  else if (e.key.toLowerCase() === 'p') setDock('present');
  else if (e.key === 'g') qs('.qv[data-qv="grid"]').click();
  else if (e.key === '?') { openDrawer(); buildDrawerSection('shortcuts'); }
  else if (e.key === 'D' && e.shiftKey) qs('#mode-switch').click();
});

/* ══ BOOT ═══════════════════════════════════════════════════════════ */
function boot() {
  renderCells();
  select(null);
  buildCompactTable();
  if (innerWidth < 1180) qs('#desktop-gate').hidden = false;
  window.addEventListener('resize', () => { qs('#desktop-gate').hidden = innerWidth >= 1180; });
}
boot();

})();
