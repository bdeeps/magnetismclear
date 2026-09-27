// Chapter 2: electromagnets. Five scenes.
// 1. Ørsted's wire (1820). Scene unit 1 cm. A vertical wire through a card carries current I. Its field
//    circles the wire, B = μ0 I ÷ (2π r) (Ampère's law; Griffiths ch. 5). Eight compasses feel that plus
//    Earth's 40 µT to the north, so at small currents they only swing part of the way, as Ørsted saw.
// 2. A coil (solenoid) 10 cm long, 1.5 cm radius, with N turns and current I: B inside = μ0 n I with
//    n = N ÷ L (long-solenoid formula). An iron core multiplies it. A solid rod in an open coil gives an
//    effective μ of a few hundred, not the material's thousands, because of the air path outside; we use
//    200, and soft iron saturates near 1.6 T: B = 1.6 tanh(200 B_air ÷ 1.6) T (illustrative, after
//    Jiles, Introduction to Magnetism and Magnetic Materials). Holding force on a flat iron plate:
//    F = B² A ÷ (2 μ0) (Maxwell pull formula). Paperclips touch only a tiny spot, so the clip count is
//    illustrative.
// 3. A scrapyard lifting magnet, 1.5 m across. Scene unit 1 m. Up to 1.0 T at the poles with about
//    0.9 m² of pole area: ideal pull on thick flat steel = B² A ÷ 2μ0 ≈ 360 kN. Scrap cars touch in only
//    a few spots with air gaps, so we take 4% of that (≈ 14 kN at full current), enough for a 700 kg
//    car. Pull goes as current² (unsaturated). Coil power about 10 kW at full current (typical 1.5 m
//    magnets draw 8–12 kW; e.g. Walker Magnetics, Ohio Magnetics data sheets).
// 4. An electric bell: an electromagnet pulls an iron armature, which breaks its own circuit at a
//    contact screw and springs back. Real bells strike 10–20 times a second; shown 10× slower.
// 5. A magnetic door lock (maglock): a 12 V, 0.5 A electromagnet on the frame holds a steel plate on
//    the door with 2,670 N (600 lb, a common rating; see UL 1034 / manufacturer data such as Securitron
//    M62). Cut the power and it lets go: that is why fire codes like them.
import { THREE, M, box, beam, sphere, torus, spring, clamp, approach } from '../kit.js';
import {
  MU0, TAU, G0, B_EARTH_H, fieldLines, makeCompass, filings, copper, ironMat, dots, poleField, traceLine,
  board, panelBg, title, axes, dot, line, text, COL, HEX, fitNarrow, pickView, reelBoards, inReel, focusSwitch,
  force, fmtB, fmtN, asWeight, rng, letter, NCOL, SCOL,
} from '../magnetism.js';

const CX = 40, KX = 80, BX = 120, LX = 160;
const VIEWS = {
  wire: { pos: [-1.5, 14, 20], target: [-3, 4.2, 0], cx: 0 },
  coil: { pos: [CX - 1, 8, 27], target: [CX - 3, 2.2, 0], cx: CX + 0.5 },
  crane: { pos: [KX + 0.5, 6, 14.5], target: [KX - 1.2, 2.8, 0], cx: KX + 1.2 },
  bell: { pos: [BX - 2, 9, 23], target: [BX - 4.6, 7.8, 0], cx: BX },
  lock: { pos: [LX - 0.6, 2.3, 6.6], target: [LX - 1.3, 1.5, 0], cx: LX + 0.3 },
};
// Coil constants
const COIL = { L: 0.10, r: 0.015, area: Math.PI * 0.015 ** 2, mu: 200, Bs: 1.6 };
export function coilB(s) {
  const air = (MU0 * s.turns * s.amps) / COIL.L;
  return s.core ? COIL.Bs * Math.tanh((COIL.mu * air) / COIL.Bs) : air;
}
export const pullFlat = (B, A) => (B * B * A) / (2 * MU0);
const CRANE = { A: 0.9, Bmax: 1.0, k: 0.04, car: 700, P: 10000 };
export const craneF = (pct) => CRANE.k * pullFlat(CRANE.Bmax * pct / 100, CRANE.A);
const LOCK = { F: 2670, A: 0.0072, V: 12, I: 0.5 };

export default {
  id: 'electro',
  short: 'Electromagnets',
  title: 'Current makes a magnet',
  subtitle: 'A wire with current in it is ringed by a field. Coil it up, add iron, and switch it on and off.',
  view: VIEWS.wire,
  learn: `<p>In 1820 <b>Hans Christian Ørsted</b> noticed that a compass needle swung when he switched on a current in a nearby wire. It was the first proof that <b>electricity makes magnetism</b>. The field of a straight wire goes <b>round in circles</b> around it, strongest close in: B = μ₀ I ÷ (2π r).</p>
    <p>Which way round? Use the <b>right-hand grip rule</b>: grip the wire with your right hand, thumb along the current, and your curled fingers show the direction of the field.</p>
    <p>Wind the wire into a <b>coil</b> and the circles from every turn add up inside it. A long coil, or <b>solenoid</b>, has a strong, even field inside, B = <b>μ₀ n I</b>, where n is the number of turns per metre and I the current. It behaves just like a bar magnet with a north and a south end. Push an <b>iron core</b> inside and the iron's own tiny magnets line up with the coil's field, multiplying it hundreds of times, until the iron <b>saturates</b> at about 1.6 T. That is an <b>electromagnet</b>: a magnet you can switch on, switch off and turn up.</p>
    <p>Electromagnets are everywhere. A <b>scrapyard crane</b> lifts old cars with one and drops them by cutting the current. An <b>electric bell</b> pulls an iron hammer, which breaks its own circuit and springs back, over and over. A <b>relay</b> uses the same trick so a tiny current can switch a big one. A <b>magnetic door lock</b> holds a door shut with the force of a small car's weight, and lets go if the power fails. Motors (next chapter), the magnetron in a microwave and the MRI scanner all start here.</p>
    <p class="tip"><b>Try it:</b> turn up the wire's current and watch the compasses swing into a circle; reverse it. In the coil, drop the iron core in and see the field jump. Then run the crane with too little current.</p>`,
  terms: [
    { t: 'Electromagnet', d: 'A coil of wire, usually round an iron core, that becomes a magnet while current flows.' },
    { t: 'Solenoid', d: 'A long coil of wire. Inside it the field is strong and even: B = μ₀ n I.' },
    { t: 'Right-hand grip rule', d: 'Thumb along the current, curled fingers show which way the field goes round.' },
    { t: 'μ₀ (mu-nought)', d: 'The magnetic constant, 4π × 10⁻⁷ T·m/A. It sets how much field a current makes in empty space.' },
    { t: 'Iron core', d: 'Soft iron inside a coil. Its domains line up with the coil’s field and multiply it many times.' },
    { t: 'Saturation', d: 'When all of the iron’s domains are lined up. Above about 1.6–2 T, more current adds little.' },
    { t: 'Relay', d: 'An electromagnetic switch: a small current in a coil pulls a lever that closes a bigger circuit.' },
  ],
  defaults: { focus: 'wire', I: 12, turns: 400, amps: 2, core: false, crane: 100, power: true, ring: true, push: 800, lock: true },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'wire', label: 'Ørsted’s wire' }, { v: 'coil', label: 'Coil' }, { v: 'crane', label: 'Crane' }, { v: 'bell', label: 'Bell' }, { v: 'lock', label: 'Door lock' }] },
    { key: 'I', type: 'range', label: 'Wire: current (negative = reversed)', min: -20, max: 20, step: 0.5, ends: ['−20 A', '20 A'], fmt: (v) => v + ' A' },
    { key: 'turns', type: 'range', label: 'Coil: number of turns', min: 20, max: 1000, step: 10, ends: ['20', '1,000'], fmt: (v) => v + ' turns' },
    { key: 'amps', type: 'range', label: 'Coil: current', min: 0, max: 5, step: 0.1, ends: ['0 A', '5 A'], fmt: (v) => v.toFixed(1) + ' A' },
    { key: 'core', type: 'toggle', label: 'Coil: iron core inside' },
    { key: 'crane', type: 'range', label: 'Crane: magnet current', min: 0, max: 100, step: 1, ends: ['0%', '100%'], fmt: (v) => v + '%' },
    { key: 'power', type: 'toggle', label: 'Crane: power on' },
    { key: 'ring', type: 'toggle', label: 'Bell: press the button' },
    { key: 'lock', type: 'toggle', label: 'Door lock: powered' },
    { key: 'push', type: 'range', label: 'Door lock: push on the door', min: 0, max: 4000, step: 50, ends: ['0 N', '4,000 N'], fmt: (v) => fmtN(v), hint: 'A hard shove from an adult is roughly 500–1,000 N.' },
  ],
  onChange(s, key) {
    if (key === 'I') s.focus = 'wire';
    if (['turns', 'amps', 'core'].includes(key)) s.focus = 'coil';
    if (key === 'crane' || key === 'power') s.focus = 'crane';
    if (key === 'ring') s.focus = 'bell';
    if (key === 'lock' || key === 'push') s.focus = 'lock';
  },
  quiz: [
    { q: 'What did Ørsted discover in 1820?', options: ['That magnets can make electricity', 'That an electric current makes a magnetic field around the wire', 'That the Earth is a magnet', 'That iron loses its magnetism when hot'], answer: 1, why: 'A compass needle swung when current flowed in a nearby wire: electricity makes magnetism. Making electricity from magnets came later, with Faraday.' },
    { q: 'A coil has 200 turns. You double the current. What happens to the field inside (no iron)?', options: ['It halves', 'It stays the same', 'It doubles', 'It goes up four times'], answer: 2, why: 'B = μ₀ n I: the field is proportional to the current, so double the current, double the field.' },
    { q: 'Why does a scrapyard crane use an electromagnet rather than a permanent magnet?', options: ['It is lighter', 'It can be switched off to drop the load', 'Permanent magnets do not attract steel', 'It works without electricity'], answer: 1, why: 'Cutting the current makes the field vanish, so the crane can let go of the scrap exactly where it wants.' },
  ],
  reel: [
    { ms: 4800, caption: 'Ørsted, 1820: a current makes a field that circles the wire, and the compasses swing round.', set: { focus: 'wire', I: 0 }, anim: { I: [0, 20] }, view: { pos: [0.2, 8.5, 5], target: [0.2, 4, 0] }, spin: 0.4 },
    { ms: 5000, caption: 'Coil the wire and it becomes a magnet. Slide in an iron core and the field jumps hundreds of times.', set: { focus: 'coil', turns: 500, amps: 2, core: false }, anim: { core: [false, true] }, view: { pos: [CX + 0.3, 4, 11], target: [CX + 0.3, 1.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gW = new THREE.Group(), gC = new THREE.Group(), gK = new THREE.Group(), gB = new THREE.Group(), gL = new THREE.Group();
    gC.position.x = CX; gK.position.x = KX; gB.position.x = BX; gL.position.x = LX; root.add(gW, gC, gK, gB, gL);
    const show = focusSwitch(stage, { wire: gW, coil: gC, crane: gK, bell: gB, lock: gL }, VIEWS);

    // ================================================================ Ørsted's wire (1 unit = 1 cm)
    const CY = 3.5;
    const stand = box(12, 0.12, 12, M.matte(0xf3efe4)); stand.position.y = CY - 0.06; gW.add(stand);
    for (const [x, z] of [[-5.6, -5.6], [5.6, -5.6], [-5.6, 5.6], [5.6, 5.6]]) gW.add(beam([x, 0, z], [x, CY - 0.1, z], 0.12, M.metal(0x8c95a3)));
    const wire = beam([0, 0, 0], [0, 9.5, 0], 0.18, copper()); gW.add(wire);
    const wDots = dots(40, 0.12, 0xffd166); gW.add(wDots);
    const wLines = fieldLines(stage, 0x2aa7c9, { width: 2.4, opacity: 0.9, headSize: 0.45 }); gW.add(wLines);
    const wComp = []; for (let i = 0; i < 8; i++) { const c = makeCompass(0.8); const a = (i / 8) * TAU; c.position.set(Math.cos(a) * 3.2, CY + 0.08, Math.sin(a) * 3.2); gW.add(c); wComp.push(c); }
    const wFil = filings(420, 0.26); gW.add(wFil);
    const rw = rng(3), wSeeds = []; for (let i = 0; i < 420; i++) { const rr = 0.7 + Math.sqrt(rw()) * 1.7, a = rw() * TAU; wSeeds.push([Math.cos(a) * rr, Math.sin(a) * rr, rw() * TAU]); }
    // a curled arrow for the right-hand grip rule
    const curl = new THREE.Group(); curl.position.set(0, 7.6, 0); gW.add(curl);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.07, 8, 40, TAU * 0.78), M.glow(HEX.field)); arc.rotation.x = Math.PI / 2; curl.add(arc);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 12), M.glow(HEX.field)); curl.add(tip);
    const aI = force(HEX.cur, 0.08, 0.5); gW.add(aI);
    const lWI = stage.label('', [0, 0, 0], gW, 'hot'); lWI.element.style.setProperty('--c', COL.cur);
    const lWB = stage.label('', [0, 0, 0], gW, 'hot'); lWB.element.style.setProperty('--c', COL.field);
    const lNorth = stage.label('↑ north', [4.6, CY + 0.2, -5.4], gW);
    let wKey = null;

    // ================================================================ the coil (1 unit = 1 cm)
    const CYc = 2.2;
    const bench = box(18, 0.2, 7, M.matte(0x3a3f4b)); bench.position.set(1, 0.1, 0); gC.add(bench);
    const former = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 10, 32, 1, true), M.plastic(0xe8e2d0, { side: THREE.DoubleSide, transparent: true, opacity: 0.35 })); former.rotation.z = Math.PI / 2; former.position.y = CYc; gC.add(former);
    let coilMesh = null, coilTurns = 0;
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 12, 32), ironMat()); core.rotation.z = Math.PI / 2; core.position.y = CYc; core.castShadow = true; gC.add(core);
    for (const x of [-5, 5]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.2, 32), M.plastic(0x2b2f38)); f.rotation.z = Math.PI / 2; f.position.set(x, CYc, 0); gC.add(f); f.castShadow = true; }
    for (const x of [-4.4, 4.4]) gC.add(beam([x, 0.2, 0], [x, CYc - 1.4, 0], 0.25, M.plastic(0x2b2f38)));
    const cLines = fieldLines(stage, 0x2aa7c9, { width: 2.2, opacity: 0.9, headSize: 0.4 }); gC.add(cLines);
    const cDots = dots(60, 0.1, 0xffd166); gC.add(cDots);
    const clips = [];
    for (let i = 0; i < 14; i++) { const c = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 6, 20), M.metal(0xc8ccd4)); t.scale.set(1, 0.55, 1); c.add(t); const t2 = t.clone(); t2.scale.set(0.8, 0.4, 1); c.add(t2); gC.add(c); clips.push(c); }
    const lCN = letter('N', 1.1, '#ff6a5c'), lCS = letter('S', 1.1, '#6aa6ff'); gC.add(lCN, lCS);
    const lCB = stage.label('', [0, 0, 0], gC, 'hot'); lCB.element.style.setProperty('--c', COL.field);
    const lCore = stage.label('', [0, 0, 0], gC);
    const rc = rng(11), clipSeeds = clips.map(() => [7.2 + rc() * 3, rc() * TAU, (rc() - 0.5) * 3]);
    let cKey = null, clipHold = 0;

    // ================================================================ the crane (1 unit = 1 m)
    const ground = box(15, 0.1, 7, M.matte(0x5a4a3a)); ground.position.set(-0.5, -0.05, 0); gK.add(ground);
    const rk = rng(21);
    for (let i = 0; i < 40; i++) { const b = box(0.3 + rk() * 0.8, 0.15 + rk() * 0.4, 0.3 + rk() * 0.8, M.metal([0x7a6a5a, 0x6f7682, 0x8a5a3a, 0x5a6272][i % 4], { roughness: 0.8 })); b.position.set(-6.8 + rk() * 3.5, rk() * 0.6, -1.8 + rk() * 3); b.rotation.set(rk(), rk() * 3, rk()); gK.add(b); }
    const mast = beam([4.5, 0, -2], [4.5, 7, -2], 0.16, M.metal(0xe0b33a, { roughness: 0.5 })); gK.add(mast);
    const cab = box(1.4, 1.2, 1.4, M.plastic(0xe0b33a)); cab.position.set(4.5, 0.6, -2); gK.add(cab);
    gK.add(beam([4.5, 6.8, -2], [-1, 6.2, 0], 0.12, M.metal(0xe0b33a, { roughness: 0.5 })));
    const cable = beam([0, 0, 0], [0, 1, 0], 0.025, M.metal(0x333333)); gK.add(cable);
    const lift = new THREE.Group(); gK.add(lift);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.42, 40), M.metal(0x3a3f4b, { roughness: 0.5 })); disc.castShadow = true; lift.add(disc);
    const discRim = torus(0.75, 0.05, M.metal(0xe0b33a)); discRim.rotation.x = Math.PI / 2; discRim.position.y = 0.2; lift.add(discRim);
    const discGlow = new THREE.Mesh(new THREE.CircleGeometry(0.72, 40), M.glow(0x8ef0ff, { transparent: true, opacity: 0.6 })); discGlow.rotation.x = Math.PI / 2; discGlow.position.y = -0.215; lift.add(discGlow);
    for (const a of [0, 2.1, 4.2]) lift.add(beam([Math.cos(a) * 0.55, 0.21, Math.sin(a) * 0.55], [0, 0.9, 0], 0.02, M.metal(0x333333)));
    const car = new THREE.Group(); gK.add(car);
    { const bodyM = M.plastic(0xb03a2e, { roughness: 0.7 }); const b1 = box(3.2, 0.55, 1.4, bodyM); b1.position.y = 0.55; car.add(b1); const b2 = box(1.7, 0.5, 1.3, bodyM); b2.position.set(-0.15, 1.05, 0); car.add(b2);
      const win = box(1.72, 0.3, 1.32, M.plastic(0x2a3440, { roughness: 0.2 })); win.position.set(-0.15, 1.07, 0); car.add(win);
      for (const [x, z] of [[-1, 0.62], [1, 0.62], [-1, -0.62], [1, -0.62]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 20), M.matte(0x1b1d22)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.3, z); w.castShadow = true; car.add(w); } }
    car.rotation.z = 0.04;
    const aKF = force(HEX.field, 0.05, 0.25), aKW = force(HEX.force, 0.05, 0.25); gK.add(aKF, aKW);
    const lKF = stage.label('', [0, 0, 0], gK, 'hot'); lKF.element.style.setProperty('--c', COL.field);
    const lKW = stage.label('', [0, 0, 0], gK, 'hot'); lKW.element.style.setProperty('--c', COL.force);
    const cr = { t: 0, carY: 0, carV: 0, held: false, carX: -1 };
    const CAR_TOP = 1.3;

    // ================================================================ the bell (1 unit = 1 cm)
    const plank = box(8, 12, 0.4, M.matte(0x8a6139, { roughness: 0.7 })); plank.position.set(-0.5, 6, -0.6); gB.add(plank);
    const gong = new THREE.Mesh(new THREE.SphereGeometry(2.4, 40, 16, 0, TAU, 0, 1.0), M.metal(0xd8b35a, { roughness: 0.25, side: THREE.DoubleSide })); gong.rotation.x = Math.PI / 2; gong.position.set(-2.4, 9.6, -1.65); gB.add(gong);
    gB.add(beam([-2.4, 9.6, -0.4], [-2.4, 9.6, 0.8], 0.12, M.metal(0x8c95a3)));
    const yoke = box(0.8, 3.4, 1.2, ironMat()); yoke.position.set(-2.2, 4.5, 0.3); gB.add(yoke);
    const bCoils = [3.4, 5.6].map((y) => { const c = new THREE.Group(); c.position.set(-0.75, y, 0.3); const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.2, 28), copper()); cyl.rotation.z = Math.PI / 2; cyl.castShadow = true; c.add(cyl); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.8, 16), ironMat()); pole.rotation.z = Math.PI / 2; pole.position.x = -0.2; c.add(pole); gB.add(c); c.cyl = cyl; return c; });
    const arm = new THREE.Group(); arm.position.set(1.0, 1.2, 0.3); gB.add(arm);
    const armature = box(0.35, 5.2, 1.0, ironMat()); armature.position.y = 3.3; arm.add(armature);
    arm.add(beam([0, 5.8, 0], [0, 8.3, 0], 0.07, M.metal(0xb9bec8)));
    const hammer = sphere(0.45, M.metal(0x8c95a3, { roughness: 0.3 })); hammer.position.set(0, 8.5, 0); arm.add(hammer);
    const blade = box(0.08, 1.2, 0.5, M.metal(0xc9a24a)); blade.position.set(0.25, 6.3, 0); arm.add(blade);
    const screw = beam([3.0, 7.6, 0.3], [1.33, 7.6, 0.3], 0.1, M.metal(0xc9a24a)); gB.add(screw);
    const post = box(0.6, 1.2, 0.8, M.plastic(0x2b2f38)); post.position.set(3.1, 7.6, 0.3); gB.add(post);
    const spark = sphere(0.14, M.glow(0xfff2a0)); spark.position.set(1.31, 7.6, 0.3); gB.add(spark);
    const pivot = box(1.2, 0.5, 1.0, M.plastic(0x2b2f38)); pivot.position.set(1.0, 0.95, 0.3); gB.add(pivot);
    const bat = box(2.2, 1.2, 1.0, M.plastic(0x2f6fd6)); bat.position.set(3.8, 1.2, 0.6); gB.add(bat);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.3, 20), M.plastic(0xe0453a)); btn.rotation.x = Math.PI / 2; btn.position.set(3.8, 3.2, 0.3); gB.add(btn);
    const btnBase = box(1.3, 1.3, 0.3, M.plastic(0xf1ede2)); btnBase.position.set(3.8, 3.2, 0.05); gB.add(btnBase);
    const wireM = copper();
    [[[3.8, 1.8, 0.6], [3.8, 2.6, 0.3]], [[3.8, 3.8, 0.3], [3.1, 7.0, 0.3]], [[-2.2, 2.8, 0.3], [2.7, 0.9, 0.6]], [[1.0, 0.9, 0.3], [2.7, 1.5, 0.6]]].forEach(([a, b]) => gB.add(beam(a, b, 0.05, wireM)));
    const lBell = stage.label('', [0, 0, 0], gB, 'hot'); lBell.element.style.setProperty('--c', COL.cur);
    const lContact = stage.label('contact', [3.1, 8.6, 0.6], gB), lEM = stage.label('electromagnet', [-1.6, 2.0, 1.2], gB), lArm = stage.label('iron armature', [2.6, 4.4, 0.8], gB);
    const bl = { th: 0, w: 0, hits: 0, flash: 0 };
    const TH_HIT = 0.11;                          // hammer meets the gong's rim

    // ================================================================ the door lock (1 unit = 1 m)
    const wallM = M.matte(0xd9d3c7);
    const wallL = box(0.6, 2.4, 0.2, wallM); wallL.position.set(-0.8, 1.2, 0); gL.add(wallL);
    const wallR = box(1.2, 2.4, 0.2, wallM); wallR.position.set(1.5, 1.2, 0); gL.add(wallR);
    const header = box(1.0, 0.3, 0.2, wallM); header.position.set(0.0, 2.25, 0); gL.add(header);
    const floorL = box(4, 0.02, 3, M.matte(0x6b6f78)); floorL.position.set(0.3, -0.01, 0.8); gL.add(floorL);
    const hinge = new THREE.Group(); hinge.position.set(-0.45, 0, 0); gL.add(hinge);
    const door = box(0.88, 2.05, 0.05, M.plastic(0x6f8fb0, { roughness: 0.5 })); door.position.set(0.44, 1.025, 0); hinge.add(door);
    const handle = box(0.14, 0.03, 0.04, M.metal(0xb9bec8)); handle.position.set(0.78, 1.0, 0.05); hinge.add(handle);
    const plate = box(0.25, 0.05, 0.02, M.metal(0xb9bec8)); plate.position.set(0.7, 2.02, 0.035); hinge.add(plate);
    const maglock = box(0.27, 0.06, 0.05, M.metal(0x9aa3ad, { roughness: 0.4 })); maglock.position.set(0.25, 2.07, 0.065); gL.add(maglock);
    const led = sphere(0.012, M.glow(0xff3b30)); led.position.set(0.37, 2.07, 0.092); gL.add(led);
    const person = new THREE.Group(); gL.add(person);
    { const sk = M.matte(0xc68b64), cl = M.matte(0x3b6fd8); const tor = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.5, 6, 12), cl); tor.position.y = 1.25; person.add(tor); const hd = sphere(0.12, sk, 20); hd.position.y = 1.72; person.add(hd);
      for (const z of [-0.1, 0.1]) { const lg = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.75, 4, 8), M.matte(0x2b3242)); lg.position.set(0, 0.45, z); person.add(lg); }
      const armM = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.5, 4, 8), cl); armM.rotation.x = Math.PI / 2; armM.position.set(0, 1.35, -0.3); person.add(armM); }
    person.rotation.y = 0;
    const aPush = force(HEX.force, 0.02, 0.1), aHold = force(HEX.field, 0.02, 0.1); gL.add(aPush, aHold);
    const lLock = stage.label('', [0, 0, 0], gL, 'hot'); lLock.element.style.setProperty('--c', COL.field);
    const lPush = stage.label('', [0, 0, 0], gL, 'hot'); lPush.element.style.setProperty('--c', COL.force);
    const dr = { ang: 0 };

    return {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lNorth, lContact, lEM, lArm, lCore]);
        show(s.focus);

        if (s.focus === 'wire') {
          const I = s.I, k = Math.abs(I) / 20;
          // current dots flow up for positive I
          for (let i = 0; i < 40; i++) { const y = ((i / 40 + time * 0.25 * Math.sign(I) * Math.min(1, k * 3)) % 1 + 1) % 1; wDots.place(i, 0, y * 9.5, 0, I === 0 ? 0 : 1); } wDots.done();
          if (wKey !== I) {
            wKey = I;
            const ls = [];
            if (I !== 0) [1.4, 2.3, 4.2, 5.4].forEach((r) => { const p = []; for (let j = 0; j <= 72; j++) { const t = (j / 72) * TAU * Math.sign(I); p.push([r * Math.cos(t), CY + 0.35, -r * Math.sin(t)]); } ls.push(p); });
            wLines.set(ls, 0.1);
            wSeeds.forEach(([x, z, a0], i) => { const r2 = x * x + z * z, B = (2e-7 * Math.abs(I)) / (Math.sqrt(r2) * 0.01); const ang = B > 5e-5 ? Math.atan2(x, z) : a0; wFil.place(i, [x, CY + 0.02, z], [0, ang, 0], 1); wFil.tint(i, clamp(B / 3e-4, 0, 1)); });
            wFil.done(); if (wFil.instanceColor) wFil.instanceColor.needsUpdate = true;
          }
          wLines.setOpacity(0.25 + 0.65 * Math.min(1, k * 2));
          wComp.forEach((c) => { const x = c.position.x, z = c.position.z, r = Math.hypot(x, z), B = (2e-7 * I) / (r * 0.01); c.pointTo((B * z) / r, (-B * x) / r - B_EARTH_H, dt, 6); });
          curl.visible = I !== 0; curl.rotation.y = I >= 0 ? 0 : Math.PI; curl.scale.y = I >= 0 ? 1 : -1;
          // tip of the curled arrow: end of the arc, pointing along the circulation
          const e = TAU * 0.78; tip.position.set(1.1 * Math.cos(e), 0, -1.1 * Math.sin(e)); tip.rotation.set(0, 0, 0); tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-Math.sin(e), 0, -Math.cos(e)));
          aI.aim([0, I >= 0 ? 8.4 : 10.4, 0], [0, Math.sign(I) || 1, 0], I === 0 ? 0 : 1.8); aI.position.x = 0.6;
          lWI.position.set(1.4, 9.8, 0); lWI.element.innerHTML = I === 0 ? 'no current' : `current <b>${Math.abs(I)} A</b> ${I > 0 ? 'up' : 'down'}`;
          const B3 = (2e-7 * Math.abs(I)) / 0.032;
          lWB.position.set(3.2, CY + 0.9, 3.6); lWB.element.innerHTML = `field 3.2 cm away <b>${fmtB(B3)}</b>`;
        }

        if (s.focus === 'coil') {
          const B = coilB(s), turnsVis = clamp(Math.round(s.turns / 20), 6, 45);
          if (turnsVis !== coilTurns) { if (coilMesh) { gC.remove(coilMesh); coilMesh.geometry.dispose(); } coilTurns = turnsVis; coilMesh = spring(-4.8, 4.8, 1.45, 0.09, turnsVis, copper()); coilMesh.position.y = CYc; gC.add(coilMesh); }
          core.visible = s.core;
          for (let i = 0; i < 60; i++) { const t = ((i / 60 + time * 0.08 * Math.min(1, s.amps)) % 1), a = t * turnsVis * TAU; cDots.place(i, -4.8 + 9.6 * t, CYc + 1.45 * Math.cos(a), 1.45 * Math.sin(a), s.amps > 0 ? 1 : 0); } cDots.done();
          const kk = `${s.turns}|${s.amps}|${s.core}`;
          if (kk !== cKey) {
            cKey = kk;
            const nL = B <= 0 ? 0 : clamp(Math.round(3 + 2.2 * Math.log10(B / 1e-4)), 2, 12);
            const poles = [{ a: 5, b: 0, q: 1 }, { a: -5, b: 0, q: -1 }];
            const field = (a, b) => poleField(poles, a, b), stop = (a, b) => Math.hypot(a + 5, b) < 0.4;
            const ls = [];
            for (let i = 0; i < nL; i++) {
              const side = i % 2 ? -1 : 1, k2 = Math.floor(i / 2), nn = Math.ceil(nL / 2);
              const al = ((92 + (78 * (k2 + 0.5)) / nn) * Math.PI) / 180, h = side * Math.min(1.1, 0.25 + k2 * 0.2);
              // outside: leave the N end at angle al from the axis and loop round to the S end
              const out = traceLine(field, 5 + 0.4 * Math.cos(al), side * 0.4 * Math.sin(al), { stop, box: [-20, 22, -14, 14], max: 900, step: 0.12 });
              ls.push(out.map(([a, b]) => [a, CYc + b, 0]));
              ls.push([[-5, CYc + h, 0], [0, CYc + h, 0], [5, CYc + h, 0]].map((p, j, arr) => p));
            }
            // make the inside lines dense enough for the head to sit in the middle
            ls.forEach((L, i) => { if (L.length === 3) { const a = L[0], b = L[2]; ls[i] = Array.from({ length: 20 }, (_, j) => [a[0] + (b[0] - a[0]) * j / 19, a[1], a[2]]); } });
            cLines.set(ls, 0.5);
            cLines.visible = nL > 0;
          }
          cLines.setOpacity(B > 0 ? clamp(0.35 + 0.2 * Math.log10(B / 1e-3), 0.3, 0.95) : 0);
          lCN.position.set(6.3, CYc + 2.2, 0.2); lCS.position.set(-6.3, CYc + 2.2, 0.2); lCN.visible = lCS.visible = B > 0;
          // clips: the ones the magnet can hold hang from the N end in a little chain
          const F = pullFlat(B, COIL.area) * 0.002, can = clamp(Math.floor(F / (0.5e-3 * G0)), 0, clips.length);
          clipHold = approach(clipHold, can, 3, dt);
          clips.forEach((c, i) => {
            const held = i < Math.round(clipHold);
            if (held) { const row = i % 4, col = Math.floor(i / 4); c.position.set(6.2 + col * 0.5, CYc - 0.3 - row * 0.5, -0.6 + (i % 3) * 0.5); c.rotation.set(0.2 * Math.sin(time * 2 + i), 0, Math.PI / 2); }
            else { const [x, a, z] = clipSeeds[i]; c.position.set(x, 0.25, z); c.rotation.set(Math.PI / 2, 0, a); }
          });
          lCB.position.set(0, CYc + 3.2, 0); lCB.element.innerHTML = `inside: <b>${fmtB(B)}</b>`;
          lCore.position.set(-3, CYc - 2.2, 1.8); lCore.element.textContent = s.core ? 'soft-iron core' : 'air core';
        }

        if (s.focus === 'crane') {
          cr.t += dt;
          const ph = (cr.t % 12) / 12;
          // magnet height: down onto the car, hold, up high, hold, down again
          const low = CAR_TOP + 0.21, high = 4.2;
          const hY = ph < 0.2 ? high + (low - high) * (ph / 0.2) : ph < 0.35 ? low : ph < 0.55 ? low + (high - low) * ((ph - 0.35) / 0.2) : ph < 0.85 ? high : high;
          lift.position.set(cr.carX, hY, 0);
          cable.position.set(cr.carX, (6.2 + hY + 0.9) / 2, 0); cable.scale.y = Math.max(0.01, 6.2 - hY - 0.9);
          const on = s.power && s.crane > 0, F = on ? craneF(s.crane) : 0, W = CRANE.car * G0;
          if (!cr.held && on && F > W && hY <= low + 0.02) cr.held = true;
          if (cr.held && (!on || F <= W)) cr.held = false;
          if (cr.held) { cr.carY = hY - 0.21 - CAR_TOP; cr.carV = 0; }
          else { cr.carV -= G0 * dt; cr.carY = Math.max(0, cr.carY + cr.carV * dt); if (cr.carY === 0) cr.carV = 0; }
          car.position.set(cr.carX, cr.carY, 0);
          discGlow.material.opacity = on ? 0.25 + 0.6 * (s.crane / 100) : 0.02;
          aKF.aim([cr.carX + 1.2, hY - 0.1, 0.8], [0, 1, 0], on ? 0.3 + 1.2 * (F / 15000) : 0);
          aKW.aim([cr.carX + 1.5, cr.carY + 0.9, 0.8], [0, -1, 0], 0.3 + 1.2 * (W / 15000));
          lKF.position.set(cr.carX + 2.3, hY + 0.3, 0.8); lKF.element.innerHTML = on ? `magnet pull <b>${fmtN(F)}</b>` : 'power off';
          lKW.position.set(cr.carX + 2.6, cr.carY + 0.6, 0.8); lKW.element.innerHTML = `car weight <b>${fmtN(W)}</b>`;
        }

        if (s.focus === 'bell') {
          const slow = 0.1, h = (dt * slow) / 10;
          const w0 = TAU * 15, closed = bl.th < 0.03;
          const on = s.ring && closed;
          // armature: a stiff spring (≈15 Hz) and the magnet's pull while the contact is closed; time slowed 10×
          for (let i = 0; i < 10; i++) {
            const a = -w0 * w0 * bl.th - 20 * bl.w + (s.ring && bl.th < 0.03 ? 9000 : 0);
            bl.w += a * h; bl.th += bl.w * h;
            if (bl.th > TH_HIT) { bl.th = TH_HIT; if (bl.w > 0) { bl.w = -0.4 * bl.w; bl.hits++; bl.flash = 1; } }
            if (bl.th < -0.04) { bl.th = -0.04; bl.w = Math.abs(bl.w) * 0.3; }
          }
          arm.rotation.z = bl.th;
          bl.flash = Math.max(0, bl.flash - dt * 4);
          gong.scale.setScalar(1 + bl.flash * 0.03);
          spark.visible = on && Math.sin(time * 40) > 0;
          bCoils.forEach((c) => { c.cyl.material.emissive = new THREE.Color(on ? 0x663300 : 0x000000); });
          btn.position.z = s.ring ? 0.15 : 0.3;
          lBell.position.set(-1.5, 12.6, 0); lBell.element.innerHTML = !s.ring ? 'button up: silent' : on ? 'contact closed: <b>magnet pulls</b>' : 'contact open: <b>spring pulls back</b>';
        }

        if (s.focus === 'lock') {
          const hold = s.lock ? LOCK.F : 0, friction = 20, opens = s.push > hold + friction;
          dr.ang = approach(dr.ang, opens ? 1.1 : 0, opens ? 1.6 : 3, dt);
          hinge.rotation.y = dr.ang;
          led.material.color.setHex(s.lock ? 0xff3b30 : 0x3bff6a);
          person.position.set(0.55, 0, 0.62 - (dr.ang / 1.1) * 0.5);
          aPush.aim([0.7, 1.35, 0.5], [0, 0, -1], 0.08 + 0.4 * (s.push / 4000));
          aHold.aim([0.55, 2.15, 0.25], [0, 0, 1], s.lock && !opens ? 0.08 + 0.4 * (hold / 4000) : 0);
          lLock.position.set(0.25, 2.3, 0.2); lLock.element.innerHTML = !s.lock ? 'power off: <b>unlocked</b>' : opens ? '<b>overpowered</b>' : `holds <b>${fmtN(hold)}</b>`;
          lPush.position.set(1.1, 1.35, 0.5); lPush.element.innerHTML = `push <b>${fmtN(s.push)}</b>`;
        }
      },
      readout: (s) => {
        if (s.focus === 'coil') {
          const B = coilB(s), air = (MU0 * s.turns * s.amps) / COIL.L, F = pullFlat(B, COIL.area);
          return `<div class="big">B inside = ${fmtB(B)}</div>
            <div class="row"><span>n = turns ÷ length</span><b>${s.turns} ÷ 0.10 m = ${(s.turns / 0.1).toLocaleString('en-IN')} /m</b></div>
            <div class="row"><span>μ₀ n I (air core)</span><b>${fmtB(air)}</b></div>
            <div class="row"><span>With the iron core</span><b>${s.core ? fmtB(B) + ` (×${air > 0 ? Math.round(B / air) : 0})` : 'core out'}</b></div>
            <div class="row"><span>Pull on a flat iron plate at the end</span><b>${fmtN(F)} (${asWeight(F)})</b></div>
            <small>Soft iron saturates near 1.6 T. Pull = B² A ÷ 2μ₀ for the 1.5 cm-radius end; paperclips are illustrative.</small>`;
        }
        if (s.focus === 'crane') {
          const on = s.power && s.crane > 0, F = on ? craneF(s.crane) : 0, W = CRANE.car * G0, B = on ? CRANE.Bmax * s.crane / 100 : 0;
          return `<div class="big">${!on ? 'Power off: the car drops' : F > W ? 'Holds the car' : 'Too weak: can’t lift it'}</div>
            <div class="row"><span>Field at the magnet face</span><b>${fmtB(B)}</b></div>
            <div class="row"><span>Ideal pull on thick steel plate</span><b>${fmtN(pullFlat(B, CRANE.A))}</b></div>
            <div class="row"><span>Real pull on a crumpled car (≈4%)</span><b>${fmtN(F)}</b></div>
            <div class="row"><span>Car’s weight (700 kg)</span><b>${fmtN(W)}</b></div>
            <div class="row"><span>Coil power</span><b>${on ? (CRANE.P * (s.crane / 100) ** 2 / 1000).toFixed(1) : 0} kW</b></div>
            <small>1.5 m lifting magnet. Pull grows as current² until the iron saturates. Air gaps in scrap cost most of the pull.</small>`;
        }
        if (s.focus === 'bell') {
          return `<div class="big">${s.ring ? 'Ring, break, ring, break…' : 'Press the button'}</div>
            <div class="row"><span>Battery</span><b>6 V</b></div>
            <div class="row"><span>Coil current, contact closed</span><b>${s.ring ? '≈ 0.4 A' : '0 A'}</b></div>
            <div class="row"><span>Strikes a second (real bell)</span><b>about 15</b></div>
            <div class="row"><span>Shown</span><b>10× slower</b></div>
            <small>The armature breaks its own circuit at the contact screw, so it buzzes back and forth as long as you press.</small>`;
        }
        if (s.focus === 'lock') {
          const B = Math.sqrt((2 * MU0 * LOCK.F) / LOCK.A), opens = s.push > (s.lock ? LOCK.F : 0) + 20;
          return `<div class="big">${opens ? 'Door opens' : 'Door stays shut'}</div>
            <div class="row"><span>Holding force (powered)</span><b>${fmtN(LOCK.F)} ≈ ${asWeight(LOCK.F)}</b></div>
            <div class="row"><span>Field across the plate</span><b>≈ ${fmtB(B)}</b></div>
            <div class="row"><span>Power drawn</span><b>${s.lock ? `${LOCK.V} V × ${LOCK.I} A = ${LOCK.V * LOCK.I} W` : '0 W'}</b></div>
            <div class="row"><span>Your push</span><b>${fmtN(s.push)}</b></div>
            <small>A typical “600 lb” maglock. B from F = B² A ÷ 2μ₀ over 72 cm². No power, no hold: it fails safe in a fire.</small>`;
        }
        const B3 = (2e-7 * Math.abs(s.I)) / 0.032;
        return `<div class="big">${s.I === 0 ? 'No current: compasses point north' : `${fmtB(B3)} at 3.2 cm`}</div>
          <div class="row"><span>B = μ₀ I ÷ (2π r)</span><b>${Math.abs(s.I)} A, r = 3.2 cm</b></div>
          <div class="row"><span>Earth’s field (north)</span><b>40 µT</b></div>
          <div class="row"><span>Swing of the compass north of the wire</span><b>${Math.round((Math.atan2(B3, B_EARTH_H) * 180) / Math.PI)}°</b></div>
          <div class="row"><span>Field goes round</span><b>${s.I === 0 ? 'no field' : s.I > 0 ? 'anticlockwise from above' : 'clockwise from above'}</b></div>
          <small>Compasses north and south of the wire swing furthest; east and west ones just point harder north, or flip.</small>`;
      },
    };
  },
};
