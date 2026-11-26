/* Vehicle efficiency notes: interactive models. Plain JS, no dependencies. */
(function () {
  'use strict';
  var G = 9.81;
  var root = document.documentElement;
  function $(id) { return document.getElementById(id); }
  function num(id) { var x = parseFloat($(id).value); return isFinite(x) ? x : 0; }
  function css(name) { return getComputedStyle(root).getPropertyValue(name).trim() || '#999'; }
  function f(x, d) { return isFinite(x) ? x.toFixed(d) : '—'; }
  function sgn(x, d) { return isFinite(x) ? (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(d) : '—'; }
  function kpi(label, value, hi) { return '<div class="kpi' + (hi ? ' hi' : '') + '"><span>' + label + '</span><b>' + value + '</b></div>'; }
  function on(ids, fn) { ids.forEach(function (i) { var el = $(i); if (el) { el.addEventListener('input', fn); el.addEventListener('change', fn); } }); }
  function niceStep(span, n) {
    var raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
  }

  /* ---------- SVG line chart ---------- */
  function chart(svg, o) {
    var vb = svg.viewBox.baseVal, W = vb.width, H = vb.height, L = 52, R = 14, T = 12, B = 38;
    var x0 = o.x[0], x1 = o.x[1], y0 = o.y[0], y1 = o.y[1];
    function X(x) { return L + (W - L - R) * (x - x0) / (x1 - x0); }
    function Y(y) { return H - B - (H - T - B) * (y - y0) / (y1 - y0); }
    var s = '', xs = o.xs || niceStep(x1 - x0, 8), ys = o.ys || niceStep(y1 - y0, 5), v;
    for (v = Math.ceil(y0 / ys) * ys; v <= y1 + 1e-9; v += ys) {
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/>';
      s += '<text x="' + (L - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + +v.toFixed(6) + '</text>';
    }
    for (v = Math.ceil(x0 / xs) * xs; v <= x1 + 1e-9; v += xs) {
      s += '<text x="' + X(v) + '" y="' + (H - B + 16) + '" text-anchor="middle">' + +v.toFixed(6) + '</text>';
    }
    s += '<text x="' + (L + (W - L - R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + o.xl + '</text>';
    s += '<text x="13" y="' + (T + (H - T - B) / 2) + '" transform="rotate(-90 13 ' + (T + (H - T - B) / 2) + ')" text-anchor="middle">' + o.yl + '</text>';
    (o.vlines || []).forEach(function (l) { if (l.x >= x0 && l.x <= x1) s += '<line x1="' + X(l.x) + '" x2="' + X(l.x) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="' + l.c + '" stroke-dasharray="4 3"/>'; });
    (o.series || []).forEach(function (se) {
      var pts = se.pts.filter(function (p) { return isFinite(p[0]) && isFinite(p[1]); });
      if (pts.length < 2) return;
      s += '<polyline fill="none" stroke="' + se.c + '" stroke-width="' + (se.w || 2) + '"' + (se.dash ? ' stroke-dasharray="' + se.dash + '"' : '') + ' points="' +
        pts.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(Math.max(y0, Math.min(y1, p[1]))).toFixed(1); }).join(' ') + '"/>';
    });
    (o.dots || []).forEach(function (d) {
      if (isFinite(d.x) && isFinite(d.y)) s += '<circle cx="' + X(d.x).toFixed(1) + '" cy="' + Y(d.y).toFixed(1) + '" r="' + (d.r || 4) + '" fill="' + d.c + '"' + (d.o ? ' fill-opacity="' + d.o + '"' : '') + '/>';
    });
    (o.bars || []).forEach(function (b) {
      var ya = Y(Math.max(y0, Math.min(0, y1))), yb = Y(b.y);
      s += '<rect x="' + X(b.x0).toFixed(1) + '" width="' + Math.max(1, X(b.x1) - X(b.x0)).toFixed(1) + '" y="' + Math.min(ya, yb).toFixed(1) + '" height="' + Math.abs(yb - ya).toFixed(1) + '" fill="' + b.c + '"/>';
    });
    s += (o.extra || '');
    svg.innerHTML = s;
    return { X: X, Y: Y };
  }
  function stack(el, parts) {
    var tot = parts.reduce(function (a, p) { return a + Math.max(0, p[0]); }, 0);
    el.innerHTML = tot > 0 ? parts.map(function (p) {
      var w = 100 * Math.max(0, p[0]) / tot;
      return w > 0 ? '<div style="width:' + w + '%;background:' + p[1] + '" title="' + p[2] + ' ' + w.toFixed(0) + '%"></div>' : '';
    }).join('') : '';
  }

  /* ---------- 01 converter ---------- */
  var CV = ['cv-F', 'cv-P', 'cv-dp', 'cv-Q', 'cv-etap', 'cv-v', 'cv-eta', 'cv-base', 'cv-bat'];
  function converter() {
    var F = num('cv-F'), P = num('cv-P'), dp = num('cv-dp') * 1000, Q = num('cv-Q') / 60000, ep = num('cv-etap') / 100,
      v = num('cv-v'), eta = num('cv-eta') / 100, base = num('cv-base'), bat = num('cv-bat');
    var whF = F * 0.27778 / (eta || 1), whP = v > 0 ? P / v : Infinity, Ppump = ep > 0 ? dp * Q / ep : Infinity, whPump = v > 0 ? Ppump / v : Infinity;
    function dr(dwh) { return bat * 1000 / (base + dwh) - bat * 1000 / base; }
    $('cv-out').innerHTML =
      kpi('Force → battery energy', f(whF, 2) + ' Wh/km') + kpi('Force → range', sgn(dr(whF), 1) + ' km') +
      kpi('Aux power → energy', f(whP, 2) + ' Wh/km') + kpi('Aux power → range', sgn(dr(whP), 1) + ' km') +
      kpi('Pump electrical power', f(Ppump, 1) + ' W') + kpi('Pump → range', sgn(dr(whPump), 1) + ' km') +
      kpi('Baseline range', f(bat * 1000 / base, 0) + ' km', true);
  }

  /* ---------- 02 road load ---------- */
  var RL = ['rl-v', 'rl-cd', 'rl-a', 'rl-m', 'rl-crr', 'rl-gr', 'rl-eta', 'rl-aux', 'rl-bat', 'rl-rho'];
  function rlParams() { var p = {}; RL.forEach(function (i) { p[i.slice(3)] = num(i); }); return p; }
  function steady(p) {
    var v = p.v / 3.6, th = Math.atan(p.gr / 100), eta = Math.max(p.eta, 1) / 100;
    var Fa = 0.5 * p.rho * p.cd * p.a * v * v, Fr = p.crr * p.m * G * Math.cos(th), Fg = p.m * G * Math.sin(th);
    var Pw = (Fa + Fr + Fg) * v, Pb = Pw >= 0 ? Pw / eta : Pw * eta, Pt = Pb + p.aux;
    var wh = p.v > 0 ? Pt / p.v : Infinity;
    return { v: v, Fa: Fa, Fr: Fr, Fg: Fg, Pw: Pw, Pb: Pb, Pt: Pt, wh: wh, range: wh > 0 ? p.bat * 1000 / wh : Infinity, eta: eta };
  }
  function roadLoad() {
    var p = rlParams(), r = steady(p);
    $('rl-out').innerHTML =
      kpi('Aerodynamic force', f(r.Fa, 0) + ' N') + kpi('Rolling force', f(r.Fr, 0) + ' N') + kpi('Grade force', f(r.Fg, 0) + ' N') +
      kpi('Wheel power', f(r.Pw / 1000, 1) + ' kW') + kpi('Battery power', f(r.Pt / 1000, 1) + ' kW') +
      kpi('Consumption', f(r.wh, 0) + ' Wh/km', true) + kpi('Efficiency', f(r.wh > 0 ? 621.37 / r.wh : Infinity, 2) + ' mi/kWh') +
      kpi('Range', f(r.range, 0) + ' km · ' + f(r.range / 1.609, 0) + ' mi', true);
    var loss = r.Pw > 0 ? r.Pw / r.eta - r.Pw : 0;
    stack($('rl-stack'), [[r.Fa * r.v, css('--s-blue'), 'Aerodynamic'], [r.Fr * r.v, css('--s-mint'), 'Rolling'], [r.Fg * r.v, css('--s-grey'), 'Grade'], [loss, css('--s-warm'), 'Drivetrain losses'], [p.aux, css('--s-violet'), 'Aux + HVAC']]);
    var pa = [], pr = [], pt = [], vmax = 160;
    for (var s = 0; s <= vmax; s += 4) {
      var q = Object.assign({}, p, { v: Math.max(s, 0.1), gr: 0 }), x = steady(q);
      pa.push([s, x.Fa * x.v / 1000]); pr.push([s, x.Fr * x.v / 1000]); pt.push([s, (x.Fa + x.Fr) * x.v / 1000]);
    }
    var ym = Math.max.apply(null, pt.map(function (z) { return z[1]; }));
    chart($('rl-chart'), { x: [0, vmax], y: [0, Math.ceil(ym / 10) * 10 || 10], xs: 20, xl: 'Speed [km/h]', yl: 'Wheel power, level road [kW]',
      series: [{ pts: pa, c: css('--s-blue') }, { pts: pr, c: css('--s-mint') }, { pts: pt, c: css('--ink'), w: 2.5 }], vlines: [{ x: p.v, c: css('--s-coral') }] });
    var rows = '<tr><th>Change</th><th>Δ consumption</th><th>Δ range</th><th>Δ range</th></tr>';
    [['C<sub>d</sub> −0.010 (10 counts)', { cd: p.cd - 0.01 }], ['Frontal area −0.05 m²', { a: p.a - 0.05 }], ['Mass −100 kg', { m: p.m - 100 }],
     ['C<sub>rr</sub> −0.001', { crr: p.crr - 0.001 }], ['Drivetrain efficiency +1 point', { eta: p.eta + 1 }], ['Aux −100 W', { aux: p.aux - 100 }], ['Speed −10 km/h', { v: p.v - 10 }]
    ].forEach(function (t) {
      var x = steady(Object.assign({}, p, t[1]));
      rows += '<tr><td>' + t[0] + '</td><td>' + sgn(x.wh - r.wh, 1) + ' Wh/km</td><td>' + sgn(x.range - r.range, 0) + ' km</td><td>' + sgn(100 * (x.range - r.range) / r.range, 1) + '%</td></tr>';
    });
    $('rl-sens').innerHTML = rows;
    coast(false);
  }

  /* ---------- 02 coast-down ---------- */
  var seed = 7;
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function quadfit(xs, ys) {
    var S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], b = [0, 0, 0];
    for (var i = 0; i < xs.length; i++) { var p = [1, xs[i], xs[i] * xs[i]]; for (var j = 0; j < 3; j++) { b[j] += p[j] * ys[i]; for (var k = 0; k < 3; k++) S[j][k] += p[j] * p[k]; } }
    for (var c = 0; c < 3; c++) {
      var piv = c; for (var r2 = c + 1; r2 < 3; r2++) if (Math.abs(S[r2][c]) > Math.abs(S[piv][c])) piv = r2;
      var tmp = S[c]; S[c] = S[piv]; S[piv] = tmp; var tb = b[c]; b[c] = b[piv]; b[piv] = tb;
      for (var r3 = c + 1; r3 < 3; r3++) { var fac = S[r3][c] / S[c][c]; for (var k2 = c; k2 < 3; k2++) S[r3][k2] -= fac * S[c][k2]; b[r3] -= fac * b[c]; }
    }
    var x = [0, 0, 0];
    for (var c2 = 2; c2 >= 0; c2--) { var sum = b[c2]; for (var k3 = c2 + 1; k3 < 3; k3++) sum -= S[c2][k3] * x[k3]; x[c2] = sum / S[c2][c2]; }
    return x;
  }
  function coastRun(tr, w, sigma, r) {
    var meff = 1.04 * tr.m, v = 130 / 3.6, t = 0, dt = 0.05, samples = [v], next = 1;
    while (v > 12 / 3.6 && t < 600) {
      var va = v + w, F = tr.A + tr.B * v + tr.C * va * Math.abs(va);
      v -= F / meff * dt; t += dt;
      if (t >= next - 1e-9) { samples.push(v); next += 1; }
    }
    var vm = samples.map(function (x) { return x + gauss(r) * sigma / 3.6; }), xs = [], ys = [];
    for (var i = 1; i < vm.length - 1; i++) { xs.push(vm[i]); ys.push(-meff * (vm[i + 1] - vm[i - 1]) / 2); }
    return { xs: xs, ys: ys, fit: quadfit(xs, ys) };
  }
  function coast(newRun) {
    if (newRun) seed += 1;
    var p = rlParams(), tr = { m: p.m, A: p.crr * p.m * G, B: 2.0, C: 0.5 * p.rho * p.cd * p.a };
    var sigma = Math.max(0, num('cd-noise')), w = num('cd-wind'), both = $('cd-both').value === '2', r = rng(seed);
    var a = coastRun(tr, w, sigma, r), fit = a.fit, pts = a.xs.map(function (x, i) { return [x * 3.6, a.ys[i]]; });
    if (both) {
      var b = coastRun(tr, -w, sigma, r);
      fit = [0, 1, 2].map(function (k) { return (a.fit[k] + b.fit[k]) / 2; });
      pts = pts.concat(b.xs.map(function (x, i) { return [x * 3.6, b.ys[i]]; }));
    }
    var line = [], truth = [];
    for (var s = 10; s <= 132; s += 2) { var vv = s / 3.6; line.push([s, fit[0] + fit[1] * vv + fit[2] * vv * vv]); truth.push([s, tr.A + tr.B * vv + tr.C * vv * vv]); }
    var ym = Math.max.apply(null, truth.map(function (z) { return z[1]; })) * 1.35;
    chart($('cd-chart'), { x: [0, 140], y: [0, Math.ceil(ym / 100) * 100], xs: 20, xl: 'Speed [km/h]', yl: 'Road load [N]',
      dots: pts.map(function (q) { return { x: q[0], y: q[1], c: css('--s-grey'), r: 2.2, o: 0.8 }; }),
      series: [{ pts: truth, c: css('--s-warm'), w: 2, dash: '5 4' }, { pts: line, c: css('--s-mint'), w: 2.5 }] });
    function row(n, t, v, u) { return '<tr><td>' + n + '</td><td>' + f(t, 3) + ' ' + u + '</td><td>' + f(v, 3) + ' ' + u + '</td><td>' + sgn(100 * (v - t) / t, 1) + '%</td></tr>'; }
    var cdFit = 2 * fit[2] / (p.rho * p.a);
    $('cd-table').innerHTML = '<tr><th>Coefficient</th><th>True</th><th>Fitted</th><th>Error</th></tr>' +
      row('A', tr.A, fit[0], 'N') + row('B', tr.B, fit[1], 'N·s/m') + row('C', tr.C, fit[2], 'N·s²/m²') + row('Implied C<sub>d</sub>', p.cd, cdFit, '');
  }

  /* ---------- 03 drive cycles ---------- */
  var CY = ['cy-cd', 'cy-a', 'cy-m', 'cy-crr', 'cy-eta', 'cy-reg', 'cy-preg', 'cy-aux', 'cy-bat'];
  var current = 'UDDS';
  function cyParams() { return { cd: num('cy-cd'), a: num('cy-a'), m: num('cy-m'), crr: num('cy-crr'), eta: num('cy-eta') / 100, reg: num('cy-reg') / 100, preg: num('cy-preg') * 1000, aux: num('cy-aux'), bat: num('cy-bat'), rho: 1.2 }; }
  function simulate(trace, p, keep) {
    var meff = 1.04 * p.m, E = 0, Ea = 0, Er = 0, Ebr = 0, Edt = 0, Erg = 0, Eaux = 0, Ereg = 0, d = 0, pb = [];
    var eta = Math.max(p.eta, 0.01), reg = Math.max(0, Math.min(1, p.reg)), wcap = reg > 0 ? p.preg / reg : 0;
    for (var i = 0; i < trace.length - 1; i++) {
      var v0 = trace[i] * 0.44704, v1 = trace[i + 1] * 0.44704, va = (v0 + v1) / 2, acc = v1 - v0;
      var Fa = 0.5 * p.rho * p.cd * p.a * va * va, Fr = va > 0.01 ? p.crr * p.m * G : 0;
      var Pw = (Fa + Fr + meff * acc) * va, P;
      if (Pw >= 0) { P = Pw / eta; Edt += P - Pw; }
      else { var rw = Math.min(-Pw, wcap), rb = rw * reg; Ebr += -Pw - rw; Erg += rw - rb; Ereg += rb; P = -rb; }
      P += p.aux; Eaux += p.aux; E += P; Ea += Fa * va; Er += Fr * va; d += va;
      if (keep) pb.push(P / 1000);
    }
    return { E: E, Ea: Ea, Er: Er, Ebr: Ebr, Eloss: Edt + Erg, Eaux: Eaux, Ereg: Ereg, d: d, wh: E / 3.6 / d, pb: pb };
  }
  function cycles() {
    var p = cyParams(), tr = window['EPA_' + current], r = simulate(tr, p, true);
    var sp = tr.map(function (v, i) { return [i, v * 1.609344]; });
    var trac = r.pb.map(function (x, i) { return [i + 0.5, Math.max(0, x)]; }), regn = r.pb.map(function (x, i) { return [i + 0.5, Math.min(0, x)]; });
    var pmax = Math.max(60, Math.ceil(Math.max.apply(null, r.pb) / 20) * 20), pmin = Math.min(0, Math.floor(Math.min.apply(null, r.pb) / 20) * 20);
    var hi = Math.max(100, pmax), lo = Math.min(-20, pmin);
    chart($('cy-trace'), { x: [0, tr.length - 1], y: [lo, hi], xs: current === 'UDDS' ? 200 : 100, xl: 'Time [s]', yl: 'km/h  ·  kW',
      series: [{ pts: regn, c: css('--s-mint'), w: 1 }, { pts: trac, c: css('--s-warm'), w: 1 }, { pts: sp, c: css('--ink'), w: 1.6 }] });
    var avg = r.d / (tr.length - 1) * 3.6;
    $('cy-out').innerHTML =
      kpi('Distance', f(r.d / 1000, 2) + ' km · ' + f(r.d / 1609.344, 2) + ' mi') + kpi('Average speed', f(avg, 1) + ' km/h') +
      kpi('Battery energy', f(r.E / 3.6e6, 2) + ' kWh') + kpi('Consumption', f(r.wh, 0) + ' Wh/km', true) +
      kpi('Efficiency', f(621.37 / r.wh, 2) + ' mi/kWh') + kpi('Recovered by regeneration', f(r.Ereg / 3.6e6, 2) + ' kWh') +
      kpi('Unadjusted range', f(p.bat * 1000 / r.wh, 0) + ' km · ' + f(p.bat * 1000 / r.wh / 1.609, 0) + ' mi', true);
    stack($('cy-stack'), [[r.Ea, css('--s-blue'), 'Aerodynamic'], [r.Er, css('--s-mint'), 'Rolling'], [r.Ebr, css('--s-coral'), 'Friction braking'], [r.Eloss, css('--s-warm'), 'Drivetrain and regeneration losses'], [r.Eaux, css('--s-violet'), 'Aux']]);
    var u = simulate(window.EPA_UDDS, p), h = simulate(window.EPA_HWFET, p), comb = 0.55 * u.wh + 0.45 * h.wh, adj = comb / 0.7;
    function row(n, wh) { return '<tr><td>' + n + '</td><td>' + f(wh, 0) + ' Wh/km</td><td>' + f(621.37 / wh, 2) + ' mi/kWh</td><td>' + f(p.bat * 1000 / wh, 0) + ' km · ' + f(p.bat * 1000 / wh / 1.609, 0) + ' mi</td></tr>'; }
    $('cy-label').innerHTML = '<tr><th>Result</th><th>Consumption</th><th>Efficiency</th><th>Range</th></tr>' +
      row('City (UDDS), unadjusted', u.wh) + row('Highway (HWFET), unadjusted', h.wh) + row('Combined 55/45, unadjusted', comb) + row('Approximate label (× 0.7)', adj);
    sensitivity(p);
  }

  /* ---------- 11 sensitivity ---------- */
  function sensitivity(p) {
    var levers = [['C<sub>d</sub> −0.010', { cd: p.cd - 0.01 }, 'Cd −0.010'], ['Mass −100 kg', { m: p.m - 100 }, 'Mass −100 kg'], ['C<sub>rr</sub> −0.001', { crr: p.crr - 0.001 }, 'Crr −0.001'],
      ['Drivetrain +1 pt', { eta: p.eta + 0.01 }, 'Drivetrain +1 pt'], ['Regeneration +5 pts', { reg: Math.min(1, p.reg + 0.05) }, 'Regen +5 pts'], ['Aux −200 W', { aux: p.aux - 200 }, 'Aux −200 W']];
    var bu = simulate(window.EPA_UDDS, p).wh, bh = simulate(window.EPA_HWFET, p).wh, data = [];
    levers.forEach(function (l) {
      var q = Object.assign({}, p, l[1]);
      data.push([l[2], 100 * (bu / simulate(window.EPA_UDDS, q).wh - 1), 100 * (bh / simulate(window.EPA_HWFET, q).wh - 1)]);
    });
    var ymax = Math.max(1, Math.ceil(Math.max.apply(null, data.map(function (d) { return Math.max(d[1], d[2]); })) + 0.5));
    var bars = [], extra = '', n = data.length;
    var o = { x: [0, n], y: [0, ymax], xs: 100, xl: '', yl: 'Range change [%]', series: [] };
    data.forEach(function (d, i) { bars.push({ x0: i + 0.18, x1: i + 0.48, y: d[1], c: css('--s-blue') }); bars.push({ x0: i + 0.52, x1: i + 0.82, y: d[2], c: css('--s-warm') }); });
    o.bars = bars;
    var ax = chart($('se-chart'), o);
    data.forEach(function (d, i) {
      extra += '<text x="' + ax.X(i + 0.5) + '" y="' + (ax.Y(0) + 16) + '" text-anchor="middle">' + d[0] + '</text>';
      extra += '<text x="' + ax.X(i + 0.33) + '" y="' + (ax.Y(d[1]) - 4) + '" text-anchor="middle">' + d[1].toFixed(1) + '</text>';
      extra += '<text x="' + ax.X(i + 0.67) + '" y="' + (ax.Y(d[2]) - 4) + '" text-anchor="middle">' + d[2].toFixed(1) + '</text>';
    });
    o.extra = extra; chart($('se-chart'), o);
  }

  /* ---------- 06 motor map ---------- */
  var TPK = 350, PPK = 200000, WB = PPK / TPK, NMAX = 16000, TMAXAX = 380, ALPHA = 0.0039;
  function motor(tq, w, T, fe) {
    var rT = (1 + ALPHA * (T - 20)) / (1 + ALPHA * 60), kphi = 1 - 0.001 * (T - 80);
    var tfw = w > WB ? 150 * (1 - WB / w) : 0, flux = w > WB ? WB / w : 1, ac = 1 + 2 * Math.pow(w / (NMAX * Math.PI / 30), 2);
    var cu = 0.0816 * rT * ac * ((tq / kphi) * (tq / kphi) + tfw * tfw);
    var ir = fe * (1.0 * w + 0.003 * w * w) * flux * kphi * kphi;
    var P = tq * w, me = 0.2 * w + 1e-7 * w * w * w + 0.006 * P;
    return { P: P, cu: cu, fe: ir, me: me, eta: P > 0 ? P / (P + cu + ir + me) : 0 };
  }
  function tmax(w) { return w <= WB ? TPK : PPK / w; }
  var STOPS = [[0.80, [29, 43, 47]], [0.85, [38, 84, 92]], [0.88, [63, 140, 128]], [0.91, [120, 200, 165]], [0.93, [165, 239, 204]], [0.95, [243, 236, 190]]];
  function ecolor(e) {
    if (e <= STOPS[0][0]) return STOPS[0][1];
    for (var i = 1; i < STOPS.length; i++) if (e <= STOPS[i][0]) {
      var a = STOPS[i - 1], b = STOPS[i], t = (e - a[0]) / (b[0] - a[0]);
      return [0, 1, 2].map(function (k) { return Math.round(a[1][k] + t * (b[1][k] - a[1][k])); });
    }
    return STOPS[STOPS.length - 1][1];
  }
  var sel = { n: 8000, t: 40 };
  function motorMap() {
    var cv = $('mo-map'); if (!cv) return;
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, L = 50, R = 10, T = 10, B = 34;
    var Tm = num('mo-T'), fe = num('mo-fe') / 100;
    $('mo-Tv').textContent = Tm; $('mo-fev').textContent = fe * 100 | 0;
    ctx.fillStyle = css('--bg'); ctx.fillRect(0, 0, W, H);
    var pw = W - L - R, ph = H - T - B, step = 4;
    for (var px = 0; px < pw; px += step) for (var py = 0; py < ph; py += step) {
      var n = (px + step / 2) / pw * NMAX, w = n * Math.PI / 30, tq = (1 - (py + step / 2) / ph) * TMAXAX;
      if (tq > tmax(w) || w < 1) continue;
      var c = ecolor(motor(tq, w, Tm, fe).eta);
      ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; ctx.fillRect(L + px, T + py, step, step);
    }
    ctx.strokeStyle = css('--ink'); ctx.lineWidth = 1.5; ctx.beginPath();
    for (var k = 0; k <= 200; k++) { var nn = k / 200 * NMAX, ww = Math.max(nn * Math.PI / 30, 1e-3), x = L + nn / NMAX * pw, y = T + (1 - tmax(ww) / TMAXAX) * ph; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.fillStyle = css('--muted'); ctx.font = '11px Arial'; ctx.textAlign = 'center';
    for (var s = 0; s <= NMAX; s += 2000) ctx.fillText(s, L + s / NMAX * pw, H - B + 15);
    ctx.fillText('Speed [rpm]', L + pw / 2, H - 4);
    ctx.textAlign = 'right';
    for (var tt = 0; tt <= TMAXAX; tt += 50) ctx.fillText(tt, L - 6, T + (1 - tt / TMAXAX) * ph + 4);
    ctx.save(); ctx.translate(12, T + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('Torque [N·m]', 0, 0); ctx.restore();
    var sx = L + sel.n / NMAX * pw, sy = T + (1 - sel.t / TMAXAX) * ph;
    ctx.strokeStyle = css('--s-coral'); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, 6, 0, 2 * Math.PI); ctx.stroke();
    var wsel = sel.n * Math.PI / 30, m = motor(sel.t, wsel, Tm, fe), L80 = motor(sel.t, wsel, 80, fe);
    $('mo-out').innerHTML = kpi('Selected point', f(sel.n, 0) + ' rpm · ' + f(sel.t, 0) + ' N·m') + kpi('Output power', f(m.P / 1000, 1) + ' kW') +
      kpi('Efficiency', f(100 * m.eta, 1) + '%', true) + kpi('Copper loss', f(m.cu, 0) + ' W') + kpi('Iron loss', f(m.fe, 0) + ' W') + kpi('Mechanical + stray loss', f(m.me, 0) + ' W') +
      kpi('Total loss vs 80 °C', sgn(100 * ((m.cu + m.fe + m.me) / (L80.cu + L80.fe + L80.me) - 1), 1) + '%');
  }
  function motorClick(ev) {
    var cv = $('mo-map'), rc = cv.getBoundingClientRect(), sx = cv.width / rc.width, sy = cv.height / rc.height;
    var x = (ev.clientX - rc.left) * sx, y = (ev.clientY - rc.top) * sy, L = 50, R = 10, T = 10, B = 34;
    var n = (x - L) / (cv.width - L - R) * NMAX, tq = (1 - (y - T) / (cv.height - T - B)) * TMAXAX;
    if (n <= 0 || tq <= 0) return;
    n = Math.min(n, NMAX); tq = Math.min(tq, tmax(n * Math.PI / 30));
    sel = { n: n, t: tq }; motorMap();
  }
  function colorbar() {
    var el = $('mo-bar'); if (!el) return;
    el.style.background = 'linear-gradient(90deg,' + STOPS.map(function (s) { return 'rgb(' + s[1].join(',') + ') ' + (100 * (s[0] - 0.80) / 0.15).toFixed(1) + '%'; }).join(',') + ')';
  }

  /* ---------- 08 pump ---------- */
  var PQ = [900, 1050, 1200, 1500, 1650], PH = [10.919, 10.435, 9.580, 6.310, 4.254], PE = [69.259, 69.956, 67.759, 50.693, 36.329];
  var cH = quadfit(PQ.map(function (q) { return q / 1000; }), PH), cE = quadfit(PQ.map(function (q) { return q / 1000; }), PE);
  function H0(q) { var x = q / 1000; return cH[0] + cH[1] * x + cH[2] * x * x; }
  function E0(q) { var x = q / 1000; return (cE[0] + cE[1] * x + cE[2] * x * x) / 100; }
  var RHO_P = 1074, N0 = 7000;
  function pump() {
    var qb = num('pu-qb'), qtEl = $('pu-qt');
    qtEl.max = qb; var qt = Math.min(num('pu-qt'), qb); qtEl.value = qt;
    $('pu-qbv').textContent = qb; $('pu-qtv').textContent = qt;
    var em = Math.max(num('pu-em'), 1) / 100, k0 = H0(qb) / (qb * qb), r = qt / qb, N = N0 * r;
    var Hs = k0 * qt * qt, es = E0(qb), Ps = RHO_P * G * (qt / 3.6e6) * Hs / es;
    var Ht = H0(qt), et = E0(qt), Pt = RHO_P * G * (qt / 3.6e6) * Ht / et, kt = Ht / (qt * qt), dpv = RHO_P * G * (Ht - Hs) / 1000;
    var c0 = [], cN = [], sys = [], thr = [];
    for (var q = 900; q <= 1650; q += 10) { c0.push([q, H0(q)]); cN.push([q * r, r * r * H0(q)]); }
    for (var q2 = 0; q2 <= 1800; q2 += 10) { if (k0 * q2 * q2 <= 14) sys.push([q2, k0 * q2 * q2]); if (kt * q2 * q2 <= 14) thr.push([q2, kt * q2 * q2]); }
    chart($('pu-chart'), { x: [0, 1800], y: [0, 14], xs: 200, ys: 2, xl: 'Flow [L/h]', yl: 'Head [m]',
      series: [{ pts: sys, c: css('--s-blue'), w: 1.8 }, { pts: thr, c: css('--s-coral'), w: 1.8, dash: '5 4' }, { pts: cN, c: css('--s-mint'), w: 2.4 }, { pts: c0, c: css('--ink'), w: 2.4 }],
      dots: [{ x: qb, y: H0(qb), c: css('--s-blue'), r: 5 }, { x: qt, y: Hs, c: css('--s-mint'), r: 5 }, { x: qt, y: Ht, c: css('--s-coral'), r: 5 }] });
    $('pu-out').innerHTML =
      kpi('Speed control: pump speed', f(N, 0) + ' rpm') + kpi('Speed control: shaft power', f(Ps, 1) + ' W') + kpi('Speed control: electrical', f(Ps / em, 1) + ' W', true) +
      kpi('Throttling: valve loss', f(dpv, 1) + ' kPa') + kpi('Throttling: shaft power', f(Pt, 1) + ' W') + kpi('Throttling: electrical', f(Pt / em, 1) + ' W') +
      kpi('Hydraulic efficiency, speed / throttle', f(100 * es, 1) + '% / ' + f(100 * et, 1) + '%') + kpi('Power saved by speed control', f(100 * (1 - Ps / Pt), 0) + '%', true);
  }

  /* ---------- 09 winter ---------- */
  function cop(T) { return Math.max(1.2, Math.min(4.0, 2.5 + 0.05 * T)); }
  function winter() {
    var T = num('wi-T'), v = Math.max(num('wi-v'), 1), base = num('wi-base'), ua = num('wi-ua'), bat = num('wi-bat');
    $('wi-Tv').textContent = (T < 0 ? '−' : '') + Math.abs(T);
    function calc(t) { var q = Math.max(0, ua * (21 - t)); return { q: q, ptc: base + q / v, hp: base + q / cop(t) / v }; }
    var c = calc(T), r0 = bat * 1000 / base;
    $('wi-out').innerHTML = kpi('Heat demand', f(c.q / 1000, 2) + ' kW') + kpi('Heat-pump COP', f(cop(T), 2)) +
      kpi('Resistive: added energy', f(c.ptc - base, 0) + ' Wh/km') + kpi('Heat pump: added energy', f(c.hp - base, 0) + ' Wh/km') +
      kpi('Range, no heating', f(r0, 0) + ' km') + kpi('Range, resistive', f(bat * 1000 / c.ptc, 0) + ' km · ' + sgn(100 * (base / c.ptc - 1), 0) + '%') +
      kpi('Range, heat pump', f(bat * 1000 / c.hp, 0) + ' km · ' + sgn(100 * (base / c.hp - 1), 0) + '%', true);
    var a = [], b = [], z = [];
    for (var t = -25; t <= 20; t += 1) { var x = calc(t); a.push([t, bat * 1000 / x.ptc]); b.push([t, bat * 1000 / x.hp]); z.push([t, r0]); }
    chart($('wi-chart'), { x: [-25, 20], y: [0, Math.ceil(r0 * 1.1 / 100) * 100], xs: 5, xl: 'Ambient temperature [°C]', yl: 'Range [km]',
      series: [{ pts: z, c: css('--s-grey'), w: 1.5, dash: '4 4' }, { pts: a, c: css('--s-coral'), w: 2.2 }, { pts: b, c: css('--s-mint'), w: 2.4 }], vlines: [{ x: T, c: css('--muted') }] });
  }

  /* ---------- 06 inverter: SiC MOSFET vs Si IGBT ---------- */
  var INV = { Prated: 250000, Vref: 800, m: 0.9, pf: 0.9, Iref: 400, Esic: 0.012, Eigbt: 0.036, R25: 0.002, aR: 0.006, V0: 0.9, r25: 0.0015, ar: 0.004, aux: 30 };
  var IRATED = INV.Prated / (3 * INV.m * INV.Vref / (2 * Math.SQRT2) * INV.pf);
  function inverter(o) {
    var I = o.cur * IRATED, Iavg = 2 * Math.SQRT2 * I / Math.PI, m = INV.m * Math.min(1, Math.max(o.speed, 0));
    var Pout = 3 * m * o.vdc / (2 * Math.SQRT2) * I * INV.pf, kV = o.vdc / INV.Vref, kI = Iavg / INV.Iref;
    var sicC = 3 * I * I * INV.R25 * (1 + INV.aR * (o.tj - 25)), sicS = 3 * o.fsw * INV.Esic * kV * kI;
    var igC = 3 * (INV.V0 * Iavg + INV.r25 * (1 + INV.ar * (o.tj - 25)) * I * I), igS = 3 * o.fsw * INV.Eigbt * kV * kI;
    var sic = sicC + sicS + INV.aux, ig = igC + igS + INV.aux;
    return { I: I, Pout: Pout, sicC: sicC, sicS: sicS, igC: igC, igS: igS, sic: sic, ig: ig, etaS: Pout > 0 ? Pout / (Pout + sic) : 0, etaI: Pout > 0 ? Pout / (Pout + ig) : 0 };
  }
  var IV = ['iv-cur', 'iv-spd', 'iv-vdc', 'iv-fsw', 'iv-tj', 'iv-v'];
  function inverterDemo() {
    if (!$('iv-chart')) return;
    var cur = num('iv-cur') / 100, v = Math.max(num('iv-v'), 1);
    var o = { vdc: num('iv-vdc'), fsw: num('iv-fsw') * 1000, tj: num('iv-tj'), speed: num('iv-spd') / 100, cur: cur };
    $('iv-curv').textContent = num('iv-cur'); $('iv-spdv').textContent = num('iv-spd');
    var r = inverter(o), s = [], g = [], lo = 100;
    for (var c = 1; c <= 100; c += 1) {
      var x = inverter(Object.assign({}, o, { cur: c / 100 }));
      s.push([c, 100 * x.etaS]); g.push([c, 100 * x.etaI]); lo = Math.min(lo, 100 * x.etaS, 100 * x.etaI);
    }
    chart($('iv-chart'), { x: [0, 100], y: [Math.max(80, Math.floor(lo)), 100], xs: 10, xl: 'Phase current [% of rated]', yl: 'Inverter efficiency [%]',
      series: [{ pts: g, c: css('--s-coral'), w: 2.2 }, { pts: s, c: css('--s-mint'), w: 2.4 }], vlines: [{ x: cur * 100, c: css('--muted') }],
      dots: [{ x: cur * 100, y: 100 * r.etaS, c: css('--s-mint'), r: 5 }, { x: cur * 100, y: 100 * r.etaI, c: css('--s-coral'), r: 5 }] });
    $('iv-out').innerHTML = kpi('Output power', f(r.Pout / 1000, 1) + ' kW') + kpi('Phase current', f(r.I, 0) + ' A rms') +
      kpi('SiC MOSFET: loss · efficiency', f(r.sic, 0) + ' W · ' + f(100 * r.etaS, 2) + '%', true) + kpi('Si IGBT: loss · efficiency', f(r.ig, 0) + ' W · ' + f(100 * r.etaI, 2) + '%') +
      kpi('SiC conduction / switching', f(r.sicC, 0) + ' / ' + f(r.sicS, 0) + ' W') + kpi('IGBT conduction / switching', f(r.igC, 0) + ' / ' + f(r.igS, 0) + ' W') +
      kpi('Extra IGBT loss at ' + f(v, 0) + ' km/h', sgn((r.ig - r.sic) / v, 2) + ' Wh/km', true);
  }

  /* ---------- 06 winding: peak versus continuous ---------- */
  var WD = { Pref: 1500, Tref: 100, Pother: 300, Rcond: 0.02, Rconv: 0.03, C: 4000 };
  function rT(T, Tref) { return (1 + ALPHA * (T - 20)) / (1 + ALPHA * (Tref - 20)); }
  function windRth(imp) { return WD.Rcond + WD.Rconv / (1 + imp); }
  function windSteady(i, Toil, R) {
    var a = R * WD.Pref * i * i / (1 + ALPHA * (WD.Tref - 20)), den = 1 - a * ALPHA;
    return den > 0 ? (Toil + R * WD.Pother + a * (1 - 20 * ALPHA)) / den : Infinity;
  }
  function windCont(Tmax, Toil, R) { var q = (Tmax - Toil) / R - WD.Pother; return q > 0 ? Math.sqrt(q / (WD.Pref * rT(Tmax, WD.Tref))) : 0; }
  function windBurst(i0, ip, Toil, R, Tmax) {
    var A = WD.Pref * ip * ip / (1 + ALPHA * (WD.Tref - 20)), c1 = A * ALPHA - 1 / R, c0 = A * (1 - 20 * ALPHA) + WD.Pother + Toil / R;
    var T0 = windSteady(i0, Toil, R), Tinf = -c0 / c1, tl;
    if (T0 >= Tmax) tl = 0; else if (c1 < 0 && Tinf <= Tmax) tl = Infinity; else tl = WD.C / c1 * Math.log((Tmax - Tinf) / (T0 - Tinf));
    return { T0: T0, tlim: tl, at: function (t) { return Tinf + (T0 - Tinf) * Math.exp(c1 * t / WD.C); } };
  }
  var WDI = ['wd-oil', 'wd-imp', 'wd-pk', 'wd-cr', 'wd-max'];
  function windDemo() {
    if (!$('wd-chart')) return;
    var Toil = num('wd-oil'), imp = num('wd-imp') / 100, ip = num('wd-pk'), i0 = num('wd-cr'), Tmax = num('wd-max');
    $('wd-oilv').textContent = Toil; $('wd-impv').textContent = num('wd-imp');
    var R = windRth(imp), R0 = windRth(0), b = windBurst(i0, ip, Toil, R, Tmax), b0 = windBurst(i0, ip, Toil, R0, Tmax);
    var ic = windCont(Tmax, Toil, R), ic0 = windCont(Tmax, Toil, R0), a = [], z = [], lim = [], tend = 120;
    for (var t = 0; t <= tend; t += 1) { a.push([t, b.at(t)]); z.push([t, b0.at(t)]); lim.push([t, Tmax]); }
    var lo = Math.floor(Math.min(b.T0, b0.T0) / 20) * 20;
    chart($('wd-chart'), { x: [0, tend], y: [lo, Math.ceil((Tmax + 30) / 20) * 20], xs: 20, xl: 'Time at peak current [s]', yl: 'Winding hot spot [°C]',
      series: [{ pts: lim, c: css('--s-coral'), w: 1.5, dash: '5 4' }, { pts: z, c: css('--s-grey'), w: 2, dash: '4 3' }, { pts: a, c: css('--s-mint'), w: 2.6 }] });
    function sec(x) { return x === Infinity ? 'no limit' : f(x, 0) + ' s'; }
    $('wd-out').innerHTML = kpi('Winding-to-oil resistance', f(R * 1000, 1) + ' mK/W') + kpi('Time constant R·C', f(R * WD.C, 0) + ' s') +
      kpi('Hot spot at cruise current', f(b.T0, 0) + ' °C') + kpi('Continuous current', f(100 * ic, 0) + '% of rated', true) +
      kpi('Continuous gain from cooling', sgn(100 * (ic / ic0 - 1), 1) + '%') + kpi('Time at peak before the limit', sec(b.tlim), true) +
      kpi('Same, without the cooling gain', sec(b0.tlim));
  }

  /* ---------- 10 fast-charge session ---------- */
  var CHG = { E: 100, ocv0: 3.45, ocv1: 0.70, Cmax: 2.5, Cend: 0.7, R800: 0.04, Cth: 600000, H: 7000, s0: 0.10, s1: 0.80 };
  function chgC(s) { return s <= 0.5 ? CHG.Cmax : CHG.Cmax + (CHG.Cend - CHG.Cmax) * Math.min(1, (s - 0.5) / 0.3); }
  function chgT(T) { return T <= 0 ? 0.1 : T < 20 ? 0.1 + 0.9 * T / 20 : T <= 45 ? 1 : T < 55 ? 1 - 0.07 * (T - 45) : 0.3; }
  function chargeSession(o) {
    var Ns = o.hv ? 192 : 96, Q = CHG.E * 1000 / (Ns * 3.8), R25 = o.hv ? CHG.R800 : CHG.R800 / 4;
    var s = CHG.s0, T = o.T0, t = 0, dt = 5, Est = 0, Ein = 0, Eh = 0, Pmax = 0, pts = [], lim = { cell: 0, conn: 0, station: 0 };
    while (s < CHG.s1 && t < 4 * 3600) {
      var ocv = Ns * (CHG.ocv0 + CHG.ocv1 * s), R = R25 * Math.exp(0.03 * (25 - T));
      var Ic = chgC(s) * chgT(T) * Q, Ip = (-ocv + Math.sqrt(ocv * ocv + 4 * R * o.Pst)) / (2 * R), I = Math.min(Ic, o.Ist, Ip);
      var who = I === Ic ? 'cell' : I === Ip ? 'station' : 'conn', P = (ocv + I * R) * I, qh = I * I * R;
      var heat = T < 20 ? CHG.H : 0, qc = o.cool * Math.max(0, Math.min(1, (T - 25) / 5));
      pts.push([100 * s, P / 1000, (ocv + Ic * R) * Ic / 1000, (ocv + o.Ist * R) * o.Ist / 1000]);
      lim[who] += dt; Pmax = Math.max(Pmax, P);
      Est += ocv * I * dt; Ein += (P + heat) * dt; Eh += qh * dt;
      s += I * dt / 3600 / Q; T += (qh + heat - qc) * dt / CHG.Cth; t += dt;
    }
    return { t: t, Est: Est / 3.6e6, Ein: Ein / 3.6e6, Eh: Eh / 3.6e6, Pmax: Pmax, Tend: T, pts: pts, lim: lim, done: s >= CHG.s1 };
  }
  var CH = ['ch-hv', 'ch-pst', 'ch-ist', 'ch-T', 'ch-cool', 'ch-c'];
  function chargeDemo() {
    if (!$('ch-chart')) return;
    var o = { hv: $('ch-hv').value === '800', Pst: num('ch-pst') * 1000, Ist: Math.max(num('ch-ist'), 1), T0: num('ch-T'), cool: num('ch-cool') * 1000 }, c = Math.max(num('ch-c'), 1);
    $('ch-Tv').textContent = (o.T0 < 0 ? '−' : '') + Math.abs(o.T0);
    var r = chargeSession(o), other = chargeSession(Object.assign({}, o, { hv: !o.hv })), mins = r.t / 60, km = r.Est * 1000 / c;
    var ymax = Math.ceil(Math.max(o.Pst, r.Pmax) / 1000 * 1.25 / 50) * 50;
    chart($('ch-chart'), { x: [10, 80], y: [0, ymax], xs: 10, xl: 'State of charge [%]', yl: 'Charging power [kW]',
      series: [{ pts: r.pts.map(function (p) { return [p[0], p[1]]; }), c: css('--ink'), w: 2.6 },
        { pts: r.pts.map(function (p) { return [p[0], o.Pst / 1000]; }), c: css('--s-grey'), w: 1.6, dash: '5 4' },
        { pts: r.pts.map(function (p) { return [p[0], p[3]]; }), c: css('--s-coral'), w: 1.6, dash: '5 4' },
        { pts: r.pts.map(function (p) { return [p[0], p[2]]; }), c: css('--s-mint'), w: 1.8, dash: '5 4' }] });
    var tot = r.lim.cell + r.lim.conn + r.lim.station, names = { cell: 'cells (BMS)', conn: 'current limit', station: 'station power' };
    var top = Object.keys(r.lim).sort(function (a, b) { return r.lim[b] - r.lim[a]; })[0];
    $('ch-out').innerHTML = kpi('Time 10 → 80%', r.done ? f(mins, 1) + ' min' : '> 4 h', true) + kpi('Peak power', f(r.Pmax / 1000, 0) + ' kW') +
      kpi('Average power', f(r.Ein * 60 / mins, 0) + ' kW') + kpi('Range added', f(km, 0) + ' km · ' + f(km / mins, 1) + ' km/min', true) +
      kpi('Limited mostly by', names[top] + ' (' + f(100 * r.lim[top] / tot, 0) + '% of the time)') + kpi('Heat in the pack', f(r.Eh, 2) + ' kWh · ends at ' + f(r.Tend, 0) + ' °C') +
      kpi('Same session at ' + (o.hv ? '400' : '800') + ' V', other.done ? f(other.t / 60, 1) + ' min' : '> 4 h') +
      kpi('Energy to precondition to 25 °C', o.T0 < 25 ? f(CHG.Cth * (25 - o.T0) / 3.6e6, 1) + ' kWh' : 'not needed');
  }

  /* ---------- 11 oil temperature trade-off ---------- */
  var OIL = { b: Math.log(30 / 7) / 60, n: 0.6, R: 0.03, Tref: 100 };
  function oilTrade(o) {
    var visc = o.Pv40 * Math.exp(-OIL.n * OIL.b * (o.Toil - 40)), k = 1 + ALPHA * (OIL.Tref - 20);
    var a = OIL.R * o.Pcu * o.load * o.load / k, den = 1 - a * ALPHA, Tw = den > 0 ? (o.Toil + a * (1 - 20 * ALPHA)) / den : Infinity;
    var cu = o.Pcu * o.load * o.load * (1 + ALPHA * (Tw - 20)) / k;
    return { visc: visc, cu: cu, tot: visc + cu, Tw: Tw };
  }
  var OI = ['oi-load', 'oi-pv', 'oi-pcu', 'oi-max', 'oi-v'];
  function oilDemo() {
    if (!$('oi-chart')) return;
    var p = { load: num('oi-load') / 100, Pv40: num('oi-pv'), Pcu: num('oi-pcu') }, Tmax = num('oi-max'), v = Math.max(num('oi-v'), 1);
    $('oi-loadv').textContent = num('oi-load');
    var vs = [], cs = [], ts = [], best = null, tmaxOil = null, ymax = 0;
    for (var T = 30; T <= 110; T += 1) {
      var r = oilTrade(Object.assign({}, p, { Toil: T }));
      vs.push([T, r.visc]); cs.push([T, r.cu]); ts.push([T, r.tot]); ymax = Math.max(ymax, r.tot);
      if (r.Tw <= Tmax) { tmaxOil = T; if (!best || r.tot < best.tot) best = { T: T, tot: r.tot, Tw: r.Tw }; }
    }
    var ref = oilTrade(Object.assign({}, p, { Toil: 60 })), vl = [];
    if (best) vl.push({ x: best.T, c: css('--s-mint') });
    if (tmaxOil !== null && tmaxOil < 110) vl.push({ x: tmaxOil, c: css('--s-coral') });
    chart($('oi-chart'), { x: [30, 110], y: [0, Math.ceil(ymax * 1.1 / 200) * 200], xs: 10, xl: 'Oil temperature at the motor inlet [°C]', yl: 'Loss [W]',
      series: [{ pts: vs, c: css('--s-blue'), w: 2 }, { pts: cs, c: css('--s-warm'), w: 2 }, { pts: ts, c: css('--ink'), w: 2.6 }], vlines: vl });
    $('oi-out').innerHTML = best ? kpi('Best oil temperature', f(best.T, 0) + ' °C', true) + kpi('Winding hot spot there', f(best.Tw, 0) + ' °C') +
      kpi('Total loss there', f(best.tot, 0) + ' W') + kpi('Hottest oil the winding allows', tmaxOil >= 110 ? '≥ 110 °C' : f(tmaxOil, 0) + ' °C') +
      kpi('Saving vs fixed 60 °C oil', ref.Tw <= Tmax ? f(ref.tot - best.tot, 0) + ' W' : '60 °C exceeds the limit', true) +
      kpi('Saving at ' + f(v, 0) + ' km/h', ref.Tw <= Tmax ? f((ref.tot - best.tot) / v, 2) + ' Wh/km' : '—')
      : kpi('Result', 'Winding limit exceeded at every oil temperature', true);
  }

  /* ---------- 12 mass compounding ---------- */
  function compound(o) {
    var den = 1 - o.d * o.s / o.rho; if (den <= 0) return null;
    var E = o.d * (o.c0 + o.s * (o.mg - o.mref)) / den, mp = E / o.rho;
    return { E: E, mp: mp, m: o.mg + mp, c: o.c0 + o.s * (o.mg + mp - o.mref), k: 1 / den };
  }
  var MC = ['mc-d', 'mc-c0', 'mc-mref', 'mc-s', 'mc-mg', 'mc-rho', 'mc-dc', 'mc-dm'];
  function compoundDemo() {
    if (!$('mc-out')) return;
    var o = { d: num('mc-d'), c0: num('mc-c0'), mref: num('mc-mref'), s: num('mc-s') / 100, mg: num('mc-mg'), rho: num('mc-rho') };
    var r = compound(o);
    if (!r) { $('mc-out').innerHTML = kpi('Result', 'No solution: the battery cannot carry its own mass for this range', true); return; }
    var a = compound(Object.assign({}, o, { c0: o.c0 - num('mc-dc') })), b = compound(Object.assign({}, o, { mg: o.mg - num('mc-dm') }));
    function d(x, k, u, n, sc) { return x ? sgn((x[k] - r[k]) / (sc || 1), n) + ' ' + u : '—'; }
    $('mc-out').innerHTML = kpi('Battery energy needed', f(r.E / 1000, 1) + ' kWh', true) + kpi('Battery mass', f(r.mp, 0) + ' kg') + kpi('Vehicle mass', f(r.m, 0) + ' kg') +
      kpi('Consumption at that mass', f(r.c, 1) + ' Wh/km') + kpi('Compounding factor', '× ' + f(r.k, 2)) +
      kpi('Consumption −' + f(num('mc-dc'), 0) + ' Wh/km', d(a, 'E', 'kWh', 2, 1000) + ' · ' + d(a, 'mp', 'kg', 0), true) +
      kpi('Body mass −' + f(num('mc-dm'), 0) + ' kg', d(b, 'E', 'kWh', 2, 1000) + ' · vehicle ' + d(b, 'm', 'kg', 0), true);
  }

  /* ---------- 05 cooling air: operating point, heat rejection, cooling drag ---------- */
  var CA = { rho: 1.2, Af: 0.25, Ar: 1.25, Cram: 0.8, Kcore: 20, Ksh: 1.5, dpf: 250, uf: 6, etaF: 0.35, UAr: 1500, ur: 3, nUA: 0.6, Cc: 3745, cp: 1006, Afront: 2.3 };
  function coolAir(o) {
    var q = 0.5 * CA.rho * o.V * o.V, K = CA.Kcore + CA.Ksh * Math.pow(1 / o.sh - 1, 2);
    function dpfan(u) { return o.fan > 0 ? Math.max(0, CA.dpf * o.fan * o.fan * (1 - u / (CA.uf * o.fan))) : 0; }
    function g(u) { return CA.Cram * q + dpfan(u) - 0.5 * CA.rho * (K + CA.Ar * CA.Ar) * u * u; }
    var u = 0;
    if (g(0) > 0) { var lo = 0, hi = 100; for (var k = 0; k < 100; k++) { var mid = (lo + hi) / 2; if (g(mid) > 0) lo = mid; else hi = mid; } u = (lo + hi) / 2; }
    var md = CA.rho * CA.Af * u, Ve = CA.Ar * u, D = md * (o.V - Ve), dpf = dpfan(u), Pfan = dpf * CA.Af * u / CA.etaF;
    var Ca = md * CA.cp, Q = 0, eps = 0, ntu = 0;
    if (u > 0) {
      var Cmin = Math.min(Ca, CA.Cc), Cr = Cmin / Math.max(Ca, CA.Cc), UA = CA.UAr * Math.pow(u / CA.ur, CA.nUA);
      ntu = UA / Cmin;
      eps = Cr < 1e-9 ? 1 - Math.exp(-ntu) : 1 - Math.exp(Math.pow(ntu, 0.22) / Cr * (Math.exp(-Cr * Math.pow(ntu, 0.78)) - 1));
      Q = eps * Cmin * o.itd;
    }
    return { u: u, md: md, Ve: Ve, D: D, K: K, dpf: dpf, Pfan: Pfan, Q: Q, eps: eps, ntu: ntu, counts: q > 0 ? 1000 * D / (q * CA.Afront) : NaN };
  }
  var CAI = ['ca-v', 'ca-sh', 'ca-fan', 'ca-itd', 'ca-q'];
  function coolDemo() {
    if (!$('ca-chart')) return;
    var vk = num('ca-v'), o = { V: vk / 3.6, sh: num('ca-sh') / 100, fan: parseFloat($('ca-fan').value), itd: num('ca-itd') }, need = num('ca-q') * 1000;
    $('ca-vv').textContent = vk; $('ca-shv').textContent = num('ca-sh');
    var r = coolAir(o), open = coolAir(Object.assign({}, o, { sh: 1 })), best = null;
    for (var s = 10; s <= 100; s += 1) { var x = coolAir(Object.assign({}, o, { sh: s / 100 })); if (x.Q >= need) { best = { s: s, r: x }; break; } }
    var hq = [], hqo = [], dem = [], dc = [], dco = [];
    for (var v = 0; v <= 160; v += 4) {
      var a = coolAir(Object.assign({}, o, { V: v / 3.6 })), b = coolAir(Object.assign({}, o, { V: v / 3.6, sh: 1, fan: 0 }));
      hq.push([v, a.Q / 1000]); hqo.push([v, b.Q / 1000]); dem.push([v, need / 1000]);
      if (v >= 20) { dc.push([v, a.counts]); dco.push([v, b.counts]); }
    }
    var ym = Math.max.apply(null, hqo.concat(hq).map(function (p) { return p[1]; }).concat([need / 1000]));
    chart($('ca-chart'), { x: [0, 160], y: [0, Math.ceil(ym * 1.1 / 10) * 10], xs: 20, xl: 'Vehicle speed [km/h]', yl: 'Heat rejection [kW]',
      series: [{ pts: dem, c: css('--s-coral'), w: 1.5, dash: '5 4' }, { pts: hqo, c: css('--s-grey'), w: 1.8, dash: '4 3' }, { pts: hq, c: css('--s-mint'), w: 2.6 }], vlines: [{ x: vk, c: css('--muted') }] });
    var dm = Math.max(10, Math.max.apply(null, dco.concat(dc).map(function (p) { return p[1]; })));
    chart($('ca-chart2'), { x: [0, 160], y: [0, Math.ceil(dm * 1.1 / 10) * 10], xs: 20, xl: 'Vehicle speed [km/h]', yl: 'Cooling drag [counts]',
      series: [{ pts: dco, c: css('--s-grey'), w: 1.8, dash: '4 3' }, { pts: dc, c: css('--s-warm'), w: 2.6 }], vlines: [{ x: vk, c: css('--muted') }] });
    var bestTxt = best ? best.s + '% · ' + (isFinite(best.r.counts) ? f(best.r.counts, 0) + ' counts' : 'standstill') : 'demand not met even fully open';
    var save = best && vk > 0 ? (open.D - best.r.D) * o.V / vk : NaN;
    $('ca-out').innerHTML = kpi('Face velocity', f(r.u, 2) + ' m/s') + kpi('Air mass flow', f(r.md, 2) + ' kg/s') + kpi('Effectiveness · NTU', f(r.eps, 2) + ' · ' + f(r.ntu, 2)) +
      kpi('Heat rejection', f(r.Q / 1000, 1) + ' kW · ' + (r.Q >= need ? 'meets' : 'below') + ' demand', true) +
      kpi('Cooling drag', f(r.D, 0) + ' N · ' + (isFinite(r.counts) ? f(r.counts, 0) + ' counts' : '—')) + kpi('Fan electrical power', f(r.Pfan, 0) + ' W') +
      kpi('Smallest shutter opening that meets the demand', bestTxt, true) + kpi('Wheel energy saved vs fully open', isFinite(save) ? f(save, 2) + ' Wh/km' : '—');
  }

  /* ---------- 07 cold plates: series versus parallel ---------- */
  var CP = { rho: 1070, cp: 3500, kpl: 0.03, kman: 0.01, Rref: 0.004, Qref: 10, Rcond: 0.008, etaP: 0.3 };
  function cpC(lmin) { return lmin / 60000 * CP.rho * CP.cp; }
  function cpRc(lmin) { return CP.Rref * Math.pow(CP.Qref / lmin, 0.8); }
  function coldPlate(o) {
    var N = Math.max(1, Math.round(o.N)), q = o.Q * 1000 / N, T = [], dp;
    if (!o.par) {
      var Cs = cpC(o.flow), Rc = cpRc(o.flow);
      for (var i = 0; i < N; i++) T.push(o.Tin + i * q / Cs + q / (2 * Cs) + q * (Rc + CP.Rcond));
      dp = N * CP.kpl * o.flow * o.flow;
    } else {
      for (var j = 0; j < N; j++) {
        var fi = o.flow / N * (1 + (N > 1 ? o.mal * (1 - 2 * j / (N - 1)) : 0)), Ci = cpC(fi);
        T.push(o.Tin + q / (2 * Ci) + q * (cpRc(fi) + CP.Rcond));
      }
      dp = CP.kpl * Math.pow(o.flow / N, 2) + CP.kman * o.flow * o.flow;
    }
    var mx = Math.max.apply(null, T), mn = Math.min.apply(null, T);
    return { T: T, max: mx, spread: mx - mn, dp: dp, P: dp * 1000 * o.flow / 60000 / CP.etaP };
  }
  var CPI = ['cp-n', 'cp-q', 'cp-f', 'cp-tin', 'cp-mal'];
  function coldDemo() {
    if (!$('cp-chart')) return;
    var o = { N: Math.min(12, Math.max(2, Math.round(num('cp-n')))), Q: num('cp-q'), flow: Math.max(num('cp-f'), 0.5), Tin: num('cp-tin'), mal: Math.min(0.9, Math.max(0, num('cp-mal') / 100)) };
    $('cp-malv').textContent = num('cp-mal');
    var s = coldPlate(Object.assign({}, o, { par: false })), p = coldPlate(Object.assign({}, o, { par: true }));
    var feq = o.flow * Math.cbrt(s.P / p.P), e = coldPlate(Object.assign({}, o, { par: true, flow: feq })), N = s.T.length, bars = [], extra = '';
    s.T.forEach(function (t, i) {
      bars.push({ x0: i + 0.12, x1: i + 0.37, y: t, c: css('--s-coral') }, { x0: i + 0.38, x1: i + 0.63, y: p.T[i], c: css('--s-mint') }, { x0: i + 0.64, x1: i + 0.89, y: e.T[i], c: css('--s-blue') });
    });
    var y0 = Math.floor(o.Tin / 5) * 5, y1 = Math.ceil(Math.max(s.max, p.max, e.max) / 5) * 5 + 5;
    var oc = { x: [1e-6, N], y: [y0, y1], xs: 1000, xl: 'Module (coolant enters at module 1)', yl: 'Hottest cell [°C]', bars: bars };
    var ax = chart($('cp-chart'), oc);
    for (var i = 0; i < N; i++) extra += '<text x="' + ax.X(i + 0.5) + '" y="' + (ax.Y(y0) + 16) + '" text-anchor="middle">' + (i + 1) + '</text>';
    oc.extra = extra; chart($('cp-chart'), oc);
    function row(n, r, fl) { return '<tr><td>' + n + '</td><td>' + f(fl, 1) + ' L/min</td><td>' + f(r.max, 1) + ' °C</td><td>' + f(r.spread, 1) + ' K</td><td>' + f(r.dp, 1) + ' kPa</td><td>' + f(r.P, 1) + ' W</td></tr>'; }
    $('cp-table').innerHTML = '<tr><th>Layout</th><th>Total flow</th><th>Hottest cell</th><th>Spread</th><th>Δp</th><th>Pump power</th></tr>' +
      row('Series', s, o.flow) + row('Parallel, same flow', p, o.flow) + row('Parallel, same pump power as series', e, feq);
  }

  /* ---------- 06 front/rear torque split ---------- */
  var TS = { Tpk: 350, kcu: 12000 / (350 * 350), a: 0.05, b: 4e-6, r: 0.36, G: 9 };
  function tsIron(n) { return TS.a * n + TS.b * n * n; }
  function torqueSplit(T, n, x, off) {
    var Tf = x * T, Tr = (1 - x) * T;
    if (Tf > TS.Tpk + 1e-9 || Tr > TS.Tpk + 1e-9) return NaN;
    return TS.kcu * Tf * Tf + (off ? 0 : tsIron(n)) + TS.kcu * Tr * Tr + tsIron(n);
  }
  var TSI = ['ts-T', 'ts-n', 'ts-disc'];
  function splitDemo() {
    if (!$('ts-chart')) return;
    var T = num('ts-T') / 100 * TS.Tpk, n = num('ts-n'), disc = $('ts-disc').value === '1';
    $('ts-Tv').textContent = num('ts-T'); $('ts-nv').textContent = n;
    var w = n * Math.PI / 30, P = T * w, vk = w * TS.r / TS.G * 3.6, pts = [], best = null;
    for (var i = 0; i <= 100; i++) { var L = torqueSplit(T, n, i / 100, false); pts.push([i, L]); if (isFinite(L) && (!best || L < best.L)) best = { x: i, L: L, off: false }; }
    var Loff = disc ? torqueSplit(T, n, 0, true) : NaN;
    if (isFinite(Loff) && (!best || Loff < best.L)) best = { x: 0, L: Loff, off: true };
    var L50 = torqueSplit(T, n, 0.5, false), Lr = torqueSplit(T, n, 0, false);
    var ys = pts.map(function (p) { return p[1]; }).filter(isFinite).concat(isFinite(Loff) ? [Loff] : []);
    var ymax = ys.length ? Math.max.apply(null, ys) : 1;
    var dots = isFinite(Loff) ? [{ x: 0, y: Loff, c: css('--s-mint'), r: 6 }] : [];
    if (best) dots.push({ x: best.x, y: best.L, c: css('--s-coral'), r: 4 });
    chart($('ts-chart'), { x: [0, 100], y: [0, Math.ceil(ymax * 1.15 / 200) * 200 || 200], xs: 10, xl: 'Front share of torque [%]', yl: 'Drive-unit loss [W]',
      series: [{ pts: pts, c: css('--ink'), w: 2.4 }], dots: dots });
    var bestTxt = !best ? 'demand exceeds both motors' : best.off ? 'rear only, front disconnected' : best.x === 50 ? '50 / 50' : best.x + '% front';
    $('ts-out').innerHTML = kpi('Vehicle speed', f(vk, 0) + ' km/h') + kpi('Output power', f(P / 1000, 1) + ' kW') + kpi('Iron and spin loss per motor', f(tsIron(n), 0) + ' W') +
      kpi('Best split', bestTxt, true) + kpi('Loss at best split', best ? f(best.L, 0) + ' W' : '—') + kpi('Loss at 50 / 50', isFinite(L50) ? f(L50, 0) + ' W' : '—') +
      kpi('Loss, rear only, front still spinning', isFinite(Lr) ? f(Lr, 0) + ' W' : 'exceeds rear motor') +
      kpi('Saving vs 50 / 50', best && isFinite(L50) && vk > 0 ? f(L50 - best.L, 0) + ' W · ' + f((L50 - best.L) / vk, 2) + ' Wh/km' : '—', true);
  }

  /* ---------- table of contents ---------- */
  function toc() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.notes-toc a'));
    if (!('IntersectionObserver' in window)) return;
    var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (a) { a.classList.remove('active'); }); var a = map[e.target.id]; if (a) a.classList.add('active'); } });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var el = $(id); if (el) io.observe(el); });
  }

  /* ---------- wire up ---------- */
  on(CV, converter); converter();
  on(RL, roadLoad); roadLoad();
  on(['cd-noise', 'cd-wind', 'cd-both'], function () { coast(false); });
  if ($('cd-run')) $('cd-run').addEventListener('click', function () { coast(true); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-cycle]'), function (b) {
    b.addEventListener('click', function () {
      current = b.getAttribute('data-cycle');
      Array.prototype.forEach.call(document.querySelectorAll('[data-cycle]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      cycles();
    });
  });
  if (window.EPA_UDDS && window.EPA_HWFET) { on(CY, cycles); cycles(); }
  on(['mo-T', 'mo-fe'], motorMap); colorbar(); motorMap();
  if ($('mo-map')) $('mo-map').addEventListener('click', motorClick);
  on(['pu-qb', 'pu-qt', 'pu-em'], pump); pump();
  on(['wi-T', 'wi-v', 'wi-base', 'wi-ua', 'wi-bat'], winter); winter();
  on(IV, inverterDemo); inverterDemo();
  on(WDI, windDemo); windDemo();
  on(CH, chargeDemo); chargeDemo();
  on(OI, oilDemo); oilDemo();
  on(MC, compoundDemo); compoundDemo();
  on(CAI, coolDemo); coolDemo();
  on(CPI, coldDemo); coldDemo();
  on(TSI, splitDemo); splitDemo();
  toc();
  window.EVNotes = { steady: steady, simulate: simulate, motor: motor, H0: H0, E0: E0, cop: cop, quadfit: quadfit, inverter: inverter, windSteady: windSteady, windCont: windCont, windBurst: windBurst, windRth: windRth, chargeSession: chargeSession, oilTrade: oilTrade, compound: compound, coolAir: coolAir, coldPlate: coldPlate, torqueSplit: torqueSplit, tsIron: tsIron };
})();
