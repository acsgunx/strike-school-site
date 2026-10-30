/* Technical Analysis in Depth, Unit 1 visuals: Dow’s three trends, the three phases of a bull market, confirmation,
   failure and non-failure swings, retracement levels and the fan principle. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, seg, slider, pal, alpha, tween, ease, usd } = SS;
  const V = SS.viz;
  const TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  /** Centered moving average; the window shrinks near the ends so the series keeps its length. */
  const smooth = (xs, w) =>
    xs.map((_, i) => {
      const k = Math.min((w - 1) / 2, i, xs.length - 1 - i);
      let s = 0;
      for (let j = i - k; j <= i + k; j++) s += xs[j];
      return s / (2 * k + 1);
    });
  const months = (v) => (v ? Math.round(v / 21) + ' mo' : '0');

  /* ---------- the tide, the waves and the ripples ---------- */
  // Each rise is followed by a correction that gives back a third to two-thirds of it. The last rally fails below
  // the old peak and the price then breaks the last low: the tide turns.
  const WAVES = [[0, 100], [60, 114], [95, 106], [160, 126], [200, 116], [270, 142], [310, 131], [380, 158], [425, 141], [460, 150], [499, 128]];
  const TIDE = [[0, 101], [390, 150], [499, 136]];
  const N1 = 500;
  const STAGES = [
    { v: 'tide', label: 'Tide', a: 0, b: 0 },
    { v: 'waves', label: '+ Waves', a: 1, b: 0 },
    { v: 'ripples', label: '+ Ripples', a: 1, b: 1 },
  ];
  V.trendLayers = function (host, p, ctx) {
    const tide = smooth(TA.path(TIDE, N1, { noise: 0 }), 121),
      lin = TA.path(WAVES, N1, { noise: 0 }),
      waves = smooth(lin, 15),
      noisy = TA.path(WAVES, N1, { seed: 3, noise: 0.011 }),
      sec = waves.map((v, i) => v - tide[i]),
      minor = noisy.map((v, i) => v - lin[i]);
    let a = 1,
      b = 1,
      stage = 'ripples',
      cancel = null;
    const sg = seg({ label: 'Layers', options: STAGES.map(({ v, label }) => ({ v, label })), value: stage, onChange: (v) => go(v) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, h('div', { class: 'legend' }, lg('var(--accent)', 'The tide: primary trend'), lg('var(--ink)', 'Price with the layers shown')), read, h('p', { class: 'fine' }, 'Simulated prices over two years.'));
    const all = tide.map((t, i) => [t, t + sec[i], t + sec[i] + minor[i]]).flat();
    const lo = Math.min(...all) - 4,
      hi = Math.max(...all) + 4;
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 230 : 270),
      pad: { l: 44, r: 20, t: 12, b: 24 },
      label: 'Price built from the primary trend, secondary corrections and minor moves',
      draw(P) {
        const C = pal();
        P.domain(0, N1 - 1, lo, hi);
        P.grid({ xTicks: [0, 126, 252, 378, 499], xf: months, yf: (v) => '$' + Math.round(v) });
        P.line(tide.map((v, i) => [i, v]), { color: C.accent, width: 9, alpha: 0.22 });
        P.line(tide.map((v, i) => [i, v]), { color: C.accent, width: 1.5, dash: [5, 4] });
        P.line(tide.map((v, i) => [i, v + a * sec[i] + b * minor[i]]), { color: C.ink, width: b > 0.5 ? 1.5 : 2.25 });
      },
    });
    const ext = (a, b, f) => waves.slice(a, b).reduce((m, v) => f(m, v)),
      pk = ext(350, 400, Math.max),
      tr = ext(400, 440, Math.min);
    const TEXT = {
      tide: 'The tide: the primary uptrend, rising for about 18 months before it starts to turn down. This is the trend long-term investors care about.',
      waves: `Add the waves: secondary corrections, such as the fall from ${usd(pk, 0)} to ${usd(tr, 0)} (−${Math.round((1 - tr / pk) * 100)}% over about nine weeks). Each gave back a third to two-thirds of the rise before it, while the tide kept rising. At the end, a rally fails below ${usd(pk, 0)} and the price falls under ${usd(tr, 0)}: the tide has turned.`,
      ripples: 'Add the ripples: the day-to-day noise. This is the chart you actually see. Dow’s point: don’t mistake a ripple, or even a wave, for the tide.',
    };
    function paint() {
      plot.render();
      read.textContent = TEXT[stage];
    }
    function go(v) {
      if (cancel) cancel();
      const t = STAGES.find((s) => s.v === v),
        a0 = a,
        b0 = b;
      stage = v;
      sg.set(v);
      read.textContent = TEXT[v];
      cancel = tween(900, (k) => {
        const e = ease.inOut(k);
        a = a0 + (t.a - a0) * e;
        b = b0 + (t.b - b0) * e;
        plot.render();
      });
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        a = b = 0;
        stage = 'tide';
        sg.set('tide');
        paint();
        cancel = tween(4200, (k) => {
          a = ease.inOut(clamp01((k - 0.2) / 0.3));
          b = ease.inOut(clamp01((k - 0.65) / 0.3));
          const s = k < 0.35 ? 'tide' : k < 0.8 ? 'waves' : 'ripples';
          if (s !== stage) (stage = s), sg.set(s), (read.textContent = TEXT[s]);
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- the three phases of a bull market ---------- */
  const BULL = [[0, 88], [40, 74], [80, 60], [100, 63], [125, 57], [150, 62], [175, 58], [200, 64], [240, 72], [260, 69], [300, 84], [320, 80], [360, 100], [375, 96], [400, 112], [420, 108], [440, 118], [455, 110], [470, 121], [485, 112], [500, 116], [519, 99]];
  const PHASES = [
    { from: 80, to: 200, n: '1', name: 'Accumulation', col: 'accent' },
    { from: 200, to: 400, n: '2', name: 'Public participation', col: 'gain' },
    { from: 400, to: 500, n: '3', name: 'Distribution', col: 'warn' },
  ];
  // Net buying (+) or selling (−) by each crowd, on a −1 to 1 scale. Illustrative, not measured.
  const INFORMED = [[0, 0.1], [80, 0.8], [180, 0.8], [260, 0.3], [380, 0], [420, -0.8], [500, -0.8], [519, -0.5]];
  const PUBLIC = [[0, -0.7], [80, -0.6], [180, -0.2], [260, 0.4], [380, 0.8], [500, 0.9], [519, -0.3]];
  V.trendPhases = function (host, p, ctx) {
    const n = 520,
      bars = TA.bars(TA.path(BULL, n, { seed: 12, noise: 0.007 }), { seed: 12 }),
      informed = smooth(TA.path(INFORMED, n, { noise: 0 }), 31),
      pub = smooth(TA.path(PUBLIC, n, { noise: 0 }), 31),
      lowAcc = Math.min(...bars.slice(80, 200).map((b) => b.c)),
      highDist = Math.max(...bars.slice(400, 500).map((b) => b.c));
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, holder, h('div', { class: 'legend' }, ...PHASES.map((ph) => lg(`var(--${ph.col})`, `${ph.n} ${ph.name}`)), lg('var(--accent)', 'Informed buyers', true), lg('var(--warn)', 'The public', true)), read, h('p', { class: 'fine' }, 'Simulated prices. The lower panel is an illustration of who tends to be buying or selling in each phase, not measured data.'));
    const phaseAt = (k) => PHASES.find((ph) => k >= ph.from && k < ph.to);
    const chart = TA.chart(holder, ctx, {
      bars,
      type: 'line',
      ms: 6500,
      playFrom: 10,
      pad: { l: 44 },
      xTicks: [0, 126, 252, 378, 504],
      xf: months,
      dayFmt: (v) => `Month ${Math.round((v - 1) / 21)} of 24`,
      sliderLabel: 'Time',
      label: 'A simulated bull market and its three phases',
      under(P, C) {
        PHASES.forEach((ph) => {
          P.rect(ph.from, P.dom.y0, ph.to, P.dom.y1, alpha(C[ph.col], 0.1));
          P.text(ph.n, P.X((ph.from + ph.to) / 2), P.Y(P.dom.y1) + 11, { color: C[ph.col], weight: 700, size: 11 });
        });
      },
      lower: {
        height: 90,
        label: 'Who is buying (+) or selling (−)',
        range: [-1.15, 1.15],
        yTicks: [-1, 0, 1],
        yf: (v) => (v > 0 ? 'buy' : v < 0 ? 'sell' : '0'),
        draw(P, C, i) {
          PHASES.forEach((ph) => P.rect(ph.from, P.dom.y0, ph.to, P.dom.y1, alpha(C[ph.col], 0.07)));
          P.line([[0, 0], [n, 0]], { color: C.ink, width: 1, dash: [2, 4], alpha: 0.5 });
          TA.series(P, informed, i, { color: C.accent, width: 2.25, dash: [6, 3] });
          TA.series(P, pub, i, { color: C.warn, width: 2.25, dash: [6, 3] });
        },
      },
      onIndex(i) {
        const k = i - 1,
          ph = phaseAt(k);
        if (i >= n) read.innerHTML = `From ${usd(lowAcc)} near the lows in phase 1 to ${usd(highDist)} near the top in phase 3, a rise of ${Math.round((highDist / lowAcc - 1) * 100)}%. The informed buyers bought in phase 1 and sold in phase 3. The public did the reverse.`;
        else if (k < 80) read.innerHTML = `${months(k)}: a bear market is ending. The news is grim, and most investors want out.`;
        else if (!ph) read.innerHTML = `${months(k)}: the decline begins. The public that bought late is left holding the shares.`;
        else
          read.innerHTML = {
            1: `<b>Phase 1, accumulation.</b> Prices go sideways near the lows while the news is still bad. The best-informed buyers quietly buy from discouraged sellers.`,
            2: `<b>Phase 2, public participation.</b> Business news improves and trend followers pile in. This is the longest and steepest part of the rise.`,
            3: `<b>Phase 3, distribution.</b> The news is glowing and the public buys eagerly, but the price struggles to make progress. The early buyers are selling to them.`,
          }[ph.n];
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- the averages must confirm ---------- */
  const CONFIRM = {
    yes: { label: 'Both confirm', makers: [[0, 100], [40, 118], [65, 108], [110, 127], [149, 124]], movers: [[0, 100], [40, 121], [65, 109], [110, 130], [149, 127]] },
    no: { label: 'Non-confirmation', makers: [[0, 100], [40, 118], [65, 108], [110, 124], [149, 107]], movers: [[0, 100], [40, 121], [65, 109], [110, 116], [149, 99]] },
  };
  V.dowConfirm = function (host, p, ctx) {
    let key = 'yes',
      chart = null;
    const sg = seg({ label: 'Case', options: Object.keys(CONFIRM).map((k) => ({ v: k, label: CONFIRM[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read, h('p', { class: 'fine' }, 'Made-up indexes. Dashed lines mark each index’s earlier high.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const sc = CONFIRM[key],
        n = 150,
        mk = TA.bars(TA.path(sc.makers, n, { seed: 21, noise: 0.006 }), { seed: 21 }),
        mv = TA.path(sc.movers, n, { seed: 22, noise: 0.007 }),
        peak = (xs, a, b) => {
          let j = a;
          for (let t = a; t <= b; t++) if (xs[t] > xs[j]) j = t;
          return j;
        },
        mc = TA.closes(mk),
        m1 = peak(mc, 25, 55),
        m2 = peak(mc, 90, 130),
        v1 = peak(mv, 25, 55),
        v2 = peak(mv, 90, 130),
        mNew = mc[m2] > mc[m1],
        vNew = mv[v2] > mv[v1],
        lo = Math.min(...mc, ...mv) - 4,
        hi = Math.max(...mc, ...mv) + 6;
      const mark = (P, C, i, xs, j1, j2, ok) => {
        if (i > j1) P.line([[j1, xs[j1]], [n - 1, xs[j1]]], { color: C.muted, width: 1.25, dash: [5, 4] });
        if (i > j2 + 3) {
          P.dot(j2, xs[j2], { color: ok ? C.gain : C.loss, r: 4.5 });
          P.tag(ok ? 'New high ✓' : 'No new high ✗', P.X(j2), P.Y(xs[j2]), { bg: ok ? C.gain : C.loss, dy: -32, size: 10.5 });
        }
      };
      chart = TA.chart(holder, ctx, {
        bars: mk,
        type: 'line',
        ms: 4500,
        playFrom: 5,
        cursor: false,
        yRange: [lo, hi],
        pad: { l: 44 },
        height: 150,
        title: 'Makers index (industrial companies)',
        yf: (v) => String(Math.round(v)),
        label: 'Makers index',
        over: (P, C, i) => mark(P, C, i, mc, m1, m2, mNew),
        lower: {
          height: 150,
          label: 'Movers index (transport companies)',
          range: [lo, hi],
          yf: (v) => String(Math.round(v)),
          draw(P, C, i) {
            TA.series(P, mv, i, { color: C.ink, width: 2.25 });
            mark(P, C, i, mv, v1, v2, vNew);
          },
        },
        onIndex(i) {
          if (i < n) return void (read.textContent = i > m2 ? 'Did both make a new high?' : 'Both indexes rise, pull back, and rally again. Watch the second peak in each.');
          read.innerHTML = mNew && vNew ? `Both indexes made new highs: the makers above ${Math.round(mc[m1])} and the movers above ${Math.round(mv[v1])}. Dow would call the uptrend confirmed.` : `The makers index made a new high, but the movers index stalled about ${Math.round((1 - mv[v2] / mv[v1]) * 100)}% below its old high: a <b>non-confirmation</b>. Here, both then fell. It doesn’t always end that way, which is why it counts as a warning rather than a signal.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- failure and non-failure swings ---------- */
  const SWINGS = {
    failure: { label: 'Failure swing', a: [[0, 50], [25, 64], [40, 57], [60, 62], [72, 58], [80, 55], [92, 52.5], [119, 47]] },
    nonfailure: { label: 'Non-failure swing', a: [[0, 50], [25, 64], [40, 57], [60, 67], [72, 60], [80, 55], [92, 52.5], [119, 47]] },
  };
  V.dowReversal = function (host, p, ctx) {
    let key = 'failure',
      chart = null;
    const sg = seg({ label: 'Pattern', options: Object.keys(SWINGS).map((k) => ({ v: k, label: SWINGS[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, h('div', { class: 'legend' }, lg('var(--muted)', 'Peak A', true), lg('var(--loss)', 'Low B: break it and the trend has turned', true)), read, h('p', { class: 'fine' }, 'Simulated prices.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const n = 120,
        bars = TA.bars(TA.path(SWINGS[key].a, n, { seed: 8, noise: 0.003 }), { seed: 8, wick: 0.004 }),
        c = TA.closes(bars),
        ext = (a, b, f) => {
          let j = a;
          for (let t = a; t <= b; t++) if (f(c[t], c[j])) j = t;
          return j;
        },
        A = ext(18, 32, (x, y) => x > y),
        B = ext(33, 48, (x, y) => x < y),
        Cp = ext(50, 68, (x, y) => x > y),
        brk = c.findIndex((v, t) => t > Cp && v < c[B]),
        fail = c[Cp] < c[A];
      chart = TA.chart(holder, ctx, {
        bars,
        type: 'line',
        ms: 4500,
        playFrom: 5,
        pad: { l: 44 },
        label: SWINGS[key].label + ': how an uptrend turns',
        over(P, C, i) {
          if (i > A) P.line([[A, c[A]], [n - 1, c[A]]], { color: C.muted, width: 1.25, dash: [5, 4] });
          if (i > B) P.line([[B, c[B]], [n - 1, c[B]]], { color: C.loss, width: 1.25, dash: [5, 4] });
          [[A, 'A', -12], [B, 'B', 14], [Cp, 'C', -12]].forEach(([t, s, dy]) => {
            if (i > t + 2) P.text(s, P.X(t), P.Y(c[t]) + dy, { color: C.ink, weight: 700, size: 11 });
          });
          if (i > Cp + 2) P.dot(Cp, c[Cp], { color: fail ? C.warn : C.gain, r: 4 });
          if (brk > 0 && i > brk) {
            P.dot(brk, c[brk], { color: C.loss, r: 4.5 });
            // Above and to the right: the price has already fallen away below the line there.
            P.tag('Sell: below B', P.X(brk), P.Y(c[brk]), { bg: C.loss, align: 'left', dy: -34, size: 10.5 });
          }
        },
        onIndex(i) {
          const k = i - 1;
          if (i >= n)
            read.innerHTML = fail
              ? `Peak C (${usd(c[Cp])}) stopped below peak A (${usd(c[A])}): a lower high, the first warning. When the price fell under low B (${usd(c[B])}) on day ${brk + 1}, the pattern of higher highs and higher lows was broken. That is Dow’s sell signal.`
              : `Peak C (${usd(c[Cp])}) made a new high above A (${usd(c[A])}), so the uptrend still looked healthy. Then the fall under low B (${usd(c[B])}) on day ${brk + 1} broke the pattern of higher lows. Some Dow theorists act here; others wait for a lower peak to follow.`;
          else if (k <= B + 2) read.textContent = 'An uptrend: peak A, then a pullback to low B.';
          else if (k <= Cp + 2) read.textContent = 'The next rally. Will it beat peak A?';
          else if (brk < 0 || k < brk) read.textContent = fail ? 'Rally C stopped below A. A lower high is a warning, not yet a signal. Watch low B.' : 'Rally C made a new high above A, then turned down. Watch low B.';
          else read.textContent = 'The price closed below low B.';
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- retracement levels ---------- */
  const SETS = {
    thirds: { label: 'Thirds', levels: [1 / 3, 1 / 2, 2 / 3] },
    fib: { label: 'Fibonacci', levels: [0.382, 0.5, 0.618] },
  };
  V.retracement = function (host, p, ctx) {
    const A = 40,
      B = 60,
      up = TA.path([[0, A], [40, B]], 41, { seed: 5, noise: 0.004 });
    let set = 'thirds',
      depth = 50,
      reveal = 1,
      cancel = null;
    up[0] = A;
    up[40] = B;
    const sg = seg({ label: 'Levels', options: Object.keys(SETS).map((k) => ({ v: k, label: SETS[k].label })), value: set, onChange: (v) => ((set = v), paint()) });
    const sl = slider({ id: ctx.key + '-d', label: 'Pullback depth', min: 5, max: 95, step: 1, value: depth, fmt: (v) => v + '% of the rise', onInput: (v) => ((depth = v), (reveal = 1), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, sl.el, h('div', { class: 'legend' }, lg('var(--gain)', 'Shallow'), lg('var(--accent)', 'Normal: a third to two-thirds'), lg('var(--loss)', 'Deep: trend in doubt')), read);
    const pull = () => {
      const target = B - (depth / 100) * (B - A),
        r = SS.rng(9);
      return Array.from({ length: 23 }, (_, t) => {
        const f = ease.inOut(t / 22);
        return t === 0 || t === 22 ? (t ? target : B) : B + (target - B) * f + (r() - 0.5) * 0.5;
      });
    };
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 240 : 280),
      pad: { l: 44, r: 70, t: 12, b: 24 },
      label: 'A rise from $40 to $60 and a pullback, with retracement levels',
      draw(P) {
        const C = pal(),
          pb = pull(),
          k = Math.round(22 * reveal),
          lv = [0, ...SETS[set].levels, 1];
        P.domain(0, 64, A - 2, B + 2);
        P.grid({ xTicks: [0, 20, 40, 62], xf: (v) => 'D' + (v + 1), yf: (v) => '$' + Math.round(v) });
        const y = (f) => B - f * (B - A);
        P.rect(40, y(1 / 3), 64, B, alpha(C.gain, 0.07));
        P.rect(40, y(2 / 3), 64, y(1 / 3), alpha(C.accent, 0.09));
        P.rect(40, A, 64, y(2 / 3), alpha(C.loss, 0.07));
        SS.PV.drawLevels(
          P,
          lv.map((f) => ({ name: Math.round(f * 1000) / 10 + '%', v: y(f), color: f === 0.5 ? C.accent : f === 0 || f === 1 ? C.muted : C.ink, dash: f === 0.5 ? null : [4, 4], width: f === 0.5 ? 1.75 : 1.25 })),
          { x0: 0, x1: 64 }
        );
        P.line(up.map((v, t) => [t, v]), { color: C.ink, width: 2.25 });
        P.line(pb.slice(0, k + 1).map((v, t) => [40 + t, v]), { color: C.ink, width: 2.25 });
        P.dot(40 + k, pb[k], { color: depth < 33.4 ? C.gain : depth <= 66.7 ? C.accent : C.loss, r: 5 });
      },
    });
    function paint() {
      plot.render();
      const target = B - (depth / 100) * (B - A),
        near = SETS[set].levels.find((f) => Math.abs(f * 100 - depth) <= 2),
        zone = depth < 33.4 ? 'Shallow: buyers stepped in early. Shallow pullbacks are typical of strong trends.' : depth <= 66.7 ? 'Inside the normal zone of a third to two-thirds. Most corrections in a healthy trend end somewhere in here.' : 'Deeper than two-thirds: the trend is in doubt. If the price keeps falling, the next marker is 100%, the start of the move at $40.';
      read.innerHTML = `A pullback to <b>${usd(target)}</b> gives back ${depth}% of the rise from $40 to $60${near ? `, right at the ${Math.round(near * 1000) / 10}% level` : ''}. ${zone}`;
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(1800, (k) => {
          reveal = ease.out(k);
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- the fan principle ---------- */
  // Pullback lows on days 16, 40 and 66 anchor fan lines 1, 2 and 3; the rally after the third low makes a lower high.
  const FAN = [[0, 50], [12, 60], [16, 57.5], [30, 71], [40, 63.5], [55, 75], [66, 68.5], [78, 74], [95, 66], [110, 60], [119, 57]];
  V.fanLines = function (host, p, ctx) {
    const n = 120,
      bars = TA.bars(TA.path(FAN, n, { seed: 4, noise: 0.003 }), { seed: 4, wick: 0.004 }),
      c = TA.closes(bars),
      lowIn = (a, b) => {
        let j = a;
        for (let t = a; t <= b; t++) if (c[t] < c[j]) j = t;
        return j;
      },
      lines = [];
    // Each line runs from the starting low through the next reaction low; it breaks on the first close below it.
    [[13, 20], [35, 46], [60, 72]].forEach(([a, b]) => {
      const L = lowIn(a, b),
        slope = (c[L] - c[0]) / L,
        at = (t) => c[0] + slope * t,
        brk = c.findIndex((v, t) => t > L + 2 && v < at(t) - 0.05);
      lines.push({ L, at, brk });
    });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, holder, h('div', { class: 'legend' }, lg('var(--accent)', 'Fan lines 1, 2 and 3, from the same start')), read, h('p', { class: 'fine' }, 'Simulated prices.'));
    const chart = TA.chart(holder, ctx, {
      bars,
      type: 'line',
      ms: 6000,
      playFrom: 5,
      pad: { l: 44 },
      yRange: [Math.min(...c) - 2, Math.max(...c) + 3],
      label: 'An uptrend, three fan lines and the reversal',
      over(P, C, i) {
        lines.forEach((ln, j) => {
          if (i <= ln.L + 2) return;
          const end = ln.brk > 0 && i > ln.brk ? ln.brk + 6 : Math.min(n - 1, i + 4);
          P.line([[0, c[0]], [end, ln.at(end)]], { color: C.accent, width: 1.75, alpha: ln.brk > 0 && i > ln.brk ? 0.45 : 1 });
          P.text(String(j + 1), P.X(ln.L), P.Y(ln.at(ln.L)) + 13, { color: C.accent, weight: 700, size: 11 });
          if (ln.brk > 0 && i > ln.brk) P.dot(ln.brk, c[ln.brk], { color: j === 2 ? C.loss : C.warn, r: 4 });
        });
        const last = lines[2];
        if (last.brk > 0 && i > last.brk) P.tag('Line 3 broken', P.X(last.brk), P.Y(c[last.brk]), { bg: C.loss, align: 'left', dy: -34, size: 10.5 });
      },
      onIndex(i) {
        const k = i - 1,
          [l1, l2, l3] = lines;
        if (i >= n) read.innerHTML = `Three lines from the same starting point, each flatter than the last. The first two breaks were warnings, not the end: after each one, the price rallied again. The third break, on day ${l3.brk + 1} at ${usd(c[l3.brk])}, marked the turn: the price fell to ${usd(c[n - 1])}.`;
        else if (k <= l1.L + 2) read.textContent = 'A steep uptrend starts from the low on day 1.';
        else if (k < l1.brk) read.textContent = 'Line 1 runs from the start through the first pullback low.';
        else if (k <= l2.L + 2) read.textContent = 'Line 1 broke. That’s a warning, not yet the end. Wait for the next low.';
        else if (k < l2.brk) read.textContent = 'Line 2: from the same start through the new low. It is flatter than line 1.';
        else if (k <= l3.L + 2) read.textContent = 'Line 2 broke too. One more line to draw.';
        else if (k < l3.brk) read.textContent = 'Line 3, flatter again. The rally stalls below the last high.';
        else read.textContent = 'The third fan line broke: under the fan principle, the uptrend has likely reversed.';
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };
})();
