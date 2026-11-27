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

  /* ---------- 06 inverter cooling: junction temperature with a Foster network ---------- */
  // Per switch position: four RC terms from die to coolant (die, die attach, substrate, baseplate and cold plate).
  // The last term is the convective one and scales with coolant flow^-0.8. Six switch positions share the coolant.
  var IJ = { R: { ind: [0.015, 0.03, 0.045, 0.06], dir: [0.015, 0.03, 0.035, 0.02] }, tau: [0.002, 0.02, 0.15, 1.5], Qref: 8, n: 6, rho: 1050, cp: 3500, t0: 2, after: 10, dt: 0.01 };
  function junction(o) {
    var R = IJ.R[o.cool].slice(); R[3] *= Math.pow(IJ.Qref / o.flow, 0.8);
    var Rt = R[0] + R[1] + R[2] + R[3], mcp = o.flow / 60000 * IJ.rho * IJ.cp;
    function Tref(P) { return o.Tin + IJ.n * P / (2 * mcp); }               // mean coolant temperature along the cold plate
    var Ti = R.map(function (r) { return o.P0 * r; }), T0 = Tref(o.P0) + Rt * o.P0, pts = [], Tmax = T0, tend = IJ.t0 + o.tp + IJ.after;
    var N = Math.round(tend / IJ.dt);
    pts.push([0, T0]);
    for (var k = 1; k <= N; k++) {
      var t = k * IJ.dt, tm = t - IJ.dt / 2, P = tm > IJ.t0 && tm < IJ.t0 + o.tp ? o.P1 : o.P0;
      for (var i = 0; i < 4; i++) { var a = Math.exp(-IJ.dt / IJ.tau[i]); Ti[i] = P * R[i] + (Ti[i] - P * R[i]) * a; }
      var Tj = Tref(P) + Ti[0] + Ti[1] + Ti[2] + Ti[3];
      Tmax = Math.max(Tmax, Tj); pts.push([t, Tj]);
    }
    return { R: R, Rt: Rt, T0: T0, Tmax: Tmax, dT: Tmax - T0, Tss: Tref(o.P1) + Rt * o.P1, dTc: IJ.n * o.P1 / mcp, pts: pts };
  }
  var IJI = ['ij-cool', 'ij-tin', 'ij-flow', 'ij-p0', 'ij-p1', 'ij-tp'];
  function junctionDemo() {
    if (!$('ij-chart')) return;
    var o = { cool: $('ij-cool').value === 'dir' ? 'dir' : 'ind', Tin: num('ij-tin'), flow: Math.max(num('ij-flow'), 0.5), P0: num('ij-p0'), P1: num('ij-p1'), tp: Math.max(num('ij-tp'), 0.1) };
    var r = junction(o), oth = junction(Object.assign({}, o, { cool: o.cool === 'dir' ? 'ind' : 'dir' })), lim = 175;
    function thin(p) { var s = Math.max(1, Math.floor(p.length / 400)); return p.filter(function (_, i) { return i % s === 0 || i === p.length - 1; }); }
    var tend = r.pts[r.pts.length - 1][0], ymax = Math.ceil(Math.max(lim + 10, r.Tmax, oth.Tmax) / 20) * 20, ymin = Math.floor(o.Tin / 20) * 20;
    chart($('ij-chart'), { x: [0, tend], y: [ymin, ymax], xl: 'Time [s]', yl: 'Junction temperature [°C]',
      series: [{ pts: [[0, lim], [tend, lim]], c: css('--s-coral'), w: 1.5, dash: '5 4' }, { pts: thin(oth.pts), c: css('--s-grey'), w: 1.8, dash: '4 3' }, { pts: thin(r.pts), c: css('--s-blue'), w: 2.6 }] });
    var dI = o.cool === 'ind' ? r.dT : oth.dT, dD = o.cool === 'ind' ? oth.dT : r.dT, life = Math.pow(dI / dD, 5);
    $('ij-out').innerHTML = kpi('Thermal resistance, junction to coolant', f(r.Rt, 3) + ' K/W') + kpi('Before the pulse', f(r.T0, 1) + ' °C') +
      kpi('Peak junction temperature', f(r.Tmax, 1) + ' °C · margin ' + f(lim - r.Tmax, 0) + ' K', true) + kpi('Swing ΔT<sub>j</sub>', f(r.dT, 1) + ' K') +
      kpi('Other cooling: peak · swing', f(oth.Tmax, 1) + ' °C · ' + f(oth.dT, 1) + ' K') +
      kpi('Power-cycling life, direct vs indirect', '× ' + (life >= 10 ? f(life, 0) : f(life, 1)) + ' (ΔT<sub>j</sub><sup>−5</sup>)', true) +
      kpi('If the pulse lasted for ever', f(r.Tss, 0) + ' °C') + kpi('Coolant rise across the module', f(r.dTc, 1) + ' K');
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

  /* ---------- 10 reading a charging curve: voltage, current, power and loss against state of charge ---------- */
  // The same 6,600 cells as 220 in series x 30 in parallel (~900 V class) or 110 x 60 (~450 V class).
  var CCV = { cells: 6600, Ah: 5, Rc: 0.012, c0: 2.4, cEnd: 0.1, sK: 0.2, ex: 1 };
  function ccOcv(s) { return 3.18 + 0.42 * (1 - Math.exp(-s / 0.04)) + 0.6 * Math.pow(s, 1.6); }     // cell open-circuit voltage, 3.18-4.20 V
  function ccRate(s) { return s <= CCV.sK ? CCV.c0 : CCV.cEnd + (CCV.c0 - CCV.cEnd) * Math.pow((1 - s) / (1 - CCV.sK), CCV.ex); }   // BMS limit [C]
  function chgPoint(Ns, s, o) {
    var Np = CCV.cells / Ns, Rp = Ns * CCV.Rc / Np, ocv = Ns * ccOcv(s), Rt = Rp + o.Rpath;
    var Icell = ccRate(s) * Np * CCV.Ah, Ist = (-ocv + Math.sqrt(ocv * ocv + 4 * Rt * o.Pst)) / (2 * Rt), I = Math.min(Icell, o.Imax, Ist);
    var V = ocv + I * Rp, who = I === Icell ? 'cells' : I === Ist ? 'station' : 'current';
    return { ocv: ocv, V: V, I: I, P: V * I, Pcell: I * I * Rp, Ppath: I * I * o.Rpath, Pst: V * I + I * I * o.Rpath, who: who, Rp: Rp, Q: Np * CCV.Ah };
  }
  function chgCurve(o) {
    var out = {};
    [220, 110].forEach(function (Ns) {
      var pts = [], best = null, t = 0, Ecell = 0, Epath = 0, ds = 0.001;
      for (var k = 0; k <= 100; k++) { var s = Math.max(0.005, Math.min(0.995, k / 100)), p = chgPoint(Ns, s, o); pts.push([100 * s, p]); if (!best || p.P > best.P) best = Object.assign({ soc: 100 * s }, p); }
      for (var s2 = 0.1 + ds / 2; s2 < 0.8; s2 += ds) {          // 10 -> 80 %: dt = Q ds / I
        var q = chgPoint(Ns, s2, o), dt = q.Q * 3600 * ds / q.I; t += dt; Ecell += q.Pcell * dt; Epath += q.Ppath * dt;
      }
      out[Ns] = { pts: pts, peak: best, t: t, Ecell: Ecell / 3.6e6, Epath: Epath / 3.6e6 };
    });
    return out;
  }
  var CCI = ['cc-soc', 'cc-pst', 'cc-imax', 'cc-rp'];
  function chgCurveDemo() {
    if (!$('cc-v')) return;
    var o = { Pst: num('cc-pst') * 1000, Imax: Math.max(num('cc-imax'), 1), Rpath: num('cc-rp') / 1000 }, sv = num('cc-soc');
    $('cc-socv').textContent = sv;
    var r = chgCurve(o), A = r[220], B = r[110], cA = css('--s-blue'), cB = css('--s-violet');
    function ser(d, key, k) { return d.pts.map(function (p) { return [p[0], p[1][key] / (k || 1)]; }); }
    var vl = [{ x: sv, c: css('--muted') }];
    chart($('cc-v'), { x: [0, 100], y: [300, 1000], xs: 10, xl: 'State of charge [%]', yl: 'Pack voltage [V]', vlines: vl,
      series: [{ pts: ser(A, 'ocv'), c: cA, w: 1.4, dash: '4 3' }, { pts: ser(A, 'V'), c: cA, w: 2.6 }, { pts: ser(B, 'ocv'), c: cB, w: 1.4, dash: '4 3' }, { pts: ser(B, 'V'), c: cB, w: 2.6 }] });
    var pm = Math.ceil(Math.max(o.Pst / 1000, A.peak.P / 1000, B.peak.P / 1000) * 1.1 / 50) * 50;
    chart($('cc-p'), { x: [0, 100], y: [0, pm], xs: 10, xl: 'State of charge [%]', yl: 'Charging power [kW]', vlines: vl,
      series: [{ pts: [[0, o.Pst / 1000], [100, o.Pst / 1000]], c: css('--s-grey'), w: 1.5, dash: '5 4' }, { pts: ser(A, 'P', 1000), c: cA, w: 2.6 }, { pts: ser(B, 'P', 1000), c: cB, w: 2.6 }] });
    var im = Math.ceil(Math.max(o.Imax, A.peak.I, B.peak.I) * 1.1 / 100) * 100;
    chart($('cc-i'), { x: [0, 100], y: [0, im], xs: 10, xl: 'State of charge [%]', yl: 'Current [A]', vlines: vl,
      series: [{ pts: [[0, o.Imax], [100, o.Imax]], c: css('--s-coral'), w: 1.5, dash: '5 4' }, { pts: ser(A, 'I'), c: cA, w: 2.6 }, { pts: ser(B, 'I'), c: cB, w: 2.6 }] });
    var s = Math.max(0.005, Math.min(0.995, sv / 100)), a = chgPoint(220, s, o), b = chgPoint(110, s, o);
    var names = { cells: 'cells (BMS)', current: 'current limit', station: 'station power' };
    function row(lbl, p) { return kpi(lbl + ' at ' + sv + '%', f(p.V, 0) + ' V × ' + f(p.I, 0) + ' A = ' + f(p.P / 1000, 0) + ' kW', true) +
      kpi('Limited by · heat in cells · in conductors', names[p.who] + ' · ' + f(p.Pcell / 1000, 1) + ' kW · ' + f(p.Ppath, 0) + ' W'); }
    $('cc-out').innerHTML = row('~900 V (220s30p)', a) + row('~450 V (110s60p)', b) +
      kpi('Peak power · at', f(A.peak.P / 1000, 0) + ' kW at ' + f(A.peak.soc, 0) + '%, ' + f(A.peak.V, 0) + ' V, ' + f(A.peak.I, 0) + ' A · ' + f(B.peak.P / 1000, 0) + ' kW at ' + f(B.peak.V, 0) + ' V, ' + f(B.peak.I, 0) + ' A') +
      kpi('10 → 80%: time · cell heat · conductor heat', f(A.t / 60, 1) + ' min · ' + f(A.Ecell, 2) + ' kWh · ' + f(A.Epath * 1000, 0) + ' Wh  vs  ' + f(B.t / 60, 1) + ' min · ' + f(B.Ecell, 2) + ' kWh · ' + f(B.Epath * 1000, 0) + ' Wh');
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

  /* ---------- 05 cooling air: cheapest shutter and fan setting (arbitration) ---------- */
  // Searches the settings allowed by the usual sequencing (fan off at any shutter opening from 10 to 100% in 1% steps,
  // or shutters fully open with the fan at 5-100% in 5% steps) for the one that meets the heat demand at the lowest
  // battery power: drag power / drivetrain efficiency + fan power.
  var CAB = { eta: 0.9 };
  function coolCost(r, V) { var Pd = r.D * V / CAB.eta; return { Pd: Pd, Pf: r.Pfan, P: Pd + r.Pfan }; }
  function coolBest(o) {
    var best = null, open = null;
    for (var i = 0; i <= 20; i++) {
      var fan = i / 20;
      for (var p = (fan > 0 ? 100 : 10); p <= 100; p++) {
        var r = coolAir({ V: o.V, sh: p / 100, fan: fan, itd: o.itd });
        if (r.Q < o.need) continue;
        var c = coolCost(r, o.V), x = { sh: p, fan: fan, Pd: c.Pd, Pf: c.Pf, P: c.P, Q: r.Q, counts: r.counts };
        if (!best || c.P < best.P - 1e-9) best = x;
        if (p === 100 && !open) open = x;      // policy "shutters always open, lowest fan speed that meets the demand"
      }
    }
    return { best: best, open: open };
  }
  var ARI = ['ar-v', 'ar-q', 'ar-itd'];
  function arbDemo() {
    if (!$('ar-chart')) return;
    var vk = num('ar-v'), need = num('ar-q') * 1000, itd = num('ar-itd');
    $('ar-vv').textContent = vk;
    var pd = [], pf = [], pt = [], po = [], ps = [], pfan = [], gap = null;
    for (var v = 0; v <= 160; v += 4) {
      var b = coolBest({ V: v / 3.6, itd: itd, need: need });
      if (!b.best) { gap = v; continue; }
      if (v >= 10) { pd.push([v, b.best.Pd / v]); pf.push([v, b.best.Pf / v]); pt.push([v, b.best.P / v]); po.push([v, b.open.P / v]); }   // Wh/km
      ps.push([v, b.best.sh]); pfan.push([v, 100 * b.best.fan]);
    }
    var ym = Math.max(5, Math.max.apply(null, po.concat(pt).map(function (p) { return p[1]; })));
    chart($('ar-chart'), { x: [0, 160], y: [Math.min(0, Math.floor(Math.min.apply(null, pd.map(function (p) { return p[1]; }).concat([0])))), Math.ceil(ym * 1.1 / 5) * 5], xs: 20,
      xl: 'Vehicle speed [km/h]', yl: 'Cooling air [Wh/km]',
      series: [{ pts: po, c: css('--s-grey'), w: 1.8, dash: '4 3' }, { pts: pd, c: css('--s-warm'), w: 2 }, { pts: pf, c: css('--s-mint'), w: 2 }, { pts: pt, c: css('--s-blue'), w: 2.8 }],
      vlines: [{ x: vk, c: css('--muted') }] });
    chart($('ar-chart2'), { x: [0, 160], y: [0, 100], xs: 20, ys: 25, xl: 'Vehicle speed [km/h]', yl: 'Setting [%]',
      series: [{ pts: ps, c: css('--s-violet'), w: 2.4 }, { pts: pfan, c: css('--s-mint'), w: 2.4 }], vlines: [{ x: vk, c: css('--muted') }] });
    var r = coolBest({ V: vk / 3.6, itd: itd, need: need }), b = r.best, o = r.open;
    function wh(P) { return vk > 0 ? f(P / vk, 2) + ' Wh/km' : 'standstill'; }
    $('ar-out').innerHTML = !b ? kpi('Cheapest setting at ' + vk + ' km/h', 'demand not met even fully open with full fan', true) + (gap !== null ? kpi('Note', 'reduce the demand or raise the temperature difference') : '') :
      kpi('Cheapest setting at ' + vk + ' km/h', 'shutter ' + b.sh + '% · fan ' + f(100 * b.fan, 0) + '%', true) +
      kpi('Drag power (battery)', f(b.Pd, 0) + ' W') + kpi('Fan power', f(b.Pf, 0) + ' W') +
      kpi('Total for cooling air', f(b.P, 0) + ' W · ' + wh(b.P), true) +
      kpi('Shutters always open, fan as needed', f(o.P, 0) + ' W · fan ' + f(100 * o.fan, 0) + '%') +
      kpi('Saved by closing the shutters', f(o.P - b.P, 0) + ' W · ' + wh(o.P - b.P));
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

  /* ---------- 07 pack builder: series and parallel ---------- */
  function pack(o) {
    var V = o.Ns * o.Vc, Q = o.Np * o.Ah, R = o.Ns / o.Np * o.Rc, I = V > 0 ? o.P / V : 0;
    return { V: V, Q: Q, E: V * Q, R: R, I: I, Icell: I / o.Np, C: Q > 0 ? I / Q : 0, heat: I * I * R, ext: I * I * o.Rx, sag: I * R, n: o.Ns * o.Np };
  }
  function shown(n, max, keep) { var a = []; if (n <= max) { for (var i = 0; i < n; i++) a.push(i); return a; } for (var j = 0; j < keep; j++) a.push(j); a.push(-1); a.push(n - 1); return a; }
  function packDraw(svg, o, r) {
    var cols = shown(o.Ns, 6, 3), rows = shown(o.Np, 4, 2), W = 640, L = 64, Rm = 40, cw = (W - L - Rm) / cols.length, rh = 34, top = 78;
    var H = top + (rows.length - 1) * rh + 92, ink = css('--ink'), mint = css('--s-mint'), warm = css('--s-warm'), mut = css('--muted'), blue = css('--s-blue');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var s = '', ybot = top + (rows.length - 1) * rh, lt = top - 22;
    function T(x, y, t, c, a, sz) { return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="' + (a || 'middle') + '" style="fill:' + (c || mut) + (sz ? ';font-size:' + sz + 'px' : '') + '">' + t + '</text>'; }
    function Ln(x1, y1, x2, y2, c, w, d) { return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + c + '" stroke-width="' + (w || 1.5) + '"' + (d ? ' stroke-dasharray="' + d + '"' : '') + '/>'; }
    var prevXr = null, gap = false;
    cols.forEach(function (c, i) {
      var cx = L + cw * (i + 0.5), xl = cx - 28, xr = cx + 28;
      if (c < 0) { gap = true; s += T(cx, (top + ybot) / 2 + 5, '· · ·', ink, 'middle', 16) + T(cx, top + (rows.length - 1) * rh + 22, (o.Ns - 4) + ' more groups', mut, 'middle', 10); return; }
      s += Ln(xl, top - 8, xl, ybot + 8, ink, 2) + Ln(xr, top - 8, xr, ybot + 8, ink, 2);
      rows.forEach(function (rw, j) {
        var y = top + j * rh;
        if (rw < 0) { s += T(cx, y + 5, '⋮', ink, 'middle', 16); return; }
        s += Ln(xl, y, cx - 17, y, ink, 1.2) + Ln(cx + 17, y, xr, y, ink, 1.2);
        s += '<rect x="' + (cx - 17).toFixed(1) + '" y="' + (y - 10) + '" width="34" height="20" rx="3" fill="none" stroke="' + mint + '" stroke-width="1.6"/>';
        s += T(cx - 10, y + 4, '−', mut, 'middle', 10) + T(cx + 10, y + 4, '+', mint, 'middle', 10);
      });
      s += T(cx, lt - 6, f((c + 1) * o.Vc, (c + 1) * o.Vc < 100 ? 1 : 0) + ' V', mint, 'middle', 12);
      if (prevXr !== null) {
        var d = gap ? '4 3' : '';
        s += Ln(prevXr, top - 8, prevXr, lt + 4, warm, 2, d) + Ln(prevXr, lt + 4, xl, lt + 4, warm, 2, d) + Ln(xl, lt + 4, xl, top - 8, warm, 2, d);
      }
      prevXr = xr; gap = false;
    });
    var x0 = L + cw * 0.5 - 28, x1 = L + cw * (cols.length - 0.5) + 28, yb = ybot + 30;
    s += T(x0 - 8, top + 4, '−', ink, 'end', 16) + T(x1 + 8, top + 4, '+', ink, 'start', 16);
    s += Ln(x0, yb, x1, yb, blue, 1.5) + Ln(x0, yb - 5, x0, yb + 5, blue, 1.5) + Ln(x1, yb - 5, x1, yb + 5, blue, 1.5);
    s += T((x0 + x1) / 2, yb + 18, 'Series: voltages add → ' + o.Ns + ' × ' + f(o.Vc, 2) + ' V = ' + f(r.V, 1) + ' V; the full current ' + f(r.I, 1) + ' A flows through every group', blue, 'middle', 11);
    s += T((x0 + x1) / 2, yb + 36, 'Parallel: same voltage, currents add → each cell carries ' + f(r.I, 1) + ' / ' + o.Np + ' = ' + f(r.Icell, 2) + ' A; capacity ' + o.Np + ' × ' + f(o.Ah, 1) + ' Ah = ' + f(r.Q, 1) + ' Ah', mint, 'middle', 11);
    s += T(16, (top + ybot) / 2, o.Np + ' in parallel', mut, 'middle', 10).replace('<text ', '<text transform="rotate(-90 16 ' + ((top + ybot) / 2).toFixed(1) + ')" ');
    svg.innerHTML = s;
  }
  var PKI = ['pk-ns', 'pk-np', 'pk-vc', 'pk-ah', 'pk-rc', 'pk-p', 'pk-rx'];
  function packDemo() {
    if (!$('pk-svg')) return;
    var o = { Ns: Math.max(1, Math.round(num('pk-ns'))), Np: Math.max(1, Math.round(num('pk-np'))), Vc: num('pk-vc'), Ah: num('pk-ah'), Rc: num('pk-rc') / 1000, P: num('pk-p') * 1000, Rx: num('pk-rx') / 1000 };
    var r = pack(o);
    packDraw($('pk-svg'), o, r);
    $('pk-out').innerHTML = kpi('Cells', o.Ns + 's' + o.Np + 'p = ' + r.n) + kpi('Pack voltage', f(r.V, 1) + ' V', true) + kpi('Capacity', f(r.Q, 1) + ' Ah') + kpi('Energy', f(r.E / 1000, 2) + ' kWh', true) +
      kpi('Pack resistance', f(r.R * 1000, 1) + ' mΩ') + kpi('Pack current', f(r.I, 1) + ' A', true) + kpi('Current per cell · C-rate', f(r.Icell, 2) + ' A · ' + f(r.C, 2) + ' C') +
      kpi('Voltage sag I·R', f(r.sag, 1) + ' V') + kpi('Heat inside the cells', f(r.heat, 0) + ' W') + kpi('Heat in the external resistance', f(r.ext, 0) + ' W');
  }

  /* ---------- 07 one cell: equivalent circuit and pulse test ---------- */
  var CELL = { Q: 5, R0: 0.015, R1: 0.005, t1: 1, R2: 0.008, t2: 30, B: 2985, Vmin: 2.5, pre: 5, post: 60 };
  function ocv(s) { return 3.0 + 1.5 * s - 1.2 * s * s + 0.9 * s * s * s; }
  function cellK(T) { return Math.exp(CELL.B * (1 / (T + 273.15) - 1 / 298.15)); }
  function cellPulse(o) {
    var k = cellK(o.T), R0 = CELL.R0 * k, R1 = CELL.R1 * k, R2 = CELL.R2 * k, ta = CELL.pre, tb = CELL.pre + o.tp, tend = tb + CELL.post;
    function at(t) {
      var I = t >= ta && t < tb ? o.I : 0, v1 = 0, v2 = 0, q = 0, d, e;
      if (t >= ta && t < tb) { d = t - ta; v1 = o.I * R1 * (1 - Math.exp(-d / CELL.t1)); v2 = o.I * R2 * (1 - Math.exp(-d / CELL.t2)); q = o.I * d; }
      else if (t >= tb) { d = o.tp; e = t - tb; v1 = o.I * R1 * (1 - Math.exp(-d / CELL.t1)) * Math.exp(-e / CELL.t1); v2 = o.I * R2 * (1 - Math.exp(-d / CELL.t2)) * Math.exp(-e / CELL.t2); q = o.I * d; }
      var U = ocv(o.soc - q / 3600 / CELL.Q);
      return { V: U - I * R0 - v1 - v2, U: U, I: I };
    }
    var samples = [], j, t;
    for (j = 0; (t = (j + 0.5) / o.fs) < tend; j++) samples.push([t, at(t).V]);
    var before = null, after = null, end = null;
    samples.forEach(function (p) { if (p[0] < ta) before = p; if (!after && p[0] >= ta) after = p; if (p[0] < tb) end = p; });
    var last = at(tb - 1e-9), K = o.T + 273.15, R10 = R0 + R1 * (1 - Math.exp(-10 / CELL.t1)) + R2 * (1 - Math.exp(-10 / CELL.t2));
    var U0 = ocv(o.soc), Imax = Math.max(0, (U0 - CELL.Vmin) / R10), vmin = Infinity;
    for (t = 0; t <= tend; t += 0.01) vmin = Math.min(vmin, at(t).V);
    return {
      at: at, samples: samples, ta: ta, tb: tb, tend: tend, R0: R0, R1: R1, R2: R2, U0: U0,
      R0est: o.I ? (before[1] - after[1]) / o.I : NaN, Rpulse: o.I ? (before[1] - end[1]) / o.I : NaN,
      Rtrue: R0 + R1 * (1 - Math.exp(-o.tp / CELL.t1)) + R2 * (1 - Math.exp(-o.tp / CELL.t2)),
      qirr: o.I * (last.U - last.V), qrev: -o.I * K * o.dudt, Imax: Imax, Pmax: CELL.Vmin * Imax, vmin: vmin
    };
  }
  var CEI = ['ce-soc', 'ce-T', 'ce-I', 'ce-tp', 'ce-fs', 'ce-du', 'ce-view'];
  function cellDemo() {
    if (!$('ce-chart')) return;
    var o = { soc: num('ce-soc') / 100, T: num('ce-T'), I: num('ce-I'), tp: Math.max(1, num('ce-tp')), fs: num('ce-fs') || 10, dudt: num('ce-du') / 1000 };
    $('ce-socv').textContent = num('ce-soc'); $('ce-Tv').textContent = o.T;
    var r = cellPulse(o), zoom = $('ce-view').value === 'zoom', x0 = zoom ? r.ta - 1 : 0, x1 = zoom ? r.ta + 3 : r.tend, dt = zoom ? 0.004 : 0.05, pts = [], t;
    for (t = x0; t <= x1 + 1e-9; t += dt) pts.push([t, r.at(t).V]);
    var vs = pts.map(function (p) { return p[1]; }), lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs), pad = Math.max(0.01, (hi - lo) * 0.15);
    var dots = r.samples.filter(function (p) { return p[0] >= x0 && p[0] <= x1; });
    chart($('ce-chart'), { x: [x0, x1], y: [lo - pad, hi + pad], xs: zoom ? 0.5 : 10, xl: 'Time [s]', yl: 'Cell terminal voltage [V]',
      vlines: [{ x: r.ta, c: css('--s-warm') }, { x: r.tb, c: css('--s-warm') }],
      series: [{ pts: pts, c: css('--ink'), w: 2.2 }],
      dots: dots.length <= 150 ? dots.map(function (p) { return { x: p[0], y: p[1], c: css('--s-coral'), r: zoom ? 4 : 2.2 }; }) : [] });
    var tot = r.qirr + r.qrev;
    $('ce-out').innerHTML = kpi('Open-circuit voltage', f(r.U0, 3) + ' V') + kpi('R<sub>0</sub> in the model', f(r.R0 * 1000, 1) + ' mΩ') +
      kpi('R<sub>0</sub> read from the logged step', f(r.R0est * 1000, 1) + ' mΩ · ' + sgn(100 * (r.R0est / r.R0 - 1), 0) + '%', true) +
      kpi('Pulse resistance read at the end of the pulse', f(r.Rpulse * 1000, 1) + ' mΩ') + kpi('Lowest voltage in the test', f(r.vmin, 3) + ' V' + (r.vmin < CELL.Vmin ? ' · below the 2.5 V limit' : '')) +
      kpi('Irreversible heat I(U − V), end of pulse', f(r.qirr, 2) + ' W') + kpi('Reversible heat −I T dU/dT', f(r.qrev, 2) + ' W') +
      kpi('Reversible share of the heat', isFinite(tot) && Math.abs(tot) > 1e-9 ? f(100 * r.qrev / tot, 0) + '%' : '—', true) +
      kpi('10 s discharge power to 2.5 V, per cell', f(r.Pmax, 0) + ' W · ' + f(r.Imax, 0) + ' A', true);
  }

  /* ---------- 15 vehicle log: from bytes to a correlated model ---------- */
  var LG = { m: 2200, cda: 0.62, crr: 0.008, rho: 1.2, eta: 0.9, aux: 400, V0: 760, R: 0.08, N: 30001,
    wp: [[0, 0], [5, 0], [25, 50], [60, 50], [75, 0], [90, 0], [115, 90], [200, 110], [230, 60], [260, 60], [285, 0], [300, 0]] };
  function lgSeg(t) { var w = LG.wp; for (var i = 1; i < w.length; i++) if (t < w[i][0]) return i; return -1; }
  function lgSpeed(t) {
    var w = LG.wp, i; if (t <= 0) return 0; i = lgSeg(t); if (i < 0) return w[w.length - 1][1] / 3.6;
    return (w[i - 1][1] + (w[i][1] - w[i - 1][1]) * (t - w[i - 1][0]) / (w[i][0] - w[i - 1][0])) / 3.6;
  }
  function lgAcc(t) { var w = LG.wp, i; if (t < 0) return 0; i = lgSeg(t); return i < 0 ? 0 : (w[i][1] - w[i - 1][1]) / 3.6 / (w[i][0] - w[i - 1][0]); }
  function lgPower(v, a) { var Pw = (0.5 * LG.rho * LG.cda * v * v + LG.crr * LG.m * G + LG.m * a) * v; return (Pw >= 0 ? Pw / LG.eta : Pw * LG.eta) + LG.aux; }
  function grad(y, h) { var n = y.length, g = new Array(n); g[0] = (y[1] - y[0]) / h; g[n - 1] = (y[n - 1] - y[n - 2]) / h; for (var i = 1; i < n - 1; i++) g[i] = (y[i + 1] - y[i - 1]) / (2 * h); return g; }
  function vehicleLog(o) {
    var N = LG.N, k, t, P = new Array(N), Ptrue = new Array(N), Vt = new Array(N);
    var I = new Array(N);
    for (k = 0; k < N; k++) {
      t = k / 100; var Pb = lgPower(lgSpeed(t), lgAcc(t)) + o.extra;
      I[k] = (LG.V0 - Math.sqrt(LG.V0 * LG.V0 - 4 * LG.R * Pb)) / (2 * LG.R); Vt[k] = LG.V0 - LG.R * I[k]; Ptrue[k] = Vt[k] * I[k];
    }
    var Vm = [], j; for (j = 0; j <= 3000; j++) Vm.push(Vt[10 * j] + 0.3 * Math.sin(2 * Math.PI * 0.9 * j / 10));
    var vs = [], i; for (i = 0; i <= 6000; i++) vs.push(lgSpeed(i / 20 - o.lag));
    var as = grad(vs, 0.05);
    for (k = 0; k < N; k++) {
      t = k / 100; j = Math.floor(k / 10); var fr = (k % 10) / 10, Vi = j < 3000 ? Vm[j] + fr * (Vm[j + 1] - Vm[j]) : Vm[3000];
      var Im = I[k] * (1 + o.gain / 100) + o.off + 0.6 * Math.sin(2 * Math.PI * 7.3 * t) + 0.3 * Math.sin(2 * Math.PI * 13.7 * t + 1);
      P[k] = Vi * Im;
    }
    function model(n) {
      var M = new Array(N);
      for (var k = 0; k < N; k++) {
        var ii = Math.floor(k / 5), fr = (k % 5) / 5, a = Math.max(0, Math.min(6000, ii + n)), b = Math.max(0, Math.min(6000, ii + 1 + n));
        M[k] = lgPower(vs[a] + fr * (vs[b] - vs[a]), as[a] + fr * (as[b] - as[a]));
      }
      return M;
    }
    function trapz(y, h) { var s = 0; for (var q = 0; q < y.length - 1; q++) s += (y[q] + y[q + 1]) / 2 * h; return s; }
    function stats(M) {
      var sd = 0, s2 = 0, ma = 0, mb = 0, n = N, q; for (q = 0; q < n; q++) { var d = P[q] - M[q]; sd += d; s2 += d * d; ma += P[q]; mb += M[q]; }
      ma /= n; mb /= n; var c = 0, va = 0, vb = 0; for (q = 0; q < n; q++) { var x = P[q] - ma, y = M[q] - mb; c += x * y; va += x * x; vb += y * y; }
      return { bias: sd / n, rmse: Math.sqrt(s2 / n), r: c / Math.sqrt(va * vb) };
    }
    var M0 = model(0), raw = stats(M0), best = { n: 0, r: -2 };
    for (var n = -40; n <= 40; n++) { var st = n === 0 ? raw : stats(model(n)); if (st.r > best.r) best = { n: n, r: st.r }; }
    var Mb = model(best.n), al = stats(Mb), dist = trapz(vs, 0.05) / 1000;
    var g0 = 0, g1 = 0, c0 = 0; for (k = 7800; k <= 8800; k++) { g0 += P[k]; g1 += M0[k]; c0++; }
    var Eraw = trapz(P, 0.01) / 3600, Etrue = trapz(Ptrue, 0.01) / 3600;
    return { P: P, M0: M0, Mb: Mb, dist: dist, Elog: Eraw, Etrue: Etrue, raw: raw, al: al, lag: best.n * 0.05, still: (g0 - g1) / c0 };
  }
  var LGI = ['lg-off', 'lg-gain', 'lg-lag', 'lg-extra', 'lg-align', 'lg-view'];
  function logDemo() {
    if (!$('lg-chart')) return;
    var o = { off: num('lg-off'), gain: num('lg-gain'), lag: num('lg-lag'), extra: num('lg-extra') };
    $('lg-lagv').textContent = f(o.lag, 1);
    var r = vehicleLog(o), align = $('lg-align').value === '1', zoom = $('lg-view').value === 'zoom';
    var k0 = zoom ? 10000 : 0, k1 = zoom ? 13000 : LG.N - 1, step = zoom ? 2 : 20, a = [], b = [], c = [];
    for (var k = k0; k <= k1; k += step) { a.push([k / 100, r.P[k] / 1000]); b.push([k / 100, r.M0[k] / 1000]); c.push([k / 100, r.Mb[k] / 1000]); }
    var ys = a.concat(b).map(function (p) { return p[1]; }), lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
    var se = [{ pts: a, c: css('--s-grey'), w: 1.3 }, { pts: b, c: css('--s-coral'), w: 2 }];
    if (align) se.push({ pts: c, c: css('--s-mint'), w: 2 });
    chart($('lg-chart'), { x: [k0 / 100, k1 / 100], y: [Math.floor(lo / 10) * 10, Math.ceil(hi / 10) * 10], xs: zoom ? 5 : 30, xl: 'Time [s]', yl: 'Battery power [kW]', series: se });
    $('lg-out').innerHTML = kpi('Distance from the logged speed', f(r.dist, 2) + ' km') +
      kpi('Battery energy, truth (synthetic)', f(r.Etrue, 0) + ' Wh · ' + f(r.Etrue / r.dist, 0) + ' Wh/km') +
      kpi('Battery energy from the log', f(r.Elog, 0) + ' Wh · ' + f(r.Elog / r.dist, 0) + ' Wh/km', true) +
      kpi('Error of the logged energy', sgn(100 * (r.Elog / r.Etrue - 1), 1) + '%') +
      kpi('Model vs log, as logged: mean gap · RMSE', sgn(r.raw.bias, 0) + ' W · ' + f(r.raw.rmse / 1000, 2) + ' kW') +
      kpi('Time shift found by cross-correlation', f(r.lag, 2) + ' s', true) +
      kpi('After alignment: mean gap · RMSE', sgn(r.al.bias, 0) + ' W · ' + f(r.al.rmse / 1000, 2) + ' kW') +
      kpi('Standstill check, 78–88 s: log − model', sgn(r.still, 0) + ' W', true);
  }

  /* ---------- 15 numerical and validation uncertainty (GCI, ASME V&V 20) ---------- */
  function gci(o) { // o: f1 fine, f2 medium, f3 coarse, r refinement ratio, D measured, uin [%], uD [%]
    var e21 = o.f2 - o.f1, e32 = o.f3 - o.f2, s = e32 / e21, mono = isFinite(s) && s > 0;
    var p = mono ? Math.log(s) / Math.log(o.r) : NaN, rp = Math.pow(o.r, p);
    var fext = mono ? o.f1 + (o.f1 - o.f2) / (rp - 1) : NaN, ea = Math.abs(e21 / o.f1), g = mono ? 1.25 * ea / (rp - 1) : NaN;
    var unum = g * Math.abs(o.f1), uin = o.uin / 100 * Math.abs(o.f1), uD = o.uD / 100 * Math.abs(o.D);
    var uval = Math.sqrt(unum * unum + uin * uin + uD * uD), E = o.f1 - o.D;
    return { p: p, fext: fext, gci: g, unum: unum, uin: uin, uD: uD, uval: uval, E: E, within: Math.abs(E) <= uval, mono: mono };
  }
  var UNI = ['un-f1', 'un-f2', 'un-f3', 'un-r', 'un-D', 'un-uin', 'un-uD'];
  function uncDemo() {
    if (!$('un-chart')) return;
    var o = { f1: num('un-f1'), f2: num('un-f2'), f3: num('un-f3'), r: num('un-r'), D: num('un-D'), uin: num('un-uin'), uD: num('un-uD') };
    var r = gci(o), h = [1, o.r, o.r * o.r], fs = [o.f1, o.f2, o.f3], pts = [], hmax = o.r * o.r * 1.1;
    if (r.mono) for (var i = 0; i <= 60; i++) { var x = hmax * i / 60; pts.push([x, r.fext + (o.f1 - r.fext) * Math.pow(x, r.p)]); }
    var ys = fs.concat([o.D + r.uD, o.D - r.uD]).concat(r.mono ? [r.fext, pts[pts.length - 1][1]] : []), lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), pad = (hi - lo) * 0.15 || 0.1;
    var y0 = lo - pad, y1 = hi + pad;
    var ax = chart($('un-chart'), { x: [0, hmax], y: [y0, y1], xs: niceStep(hmax, 6), ys: niceStep(y1 - y0, 5), xl: 'Grid spacing relative to the fine mesh, h / h₁', yl: 'Result [same unit as the inputs]',
      series: [{ pts: [[0, o.D], [hmax, o.D]], c: css('--s-warm'), w: 1.6, dash: '6 4' }].concat(pts.length ? [{ pts: pts, c: css('--s-blue'), w: 1.6 }] : []),
      dots: h.map(function (x, i) { return { x: x, y: fs[i], c: css('--ink'), r: 5 }; }).concat(r.mono ? [{ x: 0, y: r.fext, c: css('--s-blue'), r: 5 }] : []) });
    var band = '<rect x="' + ax.X(0) + '" width="' + (ax.X(hmax) - ax.X(0)) + '" y="' + ax.Y(o.D + r.uD) + '" height="' + Math.max(1, ax.Y(o.D - r.uD) - ax.Y(o.D + r.uD)) + '" fill="' + css('--s-warm') + '" fill-opacity="0.12"/>';
    $('un-chart').innerHTML = band + $('un-chart').innerHTML;
    var pc = function (x) { return f(100 * x / Math.abs(o.f1), 1) + '%'; };
    $('un-out').innerHTML = kpi('Observed order of accuracy p', r.mono ? f(r.p, 2) : 'oscillatory') + kpi('Extrapolated value (zero spacing)', r.mono ? f(r.fext, 3) : '—') +
      kpi('Numerical uncertainty, GCI of the fine mesh', r.mono ? f(r.unum, 3) + ' · ' + pc(r.unum) : '—', true) + kpi('Input uncertainty', f(r.uin, 3) + ' · ' + pc(r.uin)) +
      kpi('Test uncertainty', f(r.uD, 3)) + kpi('Validation uncertainty u<sub>val</sub>', r.mono ? f(r.uval, 3) + ' · ' + pc(r.uval) : '—', true) +
      kpi('Comparison error E = S − D', sgn(r.E, 3) + ' · ' + sgn(100 * r.E / Math.abs(o.D), 1) + '%') +
      kpi('Verdict', !r.mono ? 'grid study not monotonic' : r.within ? '|E| ≤ u<sub>val</sub>: no model error can be resolved' : '|E| > u<sub>val</sub>: model error ≈ ' + sgn(r.E, 3) + ' ± ' + f(r.uval, 3), true);
  }

  /* ---------- 16 coupled vehicle model with a thermal controller ---------- */
  var CM = { m: 2200, cda: 0.6, crr: 0.008, rho: 1.2, r: 0.36, G: 9, V0: 750, Rb: 0.08, aux: 300,
    Cw: 3000, Cs: 12000, Cc: 17500, Gws: 60, Gsc: 120, G0: 10, UAr: 90, Qmax: 20, Qmin: 2, Ppump: 120 };
  function cmTrace(name) {
    var t = name === 'udds' ? window.EPA_UDDS : window.EPA_HWFET, n = name === 'udds' ? 2 : 3, out = [];
    for (var k = 0; k < n; k++) out = out.concat(k ? t.slice(1) : t);
    return out;
  }
  function coupled(o) {
    var tr = o.trace, Tw = o.Tamb, Ts = o.Tamb, Tc = o.Tamb, Q = CM.Qmin, on = false, integ = 0, sw = 0, Hw = o.Tamb, Hs = o.Tamb, gh = o.obsErr || 1.15;
    var E = 0, Ep = 0, Ecu = 0, Efe = 0, d = 0, Twmax = Tw, vs = 0, vo = 0, rows = [], half = Math.floor((tr.length - 1) / 2), sc = 0, sc2 = 0, nc = 0;
    for (var i = 0; i < tr.length - 1; i++) {
      // controller: reads the coolant temperature at the start of the step
      if (o.ctrl === 'full') Q = CM.Qmax;
      else if (o.ctrl === 'onoff') {
        var was = on; if (Tc > o.Tset + o.hyst / 2) on = true; else if (Tc < o.Tset - o.hyst / 2) on = false;
        if (on !== was) sw++; Q = on ? CM.Qmax : CM.Qmin;
      } else {
        var e = Tc - o.Tset, u = CM.Qmin + o.kp * (e + integ / o.ti);
        if (!((u >= CM.Qmax && e > 0) || (u <= CM.Qmin && e < 0))) integ += e;
        Q = Math.max(CM.Qmin, Math.min(CM.Qmax, CM.Qmin + o.kp * (e + integ / o.ti)));
      }
      // vehicle and drive unit (backward-facing, 1 s steps)
      var v0 = tr[i] * 0.44704, v1 = tr[i + 1] * 0.44704, va = (v0 + v1) / 2, a = v1 - v0;
      var F = 0.5 * CM.rho * CM.cda * va * va + (va > 0.01 ? CM.crr * CM.m * G : 0) + 1.04 * CM.m * a;
      var w = va / CM.r * CM.G, lim = tmax(w), tq = Math.max(-lim, Math.min(lim, F * CM.r / CM.G));
      var ml = motor(tq, w, Tw, 1), me = ml.me + 0.012 * Math.max(0, -ml.P), loss = ml.cu + ml.fe + me;
      var Pp = CM.Ppump * Math.pow(Q / CM.Qmax, 3), Pb = ml.P + loss + CM.aux + Pp;
      var I = (CM.V0 - Math.sqrt(CM.V0 * CM.V0 - 4 * CM.Rb * Pb)) / (2 * CM.Rb);
      E += CM.V0 * I; Ep += Pp; Ecu += ml.cu; Efe += ml.fe + me; d += va;
      // virtual sensor: steady-state network from measured coolant temperature and estimated losses
      var Gsc = CM.G0 + CM.Gsc * Math.pow(Q / CM.Qmax, 0.8), UA = CM.UAr * Math.sqrt(Q / CM.Qmax) * (0.35 + 0.65 * Math.min(1, va / 30));
      var Test = Tc + (ml.cu + ml.fe) / Gsc + ml.cu / CM.Gws;
      vs = Math.max(vs, Math.abs(Test - Tw));
      // virtual sensor: dynamic observer, the same RC network run on measured coolant temperature, with its
      // stator-to-coolant conductance calibrated 15% high; losses from the loss map at the observer's own temperature
      var mh = motor(tq, w, Hw, 1), qwh = CM.Gws * (Hw - Hs), qsh = gh * Gsc * (Hs - Tc);
      vo = Math.max(vo, Math.abs(Hw - Tw));
      rows.push([i / 60, Tw, Ts, Tc, Q, Hw]);
      Hw += (mh.cu - qwh) / CM.Cw; Hs += (mh.fe + qwh - qsh) / CM.Cs;
      // thermal network, explicit Euler, 1 s
      var qws = CM.Gws * (Tw - Ts), qsc = Gsc * (Ts - Tc), qr = UA * (Tc - o.Tamb);
      Tw += (ml.cu - qws) / CM.Cw; Ts += (ml.fe + qws - qsc) / CM.Cs; Tc += (qsc + me - qr) / CM.Cc;
      Twmax = Math.max(Twmax, Tw);
      if (i >= half) { sc += Tc; sc2 += Tc * Tc; nc++; }
    }
    var mc = sc / nc;
    return { d: d, wh: E / 3.6 / d, Ep: Ep / 3600, Ecu: Ecu / 3600, Efe: Efe / 3600, E: E / 3600, Twmax: Twmax, Tcm: mc, Tcs: Math.sqrt(Math.max(0, sc2 / nc - mc * mc)), sw: sw, vs: vs, vo: vo, rows: rows };
  }
  var CMI = ['cm-cyc', 'cm-amb', 'cm-ctrl', 'cm-set', 'cm-hys', 'cm-kp', 'cm-ti'];
  function coupledDemo() {
    if (!$('cm-chart') || !window.EPA_HWFET) return;
    var base = { trace: cmTrace($('cm-cyc').value), Tamb: num('cm-amb'), Tset: num('cm-set'), hyst: Math.max(0.5, num('cm-hys')), kp: num('cm-kp'), ti: Math.max(1, num('cm-ti')) };
    var sel = $('cm-ctrl').value, res = {};
    ['full', 'onoff', 'pi'].forEach(function (c) { res[c] = coupled(Object.assign({ ctrl: c }, base)); });
    if (!res[sel]) sel = 'pi';
    var r = res[sel], rows = r.rows.filter(function (x, i) { return i % 5 === 0; }), tmaxm = r.rows[r.rows.length - 1][0];
    var ys = []; rows.forEach(function (x) { ys.push(x[1], x[3], x[5]); });
    var lo = Math.floor(Math.min.apply(null, ys.concat([base.Tamb])) / 10) * 10, hi = Math.ceil(Math.max.apply(null, ys.concat([base.Tset + 5])) / 10) * 10;
    chart($('cm-chart'), { x: [0, tmaxm], y: [lo, hi], xs: 5, xl: 'Time [min]', yl: 'Temperature [°C]',
      series: [{ pts: rows.map(function (x) { return [x[0], x[5]]; }), c: css('--s-grey'), w: 1.4, dash: '4 3' },
        { pts: rows.map(function (x) { return [x[0], x[1]]; }), c: css('--s-coral'), w: 2.2 },
        { pts: rows.map(function (x) { return [x[0], x[2]]; }), c: css('--s-warm'), w: 1.6 },
        { pts: rows.map(function (x) { return [x[0], x[3]]; }), c: css('--s-blue'), w: 2.2 },
        { pts: [[0, base.Tset], [tmaxm, base.Tset]], c: css('--s-mint'), w: 1.2, dash: '6 4' }] });
    chart($('cm-flow'), { x: [0, tmaxm], y: [0, CM.Qmax * 1.1], xs: 5, ys: 5, xl: 'Time [min]', yl: 'Pump flow [L/min]',
      series: [{ pts: rows.map(function (x) { return [x[0], x[4]]; }), c: css('--s-mint'), w: 1.8 }] });
    var name = { full: 'Full flow, no control', onoff: 'On/off thermostat', pi: 'PI controller' };
    function row(c) { var x = res[c]; return '<tr' + (c === sel ? ' class="hl"' : '') + '><td>' + name[c] + '</td><td>' + f(x.wh, 1) + ' Wh/km</td><td>' + f(x.Ep, 1) + ' Wh</td><td>' + f(x.Ecu, 0) + ' Wh</td><td>' + f(x.Twmax, 0) + ' °C</td><td>' + f(x.Tcm, 1) + ' ± ' + f(x.Tcs, 1) + ' °C</td><td>' + (c === 'onoff' ? x.sw : '—') + '</td></tr>'; }
    $('cm-table').innerHTML = '<tr><th>Strategy</th><th>Energy use</th><th>Pump energy</th><th>Copper loss</th><th>Hottest winding</th><th>Coolant, 2nd half</th><th>Pump switchings</th></tr>' + row('full') + row('onoff') + row('pi');
    $('cm-out').innerHTML = kpi('Distance', f(r.d / 1000, 1) + ' km') + kpi('Battery energy', f(r.E, 0) + ' Wh · ' + f(r.wh, 1) + ' Wh/km', true) +
      kpi('Motor losses: copper · iron and mechanical', f(r.Ecu, 0) + ' · ' + f(r.Efe, 0) + ' Wh') + kpi('Pump energy', f(r.Ep, 1) + ' Wh · ' + f(100 * r.Ep / r.E, 2) + '%') +
      kpi('Pump energy saved vs full flow', f(res.full.Ep - r.Ep, 1) + ' Wh', true) + kpi('Hottest winding', f(r.Twmax, 0) + ' °C') +
      kpi('Virtual sensor, largest error: steady-state formula', f(r.vs, 0) + ' K') +
      kpi('Virtual sensor, largest error: dynamic observer', f(r.vo, 1) + ' K', true);
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
  on(IJI, junctionDemo); junctionDemo();
  on(CCI, chgCurveDemo); chgCurveDemo();
  on(ARI, arbDemo); arbDemo();
  on(CPI, coldDemo); coldDemo();
  on(TSI, splitDemo); splitDemo();
  on(PKI, packDemo); packDemo();
  Array.prototype.forEach.call(document.querySelectorAll('[data-pack]'), function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-pack').split(',');
      $('pk-ns').value = v[0]; $('pk-np').value = v[1]; $('pk-p').value = v[2]; packDemo();
    });
  });
  on(CEI, cellDemo); cellDemo();
  on(LGI, logDemo); logDemo();
  on(UNI, uncDemo); uncDemo();
  on(CMI, coupledDemo); coupledDemo();
  toc();
  window.EVNotes = { steady: steady, simulate: simulate, motor: motor, H0: H0, E0: E0, cop: cop, quadfit: quadfit, inverter: inverter, windSteady: windSteady, windCont: windCont, windBurst: windBurst, windRth: windRth, chargeSession: chargeSession, oilTrade: oilTrade, compound: compound, coolAir: coolAir, coolBest: coolBest, junction: junction, chgPoint: chgPoint, chgCurve: chgCurve, coldPlate: coldPlate, torqueSplit: torqueSplit, tsIron: tsIron, pack: pack, cellPulse: cellPulse, vehicleLog: vehicleLog, gci: gci, coupled: coupled, cmTrace: cmTrace };
})();
