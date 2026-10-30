/* Fundamentals, Unit 3 visuals: diversification, funds, allocation, investor habits. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, money, pct, usd, pal, alpha, tween, ease } = SS;
  const V = SS.viz;
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const m0 = (v) => money(v, { cents: false });
  const ph = (w) => (w < 480 ? 220 : 270);
  const replay = (el) => {
    el.classList.remove('go');
    void el.offsetWidth;
    el.classList.add('go');
  };

  /* ---------- diversification tiles ---------- */
  V.diversify = function (host, p, ctx) {
    const mult = (x) => '×' + (x < 10 ? x.toFixed(2) : Math.round(x));
    const T = 10,
      mL = 0.06,
      sM = 0.16,
      sI = 0.35;
    let n = 5,
      seed = 1,
      outs = [],
      lossOdds = 0;
    const draw = (r, k) => {
      const M = mL * T + sM * Math.sqrt(T) * SS.gauss(r);
      const res = [];
      for (let i = 0; i < k; i++) res.push(Math.exp(M + sI * Math.sqrt(T) * SS.gauss(r) - (sI * sI * T) / 2));
      return res;
    };
    function odds() {
      const r = SS.rng(99991 + n);
      let losses = 0;
      for (let k = 0; k < 600; k++) {
        const o = draw(r, n);
        if (o.reduce((a, b) => a + b, 0) / n < 1) losses++;
      }
      lossOdds = losses / 600;
    }
    const grid = h('div', { class: 'div-grid', 'aria-hidden': 'true' });
    const sl = slider({ id: ctx.key + '-n', label: 'Number of stocks you own', min: 1, max: 50, step: 1, value: n, fmt: (v) => v + (v === 1 ? ' stock' : ' stocks'), onInput: (v) => ((n = v), run(false)) });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => (seed++, run(true)) }, 'Simulate another 10 years');
    const stats = h('div', { class: 'stats' });
    const box = stack(host, grid, h('div', { class: 'ctl-row' }, btn, sl.el), stats, h('p', { class: 'fine' }, 'Each tile is one company. Green grew, red shrank; the label is what each $1 became. Simulated: every stock has the same expected return.'));
    function run(animate) {
      outs = draw(SS.rng(seed * 6007 + n * 31), n);
      odds();
      grid.style.setProperty('--cols', n <= 4 ? n : n <= 12 ? 4 : n <= 30 ? 6 : 10);
      grid.replaceChildren(
        ...outs.map((x) => {
          const cls = x < 0.25 ? 'l3' : x < 0.7 ? 'l2' : x < 1 ? 'l1' : x < 2 ? 'g1' : x < 4 ? 'g2' : 'g3';
          return h('span', { class: 'div-t ' + cls }, '×' + (x < 10 ? x.toFixed(1) : Math.round(x)));
        })
      );
      if (animate && !SS.reduced) replay(box);
      const port = (outs.reduce((a, b) => a + b, 0) / n) * 10000;
      stats.replaceChildren(stat('$10,000 became', m0(port), SS.plClass(port - 10000)), stat(n === 1 ? 'Your stock' : 'Worst stock', mult(Math.min(...outs)), n === 1 ? SS.plClass(outs[0] - 1) : 'loss'), stat('Best stock', mult(Math.max(...outs)), 'gain'), stat(`Chance of a loss with ${n}`, pct(lossOdds, { d: 0 }), lossOdds > 0.25 ? 'loss' : ''));
    }
    run(false);
    return { play: () => run(true) };
  };

  /* ---------- risk vs number of stocks ---------- */
  V.riskCurve = function (host, p, ctx) {
    const sM = 16,
      sI = 35;
    let n = 10;
    const sp = (k) => Math.sqrt(sM * sM + (sI * sI) / k);
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-stock' }, h('i', { class: 'lg-sw block' }), 'Market risk (stays)'), h('span', { class: 'lg lg-put' }, h('i', { class: 'lg-sw block' }), 'Company-specific risk (shrinks)'));
    const sl = slider({ id: ctx.key + '-n', label: 'Number of stocks', min: 1, max: 50, step: 1, value: n, fmt: (v) => String(v), onInput: (v) => ((n = v), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, legend, sl.el, read, h('p', { class: 'fine' }, 'Illustrative: each stock swings about 38% a year on its own, and the market about 16%.'));
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Portfolio risk by number of stocks',
      onScrub: (v) => {
        n = Math.max(1, Math.round(v));
        sl.set(n);
        update();
      },
      draw(P) {
        const C = pal();
        P.domain(1, 50, 0, 40);
        P.grid({ xf: (v) => String(Math.round(v)), yf: (v) => v + '%', xTicks: [1, 10, 20, 30, 40, 50] });
        const curve = P.sample(sp, 1, 50, 200);
        P.area(
          curve.map(([x]) => [x, sM]),
          0,
          C.stock,
          0.35
        );
        P.between(
          curve,
          curve.map(([x]) => [x, sM]),
          C.put,
          0.35
        );
        P.line(curve, { color: C.ink, width: 2.5 });
        P.hline(sM, { color: C.ink, dash: [3, 3], label: 'Market risk floor 16%' });
        P.dot(n, sp(n), { color: C.ink });
        P.tag(sp(n).toFixed(1) + '%', P.X(n), P.Y(sp(n)), { bg: C.ink });
      },
    });
    function update() {
      plot.render();
      read.innerHTML = `With <b>${n}</b> ${n === 1 ? 'stock' : 'stocks'}, yearly swings are about <b>${sp(n).toFixed(1)}%</b>. <b>${pct(1 - 1 / n, { d: 0 })}</b> of the company-specific risk is gone; the market's 16% remains.`;
    }
    update();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- correlation mixer ---------- */
  V.correlation = function (host, p, ctx) {
    const M = 120,
      s = 0.2 / Math.sqrt(12),
      mu = 0.07 / 12;
    let rho = 0.3;
    const r = SS.rng(4242);
    const zA = Array.from({ length: M }, () => SS.gauss(r)),
      zC = Array.from({ length: M }, () => SS.gauss(r));
    const series = () => {
      const A = [100],
        B = [100],
        X = [100];
      for (let i = 0; i < M; i++) {
        const ra = mu + s * zA[i],
          rb = mu + s * (rho * zA[i] + Math.sqrt(1 - rho * rho) * zC[i]);
        A.push(A[i] * (1 + ra));
        B.push(B[i] * (1 + rb));
        X.push(X[i] * (1 + (ra + rb) / 2));
      }
      return { A, B, X };
    };
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-call' }, h('i', { class: 'lg-sw' }), 'Asset A'), h('span', { class: 'lg lg-put' }, h('i', { class: 'lg-sw' }), 'Asset B'), h('span', { class: 'lg lg-ink' }, h('i', { class: 'lg-sw' }), '50/50 mix'));
    const sl = slider({ id: ctx.key + '-rho', label: 'Correlation between A and B', min: -1, max: 1, step: 0.1, value: rho, fmt: (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1), onInput: (v) => ((rho = Math.round(v * 10) / 10), update()) });
    const stats = h('div', { class: 'stats' });
    stack(host, plotEl, legend, sl.el, stats);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Two assets and their mix',
      draw(P) {
        const C = pal(),
          { A, B, X } = series();
        const all = A.concat(B, X);
        P.domain(0, M, Math.min(...all) * 0.95, Math.max(...all) * 1.05);
        P.grid({ xf: (v) => 'Y' + Math.round(v / 12), xTicks: [0, 24, 48, 72, 96, 120], yf: (v) => Math.round(v) });
        P.line(
          A.map((v, i) => [i, v]),
          { color: C.call, width: 1.5, alpha: 0.75 }
        );
        P.line(
          B.map((v, i) => [i, v]),
          { color: C.put, width: 1.5, alpha: 0.75 }
        );
        P.line(
          X.map((v, i) => [i, v]),
          { color: C.ink, width: 3 }
        );
      },
    });
    const dd = (s) => {
      let pk = s[0],
        w = 0;
      s.forEach((v) => ((pk = Math.max(pk, v)), (w = Math.min(w, v / pk - 1))));
      return w;
    };
    function update() {
      plot.render();
      const { A, X } = series();
      stats.replaceChildren(stat('Swings of each asset', '20% a year'), stat('Swings of the mix', (20 * Math.sqrt((1 + rho) / 2)).toFixed(1) + '% a year', 'accent'), stat('Worst drop, asset A', pct(dd(A), { d: 0 }), 'loss'), stat('Worst drop, the mix', pct(dd(X), { d: 0 }), dd(X) > dd(A) ? 'gain' : 'loss'));
    }
    update();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- fund managers vs the index ---------- */
  V.managers = function (host, p, ctx) {
    const K = 100;
    let fee = 0.01,
      yrs = 15,
      cancel = null;
    const r = SS.rng(2024);
    const skill = Array.from({ length: K }, () => 0.01 * SS.gauss(r));
    const luck = Array.from({ length: K }, () => Array.from({ length: 20 }, () => 0.06 * SS.gauss(r)));
    const excess = () => skill.map((s, i) => s - fee + luck[i].slice(0, yrs).reduce((a, b) => a + b, 0) / yrs);
    const plotEl = h('div', { class: 'plot' });
    const sF = slider({ id: ctx.key + '-fee', label: 'Fee managers charge', min: 0, max: 2, step: 0.1, value: 1, fmt: (v) => v.toFixed(1) + '% a year', onInput: (v) => ((fee = v / 100), update()) });
    const sY = slider({ id: ctx.key + '-yrs', label: 'Years measured', min: 1, max: 20, step: 1, value: yrs, fmt: (v) => v + (v === 1 ? ' year' : ' years'), onInput: (v) => (stop(), (yrs = v), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, sF.el, sY.el, read, h('p', { class: 'fine' }, 'Simulation: each dot is a manager. Skill averages zero; yearly luck swings ±6%.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 220 : 250),
      pad: { l: 14 },
      label: 'Managers’ yearly return compared with the index',
      draw(P) {
        const C = pal(),
          ex = excess();
        P.domain(-0.08, 0.08, 0, 30);
        P.grid({ xf: (v) => (v > 0 ? '+' : '') + Math.round(v * 100) + '%', xTicks: [-0.08, -0.04, 0, 0.04, 0.08], noYLabels: true, yTicks: [], zero: false });
        P.vline(0, { color: C.ink, dash: [3, 3], label: 'Index return' });
        const bins = {};
        ex.slice()
          .sort((a, b) => a - b)
          .forEach((e) => {
            const v = Math.max(-0.0795, Math.min(0.0795, e));
            const b = Math.round(v / 0.005);
            bins[b] = (bins[b] || 0) + 1;
            const y = bins[b] - 0.5;
            const c = P.c;
            c.beginPath();
            c.arc(P.X(b * 0.005), P.Y(y * 1.0), Math.max(2.5, Math.min(5, (P.Y(0) - P.Y(1)) / 2 - 0.5)), 0, Math.PI * 2);
            c.fillStyle = e > 0 ? C.gain : alpha(C.loss, 0.85);
            c.fill();
          });
      },
    });
    function update() {
      plot.render();
      const ex = excess(),
        win = ex.filter((e) => e > 0).length;
      read.innerHTML = `After <b>${yrs} ${yrs === 1 ? 'year' : 'years'}</b>, <b class="${win >= 50 ? 'gain' : 'loss'}">${win} of 100</b> managers are ahead of the index after fees.`;
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    update();
    return {
      play() {
        stop();
        cancel = tween(3200, (k) => {
          yrs = Math.max(1, Math.round(1 + 14 * ease.inOut(k)));
          sY.set(yrs);
          update();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- ETF fact sheet ---------- */
  V.etfSheet = function (host) {
    const tabs = {
      over: 'Overview',
      top: 'Top holdings',
      sect: 'Sectors',
    };
    const TOP = [
      ['Titan Tech', 6.8],
      ['Nova Retail', 5.1],
      ['Orion Health', 3.9],
      ['Vertex Software', 3.2],
      ['Delta Energy', 2.4],
      ['Summit Bank', 2.1],
      ['Pioneer Auto', 1.6],
      ['Cedar Goods', 1.2],
    ];
    const SECT = [
      ['Technology', 30],
      ['Financials', 13],
      ['Health care', 12],
      ['Consumer', 10],
      ['Industrials', 9],
      ['Communication', 8],
      ['Energy', 4],
      ['Everything else', 14],
    ];
    let cur = 'over';
    const body = h('div', { class: 'etf-body' });
    const sg = seg({ label: 'Fact sheet section', options: Object.keys(tabs).map((k) => ({ v: k, label: tabs[k] })), value: cur, onChange: (v) => ((cur = v), render(true)) });
    const card = h('div', { class: 'etf' }, h('div', { class: 'etf-head' }, h('b', null, 'EXMP'), h('span', null, 'Example Total Market ETF')), sg.el, body);
    stack(host, card, h('p', { class: 'fine' }, 'A made-up fund with illustrative figures.'));
    const bars = (rows, max, unit) => `<div class="fb">${rows.map(([n, v]) => `<div class="fb-row"><span>${n}</span><span class="fb-bar"><i style="width:${(v / max) * 100}%"></i></span><b>${v}${unit}</b></div>`).join('')}</div>`;
    function render(animate) {
      if (cur === 'over')
        body.innerHTML = `<div class="stats">${[
          ['Tracks', 'US total market, about 3,600 companies'],
          ['Expense ratio', '0.03% ($3 a year per $10,000)'],
          ['Holdings', '3,612'],
          ['Dividend yield', '1.4% a year'],
          ['Tracking difference', '−0.03% a year vs its index'],
          ['Average daily volume', '3.2 million shares'],
          ['Typical bid-ask spread', '$0.01'],
          ['Price vs NAV', 'Within 0.02%'],
        ]
          .map(([l, v]) => `<div class="stat"><span class="stat-l">${l}</span><span class="stat-v">${v}</span></div>`)
          .join('')}</div>`;
      else if (cur === 'top') body.innerHTML = bars(TOP, 7, '%') + '<p class="fine">The top 8 holdings are 26% of the fund; the other 3,604 companies make up the rest.</p>';
      else body.innerHTML = bars(SECT, 30, '%');
      if (animate && !SS.reduced) replay(card);
    }
    render(false);
  };

  /* ---------- stock / bond mix ---------- */
  V.allocation = function (host, p, ctx) {
    const mS = 8,
      sS = 16,
      mB = 4,
      sB = 6,
      rho = 0.1;
    let w = 0.6;
    const stats_ = (x) => ({ m: x * mS + (1 - x) * mB, s: Math.sqrt(x * x * sS * sS + (1 - x) * (1 - x) * sB * sB + 2 * x * (1 - x) * rho * sS * sB) });
    const ns = 'http://www.w3.org/2000/svg';
    const donut = document.createElementNS(ns, 'svg');
    donut.setAttribute('viewBox', '0 0 120 120');
    donut.setAttribute('class', 'donut');
    donut.setAttribute('aria-hidden', 'true');
    donut.innerHTML = `<circle cx="60" cy="60" r="46" class="dn-b"/><circle cx="60" cy="60" r="46" class="dn-s" pathLength="100" transform="rotate(-90 60 60)"/><text x="60" y="56" class="dn-v"></text><text x="60" y="74" class="dn-l">stocks</text>`;
    const plotEl = h('div', { class: 'plot' });
    const sl = slider({ id: ctx.key + '-w', label: 'Stocks in the mix', min: 0, max: 100, step: 5, value: 60, fmt: (v) => `${v}% stocks / ${100 - v}% bonds`, onInput: (v) => ((w = v / 100), update()) });
    const stats = h('div', { class: 'stats' });
    stack(host, h('div', { class: 'alloc-row' }, donut, plotEl), sl.el, stats, h('p', { class: 'fine' }, 'Illustrative assumptions: stocks 8% a year with 16% swings, bonds 4% with 6% swings, correlation 0.1. Not a forecast.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 190 : 220),
      label: 'Risk and return of each mix',
      draw(P) {
        const C = pal();
        P.domain(4, 17, 3.5, 8.5);
        P.grid({ xf: (v) => v + '%', yf: (v) => v + '%', xTicks: [5, 10, 15], yTicks: [4, 6, 8] });
        P.text('Swings →', P.w - 6, P.h - 4, { align: 'right', base: 'bottom', color: C.muted });
        P.text('↑ Return', P.pad.l + 4, P.pad.t, { align: 'left', base: 'top', color: C.muted });
        const pts = [];
        for (let i = 0; i <= 100; i++) {
          const s = stats_(i / 100);
          pts.push([s.s, s.m]);
        }
        P.line(pts, { color: C.accent, width: 2.5 });
        [0, 0.2, 0.4, 0.6, 0.8, 1].forEach((x) => {
          const s = stats_(x);
          P.dot(s.s, s.m, { color: C.muted, r: 2.5 });
        });
        const c = stats_(w);
        P.dot(c.s, c.m, { color: C.accent });
        P.tag(Math.round(w * 100) + '/' + Math.round(100 - w * 100), P.X(c.s), P.Y(c.m), { bg: C.accent });
      },
    });
    function update() {
      plot.render();
      donut.querySelector('.dn-s').setAttribute('stroke-dasharray', `${w * 100} ${100 - w * 100}`);
      donut.querySelector('.dn-v').textContent = Math.round(w * 100) + '%';
      const { m, s } = stats_(w);
      const bad = m - 1.645 * s,
        mid = 10000 * Math.exp((m / 100 - (s / 100) ** 2 / 2) * 20);
      stats.replaceChildren(stat('Expected return', m.toFixed(1) + '% a year'), stat('Typical yearly swing', '±' + s.toFixed(1) + '%'), stat('A bad year (1 in 20)', bad.toFixed(0) + '%', 'loss'), stat('$10,000 in 20 years, middle outcome', m0(mid), 'gain'));
    }
    update();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- glide path ---------- */
  V.glidePath = function (host, p, ctx) {
    let age = 35,
      rule = '110';
    const rules = {
      100: (a) => 100 - a,
      110: (a) => 110 - a,
      120: (a) => 120 - a,
      td: (a) => (a <= 40 ? 90 : a <= 65 ? 90 - ((a - 40) * 40) / 25 : Math.max(30, 50 - ((a - 65) * 20) / 10)),
    };
    const stocks = (a) => Math.max(0, Math.min(100, rules[rule](a)));
    const sg = seg({ label: 'Rule of thumb', options: [{ v: '100', label: '100 − age' }, { v: '110', label: '110 − age' }, { v: '120', label: '120 − age' }, { v: 'td', label: 'Target-date style' }], value: rule, onChange: (v) => ((rule = v), update()) });
    const plotEl = h('div', { class: 'plot' });
    const sl = slider({ id: ctx.key + '-age', label: 'Your age', min: 20, max: 80, step: 1, value: age, fmt: (v) => String(v), onInput: (v) => ((age = v), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-accent' }, h('i', { class: 'lg-sw block' }), 'Stocks'), h('span', { class: 'lg lg-call' }, h('i', { class: 'lg-sw block' }), 'Bonds and cash'));
    stack(host, sg.el, plotEl, legend, sl.el, read);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Stock share by age',
      onScrub: (v) => {
        age = Math.round(v);
        sl.set(age);
        update();
      },
      draw(P) {
        const C = pal();
        P.domain(20, 80, 0, 100);
        P.grid({ xf: (v) => String(v), yf: (v) => v + '%', yTicks: [0, 25, 50, 75, 100] });
        const pts = P.sample(stocks, 20, 80, 120);
        P.area(pts, 0, C.accent, 0.4);
        P.between(
          pts.map(([x]) => [x, 100]),
          pts,
          C.call,
          0.12
        );
        P.line(pts, { color: C.accent, width: 2.5 });
        P.vline(age, { color: C.ink, dash: null, alpha: 0.3 });
        P.dot(age, stocks(age), { color: C.accent });
      },
    });
    function update() {
      plot.render();
      const s = Math.round(stocks(age));
      read.innerHTML = `At <b>${age}</b>, this ${rule === 'td' ? 'glide path' : 'rule'} suggests about <b>${s}% stocks</b> and ${100 - s}% bonds and cash. Treat it as a starting point, then adjust for your goals and how you handle drops.`;
    }
    update();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- rebalancing ---------- */
  V.rebalance = function (host) {
    let S = 6000,
      B = 4000;
    const target = 0.6;
    const bar = h('div', { class: 'rb-bar' }, h('span', { class: 'rb-s' }), h('span', { class: 'rb-b' }), h('i', { class: 'rb-t', style: { left: target * 100 + '%' } }));
    const amounts = h('div', { class: 'stats' });
    const log = h('ol', { class: 'rb-log', 'aria-live': 'polite' });
    const act = (label, fn) => h('button', { type: 'button', class: 'btn sm', onclick: fn }, label);
    stack(
      host,
      h('p', { class: 'plot-h' }, 'Target: 60% stocks, 40% bonds'),
      bar,
      amounts,
      h(
        'div',
        { class: 'ctl-row' },
        act('Great year for stocks', () => year(0.3, 0.02, 'Great year: stocks +30%, bonds +2%.')),
        act('Bad year for stocks', () => year(-0.25, 0.05, 'Bad year: stocks −25%, bonds +5%.')),
        h('button', { type: 'button', class: 'btn sm primary', onclick: () => rebal() }, 'Rebalance'),
        act('Reset', () => ((S = 6000), (B = 4000), log.replaceChildren(), update()))
      ),
      log
    );
    function update() {
      const tot = S + B,
        w = S / tot;
      bar.querySelector('.rb-s').style.width = w * 100 + '%';
      bar.querySelector('.rb-s').textContent = Math.round(w * 100) + '% stocks';
      bar.querySelector('.rb-b').style.width = (1 - w) * 100 + '%';
      bar.querySelector('.rb-b').textContent = Math.round((1 - w) * 100) + '%';
      const drift = (w - target) * 100;
      amounts.replaceChildren(stat('Stocks', m0(S)), stat('Bonds', m0(B)), stat('Total', m0(tot)), stat('Drift from target', (drift > 0 ? '+' : '') + drift.toFixed(1) + ' pts', Math.abs(drift) >= 5 ? 'loss' : ''));
    }
    function year(rs, rb, txt) {
      S *= 1 + rs;
      B *= 1 + rb;
      log.prepend(h('li', null, txt + ` Now ${Math.round((S / (S + B)) * 100)}% stocks.`));
      update();
    }
    function rebal() {
      const tot = S + B,
        want = tot * target,
        move = S - want;
      if (Math.abs(move) < 1) {
        log.prepend(h('li', null, 'Already on target. Nothing to do.'));
        return;
      }
      S = want;
      B = tot - want;
      log.prepend(h('li', { class: 'rb-do' }, move > 0 ? `Rebalanced: sold ${m0(move)} of stocks and bought bonds. You trimmed what had risen.` : `Rebalanced: sold ${m0(-move)} of bonds and bought stocks while they were cheaper.`));
      update();
    }
    update();
  };

  /* ---------- dollar-cost averaging ---------- */
  V.dca = function (host, p, ctx) {
    const PATHS = {
      dip: [50, 46, 40, 32, 26, 25, 28, 33, 38, 43, 47, 50],
      chop: [50, 55, 45, 52, 40, 48, 58, 44, 50, 47, 55, 50],
      climb: [50, 52, 53, 55, 57, 58, 60, 62, 63, 65, 67, 70],
    };
    let key = 'dip',
      shown = 12,
      cancel = null;
    const amt = 300;
    const sg = seg({ label: 'Market path', options: [{ v: 'dip', label: 'Falls, then recovers' }, { v: 'chop', label: 'Choppy' }, { v: 'climb', label: 'Steady climb' }], value: key, onChange: (v) => ((key = v), play()) });
    const top = h('div', { class: 'plot' }),
      bot = h('div', { class: 'plot' });
    const stats = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, h('p', { class: 'plot-h' }, 'Share price each month'), top, h('p', { class: 'plot-h' }, 'Shares your $300 buys'), bot, stats, read);
    const mo = (v) => 'M' + (Math.round(v) + 1);
    const pTop = new Plot(top, {
      height: 150,
      label: 'Monthly share price',
      draw(P) {
        const C = pal(),
          px = PATHS[key];
        P.domain(-0.5, 11.5, 0, 80);
        P.grid({ xTicks: [0, 3, 6, 9, 11], xf: mo, yf: (v) => '$' + v, yTicks: [0, 40, 80] });
        P.line(
          px.slice(0, shown).map((v, i) => [i, v]),
          { color: C.ink, width: 2.5 }
        );
        px.slice(0, shown).forEach((v, i) => P.dot(i, v, { color: C.ink, r: 3 }));
      },
    });
    const pBot = new Plot(bot, {
      height: 140,
      label: 'Shares bought each month',
      draw(P) {
        const C = pal(),
          px = PATHS[key];
        P.domain(-0.5, 11.5, 0, 13);
        P.grid({ xTicks: [0, 3, 6, 9, 11], xf: mo, yf: (v) => String(v), yTicks: [0, 6, 12] });
        px.slice(0, shown).forEach((v, i) => P.rect(i - 0.34, 0, i + 0.34, amt / v, alpha(C.gain, 0.85)));
      },
    });
    function update() {
      pTop.render();
      pBot.render();
      const px = PATHS[key].slice(0, shown);
      const sh = px.reduce((a, v) => a + amt / v, 0),
        put = amt * px.length;
      const avgPx = px.reduce((a, b) => a + b, 0) / px.length,
        cost = put / sh,
        val = sh * px[px.length - 1];
      const lump = (amt * 12 * PATHS[key][11]) / PATHS[key][0];
      stats.replaceChildren(stat('Invested', m0(put)), stat('Average price', usd(avgPx)), stat('Your average cost', usd(cost), 'gain'), stat('Value now', m0(val), SS.plClass(val - put)));
      read.innerHTML =
        shown < 12
          ? `Month ${shown}: you have bought ${sh.toFixed(1)} shares so far.`
          : key === 'climb'
            ? `Your average cost (${usd(cost)}) is below the average price (${usd(avgPx)}), but in a steady climb, investing all $3,600 in month 1 would have done better: ${m0(lump)}. Dollar-cost averaging trades a little return for an easier, steadier entry.`
            : `You paid an average of <b>${usd(cost)}</b> a share while the average price was ${usd(avgPx)}, because the cheap months bought the most shares.`;
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(2400, (k) => {
        shown = Math.max(1, Math.round(12 * k));
        update();
      });
    }
    update();
    return { play, destroy: () => (cancel && cancel(), pTop.destroy(), pBot.destroy()) };
  };

  /* ---------- missing the best days ---------- */
  V.missedDays = function (host) {
    const D = 252 * 20;
    let seed = 8,
      rets = [];
    function sim() {
      const r = SS.rng(seed * 15485863);
      let stress = false;
      rets = [];
      for (let d = 0; d < D; d++) {
        if (!stress && r() < 0.004) stress = true;
        else if (stress && r() < 0.03) stress = false;
        rets.push(0.00035 + (stress ? 0.022 : 0.008) * SS.gauss(r));
      }
    }
    const value = (skip) => rets.reduce((v, x, i) => (skip.has(i) ? v : v * (1 + x)), 10000);
    const bars = h('div', { class: 'md' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => (seed++, sim(), update(true)) }, 'Simulate another 20 years');
    const box = stack(host, bars, h('div', { class: 'ctl-row' }, btn), read, h('p', { class: 'fine' }, 'Simulated daily returns over 20 years, with calm and stormy stretches. Each bar starts with $10,000.'));
    function update(animate) {
      const order = rets.map((x, i) => [x, i]).sort((a, b) => b[0] - a[0]);
      const best = (k) => new Set(order.slice(0, k).map((o) => o[1]));
      const cases = [
        ['Stayed invested', 0],
        ['Missed best 5 days', 5],
        ['Missed best 10', 10],
        ['Missed best 20', 20],
        ['Missed best 30', 30],
      ];
      const vals = cases.map(([, k]) => value(best(k)));
      const max = Math.max(...vals);
      bars.replaceChildren(...cases.map(([l], i) => h('div', { class: 'md-row' }, h('span', null, l), h('span', { class: 'md-bar' }, h('i', { class: i ? 'miss' : 'stay', style: { width: (vals[i] / max) * 100 + '%' } })), h('b', null, m0(vals[i])))));
      const worst = new Set(order.slice(-10).map((o) => o[1]));
      const near = order.slice(0, 10).filter(([, i]) => [...worst].some((w) => Math.abs(w - i) <= 10)).length;
      read.innerHTML = `Missing only the 10 best days out of ${D.toLocaleString('en-US')} cut the result by <b class="loss">${pct(1 - vals[2] / vals[0], { d: 0 })}</b>. ${near} of those 10 best days came within two weeks of one of the 10 worst days, right when selling felt safest.`;
      if (animate && !SS.reduced) replay(box);
    }
    sim();
    update(false);
    return { play: () => update(true) };
  };

  /* ---------- emotional cycle ---------- */
  V.emotionCycle = function (host) {
    const S = [
      ['Optimism', 'Prices are rising and things look good.', 'Keep investing on schedule.'],
      ['Excitement', 'Gains pile up. Friends talk about stocks.', 'Check that your mix has not drifted too far into stocks.'],
      ['Thrill', 'It feels easy. People start taking bigger risks.', 'Avoid adding leverage or chasing the hottest names.'],
      ['Euphoria', '“This time is different.” The point of maximum risk.', 'Rebalance: trim what has run up.'],
      ['Anxiety', 'The first drop. “It’s just a pullback.”', 'Nothing to do. Drops are normal.'],
      ['Denial', 'Prices keep falling. “It will bounce back soon.”', 'Stay with the plan; do not double down on single bets.'],
      ['Fear', 'Losses are real and headlines are grim.', 'Keep contributing. Shares are on sale.'],
      ['Panic', 'Everyone wants out. The point of maximum opportunity.', 'Do not sell. Rebalance into stocks if your plan says so.'],
      ['Hope', 'Prices stop falling, but few believe it.', 'Keep investing on schedule.'],
      ['Relief', '“I’m glad I didn’t sell.”', 'Review the plan, not the headlines.'],
    ];
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 600 230');
    svg.setAttribute('class', 'emo');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'The investor emotional cycle across a market rise and fall');
    svg.innerHTML = `<path class="emo-path" d="M20 175 C 100 160, 160 40, 230 40 S 350 195, 420 195 S 540 130, 585 100"/><text x="230" y="24" class="emo-tag risk">Maximum risk</text><text x="420" y="222" class="emo-tag opp">Maximum opportunity</text><g class="emo-marks"></g><circle r="8" class="emo-dot"/>`;
    const path = svg.querySelector('.emo-path');
    const L = path.getTotalLength ? path.getTotalLength() : 0;
    let tPeak = 0.3,
      tTrough = 0.66;
    if (L) {
      let minY = 1e9,
        maxY = -1e9;
      for (let i = 0; i <= 200; i++) {
        const pt = path.getPointAtLength((L * i) / 200);
        if (pt.y < minY) ((minY = pt.y), (tPeak = i / 200));
        if (pt.y > maxY && i / 200 > tPeak) ((maxY = pt.y), (tTrough = i / 200));
      }
    }
    const pos = [0.07, tPeak * 0.45, tPeak * 0.78, tPeak, tPeak + (tTrough - tPeak) * 0.28, tPeak + (tTrough - tPeak) * 0.55, tPeak + (tTrough - tPeak) * 0.8, tTrough, tTrough + (1 - tTrough) * 0.38, tTrough + (1 - tTrough) * 0.8];
    const at = (t) => (L ? path.getPointAtLength(L * t) : { x: 20 + 565 * t, y: 120 });
    svg.querySelector('.emo-marks').innerHTML = pos.map((t, i) => {
      const pt = at(t);
      return `<circle cx="${pt.x}" cy="${pt.y}" r="4" class="emo-m" data-i="${i}"/>`;
    }).join('');
    const dot = svg.querySelector('.emo-dot');
    let cur = 0,
      tNow = pos[0],
      raf = 0,
      timer = null;
    const place = (t) => {
      const pt = at(t);
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);
    };
    const info = h('div', { class: 'duo-card txt', 'aria-live': 'polite' });
    const chips = seg({ label: 'Stage', options: S.map((s, i) => ({ v: String(i), label: s[0] })), value: '0', onChange: (v) => (stop(), go(+v)) });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Play the cycle');
    stack(host, svg, h('div', { class: 'ctl-row' }, btn), chips.el, info);
    function go(i) {
      cur = i;
      chips.set(String(i));
      const [n, feel, plan] = S[i];
      info.innerHTML = `<span class="duo-l">Stage ${i + 1} of ${S.length}</span><b>${n}</b><span>${feel}</span><span class="emo-plan"><strong>The plan says:</strong> ${plan}</span>`;
      svg.querySelectorAll('.emo-m').forEach((m) => m.classList.toggle('on', +m.dataset.i === i));
      const from = tNow,
        to = pos[i];
      cancelAnimationFrame(raf);
      if (SS.reduced) {
        tNow = to;
        place(to);
        return;
      }
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 650);
        tNow = from + (to - from) * ease.inOut(k);
        place(tNow);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      setTimeout(() => ((tNow = to), place(to)), 900);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }
    function play() {
      stop();
      go(0);
      if (SS.reduced) return;
      timer = setInterval(() => {
        if (cur >= S.length - 1) return stop();
        go(cur + 1);
      }, 1800);
    }
    place(pos[0]);
    go(0);
    return { play, destroy: () => (stop(), cancelAnimationFrame(raf)) };
  };
})();
