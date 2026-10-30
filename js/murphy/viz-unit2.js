/* Technical Analysis in Depth, Unit 2 visuals: reversal and continuation patterns with volume and targets, a key
   reversal day forming during the session, the measured move, and the four kinds of gaps. */
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
  const smooth = (xs, w) =>
    xs.map((_, i) => {
      const k = Math.min((w - 1) / 2, i, xs.length - 1 - i);
      let s = 0;
      for (let j = i - k; j <= i + k; j++) s += xs[j];
      return s / (2 * k + 1);
    });
  const argExt = (xs, a, b, f) => {
    let j = a;
    for (let t = a; t <= b; t++) if (f(xs[t], xs[j])) j = t;
    return j;
  };
  const through = (x0, y0, x1, y1) => (t) => y0 + ((y1 - y0) * (t - x0)) / (x1 - x0);
  const storyAt = (story, k) => story.filter(([t]) => k >= t).pop()[1];

  /* ---------- reversal and continuation patterns ---------- */
  // Each pattern: anchors for the closes, a volume shape, and build(bars) returning its lines, the line whose break
  // completes it, a target, and the story told during the replay.
  const PATTERNS = {
    reversal: {
      triple: {
        label: 'Triple top',
        n: 110,
        seed: 31,
        a: [[0, 40], [20, 52], [28, 48], [38, 52.2], [46, 48.2], [56, 51.9], [64, 48.3], [68, 47.4], [74, 45.6], [90, 42.5], [109, 41]],
        vol: (i) => (i < 26 ? 1.2 : i < 44 ? 0.95 : i < 63 ? 0.7 : i < 70 ? 1.9 : 1.2),
        build(b) {
          const H = b.map((x) => x.h),
            L = b.map((x) => x.l),
            peaks = [[14, 26], [32, 44], [50, 62]].map(([a, z]) => argExt(H, a, z, (x, y) => x > y)),
            res = peaks.reduce((s, j) => s + H[j], 0) / 3,
            sup = Math.min(...L.slice(peaks[0], peaks[2])),
            from = peaks[0];
          return {
            lines: [
              { at: () => res, x0: from - 2, x1: peaks[2] + 4, show: peaks[1] + 2 },
              { at: () => sup, x0: from + 4, x1: 109, show: peaks[1] + 2, trig: true },
            ],
            trig: { at: () => sup, dir: -1, from: peaks[2] + 1 },
            target: sup - (res - sup),
            marks: peaks.map((j, k) => [j, H[j], String(k + 1)]),
            story: (brk) => [
              [0, 'An uptrend climbs to a high near $52.'],
              [peaks[0] + 3, 'A pullback, then a second rally stops at the same ceiling.'],
              [peaks[1] + 3, 'A third rally, on lighter volume, fails at the ceiling again. Still not a top until the floor breaks.'],
              [brk, 'The price closes below the floor between the peaks: the triple top is complete.'],
            ],
            final: (x) => `Three peaks near ${usd(res)}, with a floor at ${usd(sup)}. The close below the floor on day ${x.brk + 1} completed the triple top. The usual target is the pattern’s height (${usd(res - sup)}) measured down from the floor: ${usd(x.target)}. Here the price fell to ${usd(x.low)}. Notice the volume: lighter at each peak, heavier on the break.`,
          };
        },
      },
      rounding: {
        label: 'Rounding bottom',
        n: 120,
        seed: 33,
        a: [[0, 60], [12, 55], [22, 51.5], [35, 47], [50, 44.2], [62, 43.5], [75, 44.4], [88, 47], [98, 50.5], [104, 52.8], [119, 58]],
        vol: (i) => (i < 22 ? 1.3 : i > 102 ? 1.7 : 0.45 + 1.0 * Math.pow((i - 62) / 40, 2)),
        build(b) {
          const c = b.map((x) => x.c),
            rim = Math.max(...b.slice(20, 25).map((x) => x.h)),
            bowl = smooth(c, 21);
          return {
            lines: [{ at: () => rim, x0: 20, x1: 119, show: 21, trig: true }],
            trig: { at: () => rim, dir: 1, from: 90 },
            target: null,
            extra(P, C, i) {
              const pts = [];
              for (let t = 24; t <= Math.min(i - 1, 100); t++) pts.push([t, bowl[t] - 1.2]);
              if (pts.length > 1) P.line(pts, { color: C.accent, width: 6, alpha: 0.22 });
            },
            story: (brk) => [
              [0, 'A downtrend slows down.'],
              [30, 'The decline flattens into a slow, bowl-shaped turn. Volume dries up too.'],
              [70, 'The price curls back up, and volume starts to grow.'],
              [brk, 'The price clears the left rim of the bowl: the rounding bottom is complete.'],
            ],
            final: (x) => `A slow turn from about ${usd(x.lowAll)} that took months, with volume tracing the same bowl. The close above the rim at ${usd(rim)} on day ${x.brk + 1} completed it. Rounding bottoms have no standard target; they reward patience rather than precision. Here the price reached ${usd(x.high)}.`,
          };
        },
      },
      vee: {
        label: 'V reversal',
        n: 100,
        seed: 35,
        a: [[0, 60], [46, 37.5], [49, 36.5], [53, 39], [60, 43], [72, 48], [99, 54]],
        vol: (i) => (i < 40 ? 1 + i / 80 : i < 54 ? 2.4 : 1.3),
        build(b) {
          const line = (t) => 61.8 - 0.489 * t,
            low = argExt(b.map((x) => x.l), 40, 60, (x, y) => x < y);
          return {
            lines: [{ at: line, x0: 0, x1: 50, show: 12, trig: true }],
            trig: { at: line, dir: 1, from: 46 },
            target: null,
            story: (brk) => [
              [0, 'A steep, steady decline. Each rally fails at the falling trendline.'],
              [44, 'Selling accelerates on heavy volume.'],
              [brk, 'A sudden turn: the price breaks the steep trendline on heavy volume. No base, no warning.'],
            ],
            final: (x) => `No base and no warning: the price turned at ${usd(b[low].l)} and broke the steep downtrend line on day ${x.brk + 1}. V reversals are among the hardest patterns to trade, because there is nothing to build first. The clues are a volume spike at the low, a key reversal day, or a sharp break of the trendline. Here the price climbed to ${usd(x.high)}.`,
          };
        },
      },
    },
    continuation: {
      fwedge: {
        label: 'Falling wedge',
        n: 110,
        seed: 41,
        a: [[0, 40], [30, 55.2], [36, 51.4], [42, 54], [48, 50.9], [54, 53], [60, 50.5], [65, 52.2], [69, 49.8], [74, 53.6], [90, 58], [109, 62]],
        vol: (i) => (i < 30 ? 1.2 : i < 72 ? 0.7 - (i - 30) / 200 : i < 77 ? 2 : 1.2),
        build(b) {
          const H = b.map((x) => x.h),
            L = b.map((x) => x.l),
            h1 = argExt(H, 27, 33, (x, y) => x > y),
            h2 = argExt(H, 62, 68, (x, y) => x > y),
            l1 = argExt(L, 33, 39, (x, y) => x < y),
            l2 = argExt(L, 66, 72, (x, y) => x < y),
            up = through(h1, H[h1], h2, H[h2]),
            lo = through(l1, L[l1], l2, L[l2]);
          return {
            lines: [
              { at: up, x0: h1, x1: 80, show: h2 + 1, trig: true },
              { at: lo, x0: l1, x1: 80, show: l2 + 1 },
            ],
            trig: { at: up, dir: 1, from: h2 + 1 },
            target: H[h1],
            story: (brk) => [
              [0, 'A strong uptrend.'],
              [h1 + 3, 'A pause: lower highs and lower lows, but the lows fall more slowly than the highs. The lines converge.'],
              [brk, 'The price breaks out above the upper line: the uptrend resumes.'],
            ],
            final: (x) => `Both lines sloped down, against the uptrend, and converged. The breakout on day ${x.brk + 1} resumed the trend. A common guide is that the move at least retraces to where the wedge began: ${usd(x.target)}. Here the price reached ${usd(x.high)}. Volume shrank inside the wedge and expanded on the breakout.`,
          };
        },
      },
      rwedge: {
        label: 'Rising wedge',
        n: 110,
        seed: 43,
        a: [[0, 60], [30, 44.8], [36, 48.6], [42, 46], [48, 49.1], [54, 47.1], [60, 49.7], [65, 47.8], [69, 50.2], [74, 46.4], [90, 42], [109, 38]],
        vol: (i) => (i < 30 ? 1.2 : i < 72 ? 0.7 - (i - 30) / 200 : i < 77 ? 2 : 1.2),
        build(b) {
          const H = b.map((x) => x.h),
            L = b.map((x) => x.l),
            l1 = argExt(L, 27, 33, (x, y) => x < y),
            l2 = argExt(L, 62, 68, (x, y) => x < y),
            h1 = argExt(H, 33, 39, (x, y) => x > y),
            h2 = argExt(H, 66, 72, (x, y) => x > y),
            lo = through(l1, L[l1], l2, L[l2]),
            up = through(h1, H[h1], h2, H[h2]);
          return {
            lines: [
              { at: lo, x0: l1, x1: 80, show: l2 + 1, trig: true },
              { at: up, x0: h1, x1: 80, show: h2 + 1 },
            ],
            trig: { at: lo, dir: -1, from: l2 + 1 },
            target: L[l1],
            story: (brk) => [
              [0, 'A strong downtrend.'],
              [l1 + 3, 'A bounce: higher highs and higher lows, but the highs rise more slowly than the lows. The lines converge.'],
              [brk, 'The price breaks below the lower line: the downtrend resumes.'],
            ],
            final: (x) => `Both lines sloped up, against the downtrend, and converged. The breakdown on day ${x.brk + 1} resumed the decline. A common guide is that the move at least retraces to where the wedge began: ${usd(x.target)}. Here the price fell to ${usd(x.low)}.`,
          };
        },
      },
      rect: {
        label: 'Rectangle',
        n: 110,
        seed: 45,
        a: [[0, 40], [25, 52], [32, 48.2], [40, 51.8], [48, 48.3], [56, 51.9], [64, 48.4], [72, 51.7], [76, 53.4], [95, 57.5], [109, 58.5]],
        vol: (i) => (i < 25 ? 1.2 : i < 74 ? 0.7 : i < 79 ? 2 : 1.2),
        build(b) {
          const top = Math.max(...b.slice(24, 74).map((x) => x.h)),
            bot = Math.min(...b.slice(30, 70).map((x) => x.l));
          return {
            lines: [
              { at: () => top, x0: 24, x1: 109, show: 42, trig: true },
              { at: () => bot, x0: 30, x1: 80, show: 50 },
            ],
            trig: { at: () => top, dir: 1, from: 70 },
            target: top + (top - bot),
            zone: [24, 74, bot, top],
            story: (brk) => [
              [0, 'A strong uptrend.'],
              [30, 'A pause: the price bounces between a flat ceiling and a flat floor.'],
              [brk, 'The price closes above the ceiling: the uptrend resumes.'],
            ],
            final: (x) => `A flat range between ${usd(bot)} and ${usd(top)}. The close above the ceiling on day ${x.brk + 1} resumed the uptrend. The usual target adds the rectangle’s height (${usd(top - bot)}) to the breakout: ${usd(x.target)}. Here the price reached ${usd(x.high)}.`,
          };
        },
      },
    },
  };
  V.chartPattern = function (host, p, ctx) {
    const set = PATTERNS[p.set || 'reversal'];
    let key = Object.keys(set)[0],
      chart = null;
    const sg = seg({ label: 'Pattern', options: Object.keys(set).map((k) => ({ v: k, label: set[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, h('div', { class: 'legend' }, lg('var(--accent)', 'The line that completes the pattern', true), lg('var(--muted)', 'Other pattern lines', true), lg('var(--warn)', 'Target', true)), read, h('p', { class: 'fine' }, 'Simulated daily prices. Patterns fail too; a target is a guide, not a promise.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const sp = set[key],
        bars = TA.bars(TA.path(sp.a, sp.n, { seed: sp.seed, noise: 0.004 }), { seed: sp.seed, wick: 0.005, volMul: sp.vol }),
        n = bars.length,
        c = TA.closes(bars),
        g = sp.build(bars),
        brk = c.findIndex((v, t) => t >= g.trig.from && g.trig.dir * (v - g.trig.at(t)) > 0.05),
        after = bars.slice(brk),
        x = { brk, target: g.target, high: Math.max(...after.map((b) => b.h)), low: Math.min(...after.map((b) => b.l)), lowAll: Math.min(...bars.map((b) => b.l)) },
        story = g.story(brk),
        lo = Math.min(...bars.map((b) => b.l), g.target == null ? Infinity : g.target),
        hi = Math.max(...bars.map((b) => b.h), g.target == null ? -Infinity : g.target),
        maxV = Math.max(...bars.map((b) => b.v));
      chart = TA.chart(holder, ctx, {
        bars,
        ms: 5500,
        playFrom: 8,
        pad: { l: 46 },
        yRange: [lo - (hi - lo) * 0.08, hi + (hi - lo) * 0.1],
        label: sp.label + ': a simulated example',
        under(P, C, i) {
          if (g.zone && i > g.zone[0] + 10) P.rect(g.zone[0], g.zone[2], Math.min(i - 1, g.zone[1]), g.zone[3], alpha(C.accent, 0.07));
          if (g.extra) g.extra(P, C, i);
        },
        over(P, C, i) {
          g.lines.forEach((ln) => {
            if (i <= ln.show) return;
            const x1 = ln.trig && brk > 0 && i > brk ? Math.max(ln.x1, brk + 4) : ln.x1;
            P.line([[ln.x0, ln.at(ln.x0)], [x1, ln.at(x1)]], { color: ln.trig ? C.accent : C.muted, width: ln.trig ? 1.75 : 1.25, dash: [5, 4] });
          });
          (g.marks || []).forEach(([t, v, s]) => {
            if (i > t + 2) P.text(s, P.X(t), P.Y(v) - 10, { color: C.ink, weight: 700, size: 10 });
          });
          if (brk > 0 && i > brk) {
            P.dot(brk, c[brk], { color: g.trig.dir > 0 ? C.gain : C.loss, r: 4.5 });
            // The level helper puts the label on a backing box, so it stays readable over the candles.
            if (g.target != null) SS.PV.drawLevels(P, [{ name: 'Target', v: g.target, color: C.warn, dash: [2, 4], width: 1.5 }], { x0: brk, x1: n - 1 });
          }
        },
        lower: {
          height: 56,
          label: 'Volume',
          range: [0, maxV * 1.1],
          yTicks: [],
          draw: (P, C, i) => TA.drawVolume(P, bars, i, { color: (j) => (j === brk ? C.accent : null) }),
        },
        onIndex(i) {
          read.innerHTML = i >= n ? g.final(x) : storyAt(story, i - 1);
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- a key reversal day, forming during the session ---------- */
  V.keyReversal = function (host, p, ctx) {
    let side = 'top',
      prog = 1,
      cancel = null,
      data = null;
    const sg = seg({ label: 'Where', options: [{ v: 'top', label: 'At a top' }, { v: 'bottom', label: 'At a bottom' }], value: side, onChange: (v) => ((side = v), (data = make()), run()) });
    const el1 = h('div', { class: 'plot' }),
      el2 = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => run() }, 'Replay');
    stack(host, sg.el, el1, el2, h('div', { class: 'ctl-row' }, btn), h('div', { class: 'legend' }, lg('var(--muted)', 'The previous day’s high and low', true)), read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    const K = 28,
      AFTER = 10;
    function make() {
      const up = side === 'top',
        pre = TA.bars(TA.path(up ? [[0, 50], [K - 1, 62]] : [[0, 62], [K - 1, 50]], K, { seed: 6, noise: 0.006 }), { seed: 6, wick: 0.006 }),
        prev = pre[K - 1],
        rng = prev.h - prev.l,
        avgV = pre.reduce((s, b) => s + b.v, 0) / K;
      // The key day: opens beyond yesterday’s extreme, pushes further, then reverses through yesterday’s other extreme.
      const o = up ? prev.h + rng * 0.25 : prev.l - rng * 0.25,
        ext = up ? o + rng * 0.9 : o - rng * 0.9,
        far = up ? prev.l - rng * 0.55 : prev.h + rng * 0.55,
        cl = up ? prev.l - rng * 0.35 : prev.h + rng * 0.35,
        key = { o, h: up ? ext : far, l: up ? far : ext, c: cl, v: avgV * 2.6 },
        post = TA.bars(TA.path(up ? [[0, cl - 0.3], [AFTER - 1, cl - 4.5]] : [[0, cl + 0.3], [AFTER - 1, cl + 4.5]], AFTER, { seed: 7, noise: 0.006 }), { seed: 7, wick: 0.006 });
      post[0].o = cl;
      post[0].h = Math.max(post[0].h, post[0].o, post[0].c);
      post[0].l = Math.min(post[0].l, post[0].o, post[0].c);
      // The session path for the animation: open, push to the extreme, then reverse to the far side and settle.
      const path = [o, (o + ext) / 2, ext, (ext + far) / 2, far, cl];
      return { up, pre, prev, key, post, path, bars: pre.concat([key], post), avgV };
    }
    data = make();
    const n = K + 1 + AFTER;
    // prog runs 0..3: 0–1 reveals the run-up, 1–2 forms the key day, 2–3 reveals the days after.
    const formed = () => {
      const u = clamp01(prog - 1),
        seg5 = Math.min(4, Math.floor(u * 5)),
        f = u * 5 - seg5,
        pts = data.path.slice(0, seg5 + 1),
        cur = data.path[seg5] + (data.path[seg5 + 1] - data.path[seg5]) * f;
      return { cur, hi: Math.max(...pts, cur), lo: Math.min(...pts, cur), u };
    };
    const p1 = new Plot(el1, {
      height: (w) => (w < 480 ? 220 : 260),
      pad: { l: 46, r: 72, t: 12, b: 8 },
      label: 'Daily candles with a key reversal day',
      draw(P) {
        const C = pal(),
          B = data.bars,
          lo = Math.min(...B.map((b) => b.l)),
          hi = Math.max(...B.map((b) => b.h)),
          upto = prog < 1 ? Math.max(4, Math.round(K * prog)) : K,
          after = prog > 2 ? Math.round(AFTER * clamp01(prog - 2)) : 0;
        P.domain(-0.8, n - 0.2, lo - (hi - lo) * 0.06, hi + (hi - lo) * 0.08);
        P.grid({ xTicks: [], yf: (v) => '$' + Math.round(v), noXLabels: true });
        TA.drawCandles(P, B, upto);
        if (prog >= 1) {
          SS.PV.drawLevels(
            P,
            [
              { name: 'Prior high', v: data.prev.h, color: C.muted, width: 1.25 },
              { name: 'Prior low', v: data.prev.l, color: C.muted, width: 1.25 },
            ],
            { x0: K - 1.5, x1: K + 1.5, values: false }
          );
          const F = formed(),
            done = prog >= 2,
            o = data.key.o,
            cur = done ? data.key.c : F.cur,
            hiS = done ? data.key.h : F.hi,
            loS = done ? data.key.l : F.lo,
            col = cur >= o ? C.gain : C.loss,
            x = P.X(K),
            bw = TA.candleWidth(P),
            cx = P.c;
          cx.save();
          cx.strokeStyle = col;
          cx.fillStyle = col;
          cx.lineWidth = 1.5;
          cx.beginPath();
          cx.moveTo(x, P.Y(hiS));
          cx.lineTo(x, P.Y(loS));
          cx.stroke();
          cx.fillRect(x - bw / 2, Math.min(P.Y(o), P.Y(cur)), bw, Math.max(1.5, Math.abs(P.Y(o) - P.Y(cur))));
          cx.restore();
          if (!done) P.dot(K, cur, { color: C.ink, r: 3 });
        }
        if (after) TA.drawCandles(P, B, K + 1 + after, { from: K + 1 });
      },
    });
    const p2 = new Plot(el2, {
      height: 54,
      pad: { l: 46, r: 72, t: 4, b: 6 },
      label: 'Volume',
      draw(P) {
        const C = pal(),
          B = data.bars,
          upto = prog < 1 ? Math.max(4, Math.round(K * prog)) : K,
          after = prog > 2 ? Math.round(AFTER * clamp01(prog - 2)) : 0;
        P.domain(-0.8, n - 0.2, 0, Math.max(...B.map((b) => b.v)) * 1.1);
        P.grid({ xTicks: [], yTicks: [], noXLabels: true, noYLabels: true });
        const w = (TA.candleWidth(P) / 2) / Math.abs(P.X(1) - P.X(0));
        B.forEach((b, j) => {
          const show = j < upto || (j === K && prog >= 1) || (j > K && j - K - 1 < after);
          if (!show) return;
          const v = j === K ? b.v * (prog >= 2 ? 1 : clamp01(prog - 1)) : b.v;
          P.rect(j - w, 0, j + w, v, j === K ? C.accent : alpha(b.c >= b.o ? C.gain : C.loss, 0.55));
        });
      },
    });
    function paint() {
      p1.render();
      p2.render();
      const d = data,
        F = formed();
      if (prog < 1) read.textContent = d.up ? 'An uptrend: higher highs day after day.' : 'A downtrend: lower lows day after day.';
      else if (prog < 2) {
        const beyond = d.up ? F.cur < d.prev.l : F.cur > d.prev.h;
        read.textContent = F.u < 0.45 ? (d.up ? `The day opens at ${usd(d.key.o)}, above yesterday’s high, and pushes to a new high for the move.` : `The day opens at ${usd(d.key.o)}, below yesterday’s low, and pushes to a new low for the move.`) : beyond ? (d.up ? 'Now it is below yesterday’s low. The buyers who chased the open are trapped.' : 'Now it is above yesterday’s high. The sellers who chased the open are trapped.') : 'The move fades and reverses through yesterday’s whole range.';
      } else {
        const vx = (d.key.v / d.avgV).toFixed(1);
        read.innerHTML = d.up
          ? `A key reversal day: a new high at ${usd(d.key.h)}, then a close at ${usd(d.key.c)}, below yesterday’s low of ${usd(d.prev.l)}, on ${vx}× normal volume. Its range also covers all of yesterday’s, making it an outside day. ${prog > 2.2 ? 'In this example a decline followed. Not every key reversal marks a top; treat it as a clue and look for other evidence.' : ''}`
          : `A key reversal day: a new low at ${usd(d.key.l)}, then a close at ${usd(d.key.c)}, above yesterday’s high of ${usd(d.prev.h)}, on ${vx}× normal volume. Its range also covers all of yesterday’s, making it an outside day. ${prog > 2.2 ? 'In this example a rally followed. Not every key reversal marks a bottom; treat it as a clue and look for other evidence.' : ''}`;
      }
    }
    function run() {
      if (cancel) cancel();
      cancel = tween(7000, (k) => {
        prog = k < 0.3 ? (k / 0.3) * 1 : k < 0.75 ? 1 + (k - 0.3) / 0.45 : 2 + (k - 0.75) / 0.25;
        paint();
      });
    }
    prog = 3;
    paint();
    return { play: run, destroy: () => (cancel && cancel(), p1.destroy(), p2.destroy()) };
  };

  /* ---------- the measured move ---------- */
  V.measuredMove = function (host, p, ctx) {
    const A = 40,
      B = 55,
      L1 = 30,
      CORR = 14,
      L2 = 30,
      N = L1 + CORR + L2 + 1;
    let low = 50,
      prog = 1,
      cancel = null;
    const sl = slider({ id: ctx.key + '-c', label: 'Correction low', min: 46, max: 52, step: 0.5, value: low, fmt: (v) => `${usd(v)}, giving back ${Math.round(((B - v) / (B - A)) * 100)}%`, onInput: (v) => ((low = v), (prog = 1), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, sl.el, h('div', { class: 'legend' }, lg('var(--accent)', 'Leg 1, and the same length projected from the low'), lg('var(--warn)', 'Target', true)), read, h('p', { class: 'fine' }, 'Simulated prices. In this example the second leg comes close to the target; real ones often fall short or overshoot.'));
    const path = () => {
      const D = low + (B - A),
        r = SS.rng(3),
        wob = (t) => 0.45 * Math.sin(t * 0.8) + (r() - 0.5) * 0.4;
      return Array.from({ length: N }, (_, t) => {
        if (t === 0) return A;
        if (t <= L1) return A + (B - A) * (t / L1) + (t === L1 ? 0 : wob(t));
        if (t <= L1 + CORR) return B + (low - B) * ease.inOut((t - L1) / CORR) + (t === L1 + CORR ? 0 : wob(t) * 0.6);
        return low + (D * 0.985 - low) * ((t - L1 - CORR) / L2) + (t === N - 1 ? 0 : wob(t));
      });
    };
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 240 : 280),
      pad: { l: 44, r: 12, t: 12, b: 24 },
      label: 'A measured move: leg 1, a correction, and leg 2 projected to equal leg 1',
      draw(P) {
        const C = pal(),
          px = path(),
          D = low + (B - A),
          cIdx = L1 + CORR,
          shownTo = prog < 0.45 ? Math.round(cIdx * (prog / 0.45)) : prog < 0.65 ? cIdx : cIdx + Math.round(L2 * ((prog - 0.65) / 0.35)),
          grow = clamp01((prog - 0.45) / 0.2);
        P.domain(-4, N + 2, A - 3, 70);
        P.grid({ xTicks: [0, 30, 44, 74], xf: (v) => 'D' + (v + 1), yf: (v) => '$' + Math.round(v) });
        P.rect(-3, A, -1, B, alpha(C.accent, 0.35));
        P.text('Leg 1', P.X(-2), P.Y(B) - 9, { color: C.accent, size: 9.5, weight: 700 });
        P.text('+' + usd(B - A, 0), P.X(-2) + 4, P.Y((A + B) / 2), { align: 'left', color: C.accent, size: 9.5 });
        if (grow > 0) {
          P.rect(cIdx - 1, low, cIdx + 1, low + (D - low) * ease.out(grow), alpha(C.accent, 0.35));
          P.line([[cIdx, D], [N + 2, D]], { color: C.warn, width: 1.5, dash: [3, 4], alpha: grow });
          if (grow >= 1) P.text('Target ' + usd(D), P.X(cIdx) + 6, P.Y(D) - 9, { align: 'left', color: C.warn, size: 9.5 });
        }
        P.line(px.slice(0, shownTo + 1).map((v, t) => [t, v]), { color: C.ink, width: 2.25 });
        [[0, A, 'A', 12], [L1, B, 'B', -10], [cIdx, low, 'C', 12]].forEach(([t, v, sLabel, dy]) => {
          if (shownTo >= t) P.text(sLabel, P.X(t), P.Y(v) + dy, { color: C.ink, weight: 700, size: 11 });
        });
      },
    });
    function paint() {
      plot.render();
      const D = low + (B - A);
      read.innerHTML = `Leg 1: ${usd(A, 0)} → ${usd(B, 0)}, a rise of ${usd(B - A, 0)}. The correction gave back ${Math.round(((B - low) / (B - A)) * 100)}%, to ${usd(low)}. Measured-move target: ${usd(low)} + ${usd(B - A, 0)} = <b>${usd(D)}</b>. ${low < 47.5 ? 'A deep correction like this one weakens the case for a full second leg.' : 'A correction of a third to a half is the classic setup.'}`;
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(5200, (k) => {
          prog = k;
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- the four kinds of gaps ---------- */
  const GAPPATH = [[0, 50], [15, 51.2], [25, 49.3], [33, 50.8], [40, 50.2], [41, 53.6], [52, 56.5], [60, 59.5], [64, 60.6], [65, 63], [80, 67.5], [95, 70.5], [110, 73.2], [111, 75.8], [113, 76.6], [116, 75.5], [117, 72.4], [130, 68.5], [145, 66], [159, 64.5]];
  const GAPS = [
    { t: 41, dir: 1, name: 'Breakaway' },
    { t: 65, dir: 1, name: 'Runaway' },
    { t: 111, dir: 1, name: 'Exhaustion' },
    { t: 117, dir: -1, name: 'Island' },
  ];
  V.gapStory = function (host, p, ctx) {
    const n = 160,
      vol = (i) => (i === 41 ? 3 : i > 41 && i < 45 ? 1.8 : i === 65 ? 2.2 : i === 111 ? 2.6 : i === 117 ? 2.8 : i < 41 ? 0.8 : i > 111 && i < 117 ? 1.5 : 1.1),
      bars = TA.bars(TA.path(GAPPATH, n, { seed: 51, noise: 0.004 }), { seed: 51, wick: 0.004, volMul: vol });
    // Open each gap bar beyond the previous bar's range, so the empty space shows on the chart.
    const zones = GAPS.map((g) => {
      const pb = bars[g.t - 1],
        b = bars[g.t],
        gs = Math.abs(b.c - pb.c) * 0.45;
      if (g.dir > 0) {
        b.o = pb.h + gs;
        b.h = Math.max(b.h, b.o, b.c);
        b.l = Math.min(b.o, b.c) - gs * 0.15;
      } else {
        b.o = pb.l - gs;
        b.l = Math.min(b.l, b.o, b.c);
        b.h = Math.max(b.o, b.c) + gs * 0.15;
      }
      const lo = g.dir > 0 ? pb.h : b.h,
        hi = g.dir > 0 ? b.l : pb.l,
        fill = bars.findIndex((x, t) => t > g.t && (g.dir > 0 ? x.l <= lo : x.h >= hi));
      return { ...g, lo, hi, fill };
    });
    const run = zones[1],
      start = bars[40].h,
      mid = (run.lo + run.hi) / 2,
      target = mid + (mid - start),
      top = Math.max(...bars.map((b) => b.h)),
      maxV = Math.max(...bars.map((b) => b.v)),
      vx = (bars[41].v / (bars.slice(0, 40).reduce((s, b) => s + b.v, 0) / 40)).toFixed(1),
      ex = zones[2];
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, holder, h('div', { class: 'legend' }, lg('var(--accent)', 'Open gaps'), lg('var(--warn)', 'Measuring-gap target', true)), read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    const story = [
      [0, 'A quiet trading range. Small gaps in here would be common gaps, which mean little.'],
      [41, `A breakaway gap: the price leaps out of the range on ${vx}× normal volume, and the gap stays open.`],
      [65, `A runaway gap in the middle of the trend. Measuring from the start of the move to this gap and adding the same distance again projects about ${usd(target)}.`],
      [111, 'An exhaustion gap after a long rise. The last eager buyers rush in, but the price stalls.'],
      [117, 'A gap down leaves the last few days stranded, cut off by gaps on both sides: an island reversal.'],
    ];
    const chart = TA.chart(holder, ctx, {
      bars,
      ms: 7000,
      playFrom: 10,
      pad: { l: 46 },
      label: 'A simulated trend with breakaway, runaway and exhaustion gaps, and an island reversal',
      under(P, C, i) {
        zones.forEach((z) => {
          if (i <= z.t) return;
          const end = z.fill > 0 && i > z.fill ? z.fill : i - 1;
          P.rect(z.t - 1, z.lo, end, z.hi, alpha(C.accent, z.fill > 0 && i > z.fill ? 0.12 : 0.28));
        });
        if (i > run.t + 2) {
          P.line([[run.t, target], [Math.min(i - 1, 140), target]], { color: C.warn, width: 1.5, dash: [3, 4] });
          // Left end, above the line: the price there is still well below the target.
          P.text('Target ' + usd(target), P.X(run.t) - 30, P.Y(target) - 9, { align: 'left', color: C.warn, size: 9.5 });
        }
      },
      over(P, C, i) {
        zones.forEach((z) => {
          if (i <= z.t) return;
          const b = bars[z.t];
          if (z.name === 'Exhaustion') P.tag(z.name, P.X(z.t), P.Y(b.h), { bg: C.warn, align: 'right', dy: -34, size: 10.5 });
          else if (z.name === 'Island') P.tag(z.name, P.X(z.t), P.Y(b.h), { bg: C.loss, align: 'left', dy: -34, size: 10.5 });
          else P.tag(z.name, P.X(z.t), P.Y(b.l), { bg: C.accent, align: 'left', dy: 12, size: 10.5 });
        });
      },
      lower: {
        height: 56,
        label: 'Volume',
        range: [0, maxV * 1.1],
        yTicks: [],
        draw: (P, C, i) => TA.drawVolume(P, bars, i, { color: (j) => (GAPS.some((g) => g.t === j) ? C.accent : null) }),
      },
      onIndex(i) {
        read.innerHTML = i >= n ? `Breakaway gap on day ${GAPS[0].t + 1}, runaway gap on day ${GAPS[1].t + 1}, exhaustion gap on day ${GAPS[2].t + 1}, and the island reversal on day ${GAPS[3].t + 1}. The measuring gap projected ${usd(target)}; the top came at ${usd(top)}. The breakaway and runaway gaps stayed open, while the exhaustion gap was filled ${ex.fill - ex.t} days later.` : storyAt(story, i - 1);
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };
})();
