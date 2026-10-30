/* The Trading Mindset, Unit 1 visuals: the same edge traded with and without discipline, and identical setups with
   different endings. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, pal, alpha, tween, ease } = SS;
  const V = SS.viz,
    TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);
  const u = (v, d = 1) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d);

  /* ---------- the same edge, with and without discipline ---------- */
  const TRADES = 100;
  /** Each signal wins 2 units with probability 45%, else loses 1. The human trader skips two signals after three
      losses in a row, takes every other winner at 1 unit, and lets every other loser run to −1.5. */
  function play(seed) {
    const r = SS.rng(seed),
      wins = Array.from({ length: TRADES }, () => r() < 0.45);
    const rule = [0],
      human = [0],
      skipped = [];
    let streak = 0,
      skip = 0,
      w = 0,
      l = 0;
    wins.forEach((win, k) => {
      rule.push(rule[k] + (win ? 2 : -1));
      if (skip > 0) {
        skip--;
        skipped.push(k);
        human.push(human[k]);
        return;
      }
      let res;
      if (win) res = w++ % 2 ? 1 : 2;
      else res = l++ % 2 ? -1.5 : -1;
      human.push(human[k] + res);
      streak = win ? 0 : streak + 1;
      if (streak >= 3) (skip = 2), (streak = 0);
    });
    return { wins, rule, human, skipped };
  }
  V.sameEdge = function (host, p, ctx) {
    let seed = p.seed || 5,
      reveal = 1,
      cancel = null,
      g = play(seed);
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => ((seed += 1), (g = play(seed)), run()) }, 'Deal new signals');
    stack(host, plotEl, h('div', { class: 'legend' }, lg('var(--gain)', 'Follows every rule'), lg('var(--warn)', 'Skips, cuts winners, stretches losers'), lg('var(--muted)', 'Skipped signal', true)), h('div', { class: 'ctl-row' }, btn), read, h('p', { class: 'fine' }, 'A simple model: every winner would reach +2 units and every loser −1 unit if left alone.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 230 : 260),
      pad: { l: 44, r: 12, t: 14, b: 26 },
      label: 'Running total in units for both traders over 100 signals',
      draw(P) {
        const C = pal(),
          k = Math.max(1, Math.round(TRADES * reveal)),
          all = g.rule.concat(g.human),
          lo = Math.min(-5, ...all),
          hi = Math.max(10, ...all);
        P.domain(0, TRADES, lo - 2, hi + 4);
        P.grid({ xTicks: [0, 25, 50, 75, 100], xf: (v) => (v ? 'Trade ' + v : ''), yf: (v) => u(v, 0) });
        P.line([[0, 0], [TRADES, 0]], { color: C.ink, width: 1, alpha: 0.4 });
        g.skipped.filter((s) => s < k).forEach((s) => P.line([[s + 1, lo - 2], [s + 1, hi + 4]], { color: C.muted, width: 1, alpha: 0.25 }));
        P.line(g.human.slice(0, k + 1).map((v, i) => [i, v]), { color: C.warn, width: 2.25 });
        P.line(g.rule.slice(0, k + 1).map((v, i) => [i, v]), { color: C.gain, width: 2.5 });
      },
    });
    function paint() {
      plot.render();
      const a = g.rule[TRADES],
        b = g.human[TRADES],
        taken = TRADES - g.skipped.length;
      read.innerHTML = `Same ${TRADES} signals, ${g.wins.filter(Boolean).length} of them winners. Following the rules: <b class="gain">${u(a)} units</b> (${u(a / TRADES, 2)} a trade). The human version skipped ${g.skipped.length} signals and ended at <b class="${b >= 0 ? '' : 'loss'}">${u(b)} units</b> (${u(b / taken, 2)} a trade). The edge was the same; the trader wasn’t.`;
    }
    function run() {
      if (cancel) cancel();
      paint();
      cancel = tween(2600, (k) => {
        reveal = Math.max(0.01, ease.inOut(k));
        plot.render();
      });
    }
    paint();
    return { play: run, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- identical setups, different endings ---------- */
  const PREFIX = TA.path([[0, 100], [6, 102.6], [12, 100.2], [18, 102.7], [24, 100.4], [29, 103.2]], 30, { seed: 9, noise: 0.003 });
  /** A breakout bought at the last prefix close; stop 3% below, target 6% above, else closed after 30 bars. */
  function ending(seed) {
    const r = SS.rng(seed),
      p0 = PREFIX[PREFIX.length - 1],
      path = [p0];
    let out = null;
    for (let t = 1; t <= 30 && !out; t++) {
      const v = path[t - 1] * Math.exp(0.001 + 0.012 * SS.gauss(r));
      path.push(v);
      if (v >= p0 * 1.06) out = 'target';
      else if (v <= p0 * 0.97) out = 'stop';
    }
    return { path, out: out || (path[path.length - 1] > p0 ? 'time-up' : 'time-down'), ret: path[path.length - 1] / p0 - 1 };
  }
  V.setupOutcomes = function (host, p, ctx) {
    let seed = p.seed || 1,
      reveal = 1,
      cancel = null,
      plots = [],
      ends = [];
    const grid = h('div', { class: 'zn-grid' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => ((seed += 6), deal(), run()) }, 'Deal six more');
    stack(host, grid, h('div', { class: 'ctl-row' }, btn), read, h('p', { class: 'fine' }, 'Simulated. Each setup is bought at the breakout with a stop 3% below and a target 6% above.'));
    const all = PREFIX.length - 1;
    function deal() {
      plots.forEach((pl) => pl.destroy());
      grid.replaceChildren();
      ends = Array.from({ length: 6 }, (_, k) => ending(seed * 100 + k));
      plots = ends.map((e, k) => {
        const el = h('div', { class: 'plot zn-cell' });
        grid.append(el);
        return new Plot(el, {
          height: 110,
          pad: { l: 6, r: 6, t: 16, b: 6 },
          label: 'Setup ' + (k + 1),
          draw(P) {
            const C = pal(),
              p0 = PREFIX[all],
              n = Math.round(e.path.length * reveal),
              col = e.out === 'target' || e.out === 'time-up' ? C.gain : C.loss;
            P.domain(0, all + 31, 96, 112);
            P.line([[all, p0 * 1.06], [all + 31, p0 * 1.06]], { color: C.gain, width: 1, dash: [3, 3], alpha: 0.7 });
            P.line([[all, p0 * 0.97], [all + 31, p0 * 0.97]], { color: C.loss, width: 1, dash: [3, 3], alpha: 0.7 });
            P.line(PREFIX.map((v, t) => [t, v]), { color: C.ink, width: 1.75 });
            if (n > 1) P.line(e.path.slice(0, n).map((v, t) => [all + t, v]), { color: col, width: 2 });
            P.text('Setup ' + (k + 1) + (reveal >= 1 ? (e.out === 'target' ? ' · target' : e.out === 'stop' ? ' · stopped' : ' · time') : ''), 6, 9, { align: 'left', color: reveal >= 1 ? col : C.muted, size: 10 });
          },
        });
      });
    }
    function paint() {
      plots.forEach((pl) => pl.render());
      const t = ends.filter((e) => e.out === 'target').length,
        s = ends.filter((e) => e.out === 'stop').length,
        o = 6 - t - s;
      read.innerHTML = `Six identical setups: <b class="gain">${t}</b> hit the target, <b class="loss">${s}</b> hit the stop${o ? `, and ${o} ran out of time` : ''}. Nothing on the chart told them apart beforehand.`;
    }
    function run() {
      if (cancel) cancel();
      paint();
      cancel = tween(2200, (k) => {
        reveal = Math.max(0.02, ease.out(k));
        plots.forEach((pl) => pl.render());
      });
    }
    deal();
    paint();
    return { play: run, destroy: () => (cancel && cancel(), plots.forEach((pl) => pl.destroy())) };
  };
})();
