/* Lessons from the Market Wizards, Unit 2 visuals: growth and drawdown risk by bet size, where a trend follower’s
   profit comes from, and defensive sizing. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, pal, alpha, tween, ease } = SS;
  const V = SS.viz;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);
  const P_WIN = 0.4,
    PAYOFF = 1.8,
    KELLY = P_WIN - (1 - P_WIN) / PAYOFF;

  /* ---------- growth and drawdown by risk per trade ---------- */
  const RISKS = Array.from({ length: 40 }, (_, k) => (k + 1) * 0.005);
  /** For each risk level: median ending multiple and chance of a 50% fall, from 400 traders × 200 trades. */
  function curve() {
    const N = 400,
      T = 200,
      seqs = [],
      r = SS.rng(5);
    for (let k = 0; k < N; k++) seqs.push(Array.from({ length: T }, () => r() < P_WIN));
    return RISKS.map((risk) => {
      let dd = 0;
      const ends = seqs.map((s) => {
        let eq = 1,
          pk = 1,
          hit = false;
        s.forEach((w) => {
          eq *= w ? 1 + PAYOFF * risk : 1 - risk;
          pk = Math.max(pk, eq);
          if (eq <= pk * 0.5) hit = true;
        });
        if (hit) dd++;
        return eq;
      });
      ends.sort((a, b) => a - b);
      return { risk, med: ends[N / 2], dd: dd / N };
    });
  }
  V.ruinCurve = function (host, p, ctx) {
    const data = curve();
    let idx = 3,
      reveal = 1,
      cancel = null;
    const sl = slider({ id: ctx.key + '-r', label: 'Risk per trade', min: 0, max: RISKS.length - 1, step: 1, value: idx, fmt: (v) => (RISKS[v] * 100).toFixed(1) + '% of the account', onInput: (v) => ((idx = v), paint()) });
    const el1 = h('div', { class: 'plot' }),
      el2 = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, info, h('p', { class: 'plot-h' }, 'Typical result after 200 trades'), el1, h('p', { class: 'plot-h' }, 'Chance of a 50% fall along the way'), el2, sl.el, read, h('p', { class: 'fine' }, '400 simulated traders, 200 trades each, with an edge of 40% winners paying 1.8 times the amount risked.'));
    const xf = (v) => (v * 100).toFixed(0) + '%';
    const frame = (P, C) => {
      P.line([[KELLY, P.dom.y0], [KELLY, P.dom.y1]], { color: C.muted, width: 1.25, dash: [4, 4] });
      P.line([[RISKS[idx], P.dom.y0], [RISKS[idx], P.dom.y1]], { color: C.ink, width: 1.5, alpha: 0.7 });
    };
    const shown = () => data.slice(0, Math.max(2, Math.round(data.length * reveal)));
    const p1 = new Plot(el1, {
      height: 150,
      pad: { l: 40, r: 10, t: 10, b: 22 },
      label: 'Median ending multiple by risk per trade',
      draw(P) {
        const C = pal();
        P.domain(0, 0.205, 0, 2.6);
        P.grid({ xTicks: [0, 0.05, 0.1, 0.15, 0.2], yTicks: [0, 1, 2], xf, yf: (v) => v + '×' });
        P.line([[0, 1], [0.205, 1]], { color: C.ink, width: 1, dash: [2, 4], alpha: 0.5 });
        frame(P, C);
        P.line(shown().map((d) => [d.risk, d.med]), { color: C.accent, width: 2.5 });
        P.text('growth-optimal', P.X(KELLY) + 4, P.Y(2.45), { align: 'left', color: C.muted, size: 9.5 });
        P.dot(RISKS[idx], data[idx].med, { color: C.accent, r: 4.5 });
      },
    });
    const p2 = new Plot(el2, {
      height: 130,
      pad: { l: 40, r: 10, t: 10, b: 22 },
      label: 'Chance of a 50% drawdown by risk per trade',
      draw(P) {
        const C = pal();
        P.domain(0, 0.205, 0, 1);
        P.grid({ xTicks: [0, 0.05, 0.1, 0.15, 0.2], yTicks: [0, 0.5, 1], xf, yf: (v) => v * 100 + '%' });
        frame(P, C);
        P.line(shown().map((d) => [d.risk, d.dd]), { color: C.loss, width: 2.5 });
        P.dot(RISKS[idx], data[idx].dd, { color: C.loss, r: 4.5 });
      },
    });
    function paint() {
      p1.render();
      p2.render();
      const d = data[idx];
      info.replaceChildren(stat('Risk per trade', (d.risk * 100).toFixed(1) + '%'), stat('Typical result', d.med.toFixed(2) + '×', d.med >= 1 ? 'gain' : 'loss'), stat('Chance of a 50% fall', Math.round(d.dd * 100) + '%', d.dd > 0.25 ? 'loss' : ''));
      const where = d.risk < KELLY - 0.004 ? 'below the growth-optimal size' : d.risk > KELLY + 0.004 ? 'above the growth-optimal size' : 'near the growth-optimal size';
      read.innerHTML = `At ${(d.risk * 100).toFixed(1)}% (${where}, about ${(KELLY * 100).toFixed(1)}%), the typical trader ends with ${d.med.toFixed(2)}× the starting money, and ${Math.round(d.dd * 100)}% of traders suffer a 50% fall along the way.` + (d.risk > KELLY ? ' Betting more than the peak means lower growth and more pain at the same time.' : d.dd < 0.05 ? ' Slower growth, but nearly everyone avoids a crippling fall.' : '');
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(2400, (k) => {
          reveal = Math.max(0.05, ease.out(k));
          p1.render();
          p2.render();
        });
      },
      destroy: () => (cancel && cancel(), p1.destroy(), p2.destroy()),
    };
  };

  /* ---------- where a trend follower’s profit comes from ---------- */
  /** 200 trades: 38% winners with a long right tail; each loser has a planned −1R stop but would run further if allowed. */
  function trendTrades(seed) {
    const r = SS.rng(seed),
      exp = (m) => -m * Math.log(1 - r() * 0.999);
    return Array.from({ length: 200 }, () => {
      if (r() < 0.38) {
        const w = Math.min(15, 0.5 + exp(2));
        return { cut: w, hope: w };
      }
      const l = -(0.3 + exp(1.2));
      return { cut: Math.max(-1, l), hope: Math.max(-6, l) };
    });
  }
  V.tradePareto = function (host, p, ctx) {
    let seed = 7,
      mode = 'cut',
      reveal = 1,
      cancel = null,
      trades = trendTrades(seed);
    const sg = p.compare ? seg({ label: 'Losers', options: [{ v: 'cut', label: 'Cut at −1R' }, { v: 'hope', label: 'Let losers run' }], value: mode, onChange: (v) => ((mode = v), run()) }) : null;
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => ((seed += 1), (trades = trendTrades(seed)), run()) }, 'Deal 200 new trades');
    const el1 = h('div', { class: 'plot' }),
      el2 = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg ? sg.el : null, info, h('p', { class: 'plot-h' }, '200 trades, sorted from best to worst'), el1, h('p', { class: 'plot-h' }, 'Running total, adding the best trades first'), el2, h('div', { class: 'ctl-row' }, btn), read, h('p', { class: 'fine' }, 'Simulated trades measured in R, the amount planned to be risked on each one.'));
    const vals = () => trades.map((t) => t[mode]).sort((a, b) => b - a);
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const xGrid = { xTicks: [0, 49, 99, 149, 199], xf: (x) => '#' + (x + 1) };
    const p1 = new Plot(el1, {
      height: (w) => (w < 480 ? 150 : 170),
      pad: { l: 40, r: 18, t: 10, b: 22 },
      label: 'Each trade’s result, best on the left',
      draw(P) {
        const C = pal(),
          v = vals(),
          k = Math.round(v.length * reveal);
        P.domain(-1, v.length, Math.min(-1.5, v[v.length - 1] * 1.08), Math.max(4, v[0] * 1.08));
        P.grid({ ...xGrid, yf: (x) => Math.round(x) + 'R' });
        v.slice(0, k).forEach((x, i) => P.rect(i - 0.4, 0, i + 0.4, x, alpha(x > 0 ? C.gain : C.loss, 0.85)));
      },
    });
    const p2 = new Plot(el2, {
      height: (w) => (w < 480 ? 150 : 170),
      pad: { l: 40, r: 18, t: 10, b: 22 },
      label: 'Running total of results, best trades first',
      draw(P) {
        const C = pal(),
          v = vals(),
          k = Math.round(v.length * reveal),
          cum = [];
        v.reduce((s, x, i) => ((cum[i] = s + x), s + x), 0);
        const net = cum[cum.length - 1],
          peak = Math.max(...cum);
        P.domain(-1, v.length, Math.min(0, ...cum) - 10, peak * 1.12 + 5);
        P.grid({ ...xGrid, yf: (x) => Math.round(x) + 'R' });
        P.line([[-1, 0], [v.length, 0]], { color: C.ink, width: 1, dash: [2, 4], alpha: 0.5 });
        P.area(cum.slice(0, k).map((c, i) => [i, Math.max(0, c)]), 0, C.gain, 0.14);
        P.area(cum.slice(0, k).map((c, i) => [i, Math.min(0, c)]), 0, C.loss, 0.18);
        P.line(cum.slice(0, k).map((c, i) => [i, c]), { color: C.ink, width: 2 });
        if (k >= v.length) P.dot(v.length - 1, net, { color: net >= 0 ? C.gain : C.loss, r: 4 });
      },
    });
    function paint() {
      p1.render();
      p2.render();
      const v = vals(),
        net = sum(v),
        top20 = sum(v.slice(0, 20)),
        rest = net - top20,
        losers = v.filter((x) => x <= 0).length,
        other = sum(trades.map((t) => t[mode === 'cut' ? 'hope' : 'cut'])),
        R = (x) => (Math.round(x) >= 0 ? '+' : '−') + Math.abs(x).toFixed(0) + 'R';
      info.replaceChildren(stat('Losing trades', `${losers} of 200`, 'loss'), stat('Best 20 trades', R(top20), 'gain'), stat('Net result', R(net), net >= 0 ? 'gain' : 'loss'));
      read.innerHTML =
        mode === 'hope'
          ? `Same entries, same winners, but the losers ran: the net fell from ${R(other)} to <b class="${net >= 0 ? 'gain' : 'loss'}">${R(net)}</b>. ` + (net < 0 || other <= 0 ? 'The big losses swallowed the big wins.' : `Still positive this time, but the losses that ran gave back ${Math.round(((other - net) / other) * 100)}% of the profit.`)
          : p.compare
            ? `${losers} of the 200 trades lost, but each loss was cut at −1R, so the net was <b class="${net >= 0 ? 'gain' : 'loss'}">${R(net)}</b>. Now switch to “Let losers run”: the same trades come to ${R(other)}.`
            : `${losers} of the 200 trades lost, yet the net was <b class="${net >= 0 ? 'gain' : 'loss'}">${R(net)}</b>. The best 20 trades alone made ${R(top20)}; the other 180 together came to ${R(rest)}. The running total climbs steeply on the few big winners, then gives back a little on each small loss.`;
    }
    function run() {
      if (cancel) cancel();
      paint();
      cancel = tween(2000, (k) => {
        reveal = Math.max(0.02, ease.out(k));
        p1.render();
        p2.render();
      });
    }
    paint();
    return { play: run, destroy: () => (cancel && cancel(), p1.destroy(), p2.destroy()) };
  };

  /* ---------- defensive sizing ---------- */
  const TR = 300;
  /** Constant 2% risk versus 1% whenever the account is 10% or more below its peak. */
  function runRules(wins) {
    const out = {};
    for (const m of ['steady', 'defense']) {
      let eq = 1,
        pk = 1,
        mdd = 0;
      const path = [1];
      wins.forEach((w) => {
        const risk = m === 'defense' && eq < pk * 0.9 ? 0.01 : 0.02;
        eq *= w ? 1 + PAYOFF * risk : 1 - risk;
        pk = Math.max(pk, eq);
        mdd = Math.max(mdd, 1 - eq / pk);
        path.push(eq);
      });
      out[m] = { path, mdd, end: eq };
    }
    return out;
  }
  V.defenseSize = function (host, p, ctx) {
    const r = SS.rng(11),
      sims = Array.from({ length: 1000 }, () => runRules(Array.from({ length: TR }, () => r() < P_WIN)));
    const q = (arr, f) => arr.slice().sort((a, b) => a - b)[Math.floor(arr.length * f)];
    const S = {};
    for (const m of ['steady', 'defense']) {
      const dd = sims.map((s) => s[m].mdd),
        end = sims.map((s) => s[m].end);
      S[m] = { dd50: q(dd, 0.5), dd95: q(dd, 0.95), end50: q(end, 0.5), dd };
    }
    // Start on an unlucky run (about the 1-in-10 worst steady drawdown), where the rule matters most.
    const bad = sims.map((s, j) => [s.steady.mdd, j]).sort((a, b) => a[0] - b[0])[Math.floor(sims.length * 0.9)][1];
    let pick = bad,
      reveal = 1,
      cancel = null;
    const el1 = h('div', { class: 'plot' }),
      el2 = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => ((pick = (pick + 37) % sims.length), run()) }, 'Show another trader');
    stack(host, info, h('p', { class: 'plot-h' }, 'One trader, both rules, the same 300 trades'), el1, h('div', { class: 'ctl-row' }, btn), h('p', { class: 'plot-h' }, 'Worst drawdown across all 1,000 traders'), el2, h('div', { class: 'legend' }, lg('var(--warn)', 'Steady 2% risk'), lg('var(--accent)', 'Defense: 1% when 10% below the peak')), read);
    const p1 = new Plot(el1, {
      height: 170,
      pad: { l: 40, r: 10, t: 10, b: 22 },
      label: 'Account value for one trader under both rules',
      draw(P) {
        const C = pal(),
          s = sims[pick],
          k = Math.max(1, Math.round(TR * reveal)),
          hi = Math.max(1.15, ...s.steady.path, ...s.defense.path) * 1.05,
          lo = Math.min(0.8, ...s.steady.path, ...s.defense.path) * 0.95;
        P.domain(0, TR, lo, hi);
        P.grid({ xTicks: [0, 100, 200, 300], yf: (v) => v.toFixed(1) + '×' });
        P.line(s.steady.path.slice(0, k + 1).map((v, i) => [i, v]), { color: C.warn, width: 2 });
        P.line(s.defense.path.slice(0, k + 1).map((v, i) => [i, v]), { color: C.accent, width: 2.25 });
      },
    });
    const p2 = new Plot(el2, {
      height: 150,
      pad: { l: 40, r: 10, t: 10, b: 22 },
      label: 'How often each worst drawdown occurred under each rule',
      draw(P) {
        const C = pal(),
          bins = 14,
          w = 0.05,
          count = (arr) => {
            const c = new Array(bins).fill(0);
            arr.forEach((x) => c[Math.min(bins - 1, Math.floor(x / w))]++);
            return c;
          },
          a = count(S.steady.dd),
          b = count(S.defense.dd),
          mx = Math.max(...a, ...b);
        P.domain(0, bins * w, 0, mx * 1.1);
        P.grid({ xTicks: [0, 0.2, 0.4, 0.6], yTicks: [], xf: (v) => Math.round(v * 100) + '%' });
        a.forEach((c, i) => P.rect(i * w + w * 0.08, 0, i * w + w * 0.48, c, alpha(C.warn, 0.8)));
        b.forEach((c, i) => P.rect(i * w + w * 0.52, 0, i * w + w * 0.92, c, alpha(C.accent, 0.8)));
      },
    });
    function paint() {
      p1.render();
      p2.render();
      info.replaceChildren(stat('Typical worst drawdown', `${Math.round(S.steady.dd50 * 100)}% → ${Math.round(S.defense.dd50 * 100)}%`, 'gain'), stat('Bad-case drawdown (1 in 20)', `${Math.round(S.steady.dd95 * 100)}% → ${Math.round(S.defense.dd95 * 100)}%`, 'gain'), stat('Typical result', `${S.steady.end50.toFixed(2)}× → ${S.defense.end50.toFixed(2)}×`, 'loss'));
      const s = sims[pick];
      read.innerHTML = `Across 1,000 traders, the defensive rule cut the typical worst drawdown from ${Math.round(S.steady.dd50 * 100)}% to ${Math.round(S.defense.dd50 * 100)}%, and the bad case from ${Math.round(S.steady.dd95 * 100)}% to ${Math.round(S.defense.dd95 * 100)}%. The price: a typical result of ${S.defense.end50.toFixed(2)}× instead of ${S.steady.end50.toFixed(2)}×. This trader’s worst drawdown: ${Math.round(s.steady.mdd * 100)}% steady, ${Math.round(s.defense.mdd * 100)}% with defense. Smaller holes are easier to climb out of, and easier to stay disciplined through.`;
    }
    function run() {
      if (cancel) cancel();
      paint();
      cancel = tween(2400, (k) => {
        reveal = Math.max(0.01, ease.inOut(k));
        p1.render();
      });
    }
    paint();
    return { play: run, destroy: () => (cancel && cancel(), p1.destroy(), p2.destroy()) };
  };
})();
