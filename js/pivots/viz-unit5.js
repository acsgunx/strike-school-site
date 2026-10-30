/* Pivot Point Trading, Unit 5 visuals: a wick-reversal candle builder, a gallery of two-bar setups, setup replays with
   stops and targets, a scan of every setup in a session, a setup quiz and a full day start to finish. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, usd, pct, pal, alpha, tween } = SS;
  const V = SS.viz,
    TA = SS.TA,
    PV = SS.PV;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);

  /* ---------- setup rules (our versions; traders tune the thresholds) ---------- */
  const avgRange = (b, i, n = 10) => {
    const s = b.slice(Math.max(0, i - n), i);
    return s.length ? s.reduce((a, x) => a + x.h - x.l, 0) / s.length : 0;
  };
  /** Each rule checks the bar at i (the last bar of the setup) for a bullish (side 1) or bearish (side −1) reversal. */
  const RULES = {
    wick: (b, i, side) => {
      const x = b[i],
        body = Math.abs(x.c - x.o),
        rg = x.h - x.l,
        wick = side > 0 ? Math.min(x.o, x.c) - x.l : x.h - Math.max(x.o, x.c);
      return rg > 0 && wick >= 2.5 * body && (side > 0 ? x.c - x.l : x.h - x.c) >= (2 / 3) * rg && rg >= avgRange(b, i);
    },
    extreme: (b, i, side) => {
      const p = b[i - 1],
        x = b[i],
        rg = p.h - p.l,
        mid = (p.h + p.l) / 2;
      return rg >= 2 * avgRange(b, i - 1) && Math.abs(p.c - p.o) >= 0.5 * rg && (side > 0 ? p.c < p.o && x.c > x.o && x.c > mid : p.c > p.o && x.c < x.o && x.c < mid);
    },
    outside: (b, i, side) => {
      const p = b[i - 1],
        x = b[i];
      return x.h > p.h && x.l < p.l && (side > 0 ? x.c > p.h : x.c < p.l);
    },
    doji: (b, i, side) => {
      const p = b[i - 1],
        x = b[i];
      return p.h > p.l && Math.abs(p.c - p.o) <= 0.1 * (p.h - p.l) && (side > 0 ? x.c > p.h : x.c < p.l);
    },
  };
  const NAME = { wick: 'Wick reversal', extreme: 'Extreme reversal', outside: 'Outside reversal', doji: 'Doji reversal' };
  const BARS_IN = { wick: 1, extreme: 2, outside: 2, doji: 2 };
  /** Every setup in a session: [{ i, kind, side }]. */
  function scan(b) {
    const out = [];
    for (let i = 11; i < b.length; i++) for (const k in RULES) for (const side of [1, -1]) if (RULES[k](b, i, side)) out.push({ i, kind: k, side });
    return out;
  }

  /* ---------- yesterday’s levels used by every replay ---------- */
  const Y = { h: 102, l: 98, c: 101 };
  function levelSet() {
    const F = PV.floor(Y),
      z = PV.cpr(Y),
      K = PV.camarilla(Y);
    return [
      { name: 'R1', v: F.R1 },
      { name: 'P', v: F.P, dash: null, width: 2 },
      { name: 'S1', v: F.S1 },
      { name: 'TC', v: z.TC, kind: 'cpr' },
      { name: 'BC', v: z.BC, kind: 'cpr' },
      { name: 'H4', v: K.H4, kind: 'cam' },
      { name: 'H3', v: K.H3, kind: 'cam' },
      { name: 'L3', v: K.L3, kind: 'cam' },
      { name: 'L4', v: K.L4, kind: 'cam' },
      { name: 'Close', v: Y.c, kind: 'close' },
    ];
  }
  const levelColor = (L, C) => (L.kind === 'cpr' ? C.accent : L.kind === 'cam' ? C.violet : L.kind === 'close' ? C.ink : PV.levelColor(L.name, C));
  const LV = Object.fromEntries(levelSet().map((L) => [L.name, L.v]));

  /** Replace bars with crafted candles, then make the next bar open where the last crafted one closed. */
  function craft(bars, at, list) {
    list.forEach(([o, hi, lo, c], j) => (bars[at + j] = { o, h: hi, l: lo, c, v: bars[at + j].v * 1.8 }));
    const nx = bars[at + list.length];
    if (nx) {
      const up = nx.h - Math.max(nx.o, nx.c),
        dn = Math.min(nx.o, nx.c) - nx.l;
      nx.o = bars[at + list.length - 1].c;
      nx.h = Math.max(nx.o, nx.c) + up;
      nx.l = Math.min(nx.o, nx.c) - dn;
    }
    return bars;
  }

  /* ---------- the wick-reversal candle builder ---------- */
  V.candleBuilder = function (host, p, ctx) {
    const AVG = 0.3,
      LOW = 98.62;
    const st = { body: 0.1, lower: 0.3, upper: 0.03, up: true };
    const sB = slider({ id: ctx.key + '-b', label: 'Body', min: 0.02, max: 0.5, step: 0.01, value: st.body, fmt: (v) => usd(v), onInput: (v) => ((st.body = v), paint()) });
    const sL = slider({ id: ctx.key + '-l', label: 'Lower wick', min: 0, max: 0.6, step: 0.01, value: st.lower, fmt: (v) => usd(v), onInput: (v) => ((st.lower = v), paint()) });
    const sU = slider({ id: ctx.key + '-u', label: 'Upper wick', min: 0, max: 0.6, step: 0.01, value: st.upper, fmt: (v) => usd(v), onInput: (v) => ((st.upper = v), paint()) });
    const sg = seg({ label: 'Close', options: [{ v: 'up', label: 'Closes up' }, { v: 'down', label: 'Closes down' }], value: 'up', onChange: (v) => ((st.up = v === 'up'), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const checks = h('div', { class: 'pv-plan', 'aria-live': 'polite' });
    stack(host, plotEl, checks, sB.el, sL.el, sU.el, sg.el, h('p', { class: 'fine' }, `Recent bars average ${usd(AVG)} from high to low. S1 is ${usd(LV.S1)}.`));
    const bar = () => {
      const l = LOW,
        bot = l + st.lower,
        top = bot + st.body,
        hi = top + st.upper;
      return st.up ? { o: bot, c: top, h: hi, l } : { o: top, c: bot, h: hi, l };
    };
    const context = () => {
      const out = [];
      let c = 99.65;
      for (let k = 0; k < 6; k++) {
        const o = c,
          cc = c - 0.14 - (k % 2) * 0.05;
        out.push({ o, c: cc, h: o + 0.06, l: cc - 0.07 });
        c = cc;
      }
      return out;
    };
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 250 : 290),
      pad: { l: 10, r: 10, t: 12, b: 12 },
      label: 'A bar arriving at S1, shaped by the sliders',
      draw(P) {
        const C = pal(),
          x = bar(),
          ctxBars = context();
        P.domain(-0.8, 9, 98.45, 99.85);
        PV.drawLevels(P, [{ name: 'S1', v: LV.S1 }]);
        const all = ctxBars.concat([x]);
        TA.drawCandles(P, all, all.length, { widthScale: 1.6, color: (j) => (j < 6 ? alpha(pal().stock, 0.7) : null) });
        P.line([[6.5, x.l], [7.6, x.l]], { color: C.muted, width: 1, dash: [2, 3] });
      },
    });
    function paint() {
      plot.render();
      const x = bar(),
        rg = x.h - x.l,
        body = Math.abs(x.c - x.o),
        lw = Math.min(x.o, x.c) - x.l;
      const tests = [
        [`Lower wick at least 2.5 × the body`, lw >= 2.5 * body, `${usd(lw)} vs ${usd(2.5 * body)}`],
        ['Close in the top third of the bar', x.c - x.l >= (2 / 3) * rg, `close ${pct((x.c - x.l) / rg, { d: 0 })} of the way up`],
        ['Bar at least as big as recent bars', rg >= AVG, `${usd(rg)} vs ${usd(AVG)} average`],
      ];
      const ok = tests.every((t) => t[1]);
      checks.innerHTML = `<ol class="pv-steps">${tests.map(([t, pass, d]) => `<li><span><b class="${pass ? 'gain' : 'loss'}">${pass ? '✓' : '✗'}</b> ${t}</span><span class="fine">${d}</span></li>`).join('')}</ol>
        <div class="pv-verdict pv-v-${ok ? 'gain' : 'warn'}"><b class="${ok ? 'gain' : 'pv-warn'}">${ok ? 'Bullish wick reversal at S1' : 'Not a wick reversal yet'}</b><p>${ok ? `Buy at the close (${usd(x.c)}) with a stop just below the wick (${usd(x.l - 0.02)}).` : 'Adjust the bar until all three checks pass.'}</p></div>`;
    }
    paint();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- gallery of the two-bar setups ---------- */
  const GALLERY = {
    extreme: {
      bars: [[100.3, 100.34, 100.24, 100.26], [100.26, 100.3, 100.2, 100.22], [100.22, 100.25, 100.16, 100.18], [100.18, 100.2, 99.62, 99.66], [99.67, 100.0, 99.64, 99.97]],
      notes: (P, C, b) => {
        const mid = (b[3].h + b[3].l) / 2;
        P.line([[2.6, mid], [4.6, mid]], { color: C.warn, width: 1.5, dash: [3, 3] });
        P.text('midpoint', P.X(4.7), P.Y(mid), { align: 'left', color: C.warn, size: 9.5 });
        return ['Bar 1: a big bearish bar, at least twice the average range, with a body of at least half its range.', 'Bar 2: turns up and closes above bar 1’s midpoint.'];
      },
    },
    outside: {
      bars: [[100.3, 100.34, 100.2, 100.22], [100.22, 100.25, 100.1, 100.12], [100.12, 100.15, 100.02, 100.05], [100.05, 100.1, 99.95, 99.98], [99.97, 100.16, 99.88, 100.14]],
      notes: (P, C, b) => {
        [b[3].h, b[3].l].forEach((v) => P.line([[2.6, v], [4.6, v]], { color: C.warn, width: 1.5, dash: [3, 3] }));
        P.text('bar 1 high', P.X(4.7), P.Y(b[3].h), { align: 'left', color: C.warn, size: 9.5 });
        P.text('bar 1 low', P.X(4.7), P.Y(b[3].l), { align: 'left', color: C.warn, size: 9.5 });
        return ['Bar 2 trades below bar 1’s low and above its high: it engulfs the whole bar.', 'Then it closes above bar 1’s high.'];
      },
    },
    doji: {
      bars: [[100.3, 100.34, 100.2, 100.22], [100.22, 100.25, 100.1, 100.12], [100.12, 100.15, 100.02, 100.05], [100.04, 100.11, 99.96, 100.045], [100.05, 100.2, 100.02, 100.18]],
      notes: (P, C, b) => {
        P.line([[2.6, b[3].h], [4.6, b[3].h]], { color: C.warn, width: 1.5, dash: [3, 3] });
        P.text('doji high', P.X(4.7), P.Y(b[3].h), { align: 'left', color: C.warn, size: 9.5 });
        return ['Bar 1: a doji, with a body no bigger than a tenth of its range. Neither side won.', 'Bar 2: closes above the doji’s high, so buyers won the tie-break.'];
      },
    },
  };
  V.setupGallery = function (host, p, ctx) {
    let key = 'extreme',
      shown = 5,
      cancel = null;
    const sg = seg({ label: 'Setup', options: Object.keys(GALLERY).map((k) => ({ v: k, label: NAME[k] })), value: key, onChange: (v) => ((key = v), play()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('div', { class: 'pv-plan', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, read, h('p', { class: 'fine' }, 'Bullish versions shown. Flip everything upside down for the bearish ones.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 230 : 270),
      pad: { l: 10, r: 10, t: 14, b: 14 },
      label: NAME[key] + ' built bar by bar',
      draw(P) {
        const C = pal(),
          b = GALLERY[key].bars.map(([o, hi, lo, c]) => ({ o, h: hi, l: lo, c })),
          lo = Math.min(...b.map((x) => x.l)),
          hi = Math.max(...b.map((x) => x.h));
        P.domain(-0.8, 6.4, lo - (hi - lo) * 0.12, hi + (hi - lo) * 0.12);
        const n = Math.min(5, Math.floor(shown));
        if (n >= 4) P.rect(2.5, lo - (hi - lo) * 0.05, 4.5, hi + (hi - lo) * 0.05, alpha(C.accent, 0.08));
        TA.drawCandles(P, b, n, { widthScale: 1.8, color: (j) => (j < 3 ? alpha(pal().stock, 0.7) : null) });
        if (n >= 4) {
          P.text('1', P.X(3), P.Y(hi) - 4, { color: C.muted });
          GALLERY[key].notes(P, C, b);
        }
        if (n >= 5) P.text('2', P.X(4), P.Y(hi) - 4, { color: C.muted });
      },
    });
    function paint() {
      plot.render();
      const b = GALLERY[key].bars.map(([o, hi, lo, c]) => ({ o, h: hi, l: lo, c }));
      const lines = GALLERY[key].notes({ line() {}, text() {}, X: () => 0, Y: () => 0 }, pal(), b);
      read.innerHTML = `<ol class="pv-steps">${lines.map((t, j) => `<li><span class="stat-l">Bar ${j + 1}</span><span>${t}</span></li>`).join('')}</ol>`;
    }
    function play() {
      if (cancel) cancel();
      paint();
      cancel = tween(1800, (k) => {
        shown = 3 + k * 2.01;
        plot.render();
      });
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- setup replays ---------- */
  const SETUPS = {
    wickL3: { kind: 'wick', side: 1, seed: 142, at: 20, lv: 'L3', tgt: 'TC', a: [[0, 100.9], [8, 100.55], [16, 100.15], [19, 100.02], [21, 100.1], [28, 100.3], [40, 100.55], [55, 100.75], [77, 100.6]], bars: [[100.0, 100.06, 99.68, 100.03]], end: 'Buyers defended L3 with a long lower wick, and price climbed to the top of the CPR.' },
    failWick: { kind: 'wick', side: 1, seed: 141, at: 20, lv: 'S1', tgt: 'P', a: [[0, 100.6], [8, 99.9], [16, 99.1], [19, 98.85], [21, 98.95], [24, 98.6], [30, 98.2], [45, 97.9], [60, 98.1], [77, 97.8]], bars: [[98.85, 98.98, 98.55, 98.95]], end: 'The wick at S1 looked good, but sellers came back and broke its low. The stop capped the loss at 1R while price kept falling.' },
    extremeL3: { kind: 'extreme', side: 1, seed: 142, at: 24, lv: 'L3', tgt: 'TC', a: [[0, 101.0], [12, 100.7], [23, 100.35], [24, 99.85], [26, 100.15], [36, 100.45], [50, 100.8], [64, 100.7], [77, 100.85]], bars: [[100.32, 100.34, 99.8, 99.85], [99.86, 100.14, 99.83, 100.12]], end: 'The flush through L3 was the last push down. Once the next bar closed back above its midpoint, price recovered to the CPR top.' },
    outsideH3: { kind: 'outside', side: -1, seed: 142, at: 26, lv: 'H3', tgt: 'Close', a: [[0, 101.0], [10, 101.5], [20, 101.9], [25, 102.05], [27, 101.9], [36, 101.6], [50, 101.2], [64, 101.1], [77, 100.95]], bars: [[101.98, 102.15, 101.95, 102.1], [102.12, 102.22, 101.86, 101.89]], end: 'The poke above H3 failed inside a single bar. The outside reversal short rode the rotation back to yesterday’s close.' },
    dojiBC: { kind: 'doji', side: 1, seed: 142, at: 22, lv: 'BC', tgt: 'TC', a: [[0, 100.9], [10, 100.55], [20, 100.12], [22, 100.04], [24, 100.3], [28, 100.4], [36, 100.5], [48, 100.75], [62, 100.6], [77, 100.7]], bars: [[100.03, 100.12, 99.94, 100.04], [100.05, 100.2, 100.02, 100.18]], end: 'Indecision at the bottom of the CPR, right above L3, resolved upward. Price traveled across the CPR to its top.' },
    fullDay: { kind: 'wick', side: 1, seed: 141, at: 20, lv: 'S1', tgt: 'P', full: true, a: [[0, 100.6], [8, 99.9], [16, 99.1], [19, 98.85], [21, 99.0], [30, 99.6], [45, 100.4], [60, 100.2], [77, 100.5]], bars: [[98.85, 98.98, 98.55, 98.95]], end: 'The plan worked as written: no bias at the open, patience until the S1 and L4 hot zone, a setup right there, and a defined-risk trade back to the pivot.' },
  };
  function runSetup(key) {
    const s = SETUPS[key],
      bars = craft(PV.sessionAt(s.a, { seed: s.seed }), s.at, s.bars),
      si = s.at + s.bars.length - 1;
    const valid = RULES[s.kind](bars, si, s.side);
    const pat = bars.slice(s.at, si + 1);
    const stop = s.side > 0 ? Math.min(...pat.map((x) => x.l)) - 0.02 : Math.max(...pat.map((x) => x.h)) + 0.02;
    const tr = { i: si, entry: bars[si].c, stop, target: LV[s.tgt], side: s.side };
    for (let j = si + 1; j < bars.length && tr.exit == null; j++) {
      const b = bars[j];
      if (s.side > 0 ? b.h >= tr.target : b.l <= tr.target) Object.assign(tr, { exit: j, px: tr.target, why: 'target' });
      else if (s.side > 0 ? b.l <= tr.stop : b.h >= tr.stop) Object.assign(tr, { exit: j, px: tr.stop, why: 'stop' });
    }
    if (tr.exit == null) Object.assign(tr, { exit: bars.length - 1, px: bars[bars.length - 1].c, why: 'close' });
    tr.pl = (tr.px - tr.entry) * s.side;
    tr.risk = Math.abs(tr.entry - tr.stop);
    return { s, bars, si, valid, tr };
  }
  const rTxt = (tr) => (tr.pl >= 0 ? '+' : '−') + Math.abs(tr.pl / tr.risk).toFixed(1) + 'R';
  function setupChart(holder, ctx, run, o = {}) {
    const { s, bars, si, tr } = run;
    const lo = Math.min(...bars.map((b) => b.l)),
      hi = Math.max(...bars.map((b) => b.h));
    const levels = levelSet().filter((L) => L.v >= lo - 0.15 && L.v <= hi + 0.15);
    const y0 = Math.min(lo, ...levels.map((L) => L.v)),
      y1 = Math.max(hi, ...levels.map((L) => L.v));
    return TA.chart(holder, ctx, {
      bars,
      yRange: [y0 - (y1 - y0) * 0.05, y1 + (y1 - y0) * 0.08],
      pad: { l: 50, r: 78 },
      xTicks: PV.TICKS,
      xf: PV.clock,
      yf: PV.yf,
      dayFmt: (v) => PV.clock(v - 1),
      sliderLabel: 'Time',
      ms: o.ms || 3800,
      controls: o.controls,
      scrub: o.scrub,
      playFrom: o.playFrom,
      label: NAME[s.kind] + ' at ' + s.lv,
      under(P, C) {
        const z = PV.cpr(Y);
        PV.drawZone(P, z.bot, z.top, C.accent, 0.08);
      },
      over(P, C, i) {
        PV.drawLevels(P, levels.map((L) => Object.assign({}, L, { color: levelColor(L, C), width: L.width || 1.5 })));
        if (i <= si || (o.hide && o.hide())) return;
        const pat = bars.slice(s.at, si + 1);
        P.rect(s.at - 0.6, Math.min(...pat.map((x) => x.l)) - 0.03, si + 0.6, Math.max(...pat.map((x) => x.h)) + 0.03, alpha(C.warn, 0.22));
        const x1 = Math.min(i - 1, tr.exit),
          col = tr.side > 0 ? C.gain : C.loss;
        P.line([[si, tr.entry], [x1, tr.entry]], { color: C.ink, width: 1.5, dash: [4, 3] });
        P.line([[si, tr.stop], [x1, tr.stop]], { color: C.loss, width: 2.25 });
        P.line([[si, tr.target], [x1, tr.target]], { color: C.gain, width: 2.25 });
        if (i - 1 >= tr.exit) {
          const good = tr.pl > 0;
          P.dot(tr.exit, tr.px, { color: good ? C.gain : C.loss, r: 4.5 });
          P.tag(tr.why === 'target' ? 'Target hit' : tr.why === 'stop' ? 'Stopped out' : 'Closed at the bell', P.X(tr.exit), P.Y(tr.px), { bg: good ? C.gain : C.loss, align: tr.exit > bars.length / 2 ? 'right' : 'left', dy: (tr.side > 0) === good ? -32 : 10, size: 10.5 });
        } else P.tag(NAME[s.kind], P.X(si), P.Y(tr.stop), { bg: col, dy: tr.side > 0 ? 10 : -32, size: 10.5 });
      },
      onIndex: o.onIndex,
    });
  }
  function setupText(run, i) {
    const { s, bars, si, tr } = run,
      b = bars[i - 1],
      verb = s.side > 0 ? 'Buy' : 'Sell';
    const z = PV.cpr(Y);
    if (i - 1 < si) {
      if (!s.full) return `${PV.clock(i - 1)}: price ${usd(b.c)}. Waiting for a setup at a level.`;
      if (i <= 6) return `Before the open: the CPR runs from ${usd(z.bot)} to ${usd(z.top)} (${pct(z.width / z.P, { d: 2 })}, moderate). Price opens inside it, so there is no strong bias. Below, S1 (${usd(LV.S1)}) and L4 (${usd(LV.L4)}) sit ${Math.round((LV.L4 - LV.S1) * 100)}¢ apart: a hot zone to watch.`;
      return `${PV.clock(i - 1)}: price ${usd(b.c)}. ${b.l <= LV.L4 + 0.1 ? 'Price has reached the S1 and L4 hot zone. Now wait for a setup.' : 'No trade yet: price is between levels.'}`;
    }
    const head = `${PV.clock(si)}: <b>${NAME[s.kind].toLowerCase()}</b> at ${s.lv} (${usd(LV[s.lv])}). ${verb} at <b>${usd(tr.entry)}</b>, stop ${usd(tr.stop)} just ${s.side > 0 ? 'below' : 'above'} the setup, target ${s.tgt === 'Close' ? 'yesterday’s close' : s.tgt} (${usd(tr.target)}).`;
    if (i - 1 < tr.exit) return `${head} Now ${usd(b.c)}.`;
    const res = `<b class="${tr.pl >= 0 ? 'gain' : 'loss'}">${tr.pl >= 0 ? '+' : ''}${usd(tr.pl)}</b> a share, ${rTxt(tr)}`;
    const how = tr.why === 'target' ? 'target reached for' : tr.why === 'stop' ? 'the setup’s extreme broke, stopped out for' : 'closed at the bell for';
    return `${PV.clock(tr.exit)}: ${how} ${res}.${i >= bars.length ? ' ' + s.end : ''}`;
  }
  V.setupDay = function (host, p, ctx) {
    const set = p.set || ['wickL3'];
    let key = set[0],
      chart = null;
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, holder, h('div', { class: 'legend' }, lg('var(--warn)', 'Setup'), lg('var(--ink)', 'Entry', true), lg('var(--loss)', 'Stop'), lg('var(--gain)', 'Target')), read, h('p', { class: 'fine' }, 'Yesterday: high $102, low $98, close $101. Floor pivots in red and green, the CPR in blue, Camarilla levels in purple.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const run = runSetup(key);
      chart = setupChart(holder, ctx, run, { onIndex: (i) => (read.innerHTML = setupText(run, i)) });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- every setup in a session, with and without the level filter ---------- */
  V.setupScan = function (host, p, ctx) {
    const run = runSetup('fullDay'),
      bars = run.bars,
      levels = levelSet();
    const all = scan(bars),
      nearLevel = (x) => {
        const ext = x.side > 0 ? Math.min(...bars.slice(x.i - BARS_IN[x.kind] + 1, x.i + 1).map((b) => b.l)) : Math.max(...bars.slice(x.i - BARS_IN[x.kind] + 1, x.i + 1).map((b) => b.h));
        // The setup touched the level (within 2 cents) or pierced it by no more than 12 cents.
        return levels.find((L) => (x.side > 0 ? ext <= L.v + 0.02 && ext >= L.v - 0.12 : ext >= L.v - 0.02 && ext <= L.v + 0.12));
      };
    all.forEach((x) => (x.level = nearLevel(x)));
    let only = false,
      chart = null;
    const sg = seg({ label: 'Show', options: [{ v: 'all', label: 'Every setup' }, { v: 'levels', label: 'Only at levels' }], value: 'all', onChange: (v) => ((only = v === 'levels'), chart.render()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read, h('p', { class: 'fine' }, '“At a level” means the setup’s low (or high, for bearish setups) touched a pivot, CPR or Camarilla level, or pierced it by no more than 12 cents.'));
    const lo = Math.min(...bars.map((b) => b.l)),
      hi = Math.max(...bars.map((b) => b.h));
    const shownLevels = levels.filter((L) => L.v >= lo - 0.15 && L.v <= hi + 0.15);
    chart = TA.chart(holder, ctx, {
      bars,
      pad: { l: 50, r: 78 },
      xTicks: PV.TICKS,
      xf: PV.clock,
      yf: PV.yf,
      dayFmt: (v) => PV.clock(v - 1),
      sliderLabel: 'Time',
      ms: 3800,
      label: 'Every reversal setup in one session',
      over(P, C, i) {
        PV.drawLevels(P, shownLevels.map((L) => Object.assign({}, L, { color: levelColor(L, C), width: L.width || 1.5 })));
        all
          .filter((x) => x.i < i && (!only || x.level))
          .forEach((x) => {
            const y = x.side > 0 ? bars[x.i].l : bars[x.i].h;
            P.dot(x.i, y, { color: x.level ? C.warn : alpha(x.side > 0 ? C.gain : C.loss, 0.8), r: x.level ? 5 : 3 });
          });
      },
      onIndex(i) {
        const seen = all.filter((x) => x.i < i),
          at = seen.filter((x) => x.level);
        read.innerHTML = `${i >= bars.length ? 'All day' : 'So far'}: <b>${seen.length}</b> setups formed, but only <b class="pv-warn">${at.length}</b> at a level${at.length ? ': ' + at.map((x) => `${(x.side > 0 ? 'bullish ' : 'bearish ') + NAME[x.kind].toLowerCase()} at ${x.level.name} (${PV.clock(x.i)})`).join('; ') : ''}.`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- name that setup ---------- */
  const QUIZ_KEYS = ['wickL3', 'extremeL3', 'outsideH3', 'dojiBC'];
  V.setupQuiz = function (host, p, ctx) {
    const r = SS.rng((Date.now() % 100000) + 17),
      kinds = Object.keys(NAME);
    let order = [],
      at = 0,
      score = 0,
      seen = 0,
      answered = false,
      chart = null;
    const holder = h('div');
    const choices = h('div', { class: 'choices' });
    const fb = h('p', { class: 'readout', 'aria-live': 'polite' });
    const tally = h('p', { class: 'sorter-tally' });
    const next = h('button', { type: 'button', class: 'btn primary', hidden: true, onclick: () => round() }, 'Next setup');
    stack(host, holder, h('p', { class: 'plot-h' }, 'Which setup just formed?'), choices, fb, h('div', { class: 'ctl-row' }, next, tally));
    function round() {
      if (at % QUIZ_KEYS.length === 0) order = QUIZ_KEYS.slice().sort(() => r() - 0.5);
      const key = order[at % QUIZ_KEYS.length],
        run = runSetup(key),
        kind = run.s.kind;
      at++;
      answered = false;
      next.hidden = true;
      if (chart) chart.destroy();
      holder.replaceChildren();
      chart = setupChart(holder, ctx, run, { controls: false, scrub: false, ms: 2600, playFrom: run.si + 1, hide: () => !answered });
      chart.set(run.si + 1);
      fb.textContent = `${PV.clock(run.si)}: price is at ${run.s.lv} (${usd(LV[run.s.lv])}). Look at the last ${BARS_IN[kind] === 1 ? 'bar' : 'two bars'}.`;
      const opts = kinds.slice().sort(() => r() - 0.5);
      choices.replaceChildren(
        ...opts.map((o, j) =>
          h(
            'button',
            {
              type: 'button',
              class: 'choice',
              'data-k': o,
              onclick: (e) => {
                if (answered) return;
                answered = true;
                const ok = o === kind;
                seen++;
                if (ok) score++;
                choices.querySelectorAll('.choice').forEach((b) => {
                  b.disabled = true;
                  if (b.dataset.k === kind) b.classList.add('right');
                });
                if (!ok) e.currentTarget.classList.add('wrong');
                fb.innerHTML = `<b>${ok ? 'Correct.' : 'Not quite.'}</b> A ${run.s.side > 0 ? 'bullish' : 'bearish'} ${NAME[kind].toLowerCase()} at ${run.s.lv}. ${run.s.end}`;
                tally.textContent = `${score} of ${seen} correct`;
                next.hidden = false;
                chart.play();
              },
            },
            h('span', { class: 'choice-k' }, 'ABCD'[j]),
            h('span', null, NAME[o])
          )
        )
      );
    }
    round();
    return { destroy: () => chart && chart.destroy() };
  };
})();
