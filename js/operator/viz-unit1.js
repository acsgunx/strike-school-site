/* Lessons of a Stock Operator, Unit 1 visuals: a ticker-tape replay, bucket-shop versus real fills, and the
   cotton-and-wheat mistake. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, usd, pct, pal, alpha, tween, ease } = SS;
  const V = SS.viz,
    TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);
  /** Signed dollars: cents by default, whole dollars with thousands separators when d is 0. */
  const signed = (v, d = 2) => (d ? (v >= 0 ? '+' : '') + usd(v, d) : (v >= 0 ? '+' : '−') + '$' + Math.abs(Math.round(v)).toLocaleString('en-US'));

  /* ---------- a ticker-tape replay: a range, then a breakout on heavy volume ---------- */
  const TAPE = [[0, 101], [4, 102.7], [8, 100.3], [13, 102.8], [18, 100.4], [23, 102.6], [28, 100.6], [32, 102.5], [35, 102.9], [37, 104.2], [42, 105.4], [46, 104.8], [52, 107.6], [56, 107.0], [61, 110.2]];
  V.tapeReplay = function (host, p, ctx) {
    const bars = TA.bars(TA.path(TAPE, 62, { seed: 24, noise: 0.0045 }), { seed: 24, wick: 0.004, volume: 4e5, volMul: (i) => (i < 35 ? 0.75 : i < 40 ? 2.6 : 1.3) }),
      n = bars.length;
    const avg = (i) => bars.slice(Math.max(0, i - 20), i).reduce((a, b) => a + b.v, 0) / Math.max(1, Math.min(20, i));
    const top = Math.max(...bars.slice(0, 34).map((b) => b.h)),
      floor = Math.min(...bars.slice(0, 34).map((b) => b.l));
    const bo = bars.findIndex((b, i) => i > 30 && b.c > top && b.v > 1.8 * avg(i));
    const boX = bars[bo].v / avg(bo);
    const tape = h('div', { class: 'op-tape', 'aria-hidden': 'true' });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, tape, holder, read, h('p', { class: 'fine' }, 'A simulated stock, “ACME”. Underlined prints traded on unusually heavy volume.'));
    const chart = TA.chart(holder, ctx, {
      bars,
      ms: 5600,
      pad: { l: 50 },
      label: 'A stock moving sideways in a range, then breaking out',
      under(P, C, i) {
        P.rect(-0.5, floor, Math.min(i, bo) - 0.5, top, alpha(C.accent, 0.08));
      },
      over(P, C, i) {
        [top, floor].forEach((v) => P.line([[-0.5, v], [Math.min(i, bo) - 0.5, v]], { color: C.accent, width: 1.5, dash: [5, 4] }));
        if (i > bo) {
          P.line([[bo - 0.5, top], [n - 1, top]], { color: C.accent, width: 1, dash: [2, 4], alpha: 0.6 });
          P.dot(bo, bars[bo].c, { color: C.gain, r: 4.5 });
          P.tag(`Breakout, ${boX.toFixed(1)}× volume`, P.X(bo), P.Y(bars[bo].c), { bg: C.gain, align: 'right', dy: -32, size: 10.5 });
        }
      },
      lower: {
        height: 70,
        range: [0, Math.max(...bars.map((b) => b.v)) * 1.1],
        yTicks: [],
        label: 'Volume',
        draw: (P, C, i) => TA.drawVolume(P, bars, i, { color: (j, b) => (j > 0 && b.v > 1.8 * avg(j) ? alpha(C.warn, 0.95) : null) }),
      },
      onIndex(i) {
        const k = i - 1,
          b = bars[k];
        tape.innerHTML = bars
          .slice(Math.max(0, i - 9), i)
          .map((x, j, arr) => {
            const idx = i - arr.length + j;
            return `<span class="${x.c >= x.o ? 'up' : 'dn'}${idx > 0 && x.v > 1.8 * avg(idx) ? ' big' : ''}">ACME ${x.c.toFixed(2)} ${TA.fmtVol(x.v)}</span>`;
          })
          .join('');
        if (i >= n) read.innerHTML = `For ${bo} days, ACME was stuck between ${usd(floor)} and ${usd(top)}. On day ${bo + 1} it closed above the ceiling on ${boX.toFixed(1)}× normal volume and never closed back inside. It finished at ${usd(bars[n - 1].c)}, ${pct(bars[n - 1].c / bars[bo].c - 1, { d: 1, sign: true })} from the breakout.`;
        else if (k < bo) read.innerHTML = `Day ${k + 1}: ${usd(b.c)}. Price keeps turning back between ${usd(floor)} and ${usd(top)}: buyers and sellers are evenly matched, and volume is light.`;
        else if (k < bo + 4) read.innerHTML = `Day ${bo + 1}: closes at ${usd(bars[bo].c)}, above the ceiling, on <b>${boX.toFixed(1)}×</b> normal volume. The tape says buyers have taken over.`;
        else read.innerHTML = `Day ${k + 1}: ${usd(b.c)}, ${pct(b.c / bars[bo].c - 1, { d: 1, sign: true })} from the breakout. Every close stays above the old ceiling.`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- bucket-shop fills versus real fills ---------- */
  // Real minute-by-minute prices around a fast one-dollar move.
  const REAL = [50.0, 50.02, 49.98, 50.03, 50.01, 50.04, 50.25, 50.55, 50.85, 51.15, 51.4, 51.55, 51.6, 51.5, 51.3, 51.05, 50.8, 50.6, 50.45, 50.3, 50.25, 50.2, 50.22, 50.18];
  /** The scalp: buy when the tape crosses $50.20, sell when the tape is $1 above the tape entry. */
  function scalp(delay, shares) {
    const tapeAt = (t) => REAL[Math.max(0, t - delay)],
      impact = (shares / 1000) * 0.03;
    const tb = REAL.findIndex((_, t) => tapeAt(t) > 50.2);
    const ts = REAL.findIndex((_, t) => t > tb && tapeAt(t) >= tapeAt(tb) + 1);
    return { tb, ts, impact, shopIn: tapeAt(tb), shopOut: tapeAt(ts), realIn: REAL[tb] + impact, realOut: REAL[ts] - impact };
  }
  V.slippageSim = function (host, p, ctx) {
    const real = p.mode !== 'shop';
    let delay = real ? 2 : 0,
      shares = real ? 1000 : 1000,
      reveal = 1,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const sD = real ? slider({ id: ctx.key + '-d', label: 'Tape delay', min: 0, max: 4, step: 1, value: delay, fmt: (v) => (v ? v + (v === 1 ? ' minute' : ' minutes') : 'none'), onInput: (v) => ((delay = v), paint()) }) : null;
    const sS = real ? slider({ id: ctx.key + '-s', label: 'Order size', min: 100, max: 5000, step: 100, value: shares, fmt: (v) => v.toLocaleString('en-US') + ' shares', onInput: (v) => ((shares = v), paint()) }) : null;
    stack(host, info, plotEl, sD ? sD.el : null, sS ? sS.el : null, read, h('div', { class: 'legend' }, lg('var(--ink)', 'Actual price'), lg('var(--muted)', 'What the tape shows', true), lg('var(--warn)', 'Bucket-shop fills'), real ? lg('var(--accent)', 'Real fills') : null));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 230 : 260),
      pad: { l: 50, r: 12, t: 14, b: 26 },
      label: 'A quick scalp filled by a bucket shop and by a real exchange',
      draw(P) {
        const C = pal(),
          s = scalp(delay, shares),
          last = Math.floor((REAL.length - 1) * reveal);
        P.domain(-0.5, REAL.length - 0.5, 49.7, 51.9);
        P.grid({ xTicks: [0, 5, 10, 15, 20], xf: (v) => v + ' min', yf: (v) => '$' + v.toFixed(2), yTicks: [49.8, 50.2, 50.6, 51, 51.4, 51.8] });
        P.line(REAL.slice(0, last + 1).map((v, t) => [t, v]), { color: C.ink, width: 2.25 });
        if (delay) P.line(REAL.slice(0, last + 1).map((_, t) => [t, REAL[Math.max(0, t - delay)]]), { color: C.muted, width: 1.75, dash: [5, 4] });
        const mark = (t, v, col, label, below) => {
          if (t > last) return;
          P.dot(t, v, { color: col, r: 4.5 });
          P.tag(label, P.X(t), P.Y(v), { bg: col, dy: below ? 10 : -32, size: 10, align: t > 15 ? 'right' : 'left' });
        };
        mark(s.tb, s.shopIn, C.warn, 'Shop buy ' + usd(s.shopIn), true);
        mark(s.ts, s.shopOut, C.warn, 'Shop sell ' + usd(s.shopOut), false);
        if (real && (delay || shares > 100)) {
          mark(s.tb, s.realIn, C.accent, 'Real buy ' + usd(s.realIn), false);
          mark(s.ts, s.realOut, C.accent, 'Real sell ' + usd(s.realOut), true);
        }
      },
    });
    function paint() {
      plot.render();
      const s = scalp(delay, shares),
        shop = s.shopOut - s.shopIn,
        rl = s.realOut - s.realIn;
      info.replaceChildren(...[stat('Bucket shop', signed(shop) + ' a share', 'gain'), real ? stat('Real market', signed(rl) + ' a share', rl >= 0 ? 'gain' : 'loss') : null].filter(Boolean), stat(`On ${shares.toLocaleString('en-US')} shares`, real ? signed(rl * shares, 0) : signed(shop * shares, 0), (real ? rl : shop) >= 0 ? 'gain' : 'loss'));
      read.innerHTML = real
        ? `The tape is ${delay ? delay + (delay === 1 ? ' minute' : ' minutes') + ' behind' : 'up to date'}, and ${shares.toLocaleString('en-US')} shares push the price about ${usd(s.impact)} each way. The same signals that made ${signed(shop)} in the shop make <b class="${rl >= 0 ? 'gain' : 'loss'}">${signed(rl)}</b> a share for real.${rl < 0 ? ' The edge is gone.' : ''}`
        : `He buys when the tape crosses $50.20 and sells when it is a dollar higher. The shop fills him at exactly the printed prices: ${usd(s.shopIn)} in, ${usd(s.shopOut)} out, ${signed(shop)} a share.`;
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(2600, (k) => {
          reveal = Math.max(0.02, ease.out(k));
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- the cotton-and-wheat mistake ---------- */
  V.twoPositions = function (host, p, ctx) {
    const N = 60,
      DAY = 20,
      SIZE = 100000;
    const wheat = TA.path([[0, 100], [15, 106], [20, 108], [35, 116], [45, 121], [59, 130]], N, { seed: 31, noise: 0.006 });
    const cotton = TA.path([[0, 100], [10, 97], [20, 94], [30, 88], [40, 82], [50, 76], [59, 70]], N, { seed: 32, noise: 0.006 });
    let mode = 'did',
      reveal = 1,
      cancel = null;
    const sg = seg({ label: 'Show', options: [{ v: 'did', label: 'What he did' }, { v: 'rules', label: 'What his rules said' }], value: mode, onChange: (v) => ((mode = v), play()) });
    const plotEl = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, info, read, h('div', { class: 'legend' }, lg('var(--gain)', 'Wheat (winning)'), lg('var(--loss)', 'Cotton (losing)'), lg('var(--muted)', 'After the position is closed', true)), h('p', { class: 'fine' }, 'Illustrative prices, each position $100,000 at the start.'));
    const ret = (arr, t) => arr[t] / arr[0] - 1;
    const outcome = (m) => (m === 'did' ? { wheat: ret(wheat, DAY), cotton: ret(cotton, N - 1) } : { wheat: ret(wheat, N - 1), cotton: ret(cotton, DAY) });
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 230 : 260),
      pad: { l: 44, r: 12, t: 16, b: 26 },
      label: 'A winning wheat position and a losing cotton position over 60 days',
      draw(P) {
        const C = pal(),
          last = Math.floor((N - 1) * reveal);
        P.domain(0, N - 1, 64, 136);
        P.grid({ xTicks: [0, 20, 40, 59], xf: (v) => 'Day ' + (v + 1), yf: (v) => String(Math.round(v)) });
        P.line([[0, 100], [N - 1, 100]], { color: C.muted, width: 1, dash: [2, 4] });
        P.line([[DAY, 64], [DAY, 136]], { color: C.ink, width: 1, dash: [4, 3], alpha: 0.6 });
        P.text('Needs cash', P.X(DAY) + 4, P.Y(134), { align: 'left', color: C.ink });
        const draw = (arr, col, closeAt) => {
          const solid = arr.slice(0, Math.min(last, closeAt) + 1).map((v, t) => [t, v]);
          P.line(solid, { color: col, width: 2.5 });
          if (last > closeAt) P.line(arr.slice(closeAt, last + 1).map((v, t) => [t + closeAt, v]), { color: col, width: 1.5, dash: [4, 4], alpha: 0.45 });
          if (closeAt < N - 1 && last >= closeAt) P.dot(closeAt, arr[closeAt], { color: col, r: 5 });
        };
        draw(wheat, C.gain, mode === 'did' ? DAY : N - 1);
        draw(cotton, C.loss, mode === 'did' ? N - 1 : DAY);
      },
    });
    function paint() {
      plot.render();
      const o = outcome(mode),
        tot = (o.wheat + o.cotton) * SIZE,
        other = outcome(mode === 'did' ? 'rules' : 'did'),
        tot2 = (other.wheat + other.cotton) * SIZE;
      info.replaceChildren(stat('Wheat', signed(o.wheat * SIZE, 0), 'gain'), stat('Cotton', signed(o.cotton * SIZE, 0), 'loss'), stat('Total', signed(tot, 0), tot >= 0 ? 'gain' : 'loss'));
      read.innerHTML =
        mode === 'did'
          ? `He sold the wheat on day ${DAY + 1} for ${signed(o.wheat * SIZE, 0)} and kept the cotton, which kept falling: ${signed(o.cotton * SIZE, 0)}. Total <b class="loss">${signed(tot, 0)}</b>. His own rules would have made ${signed(tot2, 0)}.`
          : `Cut the loser, keep the winner: close the cotton on day ${DAY + 1} for ${signed(o.cotton * SIZE, 0)}, let the wheat run for ${signed(o.wheat * SIZE, 0)}. Total <b class="gain">${signed(tot, 0)}</b>, a ${'$' + Math.round(tot - tot2).toLocaleString('en-US')} difference from the same two positions.`;
    }
    function play() {
      if (cancel) cancel();
      paint();
      cancel = tween(2400, (k) => {
        reveal = Math.max(0.02, ease.out(k));
        plot.render();
      });
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };
})();
