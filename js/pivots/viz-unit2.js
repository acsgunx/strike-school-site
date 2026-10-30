/* Pivot Point Trading, Unit 2 visuals: CPR relationships, two-day replays, a relationship quiz, the pivot trend,
   multi-timeframe pivots, hot zones, level-day replays and the pre-market game plan. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, usd, pct, pal, alpha, tween, ease } = SS;
  const V = SS.viz,
    TA = SS.TA,
    PV = SS.PV;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);

  /** Bias score of each relationship: positive is bullish, negative bearish, zero sideways. */
  const BIAS = { higher: 2, 'overlap-higher': 1, lower: -2, 'overlap-lower': -1, unchanged: 0, outside: 0, inside: 0 };
  const relColor = (rel, C) => (BIAS[rel] > 0 ? C.gain : BIAS[rel] < 0 ? C.loss : C.warn);
  const relCls = (rel) => (BIAS[rel] > 0 ? 'gain' : BIAS[rel] < 0 ? 'loss' : 'pv-warn');
  const relLine = (rel) => `<b class="${relCls(rel)}">${PV.REL[rel][0]}</b> (${PV.REL[rel][1].toLowerCase()}). ${PV.REL[rel][2]}`;

  /** A session that opens exactly at its first anchor, so one day can start where the last one ended. */
  function session(a, o) {
    const b = PV.session(a, o),
      f = b[0],
      up = f.h - Math.max(f.o, f.c),
      dn = Math.min(f.o, f.c) - f.l;
    f.o = a[0][1];
    f.h = Math.max(f.o, f.c) + up;
    f.l = Math.min(f.o, f.c) - dn;
    return b;
  }
  /** A CPR drawn as a shaded box with solid edges. */
  function cprBox(P, z, x0, x1, color, a = 0.22) {
    P.rect(x0, z.bot, x1, z.top, alpha(color, a));
    [z.bot, z.top].forEach((v) => P.line([[x0, v], [x1, v]], { color, width: 1.5 }));
  }

  // Shared with later pivot units.
  Object.assign(PV, { BIAS, relColor, relCls, relLine, sessionAt: session, cprBox });

  /* ---------- the seven relationships ---------- */
  const PREV = { bot: 100, top: 100.6 };
  const PRESET = { higher: [101.15, 0.5], 'overlap-higher': [100.65, 0.6], lower: [99.45, 0.5], 'overlap-lower': [99.95, 0.6], unchanged: [100.3, 0.6], inside: [100.3, 0.24], outside: [100.3, 1.3] };
  const ORDER = Object.keys(PRESET);
  V.cprRelations = function (host, p, ctx) {
    let mid = PRESET.higher[0],
      wid = PRESET.higher[1],
      cancel = null;
    const zone = () => ({ bot: mid - wid / 2, top: mid + wid / 2 });
    const sg = seg({ label: 'Relationship', options: ORDER.map((k) => ({ v: k, label: PV.REL[k][0].replace(' value', '') })), value: 'higher', onChange: (k) => (stop(), glide(PRESET[k])) });
    const sM = slider({ id: ctx.key + '-m', label: 'Today’s CPR midpoint', min: 99, max: 101.6, step: 0.05, value: mid, fmt: (v) => usd(v), onInput: (v) => (stop(), (mid = v), paint()) });
    const sW = slider({ id: ctx.key + '-w', label: 'Today’s CPR width', min: 0.1, max: 1.6, step: 0.02, value: wid, fmt: (v) => usd(v), onInput: (v) => (stop(), (wid = v), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, read, sM.el, sW.el);
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 230 : 260),
      pad: { l: 10, r: 10, t: 12, b: 22 },
      label: 'Yesterday’s CPR compared with today’s',
      draw(P) {
        const C = pal(),
          z = zone(),
          col = relColor(PV.relationship(PREV, z), C);
        P.domain(0, 10, 98.1, 102.5);
        [PREV.bot, PREV.top].forEach((v) => P.line([[0.3, v], [9.7, v]], { color: C.stock, width: 1, dash: [3, 4], alpha: 0.8 }));
        cprBox(P, PREV, 0.6, 4.2, C.stock);
        cprBox(P, z, 5.8, 9.4, col);
        P.line([[4.3, (PREV.bot + PREV.top) / 2], [5.7, mid]], { color: col, width: 2, dash: [2, 3] });
        P.text('Yesterday’s CPR', P.X(2.4), P.h - 8, { color: C.muted });
        P.text('Today’s CPR', P.X(7.6), P.h - 8, { color: col });
      },
    });
    function paint() {
      plot.render();
      const z = zone(),
        rel = PV.relationship(PREV, z);
      sg.set(rel);
      read.innerHTML = `${relLine(rel)}<br><span class="fine">Yesterday ${usd(PREV.bot)} to ${usd(PREV.top)} · today ${usd(z.bot)} to ${usd(z.top)}</span>`;
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    const sync = () => (sM.set(mid), sW.set(wid), paint());
    function glide([m, w]) {
      const m0 = mid,
        w0 = wid;
      cancel = tween(420, (k) => {
        const e = ease.inOut(k);
        mid = m0 + (m - m0) * e;
        wid = w0 + (w - w0) * e;
        sync();
      });
    }
    paint();
    return {
      play() {
        // A tour through all seven, ending on the last one.
        stop();
        let from = [mid, wid];
        const n = ORDER.length;
        cancel = tween(n * 1000, (k) => {
          const t = k * n,
            j = Math.min(n - 1, Math.floor(t)),
            f = ease.inOut(Math.min(1, (t - j) / 0.45)),
            a = j ? PRESET[ORDER[j - 1]] : from,
            b = PRESET[ORDER[j]];
          mid = a[0] + (b[0] - a[0]) * f;
          wid = a[1] + (b[1] - a[1]) * f;
          sync();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- two days, two CPRs ---------- */
  const REL_DAYS = {
    higher: {
      seed: 11,
      d0: { h: 101.2, l: 98.8, c: 100.3 },
      a1: [[0, 100.1], [20, 100.9], [40, 100.6], [60, 101.6], [77, 101.9]],
      a2: [[0, 101.95], [10, 101.6], [14, 101.62], [30, 102.3], [45, 102.1], [60, 102.9], [77, 103.3]],
      end: 'Higher value: today’s CPR sat entirely above yesterday’s. Price dipped into it, found buyers and pushed through R1.',
    },
    lower: {
      seed: 11,
      d0: { h: 101.2, l: 98.8, c: 99.7 },
      a1: [[0, 99.9], [20, 99.1], [40, 99.4], [60, 98.4], [77, 98.1]],
      a2: [[0, 98.05], [10, 98.38], [14, 98.36], [30, 97.7], [45, 97.9], [60, 97.1], [77, 96.7]],
      end: 'Lower value: today’s CPR sat entirely below yesterday’s. A rally into it met sellers, and price broke below S1.',
    },
    inside: {
      seed: 11,
      d0: { h: 101.5, l: 98.5, c: 101.3 },
      a1: [[0, 101.2], [15, 100.1], [30, 101.0], [45, 99.6], [60, 100.6], [77, 100.35]],
      a2: [[0, 100.4], [8, 100.2], [16, 100.55], [22, 100.3], [34, 101.4], [48, 101.9], [62, 102.5], [77, 102.8]],
      end: 'Inside value: today’s tiny CPR fit inside yesterday’s. After a quiet start the coil released, and price broke out through R1.',
    },
    outside: {
      seed: 11,
      d0: { h: 101, l: 99, c: 100.05 },
      a1: [[0, 100], [18, 98.3], [35, 99.6], [55, 100.9], [77, 101.45]],
      a2: [[0, 101.3], [14, 100.15], [28, 101.05], [42, 100.05], [58, 101.0], [77, 100.55]],
      end: 'Outside value: today’s wide CPR swallowed yesterday’s. Price rotated back and forth around it all day without a trend.',
    },
  };
  V.relationDay = function (host, p, ctx) {
    const set = p.set || ['higher'],
      N = PV.BARS;
    let key = set[0],
      chart = null;
    const sg = set.length > 1 ? seg({ label: 'Relationship', options: set.map((k) => ({ v: k, label: PV.REL[k][0] })), value: key, onChange: (v) => ((key = v), build(), chart.play()) }) : null;
    const holder = h('div');
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const legend = h('div', { class: 'legend' });
    stack(host, sg ? sg.el : null, info, holder, legend, read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const sc = REL_DAYS[key];
      const b1 = session(sc.a1, { seed: sc.seed }),
        b2 = session(sc.a2, { seed: sc.seed + 50 }),
        bars = b1.concat(b2);
      const z0 = PV.cpr(sc.d0),
        y = PV.ohlc(b1),
        z1 = PV.cpr(y),
        F = PV.floor(y),
        rel = PV.relationship(z0, z1);
      const lo = Math.min(...bars.map((b) => b.l), z0.bot),
        hi = Math.max(...bars.map((b) => b.h), z0.top);
      const lv = [{ name: 'R1', v: F.R1 }, { name: 'S1', v: F.S1 }].filter((L) => L.v > lo - 0.3 && L.v < hi + 0.3);
      const y0 = Math.min(lo, ...lv.map((L) => L.v)),
        y1 = Math.max(hi, ...lv.map((L) => L.v));
      info.replaceChildren(stat('Yesterday’s CPR', `${usd(z0.bot)} to ${usd(z0.top)}`), stat('Today’s CPR', `${usd(z1.bot)} to ${usd(z1.top)}`), stat('Relationship', PV.REL[rel][0], relCls(rel)));
      legend.replaceChildren(lg('var(--stock)', 'Yesterday’s CPR'), lg(`var(--${relCls(rel) === 'pv-warn' ? 'warn' : relCls(rel)})`, 'Today’s CPR'));
      chart = TA.chart(holder, ctx, {
        bars,
        yRange: [y0 - (y1 - y0) * 0.08, y1 + (y1 - y0) * 0.12],
        pad: { l: 50, r: 78 },
        xTicks: [0, 39, N, N + 39, 2 * N - 1],
        yf: PV.yf,
        xf: (v) => PV.clock(Math.round(v) % N),
        dayFmt: (v) => (v <= N ? 'Yesterday ' : 'Today ') + PV.clock((v - 1) % N),
        sliderLabel: 'Time',
        ms: 4600,
        label: PV.REL[key][0] + ': two days with their central pivot ranges',
        under(P, C, i) {
          cprBox(P, z0, -0.5, N - 0.5, C.stock, 0.2);
          if (i > N) cprBox(P, z1, N - 0.5, 2 * N - 0.5, relColor(rel, C));
          P.vline(N - 0.5, { color: C.muted, dash: [3, 3], alpha: 0.6 });
          P.text('Yesterday', P.X(N / 2), P.pad.t + 9, { color: C.muted });
          P.text('Today', P.X(N * 1.5), P.pad.t + 9, { color: C.muted });
        },
        over(P, C, i) {
          if (i > N) PV.drawLevels(P, lv.concat([{ name: 'CPR', v: (z1.top + z1.bot) / 2, color: relColor(rel, C), alpha: 0 }]), { x0: N - 0.5 });
        },
        onIndex(i) {
          const b = bars[i - 1];
          if (i >= bars.length) read.innerHTML = sc.end;
          else if (i <= N) read.innerHTML = `Yesterday, ${PV.clock(i - 1)}: price ${usd(b.c)}. Today’s CPR is calculated once yesterday closes.`;
          else read.innerHTML = `Today, ${PV.clock(i - 1 - N)}: price ${usd(b.c)}, ${b.c > z1.top ? 'above' : b.c < z1.bot ? 'below' : 'inside'} today’s CPR.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- name that relationship ---------- */
  V.relQuiz = function (host, p, ctx) {
    const r = SS.rng((Date.now() % 100000) + 7);
    let order = [],
      at = 0,
      score = 0,
      seen = 0,
      answered = false,
      prev = null,
      cur = null,
      key = null;
    const plotEl = h('div', { class: 'plot' });
    const choices = h('div', { class: 'choices' });
    const fb = h('p', { class: 'readout', 'aria-live': 'polite' });
    const tally = h('p', { class: 'sorter-tally' });
    const next = h('button', { type: 'button', class: 'btn primary', hidden: true, onclick: () => round() }, 'Next pair');
    stack(host, plotEl, h('p', { class: 'plot-h' }, 'Which relationship is this?'), choices, fb, h('div', { class: 'ctl-row' }, next, tally));
    const plot = new Plot(plotEl, {
      height: 200,
      pad: { l: 10, r: 10, t: 12, b: 22 },
      label: 'Yesterday’s and today’s CPR',
      draw(P) {
        if (!prev) return;
        const C = pal(),
          lo = Math.min(prev.bot, cur.bot),
          hi = Math.max(prev.top, cur.top),
          pd = Math.max(0.25, (hi - lo) * 0.25);
        P.domain(0, 10, lo - pd, hi + pd);
        [prev.bot, prev.top].forEach((v) => P.line([[0.3, v], [9.7, v]], { color: C.stock, width: 1, dash: [3, 4], alpha: 0.8 }));
        cprBox(P, prev, 0.6, 4.2, C.stock);
        cprBox(P, cur, 5.8, 9.4, answered ? relColor(key, C) : C.accent);
        P.text('Yesterday', P.X(2.4), P.h - 8, { color: C.muted });
        P.text('Today', P.X(7.6), P.h - 8, { color: C.muted });
      },
    });
    /** Random CPR pair with the requested relationship. */
    function make(k) {
      for (let t = 0; t < 200; t++) {
        const w0 = 0.35 + r() * 0.5,
          pb = 100 + (r() - 0.5) * 0.4;
        const pz = { bot: pb, top: pb + w0 };
        let bot, top;
        if (k === 'higher') (bot = pz.top + 0.08 + r() * 0.4), (top = bot + 0.2 + r() * 0.5);
        else if (k === 'lower') (top = pz.bot - 0.08 - r() * 0.4), (bot = top - 0.2 - r() * 0.5);
        else if (k === 'overlap-higher') (bot = pz.bot + w0 * (0.2 + r() * 0.6)), (top = pz.top + 0.1 + r() * 0.4);
        else if (k === 'overlap-lower') (top = pz.top - w0 * (0.2 + r() * 0.6)), (bot = pz.bot - 0.1 - r() * 0.4);
        else if (k === 'unchanged') (bot = pz.bot + (r() - 0.5) * w0 * 0.06), (top = pz.top + (r() - 0.5) * w0 * 0.06);
        else if (k === 'inside') (bot = pz.bot + w0 * (0.15 + r() * 0.25)), (top = pz.top - w0 * (0.15 + r() * 0.25));
        else (bot = pz.bot - 0.1 - r() * 0.35), (top = pz.top + 0.1 + r() * 0.35);
        const cz = { bot, top };
        if (top > bot && PV.relationship(pz, cz) === k) return [pz, cz];
      }
      return [PREV, { bot: PRESET[k][0] - PRESET[k][1] / 2, top: PRESET[k][0] + PRESET[k][1] / 2 }];
    }
    function round() {
      if (at % ORDER.length === 0) order = ORDER.slice().sort(() => r() - 0.5);
      key = order[at % ORDER.length];
      at++;
      [prev, cur] = make(key);
      answered = false;
      next.hidden = true;
      fb.textContent = 'Compare today’s box with yesterday’s dashed edges.';
      const opts = ORDER.filter((x) => x !== key)
        .sort(() => r() - 0.5)
        .slice(0, 3)
        .concat(key)
        .sort(() => r() - 0.5);
      choices.replaceChildren(
        ...opts.map((o, j) =>
          h(
            'button',
            {
              type: 'button',
              class: 'choice',
              'data-k': o,
              onclick: (e) => {
                if (answered) return;
                answered = true;
                const ok = o === key;
                seen++;
                if (ok) score++;
                choices.querySelectorAll('.choice').forEach((b) => {
                  b.disabled = true;
                  if (b.dataset.k === key) b.classList.add('right');
                });
                if (!ok) e.currentTarget.classList.add('wrong');
                fb.innerHTML = `<b>${ok ? 'Correct.' : 'Not quite.'}</b> ${relLine(key)}`;
                tally.textContent = `${score} of ${seen} correct`;
                next.hidden = false;
                plot.render();
              },
            },
            h('span', { class: 'choice-k' }, 'ABCD'[j]),
            h('span', null, PV.REL[o][0])
          )
        )
      );
      plot.render();
    }
    round();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- the pivot trend ---------- */
  const TRENDS = {
    up: { seed: 24, a: [[0, 100], [10, 105], [13, 104.2], [24, 110.5], [27, 109.6], [38, 116], [41, 115.2], [49, 120]] },
    turn: { seed: 24, a: [[0, 100], [12, 106.5], [15, 105.8], [24, 110.5], [27, 110], [31, 107.5], [35, 108.2], [49, 99]] },
  };
  const sgn = (rel) => Math.sign(BIAS[rel] || 0);
  V.pivotTrend = function (host, p, ctx) {
    const key = p.scen || 'up',
      sc = TRENDS[key],
      n = 50;
    const bars = TA.bars(TA.path(sc.a, n, { seed: sc.seed, noise: 0.0028 }), { seed: sc.seed, wick: 0.004 });
    const cpr = bars.map((b, i) => (i ? PV.cpr(bars[i - 1]) : null));
    const rel = cpr.map((c, i) => (i > 1 ? PV.relationship(cpr[i - 1], c) : null));
    const recent = (k) => rel.slice(Math.max(2, k - 4), k + 1).filter(Boolean);
    const trend = rel.map((_, k) => recent(k).reduce((s, x) => s + sgn(x), 0));
    // Signals: with the pivot trend clearly up, an open above the CPR that dips into it and closes back above (or the mirror).
    const marks = [];
    if (p.marks) {
      let last = -9;
      for (let i = 3; i < n - 3; i++) {
        const t = trend[i - 1],
          c = cpr[i],
          b = bars[i];
        if (i - last < 4) continue;
        const buy = t >= 3 && b.o > c.top && b.l <= c.top && b.c > c.top,
          sell = t <= -3 && b.o < c.bot && b.h >= c.bot && b.c < c.bot;
        if (buy || sell) {
          const later = bars[i + 3].c;
          marks.push({ i, buy, ok: buy ? later > b.c : later < b.c });
          last = i;
        }
      }
    }
    const ups = rel.filter((x) => x && sgn(x) > 0).length,
      downs = rel.filter((x) => x && sgn(x) < 0).length;
    const flip = trend.findIndex((t, k) => k > 10 && t <= -3);
    const wins = marks.filter((m) => m.ok).length;
    let end;
    if (key === 'turn') {
      const buys = marks.filter((m) => m.buy).length;
      end = `The CPRs climbed for weeks, then lower values took over and the pivot trend turned down on day ${flip + 1}.` + (marks.length ? ` The playbook flipped with it: ${buys} dip ${buys === 1 ? 'buy' : 'buys'} while the trend was up, ${marks.length - buys} rally ${marks.length - buys === 1 ? 'sell' : 'sells'} after it turned. ${wins} of ${marks.length} were in profit three days later.` : '');
    } else if (marks.length) end = `${wins} of ${marks.length} dips into the CPR were followed by a higher close three days later.${wins < marks.length ? ' The miss is the reason every trade still needs a stop.' : ''}`;
    else end = `Over ${n} days, ${ups} CPRs moved up and ${downs} moved down. The pullbacks printed a few lower values, but the staircase kept climbing.`;
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, holder, h('div', { class: 'legend' }, lg('var(--gain)', 'Moved up'), lg('var(--loss)', 'Moved down'), lg('var(--warn)', 'Sideways')), read, h('p', { class: 'fine' }, 'Simulated daily prices. Each box is that day’s CPR, built from the day before.'));
    const col = (k, C) => (k > 1 ? relColor(rel[k], C) : C.stock);
    const chart = TA.chart(holder, ctx, {
      bars,
      ms: 4200,
      height: (w) => (w < 480 ? 250 : 300),
      label: 'Daily candles with each day’s central pivot range',
      candleColor: (j, b) => alpha(pal().stock, b.c >= b.o ? 0.45 : 0.7),
      over(P, C, i) {
        // Each CPR as a solid block, at least 3px tall so narrow ones stay visible.
        const c = P.c;
        c.save();
        for (let k = 1; k < i; k++) {
          const a = P.X(k - 0.45),
            b = P.X(k + 0.45),
            t = P.Y(cpr[k].top),
            u = P.Y(cpr[k].bot),
            m = (t + u) / 2,
            hh = Math.max(3, u - t);
          c.fillStyle = alpha(col(k, C), 0.9);
          c.fillRect(a, m - hh / 2, b - a, hh);
        }
        c.restore();
        const seenMarks = marks.filter((m) => m.i < i);
        seenMarks.forEach((m, j) => {
          const known = i - 1 >= m.i + 3,
            c = known ? (m.ok ? C.gain : C.loss) : C.ink,
            y = m.buy ? bars[m.i].l : bars[m.i].h;
          P.dot(m.i, y, { color: c, r: 4 });
          if (j === seenMarks.length - 1) P.tag(m.buy ? 'Dip buy at the CPR' : 'Rally sell at the CPR', P.X(m.i), P.Y(y), { bg: c, dy: m.buy ? 10 : -32, size: 10.5 });
        });
      },
      lower: {
        height: 50,
        range: [0, 1],
        yTicks: [],
        label: 'Each day’s relationship with the day before',
        draw(P, C, i) {
          for (let k = 2; k < i; k++) P.rect(k - 0.42, 0.12, k + 0.42, 0.88, col(k, C));
        },
      },
      onIndex(i) {
        if (i >= n) return (read.innerHTML = end);
        const k = i - 1,
          rc = recent(k),
          up = rc.filter((x) => sgn(x) > 0).length,
          dn = rc.filter((x) => sgn(x) < 0).length;
        const state = up - dn >= 3 ? ['up', 'gain'] : dn - up >= 3 ? ['down', 'loss'] : ['mixed', 'pv-warn'];
        let s = rc.length ? `Day ${k + 1}: of the last ${rc.length} CPRs, <b class="gain">${up} moved up</b> and <b class="loss">${dn} moved down</b>. Pivot trend: <b class="${state[1]}">${state[0]}</b>.` : `Day ${k + 1}.`;
        const m = marks.filter((x) => x.i <= k).pop();
        if (m && k - m.i < 4) s += ` On day ${m.i + 1} price ${m.buy ? 'dipped into the CPR and closed back above it' : 'rallied into the CPR and closed back below it'}${k - m.i >= 3 ? (m.ok ? ', and three days later it was in profit.' : ', but three days later it was not in profit.') : '.'}`;
        read.innerHTML = s;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- daily, weekly and monthly pivots ---------- */
  const TF = { D: ['Daily', 1, 'ink', 'reset every morning'], W: ['Weekly', 5, 'put', 'stay fixed for the week'], M: ['Monthly', 21, 'violet', 'stay fixed for the month'] };
  V.tfPivots = function (host, p, ctx) {
    const all = TA.bars(TA.path([[0, 100], [18, 104], [30, 101.5], [44, 106], [58, 103.5], [70, 108], [83, 106.5]], 84, { seed: 61, noise: 0.004 }), { seed: 61, wick: 0.005 });
    const S = 21,
      bars = all.slice(S),
      n = bars.length;
    const lv = {},
      changes = {};
    for (const k in TF) {
      const L = TF[k][1];
      lv[k] = bars.map((_, j) => {
        const q = Math.floor((j + S) / L);
        return PV.floor(PV.ohlc(all.slice((q - 1) * L, q * L)));
      });
      changes[k] = lv[k].filter((x, j) => !j || x.P !== lv[k][j - 1].P).length;
    }
    let tf = 'D',
      chart = null;
    const sg = seg({ label: 'Timeframe', options: Object.keys(TF).map((k) => ({ v: k, label: TF[k][0] })).concat({ v: 'all', label: 'All three' }), value: tf, onChange: (v) => ((tf = v), build(), chart.play()) });
    const holder = h('div');
    const legend = h('div', { class: 'legend' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, legend, read, h('p', { class: 'fine' }, 'Simulated daily prices. Weeks are 5 trading days and months 21.'));
    function stepLine(P, arr, name, upto, o) {
      let run = [];
      for (let j = 0; j < upto; j++) {
        if (j && arr[j][name] !== arr[j - 1][name]) (P.line(run, o), (run = []));
        run.push([j - 0.5, arr[j][name]], [j + 0.5, arr[j][name]]);
      }
      P.line(run, o);
    }
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const lines = tf === 'all' ? ['D', 'W', 'M'].map((k) => ({ k, n: 'P', ck: TF[k][2], width: k === 'D' ? 1.25 : k === 'W' ? 2.25 : 3.25, tag: k + ' P' })) : [{ k: tf, n: 'R1', ck: 'loss', width: 1.75, dash: [5, 4], tag: 'R1' }, { k: tf, n: 'P', ck: 'accent', width: 2.25, tag: 'P' }, { k: tf, n: 'S1', ck: 'gain', width: 1.75, dash: [5, 4], tag: 'S1' }];
      const vals = lines.flatMap((L) => lv[L.k].map((x) => x[L.n])).concat(bars.flatMap((b) => [b.h, b.l]));
      const lo = Math.min(...vals),
        hi = Math.max(...vals);
      legend.replaceChildren(...lines.map((L) => lg(`var(--${L.ck})`, tf === 'all' ? TF[L.k][0] + ' pivot' : L.n, !!L.dash)));
      chart = TA.chart(holder, ctx, {
        bars,
        yRange: [lo - (hi - lo) * 0.05, hi + (hi - lo) * 0.06],
        pad: { l: 50, r: 76 },
        xTicks: [0, 21, 42, 62],
        ms: 4200,
        label: (tf === 'all' ? 'Daily, weekly and monthly' : TF[tf][0]) + ' pivot levels over three months',
        under(P, C) {
          [21, 42].forEach((x) => P.vline(x - 0.5, { color: C.muted, dash: [3, 3], alpha: 0.5 }));
        },
        over(P, C, i) {
          lines.forEach((L) => stepLine(P, lv[L.k], L.n, i, { color: C[L.ck], width: L.width, dash: L.dash }));
          PV.drawLevels(P, lines.map((L) => ({ name: L.tag, v: lv[L.k][i - 1][L.n], color: C[L.ck], alpha: 0 })));
        },
        onIndex(i) {
          const j = i - 1;
          if (tf === 'all') read.innerHTML = i >= n ? `In ${n} days the daily pivot changed ${changes.D} times, the weekly ${changes.W} times and the monthly only ${changes.M} times. Fewer changes mean each level stays on more traders’ charts for longer.` : `Day ${j + 1}: daily P <b>${usd(lv.D[j].P)}</b> · weekly P <b>${usd(lv.W[j].P)}</b> · monthly P <b>${usd(lv.M[j].P)}</b>.`;
          else {
            const x = lv[tf][j];
            read.innerHTML = i >= n ? `${TF[tf][0]} levels ${TF[tf][3]}: across these ${n} days the ${TF[tf][0].toLowerCase()} pivot was set ${changes[tf]} times.` : `Day ${j + 1}, ${TF[tf][0].toLowerCase()} levels: R1 <b>${usd(x.R1)}</b> · P <b>${usd(x.P)}</b> · S1 <b>${usd(x.S1)}</b>. They ${TF[tf][3]}.`;
          }
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- hot zones ---------- */
  const MTF = [
    { k: 'D', name: 'Daily', y: { h: 102, l: 98, c: 101 }, ck: 'ink' },
    { k: 'W', name: 'Weekly', y: { h: 103, l: 95, c: 98.1 }, ck: 'put' },
    { k: 'M', name: 'Monthly', y: { h: 106, l: 90, c: 99.8 }, ck: 'violet' },
  ];
  const mtfLevels = (lo, hi) =>
    MTF.flatMap((t) => {
      const F = PV.floor(t.y);
      return ['R2', 'R1', 'P', 'S1', 'S2'].map((n) => ({ tf: t.k, n, name: t.k + ' ' + n, v: F[n], ck: t.ck }));
    }).filter((L) => L.v >= lo && L.v <= hi);
  /** Chain levels that sit within `tol` dollars of each other; keep clusters that span two or more timeframes. */
  function clusters(levels, tol) {
    const out = [];
    levels
      .slice()
      .sort((a, b) => a.v - b.v)
      .forEach((L) => {
        const g = out[out.length - 1];
        if (g && L.v - g.items[g.items.length - 1].v <= tol + 1e-9) g.items.push(L);
        else out.push({ items: [L] });
      });
    return out.map((g) => ({ items: g.items, bot: g.items[0].v, top: g.items[g.items.length - 1].v, tfs: new Set(g.items.map((x) => x.tf)).size })).filter((g) => g.tfs >= 2);
  }
  PV.clusters = clusters;
  V.hotZones = function (host, p, ctx) {
    const LO = 93.6,
      HI = 108,
      levels = mtfLevels(LO, HI);
    let tol = 0.3,
      reveal = 1,
      cancel = null;
    const sl = slider({ id: ctx.key + '-t', label: 'How close counts', min: 0.05, max: 0.6, step: 0.05, value: tol, fmt: (v) => `${v.toFixed(2)}% ≈ ${usd(v)}`, onInput: (v) => ((tol = v), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, sl.el, read, h('p', { class: 'fine' }, 'Levels outside this price window are hidden. At prices near $100, each 0.1% is about 10 cents.'));
    const COLS = { D: [0.2, 2.5], W: [2.75, 5.05], M: [5.3, 7.6] };
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 340 : 380),
      pad: { l: 10, r: 10, t: 26, b: 10 },
      label: 'Daily, weekly and monthly levels side by side, with hot zones shaded',
      draw(P) {
        const C = pal(),
          zs = clusters(levels, tol);
        P.domain(0, 10, LO, HI);
        if (reveal >= 1) zs.forEach((z) => P.rect(0, z.bot - 0.14, 10, z.top + 0.14, alpha(C.warn, z.tfs >= 3 ? 0.3 : 0.17)));
        MTF.forEach((t, j) => {
          const [x0, x1] = COLS[t.k],
            a = Math.max(0, Math.min(1, reveal * 3.3 - j));
          P.text(t.name, P.X((x0 + x1) / 2), 13, { color: C[t.ck] });
          if (a <= 0) return;
          levels
            .filter((L) => L.tf === t.k)
            .forEach((L) => {
              P.line([[x0, L.v], [x0 + (x1 - x0) * a, L.v]], { color: C[t.ck], width: L.n === 'P' ? 2.75 : 1.75 });
              if (a >= 1) P.text(L.n + ' ' + L.v.toFixed(2), P.X(x0), P.Y(L.v) - 8, { align: 'left', color: C[t.ck], size: 9.5 });
            });
        });
        if (reveal >= 1) zs.forEach((z) => P.text(`${z.tfs}× ${usd((z.bot + z.top) / 2)}`, P.X(9.9), P.Y((z.bot + z.top) / 2), { align: 'right', color: C.warn, weight: 700 }));
      },
    });
    function paint() {
      plot.render();
      const zs = clusters(levels, tol).sort((a, b) => b.tfs - a.tfs || a.bot - b.bot);
      read.innerHTML = zs.length
        ? `<b>${zs.length} hot ${zs.length === 1 ? 'zone' : 'zones'}</b><br>` + zs.map((z) => `${usd(z.bot)}${z.top - z.bot > 0.005 ? ' to ' + usd(z.top) : ''}: ${z.items.map((L) => L.name).join(' + ')} (${z.tfs} timeframes)`).join('<br>')
        : 'No levels from different timeframes are that close. Widen the range.';
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(1700, (k) => {
          reveal = k;
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- level days: hot zones and the plan, replayed ---------- */
  const PLAN_Y = { h: 102, l: 98, c: 100.6 };
  const LDAYS = {
    hotzone: { label: 'A day at the hot zones', seed: 33, a: [[0, 100.15], [8, 99.6], [16, 98.8], [19, 98.72], [24, 99.5], [36, 100.7], [50, 101.9], [58, 102.45], [62, 102.4], [70, 101.85], [77, 102.0]] },
    works: { label: 'The plan works', seed: 43, plan: true, a: [[0, 100.95], [11, 100.5], [14, 100.52], [26, 101.3], [38, 101.8], [52, 102.45], [60, 102.3], [77, 102.25]] },
    fails: { label: 'The plan fails', seed: 43, plan: true, a: [[0, 100.95], [11, 100.5], [14, 100.52], [20, 100.85], [30, 100.1], [34, 99.85], [50, 99.3], [62, 99.55], [77, 99.2]] },
  };
  /** Buy the first bounce off the CPR top; exit at R1, or on a close below the CPR bottom. */
  function planTrade(bars, z, F) {
    const ev = PV.reactions(bars, [{ name: 'CPR top', v: z.top }]).find((x) => x.kind === 'bounce');
    if (!ev) return null;
    const t = { i: ev.i, entry: bars[ev.i].c, stop: z.bot, target: F.R1 };
    for (let j = ev.i + 1; j < bars.length && t.exit == null; j++) {
      if (bars[j].h >= t.target) Object.assign(t, { exit: j, px: t.target, win: true });
      else if (bars[j].c < t.stop) Object.assign(t, { exit: j, px: bars[j].c, win: false });
    }
    if (t.exit == null) Object.assign(t, { exit: bars.length - 1, px: bars[bars.length - 1].c, open: true }, { win: bars[bars.length - 1].c > t.entry });
    return t;
  }
  V.levelDay = function (host, p, ctx) {
    const set = p.set || ['hotzone'];
    let key = set[0],
      chart = null;
    const sg = set.length > 1 ? seg({ label: 'Day', options: set.map((k) => ({ v: k, label: LDAYS[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) }) : null;
    const holder = h('div');
    const legend = h('div', { class: 'legend' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg ? sg.el : null, holder, legend, read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const sc = LDAYS[key],
        bars = session(sc.a, { seed: sc.seed });
      const lo = Math.min(...bars.map((b) => b.l)),
        hi = Math.max(...bars.map((b) => b.h));
      let lines,
        zones = [],
        react = [],
        tr = null,
        z = null,
        F = null;
      if (sc.plan) {
        F = PV.floor(PLAN_Y);
        z = PV.cpr(PLAN_Y);
        lines = [{ name: 'R1', v: F.R1 }, { name: 'S1', v: F.S1 }, { name: 'P', v: F.P, dash: null, width: 2 }].filter((L) => L.v > lo - 0.4 && L.v < hi + 0.4);
        tr = planTrade(bars, z, F);
        legend.replaceChildren(lg('var(--accent)', 'CPR'), lg('var(--ink)', 'Entry', true), lg('var(--loss)', 'Exit if it closes below'), lg('var(--gain)', 'Target'));
      } else {
        const all = mtfLevels(lo - 0.6, hi + 0.6);
        zones = clusters(all, 0.3);
        lines = all.map((L) => ({ name: L.name, ck: L.ck, v: L.v, width: L.n === 'P' ? 2 : 1.5 }));
        react = zones.map((g) => ({ name: 'the ' + usd((g.bot + g.top) / 2) + ' hot zone', v: (g.bot + g.top) / 2 }));
        legend.replaceChildren(lg('var(--ink)', 'Daily'), lg('var(--put)', 'Weekly'), lg('var(--violet)', 'Monthly'), lg('var(--warn)', 'Hot zone', true));
      }
      const reacts = PV.reactions(bars, react);
      const vals = lines.map((L) => L.v).concat(z ? [z.bot, z.top] : [], [lo, hi]);
      const y0 = Math.min(...vals),
        y1 = Math.max(...vals);
      chart = TA.chart(holder, ctx, {
        bars,
        yRange: [y0 - (y1 - y0) * 0.06, y1 + (y1 - y0) * 0.08],
        pad: { l: 50, r: 78 },
        xTicks: PV.TICKS,
        xf: PV.clock,
        yf: PV.yf,
        dayFmt: (v) => PV.clock(v - 1),
        sliderLabel: 'Time',
        ms: 3800,
        label: sc.label,
        under(P, C) {
          if (z) PV.drawZone(P, z.bot, z.top, C.accent, 0.18);
          zones.forEach((g) => P.rect(P.dom.x0, g.bot - 0.08, P.dom.x1, g.top + 0.08, alpha(C.warn, g.tfs >= 3 ? 0.26 : 0.16)));
        },
        over(P, C, i) {
          if (sc.plan) PV.drawLevels(P, lines.concat([{ name: 'TC', v: z.TC, color: C.accent, alpha: 0 }, { name: 'BC', v: z.BC, color: C.accent, alpha: 0 }]));
          else {
            PV.drawLevels(P, lines.map((L) => Object.assign({}, L, { color: C[L.ck] })), { labels: false });
            PV.drawLevels(P, zones.map((g) => ({ name: `${g.tfs}× zone`, v: (g.bot + g.top) / 2, color: C.warn, alpha: 0 })).concat(lines.filter((L) => L.name === 'D P').map((L) => ({ name: 'D P', v: L.v, color: C.ink, alpha: 0 }))));
          }
          reacts
            .filter((x) => x.i < i)
            .forEach((x, k, arr) => {
              const up = x.kind === 'bounce' || x.kind === 'break-up',
                y = up ? bars[x.i].l : bars[x.i].h;
              P.dot(x.i, y, { color: up ? C.gain : C.loss, r: 4 });
              if (k === arr.length - 1) P.tag(up ? 'Buyers step in' : 'Sellers step in', P.X(x.i), P.Y(y), { bg: up ? C.gain : C.loss, dy: up ? 8 : -30, size: 10.5 });
            });
          if (tr && i > tr.i) {
            const x1 = Math.min(i - 1, tr.exit);
            P.line([[tr.i, tr.entry], [x1, tr.entry]], { color: C.ink, width: 1.5, dash: [4, 3] });
            P.line([[tr.i, tr.stop], [x1, tr.stop]], { color: C.loss, width: 2.25 });
            P.line([[tr.i, tr.target], [x1, tr.target]], { color: C.gain, width: 2.25 });
            P.dot(tr.i, tr.entry, { color: C.accent, r: 4 });
            if (i - 1 >= tr.exit) {
              P.dot(tr.exit, tr.px, { color: tr.win ? C.gain : C.loss, r: 4.5 });
              P.tag(tr.win ? 'Target hit' : 'Exit: closed below', P.X(tr.exit), P.Y(tr.px), { bg: tr.win ? C.gain : C.loss, dy: tr.win ? -32 : 10, size: 10.5 });
            } else P.tag('Buy ' + usd(tr.entry), P.X(tr.i), P.Y(tr.entry), { bg: C.accent, dy: 10, size: 10.5 });
          }
        },
        onIndex(i) {
          const b = bars[i - 1],
            at = PV.clock(i - 1);
          if (sc.plan) {
            if (!tr || i - 1 < tr.i) read.innerHTML = `${at}: price ${usd(b.c)}. The plan: wait for a dip that holds the CPR top (${usd(z.top)}).`;
            else if (i - 1 < tr.exit) read.innerHTML = `${PV.clock(tr.i)}: the dip held the CPR top. Bought at <b>${usd(tr.entry)}</b>. Target R1 <b>${usd(tr.target)}</b>; exit on a close below <b>${usd(tr.stop)}</b>. Now ${usd(b.c)}.`;
            else {
              const pl = tr.px - tr.entry,
                risk = tr.entry - tr.stop;
              read.innerHTML = tr.win
                ? `${PV.clock(tr.exit)}: R1 reached. Sold at <b>${usd(tr.px)}</b> for <b class="gain">+${usd(pl)}</b> a share, about ${(pl / risk).toFixed(1)} times the ${usd(risk)} that was at risk.` + (i >= bars.length ? ' The CPR held as support, exactly as the plan expected.' : '')
                : `${PV.clock(tr.exit)}: price closed below the CPR at ${usd(tr.px)}, so the idea was wrong and the trade closed for <b class="loss">${usd(pl)}</b> a share.` + (i >= bars.length ? ` A small, planned loss. Holding on would have meant ${usd(bars[bars.length - 1].c - tr.entry)} by the close.` : '');
            }
          } else {
            const seen = reacts.filter((x) => x.i < i),
              last = seen[seen.length - 1];
            read.innerHTML =
              i >= bars.length
                ? `Both turns came at hot zones: buyers stepped in where three timeframes meet near ${usd(react[0].v)}, and sellers where two meet near ${usd(react[react.length - 1].v)}. The daily pivot in between was crossed on the way up.`
                : last
                  ? `${PV.clock(last.i)}: ${PV.reactionLabel(last)}.`
                  : `${at}: price ${usd(b.c)}.`;
          }
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- the pre-market game plan ---------- */
  const D0 = { h: 100.5, l: 97, c: 98.2 };
  V.gamePlan = function (host, p, ctx) {
    let open = 'above',
      reveal = 1,
      cancel = null;
    const z0 = PV.cpr(D0);
    const plotEl = h('div', { class: 'plot' });
    const card = h('div', { class: 'pv-plan', 'aria-live': 'polite' });
    const inp = PV.yesterdayInputs(ctx, { pos: 0.65 }, () => paint());
    const sg = seg({ label: 'Where price opens', options: [{ v: 'above', label: 'Opens above the CPR' }, { v: 'inside', label: 'Opens inside' }, { v: 'below', label: 'Opens below' }], value: open, onChange: (v) => ((open = v), paint()) });
    stack(host, plotEl, ...inp.els, sg.el, card, h('p', { class: 'fine' }, `The day before yesterday is fixed: its CPR ran from ${usd(z0.bot)} to ${usd(z0.top)}.`));
    function calc() {
      const y = inp.ohlc(),
        F = PV.floor(y),
        z = PV.cpr(y),
        rel = PV.relationship(z0, z),
        gap = Math.max(0.15, (y.h - y.l) * 0.08);
      const o = open === 'above' ? z.top + gap : open === 'below' ? z.bot - gap : (z.top + z.bot) / 2;
      const os = open === 'above' ? 1 : open === 'below' ? -1 : 0;
      return { y, F, z, rel, w: z.width / z.P, o, os, score: BIAS[rel] + os };
    }
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 300 : 340),
      pad: { l: 10, r: 10, t: 14, b: 22 },
      label: 'Today’s levels, the day before’s CPR and the open',
      draw(P) {
        const C = pal(),
          k = calc(),
          col = relColor(k.rel, C);
        const vals = [k.F.R2, k.F.S2, z0.bot, z0.top, k.o],
          lo = Math.min(...vals),
          hi = Math.max(...vals),
          pd = (hi - lo) * 0.05;
        P.domain(0, 10, lo - pd, hi + pd);
        cprBox(P, z0, 0.3, 2.5, C.stock);
        P.text('Day before', P.X(1.4), P.h - 8, { color: C.muted });
        P.text('Today', P.X(6.5), P.h - 8, { color: C.muted });
        const x1 = 3 + 7 * reveal;
        cprBox(P, k.z, 3, x1, col);
        PV.drawLevels(
          P,
          [{ name: 'R2', v: k.F.R2 }, { name: 'R1', v: k.F.R1 }, { name: 'CPR top', v: k.z.top, color: col, alpha: 0 }, { name: 'CPR bottom', v: k.z.bot, color: col, alpha: 0 }, { name: 'S1', v: k.F.S1 }, { name: 'S2', v: k.F.S2 }],
          { x0: 3, x1 }
        );
        if (reveal >= 1) {
          P.dot(3.5, k.o, { color: C.ink, r: 4.5 });
          P.tag('Open ' + usd(k.o), P.X(3.5), P.Y(k.o), { align: 'left', dy: -10, bg: C.ink, size: 10.5 });
        }
      },
    });
    function paint() {
      plot.render();
      const k = calc(),
        { F, z } = k,
        s = k.score,
        T = (v) => `<b>${usd(v)}</b>`;
      const width = k.w < 0.0025 ? ['Narrow', 'accent', 'a trend day is possible'] : k.w > 0.0075 ? ['Wide', 'pv-warn', 'a sideways range day is more likely'] : ['Moderate', '', 'no strong hint either way'];
      const rs = Math.sign(BIAS[k.rel]);
      const agree = k.os && rs ? (k.os === rs ? ', which agrees with the relationship' : ', which disagrees with the relationship') : '';
      const bias = s >= 2 ? ['Bullish', 'gain'] : s <= -2 ? ['Bearish', 'loss'] : s === 1 ? ['Leaning bullish', 'gain'] : s === -1 ? ['Leaning bearish', 'loss'] : ['Neutral', 'pv-warn'];
      let plan;
      if (s >= 2) plan = (open === 'above' ? `Buy dips that hold the CPR top (${T(z.top)}).` : `Wait for price to clear the CPR top (${T(z.top)}), then buy the first pullback that holds it.`) + ` First target R1 (${T(F.R1)})${width[0] === 'Narrow' ? `, then R2 (${T(F.R2)}) if it turns into a trend day` : ''}. The idea is wrong on a close back below the CPR bottom (${T(z.bot)}).`;
      else if (s <= -2) plan = (open === 'below' ? `Sell rallies that fail at the CPR bottom (${T(z.bot)}).` : `Wait for price to drop below the CPR bottom (${T(z.bot)}), then sell the first bounce that fails there.`) + ` First target S1 (${T(F.S1)})${width[0] === 'Narrow' ? `, then S2 (${T(F.S2)}) if it turns into a trend day` : ''}. The idea is wrong on a close back above the CPR top (${T(z.top)}).`;
      else if (s === 1) plan = `The signals only partly agree, so let price prove it: buy only once it holds above the CPR top (${T(z.top)}), and keep the size small.`;
      else if (s === -1) plan = `The signals only partly agree, so let price prove it: sell only once it holds below the CPR bottom (${T(z.bot)}), and keep the size small.`;
      else plan = width[0] === 'Narrow' ? `Neither side has the edge, but the CPR is narrow: wait for a break out of it, then trade in that direction toward R1 (${T(F.R1)}) or S1 (${T(F.S1)}).` : `Expect two-way trade: look to sell near R1 (${T(F.R1)}) and buy near S1 (${T(F.S1)}), with small size and tight exits. Stay out while price is inside the CPR.`;
      if (width[0] === 'Wide' && s !== 0) plan += ' The CPR is wide, so take profits at R1 or S1 rather than hoping for more.';
      card.innerHTML = `<ol class="pv-steps">
        <li><span class="stat-l">1 · CPR width</span><span><b class="${width[1]}">${width[0]}</b>, ${pct(k.w, { d: 2 })} of price: ${width[2]}.</span></li>
        <li><span class="stat-l">2 · Relationship</span><span><b class="${relCls(k.rel)}">${PV.REL[k.rel][0]}</b>: ${PV.REL[k.rel][1].toLowerCase()}.</span></li>
        <li><span class="stat-l">3 · The open</span><span><b class="${k.os > 0 ? 'gain' : k.os < 0 ? 'loss' : 'pv-warn'}">${{ above: 'Above the CPR', inside: 'Inside the CPR', below: 'Below the CPR' }[open]}</b> at ${usd(k.o)}${agree}.</span></li>
      </ol>
      <div class="pv-verdict pv-v-${bias[1]}"><span class="stat-l">The plan</span><b class="${bias[1]}">${bias[0]}</b><p>${plan}</p></div>`;
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(1100, (k) => {
          reveal = Math.max(0.01, ease.out(k));
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };
})();
