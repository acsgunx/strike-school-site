/* Japanese Candlesticks, Unit 5 visuals: candles at a change of polarity, at a trendline and a retracement, a
   convergence builder (old high, RSI divergence, volume), candles at a moving average, a risk-and-reward planner for
   a candle signal, and a hammer whose signal holds or fails. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, seg, slider, pal, alpha, tween, ease, usd } = SS;
  const V = SS.viz;
  const TA = SS.TA;
  const CS = SS.CS;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const flipBar = (b) => ({ o: 100 - b.o, c: 100 - b.c, h: 100 - b.l, l: 100 - b.h, v: b.v });
  const argExt = (B, a, b, f) => {
    let j = a;
    for (let t = a; t <= b; t++) if (f(B[t], B[j])) j = t;
    return j;
  };
  const replayer = (host, options, value, build) => {
    let key = value,
      chart = null;
    const sg = seg({ label: 'Case', options, value, onChange: (v) => ((key = v), make(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    function make() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      chart = build(key, holder, read);
    }
    make();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- change of polarity ---------- */
  function polarityCase(bull) {
    const head = [{ a: [[0, 55], [8, 50.3], [15, 53.5], [22, 50.2], [28, 52.8], [34, 50.1], [38, 47.2], [44, 46.0]], n: 45, seed: 141, noise: 0.004 }],
      first = CS.chain(head).bars,
      low = (a, b) => Math.min(...first.slice(a, b + 1).map((x) => x.l)),
      S = (low(5, 11) + low(19, 25) + low(31, 36)) / 3,
      { bars, at } = CS.chain(head.concat([{ to: S - 0.6, n: 6, seed: 142 }, { abs: [[S - 0.55, S + 0.7, S - 0.85, S - 0.75, 1.5e6]] }, { by: -4, n: 10, seed: 143 }])),
      brk = bars.findIndex((b, j) => j > 34 && b.c < S - 0.3);
    return bull ? { B: bars.map(flipBar), S: 100 - S, K: at[2], brk } : { B: bars, S, K: at[2], brk };
  }
  V.polarityCandles = function (host, p, ctx) {
    return replayer(host, [{ v: 'bear', label: 'Support turns resistance' }, { v: 'bull', label: 'Resistance turns support' }], 'bear', (key, holder, read) => {
      const bull = key === 'bull',
        { B, S, K, brk } = polarityCase(bull),
        n = B.length,
        k = B[K],
        name = bull ? 'Hammer' : 'Shooting star';
      return TA.chart(holder, ctx, {
        bars: B,
        ms: 4000,
        label: bull ? 'Old resistance becomes support, and a hammer forms there' : 'Old support becomes resistance, and a shooting star forms there',
        yRange: CS.room(B, bull ? 1 : -1),
        over(P, C, i) {
          const before = bull ? C.loss : C.gain,
            after = bull ? C.gain : C.loss;
          P.line([[0, S], [Math.min(i, brk), S]], { color: before, width: 2 });
          P.text(bull ? 'Resistance' : 'Support', P.X(1), P.Y(S) + (bull ? -10 : 11), { align: 'left', color: before });
          if (i > brk) {
            P.line([[brk, S], [i, S]], { color: after, width: 2, dash: [6, 4] });
            P.text(bull ? 'Now support' : 'Now resistance', P.X(brk + 1), P.Y(S) + (bull ? 11 : -10), { align: 'left', color: after });
          }
          if (i > K) CS.box(P, B, K, K, { label: name, dir: bull ? 1 : -1, over: true });
        },
        onIndex(i) {
          if (i <= brk) read.textContent = `${bull ? 'Resistance' : 'Support'} near ${usd(S)} has held three times.`;
          else if (i <= K) read.innerHTML = `The level broke. ${bull ? 'Prices are pulling back toward it.' : 'Prices are rallying back toward it.'}`;
          else if (i < n) read.innerHTML = `A ${name.toLowerCase()} right at the old level.`;
          else
            read.innerHTML = bull
              ? `<b class="gain">Change of polarity.</b> Resistance near ${usd(S)} capped three rallies, then broke. When prices pulled back, the old resistance acted as support: a hammer dipped to ${usd(k.l)} and closed at ${usd(k.c)}, back above the level. From that close, prices ${CS.moved(k.c, B[n - 1].c)} by the end of the chart.`
              : `<b class="loss">Change of polarity.</b> Support near ${usd(S)} held three times, then broke. When prices rallied back, the old support acted as resistance: a shooting star poked up to ${usd(k.h)} and closed at ${usd(k.c)}, back below the level. From that close, prices ${CS.moved(k.c, B[n - 1].c)} by the end of the chart.`;
        },
      });
    });
  };

  /* ---------- candles at a trendline and at a retracement ---------- */
  function trendlineCase() {
    const head = [{ a: [[0, 44], [8, 48.5], [12, 46.6], [22, 51.5], [27, 49.3], [33, 53.2]], n: 34, seed: 151, noise: 0.004 }],
      first = CS.chain(head).bars,
      lo = (a, b) => argExt(first, a, b, (x, y) => x.l < y.l),
      l1 = lo(9, 15),
      l2 = lo(24, 30),
      line = (x) => first[l1].l + ((first[l2].l - first[l1].l) * (x - l1)) / (l2 - l1),
      L = line(39),
      { bars, at } = CS.chain(head.concat([{ to: L + 0.9, n: 5, seed: 152 }, { abs: [[L + 0.55, L + 0.88, L - 0.12, L + 0.78, 1.5e6]] }, { by: 4, n: 8, seed: 153 }]));
    return { B: bars, K: at[2], l1, l2, L };
  }
  function retraceCase() {
    const head = [{ from: 44, to: 54, n: 17, seed: 154, noise: 0.004 }],
      first = CS.chain(head).bars,
      lo = Math.min(...first.map((b) => b.l)),
      hi = Math.max(...first.map((b) => b.h)),
      top = argExt(first, 0, 16, (x, y) => x.h > y.h),
      mid = lo + (hi - lo) / 2,
      { bars, at } = CS.chain(head.concat([{ to: mid + 0.5, n: 8, seed: 155 }, { abs: [[mid + 0.55, mid + 0.65, mid - 0.25, mid - 0.05, 1.2e6], [mid - 0.25, mid + 1.05, mid - 0.35, mid + 0.95, 1.7e6]] }, { by: 3.5, n: 8, seed: 156 }]));
    return { B: bars, K: at[2], lo, hi, mid, top };
  }
  V.retraceCandle = function (host, p, ctx) {
    return replayer(host, [{ v: 'trend', label: 'At a trendline' }, { v: 'retrace', label: 'At a 50% retracement' }], 'trend', (key, holder, read) => {
      if (key === 'trend') {
        const { B, K, l1, l2, L } = trendlineCase(),
          n = B.length,
          k = B[K];
        return TA.chart(holder, ctx, {
          bars: B,
          ms: 3600,
          label: 'A hammer where a pullback meets a rising trendline',
          yRange: CS.room(B, 1),
          over(P, C, i) {
            if (i > l2 + 2) TA.ray(P, [l1, B[l1].l], [l2, B[l2].l], { toX: n - 1, color: C.accent, width: 1.75 });
            if (i > K) CS.box(P, B, K, K, { label: 'Hammer', dir: 1, over: true });
          },
          onIndex(i) {
            if (i <= l2 + 2) read.textContent = 'An uptrend with higher lows.';
            else if (i <= K) read.textContent = 'A trendline joins the higher lows. Prices are pulling back toward it.';
            else read.innerHTML = i < n ? 'A hammer, right on the trendline.' : `<b class="gain">Hammer at the trendline.</b> The pullback met the rising trendline near ${usd(L)}, and a hammer formed there: its low of ${usd(k.l)} touched the line before buyers pushed prices back up. Two signals at one place. From the hammer’s close, prices ${CS.moved(k.c, B[n - 1].c)} by the end of the chart.`;
          },
        });
      }
      const { B, K, lo, hi, mid, top } = retraceCase(),
        n = B.length,
        k = B[K + 1],
        r = hi - lo;
      return TA.chart(holder, ctx, {
        bars: B,
        ms: 3600,
        label: 'A bullish engulfing pattern at the 50% retracement',
        pad: { l: 46, r: 52, t: 16, b: 28 },
        yRange: CS.room(B, 1),
        over(P, C, i) {
          if (i > top + 2)
            SS.PV.drawLevels(
              P,
              [
                { name: '38.2%', v: hi - r * 0.382, color: C.muted, width: 1 },
                { name: '50%', v: mid, color: C.accent, width: 1.5 },
                { name: '61.8%', v: hi - r * 0.618, color: C.muted, width: 1 },
              ],
              { x0: top, x1: n - 0.2, values: false }
            );
          if (i > K + 1) CS.box(P, B, K, K + 1, { label: 'Engulfing', dir: 1, over: true });
        },
        onIndex(i) {
          if (i <= top + 2) read.textContent = 'A strong rally.';
          else if (i <= K + 1) read.textContent = 'The pullback is giving back part of the rally. Watch the retracement levels.';
          else read.innerHTML = i < n ? 'A bullish engulfing pattern at the 50% level.' : `<b class="gain">Engulfing at 50%.</b> The pullback gave back half of the rally from ${usd(lo)} to ${usd(hi)}, to about ${usd(mid)}, and a bullish engulfing pattern formed right there. Two signals at one place. From its close, prices ${CS.moved(k.c, B[n - 1].c)} by the end of the chart.`;
        },
      });
    });
  };

  /* ---------- convergence: old high, RSI divergence, volume ---------- */
  V.convergence = function (host, p, ctx) {
    const { bars: B, at } = CS.chain([{ a: [[0, 46], [24, 54], [33, 49.8], [50, 54.6]], n: 51, seed: 163, noise: 0.014 }, { rel: [[0.1, 0.9, -0.1, 0.8, 1.2e6], [0.3, 0.5, -1.6, -1.45, 2.6e6]] }, { by: -4, n: 12, seed: 162 }]);
    const E = at[1] + 1,
      n = B.length,
      rsi = TA.rsi(TA.closes(B), 14),
      p1 = argExt(B, 12, 28, (x, y) => x.h > y.h),
      p2 = argExt(B, 40, E, (x, y) => x.h > y.h),
      rAt = (j) => Math.max(...rsi.slice(j - 2, j + 1).filter((v) => v != null)),
      r1 = rAt(p1),
      r2 = rAt(p2),
      avgV = B.slice(E - 20, E).reduce((s, b) => s + b.v, 0) / 20,
      vmax = Math.max(...B.map((b) => b.v)),
      lo = Math.min(...B.map((b) => b.l)),
      hi = Math.max(...B.map((b) => b.h)),
      y0 = lo - (hi - lo) * 0.3,
      y1 = hi + (hi - lo) * 0.25;
    const F = [
      { k: 'res', label: 'Old high', on: false },
      { k: 'rsi', label: 'RSI divergence', on: false },
      { k: 'vol', label: 'Heavy volume', on: false },
    ];
    const on = (k) => F.find((f) => f.k === k).on;
    let cur = n;
    const btns = F.map((f) => {
      const b = h('button', { type: 'button', class: 'seg-btn', 'aria-pressed': 'false', onclick: () => ((f.on = !f.on), b.setAttribute('aria-pressed', String(f.on)), chart.render()) }, f.label);
      return b;
    });
    const holder = h('div');
    const cells = [0, 1, 2, 3].map(() => h('span'));
    const meterTxt = h('span');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('div', { class: 'seg', role: 'group', 'aria-label': 'Western tools' }, ...btns), holder, h('div', { class: 'ni-meter' }, h('span', { class: 'ni-meter-cells', 'aria-hidden': 'true' }, ...cells), meterTxt), read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    const chart = TA.chart(holder, ctx, {
      bars: B,
      ms: 3800,
      label: 'A bearish engulfing pattern near a top, with Western tools',
      yRange: [y0, y1],
      under(P, C, i) {
        if (!on('vol')) return;
        const bw = TA.candleWidth(P) / Math.abs(P.X(1) - P.X(0)),
          vh = (y1 - y0) * 0.2;
        for (let j = 0; j < Math.min(i, n); j++) P.rect(j - bw / 2, y0, j + bw / 2, y0 + (B[j].v / vmax) * vh, j === E ? C.accent : alpha(C.muted, 0.35));
      },
      over(P, C, i) {
        if (on('res') && i > p1) {
          P.line([[p1, B[p1].h], [n, B[p1].h]], { color: C.loss, width: 1.5, dash: [5, 4] });
          P.text('Old high', P.X(p1 + 1), P.Y(B[p1].h) - 9, { align: 'left', color: C.loss });
        }
        if (on('rsi') && i > E) P.line([[p1, B[p1].h], [p2, B[p2].h]], { color: C.violet, width: 2 });
        if (i > E) CS.box(P, B, E - 1, E, { label: 'Bearish engulfing', dir: -1 });
      },
      lower: {
        label: 'RSI (14)',
        height: 100,
        range: [20, 90],
        yTicks: [30, 50, 70],
        draw(P, C, i) {
          P.line([[-1, 70], [n, 70]], { color: C.muted, width: 1, dash: [3, 3] });
          TA.series(P, rsi, i, { color: C.ink, width: 1.75 });
          if (on('rsi') && i > E) {
            P.line([[p1, r1], [p2, r2]], { color: C.violet, width: 2 });
            P.dot(p1, r1, { color: C.violet, r: 3 });
            P.dot(p2, r2, { color: C.violet, r: 3 });
          }
        },
      },
      onIndex: (i) => ((cur = i), paint()),
    });
    function paint() {
      const i = cur,
        k = F.filter((f) => f.on).length + 1;
      cells.forEach((c, j) => c.classList.toggle('on', j < k));
      meterTxt.textContent = `Signals agreeing: ${k} of 4`;
      if (i <= E) return void (read.textContent = 'Watch the top form.');
      let t = `<b class="loss">A bearish engulfing pattern</b> on day ${E + 1}.`;
      if (on('res')) t += ` It formed at ${usd(B[p2].h)}, close to the old high of ${usd(B[p1].h)}: resistance.`;
      if (on('rsi')) t += ` The RSI peaked at ${Math.round(r1)} on the first high but only ${Math.round(r2)} on the second: a bearish divergence.`;
      if (on('vol')) t += ` Volume on the engulfing day was ${(B[E].v / avgV).toFixed(1)}× its 20-day average.`;
      if (k === 1) t += ' Switch on the Western tools to see what agrees with it.';
      if (i >= n) t += ` From the engulfing day’s close, prices ${CS.moved(B[E].c, B[n - 1].c)} by the end of the chart.`;
      read.innerHTML = t;
    }
    btns.forEach((b) => b.addEventListener('click', paint));
    paint();
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- candles at a moving average ---------- */
  function maCase(down) {
    const trend = { a: [[0, 44], [30, 53]], n: 31, seed: 171, noise: 0.004 },
      maEnd = (bars) => TA.sma(TA.closes(bars), 20).pop();
    // Aim the pullback just above the rising average, then put the hammer's low on it.
    let X = 51.5;
    for (let k = 0; k < 3; k++) X = maEnd(CS.chain([trend, { to: X, n: 5, seed: 172 }]).bars) + 0.7;
    const pre = CS.chain([trend, { to: X, n: 5, seed: 172 }]).bars,
      M = maEnd(pre) + (pre[pre.length - 1].c + 0.8 - pre[pre.length - 20].c) / 20,
      { bars, at } = CS.chain([trend, { to: X, n: 5, seed: 172 }, { abs: [[M + 0.55, M + 0.88, M - 0.1, M + 0.8, 1.5e6]] }, { by: 4, n: 8, seed: 173 }]);
    return { B: down ? bars.map(flipBar) : bars, K: at[2] };
  }
  V.maCandles = function (host, p, ctx) {
    return replayer(host, [{ v: 'up', label: 'Uptrend: rising average' }, { v: 'down', label: 'Downtrend: falling average' }], 'up', (key, holder, read) => {
      const down = key === 'down',
        { B, K } = maCase(down),
        n = B.length,
        ma = TA.sma(TA.closes(B), 20),
        k = B[K],
        name = down ? 'Shooting star' : 'Hammer';
      return TA.chart(holder, ctx, {
        bars: B,
        ms: 3600,
        label: name + ' at the 20-day moving average',
        yRange: CS.room(B, down ? -1 : 1),
        under: (P, C, i) => TA.series(P, ma, i, { color: C.violet, width: 2 }),
        over: (P, C, i) => i > K && CS.box(P, B, K, K, { label: name, dir: down ? -1 : 1, over: true }),
        onIndex(i) {
          if (i <= K) read.innerHTML = `The purple line is the 20-day average. ${down ? 'Watch the bounce.' : 'Watch the pullback.'}`;
          else if (i < n) read.textContent = `A ${name.toLowerCase()}, right at the average.`;
          else
            read.innerHTML = down
              ? `<b class="loss">Shooting star at the average.</b> The bounce reached the falling 20-day average near ${usd(ma[K])}, and a shooting star formed there, its high touching the average. From its close, prices ${CS.moved(k.c, B[n - 1].c)} by the end of the chart.`
              : `<b class="gain">Hammer at the average.</b> The pullback reached the rising 20-day average near ${usd(ma[K])}, and a hammer formed there, its low touching the average. From its close, prices ${CS.moved(k.c, B[n - 1].c)} by the end of the chart.`;
        },
      });
    });
  };

  /* ---------- is the trade worth it? ---------- */
  V.candleRR = function (host, p, ctx) {
    const PRE = CS.mini(50.6, 53.6, 4).concat(CS.mini(53.6, 49.2, 6)),
      TARGET = Math.max(...PRE.map((b) => b.h)),
      D1 = { o: 49.4, c: 48.6, h: 49.6, l: 48.3 };
    let size = 1.6,
      mode = 'close',
      cancel = null;
    const stop = () => (cancel && cancel(), (cancel = null));
    const sl = slider({ id: ctx.key + '-sz', label: 'Engulfing candle’s real body', min: 1, max: 5, step: 0.1, value: size, fmt: (v) => usd(v), onInput: (v) => (stop(), (size = v), paint()) });
    const sg = seg({ label: 'Entry', options: [{ v: 'close', label: 'Buy at the close' }, { v: 'pull', label: 'Wait for a pullback' }], value: mode, onChange: (v) => (stop(), (mode = v), paint()) });
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, el, sl.el, read);
    const calc = () => {
      const d2 = { o: 48.45, c: 48.45 + size, h: 48.45 + size + 0.15, l: 48.0 },
        entry = mode === 'close' ? d2.c : (d2.o + d2.c) / 2,
        stp = Math.min(D1.l, d2.l) - 0.1;
      return { d2, entry, stp, risk: entry - stp, rew: TARGET - entry };
    };
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 250 : 280),
      pad: { l: 46, r: 92, t: 12, b: 12 },
      label: 'A bullish engulfing pattern with its entry, stop and target',
      draw(P) {
        const C = pal(),
          { d2, entry, stp } = calc(),
          w = Math.min(26, (P.X(1) - P.X(0)) * 0.9);
        P.domain(-0.8, 13.4, 46.6, 55.2);
        P.grid({ xTicks: [], yf: (v) => '$' + v, noXLabels: true });
        PRE.forEach((b, i) => CS.candle(P, i, b, { alpha: 0.45 }));
        P.rect(12.5, entry, 13.4, Math.max(entry, TARGET), alpha(C.gain, 0.2));
        P.rect(12.5, stp, 13.4, entry, alpha(C.loss, 0.2));
        CS.candle(P, 10.4, D1, { w });
        CS.candle(P, 11.6, d2, { w });
        SS.PV.drawLevels(
          P,
          [
            { name: 'Target', v: TARGET, color: C.gain },
            { name: 'Entry', v: entry, color: C.ink, dash: null },
            { name: 'Stop', v: stp, color: C.loss },
          ],
          { x0: 9.8, x1: 13.4 }
        );
      },
    });
    function paint() {
      plot.render();
      const { entry, stp, risk, rew } = calc(),
        ratio = rew / risk,
        verdict = ratio >= 2 ? '<b class="gain">Worth considering.</b>' : ratio >= 1 ? '<b>Marginal.</b> Many traders want at least 2 to 1.' : '<b class="loss">Poor.</b> You would risk more than you could make.';
      read.innerHTML = `${verdict} Entry ${usd(entry)}, stop ${usd(stp)} just under the pattern, target ${usd(TARGET)} at the last swing high. You risk ${usd(risk)} a share to make ${usd(Math.max(0, rew))}: ${ratio > 0 ? ratio.toFixed(1) : '0'} to 1.${mode === 'pull' ? ' Waiting improves the price, but prices may never come back to it, so you might miss the trade.' : ''}`;
    }
    paint();
    return {
      play() {
        stop();
        cancel = tween(2400, (k) => {
          size = Math.round((1 + 2.4 * ease.inOut(k)) * 10) / 10;
          sl.set(size);
          paint();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- when the signal fails ---------- */
  function failCase(fail) {
    const head = [{ from: 56, to: 50.6, n: 14, seed: 181 }, { rel: [[-0.6, -0.25, -2.3, -0.3, 1.5e6]] }],
      first = CS.chain(head).bars,
      hm = first[first.length - 1],
      tail = fail ? [{ rel: [[0.1, 0.8, -0.1, 0.6, 1.1e6], [0.05, 0.4, -0.5, -0.3, 1.0e6]] }, { abs: [[null, hm.l + 0.9, hm.l - 0.75, hm.l - 0.55, 1.6e6]] }, { by: -3, n: 8, seed: 183 }] : [{ by: 4, n: 11, seed: 182 }],
      { bars, at } = CS.chain(head.concat(tail));
    return { B: bars, K: at[1], X: fail ? at[3] : -1 };
  }
  V.signalFails = function (host, p, ctx) {
    return replayer(host, [{ v: 'works', label: 'Signal holds' }, { v: 'fails', label: 'Signal fails' }], 'fails', (key, holder, read) => {
      const fail = key === 'fails',
        { B, K, X } = failCase(fail),
        n = B.length,
        hm = B[K];
      return TA.chart(holder, ctx, {
        bars: B,
        ms: 3400,
        label: fail ? 'A hammer whose low is broken on a close' : 'A hammer whose low holds',
        yRange: CS.room(B, 1),
        over(P, C, i) {
          if (i <= K) return;
          CS.box(P, B, K, K, { label: 'Hammer', dir: 1 });
          P.line([[K - 0.5, hm.l], [n, hm.l]], { color: C.loss, width: 1.5, dash: [5, 4] });
          if (!fail || i <= X) P.text('Stop: the hammer’s low', P.X(K + 0.8), P.Y(hm.l) + 10, { align: 'left', color: C.loss });
          // To the right of the stop-out day, level with its high: later days trade lower, so that space is empty.
          if (fail && i > X) P.tag('Stopped out', P.X(X), P.Y(B[X].h), { bg: C.loss, align: 'left', dy: -10 });
        },
        onIndex(i) {
          if (i <= K) read.textContent = 'A decline. Watch for a hammer.';
          else if (i < n) read.innerHTML = `A hammer. Buy at its close of ${usd(hm.c)}, with a stop under its low of ${usd(hm.l)}.`;
          else
            read.innerHTML = fail
              ? `<b class="loss">The signal failed.</b> On day ${X + 1}, prices closed at ${usd(B[X].c)}, below the hammer’s low, and you sold: a loss of ${usd(hm.c - B[X].c)} a share. From your entry, prices ${CS.moved(hm.c, B[n - 1].c)} by the end of the chart. The small, planned loss was the price of being wrong, and it told you the buyers had lost.`
              : `<b class="gain">The signal held.</b> Prices never closed below the hammer’s low of ${usd(hm.l)}. From the hammer’s close of ${usd(hm.c)}, they ${CS.moved(hm.c, B[n - 1].c)} by the end of the chart. The stop was never needed, but it fixed the risk in advance at ${usd(hm.c - hm.l)} a share.`;
        },
      });
    });
  };
})();
