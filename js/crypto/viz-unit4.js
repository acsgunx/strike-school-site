/* Crypto, Explained, Unit 4 visuals: why a penny coin isn't cheap (market cap bars on a log scale), a simulated hype
   cycle with the crowd's mood, crypto's swings next to an index fund with a portfolio mix, and buying monthly versus
   all at once in three futures. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, pal, alpha, tween, ease, usd } = SS;
  const V = SS.viz;
  const TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const fmt = (v, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const dollars = (v) => '$' + fmt(v);
  const money = (v) => (v >= 1e9 ? '$' + fmt(v / 1e9, v >= 1e10 ? 0 : 2) + 'B' : '$' + fmt(v / 1e6) + 'M');
  const lg = (c, t) => h('span', { class: 'lg', style: '--c:' + c }, h('span', { class: 'lg-sw' }), t);
  // A price path drawn as a line chart needs bars; give each close a small range around it.
  const lineBars = (closes) => closes.map((c, i) => ({ o: i ? closes[i - 1] : c, c, h: Math.max(c, i ? closes[i - 1] : c) * 1.01, l: Math.min(c, i ? closes[i - 1] : c) * 0.99, v: 1e6 }));
  const maxDD = (xs) => {
    let pk = xs[0],
      m = 0;
    xs.forEach((x) => ((pk = Math.max(pk, x)), (m = Math.max(m, 1 - x / pk))));
    return m;
  };

  /* ---------- the cheap-coin trap ---------- */
  V.capMyth = function (host, p, ctx) {
    const A = { price: 50, supply: 1e6 },
      SUPPLY = 5e9,
      toPrice = (t) => 0.01 * 10 ** ((2 * t) / 100);
    let price = 0.01,
      cancel = null;
    const sl = slider({ id: ctx.key + '-p', label: 'Coin B’s price', min: 0, max: 100, step: 1, value: 0, fmt: (t) => '$' + toPrice(t).toFixed(toPrice(t) < 0.1 ? 3 : 2), onInput: (t) => (stop(), (price = toPrice(t)), paint()) });
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('p', { class: 'plot-h' }, 'Market cap: price × number of coins (log scale)'), el, sl.el, read);
    const stop = () => (cancel && cancel(), (cancel = null));
    const plot = new Plot(el, {
      height: 190,
      pad: { l: 26, r: 14, t: 10, b: 26 },
      label: 'Two coins’ market caps',
      draw(P) {
        const C = pal(),
          capA = A.price * A.supply,
          capB = price * SUPPLY,
          rows = [
            [`Coin A: $50 × 1 million coins`, capA, C.accent, 1.45],
            [`Coin B: $${price.toFixed(price < 0.1 ? 3 : 2)} × 5 billion coins`, capB, C.warn, 0.45],
          ];
        P.domain(7, 10.15, 0, 2);
        P.grid({ xTicks: [7, 8, 9, 10], xf: (v) => ['$10M', '$100M', '$1B', '$10B'][v - 7], yTicks: [] });
        rows.forEach(([name, cap, c, y]) => {
          const x = Math.log10(cap);
          P.text(name, P.X(7) + 2, P.Y(y + 0.36), { align: 'left', color: C.ink });
          P.rect(7, y - 0.2, x, y + 0.2, c);
          P.text(money(cap), Math.min(P.X(x) + 6, P.w - 50), P.Y(y), { align: 'left', color: C.ink, weight: 700 });
        });
      },
    });
    function paint() {
      plot.render();
      const capB = price * SUPPLY,
        x = capB / 5e7;
      read.innerHTML =
        x < 1.05
          ? '<b>Same size today.</b> Both coins are worth $50 million in total. A lower price per coin just means the same value is cut into more pieces, like cutting the same pizza into 5 billion slices instead of 1 million.'
          : `At $${price.toFixed(2)}, Coin B would be worth <b>${money(capB)}</b>: ${fmt(x, x < 10 ? 1 : 0)} times Coin A, with ${money(capB - 5e7)} of new money needed to get there. A low price per coin doesn’t make it easier to rise.`;
    }
    paint();
    return {
      play() {
        stop();
        cancel = tween(3000, (k) => {
          const t = Math.round(100 * ease.inOut(k));
          price = toPrice(t);
          sl.set(t);
          paint();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- a hype cycle and the crowd's mood ---------- */
  V.hypeCycle = function (host, p, ctx) {
    const HYPE = [[0, 10], [25, 11], [50, 18], [70, 38], [82, 70], [90, 100], [96, 88], [104, 48], [115, 30], [135, 16], [160, 14], [185, 19], [209, 22]],
      closes = TA.path(HYPE, 210, { seed: 9, noise: 0.025 }),
      B = lineBars(closes),
      n = B.length;
    let hi = 0;
    const mood = closes.map((c, i) => {
      hi = Math.max(hi, c);
      const ret = c / closes[Math.max(0, i - 30)] - 1;
      return Math.max(2, Math.min(98, 50 + 45 * Math.tanh(1.6 * ret) - 25 * (1 - c / hi)));
    });
    const PHASES = [[12, 'Quiet'], [62, 'Rising'], [89, 'Mania'], [108, 'Crash'], [148, 'Despair'], [196, 'Recovery']];
    const peak = closes.indexOf(Math.max(...closes)),
      low = closes.indexOf(Math.min(...closes.slice(peak))),
      holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, holder, read, h('p', { class: 'fine' }, 'A simulated cycle for illustration, not real prices. The mood line is made up from how far and how fast prices have moved.'));
    const chart = TA.chart(holder, ctx, {
      bars: B,
      type: 'line',
      ms: 5200,
      label: 'A simulated boom and bust, with the crowd’s mood',
      yRange: [0, 118],
      xTicks: [0, 50, 100, 150, 200],
      sliderLabel: 'Day',
      over(P, C, i) {
        // Two rows of phase names, alternating, so neighbors never collide.
        PHASES.forEach(([x, t], j) => i > x && P.text(t, P.X(x), P.pad.t + 4 + (j % 2) * 15, { color: t === 'Mania' ? C.warn : t === 'Crash' || t === 'Despair' ? C.loss : C.muted }));
        if (i > peak + 2) P.dot(peak, closes[peak], { color: C.warn, r: 4 });
      },
      lower: {
        label: 'Crowd mood: fear (0) to greed (100)',
        height: 100,
        range: [0, 100],
        yTicks: [30, 70],
        draw(P, C, i) {
          P.line([[0, 70], [n, 70]], { color: C.warn, width: 1, dash: [3, 3] });
          P.line([[0, 30], [n, 30]], { color: C.loss, width: 1, dash: [3, 3] });
          const pts = mood.slice(0, i).map((m, j) => [j, m]);
          if (pts.length > 1) {
            P.area(pts, 0, C.violet, 0.15);
            P.line(pts, { color: C.violet, width: 2 });
          }
        },
      },
      onIndex(i) {
        if (i < n) {
          const ph = PHASES.filter(([x]) => i > x).pop();
          read.innerHTML = ph ? `<b>${ph[1]}.</b> Mood ${Math.round(mood[i - 1])} out of 100.` : 'Watch the price and the mood together.';
          return;
        }
        read.innerHTML = `Prices rose <b>${fmt(closes[peak] / closes[0], 0)}×</b> from the start to the peak, with the crowd at its most excited (mood ${Math.round(Math.max(...mood.slice(peak - 10, peak + 1)))}) right near the top. Then they fell <b>${Math.round((1 - closes[low] / closes[peak]) * 100)}%</b>, with the mood at rock bottom near the low. Feelings tend to say “buy” at the top and “sell” at the bottom: the opposite of what pays.`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- how wild is the ride? ---------- */
  V.volCompare = function (host, p, ctx) {
    const N = 313,
      dt = 1 / 52,
      r = SS.rng(102),
      walk = (mu, sig) => {
        const out = [100];
        for (let i = 1; i < N; i++) out.push(out[i - 1] * Math.exp((mu - (sig * sig) / 2) * dt + sig * Math.sqrt(dt) * SS.gauss(r)));
        return out;
      },
      I = walk(0.07, 0.17),
      Cr = walk(0.25, 0.75),
      dd = (xs) => {
        let pk = xs[0];
        return xs.map((x) => ((pk = Math.max(pk, x)), (x / pk - 1) * 100));
      };
    let w = 5,
      i = N,
      cancel = null;
    const mix = () => I.map((x, j) => (1 - w / 100) * x + (w / 100) * Cr[j]);
    const sl = slider({ id: ctx.key + '-w', label: 'Share of the portfolio in crypto', min: 0, max: 30, step: 1, value: w, fmt: (v) => v + '%', onInput: (v) => ((w = v), paint()) });
    const el = h('div', { class: 'plot' }),
      el2 = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('p', { class: 'plot-h' }, 'Value of $100 (log scale)'), el, h('p', { class: 'plot-h' }, 'Drop from the highest value so far'), el2, h('div', { class: 'legend' }, lg('var(--accent)', 'Index fund'), lg('var(--warn)', 'Crypto coin'), lg('var(--violet)', 'Your mix')), sl.el, read, h('p', { class: 'fine' }, 'Six simulated years, weekly. Real crypto returns have ranged from spectacular gains to total losses.'));
    const L = (v) => Math.log10(v),
      yt = [25, 50, 100, 200, 400].map(L);
    const xt = [0, 104, 208, 312];
    const plot = new Plot(el, {
      height: (w2) => (w2 < 480 ? 200 : 230),
      pad: { l: 44, r: 22, t: 10, b: 8 },
      label: 'An index fund and a crypto coin, from $100',
      draw(P) {
        const C = pal(),
          M = mix();
        P.domain(0, N - 1, L(20), L(450));
        P.grid({ xTicks: xt, yTicks: yt, noXLabels: true, yf: (v) => '$' + Math.round(10 ** v) });
        const series = (xs, c, wd) => P.line(xs.slice(0, i).map((v, j) => [j, L(v)]), { color: c, width: wd });
        series(Cr, C.warn, 1.75);
        series(I, C.accent, 2.25);
        if (w) series(M, C.violet, 2.25);
      },
    });
    const plot2 = new Plot(el2, {
      height: 110,
      pad: { l: 44, r: 22, t: 8, b: 24 },
      label: 'Drawdowns from the peak',
      draw(P) {
        const C = pal();
        P.domain(0, N - 1, -90, 0);
        P.grid({ xTicks: xt, xf: (v) => 'Yr ' + Math.round(v / 52), yTicks: [-75, -50, -25, 0], yf: (v) => (v < 0 ? SS.MINUS : '') + Math.abs(v) + '%' });
        const series = (xs, c) => P.line(dd(xs).slice(0, i).map((v, j) => [j, v]), { color: c, width: 1.75 });
        series(Cr, C.warn);
        series(I, C.accent);
        if (w) series(mix(), C.violet);
      },
    });
    function paint() {
      plot.render();
      plot2.render();
      if (i < N) return void (read.textContent = 'Six years, week by week…');
      const M = mix(),
        pc = (x) => Math.round(x * 100) + '%';
      read.innerHTML = `Worst drop from a peak: index <b>${pc(maxDD(I))}</b>, crypto <b class="loss">${pc(maxDD(Cr))}</b>, ${w ? `your mix with ${w}% in crypto` : 'a portfolio with no crypto'} <b>${pc(maxDD(M))}</b>. After six years, $100 became ${dollars(I[N - 1])} in the index, ${dollars(Cr[N - 1])} in crypto and ${dollars(M[N - 1])} in the mix. ${w <= 10 ? 'A small slice of crypto changes the ride only a little.' : 'The bigger the slice, the more the crypto crashes shake the whole portfolio.'}`;
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(4000, (k) => ((i = Math.max(2, Math.round(N * k))), paint()));
      },
      destroy: () => (cancel && cancel(), plot.destroy(), plot2.destroy()),
    };
  };

  /* ---------- buying monthly versus all at once ---------- */
  const DCA = {
    crash: { label: 'Crash, then recovery', a: [[0, 100], [5, 48], [10, 38], [16, 62], [24, 108]], seed: 34 },
    rise: { label: 'Steady rise', a: [[0, 100], [24, 210]], seed: 32 },
    fall: { label: 'Long decline', a: [[0, 100], [24, 32]], seed: 33 },
  };
  V.dcaSim = function (host, p, ctx) {
    let key = 'crash',
      chart = null;
    const sg = SS.seg({ label: 'Future', options: Object.keys(DCA).map((k) => ({ v: k, label: DCA[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, h('div', { class: 'legend' }, lg('var(--ink)', 'Price of one coin'), lg('var(--violet)', 'Monthly buyer’s average cost')), read, h('p', { class: 'fine' }, 'Simulated monthly prices. Monthly: $100 a month for 24 months. All at once: $2,400 on day one.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const d = DCA[key],
        closes = TA.path(d.a, 25, { seed: d.seed, noise: 0.05 });
      closes[0] = 100;
      const coins = closes.slice(0, 24).map((c) => 100 / c),
        avg = coins.map((_, j) => (100 * (j + 1)) / coins.slice(0, j + 1).reduce((s, x) => s + x, 0)),
        end = closes[24],
        dcaVal = coins.reduce((s, x) => s + x, 0) * end,
        lumpVal = (2400 / closes[0]) * end,
        B = lineBars(closes),
        top = Math.max(...closes) * 1.12;
      chart = TA.chart(holder, ctx, {
        bars: B,
        type: 'line',
        ms: 3800,
        label: 'Price, with the monthly buyer’s average cost',
        yRange: [0, Math.max(120, top)],
        xTicks: [0, 6, 12, 18, 24],
        xf: (v) => 'M' + v,
        dayFmt: (v) => 'Month ' + (v - 1),
        sliderLabel: 'Month',
        over(P, C, i) {
          P.line([[0, 100], [24, 100]], { color: C.muted, width: 1, dash: [4, 4] });
          P.text('All-at-once buy price', P.X(0) + 4, P.Y(100) - 9, { align: 'left', color: C.muted });
          const pts = avg.slice(0, Math.min(i, 24)).map((a, j) => [j, a]);
          if (pts.length > 1) P.line(pts, { color: C.violet, width: 2.5 });
        },
        lower: {
          label: 'Coins bought each month with $100',
          height: 90,
          range: [0, Math.max(...coins) * 1.15],
          yTicks: [0, 1, 2].filter((t) => t <= Math.max(...coins) * 1.15),
          yf: (v) => fmt(v, 0),
          draw(P, C, i) {
            for (let j = 0; j < Math.min(i, 24); j++) P.rect(j - 0.3, 0, j + 0.3, coins[j], alpha(C.gain, 0.75));
          },
        },
        onIndex(i) {
          if (i < 25) return void (read.textContent = 'Buying $100 of coins every month…');
          const diff = dcaVal - lumpVal,
            win = diff > 0 ? 'Buying monthly' : 'Investing all at once',
            WHY = {
              crash: 'The monthly buyer picked up lots of cheap coins during the crash (the tall green bars), so the recovery lifted them much further.',
              rise: 'When prices mostly rise, getting fully invested on day one wins: the monthly buyer kept paying higher prices.',
              fall: 'Both lost money. Buying monthly lost less, because it kept some money out until prices were lower, but it couldn’t turn a decline into a gain.',
            };
          read.innerHTML = `$2,400 invested all at once became <b>${dollars(lumpVal)}</b>. $100 a month became <b>${dollars(dcaVal)}</b>, at an average cost of ${usd(avg[23])} a coin. <b>${win} ended ahead by ${dollars(Math.abs(diff))}.</b> ${WHY[key]}`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };
})();
