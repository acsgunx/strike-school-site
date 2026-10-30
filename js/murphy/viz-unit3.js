/* Technical Analysis in Depth, Unit 3 visuals: momentum and rate of change, how the stochastic oscillator is built,
   stochastic signals in a sideways and a trending market, and a sentiment survey through a top and a bottom. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, seg, slider, pal, alpha, usd } = SS;
  const V = SS.viz;
  const TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);
  const argExt = (xs, a, b, f) => {
    let j = a;
    for (let t = a; t <= b; t++) if (xs[t] != null && (xs[j] == null || f(xs[t], xs[j]))) j = t;
    return j;
  };
  const vline = (P, x, color, a = 0.8) => P.line([[x, P.dom.y0], [x, P.dom.y1]], { color, width: 1.25, dash: [4, 4], alpha: a });

  /* ---------- momentum and rate of change ---------- */
  // A rise that speeds up, then slows into a rounded top, then a decline.
  const MOMO = [[0, 50], [30, 53.5], [60, 63], [80, 69], [95, 72], [105, 73], [120, 71], [140, 64], [159, 58]];
  V.momentumLine = function (host, p, ctx) {
    const bars = TA.bars(TA.path(MOMO, 160, { seed: 61, noise: 0.006 }), { seed: 61 }),
      c = TA.closes(bars),
      n = c.length,
      pk = argExt(c, 0, n - 1, (x, y) => x > y);
    let N = 10,
      mode = 'mom',
      M = [],
      lim = 1,
      mpk = 0,
      zc = -1,
      chart = null;
    const calc = () => {
      M = c.map((v, t) => (t < N ? null : mode === 'mom' ? v - c[t - N] : (v / c[t - N] - 1) * 100));
      lim = Math.max(...M.filter((x) => x != null).map(Math.abs)) * 1.15;
      mpk = argExt(M, N, pk, (x, y) => x > y);
      zc = M.findIndex((x, t) => t > mpk && x != null && x < 0);
    };
    calc();
    const fmt = (v) => (mode === 'mom' ? (v >= 0 ? '+' : '−') + '$' + Math.abs(v).toFixed(2) : (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + '%');
    const sg = seg({ label: 'Measure', options: [{ v: 'mom', label: 'Momentum ($)' }, { v: 'roc', label: 'Rate of change (%)' }], value: mode, onChange: (v) => ((mode = v), calc(), chart.render()) });
    const sl = slider({ id: ctx.key + '-n', label: 'Lookback', min: 5, max: 30, step: 1, value: N, fmt: (v) => v + ' days', onInput: (v) => ((N = v), calc(), chart.render()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, sl.el, h('div', { class: 'legend' }, lg('var(--accent)', 'Momentum peak', true), lg('var(--warn)', 'Price peak', true)), read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    chart = TA.chart(holder, ctx, {
      bars,
      type: 'line',
      ms: 5600,
      playFrom: 12,
      pad: { l: 50 },
      label: 'Price with its momentum below',
      over(P, C, i) {
        if (i > mpk) vline(P, mpk, C.accent);
        if (i > pk) {
          vline(P, pk, C.warn);
          P.dot(pk, c[pk], { color: C.warn, r: 4 });
        }
      },
      lower: {
        height: 110,
        label: 'Momentum',
        range: () => [-lim, lim],
        yf: (v) => (mode === 'mom' ? (v > 0 ? '+' : v < 0 ? '−' : '') + '$' + Math.abs(Math.round(v)) : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(Math.round(v)) + '%'),
        draw(P, C, i) {
          P.rect(-1, 0, n, lim, alpha(C.gain, 0.05));
          P.rect(-1, -lim, n, 0, alpha(C.loss, 0.05));
          P.line([[-1, 0], [n, 0]], { color: C.ink, width: 1, alpha: 0.5 });
          TA.series(P, M, i, { color: C.accent, width: 2 });
          if (i > mpk) (vline(P, mpk, C.accent), P.dot(mpk, M[mpk], { color: C.accent, r: 4 }));
          if (i > pk) vline(P, pk, C.warn);
        },
      },
      onIndex(i) {
        const k = i - 1;
        if (i >= n) {
          read.innerHTML = `${N}-day momentum peaked on day ${mpk + 1}, while the price kept rising until day ${pk + 1}: a <b>${pk - mpk}-day</b> early warning that the rise was slowing. Momentum crossed below zero on day ${zc + 1}, at ${usd(c[zc])}. A longer lookback gives smoother, later signals; a shorter one, faster and noisier ones.`;
          return;
        }
        if (k < N) return void (read.textContent = `Day ${k + 1}: waiting for ${N} days of prices.`);
        const m = M[k],
          prev = M[k - 3];
        read.innerHTML = `Day ${k + 1}: ${usd(c[k])}. ${N}-day ${mode === 'mom' ? 'momentum' : 'rate of change'}: <b>${fmt(m)}</b>. ${m > 0 ? (m >= prev ? 'The rise is speeding up.' : 'Still rising, but more slowly.') : m <= prev ? 'Falling, and gathering speed.' : 'Still falling, but more slowly.'}`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- the stochastic oscillator ---------- */
  function stoch(bars, n = 14, d = 3) {
    const K = bars.map((b, i) => {
      if (i < n - 1) return null;
      const w = bars.slice(i - n + 1, i + 1),
        H = Math.max(...w.map((x) => x.h)),
        L = Math.min(...w.map((x) => x.l));
      return ((b.c - L) / (H - L)) * 100;
    });
    const D = K.map((k, i) => (i < n + d - 2 ? null : (K[i] + K[i - 1] + K[i - 2]) / 3));
    return { K, D };
  }
  const zones = (P, C) => {
    P.rect(-1, 80, P.dom.x1, 100, alpha(C.loss, 0.07));
    P.rect(-1, 0, P.dom.x1, 20, alpha(C.gain, 0.07));
    [20, 80].forEach((v) => P.line([[-1, v], [P.dom.x1, v]], { color: C.muted, width: 1, dash: [4, 4] }));
  };
  const SWING = [[0, 50], [12, 56], [22, 51], [34, 58], [44, 53], [56, 60], [66, 54], [78, 57], [89, 52]];
  V.stochBuild = function (host, p, ctx) {
    const bars = TA.bars(TA.path(SWING, 90, { seed: 63, noise: 0.007 }), { seed: 63, wick: 0.007 }),
      n = bars.length,
      { K, D } = stoch(bars);
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, holder, h('div', { class: 'legend' }, lg('var(--accent)', '14-day range and %K'), lg('var(--warn)', '%D: 3-day average', true)), read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    const box = (k) => {
      const w = bars.slice(k - 13, k + 1);
      return { H: Math.max(...w.map((x) => x.h)), L: Math.min(...w.map((x) => x.l)) };
    };
    const chart = TA.chart(holder, ctx, {
      bars,
      ms: 6000,
      playFrom: 14,
      cursor: false,
      pad: { l: 46 },
      label: 'Candles with the 14-day range box that defines the stochastic',
      under(P, C, i) {
        const k = Math.min(i, n) - 1;
        if (k < 13) return;
        const { H, L } = box(k);
        P.rect(k - 13.5, L, k + 0.5, H, alpha(C.accent, 0.1));
        [H, L].forEach((v) => P.line([[k - 13.5, v], [k + 0.5, v]], { color: C.accent, width: 1.25 }));
      },
      over(P, C, i) {
        const k = Math.min(i, n) - 1;
        if (k < 13) return;
        P.dot(k, bars[k].c, { color: C.accent, r: 4 });
        P.tag('%K ' + Math.round(K[k]), P.X(k), P.Y(bars[k].c), { bg: C.accent, align: k > n * 0.6 ? 'right' : 'left', dy: -10, size: 10.5 });
      },
      lower: {
        height: 100,
        label: 'Stochastic %K and %D',
        range: [0, 100],
        yTicks: [20, 50, 80],
        draw(P, C, i) {
          zones(P, C);
          TA.series(P, K, i, { color: C.accent, width: 2 });
          TA.series(P, D, i, { color: C.warn, width: 1.5, dash: [5, 3] });
        },
      },
      onIndex(i) {
        const k = Math.min(i, n) - 1;
        if (k < 13) return void (read.textContent = `Day ${k + 1}: the stochastic needs 14 days of prices.`);
        const { H, L } = box(k),
          kk = Math.round(K[k]),
          dd = D[k] == null ? null : Math.round(D[k]);
        read.innerHTML = `Day ${k + 1}: the last 14 days ranged from ${usd(L)} to ${usd(H)}. The close of ${usd(bars[k].c)} sits ${kk}% of the way up, so <b>%K = ${kk}</b>${dd == null ? '' : `, and %D, its 3-day average, is ${dd}`}. ${kk >= 80 ? 'Near the top of the range: overbought.' : kk <= 20 ? 'Near the bottom of the range: oversold.' : ''}`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- stochastic signals in two markets ---------- */
  const MARKETS = {
    side: { label: 'Sideways market', a: [[0, 52], [9, 56.5], [15, 51], [22, 54], [30, 48.5], [38, 55.8], [44, 52.5], [50, 54.5], [58, 49], [64, 51.5], [70, 49.5], [80, 56], [87, 51], [93, 53.5], [101, 48.6], [110, 55], [119, 52]] },
    up: { label: 'Strong uptrend', a: [[0, 50], [14, 56], [20, 53.2], [34, 60], [40, 57], [55, 66], [62, 62.8], [76, 71], [80, 69.8], [96, 77], [103, 73.5], [119, 82]] },
  };
  const HOLD = 10;
  /** %K crossing %D down above 80 (sell) or up below 20 (buy); repeat crosses within 6 days count once. */
  function signals(bars, K, D) {
    const raw = [];
    for (let i = 1; i < bars.length; i++) {
      if (K[i] == null || D[i] == null || D[i - 1] == null) continue;
      if (K[i - 1] >= D[i - 1] && K[i] < D[i] && D[i] > 80) raw.push({ i, dir: -1 });
      if (K[i - 1] <= D[i - 1] && K[i] > D[i] && D[i] < 20) raw.push({ i, dir: 1 });
    }
    const out = [];
    raw.forEach((s) => {
      const last = out[out.length - 1];
      if (!(last && last.dir === s.dir && s.i - last.i < 6)) out.push(s);
    });
    return out.map((s) => {
      const j = Math.min(bars.length - 1, s.i + HOLD);
      return { ...s, j, ok: (bars[j].c / bars[s.i].c - 1) * s.dir > 0 };
    });
  }
  V.stochSignals = function (host, p, ctx) {
    let key = 'side',
      chart = null;
    const sg = seg({ label: 'Market', options: Object.keys(MARKETS).map((k) => ({ v: k, label: MARKETS[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, info, holder, h('div', { class: 'legend' }, lg('var(--gain)', 'Buy signal'), lg('var(--loss)', 'Sell signal'), lg('var(--accent)', '%K'), lg('var(--warn)', '%D', true)), read, h('p', { class: 'fine' }, 'Simulated daily prices. ✓ means the price moved the signal’s way over the next 10 days; ✗ means it didn’t.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const bars = TA.bars(TA.path(MARKETS[key].a, 120, { seed: 2, noise: 0.008 }), { seed: 2, wick: 0.006 }),
        n = bars.length,
        { K, D } = stoch(bars),
        S = signals(bars, K, D),
        sells = S.filter((s) => s.dir < 0),
        buys = S.filter((s) => s.dir > 0),
        okS = sells.filter((s) => s.ok).length,
        okB = buys.filter((s) => s.ok).length;
      info.replaceChildren(stat('Sell signals', sells.length ? `${okS} of ${sells.length} worked` : 'none', sells.length && okS * 2 >= sells.length ? 'gain' : 'loss'), stat('Buy signals', buys.length ? `${okB} of ${buys.length} worked` : 'none', buys.length && okB * 2 >= buys.length ? 'gain' : buys.length ? 'loss' : ''));
      const mark = (P, C, i, y, below) =>
        S.forEach((s) => {
          if (i <= s.i) return;
          const col = s.dir > 0 ? C.gain : C.loss,
            v = y(s);
          P.dot(s.i, v, { color: col, r: 3.5 });
          if (i > s.j) P.text(s.ok ? '✓' : '✗', P.X(s.i), P.Y(v) + (below(s) ? 12 : -11), { color: s.ok ? C.gain : C.loss, weight: 700, size: 10 });
        });
      chart = TA.chart(holder, ctx, {
        bars,
        type: 'line',
        ms: 6000,
        playFrom: 16,
        pad: { l: 46 },
        label: MARKETS[key].label + ' with stochastic signals',
        over: (P, C, i) => mark(P, C, i, (s) => bars[s.i].c, (s) => s.dir > 0),
        lower: {
          height: 100,
          label: 'Stochastic %K and %D',
          range: [0, 100],
          yTicks: [20, 50, 80],
          draw(P, C, i) {
            zones(P, C);
            TA.series(P, K, i, { color: C.accent, width: 1.75 });
            TA.series(P, D, i, { color: C.warn, width: 1.5, dash: [5, 3] });
            S.forEach((s) => i > s.i && P.dot(s.i, D[s.i], { color: s.dir > 0 ? C.gain : C.loss, r: 3 }));
          },
        },
        onIndex(i) {
          if (i < n) {
            const seen = S.filter((s) => s.j < i);
            read.textContent = seen.length ? `So far: ${seen.filter((s) => s.ok).length} of ${seen.length} finished signals worked.` : 'Watch for %K crossing %D in the shaded zones.';
            return;
          }
          read.innerHTML =
            key === 'side'
              ? `In the sideways market, <b>${okS + okB} of ${S.length}</b> signals worked: the price kept swinging between roughly the same limits, which is what the stochastic is built for. Not every signal works, even here.`
              : `In the strong uptrend, only <b>${okS} of ${sells.length}</b> sell signals worked: %K kept reaching overbought as the price climbed. ${buys.length ? `The ${buys.length === 1 ? 'one buy signal' : buys.length + ' buy signals'}, taken on pullbacks in the trend’s direction: ${okB} of ${buys.length} worked.` : ''} In a strong trend, take only the signals that agree with it.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- contrary opinion: a sentiment survey ---------- */
  const MOOD = [[0, 60], [70, 82], [90, 84], [110, 78], [150, 62], [175, 58], [195, 61], [259, 78]];
  V.sentimentCycle = function (host, p, ctx) {
    const bars = TA.bars(TA.path(MOOD, 260, { seed: 65, noise: 0.006 }), { seed: 65 }),
      c = TA.closes(bars),
      n = c.length,
      r = SS.rng(66);
    // Bullish share of a simulated advisor survey: the crowd grows more confident the further the price sits above
    // its low of the last 200 days, and more fearful the further it sits below its high. Mood builds through a move.
    const raw = c.map((v, t) => {
      const w = c.slice(Math.max(0, t - 199), t + 1),
        L = Math.min(...w),
        H = Math.max(...w);
      return 50 + 42 * Math.tanh(((v - L) / L - (H - v) / H) / 0.45) + (r() - 0.5) * 6;
    });
    const S = raw.map((_, t) => {
      const w = raw.slice(Math.max(0, t - 4), t + 1);
      return Math.max(5, Math.min(95, w.reduce((a, b) => a + b, 0) / w.length));
    });
    const top = argExt(c, 0, 140, (x, y) => x > y),
      bot = argExt(c, 120, 230, (x, y) => x < y),
      sHi = argExt(S, 20, 140, (x, y) => x > y),
      sLo = argExt(S, 120, 230, (x, y) => x < y),
      greedDays = S.slice(0, top + 1).filter((x) => x > 70).length;
    let cur = n - 1;
    const gaugeEl = h('div', { class: 'plot' });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, gaugeEl, holder, h('div', { class: 'legend' }, lg('var(--warn)', 'Extreme optimism: above 70%'), lg('var(--accent)', 'Extreme pessimism: below 30%')), read, h('p', { class: 'fine' }, 'Simulated prices and a simulated survey, for illustration.'));
    const gauge = new Plot(gaugeEl, {
      height: 104,
      pad: { l: 0, r: 0, t: 0, b: 0 },
      label: 'Gauge of the percent of advisors who are bullish',
      draw(P) {
        const C = pal(),
          cx = P.c,
          x0 = P.w / 2,
          y0 = P.h - 18,
          R = Math.min(P.w / 2 - 24, P.h - 30),
          ang = (v) => Math.PI + (v / 100) * Math.PI;
        cx.save();
        [[0, 30, C.accent], [30, 70, C.muted], [70, 100, C.warn]].forEach(([a, b, col]) => {
          cx.beginPath();
          cx.arc(x0, y0, R, ang(a), ang(b));
          cx.strokeStyle = alpha(col, col === C.muted ? 0.35 : 0.85);
          cx.lineWidth = 12;
          cx.stroke();
        });
        const v = S[cur],
          a = ang(v);
        cx.beginPath();
        cx.moveTo(x0, y0);
        cx.lineTo(x0 + Math.cos(a) * (R - 4), y0 + Math.sin(a) * (R - 4));
        cx.strokeStyle = C.ink;
        cx.lineWidth = 2.5;
        cx.lineCap = 'round';
        cx.stroke();
        cx.beginPath();
        cx.arc(x0, y0, 4, 0, Math.PI * 2);
        cx.fillStyle = C.ink;
        cx.fill();
        cx.restore();
        P.text(Math.round(v) + '% bullish', x0, y0 + 10, { color: v > 70 ? C.warn : v < 30 ? C.accent : C.ink, weight: 700, size: 11 });
        P.text('Fear', x0 - R, y0 + 10, { color: C.accent, size: 9.5 });
        P.text('Greed', x0 + R, y0 + 10, { color: C.warn, size: 9.5 });
      },
    });
    const spans = (i, f) => {
      const out = [];
      let s = null;
      for (let t = 0; t < i; t++) {
        if (f(S[t]) && s == null) s = t;
        if ((!f(S[t]) || t === i - 1) && s != null) out.push([s, t]), (s = null);
      }
      return out;
    };
    const chart = TA.chart(holder, ctx, {
      bars,
      type: 'line',
      ms: 7000,
      playFrom: 10,
      pad: { l: 46 },
      label: 'Price with periods of extreme optimism and pessimism shaded',
      under(P, C, i) {
        spans(i, (v) => v > 70).forEach(([a, b]) => P.rect(a, P.dom.y0, b, P.dom.y1, alpha(C.warn, 0.12)));
        spans(i, (v) => v < 30).forEach(([a, b]) => P.rect(a, P.dom.y0, b, P.dom.y1, alpha(C.accent, 0.12)));
      },
      lower: {
        height: 90,
        label: 'Percent of advisors bullish',
        range: [0, 100],
        yTicks: [30, 70],
        yf: (v) => v + '%',
        draw(P, C, i) {
          P.rect(-1, 70, n, 100, alpha(C.warn, 0.08));
          P.rect(-1, 0, n, 30, alpha(C.accent, 0.08));
          TA.series(P, S, i, { color: C.ink, width: 1.75 });
        },
      },
      onIndex(i) {
        cur = Math.max(0, Math.min(i, n) - 1);
        gauge.render();
        const v = Math.round(S[cur]);
        const when = (a, b) => (Math.abs(a - b) <= 7 ? 'right at' : `${Math.abs(a - b)} days ${a < b ? 'before' : 'after'}`);
        if (i >= n) read.innerHTML = `Optimism peaked at ${Math.round(S[sHi])}% on day ${sHi + 1}, ${when(sHi, top)} the price top on day ${top + 1}. Pessimism bottomed at ${Math.round(S[sLo])}% on day ${sLo + 1}, ${when(sLo, bot)} the low on day ${bot + 1}. But optimism stayed above 70% for ${greedDays} days of the run-up while prices kept rising: an extreme says a turn is likely, not exactly when.`;
        else if (v > 70) read.textContent = `Day ${cur + 1}: ${v}% of advisors are bullish. Extreme optimism: most of those who want to buy already have.`;
        else if (v < 30) read.textContent = `Day ${cur + 1}: only ${v}% are bullish. Extreme pessimism: most of those who want to sell already have.`;
        else read.textContent = `Day ${cur + 1}: ${v}% bullish. In between the extremes, the crowd mostly follows the trend.`;
      },
    });
    return { play: () => chart.play(), destroy: () => (chart.destroy(), gauge.destroy()) };
  };
})();
