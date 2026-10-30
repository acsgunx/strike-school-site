/* Lessons of a Stock Operator, Unit 2 visuals: breakouts from a range, sitting tight versus trading the swings,
   and pyramiding versus averaging down. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, seg, usd, pct, alpha } = SS;
  const V = SS.viz,
    TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);
  const dollars = (v) => (v >= 0 ? '+' : '−') + '$' + Math.abs(Math.round(v)).toLocaleString('en-US');
  const asBars = (vals) => vals.map((v, i) => ({ o: i ? vals[i - 1] : v, h: Math.max(v, i ? vals[i - 1] : v), l: Math.min(v, i ? vals[i - 1] : v), c: v }));

  /* ---------- the line of least resistance: up, down, or a false break ---------- */
  const RANGE = [[0, 52], [4, 53.8], [9, 50.3], [14, 53.7], [19, 50.4], [24, 53.6], [28, 50.8]];
  const BREAKS = {
    up: { label: 'Breaks up', side: 1, a: [[30, 53.4], [32, 55.0], [36, 56.6], [42, 56.0], [50, 59.5], [59, 62]], seed: 61 },
    down: { label: 'Breaks down', side: -1, a: [[30, 50.6], [32, 49.0], [36, 47.4], [42, 48.0], [50, 45.0], [59, 43]], seed: 62 },
    fail: { label: 'False break', side: 1, a: [[30, 53.4], [32, 55.0], [34, 53.4], [38, 51.6], [45, 52.9], [59, 51.6]], seed: 63 },
  };
  V.leastResistance = function (host, p, ctx) {
    let key = 'up',
      chart = null;
    const sg = seg({ label: 'Case', options: Object.keys(BREAKS).map((k) => ({ v: k, label: BREAKS[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, info, read, h('p', { class: 'fine' }, 'Simulated daily prices. Entry on the first close outside the range; exit on a close back inside it, or at the end.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const sc = BREAKS[key],
        bars = TA.bars(TA.path(RANGE.concat(sc.a), 60, { seed: sc.seed, noise: 0.005 }), { seed: sc.seed, wick: 0.005, volume: 3e5, volMul: (i) => (i < 30 ? 0.8 : i < 34 ? 2.2 : 1.2) }),
        n = bars.length;
      const top = Math.max(...bars.slice(0, 30).map((b) => b.c)),
        bot = Math.min(...bars.slice(0, 30).map((b) => b.c));
      const entry = bars.findIndex((b, i) => i >= 30 && (b.c > top || b.c < bot));
      const side = bars[entry].c > top ? 1 : -1;
      let exit = bars.findIndex((b, i) => i > entry && (side > 0 ? b.c < top : b.c > bot));
      const failed = exit >= 0;
      if (!failed) exit = n - 1;
      const pl = (bars[exit].c - bars[entry].c) * side;
      info.replaceChildren(stat('Range', `${usd(bot)}–${usd(top)}`), stat(side > 0 ? 'Bought' : 'Sold short', `${usd(bars[entry].c)} · day ${entry + 1}`), stat(failed ? 'Exited (back in range)' : 'At the end', `${usd(bars[exit].c)} · ${pl >= 0 ? '+' : ''}${usd(pl)}`, pl >= 0 ? 'gain' : 'loss'));
      chart = TA.chart(holder, ctx, {
        bars,
        ms: 4800,
        pad: { l: 46 },
        label: sc.label + ': a range and what happens next',
        under(P, C, i) {
          P.rect(-0.5, bot, Math.min(i - 1, 29.5), top, alpha(C.accent, 0.08));
        },
        over(P, C, i) {
          [top, bot].forEach((v) => P.line([[-0.5, v], [n - 1, v]], { color: C.accent, width: 1.25, dash: [5, 4], alpha: i > 30 ? 0.7 : 1 }));
          if (i > entry) {
            P.dot(entry, bars[entry].c, { color: side > 0 ? C.gain : C.loss, r: 4.5 });
            P.tag(side > 0 ? 'Buy the breakout' : 'Short the breakdown', P.X(entry), P.Y(bars[entry].c), { bg: side > 0 ? C.gain : C.loss, align: 'right', dy: side > 0 ? -32 : 10, size: 10.5 });
          }
          if (failed && i > exit) {
            P.dot(exit, bars[exit].c, { color: C.warn, r: 4.5 });
            P.tag('Back in the range: exit', P.X(exit), P.Y(bars[exit].c), { bg: C.warn, dy: 10, size: 10.5 });
          }
        },
        lower: { height: 50, range: [0, Math.max(...bars.map((b) => b.v)) * 1.1], yTicks: [], label: 'Volume', draw: (P, C, i) => TA.drawVolume(P, bars, i) },
        onIndex(i) {
          const k = i - 1;
          if (i >= n) read.innerHTML = failed ? `The break above ${usd(top)} didn’t hold: on day ${exit + 1} price closed back inside the range and the trade was closed for ${usd(pl)} a share. A small, quick loss is the price of finding the real moves.` : `Price ${side > 0 ? 'broke above' : 'broke below'} the range on day ${entry + 1} and kept going: ${pl >= 0 ? '+' : ''}${usd(pl)} a share by the end. Following the line of least resistance meant ${side > 0 ? 'buying a new high' : 'selling a new low'}.`;
          else if (k < 30) read.innerHTML = `Day ${k + 1}: ${usd(bars[k].c)}. Price is stuck between ${usd(bot)} and ${usd(top)}. Direction unknown, so no trade.`;
          else if (k < entry) read.innerHTML = `Day ${k + 1}: ${usd(bars[k].c)}. Still inside the range. Waiting.`;
          else read.innerHTML = `Day ${k + 1}: ${usd(bars[k].c)}. ${side > 0 ? 'Long' : 'Short'} from ${usd(bars[entry].c)}${failed && k >= exit ? ', now closed' : ''}.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- sitting tight versus trading the swings ---------- */
  const BULL = [[0, 100], [30, 112], [42, 104], [80, 128], [95, 117], [140, 148], [155, 138], [200, 166], [215, 156], [251, 182]];
  V.sitTight = function (host, p, ctx) {
    const px = TA.path(BULL, 252, { seed: 41, noise: 0.008 }),
      n = px.length;
    // The sitter holds unless the price closes 15% below its high since buying.
    const sit = [];
    let peak = px[0],
      sitOut = null;
    px.forEach((v, t) => {
      peak = Math.max(peak, v);
      if (sitOut == null && v < peak * 0.85) sitOut = t;
      sit.push(((sitOut == null ? v : px[sitOut]) / px[0]) * 100);
    });
    // The swing trader takes profit at +6% and buys back after a 4% pullback from the high since selling.
    const swing = [],
      marks = [];
    let sh = 100 / px[0],
      cash = 0,
      entry = px[0],
      hi = null;
    px.forEach((v, t) => {
      if (t && sh && v >= entry * 1.06) (cash = sh * v), (sh = 0), (hi = v), marks.push({ t, sell: true });
      else if (t && !sh) {
        hi = Math.max(hi, v);
        if (v <= hi * 0.96) (sh = cash / v), (cash = 0), (entry = v), marks.push({ t, sell: false });
      }
      swing.push(sh ? sh * v : cash);
    });
    const daysOut = swing.filter((_, t) => {
      const m = marks.filter((x) => x.t <= t).pop();
      return m && m.sell;
    }).length;
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const holder = h('div');
    stack(host, holder, h('div', { class: 'legend' }, lg('var(--gain)', 'Sits tight'), lg('var(--warn)', 'Trades the swings'), lg('var(--loss)', 'Sells'), lg('var(--accent)', 'Buys back')), read, h('p', { class: 'fine' }, 'A simulated bull market. Both start with $100. The sitter would only sell on a close 15% below the high; it never happens. No trading costs are charged, which flatters the swing trader.'));
    const top = Math.ceil(Math.max(...sit, ...swing) / 20) * 20;
    const chart = TA.chart(holder, ctx, {
      bars: asBars(px),
      type: 'line',
      cursor: false,
      yf: (v) => String(Math.round(v)),
      pad: { l: 40 },
      ms: 5200,
      label: 'A bull market, with the swing trader’s sales and buy-backs marked',
      over(P, C, i) {
        marks
          .filter((m) => m.t < i)
          .forEach((m) => P.dot(m.t, px[m.t], { color: m.sell ? C.loss : C.accent, r: 4 }));
      },
      lower: {
        height: 120,
        range: [80, top],
        yf: (v) => '$' + Math.round(v),
        label: 'What $100 became',
        draw(P, C, i) {
          TA.series(P, swing, i, { color: C.warn, width: 2 });
          TA.series(P, sit, i, { color: C.gain, width: 2.25 });
        },
      },
      onIndex(i) {
        const k = i - 1,
          last = marks.filter((m) => m.t <= k).pop();
        read.innerHTML =
          i >= n
            ? `The sitter turned $100 into <b class="gain">$${sit[n - 1].toFixed(0)}</b>. The swing trader made ${marks.length} trades, sat out ${daysOut} of ${n} days, kept buying back higher than it sold, and ended with <b>$${swing[n - 1].toFixed(0)}</b>.`
            : `Day ${k + 1}: sitter $${sit[k].toFixed(0)} · swing trader $${swing[k].toFixed(0)}${last ? (last.sell ? ' (in cash, waiting for a dip)' : ' (back in)') : ''}.`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- pyramiding versus averaging down ---------- */
  const MARKETS = {
    up: { label: 'Market rises', a: [[0, 100], [10, 103.5], [18, 102], [30, 108], [40, 106.5], [55, 114], [70, 122], [79, 128]] },
    down: { label: 'Market falls', a: [[0, 100], [8, 97.5], [14, 99], [25, 94], [35, 95.5], [50, 89], [65, 82], [79, 76]] },
  };
  /** dir 1: pyramid (add a unit after each +3%, stop 5% under the last add); dir −1: average down (add after each −3%, no stop). */
  function trader(px, dir) {
    let units = 1,
      cost = px[0],
      next = px[0] * (1 + dir * 0.03),
      stop = px[0] * 0.95,
      exit = null;
    const size = [1],
      adds = [];
    for (let t = 1; t < px.length; t++) {
      if (exit == null && dir > 0 && px[t] <= stop) exit = t;
      if (exit == null && units < 4 && (dir > 0 ? px[t] >= next : px[t] <= next)) {
        units++;
        cost += px[t];
        adds.push(t);
        next = px[t] * (1 + dir * 0.03);
        if (dir > 0) stop = px[t] * 0.95;
      }
      size.push(exit != null && t >= exit ? 0 : units);
    }
    const endPx = exit == null ? px[px.length - 1] : px[exit];
    return { units, size, adds, exit, pl: (units * endPx - cost) * 100 };
  }
  V.pyramid = function (host, p, ctx) {
    let key = p.start || 'up',
      chart = null;
    const sg = seg({ label: 'Market', options: Object.keys(MARKETS).map((k) => ({ v: k, label: MARKETS[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, info, read, h('div', { class: 'legend' }, lg('var(--gain)', 'Pyramid: adds when right'), lg('var(--warn)', 'Averager: adds when wrong')), h('p', { class: 'fine' }, 'Simulated prices. Each unit is 100 shares; both start with one unit and can hold up to four. The pyramid trader exits if price falls 5% below the last purchase; the averager never sells.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const px = TA.path(MARKETS[key].a, 80, { seed: 51, noise: 0.006 }),
        n = px.length,
        pyr = trader(px, 1),
        avg = trader(px, -1);
      info.replaceChildren(stat('Pyramid', `${dollars(pyr.pl)} · max ${pyr.units} ${pyr.units === 1 ? 'unit' : 'units'}`, pyr.pl >= 0 ? 'gain' : 'loss'), stat('Averager', `${dollars(avg.pl)} · max ${avg.units} ${avg.units === 1 ? 'unit' : 'units'}`, avg.pl >= 0 ? 'gain' : 'loss'));
      chart = TA.chart(holder, ctx, {
        bars: asBars(px),
        type: 'line',
        cursor: false,
        yf: (v) => '$' + Math.round(v),
        pad: { l: 44 },
        ms: 4000,
        label: MARKETS[key].label + ': where each trader adds',
        over(P, C, i) {
          pyr.adds.filter((t) => t < i).forEach((t) => P.dot(t, px[t], { color: C.gain, r: 4.5 }));
          avg.adds.filter((t) => t < i).forEach((t) => P.dot(t, px[t], { color: C.warn, r: 4.5 }));
          if (pyr.exit != null && pyr.exit < i) {
            P.dot(pyr.exit, px[pyr.exit], { color: C.loss, r: 4.5 });
            P.tag('Pyramid stops out', P.X(pyr.exit), P.Y(px[pyr.exit]), { bg: C.loss, dy: 10, size: 10.5 });
          }
        },
        lower: {
          height: 90,
          range: [0, 4.5],
          yTicks: [0, 1, 2, 3, 4],
          yf: (v) => String(v),
          label: 'Units held',
          draw(P, C, i) {
            const step = (s, col) => P.line(s.slice(0, i).flatMap((u, t) => [[t - 0.5, u], [t + 0.5, u]]), { color: col, width: 2.25 });
            step(avg.size, C.warn);
            step(pyr.size, C.gain);
          },
        },
        onIndex(i) {
          const k = i - 1;
          read.innerHTML =
            i >= n
              ? key === 'up'
                ? `Rising market: the pyramid trader added as the price proved the idea right and finished with ${pyr.units} units, <b class="gain">${dollars(pyr.pl)}</b>. The averager never got a dip to add on and stayed at ${avg.units} unit: ${dollars(avg.pl)}.`
                : `Falling market: the pyramid trader never added, stopped out on day ${pyr.exit + 1} and lost only <b>${'$' + Math.abs(Math.round(pyr.pl)).toLocaleString('en-US')}</b>. The averager kept buying all the way down to ${avg.units} units and lost <b class="loss">${'$' + Math.abs(Math.round(avg.pl)).toLocaleString('en-US')}</b>.`
              : `Day ${k + 1}: ${usd(px[k])}. Pyramid holds ${pyr.size[k]} ${pyr.size[k] === 1 ? 'unit' : 'units'}, the averager ${avg.size[k]}.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };
})();
