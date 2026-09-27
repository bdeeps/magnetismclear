// Chapter 4: magnets inside machines. Five scenes.
// 1. MRI (1 unit = 1 m). A superconducting solenoid of niobium–titanium wire at 4.2 K (liquid helium)
//    makes 1.5 or 3 T along the bore. Protons precess at the Larmor frequency, 42.577 MHz per tesla
//    (CODATA γp/2π), so 63.9 MHz at 1.5 T. Earth's field taken as 50 µT for the comparison.
// 2. The magnetron of a microwave oven (1 unit = 1 mm). Cathode radius 1.5 mm, anode vane tips at 4 mm,
//    about 4 kV between them, and an axial field of 0.17–0.2 T from two ring magnets (typical of
//    2M246-type oven magnetrons; see MicrowaveClear). Electrons are traced with the Lorentz force
//    F = −e (E + v × B), E = V ÷ (r ln(ra ÷ rc)) (coaxial). Above the Hull cut-off
//    Bc = √(8 m V ÷ e) ÷ (ra (1 − rc² ÷ ra²)) ≈ 0.12 T they can no longer reach the anode by themselves
//    and swirl round the cathode, where they feed the 2.45 GHz oscillation (Hull 1921; Collins 1948).
//    Each electron is restarted from rest when it lands back on the cathode (secondary emission).
// 3. A guitar pickup (1 unit = 1 cm): alnico pole pieces under steel strings in a coil of about
//    8,000 turns. The magnet magnetises the string; its wiggle changes the flux in the coil and
//    Faraday's law makes a voltage of a few hundred millivolts (see GuitarClear, FaradayClear).
// 4. A transformer (1 unit = 1 cm): a laminated iron core of 10 cm² section at 1.2 T peak, 50 Hz.
//    Volts per turn = 4.44 f A B = 0.27 V (the transformer EMF equation), so 230 V needs about 860 turns
//    and 12 V about 45. Vs ÷ Vp = Ns ÷ Np (ideal). The inverter in UPSClear uses one to step 12 V up.
// 5. Magnetic storage (1 unit = 1 cm): a 3.5-inch (95 mm) hard-disk platter at 7,200 rpm storing about
//    1 terabit per square inch (Seagate / Western Digital data), bits about 25 nm long; a bank card's
//    stripe, ISO/IEC 7811: track 1 at 210 bits per inch, track 2 at 75. HiCo stripes need 2,750 oersted
//    (about 0.27 T) to rewrite; LoCo only 300 Oe (0.03 T), which a strong magnet can reach.
import { THREE, M, box, beam, sphere, torus, latheX, spring, clamp, approach } from '../kit.js';
import {
  TAU, QE, ME, fieldLines, copper, ironMat, dots, board, panelBg, title, axes, dot, line, text, COL, HEX, fitNarrow,
  reelBoards, inReel, focusSwitch, force, fmtB, fmtN, letter, NCOL, SCOL, rng, poleField, traceLine,
} from '../magnetism.js';

const GX = 60, PX = 120, TX = 180, DX = 240;
const VIEWS = {
  mri: { pos: [2.4, 2.6, 4.4], target: [-0.5, 0.9, 0], cx: 0 },
  magnetron: { pos: [GX - 3.5, 5, 37], target: [GX - 4.5, -0.5, 0], cx: GX },
  pickup: { pos: [PX + 5, 8, 10], target: [PX - 1.2, 1.4, 0], cx: PX },
  transformer: { pos: [TX - 2, 7, 30], target: [TX - 4, 4.4, 0], cx: TX },
  storage: { pos: [DX + 2.5, 17, 19], target: [DX + 1.5, 0, -1], cx: DX + 4 },
};
export const LARMOR = 42.577;                                      // MHz per tesla, hydrogen nucleus
// ---------------------------------------------------------------- magnetron electron paths
const MG = { rc: 1.5e-3, ra: 4e-3, V: 4000 };
export const hullB = () => Math.sqrt((8 * ME * MG.V) / QE) / (MG.ra * (1 - (MG.rc / MG.ra) ** 2));
export function electronPaths(B, n = 10, tMax = 2.5e-9) {
  const ln = Math.log(MG.ra / MG.rc), qm = QE / ME, dt = 2e-13, out = [], cs = Math.cos(qm * B * dt), sn = Math.sin(qm * B * dt);
  for (let k = 0; k < n; k++) {
    const a0 = (k / n) * TAU;
    let x = Math.cos(a0) * MG.rc * 1.001, y = Math.sin(a0) * MG.rc * 1.001, vx = 0, vy = 0, hit = false;
    const pts = [[x * 1000, y * 1000]];
    for (let t = 0, i = 0; t < tMax; t += dt, i++) {
      // Boris push: half electric kick, exact magnetic rotation (anticlockwise at ω = eB/m), half kick
      const r = Math.hypot(x, y), Er = MG.V / (r * ln);                    // E points inwards; force on the electron points out
      const ex = qm * Er * (x / r) * dt / 2, ey = qm * Er * (y / r) * dt / 2;
      vx += ex; vy += ey;
      const vx2 = cs * vx - sn * vy, vy2 = sn * vx + cs * vy;
      vx = vx2 + ex; vy = vy2 + ey;
      x += vx * dt; y += vy * dt;
      const r2 = Math.hypot(x, y);
      if (r2 >= MG.ra) { pts.push([x * 1000, y * 1000]); hit = true; break; }
      if (r2 <= MG.rc) { x *= (MG.rc * 1.001) / r2; y *= (MG.rc * 1.001) / r2; vx = 0; vy = 0; }
      if (i % 8 === 0) pts.push([x * 1000, y * 1000]);
    }
    out.push({ pts, hit });
  }
  return out;
}
// Transformer
const TR = { f: 50, A: 1e-3, B: 1.2 };
export const voltsPerTurn = () => 4.44 * TR.f * TR.A * TR.B;

export default {
  id: 'machines',
  short: 'Magnets in machines',
  title: 'Magnets hiding in your machines',
  subtitle: 'Scanners, ovens, guitars, chargers and hard drives all run on magnetic fields.',
  view: VIEWS.mri,
  learn: `<p>An <b>MRI scanner</b> is built round a giant electromagnet. Its coil is made of niobium–titanium wire cooled by liquid helium to −269 °C, where it becomes a <b>superconductor</b> with zero resistance, so the current goes round and round without a battery. It makes <b>1.5 or 3 tesla</b> down the tunnel, tens of thousands of times the Earth's field. The field lines up the hydrogen nuclei in your body, which then wobble at a radio frequency the scanner can listen to (see MRIClear). Loose steel near the magnet can fly in like a missile, which is why you leave everything metal outside.</p>
    <p>A microwave oven's <b>magnetron</b> has two ring magnets that make about <b>0.17 T</b> along its axis. Electrons leaving the hot cathode are bent into curls by the field, so they sweep past a ring of copper cavities instead of flying straight to them. That swirl makes the cavities ring at <b>2.45 GHz</b>, and out come microwaves (see MicrowaveClear).</p>
    <p>An electric guitar's <b>pickup</b> is a magnet wrapped in thousands of turns of wire. The magnet magnetises the steel string above it; when the string wiggles, the field through the coil wiggles too, and that makes a voltage (see GuitarClear, and Faraday's law in FaradayClear).</p>
    <p>A <b>transformer</b> is two coils on one iron ring. Alternating current in the first coil makes a changing field in the iron, which makes a voltage in the second. Change the turns and you change the voltage: V₂ ÷ V₁ = N₂ ÷ N₁. The home inverter in UPSClear uses one to turn 12 V from its battery into 230 V.</p>
    <p><b>Hard drives</b> and the <b>stripe on a bank card</b> store data as tiny magnetised patches, north one way for a 1 and the other way for a 0. A hard disk packs about a trillion bits into a square inch, each about 25 nanometres long.</p>
    <p class="tip"><b>Try it:</b> lower the magnetron's field below 0.12 T and watch the electrons stop curling and crash into the anode. Then change the MRI's field and see the radio frequency change.</p>`,
  terms: [
    { t: 'Superconducting magnet', d: 'A coil cooled until its wire has zero resistance, so a huge current flows forever with no power.' },
    { t: 'Larmor frequency', d: 'How fast nuclei wobble in a field: 42.58 MHz per tesla for hydrogen. MRI listens at it.' },
    { t: 'Magnetron', d: 'A vacuum tube where a magnetic field curls electrons past copper cavities to make microwaves.' },
    { t: 'Pickup', d: 'A magnet in a coil under guitar strings. The moving steel string changes the field and makes a voltage.' },
    { t: 'Transformer', d: 'Two coils on an iron core that change an AC voltage: V₂ ÷ V₁ = N₂ ÷ N₁.' },
    { t: 'Magnetic storage', d: 'Recording data as tiny patches magnetised one way or the other, as on a hard disk or card stripe.' },
    { t: 'Coercivity', d: 'How strong a field it takes to re-magnetise a material. High-coercivity cards resist stray magnets.' },
  ],
  defaults: { focus: 'mri', mriB: 1.5, mB: 0.175, pluck: 1, trans: 'up', disk: true },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'mri', label: 'MRI' }, { v: 'magnetron', label: 'Magnetron' }, { v: 'pickup', label: 'Pickup' }, { v: 'transformer', label: 'Transformer' }, { v: 'storage', label: 'Storage' }] },
    { key: 'mriB', type: 'seg', label: 'MRI: magnet strength', options: [{ v: 0.5, label: '0.5 T' }, { v: 1.5, label: '1.5 T' }, { v: 3, label: '3 T' }, { v: 7, label: '7 T' }], fmt: (v) => v + ' T' },
    { key: 'mB', type: 'range', label: 'Magnetron: magnet field', min: 0, max: 0.3, step: 0.005, ends: ['0 T', '0.3 T'], fmt: (v) => v.toFixed(3) + ' T' },
    { key: 'pluck', type: 'range', label: 'Pickup: how hard you pluck', min: 0, max: 1, step: 0.05, ends: ['silent', 'hard'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'trans', type: 'seg', label: 'Transformer', options: [{ v: 'down', label: '230 V → 12 V' }, { v: 'up', label: '12 V → 230 V (inverter)' }] },
    { key: 'disk', type: 'toggle', label: 'Storage: disk spinning' },
  ],
  onChange(s, key) {
    if (key === 'mriB') s.focus = 'mri';
    if (key === 'mB') s.focus = 'magnetron';
    if (key === 'pluck') s.focus = 'pickup';
    if (key === 'trans') s.focus = 'transformer';
    if (key === 'disk') s.focus = 'storage';
  },
  quiz: [
    { q: 'Why is an MRI magnet’s coil cooled with liquid helium?', options: ['To keep the patient cool', 'So the wire becomes a superconductor and carries a huge current with no resistance', 'To make the field point north', 'Helium is magnetic'], answer: 1, why: 'At −269 °C niobium–titanium has zero resistance, so hundreds of amps circulate forever without heating the coil.' },
    { q: 'What does the magnet in a magnetron do?', options: ['Heats the food directly', 'Bends the electrons into curling paths past the copper cavities', 'Stops microwaves leaking out', 'Turns the turntable'], answer: 1, why: 'The field curls the electrons so they swirl past the cavities and make them ring at 2.45 GHz. Too weak a field and they crash straight into the anode.' },
    { q: 'A transformer has 45 turns on one coil and 860 on the other. 12 V AC goes into the 45-turn coil. Roughly what comes out?', options: ['12 V', '0.6 V', '230 V', '860 V'], answer: 2, why: 'V₂ = V₁ × N₂ ÷ N₁ = 12 × 860 ÷ 45 ≈ 230 V. That is how an inverter makes mains voltage from a battery.' },
  ],
  reel: [
    { ms: 5200, caption: 'A magnetron’s 0.17 T field curls electrons past copper cavities, and out come 2.45 GHz microwaves.', set: { focus: 'magnetron' }, anim: { mB: [0.05, 0.2] }, view: { pos: [GX, 2.5, 14], target: [GX, 0, 0] }, spin: 0 },
    { ms: 4600, caption: 'An MRI magnet makes 1.5 to 3 tesla, tens of thousands of times the Earth’s field.', set: { focus: 'mri', mriB: 3 }, view: { pos: [0.9, 1.9, 2.8], target: [0.4, 1.0, 0] }, spin: 0.4 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gM = new THREE.Group(), gG = new THREE.Group(), gP = new THREE.Group(), gT = new THREE.Group(), gD = new THREE.Group();
    gG.position.x = GX; gP.position.x = PX; gT.position.x = TX; gD.position.x = DX; root.add(gM, gG, gP, gT, gD);
    const show = focusSwitch(stage, { mri: gM, magnetron: gG, pickup: gP, transformer: gT, storage: gD }, VIEWS);

    // ================================================================ MRI (1 unit = 1 m); bore along x
    const MY = 1.05, cut = { phiStart: 0, phiLength: Math.PI * 1.5, seg: 64 };
    const shell = latheX([[-0.8, 0.33], [-0.8, 1.05], [0.8, 1.05], [0.8, 0.33], [-0.8, 0.33]], M.plastic(0xeef1f5, { roughness: 0.4, side: THREE.DoubleSide }), cut); shell.position.y = MY; gM.add(shell);
    const cryo = latheX([[-0.7, 0.42], [-0.7, 0.95], [0.7, 0.95], [0.7, 0.42], [-0.7, 0.42]], M.metal(0x9aa3ad, { roughness: 0.35, side: THREE.DoubleSide }), cut); cryo.position.y = MY; gM.add(cryo);
    const sc = [];
    for (let i = 0; i < 6; i++) { const x = -0.55 + i * 0.22; const c = latheX([[x - 0.06, 0.55], [x - 0.06, 0.66], [x + 0.06, 0.66], [x + 0.06, 0.55], [x - 0.06, 0.55]], M.metal(0xc8773a, { roughness: 0.3, emissive: new THREE.Color(0x221000) }), cut); c.position.y = MY; gM.add(c); sc.push(c); }
    const table = box(2.6, 0.08, 0.5, M.plastic(0xd8dde6)); table.position.set(0.3, MY - 0.2, 0); gM.add(table);
    gM.add(beam([1.4, 0, 0], [1.4, MY - 0.24, 0], 0.12, M.plastic(0xd8dde6)));
    const pat = new THREE.Group(); pat.position.set(0.1, MY - 0.07, 0); gM.add(pat);
    { const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 1.1, 6, 12), M.matte(0x5b8fd6)); body.rotation.z = Math.PI / 2; body.scale.z = 0.8; pat.add(body); const hd = sphere(0.11, M.matte(0xc68b64), 20); hd.position.x = -0.78; pat.add(hd); }
    const mriLines = fieldLines(stage, 0x2aa7c9, { width: 2.2, opacity: 0.85, headSize: 0.09 }); gM.add(mriLines);
    { const ls = []; for (const y of [-0.22, 0, 0.22]) for (const z of [-0.2, 0.2]) ls.push(Array.from({ length: 20 }, (_, i) => [-1.1 + i * (2.2 / 19), MY + y, z]));
      // a few return loops outside the magnet (actively shielded scanners keep these close)
      for (const h of [1.25, 1.55]) { const p = []; for (let i = 0; i <= 40; i++) { const t = Math.PI * (i / 40); p.push([1.1 * Math.cos(t) + 0.0, MY + h * Math.sin(t), -0.7]); } ls.push(p); }
      mriLines.set(ls, 0.5); }
    const lMri = stage.label('', [0, 0, 0], gM, 'hot'); lMri.element.style.setProperty('--c', COL.field);
    const lCoils = stage.label('superconducting coils, −269 °C', [0.2, MY + 0.95, 0.6], gM);
    const spins = dots(40, 0.018, 0xffb547); gM.add(spins);
    const rs = rng(5), spinSeeds = Array.from({ length: 40 }, () => [-0.55 + rs() * 1.2, (rs() - 0.5) * 0.18, (rs() - 0.5) * 0.18, rs() * TAU]);

    // ================================================================ magnetron (1 unit = 1 mm), axis along z
    const anode = new THREE.Group(); gG.add(anode);
    const nV = 8;
    { const ring = new THREE.Mesh(new THREE.RingGeometry(8.5, 10, 64), M.metal(0xc8773a, { roughness: 0.3, side: THREE.DoubleSide })); anode.add(ring);
      for (let i = 0; i < nV; i++) { const a = (i / nV) * TAU; const v = box(4.6, 0.9, 3, M.metal(0xc8773a, { roughness: 0.3 })); v.position.set(Math.cos(a) * 6.3, Math.sin(a) * 6.3, 0); v.rotation.z = a; anode.add(v); }
      const shellA = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 3, 64, 1, true), M.metal(0xc8773a, { roughness: 0.3, side: THREE.DoubleSide })); shellA.rotation.x = Math.PI / 2; anode.add(shellA); }
    const cathode = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4, 24), M.matte(0x8a5236, { emissive: new THREE.Color(0x401808) })); cathode.rotation.x = Math.PI / 2; gG.add(cathode);
    const ringsM = [-1, 1].map((sz) => { const r = new THREE.Mesh(new THREE.TorusGeometry(7, 2, 16, 48), M.plastic(sz > 0 ? NCOL : SCOL, { transparent: true, opacity: sz > 0 ? 0.08 : 0.3, depthWrite: false })); r.position.z = sz * 4.5; gG.add(r); return r; });
    const ePaths = fieldLines(stage, 0xffe066, { width: 2.4, opacity: 0.9, heads: 1, headSize: 0.01 }); gG.add(ePaths);
    const eDots = dots(10, 0.3, 0xfff2a0); gG.add(eDots);
    const lMg = stage.label('', [0, 0, 0], gG, 'hot'); lMg.element.style.setProperty('--c', COL.cur);
    const lCath = stage.label('hot cathode', [0, -3.8, 2], gG), lCav = stage.label('copper cavities ring at 2.45 GHz', [5, 10.8, 0], gG), lMagR = stage.label('ring magnets in front and behind: field out of the screen', [-7.5, -10.2, 4.5], gG);
    let mgKey = null, mgPaths = [];
    const bMark = force(HEX.field, 0.12, 0.8); gG.add(bMark);

    // ================================================================ pickup (1 unit = 1 cm)
    const bob = box(7, 1.0, 1.8, M.plastic(0x1b1b1f)); bob.position.y = 0.5; gP.add(bob);
    const pCoil = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32), copper()); pCoil.scale.set(3.4, 0.7, 0.85); pCoil.position.y = 0.5; gP.add(pCoil);
    const cover = box(7.2, 0.2, 2.0, M.plastic(0x1b1b1f, { transparent: true, opacity: 0.5 })); cover.position.y = 1.1; gP.add(cover);
    const polesP = []; for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.4, 16), M.metal(0x9aa3ad, { roughness: 0.3 })); p.position.set(-2.6 + i * 1.04, 0.6, 0); gP.add(p); polesP.push(p); }
    const strings = []; for (let i = 0; i < 6; i++) { const st = beam([-0.001, 0, -5], [0.001, 0, 5], 0.02 + i * 0.008, M.metal(0xd8dde6, { roughness: 0.25 })); gP.add(st); strings.push(st); }
    const pLines = fieldLines(stage, 0x2aa7c9, { width: 1.8, opacity: 0.7, headSize: 0.25 }); gP.add(pLines);
    const lPick = stage.label('', [0, 0, 0], gP, 'hot'); lPick.element.style.setProperty('--c', COL.cur);
    const lCoilP = stage.label('coil: about 8,000 turns', [3.8, 0.2, 1.4], gP), lPole = stage.label('magnet pole pieces', [-3.6, 1.6, 1.2], gP);
    const tr = []; let pkPh = 0, pkAmp = 0;
    const pBoard = board(gP, 6, 2.6, 700, 300, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Voltage from the pickup', 'mV');
      const { X, Y } = axes(g, w, h, { xMax: 1, yMin: -350, yMax: 350, xTicks: [0, 1], yTicks: [-300, 0, 300], xFmt: () => '', yFmt: (v) => v, x0: 80 });
      line(g, tr.map((v, i) => [i / 119, v]), X, Y, COL.cur, 4);
    }, [3.6, 5.0, -3.5]);
    pBoard.mesh.rotation.set(-0.2, -0.3, 0, 'YXZ');

    // ================================================================ transformer (1 unit = 1 cm)
    const coreT = new THREE.Group(); gT.add(coreT);
    const lam = ironMat();
    [[0, 8.5, 12, 1.6], [0, 0.8, 12, 1.6]].forEach(([x, y, w, h]) => { const b = box(w, h, 3.2, lam); b.position.set(x, y, 0); coreT.add(b); });
    [[-5.2, 4.65], [5.2, 4.65]].forEach(([x, y]) => { const b = box(1.6, 6.1, 3.2, lam); b.position.set(x, y, 0); coreT.add(b); });
    for (let i = 0; i < 9; i++) { const l = box(12.02, 0.02, 0.02, M.matte(0x2b2f38)); l.position.set(0, 8.5, -1.4 + i * 0.35); l.scale.z = 1; coreT.add(l); }
    let coilP = null, coilS = null;
    const lPrim = stage.label('', [0, 0, 0], gT, 'hot'), lSec = stage.label('', [0, 0, 0], gT, 'hot');
    lPrim.element.style.setProperty('--c', COL.cur); lSec.element.style.setProperty('--c', COL.good);
    const flux = dots(60, 0.2, 0x8ef0ff); gT.add(flux);
    const fluxPath = (u) => { const L = [[-5.2, 0.8], [5.2, 0.8], [5.2, 8.5], [-5.2, 8.5]], per = [10.4, 7.7, 10.4, 7.7], tot = 36.2; let d = u * tot; for (let i = 0; i < 4; i++) { if (d <= per[i]) { const A = L[i], B = L[(i + 1) % 4], f = d / per[i]; return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f]; } d -= per[i]; } return L[0]; };
    let trKey = null, fPh = 0;
    const lTrans = stage.label('laminated iron core', [0, 10.0, 1.2], gT);

    // ================================================================ storage (1 unit = 1 cm)
    const hddCase = box(10.2, 0.5, 14.7, M.metal(0x9aa3ad, { roughness: 0.5 })); hddCase.position.set(0, -0.25, 0); gD.add(hddCase);
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(4.75, 4.75, 0.12, 96), M.metal(0xdfe4ea, { roughness: 0.12, metalness: 1 })); platter.position.set(0, 0.1, -2.2); gD.add(platter);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.4, 32), M.metal(0xb9bec8)); hub.position.set(0, 0.25, -2.2); gD.add(hub);
    const bits = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.02, 0.12), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), 120); bits.position.set(0, 0.17, -2.2); gD.add(bits);
    { const o = new THREE.Object3D(), c = new THREE.Color(), r = rng(9); for (let i = 0; i < 120; i++) { const a = (i / 120) * TAU; o.position.set(Math.cos(a) * 3.6, 0, Math.sin(a) * 3.6); o.rotation.set(0, -a + Math.PI / 2, 0); o.updateMatrix(); bits.setMatrixAt(i, o.matrix); c.setHex(r() > 0.5 ? 0xff6a5c : 0x6aa6ff); bits.setColorAt(i, c); } }
    const armD = new THREE.Group(); armD.position.set(3.8, 0.3, 4.2); gD.add(armD);
    armD.add(beam([0, 0, 0], [-0.9, 0.05, -5.2], 0.14, M.metal(0xb9bec8)));
    const head = box(0.35, 0.12, 0.25, M.metal(0x6d7380)); head.position.set(-0.9, 0.0, -5.3); armD.add(head);
    const pivotD = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 24), M.metal(0x6d7380)); armD.add(pivotD);
    const card = new THREE.Group(); card.position.set(8.5, 0.05, 0.5); card.rotation.y = -0.2; gD.add(card);
    { const cb = box(8.56, 0.08, 5.4, M.plastic(0x2f6fd6, { roughness: 0.35 })); card.add(cb); const stripe = box(8.56, 0.01, 1.27, M.matte(0x1b1b1f)); stripe.position.set(0, 0.045, -1.8); card.add(stripe);
      const cb2 = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.015, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), 50); cb2.position.set(0, 0.055, -1.8); card.add(cb2);
      const o = new THREE.Object3D(), c = new THREE.Color(), r = rng(4); let pol = 1; for (let i = 0; i < 50; i++) { pol = r() > 0.4 ? -pol : pol; o.position.set(-4 + i * 0.165, 0, 0); o.updateMatrix(); cb2.setMatrixAt(i, o.matrix); c.setHex(pol > 0 ? 0xff6a5c : 0x6aa6ff); cb2.setColorAt(i, c); }
      const chip = box(1.1, 0.02, 0.85, M.metal(0xd9b35a, { roughness: 0.3 })); chip.position.set(-2.8, 0.05, 0.4); card.add(chip); }
    const lDisk = stage.label('', [0, 0, 0], gD, 'hot'); lDisk.element.style.setProperty('--c', COL.north);
    const lCard = stage.label('stripe: N–S patches, 210 bits per inch', [8.5, 0.6, -2.4], gD), lBits = stage.label('bits drawn hugely enlarged', [-3.6, 0.6, 2.6], gD);
    let spin = 0;

    return {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lCoils, lCath, lCav, lMagR, lCoilP, lPole, lTrans, lCard, lBits]);
        reelBoards([[pBoard, [0.5, 5.4, -2], 0.9]]);
        show(s.focus);

        if (s.focus === 'mri') {
          const B = s.mriB;
          mriLines.setOpacity(clamp(0.35 + B / 6, 0.4, 0.95));
          sc.forEach((c) => { c.material.emissive.setRGB(0.05 + 0.03 * B, 0.03 + 0.015 * B, 0); });
          // precessing protons: shown very much slower
          spinSeeds.forEach(([x, y, z, ph], i) => { const a = ph + time * B * 1.2; spins.place(i, x + 0.1, MY + y + Math.cos(a) * 0.03, z + Math.sin(a) * 0.03, 1); }); spins.done();
          lMri.position.set(0.1, MY + 1.35, 0); lMri.element.innerHTML = `<b>${B} T</b> down the bore`;
        }

        if (s.focus === 'magnetron') {
          if (mgKey !== s.mB) { mgKey = s.mB; mgPaths = electronPaths(s.mB); ePaths.set(mgPaths.map((p) => p.pts.map(([x, y]) => [x, y, 1.6])), 0.5); }
          const u = (time * 0.18) % 1;
          mgPaths.forEach((p, i) => { const k = Math.min(p.pts.length - 1, Math.floor(u * p.pts.length)), q = p.pts[k]; eDots.place(i, q[0], q[1], 1.7, 1); }); eDots.done();
          bMark.aim([-9, -9, 2], [0, 0, 1], s.mB > 0 ? 1 + s.mB * 12 : 0);
          const hit = mgPaths.filter((p) => p.hit).length;
          lMg.position.set(0, 11.6, 0); lMg.element.innerHTML = s.mB < hullB() ? `electrons <b>hit the anode</b>` : `electrons <b>swirl round</b>`;
          ringsM.forEach((r, i) => { r.material.opacity = (i ? 0.04 : 0.12) + (i ? 0.08 : 0.4) * (s.mB / 0.3); });
        }

        if (s.focus === 'pickup') {
          pkAmp = approach(pkAmp, s.pluck, 0.6, dt);
          pkPh += TAU * 2.2 * dt;                                  // a low E string, 82 Hz, shown ~40× slower
          strings.forEach((st, i) => { const x = -2.6 + i * 1.04, a = pkAmp * (i === 0 ? 0.35 : 0.08 / (i + 1)); st.position.set(x + a * Math.sin(pkPh + i), 2.1 + a * 0.5 * Math.cos(pkPh + i), 0); });
          const v = pkAmp * 300 * Math.cos(pkPh);                  // mV, proportional to the string's speed
          tr.push(v); if (tr.length > 120) tr.shift();
          if (Math.round(time * 30) % 2 === 0) pBoard.redraw();
          if (!pLines.userData.done) {
            pLines.userData.done = true;
            const ls = [];
            [-2.6, -1.56, -0.52, 0.52, 1.56, 2.6].forEach((x0) => { for (const d of [-1, 1]) { const p = []; for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI; p.push([x0 + d * 0.35 * Math.sin(t), 1.3 + 1.6 * Math.sin(t * 0.5) , d * 1.2 * (1 - Math.cos(t)) / 2]); } ls.push(p); } });
            pLines.set(ls, 0.4);
          }
          lPick.position.set(0, 3.4, 0); lPick.element.innerHTML = `pickup output <b>${Math.round(Math.abs(pkAmp * 300))} mV</b> peak`;
        }

        if (s.focus === 'transformer') {
          const up = s.trans === 'up', vpt = voltsPerTurn();
          const Np = Math.round((up ? 12 : 230) / vpt), Ns = Math.round((up ? 230 : 12) / vpt);
          if (trKey !== s.trans) {
            trKey = s.trans;
            const drop = (g) => { if (!g) return; gT.remove(g); g.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); };
            drop(coilP); drop(coilS);
            const vis = (n) => clamp(Math.round(n / 25), 3, 34);
            const mk = (n, mat, x) => { const g = new THREE.Group(), m = spring(0, 5.3, 2.0, 0.12, vis(n), mat); m.rotation.z = Math.PI / 2; g.add(m); g.position.set(x, 2.0, 0); gT.add(g); return g; };
            coilP = mk(Np, copper(), -5.2); coilS = mk(Ns, M.metal(0x7bbf6a, { roughness: 0.35 }), 5.2);
          }
          fPh += TAU * 1 * dt;                                     // 50 Hz shown 50× slower
          const dir = Math.cos(fPh);
          for (let i = 0; i < 60; i++) { const u = (((i / 60) + Math.sin(fPh) * 0.08) % 1 + 1) % 1, [x, y] = fluxPath(u); flux.place(i, x, y, 1.75, 0.4 + 0.6 * Math.abs(dir)); } flux.done();
          lPrim.position.set(-9.2, 4.6, 0); lPrim.element.innerHTML = `in: <b>${up ? 12 : 230} V</b>, ${Np} turns`;
          lSec.position.set(9.4, 4.6, 0); lSec.element.innerHTML = `out: <b>${Math.round((up ? 12 : 230) * Ns / Np)} V</b>, ${Ns} turns`;
        }

        if (s.focus === 'storage') {
          if (s.disk) spin += dt * TAU * (7200 / 60) / 400;           // 400× slower
          platter.rotation.y = -spin; bits.rotation.y = -spin; hub.rotation.y = -spin;
          armD.rotation.y = 0.12 + 0.1 * Math.sin(time * 0.7);
          lDisk.position.set(0, 1.6, -2.2); lDisk.element.innerHTML = s.disk ? '<b>7,200 rpm</b> (shown 400× slower)' : 'stopped';
        }
      },
      readout: (s) => {
        if (s.focus === 'magnetron') {
          const v = Math.sqrt((2 * QE * MG.V) / ME), rcy = s.mB > 0 ? (ME * v) / (QE * s.mB) : Infinity, Bc = hullB();
          return `<div class="big">${s.mB < Bc ? 'Too weak: straight to the anode' : 'Electrons swirl: microwaves'}</div>
            <div class="row"><span>Field along the axis</span><b>${s.mB.toFixed(3)} T</b></div>
            <div class="row"><span>Electron speed at 4 kV</span><b>${(v / 1e3).toLocaleString('en-IN', { maximumFractionDigits: 0 })} km/s</b></div>
            <div class="row"><span>Curl radius r = m v ÷ (e B)</span><b>${isFinite(rcy) ? (rcy * 1000).toFixed(2) + ' mm' : 'no curl'}</b></div>
            <div class="row"><span>Hull cut-off field</span><b>${Bc.toFixed(3)} T</b></div>
            <small>Cathode 1.5 mm, anode 4 mm, 4 kV. Paths from the Lorentz force F = −e(E + v × B), about 2.5 ns of flight. Real ovens run at 0.17–0.2 T.</small>`;
        }
        if (s.focus === 'pickup') {
          return `<div class="big">${Math.round(s.pluck * 300)} mV peak</div>
            <div class="row"><span>Magnet</span><b>alnico 5 pole pieces</b></div>
            <div class="row"><span>Coil</span><b>≈ 8,000 turns of 0.06 mm wire</b></div>
            <div class="row"><span>Voltage follows</span><b>how fast the string moves</b></div>
            <small>A magnetised steel string changing the flux in the coil: Faraday’s law (see FaradayClear). Nylon strings would make no signal.</small>`;
        }
        if (s.focus === 'transformer') {
          const up = s.trans === 'up', vpt = voltsPerTurn(), Np = Math.round((up ? 12 : 230) / vpt), Ns = Math.round((up ? 230 : 12) / vpt);
          return `<div class="big">${up ? '12 V → 230 V' : '230 V → 12 V'}</div>
            <div class="row"><span>Volts per turn = 4.44 f A B</span><b>${vpt.toFixed(3)} V</b></div>
            <div class="row"><span>Turns in → out</span><b>${Np} → ${Ns}</b></div>
            <div class="row"><span>V out = V in × N out ÷ N in</span><b>${Math.round((up ? 12 : 230) * Ns / Np)} V</b></div>
            <div class="row"><span>Current out = current in × N in ÷ N out</span><b>× ${(Np / Ns).toFixed(up ? 3 : 1)}</b></div>
            <small>10 cm² iron core at 1.2 T peak, 50 Hz. It only works with changing current: Faraday’s law (FaradayClear). The inverter in UPSClear steps up like this.</small>`;
        }
        if (s.focus === 'storage') {
          return `<div class="big">Bits as tiny magnets</div>
            <div class="row"><span>Hard disk platter</span><b>95 mm, 7,200 rpm</b></div>
            <div class="row"><span>Data density</span><b>≈ 1 terabit per sq. inch</b></div>
            <div class="row"><span>One bit</span><b>≈ 25 nm long</b></div>
            <div class="row"><span>Card stripe, track 1</span><b>210 bits per inch</b></div>
            <div class="row"><span>Field to wipe a HiCo / LoCo stripe</span><b>≈ 0.27 T / 0.03 T</b></div>
            <small>A strong magnet rubbed on a LoCo stripe can scramble it. The chip on the card is not magnetic at all.</small>`;
        }
        const B = s.mriB;
        return `<div class="big">${B} T: ${Math.round(B / 50e-6).toLocaleString('en-IN')} × Earth</div>
          <div class="row"><span>Earth’s field</span><b>≈ 50 µT</b></div>
          <div class="row"><span>Hydrogen “radio” frequency, 42.58 MHz × B</span><b>${(LARMOR * B).toFixed(1)} MHz</b></div>
          <div class="row"><span>Coil wire</span><b>niobium–titanium at 4.2 K</b></div>
          <div class="row"><span>Power to keep the field</span><b>none: superconducting</b></div>
          <small>Most hospital scanners are 1.5 or 3 T; 7 T is used in research. See MRIClear for how the image is made.</small>`;
      },
    };
  },
};
