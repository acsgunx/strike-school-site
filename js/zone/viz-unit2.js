/* The Trading Mindset, Unit 2 visuals: an edge played over more and more trades, and how losing streaks cluster. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, pal, alpha, tween, ease } = SS;
  const V = SS.viz;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));

  /** Exact chance of finishing ahead after n trades that win `win` units with probability p and otherwise lose 1. */
  function pAhead(n, p = 0.45, win = 2) {
    let lg = 0,
      total = 0;
    const lf = [0];
    for (let i = 1; i <= n; i++) lf.push((lg += Math.log(i)));
    for (let w = 0; w <= n; w++) if (win * w - (n - w) > 0) total += Math.exp(lf[n] - lf[w] - lf[n - w] + w * Math.log(p) + (n - w) * Math.log(1 - p));
    return total;
  }
  /** Exact chance of at least one run of k or more losses in n trades with win rate p. */
  function pRun(n, p, k) {
    let dp = new Array(k).fill(0),
      hit = 0;
    dp[0] = 1;
    for (let t = 0; t < n; t++) {
      const nd = new Array(k).fill(0);
      for (let j = 0; j < k; j++) {
        if (!dp[j]) continue;
        nd[0] += dp[j] * p;
        if (j + 1 >= k) hit += dp[j] * (1 - p);
        else nd[j + 1] += dp[j] * (1 - p);
      }
      dp = nd;
    }
    return hit;
  }

  /* ---------- the casino edge ---------- */
  const NS = [1, 5, 10, 20, 50, 100, 200, 500],
    TRADERS = 400;
  V.casinoEdge = function (host, p, ctx) {
    let idx = Math.max(0, NS.indexOf(p.n || 1)),
      cancel = null,
      totals = [];
    const sl = slider({ id: ctx.key + '-n', label: 'Trades per trader', min: 0, max: NS.length - 1, step: 1, value: idx, fmt: (v) => NS[v] + (NS[v] === 1 ? ' trade' : ' trades'), onInput: (v) => (stop(), (idx = v), simulate(), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, info, plotEl, sl.el, read, h('p', { class: 'fine' }, `${TRADERS} simulated traders, each with the same edge: 45% of trades win 2 units, 55% lose 1. The exact odds come from the binomial distribution.`));
    function simulate() {
      const n = NS[idx],
        r = SS.rng(1000 + n);
      totals = Array.from({ length: TRADERS }, () => {
        let s = 0;
        for (let k = 0; k < n; k++) s += r() < 0.45 ? 2 : -1;
        return s;
      });
    }
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 210 : 240),
      pad: { l: 36, r: 12, t: 12, b: 26 },
      label: 'How many traders ended at each result',
      draw(P) {
        // Every result is 3 × wins − trades, so bars sit 3 units apart.
        const C = pal(),
          counts = new Map();
        totals.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
        const xs = [...counts.keys()],
          lo = Math.min(...xs, -1),
          hi = Math.max(...xs, 2),
          mx = Math.max(...counts.values()),
          pad = Math.max(3, (hi - lo) * 0.04);
        P.domain(lo - pad, hi + pad, 0, mx * 1.12);
        P.grid({ xTicks: SS.niceTicks(lo, hi, 5), yTicks: SS.niceTicks(0, mx, 3), xf: (v) => (v > 0 ? '+' : '') + Math.round(v), yf: (v) => String(Math.round(v)) });
        counts.forEach((c, t) => P.rect(t - 1.3, 0, t + 1.3, c, alpha(t > 0 ? C.gain : C.loss, 0.8)));
        P.line([[0, 0], [0, mx * 1.12]], { color: C.ink, width: 1.25, dash: [3, 3] });
      },
    });
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    function paint() {
      plot.render();
      const n = NS[idx],
        ahead = totals.filter((t) => t > 0).length / TRADERS,
        exact = pAhead(n),
        avg = totals.reduce((a, b) => a + b, 0) / TRADERS;
      info.replaceChildren(stat('Simulated traders ahead', (ahead >= 0.99 && ahead < 1 ? (ahead * 100).toFixed(1) : Math.round(ahead * 100)) + '%', 'gain'), stat('Exact chance', (exact * 100 > 99.9 ? '>99.9' : (exact * 100).toFixed(1)) + '%'), stat('Average result', (avg >= 0 ? '+' : '−') + Math.abs(avg).toFixed(1) + ' units'));
      read.innerHTML =
        n === 1
          ? 'After one trade, most traders are behind: a single trade is a coin flip tilted against you. The edge is invisible.'
          : n < 50
            ? `After ${n} trades, ${Math.round(exact * 100)}% of traders are ahead. The edge is showing, but plenty of traders with the same edge are still losing.`
            : `After ${n} trades, ${exact > 0.999 ? 'virtually every' : Math.round(exact * 100) + '% of'} traders are ahead, averaging about +${(0.35 * n).toFixed(0)} units. Same edge, enough trades: the casino’s view.`;
    }
    simulate();
    paint();
    return {
      play() {
        stop();
        const path = [0, 2, 4, 6];
        cancel = tween(3600, (k) => {
          const j = path[Math.min(path.length - 1, Math.floor(k * path.length))];
          if (j !== idx || k >= 1) {
            idx = k >= 1 ? path[path.length - 1] : j;
            sl.set(idx);
            simulate();
            paint();
          }
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- losing streaks ---------- */
  const SEQ = 100;
  V.streaks = function (host, p, ctx) {
    let win = p.win || 0.55,
      seed = 3,
      reveal = 1,
      cancel = null,
      seq = [];
    const sl = slider({ id: ctx.key + '-w', label: 'Win rate', min: 35, max: 70, step: 1, value: Math.round(win * 100), fmt: (v) => v + '%', onInput: (v) => ((win = v / 100), deal(), paint()) });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => ((seed += 1), deal(), run()) }, 'Deal 100 new trades');
    const plotEl = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, info, plotEl, h('div', { class: 'ctl-row' }, btn), sl.el, read, h('p', { class: 'fine' }, 'Each square is one trade, in order, left to right and top to bottom. The longest losing streak is outlined.'));
    function deal() {
      const r = SS.rng(seed * 7919 + Math.round(win * 100));
      seq = Array.from({ length: SEQ }, () => r() < win);
    }
    function longest() {
      let best = { len: 0, end: -1 },
        run = 0;
      seq.forEach((w, k) => {
        run = w ? 0 : run + 1;
        if (run > best.len) best = { len: run, end: k };
      });
      return best;
    }
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 110 : 130),
      pad: { l: 4, r: 4, t: 4, b: 4 },
      label: '100 trades in order, wins and losses',
      draw(P) {
        const C = pal(),
          k = Math.round(SEQ * reveal),
          L = longest();
        P.domain(0, 20, 5, 0);
        seq.forEach((w, i) => {
          if (i >= k) return;
          const x = i % 20,
            y = Math.floor(i / 20);
          P.rect(x + 0.08, y + 0.08, x + 0.92, y + 0.92, alpha(w ? C.gain : C.loss, 0.85));
        });
        if (reveal >= 1)
          for (let i = L.end - L.len + 1; i <= L.end; i++) {
            const x = i % 20,
              y = Math.floor(i / 20);
            P.line([[x + 0.04, y + 0.04], [x + 0.96, y + 0.04], [x + 0.96, y + 0.96], [x + 0.04, y + 0.96], [x + 0.04, y + 0.04]], { color: C.warn, width: 2.5 });
          }
      },
    });
    function paint() {
      plot.render();
      const L = longest(),
        p5 = pRun(SEQ, win, 5);
      let plan = 1;
      while (pRun(SEQ, win, plan) > 0.05) plan++;
      info.replaceChildren(stat('Longest losing streak', String(L.len), 'loss'), stat('Chance of 5+ in a row', p5 >= 0.995 ? '>99%' : Math.round(p5 * 100) + '%'), stat('Plan for (95%)', plan + ' in a row'));
      read.innerHTML = `At a ${Math.round(win * 100)}% win rate, this run of 100 trades had ${seq.filter(Boolean).length} winners and a longest losing streak of <b>${L.len}</b>. A streak of 5 or more happens in ${p5 >= 0.995 ? 'more than 99' : 'about ' + Math.round(p5 * 100)}% of runs, and only about 1 run in 20 has a streak of ${plan} or longer. Size your trades so ${plan} losses in a row won’t hurt you.`;
    }
    function run() {
      if (cancel) cancel();
      paint();
      cancel = tween(1800, (k) => {
        reveal = Math.max(0.01, k);
        plot.render();
      });
    }
    deal();
    paint();
    return { play: run, destroy: () => (cancel && cancel(), plot.destroy()) };
  };
})();
