// Chapter 1: what a magnetic field is, how strong it is (tesla), and how two magnets push and pull.
// Scene unit: 1 cm. Two 4 × 1 × 1 cm bar magnets lie on a card on the table.
// Field model: the pole ("Gilbert") model, see magnetism.js. Each end acts as a magnetic charge
// q = (Br ÷ μ0) × A with A = 1 cm², sitting 0.3 cm in from the end (poles about 0.85 L apart).
//   Neodymium N42, Br ≈ 1.3 T → q ≈ 103 A·m. Ferrite, Br ≈ 0.4 T → q ≈ 32 A·m.
// Force: the sum of the four pole–pole forces F = μ0 q₁ q₂ ÷ (4π r²). Two N42 bars 1 cm apart pull
// with about 3.5 N (the weight of ~360 g), close to catalogue pull-force tables for 10 × 10 × 40 mm
// blocks at that gap (e.g. K&J Magnetics calculator). The point-pole model over-estimates when the
// magnets nearly touch, so the gap stops at 5 mm. Far apart, the force falls like 1 ÷ d⁴ (dipoles).
// The compass adds Earth's horizontal field, 40 µT to the north (−z), as over much of India.
// Field-strength ladder: Earth 25–65 µT (NOAA NCEI); fridge magnet about 5 mT (Wikipedia, "Orders of
// magnitude (magnetic field)"); surface of a small neodymium block about 0.5 T; MRI 1.5–3 T.
import { THREE, M, box, clamp } from '../kit.js';
import {
  MATS, B_EARTH_H, poleQ, poleField, poleForce, traceLine, fieldLines, makeBar, makeCompass, filings,
  board, panelBg, title, axes, dot, line, text, COL, HEX, fitNarrow, pickView, reelBoards, inReel,
  fmtB, fmtN, asWeight, rng, dragOnPlane, TAU,
} from '../magnetism.js';

const L = 4, W = 1, H = 1, Y = 0.6, INSET = 0.3;
const CARD = { w: 26, d: 17 };
// Poles of the scene: magnet A on the left with north facing right; magnet B on the right, turned
// to attract (south facing A) or repel (north facing A). 'one' hides B.
export function scenePoles(s) {
  const q = poleQ(MATS[s.mat].Br, 1e-4), g = s.gap;
  if (s.setup === 'one') return { A: [{ a: 2 - INSET, b: 0, q }, { a: -2 + INSET, b: 0, q: -q }], B: [] };
  const A = [{ a: -g / 2 - INSET, b: 0, q }, { a: -g / 2 - L + INSET, b: 0, q: -q }];
  const sgn = s.setup === 'attract' ? 1 : -1;
  const B = [{ a: g / 2 + INSET, b: 0, q: -sgn * q }, { a: g / 2 + L - INSET, b: 0, q: sgn * q }];
  return { A, B };
}
// Force on magnet B along +x (N): negative means pulled towards A.
export const pairForce = (s, gap = s.gap) => { const p = scenePoles({ ...s, gap, setup: s.setup === 'one' ? 'attract' : s.setup }); return poleForce(p.A, p.B); };
const allPoles = (p) => p.A.concat(p.B);
const insideBar = (s, x, z) => {
  if (Math.abs(z) > W / 2 + 0.1) return false;
  if (s.setup === 'one') return Math.abs(x) < L / 2 + 0.1;
  const g = s.gap / 2; return (x < -g + 0.1 && x > -g - L - 0.1) || (x > g - 0.1 && x < g + L + 0.1);
};

// Field-strength ladder, in tesla.
const LADDER = [
  { v: 45e-6, lo: 25e-6, hi: 65e-6, label: 'Earth', col: COL.good },
  { v: 5e-3, label: 'fridge magnet', col: COL.hot },
  { v: 0.5, label: 'neodymium surface', col: COL.north },
  { v: 1.5, lo: 1.5, hi: 3, label: 'MRI', col: COL.field },
];

const VIEWS = { main: { pos: [6.2, 22, 24], target: [6.2, 2.6, -1.5], cx: 0 } };

export default {
  id: 'idea',
  short: 'Poles and fields',
  title: 'Poles, fields and the tesla',
  subtitle: 'Like poles push, unlike poles pull, and an invisible field fills the space around.',
  view: VIEWS.main,
  learn: `<p>Every magnet has two ends called <b>poles</b>: a <b>north</b> pole and a <b>south</b> pole. Hang a bar magnet from a thread and its north pole swings round to point north. Bring two magnets together and the rule is simple: <b>like poles repel, unlike poles attract</b>. North pushes north away; north pulls south in.</p>
    <p>A magnet reaches out through empty space with a <b>magnetic field</b>. You can't see it, but you can map it. Sprinkle <b>iron filings</b> on a card and they line up into curves from pole to pole. Those curves are <b>field lines</b>. By custom they run out of the north pole and into the south pole. Where they crowd together the field is strong; where they spread out it is weak.</p>
    <p>A <b>compass</b> is just a tiny magnet on a pin. Its needle turns to lie along the field line where it sits, north end pointing the way the line runs. Far from any magnet, it lines up with the Earth's own field and points north.</p>
    <p>Field strength is measured in <b>tesla (T)</b>, named after Nikola Tesla. One tesla is a lot. The Earth's field is only <b>25 to 65 microtesla</b> (millionths of a tesla). A fridge magnet makes about <b>5 millitesla</b>. The face of a strong neodymium magnet reaches about <b>0.5 T</b>, and an MRI scanner makes <b>1.5 to 3 T</b> all the way round your body. Labs measure fields with a <b>Hall probe</b>, a chip whose voltage changes in a field; your phone has one inside to act as a compass.</p>
    <p>Magnetic force <b>falls off steeply</b> with distance. Double the gap between two magnets and the pull drops to a small fraction, often less than a quarter. That is why a magnet snaps onto the fridge at the last moment.</p>
    <p class="tip"><b>Try it:</b> drag the compass around the magnets and watch its needle follow the field lines. Flip the right magnet to make them repel. Then slide the gap and watch the force chart plunge.</p>`,
  terms: [
    { t: 'Magnetic pole', d: 'An end of a magnet where the field is strongest. Every magnet has a north and a south pole.' },
    { t: 'Magnetic field', d: 'The region around a magnet or current where magnetic forces act. It has a strength and a direction.' },
    { t: 'Field lines', d: 'Curves that show the field’s direction: out of north, into south. Closer lines mean a stronger field.' },
    { t: 'Tesla (T)', d: 'The SI unit of magnetic field strength (flux density). Earth ≈ 50 µT, fridge magnet ≈ 5 mT.' },
    { t: 'Compass', d: 'A small magnetised needle free to turn, which lines up with the field it sits in.' },
    { t: 'Neodymium magnet', d: 'The strongest common permanent magnet, made of neodymium, iron and boron (NdFeB).' },
    { t: 'Hall probe', d: 'A sensor whose output voltage is proportional to the magnetic field through it.' },
  ],
  defaults: { setup: 'attract', mat: 'neo', gap: 2, cx: 0, cz: 4.5, lines: true, fil: true, walk: false },
  controls: [
    { key: 'setup', type: 'seg', label: 'Magnets', options: [{ v: 'one', label: 'One magnet' }, { v: 'attract', label: 'N faces S' }, { v: 'repel', label: 'N faces N' }] },
    { key: 'mat', type: 'seg', label: 'Magnet material', options: [{ v: 'ferrite', label: 'Ferrite' }, { v: 'neo', label: 'Neodymium' }] },
    { key: 'gap', type: 'range', label: 'Gap between the magnets', min: 0.5, max: 10, step: 0.1, ends: ['5 mm', '10 cm'], fmt: (v) => v.toFixed(1) + ' cm' },
    { key: 'cx', type: 'range', label: 'Compass: left or right', min: -12, max: 12, step: 0.1, ends: ['left', 'right'], fmt: (v) => v.toFixed(1) + ' cm', hint: 'Or just drag the compass on the stage.' },
    { key: 'cz', type: 'range', label: 'Compass: north or south', min: -7.5, max: 7.5, step: 0.1, ends: ['north', 'south'], fmt: (v) => v.toFixed(1) + ' cm' },
    { key: 'lines', type: 'toggle', label: 'Field lines' },
    { key: 'fil', type: 'toggle', label: 'Iron filings' },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Walk the compass round', act: (s) => { s.walk = true; } },
      { label: 'Double the gap', act: (s) => { s.gap = clamp(+(s.gap * 2).toFixed(1), 0.5, 10); } },
      { label: 'Compass far away', act: (s) => Object.assign(s, { walk: false, cx: -11.5, cz: -7 }) },
    ] },
  ],
  onChange(s, key) {
    if (key === 'cx' || key === 'cz') s.walk = false;
    if (key === 'gap' && s.setup === 'one') s.setup = 'attract';
  },
  quiz: [
    { q: 'You bring the north pole of one magnet towards the north pole of another. What happens?', options: ['They attract', 'They repel', 'Nothing', 'They swap poles'], answer: 1, why: 'Like poles repel and unlike poles attract. North pushes north away.' },
    { q: 'Which is the strongest field?', options: ['The Earth’s field, about 50 µT', 'A fridge magnet, about 5 mT', 'A hospital MRI, 1.5 T', 'They are all about the same'], answer: 2, why: '1.5 T is 300 times a fridge magnet and about 30,000 times the Earth’s field.' },
    { q: 'A compass is placed close to a bar magnet. Which way does its needle point?', options: ['Always to geographic north', 'Along the magnet’s field line where it sits', 'Straight at the nearest pole, always', 'Straight up'], answer: 1, why: 'The needle is a small magnet. Near a strong magnet it lines up with that magnet’s field; far away the Earth’s field wins.' },
  ],
  reel: [
    { ms: 5200, caption: 'Unlike poles attract. Iron filings trace the field lines, running out of north and into south.', set: { setup: 'attract', mat: 'neo', gap: 3, lines: true, fil: true, walk: true }, anim: { gap: [6, 2] }, view: { pos: [0.2, 7.5, 5], target: [0.2, 0, 0.3] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    // table card
    const card = box(CARD.w, 0.1, CARD.d, M.matte(0xf3efe4)); card.position.y = 0.05; card.receiveShadow = true; root.add(card);
    const nArrow = stage.label('↑ north', [CARD.w / 2 - 1.4, 0.2, -CARD.d / 2 + 0.8], root);
    const magA = makeBar(L, W, H), magB = makeBar(L, W, H); root.add(magA, magB);
    const lines = fieldLines(stage, 0x2aa7c9, { width: 2.2, opacity: 0.9, headSize: 0.42 }); root.add(lines);
    const fil = filings(1800); fil.position.y = 0; root.add(fil);
    const compass = makeCompass(1.4); root.add(compass);
    const lA = stage.label('', [0, 0, 0], root), lB = stage.label('', [0, 0, 0], root);
    const lF = stage.label('', [0, 0, 0], root, 'hot'); lF.element.style.setProperty('--c', COL.force);
    const lC = stage.label('', [0, 0, 0], root, 'hot'); lC.element.style.setProperty('--c', COL.field);
    const r = rng(7), seeds = [];
    for (let i = 0; i < 1800; i++) seeds.push([(r() - 0.5) * (CARD.w - 0.6), (r() - 0.5) * (CARD.d - 0.6), r() * TAU, 0.75 + r() * 0.5]);

    let cur = null;
    const chart = board(root, 9.6, 5.24, 880, 480, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const s = cur, rep = s.setup === 'repel';
      title(g, rep ? 'Push against gap' : 'Pull against gap', MATS[s.mat].name);
      const pts = []; for (let d = 0.5; d <= 10.001; d += 0.05) pts.push([d, Math.abs(pairForce(s, d))]);
      const Fmax = Math.max(0.05, pts[0][1]);
      const { X, Y } = axes(g, w, h, { xMin: 0, xMax: 10, yMax: 1, xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 0.25, 0.5, 0.75, 1], xFmt: (v) => v + ' cm', yFmt: (v) => fmtN(v * Fmax), x0: 110, xLabel: 'gap →', yLabel: 'force ↑' });
      line(g, pts.map(([d, F]) => [d, F / Fmax]), X, Y, COL.force, 5);
      const F1 = Math.abs(pairForce(s)), F2 = Math.abs(pairForce(s, Math.min(10, s.gap * 2)));
      dot(g, X(s.gap), Y(F1 / Fmax), COL.hot, 10);
      if (s.gap * 2 <= 10) { dot(g, X(s.gap * 2), Y(F2 / Fmax), '#fff', 7); text(g, `2× gap: ${Math.round((F2 / F1) * 100)}%`, X(s.gap * 2) + 12, Y(F2 / Fmax) - 14, '#fff', 'bold 19px sans-serif'); }
      text(g, 'falls off steeply: roughly 1 ÷ gap⁴ once far apart', 130, h - 86, 'rgba(255,255,255,.6)', '17px sans-serif');
    }, [16.2, 9.6, -3.2]);
    chart.mesh.rotation.set(-0.5, -0.5, 0, 'YXZ');
    let curB = 0;
    const ladder = board(root, 9.6, 5.28, 800, 440, (g, w, h) => {
      panelBg(g, w, h); title(g, 'How strong is a field?', 'tesla, log scale');
      const x0 = 60, x1 = w - 40, X = (v) => x0 + ((Math.log10(v) + 6) / 7) * (x1 - x0), y = 250;
      g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
      ['1 µT', '10 µT', '100 µT', '1 mT', '10 mT', '100 mT', '1 T', '10 T'].forEach((t, i) => { const x = X(Math.pow(10, i - 6)); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x - 1, y - 8, 2, 16); g.font = '16px sans-serif'; g.fillText(t, x - g.measureText(t).width / 2, y + 32); });
      LADDER.forEach((it, i) => {
        const x = X(it.v), up = i % 2 === 0, yy = up ? y - 70 : y + 90;
        if (it.lo) { g.fillStyle = it.col; g.globalAlpha = 0.45; g.fillRect(X(it.lo), y - 7, X(it.hi) - X(it.lo), 14); g.globalAlpha = 1; }
        g.strokeStyle = it.col; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, yy + (up ? 8 : -24)); g.stroke();
        text(g, it.label, x - 40, yy, it.col, 'bold 19px sans-serif');
      });
      if (curB > 0) { const x = X(clamp(curB, 1e-6, 10)); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x - 11, y - 34); g.lineTo(x + 11, y - 34); g.fill(); text(g, `compass: ${fmtB(curB)}`, clamp(x - 70, 10, w - 190), 94, '#fff', 'bold 20px sans-serif'); }
      text(g, 'Earth 25–65 µT · fridge magnet ≈ 5 mT · MRI 1.5–3 T', 40, h - 30, 'rgba(255,255,255,.6)', '17px sans-serif');
    }, [16.2, 3.8, 0.6]);
    ladder.mesh.rotation.set(-0.5, -0.5, 0, 'YXZ');

    let S = null;
    const undrag = dragOnPlane(stage, [compass], root, Y, (x, z) => { if (!S) return; S.walk = false; S.cx = clamp(x, -12, 12); S.cz = clamp(z, -7.5, 7.5); });
    let key = '', viewed = false;
    return {
      dispose: undrag,
      update(dt, s, time) {
        dt = Math.max(0, dt); S = s;
        fitNarrow(stage, [nArrow, lA, lB]);
        reelBoards([[chart, [0.2, 9.5, -10], 1.25], [ladder, [0.2, 2.8, -10], 1.25]]);
        chart.mesh.visible = ladder.mesh.visible = true;
        if (!viewed && !inReel()) { viewed = true; const v = pickView(stage, VIEWS.main); stage.setView(v.pos, v.target, 1.0); }
        const p = scenePoles(s), poles = allPoles(p);
        // magnets
        if (s.setup === 'one') { magA.position.set(0, Y, 0); magB.visible = false; }
        else { magA.position.set(-s.gap / 2 - L / 2, Y, 0); magB.visible = true; magB.position.set(s.gap / 2 + L / 2, Y, 0); magB.rotation.y = s.setup === 'attract' ? 0 : Math.PI; }
        const k = `${s.setup}|${s.mat}|${s.gap}`;
        if (k !== key) {
          key = k;
          const field = (a, b) => poleField(poles, a, b);
          const sPoles = poles.filter((q) => q.q < 0), nPoles = poles.filter((q) => q.q > 0);
          const stop = (a, b) => sPoles.some((q) => Math.hypot(a - q.a, b - q.b) < 0.3);
          const all = [];
          const stopN = (a, b) => nPoles.some((q) => Math.hypot(a - q.a, b - q.b) < 0.3);
          const bx = [-13, 13, -8.5, 8.5];
          nPoles.forEach((q) => { for (let i = 0; i < 14; i++) { const t = ((i + 0.5) / 14) * TAU; all.push(traceLine(field, q.a + Math.cos(t) * 0.45, q.b + Math.sin(t) * 0.45, { stop, box: bx, max: 420, step: 0.14 }).map(([a, b]) => [a, Y, b])); } });
          // lines that come in from far away and end on a south pole: trace them backwards and keep
          // only those that leave the card (the others are already drawn from a north pole)
          sPoles.forEach((q) => { for (let i = 0; i < 14; i++) { const t = ((i + 0.5) / 14) * TAU; const pts = traceLine(field, q.a + Math.cos(t) * 0.45, q.b + Math.sin(t) * 0.45, { stop: stopN, box: bx, max: 420, step: 0.14, dir: -1 }); const e = pts[pts.length - 1]; if (!stopN(e[0], e[1])) all.push(pts.reverse().map(([a, b]) => [a, Y, b])); } });
          lines.set(all, 0.35);
          // filings: aligned where the field is above ~0.3 mT, random where it is too weak to turn them
          seeds.forEach(([x, z, a0, sc], i) => {
            if (insideBar(s, x, z)) { fil.place(i, [x, -5, z], null, 0.001); return; }
            const [bx, bz] = poleField(poles, x, z), B = Math.hypot(bx, bz);
            const al = clamp((Math.log10(B) + 3.5) / 0.6, 0, 1);
            const ang = al > 0.5 ? Math.atan2(-bz, bx) : a0;
            fil.place(i, [x, 0.115, z], [0, ang, 0], sc); fil.tint(i, clamp((Math.log10(B) + 4) / 3, 0, 1));
          });
          fil.done(); if (fil.instanceColor) fil.instanceColor.needsUpdate = true;
          cur = { ...s }; chart.redraw();
        }
        lines.visible = s.lines; fil.visible = s.fil;
        // compass
        if (s.walk) { const t = time * 0.35; s.cx = Math.cos(t) * (s.setup === 'one' ? 5 : s.gap / 2 + 5.2); s.cz = Math.sin(t) * 4.2; }
        let cx = s.cx, cz = s.cz;
        if (insideBar(s, cx, cz) || (Math.abs(cz) < 1.8 && (s.setup === 'one' ? Math.abs(cx) < L / 2 + 1.3 : Math.abs(cx) < s.gap / 2 + L + 1.3 && Math.abs(cx) > s.gap / 2 - 1.3))) cz = cz >= 0 ? Math.max(cz, 1.8) : Math.min(cz, -1.8);
        compass.position.set(cx, 0.18, cz);
        const [bx, bz0] = poleField(poles, cx, cz), bz = bz0 - B_EARTH_H, B = Math.hypot(bx, bz);
        compass.pointTo(bx, bz, dt, 10);
        if (Math.abs(B - curB) / (curB || 1) > 0.02) { curB = B; ladder.redraw(); }
        lC.position.set(cx, 1.1, cz + 2.2); lC.element.innerHTML = `<b>${fmtB(B)}</b>`;
        // labels
        const F = pairForce(s);
        if (s.setup === 'one') { lA.position.set(0, 1.6, 0); lA.element.textContent = `${MATS[s.mat].name} bar, 4 cm`; lB.visible = false; lF.visible = false; }
        else {
          lA.position.set(-s.gap / 2 - L / 2, 1.6, 0); lA.element.textContent = 'magnet A';
          lB.visible = !stage.host.clientWidth || stage.host.clientWidth >= 560; lB.position.set(s.gap / 2 + L / 2, 1.6, 0); lB.element.textContent = 'magnet B';
          lF.visible = true; lF.position.set(0, 2.3, -1.2); lF.element.innerHTML = `${F < 0 ? 'pull' : 'push'} <b>${fmtN(Math.abs(F))}</b>`;
        }
      },
      readout: (s) => {
        const p = scenePoles(s), poles = allPoles(p), q = poleQ(MATS[s.mat].Br, 1e-4);
        let cx = s.cx, cz = s.cz;
        const [bx, bz0] = poleField(poles, cx, cz), B = Math.hypot(bx, bz0 - B_EARTH_H);
        const head = s.setup === 'one' ? `One ${s.mat === 'neo' ? 'neodymium' : 'ferrite'} magnet` : null;
        const F = pairForce(s), F2 = pairForce(s, Math.min(10, s.gap * 2));
        return `<div class="big">${head || `${F < 0 ? 'Attract' : 'Repel'}: ${fmtN(Math.abs(F))}`}</div>
          ${head ? '' : `<div class="row"><span>Same as the weight of</span><b>${asWeight(F)}</b></div>
          <div class="row"><span>At twice the gap (${Math.min(10, s.gap * 2).toFixed(1)} cm)</span><b>${fmtN(Math.abs(F2))}</b></div>`}
          <div class="row"><span>Field at the compass</span><b>${fmtB(B)}</b></div>
          <div class="row"><span>That is the Earth’s field ×</span><b>${B / 45e-6 >= 10 ? Math.round(B / 45e-6).toLocaleString('en-IN') : (B / 45e-6).toFixed(1)}</b></div>
          <div class="row"><span>Pole strength q = Br × A ÷ μ₀</span><b>${q.toFixed(0)} A·m</b></div>
          <small>Pole model of 4 × 1 × 1 cm bars (Br ${MATS[s.mat].Br} T). The compass also feels Earth’s 40 µT to the north.</small>`;
      },
    };
  },
};
