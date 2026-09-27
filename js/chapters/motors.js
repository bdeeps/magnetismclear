// Chapter 3: the motor effect. Three scenes, all with 1 unit = 1 cm.
// 1. A copper rod rolls on two rails between the poles of a horseshoe magnet. Force on a current in a
//    field: F = B I L (the Lorentz force on the moving charges; Griffiths ch. 5), at right angles to both
//    the field and the current: Fleming's left-hand rule. Rod: 5 cm between rails, 20 g. Motion shown
//    4× slower. Field only between the 6 cm-wide pole faces (fringing ignored).
// 2. A simple DC motor: a 50-turn rectangular coil, 4 cm long sides, 3 cm wide, turning in a field
//    B between two magnets. Force on each long side F = N B I L; torque τ = 2 r N B I L |cos α| once
//    the split-ring commutator flips the current every half turn. Back-EMF E = k ω, I = (V − E) ÷ R with
//    R = 2 Ω. The speed uses the torque averaged over a turn (2/π of the peak); a toy motor like this
//    runs at a few thousand rpm. The picture turns 100× slower.
// 3. A loudspeaker. A voice coil sits in a 1 T magnetic gap; the "force factor" Bl ≈ 6 T·m is typical
//    of a 16 cm (6.5 inch) woofer (Thiele–Small data, e.g. manufacturer spec sheets). Moving mass 15 g,
//    suspension stiffness 1,250 N/m (compliance 0.8 mm/N), mechanical Q 0.7 → resonance ≈ 46 Hz.
//    Excursion x = Bl I ÷ |k − m ω² + i c ω|. The cone's motion is shown 20× slower.
import { THREE, M, box, beam, sphere, torus, latheX, clamp, approach } from '../kit.js';
import {
  TAU, G0, fieldLines, copper, ironMat, dots, board, panelBg, title, axes, dot, line, text, COL, HEX, fitNarrow,
  reelBoards, inReel, focusSwitch, force, fmtB, fmtN, asWeight, letter, NCOL, SCOL,
} from '../magnetism.js';

const MX = 40, SX = 80;
const VIEWS = {
  rail: { pos: [5, 8, 15], target: [-2.2, 2.2, 0], cx: 0 },
  motor: { pos: [MX - 1, 6, 18], target: [MX - 2, 1.6, 0], cx: MX + 1.2 },
  speaker: { pos: [SX - 5, 12, 19], target: [SX - 2.5, 6.4, 0], cx: SX + 1 },
};
// Rod on rails
const ROD = { L: 0.05, m: 0.02 };
export const railF = (s) => s.B * s.I * ROD.L;
// DC motor constants
const MOT = { N: 50, L: 0.04, r: 0.015, R: 2, J: 4e-6, tf: 5e-4 };
export const motK = (B) => 2 * MOT.r * MOT.N * B * MOT.L;        // peak torque per amp, and back-EMF per rad/s
// Speaker
const SPK = { Bl: 6, m: 0.015, k: 1250, Q: 0.7 };
SPK.c = Math.sqrt(SPK.k * SPK.m) / SPK.Q;
export const spkX = (f, I) => { const w = TAU * f; return (SPK.Bl * I) / Math.hypot(SPK.k - SPK.m * w * w, SPK.c * w); };

export default {
  id: 'motors',
  short: 'Motors and speakers',
  title: 'A current in a field feels a push',
  subtitle: 'F = B I L. Spin it round with a commutator and you have a motor; shake it and you have a speaker.',
  view: VIEWS.rail,
  learn: `<p>Put a wire carrying a current inside a magnetic field and the wire gets a <b>push</b>. The push is at <b>right angles</b> to both the field and the current, and its size is</p>
    <p><b>F = B × I × L</b></p>
    <p>where B is the field in tesla, I the current in amps and L the length of wire in the field, in metres. Michael Faraday built the first electric motor on this idea in 1821.</p>
    <p>To remember the directions, use <b>Fleming's left-hand rule</b>. Hold your left thumb, first finger and second finger all at right angles. <b>F</b>irst finger along the <b>F</b>ield (north to south), se<b>C</b>ond finger along the <b>C</b>urrent, and your thu<b>M</b>b shows the <b>M</b>otion.</p>
    <p>A <b>DC motor</b> puts a coil in the field. One side is pushed up, the other down, so the coil turns. After half a turn the pushes would swap and stop it, so a <b>split-ring commutator</b> with two carbon <b>brushes</b> reverses the current in the coil every half turn, and it keeps spinning the same way. As it speeds up the coil also acts as a generator and makes a <b>back-EMF</b> that fights the battery, so the current falls. That is why a motor draws a big current at start-up and much less at full speed.</p>
    <p>You own dozens of these. A mixer grinder's <b>universal motor</b> uses brushes like this and screams along at up to about 22,000 rpm with no load (see MixerClear). A ceiling fan uses an <b>induction motor</b> with no brushes at all (see FanClear). An electric car uses a <b>permanent-magnet motor</b> packed with neodymium magnets (see CarClear). And every <b>loudspeaker</b> and headphone is the same trick backwards and forwards: a coil in a magnet's gap pushes a paper cone in and out with the music, as at the end of a guitar amp (see GuitarClear) or a synth (see SynthClear).</p>
    <p class="tip"><b>Try it:</b> reverse the current on the rails and watch the rod roll the other way. Turn up the motor's voltage and watch the current drop as it speeds up. Then play a low note through the speaker and watch the cone move most near 46 Hz.</p>`,
  terms: [
    { t: 'Motor effect', d: 'A wire carrying current in a magnetic field feels a force at right angles to both.' },
    { t: 'F = B I L', d: 'Force (N) = field (T) × current (A) × length of wire in the field (m).' },
    { t: 'Fleming’s left-hand rule', d: 'First finger: Field. Second finger: Current. Thumb: Motion (force).' },
    { t: 'Commutator', d: 'A split ring on a motor’s shaft that reverses the current in the coil every half turn.' },
    { t: 'Brushes', d: 'Carbon blocks that press on the spinning commutator to carry current into the coil.' },
    { t: 'Back-EMF', d: 'The voltage a spinning motor makes as a generator. It opposes the supply and limits the current.' },
    { t: 'Voice coil', d: 'The light coil in a loudspeaker that sits in the magnet’s gap and drives the cone.' },
  ],
  defaults: { focus: 'rail', B: 0.25, I: 5, V: 3, Bm: 0.3, f: 60, amp: 1 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'rail', label: 'Rod on rails' }, { v: 'motor', label: 'DC motor' }, { v: 'speaker', label: 'Loudspeaker' }] },
    { key: 'B', type: 'range', label: 'Rails: magnet field B', min: 0, max: 0.5, step: 0.01, ends: ['0 T', '0.5 T'], fmt: (v) => v.toFixed(2) + ' T' },
    { key: 'I', type: 'range', label: 'Rails: current I (negative = reversed)', min: -10, max: 10, step: 0.5, ends: ['−10 A', '10 A'], fmt: (v) => v + ' A' },
    { key: 'V', type: 'range', label: 'Motor: battery voltage', min: 0, max: 6, step: 0.1, ends: ['0 V', '6 V'], fmt: (v) => v.toFixed(1) + ' V' },
    { key: 'Bm', type: 'range', label: 'Motor: magnet field', min: 0.1, max: 0.5, step: 0.01, ends: ['0.1 T', '0.5 T'], fmt: (v) => v.toFixed(2) + ' T' },
    { key: 'f', type: 'log', label: 'Speaker: note (frequency)', min: 20, max: 400, ends: ['20 Hz', '400 Hz'], fmt: (v) => Math.round(v) + ' Hz' },
    { key: 'amp', type: 'range', label: 'Speaker: volume (coil current)', min: 0, max: 2, step: 0.05, ends: ['0 A', '2 A'], fmt: (v) => v.toFixed(2) + ' A' },
  ],
  onChange(s, key) {
    if (key === 'B' || key === 'I') s.focus = 'rail';
    if (key === 'V' || key === 'Bm') s.focus = 'motor';
    if (key === 'f' || key === 'amp') s.focus = 'speaker';
  },
  quiz: [
    { q: 'A 10 cm wire carries 2 A across a 0.5 T field. What force does it feel?', options: ['0.1 N', '1 N', '10 N', '0.01 N'], answer: 0, why: 'F = B I L = 0.5 × 2 × 0.1 = 0.1 N.' },
    { q: 'What does the commutator in a DC motor do?', options: ['Makes the magnet stronger', 'Reverses the current in the coil every half turn so it keeps turning one way', 'Cools the coil', 'Stores energy like a battery'], answer: 1, why: 'Without it the forces would flip after half a turn and the coil would rock back and forth instead of spinning.' },
    { q: 'Why does a motor draw most current when it is just starting?', options: ['The brushes are cold', 'It is not yet spinning, so there is no back-EMF to oppose the supply', 'The magnet is weakest at the start', 'It always draws the same current'], answer: 1, why: 'A spinning coil also generates a back-EMF that opposes the battery. At standstill there is none, so I = V ÷ R is at its biggest.' },
  ],
  reel: [
    { ms: 5200, caption: 'Put a coil in the field and flip its current every half turn: a DC motor spins.', set: { focus: 'motor', Bm: 0.3 }, anim: { V: [1, 6] }, view: { pos: [MX + 2, 5, 10], target: [MX + 1.2, 1.8, 0] }, spin: 0.3 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gR = new THREE.Group(), gM = new THREE.Group(), gS = new THREE.Group();
    gM.position.x = MX; gS.position.x = SX; root.add(gR, gM, gS);
    const show = focusSwitch(stage, { rail: gR, motor: gM, speaker: gS }, VIEWS);

    // ================================================================ rod on rails
    const base = box(12, 0.3, 8, M.matte(0x3a3f4b)); base.position.set(0, -0.15, 0); gR.add(base);
    const poleN = box(6, 1.2, 5.6, M.plastic(NCOL)); poleN.position.set(0, 4.6, 0); gR.add(poleN);
    const poleS = box(6, 1.2, 5.6, M.plastic(SCOL)); poleS.position.set(0, 0.6, 0); gR.add(poleS);
    const yokeR = box(6, 5.2, 0.8, ironMat()); yokeR.position.set(0, 2.6, -3.2); gR.add(yokeR);
    const lN = letter('N', 1.1); lN.position.set(0, 4.6, 2.81); gR.add(lN);
    const lS = letter('S', 1.1); lS.position.set(0, 0.6, 2.81); gR.add(lS);
    const RAILY = 1.5;
    const rails = [-2.5, 2.5].map((z) => { const r = beam([-5.5, RAILY, z], [5.5, RAILY, z], 0.12, copper()); gR.add(r); return r; });
    for (const x of [-5.5, 5.5]) for (const z of [-2.5, 2.5]) gR.add(beam([x, 0, z], [x, RAILY, z], 0.1, M.plastic(0x2b2f38)));
    const rodR = new THREE.Group(); gR.add(rodR);
    rodR.add(beam([0, 0, -3], [0, 0, 3], 0.22, M.metal(0xd8a35a, { roughness: 0.3 })));
    const rDots = dots(20, 0.12, 0xffd166); rodR.add(rDots);
    const rLines = fieldLines(stage, 0x2aa7c9, { width: 2, opacity: 0.75, headSize: 0.35 }); gR.add(rLines);
    { const ls = []; for (const x of [-2.4, -0.8, 0.8, 2.4]) for (const z of [-1.6, 1.6]) ls.push(Array.from({ length: 12 }, (_, i) => [x, 4.0 - i * (2.8 / 11), z])); rLines.set(ls, 0.5); }
    const aF = force(HEX.field, 0.06, 0.35), aC = force(HEX.cur, 0.06, 0.35), aMo = force(HEX.force, 0.06, 0.35); gR.add(aF, aC, aMo);
    const lFF = stage.label('', [0, 0, 0], gR, 'hot'), lFC = stage.label('', [0, 0, 0], gR, 'hot'), lFM = stage.label('', [0, 0, 0], gR, 'hot');
    lFF.element.style.setProperty('--c', COL.field); lFC.element.style.setProperty('--c', COL.cur); lFM.element.style.setProperty('--c', COL.force);
    const rr = { x: -2.8, v: 0, wait: 0 };

    // ================================================================ DC motor
    const mBase = box(14, 0.3, 9, M.matte(0x3a3f4b)); mBase.position.set(0, -2.8, 0); gM.add(mBase);
    const shoe = (col, sx) => { const g = new THREE.Group(); const b = box(2.2, 5, 5.2, M.plastic(col)); b.position.x = sx * 3.2; g.add(b); return g; };
    const mN = shoe(NCOL, -1), mS = shoe(SCOL, 1); gM.add(mN, mS);
    const lmN = letter('N', 1.2); lmN.position.set(-3.2, 0, 2.62); gM.add(lmN);
    const lmS = letter('S', 1.2); lmS.position.set(3.2, 0, 2.62); gM.add(lmS);
    for (const sx of [-1, 1]) gM.add(beam([sx * 3.2, -2.65, 0], [sx * 3.2, -2.5, 0], 1.2, M.plastic(0x2b2f38)));
    const mLines = fieldLines(stage, 0x2aa7c9, { width: 1.8, opacity: 0.55, headSize: 0.32 }); gM.add(mLines);
    { const ls = []; for (const y of [-1.8, -0.9, 0, 0.9, 1.8]) for (const z of [-1.8, 1.8]) ls.push(Array.from({ length: 14 }, (_, i) => [-2.1 + i * (4.2 / 13), y, z])); mLines.set(ls, 0.5); }
    const rotor = new THREE.Group(); gM.add(rotor);
    rotor.add(beam([0, 0, -3.2], [0, 0, 5.6], 0.12, M.metal(0xb9bec8)));
    const coilMat = copper();
    const coilPts = [[1.5, 0, -2], [1.5, 0, 2], [-1.5, 0, 2], [-1.5, 0, -2]];
    for (let i = 0; i < 4; i++) rotor.add(beam(coilPts[i], coilPts[(i + 1) % 4], 0.2, coilMat));
    rotor.add(beam([1.5, 0, 2], [0.35, 0, 3.6], 0.08, coilMat), beam([-1.5, 0, 2], [-0.35, 0, 3.6], 0.08, coilMat));
    const halves = [0, 1].map((k) => { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.0, 24, 1, false, k * Math.PI + 0.12, Math.PI - 0.24), M.metal(0xd8a35a, { roughness: 0.3 })); h.rotation.x = Math.PI / 2; h.position.z = 4.1; rotor.add(h); return h; });
    const brushes = [-1, 1].map((sx) => { const b = box(0.7, 0.4, 0.6, M.matte(0x222222)); b.position.set(sx * 0.8, 0, 4.1); gM.add(b); gM.add(beam([sx * 1.15, 0, 4.1], [sx * 2.8, -2.6, 4.1], 0.06, copper())); return b; });
    const batt = new THREE.Group(); batt.position.set(0, -2.1, 5.8); gM.add(batt);
    { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3.2, 24), M.plastic(0x2b2f38)); c.rotation.z = Math.PI / 2; batt.add(c); const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.9, 24), M.plastic(0xd9a441)); cap.rotation.z = Math.PI / 2; cap.position.x = 1.2; batt.add(cap); }
    gM.add(beam([-2.8, -2.6, 4.1], [-1.6, -2.1, 5.8], 0.06, copper()), beam([2.8, -2.6, 4.1], [1.6, -2.1, 5.8], 0.06, copper()));
    const mDots = dots(36, 0.13, 0xffd166); rotor.add(mDots);
    const aUp = force(HEX.force, 0.07, 0.4), aDn = force(HEX.force, 0.07, 0.4); gM.add(aUp, aDn);
    const lTorque = stage.label('', [0, 0, 0], gM, 'hot'); lTorque.element.style.setProperty('--c', COL.force);
    const lComm = stage.label('commutator and brushes', [1.8, 1.0, 4.3], gM);
    const mo = { w: 0, a: 0.3 };
    let torquePlot = null;
    const tBoard = board(gM, 6.4, 3.4, 700, 372, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Turning force round one turn');
      const { X, Y } = axes(g, w, h, { xMax: 360, yMax: 1.1, yMin: 0, xTicks: [0, 90, 180, 270, 360], yTicks: [0, 0.5, 1], xFmt: (v) => v + '°', yFmt: (v) => (v === 1 ? 'max' : v === 0 ? '0' : '½'), x0: 70, xLabel: 'coil angle' });
      const pts = []; for (let a = 0; a <= 360; a += 3) pts.push([a, Math.abs(Math.cos((a * Math.PI) / 180))]);
      line(g, pts, X, Y, COL.force, 4);
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(X(0), Y(2 / Math.PI)); g.lineTo(X(360), Y(2 / Math.PI)); g.stroke(); g.setLineDash([]);
      text(g, 'average', X(292), Y(2 / Math.PI) - 8, 'rgba(255,255,255,.6)', '15px sans-serif');
      text(g, 'dead spots: coil upright', X(60), Y(0.06) - 4, 'rgba(255,255,255,.55)', '15px sans-serif');
      if (torquePlot !== null) { const a = ((torquePlot * 180) / Math.PI % 360 + 360) % 360; dot(g, X(a), Y(Math.abs(Math.cos(torquePlot))), COL.hot, 9); }
    }, [6.4, 5.4, -2.5]);
    tBoard.mesh.rotation.y = -0.25;
    let tTick = 0;

    // ================================================================ loudspeaker (axis along x, cone opens to +x)
    const half = { phiStart: 0, phiLength: Math.PI * 1.5 };
    const frame = latheX([[-1.8, 0], [-1.8, 3.2], [-0.4, 3.2], [-0.4, 1.2], [-0.2, 1.2], [-0.2, 0]], M.metal(0x6d7380, { roughness: 0.5 }), half); gS.add(frame);
    const magnetRing = latheX([[-1.5, 1.35], [-1.5, 3.1], [-0.5, 3.1], [-0.5, 1.35], [-1.5, 1.35]], M.matte(0x3a3a3f), half); gS.add(magnetRing);
    const poleP = latheX([[-1.8, 0.001], [-1.8, 1.0], [0.3, 1.0], [0.3, 0.001]], ironMat(), half); gS.add(poleP);
    const topPlate = latheX([[-0.5, 1.25], [-0.5, 3.2], [-0.2, 3.2], [-0.2, 1.25], [-0.5, 1.25]], ironMat(), half); gS.add(topPlate);
    const basket = latheX([[-0.2, 3.2], [4.2, 6.2], [4.3, 6.2], [-0.1, 3.3]], M.metal(0x9aa3ad, { roughness: 0.45, side: THREE.DoubleSide }), { phiStart: 0, phiLength: Math.PI * 1.5, seg: 48 }); gS.add(basket);
    const moving = new THREE.Group(); gS.add(moving);
    gS.position.y = 6.5; gS.rotation.y = -0.75;          // turn the speaker so it half faces you
    const vcoil = latheX([[-0.6, 1.08], [-0.6, 1.2], [0.8, 1.2], [0.8, 1.08]], M.metal(0xc8773a, { roughness: 0.3, emissive: new THREE.Color(0x331800) }), half); moving.add(vcoil);
    const cone = latheX([[0.7, 1.15], [1.5, 2.0], [2.8, 3.6], [3.9, 5.2]], M.matte(0x2b2b30, { side: THREE.DoubleSide }), { phiStart: 0, phiLength: Math.PI * 1.5, seg: 64 }); moving.add(cone);
    const dust = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 12, 0, Math.PI * 1.5, 0, 1.0), M.matte(0x3a3a42, { side: THREE.DoubleSide })); dust.rotation.z = -Math.PI / 2; dust.position.x = 0.1; moving.add(dust);
    const surround = new THREE.Mesh(new THREE.TorusGeometry(5.55, 0.35, 10, 48, Math.PI * 1.5), M.matte(0x1b1b1f)); surround.rotation.y = Math.PI / 2; surround.position.x = 4.0; gS.add(surround);
    const gapGlow = latheX([[-0.5, 1.02], [-0.5, 1.24], [-0.2, 1.24], [-0.2, 1.02]], M.glow(0x8ef0ff, { transparent: true, opacity: 0.5 }), half); gS.add(gapGlow);
    const air = dots(8 * 14, 0.09, 0xcfe8ff, 6, 0.7); gS.add(air);
    const aSp = force(HEX.force, 0.06, 0.35); gS.add(aSp);
    const lGap = stage.label('1 T in the gap', [-0.6, 2.2, 3.4], gS), lVC = stage.label('voice coil', [0.4, -1.9, 1.2], gS), lCone = stage.label('paper cone', [2.6, -3.6, 1.8], gS), lMag = stage.label('ring magnet', [-1.2, -3.5, 1.4], gS);
    const lSp = stage.label('', [0, 0, 0], gS, 'hot'); lSp.element.style.setProperty('--c', COL.force);
    let sPh = 0;

    return {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lComm, lGap, lVC, lCone, lMag]);
        reelBoards([[tBoard, [1.2, 6.4, -2], 0.95]]);
        show(s.focus);

        if (s.focus === 'rail') {
          const F = railF(s), a = F / ROD.m;              // m/s²
          const under = Math.abs(rr.x) < 3;
          if (rr.wait > 0) { rr.wait -= dt; if (rr.wait <= 0) { rr.x = F >= 0 ? -2.8 : 2.8; rr.v = 0; } }
          else {
            const slow = 0.25, h = dt * slow;
            rr.v += ((under ? a : 0) * 100 - 30 * Math.sign(rr.v) * (Math.abs(rr.v) > 0.5 ? 1 : 0) - 2 * rr.v) * h;   // cm/s
            if (Math.abs(F) < 1e-4) rr.v = approach(rr.v, 0, 3, dt);
            rr.x += rr.v * h;
            if (Math.abs(rr.x) > 5) { rr.x = clamp(rr.x, -5, 5); rr.v = 0; rr.wait = 0.8; }
          }
          rodR.position.set(rr.x, RAILY + 0.34, 0);
          for (let i = 0; i < 20; i++) { const u = (((i / 20 + time * 0.3 * Math.sign(s.I)) % 1) + 1) % 1; rDots.place(i, 0, 0, -2.5 + 5 * u, s.I === 0 ? 0 : 1); } rDots.done();
          const x0 = rr.x, y0 = RAILY + 0.34;
          aF.aim([x0, y0 + 1.6, 3.4], [0, -1, 0], s.B > 0 ? 1.4 : 0);
          aC.aim([x0, y0, 3.2], [0, 0, Math.sign(s.I) || 1], s.I !== 0 ? 1.4 : 0);
          aMo.aim([x0, y0, 3.4], [Math.sign(F) || 1, 0, 0], Math.abs(F) > 1e-4 && under ? 1.4 : 0);
          lFF.position.set(x0 - 0.4, y0 + 2.2, 3.4); lFF.element.innerHTML = '<b>F</b>ield';
          lFC.position.set(x0 - 0.6, y0 - 0.3, 5.0); lFC.element.innerHTML = '<b>C</b>urrent';
          lFM.position.set(x0 + (Math.sign(F) || 1) * 2.0, y0 + 0.4, 3.4); lFM.element.innerHTML = `<b>M</b>otion: ${fmtN(Math.abs(F))}`;
          lFM.visible = Math.abs(F) > 1e-4;
        }

        if (s.focus === 'motor') {
          const k = motK(s.Bm), kav = (2 / Math.PI) * k;
          // real speed from the averaged motor equations, 20 small steps per frame
          for (let i = 0; i < 20; i++) { const I = (s.V - kav * mo.w) / MOT.R, tq = kav * I - (mo.w > 0.01 ? MOT.tf : Math.min(MOT.tf, Math.max(0, kav * I))) - 2e-6 * mo.w; mo.w = Math.max(0, mo.w + (tq / MOT.J) * (dt / 20)); }
          mo.a += (mo.w / 100) * dt;                                       // shown 100× slower
          rotor.rotation.z = mo.a;
          const I = (s.V - kav * mo.w) / MOT.R, ca = Math.cos(mo.a), sa = Math.sin(mo.a);
          const Fs = MOT.N * s.Bm * I * MOT.L;
          // the side on the right (x > 0) always carries current towards the viewer (+z): pushed up
          const pR = ca >= 0 ? [1.5 * ca, 1.5 * sa] : [-1.5 * ca, -1.5 * sa], pL = [-pR[0], -pR[1]];
          aUp.aim([pR[0], pR[1] + 0.25, 0], [0, 1, 0], I > 0.005 ? 0.6 + Fs * 12 : 0);
          aDn.aim([pL[0], pL[1] - 0.25, 0], [0, -1, 0], I > 0.005 ? 0.6 + Fs * 12 : 0);
          // current dots round the coil loop; direction follows the commutator
          const dir = ca >= 0 ? 1 : -1, loop = [[1.5, 0, -2], [1.5, 0, 2], [-1.5, 0, 2], [-1.5, 0, -2]];
          for (let i = 0; i < 36; i++) { const u = ((((i / 36) - time * 0.25 * dir * Math.min(1, I)) % 1) + 1) % 1, seg = Math.floor(u * 4), f = u * 4 - seg, A = loop[seg], B = loop[(seg + 1) % 4]; mDots.place(i, A[0] + (B[0] - A[0]) * f, 0, A[2] + (B[2] - A[2]) * f, I > 0.005 ? 1 : 0); } mDots.done();
          lTorque.position.set(0, 3.4, 0); lTorque.element.innerHTML = `${Math.round((mo.w * 60) / TAU).toLocaleString('en-IN')} rpm`;
          tTick += dt; if (tTick > 0.1) { tTick = 0; torquePlot = mo.a; tBoard.redraw(); }
        }

        if (s.focus === 'speaker') {
          const x = spkX(s.f, s.amp) * 100;                        // cm
          sPh += TAU * (s.f / 20) * dt;                              // 20× slower
          const d = x * Math.sin(sPh);
          moving.position.x = d * 3;                                 // excursion drawn 3× bigger
          aSp.aim([6, 0, 0], [Math.cos(sPh) >= 0 ? 1 : -1, 0, 0], s.amp > 0 ? 0.4 + Math.abs(Math.cos(sPh)) * s.amp * 0.9 : 0);
          // air in front: layers of air pushed back and forth, a travelling wave
          const lam = 8;
          for (let i = 0; i < 14; i++) for (let j = 0; j < 8; j++) {
            const x0 = 5 + i * 0.7, xi = x * 3 * Math.sin(sPh - (TAU * (x0 - 5)) / lam) * Math.exp(-(x0 - 5) / 14);
            air.place(i * 8 + j, x0 + xi, -3.5 + j, 0.2, 1);
          }
          air.done();
          lSp.position.set(3, 6.6, 0); lSp.element.innerHTML = `cone moves <b>± ${(x * 10).toFixed(2)} mm</b>`;
        }
      },
      readout: (s) => {
        if (s.focus === 'motor') {
          const k = motK(s.Bm), kav = (2 / Math.PI) * k, w = mo.w, I = (s.V - kav * w) / MOT.R, E = kav * w;
          return `<div class="big">${Math.round((w * 60) / TAU).toLocaleString('en-IN')} rpm</div>
            <div class="row"><span>Current I = (V − back-EMF) ÷ R</span><b>(${s.V.toFixed(1)} − ${E.toFixed(2)}) ÷ 2 Ω = ${I.toFixed(2)} A</b></div>
            <div class="row"><span>Force on each side, N B I L</span><b>${fmtN(MOT.N * s.Bm * I * MOT.L)}</b></div>
            <div class="row"><span>Average turning force (torque)</span><b>${(kav * I * 1000).toFixed(1)} mN·m</b></div>
            <div class="row"><span>Starting current (not spinning)</span><b>${(s.V / MOT.R).toFixed(2)} A</b></div>
            <small>50-turn coil, 4 cm × 3 cm, R = 2 Ω. Shown 100× slower. Back-EMF grows with speed and chokes the current.</small>`;
        }
        if (s.focus === 'speaker') {
          const x = spkX(s.f, s.amp), F = SPK.Bl * s.amp;
          return `<div class="big">Cone: ± ${(x * 1000).toFixed(2)} mm</div>
            <div class="row"><span>Force F = B l I</span><b>6 T·m × ${s.amp.toFixed(2)} A = ${fmtN(F)}</b></div>
            <div class="row"><span>Note</span><b>${Math.round(s.f)} Hz</b></div>
            <div class="row"><span>Resonance of this woofer</span><b>${(Math.sqrt(SPK.k / SPK.m) / TAU).toFixed(0)} Hz</b></div>
            <div class="row"><span>Moving mass</span><b>15 g</b></div>
            <small>A 16 cm woofer. High notes need far less movement: the cone barely moves at 400 Hz. Shown 20× slower, movement 3× bigger.</small>`;
        }
        const F = railF(s);
        return `<div class="big">F = B I L = ${fmtN(Math.abs(F))}</div>
          <div class="row"><span>B × I × L</span><b>${s.B.toFixed(2)} T × ${Math.abs(s.I)} A × 0.05 m</b></div>
          <div class="row"><span>Direction</span><b>${Math.abs(F) < 1e-4 ? 'no push' : F > 0 ? 'to the right' : 'to the left'}</b></div>
          <div class="row"><span>Acceleration of the 20 g rod</span><b>${(Math.abs(F) / ROD.m).toFixed(2)} m/s²</b></div>
          <div class="row"><span>Same as the weight of</span><b>${asWeight(F)}</b></div>
          <small>Fleming’s left hand: First finger Field (down, N to S), seCond finger Current, thuMb Motion. Shown 4× slower.</small>`;
      },
    };
  },
};
