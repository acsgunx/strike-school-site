/* Technical Analysis in Depth, Unit 5 visuals: the order in which bonds, stocks and commodities turn, a sector
   rotation clock, the relative strength line, and a breadth divergence. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, seg, pal, alpha, tween, ease } = SS;
  const V = SS.viz;
  const TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);
  const argExt = (xs, a, b, f) => {
    let j = Math.max(0, a);
    for (let t = Math.max(0, a); t <= Math.min(b, xs.length - 1); t++) if (f(xs[t], xs[j])) j = t;
    return j;
  };
  const pc = (x) => (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(0) + '%';

  /* ---------- who turns first: bonds, stocks, commodities ---------- */
  const PER = 72,
    NM = 110;
  const MK3 = [
    { k: 'bonds', label: 'Bonds', col: 'accent', peak: 18, amp: 9, seed: 1 },
    { k: 'stocks', label: 'Stocks', col: 'ink', peak: 25, amp: 13, seed: 2 },
    { k: 'comm', label: 'Commodities', col: 'warn', peak: 33, amp: 11, seed: 3 },
  ];
  V.intermarketCycle = function (host, p, ctx) {
    const make = (peak, amp, seed, sign = 1) => {
      const r = SS.rng(40 + seed);
      let e = 0;
      return Array.from({ length: NM }, (_, t) => ((e = 0.7 * e + (r() - 0.5) * 1.2), 100 + sign * amp * Math.cos((2 * Math.PI * (t - peak)) / PER) + e));
    };
    const S = MK3.map((m) => ({ ...m, y: make(m.peak, m.amp, m.seed) })),
      dollar = make(33, 7, 4, -1);
    S.forEach((m) => {
      m.top = argExt(m.y, m.peak - 12, m.peak + 12, (a, b) => a > b);
      m.bot = argExt(m.y, m.peak + 24, m.peak + 48, (a, b) => a < b);
    });
    const events = [
      ...S.map((m) => ({ t: m.top, text: { bonds: 'Bonds peak: interest rates start to rise. Stocks are still climbing, for now.', stocks: 'Stocks peak, months after bonds. Commodities, fed by strong demand and inflation, keep rising.', comm: 'Commodities finally peak, last of the three.' }[m.k] })),
      ...S.map((m) => ({ t: m.bot, text: { bonds: 'Bonds bottom first: interest rates start to fall, while stocks are still sliding.', stocks: 'Stocks bottom next, helped by falling rates.', comm: 'Commodities bottom last.' }[m.k] })),
    ].sort((a, b) => a.t - b.t);
    let reveal = 1,
      showUsd = false,
      cancel = null;
    const sg = seg({ label: 'Dollar', options: [{ v: 'no', label: 'Three markets' }, { v: 'yes', label: '+ the dollar' }], value: 'no', onChange: (v) => ((showUsd = v === 'yes'), paint()) });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => run() }, 'Replay');
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, h('div', { class: 'ctl-row' }, btn), legend, read, h('p', { class: 'fine' }, 'A stylized cycle, not real market history. Dots mark each market’s peaks and troughs.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 240 : 280),
      pad: { l: 40, r: 18, t: 12, b: 24 },
      label: 'Stylized bonds, stocks and commodities through a business cycle',
      draw(P) {
        const C = pal(),
          k = Math.round((NM - 1) * reveal);
        P.domain(0, NM - 1, 82, 118);
        P.grid({ xTicks: [0, 24, 48, 72, 96], xf: (v) => v / 12 + ' yr', yTicks: [] });
        if (showUsd) P.line(dollar.slice(0, k + 1).map((v, t) => [t, v]), { color: C.violet, width: 1.75, dash: [5, 4] });
        S.forEach((m) => {
          P.line(m.y.slice(0, k + 1).map((v, t) => [t, v]), { color: C[m.col], width: 2.25 });
          [m.top, m.bot].forEach((t) => t <= k && P.dot(t, m.y[t], { color: C[m.col], r: 4 }));
        });
      },
    });
    function paint() {
      plot.render();
      legend.replaceChildren(...S.map((m) => lg(`var(--${m.col})`, m.label)), ...(showUsd ? [lg('var(--violet)', 'US dollar', true)] : []));
      const k = Math.round((NM - 1) * reveal),
        [b, s, c] = S;
      if (k >= NM - 1) read.innerHTML = `At the top, <b>bonds turned first</b> (month ${b.top}), then stocks (month ${s.top}), then commodities (month ${c.top}). At the bottom, the same order: months ${b.bot}, ${s.bot} and ${c.bot}. In real markets the gaps range from months to over a year, and the order sometimes breaks down.${showUsd ? ' The dollar moved opposite to commodities: strongest when they were weakest.' : ''}`;
      else {
        const ev = events.filter((e) => e.t <= k).pop();
        read.textContent = ev ? ev.text : 'Interest rates are falling and bonds are rising, which helps stocks. Commodities rise as the economy grows.';
      }
    }
    function run() {
      if (cancel) cancel();
      cancel = tween(7000, (k) => ((reveal = Math.max(0.02, k)), paint()));
    }
    paint();
    return { play: run, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- the sector rotation clock ---------- */
  const STAGES = [
    { name: 'Early recovery', col: 'gain', sectors: ['Transportation', 'Technology', 'Consumer discretionary'], note: 'Stocks usually bottom before the economy does. Sectors that gain first from lower rates and recovering spending lead.' },
    { name: 'Middle expansion', col: 'accent', sectors: ['Industrials', 'Capital goods'], note: 'Demand grows and businesses invest in equipment and plants.' },
    { name: 'Late expansion', col: 'warn', sectors: ['Basic materials', 'Energy'], note: 'Strong demand pushes raw-material prices up, and inflation picks up.' },
    { name: 'Early slowdown', col: 'loss', sectors: ['Consumer staples', 'Health care'], note: 'Investors shift to steady businesses that people need in any economy.' },
    { name: 'Late slowdown', col: 'violet', sectors: ['Utilities', 'Financials'], note: 'Falling interest rates help rate-sensitive sectors, setting up the next recovery.' },
  ];
  V.sectorClock = function (host, p, ctx) {
    let ang = 36,
      cancel = null;
    const cur = () => Math.floor((((ang % 360) + 360) % 360) / 72);
    const sg = seg({ label: 'Stage', options: STAGES.map((s, j) => ({ v: String(j), label: `${j + 1}. ${s.name}` })), value: '0', onChange: (v) => goTo(+v) });
    const plotEl = h('div', { class: 'plot' });
    const chips = h('div', { class: 'mu-chips' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, sg.el, chips, read, h('p', { class: 'fine' }, 'A common model of sector rotation. Real cycles differ, and leadership doesn’t always follow the script.'));
    const plot = new Plot(plotEl, {
      height: 230,
      pad: { l: 0, r: 0, t: 0, b: 0 },
      label: 'Sector rotation clock with five stages of the business cycle',
      draw(P) {
        const C = pal(),
          cx = P.c,
          x0 = P.w / 2,
          y0 = P.h / 2,
          R = Math.min(P.w, P.h) / 2 - 14,
          rad = (d) => ((d - 90) * Math.PI) / 180,
          j0 = cur();
        cx.save();
        STAGES.forEach((s, j) => {
          cx.beginPath();
          cx.moveTo(x0, y0);
          cx.arc(x0, y0, R, rad(j * 72), rad((j + 1) * 72));
          cx.closePath();
          cx.fillStyle = alpha(C[s.col], j === j0 ? 0.5 : 0.14);
          cx.fill();
          cx.strokeStyle = C.surface;
          cx.lineWidth = 2;
          cx.stroke();
        });
        cx.beginPath();
        cx.arc(x0, y0, R * 0.34, 0, Math.PI * 2);
        cx.fillStyle = C.surface;
        cx.fill();
        // A short hand with an arrowhead, so it never covers the stage numbers further out.
        const a = rad(ang),
          tip = R * 0.52,
          tx = x0 + Math.cos(a) * tip,
          ty = y0 + Math.sin(a) * tip;
        cx.beginPath();
        cx.moveTo(x0, y0);
        cx.lineTo(x0 + Math.cos(a) * (tip - 8), y0 + Math.sin(a) * (tip - 8));
        cx.strokeStyle = C.ink;
        cx.lineWidth = 3;
        cx.lineCap = 'round';
        cx.stroke();
        cx.beginPath();
        cx.moveTo(tx, ty);
        cx.lineTo(tx - Math.cos(a - 0.45) * 12, ty - Math.sin(a - 0.45) * 12);
        cx.lineTo(tx - Math.cos(a + 0.45) * 12, ty - Math.sin(a + 0.45) * 12);
        cx.closePath();
        cx.fillStyle = C.ink;
        cx.fill();
        cx.beginPath();
        cx.arc(x0, y0, 5, 0, Math.PI * 2);
        cx.fillStyle = C.ink;
        cx.fill();
        cx.restore();
        STAGES.forEach((s, j) => {
          const m = rad(j * 72 + 36);
          P.text(String(j + 1), x0 + Math.cos(m) * R * 0.68, y0 + Math.sin(m) * R * 0.68, { color: j === j0 ? C.ink : C.muted, weight: 700, size: j === j0 ? 15 : 12 });
        });
        P.text('Stage ' + (j0 + 1), x0, y0 + R * 0.18, { color: C.ink, weight: 700, size: 10 });
      },
    });
    function paint() {
      plot.render();
      const s = STAGES[cur()];
      sg.set(String(cur()));
      chips.replaceChildren(...s.sectors.map((x) => h('span', { class: 'mu-chip', style: `--c:var(--${s.col})` }, x)));
      read.innerHTML = `<b>${s.name}.</b> ${s.note}`;
    }
    function goTo(j) {
      if (cancel) cancel();
      const a0 = ang,
        target = j * 72 + 36,
        a1 = a0 + ((((target - a0) % 360) + 360) % 360);
      cancel = tween(700, (k) => ((ang = a0 + (a1 - a0) * ease.inOut(k)), paint()));
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        const a0 = 0;
        cancel = tween(9000, (k) => ((ang = a0 + 396 * ease.inOut(k)), paint()));
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- the relative strength line ---------- */
  const IDX = [[0, 100], [60, 108], [90, 104], [150, 118], [179, 122]];
  const PICKS = {
    leader: { label: 'A leader', a: [[0, 40], [60, 47], [90, 46], [150, 58], [179, 64]] },
    laggard: { label: 'A laggard', a: [[0, 40], [60, 42], [90, 39], [150, 43], [179, 44]] },
  };
  V.ratioLine = function (host, p, ctx) {
    let key = 'leader',
      chart = null;
    const sg = seg({ label: 'Stock', options: Object.keys(PICKS).map((k) => ({ v: k, label: PICKS[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, h('div', { class: 'legend' }, lg('var(--ink)', 'The stock'), lg('var(--muted)', 'The index, scaled to the same start', true)), read, h('p', { class: 'fine' }, 'Simulated prices.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const n = 180,
        idx = TA.path(IDX, n, { seed: 81, noise: 0.005 }),
        bars = TA.bars(TA.path(PICKS[key].a, n, { seed: 82, noise: 0.008 }), { seed: 82 }),
        c = TA.closes(bars),
        scaled = idx.map((v) => (v / idx[0]) * c[0]),
        ratio = c.map((v, t) => ((v / idx[t]) / (c[0] / idx[0])) * 100),
        lo = Math.min(...c, ...scaled),
        hi = Math.max(...c, ...scaled),
        rlo = Math.min(...ratio),
        rhi = Math.max(...ratio),
        up = ratio[n - 1] >= 100;
      chart = TA.chart(holder, ctx, {
        bars,
        type: 'line',
        ms: 5200,
        playFrom: 5,
        pad: { l: 46 },
        yRange: [lo - (hi - lo) * 0.08, hi + (hi - lo) * 0.1],
        label: PICKS[key].label + ' against the index',
        under: (P, C, i) => TA.series(P, scaled, i, { color: C.muted, width: 1.75, dash: [5, 4] }),
        lower: {
          height: 90,
          label: 'Relative strength line: stock ÷ index (start = 100)',
          range: [Math.min(96, rlo - 2), Math.max(104, rhi + 2)],
          draw(P, C, i) {
            P.line([[-1, 100], [n, 100]], { color: C.ink, width: 1, dash: [2, 4], alpha: 0.5 });
            TA.series(P, ratio, i, { color: up ? C.gain : C.loss, width: 2.25 });
          },
        },
        onIndex(i) {
          const k = Math.min(i, n) - 1,
            sr = c[k] / c[0] - 1,
            ir = idx[k] / idx[0] - 1;
          if (i < n) return void (read.textContent = `Day ${k + 1}: the stock is ${pc(sr)} and the index ${pc(ir)} since the start. Relative strength: ${Math.round(ratio[k])}.`);
          read.innerHTML = up
            ? `The stock rose <b>${pc(sr)}</b> while the index rose ${pc(ir)}. Its relative strength line climbed to ${Math.round(ratio[k])}: a leader. A rising line, especially one making new highs, is how chartists spot the strongest stocks.`
            : `The stock rose <b>${pc(sr)}</b>, but the index rose ${pc(ir)}. Its relative strength line fell to ${Math.round(ratio[k])}: a laggard. It made money, but less than simply owning the index would have.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- breadth: the advance-decline line ---------- */
  const IDXB = [[0, 100], [60, 110], [80, 107], [120, 118], [140, 115], [170, 122], [185, 118], [199, 108]];
  const ADB = [[0, 0], [60, 900], [80, 750], [120, 1500], [140, 1120], [170, 1200], [185, 950], [199, 550]];
  V.breadthDivergence = function (host, p, ctx) {
    const n = 200,
      bars = TA.bars(TA.path(IDXB, n, { seed: 91, noise: 0.004 }), { seed: 91 }),
      c = TA.closes(bars),
      ad = TA.path(ADB.map(([x, y]) => [x, y + 5000]), n, { seed: 92, noise: 0.006 }).map((v) => v - 5000),
      i1 = argExt(c, 100, 140, (a, b) => a > b),
      i2 = argExt(c, 155, 185, (a, b) => a > b),
      a1 = argExt(ad, 100, 140, (a, b) => a > b),
      a2 = argExt(ad, 155, 185, (a, b) => a > b),
      fall = c[n - 1] / c[i2] - 1;
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, holder, h('div', { class: 'legend' }, lg('var(--gain)', 'Index: higher high'), lg('var(--loss)', 'A/D line: lower high')), read, h('p', { class: 'fine' }, 'A simulated index and advance-decline line.'));
    const chart = TA.chart(holder, ctx, {
      bars,
      type: 'line',
      ms: 6000,
      playFrom: 10,
      pad: { l: 50 },
      label: 'An index and its advance-decline line',
      over(P, C, i) {
        if (i > i2 + 2) {
          P.line([[i1, c[i1]], [i2, c[i2]]], { color: C.gain, width: 2 });
          [i1, i2].forEach((t) => P.dot(t, c[t], { color: C.gain, r: 4 }));
        }
      },
      lower: {
        height: 110,
        label: 'Advance-decline line',
        range: [Math.min(...ad) - 150, Math.max(...ad) + 200],
        yf: (v) => (Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(Math.round(v))),
        draw(P, C, i) {
          TA.series(P, ad, i, { color: C.ink, width: 2 });
          if (i > a2 + 2) {
            P.line([[a1, ad[a1]], [a2, ad[a2]]], { color: C.loss, width: 2 });
            [a1, a2].forEach((t) => P.dot(t, ad[t], { color: C.loss, r: 4 }));
          }
        },
      },
      onIndex(i) {
        const k = i - 1;
        if (i >= n) read.innerHTML = `The index made a higher high on day ${i2 + 1}, but the advance-decline line peaked lower than on day ${a1 + 1}: fewer stocks were carrying the rally. That <b>negative divergence</b> came before a fall of ${pc(fall).replace('−', '')} from the high. Divergences warn; they don’t say exactly when.`;
        else if (k < 120) read.textContent = 'The index and the advance-decline line rise together: most stocks are joining the rally.';
        else if (k <= i2 + 2) read.textContent = 'The index pushes toward a new high. Is the advance-decline line keeping up?';
        else read.textContent = 'New high in the index, but the advance-decline line is below its earlier peak: the rally is narrowing.';
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };
})();
