// Regression test for the calculators in notes/ev-efficiency/ev.js.
// Runs every exported model on fixed cases and compares with reference.json.
// The reference values were produced by this script after each model had been
// checked against an independent Python implementation of the same equations.
//   node tests/ev-notes/regression.js           compare (exit 1 on any difference)
//   node tests/ev-notes/regression.js --update  rewrite reference.json after a deliberate change
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'notes', 'ev-efficiency');
const REF = path.join(__dirname, 'reference.json');
const REL_TOL = 1e-9;

// Minimal DOM so the page script can load outside a browser.
function el() {
  return { value: '1', style: {}, innerHTML: '', textContent: '', addEventListener() {}, setAttribute() {}, getAttribute() { return 'UDDS'; },
    viewBox: { baseVal: { width: 640, height: 280 } }, getContext() { return new Proxy({}, { get: () => function () {} }); }, getBoundingClientRect() { return {}; } };
}
global.window = global;
global.document = { documentElement: {}, getElementById: () => el(), querySelectorAll: () => [] };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
eval(fs.readFileSync(path.join(SRC, 'cycles.js'), 'utf8'));
eval(fs.readFileSync(path.join(SRC, 'ev.js'), 'utf8'));
const E = window.EVNotes;

// Keep numbers (and short numeric arrays) only.
function numbers(x) {
  if (typeof x === 'number') return Number.isFinite(x) ? x : String(x);   // JSON has no NaN or Infinity
  if (typeof x === 'boolean') return x;
  if (Array.isArray(x)) return x.length <= 20 ? x.map(numbers) : undefined;
  if (x && typeof x === 'object') {
    const o = {};
    for (const k of Object.keys(x)) { const v = numbers(x[k]); if (v !== undefined) o[k] = v; }
    return o;
  }
  return undefined;
}

const car = { v: 100, rho: 1.2, cd: 0.25, a: 2.4, m: 2200, crr: 0.008, gr: 0, eta: 90, aux: 300, bat: 90 };
const cyc = { cd: 0.25, a: 2.4, m: 2200, crr: 0.008, eta: 0.9, reg: 0.7, preg: 80000, aux: 300, bat: 90, rho: 1.2 };
const cases = {
  steady: [car, Object.assign({}, car, { v: 130 }), Object.assign({}, car, { gr: 5, v: 60 })].map(E.steady),
  simulate: [window.EPA_UDDS, window.EPA_HWFET].map((t) => E.simulate(t, cyc, false)),
  motor: [[100, 500, 80, 1], [300, 300, 120, 1], [50, 1200, 80, 1.2]].map((a) => E.motor(...a)),
  pumpCurve: [1000, 3000, 5000].map((q) => [E.H0(q), E.E0(q)]),
  cop: [-10, 0, 10].map(E.cop),
  quadfit: E.quadfit([1, 2, 3, 4], [1, 4.1, 8.9, 16.2]),
  inverter: [[0.1, 0.5, 800, 10000, 100], [1, 1, 800, 10000, 100], [0.05, 0.3, 400, 20000, 60]].map(([cur, speed, vdc, fsw, tj]) => E.inverter({ cur, speed, vdc, fsw, tj })),
  winding: [[65, 0, 2, 0.4, 180], [65, 0.3, 2, 0.4, 180], [90, 0.3, 2.5, 0.6, 155]].map(([toil, imp, ip, i0, tm]) => {
    const R = E.windRth(imp), b = E.windBurst(i0, ip, toil, R, tm);
    return { R, T0: b.T0, tlim: b.tlim, cont: E.windCont(tm, toil, R), T30: b.at(30), steady: E.windSteady(1, toil, R) };
  }),
  charge: [[true, 350e3, 500, 25, 6000], [false, 350e3, 500, 25, 6000], [true, 350e3, 500, 0, 6000]].map(([hv, Pst, Ist, T0, cool]) => E.chargeSession({ hv, Pst, Ist, T0, cool })),
  oil: [[0.2, 30], [0.6, 60], [1, 110]].map(([load, Toil]) => E.oilTrade({ load, Pv40: 600, Pcu: 3000, Toil })),
  compound: [E.compound({ d: 600, c0: 150, mref: 2300, s: 0.04, mg: 1700, rho: 160 })],
  coolAir: [[120, 1, 0, 30], [0, 1, 1, 30], [60, 0.5, 1, 40]].map(([v, sh, fan, itd]) => E.coolAir({ V: v / 3.6, sh, fan, itd })),
  coldPlate: [[6, 6, 20, 25, 0.2, false], [6, 6, 20, 25, 0.2, true], [10, 5, 25, 20, 0.4, true]].map(([N, Q, flow, Tin, mal, par]) => E.coldPlate({ N, Q, flow, Tin, mal, par })),
  torqueSplit: [[17.5, 6000, 0.5, false], [17.5, 6000, 0, true], [200, 8000, 0.3, false]].map((a) => ({ L: E.torqueSplit(...a), iron: E.tsIron(a[1]) })),
  pack: [[4, 3, 200], [96, 46, 150e3], [192, 23, 150e3]].map(([Ns, Np, P]) => E.pack({ Ns, Np, Vc: 3.7, Ah: 5, Rc: 0.015, P, Rx: 0.001 })),
  cellPulse: [[0.5, 25, 20, 10, 10, -2e-4], [0.5, 25, 20, 10, 1, -2e-4], [0.5, 0, 20, 10, 10, -2e-4], [0.5, 25, -20, 10, 10, -2e-4]].map(([soc, T, I, tp, fs, dudt]) => {
    const r = E.cellPulse({ soc, T, I, tp, fs, dudt });
    return Object.assign(numbers(r), { V12: r.at(12).V, V40: r.at(40).V });
  }),
  vehicleLog: [[0.5, 0, 0.6, 600], [0, 0, 0, 0], [0, 2, 1.5, 0]].map(([off, gain, lag, extra]) => {
    const r = E.vehicleLog({ off, gain, lag, extra });
    return { dist: r.dist, Elog: r.Elog, Etrue: r.Etrue, raw: r.raw, al: r.al, lag: r.lag, still: r.still };
  }),
};
const got = numbers(cases);

if (process.argv.includes('--update')) {
  fs.writeFileSync(REF, JSON.stringify(got, null, 1) + '\n');
  console.log('reference.json updated');
  process.exit(0);
}

const ref = JSON.parse(fs.readFileSync(REF, 'utf8'));
let n = 0;
const bad = [];
(function walk(a, b, where) {
  if (typeof b === 'number') {
    n++;
    const ok = typeof a === 'number' && (a === b || Math.abs(a - b) <= REL_TOL * Math.max(Math.abs(a), Math.abs(b)));
    if (!ok) bad.push(where + ': got ' + a + ', reference ' + b);
    return;
  }
  if (typeof b === 'boolean' || typeof b === 'string' || b === null) { n++; if (a !== b) bad.push(where + ': got ' + a + ', reference ' + b); return; }
  for (const k of Object.keys(b)) {
    if (a === undefined || !(k in a)) { bad.push(where + '.' + k + ': missing'); continue; }
    walk(a[k], b[k], where + '.' + k);
  }
})(got, ref, 'cases');

if (bad.length) {
  console.error(bad.length + ' of ' + n + ' values differ from the reference:\n  ' + bad.slice(0, 40).join('\n  '));
  process.exit(1);
}
console.log('all ' + n + ' reference values reproduced (relative tolerance ' + REL_TOL + ')');
