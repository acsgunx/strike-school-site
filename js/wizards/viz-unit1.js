/* Lessons from the Market Wizards, Unit 1 visuals: a map of the traders’ styles, and the same edge traded at three
   sizes. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, pal, alpha, tween, ease } = SS;
  const V = SS.viz;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);

  /* ---------- a map of styles ---------- */
  // x: typical holding period (0 minutes … 4 years); y: 0 rules and price action … 4 judgment and fundamentals.
  const WIZ = [
    ['Ed Seykota', 'ES', 3.25, 0.55, 'Computerized trend following, years before it was common.', 'Let the system decide; cut losses and ride the winners.'],
    ['Richard Dennis', 'RD', 2.3, 1.05, 'Rule-based trend following in futures.', 'He trained novices with written rules to show trading could be taught.'],
    ['Larry Hite', 'LH', 2.65, 0.15, 'Systematic trading across many futures markets.', 'Risk only a small slice, around 1%, on any trade.'],
    ['Paul Tudor Jones', 'PJ', 1.5, 2.0, 'Discretionary trading of futures and macro themes.', 'Defense first: protect capital, cut size when trading badly.'],
    ['Michael Marcus', 'MM', 2.0, 2.3, 'Discretionary trading across commodities and currencies.', 'He lost early accounts before learning discipline from Seykota.'],
    ['Bruce Kovner', 'BK', 2.8, 3.1, 'Global macro: economics and politics across markets.', 'Place stops where the market proves the idea wrong, and size accordingly.'],
    ['William O’Neil', 'WO', 2.6, 2.7, 'Growth stocks breaking out to new highs (CAN SLIM).', 'Buy leaders, and cut any loss at 7–8%.'],
    ['Michael Steinhardt', 'MS', 2.2, 3.5, 'Fundamental stock picking with a contrarian streak.', 'Hold a well-researched view that differs from the consensus.'],
    ['Jim Rogers', 'JR', 3.8, 3.8, 'Long-term global value investing.', 'Buy what nobody wants, when the story is about to change.'],
    ['Marty Schwartz', 'SZ', 0.6, 1.1, 'Short-term technical trading of index futures and stocks.', 'He became consistently profitable after switching from fundamentals to technical analysis.'],
    ['Tom Baldwin', 'TB', 0.1, 1.5, 'Floor trader in the Treasury bond futures pit.', 'Huge volume, tiny edges, positions held for seconds to minutes.'],
  ];
  V.wizardMap = function (host, p, ctx) {
    let sel = 0,
      reveal = 1,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const chips = h('div', { class: 'seg' });
    const card = h('div', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, chips, card, h('p', { class: 'fine' }, 'Positions are our rough reading of each trader’s style as described in the interviews, not exact measurements.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 280 : 320),
      pad: { l: 18, r: 12, t: 12, b: 34 },
      label: 'Traders placed by holding period and decision style',
      draw(P) {
        const C = pal(),
          k = Math.round(WIZ.length * reveal);
        P.domain(-0.3, 4.3, -0.4, 4.3);
        P.grid({ xTicks: [0, 1, 2, 3, 4], yTicks: [], xf: (v) => ['Minutes', 'Days', 'Weeks', 'Months', 'Years'][v] });
        P.text('Rules and price action', P.X(-0.25), P.Y(-0.25), { align: 'left', color: C.muted, size: 9.5 });
        P.text('Judgment and fundamentals', P.X(-0.25), P.Y(4.15), { align: 'left', color: C.muted, size: 9.5 });
        WIZ.slice(0, k).forEach(([, ini, x, y], j) => {
          const on = j === sel;
          P.dot(x, y, { color: on ? C.accent : alpha(C.stock, 0.9), r: on ? 13 : 10 });
          P.text(ini, P.X(x), P.Y(y), { color: C.onsolid, weight: 700, size: on ? 10 : 9 });
        });
      },
    });
    WIZ.forEach(([name], j) => {
      const b = h('button', { type: 'button', class: 'seg-btn', 'aria-pressed': String(j === sel), onclick: () => pick(j) }, name);
      chips.append(b);
    });
    function pick(j) {
      if (cancel) cancel();
      cancel = null;
      sel = j;
      reveal = 1;
      paint();
    }
    function paint() {
      plot.render();
      chips.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-pressed', String(j === sel)));
      const [name, , , , style, lesson] = WIZ[sel];
      card.innerHTML = `<b>${name}.</b> ${style} <span class="accent">Key lesson:</span> ${lesson}`;
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(2200, (k) => {
          reveal = Math.max(0.05, ease.out(k));
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- the same edge at three sizes ---------- */
  const P_WIN = 0.4,
    PAYOFF = 1.8,
    TRADES = 200,
    RISKS = [0.25, 0.1, 0.01];
  /** Fraction of 1,000 simulated traders who lose 80% or more at some point, per risk level. */
  function ruinOdds() {
    const r = SS.rng(99);
    return RISKS.map((risk) => {
      let ruined = 0;
      for (let k = 0; k < 1000; k++) {
        let eq = 1;
        for (let t = 0; t < TRADES && eq >= 0.2; t++) eq *= r() < P_WIN ? 1 + PAYOFF * risk : 1 - risk;
        if (eq < 0.2) ruined++;
      }
      return ruined / 1000;
    });
  }
  V.blowupStory = function (host, p, ctx) {
    let seed = p.seed || 16,
      reveal = 1,
      cancel = null,
      paths = [];
    const odds = ruinOdds();
    const plotEl = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => ((seed += 1), deal(), run()) }, 'Deal new trades');
    stack(host, info, plotEl, h('div', { class: 'ctl-row' }, btn), h('div', { class: 'legend' }, lg('var(--loss)', 'Risks 25% a trade'), lg('var(--warn)', 'Risks 10%'), lg('var(--gain)', 'Risks 1%')), read, h('p', { class: 'fine' }, `The same 200 trades for all three: 40% win 1.8 times the amount risked, 60% lose it. The odds above come from 1,000 simulated traders at each size. The chart uses a log scale, so equal steps are equal percentage moves.`));
    function deal() {
      const r = SS.rng(seed),
        wins = Array.from({ length: TRADES }, () => r() < P_WIN);
      paths = RISKS.map((risk) => {
        const out = [1];
        let dead = false;
        wins.forEach((w) => {
          let eq = out[out.length - 1];
          if (!dead) eq *= w ? 1 + PAYOFF * risk : 1 - risk;
          if (eq < 0.2) dead = true;
          out.push(eq);
        });
        return out;
      });
    }
    deal();
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 230 : 260),
      pad: { l: 44, r: 12, t: 12, b: 26 },
      label: 'Account value for the same trades at three sizes',
      draw(P) {
        // Log scale: the same distance means the same percentage change, so huge gains and near-wipeouts both fit.
        const C = pal(),
          k = Math.max(1, Math.round(TRADES * reveal)),
          L = (v) => Math.log10(Math.max(v, 0.01)),
          lo = L(0.05),
          hi = L(Math.max(3, ...paths.flat()) * 1.3),
          ticks = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500].filter((v) => L(v) >= lo && L(v) <= hi);
        P.domain(0, TRADES, lo, hi);
        P.grid({ xTicks: [0, 50, 100, 150, 200], yTicks: ticks.map(L), yf: (v) => +Math.pow(10, v).toPrecision(2) + '×' });
        P.rect(0, lo, TRADES, L(0.2), alpha(C.loss, 0.12));
        P.text('Lost 80%+', P.X(TRADES) - 4, P.Y((lo + L(0.2)) / 2), { align: 'right', color: C.loss, size: 9.5 });
        P.line([[0, 0], [TRADES, 0]], { color: C.ink, width: 1, dash: [3, 4], alpha: 0.5 });
        [C.loss, C.warn, C.gain].forEach((col, j) => P.line(paths[j].slice(0, k + 1).map((v, t) => [t, L(v)]), { color: col, width: j === 2 ? 2.5 : 2 }));
      },
    });
    function paint() {
      plot.render();
      info.replaceChildren(...RISKS.map((risk, j) => stat(`Risk ${Math.round(risk * 100)}%`, `${(odds[j] * 100).toFixed(odds[j] < 0.01 ? 1 : 0)}% blow up`, j === 2 ? 'gain' : 'loss')));
      const ends = paths.map((x) => x[TRADES]);
      read.innerHTML = `This run: risking 25% ended at ${ends[0].toFixed(2)}× the start${ends[0] < 0.2 ? ' after losing more than 80%' : ''}, 10% at ${ends[1].toFixed(2)}×, and 1% at ${ends[2].toFixed(2)}×. Across 1,000 traders with this same edge, ${Math.round(odds[0] * 100)}% of those risking 25% lose at least 80% at some point, against ${Math.round(odds[1] * 100)}% at 10% and ${odds[2] < 0.005 ? 'almost none' : Math.round(odds[2] * 100) + '%'} at 1%. Small size grows slowly, but it survives.`;
    }
    function run() {
      if (cancel) cancel();
      paint();
      cancel = tween(3000, (k) => {
        reveal = Math.max(0.01, ease.inOut(k));
        plot.render();
      });
    }
    paint();
    return { play: run, destroy: () => (cancel && cancel(), plot.destroy()) };
  };
})();
