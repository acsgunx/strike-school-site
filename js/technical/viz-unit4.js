/* Technical Analysis, Unit 4 visuals: moving averages, RSI, MACD, Bollinger Bands, ATR, confluence. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, slider, seg, pct, usd, pal, alpha } = SS;
  const V = SS.viz,
    TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const legend = (...items) => h('div', { class: 'legend' }, items.map(([cls, label, dashed]) => h('span', { class: 'lg ' + cls }, h('i', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), label)));
  const rsiLower = (rsi, extra) => ({
    height: 100,
    label: 'RSI (14)',
    range: [0, 100],
    yTicks: [30, 70],
    draw(P, C, i) {
      P.rect(-1, 70, 1e4, 100, alpha(C.loss, 0.08));
      P.rect(-1, 0, 1e4, 30, alpha(C.gain, 0.08));
      P.hline(70, { color: C.loss, dash: [3, 3] });
      P.hline(30, { color: C.gain, dash: [3, 3] });
      TA.series(P, rsi, i, { color: C.violet, width: 2 });
      if (extra) extra(P, C, i);
    },
  });
  /** Crossings of a over b: returns [{i, up}] where up = a crossed above b. */
  function crosses(a, b, from = 1) {
    const out = [];
    for (let i = Math.max(1, from); i < a.length; i++) {
      if (a[i] == null || b[i] == null || a[i - 1] == null || b[i - 1] == null) continue;
      if (a[i - 1] <= b[i - 1] && a[i] > b[i]) out.push({ i, up: true });
      else if (a[i - 1] >= b[i - 1] && a[i] < b[i]) out.push({ i, up: false });
    }
    return out;
  }
  const arrow = (P, C, x, y, up) => P.tag(up ? '▲' : '▼', P.X(x), P.Y(y), { bg: up ? C.gain : C.loss, dy: up ? 8 : -30, size: 10 });

  /* ---------- SMA vs EMA lab ---------- */
  V.maLab = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 40], [30, 50], [45, 46], [70, 56], [90, 49], [119, 58]], 120, { seed: 101, noise: 0.008 }), { seed: 101 });
    const cs = TA.closes(bars);
    let n = 20,
      show = 'both';
    const sN = slider({ id: ctx.key + '-n', label: 'Period', min: 5, max: 60, step: 1, value: n, fmt: (v) => v + ' days', onInput: (v) => ((n = v), chart.render()) });
    const sg = seg({ label: 'Average', options: [{ v: 'sma', label: 'SMA' }, { v: 'ema', label: 'EMA' }, { v: 'both', label: 'Both' }], value: show, onChange: (v) => ((show = v), chart.render()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host, sg.el);
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'Price with simple and exponential moving averages',
      over(P, C, i) {
        if (show !== 'ema') TA.series(P, TA.sma(cs, n), i, { color: C.put, width: 2.25 });
        if (show !== 'sma') TA.series(P, TA.ema(cs, n), i, { color: C.accent, width: 2.25 });
      },
      onIndex(i) {
        const sma = TA.sma(cs, n),
          ema = TA.ema(cs, n);
        const peakP = cs.slice(55, 85).indexOf(Math.max(...cs.slice(55, 85))) + 55;
        const seg2 = (arr) => arr.slice(55, 100).map((v) => (v == null ? -1e9 : v));
        const pS = seg2(sma).indexOf(Math.max(...seg2(sma))) + 55,
          pE = seg2(ema).indexOf(Math.max(...seg2(ema))) + 55;
        const j = i - 1,
          ref = show === 'ema' ? ema[j] : sma[j];
        read.innerHTML = `${ref != null ? `Day ${i}: price is <b class="${SS.plClass(cs[j] - ref)}">${pct(cs[j] / ref - 1, { sign: true })}</b> ${cs[j] >= ref ? 'above' : 'below'} the ${n}-day ${show === 'ema' ? 'EMA' : 'SMA'}. ` : ''}Lag: price peaked on day ${peakP + 1}; the ${n}-day SMA peaked <b>${pS - peakP}</b> days later, the EMA <b>${pE - peakP}</b> days later.`;
      },
    });
    box.append(legend(['lg-put', 'SMA'], ['lg-accent', 'EMA']), sN.el, read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- crossovers and whipsaws ---------- */
  V.maCross = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 40], [50, 55], [56, 52], [62, 57], [68, 51.5], [75, 57], [82, 51], [89, 56.5], [96, 51.5], [103, 56.8], [110, 51.2], [117, 56], [124, 52], [132, 55], [160, 44], [199, 40]], 200, { seed: 111, noise: 0.006 }), { seed: 111 });
    const cs = TA.closes(bars),
      fast = TA.sma(cs, 10),
      slow = TA.sma(cs, 30);
    const xs = crosses(fast, slow, 30);
    const trades = [];
    let open = null;
    xs.forEach((x) => {
      if (x.up) open = x.i;
      else if (open != null) (trades.push({ a: open, b: x.i, r: cs[x.i] / cs[open] - 1 }), (open = null));
    });
    if (open != null) trades.push({ a: open, b: 199, r: cs[199] / cs[open] - 1, open: true });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      ms: 4200,
      label: '10-day and 30-day moving average crossovers',
      under(P, C) {
        P.rect(52, -1e3, 134, 1e3, alpha(C.warn, 0.07));
        P.text('Sideways stretch', P.X(93), P.pad.t + 8, { color: C.warn });
      },
      over(P, C, i) {
        TA.series(P, fast, i, { color: C.accent, width: 2 });
        TA.series(P, slow, i, { color: C.put, width: 2 });
        xs.filter((x) => x.i < i).forEach((x) => arrow(P, C, x.i, x.up ? bars[x.i].l : bars[x.i].h, x.up));
      },
      onIndex(i) {
        const done = trades.filter((t) => t.b < i);
        const chop = xs.filter((x) => x.i >= 52 && x.i <= 134 && x.i < i).length;
        const tot = done.reduce((a, t) => a * (1 + t.r), 1) - 1;
        read.innerHTML = `Signals so far: <b>${xs.filter((x) => x.i < i).length}</b>, ${chop} of them in the sideways stretch. Closed trades (buy on ▲, sell on ▼): <b>${done.length}</b>, ${done.filter((t) => t.r > 0).length} winners, total <b class="${SS.plClass(tot)}">${pct(tot, { sign: true })}</b>.`;
      },
    });
    box.append(legend(['lg-accent', '10-day average'], ['lg-put', '30-day average']), read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- moving average as support ---------- */
  V.maSupport = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 40], [8, 44], [12, 42], [20, 46.5], [24, 44.4], [32, 49.5], [36, 47.4], [44, 52.5], [48, 50.4], [56, 55.5], [60, 53.4], [66, 55], [72, 52.5], [80, 51], [89, 49.5]], 90, { seed: 121, noise: 0.003 }), { seed: 121 });
    const cs = TA.closes(bars),
      e20 = TA.ema(cs, 20);
    const touches = [];
    for (let j = 22; j < 64; j++) if (e20[j] && bars[j].l <= e20[j] * 1.012 && bars[j].c >= e20[j] * 0.995 && (!touches.length || j - touches[touches.length - 1] > 4)) touches.push(j);
    let lost = null;
    for (let j = 62; j < 90; j++)
      if (e20[j] && cs[j] < e20[j] * 0.99) {
        lost = j;
        break;
      }
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'Pullbacks holding at the 20-day EMA',
      over(P, C, i) {
        TA.series(P, e20, i, { color: C.accent, width: 2.25 });
        touches.filter((j) => j + 1 < i).forEach((j) => P.dot(j, bars[j].l, { color: C.gain, r: 4 }));
        if (lost != null && i > lost) P.tag('Closes below', P.X(lost), P.Y(cs[lost]), { bg: C.loss, dy: 10 });
      },
      onIndex(i) {
        const t = touches.filter((j) => j + 1 < i).length;
        read.innerHTML = lost != null && i > lost ? `After ${touches.length} bounces off the 20-day EMA, price closes clearly below it and the average starts to flatten: the trend is losing steam.` : `Pullbacks that held at the rising 20-day EMA: <b class="gain">${t}</b>.`;
      },
    });
    box.append(legend(['lg-accent', '20-day EMA']), read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- RSI ---------- */
  function wilder(cs, n = 14) {
    const g = cs.map(() => null),
      l = cs.map(() => null);
    let ag = 0,
      al = 0;
    for (let i = 1; i < cs.length; i++) {
      const d = cs[i] - cs[i - 1],
        up = Math.max(d, 0),
        dn = Math.max(-d, 0);
      if (i <= n) {
        ag += up;
        al += dn;
        if (i === n) ((ag /= n), (al /= n), (g[i] = ag), (l[i] = al));
      } else ((ag = (ag * (n - 1) + up) / n), (al = (al * (n - 1) + dn) / n), (g[i] = ag), (l[i] = al));
    }
    return { g, l };
  }
  V.rsiChart = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 50], [15, 58], [25, 52], [35, 45], [50, 55], [60, 53], [75, 44], [89, 50]], 90, { seed: 131, noise: 0.007 }), { seed: 131 });
    const cs = TA.closes(bars),
      rsi = TA.rsi(cs),
      w = wilder(cs);
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'Price with RSI',
      lower: rsiLower(rsi),
      onIndex(i) {
        const j = i - 1;
        if (rsi[j] == null) return (read.textContent = 'RSI needs 14 days of data to start.');
        const z = rsi[j] > 70 ? 'overbought' : rsi[j] < 30 ? 'oversold' : 'neutral';
        read.innerHTML = `Day ${i}: average up move <b class="gain">${usd(w.g[j])}</b>, average down move <b class="loss">${usd(w.l[j])}</b> → RSI <b>${rsi[j].toFixed(0)}</b> (${z}).`;
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };
  V.rsiTrend = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 40], [10, 43], [14, 42.4], [30, 50], [34, 49.3], [52, 58], [56, 57.2], [75, 66], [79, 65.2], [89, 70]], 90, { seed: 141, noise: 0.004 }), { seed: 141 });
    const cs = TA.closes(bars),
      rsi = TA.rsi(cs);
    const first70 = rsi.findIndex((v) => v != null && v > 70);
    const above = rsi.filter((v) => v != null && v > 60).length;
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'A strong uptrend keeping RSI high',
      over(P, C, i) {
        if (first70 >= 0 && i > first70) P.tag('RSI hits 70: sell?', P.X(first70), P.Y(bars[first70].h), { bg: C.loss });
      },
      lower: rsiLower(rsi),
      onIndex(i) {
        if (first70 < 0 || i <= first70) return (read.textContent = 'A strong, steady uptrend.');
        const r = cs[i - 1] / cs[first70] - 1;
        read.innerHTML = `Selling when RSI first crossed 70 (at ${usd(cs[first70])}) would have missed <b class="gain">${pct(r, { sign: true })}</b> so far. RSI stayed above 60 on ${above} of 90 days.`;
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };
  V.rsiDivergence = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 44], [10, 42], [18, 44], [34, 52], [42, 48], [56, 54], [64, 50.5], [78, 55.2], [86, 51], [99, 47]], 100, { seed: 151, noise: 0.006 }), { seed: 151 });
    const cs = TA.closes(bars),
      rsi = TA.rsi(cs);
    const maxIn = (arr, a, b) => {
      let k = a;
      for (let j = a; j <= b; j++) if (arr[j] != null && arr[j] > arr[k]) k = j;
      return k;
    };
    const highs = bars.map((b) => b.h);
    const p1 = maxIn(highs, 28, 40),
      p2 = maxIn(highs, 72, 84);
    const r1 = maxIn(rsi, p1 - 4, p1 + 2),
      r2 = maxIn(rsi, p2 - 4, p2 + 2);
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'Bearish RSI divergence',
      over(P, C, i) {
        if (i <= p2 + 2) return;
        P.line([[p1, highs[p1]], [p2, highs[p2]]], { color: C.gain, width: 2, dash: [5, 4] });
        P.tag('Higher high', P.X(p2), P.Y(highs[p2]), { bg: C.gain });
      },
      lower: rsiLower(rsi, (P, C, i) => {
        if (i <= p2 + 2) return;
        P.line([[r1, rsi[r1]], [r2, rsi[r2]]], { color: C.loss, width: 2, dash: [5, 4] });
        P.tag('Lower high', P.X(r2), P.Y(rsi[r2]), { bg: C.loss, dy: 8 });
      }),
      onIndex(i) {
        read.innerHTML = i <= p2 + 2 ? 'Three pushes higher. Watch how strong each one is.' : `Price: ${usd(highs[p1])} → ${usd(highs[p2])}, a higher high. RSI: ${rsi[r1].toFixed(0)} → ${rsi[r2].toFixed(0)}, a lower high. Each rally had less force, and price then turned down.`;
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- MACD ---------- */
  function macdData(seed = 161) {
    const bars = TA.bars(TA.path([[0, 50], [25, 57], [40, 53], [55, 48], [75, 56], [90, 59], [105, 52], [119, 55]], 120, { seed, noise: 0.006 }), { seed });
    const cs = TA.closes(bars);
    const m = TA.macd(cs);
    const span = Math.max(...m.macd.filter((v) => v != null).map(Math.abs)) * 1.25;
    return { bars, cs, m, span, e12: TA.ema(cs, 12), e26: TA.ema(cs, 26) };
  }
  V.macdBuild = function (host, p, ctx) {
    const d = macdData();
    let stage = 1;
    const TXT = ['The fast 12-day EMA hugs price; the slow 26-day EMA lags behind.', 'The MACD line plots the gap: above zero when the fast EMA is above the slow one.', 'The signal line smooths MACD. The histogram shows the gap between them: momentum building or fading.'];
    const sg = seg({ label: 'Step', options: [{ v: '1', label: '1 · Two EMAs' }, { v: '2', label: '2 · MACD line' }, { v: '3', label: '3 · Signal and histogram' }], value: '1', onChange: (v) => ((stage = +v), (read.textContent = TXT[stage - 1]), chart.play()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' }, TXT[0]);
    const box = stack(host, sg.el);
    const chart = TA.chart(box, ctx, {
      bars: d.bars,
      label: 'MACD built step by step',
      over(P, C, i) {
        TA.series(P, d.e12, i, { color: C.accent, width: 2 });
        TA.series(P, d.e26, i, { color: C.put, width: 2 });
      },
      lower: {
        height: 110,
        label: 'MACD',
        range: [-d.span, d.span],
        yf: (v) => v.toFixed(1),
        yTicks: [0],
        draw(P, C, i) {
          P.hline(0, { color: C.muted, dash: null });
          if (stage >= 3) for (let j = 0; j < i; j++) if (d.m.hist[j] != null) P.rect(j - 0.35, 0, j + 0.35, d.m.hist[j], alpha(d.m.hist[j] >= 0 ? C.gain : C.loss, 0.6));
          if (stage >= 2) TA.series(P, d.m.macd, i, { color: C.ink, width: 2 });
          if (stage >= 3) TA.series(P, d.m.signal, i, { color: C.warn, width: 1.75 });
          if (stage === 1) P.text('Step 2 adds the MACD line here', P.w / 2, P.h / 2, { color: C.muted });
        },
      },
    });
    box.append(legend(['lg-accent', '12-day EMA'], ['lg-put', '26-day EMA'], ['lg-ink', 'MACD line'], ['lg-warn', 'Signal line']), read);
    return { play: chart.play, destroy: chart.destroy };
  };
  V.macdCross = function (host, p, ctx) {
    const d = macdData(171);
    const xs = crosses(d.m.macd, d.m.signal, 34);
    const zs = crosses(d.m.macd, d.m.macd.map(() => 0), 26);
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars: d.bars,
      label: 'MACD signal-line crossovers',
      over(P, C, i) {
        xs.filter((x) => x.i < i).forEach((x) => arrow(P, C, x.i, x.up ? d.bars[x.i].l : d.bars[x.i].h, x.up));
      },
      lower: {
        height: 110,
        label: 'MACD, signal line and histogram',
        range: [-d.span, d.span],
        yf: (v) => v.toFixed(1),
        yTicks: [0],
        draw(P, C, i) {
          P.hline(0, { color: C.muted, dash: null });
          for (let j = 0; j < i; j++) if (d.m.hist[j] != null) P.rect(j - 0.35, 0, j + 0.35, d.m.hist[j], alpha(d.m.hist[j] >= 0 ? C.gain : C.loss, 0.6));
          TA.series(P, d.m.macd, i, { color: C.ink, width: 2 });
          TA.series(P, d.m.signal, i, { color: C.warn, width: 1.75 });
          zs.filter((z) => z.i < i).forEach((z) => P.dot(z.i, 0, { color: z.up ? C.gain : C.loss, r: 3.5 }));
        },
      },
      onIndex(i) {
        const last = xs.filter((x) => x.i < i).pop();
        read.innerHTML = `${xs.filter((x) => x.i < i).length} signal-line crossovers and ${zs.filter((z) => z.i < i).length} zero-line crossings so far.${last ? ` The latest: <b class="${last.up ? 'gain' : 'loss'}">${last.up ? 'bullish' : 'bearish'}</b> on day ${last.i + 1}.` : ''}`;
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- Bollinger Bands ---------- */
  V.bollinger = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 50], [20, 53], [35, 48], [55, 56], [70, 60], [85, 55], [100, 57], [119, 52]], 120, { seed: 181, noise: 0.009 }), { seed: 181 });
    const cs = TA.closes(bars);
    let n = 20,
      k = 2;
    const sN = slider({ id: ctx.key + '-n', label: 'Period', min: 10, max: 40, step: 1, value: n, fmt: (v) => v + ' days', onInput: (v) => ((n = v), chart.render()) });
    const sK = slider({ id: ctx.key + '-k', label: 'Band width', min: 1, max: 3, step: 0.5, value: k, fmt: (v) => v + ' standard deviations', onInput: (v) => ((k = v), chart.render()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'Price with Bollinger Bands',
      under(P, C, i) {
        const b = TA.bollinger(cs, n, k);
        TA.band(P, b.up, b.lo, i, C.accent, 0.1);
        TA.series(P, b.up, i, { color: C.accent, width: 1.5 });
        TA.series(P, b.lo, i, { color: C.accent, width: 1.5 });
        TA.series(P, b.mid, i, { color: C.accent, width: 1.25, dash: [4, 3] });
      },
      onIndex(i) {
        const b = TA.bollinger(cs, n, k);
        let inside = 0,
          tot = 0;
        for (let j = 0; j < i; j++) if (b.up[j] != null) (tot++, cs[j] <= b.up[j] && cs[j] >= b.lo[j] && inside++);
        read.innerHTML = tot ? `<b>${pct(inside / tot, { d: 0 })}</b> of closes stayed inside ${k}-standard-deviation bands. Wider bands contain more of the action; narrower ones flag more “stretched” moves.` : 'The bands need a full period of data.';
      },
    });
    box.append(sN.el, sK.el, read);
    return { play: chart.play, destroy: chart.destroy };
  };
  V.squeeze = function (host, p, ctx) {
    const r = SS.rng(191),
      cs = [50];
    for (let i = 1; i < 100; i++) {
      const vol = i < 35 ? 0.018 : i < 72 ? 0.0045 : 0.016;
      const drift = i >= 72 && i < 86 ? 0.012 : 0;
      cs.push(cs[i - 1] * Math.exp(drift + vol * SS.gauss(r)));
    }
    const bars = TA.bars(cs, { seed: 191, wick: 0.004, volMul: (i) => (i >= 72 && i < 78 ? 2.2 : i >= 40 && i < 72 ? 0.6 : 1) });
    const b = TA.bollinger(cs, 20, 2);
    let minW = 1,
      minI = 40;
    for (let j = 40; j < 75; j++) if (b.width[j] != null && b.width[j] < minW) ((minW = b.width[j]), (minI = j));
    const wmax = Math.max(...b.width.filter((v) => v != null)) * 1.1;
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'A Bollinger squeeze before a breakout',
      under(P, C, i) {
        TA.band(P, b.up, b.lo, i, C.accent, 0.1);
        TA.series(P, b.up, i, { color: C.accent, width: 1.5 });
        TA.series(P, b.lo, i, { color: C.accent, width: 1.5 });
      },
      over(P, C, i) {
        if (i > minI) P.tag('Squeeze', P.X(minI), P.Y(b.lo[minI]), { bg: C.warn, dy: 10 });
      },
      lower: {
        height: 90,
        label: 'Band width (% of price)',
        range: [0, wmax],
        yf: (v) => Math.round(v * 100) + '%',
        yTicks: [0.05, 0.1, 0.15].filter((t) => t < wmax),
        draw(P, C, i) {
          const pts = TA.series(P, b.width, i, { color: C.warn, width: 2 });
          void pts;
          if (i > minI) P.dot(minI, minW, { color: C.warn, r: 4 });
        },
      },
      onIndex(i) {
        read.innerHTML = i < 40 ? 'A volatile stretch: the bands are wide.' : i <= 72 ? `Things go quiet and the bands tighten. Band width fell to ${pct(minW, { d: 1 })} of price at its narrowest.` : 'The squeeze ends with a burst. Volatility expanded and price broke out upward, though it could have broken either way.';
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- ATR trailing stop ---------- */
  V.atrStop = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 40], [60, 58], [75, 55], [90, 59.5], [105, 52], [119, 48]], 120, { seed: 201, noise: 0.009 }), { seed: 201, wick: 0.008 });
    const cs = TA.closes(bars),
      atr = TA.atr(bars, 14);
    const entry = 20;
    let m = 3;
    const sl = slider({ id: ctx.key + '-m', label: 'Stop distance', min: 1, max: 5, step: 0.5, value: m, fmt: (v) => v + ' × ATR', onInput: (v) => ((m = v), chart.render()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    function run() {
      let hi = cs[entry];
      const stop = cs.map(() => null);
      let exit = null;
      for (let j = entry; j < cs.length; j++) {
        hi = Math.max(hi, cs[j]);
        stop[j] = Math.max(stop[j - 1] || 0, hi - m * atr[j]);
        if (j > entry && cs[j] < stop[j - 1]) {
          exit = j;
          break;
        }
      }
      return { stop, exit };
    }
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'A trailing stop set by ATR',
      over(P, C, i) {
        const { stop, exit } = run();
        TA.series(P, stop, Math.min(i, exit == null ? i : exit + 1), { color: C.loss, width: 2, dash: [5, 3] });
        if (i > entry) P.tag('Buy ' + usd(cs[entry]), P.X(entry), P.Y(cs[entry]), { bg: C.accent, dy: 10 });
        if (exit != null && i > exit) P.tag('Stopped out ' + usd(cs[exit]), P.X(exit), P.Y(cs[exit]), { bg: C.loss, dy: 10, align: exit > 90 ? 'right' : undefined });
      },
      lower: { height: 80, label: 'ATR (14)', range: [0, Math.max(...atr.filter((v) => v != null)) * 1.2], yf: (v) => '$' + v.toFixed(1), yTicks: [], draw: (P, C, i) => TA.series(P, atr, i, { color: C.warn, width: 2 }) },
      onIndex(i) {
        const { exit } = run();
        const j = Math.min(i - 1, exit == null ? i - 1 : exit);
        if (i <= entry) return (read.textContent = 'The trade starts on day 21.');
        const r = cs[j] / cs[entry] - 1;
        read.innerHTML = exit != null && i > exit ? `With a ${m}× ATR stop, the trade exited on day ${exit + 1} at ${usd(cs[exit])}: <b class="${SS.plClass(r)}">${pct(r, { sign: true })}</b>. ${m <= 1.5 ? 'A tight stop gets knocked out by normal noise.' : m >= 4 ? 'A wide stop gives back more of the gains before exiting.' : 'Wide enough to ride out normal dips, close enough to protect most of the gain.'}` : `Day ${i}: ATR is ${usd(atr[i - 1] || 0)}. The stop trails ${m}× ATR below the highest close. Open P&L <b class="${SS.plClass(r)}">${pct(r, { sign: true })}</b>.`;
      },
    });
    box.append(sl.el, read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- confluence ---------- */
  V.confluence = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 40], [20, 46], [26, 44], [45, 51], [52, 48.6], [70, 55], [78, 53], [90, 57], [100, 55], [108, 57.5], [116, 54.5], [125, 57], [140, 63], [148, 60.5], [159, 66]], 160, { seed: 211, noise: 0.007 }), { seed: 211 });
    const cs = TA.closes(bars),
      s50 = TA.sma(cs, 50),
      s20 = TA.sma(cs, 20),
      rsi = TA.rsi(cs),
      vavg = TA.sma(bars.map((b) => b.v), 20);
    const COND = {
      trend: ['Uptrend: above a rising 50-day average', (j) => s50[j] != null && s50[j - 5] != null && cs[j] > s50[j] && s50[j] > s50[j - 5]],
      pull: ['Pullback: RSI dipped under 45, now turning up', (j) => rsi[j] != null && rsi[j] > rsi[j - 1] && Math.min(...rsi.slice(j - 5, j).map((v) => (v == null ? 100 : v))) < 45],
      level: ['At support: within 2% of the 20-day average', (j) => s20[j] != null && Math.abs(cs[j] / s20[j] - 1) < 0.02],
      vol: ['Volume above average', (j) => vavg[j] != null && bars[j].v > 1.1 * vavg[j]],
    };
    const on = { trend: true, pull: true, level: false, vol: false };
    const toggles = h(
      'div',
      { class: 'ff-toggles' },
      Object.keys(COND).map((k) =>
        h(
          'button',
          {
            type: 'button',
            class: 'seg-btn',
            'aria-pressed': String(on[k]),
            onclick: (e) => {
              on[k] = !on[k];
              e.currentTarget.setAttribute('aria-pressed', String(on[k]));
              chart.render();
            },
          },
          COND[k][0]
        )
      )
    );
    function signals() {
      const keys = Object.keys(on).filter((k) => on[k]);
      if (!keys.length) return [];
      const out = [];
      for (let j = 55; j < 150; j++) if (keys.every((k) => COND[k][1](j)) && (!out.length || j - out[out.length - 1] > 5)) out.push(j);
      return out;
    }
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host, h('p', { class: 'plot-h' }, 'A buy signal needs…'), toggles);
    const chart = TA.chart(box, ctx, {
      bars,
      ms: 3600,
      label: 'Buy signals that need several conditions to agree',
      over(P, C, i) {
        TA.series(P, s50, i, { color: C.put, width: 1.75 });
        TA.series(P, s20, i, { color: C.accent, width: 1.5, dash: [4, 3] });
        signals()
          .filter((j) => j < i)
          .forEach((j) => arrow(P, C, j, bars[j].l, true));
      },
      lower: rsiLower(rsi),
      onIndex(i) {
        const sig = signals().filter((j) => j < i);
        const res = sig.filter((j) => j + 10 < cs.length).map((j) => cs[j + 10] / cs[j] - 1);
        const wins = res.filter((r) => r > 0).length,
          avg = res.length ? res.reduce((a, b) => a + b, 0) / res.length : 0;
        read.innerHTML = Object.values(on).some(Boolean) ? `<b>${sig.length}</b> signals. Ten days later, <b>${wins} of ${res.length}</b> were higher, average <b class="${SS.plClass(avg)}">${pct(avg, { sign: true })}</b>. Simulated data: use it to see the trade-off, not as evidence of an edge.` : 'Turn on at least one condition.';
      },
    });
    box.append(legend(['lg-put', '50-day average'], ['lg-accent', '20-day average', true]), read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- indicator overload ---------- */
  V.overload = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 50], [30, 56], [50, 52], [75, 58], [95, 54], [119, 56]], 120, { seed: 221, noise: 0.008 }), { seed: 221 });
    const cs = TA.closes(bars);
    const LINES = [
      ['SMA 10', TA.sma(cs, 10)],
      ['SMA 20', TA.sma(cs, 20)],
      ['SMA 50', TA.sma(cs, 50)],
      ['EMA 9', TA.ema(cs, 9)],
      ['EMA 12', TA.ema(cs, 12)],
      ['EMA 26', TA.ema(cs, 26)],
      ['EMA 34', TA.ema(cs, 34)],
    ];
    const bb = TA.bollinger(cs, 20, 2);
    let mode = 'all';
    const sg = seg({ label: 'Chart', options: [{ v: 'all', label: 'Everything on' }, { v: 'simple', label: 'Keep it simple' }], value: mode, onChange: (v) => ((mode = v), chart.render()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host, sg.el);
    const cols = ['accent', 'put', 'violet', 'warn', 'gain', 'loss', 'stock'];
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'A cluttered chart versus a simple one',
      under(P, C, i) {
        if (mode !== 'all') return;
        TA.band(P, bb.up, bb.lo, i, C.muted, 0.1);
      },
      over(P, C, i) {
        if (mode === 'all') LINES.forEach(([, arr], k) => TA.series(P, arr, i, { color: C[cols[k]], width: 1.4 }));
        else TA.series(P, LINES[2][1], i, { color: C.put, width: 2.25 });
      },
      onIndex() {
        const last = cs.length - 1,
          up = LINES.filter(([, a]) => cs[last] > a[last]).length;
        read.innerHTML = mode === 'all' ? `Seven moving averages and a set of bands, all calculated from the same closing prices. Right now <b>${up}</b> say “above” and <b>${LINES.length - up}</b> say “below”. More lines, less clarity.` : 'One 50-day average and the price itself. The trend and the levels are easier to see.';
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };
})();
