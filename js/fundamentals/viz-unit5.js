/* Fundamentals, Unit 5 visuals: price vs value, ratios, DCF and dividends (Ridgeline Gear). */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, money, pct, usd, pal, alpha, tween, ease, MINUS } = SS;
  const V = SS.viz;
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const $m = (v) => (v < 0 ? MINUS : '') + '$' + Math.abs(Math.round(v)).toLocaleString('en-US') + 'M';
  const ph = (w) => (w < 480 ? 220 : 270);
  const R = { price: 22, eps: 1.1, shares: 100, debt: 280, cash: 150, ebitda: 200, fcf: 80, rev: 1000, bvps: 5.5, div: 0.3 };

  /* ---------- Mr. Market ---------- */
  V.mrMarket = function (host, p, ctx) {
    const M = 120;
    let margin = 0.25,
      reveal = 1,
      cancel = null;
    const r = SS.rng(1949);
    const ph1 = r() * 6.28,
      ph2 = r() * 6.28,
      ph3 = r() * 6.28;
    let walk = 0;
    const mood = [];
    for (let m = 0; m <= M; m++) {
      walk = walk * 0.9 + 0.06 * SS.gauss(r);
      mood.push(0.22 * Math.sin(m / 9 + ph1) + 0.12 * Math.sin(m / 4.3 + ph2) + 0.08 * Math.sin(m / 23 + ph3) + walk);
    }
    const val = (m) => 100 * Math.pow(1.08, m / 12);
    const price = (m) => val(m) * Math.exp(mood[m]);
    const plotEl = h('div', { class: 'plot' });
    const face = h('div', { class: 'mm-face', 'aria-live': 'polite' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-ink' }, h('i', { class: 'lg-sw dashed' }), 'Value of the business'), h('span', { class: 'lg lg-put' }, h('i', { class: 'lg-sw' }), 'Mr. Market’s price'), h('span', { class: 'lg lg-gain' }, h('i', { class: 'lg-sw block' }), 'Bargain zone'));
    const sl = slider({ id: ctx.key + '-m', label: 'Margin of safety you demand', min: 0, max: 40, step: 5, value: 25, fmt: (v) => v + '% below value', onInput: (v) => ((margin = v / 100), update()) });
    const stats = h('div', { class: 'stats' });
    stack(host, h('div', { class: 'mm-row' }, plotEl, face), legend, sl.el, stats, h('p', { class: 'fine' }, 'Simulated: the business grows 8% a year while the price swings with mood.'));
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Price swinging around value',
      draw(P) {
        const C = pal(),
          n = Math.max(1, Math.round(M * reveal));
        P.domain(0, M, 0, 340);
        P.grid({ xTicks: [0, 24, 48, 72, 96, 120], xf: (v) => 'Y' + v / 12, yf: (v) => '$' + v });
        const V0 = P.sample(val, 0, M, 120);
        P.between(
          V0.map(([x, y]) => [x, y * (1 - margin)]),
          V0.map(([x]) => [x, 0]),
          C.gain,
          0.12
        );
        P.line(V0, { color: C.ink, width: 2, dash: [6, 4] });
        const pts = [];
        for (let m = 0; m <= n; m++) pts.push([m, price(m)]);
        P.line(pts, { color: C.put, width: 2.5 });
        for (let m = 0; m <= n; m++) if (price(m) < val(m) * (1 - margin)) P.dot(m, price(m), { color: C.gain, r: 3 });
        P.dot(n, price(n), { color: C.put });
      },
    });
    function update() {
      plot.render();
      const n = Math.max(1, Math.round(M * reveal)),
        md = mood[n];
      const [lab, txt] = md > 0.15 ? ['Euphoric', 'Paying far more than the business is worth.'] : md < -0.15 ? ['Gloomy', 'Offering to sell far below value.'] : ['Calm', 'Price near value.'];
      face.innerHTML = `<span class="mm-emoji ${lab.toLowerCase()}" aria-hidden="true"></span><b>${lab}</b><span>${txt}</span><span class="mm-gap">${pct(price(n) / val(n) - 1, { sign: true, d: 0 })} vs value</span>`;
      let bargains = 0;
      for (let m = 0; m <= M; m++) if (price(m) < val(m) * (1 - margin)) bargains++;
      stats.replaceChildren(stat('Months at a bargain', `${bargains} of ${M + 1}`, 'gain'), stat('Most euphoric (a risk)', pct(Math.exp(Math.max(...mood)) - 1, { sign: true, d: 0 }) + ' vs value', 'loss'), stat('Gloomiest (an opportunity)', pct(Math.exp(Math.min(...mood)) - 1, { sign: true, d: 0 }) + ' vs value', 'gain'), stat('Business value growth', '8% a year'));
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(4200, (k) => {
          reveal = Math.max(0.01, k);
          update();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- margin of safety ---------- */
  V.safety = function (host, p, ctx) {
    const cases = [
      ['Bear case', 15, 'loss'],
      ['Base case', 25, 'accent'],
      ['Bull case', 35, 'gain'],
    ];
    let price = 18;
    const lane = h('div', { class: 'ms-lane' }, h('span', { class: 'ms-band' }), ...cases.map(([l, v, c]) => h('span', { class: 'ms-mark ' + c, style: { left: (v / 45) * 100 + '%' } }, h('small', null, l), h('b', null, '$' + v))), h('span', { class: 'ms-price' }, h('b')));
    const ticks = h('div', { class: 'sp-ticks' });
    [0, 10, 20, 30, 40].forEach((t) => ticks.append(h('span', { style: { left: (t / 45) * 100 + '%' } }, '$' + t)));
    const sl = slider({ id: ctx.key + '-px', label: 'Price you pay', min: 8, max: 40, step: 0.5, value: price, fmt: (v) => usd(v), onInput: (v) => ((price = v), update()) });
    const rows = h('div', { class: 'attr' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('div', { class: 'ms-wrap' }, lane, ticks), sl.el, h('p', { class: 'plot-h' }, 'Your return if the price later reaches each estimate'), rows, read);
    function update() {
      lane.querySelector('.ms-price').style.left = (price / 45) * 100 + '%';
      lane.querySelector('.ms-price b').textContent = usd(price);
      rows.replaceChildren(
        ...cases.map(([l, v]) => {
          const ret = v / price - 1,
            w = (Math.min(Math.abs(ret), 1.5) / 1.5) * 50;
          return h('div', { class: 'attr-row' }, h('span', { class: 'attr-l' }, `${l} ($${v})`), h('div', { class: 'attr-track' }, h('span', { class: 'attr-zero' }), h('span', { class: 'attr-bar ' + (ret >= 0 ? 'pos' : 'neg'), style: { width: w + '%', left: ret >= 0 ? '50%' : 50 - w + '%' } })), h('b', { class: SS.plClass(ret) }, pct(ret, { sign: true, d: 0 })));
        })
      );
      const m = 1 - price / 25;
      read.innerHTML = m > 0 ? `A <b class="gain">${pct(m, { d: 0 })}</b> margin of safety against the base case. ${price <= 15 ? 'Even the bear case breaks even or better.' : `If the bear case comes true, you lose ${pct(1 - 15 / price, { d: 0 })}.`}` : `No margin of safety: you are paying ${pct(-m, { d: 0 })} more than the base-case value. You need the bull case to do well.`;
    }
    update();
  };

  /* ---------- enterprise value ---------- */
  V.evBuilder = function (host) {
    const CO = { ridge: ['Ridgeline Gear', 2200, 280, 150], heavy: ['Heavy Haul Trucking', 2200, 1500, 50] };
    let k = 'ridge';
    const sg = seg({ label: 'Company', options: [{ v: 'ridge', label: 'Ridgeline Gear' }, { v: 'heavy', label: 'Heavy Haul Trucking' }], value: k, onChange: (v) => ((k = v), update()) });
    const bars = h('div', { class: 'ev' });
    const stats = h('div', { class: 'stats' });
    stack(host, sg.el, bars, stats, h('p', { class: 'fine' }, 'Both made-up companies have a $2,200M market cap and $200M of EBITDA.'));
    function update() {
      const [, cap, debt, cash] = CO[k],
        ev = cap + debt - cash,
        max = 3800;
      const w = (v) => (v / max) * 100 + '%';
      bars.innerHTML = `<div class="ev-row"><span>Market cap</span><span class="ev-track"><i class="cap" style="left:0;width:${w(cap)}"></i></span><b>${$m(cap)}</b></div>
        <div class="ev-row"><span>+ Debt</span><span class="ev-track"><i class="debt" style="left:${w(cap)};width:${w(debt)}"></i></span><b>+${$m(debt)}</b></div>
        <div class="ev-row"><span>− Cash</span><span class="ev-track"><i class="cash" style="left:${w(cap + debt - cash)};width:${w(cash)}"></i></span><b>${MINUS}${$m(cash)}</b></div>
        <div class="ev-row tot"><span>Enterprise value</span><span class="ev-track"><i class="ev" style="left:0;width:${w(ev)}"></i></span><b>${$m(ev)}</b></div>`;
      stats.replaceChildren(stat('Enterprise value', $m(ev)), stat('EV / EBITDA', (ev / 200).toFixed(1) + '×'), stat('Debt per $1 of market cap', usd(debt / cap)));
    }
    update();
  };

  /* ---------- P/E builder ---------- */
  V.peBuilder = function (host, p, ctx) {
    let price = R.price,
      eps = R.eps,
      bond = 4.5;
    const big = h('div', { class: 'eps-big' });
    const coins = h('div', { class: 'pe-coins', 'aria-hidden': 'true' });
    const sP = slider({ id: ctx.key + '-p', label: 'Share price', min: 5, max: 60, step: 0.5, value: price, fmt: (v) => usd(v), onInput: (v) => ((price = v), update()) });
    const sE = slider({ id: ctx.key + '-e', label: 'Earnings per share', min: 0.2, max: 3, step: 0.05, value: eps, fmt: (v) => usd(v), onInput: (v) => ((eps = v), update()) });
    const sB = slider({ id: ctx.key + '-b', label: 'Yield on a safe government bond', min: 1, max: 8, step: 0.25, value: bond, fmt: (v) => v.toFixed(2) + '%', onInput: (v) => ((bond = v), update()) });
    const cmp = h('div', { class: 'bv' });
    stack(host, big, h('p', { class: 'plot-h' }, 'Years of today’s earnings to earn back the price'), coins, sP.el, sE.el, cmp, sB.el);
    function update() {
      const pe = price / eps,
        ey = eps / price;
      big.innerHTML = `<span class="duo-l">P/E ratio</span><b>${pe.toFixed(1)}</b><span>${usd(price)} ÷ ${usd(eps)} EPS · earnings yield ${pct(ey)}</span>`;
      const n = Math.min(60, Math.round(pe));
      coins.replaceChildren(...Array.from({ length: n }, (_, i) => h('span', { class: 'pe-c' + (i % 10 === 9 ? ' ten' : '') })), pe > 60 ? h('span', { class: 'fine' }, '…and more') : null);
      const max = 15;
      cmp.innerHTML = `<div class="bv-row"><span>Stock earnings yield</span><span class="bv-track"><i class="mkt" style="width:${Math.min(100, ((ey * 100) / max) * 100)}%"></i></span><b>${pct(ey)}</b></div><div class="bv-row"><span>Government bond yield</span><span class="bv-track"><i class="book" style="width:${(bond / max) * 100}%"></i></span><b>${bond.toFixed(2)}%</b></div>`;
    }
    update();
  };

  /* ---------- P/E and growth ---------- */
  V.peGrowth = function (host, p, ctx) {
    let gA = 0.03,
      gB = 0.25;
    const peA = 15,
      peB = 40;
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-call' }, h('i', { class: 'lg-sw' }), 'Steady Co (P/E 15)'), h('span', { class: 'lg lg-put' }, h('i', { class: 'lg-sw' }), 'Rocket Co (P/E 40)'));
    const sA = slider({ id: ctx.key + '-a', label: 'Steady Co earnings growth', min: 0, max: 15, step: 1, value: 3, fmt: (v) => v + '% a year', onInput: (v) => ((gA = v / 100), update()) });
    const sB = slider({ id: ctx.key + '-b', label: 'Rocket Co earnings growth', min: 0, max: 40, step: 1, value: 25, fmt: (v) => v + '% a year', onInput: (v) => ((gB = v / 100), update()) });
    const stats = h('div', { class: 'stats' });
    stack(host, h('p', { class: 'plot-h' }, 'P/E on future earnings if the share price stays flat'), plotEl, legend, sA.el, sB.el, stats);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Future P/E as earnings grow',
      draw(P) {
        const C = pal();
        P.domain(0, 10, 0, 45);
        P.grid({ xf: (v) => 'Y' + v, yf: (v) => String(v), yTicks: [0, 10, 20, 30, 40] });
        P.vline(5, { color: C.muted, dash: [2, 4], label: 'Year 5' });
        P.line(P.sample((t) => peA / Math.pow(1 + gA, t), 0, 10, 100), { color: C.call, width: 3 });
        P.line(P.sample((t) => peB / Math.pow(1 + gB, t), 0, 10, 100), { color: C.put, width: 3 });
        P.dot(5, peA / Math.pow(1 + gA, 5), { color: C.call });
        P.dot(5, peB / Math.pow(1 + gB, 5), { color: C.put });
      },
    });
    function update() {
      plot.render();
      const a5 = peA / Math.pow(1 + gA, 5),
        b5 = peB / Math.pow(1 + gB, 5);
      const peg = (pe, g) => (g > 0 ? (pe / (g * 100)).toFixed(1) : '—');
      stats.replaceChildren(stat('Steady Co P/E in 5 years', a5.toFixed(1)), stat('Rocket Co P/E in 5 years', b5.toFixed(1), b5 > a5 * 1.2 ? 'loss' : b5 < a5 * 0.8 ? 'gain' : ''), stat('PEG ratios', `${peg(peA, gA)} vs ${peg(peB, gB)}`));
    }
    update();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- ratio toolbox ---------- */
  V.ratioTable = function (host, p, ctx) {
    let price = R.price;
    const sl = slider({ id: ctx.key + '-p', label: 'Ridgeline share price', min: 5, max: 50, step: 0.5, value: price, fmt: (v) => usd(v), onInput: (v) => ((price = v), update()) });
    const tbl = h('div', { class: 'table-wrap' });
    stack(host, sl.el, tbl, h('p', { class: 'fine' }, 'Ridgeline: EPS $1.10, revenue $1,000M, book value $5.50 a share, EBITDA $200M, free cash flow $80M, dividend $0.30, debt $280M, cash $150M, 100M shares.'));
    function update() {
      const cap = price * R.shares,
        ev = cap + R.debt - R.cash;
      const rows = [
        ['P/E', (price / R.eps).toFixed(1), 'Price ÷ EPS', 'Profitable, steady companies'],
        ['Price-to-sales', (cap / R.rev).toFixed(2), 'Market cap ÷ revenue', 'Young companies without profit yet'],
        ['Price-to-book', (price / R.bvps).toFixed(1), 'Price ÷ book value per share', 'Banks, insurers, asset-heavy firms'],
        ['EV / EBITDA', (ev / R.ebitda).toFixed(1), 'Enterprise value ÷ EBITDA', 'Comparing companies with different debt'],
        ['Dividend yield', pct(R.div / price), 'Dividend ÷ price', 'Income investors'],
        ['FCF yield', pct(R.fcf / cap), 'Free cash flow ÷ market cap', 'Cash actually generated for owners'],
      ];
      tbl.innerHTML = `<table class="cmp ratios"><thead><tr><th>Ratio</th><th>Ridgeline</th><th>Formula</th><th>Most useful for</th></tr></thead><tbody>${rows.map(([n, v, f, u]) => `<tr><th>${n}</th><td>${v}</td><td>${f}</td><td>${u}</td></tr>`).join('')}</tbody></table>`;
    }
    update();
  };

  /* ---------- discounting ---------- */
  V.discountBars = function (host, p, ctx) {
    let r = 0.08,
      reveal = 1,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const sl = slider({ id: ctx.key + '-r', label: 'Discount rate', min: 0, max: 15, step: 0.5, value: 8, fmt: (v) => v + '%', onInput: (v) => ((r = v / 100), update()) });
    const stats = h('div', { class: 'stats' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-stock' }, h('i', { class: 'lg-sw block' }), '$100 promised that year'), h('span', { class: 'lg lg-call' }, h('i', { class: 'lg-sw block' }), 'What it is worth today'));
    stack(host, plotEl, legend, sl.el, stats);
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 200 : 240),
      label: 'Present value of $100 by year',
      draw(P) {
        const C = pal();
        P.domain(0.4, 10.6, 0, 110);
        P.grid({ xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], xf: (v) => 'Y' + v, yf: (v) => '$' + v, yTicks: [0, 50, 100] });
        for (let t = 1; t <= 10; t++) {
          P.rect(t - 0.34, 0, t + 0.34, 100, alpha(C.stock, 0.22));
          const pv = 100 / Math.pow(1 + r, t);
          P.rect(t - 0.34, 0, t + 0.34, 100 - (100 - pv) * reveal, alpha(C.call, 0.85));
        }
      },
    });
    function update() {
      plot.render();
      let sum = 0;
      for (let t = 1; t <= 10; t++) sum += 100 / Math.pow(1 + r, t);
      stats.replaceChildren(stat('$100 in 1 year is worth', usd(100 / (1 + r))), stat('$100 in 10 years is worth', usd(100 / Math.pow(1 + r, 10)), 'accent'), stat('All ten payments today', usd(sum) + ' (not $1,000)'));
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(1600, (k) => {
          reveal = ease.out(k);
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- DCF model ---------- */
  function dcfValue(g, r, tg) {
    let f = R.fcf,
      pv = 0;
    const yrs = [];
    for (let t = 1; t <= 10; t++) {
      f *= 1 + g;
      const x = f / Math.pow(1 + r, t);
      yrs.push(x);
      pv += x;
    }
    const tv = (f * (1 + tg)) / (r - tg),
      ptv = tv / Math.pow(1 + r, 10);
    const ev = pv + ptv;
    return { yrs, pv, ptv, ev, perShare: (ev - R.debt + R.cash) / R.shares };
  }
  SS.dcfValue = dcfValue;
  V.dcf = function (host, p, ctx) {
    let g = 0.06,
      r = 0.09,
      tg = 0.025;
    const plotEl = h('div', { class: 'plot' });
    const sG = slider({ id: ctx.key + '-g', label: 'Free cash flow growth, next 10 years', min: 0, max: 15, step: 0.5, value: 6, fmt: (v) => v + '% a year', onInput: (v) => ((g = v / 100), update()) });
    const sR = slider({ id: ctx.key + '-r', label: 'Discount rate (return you require)', min: 6, max: 14, step: 0.5, value: 9, fmt: (v) => v + '%', onInput: (v) => ((r = v / 100), update()) });
    const sT = slider({ id: ctx.key + '-t', label: 'Growth after year 10, forever', min: 0, max: 4, step: 0.5, value: 2.5, fmt: (v) => v + '%', onInput: (v) => ((tg = v / 100), update()) });
    const big = h('div', { class: 'dcf-out', 'aria-live': 'polite' });
    const stats = h('div', { class: 'stats' });
    stack(host, big, plotEl, sG.el, sR.el, sT.el, stats);
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 200 : 240),
      label: 'Present value of each year of cash flow, and the terminal value',
      draw(P) {
        const C = pal(),
          d = dcfValue(g, r, Math.min(tg, r - 0.01));
        const top = Math.max(d.ptv, ...d.yrs) * 1.1;
        P.domain(0.4, 12.6, 0, top);
        P.grid({ xTicks: [1, 5, 10, 12], xf: (v) => (v === 12 ? 'Terminal' : 'Y' + v), yf: (v) => '$' + Math.round(v) + 'M' });
        d.yrs.forEach((v, i) => P.rect(i + 1 - 0.34, 0, i + 1 + 0.34, v, alpha(C.call, 0.85)));
        P.rect(12 - 0.5, 0, 12 + 0.5, d.ptv, alpha(C.violet, 0.85));
      },
    });
    function update() {
      const t = Math.min(tg, r - 0.01);
      plot.render();
      const d = dcfValue(g, r, t);
      const vs = d.perShare / R.price - 1;
      big.innerHTML = `<span class="duo-l">Value per share</span><b class="${d.perShare >= R.price ? 'gain' : 'loss'}">${usd(d.perShare)}</b><span>${vs >= 0 ? `${pct(1 - R.price / d.perShare, { d: 0 })} margin of safety at the $22 price` : `The $22 price is ${pct(R.price / d.perShare - 1, { d: 0 })} above this value`}</span>`;
      stats.replaceChildren(stat('Next 10 years, today’s value', $m(d.pv)), stat('Terminal value, today’s value', $m(d.ptv), 'accent'), stat('Share of value from terminal', pct(d.ptv / d.ev, { d: 0 })), stat('Minus debt, plus cash', `${MINUS}$280M + $150M`));
    }
    update();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- DCF sensitivity grid ---------- */
  V.dcfGrid = function (host) {
    const G = [0.02, 0.04, 0.06, 0.08, 0.1],
      Rr = [0.07, 0.08, 0.09, 0.1, 0.11];
    const tbl = h('div', { class: 'table-wrap' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' }, 'Tap a cell. Green cells justify the $22 price; red cells do not.');
    const box = stack(host, h('p', { class: 'plot-h' }, 'Value per share: growth (rows) by discount rate (columns), terminal growth 2.5%'), tbl, read);
    tbl.innerHTML = `<table class="cmp grid"><thead><tr><th>Growth</th>${Rr.map((r) => `<th>${Math.round(r * 100)}%</th>`).join('')}</tr></thead><tbody>${G.map((g) => `<tr><th>${Math.round(g * 100)}%</th>${Rr.map((r) => {
      const v = dcfValue(g, r, 0.025).perShare;
      return `<td><button type="button" class="cell-b ${v >= R.price ? 'up' : 'down'}" data-g="${g}" data-r="${r}">${usd(v)}</button></td>`;
    }).join('')}</tr>`).join('')}</tbody></table>`;
    tbl.addEventListener('click', (e) => {
      const b = e.target.closest('.cell-b');
      if (!b) return;
      tbl.querySelectorAll('.cell-b').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const g = +b.dataset.g,
        r = +b.dataset.r,
        v = dcfValue(g, r, 0.025).perShare;
      read.innerHTML = `With <b>${Math.round(g * 100)}%</b> growth and a <b>${Math.round(r * 100)}%</b> discount rate, Ridgeline is worth <b class="${v >= R.price ? 'gain' : 'loss'}">${usd(v)}</b> a share, ${v >= R.price ? 'enough to justify' : 'below'} the $22 price.`;
    });
    return {
      play() {
        if (SS.reduced) return;
        box.classList.remove('go');
        void box.offsetWidth;
        box.classList.add('go');
      },
    };
  };

  /* ---------- dividend yield and payout ---------- */
  V.divCalc = function (host, p, ctx) {
    const PRE = { ridge: [22, 0.3, 1.1], trap: [12, 1.6, 1.2], grow: [50, 1.0, 3.0] };
    let [price, div, eps] = PRE.ridge;
    const sg = seg({ label: 'Example', options: [{ v: 'ridge', label: 'Ridgeline' }, { v: 'trap', label: 'A yield trap' }, { v: 'grow', label: 'A growing payer' }], value: 'ridge', onChange: (v) => (([price, div, eps] = PRE[v]), sP.set(price), sD.set(div), sE.set(eps), update()) });
    const sP = slider({ id: ctx.key + '-p', label: 'Share price', min: 5, max: 60, step: 0.5, value: price, fmt: (v) => usd(v), onInput: (v) => ((price = v), update()) });
    const sD = slider({ id: ctx.key + '-d', label: 'Dividend per share, per year', min: 0, max: 3, step: 0.05, value: div, fmt: (v) => usd(v), onInput: (v) => ((div = v), update()) });
    const sE = slider({ id: ctx.key + '-e', label: 'Earnings per share', min: 0.1, max: 4, step: 0.05, value: eps, fmt: (v) => usd(v), onInput: (v) => ((eps = v), update()) });
    const gauge = h('div', { class: 'po' }, h('div', { class: 'po-track' }, h('span', { class: 'po-z ok' }), h('span', { class: 'po-z warn' }), h('span', { class: 'po-z bad' }), h('i', { class: 'po-m' })), h('div', { class: 'po-l' }, h('span', null, '0%'), h('span', null, '60%'), h('span', null, '100%'), h('span', null, '150%')));
    const stats = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, stats, h('p', { class: 'plot-h' }, 'Payout ratio'), gauge, sP.el, sD.el, sE.el, read);
    function update() {
      const y = div / price,
        po = div / eps;
      gauge.querySelector('.po-m').style.left = Math.min(100, (po / 1.5) * 100) + '%';
      stats.replaceChildren(stat('Dividend yield', pct(y)), stat('Payout ratio', pct(po, { d: 0 }), po > 1 ? 'loss' : po > 0.6 ? '' : 'gain'), stat('Income on $10,000', money(10000 * y, { cents: false }) + ' a year'));
      read.innerHTML = po > 1 ? `Paying out <b class="loss">${pct(po, { d: 0 })}</b> of earnings: more than the company makes. A ${pct(y)} yield looks juicy, but a dividend cut is likely.` : po > 0.6 ? `Paying out ${pct(po, { d: 0 })} of earnings leaves a thin cushion if profits dip.` : `A ${pct(po, { d: 0 })} payout ratio leaves plenty of room to keep paying, and to raise the dividend over time.`;
    }
    update();
  };

  /* ---------- dividend reinvestment ---------- */
  V.drip = function (host, p, ctx) {
    let y = 0.03,
      g = 0.05,
      n = 30,
      reveal = 1,
      cancel = null;
    function run() {
      let sh = 100,
        px = 100,
        sh2 = 100,
        px2 = 100,
        cash = 0;
      const a = [[0, 10000]],
        b = [[0, 10000]],
        c = [[0, 10000]];
      for (let t = 1; t <= n; t++) {
        const d1 = sh * px * y;
        px *= 1 + g;
        sh += d1 / px;
        const d2 = sh2 * px2 * y;
        px2 *= 1 + g;
        cash += d2;
        a.push([t, sh * px]);
        b.push([t, sh2 * px2]);
        c.push([t, sh2 * px2 + cash]);
      }
      return { a, b, c, cash };
    }
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-gain' }, h('i', { class: 'lg-sw' }), 'Dividends reinvested'), h('span', { class: 'lg lg-stock' }, h('i', { class: 'lg-sw block' }), 'Shares only, dividends spent'), h('span', { class: 'lg lg-accent' }, h('i', { class: 'lg-sw block' }), 'Cash dividends you received'));
    const sY = slider({ id: ctx.key + '-y', label: 'Dividend yield', min: 0, max: 8, step: 0.5, value: 3, fmt: (v) => v + '%', onInput: (v) => ((y = v / 100), update()) });
    const sG = slider({ id: ctx.key + '-g', label: 'Share price growth', min: 0, max: 10, step: 0.5, value: 5, fmt: (v) => v + '% a year', onInput: (v) => ((g = v / 100), update()) });
    const sN = slider({ id: ctx.key + '-n', label: 'Years', min: 5, max: 40, step: 1, value: n, fmt: (v) => v + ' years', onInput: (v) => ((n = v), update()) });
    const stats = h('div', { class: 'stats' });
    stack(host, plotEl, legend, sY.el, sG.el, sN.el, stats);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Dividend reinvestment versus spending',
      draw(P) {
        const C = pal(),
          d = run();
        const T = n * reveal,
          cut = (s) => s.filter(([t]) => t <= T + 1e-9);
        P.domain(0, n, 0, Math.max(d.a[n][1], d.c[n][1]) * 1.08);
        P.grid({ xf: (v) => 'Y' + Math.round(v), yf: SS.axisMoney });
        P.area(cut(d.b), 0, C.stock, 0.35);
        P.between(cut(d.c), cut(d.b), C.accent, 0.3);
        P.line(cut(d.a), { color: C.gain, width: 3 });
      },
    });
    function update() {
      plot.render();
      const d = run();
      stats.replaceChildren(stat('Reinvested', money(d.a[n][1], { cents: false }), 'gain'), stat('Spent: shares worth', money(d.b[n][1], { cents: false })), stat('Spent: cash received', money(d.cash, { cents: false })), stat('Extra from reinvesting', money(d.a[n][1] - d.c[n][1], { cents: false }), 'gain'));
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(2200, (k) => {
          reveal = Math.max(0.02, ease.inOut(k));
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- dividend dates ---------- */
  V.divDates = function (host) {
    const DATES = [
      [0, 'Declaration'],
      [14, 'Ex-dividend'],
      [15, 'Record'],
      [30, 'Payment'],
    ];
    let buy = 10,
      shown = 31,
      cancel = null;
    const px = (d) => (d < 14 ? 22.3 : 22.0) + 0.06 * Math.sin(d * 1.7);
    const sg = seg({ label: 'You buy on', options: [{ v: '10', label: 'Day 10 (before)' }, { v: '14', label: 'Day 14 (ex-dividend date)' }, { v: '20', label: 'Day 20 (after)' }], value: '10', onChange: (v) => ((buy = +v), play()) });
    const plotEl = h('div', { class: 'plot' });
    const card = h('div', { class: 'duo-card txt', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, card, h('p', { class: 'fine' }, 'Illustrative $0.30 dividend. Real prices move for many reasons on any day.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 200 : 230),
      label: 'Share price around the dividend dates',
      draw(P) {
        const C = pal();
        P.domain(0, 30, 21.6, 22.6);
        P.grid({ xTicks: [0, 14, 30], xf: (v) => 'Day ' + v, yf: (v) => '$' + v.toFixed(2), yTicks: [21.8, 22.0, 22.2, 22.4] });
        DATES.forEach(([d, l], i) => P.vline(d, { color: i === 1 ? C.warn : C.muted, dash: [3, 3], label: l, row: i % 2 }));
        P.line(P.sample(px, 0, Math.min(30, shown), 300), { color: C.ink, width: 2.5 });
        if (shown >= buy) {
          const gets = buy < 14;
          P.dot(buy, px(buy), { color: gets ? C.gain : C.loss });
          P.tag('You buy', P.X(buy), P.Y(px(buy)), { bg: gets ? C.gain : C.loss, dy: 12 });
        }
      },
    });
    function update() {
      plot.render();
      const gets = buy < 14;
      card.innerHTML = `<span class="duo-l">Bought on day ${buy} at ${usd(px(buy))}</span><b>${gets ? 'You get the $0.30 dividend' : 'No dividend this time'}</b><span>${gets ? 'You owned the shares before the ex-dividend date, so you are on the record and get paid on day 30. The share price drops by about $0.30 on the ex-date, so your total value is roughly unchanged.' : 'You bought on or after the ex-dividend date, so the seller keeps this dividend. You did pay about $0.30 less per share.'}</span>`;
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(1800, (k) => {
        shown = 30 * k;
        update();
      });
    }
    update();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };
})();
