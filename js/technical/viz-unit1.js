/* Technical Analysis, Unit 1 visuals: annotated chart, random walks, chart types, candles, volume, timeframes, scales. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, pct, usd, pal, alpha, tween, ease } = SS;
  const V = SS.viz,
    TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const volLower = (bars, extra = {}) => ({
    height: 74,
    range: [0, Math.max(...bars.map((b) => b.v)) * 1.1],
    yf: TA.fmtVol,
    yTicks: [],
    label: 'Volume',
    draw: (P, C, i) => TA.drawVolume(P, bars, i, extra),
  });

  /* ---------- what a technician sees ---------- */
  V.taAnnotate = function (host, p, ctx) {
    const n = 110;
    const closes = TA.path([[0, 50], [18, 57], [26, 53.5], [42, 62], [50, 58.5], [66, 62.6], [72, 62], [80, 67.5], [92, 71], [100, 69], [109, 73]], n, { seed: 11, noise: 0.006 });
    const bars = TA.bars(closes, { seed: 11, volMul: (i) => (i >= 79 && i <= 81 ? 3.2 : 1) });
    const ma = TA.sma(closes, 20);
    const lowAt = (a, b) => {
      let k = a;
      for (let j = a; j <= b; j++) if (bars[j].l < bars[k].l) k = j;
      return [k, bars[k].l];
    };
    const L1 = lowAt(20, 32),
      L2 = lowAt(44, 56);
    const notes = [
      ['Trend', 'Higher lows: each dip stops above the last one.', 'accent'],
      ['Resistance turned support', 'The $63 ceiling broke, then held as a floor.', 'violet'],
      ['Volume surge', 'Heavy trading confirmed the breakout.', 'warn'],
      ['Moving average', 'The 20-day average smooths out daily noise.', 'put'],
    ];
    let shown = notes.length,
      timers = [];
    const box = stack(host);
    const list = h('ol', { class: 'ta-notes' }, notes.map(([t, d, c], k) => h('li', { class: 'on c-' + c, 'data-k': k }, h('b', null, t), h('span', null, d))));
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'An annotated price chart',
      lower: volLower(bars, { color: (j, b) => (shown >= 3 && j >= 79 && j <= 81 ? alpha(pal().warn, 0.95) : null) }),
      over(P, C, i) {
        if (i < n) return;
        if (shown >= 1) {
          TA.ray(P, L1, L2, { toX: n - 1, color: C.accent, width: 2, dash: [6, 4] });
          P.tag('1', P.X(L2[0]), P.Y(L2[1]), { bg: C.accent, dy: 8 });
        }
        if (shown >= 2) {
          P.line([[38, 63], [n - 1, 63]], { color: C.violet, width: 2, dash: [3, 3] });
          P.tag('2', P.X(70), P.Y(63), { bg: C.violet, dy: 8 });
        }
        if (shown >= 3) P.tag('3', P.X(80), P.Y(bars[80].h), { bg: C.warn });
        if (shown >= 4) {
          TA.series(P, ma, n, { color: C.put, width: 2 });
          P.tag('4', P.X(100), P.Y(ma[100]), { bg: C.put, dy: 10 });
        }
      },
      onDone: () => reveal(),
    });
    box.append(list);
    function paintList() {
      list.querySelectorAll('li').forEach((li) => li.classList.toggle('on', +li.dataset.k < shown));
    }
    function clear() {
      timers.forEach(clearTimeout);
      timers = [];
    }
    function reveal() {
      clear();
      notes.forEach((_, k) =>
        timers.push(
          setTimeout(() => {
            shown = k + 1;
            paintList();
            chart.render();
          }, 300 + k * 750)
        )
      );
    }
    return {
      play() {
        if (SS.reduced) return;
        clear();
        shown = 0;
        paintList();
        chart.play();
      },
      destroy: () => (clear(), chart.destroy()),
    };
  };

  /* ---------- random walks look like patterns ---------- */
  V.randomPatterns = function (host) {
    let seed = 3,
      reveal = 1,
      cancel = null,
      data = [];
    const roll = () => (data = [0, 1, 2, 3].map((k) => TA.walk(90, { seed: seed * 31 + k * 7 + 1, vol: 0.016, start: 50 })));
    roll();
    const grid = h('div', { class: 'rp-grid' });
    const plots = [0, 1, 2, 3].map((k) => {
      const el = h('div', { class: 'plot' });
      grid.append(h('div', { class: 'rp-cell' }, h('b', null, 'Chart ' + 'ABCD'[k]), el));
      return new Plot(el, {
        height: 130,
        pad: { l: 38, r: 8, t: 8, b: 8 },
        label: 'Random walk chart ' + 'ABCD'[k],
        draw(P) {
          const C = pal(),
            d = data[k],
            lo = Math.min(...d) * 0.97,
            hi = Math.max(...d) * 1.03;
          P.domain(0, 89, lo, hi);
          P.grid({ noXLabels: true, yf: (v) => '$' + Math.round(v), yTicks: SS.niceTicks(lo, hi, 2) });
          const pts = d.slice(0, Math.max(2, Math.round(90 * reveal))).map((v, i) => [i, v]);
          P.area(pts, lo, C.accent, 0.12);
          P.line(pts, { color: C.ink, width: 1.75 });
        },
      });
    });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => (seed++, roll(), play()) }, 'Flip new coins');
    stack(host, grid, h('div', { class: 'ctl-row' }, btn), h('p', { class: 'readout' }, 'Every chart: each day a coin flip decides up or down, by about 1.6%. No trends, no support, no patterns were built in. Flip again and you will still find them.'));
    function play() {
      if (cancel) cancel();
      cancel = tween(1800, (k) => {
        reveal = ease.out(k);
        plots.forEach((pl) => pl.render());
      });
    }
    return { play, destroy: () => (cancel && cancel(), plots.forEach((pl) => pl.destroy())) };
  };

  /* ---------- line vs bar vs candle ---------- */
  V.chartTypes = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 40], [12, 44], [20, 42], [32, 47], [39, 46]], 40, { seed: 5, noise: 0.01 }), { seed: 5, wick: 0.009 });
    let from = 'candle',
      to = 'candle',
      m = 1,
      cancel = null;
    const TXT = {
      line: 'Line chart: only the closes are drawn. Clean, but it hides each day’s range.',
      ohlc: 'Bar chart: a vertical line from low to high, a tick left for the open and a tick right for the close.',
      candle: 'Candlestick chart: the same four prices, with a colored body from open to close so the winner of each day stands out.',
    };
    const sg = seg({ label: 'Chart type', options: [{ v: 'line', label: 'Line' }, { v: 'ohlc', label: 'Bar (OHLC)' }, { v: 'candle', label: 'Candlestick' }], value: 'candle', onChange: (v) => morph(v) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const desc = h('p', { class: 'readout' });
    const box = stack(host, sg.el);
    const drawType = (P, C, t, a) => {
      if (t === 'line') TA.series(P, TA.closes(bars), bars.length, { color: C.ink, width: 2.25, alpha: a });
      else if (t === 'ohlc') TA.drawOHLC(P, bars, bars.length, { alpha: a });
      else TA.drawCandles(P, bars, bars.length, { alpha: a, widthScale: 0.4 + 0.6 * a });
    };
    const chart = TA.chart(box, ctx, {
      bars,
      type: 'none',
      controls: false,
      label: 'The same prices as line, bar or candlestick chart',
      over(P, C) {
        if (m < 1) drawType(P, C, from, 1 - m);
        drawType(P, C, to, m);
      },
      onIndex(i) {
        const b = bars[Math.min(i, bars.length) - 1];
        read.innerHTML = `Day ${Math.min(i, bars.length)}: open <b>${usd(b.o)}</b>, high <b>${usd(b.h)}</b>, low <b>${usd(b.l)}</b>, close <b class="${b.c >= b.o ? 'gain' : 'loss'}">${usd(b.c)}</b>. Drag across the chart to read any day.`;
      },
    });
    box.append(desc, read);
    function morph(v) {
      if (cancel) cancel();
      from = to;
      to = v;
      m = 0;
      desc.textContent = TXT[v];
      cancel = tween(700, (k) => {
        m = ease.inOut(k);
        chart.render();
      });
    }
    desc.textContent = TXT.candle;
    return {
      play() {
        from = 'line';
        to = 'line';
        m = 1;
        sg.set('line');
        desc.textContent = TXT.line;
        chart.render();
        setTimeout(() => (sg.set('ohlc'), morph('ohlc')), 900);
        setTimeout(() => (sg.set('candle'), morph('candle')), 2100);
      },
      destroy: () => (cancel && cancel(), chart.destroy()),
    };
  };

  /* ---------- candle anatomy ---------- */
  V.candleAnatomy = function (host, p, ctx) {
    let o = 49,
      hi = 55,
      lo = 46,
      c = 53,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const mk = (id, label, v, set) => slider({ id: ctx.key + '-' + id, label, min: 44, max: 57, step: 0.25, value: v, fmt: (x) => usd(x), onInput: (x) => (set(x), paint()) });
    const sO = mk('o', 'Open', o, (x) => (o = x)),
      sH = mk('h', 'High', hi, (x) => (hi = x)),
      sL = mk('l', 'Low', lo, (x) => (lo = x)),
      sC = mk('c', 'Close', c, (x) => (c = x));
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('div', { class: 'ca-row' }, plotEl, h('div', { class: 'ca-ctl' }, sO.el, sC.el, sH.el, sL.el)), read);
    const plot = new Plot(plotEl, {
      height: 300,
      pad: { l: 46, r: 8, t: 12, b: 12 },
      label: 'Anatomy of a candlestick',
      draw(P) {
        const C = pal(),
          H = Math.max(hi, o, c),
          L = Math.min(lo, o, c),
          up = c >= o,
          col = up ? C.gain : C.loss;
        P.domain(-1, 1.9, 43.5, 57.5);
        P.grid({ noXLabels: true, xTicks: [], yf: (v) => '$' + v, yTicks: [44, 48, 52, 56] });
        const x = P.X(0),
          w = Math.min(70, (P.X(1) - P.X(0)) * 0.55),
          ctx2 = P.c;
        ctx2.save();
        ctx2.strokeStyle = col;
        ctx2.lineWidth = 3;
        ctx2.beginPath();
        ctx2.moveTo(x, P.Y(H));
        ctx2.lineTo(x, P.Y(L));
        ctx2.stroke();
        ctx2.fillStyle = col;
        const y1 = P.Y(Math.max(o, c)),
          y2 = P.Y(Math.min(o, c));
        ctx2.fillRect(x - w / 2, y1, w, Math.max(3, y2 - y1));
        ctx2.restore();
        const lab = (y, t, strong) => {
          const ly = P.Y(y);
          P.line([[0.32, y], [0.5, y]], { color: C.muted, width: 1 });
          P.text(t, P.X(0.55), ly, { align: 'left', color: strong ? C.ink : C.muted, weight: strong ? 700 : 500 });
        };
        lab(H, 'High ' + usd(H), true);
        if (H - Math.max(o, c) > 0.6) lab((H + Math.max(o, c)) / 2, 'Upper wick');
        lab(Math.max(o, c), (up ? 'Close ' : 'Open ') + usd(Math.max(o, c)), true);
        if (Math.abs(o - c) > 1) lab((o + c) / 2, 'Body');
        lab(Math.min(o, c), (up ? 'Open ' : 'Close ') + usd(Math.min(o, c)), true);
        if (Math.min(o, c) - L > 0.6) lab((L + Math.min(o, c)) / 2, 'Lower wick');
        lab(L, 'Low ' + usd(L), true);
      },
    });
    function paint() {
      plot.render();
      const H = Math.max(hi, o, c),
        L = Math.min(lo, o, c),
        body = Math.abs(c - o),
        rng = H - L || 1;
      const up = c >= o;
      let shape = up ? 'Buyers won the day: it closed above the open.' : 'Sellers won the day: it closed below the open.';
      if (body / rng < 0.12) shape = 'Open and close are almost equal: a doji. Neither side won; a sign of indecision.';
      else if (H - Math.max(o, c) > 2 * body) shape += ' The long upper wick shows buyers were pushed back from the highs.';
      else if (Math.min(o, c) - L > 2 * body) shape += ' The long lower wick shows sellers were pushed back from the lows.';
      read.innerHTML = `${shape} Range ${usd(rng)}; the body is ${pct(body / rng, { d: 0 })} of it.`;
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        const target = c;
        cancel = tween(1400, (k) => {
          c = Math.round((o + (target - o) * ease.out(k)) * 4) / 4;
          sC.set(c);
          paint();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- a candle forming tick by tick ---------- */
  V.candleBirth = function (host, p, ctx) {
    const DAYS = {
      bull: { label: 'Buyers in control', a: [[0, 50], [12, 49.4], [40, 52], [55, 51.6], [77, 53.2]], name: 'Long green candle', mean: 'Buyers pushed all day and closed near the high.' },
      bear: { label: 'Sellers in control', a: [[0, 50], [10, 50.6], [40, 48], [56, 48.5], [77, 46.9]], name: 'Long red candle', mean: 'Sellers dominated and it closed near the low.' },
      doji: { label: 'Tug of war', a: [[0, 50], [18, 52], [42, 48.2], [62, 50.8], [77, 50.05]], name: 'Doji', mean: 'Big swings both ways, but it closed where it opened. Indecision.' },
      star: { label: 'Rejected at the highs', a: [[0, 50], [28, 54], [50, 52.3], [77, 50.2]], name: 'Shooting star', mean: 'A rally that was sold off. The long upper wick shows rejection of higher prices.' },
      hammer: { label: 'Rejected at the lows', a: [[0, 50], [28, 46], [52, 48.7], [77, 49.9]], name: 'Hammer', mean: 'A sell-off that was bought back. The long lower wick shows rejection of lower prices.' },
    };
    let key = 'star',
      m = 78,
      ticks = [],
      cancel = null;
    const make = () => {
      ticks = TA.path(DAYS[key].a, 78, { seed: 9, noise: 0.0022 });
      ticks[0] = 50;
    };
    make();
    const sg = seg({ label: 'Kind of day', options: Object.keys(DAYS).map((k) => ({ v: k, label: DAYS[k].label })), value: key, onChange: (v) => ((key = v), make(), play()) });
    const left = h('div', { class: 'plot' }),
      right = h('div', { class: 'plot' });
    const read = h('div', { class: 'duo-card txt', 'aria-live': 'polite' });
    stack(host, sg.el, h('div', { class: 'cb-grid' }, h('div', null, h('p', { class: 'plot-h' }, 'Price through the day'), left), h('div', null, h('p', { class: 'plot-h' }, 'The day’s candle'), right)), read);
    const yr = [45, 55.5];
    const clock = (t) => {
      const mins = 570 + t * 5,
        hh = Math.floor(mins / 60),
        mm = mins % 60;
      return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`;
    };
    const pL = new Plot(left, {
      height: 230,
      label: 'Intraday price',
      draw(P) {
        const C = pal();
        P.domain(0, 77, yr[0], yr[1]);
        P.grid({ xTicks: [0, 24, 48, 77], xf: (v) => clock(v), yf: (v) => '$' + v, yTicks: [46, 48, 50, 52, 54] });
        P.hline(50, { color: C.muted, dash: [3, 3], label: 'Open $50' });
        const pts = ticks.slice(0, m).map((v, i) => [i, v]);
        P.line(pts, { color: C.ink, width: 2 });
        if (pts.length) P.dot(pts.length - 1, pts[pts.length - 1][1], { color: C.accent, r: 4 });
      },
    });
    const pR = new Plot(right, {
      height: 230,
      pad: { l: 8, r: 8 },
      label: 'The candle so far',
      draw(P) {
        const C = pal(),
          seen = ticks.slice(0, Math.max(1, m));
        const o = 50,
          c = seen[seen.length - 1],
          H = Math.max(...seen),
          L = Math.min(...seen),
          col = c >= o ? C.gain : C.loss;
        P.domain(-1, 1, yr[0], yr[1]);
        P.grid({ noXLabels: true, noYLabels: true, xTicks: [], yTicks: [46, 48, 50, 52, 54] });
        const x = P.X(0),
          w = Math.min(46, P.w * 0.3),
          k = P.c;
        k.save();
        k.strokeStyle = col;
        k.lineWidth = 3;
        k.beginPath();
        k.moveTo(x, P.Y(H));
        k.lineTo(x, P.Y(L));
        k.stroke();
        k.fillStyle = col;
        const y1 = P.Y(Math.max(o, c)),
          y2 = P.Y(Math.min(o, c));
        k.fillRect(x - w / 2, y1, w, Math.max(3, y2 - y1));
        k.restore();
      },
    });
    function paint() {
      pL.render();
      pR.render();
      const d = DAYS[key],
        seen = ticks.slice(0, Math.max(1, m)),
        c = seen[seen.length - 1];
      read.innerHTML =
        m < 78
          ? `<span class="duo-l">${clock(m - 1)} · price ${usd(c)}</span><b>The candle is still forming</b><span>High so far ${usd(Math.max(...seen))}, low so far ${usd(Math.min(...seen))}.</span>`
          : `<span class="duo-l">4:00 close · ${usd(c)}</span><b>${d.name}</b><span>${d.mean}</span>`;
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(3600, (k) => {
        m = Math.max(1, Math.round(78 * k));
        paint();
      });
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), pL.destroy(), pR.destroy()) };
  };

  /* ---------- volume bars ---------- */
  V.volumeChart = function (host, p, ctx) {
    const n = 60;
    const spikes = { 18: 2.6, 37: 3.2, 51: 2.4 };
    const bars = TA.bars(TA.path([[0, 30], [17, 31], [18, 33], [30, 32.5], [37, 35.5], [45, 35], [51, 33], [59, 34.5]], n, { seed: 21, noise: 0.007 }), { seed: 21, volMul: (i) => spikes[i] || 1 });
    const avg = TA.sma(bars.map((b) => b.v), 20);
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'Price with volume',
      lower: {
        height: 90,
        label: 'Volume, with its 20-day average',
        range: [0, Math.max(...bars.map((b) => b.v)) * 1.1],
        yf: TA.fmtVol,
        yTicks: [],
        draw(P, C, i) {
          TA.drawVolume(P, bars, i, { color: (j, b) => (avg[j] && b.v > 2 * avg[j] ? alpha(C.warn, 0.95) : null) });
          TA.series(P, avg, i, { color: C.ink, width: 1.5, dash: [4, 3] });
        },
      },
      onIndex(i) {
        const j = i - 1,
          b = bars[j],
          chg = j ? b.c / bars[j - 1].c - 1 : 0,
          ratio = avg[j] ? b.v / avg[j] : null;
        read.innerHTML = `Day ${i}: close <b>${usd(b.c)}</b> (<span class="${SS.plClass(chg)}">${pct(chg, { sign: true })}</span>), volume <b>${TA.fmtVol(b.v)}</b>${ratio ? `, <b class="${ratio > 2 ? 'accent' : ''}">${ratio.toFixed(1)}×</b> its 20-day average` : ''}.`;
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- breakouts: volume confirms ---------- */
  V.volumeConfirm = function (host, p, ctx) {
    const base = [[0, 56], [8, 59.6], [14, 56.4], [22, 59.7], [29, 56.8], [36, 59.5], [39, 59.2]];
    const CASES = {
      strong: { label: 'Breakout on heavy volume', tail: [[40, 60.8], [44, 63], [50, 65.5], [59, 66.5]], vol: 3.2, end: 'Volume more than tripled on the breakout, and price kept climbing. Real buyers were behind it.' },
      weak: { label: 'Breakout on light volume', tail: [[40, 60.6], [43, 61], [48, 58.6], [59, 57]], vol: 0.6, end: 'The breakout came on below-average volume and slid back under $60: a false breakout that trapped eager buyers.' },
    };
    let key = 'strong',
      chart = null;
    const sg = seg({ label: 'Scenario', options: Object.keys(CASES).map((k) => ({ v: k, label: CASES[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const cs = CASES[key];
      const bars = TA.bars(TA.path(base.concat(cs.tail), 60, { seed: 4, noise: 0.004 }), { seed: 4, volMul: (i) => (i >= 40 && i <= 42 ? cs.vol : 1) });
      chart = TA.chart(holder, ctx, {
        bars,
        yRange: [54, 68],
        label: 'Breakout with and without volume',
        lower: volLower(bars, { color: (j) => (j >= 40 && j <= 42 ? alpha(pal().warn, 0.95) : null) }),
        under(P, C) {
          P.hline(60, { color: C.violet, dash: [5, 4], label: 'Resistance $60' });
        },
        over(P, C, i) {
          if (i > 40) P.tag('Breakout', P.X(40), P.Y(bars[40].h), { bg: C.warn });
        },
        onIndex(i) {
          read.innerHTML = i < 41 ? 'Price keeps bumping into $60 and falling back: resistance. Watch what happens when it finally breaks.' : i < 60 ? `Day ${i}: ${usd(bars[i - 1].c)}.` : cs.end;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- on-balance volume divergence ---------- */
  V.obvChart = function (host, p, ctx) {
    const n = 70;
    const bars = TA.bars(TA.path([[0, 40], [20, 46], [30, 44], [45, 50], [53, 48.4], [69, 52.4]], n, { seed: 33, noise: 0.006 }), { seed: 33, volMul: (i, up) => (i < 46 ? (up ? 1.5 : 0.7) : up ? 0.55 : 1.7) });
    const obv = TA.obv(bars);
    const hiAt = (a, b, arr) => {
      let k = a;
      for (let j = a; j <= b; j++) if (arr[j] > arr[k]) k = j;
      return k;
    };
    const highs = bars.map((b) => b.h);
    const p1 = hiAt(38, 50, highs),
      p2 = hiAt(60, 69, highs);
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const range = [Math.min(...obv) * 1.1 - 1e6, Math.max(...obv) * 1.1 + 1e6];
    const chart = TA.chart(box, ctx, {
      bars,
      label: 'Price with on-balance volume',
      over(P, C, i) {
        if (i < n) return;
        P.line([[p1, highs[p1]], [p2, highs[p2]]], { color: C.gain, width: 2, dash: [5, 4] });
        P.tag('Higher high', P.X(p2), P.Y(highs[p2]), { bg: C.gain, align: 'right' });
      },
      lower: {
        height: 110,
        label: 'On-balance volume',
        range,
        yf: (v) => TA.fmtVol(Math.abs(v)),
        yTicks: [],
        draw(P, C, i) {
          TA.series(P, obv, i, { color: C.accent, width: 2.25 });
          if (i >= n) {
            P.line([[p1, obv[p1]], [p2, obv[p2]]], { color: C.loss, width: 2, dash: [5, 4] });
            P.tag('Lower high', P.X(p2), P.Y(obv[p2]), { bg: C.loss, align: 'right', dy: 8 });
          }
        },
      },
      onIndex(i) {
        read.innerHTML = i < n ? `Day ${i}: OBV ${obv[i - 1] >= 0 ? 'is' : 'has fallen to'} ${TA.fmtVol(Math.abs(obv[i - 1]))}${obv[i - 1] < 0 ? ' below zero' : ''}.` : 'Price made a higher high, but OBV made a lower high: a bearish divergence. Volume was flowing out even as price rose.';
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- timeframes ---------- */
  V.timeframes = function (host, p, ctx) {
    const daily = TA.bars(TA.walk(240, { seed: 77, start: 40, drift: 0.0011, vol: 0.016 }), { seed: 77 });
    const SETS = { d: ['Daily', daily, 'day'], w: ['Weekly', TA.aggregate(daily, 5), 'week'], m: ['Monthly', TA.aggregate(daily, 20), 'month'] };
    let key = 'd',
      chart = null;
    const sg = seg({ label: 'Timeframe', options: Object.keys(SETS).map((k) => ({ v: k, label: SETS[k][0] })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read);
    const lo = Math.min(...daily.map((b) => b.l)),
      hi = Math.max(...daily.map((b) => b.h));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const [label, bars, unit] = SETS[key];
      chart = TA.chart(holder, ctx, {
        bars,
        yRange: [lo * 0.95, hi * 1.05],
        ms: 1500,
        label: label + ' candles',
        xf: (v) => unit[0].toUpperCase() + (Math.round(v) + 1),
        sliderLabel: label + ' candle',
        dayFmt: (v) => `${v} of ${bars.length}`,
      });
      const ups = bars.filter((b) => b.c >= b.o).length;
      read.innerHTML = `The same 240 trading days as <b>${bars.length} ${unit}ly candles</b>. ${pct(ups / bars.length, { d: 0 })} of them are green. ${key === 'd' ? 'Lots of back-and-forth noise.' : key === 'w' ? 'The noise fades and the uptrend is clearer.' : 'Only the big picture is left: a steady climb.'}`;
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- linear vs log scale ---------- */
  V.logScale = function (host) {
    const N = 361;
    const cs = TA.walk(N, { seed: 15, start: 10, drift: Math.log(1.15) / 12, vol: 0.055 });
    const mn = Math.min(...cs),
      mx = Math.max(...cs);
    let m = 0,
      cancel = null;
    const lin = (v) => v / (mx * 1.05),
      lg = (v) => (Math.log(v) - Math.log(mn * 0.9)) / (Math.log(mx * 1.1) - Math.log(mn * 0.9));
    const yOf = (v) => (1 - m) * lin(v) + m * lg(v);
    const sg = seg({ label: 'Price scale', options: [{ v: 'lin', label: 'Linear' }, { v: 'log', label: 'Logarithmic' }], value: 'lin', onChange: (v) => go(v === 'log' ? 1 : 0) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, read, h('p', { class: 'fine' }, 'Simulated: a stock compounding about 15% a year for 30 years, with monthly closes.'));
    const doublings = [];
    for (let v = 10; v <= mx * 1.05; v *= 2) doublings.push(v);
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 240 : 280),
      label: 'Price history on a linear or log scale',
      draw(P) {
        const C = pal();
        P.domain(0, N - 1, 0, 1);
        P.grid({ xTicks: [0, 120, 240, 360], xf: (v) => 'Year ' + Math.round(v / 12), yTicks: [], noYLabels: true, zero: false });
        doublings.forEach((v) => {
          const y = yOf(v);
          P.hline(y, { color: C.muted, dash: [2, 4], alpha: 0.7 });
          if (m > 0.5 || v >= 80) P.text('$' + Math.round(v), P.pad.l - 6, P.Y(y), { align: 'right', color: C.muted, clamp: false });
        });
        const pts = cs.map((v, i) => [i, yOf(v)]);
        P.area(pts, 0, C.accent, 0.12);
        P.line(pts, { color: C.ink, width: 2 });
        P.vline(120, { color: C.put, dash: [3, 3], label: 'First 10 years' });
      },
    });
    function paint() {
      plot.render();
      const x10 = cs[120] / cs[0],
        x30 = cs[N - 1] / cs[120];
      read.innerHTML = m < 0.5 ? `Linear scale: the first 10 years look flat, yet the price went from $10 to <b>${usd(cs[120])}</b> (×${x10.toFixed(1)}). Big recent dollar moves dominate the picture.` : `Log scale: each dashed line is a doubling, evenly spaced. The first decade's ×${x10.toFixed(1)} now looks as large as it really was, compared with ×${x30.toFixed(1)} over the next 20 years.`;
    }
    function go(target) {
      if (cancel) cancel();
      const from = m;
      cancel = tween(1000, (k) => {
        m = from + (target - from) * ease.inOut(k);
        paint();
      });
    }
    paint();
    return {
      play() {
        setTimeout(() => (sg.set('log'), go(1)), 1000);
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };
})();
