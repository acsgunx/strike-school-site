/* Reading the Market Profile, Unit 3 visuals: the four open types, and ten days moving between balance and imbalance. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, seg, usd, pal, alpha, tween, ease } = SS;
  const V = SS.viz,
    TA = SS.TA,
    PV = SS.PV;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));

  /* ---------- the four open types (first 90 minutes, 5-minute bars) ---------- */
  const OPENS = {
    drive: {
      label: 'Open-drive',
      conv: ['High', 'gain'],
      va: [98.9, 99.7],
      closes: [100.2, 100.35, 100.55, 100.5, 100.7, 100.85, 100.8, 101.0, 101.15, 101.1, 101.3, 101.45, 101.4, 101.55, 101.7, 101.65, 101.8, 101.9],
      end: 'Price left the open in the first bar and never traded back to it. Buyers arrived with urgency and size: the most confident open there is.',
    },
    testDrive: {
      label: 'Open-test-drive',
      conv: ['Fairly high', 'gain'],
      va: [98.8, 99.6],
      closes: [99.85, 99.7, 99.62, 99.75, 100.0, 100.2, 100.45, 100.4, 100.65, 100.85, 100.8, 101.0, 101.15, 101.1, 101.3, 101.4, 101.35, 101.5],
      mark: 'min',
      tag: 'Test of yesterday’s value holds',
      end: 'Price first tested down to the top of yesterday’s value, found buyers there, then drove up through the open. Once the test passed, conviction was strong.',
    },
    rejectReverse: {
      label: 'Open-rejection-reverse',
      conv: ['Moderate', ''],
      va: [100.7, 101.5],
      closes: [100.2, 100.4, 100.6, 100.55, 100.35, 100.1, 99.95, 99.8, 99.85, 99.65, 99.5, 99.55, 99.4, 99.3, 99.35, 99.2, 99.25, 99.1],
      mark: 'max',
      tag: 'Rejected below yesterday’s value',
      end: 'Price pushed up toward yesterday’s value, was rejected just below it, and reversed down through the open. The rejected high became the day’s reference.',
    },
    auction: {
      label: 'Open-auction',
      conv: ['Low', 'loss'],
      va: [99.6, 100.4],
      closes: [100.1, 99.95, 99.8, 99.9, 100.1, 100.25, 100.15, 99.95, 99.85, 99.95, 100.15, 100.3, 100.2, 100.0, 99.9, 100.05, 100.15, 100.05],
      end: 'Price opened inside yesterday’s value and rotated around the open in both directions. No side showed conviction: expect a balanced day until something changes.',
    },
  };
  const OPEN = 100;
  function openBars(key) {
    const cl = OPENS[key].closes,
      w = 0.05;
    return cl.map((c, i) => {
      const o = i ? cl[i - 1] : OPEN,
        b = { o, c, h: Math.max(o, c) + w, l: Math.min(o, c) - w, v: 1 };
      if (key === 'drive' && i === 0) b.l = o; // the drive never trades below the open
      return b;
    });
  }
  V.openTypes = function (host, p, ctx) {
    let key = 'drive',
      chart = null;
    const sg = seg({ label: 'Open type', options: Object.keys(OPENS).map((k) => ({ v: k, label: OPENS[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, info, holder, read, h('p', { class: 'fine' }, 'Illustrative 5-minute bars for the first 90 minutes. The dashed line is the opening price.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const sc = OPENS[key],
        bars = openBars(key),
        n = bars.length;
      const lo = Math.min(sc.va[0], ...bars.map((b) => b.l)),
        hi = Math.max(sc.va[1], ...bars.map((b) => b.h));
      const mi = sc.mark === 'min' ? bars.findIndex((b) => b.l === Math.min(...bars.map((x) => x.l))) : sc.mark === 'max' ? bars.findIndex((b) => b.h === Math.max(...bars.map((x) => x.h))) : -1;
      const backToOpen = bars.findIndex((b, i) => i > 0 && b.l <= OPEN && b.h >= OPEN);
      info.replaceChildren(stat('Conviction', sc.conv[0], sc.conv[1]), stat('Yesterday’s value', `${usd(sc.va[0])}–${usd(sc.va[1])}`), stat('Back to the open?', backToOpen < 0 ? 'Never' : 'Yes, at ' + PV.clock(backToOpen)));
      chart = TA.chart(holder, ctx, {
        bars,
        yRange: [lo - (hi - lo) * 0.08, hi + (hi - lo) * 0.1],
        pad: { l: 50, r: 12 },
        xTicks: [0, 6, 12, 17],
        xf: PV.clock,
        yf: PV.yf,
        dayFmt: (v) => PV.clock(v - 1),
        sliderLabel: 'Time',
        ms: 3600,
        label: sc.label + ': the first 90 minutes',
        under(P, C) {
          P.rect(-0.8, sc.va[0], n - 0.2, sc.va[1], alpha(C.violet, 0.14));
          // Label the band on the edge farther from price, so it never sits under a tag.
          const below = sc.va[1] < OPEN;
          if (below) P.text('Yesterday’s value', P.X(-0.6), P.Y(sc.va[0]) - 9, { align: 'left', color: C.violet, size: 10 });
          else P.text('Yesterday’s value', P.X(n - 0.6), P.Y(sc.va[1]) + 9, { align: 'right', color: C.violet, size: 10 });
        },
        over(P, C, i) {
          P.line([[-0.8, OPEN], [n - 0.2, OPEN]], { color: C.ink, width: 1.25, dash: [5, 4], alpha: 0.75 });
          if (mi >= 0 && i > mi) {
            const y = sc.mark === 'min' ? bars[mi].l : bars[mi].h;
            P.dot(mi, y, { color: sc.mark === 'min' ? C.gain : C.loss, r: 4.5 });
            P.tag(sc.tag, P.X(mi), P.Y(y), { bg: sc.mark === 'min' ? C.gain : C.loss, align: 'left', dy: sc.mark === 'min' ? 10 : -32, size: 10 });
          }
        },
        onIndex(i) {
          const b = bars[i - 1];
          read.innerHTML = i >= n ? `<b>${sc.label}.</b> ${sc.end}` : `${PV.clock(i - 1)}: ${usd(b.c)}, ${b.c > OPEN ? 'above' : b.c < OPEN ? 'below' : 'at'} the open.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- ten days between balance and imbalance ---------- */
  // [low, high, value-area low, value-area high, POC]
  const DAYS10 = [
    [99.0, 100.8, 99.6, 100.4, 100.0],
    [99.3, 101.0, 99.8, 100.6, 100.2],
    [98.9, 100.6, 99.4, 100.2, 99.8],
    [99.2, 100.9, 99.7, 100.5, 100.1],
    [100.6, 102.9, 101.4, 102.5, 102.0],
    [102.2, 104.1, 102.7, 103.5, 103.1],
    [102.6, 103.9, 102.9, 103.6, 103.2],
    [102.4, 103.7, 102.8, 103.4, 103.1],
    [102.7, 103.8, 103.0, 103.6, 103.3],
    [102.9, 103.5, 103.0, 103.4, 103.2],
  ];
  const STORY = [
    'Day 1: value forms around $100.',
    'Day 2: value overlaps day 1. Buyers and sellers agree: balance.',
    'Day 3: a dip to $98.90 is bought back into the same area. Still a bracket.',
    'Day 4: four days of overlapping value. The market is coiled inside a bracket from about $98.90 to $101.',
    'Day 5, step 1: the directional move. Price breaks out of the bracket and value jumps higher: imbalance.',
    'Day 6, step 2: the move is stopped. A selling tail at the high marks excess.',
    'Day 7, step 3: value overlaps day 6. A new balance forms at higher prices.',
    'Day 8: still overlapping. Short-term traders fade the edges of the new bracket.',
    'Day 9: balance continues around $103.',
    'Day 10, step 4: a narrow, quiet day inside the bracket: the transition before the next move.',
  ];
  V.balanceCycle = function (host, p, ctx) {
    let shown = DAYS10.length,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Replay');
    const sl = SS.slider({ id: ctx.key + '-d', label: 'Day', min: 1, max: DAYS10.length, step: 1, value: shown, fmt: (v) => 'Day ' + v + ' of ' + DAYS10.length, onInput: (v) => (cancel && cancel(), (shown = v), paint()) });
    stack(host, plotEl, h('div', { class: 'ctl-row ta-ctl' }, btn, sl.el), read, h('p', { class: 'fine' }, 'Illustrative daily profiles. Boxes are value areas, thin lines the day’s range, amber ticks the POC. Numbers mark the four steps.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 280 : 320),
      pad: { l: 46, r: 10, t: 22, b: 24 },
      label: 'Ten days of value areas moving from balance to imbalance and back',
      draw(P) {
        const C = pal(),
          k = Math.min(shown, DAYS10.length);
        P.domain(0, 10, 98.5, 104.6);
        P.grid({ xTicks: [0.5, 2.5, 4.5, 6.5, 8.5], xf: (v) => 'Day ' + Math.round(v + 0.5), yf: (v) => '$' + v });
        if (k >= 4) P.rect(0.08, 98.9, 3.92, 101.0, alpha(C.accent, 0.07));
        if (k >= 4) P.text('Bracket', P.X(2), P.Y(101.0) - 8, { color: C.accent, size: 10 });
        if (k >= 9) P.rect(6.08, 102.4, 9.92, 103.9, alpha(C.accent, 0.07));
        if (k >= 9) P.text('New bracket', P.X(8), P.Y(103.9) - 8, { color: C.accent, size: 10 });
        DAYS10.slice(0, k).forEach(([lo, hi, val, vah, poc], d) => {
          const prev = DAYS10[d - 1],
            up = prev && val > prev[3],
            col = up ? C.gain : C.accent;
          P.line([[d + 0.5, lo], [d + 0.5, hi]], { color: C.muted, width: 1.5 });
          P.rect(d + 0.2, val, d + 0.8, vah, alpha(col, 0.55));
          P.line([[d + 0.15, poc], [d + 0.85, poc]], { color: C.warn, width: 2.5 });
          if (d === 5) P.line([[d + 0.5, 103.7], [d + 0.5, 104.1]], { color: C.loss, width: 4 });
        });
        [[4, '1'], [5, '2'], [7, '3'], [9, '4']].forEach(([d, s]) => {
          if (d >= k) return;
          P.dot(d + 0.5, 104.45, { color: C.ink, r: 8 });
          P.text(s, P.X(d + 0.5), P.Y(104.45), { color: C.onsolid, weight: 700, size: 10 });
        });
      },
    });
    function paint() {
      plot.render();
      read.innerHTML = STORY[Math.max(0, shown - 1)] + (shown >= DAYS10.length ? ' Balance, a breakout, the move stopped, then a new balance at higher prices: the four steps of market activity, ready to repeat in either direction.' : '');
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(7000, (k) => {
        shown = Math.max(1, Math.ceil(DAYS10.length * k));
        sl.set(shown);
        paint();
      });
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };
})();
