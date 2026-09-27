// Shared parts for MagnetismClear: constants, the pole ("Gilbert") model of a magnet's field,
// a field-line tracer, fat field lines with arrow heads, bar magnets, compasses, iron filings,
// chart boards, force arrows and small layout helpers. +x right, +y up, +z towards the viewer.
// Each chapter says what one scene unit is.
import { THREE, M, box, beam, sphere, torus, arrow, clamp, swarm } from './kit.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

// ---------------------------------------------------------------- constants
export const MU0 = 4e-7 * Math.PI;          // T·m/A, magnetic constant (1.256 637 06 × 10⁻⁶ in the 2019 SI)
export const TAU = Math.PI * 2;
export const G0 = 9.81;
export const QE = 1.602176634e-19, ME = 9.1093837e-31;   // electron charge (C) and mass (kg), CODATA
// Earth's field at the surface ranges from about 25 µT (South Atlantic) to 65 µT (near the magnetic
// poles) (NOAA NCEI / BGS World Magnetic Model). Over India the horizontal part is roughly 30–40 µT;
// we use 40 µT pointing north (−z in chapter scenes, "up the page").
export const B_EARTH_H = 40e-6;
// Remanence Br of common magnet materials (typical datasheet values): sintered ferrite 0.38–0.42 T,
// sintered NdFeB grade N42 1.28–1.32 T (e.g. Arnold Magnetic, K&J Magnetics data).
export const MATS = {
  ferrite: { name: 'ferrite (ceramic)', Br: 0.4 },
  neo: { name: 'neodymium (N42)', Br: 1.3 },
};

// ---------------------------------------------------------------- the pole model
// A uniformly magnetised bar behaves, outside itself, much like two "magnetic charges" of strength
// q = M × A (A·m) near its ends, where M = Br ÷ μ0 and A is the end area. Each pole makes a field
// B = μ0 q ÷ (4π r²) pointing away from N and into S. It is the model Gilbert and Coulomb pictured,
// and it gives good fields a little way from the magnet (Griffiths, Introduction to Electrodynamics,
// ch. 6; Jackson ch. 5). Poles sit about 0.85 of the length apart.
export const poleQ = (Br, area) => (Br / MU0) * area;
// Field (T) at (a, b) in a plane, from poles [{a, b, q}] whose positions are in `unit` metres.
export function poleField(poles, a, b, unit = 0.01) {
  let Ba = 0, Bb = 0;
  for (const p of poles) {
    const da = (a - p.a) * unit, db = (b - p.b) * unit, r2 = da * da + db * db + 1e-10, r = Math.sqrt(r2);
    const k = (1e-7 * p.q) / (r2 * r);
    Ba += k * da; Bb += k * db;
  }
  return [Ba, Bb];
}
// Net force (N) along a on a magnet made of poles `B` from a magnet made of poles `A`.
// Pole–pole force F = μ0 q₁ q₂ ÷ (4π r²), like charges repel.
export function poleForce(A, B, unit = 0.01) {
  let F = 0;
  for (const p of A) for (const q of B) {
    const da = (q.a - p.a) * unit, db = (q.b - p.b) * unit, r2 = da * da + db * db, r = Math.sqrt(r2);
    F += (1e-7 * p.q * q.q * da) / (r2 * r);
  }
  return F;
}
// Follow the field from (a0, b0). Returns a list of [a, b] points. dir = +1 follows B, −1 goes back.
export function traceLine(field, a0, b0, { step = 0.15, max = 500, dir = 1, stop = () => false, box = [-12, 12, -8, 8] } = {}) {
  const pts = [[a0, b0]];
  let a = a0, b = b0;
  for (let i = 0; i < max; i++) {
    const [f1, g1] = field(a, b), n1 = Math.hypot(f1, g1) || 1;
    const am = a + (dir * step * f1) / n1 / 2, bm = b + (dir * step * g1) / n1 / 2;
    const [f2, g2] = field(am, bm), n2 = Math.hypot(f2, g2) || 1;
    a += (dir * step * f2) / n2; b += (dir * step * g2) / n2;
    pts.push([a, b]);
    if (stop(a, b) || a < box[0] || a > box[1] || b < box[2] || b > box[3]) break;
  }
  return pts;
}

// ---------------------------------------------------------------- field lines on screen
// Fat lines (screen-pixel width) that can be rewritten when the field changes, with arrow heads.
export function fieldLines(stage, color = 0x8ef0ff, { width = 2.2, opacity = 0.85, heads = 80, headSize = 0.28 } = {}) {
  const g = new THREE.Group();
  const mat = stage.lineMaterial({ color, linewidth: width, transparent: true, opacity, depthWrite: false });
  let obj = null;
  const cone = new THREE.ConeGeometry(headSize * 0.45, headSize, 10); cone.rotateZ(-Math.PI / 2);   // points along +x
  const hm = new THREE.InstancedMesh(cone, M.glow(color, { transparent: true, opacity }), heads);
  hm.frustumCulled = false; hm.count = 0; g.add(hm);
  const o = new THREE.Object3D(), d = new THREE.Vector3(), X = new THREE.Vector3(1, 0, 0);
  // lines: arrays of [x, y, z]; each line gets a head at `at` (0..1) of its length, pointing along it.
  g.set = (lines, at = 0.5) => {
    const arr = [];
    let n = 0;
    for (const L of lines) {
      if (L.length < 2) continue;
      for (let i = 0; i < L.length - 1; i++) arr.push(L[i][0], L[i][1], L[i][2], L[i + 1][0], L[i + 1][1], L[i + 1][2]);
      if (n < heads && L.length > 6) {
        const i = Math.floor((L.length - 2) * at), p = L[i], q = L[i + 1];
        d.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]).normalize();
        o.position.set(...p); o.quaternion.setFromUnitVectors(X, d); o.updateMatrix(); hm.setMatrixAt(n++, o.matrix);
      }
    }
    hm.count = n; hm.instanceMatrix.needsUpdate = true;
    if (obj) { g.remove(obj); obj.geometry.dispose(); obj = null; }
    if (arr.length) { const geo = new LineSegmentsGeometry(); geo.setPositions(arr); obj = new LineSegments2(geo, mat); obj.frustumCulled = false; g.add(obj); }
  };
  g.setOpacity = (k) => { mat.opacity = k; hm.material.opacity = k; };
  return g;
}

// ---------------------------------------------------------------- objects
export const NCOL = 0xe0453a, SCOL = 0x2f6fd6;         // the school convention: north red, south blue
// A flat plane with a letter or short text on it (for N and S on magnets).
export function letter(txt, size, color = '#ffffff', bg = null) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, 128, 128); }
  x.fillStyle = color; x.font = `bold ${txt.length > 1 ? 58 : 92}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false }));
  return m;
}
// A bar magnet lying along x, north end at +x. Letters on top (+y) and on the front (+z).
export function makeBar(L, w, h, { north = NCOL, south = SCOL } = {}) {
  const g = new THREE.Group();
  const n = box(L / 2, h, w, M.plastic(north, { roughness: 0.35 })); n.position.x = L / 4; g.add(n);
  const s = box(L / 2, h, w, M.plastic(south, { roughness: 0.35 })); s.position.x = -L / 4; g.add(s);
  const sz = Math.min(w, h) * 0.8;
  for (const [t, x] of [['N', L / 4], ['S', -L / 4]]) {
    const top = letter(t, sz); top.rotation.x = -Math.PI / 2; top.position.set(x, h / 2 + 0.002, 0); g.add(top);
    const fr = letter(t, sz); fr.position.set(x, 0, w / 2 + 0.002); g.add(fr);
  }
  g.halves = [n, s];
  return g;
}
// A compass: brass rim, white card, red-and-white needle that turns about y. set(angle) points the
// north (red) end along the world direction (cos a, 0, −sin a) — use pointTo(bx, bz).
export function makeCompass(R = 1) {
  const g = new THREE.Group();
  const rim = torus(R, R * 0.09, M.metal(0xc9a24a, { roughness: 0.3 })); rim.rotation.x = Math.PI / 2; g.add(rim);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R, R, R * 0.12, 40), M.matte(0xf1ede2)); base.position.y = -R * 0.04; base.receiveShadow = true; g.add(base);
  // tick marks on the card
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, t = box(i % 4 ? R * 0.08 : R * 0.16, 0.005, R * 0.025, M.matte(0x333333)); t.position.set(Math.cos(a) * R * 0.84, R * 0.025, Math.sin(a) * R * 0.84); t.rotation.y = -a; g.add(t); }
  const needle = new THREE.Group(); needle.position.y = R * 0.08; g.add(needle);
  const half = (col, dir) => { const c = new THREE.Mesh(new THREE.ConeGeometry(R * 0.13, R * 0.78, 4), M.plastic(col, { roughness: 0.4 })); c.rotation.z = -dir * Math.PI / 2; c.scale.z = 0.35; c.position.x = dir * R * 0.39; c.castShadow = true; return c; };
  needle.add(half(0xe0453a, 1), half(0xf4f4f4, -1));
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.05, R * 0.05, R * 0.08, 12), M.metal(0xc9a24a)); pin.position.y = R * 0.04; needle.add(pin);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.98, R * 0.98, 0.01, 40), M.clear(0xdff1ff, 0.12)); glass.position.y = R * 0.2; g.add(glass);
  g.needle = needle;
  g.ang = 0;
  g.pointTo = (bx, bz, dt = 1, rate = 8) => {
    const target = Math.atan2(-bz, bx);
    let d = target - g.ang; d = Math.atan2(Math.sin(d), Math.cos(d));
    g.ang += d * (1 - Math.exp(-rate * dt));
    needle.rotation.y = g.ang;
  };
  return g;
}
// Iron filings: many short dark slivers. place(i, x, y, z, angleY, scale) then done().
export function filings(n, len = 0.32) {
  const geo = new THREE.BoxGeometry(len, 0.02, 0.045);
  const m = swarm(n, geo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0.4 }));
  m.castShadow = false;
  const c = new THREE.Color();
  m.tint = (i, k) => { c.setRGB(0.18 + 0.1 * k, 0.19 + 0.1 * k, 0.22 + 0.12 * k); m.setColorAt(i, c); };
  return m;
}
export const copper = () => M.metal(0xc8773a, { roughness: 0.32 });
export const ironMat = () => M.metal(0x6d7380, { roughness: 0.55 });

// Many small glowing dots. place(i, x, y, z, s) then done().
export function dots(n, r, color = 0xffffff, seg = 8, opacity = 0.9) {
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity }), n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const o = new THREE.Object3D();
  mesh.place = (i, x, y, z, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(Math.max(0.0001, s)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; };
  return mesh;
}
// Deterministic pseudo-random numbers so every run (and every video frame) looks the same.
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---------------------------------------------------------------- formatting
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const sup = (n) => String(n).split('').map((c) => SUP[c] ?? c).join('');
export const fmt0 = (v) => Math.round(v).toLocaleString('en-IN');
// A magnetic field with a sensible unit: 42 µT, 5.0 mT, 1.50 T.
export function fmtB(B) {
  const a = Math.abs(B);
  if (a >= 0.1) return B.toFixed(a >= 10 ? 1 : 2) + ' T';
  if (a >= 1e-3) return (B * 1e3).toFixed(a >= 1e-2 ? 0 : 1) + ' mT';
  if (a >= 1e-6) return (B * 1e6).toFixed(a >= 1e-5 ? 0 : 1) + ' µT';
  return (B * 1e9).toFixed(0) + ' nT';
}
export function fmtN(F) {
  const a = Math.abs(F);
  if (a >= 1e4) return (F / 1e3).toFixed(a >= 1e5 ? 0 : 1) + ' kN';
  if (a >= 100) return Math.round(F).toLocaleString('en-IN') + ' N';
  if (a >= 1) return F.toFixed(a >= 10 ? 0 : 1) + ' N';
  if (a >= 0.001) return (F * 1000).toFixed(a >= 0.01 ? 0 : 1) + ' mN';
  return (F * 1e6).toFixed(0) + ' µN';
}
// A mass whose weight equals force F: "the weight of 360 g".
export function asWeight(F) {
  const kg = Math.abs(F) / G0;
  if (kg >= 1000) return (kg / 1000).toFixed(1) + ' t';
  if (kg >= 1) return kg.toFixed(kg >= 10 ? 0 : 1) + ' kg';
  if (kg >= 1e-3) return (kg * 1e3).toFixed(kg >= 1e-2 ? 0 : 1) + ' g';
  return (kg * 1e6).toFixed(0) + ' mg';
}

// ---------------------------------------------------------------- boards
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => { draw(g, pxW, pxH); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function title(g, text, sub = '') {
  g.fillStyle = '#e8eef8'; g.font = 'bold 24px sans-serif'; g.fillText(text, 20, 34);
  if (sub) { const x = 34 + g.measureText(text).width; g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 34); }
}
// Axes with a grid. Returns X(x) and Y(y). logX / logY take exponents (base 10) for min/max.
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '', logX = false, logY = false }) {
  const X = logX ? (x) => x0 + ((Math.log10(x) - xMin) / (xMax - xMin)) * (x1 - x0) : (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = logY ? (y) => y0 - ((Math.log10(y) - yMin) / (yMax - yMin)) * (y0 - y1) : (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '19px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '18px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function line(g, pts, X, Y, col, wdt = 5, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function text(g, s, x, y, col = 'rgba(255,255,255,.75)', font = '18px sans-serif') { g.fillStyle = col; g.font = font; g.fillText(s, x, y); }
export const COL = { field: '#8ef0ff', cur: '#ffd166', force: '#ff6fa3', north: '#ff6a5c', south: '#6aa6ff', hot: '#ffb547', good: '#7be08c', soft: 'rgba(255,255,255,.55)' };
export const HEX = { field: 0x8ef0ff, cur: 0xffd166, force: 0xff6fa3, north: 0xff6a5c, south: 0x6aa6ff, hot: 0xffb547, good: 0x7be08c };

// ---------------------------------------------------------------- stage helpers
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage: hide minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.12 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Views are framed to dodge the readout in the upper left of a wide stage. On a phone-width stage,
// re-centre them on the model (v.cx) instead.
export function pickView(stage, v) {
  if (v.cx === undefined || stage.host.clientWidth >= 560 || inReel()) return v;
  const dx = v.cx - v.target[0];
  return { pos: [v.pos[0] + dx, v.pos[1], v.pos[2]], target: [v.cx, v.target[1], v.target[2]] };
}
// Boards sit beside the model on a wide screen. In the tall reel video they move to 'reelPos'.
export function reelBoards(list) {
  const r = inReel();
  list.forEach(([b, pos, scale = 1]) => {
    if (!b.home) b.home = { p: b.mesh.position.clone(), r: b.mesh.rotation.clone() };
    if (r) { b.mesh.position.set(...pos); b.mesh.scale.setScalar(scale); b.mesh.rotation.set(0, 0, 0); }
    else { b.mesh.position.copy(b.home.p); b.mesh.scale.setScalar(1); b.mesh.rotation.copy(b.home.r); }
  });
}
// Show one group per focus and fly the camera to its view.
export function focusSwitch(stage, groups, views) {
  let cur = '';
  return (f, force = false) => {
    if (f === cur && !force) return false;
    cur = f;
    for (const k in groups) groups[k].visible = k === f;
    if (!inReel()) { const v = pickView(stage, views[f]); stage.setView(v.pos, v.target, 1.0); }
    return true;
  };
}
// A kit arrow that can point any way and draws on top: aim(from, dir, len).
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3();
export function force(color, r = 0.035, head = 0.2) {
  const a = arrow(color, 1, head, r);
  a.renderOrder = 10;
  a.traverse((o) => { if (o.material) { o.material.depthTest = false; o.material.transparent = true; o.renderOrder = 10; } });
  a.aim = (from, dir, len) => {
    a.position.set(...from);
    tmpV.set(...dir); if (tmpV.lengthSq() < 1e-12) tmpV.set(1, 0, 0);
    a.quaternion.setFromUnitVectors(UP, tmpV.normalize());
    a.set(Math.max(0.001, len));
    if (len < 0.03) a.visible = false;
  };
  return a;
}
// Drag an object across a horizontal plane (y = planeY in `space`'s local frame). Returns a
// dispose function. onMove(x, z) gets local coordinates. Uses capture on the stage host so the
// orbit camera does not start turning when you grab the object.
export function dragOnPlane(stage, targets, space, planeY, onMove) {
  const host = stage.host, ray = new THREE.Raycaster(), v = new THREE.Vector2(), plane = new THREE.Plane(), hitP = new THREE.Vector3();
  let dragging = false;
  const toRay = (e) => { const b = stage.renderer.domElement.getBoundingClientRect(); v.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(v, stage.camera); };
  const planeHit = () => {
    const n = new THREE.Vector3(0, 1, 0), p = new THREE.Vector3(0, planeY, 0);
    space.updateMatrixWorld(); p.applyMatrix4(space.matrixWorld);
    plane.setFromNormalAndCoplanarPoint(n, p);
    if (!ray.ray.intersectPlane(plane, hitP)) return null;
    return space.worldToLocal(hitP.clone());
  };
  const down = (e) => {
    if (!space.visible || e.button > 0) return;
    toRay(e);
    if (!ray.intersectObjects(targets, true).length) return;
    dragging = true; e.stopPropagation(); e.preventDefault();
    stage.controls.enabled = false;
    try { host.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const move = (e) => { if (!dragging) return; toRay(e); const p = planeHit(); if (p) onMove(p.x, p.z); };
  const up = (e) => { if (!dragging) return; dragging = false; stage.controls.enabled = true; try { host.releasePointerCapture(e.pointerId); } catch { /* ignore */ } };
  host.addEventListener('pointerdown', down, true);
  host.addEventListener('pointermove', move, true);
  host.addEventListener('pointerup', up, true);
  host.addEventListener('pointercancel', up, true);
  return () => { host.removeEventListener('pointerdown', down, true); host.removeEventListener('pointermove', move, true); host.removeEventListener('pointerup', up, true); host.removeEventListener('pointercancel', up, true); stage.controls.enabled = true; };
}
export { clamp, THREE, M, box, beam, sphere, torus };
