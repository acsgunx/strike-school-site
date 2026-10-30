/* Japanese Candlesticks, Unit 1 visuals: the real body and a "who won" meter, shrinking bodies in a tiring rally, the
   four kinds of doji forming during a session, doji at tops and bottoms, the hammer rules, and confirmation. */
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
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  /* ---------- the real body and a "who won" meter ---------- */
  V.bodyTug = function (host, p, ctx) {
    const O = 50,
      SH = { none: 0, short: 0.6, long: 2.8 },
      RECENT = [[49.2, 50.9, 48.8, 50.6], [50.6, 51.2, 49.3, 49.6], [49.7, 51.4, 49.4, 51.1], [51.0, 51.5, 49.8, 50.1], [50.2, 50.9, 48.6, 48.9], [49.0, 50.6, 48.7, 50.3]].map(([o, hi, l, c]) => ({ o, h: hi, l, c })),
      AVG = RECENT.reduce((s, b) => s + CS.body(b), 0) / RECENT.length;
    let c = 52.6,
      sh = 'short',
      cancel = null;
    const stop = () => (cancel && cancel(), (cancel = null));
    const sl = slider({ id: ctx.key + '-c', label: 'Close (the open is $50.00)', min: 46, max: 54, step: 0.05, value: c, fmt: (v) => usd(v), onInput: (v) => (stop(), (c = v), paint()) });
    const sg = seg({ label: 'Shadows', options: [{ v: 'none', label: 'No shadows' }, { v: 'short', label: 'Short shadows' }, { v: 'long', label: 'Long shadows' }], value: sh, onChange: (v) => (stop(), (sh = v), paint()) });
    const el = h('div', { class: 'plot' }),
      tugEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, el, tugEl, sl.el, sg.el, read);
    const today = () => ({ o: O, c, h: Math.max(O, c) + SH[sh], l: Math.min(O, c) - SH[sh] });
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 230 : 260),
      pad: { l: 46, r: 12, t: 12, b: 22 },
      label: 'Today’s candle next to recent candles',
      draw(P) {
        const C = pal();
        P.domain(-0.8, 8.4, 42.6, 57.4);
        P.grid({ xTicks: [], yTicks: [44, 47, 50, 53, 56], yf: (v) => '$' + v, noXLabels: true });
        RECENT.forEach((b, i) => CS.candle(P, i, b, { alpha: 0.5 }));
        const t = today();
        CS.candle(P, 7, t, { w: Math.min(40, (P.X(1) - P.X(0)) * 1.1), color: Math.abs(c - O) < 0.12 ? C.ink : null });
        P.text('Recent days', P.X(2.5), P.h - 9, { color: C.muted });
        P.text('Today', P.X(7), P.h - 9, { color: C.ink, weight: 700 });
      },
    });
    const tug = new Plot(tugEl, {
      height: 54,
      pad: { l: 14, r: 14, t: 20, b: 8 },
      label: 'Who won the session',
      draw(P) {
        const C = pal(),
          v = Math.max(-1, Math.min(1, (c - O) / 3.2));
        P.domain(-1, 1, -1, 1);
        P.rect(-1, -0.55, 1, 0.55, alpha(C.muted, 0.14));
        if (Math.abs(v) > 0.004) P.rect(0, -0.55, v, 0.55, alpha(v > 0 ? C.gain : C.loss, 0.85));
        P.line([[0, -1], [0, 1]], { color: C.ink, width: 1.5 });
        P.text('Sellers', P.X(-1), 9, { align: 'left', color: C.loss, weight: 700 });
        P.text('Who won?', P.X(0), 9, { color: C.muted });
        P.text('Buyers', P.X(1), 9, { align: 'right', color: C.gain, weight: 700 });
      },
    });
    function name() {
      const b = Math.abs(c - O),
        s = SH[sh],
        up = c >= O,
        col = up ? 'green' : 'red',
        side = up ? 'buyers' : 'sellers',
        x = (b / AVG).toFixed(1);
      if (b < 0.12) return s >= 2 ? ['Long-legged doji', 'The close is back at the open after big swings both ways. The market has lost its sense of direction.'] : ['Doji', 'The close is back at the open: buyers and sellers fought to a draw.'];
      if (b < 0.6) return s >= 2 ? ['High-wave candle', 'A small body with very long shadows: the market swung widely and went nowhere.'] : ['Spinning top', 'A small real body: neither side got far. Its shadows matter little.'];
      if (b >= 2.2) return s === 0 ? [cap(col) + ' marubozu', `No shadows at all: it opened at the ${up ? 'low' : 'high'} and closed at the ${up ? 'high' : 'low'}. The ${side} were in charge all session.`] : ['Long ' + col + ' candle', `A real body ${x}× the recent average: a strong session for the ${side}.`];
      return ['Ordinary ' + col + ' candle', `A real body ${x}× the recent average: the ${side} won, but by about a normal amount.`];
    }
    function paint() {
      plot.render();
      tug.render();
      const [nm, why] = name();
      read.innerHTML = `<b>${nm}.</b> ${why} Real body ${usd(Math.abs(c - O))}; recent average ${usd(AVG)}.`;
    }
    paint();
    return {
      play() {
        stop();
        cancel = tween(3200, (k) => {
          c = Math.round((47.2 + 5.4 * ease.inOut(k)) * 20) / 20;
          sl.set(c);
          paint();
        });
      },
      destroy: () => (stop(), plot.destroy(), tug.destroy()),
    };
  };

  /* ---------- shrinking bodies in a tiring rally ---------- */
  function rallyBars(kind) {
    const r = SS.rng(kind === 'strong' ? 11 : 12),
      bars = [];
    let prev = 48;
    const push = (body, gap) => {
      const o = prev + (gap || 0) + (r() - 0.5) * 0.1,
        c = o + body;
      bars.push({ o, c, h: Math.max(o, c) + 0.08 + r() * 0.4, l: Math.min(o, c) - 0.08 - r() * 0.4, v: 1e6 });
      prev = c;
    };
    for (let i = 0; i < 8; i++) push((i % 2 ? 1 : -1) * (0.25 + r() * 0.35));
    if (kind === 'strong') for (let i = 0; i < 28; i++) push(i % 5 === 4 ? -(0.25 + r() * 0.3) : 0.75 + r() * 0.55);
    else {
      for (let i = 0; i < 12; i++) push(i % 5 === 4 ? -(0.25 + r() * 0.3) : 0.9 + r() * 0.55);
      for (let i = 0; i < 9; i++) push((r() < 0.7 ? 1 : -1) * (0.06 + r() * 0.22), 0.12);
      for (let i = 0; i < 7; i++) push(i === 3 ? 0.3 : -(0.5 + r() * 0.55));
    }
    return bars;
  }
  V.bodyMomentum = function (host, p, ctx) {
    let kind = 'tiring',
      chart = null;
    const sg = seg({ label: 'Rally', options: [{ v: 'strong', label: 'Strong rally' }, { v: 'tiring', label: 'Tiring rally' }], value: kind, onChange: (v) => ((kind = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const B = rallyBars(kind),
        n = B.length,
        avg = (a, b) => B.slice(a, b + 1).reduce((s, x) => s + CS.body(x), 0) / (b - a + 1);
      let peak = 0;
      B.forEach((b, j) => b.c > B[peak].c && (peak = j));
      const lateFrom = Math.max(8, peak - 7),
        early = avg(8, 15),
        late = avg(lateFrom, peak),
        top = Math.max(...B.map(CS.body)) * 1.15;
      chart = TA.chart(holder, ctx, {
        bars: B,
        ms: 3600,
        label: kind === 'strong' ? 'A strong rally with long green bodies' : 'A rally whose bodies shrink before it turns',
        lower: {
          height: 96,
          label: 'Size of each real body',
          range: [0, top],
          yTicks: [0, 1],
          yf: (v) => '$' + v,
          draw(P, C, i) {
            if (kind === 'tiring' && i > 21) {
              P.rect(19.5, 0, Math.min(i, 29) - 0.5, top, alpha(C.warn, 0.14));
              P.text('Shrinking', P.X(24.5), P.Y(top) + 9, { color: C.warn });
            }
            const bw = TA.candleWidth(P) / Math.abs(P.X(1) - P.X(0));
            for (let j = 0; j < Math.min(i, n); j++) P.rect(j - bw / 2, 0, j + bw / 2, CS.body(B[j]), B[j].c >= B[j].o ? C.gain : C.loss);
          },
        },
        onIndex(i) {
          if (i < n) read.textContent = 'Watch the real bodies in the lower panel as the rally goes on.';
          else if (kind === 'strong') read.innerHTML = `<b class="gain">The bodies stayed long.</b> The average real body was ${usd(early)} early in the rally and ${usd(late)} in the last 8 days. The buyers stayed in control, and the trend kept going.`;
          else read.innerHTML = `<b class="loss">The bodies shrank first.</b> From day ${lateFrom + 1} to day ${peak + 1}, prices still rose ${usd(B[peak].c - B[lateFrom - 1].c)}, but the average real body fell from ${usd(early)} early in the rally to ${usd(late)}: mostly spinning tops. The buyers had lost their force, and by day ${n} prices had fallen ${((1 - B[n - 1].c / B[peak].c) * 100).toFixed(1)}% from the high.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- four kinds of doji, forming during the session ---------- */
  const DOJI = {
    long: { label: 'Long-legged', a: [[0, 50], [14, 53.3], [34, 46.7], [52, 52.1], [66, 48.7], [77, 50]], txt: '<b>Long-legged doji.</b> Big swings in both directions, then a close right back at the open. The market has lost its sense of direction. With the open and close near the middle of the range, the Japanese call it a rickshaw man.' },
    grave: { label: 'Gravestone', a: [[0, 50], [18, 51.6], [38, 54.3], [58, 52.1], [77, 50]], clamp: 1, txt: '<b>Gravestone doji.</b> Buyers drove prices far higher, then sellers pushed them all the way back to the open, which is also the low. After a rally, it is one of the most bearish doji.' },
    dragon: { label: 'Dragonfly', a: [[0, 50], [18, 48.4], [38, 45.7], [58, 47.9], [77, 50]], clamp: -1, txt: '<b>Dragonfly doji.</b> Sellers drove prices far lower, then buyers brought them all the way back to the open, which is also the high. After a decline, it acts much like a hammer.' },
    four: { label: 'Four-price', a: [[0, 50], [77, 50]], flat: true, txt: '<b>Four-price doji.</b> Open, high, low and close are all the same: the price never moved. It is rare, and appears only in very quiet markets or when trading is frozen at a price limit.' },
  };
  function dojiTicks(d) {
    if (d.flat) return Array(78).fill(50);
    const t = TA.path(d.a, 78, { seed: 9, noise: 0.0016 });
    t[0] = 50;
    t[77] = 50;
    return t.map((v) => (d.clamp > 0 ? Math.max(50, v) : d.clamp < 0 ? Math.min(50, v) : v));
  }
  V.dojiFamily = function (host, p, ctx) {
    let key = 'long',
      T = dojiTicks(DOJI[key]),
      u = 1,
      cancel = null;
    const sg = seg({ label: 'Doji', options: Object.keys(DOJI).map((k) => ({ v: k, label: DOJI[k].label })), value: key, onChange: (v) => ((key = v), (T = dojiTicks(DOJI[v])), play()) });
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Replay');
    stack(host, sg.el, el, h('div', { class: 'ctl-row' }, btn), read);
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 230 : 260),
      pad: { l: 46, r: 10, t: 24, b: 10 },
      label: 'A session’s prices and the doji they make',
      draw(P) {
        const C = pal(),
          m = Math.max(2, Math.round(77 * u) + 1),
          seen = T.slice(0, m),
          b = { o: 50, c: seen[m - 1], h: Math.max(...seen), l: Math.min(...seen) },
          ih = seen.indexOf(b.h),
          il = seen.indexOf(b.l);
        P.domain(-2, 106, 44.6, 55.4);
        P.grid({ xTicks: [], yTicks: [46, 48, 50, 52, 54], yf: (v) => '$' + v, noXLabels: true });
        P.line([[0, 50], [84, 50]], { color: C.muted, dash: [4, 4], width: 1 });
        if (b.h - 50 > 0.3) P.line([[ih, b.h], [94, b.h]], { color: C.muted, dash: [2, 3], width: 1 });
        if (50 - b.l > 0.3) P.line([[il, b.l], [94, b.l]], { color: C.muted, dash: [2, 3], width: 1 });
        P.line(seen.map((v, i) => [i, v]), { color: C.ink, width: 2 });
        if (u < 1) P.dot(m - 1, b.c, { color: C.accent, r: 3.5 });
        CS.candle(P, 96, b, { w: Math.min(34, P.w * 0.09), color: u >= 1 ? C.ink : null });
        P.text('The session, open to close', P.X(38), 11, { color: C.muted });
        P.text('Candle', P.X(96), 11, { color: C.muted });
        P.text('Open', P.X(80), P.Y(50) - 9, { color: C.muted });
      },
    });
    function play() {
      if (cancel) cancel();
      read.innerHTML = DOJI[key].txt;
      cancel = tween(2600, (k) => ((u = k), plot.render()));
    }
    read.innerHTML = DOJI[key].txt;
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- doji at tops and bottoms ---------- */
  const DT = {
    top: { label: 'After a rally', segs: [{ from: 45, to: 51.8, n: 18, seed: 5 }, { rel: [[0.1, 2.75, -0.1, 2.6, 1.6e6], [0.3, 1.2, -0.5, 0.32, 1.3e6], [-0.2, 0.05, -1.65, -1.5, 1.5e6]] }, { by: -3.6, n: 7, seed: 6 }] },
    bottom: { label: 'After a decline', segs: [{ from: 55.5, to: 48.2, n: 18, seed: 8 }, { rel: [[-0.1, 0.1, -2.75, -2.6, 1.6e6], [-0.3, 0.5, -1.1, -0.32, 1.3e6], [-0.2, 0.1, -1.4, -1.25, 1.4e6]] }, { by: -2.4, n: 7, seed: 9 }] },
  };
  V.dojiTop = function (host, p, ctx) {
    let key = 'top',
      chart = null;
    const sg = seg({ label: 'Where', options: Object.keys(DT).map((k) => ({ v: k, label: DT[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const { bars: B, at } = CS.chain(DT[key].segs),
        K = at[1] + 1,
        n = B.length,
        top = key === 'top',
        dj = B[K],
        nx = B[K + 1];
      chart = TA.chart(holder, ctx, {
        bars: B,
        ms: 3000,
        label: top ? 'A doji after a tall green candle at the end of a rally' : 'A doji after a tall red candle in a decline',
        yRange: CS.room(B, top ? -1 : 1),
        candleColor: (j) => (j === K ? pal().ink : null),
        over(P, C, i) {
          if (i > K) CS.box(P, B, K, K, { label: 'Doji', dir: top ? -1 : 1 });
        },
        onIndex(i) {
          if (i <= K) read.textContent = 'Watch the end of the trend.';
          else if (i === K + 1) read.innerHTML = top ? 'A doji right after a tall green candle: the buyers no longer won the session. <b>A warning.</b>' : 'A doji right after a tall red candle. <b>Is the decline over?</b>';
          else if (i < n) read.innerHTML = top ? 'The next day closes below the doji’s low: the warning is confirmed.' : 'The next day closes lower: no confirmation.';
          else if (top) read.innerHTML = `<b class="loss">Confirmed.</b> The next day closed at ${usd(nx.c)}, below the doji’s low of ${usd(dj.l)}. From the doji’s close, prices ${CS.moved(dj.c, B[n - 1].c)} by the end of the chart.`;
          else read.innerHTML = `<b>No bottom here.</b> The next day closed lower, at ${usd(nx.c)}, and prices ${CS.moved(dj.c, B[n - 1].c)} from the doji’s close by the end of the chart. At bottoms, wait for a strong green candle before trusting a doji.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- the hammer rules ---------- */
  V.hammerTest = function (host, p, ctx) {
    const TOP = 50.9,
      TREND = { down: CS.mini(58.6, 51.4), up: CS.mini(43.8, 50.6) };
    let body = 0.8,
      lower = 2.4,
      upper = 0.1,
      where = 'down',
      cancel = null;
    const stop = () => (cancel && cancel(), (cancel = null));
    const mk = (id, label, min, max, v, set) => slider({ id: ctx.key + '-' + id, label, min, max, step: 0.1, value: v, fmt: (x) => usd(x), onInput: (x) => (stop(), set(x), paint()) });
    const sB = mk('b', 'Real body', 0.2, 3, body, (x) => (body = x)),
      sL = mk('l', 'Lower shadow', 0, 6, lower, (x) => (lower = x)),
      sU = mk('u', 'Upper shadow', 0, 4, upper, (x) => (upper = x));
    const sg = seg({ label: 'Trend before it', options: [{ v: 'down', label: 'After a decline' }, { v: 'up', label: 'After a rally' }], value: where, onChange: (v) => (stop(), (where = v), paint()) });
    const el = h('div', { class: 'plot' });
    const checks = h('ul', { class: 'mu-rules' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, el, checks, sB.el, sL.el, sU.el, read);
    const candle = () => ({ o: TOP - body, c: TOP, h: TOP + upper, l: TOP - body - lower });
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 240 : 270),
      pad: { l: 46, r: 8, t: 12, b: 12 },
      label: 'Build a candle and test it against the hammer rules',
      draw(P) {
        const C = pal(),
          b = candle();
        P.domain(-0.8, 10.6, 41, 59.6);
        P.grid({ xTicks: [], yTicks: [42, 46, 50, 54, 58], yf: (v) => '$' + v, noXLabels: true });
        TREND[where].forEach((t, i) => CS.candle(P, i, t, { alpha: 0.45 }));
        CS.candle(P, 8, b, { w: Math.min(40, (P.X(1) - P.X(0)) * 1.15) });
        const bx = 8.85,
          part = (y0, y1, label) => {
            if (y1 - y0 < 0.25) return;
            P.line([[bx, y0], [bx, y1]], { color: C.muted, width: 1.25 });
            P.line([[bx - 0.12, y0], [bx + 0.12, y0]], { color: C.muted, width: 1.25 });
            P.line([[bx - 0.12, y1], [bx + 0.12, y1]], { color: C.muted, width: 1.25 });
            P.text(label, P.X(bx + 0.22), P.Y((y0 + y1) / 2), { align: 'left', color: C.ink });
          };
        part(b.c, b.h, 'upper');
        part(b.o, b.c, 'body');
        part(b.l, b.o, 'lower');
      },
    });
    function judge() {
      const R = body + lower + upper,
        small = body <= R / 3,
        down = where === 'down';
      const rules = [
        { ok: small, text: 'A small real body: a third of the range or less' },
        { ok: lower >= 2 * body, text: `A lower shadow at least twice the body (now ${(lower / body).toFixed(1)}×)` },
        { ok: upper <= 0.1 * R, text: 'No upper shadow, or a very short one' },
      ];
      const all = rules.every((r) => r.ok),
        inv = small && upper >= 2 * body && lower <= 0.1 * R;
      let res;
      if (all) res = down ? ['gain', 'Hammer', 'After a decline, sellers pushed prices far down and buyers took it all back. A possible bottom.'] : ['loss', 'Hanging man', 'After a rally, the same shape is a warning: sellers showed they can push prices down. Wait for confirmation.'];
      else if (inv) res = down ? ['gain', 'Inverted hammer', 'The shape upside down. After a decline, a rally that faded: a possible bottom, but it needs confirmation.'] : ['loss', 'Shooting star', 'The shape upside down. After a rally, buyers pushed up and were driven back: a bearish warning.'];
      else if (small) res = ['', lower >= 2 * body && upper >= 2 * body ? 'High-wave candle' : 'Spinning top', 'A small body, but the shadows don’t fit the hammer rules.'];
      else res = ['', 'No pattern', 'The real body is too big for a hammer: one side clearly won the session.'];
      if (res[1] === 'High-wave candle') res[2] = 'A small body with long shadows on both sides: the market swung both ways and lost its direction. Not a hammer.';
      return { rules, res };
    }
    function paint() {
      plot.render();
      const { rules, res } = judge();
      checks.replaceChildren(...rules.map((r) => h('li', { class: r.ok ? 'ok' : 'no' }, h('span', { class: 'mu-rule-i', 'aria-hidden': 'true' }, r.ok ? '✓' : '✗'), r.text)));
      read.innerHTML = `<b class="${res[0]}">${res[1]}.</b> ${res[2]}`;
    }
    paint();
    return {
      play() {
        stop();
        body = 0.8;
        upper = 0.1;
        sB.set(body);
        sU.set(upper);
        cancel = tween(1800, (k) => {
          lower = Math.round((0.2 + 2.2 * ease.out(k)) * 10) / 10;
          sL.set(lower);
          paint();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- confirmation ---------- */
  const UPLEAD = { from: 46.4, to: 51.6, n: 14, seed: 21 };
  const CONF = {
    hang: { label: 'Hanging man', lead: UPLEAD, pat: [0.5, 0.55, -1.6, 0.35], yes: [[-0.3, 0, -1.3, -1.15], -3.2], no: [[0.2, 1.4, 0, 1.25], 2.6], bull: false },
    star: { label: 'Shooting star', lead: UPLEAD, pat: [0.6, 2.6, 0.45, 0.45], yes: [[-0.4, 0.1, -1.5, -1.35], -3], no: [[0.1, 2.4, -0.1, 2.3], 2.8], bull: false },
    inv: { label: 'Inverted hammer', lead: { from: 55.6, to: 50.4, n: 14, seed: 23 }, pat: [-0.6, 1.6, -0.75, -0.45], yes: [[0.55, 1.6, 0.45, 1.45], 3.4], no: [[-0.1, 0.1, -1.3, -1.15], -3], bull: true },
  };
  V.confirmNext = function (host, p, ctx) {
    let key = 'hang',
      ok = 'yes',
      chart = null;
    const go = () => (build(), chart.play());
    const sgP = seg({ label: 'Pattern', options: Object.keys(CONF).map((k) => ({ v: k, label: CONF[k].label })), value: key, onChange: (v) => ((key = v), go()) });
    const sgO = seg({ label: 'Next day', options: [{ v: 'yes', label: 'Next day confirms' }, { v: 'no', label: 'Next day doesn’t' }], value: ok, onChange: (v) => ((ok = v), go()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sgP.el, sgO.el, holder, read, h('p', { class: 'fine' }, 'Simulated daily prices. The dashed line marks the edge of the pattern’s real body that the next day must cross.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const c = CONF[key],
        [next, by] = c[ok],
        { bars: B, at } = CS.chain([c.lead, { rel: [c.pat] }, { rel: [next] }, { by, n: 7, seed: ok === 'yes' ? 24 : 25 }]),
        K = at[1],
        n = B.length,
        pb = B[K],
        nx = B[K + 1],
        lvl = c.bull ? Math.max(pb.o, pb.c) : Math.min(pb.o, pb.c),
        move = CS.moved(pb.c, B[n - 1].c);
      const FINAL = {
        hang: {
          yes: `<b class="loss">Confirmed.</b> The next day closed at ${usd(nx.c)}, below the hanging man’s real body (${usd(lvl)}). From the hanging man’s close, prices ${move} by the end of the chart.`,
          no: `<b>Not confirmed.</b> The next day closed at ${usd(nx.c)}, above the hanging man’s body, and the rally went on: prices ${move} from the hanging man’s close. Selling on the hanging man alone would have been early.`,
        },
        star: {
          yes: `<b class="loss">Confirmed.</b> The long upper shadow was a rally that got pushed back, and the next day closed lower, at ${usd(nx.c)}. From the star’s close, prices ${move} by the end of the chart.`,
          no: `<b>The signal failed.</b> The next day closed at ${usd(nx.c)}, above the shooting star’s high of ${usd(pb.h)}. The sellers couldn’t follow through, and prices ${move} from the star’s close.`,
        },
        inv: {
          yes: `<b class="gain">Confirmed.</b> The next day opened above the inverted hammer’s body and closed higher, at ${usd(nx.c)}. From its close, prices ${move} by the end of the chart.`,
          no: `<b>Not confirmed.</b> The next day opened inside the inverted hammer’s body and closed lower, at ${usd(nx.c)}. The decline went on: prices ${move} from the inverted hammer’s close.`,
        },
      };
      chart = TA.chart(holder, ctx, {
        bars: B,
        ms: 2800,
        label: c.label + ' and the day after it',
        yRange: CS.room(B, c.bull ? 1 : -1),
        candleColor: (j) => (j === K ? pal().accent : null),
        over(P, C, i) {
          if (i <= K) return;
          CS.box(P, B, K, K, { label: c.label, dir: c.bull ? 1 : -1 });
          P.line([[K - 0.5, lvl], [Math.min(i - 1, K + 1) + 0.5, lvl]], { color: C.ink, dash: [4, 3], width: 1.5 });
        },
        onIndex(i) {
          if (i <= K) read.textContent = 'Watch the end of the trend.';
          else if (i === K + 1) read.innerHTML = `A ${c.label.toLowerCase()} ${c.bull ? 'after a decline' : 'after a rally'}. ${key === 'star' ? 'A bearish warning.' : 'Only a warning so far.'} <b>Watch the next day.</b>`;
          else if (i < n) read.textContent = ok === 'yes' ? 'The next day agrees with the signal.' : 'The next day goes the other way.';
          else read.innerHTML = FINAL[key][ok];
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };
})();
