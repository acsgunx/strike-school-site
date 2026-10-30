/* Lessons from the Market Wizards, Unit 3 visuals: a channel breakout trend-following rule, and a growth stock’s
   breakout from a base with the 7–8% stop. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, seg, pal, alpha, usd } = SS;
  const V = SS.viz;
  const TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);
  const R = (x) => (Math.round(x * 10) >= 0 ? '+' : '−') + Math.abs(x).toFixed(1) + 'R';
  const pc = (x) => (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(0) + '%';

  /* ---------- channel breakout trend following ---------- */
  // A sideways market with three false breakouts, then a long trend, then a top.
  const TREND = [[0, 50], [16, 51], [26, 48.6], [36, 50.5], [43, 52.6], [52, 49], [62, 50], [69, 52.8], [78, 49.3], [88, 50.4], [95, 52.9], [104, 49.4], [116, 50.6], [126, 54], [176, 80], [186, 77], [196, 69], [199, 70]];
  const IN = 20,
    OUT = 10;
  /** Long-only channel breakout: buy a close above the prior 20-day high, sell a close below the prior 10-day low. */
  function channel(bars) {
    const n = bars.length,
      hiN = bars.map((_, i) => (i < IN ? null : Math.max(...bars.slice(i - IN, i).map((b) => b.h)))),
      loN = bars.map((_, i) => (i < OUT ? null : Math.min(...bars.slice(i - OUT, i).map((b) => b.l)))),
      trades = [];
    let pos = null;
    for (let i = IN; i < n; i++) {
      const c = bars[i].c;
      if (pos && c < loN[i]) (pos.exit = i), (pos.r = (c - pos.entry) / pos.risk), trades.push(pos), (pos = null);
      else if (!pos && c > hiN[i]) pos = { in: i, entry: c, risk: c - loN[i] };
    }
    if (pos) (pos.exit = n - 1), (pos.r = (bars[n - 1].c - pos.entry) / pos.risk), (pos.open = true), trades.push(pos);
    return { hiN, loN, trades };
  }
  /** The nervous trader sits out the next signal after three losses in a row. */
  function nervous(trades) {
    let streak = 0;
    return trades.map((t) => {
      if (streak >= 3) return (streak = 0), { ...t, skip: true };
      streak = t.r < 0 ? streak + 1 : 0;
      return t;
    });
  }
  /** Running result in R: closed trades plus the open trade marked to the close. */
  function equity(bars, list) {
    return bars.map((b, k) =>
      list.reduce((s, t) => {
        if (t.skip || t.in > k) return s;
        return s + (t.exit <= k ? t.r : (b.c - t.entry) / t.risk);
      }, 0)
    );
  }
  V.trendSystem = function (host, p, ctx) {
    const bars = TA.bars(TA.path(TREND, 200, { seed: 7 }), { seed: 7, wick: 0.007 }),
      n = bars.length,
      { hiN, loN, trades } = channel(bars),
      lists = { all: trades, nervous: nervous(trades) },
      eq = { all: equity(bars, lists.all), nervous: equity(bars, lists.nervous) };
    let mode = 'all';
    const lo = Math.min(-3, ...eq.all, ...eq.nervous) - 0.5,
      hi = Math.max(...eq.all, ...eq.nervous) + 1;
    const sg = p.compare ? seg({ label: 'Trader', options: [{ v: 'all', label: 'Takes every signal' }, { v: 'nervous', label: 'Skips after 3 losses' }], value: mode, onChange: (v) => ((mode = v), paintStats(), chart.render()) }) : null;
    const holder = h('div');
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(
      host,
      sg ? sg.el : null,
      info,
      holder,
      h('div', { class: 'legend' }, lg('var(--gain)', '20-day high: buy above', true), lg('var(--loss)', '10-day low: sell below', true), p.compare ? lg('var(--muted)', 'Running result: the other trader') : null),
      read,
      h('p', { class: 'fine' }, 'Simulated daily prices, long trades only. R is the distance from the entry to the 10-day low on the day of entry, the amount at risk if the price fell straight to the exit level.')
    );
    const list = () => lists[mode];
    function paintStats() {
      const L = list().filter((t) => !t.skip),
        net = L.reduce((s, t) => s + t.r, 0),
        best = Math.max(0, ...L.map((t) => t.r));
      info.replaceChildren(stat('Trades taken', `${L.length} of ${trades.length}`), stat('Losing trades', String(L.filter((t) => t.r < 0).length), 'loss'), stat('Biggest win', best ? R(best) : 'none', best ? 'gain' : ''), stat('Net result', R(net), net >= 0 ? 'gain' : 'loss'));
    }
    const chart = TA.chart(holder, ctx, {
      bars,
      type: 'line',
      playFrom: IN + 1,
      ms: 6500,
      pad: { l: 46 },
      label: 'Simulated prices with the channel breakout trades',
      under(P, C, i) {
        list().forEach((t) => {
          if (t.in >= i) return;
          const done = t.exit < i;
          P.rect(t.in, P.dom.y0, Math.min(t.exit, i - 1), P.dom.y1, alpha(t.skip ? C.muted : !done ? C.accent : t.r >= 0 ? C.gain : C.loss, t.skip ? 0.08 : 0.13));
        });
        TA.series(P, hiN, i, { color: C.gain, width: 1.25, dash: [4, 4], alpha: 0.85 });
        TA.series(P, loN, i, { color: C.loss, width: 1.25, dash: [4, 4], alpha: 0.85 });
      },
      over(P, C, i) {
        list().forEach((t) => {
          if (t.in < i) P.dot(t.in, bars[t.in].c, { color: t.skip ? C.muted : C.accent, r: 3.5 });
          if (t.exit < i && !t.open) P.dot(t.exit, bars[t.exit].c, { color: t.skip ? C.muted : C.ink, r: 3.5 });
          if (t.skip && t.in < i) P.text('skipped', P.X(t.in) + 4, P.Y(P.dom.y1) + 10, { align: 'left', color: C.muted, size: 9.5 });
        });
      },
      lower: {
        height: 90,
        label: 'Running result in R',
        range: [lo, hi],
        yTicks: SS.niceTicks(lo, hi, 3),
        yf: (v) => v + 'R',
        draw(P, C, i) {
          P.line([[-1, 0], [n, 0]], { color: C.ink, width: 1, dash: [2, 4], alpha: 0.5 });
          if (p.compare) TA.series(P, eq[mode === 'all' ? 'nervous' : 'all'], i, { color: C.muted, width: 1.5, alpha: 0.6 });
          TA.series(P, eq[mode], i, { color: mode === 'all' ? C.accent : C.warn, width: 2.25 });
        },
      },
      onIndex(i) {
        const k = i - 1,
          L = list(),
          closed = L.filter((t) => !t.skip && t.exit <= k && !(t.open && k < n - 1)),
          sofar = closed.length ? ` So far: ${closed.length} closed trade${closed.length > 1 ? 's' : ''}, ${R(closed.reduce((s, t) => s + t.r, 0))}.` : '',
          open = L.find((t) => t.in <= k && k < t.exit);
        if (i >= n) {
          const taken = L.filter((t) => !t.skip),
            losers = taken.filter((t) => t.r < 0),
            best = taken.reduce((a, t) => (t.r > a.r ? t : a), { r: -Infinity }),
            net = taken.reduce((s, t) => s + t.r, 0),
            missed = L.find((t) => t.skip);
          if (mode === 'all') read.innerHTML = `${losers.length} of the ${taken.length} trades were small losses (${losers.map((t) => R(t.r)).join(', ')}), each cut when the price fell below the 10-day low. Then one trend paid ${R(best.r)}. Net: <b class="${net >= 0 ? 'gain' : 'loss'}">${R(net)}</b>.`;
          else read.innerHTML = `After three losses in a row, the nervous trader sat out the next signal${missed ? `, which in this example was the trend that paid ${R(missed.r)}` : ''}. Net: <b class="${net >= 0 ? 'gain' : 'loss'}">${R(net)}</b>, against ${R(lists.all.reduce((s, t) => s + t.r, 0))} for taking every signal.`;
        } else if (k < IN) read.innerHTML = `Day ${k + 1}: ${usd(bars[k].c)}. Collecting 20 days of prices before the rule can act.`;
        else if (open) read.innerHTML = open.skip ? `Day ${k + 1}: ${usd(bars[k].c)}. A new 20-day high, but after three losses in a row the nervous trader is sitting this one out.${sofar}` : `Day ${k + 1}: ${usd(bars[k].c)}. Long since day ${open.in + 1} at ${usd(open.entry)}. Sell if it closes below the 10-day low, now ${usd(loN[k])}.${sofar}`;
        else read.innerHTML = `Day ${k + 1}: ${usd(bars[k].c)}. No position. Waiting for a close above the 20-day high of ${usd(hiN[k])}.${sofar}`;
      },
    });
    paintStats();
    chart.render();
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- breakout from a base, with the 7–8% stop ---------- */
  const BASE = [[0, 30], [36, 44], [48, 39.5], [60, 37.6], [72, 42.2], [78, 43.6], [83, 42.2], [87, 43.4], [89, 46]];
  const FUTURES = {
    work: { label: 'Breakout works', a: [[100, 49.5], [112, 54.5], [124, 58]] },
    fail: { label: 'Breakout fails', a: [[92, 46.6], [98, 42.5], [108, 38.5], [124, 31]] },
  };
  const NB = 125,
    B0 = 36;
  V.baseBreakout = function (host, p, ctx) {
    let key = 'work',
      chart = null;
    const sg = seg({ label: 'Future', options: Object.keys(FUTURES).map((k) => ({ v: k, label: FUTURES[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, info, holder, h('div', { class: 'legend' }, lg('var(--accent)', 'Buy point: top of the base', true), lg('var(--loss)', 'Stop: 8% below the buy', true)), read, h('p', { class: 'fine' }, 'Simulated daily prices: one base with two possible futures. Many real breakouts fail, which is why the stop matters.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const fail = key === 'fail',
        bars = TA.bars(TA.path(BASE.concat(FUTURES[key].a), NB, { seed: 4, noise: 0.008 }), { seed: 4, wick: 0.008, volume: 8e5, volMul: (i) => (i < B0 ? 1 : i < 87 ? 0.7 : i < 90 ? 1.35 : fail && i > 92 ? 1.3 : 1.05) }),
        n = bars.length,
        vols = bars.map((b) => b.v),
        avg = TA.sma(vols, 50),
        piv = Math.max(...bars.slice(30, 86).map((b) => b.h)),
        low = Math.min(...bars.slice(B0, 86).map((b) => b.l)),
        e = bars.findIndex((b, i) => i >= 86 && b.c > piv),
        entry = bars[e].c,
        stop = entry * 0.92,
        x = fail ? bars.findIndex((b, i) => i > e && b.c <= stop) : -1,
        end = bars[n - 1].c / entry - 1,
        sold = x >= 0 ? bars[x].c / entry - 1 : null,
        volX = vols[e] / avg[e - 1];
      info.replaceChildren(stat('Buy point', usd(piv)), stat('Bought', `${usd(entry)} · day ${e + 1}`), ...(fail ? [stat('Sold at the stop', pc(sold), 'loss'), stat('If held instead', pc(end), 'loss')] : [stat('At the end', pc(end), 'gain')]));
      chart = TA.chart(holder, ctx, {
        bars,
        ms: 5200,
        playFrom: 20,
        pad: { l: 46 },
        label: FUTURES[key].label + ': a growth stock’s base and breakout',
        under(P, C, i) {
          if (i > B0) P.rect(B0, low, Math.min(i - 1, 86), piv, alpha(C.accent, 0.08));
          if (i > 60) P.text('Base', P.X(61), P.Y(low) + 12, { color: C.accent, size: 9.5 });
        },
        over(P, C, i) {
          if (i > B0) {
            P.line([[B0, piv], [n - 1, piv]], { color: C.accent, width: 1.25, dash: [5, 4] });
            P.text('Buy point', P.X(50), P.Y(piv) - 9, { color: C.accent, size: 9.5 });
          }
          if (i > e) {
            P.line([[e, stop], [n - 1, stop]], { color: C.loss, width: 1.25, dash: [5, 4] });
            // When the breakout fails the price falls through the label's spot, and the Sell tag says the same thing.
            if (!fail) P.text('Stop −8%', P.X(n - 1), P.Y(stop) + 10, { align: 'right', color: C.loss, size: 9.5 });
            P.dot(e, entry, { color: C.gain, r: 4.5 });
            P.tag('Buy', P.X(e), P.Y(entry), { bg: C.gain, align: 'right', dy: -32, size: 10.5 });
          }
          if (x >= 0 && i > x) {
            P.dot(x, bars[x].c, { color: C.loss, r: 4.5 });
            // Sit just above the buy-point line, where the falling price no longer reaches.
            P.tag('Sell ' + pc(sold), P.X(x), P.Y(bars[x].c), { bg: C.loss, align: 'left', dy: P.Y(piv) - 26 - P.Y(bars[x].c), size: 10.5 });
          }
        },
        lower: {
          height: 70,
          label: 'Volume, with its 50-day average',
          range: [0, Math.max(...vols) * 1.1],
          yTicks: [],
          draw(P, C, i) {
            TA.drawVolume(P, bars, i, { color: (j) => (j === e ? C.accent : null) });
            TA.series(P, avg, i, { color: C.ink, width: 1.25, alpha: 0.6 });
          },
        },
        onIndex(i) {
          const k = i - 1,
            c = usd(bars[k].c);
          if (i >= n)
            read.innerHTML = fail
              ? `The breakout failed. The 8% stop sold it on day ${x + 1} for <b class="loss">${pc(sold)}</b>. Holding on would have meant ${pc(end)} by the end, and getting back to even from there takes a gain of ${pc(1 / (1 + end) - 1)}.`
              : `The stock broke out on day ${e + 1} on ${volX.toFixed(1)}× its average volume and kept climbing: <b class="gain">${pc(end)}</b> by the end. The stop at ${usd(stop)} was never touched.`;
          else if (k < B0) read.innerHTML = `Day ${k + 1}: ${c}. A leading stock in a strong uptrend.`;
          else if (k < e) read.innerHTML = `Day ${k + 1}: ${c}. Resting in a base below ${usd(piv)}. ${k > 50 ? 'Volume has dried up: few sellers are left.' : 'The stock pulls back and digests its gains.'}`;
          else if (x >= 0 && k >= x) read.innerHTML = `Day ${k + 1}: ${c}. Sold at the stop on day ${x + 1}. The loss stays small, whatever happens next.`;
          else read.innerHTML = `Day ${k + 1}: ${c}. Bought the breakout at ${usd(entry)} on heavy volume. Sell if it closes at or below ${usd(stop)}, 8% lower.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };
})();
