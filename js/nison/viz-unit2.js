/* Japanese Candlesticks, Unit 2 visuals: an engulfing builder, the features that strengthen an engulfing pattern, how
   deep a dark cloud or piercing day reaches, the three on a chart, a harami builder, and tweezers and belt holds. */
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
  const bigW = (P) => Math.min(36, (P.X(1) - P.X(0)) * 1.15);
  const signed = (v) => (v < 0 ? SS.MINUS : '') + Math.abs(v) + '%';
  // A dashed outline of a real body stretched from x0 to x1: what the next body must cover, or fit inside.
  function ghostBody(P, b, x0, x1, color) {
    const k = P.c,
      y0 = P.Y(Math.max(b.o, b.c)),
      y1 = P.Y(Math.min(b.o, b.c));
    k.save();
    k.strokeStyle = color;
    k.lineWidth = 1.25;
    k.setLineDash([4, 3]);
    k.strokeRect(P.X(x0), y0, P.X(x1) - P.X(x0), y1 - y0);
    k.restore();
  }
  const ruleList = (el, rules) => el.replaceChildren(...rules.map((r) => h('li', { class: r.ok ? 'ok' : 'no' }, h('span', { class: 'mu-rule-i', 'aria-hidden': 'true' }, r.ok ? '✓' : '✗'), r.text)));

  /* ---------- engulfing builder ---------- */
  V.engulfBuild = function (host, p, ctx) {
    const SIDE = {
      bull: { trend: CS.mini(58.6, 52.3, 6), d1: { o: 52.2, c: 51.0, h: 52.7, l: 50.1 }, o2: 50.7, min: 49.9, max: 54.4, end: 53.0, y: [47.6, 59.8] },
      bear: { trend: CS.mini(43.2, 49.7, 6), d1: { o: 49.8, c: 51.0, h: 51.9, l: 49.3 }, o2: 51.3, min: 47.4, max: 52.0, end: 48.8, y: [42.0, 54.2] },
    };
    let side = 'bull',
      c2 = SIDE.bull.end,
      cancel = null;
    const stop = () => (cancel && cancel(), (cancel = null));
    const sl = slider({ id: ctx.key + '-c2', label: 'Day 2’s close', min: SIDE.bull.min, max: SIDE.bull.max, step: 0.05, value: c2, fmt: (v) => usd(v), onInput: (v) => (stop(), (c2 = v), paint()) });
    const sg = seg({
      label: 'Pattern',
      options: [{ v: 'bull', label: 'Bullish engulfing' }, { v: 'bear', label: 'Bearish engulfing' }],
      value: side,
      onChange: (v) => {
        side = v;
        sl.setRange(SIDE[v].min, SIDE[v].max);
        play();
      },
    });
    const el = h('div', { class: 'plot' });
    const checks = h('ul', { class: 'mu-rules' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, el, checks, sl.el, read);
    const day2 = () => {
      const o = SIDE[side].o2;
      return { o, c: c2, h: Math.max(o, c2) + 0.3, l: Math.min(o, c2) - 0.3 };
    };
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 240 : 270),
      pad: { l: 46, r: 8, t: 12, b: 22 },
      label: 'Two candles: does the second real body engulf the first?',
      draw(P) {
        const C = pal(),
          S = SIDE[side],
          d2 = day2(),
          w = bigW(P);
        P.domain(-0.8, 10.2, S.y[0], S.y[1]);
        P.grid({ xTicks: [], yf: (v) => '$' + v, noXLabels: true });
        S.trend.forEach((t, i) => CS.candle(P, i, t, { alpha: 0.45 }));
        ghostBody(P, S.d1, 6.35, 9.25, C.muted);
        CS.candle(P, 7, S.d1, { w });
        CS.candle(P, 8.6, d2, { w, color: Math.abs(d2.c - d2.o) < 0.06 ? C.ink : null });
        P.text('Day 1', P.X(7), P.h - 9, { color: C.muted });
        P.text('Day 2', P.X(8.6), P.h - 9, { color: C.muted });
      },
    });
    function paint() {
      plot.render();
      const S = SIDE[side],
        d1 = S.d1,
        bull = side === 'bull',
        o2 = S.o2,
        opp = bull ? c2 > o2 + 0.02 : c2 < o2 - 0.02,
        eng = bull ? c2 >= d1.o : c2 <= d1.o,
        lo1 = Math.min(d1.o, d1.c),
        hi1 = Math.max(d1.o, d1.c),
        cover = opp ? Math.max(0, Math.min(hi1, Math.max(o2, c2)) - Math.max(lo1, Math.min(o2, c2))) / (hi1 - lo1) : 0,
        shadowLeft = bull ? c2 < d1.h : c2 > d1.l;
      ruleList(checks, [
        { ok: true, text: bull ? 'A clear decline before it' : 'A clear rally before it' },
        { ok: opp, text: `Day 2’s real body is ${bull ? 'green' : 'red'}, the opposite of day 1’s` },
        { ok: eng, text: 'Day 2’s real body wraps around day 1’s real body' },
      ]);
      if (!opp) read.innerHTML = `Day 2 is ${bull ? 'red' : 'green'} too, or flat: the same color as day 1. <b>No reversal signal.</b>`;
      else if (!eng) read.innerHTML = `<b>Not yet.</b> Day 2’s ${bull ? 'green' : 'red'} body covers ${Math.round(cover * 100)}% of day 1’s body. It must close ${bull ? 'above' : 'below'} day 1’s open (${usd(d1.o)}) to engulf it.`;
      else read.innerHTML = `<b class="${bull ? 'gain' : 'loss'}">${bull ? 'Bullish' : 'Bearish'} engulfing.</b> Day 2’s body wraps around day 1’s${shadowLeft ? `, even though it doesn’t cover day 1’s ${bull ? 'upper' : 'lower'} shadow. Only the real bodies count.` : ', shadows and all.'} The ${bull ? 'sellers’' : 'buyers’'} session was completely undone.`;
    }
    function play() {
      stop();
      const S = SIDE[side];
      cancel = tween(2200, (k) => {
        c2 = Math.round((S.o2 + (S.end - S.o2) * ease.out(k)) * 20) / 20;
        sl.set(c2);
        paint();
      });
    }
    paint();
    return { play, destroy: () => (stop(), plot.destroy()) };
  };

  /* ---------- what makes an engulfing pattern stronger ---------- */
  V.engulfStrength = function (host, p, ctx) {
    const F = [
      { k: 'tiny', label: 'Tiny first body', on: true, txt: 'a tiny first body' },
      { k: 'long', label: 'After a long decline', on: true, txt: 'a long decline before it' },
      { k: 'vol', label: 'Heavy volume', on: false, txt: 'heavy volume on the second day' },
      { k: 'many', label: 'Engulfs several bodies', on: false, txt: 'several engulfed bodies' },
    ];
    const on = (k) => F.find((f) => f.k === k).on;
    let B = make(),
      u = 1,
      cancel = null;
    function make() {
      const { bars } = CS.chain([{ from: on('long') ? 61 : 54.4, to: 52.4, n: on('long') ? 20 : 7, seed: 31 }, { rel: [[0.1, 0.35, -1.0, -0.85], [0.1, 0.4, -0.95, -0.8], on('tiny') ? [-0.05, 0.3, -0.35, -0.12] : [0.1, 0.35, -1.15, -1.0]] }]);
      const n = bars.length,
        d1 = bars[n - 1],
        o = d1.c - 0.3,
        c = on('many') ? Math.max(...bars.slice(n - 3).map((b) => Math.max(b.o, b.c))) + 0.25 : Math.max(d1.o, d1.c) + 0.25;
      bars.push({ o, c, h: c + 0.15, l: o - 0.2, v: on('vol') ? 2.8e6 : 1.05e6 });
      return bars;
    }
    const btns = F.map((f) => {
      const b = h('button', { type: 'button', class: 'seg-btn', 'aria-pressed': String(f.on), onclick: () => ((f.on = !f.on), b.setAttribute('aria-pressed', String(f.on)), rebuild()) }, f.label);
      return b;
    });
    const cells = F.map(() => h('span'));
    const meterTxt = h('span');
    const el = h('div', { class: 'plot' }),
      volEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('div', { class: 'seg', role: 'group', 'aria-label': 'Strength features' }, ...btns), el, h('p', { class: 'plot-h' }, 'Volume'), volEl, h('div', { class: 'ni-meter' }, h('span', { class: 'ni-meter-cells', 'aria-hidden': 'true' }, ...cells), meterTxt), read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    const xr = () => [-0.8, B.length + 0.6];
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 210 : 240),
      pad: { l: 46, r: 10, t: 10, b: 8 },
      label: 'A bullish engulfing pattern at the end of a decline',
      draw(P) {
        const C = pal(),
          n = B.length,
          lo = Math.min(...B.map((b) => b.l)),
          hi = Math.max(...B.map((b) => b.h)),
          d2 = B[n - 1],
          cur = d2.o + (d2.c - d2.o) * ease.out(u);
        P.domain(...xr(), lo - (hi - lo) * 0.32, hi + (hi - lo) * 0.06);
        P.grid({ xTicks: [], yf: (v) => '$' + v, noXLabels: true });
        TA.drawCandles(P, B, n - 1);
        CS.candle(P, n - 1, { o: d2.o, c: cur, h: Math.max(cur, d2.o) + 0.15 * u, l: d2.l });
        if (u >= 1) CS.box(P, B, on('many') ? n - 4 : n - 2, n - 1, { label: 'Bullish engulfing', dir: 1 });
      },
    });
    const vol = new Plot(volEl, {
      height: 70,
      pad: { l: 46, r: 10, t: 6, b: 6 },
      label: 'Volume, with the second day of the pattern highlighted',
      draw(P) {
        const C = pal(),
          n = B.length,
          avg = B.slice(n - 11, n - 1).reduce((s, b) => s + b.v, 0) / 10,
          bw = TA.candleWidth(P) / Math.abs(P.X(1) - P.X(0));
        P.domain(...xr(), 0, 3.1e6);
        P.grid({ xTicks: [], yTicks: [], noXLabels: true });
        B.forEach((b, j) => {
          const last = j === n - 1;
          P.rect(j - bw / 2, 0, j + bw / 2, last ? b.v * u : b.v, last && on('vol') ? C.accent : alpha(b.c >= b.o ? C.gain : C.loss, 0.55));
        });
        P.line([[-0.8, avg], [n + 0.6, avg]], { color: C.muted, dash: [4, 3], width: 1 });
        P.text('Average', P.X(-0.6), P.Y(avg) - 8, { align: 'left', color: C.muted });
      },
    });
    function paint() {
      plot.render();
      vol.render();
      const k = F.filter((f) => f.on);
      cells.forEach((c, i) => c.classList.toggle('on', i < k.length));
      meterTxt.textContent = `Strength: ${k.length} of 4`;
      const list = k.map((f) => f.txt),
        joined = list.length > 1 ? list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1] : list[0];
      read.innerHTML = !k.length ? '<b>A bare engulfing pattern.</b> It still counts, but it’s the weakest version.' : `<b>More convincing</b>, thanks to ${joined}.${k.length === 4 ? ' This is as strong as the pattern gets, and still not a guarantee.' : ''}`;
    }
    function rebuild() {
      if (cancel) cancel();
      B = make();
      cancel = tween(900, (k) => ((u = k), paint()));
    }
    paint();
    return { play: rebuild, destroy: () => (cancel && cancel(), plot.destroy(), vol.destroy()) };
  };

  /* ---------- how far into the body: dark-cloud cover and piercing pattern ---------- */
  V.penetration = function (host, p, ctx) {
    const SIDE = {
      cloud: { trend: CS.mini(44.2, 50.3, 5), d1: { o: 50.4, c: 54.4, h: 54.8, l: 50.1 }, o2: 55.3, y: [43.0, 56.4] },
      pierce: { trend: CS.mini(59.8, 53.7, 5), d1: { o: 53.6, c: 49.6, h: 53.9, l: 49.2 }, o2: 48.6, y: [47.4, 61.0] },
    };
    let side = 'cloud',
      pen = 66,
      cancel = null;
    const stop = () => (cancel && cancel(), (cancel = null));
    const sl = slider({ id: ctx.key + '-pen', label: 'Day 2’s close, measured into day 1’s body', min: -12, max: 120, step: 1, value: pen, fmt: signed, onInput: (v) => (stop(), (pen = v), paint()) });
    const sg = seg({ label: 'Pattern', options: [{ v: 'cloud', label: 'At a top' }, { v: 'pierce', label: 'At a bottom' }], value: side, onChange: (v) => ((side = v), play()) });
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, el, sl.el, read);
    const close = () => {
      const d = SIDE[side].d1;
      return d.c + ((d.o - d.c) * pen) / 100;
    };
    const day2 = () => {
      const o = SIDE[side].o2,
        c = close();
      return side === 'cloud' ? { o, c, h: o + 0.3, l: Math.min(o, c) - 0.2 } : { o, c, h: Math.max(o, c) + 0.2, l: o - 0.2 };
    };
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 250 : 280),
      pad: { l: 46, r: 6, t: 12, b: 22 },
      label: 'How far the second day closes into the first day’s real body',
      draw(P) {
        const C = pal(),
          S = SIDE[side],
          d1 = S.d1,
          d2 = day2(),
          w = bigW(P),
          mid = (d1.o + d1.c) / 2,
          ext = side === 'cloud' ? d1.h : d1.l,
          col = side === 'cloud' ? C.loss : C.gain;
        P.domain(-0.8, 10.6, S.y[0], S.y[1]);
        P.grid({ xTicks: [], yf: (v) => '$' + v, noXLabels: true });
        S.trend.forEach((t, i) => CS.candle(P, i, t, { alpha: 0.45 }));
        ghostBody(P, d1, 5.5, 8.4, C.muted);
        P.line([[5.5, mid], [8.4, mid]], { color: C.warn, dash: [4, 3], width: 1.5 });
        P.line([[6.1, ext], [8.4, ext]], { color: C.muted, dash: [2, 3], width: 1 });
        CS.candle(P, 6.1, d1, { w });
        CS.candle(P, 7.8, d2, { w });
        // A ruler beside the pair: 0% at day 1's close, 100% at its open, filled up to day 2's close.
        const rx = 9.2,
          f = Math.max(0, Math.min(100, pen)) / 100;
        P.line([[rx, d1.c], [rx, d1.o]], { color: alpha(C.muted, 0.35), width: 6 });
        if (f > 0) P.line([[rx, d1.c], [rx, d1.c + (d1.o - d1.c) * f]], { color: col, width: 6 });
        [0, 50, 100].forEach((t) => {
          const y = d1.c + ((d1.o - d1.c) * t) / 100;
          P.line([[rx - 0.25, y], [rx + 0.25, y]], { color: t === 50 ? C.warn : C.ink, width: 1.5 });
          P.text(t + '%', P.X(rx + 0.4), P.Y(y), { align: 'left', color: t === 50 ? C.warn : C.muted });
        });
        P.text('Day 1', P.X(6.1), P.h - 9, { color: C.muted });
        P.text('Day 2', P.X(7.8), P.h - 9, { color: C.muted });
      },
    });
    function name() {
      if (side === 'cloud') {
        if (pen < 0) return ['No dark cloud', 'Day 2 closed above day 1’s close: it didn’t get into the green body at all.'];
        if (pen < 50) return ['Too shallow', 'Day 2 opened above day 1’s high but closed less than halfway into the green body. Many Japanese traders wouldn’t call this a dark cloud. Wait for more bearish proof.'];
        if (pen < 100) return ['Dark-cloud cover', 'Day 2 opened above day 1’s high, then closed more than halfway down into the green body. The rally was rejected: a bearish reversal signal. The deeper the close, the stronger.'];
        return ['Bearish engulfing', 'Day 2 closed below day 1’s open: the red body engulfs the green one. Stronger than a dark-cloud cover.'];
      }
      if (pen < -2) return ['On-neck pattern', 'The buyers only got back to around day 1’s low. Nison treats this as a bearish continuation pattern: the decline usually resumes.'];
      if (pen < 10) return ['In-neck pattern', 'Day 2 closed barely into the red body, near day 1’s close. Still a bearish continuation pattern.'];
      if (pen < 50) return ['Thrusting pattern', 'Into the body, but not past the middle. Usually still bearish, though a bit less so. Wait for more proof.'];
      if (pen < 100) return ['Piercing pattern', 'Day 2 opened below day 1’s low, then closed more than halfway up into the red body. The selloff was rejected: a bullish reversal signal. The deeper the close, the stronger.'];
      return ['Bullish engulfing', 'Day 2 closed above day 1’s open: the green body engulfs the red one. Stronger than a piercing pattern.'];
    }
    function paint() {
      plot.render();
      const [nm, why] = name(),
        good = side === 'cloud' ? pen >= 50 : pen >= 50,
        cls = good ? (side === 'cloud' ? 'loss' : 'gain') : '';
      read.innerHTML = `<b class="${cls}">${nm}.</b> ${why} Day 2 closed at ${usd(close())}, ${pen < 0 ? (side === 'cloud' ? 'above' : 'below') + ' day 1’s close' : pen + '% of the way into day 1’s body'}.`;
    }
    function play() {
      stop();
      cancel = tween(2400, (k) => {
        pen = Math.round(-12 + 78 * ease.out(k));
        sl.set(pen);
        paint();
      });
    }
    paint();
    return { play, destroy: () => (stop(), plot.destroy()) };
  };

  /* ---------- dark cloud, piercing and thrusting on a chart ---------- */
  const DOWNLEAD = { from: 57.2, to: 51.4, n: 14, seed: 42 },
    TALLRED = [-0.1, 0.1, -2.3, -2.1, 1.4e6];
  const CC = {
    cloud: { label: 'Dark-cloud cover', lead: { from: 45.6, to: 51.4, n: 14, seed: 41 }, rows: [[0.1, 2.3, -0.1, 2.1, 1.4e6], [0.4, 0.6, -1.55, -1.4, 1.5e6]], by: -3.2, dir: -1 },
    pierce: { label: 'Piercing pattern', lead: DOWNLEAD, rows: [TALLRED, [-0.4, 1.5, -0.6, 1.4, 1.5e6]], by: 3.2, dir: 1 },
    thrust: { label: 'Thrusting pattern', lead: DOWNLEAD, rows: [TALLRED, [-0.4, 0.75, -0.6, 0.6, 1.2e6]], by: -3.0, dir: 1 },
  };
  V.cloudContext = function (host, p, ctx) {
    let key = 'cloud',
      chart = null;
    const sg = seg({ label: 'Pattern', options: Object.keys(CC).map((k) => ({ v: k, label: CC[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read, h('p', { class: 'fine' }, 'Simulated daily prices. Real patterns fail more often than these tidy examples.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const c = CC[key],
        { bars: B, at } = CS.chain([c.lead, { rel: c.rows }, { by: c.by, n: 8, seed: 43 }]),
        K = at[1],
        n = B.length,
        d1 = B[K],
        d2 = B[K + 1],
        pct = Math.round((Math.abs(d2.c - d1.c) / Math.abs(d1.o - d1.c)) * 100),
        moved = CS.moved(d2.c, B[n - 1].c);
      const FINAL = {
        cloud: `<b class="loss">Dark-cloud cover.</b> The second day opened at ${usd(d2.o)}, above day 1’s high, and closed ${pct}% of the way down into its green body. Over the next 8 days, prices ${moved}.`,
        pierce: `<b class="gain">Piercing pattern.</b> The second day opened at ${usd(d2.o)}, below day 1’s low, and closed ${pct}% of the way up into its red body. Over the next 8 days, prices ${moved}.`,
        thrust: `<b>Thrusting pattern.</b> The green day closed only ${pct}% of the way into the red body. The buyers were too weak, and over the next 8 days prices ${moved}. In a decline, a thrusting day is a reason to wait, not to buy.`,
      };
      chart = TA.chart(holder, ctx, {
        bars: B,
        ms: 2800,
        label: c.label + ' on a chart',
        yRange: CS.room(B, c.dir),
        over(P, C, i) {
          if (i > K + 1) CS.box(P, B, K, K + 1, { label: c.label, dir: c.dir });
        },
        onIndex(i) {
          if (i <= K + 1) read.textContent = 'Watch the end of the trend.';
          else read.innerHTML = i < n ? 'What happens next?' : FINAL[key];
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- harami builder ---------- */
  V.haramiBuild = function (host, p, ctx) {
    const SIDE = {
      top: { trend: CS.mini(44.2, 49.9, 6), d1: { o: 49.8, c: 53.8, h: 54.2, l: 49.5 }, y: [42.6, 55.8] },
      bottom: { trend: CS.mini(59.4, 53.7, 6), d1: { o: 53.6, c: 49.6, h: 53.9, l: 49.2 }, y: [47.6, 60.8] },
    };
    let side = 'top',
      size = 1.2,
      cancel = null;
    const stop = () => (cancel && cancel(), (cancel = null));
    const sl = slider({ id: ctx.key + '-sz', label: 'Day 2’s real body (day 1’s is $4.00)', min: 0, max: 5, step: 0.1, value: size, fmt: (v) => usd(v), onInput: (v) => (stop(), (size = v), paint()) });
    const sg = seg({ label: 'Where', options: [{ v: 'top', label: 'After a rally' }, { v: 'bottom', label: 'After a decline' }], value: side, onChange: (v) => ((side = v), play()) });
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, el, sl.el, read);
    const day2 = () => {
      const d1 = SIDE[side].d1,
        mid = (d1.o + d1.c) / 2,
        up = side === 'bottom',
        half = Math.max(size, 0.02) / 2,
        o = up ? mid - half : mid + half,
        c = up ? mid + half : mid - half;
      return { o, c, h: Math.max(o, c) + 0.45, l: Math.min(o, c) - 0.45 };
    };
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 240 : 270),
      pad: { l: 46, r: 8, t: 12, b: 22 },
      label: 'A long candle and a smaller one: does the second fit inside the first?',
      draw(P) {
        const C = pal(),
          S = SIDE[side],
          w = bigW(P),
          inside = size < 3.95;
        P.domain(-0.8, 10.2, S.y[0], S.y[1]);
        P.grid({ xTicks: [], yf: (v) => '$' + v, noXLabels: true });
        S.trend.forEach((t, i) => CS.candle(P, i, t, { alpha: 0.45 }));
        ghostBody(P, S.d1, 6.35, 9.25, C.muted);
        CS.candle(P, 7, S.d1, { w });
        CS.candle(P, 8.6, day2(), { w, color: size < 0.1 ? C.ink : null });
        P.text(inside ? 'Mother' : 'Day 1', P.X(7), P.h - 9, { color: C.muted });
        P.text(inside ? 'Baby' : 'Day 2', P.X(8.6), P.h - 9, { color: C.muted });
      },
    });
    function paint() {
      plot.render();
      const top = side === 'top',
        trend = top ? 'rally' : 'decline',
        col = top ? 'red' : 'green',
        col1 = top ? 'green' : 'red';
      if (size < 0.1) read.innerHTML = `<b class="${top ? 'loss' : 'gain'}">Harami cross.</b> Day 2 is a doji inside day 1’s long ${col1} body: a stronger warning that the ${trend} has stalled.`;
      else if (size < 3.95) read.innerHTML = `<b class="${top ? 'loss' : 'gain'}">Harami.</b> A small ${col} body inside day 1’s long ${col1} body, ${Math.round((size / 4) * 100)}% of its size. The ${trend} is out of breath. Expect a pause; a real reversal needs more proof.`;
      else if (size < 4.05) read.innerHTML = '<b>Neither.</b> The two real bodies are the same size: day 2 neither fits inside day 1 nor wraps around it.';
      else read.innerHTML = `<b>Not a harami.</b> Day 2’s body is now bigger than day 1’s and wraps around it: that’s an engulfing pattern, the harami’s opposite.`;
    }
    function play() {
      stop();
      cancel = tween(2200, (k) => {
        size = Math.round((4.6 - 3.4 * ease.out(k)) * 10) / 10;
        sl.set(size);
        paint();
      });
    }
    paint();
    return { play, destroy: () => (stop(), plot.destroy()) };
  };

  /* ---------- tweezers and belt holds ---------- */
  const UPLEAD = { from: 46.2, to: 51.4, n: 14, seed: 51 },
    DNLEAD = { from: 56.6, to: 51.4, n: 14, seed: 52 };
  const TB = {
    ttop: { label: 'Tweezers top', lead: UPLEAD, rows: [[0.1, 1.9, -0.1, 1.6, 1.3e6], [0.1, 0.3, -1.3, -1.1, 1.4e6]], by: -2.6, dir: -1 },
    tbot: { label: 'Tweezers bottom', lead: DNLEAD, rows: [[-0.1, 0.1, -1.9, -1.6, 1.3e6], [-0.1, 1.2, -0.3, 1.0, 1.4e6]], by: 2.6, dir: 1 },
    bbull: { label: 'Bullish belt hold', lead: DNLEAD, rows: [[-0.9, 1.25, -0.9, 1.1, 1.6e6]], by: 2.4, dir: 1 },
    bbear: { label: 'Bearish belt hold', lead: UPLEAD, rows: [[0.9, 0.9, -1.25, -1.1, 1.6e6]], by: -2.4, dir: -1 },
  };
  V.twoBarTops = function (host, p, ctx) {
    let key = 'ttop',
      chart = null;
    const sg = seg({ label: 'Pattern', options: Object.keys(TB).map((k) => ({ v: k, label: TB[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const c = TB[key],
        { bars: B, at } = CS.chain([c.lead, { rel: c.rows }, { by: c.by, n: 7, seed: 53 }]),
        K = at[1],
        last = K + c.rows.length - 1,
        n = B.length,
        A = B[K],
        Z = B[last],
        moved = CS.moved(Z.c, B[n - 1].c),
        pct = Math.round((Math.abs(Z.c - A.c) / Math.abs(A.o - A.c)) * 100),
        tweez = key[0] === 't',
        lvl = key === 'ttop' ? A.h : A.l;
      const FINAL = {
        ttop: `<b class="loss">Tweezers top.</b> Both sessions topped out at ${usd(A.h)}: sellers defended that price twice. The second day also drove ${pct}% of the way down into the first day’s green body, which adds weight. Over the next 7 days, prices ${moved}.`,
        tbot: `<b class="gain">Tweezers bottom.</b> Both sessions bottomed at ${usd(A.l)}: buyers defended that price twice. The second day also closed ${pct}% of the way up into the first day’s red body. Over the next 7 days, prices ${moved}.`,
        bbull: `<b class="gain">Bullish belt hold.</b> In a decline, the session opened at its low of ${usd(A.o)} and never looked back, closing at ${usd(A.c)}, near its high. Over the next 7 days, prices ${moved}. A close back below ${usd(A.o)} would cancel the signal.`,
        bbear: `<b class="loss">Bearish belt hold.</b> In a rally, the session opened at its high of ${usd(A.o)} and fell all day, closing at ${usd(A.c)}, near its low. Over the next 7 days, prices ${moved}. A close back above ${usd(A.o)} would cancel the signal.`,
      };
      chart = TA.chart(holder, ctx, {
        bars: B,
        ms: 2800,
        label: c.label + ' on a chart',
        yRange: CS.room(B, c.dir),
        over(P, C, i) {
          if (i <= last) return;
          CS.box(P, B, K, last, { label: c.label, dir: c.dir });
          if (tweez) P.line([[K - 0.6, lvl], [last + 0.6, lvl]], { color: C.accent, width: 2 });
          else P.dot(K, A.o, { color: C.accent, r: 3 });
        },
        onIndex(i) {
          if (i <= last) read.textContent = 'Watch the end of the trend.';
          else read.innerHTML = i < n ? 'What happens next?' : FINAL[key];
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };
})();
