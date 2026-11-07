/* Vehicle aerodynamics page: estate/fastback switch and accessible bar charts.
   Without JavaScript, both variants and the value tables remain visible. */
(() => {
 // Estate / fastback switch.
 document.querySelectorAll('.variant-figure').forEach(fig => {
  const links = [...fig.querySelectorAll('[data-variant]')];
  if (links.length < 2) return;
  const tabs = document.createElement('div');
  tabs.className = 'variant-tabs';
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', 'Rear end');
  const show = v => links.forEach(a => {
   a.hidden = a.dataset.variant !== v;
   tabs.querySelector(`[data-v="${v}"]`).setAttribute('aria-pressed', 'true');
   tabs.querySelectorAll(`button:not([data-v="${v}"])`).forEach(b => b.setAttribute('aria-pressed', 'false'));
  });
  links.forEach(a => {
   const b = document.createElement('button');
   b.type = 'button';
   b.dataset.v = a.dataset.variant;
   b.textContent = a.querySelector('.pair-label')?.textContent || a.dataset.variant;
   b.addEventListener('click', () => show(a.dataset.variant));
   tabs.append(b);
  });
  fig.prepend(tabs);
  show(fig.dataset.default || links[0].dataset.variant);
 });

 // Data: means of the last 1000 of 3000 iterations; reference values from Zhang et al. (2019).
 const charts = {
  cd: {
   max: 0.4, ticks: [0, 0.1, 0.2, 0.3, 0.4], axis: 'Drag coefficient Cd [–]', digits: 3,
   series: [
    {k: 'exp', name: 'Experiment (1:4)', color: 'var(--exp)'},
    {k: 'ref', name: 'Published CFD', color: 'var(--ref-cfd)'},
    {k: 'study', name: 'This study (1:1, Re-matched)', color: 'var(--study)', label: true}
   ],
   rows: [
    {cat: 'Estate', exp: 0.314, ref: 0.328, study: 0.3605},
    {cat: 'Fastback', exp: 0.286, ref: 0.303, study: 0.3503}
   ]
  },
  budget: {
   max: 0.15, ticks: [0, 0.05, 0.10, 0.15], axis: 'Drag contribution Cd [–]', digits: 3,
   series: [
    {k: 'estate', name: 'Estate', color: 'var(--estate)'},
    {k: 'fastback', name: 'Fastback', color: 'var(--fastback)'}
   ],
   rows: [
    {cat: 'Body', estate: 0.0265, fastback: 0.0101},
    {cat: 'Rear end', estate: 0.0915, fastback: 0.0946},
    {cat: 'Mirrors', estate: 0.0108, fastback: 0.0107},
    {cat: 'Front wheels', estate: 0.0394, fastback: 0.0432},
    {cat: 'Rear wheels', estate: 0.0273, fastback: 0.0234},
    {cat: 'Underbody', estate: 0.0352, fastback: 0.0390},
    {cat: 'Engine bay', estate: 0.1279, fastback: 0.1282, label: true}
   ]
  }
 };

 const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
 };

 document.querySelectorAll('.hbar-chart[data-chart]').forEach(root => {
  const c = charts[root.dataset.chart];
  if (!c) return;
  const pct = v => (v / c.max * 100) + '%';
  const fmt = v => (v + 1e-9).toFixed(c.digits);

  const legend = el('div', 'hbar-legend');
  c.series.forEach(s => {
   const item = el('span');
   const sw = el('i');
   sw.style.background = s.color;
   item.append(sw, document.createTextNode(s.name));
   legend.append(item);
  });

  const plot = el('div', 'hbar-plot');
  const grid = el('div', 'hbar-grid');
  c.ticks.forEach(t => { const g = el('span'); g.style.left = pct(t); grid.append(g); });
  plot.append(grid);

  const tip = el('div', 'hbar-tip');
  tip.hidden = true;
  const showTip = (bar, s, row) => {
   tip.replaceChildren();
   tip.append(el('strong', null, 'Cd ' + fmt(row[s.k])));
   const line = el('span');
   const key = el('i');
   key.style.background = s.color;
   line.append(key, document.createTextNode(`${s.name} · ${row.cat}`));
   tip.append(line);
   tip.hidden = false;
   const r = root.getBoundingClientRect(), b = bar.getBoundingClientRect();
   const x = Math.min(b.right - r.left + 10, r.width - tip.offsetWidth);
   tip.style.left = Math.max(0, x) + 'px';
   tip.style.top = (b.top - r.top - tip.offsetHeight - 6) + 'px';
  };
  const hideTip = () => { tip.hidden = true; };

  c.rows.forEach(row => {
   plot.append(el('div', 'hbar-cat', row.cat));
   const bars = el('div', 'hbar-bars');
   c.series.forEach(s => {
    const line = el('div', 'hbar-line');
    const bar = el('div', 'hbar');
    bar.style.width = pct(row[s.k]);
    bar.style.background = s.color;
    bar.tabIndex = 0;
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', `${row.cat}, ${s.name}: Cd ${fmt(row[s.k])}`);
    bar.addEventListener('pointerenter', () => showTip(bar, s, row));
    bar.addEventListener('focus', () => showTip(bar, s, row));
    bar.addEventListener('pointerleave', hideTip);
    bar.addEventListener('blur', hideTip);
    line.append(bar);
    if (s.label || row.label) line.append(el('span', 'hbar-val', fmt(row[s.k])));
    bars.append(line);
   });
   plot.append(bars);
  });

  const axis = el('div', 'hbar-axis');
  c.ticks.forEach(t => { const s = el('span', null, t === 0 ? '0' : t.toFixed(2).replace(/0$/, '')); s.style.left = pct(t); axis.append(s); });
  root.append(legend, plot, axis, el('div', 'hbar-axis-title', c.axis), tip);
 });
})();
