/* Technical Analysis in Depth, Unit 4 visuals: a point and figure chart built from daily prices, the Elliott wave
   pattern with waves inside waves, a checker for Elliott’s three rules, and time cycles with translation. */
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

  /* ---------- point and figure ---------- */
  const PNF = [[0, 50], [15, 56], [25, 52], [40, 60], [50, 57], [62, 64], [72, 59], [80, 61], [95, 54], [105, 57], [118, 51], [130, 53], [145, 47], [159, 50]];
  /** Close-only point and figure: columns of boxes, each box remembering the day it was filled. */
  function pnf(c, box, rev) {
    const cols = [],
      base = Math.round(c[0] / box);
    let col = null;
    const fill = (k, from, to, t) => {
      const step = from <= to ? 1 : -1;
      for (let b = from; step > 0 ? b <= to : b >= to; b += step) k.boxes.push({ b, t });
    };
    c.forEach((v, t) => {
      const up = Math.floor(v / box + 1e-9),
        dn = Math.ceil(v / box - 1e-9);
      if (!col) {
        if (up >= base + 1) (col = { dir: 1, lo: base, hi: up, boxes: [] }), fill(col, base, up, t), cols.push(col);
        else if (dn <= base - 1) (col = { dir: -1, hi: base, lo: dn, boxes: [] }), fill(col, base, dn, t), cols.push(col);
        return;
      }
      if (col.dir > 0) {
        if (up > col.hi) fill(col, col.hi + 1, up, t), (col.hi = up);
        else if (dn <= col.hi - rev) (col = { dir: -1, hi: col.hi - 1, lo: dn, boxes: [] }), fill(col, col.hi, dn, t), cols.push(col);
      } else if (dn < col.lo) fill(col, col.lo - 1, dn, t), (col.lo = dn);
      else if (up >= col.lo + rev) (col = { dir: 1, lo: col.lo + 1, hi: up, boxes: [] }), fill(col, col.lo, up, t), cols.push(col);
    });
    // Double top (buy) and double bottom (sell): the first box beyond the previous column of the same kind.
    const sig = [];
    cols.forEach((k, j) => {
      const prev = cols[j - 2];
      if (!prev) return;
      const b = k.dir > 0 ? prev.hi + 1 : prev.lo - 1,
        hit = k.boxes.find((x) => x.b === b);
      if (hit) sig.push({ col: j, b, t: hit.t, dir: k.dir });
    });
    return { cols, sig };
  }
  const BOXES = [0.5, 1, 2];
  V.pnfBuild = function (host, p, ctx) {
    const c = TA.path(PNF, 160, { seed: 71, noise: 0.015 }),
      n = c.length;
    let box = 1,
      rev = 3,
      cur = n - 1,
      cancel = null,
      res = pnf(c, box, rev);
    const redo = () => ((res = pnf(c, box, rev)), (cur = n - 1), paint());
    const sgBox = seg({ label: 'Box size', options: BOXES.map((b) => ({ v: String(b), label: usd(b, b < 1 ? 2 : 0) + ' boxes' })), value: '1', onChange: (v) => ((box = +v), redo()) });
    const sgRev = seg({ label: 'Reversal', options: [1, 2, 3].map((r) => ({ v: String(r), label: r + '-box reversal' })), value: '3', onChange: (v) => ((rev = +v), redo()) });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Replay');
    const el1 = h('div', { class: 'plot' }),
      el2 = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sgBox.el, sgRev.el, h('p', { class: 'plot-h' }, 'Daily closes'), el1, h('p', { class: 'plot-h' }, 'The same prices as point and figure: one column per move, no time axis'), el2, h('div', { class: 'ctl-row' }, btn), h('div', { class: 'legend' }, lg('var(--gain)', 'X: rising'), lg('var(--loss)', 'O: falling'), ...(p.signals ? [lg('var(--accent)', 'Signal box')] : [])), read, h('p', { class: 'fine' }, 'Simulated daily closes.'));
    const p1 = new Plot(el1, {
      height: 120,
      pad: { l: 44, r: 18, t: 8, b: 20 },
      label: 'Daily closes',
      draw(P) {
        const C = pal();
        P.domain(0, n - 1, Math.min(...c) - 1, Math.max(...c) + 1);
        P.grid({ xTicks: [0, 40, 80, 120, 159], xf: (v) => 'D' + (v + 1), yf: (v) => '$' + Math.round(v) });
        P.line(c.slice(0, cur + 1).map((v, t) => [t, v]), { color: C.ink, width: 1.75 });
        P.dot(cur, c[cur], { color: C.accent, r: 3.5 });
      },
    });
    const p2 = new Plot(el2, {
      height: (w) => (w < 480 ? 240 : 280),
      pad: { l: 44, r: 10, t: 8, b: 12 },
      label: 'Point and figure chart',
      draw(P) {
        const C = pal(),
          { cols, sig } = res,
          all = cols.flatMap((k) => k.boxes.map((x) => x.b)),
          bmin = Math.min(...all),
          bmax = Math.max(...all),
          nc = Math.max(cols.length, 10),
          cx = P.c;
        P.domain(-0.6, nc - 0.4, bmin - 0.7, bmax + 0.7);
        const step = Math.max(1, Math.ceil((bmax - bmin) / 8));
        const yt = [];
        for (let b = Math.ceil(bmin / step) * step; b <= bmax; b += step) yt.push(b);
        P.grid({ xTicks: [], yTicks: yt, yf: (v) => usd(v * box, box < 1 ? 1 : 0), noXLabels: true });
        const cw = Math.abs(P.X(1) - P.X(0)),
          ch = Math.abs(P.Y(1) - P.Y(0)),
          r = Math.max(1.5, Math.min(cw, ch) * 0.34);
        cx.save();
        cx.lineWidth = Math.max(1, Math.min(2, r / 3));
        cols.forEach((k, j) =>
          k.boxes.forEach(({ b, t }) => {
            if (t > cur) return;
            const x = P.X(j),
              y = P.Y(b);
            cx.beginPath();
            if (k.dir > 0) {
              cx.strokeStyle = C.gain;
              cx.moveTo(x - r, y - r);
              cx.lineTo(x + r, y + r);
              cx.moveTo(x + r, y - r);
              cx.lineTo(x - r, y + r);
            } else {
              cx.strokeStyle = C.loss;
              cx.arc(x, y, r, 0, Math.PI * 2);
            }
            cx.stroke();
          })
        );
        cx.restore();
        if (p.signals)
          sig.forEach((s) => {
            if (s.t > cur) return;
            P.rect(s.col - 0.48, s.b - 0.48, s.col + 0.48, s.b + 0.48, alpha(C.accent, 0.3));
            // To the left: the column before a signal never reaches the signal box's level, so that spot is empty.
            P.text(s.dir > 0 ? 'Buy' : 'Sell', P.X(s.col) - cw * 0.55, P.Y(s.b), { align: 'right', color: s.dir > 0 ? C.gain : C.loss, weight: 700, size: 9.5 });
          });
      },
    });
    function paint() {
      p1.render();
      p2.render();
      const { cols, sig } = res,
        live = cols.filter((k) => k.boxes[0].t <= cur),
        k = live[live.length - 1],
        R = usd(rev * box, box < 1 ? 2 : 0);
      if (cur >= n - 1) {
        const seen = sig.length,
          buys = sig.filter((s) => s.dir > 0).length;
        read.innerHTML = `${n} days of prices became <b>${cols.length} columns</b>. Any move of less than ${R} against the current column never showed up.` + (p.signals ? ` The chart gave ${buys} buy and ${seen - buys} sell signal${seen - buys === 1 ? '' : 's'}. ${box >= 2 ? 'Bigger boxes mean fewer, later signals.' : box < 1 || rev < 3 ? 'Small boxes and short reversals mean more signals, and more false ones.' : ''}` : box < 1 && rev === 1 ? ' All the noise is back. Compare with $1 boxes and a 3-box reversal.' : ' Try $0.50 boxes with a 1-box reversal to see the noise come back.');
      } else read.textContent = `Day ${cur + 1}: ${usd(c[cur])}. ${k ? `Column ${live.length}: ${k.dir > 0 ? 'Xs while the price rises' : 'Os while the price falls'}.` : 'Waiting for the first move of one box.'} A new column needs a ${R} reversal.`;
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(6500, (k) => {
        cur = Math.max(1, Math.round((n - 1) * k));
        paint();
      });
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), p1.destroy(), p2.destroy()) };
  };

  /* ---------- the Elliott wave pattern ---------- */
  // Wave 2 retraces 61.8% of wave 1, wave 3 is 1.618 × wave 1, wave 4 retraces 38.2% of wave 3, wave 5 equals wave 1.
  const EW = [[0, 100, ''], [10, 120, '1'], [16, 107.6, '2'], [34, 140, '3'], [42, 127.6, '4'], [54, 147.6, '5'], [62, 135, 'A'], [68, 142, 'B'], [80, 122, 'C']];
  const FIVE = [[0, 0], [0.18, 0.3], [0.28, 0.2], [0.62, 0.78], [0.74, 0.64], [1, 1]];
  const THREE = [[0, 0], [0.4, 0.62], [0.62, 0.38], [1, 1]];
  const SHAPE = [FIVE, THREE, FIVE, THREE, FIVE, FIVE, THREE, FIVE];
  const SUBS = ['i', 'ii', 'iii', 'iv', 'v'];
  V.elliottBuild = function (host, p, ctx) {
    // Fine points: each wave replaced by its own five or three smaller waves.
    const fine = [[EW[0][0], EW[0][1]]],
      sub3 = [];
    for (let s = 0; s < 8; s++) {
      const [x0, y0] = EW[s],
        [x1, y1] = EW[s + 1];
      SHAPE[s].slice(1).forEach(([tx, ty], j) => {
        fine.push([x0 + tx * (x1 - x0), y0 + ty * (y1 - y0)]);
        if (s === 2) sub3.push([fine[fine.length - 1], SUBS[j]]);
      });
    }
    const coarseAt = (x) => {
      for (let s = 0; s < 8; s++) if (x <= EW[s + 1][0]) return EW[s][1] + ((EW[s + 1][1] - EW[s][1]) * (x - EW[s][0])) / (EW[s + 1][0] - EW[s][0]);
      return EW[8][1];
    };
    let m = 1,
      reveal = 1,
      mode = 'fine',
      cancel = null;
    const sg = seg({ label: 'Zoom', options: [{ v: 'big', label: 'The big waves' }, { v: 'fine', label: 'Waves within waves' }], value: mode, onChange: (v) => morph(v) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, h('div', { class: 'legend' }, lg('var(--gain)', 'Impulse: five waves'), lg('var(--loss)', 'Correction: three waves')), read, h('p', { class: 'fine' }, 'An idealized example; real markets are far messier.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 250 : 290),
      pad: { l: 44, r: 12, t: 22, b: 12 },
      label: 'An Elliott wave cycle: five waves up and three down',
      draw(P) {
        const C = pal(),
          xr = 80 * reveal;
        P.domain(-1, 81, 94, 154);
        P.grid({ xTicks: [], yf: (v) => '$' + Math.round(v), noXLabels: true });
        P.rect(0, 94, 54, 154, alpha(C.gain, 0.06));
        P.rect(54, 94, 81, 154, alpha(C.loss, 0.06));
        P.text('Impulse', P.X(27), P.Y(154) - 10, { color: C.gain, weight: 700, size: 10 });
        P.text('Correction', P.X(67.5), P.Y(154) - 10, { color: C.loss, weight: 700, size: 10 });
        const pts = [];
        fine.forEach(([x, y], j) => {
          if (x > xr && j) {
            const [px0, py0] = fine[j - 1];
            if (px0 < xr) {
              const f = (xr - px0) / (x - px0),
                yy = py0 + (y - py0) * f;
              pts.push([xr, coarseAt(xr) + m * (yy - coarseAt(xr))]);
            }
            return;
          }
          pts.push([x, coarseAt(x) + m * (y - coarseAt(x))]);
        });
        P.line(pts, { color: C.ink, width: 2.25 });
        EW.slice(1).forEach(([x, y, s], j) => {
          if (x > xr) return;
          const top = ['1', '3', '5', 'B'].includes(s);
          P.text(s, P.X(x), P.Y(y) + (top ? -12 : 13), { color: ['A', 'B', 'C'].includes(s) ? C.loss : C.gain, weight: 700, size: 12 });
        });
        if (m > 0.6 && xr >= 34)
          sub3.slice(0, 4).forEach(([[x, y], s]) => {
            const yy = coarseAt(x) + m * (y - coarseAt(x)),
              up = s === 'i' || s === 'iii';
            P.text(s, P.X(x) + (up ? -8 : 8), P.Y(yy) + (up ? -4 : 6), { color: C.muted, size: 9, weight: 600 });
          });
      },
    });
    const TEXT = {
      big: 'Five waves with the trend (1 to 5), then three against it (A, B, C). Waves 1, 3 and 5 push; waves 2 and 4 correct. In this example, wave 2 gives back 61.8% of wave 1, wave 3 is 1.618 times as long as wave 1, and wave 4 gives back 38.2% of wave 3: classic Fibonacci relationships.',
      fine: 'Look closer and each wave is made of smaller waves with the same shape: the push waves split into five and the corrections into three. Inside wave 3, the smaller waves i to iv are labeled; the fifth one ends at the top of wave 3. Zoom out, and this whole cycle could be just wave 1 of something larger.',
    };
    function morph(v) {
      if (cancel) cancel();
      const m0 = m,
        m1 = v === 'fine' ? 1 : 0;
      mode = v;
      sg.set(v);
      read.textContent = TEXT[v];
      cancel = tween(900, (k) => ((m = m0 + (m1 - m0) * ease.inOut(k)), plot.render()));
    }
    plot.render();
    read.textContent = TEXT[mode];
    return {
      play() {
        if (cancel) cancel();
        m = 0;
        mode = 'big';
        sg.set('big');
        read.textContent = TEXT.big;
        cancel = tween(5200, (k) => {
          reveal = Math.max(0.02, ease.inOut(clamp01(k / 0.6)));
          m = ease.inOut(clamp01((k - 0.72) / 0.25));
          if (k > 0.72 && mode !== 'fine') (mode = 'fine'), sg.set('fine'), (read.textContent = TEXT.fine);
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- Elliott’s three rules ---------- */
  V.elliottRules = function (host, p, ctx) {
    const st = { r2: 62, k3: 162, r4: 38, k5: 100 };
    const sl = (key, label, min, max, fmt) => slider({ id: ctx.key + '-' + key, label, min, max, step: 1, value: st[key], fmt, onInput: (v) => ((st[key] = v), paint()) });
    const s2 = sl('r2', 'Wave 2 gives back', 20, 130, (v) => v + '% of wave 1'),
      s3 = sl('k3', 'Wave 3 length', 40, 260, (v) => (v / 100).toFixed(2) + '× wave 1'),
      s4 = sl('r4', 'Wave 4 gives back', 10, 90, (v) => v + '% of wave 3'),
      s5 = sl('k5', 'Wave 5 length', 40, 200, (v) => (v / 100).toFixed(2) + '× wave 1');
    const plotEl = h('div', { class: 'plot' });
    const checks = h('ul', { class: 'mu-rules' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, checks, s2.el, s3.el, s4.el, s5.el, read);
    const XS = [0, 10, 16, 34, 42, 54];
    const pts = () => {
      const L1 = 20,
        w0 = 100,
        w1 = 120,
        w2 = w1 - (st.r2 / 100) * L1,
        w3 = w2 + (st.k3 / 100) * L1,
        w4 = w3 - (st.r4 / 100) * (w3 - w2),
        w5 = w4 + (st.k5 / 100) * L1;
      return [w0, w1, w2, w3, w4, w5];
    };
    const rules = (w) => {
      const L1 = w[1] - w[0],
        L3 = w[3] - w[2],
        L5 = w[5] - w[4];
      return [
        { ok: w[2] > w[0], text: 'Wave 2 stays above the start of wave 1.' },
        { ok: L3 > Math.min(L1, L5), text: 'Wave 3 is not the shortest of waves 1, 3 and 5.' },
        { ok: w[4] > w[1], text: 'Wave 4 stays above the top of wave 1.' },
      ];
    };
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 220 : 260),
      pad: { l: 44, r: 12, t: 12, b: 12 },
      label: 'A five-wave pattern you can reshape',
      draw(P) {
        const C = pal(),
          w = pts(),
          R = rules(w),
          lo = Math.min(...w),
          hi = Math.max(...w);
        P.domain(-2, 58, lo - (hi - lo) * 0.12 - 2, hi + (hi - lo) * 0.12 + 2);
        P.grid({ xTicks: [], yf: (v) => '$' + Math.round(v), noXLabels: true });
        P.line([[0, w[0]], [58, w[0]]], { color: C.muted, width: 1, dash: [3, 4] });
        P.line([[10, w[1]], [58, w[1]]], { color: C.muted, width: 1, dash: [3, 4] });
        if (!R[0].ok) P.rect(10, w[2], 22, w[0], alpha(C.loss, 0.2));
        if (!R[2].ok) P.rect(36, w[4], 48, w[1], alpha(C.loss, 0.2));
        P.line(w.map((v, j) => [XS[j], v]), { color: R.every((r) => r.ok) ? C.gain : C.loss, width: 2.5 });
        w.forEach((v, j) => {
          P.dot(XS[j], v, { color: C.ink, r: 3 });
          if (j) P.text(String(j), P.X(XS[j]), P.Y(v) + (j % 2 ? -12 : 13), { color: C.ink, weight: 700, size: 12 });
        });
      },
    });
    function paint() {
      plot.render();
      const w = pts(),
        R = rules(w);
      checks.replaceChildren(...R.map((r) => h('li', { class: r.ok ? 'ok' : 'no' }, h('span', { class: 'mu-rule-i', 'aria-hidden': 'true' }, r.ok ? '✓' : '✗'), r.text)));
      const bad = R.filter((r) => !r.ok).length;
      read.innerHTML = bad ? `<b class="loss">${bad} rule${bad > 1 ? 's' : ''} broken.</b> This can’t be a valid 1-2-3-4-5. An Elliott analyst would count the waves differently, perhaps as a correction rather than an impulse.` : `<b class="gain">All three rules hold.</b> This shape can be counted as an impulse wave. Note that the rules only rule counts out; they can’t prove a count is right.`;
    }
    paint();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- time cycles and translation ---------- */
  const TRENDS = {
    down: { label: 'Downtrend', slope: -0.035, f: 0.32 },
    flat: { label: 'No trend', slope: 0, f: 0.5 },
    up: { label: 'Uptrend', slope: 0.035, f: 0.68 },
  };
  V.cycleBuild = function (host, p, ctx) {
    const n = 240,
      A = 3;
    let P0 = 40,
      tr = 'flat',
      reveal = 1,
      cancel = null;
    const sg = seg({ label: 'Trend', options: Object.keys(TRENDS).map((k) => ({ v: k, label: TRENDS[k].label })), value: tr, onChange: (v) => ((tr = v), run()) });
    const sl = slider({ id: ctx.key + '-p', label: 'Cycle period', min: 20, max: 80, step: 2, value: P0, fmt: (v) => v + ' days, low to low', onInput: (v) => ((P0 = v), (reveal = 1), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, sl.el, h('div', { class: 'legend' }, lg('var(--accent)', 'Cycle lows', true), lg('var(--muted)', 'Middle of each cycle', true), lg('var(--warn)', 'Cycle peaks')), read, h('p', { class: 'fine' }, 'A simulated cycle with a little noise. Real cycles vary in length.'));
    // One cycle: rises for a fraction f of the period and falls for the rest, so the peak sits at f.
    const wave = (ph, f) => (ph < f ? -Math.cos((Math.PI * ph) / f) : Math.cos((Math.PI * (ph - f)) / (1 - f)));
    const series = () => {
      const T = TRENDS[tr],
        r = SS.rng(12);
      let e = 0;
      return Array.from({ length: n }, (_, t) => ((e = 0.6 * e + (r() - 0.5) * 0.35), 50 + T.slope * t + A * wave((t % P0) / P0, T.f) + e));
    };
    const peaks = (y) => {
      const out = [];
      for (let k = 0; (k + 1) * P0 <= n; k++) {
        let j = k * P0;
        for (let t = k * P0; t < (k + 1) * P0; t++) if (y[t] > y[j]) j = t;
        out.push({ k, j, mid: k * P0 + P0 / 2 });
      }
      return out;
    };
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 230 : 270),
      pad: { l: 44, r: 20, t: 12, b: 24 },
      label: 'A price cycle with its lows, midpoints and peaks marked',
      draw(P) {
        const C = pal(),
          y = series(),
          k = Math.round((n - 1) * reveal);
        P.domain(0, n - 1, 38, 62);
        P.grid({ xTicks: [0, 60, 120, 180, 239], xf: (v) => 'D' + (v + 1), yf: (v) => '$' + Math.round(v) });
        for (let t = 0; t <= k; t += P0) P.line([[t, 38], [t, 62]], { color: C.accent, width: 1.25, dash: [4, 4] });
        peaks(y).forEach(({ j, mid }) => {
          if (mid <= k) P.line([[mid, 38], [mid, 62]], { color: C.muted, width: 1, dash: [2, 5], alpha: 0.7 });
          if (j <= k) P.dot(j, y[j], { color: C.warn, r: 3.5 });
        });
        P.line(y.slice(0, k + 1).map((v, t) => [t, v]), { color: C.ink, width: 2 });
      },
    });
    function paint() {
      plot.render();
      const pk = peaks(series()),
        d = pk.reduce((s, x) => s + (x.j - x.mid), 0) / pk.length,
        days = Math.round(Math.abs(d));
      read.innerHTML = `Cycle lows every ${P0} days (blue dashed lines). Across ${pk.length} complete cycles, the peaks came on average <b>${days === 0 ? 'right at' : `${days} day${days === 1 ? '' : 's'} ${d > 0 ? 'after' : 'before'}`}</b> the middle of the cycle. ${d > P0 * 0.06 ? 'That is right translation: the uptrend keeps the rise going longer.' : d < -P0 * 0.06 ? 'That is left translation: in a downtrend, rallies give out early.' : 'With no trend, the peaks sit near the middle.'}`;
    }
    function run() {
      if (cancel) cancel();
      paint();
      cancel = tween(3600, (k) => ((reveal = Math.max(0.02, ease.inOut(k))), plot.render()));
    }
    paint();
    return { play: run, destroy: () => (cancel && cancel(), plot.destroy()) };
  };
})();
