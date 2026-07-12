/* ═══════════════════════════════════════════════════════════════
   MOOORF V8.2 — UI SYSTEM LAB · prototype interaction engine
   plain browser JS, no build step, no dependencies
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';

/* ── helpers ─────────────────────────────────────────────────── */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt1 = v => (Math.round(v * 10) / 10).toFixed(1);
const uid = (() => { let n = 0; return p => `${p}${++n}`; })();
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
const icon = (id, cls) => `<svg${cls ? ` class="${cls}"` : ''}><use href="#${id}"/></svg>`;
const keys = ks => `<span class="keys">${ks.split(' ').map(k => `<kbd class="key">${k}</kbd>`).join('')}</span>`;

const PX_PER_M = 12;              // px per √m² → cell radius = √area · 12
const cellR = a => Math.sqrt(Math.max(a, .5)) * PX_PER_M;

/* ── state ───────────────────────────────────────────────────── */
const S = {
  mode: 'day', tool: 'select', screen: 'canvas',
  cam: { x: innerWidth / 2, y: innerHeight / 2, z: 1 },
  cells: [], widgets: [], rels: [],
  sel: null,
  shelfTarget: 'Space',
  favs: new Set(['g-dusk', 'sol-terra', 'g-noon']),
  recents: ['g-dusk', 'sol-sage', 'g-golden'],
  activeMat: 'g-dusk',
  grid: { style: 'technical', on: true, size: 28, op: .38, weight: 1, major: 4, snap: false, dynamic: true, exportGrid: false, mode: 'auto', hue: 30 },
  bgMode: 'default',
  player: { playing: false, t: 62, dur: 204, vol: 65, muted: false, collapsed: true },
  toolRecents: ['Select', 'Quick Shelf', 'Duplicate', 'Grid Styles'],
};

/* ── materials library ───────────────────────────────────────── */
const T_ALL = ['Space Fill', 'Core Dot', 'Space Boundary', 'Organism', 'Organism Edge', 'Void', 'Void Edge', 'Canvas', 'Grid', 'Line', 'Relationship', 'Text'];
const T_FILLS = ['Space Fill', 'Organism', 'Void', 'Canvas'];
const M = [];
const addM = (id, name, cat, css, o = {}) => M.push(Object.assign({
  id, name, cat, css, stops: null, angle: 180, anim: null,
  text: 'dark', tier: 'A', targets: T_ALL, source: 'MOOORF Studio · CC0',
}, o));

// solids
addM('sol-terra', 'Terra', 'Solid', '#C65A33', { text: 'light' });
addM('sol-sand', 'Sand', 'Solid', '#E4C48C');
addM('sol-ochre', 'Ochre', 'Solid', '#C98A3D');
addM('sol-umber', 'Umber', 'Solid', '#7A4A2B', { text: 'light' });
addM('sol-rose', 'Rose', 'Solid', '#C88A96');
addM('sol-sage', 'Sage', 'Solid', '#9BA88D');
addM('sol-olive', 'Olive', 'Solid', '#8A8F3C', { text: 'light' });
addM('sol-cobalt', 'Cobalt', 'Solid', '#3E62C9', { text: 'light' });
addM('sol-lilac', 'Lilac', 'Solid', '#B49BCE');
addM('sol-graphite', 'Graphite', 'Solid', '#3A3A3E', { text: 'light' });
addM('sol-bone', 'Bone', 'Solid', '#EDE9DC');
addM('sol-ink', 'Ink', 'Solid', '#17171A', { text: 'light' });
// hues
addM('h-red', 'Signal Red', 'Hue', '#E23B22', { text: 'light' });
addM('h-orange', 'Orange', 'Hue', '#F07F13');
addM('h-yellow', 'Yellow', 'Hue', '#EFC31A');
addM('h-green', 'Green', 'Hue', '#2FA34D', { text: 'light' });
addM('h-teal', 'Teal', 'Hue', '#17A28F', { text: 'light' });
addM('h-blue', 'Blue', 'Hue', '#2563EB', { text: 'light' });
addM('h-violet', 'Violet', 'Hue', '#7C3AED', { text: 'light' });
addM('h-magenta', 'Magenta', 'Hue', '#C026D3', { text: 'light' });
// gradients (sky studies)
const grad = (id, name, stops, o = {}) =>
  addM(id, name, 'Gradient', `linear-gradient(180deg, ${stops})`, Object.assign({ stops, tier: 'A' }, o));
grad('g-dawn', 'Dawn Haze', '#DCE6F2, #F6EFE3');
grad('g-morning', 'Morning', '#A9C6E8, #DCEBF7');
grad('g-noon', 'Noon Blue', '#2F6BB0, #7FB0DC', { text: 'light' });
grad('g-dusk', 'Dusk Ember', '#56637E, #D9B07E 62%, #DE6B3F', { text: 'light' });
grad('g-golden', 'Golden Hour', '#7E86A8, #E7C598 58%, #F2A65A');
grad('g-mauve', 'Mauve Evening', '#8E7A98, #E9C9A8');
grad('g-rosedawn', 'Rose Dawn', '#B9C4CF, #F2DCE4');
grad('g-orchid', 'Orchid', '#C583B8, #9E6FB8', { text: 'light' });
grad('g-nightfall', 'Night Fall', '#1E2A44, #55628C 55%, #D9A05B', { text: 'light', tier: 'B' });
grad('g-embernight', 'Ember Night', '#232B3A, #4C3A3C 60%, #E0512F', { text: 'light', tier: 'B' });
grad('g-deepnight', 'Deep Night', '#14161F, #2B3350', { text: 'light' });
grad('g-meadow', 'Meadow', '#9BC48B, #DDE8C8');
// shaders (animated)
const shader = (id, name, css, anim, o = {}) =>
  addM(id, name, 'Shader', css, Object.assign({ anim, tier: 'C', targets: ['Space Fill', 'Organism', 'Canvas'] }, o));
shader('sh-aurora', 'Aurora', 'conic-gradient(from 20deg, #2E5EAA, #37A88C, #B0619E, #2E5EAA)', 'spin', { text: 'light' });
shader('sh-iris', 'Iris', 'conic-gradient(from 200deg, #E8C9D8, #C9D8E8, #D8E8C9, #E8C9D8)', 'spin');
shader('sh-bloom', 'Bloom', 'radial-gradient(circle at 50% 60%, #F2A65A, #C4553B 58%, #6E3A2E)', 'pulse', { text: 'light' });
shader('sh-embercore', 'Ember Core', 'radial-gradient(circle at 50% 50%, #FF6B3D, #8C2F1B 62%, #2A1512)', 'pulse', { text: 'light' });
shader('sh-inkflow', 'Ink Flow', 'conic-gradient(from 90deg, #17171A, #3A3A44, #17171A, #2A2A31, #17171A)', 'spin', { text: 'light' });
shader('sh-lagoon', 'Lagoon', 'conic-gradient(from 320deg, #17A28F, #2F6BB0, #7FB0DC, #17A28F)', 'spin', { text: 'light' });
// textures
const tex = (id, name, css, o = {}) =>
  addM(id, name, 'Texture', css, Object.assign({ tier: 'B', targets: ['Space Fill', 'Void', 'Canvas'] }, o));
tex('tx-dotgrain', 'Dot Grain', 'radial-gradient(circle, rgba(23,23,15,.5) 1px, transparent 1.4px) 0 0 / 6px 6px, #E9E5D8');
tex('tx-hatch', 'Hatch 45', 'repeating-linear-gradient(45deg, rgba(23,23,15,.4) 0 1px, transparent 1px 6px), #EDE9DC');
tex('tx-crosshatch', 'Crosshatch', 'repeating-linear-gradient(45deg, rgba(23,23,15,.32) 0 1px, transparent 1px 6px), repeating-linear-gradient(-45deg, rgba(23,23,15,.32) 0 1px, transparent 1px 6px), #EDE9DC');
tex('tx-weave', 'Weave', 'repeating-linear-gradient(0deg, rgba(23,23,15,.22) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(23,23,15,.22) 0 1px, transparent 1px 4px), #E7E3D6');
tex('tx-concrete', 'Concrete', 'radial-gradient(circle at 30% 30%, rgba(23,23,15,.16) 1px, transparent 1.6px) 0 0 / 9px 9px, radial-gradient(circle at 70% 60%, rgba(23,23,15,.1) 1px, transparent 1.4px) 3px 5px / 11px 11px, #D9D6CC');
tex('tx-carbon', 'Carbon', 'repeating-linear-gradient(45deg, rgba(240,240,235,.1) 0 2px, transparent 2px 5px), #232326', { text: 'light' });
// patterns
const pat = (id, name, css, o = {}) =>
  addM(id, name, 'Pattern', css, Object.assign({ tier: 'B', targets: ['Space Fill', 'Canvas', 'Grid', 'Void'] }, o));
pat('pt-stripefine', 'Stripe Fine', 'repeating-linear-gradient(90deg, #17171A 0 2px, #EDE9DC 2px 9px)');
pat('pt-stripebold', 'Stripe Bold', 'repeating-linear-gradient(45deg, #C65A33 0 7px, #EDE9DC 7px 17px)');
pat('pt-check', 'Check', 'conic-gradient(#17171A 90deg, #EDE9DC 90deg 180deg, #17171A 180deg 270deg, #EDE9DC 270deg) 0 0 / 14px 14px');
pat('pt-rings', 'Rings', 'repeating-radial-gradient(circle at 50% 50%, #9BA88D 0 2px, #EDE9DC 2px 10px)');
pat('pt-module', 'Module', 'linear-gradient(rgba(23,23,15,.5) 1px, transparent 1px) 0 0 / 100% 12px, linear-gradient(90deg, rgba(23,23,15,.5) 1px, transparent 1px) 0 0 / 12px 100%, #EDE9DC');
pat('pt-diamond', 'Diamond', 'repeating-linear-gradient(45deg, rgba(62,98,201,.7) 0 2px, transparent 2px 12px), repeating-linear-gradient(-45deg, rgba(62,98,201,.7) 0 2px, transparent 2px 12px), #EDEAF4');

const matById = id => M.find(m => m.id === id);
const matCSS = m => (m.stops && m.cat === 'Gradient') ? `linear-gradient(${m.angle}deg, ${m.stops})` : m.css;
function orbHTML(m, cls) {
  const inner = m.anim
    ? `<span class="mat-anim${m.anim === 'pulse' ? ' mat-pulse' : ''}" style="background:${m.css}"></span>`
    : '';
  return `<span class="${cls || 'orb'}"><span class="sw-fill" style="position:absolute;inset:0;border-radius:50%;overflow:hidden;background:${m.anim ? 'transparent' : matCSS(m)}">${inner}</span></span>`;
}

/* ── seed cells ──────────────────────────────────────────────── */
const CATS = { living: '#C65A33', sleep: '#B49BCE', service: '#9BA88D', outdoor: '#7FB0DC' };
function addCell(o) {
  const c = Object.assign({
    id: uid('c'), name: 'Space', area: 12, x: 0, y: 0, mat: 'sol-sage',
    kind: 'space', cat: 'living', priv: 'public', locked: false, strongBoundary: false,
  }, o);
  S.cells.push(c);
  return c;
}
addCell({ name: 'Living', area: 28, x: -20, y: -60, mat: 'g-dusk', cat: 'living', priv: 'public' });
addCell({ name: 'Kitchen', area: 12, x: 150, y: -160, mat: 'sol-ochre', cat: 'service', priv: 'public' });
addCell({ name: 'Bedroom', area: 16, x: 215, y: 60, mat: 'g-mauve', cat: 'sleep', priv: 'private' });
addCell({ name: 'Bath', area: 5, x: -190, y: 128, mat: 'sol-sage', cat: 'service', priv: 'private' });
addCell({ name: 'Terrace', area: 18, x: -270, y: -95, mat: 'g-morning', cat: 'outdoor', priv: 'public', strongBoundary: false });
addCell({ name: 'Study', area: 9, x: 60, y: 175, mat: 'g-golden', cat: 'living', priv: 'private' });
addCell({ name: 'Void', area: 8, x: -95, y: 35, kind: 'void', cat: 'service', priv: 'public' });
addCell({ name: 'Core', area: 2.5, x: 88, y: -20, kind: 'core', mat: 'sol-ink', cat: 'service', priv: 'public' });

/* ── DOM refs ────────────────────────────────────────────────── */
const stage = $('#stage'), world = $('#world'), gridLayer = $('#grid-layer');
const tip = $('#tip'), toastEl = $('#toast');

/* ── toast / tooltip ─────────────────────────────────────────── */
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
}
function showTip(target, text, place) {
  tip.textContent = text;
  tip.hidden = false;
  const r = target.getBoundingClientRect();
  tip.style.left = tip.style.top = '0px';
  requestAnimationFrame(() => {
    const tr = tip.getBoundingClientRect();
    let x, y;
    if (place === 'right') { x = r.right + 10; y = r.top + r.height / 2 - tr.height / 2; }
    else if (place === 'bottom') { x = r.left + r.width / 2 - tr.width / 2; y = r.bottom + 8; }
    else { x = r.left + r.width / 2 - tr.width / 2; y = r.top - tr.height - 8; }
    tip.style.left = clamp(x, 6, innerWidth - tr.width - 6) + 'px';
    tip.style.top = clamp(y, 6, innerHeight - tr.height - 6) + 'px';
    tip.classList.add('show');
  });
}
function hideTip() { tip.classList.remove('show'); tip.hidden = true; }
document.addEventListener('pointerover', e => {
  const t = e.target.closest('[data-tip]');
  if (!t) return;
  const place = t.closest('#rail') ? 'right' : 'top';
  showTip(t, t.dataset.tip, place);
});
document.addEventListener('pointerout', e => { if (e.target.closest('[data-tip]')) hideTip(); });

/* ── camera ──────────────────────────────────────────────────── */
function applyCam() {
  const { x, y, z } = S.cam;
  world.style.transform = `translate(${x}px, ${y}px) scale(${z})`;
  let gs = S.grid.size * z;
  if (S.grid.dynamic) { while (gs < 14) gs *= 2; while (gs > 84) gs /= 2; }
  gridLayer.style.setProperty('--g-size', gs + 'px');
  gridLayer.style.setProperty('--g-px', x + 'px');
  gridLayer.style.setProperty('--g-py', y + 'px');
  $('#z-val').textContent = Math.round(z * 100) + '%';
  const sc = $('#anno-scale-val');
  if (sc) sc.textContent = '1:' + Math.round(200 / z);
}
const toWorld = (sx, sy) => ({ x: (sx - S.cam.x) / S.cam.z, y: (sy - S.cam.y) / S.cam.z });
function zoomAt(sx, sy, f) {
  const z2 = clamp(S.cam.z * f, .35, 2.6);
  S.cam.x = sx - (sx - S.cam.x) * (z2 / S.cam.z);
  S.cam.y = sy - (sy - S.cam.y) * (z2 / S.cam.z);
  S.cam.z = z2;
  applyCam();
}
function fitView() {
  if (!S.cells.length) return;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  S.cells.forEach(c => {
    const r = cellR(c.area);
    x0 = Math.min(x0, c.x - r); y0 = Math.min(y0, c.y - r);
    x1 = Math.max(x1, c.x + r); y1 = Math.max(y1, c.y + r);
  });
  const pad = 130;
  const z = clamp(Math.min((innerWidth - pad * 2) / (x1 - x0), (innerHeight - pad * 2) / (y1 - y0)), .35, 1.6);
  S.cam.z = z;
  S.cam.x = innerWidth / 2 - (x0 + x1) / 2 * z;
  S.cam.y = innerHeight / 2 - (y0 + y1) / 2 * z;
  applyCam();
}

/* ── cells: render ───────────────────────────────────────────── */
function renderCell(c) {
  let d = c.el;
  if (!d) {
    d = c.el = el('div', 'cell');
    d.dataset.id = c.id;
    world.appendChild(d);
    bindCell(d, c);
  }
  const r = cellR(c.area);
  const m = matById(c.mat) || matById('sol-sage');
  d.style.width = d.style.height = r * 2 + 'px';
  d.style.left = c.x - r + 'px';
  d.style.top = c.y - r + 'px';
  d.className = 'cell';
  if (c.kind === 'void') d.classList.add('is-void');
  else if (c.kind === 'core') { d.classList.add('is-core'); d.style.background = matCSS(m); }
  else d.style.background = matCSS(m);
  d.classList.add(m.text === 'light' && c.kind !== 'void' ? 'light-label' : 'dark-label');
  if (c.locked) d.classList.add('locked');
  if (c.strongBoundary) d.classList.add('strong-boundary');
  if (S.sel === c.id) d.classList.add('selected');
  d.innerHTML =
    `<span class="nm">${c.name}</span>` +
    (c.kind === 'core' ? '' : `<span class="ar">${fmt1(c.area)} m²</span>`) +
    (c.locked ? `<span class="lockb">${icon('i-lock')}</span>` : '');
}
function renderCells() { S.cells.forEach(renderCell); updateRels(); }

function select(id) {
  S.sel = id;
  $$('.cell', world).forEach(d => d.classList.toggle('selected', d.dataset.id === id));
  if (id) showShelf(); else if (S.tool !== 'materials') hideShelf();
}

/* ── cell + widget dragging / clicks ─────────────────────────── */
function bindCell(d, c) {
  let sx, sy, ox, oy, moved;
  d.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    e.stopPropagation();
    closeMenus();
    sx = e.clientX; sy = e.clientY; ox = c.x; oy = c.y; moved = false;
    d.setPointerCapture(e.pointerId);
    const mv = ev => {
      const dx = (ev.clientX - sx) / S.cam.z, dy = (ev.clientY - sy) / S.cam.z;
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 3) moved = true;
      if (moved && !c.locked) { c.x = ox + dx; c.y = oy + dy; renderCell(c); updateRels(); }
    };
    const up = () => {
      d.removeEventListener('pointermove', mv);
      d.removeEventListener('pointerup', up);
      if (!moved) select(c.id);
      else if (S.grid.snap) {
        const g = S.grid.size;
        c.x = Math.round(c.x / g) * g; c.y = Math.round(c.y / g) * g;
        renderCell(c); updateRels();
      }
    };
    d.addEventListener('pointermove', mv);
    d.addEventListener('pointerup', up);
  });
  d.addEventListener('dblclick', e => { e.stopPropagation(); openEditor(c); });
  d.addEventListener('contextmenu', e => {
    e.preventDefault(); e.stopPropagation();
    select(c.id);
    openRadial(e.clientX, e.clientY, c);
  });
}
function bindWidget(d, w) {
  let sx, sy, ox, oy;
  d.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    e.stopPropagation();
    sx = e.clientX; sy = e.clientY; ox = w.x; oy = w.y;
    d.setPointerCapture(e.pointerId);
    const mv = ev => {
      w.x = ox + (ev.clientX - sx) / S.cam.z;
      w.y = oy + (ev.clientY - sy) / S.cam.z;
      d.style.left = w.x + 'px'; d.style.top = w.y + 'px';
    };
    const up = () => { d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); };
    d.addEventListener('pointermove', mv);
    d.addEventListener('pointerup', up);
  });
  d.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); });
}

/* ── relationships ───────────────────────────────────────────── */
function addRel(a, b) {
  const line = el('div', 'w-rel');
  world.appendChild(line);
  S.rels.push({ a, b, el: line });
  updateRels();
}
function updateRels() {
  S.rels.forEach(r => {
    const A = S.cells.find(c => c.id === r.a), B = S.cells.find(c => c.id === r.b);
    if (!A || !B) { r.el.remove(); return; }
    const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy);
    r.el.style.left = A.x + 'px';
    r.el.style.top = A.y + 'px';
    r.el.style.width = len + 'px';
    r.el.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
  });
  S.rels = S.rels.filter(r => S.cells.find(c => c.id === r.a) && S.cells.find(c => c.id === r.b));
}

/* ── stage pan / zoom / blank interactions ───────────────────── */
(() => {
  let px, py, cx, cy, panning = false, moved = false;
  stage.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    closeMenus();
    panning = true; moved = false;
    px = e.clientX; py = e.clientY; cx = S.cam.x; cy = S.cam.y;
    stage.classList.add('panning');
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!panning) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    if (!moved && Math.hypot(dx, dy) > 3) moved = true;
    if (moved) { S.cam.x = cx + dx; S.cam.y = cy + dy; applyCam(); }
  });
  stage.addEventListener('pointerup', e => {
    stage.classList.remove('panning');
    if (!panning) return;
    panning = false;
    if (!moved) {
      if (S.tool === 'create') {
        const p = toWorld(e.clientX, e.clientY);
        const c = addCell({ name: 'Space', area: 10, x: p.x, y: p.y, mat: S.activeMat });
        renderCell(c); select(c.id);
        toast('Space added — double-click to name it');
      } else select(null);
    }
  });
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.09 : 1 / 1.09);
  }, { passive: false });
  stage.addEventListener('contextmenu', e => {
    e.preventDefault();
    openBlankMenu(e.clientX, e.clientY);
  });
})();

/* ── blank-canvas dropdown (conventional, compact) ───────────── */
const ctxBlank = $('#ctx-blank');
const BLANK_ITEMS = [
  { ic: 'i-create', label: 'Add Space', k: 'A', act: 'space' },
  { ic: 'i-void', label: 'Add Void', k: 'O', act: 'void' },
  { ic: 'i-line', label: 'Add Line', k: 'L', act: 'line' },
  { ic: 'i-relationship', label: 'Add Relationship', k: 'R', act: 'rel' },
  { ic: 'i-text', label: 'Add Text', k: 'T', act: 'text' },
  { ic: 'i-paragraph', label: 'Add Paragraph', k: '⇧ T', act: 'para' },
  { sep: true },
  { ic: 'i-paste', label: 'Paste', k: '⌘ V', act: 'paste' },
  { ic: 'i-import', label: 'Import File', k: '⌘ I', act: 'import' },
  { sep: true },
  { ic: 'i-view', label: 'View', k: '6', act: 'view', sub: true },
  { ic: 'i-tune', label: 'Tools', k: '7', act: 'tools', sub: true },
];
function openBlankMenu(x, y) {
  closeMenus();
  ctxBlank.innerHTML = BLANK_ITEMS.map(it => it.sep
    ? '<div class="msep"></div>'
    : `<button class="mi" data-act="${it.act}">${icon(it.ic)}<span class="sp">${it.label}</span>${it.sub ? '<span class="sub">›</span>' : ''}${keys(it.k)}</button>`
  ).join('');
  ctxBlank.hidden = false;
  const r = ctxBlank.getBoundingClientRect();
  ctxBlank.style.left = clamp(x, 8, innerWidth - r.width - 8) + 'px';
  ctxBlank.style.top = clamp(y, 56, innerHeight - r.height - 8) + 'px';
  const p = toWorld(x, y);
  ctxBlank.onclick = e => {
    const b = e.target.closest('.mi');
    if (!b) return;
    blankAction(b.dataset.act, p);
    closeMenus();
  };
}
function blankAction(act, p) {
  switch (act) {
    case 'space': {
      const c = addCell({ name: 'Space', area: 10, x: p.x, y: p.y, mat: S.activeMat });
      renderCell(c); select(c.id);
      break;
    }
    case 'void': {
      const c = addCell({ name: 'Void', area: 8, x: p.x, y: p.y, kind: 'void' });
      renderCell(c); select(c.id);
      break;
    }
    case 'line': {
      const w = { id: uid('w'), x: p.x, y: p.y };
      const d = el('div', 'w-line');
      d.style.cssText = `left:${p.x}px;top:${p.y}px;width:170px;transform:rotate(-14deg)`;
      world.appendChild(d); bindWidget(d, w); S.widgets.push(w);
      break;
    }
    case 'rel': {
      const near = [...S.cells].filter(c => c.kind === 'space')
        .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
      if (near.length >= 2) { addRel(near[0].id, near[1].id); toast(`Relationship: ${near[0].name} ↔ ${near[1].name}`); }
      else toast('Needs two spaces nearby');
      break;
    }
    case 'text': {
      const w = { id: uid('w'), x: p.x, y: p.y };
      const d = el('div', 'w-text', 'LABEL');
      d.contentEditable = 'false';
      d.style.cssText = `left:${p.x}px;top:${p.y}px`;
      d.addEventListener('dblclick', ev => {
        ev.stopPropagation();
        d.contentEditable = 'true'; d.focus();
        document.getSelection().selectAllChildren(d);
      });
      d.addEventListener('blur', () => { d.contentEditable = 'false'; });
      world.appendChild(d); bindWidget(d, w); S.widgets.push(w);
      break;
    }
    case 'para': {
      const w = { id: uid('w'), x: p.x, y: p.y };
      const d = el('div', 'w-para', 'Annotation paragraph. Double-click any space to rename it; drag to reposition within the plan.');
      d.style.cssText = `left:${p.x}px;top:${p.y}px`;
      world.appendChild(d); bindWidget(d, w); S.widgets.push(w);
      break;
    }
    case 'paste': {
      const src = S.cells.find(c => c.id === S.sel) || S.cells[0];
      if (src) {
        const c = addCell(Object.assign({}, src, { id: undefined, el: undefined, x: p.x, y: p.y, locked: false }));
        c.id = uid('c'); c.el = null;
        renderCell(c); select(c.id);
      }
      break;
    }
    case 'import': showScreen('files'); break;
    case 'view': showScreen('grid'); break;
    case 'tools': showScreen('tools'); break;
  }
}

/* ── object radial — independent circles, EMPTY centre ───────── */
const radial = $('#radial');
const RADIAL_ACTIONS = [
  { ic: 'i-edit', label: 'Edit', act: 'edit' },
  { ic: 'i-materials', label: 'Materials', act: 'materials' },
  { ic: 'i-boundary', label: 'Boundary', act: 'boundary' },
  { ic: 'i-duplicate', label: 'Duplicate', act: 'duplicate' },
  { ic: 'i-lock', label: 'Lock', act: 'lock' },
  { ic: 'i-delete', label: 'Delete', act: 'delete', danger: true },
  { ic: 'i-group', label: 'Group', act: 'group' },
  { ic: 'i-more', label: 'More', act: 'more' },
];
const RAD_R = 92, RAD_BTN = 23;
let radialCell = null;
function openRadial(x, y, c) {
  closeMenus();
  radialCell = c;
  const m = RAD_R + RAD_BTN + 10;
  const cx = clamp(x, m, innerWidth - m);
  const cy = clamp(y, 58 + RAD_BTN, innerHeight - m);
  radial.classList.toggle('clamped', cx !== x || cy !== y);
  radial.style.left = cx + 'px';
  radial.style.top = cy + 'px';
  radial.innerHTML = RADIAL_ACTIONS.map((a, i) => {
    const ang = (-90 + i * 45) * Math.PI / 180;
    const tx = Math.cos(ang) * RAD_R, ty = Math.sin(ang) * RAD_R;
    return `<button class="rb${a.danger ? ' danger' : ''}${a.act === 'lock' && c.locked ? ' sel' : ''}${a.act === 'boundary' && c.strongBoundary ? ' sel' : ''}"
      style="--tx:${tx.toFixed(1)}px;--ty:${ty.toFixed(1)}px;--d:${i * 24}ms"
      data-act="${a.act}" data-label="${a.act === 'lock' && c.locked ? 'Unlock' : a.label}">
      ${icon(a.act === 'lock' && c.locked ? 'i-unlock' : a.ic)}</button>`;
  }).join('');
  radial.hidden = false;
  radial.classList.remove('closing');
  radial.style.pointerEvents = 'none';
  setTimeout(() => { radial.style.pointerEvents = ''; }, 500);
  requestAnimationFrame(() => requestAnimationFrame(() => radial.classList.add('open')));
  radial.onclick = e => {
    const b = e.target.closest('.rb');
    if (!b) return;
    radialAction(b.dataset.act, c, b);
  };
  radial.onpointerover = e => {
    const b = e.target.closest('.rb');
    if (b) showTip(b, b.dataset.label, 'bottom');
  };
  radial.onpointerout = e => { if (e.target.closest('.rb')) hideTip(); };
}
function closeRadial() {
  if (radial.hidden) return;
  radial.classList.add('closing');
  radial.classList.remove('open');
  setTimeout(() => { radial.hidden = true; radial.classList.remove('closing'); }, 200);
  radialCell = null;
}
function radialAction(act, c, btn) {
  switch (act) {
    case 'edit': closeRadial(); openEditor(c); return;
    case 'materials':
      btn.classList.add('sel');
      S.shelfTarget = 'Space';
      showShelf(); buildShelf();
      setTimeout(closeRadial, 260);
      return;
    case 'boundary':
      c.strongBoundary = !c.strongBoundary;
      renderCell(c);
      btn.classList.toggle('sel', c.strongBoundary);
      setTimeout(closeRadial, 200);
      return;
    case 'duplicate': {
      const n = addCell(Object.assign({}, c, { id: undefined, el: undefined, x: c.x + cellR(c.area) * 2 + 18, y: c.y, locked: false }));
      n.id = uid('c'); n.el = null;
      renderCell(n); select(n.id);
      closeRadial();
      return;
    }
    case 'lock':
      c.locked = !c.locked;
      renderCell(c);
      toast(c.locked ? `${c.name} locked` : `${c.name} unlocked`);
      closeRadial();
      return;
    case 'delete': {
      closeRadial();
      const d = c.el;
      d.classList.add('removing');
      setTimeout(() => { d.remove(); }, 240);
      S.cells = S.cells.filter(x => x.id !== c.id);
      if (S.sel === c.id) select(null);
      updateRels();
      toast(`${c.name} removed`);
      return;
    }
    case 'group': toast('Grouping lands with V8.3 graph sync'); closeRadial(); return;
    case 'more': {
      const r = btn.getBoundingClientRect();
      openMoreMenu(r.right + 6, r.top, c);
      return;
    }
  }
}
const ctxMore = $('#ctx-more');
function openMoreMenu(x, y, c) {
  ctxMore.innerHTML = [
    ['Bring forward', ']'], ['Send backward', '['], ['Copy style', '⌥ C'], ['Paste style', '⌥ V'], ['Export PNG', '⇧ E'],
  ].map(([l, k]) => `<button class="mi"><span class="sp">${l}</span>${keys(k)}</button>`).join('');
  ctxMore.hidden = false;
  const r = ctxMore.getBoundingClientRect();
  ctxMore.style.left = clamp(x, 8, innerWidth - r.width - 8) + 'px';
  ctxMore.style.top = clamp(y, 56, innerHeight - r.height - 8) + 'px';
  ctxMore.onclick = e => {
    const b = e.target.closest('.mi');
    if (b) { toast(`${b.querySelector('.sp').textContent} — V8.3 wiring target`); closeMenus(); }
  };
}
function closeMenus() {
  ctxBlank.hidden = true;
  ctxMore.hidden = true;
  closeRadial();
  closeEditor();
}

/* ── tiny cell editor (double-click) ─────────────────────────── */
const editor = $('#cell-editor'), ceName = $('#ce-name'), ceArea = $('#ce-area');
let editCell = null;
function openEditor(c) {
  closeMenus();
  editCell = c;
  ceName.value = c.name;
  ceArea.value = fmt1(c.area);
  editor.hidden = false;
  const r = cellR(c.area) * S.cam.z;
  const sx = c.x * S.cam.z + S.cam.x, sy = c.y * S.cam.z + S.cam.y;
  const er = editor.getBoundingClientRect();
  editor.style.left = clamp(sx - er.width / 2, 8, innerWidth - er.width - 8) + 'px';
  editor.style.top = clamp(sy + r + 14, 56, innerHeight - er.height - 8) + 'px';
  ceName.focus(); ceName.select();
}
function commitEditor() {
  if (!editCell) return;
  editCell.name = ceName.value.trim() || editCell.name;
  const a = parseFloat(ceArea.value);
  if (!isNaN(a) && a > 0) editCell.area = clamp(a, .5, 999);
  renderCell(editCell); updateRels(); refreshTypeData();
  closeEditor();
}
function closeEditor() { editor.hidden = true; editCell = null; }
$('#ce-ok').addEventListener('click', commitEditor);
editor.addEventListener('keydown', e => {
  if (e.key === 'Enter') commitEditor();
  if (e.key === 'Escape') closeEditor();
  e.stopPropagation();
});
editor.addEventListener('pointerdown', e => e.stopPropagation());

/* ── contextual shelf: targets + magnifying material rail ────── */
const shelf = $('#shelf'), matrail = $('#matrail'), shelfTargets = $('#shelf-targets');
const SHELF_TARGETS = ['Space', 'Core', 'Boundary', 'Organism', 'Void', 'Canvas', 'Line', 'Text'];
const TARGET_MAP = { Space: 'Space Fill', Core: 'Core Dot', Boundary: 'Space Boundary', Organism: 'Organism', Void: 'Void', Canvas: 'Canvas', Line: 'Line', Text: 'Text' };
function showShelf() { shelf.hidden = false; buildShelf(); }
function hideShelf() { shelf.hidden = true; }
function buildShelf() {
  shelfTargets.innerHTML = SHELF_TARGETS.map(t =>
    `<button class="${t === S.shelfTarget ? 'active' : ''}" data-t="${t}">${t}</button>`).join('');
  const fullTarget = TARGET_MAP[S.shelfTarget];
  const quick = [
    ...S.recents.map(matById).filter(Boolean),
    ...M.filter(m => (m.cat === 'Solid' || m.cat === 'Gradient' || m.cat === 'Shader') && !S.recents.includes(m.id)),
  ].slice(0, 22);
  matrail.innerHTML =
    `<span class="rail-tag">Recent</span>` +
    quick.map((m, i) => {
      const compat = m.targets.includes(fullTarget);
      return `<span class="swatch${m.id === S.activeMat ? ' active' : ''}${S.favs.has(m.id) ? ' fav' : ''}${compat ? '' : ' dim'}"
        data-mid="${m.id}" data-tip="${m.name}">
        <span class="sw-fill" style="background:${m.anim ? 'transparent' : matCSS(m)}">${m.anim ? `<span class="mat-anim${m.anim === 'pulse' ? ' mat-pulse' : ''}" style="background:${m.css}"></span>` : ''}</span>
        <span class="fav-dot"></span></span>` +
        (i === S.recents.length - 1 ? '<span class="rail-tag">All</span>' : '');
    }).join('');
}
shelfTargets.addEventListener('click', e => {
  const b = e.target.closest('button[data-t]');
  if (!b) return;
  S.shelfTarget = b.dataset.t;
  buildShelf();
});
matrail.addEventListener('click', e => {
  const sw = e.target.closest('.swatch');
  if (!sw) return;
  applyMaterial(sw.dataset.mid, S.shelfTarget);
});
matrail.addEventListener('contextmenu', e => {
  const sw = e.target.closest('.swatch');
  if (!sw) return;
  e.preventDefault();
  const id = sw.dataset.mid;
  S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id);
  sw.classList.toggle('fav', S.favs.has(id));
  toast(S.favs.has(id) ? `${matById(id).name} added to favourites` : `${matById(id).name} removed from favourites`);
});
function applyMaterial(mid, target) {
  const m = matById(mid);
  const full = TARGET_MAP[target] || target;
  if (!m.targets.includes(full)) { toast(`${m.name} is not compatible with ${full}`); return; }
  S.activeMat = mid;
  S.recents = [mid, ...S.recents.filter(x => x !== mid)].slice(0, 4);
  if (target === 'Canvas') {
    stage.style.background = matCSS(m);
    S.bgMode = 'material';
    toast(`Canvas → ${m.name}`);
  } else {
    const c = S.cells.find(x => x.id === S.sel);
    if (c && c.kind !== 'void') { c.mat = mid; renderCell(c); toast(`${c.name} → ${m.name}`); }
    else toast(`${m.name} set as active material`);
  }
  buildShelf();
}
/* mac-dock magnification */
(() => {
  let raf = null, mx = null;
  const SIGMA = 44, AMP = .55;
  function apply() {
    raf = null;
    $$('.swatch', matrail).forEach(sw => {
      if (mx == null) { sw.style.transform = ''; return; }
      const r = sw.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mx);
      const s = 1 + AMP * Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
      sw.style.transform = `translateY(${-(s - 1) * 15}px) scale(${s.toFixed(3)})`;
    });
  }
  matrail.addEventListener('pointermove', e => {
    mx = e.clientX;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  matrail.addEventListener('pointerleave', () => {
    mx = null;
    if (!raf) raf = requestAnimationFrame(apply);
  });
})();
$('#shelf-more').addEventListener('click', () => showScreen('materials'));

/* ── rail / dock / topbar / mode ─────────────────────────────── */
$('#rail').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.tool) {
    S.tool = b.dataset.tool;
    document.body.dataset.tool = S.tool;
    $$('#rail button[data-tool]').forEach(x => x.classList.toggle('active', x === b));
    if (S.tool === 'materials') showShelf();
    else if (!S.sel) hideShelf();
    if (S.tool === 'arrange') toast('Arrange: drag cells — snap is in the dock');
    showScreen('canvas');
  } else if (b.dataset.goscreen) {
    showScreen(b.dataset.goscreen);
  }
});
$('#z-in').addEventListener('click', () => zoomAt(innerWidth / 2, innerHeight / 2, 1.22));
$('#z-out').addEventListener('click', () => zoomAt(innerWidth / 2, innerHeight / 2, 1 / 1.22));
$('#z-val').addEventListener('click', () => { S.cam = { x: innerWidth / 2, y: innerHeight / 2, z: 1 }; applyCam(); });
$('#d-fit').addEventListener('click', fitView);
$('#d-grid').addEventListener('click', () => {
  S.grid.on = !S.grid.on;
  gridLayer.classList.toggle('g-off', !S.grid.on);
  $('#d-grid').classList.toggle('on', S.grid.on);
});
$('#d-snap').addEventListener('click', () => {
  S.grid.snap = !S.grid.snap;
  $('#d-snap').classList.toggle('on', S.grid.snap);
  syncGridControls();
});
$('#mode-switch').addEventListener('click', e => {
  const b = e.target.closest('button[data-m]');
  if (!b) return;
  setMode(b.dataset.m);
});
function setMode(m) {
  S.mode = m;
  document.body.dataset.mode = m;
  $$('#mode-switch button').forEach(x => x.classList.toggle('active', x.dataset.m === m));
  if (S.bgMode === 'default') stage.style.background = '';
}

/* ── screens ─────────────────────────────────────────────────── */
const SCREENS = ['materials', 'instruments', 'icons', 'type', 'grid', 'tools', 'analysis', 'files'];
function showScreen(name) {
  S.screen = name;
  document.body.dataset.screen = name;
  SCREENS.forEach(s => $('#screen-' + s).classList.toggle('open', s === name));
  $$('#tabs .tab').forEach(t => t.classList.toggle('active', t.dataset.go === name));
  closeMenus(); hideTip();
  if (name === 'analysis') buildAnalysis();
  if (name === 'materials') { buildBrowser(); }
}
$('#tabs').addEventListener('click', e => {
  const t = e.target.closest('.tab');
  if (t) showScreen(t.dataset.go);
});

/* ── material browser (Studio Browser) ───────────────────────── */
const MB_CATS = ['All', 'Solid', 'Hue', 'Gradient', 'Shader', 'Texture', 'Pattern', 'Custom', 'Favourites', 'Recent'];
let mbCat = 'All', mbQ = '', mbSel = 'g-dusk';
function mbItems() {
  let list = M.slice();
  if (mbCat === 'Favourites') list = list.filter(m => S.favs.has(m.id));
  else if (mbCat === 'Recent') list = S.recents.map(matById).filter(Boolean);
  else if (mbCat !== 'All') list = list.filter(m => m.cat === mbCat);
  if (mbQ) list = list.filter(m => m.name.toLowerCase().includes(mbQ));
  return list;
}
function buildBrowser() {
  $('#mb-cats').innerHTML =
    `<p class="cap mb-hd">Library</p>` +
    MB_CATS.map(c => {
      const n = c === 'All' ? M.length
        : c === 'Favourites' ? S.favs.size
        : c === 'Recent' ? S.recents.length
        : M.filter(m => m.cat === c).length;
      return `<button class="${c === mbCat ? 'active' : ''}" data-c="${c}">${c}<span class="cnt">${n}</span></button>`;
    }).join('');
  const items = mbItems();
  $('#mb-count').textContent = items.length + ' materials';
  $('#mb-grid').innerHTML = items.map(m =>
    `<div class="mcell${m.id === mbSel ? ' active' : ''}" data-mid="${m.id}">
      <span class="orb" style="position:relative">${m.anim
        ? `<span class="sw-fill" style="position:absolute;inset:0"><span class="mat-anim${m.anim === 'pulse' ? ' mat-pulse' : ''}" style="background:${m.css};position:absolute;inset:-30%"></span></span>`
        : `<span class="sw-fill" style="position:absolute;inset:0;background:${matCSS(m)}"></span>`}
        ${S.favs.has(m.id) ? '<span class="fav-dot"></span>' : ''}</span>
      <span class="mnm">${m.name}</span></div>`).join('');
  buildInspector(matById(mbSel) || M[0]);
}
function buildInspector(m) {
  const isGrad = m.cat === 'Gradient' && m.stops;
  $('#mb-insp').innerHTML = `
    <p class="cap">Preview</p>
    <div class="insp-preview">${m.anim
      ? `<span class="mat-anim${m.anim === 'pulse' ? ' mat-pulse' : ''}" style="background:${m.css};position:absolute;inset:-30%"></span>`
      : `<span style="position:absolute;inset:0;background:${matCSS(m)}"></span>`}</div>
    <div class="insp-name">${m.name}</div>
    <div class="insp-cat">${m.cat} · <span class="tier t-${m.tier}" style="display:inline-flex"><i></i>&nbsp;Tier ${m.tier}</span></div>
    <div class="insp-hr"></div>
    <div class="insp-row"><label>Angle</label><input type="range" class="rng" id="ip-angle" min="0" max="360" value="${m.angle}" ${isGrad ? '' : 'disabled style="opacity:.25"'}><span class="val" id="ip-angle-v">${isGrad ? m.angle + '°' : '—'}</span></div>
    <div class="insp-row"><label>Intensity</label><input type="range" class="rng" id="ip-sat" min="20" max="180" value="${m.sat || 100}"><span class="val" id="ip-sat-v">${m.sat || 100}%</span></div>
    <div class="insp-row"><label>Grain</label><input type="range" class="rng" id="ip-grain" min="0" max="100" value="${m.grain || 0}"><span class="val" id="ip-grain-v">${m.grain || 0}%</span></div>
    <p class="cap" style="margin-top:20px">Target compatibility</p>
    <div class="chips">${T_ALL.map(t => `<span class="chip${m.targets.includes(t) ? ' on' : ''}">${t}</span>`).join('')}</div>
    <div class="insp-actions">
      <button id="ip-fav">${icon('i-heart')}${S.favs.has(m.id) ? 'Unfav' : 'Favourite'}</button>
      <button id="ip-dup">${icon('i-duplicate')}Duplicate</button>
    </div>
    <div class="insp-actions">
      <button class="primary" id="ip-apply">${icon('i-check')}Apply to selection</button>
      <button id="ip-save">Save as new</button>
    </div>
    <div class="insp-meta">Source — ${m.source}<br>Performance tier ${m.tier} · ${m.anim ? 'animated, GPU composited' : 'static paint'}<br>Licence — redistribution allowed inside studio files.</div>`;
  const pv = $('.insp-preview');
  const upd = () => {
    if (isGrad) {
      m.angle = +$('#ip-angle').value;
      $('#ip-angle-v').textContent = m.angle + '°';
      const s = pv.querySelector('span');
      s.style.background = matCSS(m);
    }
    m.sat = +$('#ip-sat').value;
    m.grain = +$('#ip-grain').value;
    $('#ip-sat-v').textContent = m.sat + '%';
    $('#ip-grain-v').textContent = m.grain + '%';
    pv.style.filter = `saturate(${m.sat / 100})`;
    pv.style.backgroundImage = m.grain ? `radial-gradient(rgba(0,0,0,${m.grain / 260}) 1px, transparent 1.4px)` : '';
    pv.style.backgroundSize = '4px 4px';
  };
  ['ip-angle', 'ip-sat', 'ip-grain'].forEach(id => { const n = $('#' + id); if (n) n.addEventListener('input', upd); });
  $('#ip-fav').addEventListener('click', () => {
    S.favs.has(m.id) ? S.favs.delete(m.id) : S.favs.add(m.id);
    buildBrowser();
  });
  $('#ip-dup').addEventListener('click', () => {
    const id = uid('cu-');
    M.push(Object.assign({}, m, { id, name: m.name + ' Copy', cat: 'Custom', source: 'User · this file' }));
    mbCat = 'Custom'; mbSel = id;
    buildBrowser();
    toast(`${m.name} duplicated into Custom`);
  });
  $('#ip-save').addEventListener('click', () => {
    const id = uid('cu-');
    M.push(Object.assign({}, m, { id, name: 'Material ' + id.slice(3), cat: 'Custom', source: 'User · this file' }));
    mbCat = 'Custom'; mbSel = id;
    buildBrowser();
    toast('Saved as new custom material');
  });
  $('#ip-apply').addEventListener('click', () => {
    const c = S.cells.find(x => x.id === S.sel);
    if (c && c.kind !== 'void') {
      c.mat = m.id; S.activeMat = m.id;
      S.recents = [m.id, ...S.recents.filter(x => x !== m.id)].slice(0, 4);
      renderCell(c);
      toast(`${c.name} → ${m.name}`);
    } else {
      S.activeMat = m.id;
      toast(`${m.name} set as active material — select a space first to apply`);
    }
  });
}
$('#mb-cats').addEventListener('click', e => {
  const b = e.target.closest('button[data-c]');
  if (!b) return;
  mbCat = b.dataset.c;
  buildBrowser();
});
$('#mb-grid').addEventListener('click', e => {
  const c = e.target.closest('.mcell');
  if (!c) return;
  mbSel = c.dataset.mid;
  buildBrowser();
});
$('#mb-q').addEventListener('input', e => { mbQ = e.target.value.toLowerCase(); buildBrowser(); });

/* ── instruments ─────────────────────────────────────────────── */
function knobSVG(size, v01) {
  const r = size / 2 - 5, cx = size / 2, cy = size / 2;
  const a0 = 135, sweep = 270;
  const arc = (a1, a2, cls) => {
    const p = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
    const [x1, y1] = p(a1), [x2, y2] = p(a2);
    return `<path class="${cls}" d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
  };
  const av = a0 + sweep * v01;
  const pr = r - 7;
  const px = cx + pr * Math.cos(av * Math.PI / 180), py = cy + pr * Math.sin(av * Math.PI / 180);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${arc(a0, a0 + sweep, 'k-track')}
    <circle class="k-body" cx="${cx}" cy="${cy}" r="${r - 4}"/>
    ${v01 > 0.004 ? arc(a0, av, 'k-val') : ''}
    <line class="k-ptr" x1="${cx + (pr - 8) * Math.cos(av * Math.PI / 180)}" y1="${cy + (pr - 8) * Math.sin(av * Math.PI / 180)}" x2="${px}" y2="${py}"/>
  </svg>`;
}
function makeKnob(host, opts) {
  const o = Object.assign({ size: 64, min: 0, max: 100, val: 50, step: 1, unit: '', label: '', onchange: null }, opts);
  const unit = el('div', 'knob-unit');
  const kn = el('div', 'knob');
  const kv = el('div', 'kval mono');
  const kl = el('div', 'klabel');
  kl.textContent = o.label;
  unit.append(kn, kv, kl);
  host.appendChild(unit);
  let val = o.val;
  const draw = () => {
    kn.innerHTML = knobSVG(o.size, (val - o.min) / (o.max - o.min));
    kv.textContent = (o.step < 1 ? val.toFixed(1) : Math.round(val)) + o.unit;
    if (o.onchange) o.onchange(val);
  };
  kn.addEventListener('pointerdown', e => {
    e.preventDefault();
    kn.setPointerCapture(e.pointerId);
    let sy = e.clientY, sv = val;
    const mv = ev => {
      val = clamp(sv + (sy - ev.clientY) * (o.max - o.min) / 160, o.min, o.max);
      val = Math.round(val / o.step) * o.step;
      draw();
    };
    const up = () => { kn.removeEventListener('pointermove', mv); kn.removeEventListener('pointerup', up); };
    kn.addEventListener('pointermove', mv);
    kn.addEventListener('pointerup', up);
  });
  kv.addEventListener('click', () => {
    const inp = el('input', 'mono');
    inp.value = o.step < 1 ? val.toFixed(1) : Math.round(val);
    inp.style.cssText = 'width:52px;text-align:center;font-size:10px;border-bottom:1px solid var(--ink)';
    kv.replaceChildren(inp);
    inp.focus(); inp.select();
    const done = () => {
      const n = parseFloat(inp.value);
      if (!isNaN(n)) val = clamp(n, o.min, o.max);
      draw();
    };
    inp.addEventListener('blur', done);
    inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') inp.blur(); ev.stopPropagation(); });
  });
  draw();
  return { get: () => val, set: v => { val = clamp(v, o.min, o.max); draw(); } };
}
function instBlock(host, label, readout, unit) {
  const b = el('div', 'inst');
  b.innerHTML = `<div class="inst-hd"><span class="cap">${label}</span>${readout != null
    ? `<span class="readout mono" data-ro>${readout}</span><span class="unit">${unit || ''}</span>` : ''}</div>`;
  host.appendChild(b);
  return b;
}
function roEditable(block, get, set, fmt) {
  const ro = $('[data-ro]', block);
  if (!ro) return () => {};
  const render = () => { ro.textContent = fmt ? fmt(get()) : get(); };
  ro.addEventListener('click', () => {
    const inp = el('input', 'mono');
    inp.value = get();
    ro.replaceChildren(inp);
    inp.focus(); inp.select();
    const done = () => { const n = parseFloat(inp.value); if (!isNaN(n)) set(n); render(); };
    inp.addEventListener('blur', done);
    inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') inp.blur(); ev.stopPropagation(); });
  });
  render();
  return render;
}
function buildInstruments() {
  const g = $('#inst-grid');
  g.innerHTML = '';
  const colA = el('div', 'inst-col'), colB = el('div', 'inst-col'), colC = el('div', 'inst-col');
  g.append(colA, colB, colC);

  /* col A — rotary family */
  const bK = instBlock(colA, 'Rotary knobs — drag ↕, click value to type');
  const kr = el('div', 'knob-row');
  bK.appendChild(kr);
  makeKnob(kr, { label: 'Opacity', val: 82, unit: '%', size: 74 });
  makeKnob(kr, { label: 'Tension', val: 36, unit: '', size: 58 });
  makeKnob(kr, { label: 'Grain', val: 12, unit: '%', size: 58 });
  makeKnob(kr, { label: 'Rotation', min: 0, max: 360, val: 245, unit: '°', size: 58 });

  const bD = instBlock(colA, 'Dual knob — outer blur · inner spread');
  const dr = el('div', 'knob-row');
  bD.appendChild(dr);
  const dual = el('div', 'knob-unit');
  dual.style.position = 'relative';
  dr.appendChild(dual);
  const outer = el('div'); dual.appendChild(outer);
  makeKnob(outer, { label: 'Blur', val: 24, max: 60, unit: 'px', size: 96 });
  const innerWrap = el('div');
  innerWrap.style.cssText = 'position:absolute;left:50%;top:48px;transform:translate(-50%,-50%)';
  dual.appendChild(innerWrap);
  makeKnob(innerWrap, { label: '', val: 8, max: 30, unit: '', size: 40 });
  innerWrap.querySelector('.kval').style.display = 'none';
  innerWrap.querySelector('.klabel').style.display = 'none';
  const dnote = el('div', 'klabel'); dnote.textContent = 'Spread rides inside'; dnote.style.marginTop = '6px';
  dr.appendChild(el('div', 'knob-unit')).append(dnote);

  const bXY = instBlock(colA, 'Two-axis gradient control', '210° · 62%');
  const xy = el('div', 'xy');
  xy.innerHTML = `<div class="xy-grad"></div><div class="xy-gx"></div><div class="xy-gy"></div><div class="xy-dot"></div>`;
  bXY.appendChild(xy);
  const xyv = el('div', 'xy-vals', '<span id="xy-x">X · angle 210°</span><span id="xy-y">Y · blend 62%</span>');
  bXY.appendChild(xyv);
  const xyDot = $('.xy-dot', xy), xyGrad = $('.xy-grad', xy), gx = $('.xy-gx', xy), gy = $('.xy-gy', xy);
  const xyRO = $('[data-ro]', bXY);
  let xv = .58, yv = .38;
  const xyDraw = () => {
    xyDot.style.left = xv * 100 + '%'; xyDot.style.top = yv * 100 + '%';
    gx.style.left = xv * 100 + '%'; gy.style.top = yv * 100 + '%';
    const ang = Math.round(xv * 360), bl = Math.round((1 - yv) * 100);
    xyGrad.style.background = `linear-gradient(${ang}deg, #56637E, #D9B07E ${bl * .6 + 20}%, #DE6B3F)`;
    $('#xy-x').textContent = `X · angle ${ang}°`;
    $('#xy-y').textContent = `Y · blend ${bl}%`;
    xyRO.textContent = `${ang}° · ${bl}%`;
  };
  xy.addEventListener('pointerdown', e => {
    xy.setPointerCapture(e.pointerId);
    const mv = ev => {
      const r = xy.getBoundingClientRect();
      xv = clamp((ev.clientX - r.left) / r.width, 0, 1);
      yv = clamp((ev.clientY - r.top) / r.height, 0, 1);
      xyDraw();
    };
    mv(e);
    const up = () => { xy.removeEventListener('pointermove', mv); xy.removeEventListener('pointerup', up); };
    xy.addEventListener('pointermove', mv);
    xy.addEventListener('pointerup', up);
  });
  xyDraw();

  /* col B — linear family */
  const bEQ = instBlock(colB, 'Equalizer — organism frequency', '5 bands');
  const eq = el('div', 'eq');
  bEQ.appendChild(eq);
  [62, 38, 80, 47, 25].forEach((v, i) => {
    const band = el('div', 'eq-band');
    band.innerHTML = `<div class="eq-track"><div class="eq-fill"></div><div class="eq-handle"></div></div><span class="bv">${v}</span>`;
    eq.appendChild(band);
    const fill = $('.eq-fill', band), handle = $('.eq-handle', band), bv = $('.bv', band);
    let val = v;
    const draw = () => {
      fill.style.height = val + '%';
      handle.style.bottom = val + '%';
      bv.textContent = Math.round(val);
    };
    band.addEventListener('pointerdown', e => {
      band.setPointerCapture(e.pointerId);
      const mv = ev => {
        const r = $('.eq-track', band).getBoundingClientRect();
        val = clamp((r.bottom - ev.clientY) / r.height * 100, 0, 100);
        draw();
      };
      mv(e);
      const up = () => { band.removeEventListener('pointermove', mv); band.removeEventListener('pointerup', up); };
      band.addEventListener('pointermove', mv);
      band.addEventListener('pointerup', up);
    });
    draw();
  });

  const bDR = instBlock(colB, 'Range track — merge distance', '537', 'mm');
  const dr2 = el('div', 'dotrange');
  dr2.innerHTML = `<div class="dr-track"><div class="dr-dots"></div><div class="dr-fill"></div><div class="dr-cursor"></div></div>`;
  bDR.appendChild(dr2);
  const drFill = $('.dr-fill', dr2), drCur = $('.dr-cursor', dr2);
  let drv = 537;
  const drDraw = roEditable(bDR, () => Math.round(drv), n => { drv = clamp(n, 0, 1000); drSync(); }, null);
  const drSync = () => {
    const p = drv / 1000 * 100;
    drFill.style.width = p + '%';
    drCur.style.left = p + '%';
    drDraw();
  };
  dr2.addEventListener('pointerdown', e => {
    dr2.setPointerCapture(e.pointerId);
    const mv = ev => {
      const r = $('.dr-track', dr2).getBoundingClientRect();
      drv = clamp((ev.clientX - r.left) / r.width, 0, 1) * 1000;
      drSync();
    };
    mv(e);
    const up = () => { dr2.removeEventListener('pointermove', mv); dr2.removeEventListener('pointerup', up); };
    dr2.addEventListener('pointermove', mv);
    dr2.addEventListener('pointerup', up);
  });
  drSync();

  const bV = instBlock(colB, 'Vertical control · numeric input', '64', '%');
  const vrow = el('div');
  vrow.style.cssText = 'display:flex;gap:34px;align-items:flex-start';
  bV.appendChild(vrow);
  const vs = el('div', 'vslider');
  vs.innerHTML = '<div class="vs-fill"></div><div class="vs-handle"></div>';
  vrow.appendChild(vs);
  let vv = 64;
  const vDraw = roEditable(bV, () => Math.round(vv), n => { vv = clamp(n, 0, 100); vSync(); });
  const vSync = () => {
    $('.vs-fill', vs).style.height = vv + '%';
    $('.vs-handle', vs).style.bottom = vv + '%';
    vDraw();
  };
  vs.addEventListener('pointerdown', e => {
    vs.setPointerCapture(e.pointerId);
    const mv = ev => {
      const r = vs.getBoundingClientRect();
      vv = clamp((r.bottom - ev.clientY) / r.height * 100, 0, 100);
      vSync();
    };
    mv(e);
    const up = () => { vs.removeEventListener('pointermove', mv); vs.removeEventListener('pointerup', up); };
    vs.addEventListener('pointermove', mv);
    vs.addEventListener('pointerup', up);
  });
  vSync();
  const num = el('div');
  num.innerHTML = `<p class="cap" style="margin-bottom:9px">Grid density</p>
    <div class="numctl"><button data-s="-1">−</button><input class="mono" value="28" id="num-grid"><button data-s="1">+</button></div>
    <p class="cap" style="margin:16px 0 9px">Segmented switch</p>
    <div class="seg" id="seg-demo"><button class="active">Plan</button><button>Organism</button><button>Both</button></div>`;
  vrow.appendChild(num);
  num.querySelector('.numctl').addEventListener('click', e => {
    const b = e.target.closest('button[data-s]');
    if (!b) return;
    const inp = $('#num-grid');
    inp.value = clamp((parseInt(inp.value) || 28) + (+b.dataset.s) * 2, 8, 96);
    S.grid.size = +inp.value;
    applyCam();
  });
  $('#num-grid').addEventListener('change', e => {
    S.grid.size = clamp(parseInt(e.target.value) || 28, 8, 96);
    e.target.value = S.grid.size;
    applyCam();
  });
  $('#seg-demo').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    $$('#seg-demo button').forEach(x => x.classList.toggle('active', x === b));
  });

  /* col C — material + line family */
  const bO = instBlock(colC, 'Material orb — live target');
  const orbRow = el('div', 'orbctl');
  const am = matById(S.activeMat);
  orbRow.innerHTML = `<span class="big-orb">${am.anim
    ? `<span class="mat-anim" style="background:${am.css};position:absolute;inset:-30%"></span>`
    : `<span style="position:absolute;inset:0;background:${matCSS(am)}"></span>`}</span>
    <div><div style="font-weight:700;font-size:13px">${am.name}</div>
    <div class="cap" style="margin-top:4px">${am.cat} · Tier ${am.tier}</div>
    <button class="more-btn" style="margin-top:12px" id="orb-open">Open browser</button></div>`;
  bO.appendChild(orbRow);
  $('#orb-open', bO).addEventListener('click', () => showScreen('materials'));

  const bL = instBlock(colC, 'Line width', '1.5', 'pt');
  const lws = el('div', 'lw-row');
  bL.appendChild(lws);
  const lroDraw = roEditable(bL, () => window.__lw || 1.5, n => setLW(clamp(n, .5, 8)));
  let setLW = v => {
    window.__lw = v;
    $$('.lw', lws).forEach(x => x.classList.toggle('active', Math.abs(parseFloat(x.dataset.w) - v) < .01));
    lroDraw();
  };
  [.5, 1, 1.5, 2.5, 4, 6].forEach(w => {
    const r = el('div', 'lw');
    r.dataset.w = w;
    r.innerHTML = `<i style="height:${w}px"></i><span class="mono">${w.toFixed(1)} pt</span>`;
    r.addEventListener('click', () => setLW(w));
    lws.appendChild(r);
  });
  setLW(1.5);

  const bC = instBlock(colC, 'Colour · blend mode', '#C65A33');
  const cro = $('[data-ro]', bC);
  const cl = el('div');
  cl.innerHTML = `<div class="color-line"><span class="color-dot" id="cd"></span>
      <input type="range" class="rng hue-rng" id="hue" min="0" max="360" value="18">
      <input class="hexin" id="hex" value="#C65A33" spellcheck="false"></div>
    <p class="cap" style="margin:16px 0 8px">Blend</p>
    <div class="seg mini" id="blend-seg"><button class="active">Normal</button><button>Multiply</button><button>Screen</button><button>Overlay</button></div>`;
  bC.appendChild(cl);
  const hsl2hex = (h, s, l) => {
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };
  const syncHue = () => {
    const h = +$('#hue', cl).value;
    const hex = hsl2hex(h, .58, .49);
    $('#cd', cl).style.background = hex;
    $('#hex', cl).value = hex;
    cro.textContent = hex;
  };
  $('#hue', cl).addEventListener('input', syncHue);
  $('#hex', cl).addEventListener('change', e => {
    const v = e.target.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) { $('#cd', cl).style.background = v; cro.textContent = v.toUpperCase(); }
  });
  $('#blend-seg', cl).addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    $$('#blend-seg button', cl).forEach(x => x.classList.toggle('active', x === b));
  });
  syncHue();
}

/* ── icon library ────────────────────────────────────────────── */
const ICONS = [
  ['a-living', 'Living', 'Architecture'], ['a-bedroom', 'Bedroom', 'Architecture'], ['a-kitchen', 'Kitchen', 'Architecture'],
  ['a-toilet', 'Toilet', 'Architecture'], ['a-stair', 'Stair', 'Architecture'], ['a-lift', 'Lift', 'Architecture'],
  ['a-parking', 'Parking', 'Architecture'], ['a-circulation', 'Circulation', 'Architecture'], ['a-service', 'Service', 'Architecture'],
  ['l-tree', 'Tree', 'Landscape'], ['l-green', 'Green Space', 'Landscape'], ['l-water', 'Water', 'Landscape'],
  ['l-outdoor', 'Outdoor', 'Landscape'], ['l-terrain', 'Terrain', 'Landscape'],
  ['d-cutx', 'Cutout / X', 'Diagram'], ['d-entry', 'Entry', 'Diagram'], ['d-exit', 'Exit', 'Diagram'],
  ['d-public', 'Public', 'Diagram'], ['d-private', 'Private', 'Diagram'], ['d-restricted', 'Restricted', 'Diagram'],
].map(([sym, name, cat]) => ({ sym, name, cat }));
const IC_CATS = ['Architecture', 'Landscape', 'Diagram', 'Annotation', 'SVG', 'PNG', 'Uploaded', 'Saved Sets'];
let icCat = 'Architecture', icQ = '', icSel = ICONS[0];
const icState = { scale: 58, rot: 0, op: 100, tint: 'Ink', backing: true, border: false, automap: true, zmin: 40, zmax: 220 };
function buildIcons() {
  $('#ic-cats').innerHTML =
    `<p class="cap mb-hd">Sets</p>` +
    IC_CATS.map(c => {
      const n = ICONS.filter(i => i.cat === c).length;
      return `<button class="${c === icCat ? 'active' : ''}" data-c="${c}">${c}<span class="cnt">${n || '—'}</span></button>`;
    }).join('');
  let items = ICONS.filter(i => i.cat === icCat);
  if (icQ) items = ICONS.filter(i => i.name.toLowerCase().includes(icQ));
  $('#ic-count').textContent = items.length ? items.length + ' glyphs' : '';
  $('#ic-grid').innerHTML = items.length
    ? items.map(i =>
      `<div class="icell${i === icSel ? ' active' : ''}" data-sym="${i.sym}">
        <span class="ic-orb">${icon(i.sym)}</span><span class="mnm">${i.name}</span></div>`).join('')
    : `<div style="grid-column:1/-1;padding:34px 8px;color:var(--ink-45);font-size:11px">
       ${icCat === 'Annotation' ? 'Annotation glyphs live on the Type screen — 05.3.' : `${icCat} intake arrives with V8.3 file wiring. Drop targets are designed on the Files sheet.`}</div>`;
  buildIconInspector();
}
function buildIconInspector() {
  const s = icState;
  $('#ic-insp').innerHTML = `
    <p class="cap">Placement preview</p>
    <div class="ic-stage"><div class="ic-cell" style="background:${matCSS(matById('sol-sage'))}">
      <span class="ic-backing" id="icb"></span>
      ${icon(icSel.sym)}
    </div></div>
    <div class="ic-note">centre-placed · auto-mapped to “${icSel.name}”</div>
    <div class="insp-hr"></div>
    <div class="insp-row"><label>Scale</label><input type="range" class="rng" id="ics" min="20" max="100" value="${s.scale}"><span class="val" id="ics-v">${s.scale}%</span></div>
    <div class="insp-row"><label>Rotation</label><input type="range" class="rng" id="icr" min="-180" max="180" value="${s.rot}"><span class="val" id="icr-v">${s.rot}°</span></div>
    <div class="insp-row"><label>Opacity</label><input type="range" class="rng" id="ico" min="10" max="100" value="${s.op}"><span class="val" id="ico-v">${s.op}%</span></div>
    <div class="insp-row"><label>Tint</label><div class="seg mini" id="ictint">${['Ink', 'Paper', 'Material'].map(t => `<button class="${s.tint === t ? 'active' : ''}">${t}</button>`).join('')}</div></div>
    <div class="insp-row"><label>Backing</label><span class="tgl${s.backing ? ' on' : ''}" id="icbk"></span><span class="val">${s.backing ? 'circle' : 'none'}</span></div>
    <div class="insp-row"><label>Border</label><span class="tgl${s.border ? ' on' : ''}" id="icbd"></span></div>
    <div class="insp-row"><label>Auto-map</label><span class="tgl${s.automap ? ' on' : ''}" id="icam"></span><span class="val">by category</span></div>
    <p class="cap" style="margin-top:18px">Zoom visibility</p>
    <div class="insp-row"><label>Min zoom</label><input type="range" class="rng" id="iczn" min="10" max="100" value="${s.zmin}"><span class="val" id="iczn-v">${s.zmin}%</span></div>
    <div class="insp-row"><label>Max zoom</label><input type="range" class="rng" id="iczx" min="100" max="400" value="${s.zmax}"><span class="val" id="iczx-v">${s.zmax}%</span></div>
    <div class="insp-meta">Icon hides below min zoom and above max zoom.<br>Category auto-map keeps glyphs matched to cell names.</div>`;
  const sync = () => {
    const cell = $('.ic-cell', $('#ic-insp'));
    const svg = $('svg', cell);
    const back = $('#icb');
    const px = 128 * s.scale / 100 * .62;
    svg.style.width = svg.style.height = px + 'px';
    svg.style.transform = `rotate(${s.rot}deg)`;
    svg.style.opacity = s.op / 100;
    svg.style.color = s.tint === 'Ink' ? '#17170F' : s.tint === 'Paper' ? '#F4F3EE' : '#C65A33';
    back.style.display = s.backing ? 'block' : 'none';
    const bs = px * 1.5;
    back.style.width = back.style.height = bs + 'px';
    back.style.boxShadow = s.border ? '0 0 0 1.5px #17170F' : 'var(--e1)';
    $('#ics-v').textContent = s.scale + '%';
    $('#icr-v').textContent = s.rot + '°';
    $('#ico-v').textContent = s.op + '%';
    $('#iczn-v').textContent = s.zmin + '%';
    $('#iczx-v').textContent = s.zmax + '%';
  };
  $('#ics').addEventListener('input', e => { s.scale = +e.target.value; sync(); });
  $('#icr').addEventListener('input', e => { s.rot = +e.target.value; sync(); });
  $('#ico').addEventListener('input', e => { s.op = +e.target.value; sync(); });
  $('#iczn').addEventListener('input', e => { s.zmin = +e.target.value; sync(); });
  $('#iczx').addEventListener('input', e => { s.zmax = +e.target.value; sync(); });
  $('#ictint').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    s.tint = b.textContent;
    $$('#ictint button').forEach(x => x.classList.toggle('active', x === b));
    sync();
  });
  $('#icbk').addEventListener('click', e => { s.backing = !s.backing; e.target.classList.toggle('on', s.backing); sync(); });
  $('#icbd').addEventListener('click', e => { s.border = !s.border; e.target.classList.toggle('on', s.border); sync(); });
  $('#icam').addEventListener('click', e => { s.automap = !s.automap; e.target.classList.toggle('on', s.automap); });
  sync();
}
$('#ic-cats').addEventListener('click', e => {
  const b = e.target.closest('button[data-c]');
  if (!b) return;
  icCat = b.dataset.c; icQ = ''; $('#ic-q').value = '';
  buildIcons();
});
$('#ic-grid').addEventListener('click', e => {
  const c = e.target.closest('.icell');
  if (!c) return;
  icSel = ICONS.find(i => i.sym === c.dataset.sym);
  buildIcons();
});
$('#ic-q').addEventListener('input', e => { icQ = e.target.value.toLowerCase(); buildIcons(); });

/* ── type & annotation ───────────────────────────────────────── */
const tyState = { family: 'Grotesk', size: 30, weight: 700, lh: 1.2, track: .06, align: 'left', rot: 0, dotted: false };
const TY_PRESETS = [
  { name: 'Cell Label', d: 'grotesk · 11 · 600 · +2%', st: { family: 'Grotesk', size: 15, weight: 600, track: .02, dotted: false } },
  { name: 'Area Data', d: 'mono · 10 · tabular', st: { family: 'Mono', size: 13, weight: 500, track: .05, dotted: false } },
  { name: 'Section Caption', d: 'grotesk caps · 9 · +14%', st: { family: 'Grotesk', size: 11, weight: 600, track: .14, dotted: false } },
  { name: 'Editorial Note', d: 'grotesk · 13 · 1.65lh', st: { family: 'Grotesk', size: 14, weight: 400, track: 0, dotted: false } },
  { name: 'Display Dot', d: 'dot matrix · display only', st: { family: 'Mono', size: 44, weight: 700, track: .04, dotted: true } },
];
function buildType() {
  const c = $('#ty-controls');
  c.innerHTML = `
    <div class="insp-row"><label>Family</label><div class="seg mini" id="tyf">${['Grotesk', 'Mono', 'Dot'].map(f => `<button class="${tyState.family === f ? 'active' : ''}">${f}</button>`).join('')}</div></div>
    <div class="insp-row"><label>Size</label><input type="range" class="rng" id="tys" min="8" max="72" value="${tyState.size}"><span class="val" id="tys-v">${tyState.size} px</span></div>
    <div class="insp-row"><label>Weight</label><div class="seg mini" id="tyw">${[400, 500, 600, 700].map(w => `<button class="${tyState.weight === w ? 'active' : ''}">${w}</button>`).join('')}</div></div>
    <div class="insp-row"><label>Line height</label><input type="range" class="rng" id="tyl" min="90" max="200" value="${tyState.lh * 100}"><span class="val" id="tyl-v">${tyState.lh.toFixed(2)}</span></div>
    <div class="insp-row"><label>Tracking</label><input type="range" class="rng" id="tyt" min="-4" max="24" value="${tyState.track * 100}"><span class="val" id="tyt-v">+${Math.round(tyState.track * 100)}%</span></div>
    <div class="insp-row"><label>Alignment</label><div class="seg mini" id="tya">${['left', 'center', 'right'].map(a => `<button class="${tyState.align === a ? 'active' : ''}">${a}</button>`).join('')}</div></div>
    <div class="insp-row"><label>Rotation</label><input type="range" class="rng" id="tyr" min="-90" max="90" value="${tyState.rot}"><span class="val" id="tyr-v">${tyState.rot}°</span></div>
    <div class="insp-row"><label>Dotted display</label><span class="tgl${tyState.dotted ? ' on' : ''}" id="tyd"></span><span class="val">large sizes only</span></div>`;
  const sync = () => {
    const lab = $('#ty-label'), para = $('#ty-para'), data = $('#ty-data');
    const fam = tyState.family === 'Mono' || tyState.family === 'Dot' ? 'var(--font-mono)' : 'var(--font-ui)';
    lab.style.fontFamily = fam;
    lab.style.fontSize = tyState.size + 'px';
    lab.style.fontWeight = tyState.weight;
    lab.style.lineHeight = tyState.lh;
    lab.style.letterSpacing = tyState.track + 'em';
    lab.style.textAlign = tyState.align;
    lab.style.transform = `rotate(${tyState.rot}deg)`;
    lab.style.transformOrigin = 'left center';
    lab.classList.toggle('dot', tyState.dotted || tyState.family === 'Dot');
    para.style.textAlign = tyState.align;
    para.style.lineHeight = Math.max(tyState.lh, 1.3);
    data.style.letterSpacing = tyState.track + 'em';
    $('#tys-v').textContent = tyState.size + ' px';
    $('#tyl-v').textContent = tyState.lh.toFixed(2);
    $('#tyt-v').textContent = (tyState.track >= 0 ? '+' : '') + Math.round(tyState.track * 100) + '%';
    $('#tyr-v').textContent = tyState.rot + '°';
  };
  $('#tyf').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    tyState.family = b.textContent;
    $$('#tyf button').forEach(x => x.classList.toggle('active', x === b));
    sync();
  });
  $('#tyw').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    tyState.weight = +b.textContent;
    $$('#tyw button').forEach(x => x.classList.toggle('active', x === b));
    sync();
  });
  $('#tya').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    tyState.align = b.textContent;
    $$('#tya button').forEach(x => x.classList.toggle('active', x === b));
    sync();
  });
  $('#tys').addEventListener('input', e => { tyState.size = +e.target.value; sync(); });
  $('#tyl').addEventListener('input', e => { tyState.lh = e.target.value / 100; sync(); });
  $('#tyt').addEventListener('input', e => { tyState.track = e.target.value / 100; sync(); });
  $('#tyr').addEventListener('input', e => { tyState.rot = +e.target.value; sync(); });
  $('#tyd').addEventListener('click', e => { tyState.dotted = !tyState.dotted; e.target.classList.toggle('on', tyState.dotted); sync(); });
  sync();

  $('#ty-presets').innerHTML = TY_PRESETS.map((p, i) =>
    `<div class="ty-preset" data-i="${i}"><div class="pv${p.st.dotted ? ' dot' : ''}" style="font-family:${p.st.family === 'Mono' ? 'var(--font-mono)' : 'var(--font-ui)'};font-weight:${p.st.weight};letter-spacing:${p.st.track}em">Aa 128 m²</div><div class="pm">${p.name} — ${p.d}</div></div>`).join('');
  $('#ty-presets').addEventListener('click', e => {
    const t = e.target.closest('.ty-preset');
    if (!t) return;
    Object.assign(tyState, TY_PRESETS[+t.dataset.i].st);
    buildType();
    toast(`Preset — ${TY_PRESETS[+t.dataset.i].name}`);
  });

  /* annotation glyph set */
  const A = (name, svg, sig) => ({ name, svg, sig });
  const st = 'stroke="currentColor" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"';
  const ANNO = [
    A('North', `<svg viewBox="0 0 48 48" ${st}><circle cx="24" cy="24" r="17"/><path d="M24 10l5 22-5-6-5 6z" fill="currentColor" stroke="none"/><text x="24" y="8" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-family="monospace">N</text></svg>`),
    A('Sun Path', `<svg viewBox="0 0 48 48" ${st}><path d="M8 34a16 16 0 0 1 32 0"/><circle cx="35" cy="18" r="4"/><path d="M35 11v-2.6M41 20l2.4-1M40 13.6l1.8-1.8M8 38h32" /></svg>`),
    A('Wind', `<svg viewBox="0 0 48 48" ${st}><path d="M6 18h22a5 5 0 1 0-5-5M6 27h30a5 5 0 1 1-5 5M6 36h14"/></svg>`),
    A('Hot Wind', `<svg viewBox="0 0 48 48" ${st}><path d="M8 20h24M26 14l6 6-6 6M8 30h18M20 25l5 5-5 5"/><circle cx="38" cy="30" r="4" fill="currentColor" stroke="none"/></svg>`, true),
    A('Cold Wind', `<svg viewBox="0 0 48 48" ${st}><path d="M8 20h24M26 14l6 6-6 6M8 30h18M20 25l5 5-5 5"/><circle cx="38" cy="30" r="4"/></svg>`),
    A('Scale Bar', `<svg viewBox="0 0 48 48" ${st}><path d="M6 22h36v6H6z"/><path d="M15 22v6M24 22v6M33 22v6"/><path d="M6 22v6M15 22h9v6h-9z" fill="currentColor" stroke="none" opacity=".85"/><path d="M24 22h9v6" fill="none"/><rect x="24" y="22" width="0" height="0"/></svg>`),
    A('Digital Scale', `<svg viewBox="0 0 48 48" ${st}><rect x="6" y="18" width="36" height="13" rx="1.5"/></svg>`, false, true),
    A('Dimension', `<svg viewBox="0 0 48 48" ${st}><path d="M8 30V16M40 30V16M8 23h32M12 20.6L8 23l4 2.4M36 20.6l4 2.4-4 2.4"/></svg>`),
    A('Area Tag', `<svg viewBox="0 0 48 48" ${st}><circle cx="24" cy="22" r="13" stroke-dasharray="3 3"/><text x="24" y="26" text-anchor="middle" font-size="9" fill="currentColor" stroke="none" font-family="monospace">m²</text></svg>`),
    A('Floor Mark', `<svg viewBox="0 0 48 48" ${st}><path d="M24 8l13 13-13 13-13-13z"/><text x="24" y="25" text-anchor="middle" font-size="9" fill="currentColor" stroke="none" font-family="monospace">F1</text><path d="M11 38h26"/></svg>`),
    A('Entry / Exit', `<svg viewBox="0 0 48 48" ${st}><path d="M10 14v20M10 24h20M25 19l5 5-5 5M38 14v20"/></svg>`),
    A('Section', `<svg viewBox="0 0 48 48" ${st}><path d="M8 24h32" stroke-dasharray="6 4"/><circle cx="8" cy="24" r="5"/><circle cx="40" cy="24" r="5"/><text x="8" y="27" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-family="monospace">A</text><text x="40" y="27" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-family="monospace">A</text></svg>`),
    A('View Cone', `<svg viewBox="0 0 48 48" ${st}><circle cx="14" cy="24" r="3" fill="currentColor" stroke="none"/><path d="M17 22L38 12M17 26l21 10M17 22l21-10M28 17.5a13 13 0 0 1 0 13" stroke-dasharray="3 3"/></svg>`),
  ];
  $('#anno-grid').innerHTML = ANNO.map(a =>
    `<div class="an-ic${a.sig ? ' sig' : ''}">${a.svg.replace('<rect x="6" y="18" width="36" height="13" rx="1.5"/>',
      '<rect x="6" y="18" width="36" height="13" rx="1.5"/><text x="24" y="27.5" text-anchor="middle" font-size="8.5" fill="currentColor" stroke="none" font-family="monospace" id="anno-scale-val">1:200</text>')}<span class="mnm">${a.name}${a.name === 'Digital Scale' ? ' · live' : ''}</span></div>`).join('');
}
function refreshTypeData() {
  const c = S.cells.find(x => x.kind === 'space');
  if (c) $('#ty-data').textContent = `${c.name.toUpperCase()} · ${fmt1(c.area)} m²`;
}

/* ── canvas & grid sheet ─────────────────────────────────────── */
const GRID_STYLES = [
  ['dotted', 'Dotted'], ['fine', 'Fine Line'], ['technical', 'Technical'], ['arch', 'Architectural'],
  ['technical-mm', 'Major / Minor'], ['iso', 'Isometric'], ['radial', 'Radial'], ['off', 'None'],
];
function buildGridSheet() {
  $('#gr-previews').innerHTML = GRID_STYLES.map(([id, name]) => {
    const cls = id === 'technical-mm' ? 'g-arch' : ('g-' + id);
    return `<div class="gr-pre${gridStyleActive() === id ? ' active' : ''}" data-g="${id}">
      <div class="gp ${id === 'off' ? '' : cls}" style="--g-size:13px;--g-op:.5;--g-weight:1px;--g-major:4"></div>
      <span class="gnm">${name}</span></div>`;
  }).join('');
  $('#gr-bgs').innerHTML = [
    ['default', 'Auto', 'background:var(--bg)'],
    ['white', 'White', 'background:#FFFFFF'],
    ['black', 'Black', 'background:#0A0A0B'],
    ['solid', 'Solid', 'background:#DAD5C8'],
    ['gradient', 'Gradient', 'background:linear-gradient(180deg,#EFEDE5,#D8D2C2)'],
    ['paper', 'Paper', 'background:var(--bg);background-image:radial-gradient(rgba(23,23,15,.16) .7px,transparent .9px);background-size:4px 4px'],
    ['material', 'Material', `background:${matCSS(matById(S.activeMat))}`],
  ].map(([id, name, css]) =>
    `<div class="gr-bg${S.bgMode === id ? ' active' : ''}" data-bg="${id}"><i style="${css}"></i><span class="mnm">${name}</span></div>`).join('');

  const gc = $('#gr-controls');
  gc.innerHTML = `
    <p class="cap">Mode</p>
    <div class="seg" id="gr-mode" style="margin-top:9px">
      <button data-gm="auto" class="${S.grid.mode === 'auto' ? 'active' : ''}">Ink on paper</button>
      <button data-gm="invert" class="${S.grid.mode === 'invert' ? 'active' : ''}">Paper on ink</button>
      <button data-gm="custom" class="${S.grid.mode === 'custom' ? 'active' : ''}">Custom</button>
    </div>
    <div class="insp-row" id="gr-hue-row" style="${S.grid.mode === 'custom' ? '' : 'display:none'}">
      <label>Grid hue</label><input type="range" class="rng hue-rng" id="gr-hue" min="0" max="360" value="${S.grid.hue}"><span class="val" id="gr-hue-v">${S.grid.hue}°</span>
    </div>
    <div style="height:14px"></div>
    <div class="gr-row"><label>Grid scale</label><input type="range" class="rng" id="gr-size" min="12" max="72" value="${S.grid.size}"><span class="val" id="gr-size-v">${S.grid.size} px</span></div>
    <div class="gr-row"><label>Opacity</label><input type="range" class="rng" id="gr-op" min="5" max="90" value="${Math.round(S.grid.op * 100)}"><span class="val" id="gr-op-v">${Math.round(S.grid.op * 100)}%</span></div>
    <div class="gr-row"><label>Weight</label><input type="range" class="rng" id="gr-w" min="5" max="22" value="${S.grid.weight * 10}"><span class="val" id="gr-w-v">${S.grid.weight.toFixed(1)} px</span></div>
    <div class="gr-row"><label>Major interval</label><input type="range" class="rng" id="gr-mj" min="2" max="8" value="${S.grid.major}"><span class="val" id="gr-mj-v">× ${S.grid.major}</span></div>
    <div class="gr-row"><label>Snap to grid</label><span class="tgl${S.grid.snap ? ' on' : ''}" id="gr-snap"></span><span class="val">${S.grid.snap ? 'on' : 'off'}</span></div>
    <div class="gr-row"><label>Dynamic density</label><span class="tgl${S.grid.dynamic ? ' on' : ''}" id="gr-dyn"></span><span class="val">zoom-adaptive</span></div>
    <div class="gr-row"><label>Export grid</label><span class="tgl${S.grid.exportGrid ? ' on' : ''}" id="gr-exp"></span><span class="val">include in PNG</span></div>`;
  bindGridControls();
}
function gridStyleActive() { return S.grid.on ? S.grid.style : 'off'; }
function setGridStyle(id) {
  if (id === 'off') { S.grid.on = false; }
  else {
    S.grid.on = true;
    S.grid.style = id;
    const cls = id === 'technical-mm' ? 'g-arch' : 'g-' + id;
    gridLayer.className = '';
    gridLayer.classList.add(cls);
  }
  gridLayer.classList.toggle('g-off', !S.grid.on);
  $('#d-grid').classList.toggle('on', S.grid.on);
  $$('#gr-previews .gr-pre').forEach(p => p.classList.toggle('active', p.dataset.g === gridStyleActive()));
}
function bindGridControls() {
  $('#gr-previews').onclick = e => {
    const p = e.target.closest('.gr-pre');
    if (p) setGridStyle(p.dataset.g);
  };
  $('#gr-bgs').onclick = e => {
    const b = e.target.closest('.gr-bg');
    if (!b) return;
    S.bgMode = b.dataset.bg;
    stage.classList.remove('bg-paper', 'bg-gradient');
    stage.style.background = '';
    if (S.bgMode === 'white') stage.style.background = '#FFFFFF';
    else if (S.bgMode === 'black') stage.style.background = '#0A0A0B';
    else if (S.bgMode === 'solid') stage.style.background = S.mode === 'day' ? '#DAD5C8' : '#1A1A1E';
    else if (S.bgMode === 'gradient') stage.classList.add('bg-gradient');
    else if (S.bgMode === 'paper') stage.classList.add('bg-paper');
    else if (S.bgMode === 'material') stage.style.background = matCSS(matById(S.activeMat));
    $$('#gr-bgs .gr-bg').forEach(x => x.classList.toggle('active', x === b));
  };
  $('#gr-mode').onclick = e => {
    const b = e.target.closest('button[data-gm]');
    if (!b) return;
    S.grid.mode = b.dataset.gm;
    $$('#gr-mode button').forEach(x => x.classList.toggle('active', x === b));
    $('#gr-hue-row').style.display = S.grid.mode === 'custom' ? '' : 'none';
    applyGridMode();
  };
  $('#gr-hue').oninput = e => {
    S.grid.hue = +e.target.value;
    $('#gr-hue-v').textContent = S.grid.hue + '°';
    applyGridMode();
  };
  const wire = (id, fn) => { $('#' + id).oninput = e => fn(+e.target.value); };
  wire('gr-size', v => { S.grid.size = v; $('#gr-size-v').textContent = v + ' px'; applyCam(); });
  wire('gr-op', v => { S.grid.op = v / 100; $('#gr-op-v').textContent = v + '%'; gridLayer.style.setProperty('--g-op', S.grid.op); });
  wire('gr-w', v => { S.grid.weight = v / 10; $('#gr-w-v').textContent = S.grid.weight.toFixed(1) + ' px'; gridLayer.style.setProperty('--g-weight', S.grid.weight + 'px'); });
  wire('gr-mj', v => { S.grid.major = v; $('#gr-mj-v').textContent = '× ' + v; gridLayer.style.setProperty('--g-major', v); });
  $('#gr-snap').onclick = e => { S.grid.snap = !S.grid.snap; e.target.classList.toggle('on', S.grid.snap); $('#d-snap').classList.toggle('on', S.grid.snap); e.target.nextElementSibling.textContent = S.grid.snap ? 'on' : 'off'; };
  $('#gr-dyn').onclick = e => { S.grid.dynamic = !S.grid.dynamic; e.target.classList.toggle('on', S.grid.dynamic); applyCam(); };
  $('#gr-exp').onclick = e => { S.grid.exportGrid = !S.grid.exportGrid; e.target.classList.toggle('on', S.grid.exportGrid); toast(S.grid.exportGrid ? 'Grid will be included in exports' : 'Grid excluded from exports'); };
}
function applyGridMode() {
  if (S.grid.mode === 'custom') {
    const h = S.grid.hue;
    const [r, g, b] = (() => {
      const f = n => {
        const k = (n + h / 30) % 12;
        return Math.round(255 * (.5 - .42 * Math.max(Math.min(k - 3, 9 - k, 1), -1)));
      };
      return [f(0), f(8), f(4)];
    })();
    gridLayer.style.setProperty('--gridc', `${r}, ${g}, ${b}`);
  } else if (S.grid.mode === 'invert') {
    gridLayer.style.setProperty('--gridc', S.mode === 'day' ? '239, 238, 232' : '23, 23, 15');
    if (S.bgMode === 'default') stage.style.background = S.mode === 'day' ? '#232320' : '#E8E6DE';
  } else {
    gridLayer.style.removeProperty('--gridc');
    if (S.bgMode === 'default') stage.style.background = '';
  }
}
function syncGridControls() {
  const t = $('#gr-snap');
  if (t) { t.classList.toggle('on', S.grid.snap); t.nextElementSibling.textContent = S.grid.snap ? 'on' : 'off'; }
}

/* ── tools page ──────────────────────────────────────────────── */
const TOOLS = [
  ['Create', 'Add Space', 'A', 'Place a circular space cell on the plan', 'i-create', 'active'],
  ['Create', 'Add Void', 'O', 'Cut a dashed void into the composition', 'i-void', 'active'],
  ['Create', 'Add Line', 'L', 'Draw a straight annotation line', 'i-line', 'active'],
  ['Create', 'Add Relationship', 'R', 'Link two spaces with a dashed relation', 'i-relationship', 'active'],
  ['Create', 'Add Text', 'T', 'Free-floating label, editable in place', 'i-text', 'active'],
  ['Create', 'Add Paragraph', '⇧ T', 'Editorial annotation block', 'i-paragraph', 'active'],
  ['Select', 'Select', 'V', 'Click to select · drag to move · double-click to edit', 'i-select', 'active'],
  ['Select', 'Lasso', 'Q', 'Freeform multi-select across the canvas', 'i-boundary', 'future'],
  ['Arrange', 'Duplicate', '⌘ D', 'Clone the selected object beside itself', 'i-duplicate', 'active'],
  ['Arrange', 'Group', 'G', 'Bind cells into a movable cluster', 'i-group', 'future'],
  ['Arrange', 'Lock', '⇧ L', 'Pin an object against accidental edits', 'i-lock', 'active'],
  ['Arrange', 'Snap', 'S', 'Round positions to the active grid', 'i-snap', 'active'],
  ['Materials', 'Quick Shelf', 'M', 'Circular material rail above the dock', 'i-materials', 'active'],
  ['Materials', 'Studio Browser', '2', 'Full library with parameters and targets', 'i-materials', 'active'],
  ['Annotation', 'Dimension', 'D', 'Measured span with arrowheads', 'i-line', 'future'],
  ['Annotation', 'North Arrow', 'N', 'Orientation mark, prints with plan', 'i-view', 'future'],
  ['Annotation', 'Scale Bar', '⇧ S', 'Dynamic digital scale, zoom-linked', 'i-analysis', 'future'],
  ['Analysis', 'Area Lens', '8', 'Live totals, leaders and category mix', 'i-analysis', 'active'],
  ['Analysis', 'Privacy Lens', '⇧ 8', 'Public / private balance overlay', 'i-view', 'active'],
  ['Analysis', 'Adjacency Matrix', '⌥ 8', 'Distance-derived adjacency heat', 'i-grid', 'future'],
  ['Files', 'Import CSV', '⌘ I', 'PapaParse intake into the graph', 'i-import', 'future'],
  ['Files', 'Export PNG', '⇧ E', 'Flatten canvas with export-grid rule', 'i-export', 'future'],
  ['View', 'Grid Styles', '6', 'Dotted, technical, isometric, radial…', 'i-grid', 'active'],
  ['View', 'Day / Night', '·', 'Museum cream ↔ graph noir', 'i-moon', 'active'],
].map(([cat, name, k, desc, ic, st]) => ({ cat, name, k, desc, ic, st }));
function buildTools() {
  $('#tl-recent').innerHTML = `<span class="cap">Recently used</span>` +
    S.toolRecents.map(n => {
      const t = TOOLS.find(x => x.name === n) || TOOLS[6];
      return `<button class="rchip">${icon(t.ic)}${t.name}</button>`;
    }).join('');
  renderToolList('');
  $('#tl-q').addEventListener('input', e => renderToolList(e.target.value.toLowerCase()));
  $('#tl-recent').addEventListener('click', e => {
    const b = e.target.closest('.rchip');
    if (b) toast(`${b.textContent.trim()} — jump wired on canvas`);
  });
}
function renderToolList(q) {
  const cats = ['Create', 'Select', 'Arrange', 'Materials', 'Annotation', 'Analysis', 'Files', 'View'];
  $('#tl-list').innerHTML = cats.map(cat => {
    const rows = TOOLS.filter(t => t.cat === cat && (!q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)));
    if (!rows.length) return '';
    return `<p class="cap tl-cat">${cat}</p>` + rows.map(t => `
      <div class="tool-row">
        <span class="t-ic">${icon(t.ic)}</span>
        <span class="t-nm">${t.name}</span>
        ${keys(t.k)}
        <span class="t-desc">${t.desc}</span>
        <span class="t-pre"><span style="position:absolute;inset:0;background:${t.st === 'active' ? 'repeating-linear-gradient(45deg, var(--wash) 0 6px, transparent 6px 12px)' : 'transparent'};"></span></span>
        <span class="t-st"><span class="st-chip ${t.st}">${t.st}</span></span>
      </div>`).join('');
  }).join('');
}

/* ── analysis workspace ──────────────────────────────────────── */
function buildAnalysis() {
  $('#an-lenses').innerHTML = ['Area', 'Privacy', 'Circulation', 'Daylight'].map((l, i) =>
    `<button class="lens${i === 0 ? ' active' : ''}${i > 1 ? ' future' : ''}">${l}${i > 1 ? ' ·soon' : ''}</button>`).join('');
  $('#an-lenses').onclick = e => {
    const b = e.target.closest('.lens');
    if (!b || b.classList.contains('future')) return;
    $$('#an-lenses .lens').forEach(x => x.classList.toggle('active', x === b));
    toast(`${b.textContent} lens`);
  };
  $('#an-filters').innerHTML = `
    <div class="seg mini"><button class="active">GF</button><button>F1</button><button>All</button></div>
    <div class="seg mini"><button class="active">All cats</button><button>Living</button><button>Service</button></div>`;
  $$('#an-filters .seg').forEach(sg => sg.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    $$('button', sg).forEach(x => x.classList.toggle('active', x === b));
  }));
  $('#an-export').onclick = () => toast('Report export — V8.3 wiring target');

  const spaces = S.cells.filter(c => c.kind === 'space');
  const total = spaces.reduce((a, c) => a + c.area, 0);
  const byCat = {};
  spaces.forEach(c => { byCat[c.cat] = (byCat[c.cat] || 0) + c.area; });
  const pub = spaces.filter(c => c.priv === 'public').reduce((a, c) => a + c.area, 0);
  const leaders = [...spaces].sort((a, b) => b.area - a.area).slice(0, 5);
  const catColor = { living: '#C65A33', sleep: '#B49BCE', service: '#9BA88D', outdoor: '#7FB0DC' };
  const health = Math.round(spaces.filter(c => c.name !== 'Space' && c.mat).length / Math.max(spaces.length, 1) * 100);

  /* relationship mini graph from live cells */
  const gw = 260, gh = 150;
  let xs = spaces.map(c => c.x), ys = spaces.map(c => c.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const nx = c => 18 + (c.x - x0) / Math.max(x1 - x0, 1) * (gw - 36);
  const ny = c => 14 + (c.y - y0) / Math.max(y1 - y0, 1) * (gh - 28);
  let links = '';
  for (let i = 0; i < spaces.length; i++) for (let j = i + 1; j < spaces.length; j++) {
    const a = spaces[i], b = spaces[j];
    if (Math.hypot(a.x - b.x, a.y - b.y) < 240)
      links += `<line class="lk" x1="${nx(a)}" y1="${ny(a)}" x2="${nx(b)}" y2="${ny(b)}"/>`;
  }
  const nodes = spaces.map(c =>
    `<circle class="nd" cx="${nx(c)}" cy="${ny(c)}" r="${clamp(Math.sqrt(c.area) * 1.7, 4, 13)}"/>`).join('');

  /* adjacency matrix from live distances */
  const N = Math.min(spaces.length, 7);
  let mx = '';
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const d = i === j ? 0 : Math.hypot(spaces[i].x - spaces[j].x, spaces[i].y - spaces[j].y);
    const v = i === j ? 0 : clamp(1 - d / 480, .04, .95);
    mx += `<i style="opacity:${v.toFixed(2)}"></i>`;
  }

  $('#an-grid').innerHTML = `
  <div class="an-col">
    <div class="an-block">
      <span class="cap">Total programme area</span>
      <div class="an-total dot">${total.toFixed(1)}</div>
      <span class="an-total-unit">m² across ${spaces.length} spaces · ground floor</span>
    </div>
    <div class="an-block">
      <span class="cap">Area leaders</span>
      <div style="margin-top:10px">${leaders.map((c, i) => `
        <div class="leader">
          <span class="rank">0${i + 1}</span><span class="lnm">${c.name}</span>
          <span class="lbar"><i style="width:${(c.area / leaders[0].area * 100).toFixed(0)}%"></i></span>
          <span class="mono">${fmt1(c.area)} m²</span>
        </div>`).join('')}</div>
    </div>
    <div class="an-block">
      <span class="cap">Programme flow <span class="ph-tag">Sankey · V8.3</span></span>
      <svg class="an-svg" viewBox="0 0 300 110">
        <path d="M10 20 C 110 20, 150 34, 290 30" stroke="${catColor.living}" stroke-width="16" opacity=".4" fill="none"/>
        <path d="M10 52 C 120 52, 160 58, 290 62" stroke="${catColor.service}" stroke-width="10" opacity=".4" fill="none"/>
        <path d="M10 82 C 110 82, 170 86, 290 88" stroke="${catColor.sleep}" stroke-width="12" opacity=".4" fill="none"/>
        <line x1="10" y1="8" x2="10" y2="102" stroke="var(--ink-45)"/>
        <line x1="290" y1="8" x2="290" y2="102" stroke="var(--ink-45)"/>
      </svg>
    </div>
  </div>
  <div class="an-col">
    <div class="an-block">
      <span class="cap">Space count</span>
      <div class="an-kpi">${S.cells.length}</div>
      <span class="an-sub">${spaces.length} spaces · ${S.cells.filter(c => c.kind === 'void').length} void · ${S.cells.filter(c => c.kind === 'core').length} core</span>
    </div>
    <div class="an-block">
      <span class="cap">Category mix</span>
      <div class="mixbar">${Object.entries(byCat).map(([k, v]) =>
        `<i style="width:${(v / total * 100).toFixed(1)}%;background:${catColor[k] || '#999'}"></i>`).join('')}</div>
      <div class="mix-legend">${Object.entries(byCat).map(([k, v]) =>
        `<div class="ml"><i style="background:${catColor[k] || '#999'}"></i>${k}<span class="mono">${(v / total * 100).toFixed(0)}%</span></div>`).join('')}</div>
    </div>
    <div class="an-block">
      <span class="cap">Privacy balance</span>
      <div class="split"><span class="pub" style="width:${(pub / total * 100).toFixed(0)}%"></span><span class="prv" style="flex:1"></span></div>
      <div class="split-lg"><span>Public ${(pub / total * 100).toFixed(0)}%</span><span>Private ${(100 - pub / total * 100).toFixed(0)}%</span></div>
    </div>
    <div class="an-block">
      <span class="cap">Data health</span>
      <div class="health-dial">
        <svg viewBox="0 0 74 74">
          <circle class="hd-t" cx="37" cy="37" r="30"/>
          <circle class="hd-v" cx="37" cy="37" r="30" stroke-dasharray="${(health / 100 * 188.5).toFixed(0)} 188.5" transform="rotate(-90 37 37)"/>
          <text x="37" y="42" text-anchor="middle" font-size="15" font-family="var(--font-mono)" fill="var(--ink)" stroke="none">${health}%</text>
        </svg>
        <div class="health-list">
          <span class="ok">names assigned</span>
          <span class="ok">areas &gt; 0</span>
          <span class="ok">materials set</span>
          <span class="warn">2 spaces unlinked</span>
        </div>
      </div>
    </div>
  </div>
  <div class="an-col">
    <div class="an-block">
      <span class="cap">Floor summary <span class="ph-tag">V8.3</span></span>
      <div style="margin-top:10px">
        <div class="leader"><span class="rank">GF</span><span class="lnm">Ground</span><span class="lbar"><i style="width:100%"></i></span><span class="mono">${total.toFixed(0)} m²</span></div>
        <div class="leader" style="opacity:.4"><span class="rank">F1</span><span class="lnm">First</span><span class="lbar"></span><span class="mono">—</span></div>
        <div class="leader" style="opacity:.4"><span class="rank">RF</span><span class="lnm">Roof</span><span class="lbar"></span><span class="mono">—</span></div>
      </div>
    </div>
    <div class="an-block">
      <span class="cap">Relationship graph <span class="ph-tag">live preview</span></span>
      <svg class="an-svg" viewBox="0 0 ${gw} ${gh}">${links}${nodes}</svg>
    </div>
    <div class="an-block">
      <span class="cap">Adjacency <span class="ph-tag">distance-derived</span></span>
      <div class="matrix" style="grid-template-columns:repeat(${N},1fr);max-width:${N * 24}px">${mx}</div>
      <div class="mx-labels" style="max-width:${N * 24}px"><span>${spaces[0] ? spaces[0].name.slice(0, 3).toUpperCase() : ''}</span><span>…</span><span>${spaces[N - 1] ? spaces[N - 1].name.slice(0, 3).toUpperCase() : ''}</span></div>
    </div>
  </div>`;
}

/* ── files sheet ─────────────────────────────────────────────── */
$('#fi-drop').addEventListener('click', () => toast('File intake is design-only here — wiring lands with V8.3'));
$('#fi-recent').innerHTML = [
  ['programme_v3.csv', '2.1 KB · yesterday'],
  ['site_plan.png', '840 KB · Jul 08'],
  ['brief_rooms.zonuert', '12 KB · Jul 02'],
].map(([n, m]) => `<div class="fi-row">${icon('i-files')}${n}<span class="mono">${m}</span></div>`).join('');

/* ── music player ────────────────────────────────────────────── */
const player = $('#player'), pToggle = $('#p-toggle'), pGlyph = $('.p-glyph', player);
const pFill = $('.p-fill', player), pKnob = $('.p-knob', player), pTime = $('#p-time');
let pRAF = null, pLast = 0;
function pFmt(t) { return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`; }
function pDraw() {
  const pc = S.player.t / S.player.dur * 100;
  pFill.style.width = pc + '%';
  pKnob.style.left = pc + '%';
  pTime.textContent = pFmt(S.player.t);
}
function pTick(ts) {
  if (!S.player.playing) { pRAF = null; return; }
  if (pLast) S.player.t = (S.player.t + (ts - pLast) / 1000) % S.player.dur;
  pLast = ts;
  pDraw();
  pRAF = requestAnimationFrame(pTick);
}
function setPlaying(on) {
  S.player.playing = on;
  player.classList.toggle('playing', on);
  pGlyph.innerHTML = `<use href="#${on ? 'i-pause' : 'i-play'}"/>`;
  pLast = 0;
  if (on && !pRAF) pRAF = requestAnimationFrame(pTick);
}
pToggle.addEventListener('click', () => {
  if (player.classList.contains('collapsed')) {
    player.classList.remove('collapsed');
    S.player.collapsed = false;
    return;
  }
  setPlaying(!S.player.playing);
});
$('#p-collapse').addEventListener('click', () => {
  player.classList.add('collapsed');
  S.player.collapsed = true;
});
$('#p-progress').addEventListener('pointerdown', e => {
  const seek = ev => {
    const r = $('#p-progress').getBoundingClientRect();
    S.player.t = clamp((ev.clientX - r.left) / r.width, 0, 1) * S.player.dur;
    pDraw();
  };
  seek(e);
  const t = $('#p-progress');
  t.setPointerCapture(e.pointerId);
  t.addEventListener('pointermove', seek);
  t.addEventListener('pointerup', () => t.removeEventListener('pointermove', seek), { once: true });
});
$('#p-mute').addEventListener('click', () => {
  S.player.muted = !S.player.muted;
  $('#p-mute').innerHTML = icon(S.player.muted ? 'i-mute' : 'i-vol');
  $('#p-vol').style.opacity = S.player.muted ? .3 : 1;
});
$('#p-vol').addEventListener('input', e => { S.player.vol = +e.target.value; });
pDraw();

/* ── keyboard ────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.target.matches('input, [contenteditable="true"]')) return;
  const k = e.key.toLowerCase();
  if (e.key === 'Escape') {
    closeMenus();
    if (S.screen !== 'canvas') showScreen('canvas');
    return;
  }
  if (k >= '1' && k <= '8' && !e.metaKey && !e.ctrlKey) {
    showScreen(['canvas', 'materials', 'instruments', 'icons', 'type', 'grid', 'tools', 'analysis'][+k - 1]);
    return;
  }
  const toolKeys = { v: 'select', c: 'create', m: 'materials', r: 'arrange' };
  if (toolKeys[k]) {
    const b = $(`#rail button[data-tool="${toolKeys[k]}"]`);
    if (b) b.click();
    return;
  }
  if (k === 'g') $('#d-grid').click();
  if (k === 's') $('#d-snap').click();
  if (k === 'f') fitView();
  if (k === 'd' && e.shiftKey) setMode(S.mode === 'day' ? 'night' : 'day');
});
addEventListener('resize', applyCam);

/* ── boot ────────────────────────────────────────────────────── */
function boot() {
  renderCells();
  fitView();
  buildShelf();
  buildBrowser();
  buildInstruments();
  buildIcons();
  buildType();
  buildGridSheet();
  buildTools();
  refreshTypeData();
  addRel(S.cells[0].id, S.cells[1].id);
  select(S.cells[0].id);
  setTimeout(() => toast('Right-click a cell → radial · right-click canvas → menu'), 700);
}
boot();

})();
