// Chapter 5: surprises, limits and myths. Four scenes.
// 1. The Earth as a magnet (1 unit = 1/3 Earth radius; the magnetosphere is squashed in, not to scale).
//    A dipole tilted about 9° from the spin axis: the geomagnetic north pole is near 80.8°N, 72.6°W
//    (IGRF-14, 2025). The field points into the ground in the north, so the pole near geographic north
//    is magnetically a south pole. Surface field 25–65 µT (NOAA NCEI). Field lines of a dipole follow
//    r = L cos²λ. The magnetopause sits about 10 Earth radii sunward (NASA). Auroral ovals at about
//    65–70° magnetic latitude, pushed towards the equator in storms; in May 2024 aurora were photographed
//    from Hanle, Ladakh (Indian Institute of Astrophysics). Last full reversal: Brunhes–Matuyama, about
//    780,000 years ago (~773 ka, e.g. Singer 2019).
// 2. Why iron is magnetic, and the Curie point. Iron's Curie temperature is 770 °C (1,043 K). The
//    magnetisation curve uses the mean-field (Weiss 1907) model for spin ½: m = tanh(m Tc ÷ T), which gets
//    the shape right (m falls to zero at Tc). A nail heated past 770 °C drops off a magnet.
// 3. Superconducting levitation: YBCO (YBa₂Cu₃O₇) becomes superconducting below 93 K; liquid nitrogen
//    boils at 77 K (−196 °C). Flux pinning holds a small magnet about 1 cm above it.
// 4. Myths. Cutting a magnet gives two magnets, each with N and S; no isolated magnetic pole
//    (monopole) has ever been found. "Healing" bracelets: a 10 × 3 mm N42 disc has about 0.3 T at its
//    face but the on-axis field B(z) = (Br/2)[(D+z)/√(R²+(D+z)²) − z/√(R²+z²)] falls to a few mT a
//    centimetre away. A systematic review of randomised trials (Pittler, Brown & Ernst, CMAJ 2007;
//    177: 736–742) found no convincing evidence that static magnets relieve pain. Blood's iron is
//    locked in haemoglobin and is not ferromagnetic; blood is very slightly diamagnetic.
import { THREE, M, box, beam, sphere, torus, latheX, clamp, approach } from '../kit.js';
import {
  TAU, fieldLines, makeBar, ironMat, dots, board, panelBg, title, axes, dot, line, text, COL, HEX, fitNarrow,
  reelBoards, inReel, focusSwitch, force, fmtB, letter, NCOL, SCOL, rng, poleField, traceLine, poleQ, makeCompass,
} from '../magnetism.js';

const IX = 60, VX = 120, YX = 180;
const VIEWS = {
  earth: { pos: [-1, 7.5, 22], target: [-3.6, 4.8, 0], cx: 1 },
  iron: { pos: [IX + 4, 10, 31], target: [IX + 2.4, 7.2, 0], cx: IX + 5 },
  levitate: { pos: [VX - 1, 3.4, 11], target: [VX - 2.2, 2.0, 0], cx: VX },
  myths: { pos: [YX + 3.5, 12, 17], target: [YX + 2.0, 1.2, 0], cx: YX },
};
export const TC_IRON = 770;                                          // °C
// Mean-field magnetisation m(T) for spin ½: solve m = tanh(m Tc/T) by iteration.
export function magFrac(tC, tcC = TC_IRON) {
  const T = tC + 273.15, Tc = tcC + 273.15;
  if (T >= Tc) return 0;
  let m = 1; for (let i = 0; i < 200; i++) m = Math.tanh((m * Tc) / T);
  return m;
}
// Field on the axis of a disc magnet (radius R, thickness D, m) at distance z (m) from its face.
export const discB = (z, Br = 1.3, R = 0.005, D = 0.003) => (Br / 2) * ((D + z) / Math.hypot(R, D + z) - z / Math.hypot(R, z));

// A painted Earth: ocean, rough continent blobs, and India marked.
function earthTexture() {
  const w = 1024, h = 512, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), r = rng(12);
  g.fillStyle = '#2358b8'; g.fillRect(0, 0, w, h);
  const P = (lon, lat) => [((lon + 180) / 360) * w, ((90 - lat) / 180) * h];
  const blob = (pts, col = '#3f8f4f') => { g.fillStyle = col; g.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); };
  // very rough outlines (lon, lat)
  blob([[-165, 65], [-100, 72], [-60, 60], [-80, 25], [-97, 17], [-105, 22], [-125, 40], [-150, 58]]);        // North America
  blob([[-80, 10], [-35, -7], [-40, -22], [-70, -55], [-75, -20], [-80, 0]]);                                 // South America
  blob([[-17, 15], [10, 35], [32, 31], [51, 12], [40, -15], [20, -35], [10, -5], [-10, 5]]);                  // Africa
  blob([[-10, 36], [0, 50], [30, 70], [100, 75], [140, 60], [135, 35], [105, 20], [97, 30], [68, 25], [50, 30], [35, 36], [25, 40]]); // Eurasia
  blob([[68, 24], [88, 22], [92, 26], [80, 8], [73, 17]], '#e0a33a');                                        // India
  blob([[115, -20], [130, -12], [150, -25], [145, -38], [118, -35]]);                                         // Australia
  g.fillStyle = '#eef4fb'; g.fillRect(0, 0, w, 26); g.fillRect(0, h - 40, w, 40);
  for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 50, 6 + r() * 10, 0, 0, TAU); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export default {
  id: 'limits',
  short: 'Earth, iron and myths',
  title: 'A magnetic planet, hot iron and two myths',
  subtitle: 'The Earth is a magnet that flips, iron forgets at 770 °C, and a broken magnet makes two.',
  view: VIEWS.earth,
  learn: `<p>The <b>Earth is a giant magnet</b>. Molten iron churning in the outer core makes a field that is 25 to 65 microtesla at the surface. A compass points along it. But the magnetic pole is <b>not</b> the geographic North Pole. The field is tilted by about 9°, and the spot where a compass needle points straight down wanders: it is now near 86°N and drifting from Canada towards Siberia by tens of kilometres a year. Oddly, the pole near geographic north is magnetically a <b>south</b> pole: it is what pulls in the north end of your compass.</p>
    <p>Rocks record the past field, and they show that it has <b>flipped</b> hundreds of times. The last full reversal was about <b>780,000 years ago</b>. Nobody can predict the next one.</p>
    <p>The field also shields us. Far out in space it forms the <b>magnetosphere</b>, which turns aside the solar wind of charged particles from the Sun. Some are funnelled down near the poles, where they make the air glow as the <b>aurora</b>. In the strong storm of May 2024, aurora were photographed even from Hanle in Ladakh.</p>
    <p>Why is iron magnetic? Each iron atom is a tiny magnet. In small regions called <b>domains</b> they all line up. In an ordinary nail the domains point every which way and cancel; a magnet nearby lines them up, which is why a nail sticks. Heat iron past its <b>Curie point, 770 °C</b>, and the jiggling of the atoms wins: the domains fall apart and the nail drops off the magnet.</p>
    <p>Some materials, cooled far enough, become <b>superconductors</b> and push magnetic fields out. A magnet can then float above one, locked in place.</p>
    <p><b>Myth: break a magnet and you get a north piece and a south piece.</b> No: you get two smaller magnets, each with its own north and south. Nobody has ever found a lone magnetic pole. <b>Myth: magnet bracelets heal.</b> Careful trials find no convincing evidence. The field of a bracelet magnet fades to almost nothing a centimetre or two into your wrist, and the iron in your blood is locked inside haemoglobin and is not attracted to magnets at all.</p>
    <p class="tip"><b>Try it:</b> flip the Earth's field and watch the compass over India swing round. Heat the nail past 770 °C. Then cut the magnet into pieces and count the poles.</p>`,
  terms: [
    { t: 'Geomagnetic pole', d: 'Where the axis of the Earth’s magnet meets the surface. It is about 9° away from the geographic pole.' },
    { t: 'Magnetic reversal', d: 'When the Earth’s field flips, so compasses would point south. The last one was about 780,000 years ago.' },
    { t: 'Magnetosphere', d: 'The region of space controlled by the Earth’s field. It deflects most of the solar wind.' },
    { t: 'Aurora', d: 'Glowing curtains of light where charged particles guided by the field hit the upper air near the poles.' },
    { t: 'Magnetic domain', d: 'A tiny region inside iron where all the atomic magnets point the same way.' },
    { t: 'Curie point', d: 'The temperature above which a ferromagnet loses its magnetism: 770 °C for iron.' },
    { t: 'Superconductor', d: 'A material with zero resistance below a critical temperature. It expels or pins magnetic fields.' },
    { t: 'Monopole', d: 'A lone north or south pole. Predicted by some theories but never found.' },
  ],
  defaults: { focus: 'earth', flip: 0, storm: false, temp: 20, H: 0.8, cold: true, myth: 'break', pieces: 1 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'earth', label: 'Earth' }, { v: 'iron', label: 'Hot iron' }, { v: 'levitate', label: 'Floating magnet' }, { v: 'myths', label: 'Myths' }] },
    { key: 'flip', type: 'range', label: 'Earth: reverse the field', min: 0, max: 1, step: 0.01, ends: ['today', 'flipped'], fmt: (v) => (v < 0.5 ? 'normal' : v > 0.5 ? 'reversed' : 'weak, messy') },
    { key: 'storm', type: 'toggle', label: 'Earth: solar storm' },
    { key: 'temp', type: 'range', label: 'Hot iron: temperature', min: 20, max: 900, step: 5, ends: ['20 °C', '900 °C'], fmt: (v) => v + ' °C' },
    { key: 'H', type: 'range', label: 'Hot iron: magnet nearby lines up domains', min: 0, max: 1, step: 0.05, ends: ['none', 'strong'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'cold', type: 'toggle', label: 'Floating magnet: cooled in liquid nitrogen' },
    { key: 'myth', type: 'seg', label: 'Myths', options: [{ v: 'break', label: 'Break a magnet' }, { v: 'heal', label: 'Healing bracelet' }] },
    { key: 'pieces', type: 'range', label: 'Myth: cut the magnet into', min: 1, max: 4, step: 1, ends: ['1 piece', '4 pieces'], fmt: (v) => v + (v > 1 ? ' pieces' : ' piece') },
  ],
  onChange(s, key) {
    if (key === 'flip' || key === 'storm') s.focus = 'earth';
    if (key === 'temp' || key === 'H') s.focus = 'iron';
    if (key === 'cold') s.focus = 'levitate';
    if (key === 'myth') s.focus = 'myths';
    if (key === 'pieces') { s.focus = 'myths'; s.myth = 'break'; }
  },
  quiz: [
    { q: 'You snap a bar magnet in half. What do you get?', options: ['A north piece and a south piece', 'Two magnets, each with a north and a south pole', 'Two non-magnetic pieces', 'One magnet and one lump of iron'], answer: 1, why: 'Every piece of a magnet is itself a magnet. A lone pole (monopole) has never been found.' },
    { q: 'A nail is stuck to a strong magnet and heated with a flame. What happens above 770 °C?', options: ['It sticks harder', 'It melts', 'It falls off: iron loses its magnetism at its Curie point', 'It turns into a permanent magnet'], answer: 2, why: 'Above the Curie point heat jiggles the atoms too much for domains to stay lined up, so iron stops being attracted.' },
    { q: 'Is the Earth’s magnetic pole the same as the geographic North Pole?', options: ['Yes, exactly', 'No: it is hundreds of kilometres away and it wanders', 'There is no magnetic pole', 'It is at the Equator'], answer: 1, why: 'The field is tilted about 9° from the spin axis, and the point where the field points straight down drifts by tens of km a year.' },
  ],
  reel: [
    { ms: 5200, caption: 'The Earth is a magnet. Its field shields us from the solar wind and lights up the aurora.', set: { focus: 'earth', storm: true, flip: 0 }, view: { pos: [0.4, 6, 8.5], target: [0.4, 4.6, 0] }, spin: 0.5 },
    { ms: 4800, caption: 'Heat iron past 770 °C, its Curie point, and the nail drops off the magnet.', set: { focus: 'iron', H: 0.8 }, anim: { temp: [400, 820] }, view: { pos: [IX + 5, 7, 12], target: [IX + 5, 6, 0] }, spin: 0 },
    { ms: 4200, caption: 'Myth: break a magnet and you get two magnets, each with its own north and south.', set: { focus: 'myths', myth: 'break' }, anim: { pieces: [1, 3] }, view: { pos: [YX + 0.3, 9, 9], target: [YX + 0.3, 0.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gE = new THREE.Group(), gI = new THREE.Group(), gV = new THREE.Group(), gY = new THREE.Group();
    gI.position.x = IX; gV.position.x = VX; gY.position.x = YX; root.add(gE, gI, gV, gY);
    const show = focusSwitch(stage, { earth: gE, iron: gI, levitate: gV, myths: gY }, VIEWS);

    // ================================================================ Earth
    const R = 3, EY = 4.6;
    const tilt = new THREE.Group(); tilt.position.y = EY; gE.add(tilt);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 32), new THREE.MeshStandardMaterial({ map: earthTexture(), roughness: 0.8 })); tilt.add(globe);
    globe.rotation.y = -1.9;                                          // turn India towards the viewer
    const spinAxis = beam([0, -R - 1.2, 0], [0, R + 1.2, 0], 0.035, M.glow(0xffffff, { transparent: true, opacity: 0.6 })); tilt.add(spinAxis);
    const dip = new THREE.Group(); tilt.add(dip); dip.rotation.z = 9.2 * Math.PI / 180; dip.rotation.x = -0.1;
    const magAxis = beam([0, -R - 0.8, 0], [0, R + 0.8, 0], 0.035, M.glow(0xff6a5c)); dip.add(magAxis);
    const eLines = fieldLines(stage, 0x2aa7c9, { width: 2, opacity: 0.85, headSize: 0.3 }); dip.add(eLines);
    const aurora = [-1, 1].map((sy) => { const lat = 67 * Math.PI / 180, t = new THREE.Mesh(new THREE.TorusGeometry(R * Math.cos(lat) * 1.02, 0.12, 8, 64), M.glow(0x5cff9a, { transparent: true, opacity: 0.7 })); t.rotation.x = Math.PI / 2; t.position.y = sy * R * Math.sin(lat) * 1.02; dip.add(t); return t; });
    const wind = dots(160, 0.07, 0xffd166); gE.add(wind);
    const rW = rng(8), windSeeds = Array.from({ length: 160 }, () => [(rW() * 2 - 1) * 0.8, (rW() * 2 - 1) * 0.8, rW()]);
    const pause = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, TAU, 0, Math.PI * 0.62), M.ghost(0x8ef0ff, 0.08)); pause.rotation.z = -Math.PI / 2; pause.scale.set(8, 8, 8); pause.position.set(-1.2, EY, 0); gE.add(pause);
    const sun = sphere(1.2, M.glow(0xffd166)); sun.position.set(20, EY + 2, -6); gE.add(sun);
    const indiaC = new THREE.Group(); globe.add(indiaC);
    { const lat = 21 * Math.PI / 180, lon = 79 * Math.PI / 180; // three.js sphere: u=0 at lon −180; position of (lat, lon)
      const phi = lon + Math.PI, x = -Math.cos(phi) * Math.cos(lat), z = Math.sin(phi) * Math.cos(lat), y = Math.sin(lat);
      indiaC.position.set(x * R * 1.01, y * R * 1.01, z * R * 1.01); indiaC.lookAt(0, 0, 0); indiaC.rotateX(-Math.PI / 2); }
    const needle = new THREE.Group(); indiaC.add(needle);
    { const nh = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.55, 4), M.glow(0xff3b30)); nh.rotation.x = -Math.PI / 2; nh.position.z = -0.27; nh.scale.x = 0.5; needle.add(nh);
      const sh = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.55, 4), M.glow(0xffffff)); sh.rotation.x = Math.PI / 2; sh.position.z = 0.27; sh.scale.x = 0.5; needle.add(sh);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), M.ghost(0xffffff, 0.35)); disc.rotation.x = -Math.PI / 2; disc.position.y = -0.01; indiaC.add(disc); }
    const lGeo = stage.label('geographic N', [0, R + 1.5, 0], tilt), lMagP = stage.label('', [0, 0, 0], gE, 'hot'); lMagP.element.style.setProperty('--c', COL.north);
    const lIndia = stage.label('compass over India', [0, 0, 0], gE), lWind = stage.label('solar wind', [13, EY + 3.2, 0], gE), lPause = stage.label('magnetosphere (squashed, not to scale)', [4, EY + 6.8, 0], gE);
    const lAur = stage.label('aurora', [0, 0, 0], gE, 'hot'); lAur.element.style.setProperty('--c', '#5cff9a');
    let eKey = null, nAng = 0;

    // ================================================================ hot iron (1 unit = 1 cm)
    const bench = box(22, 0.3, 8, M.matte(0x3a3f4b)); bench.position.set(4, -0.15, 0); gI.add(bench);
    gI.add(beam([13.5, 0, -1.5], [13.5, 11, -1.5], 0.2, M.metal(0x8c95a3)), beam([13.5, 10.6, -1.5], [9.5, 10.6, -1.5], 0.15, M.metal(0x8c95a3)));
    const hangMag = makeBar(4, 1.4, 1.4); hangMag.rotation.z = -Math.PI / 2; hangMag.position.set(9.5, 8.4, -1.5); gI.add(hangMag);   // north end down
    const nail = new THREE.Group(); gI.add(nail);
    { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 4.5, 12), M.metal(0x8c95a3, { roughness: 0.4, emissive: new THREE.Color(0) })); sh.position.y = -2.25; nail.add(sh); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16), sh.material); nail.add(hd); const tp = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 10), sh.material); tp.position.y = -4.6; tp.rotation.x = Math.PI; nail.add(tp); nail.mat = sh.material; }
    const burner = new THREE.Group(); burner.position.set(9.5, 0, -1.5); gI.add(burner);
    { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 2.2, 20), M.metal(0xb9bec8)); b.position.y = 1.1; burner.add(b); }
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.2, 16, 1, true), M.glow(0x5aa0ff, { transparent: true, opacity: 0.75, side: THREE.DoubleSide })); flame.position.set(9.5, 3.3, -1.5); gI.add(flame);
    const tray = box(3, 0.2, 3, M.metal(0x6d7380)); tray.position.set(11.8, 0.1, -1.5); gI.add(tray);
    const DOM = { nx: 7, ny: 5, s: 1.3, x0: -3.2, y0: 1.6 };
    const domBox = box(DOM.nx * DOM.s + 0.3, DOM.ny * DOM.s + 0.3, 0.2, M.metal(0x6d7380, { roughness: 0.6 })); domBox.position.set(DOM.x0 + (DOM.nx - 1) * DOM.s / 2, DOM.y0 + (DOM.ny - 1) * DOM.s / 2, -0.25); gI.add(domBox);
    const domArrows = []; const rD = rng(19);
    for (let j = 0; j < DOM.ny; j++) for (let i = 0; i < DOM.nx; i++) {
      const g = new THREE.Group(); g.position.set(DOM.x0 + i * DOM.s, DOM.y0 + j * DOM.s, 0);
      const tile = box(DOM.s - 0.06, DOM.s - 0.06, 0.05, M.matte(0x8c95a3)); tile.position.z = -0.05; g.add(tile);
      const a = new THREE.Group(); g.add(a);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 0.05), M.glow(0xff6a5c)); sh.position.x = -0.05; a.add(sh);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 3), M.glow(0xff6a5c)); tip.rotation.z = -Math.PI / 2; tip.position.x = 0.45; a.add(tip);
      gI.add(g); domArrows.push({ a, tile, r0: rD() * TAU, sp: 0.5 + rD() * 2, ph: rD() * TAU });
    }
    const lDom = stage.label('domains, hugely magnified', [DOM.x0 + 3.9, DOM.y0 + 6.9, 0], gI);
    const lNail = stage.label('', [0, 0, 0], gI, 'hot'); lNail.element.style.setProperty('--c', COL.hot);
    let curT = 20;
    const mBoard = board(gI, 6.2, 3.3, 700, 372, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Iron’s magnetism against temperature');
      const { X, Y } = axes(g, w, h, { xMax: 900, yMax: 1.05, xTicks: [0, 200, 400, 600, 770, 900], yTicks: [0, 0.5, 1], xFmt: (v) => v + '°', yFmt: (v) => Math.round(v * 100) + '%', x0: 76, xLabel: '°C' });
      const pts = []; for (let t = 0; t <= 900; t += 4) pts.push([t, magFrac(t)]);
      line(g, pts, X, Y, COL.north, 4);
      g.strokeStyle = 'rgba(255,181,71,.7)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(X(770), Y(0)); g.lineTo(X(770), Y(1.05)); g.stroke(); g.setLineDash([]);
      text(g, 'Curie point', X(770) - 108, Y(0.9), COL.hot, 'bold 17px sans-serif');
      dot(g, X(curT), Y(magFrac(curT)), '#fff', 8);
    }, [9.6, 14.0, -2]);
    mBoard.mesh.rotation.y = -0.15;
    const ir = { y: 0, v: 0 };

    // ================================================================ levitation (1 unit = 1 cm)
    const dish = latheX([[-0.1, 0], [-0.1, 3.4], [1.2, 3.4], [1.2, 3.2], [0.1, 3.2], [0.1, 0]], M.plastic(0xe8ecf2, { side: THREE.DoubleSide }), { seg: 48 }); dish.rotation.z = Math.PI / 2; dish.position.y = 0.1; gV.add(dish);
    const ln2 = new THREE.Mesh(new THREE.CylinderGeometry(3.15, 3.15, 0.8, 48), M.clear(0xcfe8ff, 0.35)); ln2.position.y = 0.6; gV.add(ln2);
    const ybco = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.6, 48), M.matte(0x1b1b1f)); ybco.position.y = 0.55; gV.add(ybco);
    const fMag = makeBar(1.6, 1.6, 0.8); gV.add(fMag); fMag.rotation.z = Math.PI / 2;
    const mist = dots(50, 0.14, 0xffffff, 6, 0.35); gV.add(mist);
    const rM = rng(2), mistSeeds = Array.from({ length: 50 }, () => [rM() * TAU, rM() * 3, rM()]);
    const lFloat = stage.label('', [0, 0, 0], gV, 'hot'); lFloat.element.style.setProperty('--c', COL.field);
    const lY = stage.label('YBCO superconductor', [0, 0.1, 3.4], gV), lN2 = stage.label('liquid nitrogen, −196 °C', [-3.6, 1.3, 2.2], gV);
    const lv = { y: 1.25 };

    // ================================================================ myths (1 unit = 1 cm)
    const gBreak = new THREE.Group(), gHeal = new THREE.Group(), gArm = new THREE.Group(); gY.add(gBreak, gHeal); gHeal.add(gArm); gArm.scale.setScalar(0.6); gArm.position.set(3.2, 0, 3);
    const cardY = box(22, 0.1, 13, M.matte(0xf3efe4)); cardY.position.y = 0.05; gBreak.add(cardY);
    const pieces = []; for (let i = 0; i < 4; i++) { const p = new THREE.Group(); gBreak.add(p); pieces.push(p); }
    const yLines = fieldLines(stage, 0x2aa7c9, { width: 2, opacity: 0.9, headSize: 0.35 }); gBreak.add(yLines);
    const lPoles = stage.label('', [0, 0, 0], gBreak, 'hot'); lPoles.element.style.setProperty('--c', COL.north);
    let yKey = null;
    // healing bracelet: a forearm with small disc magnets, and a chart of B against depth
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(2.2, 12, 8, 24), M.matte(0xc68b64, { roughness: 0.7 })); arm.rotation.z = Math.PI / 2; arm.position.set(-2, 2.4, 0); gArm.add(arm);
    const band = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.25, 12, 48), M.metal(0x9aa3ad, { roughness: 0.3 })); band.rotation.y = Math.PI / 2; band.position.set(1, 2.4, 0); gArm.add(band);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, d = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 20), M.plastic(i % 2 ? NCOL : SCOL)); d.position.set(1, 2.4 + Math.cos(a) * 2.5, Math.sin(a) * 2.5); d.lookAt(1, 2.4, 0); d.rotateX(Math.PI / 2); gArm.add(d); }
    const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 13, 16), M.clear(0xff5a5a, 0.35)); vessel.rotation.z = Math.PI / 2; vessel.position.set(-2, 1.6, 1.2); gArm.add(vessel);
    const rbc = dots(24, 0.2, 0xd83a3a, 8, 0.95); gArm.add(rbc);
    const hBoard = board(gHeal, 7.4, 4.0, 760, 410, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Field of a bracelet magnet', 'into your wrist, log scale');
      const { X, Y } = axes(g, w, h, { xMax: 30, yMin: -5, yMax: 0, logY: true, xTicks: [0, 5, 10, 15, 20, 25, 30], yTicks: [1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1], xFmt: (v) => v + ' mm', yFmt: (v) => fmtB(v), x0: 104, xLabel: 'depth →' });
      const pts = []; for (let z = 0; z <= 30; z += 0.25) pts.push([z, Math.log10(Math.max(1e-5, discB(z / 1000)))]);
      line(g, pts.map(([x, y]) => [x, Math.pow(10, y)]), X, Y, COL.north, 4);
      g.strokeStyle = 'rgba(123,224,140,.8)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(X(0), Y(50e-6)); g.lineTo(X(30), Y(50e-6)); g.stroke(); g.setLineDash([]);
      text(g, 'Earth’s field', X(21), Y(50e-6) - 8, COL.good, '16px sans-serif');
      text(g, 'a 10 × 3 mm neodymium disc', X(9), Y(0.2), 'rgba(255,255,255,.7)', '16px sans-serif');
    }, [5.6, 6.2, -4]);
    hBoard.mesh.rotation.x = -0.35;
    const lHeal = stage.label('', [0, 0, 0], gHeal, 'hot'); lHeal.element.style.setProperty('--c', COL.north);

    return {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lGeo, lWind, lPause, lDom, lY, lN2, lIndia]);
        reelBoards([[mBoard, [4.8, 12.6, -1], 1.0], [hBoard, [0.3, 9, -3], 1.0]]);
        show(s.focus);

        if (s.focus === 'earth') {
          const m = Math.cos(s.flip * Math.PI);                    // +1 today, −1 reversed
          const kk = `${Math.sign(m)}|${s.flip > 0.45 && s.flip < 0.55}`;
          if (kk !== eKey) {
            eKey = kk;
            const ls = [];
            // today the field points up out of the southern hemisphere and down into the northern one
            for (let k = 0; k < 8; k++) {
              const phi = (k / 8) * TAU;
              for (const L of [1.35, 1.9, 2.8]) {
                const lat0 = Math.acos(Math.sqrt(1 / L)), p = [];
                for (let i = 0; i <= 48; i++) { const lat = -lat0 + (2 * lat0 * i) / 48, r = R * L * Math.cos(lat) ** 2; p.push([r * Math.cos(lat) * Math.cos(phi), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(phi)]); }
                if (m < 0) p.reverse();
                ls.push(p);
              }
            }
            eLines.set(ls, 0.5);
          }
          eLines.setOpacity(0.15 + 0.75 * Math.abs(m));
          const st = s.storm ? 1 : 0;
          aurora.forEach((a, i) => { const lat = (st ? 58 : 67) * Math.PI / 180; a.scale.setScalar((R * Math.cos(lat) * 1.02) / (R * Math.cos(67 * Math.PI / 180) * 1.02)); a.position.y = (i ? 1 : -1) * R * Math.sin(lat) * 1.02; a.material.opacity = (0.35 + 0.5 * st) * (0.6 + 0.4 * Math.sin(time * 3 + i)) * Math.abs(m); });
          // solar wind: streams in from the Sun and slides round the magnetopause (a paraboloid)
          const x0 = 7.6, R0 = 7, spd = s.storm ? 9 : 5;
          windSeeds.forEach(([b1, b2, ph], i) => {
            const u = (ph + time * spd / 26) % 1, x = 20 - u * 26, by = b1 * 5, bz = b2 * 5, b = Math.hypot(by, bz) || 0.01;
            const rho = x < x0 - (b * b) / (2 * R0) ? Math.sqrt(2 * R0 * (x0 - x)) : b;
            wind.place(i, x, EY + (by / b) * rho, (bz / b) * rho, 1);
          }); wind.done();
          globe.rotation.y = -1.9 + time * 0.02;
          // compass over India: the horizontal field there points roughly geographic north, scaled by m
          nAng = approach(nAng, m >= 0 ? 0 : Math.PI, 1.5, dt);
          needle.rotation.y = nAng; needle.scale.setScalar(0.4 + 0.6 * Math.abs(m));
          const wp = new THREE.Vector3(); indiaC.getWorldPosition(wp); gE.worldToLocal(wp); lIndia.position.set(wp.x + 0.3, wp.y - 0.6, wp.z + 0.4);
          const tp = new THREE.Vector3(0, R + 0.9, 0); magAxis.localToWorld(tp); gE.worldToLocal(tp);
          lMagP.position.copy(tp); lMagP.position.x += 2.6; lMagP.position.y += 0.9; lMagP.element.innerHTML = m >= 0 ? 'magnetic pole: field goes <b>in</b>' : 'field now comes <b>out</b> here';
          lAur.position.set(3.6, EY + 2.0, 0.5);
        }

        if (s.focus === 'iron') {
          const mt = magFrac(s.temp), stuck = s.temp < TC_IRON;
          // nail hangs from the magnet's north end (bottom face at y = 6.4); past Tc it drops into the tray
          ir.k = approach(ir.k || 0, stuck ? 0 : 1, stuck ? 3 : 5, dt);
          const k = ir.k;
          nail.position.set(9.5 + 2.3 * k, 6.4 - 5.7 * k * k, -1.5 + 0.3 * k);
          nail.rotation.z = (Math.PI / 2) * Math.min(1, k * 1.3);
          const glow = clamp((s.temp - 450) / 450, 0, 1);
          nail.mat.emissive.setRGB(glow * 1.2, glow * 0.35, glow * 0.05);
          flame.visible = s.temp > 30; flame.scale.set(1, 0.6 + 0.5 * Math.min(1, s.temp / 800), 1); flame.position.y = 3.0 + 0.2 * Math.sin(time * 12);
          // domains: aligned share H turns to point right; the rest keep random directions; above Tc they shrink and jitter
          domArrows.forEach((d, i) => {
            const al = (i * 0.618) % 1 < s.H;
            let ang = al ? 0 : d.r0;
            if (mt === 0) ang = d.r0 + Math.sin(time * d.sp * 6 + d.ph) * 2;
            else ang += Math.sin(time * d.sp * 3 + d.ph) * 0.4 * (1 - mt);
            d.a.rotation.z = ang; d.a.scale.setScalar(0.25 + 0.75 * mt);
          });
          if (Math.abs(curT - s.temp) > 1) { curT = s.temp; mBoard.redraw(); }
          lNail.position.set(stuck ? 11.3 : 12.5, stuck ? 4.4 : 1.4, -1.5); lNail.element.innerHTML = stuck ? `nail at <b>${s.temp} °C</b>: still sticks` : `<b>${s.temp} °C</b>: past the Curie point, it drops`;
        }

        if (s.focus === 'levitate') {
          const yT = s.cold ? 1.25 + 1.0 + 0.4 : 0.85 + 0.4;
          lv.y = approach(lv.y, yT, s.cold ? 2 : 6, dt);
          fMag.position.set(0, lv.y + (s.cold ? Math.sin(time * 1.3) * 0.03 : 0), 0);
          fMag.rotation.y = s.cold ? time * 0.4 : 0;
          ln2.visible = s.cold;
          mistSeeds.forEach(([a, r, ph], i) => { const u = (ph + time * 0.15) % 1; mist.place(i, Math.cos(a + u) * (1 + r), 1 + u * 2.4, Math.sin(a + u) * (1 + r), s.cold ? 1 - u : 0); }); mist.done();
          lFloat.position.set(0, lv.y + 1.4, 0); lFloat.element.innerHTML = s.cold ? 'floats: <b>flux pinning</b>' : 'warm: just sits there';
        }

        if (s.focus === 'myths') {
          gBreak.visible = s.myth === 'break'; gHeal.visible = s.myth === 'heal';
          if (s.myth === 'break') {
            const n = Math.round(s.pieces);
            if (yKey !== n) {
              yKey = n;
              const Ltot = 8, gap = 1.4, len = Ltot / n, span = Ltot + gap * (n - 1), q = poleQ(1.3, 1e-4), poles = [];
              pieces.forEach((p, i) => {
                p.clear();
                p.visible = i < n; if (i >= n) return;
                const bar = makeBar(len, 1.2, 1); p.add(bar);
                const cx = -span / 2 + len / 2 + i * (len + gap);
                p.position.set(cx, 0.6, 0);
                poles.push({ a: cx + len / 2 - 0.15, b: 0, q }, { a: cx - len / 2 + 0.15, b: 0, q: -q });
              });
              const field = (a, b) => poleField(poles, a, b), sP = poles.filter((p) => p.q < 0), nP = poles.filter((p) => p.q > 0);
              const stop = (a, b) => sP.some((p) => Math.hypot(a - p.a, b - p.b) < 0.3), ls = [];
              const stopN = (a, b) => nP.some((p) => Math.hypot(a - p.a, b - p.b) < 0.3), bx = [-11, 11, -6.5, 6.5];
              nP.forEach((p) => { for (let i = 0; i < 10; i++) { const t = ((i + 0.5) / 10) * TAU; ls.push(traceLine(field, p.a + Math.cos(t) * 0.4, p.b + Math.sin(t) * 0.4, { stop, box: bx, max: 400, step: 0.12 }).map(([a, b]) => [a, 0.6, b])); } });
              sP.forEach((p) => { for (let i = 0; i < 10; i++) { const t = ((i + 0.5) / 10) * TAU, pts = traceLine(field, p.a + Math.cos(t) * 0.4, p.b + Math.sin(t) * 0.4, { stop: stopN, box: bx, max: 400, step: 0.12, dir: -1 }), e = pts[pts.length - 1]; if (!stopN(e[0], e[1])) ls.push(pts.reverse().map(([a, b]) => [a, 0.6, b])); } });
              yLines.set(ls, 0.4);
            }
            lPoles.position.set(0, 2.4, -1.2); lPoles.element.innerHTML = `${n} piece${n > 1 ? 's' : ''}: <b>${n} north</b> and <b>${n} south</b> poles`;
          } else {
            for (let i = 0; i < 24; i++) { const u = ((i / 24) + time * 0.08) % 1; rbc.place(i, -8 + u * 13, 1.6 + Math.sin(i * 7) * 0.12, 1.2 + Math.cos(i * 5) * 0.12, 1); } rbc.done();
            lHeal.position.set(2.2, 3.6, 4.4); lHeal.element.innerHTML = `1 cm into the wrist: <b>${fmtB(discB(0.01 + 0.003))}</b>`;
          }
        }
      },
      readout: (s) => {
        if (s.focus === 'iron') {
          const mt = magFrac(s.temp);
          return `<div class="big">${s.temp < TC_IRON ? `${Math.round(mt * 100)}% of full magnetism` : 'Not magnetic: past 770 °C'}</div>
            <div class="row"><span>Temperature</span><b>${s.temp} °C (${Math.round(s.temp + 273.15)} K)</b></div>
            <div class="row"><span>Curie point of iron</span><b>770 °C (1,043 K)</b></div>
            <div class="row"><span>Domains lined up by the magnet</span><b>${Math.round(s.H * 100)}%</b></div>
            <div class="row"><span>Nail</span><b>${s.temp < TC_IRON ? 'sticks' : 'falls off'}</b></div>
            <small>Curie points: nickel 358 °C, iron 770 °C, cobalt 1,115 °C; neodymium magnets about 310 °C. Curve from Weiss’s mean-field model.</small>`;
        }
        if (s.focus === 'levitate') {
          return `<div class="big">${s.cold ? 'Floating about 1 cm up' : 'Too warm: no superconductivity'}</div>
            <div class="row"><span>YBCO becomes superconducting below</span><b>93 K (−180 °C)</b></div>
            <div class="row"><span>Liquid nitrogen boils at</span><b>77 K (−196 °C)</b></div>
            <div class="row"><span>What holds it</span><b>${s.cold ? 'pinned field lines' : 'nothing: it rests'}</b></div>
            <small>Field lines get trapped (“pinned”) in the superconductor, locking the magnet in place. Japan’s superconducting SCMaglev reached 603 km/h in 2015.</small>`;
        }
        if (s.focus === 'myths') {
          if (s.myth === 'heal') return `<div class="big">Myth: magnets heal</div>
            <div class="row"><span>At the magnet’s face</span><b>${fmtB(discB(0))}</b></div>
            <div class="row"><span>1 cm into the wrist</span><b>${fmtB(discB(0.013))}</b></div>
            <div class="row"><span>2 cm in</span><b>${fmtB(discB(0.023))}</b></div>
            <div class="row"><span>Pull on blood’s iron</span><b>none (not ferromagnetic)</b></div>
            <small>A review of randomised trials (Pittler, Brown & Ernst, 2007) found no convincing evidence that static magnets relieve pain. An MRI at 3 T does not pull your blood.</small>`;
          const n = Math.round(s.pieces);
          return `<div class="big">${n === 1 ? 'One magnet: N and S' : `${n} magnets, not ${n} lone poles`}</div>
            <div class="row"><span>North poles</span><b>${n}</b></div>
            <div class="row"><span>South poles</span><b>${n}</b></div>
            <div class="row"><span>Lone poles (monopoles) ever found</span><b>none</b></div>
            <small>Every tiny bit of a magnet is itself a magnet, right down to single atoms, so each cut makes a new N and S.</small>`;
        }
        const m = Math.cos(s.flip * Math.PI);
        return `<div class="big">${Math.abs(m) < 0.2 ? 'Mid-flip: a weak, messy field' : m > 0 ? 'Compass points north' : 'Reversed: compass points south'}</div>
          <div class="row"><span>Field at the surface</span><b>${Math.round(25 * Math.abs(m))}–${Math.round(65 * Math.abs(m))} µT</b></div>
          <div class="row"><span>Tilt from the spin axis</span><b>≈ 9°</b></div>
          <div class="row"><span>Last reversal</span><b>≈ 780,000 years ago</b></div>
          <div class="row"><span>Magnetosphere, sunward</span><b>≈ 10 Earth radii</b></div>
          <div class="row"><span>Aurora ring</span><b>${s.storm ? 'pushed to ≈ 55–60°' : '≈ 65–70° magnetic latitude'}</b></div>
          <small>During a flip the field weakens and gets tangled for a few thousand years; this shows only the dipole part.</small>`;
      },
    };
  },
};
