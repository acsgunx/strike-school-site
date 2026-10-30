/* Japanese Candlesticks, Unit 3 visuals: a star builder (star, doji star, abandoned baby), stars on a full swing, three
   soldiers and their tiring cousins, and long Japanese tops and bottoms with their Western twins. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, seg, slider, pal, alpha, tween, usd } = SS;
  const V = SS.viz;
  const TA = SS.TA;
  const CS = SS.CS;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  // A candle part-way through its session: the close moves from the open to its final value as u goes 0 → 1.
  const grow = (b, u) => {
    const c = b.o + (b.c - b.o) * u;
    return { o: b.o, c, h: Math.max(b.o, c) + (b.h - Math.max(b.o, b.c)) * u, l: Math.min(b.o, c) - (Math.min(b.o, b.c) - b.l) * u };
  };
  const XS = [5.8, 7.4, 9.0];

  /* ---------- star builder ---------- */
  V.starBuild = function (host, p, ctx) {
    const SIDE = {
      top: { trend: CS.mini(44.6, 49.9, 5), d1: { o: 50.0, c: 53.6, h: 53.9, l: 49.8 }, star: { o: 54.3, c: 54.7, h: 55.1, l: 53.8 }, doji: { o: 54.4, c: 54.4, h: 55.0, l: 53.75 }, baby: { o: 54.9, c: 54.9, h: 55.4, l: 54.5 }, y: [43.4, 56.2] },
      bottom: { trend: CS.mini(59.4, 54.1, 5), d1: { o: 54.0, c: 50.4, h: 54.2, l: 50.1 }, star: { o: 49.7, c: 49.3, h: 50.2, l: 48.9 }, doji: { o: 49.6, c: 49.6, h: 50.25, l: 49.0 }, baby: { o: 49.1, c: 49.1, h: 49.55, l: 48.6 }, y: [47.4, 60.6] },
    };
    let side = 'top',
      kind = 'star',
      depth = 65,
      prog = 3,
      cancel = null;
    const stop = () => (cancel && cancel(), (cancel = null));
    const sgS = seg({ label: 'Where', options: [{ v: 'top', label: 'Evening (top)' }, { v: 'bottom', label: 'Morning (bottom)' }], value: side, onChange: (v) => ((side = v), play()) });
    const sgK = seg({ label: 'Star', options: [{ v: 'star', label: 'Star' }, { v: 'doji', label: 'Doji star' }, { v: 'baby', label: 'Abandoned baby' }], value: kind, onChange: (v) => ((kind = v), play()) });
    const sl = slider({ id: ctx.key + '-d3', label: 'Day 3’s close, into day 1’s body', min: 0, max: 100, step: 1, value: depth, fmt: (v) => v + '%', onInput: (v) => (stop(), (depth = v), (prog = 3), paint()) });
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sgS.el, sgK.el, el, sl.el, read);
    const day3 = () => {
      const S = SIDE[side],
        d1 = S.d1,
        top = side === 'top',
        baby = kind === 'baby',
        c = d1.c + (d1.o - d1.c) * (depth / 100);
      if (top) {
        const o = baby ? 53.9 : 53.8;
        return { o, c, h: baby ? 54.0 : o + 0.15, l: c - 0.25 };
      }
      const o = baby ? 50.05 : 50.2;
      return { o, c, h: c + 0.25, l: baby ? 50.0 : o - 0.15 };
    };
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 250 : 280),
      pad: { l: 46, r: 8, t: 12, b: 22 },
      label: 'A three-candle star pattern',
      draw(P) {
        const C = pal(),
          S = SIDE[side],
          top = side === 'top',
          st = S[kind],
          d3 = day3(),
          w = Math.min(32, (P.X(1) - P.X(0)) * 0.95);
        P.domain(-0.8, 10.2, S.y[0], S.y[1]);
        P.grid({ xTicks: [], yf: (v) => '$' + v, noXLabels: true });
        S.trend.forEach((t, i) => CS.candle(P, i, t, { alpha: 0.45 }));
        if (prog >= 1.4) {
          // Shade the gap: between the real bodies for a star, between the shadows for an abandoned baby.
          if (kind === 'baby') {
            const a = top ? Math.max(S.d1.h, d3.h) : Math.min(S.d1.l, d3.l);
            P.rect(5.3, a, prog >= 3 ? 9.5 : 7.9, top ? st.l : st.h, alpha(C.warn, 0.22));
          } else P.rect(5.3, S.d1.c, 7.9, top ? Math.min(st.o, st.c) : Math.max(st.o, st.c), alpha(C.warn, 0.22));
        }
        CS.candle(P, XS[0], grow(S.d1, clamp01(prog)), { w });
        if (prog > 1) CS.candle(P, XS[1], st, { w, alpha: clamp01((prog - 1) * 2), color: st.o === st.c ? C.ink : null });
        if (prog > 2) CS.candle(P, XS[2], grow(d3, clamp01(prog - 2)), { w });
        P.text('Day 1', P.X(XS[0]), P.h - 9, { color: C.muted });
        P.text('Star', P.X(XS[1]), P.h - 9, { color: C.muted });
        P.text('Day 3', P.X(XS[2]), P.h - 9, { color: C.muted });
      },
    });
    function paint() {
      plot.render();
      const top = side === 'top',
        cls = top ? 'loss' : 'gain',
        nm = kind === 'baby' ? `Abandoned baby (${top ? 'top' : 'bottom'})` : (top ? 'Evening ' : 'Morning ') + (kind === 'doji' ? 'doji star' : 'star'),
        col1 = top ? 'green' : 'red',
        col3 = top ? 'red' : 'green';
      let txt = `A tall ${col1} day, a small star that gaps ${top ? 'above' : 'below'} it, then a tall ${col3} day that closes ${depth}% of the way into the first body.`;
      if (kind === 'doji') txt += ` With a doji as the star, the warning is stronger: the ${top ? 'buyers' : 'sellers'} couldn’t even win that session.`;
      if (kind === 'baby') txt += ' The doji gaps away from both neighbors, with no overlap even in the shadows: it is left on its own. Rare, and one of the strongest star patterns.';
      txt += depth < 50 ? ' <b>But day 3 closed less than halfway into the first body</b>, which weakens the signal. Nison prefers a close well into it.' : ` The ${top ? 'sellers' : 'buyers'} have taken over.`;
      read.innerHTML = prog < 3 ? 'Watch the three sessions form.' : `<b class="${cls}">${nm}.</b> ${txt}`;
    }
    function play() {
      stop();
      cancel = tween(3200, (k) => ((prog = 3 * k), paint()));
    }
    paint();
    return { play, destroy: () => (stop(), plot.destroy()) };
  };

  /* ---------- stars on a full swing ---------- */
  V.starContext = function (host, p, ctx) {
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, holder, read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    const { bars: B, at } = CS.chain([
      { from: 56, to: 48.6, n: 12, seed: 61 },
      { rel: [[-0.1, 0.1, -2.1, -1.9, 1.4e6], [-0.5, -0.1, -0.9, -0.75, 1.1e6], [0.55, 2.0, 0.45, 1.85, 1.5e6]] },
      { by: 6, n: 12, seed: 62 },
      { rel: [[0.1, 2.1, -0.1, 1.9, 1.4e6], [0.45, 0.9, 0.25, 0.46, 1.2e6], [-0.6, -0.4, -2.1, -1.95, 1.5e6]] },
      { by: -4.5, n: 10, seed: 63 },
    ]);
    const M = at[1],
      E = at[3],
      n = B.length,
      lo = Math.min(...B.map((b) => b.l)),
      hi = Math.max(...B.map((b) => b.h)),
      r = hi - lo;
    const chart = TA.chart(holder, ctx, {
      bars: B,
      ms: 4200,
      label: 'A morning star near the low and an evening doji star near the high',
      yRange: [lo - r * 0.2, hi + r * 0.2],
      over(P, C, i) {
        if (i > M + 2) CS.box(P, B, M, M + 2, { label: 'Morning star', dir: 1 });
        if (i > E + 2) CS.box(P, B, E, E + 2, { label: 'Evening doji star', dir: -1 });
      },
      onIndex(i) {
        if (i <= M + 2) read.textContent = 'A decline is under way.';
        else if (i <= M + 6) read.innerHTML = '<b class="gain">Morning star.</b> A tall red day, a small star below it, then a tall green day that closed well into the red body: the selling dried up.';
        else if (i <= E + 2) read.textContent = 'The rally is under way. Watch for a warning near the top.';
        else if (i < n) read.innerHTML = '<b class="loss">Evening doji star.</b> A tall green day, then a doji that gapped higher: the buyers couldn’t win the session. The tall red day that followed confirmed it.';
        else read.innerHTML = `From the morning star’s last close, prices ${CS.moved(B[M + 2].c, B[E].c)} into the evening doji star. After its last close, they ${CS.moved(B[E + 2].c, B[n - 1].c)} by the end of the chart. Each star turned a clear trend.`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- three soldiers, advance block, stalled pattern, three crows ---------- */
  const THREE = {
    soldiers: { label: 'Three white soldiers', trend: CS.mini(46.6, 45.7, 5), c: [[45.8, 48.1, 45.6, 47.9], [47.6, 50.2, 47.5, 50.0], [49.8, 52.3, 49.6, 52.1]], y: [44.4, 53.4] },
    block: { label: 'Advance block', trend: CS.mini(41, 46, 5), c: [[46.1, 48.6, 45.9, 48.4], [48.2, 50.4, 48.0, 49.7], [49.5, 51.6, 49.3, 50.2]], y: [39.8, 52.6] },
    stalled: { label: 'Stalled pattern', trend: CS.mini(41, 46, 5), c: [[46.1, 48.6, 45.9, 48.4], [48.3, 50.9, 48.1, 50.7], [50.9, 51.4, 50.7, 51.15]], y: [39.8, 52.6] },
    crows: { label: 'Three black crows', trend: CS.mini(43, 52.2, 5), c: [[52.4, 52.6, 50.0, 50.2], [50.5, 50.7, 48.0, 48.2], [48.4, 48.6, 46.1, 46.2]], y: [41.6, 53.8] },
  };
  V.threeBuild = function (host, p, ctx) {
    let key = 'soldiers',
      prog = 3,
      cancel = null;
    const sg = seg({ label: 'Pattern', options: Object.keys(THREE).map((k) => ({ v: k, label: THREE[k].label })), value: key, onChange: (v) => ((key = v), play()) });
    const el = h('div', { class: 'plot' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Replay');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, el, h('div', { class: 'ctl-row' }, btn), read);
    const bars = () => THREE[key].c.map(([o, hi, l, c]) => ({ o, h: hi, l, c }));
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 240 : 270),
      pad: { l: 46, r: 8, t: 12, b: 12 },
      label: 'Three candles in a row',
      draw(P) {
        const C = pal(),
          T = THREE[key],
          B = bars(),
          w = Math.min(32, (P.X(1) - P.X(0)) * 0.95);
        P.domain(-0.8, 10.2, T.y[0], T.y[1]);
        P.grid({ xTicks: [], yf: (v) => '$' + v, noXLabels: true });
        T.trend.forEach((t, i) => CS.candle(P, i, t, { alpha: 0.45 }));
        B.forEach((b, j) => {
          const u = clamp01(prog - j);
          if (u <= 0) return;
          const g = grow(b, u);
          CS.candle(P, XS[j], g, { w });
          // The advance block's growing upper shadows, drawn over in the warning color.
          if (key === 'block' && u >= 1) P.line([[XS[j], Math.max(b.o, b.c)], [XS[j], b.h]], { color: C.warn, width: 3.5 });
        });
        // The stalled pattern's small third candle, boxed.
        if (key === 'stalled' && prog >= 3) {
          const b = B[2],
            k = P.c,
            x0 = P.X(XS[2] - 0.6),
            x1 = P.X(XS[2] + 0.6);
          k.save();
          k.strokeStyle = C.violet;
          k.lineWidth = 1.75;
          k.setLineDash([4, 3]);
          k.strokeRect(x0, P.Y(b.h) - 5, x1 - x0, P.Y(b.l) - P.Y(b.h) + 10);
          k.restore();
        }
      },
    });
    function paint() {
      plot.render();
      if (prog < 3) return void (read.textContent = 'Watch the three sessions form.');
      const B = bars(),
        body = B.map((b) => usd(CS.body(b))).join(' → '),
        upper = B.map((b) => usd(b.h - Math.max(b.o, b.c))).join(' → ');
      const TXT = {
        soldiers: `<b class="gain">Three white soldiers.</b> After a stretch of low, flat prices, three tall green days, each opening inside the previous body and closing near its high (bodies ${body}). A strong, steady advance.`,
        block: `<b class="loss">Advance block.</b> Still three green days, but the bodies shrink (${body}) while the upper shadows grow (${upper}). Each push higher meets more selling. If you own the stock, protect your profits.`,
        stalled: `<b class="loss">Stalled pattern.</b> Two tall green days, then a small one (bodies ${body}): the rally has stopped making progress. Nison sees it as a time to protect long positions, not necessarily to sell short.`,
        crows: `<b class="loss">Three black crows.</b> After a rally, three tall red days, each opening inside the previous body and closing near its low (bodies ${body}). It means the most at a high price level, after a long advance.`,
      };
      read.innerHTML = TXT[key];
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(2700, (k) => ((prog = 3 * k), paint()));
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- tops and bottoms that take weeks ---------- */
  const mirror = (a) => a.map(([x, y]) => [x, 100 - y]);
  const HS = [[0, 44], [10, 50], [15, 47.6], [24, 53.2], [31, 47.9], [39, 50.4], [44, 47.6], [48, 46.4], [55, 44]],
    ROUND = [[0, 44], [10, 49], [18, 51.3], [26, 52], [34, 51.3], [40, 50.2]];
  const LONG = {
    buddha: { label: 'Three Buddha top', dir: -1, kind: 'hs', segs: [{ a: HS, n: 56, seed: 71, noise: 0.004 }] },
    dumpling: { label: 'Dumpling top', dir: -1, kind: 'round', segs: [{ a: ROUND, n: 41, seed: 72, noise: 0.0025, wick: 0.003 }, { rel: [[-1.2, -0.95, -1.9, -1.75, 1.6e6]] }, { by: -3, n: 12, seed: 74 }] },
    tower: { label: 'Tower top', dir: -1, kind: 'tower', segs: [{ from: 44, to: 48.6, n: 16, seed: 75 }, { rel: [[0.1, 2.3, -0.05, 2.2, 1.6e6], [0.1, 2.0, -0.1, 1.8, 1.5e6]] }, { by: 0.2, n: 6, seed: 76, noise: 0.003, wick: 0.004 }, { rel: [[-0.1, 0.05, -2.3, -2.2, 1.6e6], [-0.1, 0.1, -2.1, -1.9, 1.5e6]] }, { by: -2.4, n: 8, seed: 77 }] },
    ibuddha: { label: 'Inverted three Buddha', dir: 1, kind: 'hs', segs: [{ a: mirror(HS), n: 56, seed: 71, noise: 0.004 }] },
    frypan: { label: 'Fry pan bottom', dir: 1, kind: 'round', segs: [{ a: mirror(ROUND), n: 41, seed: 72, noise: 0.0025, wick: 0.003 }, { rel: [[1.2, 1.9, 0.95, 1.75, 1.6e6]] }, { by: 3, n: 12, seed: 74 }] },
    towerb: { label: 'Tower bottom', dir: 1, kind: 'tower', segs: [{ from: 56, to: 51.4, n: 16, seed: 75 }, { rel: [[-0.1, 0.05, -2.3, -2.2, 1.6e6], [-0.1, 0.1, -2.0, -1.8, 1.5e6]] }, { by: -0.2, n: 6, seed: 76, noise: 0.003, wick: 0.004 }, { rel: [[0.1, 2.3, -0.05, 2.2, 1.6e6], [0.1, 2.1, -0.1, 1.9, 1.5e6]] }, { by: 2.4, n: 8, seed: 77 }] },
  };
  const argExt = (B, a, b, f) => {
    let j = a;
    for (let t = a; t <= b; t++) if (f(B[t], B[j])) j = t;
    return j;
  };
  V.longTops = function (host, p, ctx) {
    const keys = p.bottoms ? ['ibuddha', 'frypan', 'towerb'] : ['buddha', 'dumpling', 'tower'];
    let key = keys[0],
      chart = null;
    const sg = seg({ label: 'Pattern', options: keys.map((k) => ({ v: k, label: LONG[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read, h('p', { class: 'fine' }, 'Simulated prices. Each candle could be a day or a week.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const L = LONG[key],
        top = L.dir < 0,
        { bars: B, at } = CS.chain(L.segs),
        n = B.length,
        hiF = top ? (a, b) => a.h > b.h : (a, b) => a.l < b.l,
        loF = top ? (a, b) => a.l < b.l : (a, b) => a.h > b.h,
        ext = (b) => (top ? b.h : b.l),
        opp = (b) => (top ? b.l : b.h);
      let info = {},
        over,
        status,
        final;
      if (L.kind === 'hs') {
        const pk = [argExt(B, 5, 13, hiF), argExt(B, 19, 28, hiF), argExt(B, 35, 42, hiF)],
          tr = [argExt(B, pk[0], pk[1], loF), argExt(B, pk[1], pk[2], loF)],
          neck = (x) => opp(B[tr[0]]) + ((opp(B[tr[1]]) - opp(B[tr[0]])) * (x - tr[0])) / (tr[1] - tr[0]);
        let brk = -1;
        for (let j = pk[2] + 1; j < n; j++)
          if (top ? B[j].c < neck(j) : B[j].c > neck(j)) {
            brk = j;
            break;
          }
        info = { pk, tr, brk };
        over = (P, C, i) => {
          ['Saint', 'Buddha', 'Saint'].forEach((t, j) => i > pk[j] + 2 && P.tag(t, P.X(pk[j]), P.Y(ext(B[pk[j]])), { bg: C.violet, dy: top ? -27 : 6 }));
          if (i > pk[2] + 3) TA.ray(P, [tr[0], opp(B[tr[0]])], [tr[1], opp(B[tr[1]])], { toX: n - 1, color: C.accent, width: 1.75, dash: [5, 4] });
          if (brk > 0 && i > brk) P.dot(brk, B[brk].c, { color: C.accent, r: 4 });
        };
        status = (i) => (i <= pk[2] + 3 ? 'Watch the peaks form.' : brk < 0 || i <= brk ? `The neckline joins the two ${top ? 'lows' : 'highs'} between the ${top ? 'peaks' : 'troughs'}. A close ${top ? 'below' : 'above'} it confirms the pattern.` : 'Confirmed: a close beyond the neckline.');
        final = () =>
          top
            ? `<b class="loss">Three Buddha top.</b> Three peaks, the middle one highest: a Buddha between two saints. Its Western twin is the head and shoulders top. It was confirmed on day ${brk + 1}, when prices closed below the neckline at ${usd(B[brk].c)}. From that close, prices ${CS.moved(B[brk].c, B[n - 1].c)} by the end of the chart.`
            : `<b class="gain">Inverted three Buddha.</b> Three troughs, the middle one lowest. Its Western twin is the inverse head and shoulders. It was confirmed on day ${brk + 1}, when prices closed above the neckline at ${usd(B[brk].c)}. From that close, prices ${CS.moved(B[brk].c, B[n - 1].c)} by the end of the chart.`;
      } else if (L.kind === 'round') {
        const g = at[1],
          prev = B[g - 1],
          wTop = top ? prev.l : B[g].l,
          wBot = top ? B[g].h : prev.h,
          after = B.slice(g + 1),
          held = top ? after.every((b) => b.c < wTop) : after.every((b) => b.c > wBot),
          sm = B.slice(0, g).map((b, j, a) => {
            const w = a.slice(Math.max(0, j - 3), j + 4);
            return w.reduce((s, x) => s + (top ? x.h : x.l), 0) / w.length;
          });
        over = (P, C, i) => {
          if (i >= g - 2) P.line(sm.slice(12, g - 1).map((v, j) => [j + 12, v + (top ? 0.7 : -0.7)]), { color: C.violet, width: 2, dash: [3, 4] });
          if (i > g) {
            P.rect(g - 1.4, wBot, n, wTop, alpha(top ? C.loss : C.gain, 0.16));
            P.tag(top ? 'Falling window' : 'Rising window', P.X(g - 1), P.Y(top ? wBot : wTop), { bg: top ? C.loss : C.gain, align: 'right', dy: top ? 4 : -25 });
          }
        };
        status = (i) => (i <= g ? `Watch the slow, rounded ${top ? 'top' : 'bottom'} of small candles.` : `A ${top ? 'falling' : 'rising'} window: a gap ${top ? 'down' : 'up'} that confirms the pattern.`);
        final = () =>
          `<b class="${top ? 'loss' : 'gain'}">${L.label}.</b> A slow, rounded ${top ? 'top' : 'bottom'} built from small candles, confirmed on day ${g + 1} by a ${top ? 'falling window (a gap down)' : 'rising window (a gap up)'}. The West calls the shape a rounding ${top ? 'top' : 'bottom'}. ${held ? `Every close since has stayed ${top ? 'below' : 'above'} the window, which now acts as ${top ? 'resistance' : 'support'}. ` : ''}From the window day’s close, prices ${CS.moved(B[g].c, B[n - 1].c)}.`;
      } else {
        const t0 = at[1],
          t1 = at[3] + 1,
          pause = at[3] - at[2];
        info = { t0, t1 };
        over = (P, C, i) => i > t1 && CS.box(P, B, t0, t1, { label: L.label, dir: L.dir });
        status = (i) => (i <= t0 + 1 ? 'Watch for tall candles.' : i <= t1 ? 'Tall candles, then a pause of small ones…' : 'Tall candles the other way: the second tower.');
        final = () => `<b class="${top ? 'loss' : 'gain'}">${L.label}.</b> Two tall ${top ? 'green' : 'red'} candles, ${pause} small, hesitant ones, then two tall ${top ? 'red' : 'green'} candles: towers on either side of the turn. From the last small candle’s close, prices ${CS.moved(B[at[3] - 1].c, B[n - 1].c)} by the end of the chart.`;
      }
      chart = TA.chart(holder, ctx, {
        bars: B,
        ms: 4200,
        label: L.label,
        yRange: CS.room(B, L.dir),
        candleColor: L.kind === 'tower' ? (j, b) => (j < info.t0 || j > info.t1 ? alpha(b.c >= b.o ? pal().gain : pal().loss, 0.5) : null) : null,
        over,
        onIndex: (i) => (read.innerHTML = i < n ? status(i) : final()),
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };
})();
