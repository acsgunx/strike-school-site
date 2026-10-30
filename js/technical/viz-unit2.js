/* Technical Analysis, Unit 2 visuals: swing trends, support and resistance, trendlines, channels, breakouts. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, seg, pct, usd, pal, alpha, tween, ease } = SS;
  const V = SS.viz,
    TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const fix = (b) => ((b.h = Math.max(b.h, b.o, b.c)), (b.l = Math.min(b.l, b.o, b.c)), b);
  const lowAt = (bars, a, b) => {
    let k = a;
    for (let j = a; j <= b; j++) if (bars[j].l < bars[k].l) k = j;
    return [k, bars[k].l];
  };
  /** Alternating swing points labeled HH/LH/HL/LL against the previous swing of the same type. */
  function labeledSwings(bars, k = 3) {
    const raw = TA.swings(bars, k);
    const alt = [];
    raw.forEach((s) => {
      const last = alt[alt.length - 1];
      if (last && last.type === s.type) {
        if ((s.type === 'H' && s.p > last.p) || (s.type === 'L' && s.p < last.p)) alt[alt.length - 1] = s;
      } else alt.push(s);
    });
    let pH = null,
      pL = null;
    alt.forEach((s) => {
      if (s.type === 'H') {
        s.tag = pH == null ? 'H' : s.p > pH ? 'HH' : 'LH';
        pH = s.p;
      } else {
        s.tag = pL == null ? 'L' : s.p > pL ? 'HL' : 'LL';
        pL = s.p;
      }
    });
    return alt;
  }
  function drawSwings(P, C, sw, i, k = 3) {
    const vis = sw.filter((s) => s.i + k < i);
    if (vis.length > 1) P.line(vis.map((s) => [s.i, s.p]), { color: C.muted, width: 1.25, dash: [3, 3] });
    vis.forEach((s) => {
      const good = s.tag === 'HH' || s.tag === 'HL',
        bad = s.tag === 'LH' || s.tag === 'LL';
      P.tag(s.tag, P.X(s.i), P.Y(s.p), { bg: good ? C.gain : bad ? C.loss : C.stock, dy: s.type === 'H' ? -26 : 8, size: 10.5 });
    });
  }

  /* ---------- trends from swing points ---------- */
  V.swingTrend = function (host, p, ctx) {
    const SHAPES = {
      up: [[0, 40], [8, 44], [13, 42], [22, 47], [27, 45], [36, 50], [41, 48], [50, 53], [55, 51.5], [64, 56], [69, 54.5]],
      down: [[0, 56], [8, 52], [13, 54], [22, 49], [27, 51], [36, 46], [41, 48], [50, 43], [55, 44.5], [64, 40], [69, 41.5]],
      side: [[0, 48], [8, 52], [14, 47.6], [22, 52.3], [29, 47.8], [37, 52], [44, 48.2], [52, 51.8], [59, 47.7], [66, 51.6], [69, 50]],
    };
    let key = 'up',
      chart = null;
    const sg = seg({ label: 'Market', options: [{ v: 'up', label: 'Uptrend' }, { v: 'down', label: 'Downtrend' }, { v: 'side', label: 'Sideways' }], value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const bars = TA.bars(TA.path(SHAPES[key], 70, { seed: 8, noise: 0.0035 }), { seed: 8 });
      const sw = labeledSwings(bars);
      chart = TA.chart(holder, ctx, {
        bars,
        yRange: [37, 59],
        label: 'Swing points labeled on a price chart',
        over: (P, C, i) => drawSwings(P, C, sw, i),
        onIndex(i) {
          const vis = sw.filter((s) => s.i + 3 < i),
            c = (t) => vis.filter((s) => s.tag === t).length;
          const verdict = c('HH') + c('HL') >= 3 && c('LH') + c('LL') === 0 ? 'Higher highs and higher lows: an <b class="gain">uptrend</b>.' : c('LH') + c('LL') >= 3 && c('HH') + c('HL') === 0 ? 'Lower highs and lower lows: a <b class="loss">downtrend</b>.' : vis.length >= 4 ? 'Highs and lows go nowhere: a <b>sideways range</b>.' : 'Watch the swing points form.';
          read.innerHTML = `HH ${c('HH')} · HL ${c('HL')} · LH ${c('LH')} · LL ${c('LL')}. ${verdict}`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- the first lower low ---------- */
  V.trendBreak = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 40], [8, 45], [13, 43], [22, 48], [27, 46], [36, 51], [41, 49], [48, 52.4], [55, 46.6], [60, 48.6], [69, 44]], 70, { seed: 12, noise: 0.0035 }), { seed: 12 });
    const sw = labeledSwings(bars);
    const keyLow = sw.filter((s) => s.type === 'L' && s.i < 45).pop();
    let brk = null;
    for (let j = keyLow.i + 1; j < bars.length; j++)
      if (bars[j].c < keyLow.p) {
        brk = j;
        break;
      }
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      yRange: [37, 56],
      label: 'An uptrend that breaks with a lower low',
      over(P, C, i) {
        drawSwings(P, C, sw, i);
        if (i > keyLow.i + 3) P.line([[keyLow.i, keyLow.p], [bars.length - 1, keyLow.p]], { color: C.warn, width: 1.5, dash: [4, 3] });
        if (brk != null && i > brk) {
          P.dot(brk, bars[brk].c, { color: C.loss });
          P.tag('Trend broken', P.X(brk), P.Y(bars[brk].c), { bg: C.loss, dy: 10 });
        }
      },
      onIndex(i) {
        read.innerHTML = brk != null && i > brk ? `Day ${brk + 1}: price closed below the last higher low (${usd(keyLow.p)}). The pattern of higher lows is broken: time to reassess.` : i > keyLow.i + 3 ? `The dashed line marks the last higher low, ${usd(keyLow.p)}. As long as dips hold above it, the uptrend is intact.` : 'Higher highs and higher lows so far.';
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- support and resistance touches ---------- */
  V.srLevels = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 54], [5, 57.6], [11, 50.6], [18, 57.7], [25, 50.4], [32, 57.8], [39, 50.7], [46, 57.5], [53, 50.5], [59, 54]], 60, { seed: 6, noise: 0.003 }), { seed: 6, wick: 0.005 });
    const S = [49.9, 51],
      R = [57.2, 58.3];
    const touches = [];
    const sw = TA.swings(bars, 3);
    sw.forEach((s) => {
      if (s.type === 'L' && s.p <= S[1] + 0.3) touches.push({ i: s.i, p: s.p, k: 'S' });
      if (s.type === 'H' && s.p >= R[0] - 0.3) touches.push({ i: s.i, p: s.p, k: 'R' });
    });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      yRange: [48, 60],
      label: 'Support and resistance zones',
      under(P, C) {
        P.rect(-1, S[0], 60, S[1], alpha(C.gain, 0.16));
        P.rect(-1, R[0], 60, R[1], alpha(C.loss, 0.16));
        P.text('Resistance zone', P.X(1), P.Y(R[1]) - 8, { align: 'left', color: C.loss });
        P.text('Support zone', P.X(1), P.Y(S[0]) + 10, { align: 'left', color: C.gain });
      },
      over(P, C, i) {
        touches
          .filter((t) => t.i + 2 < i)
          .forEach((t, n) => {
            const c = P.c;
            c.save();
            c.beginPath();
            c.arc(P.X(t.i), P.Y(t.p), 9, 0, Math.PI * 2);
            c.strokeStyle = t.k === 'S' ? C.gain : C.loss;
            c.lineWidth = 2;
            c.stroke();
            c.restore();
            void n;
          });
      },
      onIndex(i) {
        const vis = touches.filter((t) => t.i + 2 < i);
        read.innerHTML = `Support held <b class="gain">${vis.filter((t) => t.k === 'S').length}</b> times; resistance capped price <b class="loss">${vis.filter((t) => t.k === 'R').length}</b> times. Every successful test makes a level more widely watched.`;
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- why levels work: resting orders ---------- */
  V.srOrders = function (host, p, ctx) {
    const n = 50;
    const bars = TA.bars(TA.path([[0, 56], [8, 50.4], [14, 54.5], [22, 50.3], [28, 53.9], [36, 50.5], [42, 54], [49, 52.3]], n, { seed: 14, noise: 0.003 }), { seed: 14, wick: 0.004 });
    const hits = [8, 22, 36];
    const BOOK = [
      [58, 3, 'sell'],
      [57, 2, 'sell'],
      [56, 1.5, 'sell'],
      [54, 1, 'buy'],
      [53, 1.2, 'buy'],
      [52, 1.4, 'buy'],
      [51, 2.2, 'buy'],
      [50, 9, 'buy'],
      [49, 2, 'buy'],
    ];
    const wallLeft = (i) => 9 * Math.max(0.25, 1 - 0.3 * hits.filter((x) => x < i).length);
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      yRange: [48.3, 59],
      label: 'Price bouncing off a wall of buy orders',
      pad: { r: 96 },
      over(P, C, i) {
        P.hline(50, { color: C.gain, dash: [4, 3] });
        const c = P.c,
          x0 = P.w - 90;
        c.save();
        c.font = SS.MONO(10, 600);
        BOOK.forEach(([px, size, side]) => {
          const s = px === 50 ? wallLeft(i) : size,
            y = P.Y(px);
          c.fillStyle = alpha(side === 'buy' ? C.gain : C.loss, px === 50 ? 0.85 : 0.5);
          c.fillRect(x0, y - 5, s * 8, 10);
          c.fillStyle = C.muted;
          c.textAlign = 'left';
          c.textBaseline = 'middle';
          c.fillText('$' + px, x0 + Math.max(s * 8, 2) + 4, y);
        });
        c.fillStyle = C.muted;
        c.fillText('Orders waiting', x0, P.pad.t - 4);
        c.restore();
        hits.filter((x) => x < i).forEach((x) => P.dot(x, bars[x].l, { color: C.gain, r: 4 }));
      },
      onIndex(i) {
        const n2 = hits.filter((x) => x < i).length;
        read.innerHTML = n2 === 0 ? 'A large cluster of buy orders sits at $50: people who missed it last time, and round-number buyers.' : `Bounce ${n2}: buyers at $50 absorbed the selling. Each test uses up some of those orders, so the wall is now ${pct(wallLeft(i) / 9, { d: 0 })} of its original size. Repeated tests can eventually break a level.`;
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- role reversal ---------- */
  V.roleReversal = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 54], [6, 59.6], [11, 55.5], [18, 59.7], [24, 56], [31, 59.6], [36, 58], [40, 63.4], [46, 60.4], [52, 64.5], [59, 67]], 60, { seed: 19, noise: 0.003 }), { seed: 19, wick: 0.004 });
    let brk = 38;
    for (let j = 33; j < 45; j++)
      if (bars[j].c > 60.6) {
        brk = j;
        break;
      }
    const ret = lowAt(bars, 43, 50);
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      yRange: [53, 68.5],
      label: 'Old resistance becoming support',
      under(P, C, i) {
        const after = i > brk;
        P.line([[0, 60], [59, 60]], { color: after ? C.gain : C.violet, width: 2, dash: [5, 4] });
        P.text(after ? 'Old resistance, now support' : 'Resistance $60', P.X(1), P.Y(60) - 9, { align: 'left', color: after ? C.gain : C.violet });
      },
      over(P, C, i) {
        if (i > brk) P.tag('Breakout', P.X(brk), P.Y(bars[brk].h), { bg: C.warn });
        if (i > ret[0] + 2) {
          P.dot(ret[0], ret[1], { color: C.gain });
          P.tag('Retest holds', P.X(ret[0]), P.Y(ret[1]), { bg: C.gain, dy: 10 });
        }
      },
      onIndex(i) {
        read.innerHTML = i <= brk ? 'Three times, sellers turned price back near $60.' : i <= ret[0] + 2 ? 'Price broke above $60. Watch what happens on the first pullback.' : `The pullback stopped near ${usd(ret[1])}: the old ceiling became a floor, and the uptrend resumed.`;
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- draw your own trendline ---------- */
  V.drawTrendline = function (host, p, ctx) {
    const n = 70;
    const bars = TA.bars(TA.path([[0, 40], [8, 44], [14, 42.2], [22, 47], [28, 45.2], [36, 50], [42, 48.3], [50, 53], [56, 51.3], [64, 56], [69, 55]], n, { seed: 25, noise: 0.004 }), { seed: 25 });
    const lows = TA.swings(bars, 3).filter((s) => s.type === 'L');
    let A = [10, 44.5],
      B = [45, 47.5],
      drag = null,
      cancel = null;
    const f = (x) => A[1] + ((B[1] - A[1]) / (B[0] - A[0] || 1)) * (x - A[0]);
    function stats(a = A, b = B) {
      const g = (x) => a[1] + ((b[1] - a[1]) / (b[0] - a[0] || 1)) * (x - a[0]);
      const start = Math.min(a[0], b[0]);
      let touches = 0,
        last = -9,
        breaks = 0;
      for (let j = Math.ceil(start); j < n; j++) {
        const y = g(j);
        if (bars[j].c < y * 0.997) breaks++;
        if (Math.abs(bars[j].l - y) / y < 0.006 && j - last >= 3) (touches++, (last = j));
      }
      return { touches, breaks };
    }
    function best() {
      let top = null;
      for (let x = 0; x < lows.length; x++)
        for (let y = x + 1; y < lows.length; y++) {
          const a = [lows[x].i, lows[x].p],
            b = [lows[y].i, lows[y].p],
            s = stats(a, b);
          if (s.breaks === 0 && (!top || s.touches > top.s.touches || (s.touches === top.s.touches && b[0] - a[0] > top.b[0] - top.a[0]))) top = { a, b, s };
        }
      return top;
    }
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => snap() }, 'Show the suggested line');
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      controls: false,
      scrub: false,
      yRange: [37, 58],
      label: 'Drag the two handles to draw a trendline',
      over(P, C) {
        const s = stats();
        P.line([[Math.min(A[0], B[0]), f(Math.min(A[0], B[0]))], [n - 1, f(n - 1)]], { color: s.breaks ? C.loss : C.accent, width: 2.25 });
        [A, B].forEach((pt) => {
          const c = P.c;
          c.save();
          c.beginPath();
          c.arc(P.X(pt[0]), P.Y(pt[1]), 9, 0, Math.PI * 2);
          c.fillStyle = alpha(C.accent, 0.25);
          c.fill();
          c.lineWidth = 2.5;
          c.strokeStyle = C.accent;
          c.stroke();
          c.restore();
        });
      },
    });
    box.append(h('div', { class: 'ctl-row' }, btn, h('span', { class: 'fine' }, 'Drag the circles on the chart.')), read);
    const cv = chart.main.cv,
      P = chart.main;
    cv.style.touchAction = 'none';
    cv.style.cursor = 'grab';
    const toData = (e) => {
      const r = cv.getBoundingClientRect(),
        px = e.clientX - r.left,
        py = e.clientY - r.top,
        d = P.dom,
        pd = P.pad;
      return [Math.max(0, Math.min(n - 1, P.invX(px))), d.y0 + (1 - (py - pd.t) / (P.h - pd.t - pd.b)) * (d.y1 - d.y0)];
    };
    cv.addEventListener('pointerdown', (e) => {
      const [x, y] = toData(e);
      const dist = (pt) => Math.hypot(P.X(pt[0]) - P.X(x), P.Y(pt[1]) - P.Y(y));
      drag = dist(A) < dist(B) ? (dist(A) < 28 ? 'A' : null) : dist(B) < 28 ? 'B' : null;
      if (drag) {
        if (cancel) cancel();
        cv.setPointerCapture(e.pointerId);
        cv.style.cursor = 'grabbing';
      }
    });
    cv.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const pt = toData(e);
      if (drag === 'A') A = pt;
      else B = pt;
      if (Math.abs(A[0] - B[0]) < 2) return;
      update();
    });
    const up = () => ((drag = null), (cv.style.cursor = 'grab'));
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    function update() {
      chart.render();
      const s = stats();
      read.innerHTML = `Touches: <b>${s.touches}</b> · Closes below the line: <b class="${s.breaks ? 'loss' : 'gain'}">${s.breaks}</b>. ${s.breaks ? 'Price closes below your line, so it is not acting as support. Move it to the swing lows.' : s.touches >= 3 ? 'Three or more touches with no breaks: a line many traders would respect.' : 'No breaks. More touches would make it more meaningful.'}`;
    }
    function snap() {
      const b = best();
      if (!b) return;
      if (cancel) cancel();
      const A0 = A.slice(),
        B0 = B.slice();
      cancel = tween(700, (k) => {
        const t = ease.inOut(k);
        A = [A0[0] + (b.a[0] - A0[0]) * t, A0[1] + (b.a[1] - A0[1]) * t];
        B = [B0[0] + (b.b[0] - B0[0]) * t, B0[1] + (b.b[1] - B0[1]) * t];
        update();
      });
    }
    update();
    return { destroy: () => (cancel && cancel(), chart.destroy()) };
  };

  /* ---------- channel ---------- */
  V.channel = function (host, p, ctx) {
    const n = 70,
      r = SS.rng(31),
      W = 6;
    const lowerAt = (x) => 40 + 0.2 * x;
    const closes = Array.from({ length: n }, (_, x) => lowerAt(x) + W / 2 + (W / 2 - 0.6) * Math.sin((2 * Math.PI * x) / 15) + 0.25 * SS.gauss(r));
    const bars = TA.bars(closes, { seed: 31, wick: 0.004 });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      yRange: [38, 62],
      label: 'A rising channel',
      under(P, C) {
        const lo = [[0, lowerAt(0)], [n - 1, lowerAt(n - 1)]],
          up = lo.map(([x, y]) => [x, y + W]);
        P.between(up, lo, C.accent, 0.08);
        P.line(lo, { color: C.gain, width: 2 });
        P.line(up, { color: C.loss, width: 2 });
      },
      onIndex(i) {
        const j = i - 1,
          pos = (bars[j].c - lowerAt(j)) / W;
        read.innerHTML = `Day ${i}: price is <b>${pct(Math.max(0, Math.min(1, pos)), { d: 0 })}</b> of the way up the channel. ${pos < 0.25 ? 'Near the lower line: where channel traders look to buy.' : pos > 0.75 ? 'Near the upper line: where channel traders look to take profits.' : 'In the middle: no edge either way.'}`;
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- trendline break and retest ---------- */
  V.trendlineBreak = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 40], [10, 44.5], [15, 43], [25, 47.6], [30, 46.2], [40, 50.6], [45, 48.8], [50, 47.2], [56, 50.4], [62, 47], [69, 44.5]], 70, { seed: 41, noise: 0.003 }), { seed: 41, wick: 0.004 });
    const a = lowAt(bars, 10, 20),
      b = lowAt(bars, 40, 48);
    const g = (x) => a[1] + ((b[1] - a[1]) / (b[0] - a[0])) * (x - a[0]);
    let brk = null;
    for (let j = b[0] + 1; j < 70; j++)
      if (bars[j].c < g(j) * 0.995) {
        brk = j;
        break;
      }
    let ret = null;
    if (brk != null) {
      let best = -1e9;
      for (let j = brk + 2; j < Math.min(70, brk + 12); j++)
        if (bars[j].h - g(j) > best) {
          best = bars[j].h - g(j);
          ret = j;
        }
    }
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      yRange: [38, 55],
      label: 'A trendline break followed by a retest from below',
      under(P, C, i) {
        P.line([[a[0], a[1]], [69, g(69)]], { color: brk != null && i > brk ? C.loss : C.accent, width: 2, dash: [6, 4] });
      },
      over(P, C, i) {
        if (brk != null && i > brk) P.tag('Break', P.X(brk), P.Y(bars[brk].c), { bg: C.loss, dy: 10 });
        if (ret != null && i > ret + 1) P.tag('Retest fails', P.X(ret), P.Y(bars[ret].h), { bg: C.warn });
      },
      onIndex(i) {
        read.innerHTML = brk == null || i <= brk ? 'Price respects the rising trendline: every dip finds buyers at the line.' : ret == null || i <= ret + 1 ? `Day ${brk + 1}: a close below the line. The trend is weakening.` : 'Price rallied back to the line from below and was turned away: the old support now acts as resistance.';
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- measured move ---------- */
  V.breakoutMeasure = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 44], [10, 50], [14, 52], [18, 50.5], [23, 55.7], [28, 50.3], [33, 55.8], [38, 50.4], [43, 55.6], [46, 56.9], [52, 59], [60, 62.1], [66, 61.7]], 67, { seed: 52, noise: 0.003 }), { seed: 52, wick: 0.004, volMul: (i) => (i >= 45 && i <= 47 ? 2.6 : 1) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const box = stack(host);
    const bracket = (P, C, x, y0, y1, col, label) => {
      const c = P.c,
        X = P.X(x);
      c.save();
      c.strokeStyle = col;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(X - 6, P.Y(y0));
      c.lineTo(X + 6, P.Y(y0));
      c.moveTo(X, P.Y(y0));
      c.lineTo(X, P.Y(y1));
      c.moveTo(X - 6, P.Y(y1));
      c.lineTo(X + 6, P.Y(y1));
      c.stroke();
      c.restore();
      P.text(label, X + 10, P.Y((y0 + y1) / 2), { align: 'left', color: col });
    };
    const chart = TA.chart(box, ctx, {
      bars,
      yRange: [42, 64],
      label: 'Breakout from a range with a measured-move target',
      under(P, C) {
        P.rect(13, 50, 45, 56, alpha(C.stock, 0.14));
      },
      over(P, C, i) {
        bracket(P, C, 29, 50, 56, C.stock, '$6 range');
        if (i > 46) {
          const k = Math.min(1, (i - 46) / 8);
          bracket(P, C, 29 + (50 - 29) * k, 50 + 6 * k, 56 + 6 * k, C.accent, k >= 1 ? '+$6' : '');
          P.line([[46, 62], [66, 62]], { color: C.accent, width: 2, dash: [5, 4] });
          P.text('Target $62', P.X(60), P.Y(62) - 9, { color: C.accent });
        }
      },
      lower: { height: 60, range: [0, Math.max(...bars.map((b) => b.v)) * 1.1], yTicks: [], yf: TA.fmtVol, draw: (P, C, i) => TA.drawVolume(P, bars, i, { color: (j) => (j >= 45 && j <= 47 ? alpha(C.warn, 0.95) : null) }) },
      onIndex(i) {
        read.innerHTML = i <= 46 ? 'Price consolidates between $50 and $56: a $6 range.' : i < 67 ? 'The breakout above $56 comes on heavy volume. Carry the $6 range height up from the breakout.' : 'The measured move pointed to about $62, and price reached it. Targets like this are rough guides, not promises.';
      },
    });
    box.append(read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- false breakout filters ---------- */
  V.fakeoutFilters = function (host, p, ctx) {
    const base = [[0, 52], [8, 55.6], [15, 50.6], [22, 55.7], [29, 50.8], [36, 55.5], [39, 55.2]];
    const CASES = {
      fake: { label: 'False breakout', tail: [[40, 55.9], [42, 55.3], [46, 52.6], [55, 50.8]], vol: 0.9 },
      real: { label: 'Real breakout', tail: [[40, 57.2], [42, 58.3], [47, 60.4], [55, 62.5]], vol: 2.3 },
    };
    const FILTERS = [
      ['close', 'Wait for a close above $56'],
      ['vol', 'Require 1.5× average volume'],
      ['hold', 'Require two closes above'],
    ];
    let key = 'fake',
      on = { close: false, vol: false, hold: false },
      chart = null,
      bars = [],
      avg = [];
    const sg = seg({ label: 'Scenario', options: Object.keys(CASES).map((k) => ({ v: k, label: CASES[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const toggles = h(
      'div',
      { class: 'ff-toggles' },
      FILTERS.map(([k, l]) =>
        h(
          'button',
          {
            type: 'button',
            class: 'seg-btn',
            'aria-pressed': 'false',
            onclick: (e) => {
              on[k] = !on[k];
              e.currentTarget.setAttribute('aria-pressed', String(on[k]));
              chart.render();
            },
          },
          l
        )
      )
    );
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, h('p', { class: 'plot-h' }, 'Entry filters'), toggles, holder, read);
    function entry() {
      for (let j = 40; j < bars.length; j++) {
        const b = bars[j];
        const broke = on.close ? b.c > 56 : b.h > 56;
        if (!broke) continue;
        if (on.vol && !(avg[j] && b.v >= 1.5 * avg[j])) continue;
        if (on.hold && !(bars[j - 1].c > 56 && b.c > 56)) continue;
        return { j, px: on.close || on.hold ? b.c : Math.max(56.05, b.o) };
      }
      return null;
    }
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const cs = CASES[key];
      bars = TA.bars(TA.path(base.concat(cs.tail), 56, { seed: 61, noise: 0.003 }), { seed: 61, wick: 0.004, volMul: (i) => (i >= 40 && i <= 42 ? cs.vol : 1) });
      if (key === 'fake') {
        Object.assign(bars[40], { h: 57.3, c: 55.8 });
        Object.assign(bars[41], { o: 55.8, c: 56.4, h: 56.9 });
        Object.assign(bars[42], { o: 56.3, c: 55.1 });
        [40, 41, 42].forEach((j) => fix(bars[j]));
      }
      avg = TA.sma(bars.map((b) => b.v), 20);
      chart = TA.chart(holder, ctx, {
        bars,
        yRange: [49, 64],
        label: 'A breakout attempt with entry filters',
        under(P, C) {
          P.hline(56, { color: C.violet, dash: [5, 4], label: 'Resistance $56' });
        },
        over(P, C, i) {
          const e = entry();
          if (e && i > e.j) {
            P.dot(e.j, e.px, { color: C.accent });
            P.tag('Entry ' + usd(e.px), P.X(e.j), P.Y(e.px), { bg: C.accent, dy: 10 });
          }
        },
        lower: { height: 56, range: [0, Math.max(...bars.map((b) => b.v)) * 1.1], yTicks: [], yf: TA.fmtVol, draw: (P, C, i) => TA.drawVolume(P, bars, i) },
        onIndex(i) {
          const e = entry(),
            last = bars[bars.length - 1].c;
          if (i < bars.length) return (read.textContent = 'Turn filters on or off and watch where, or whether, you would have entered.');
          if (!e) return (read.innerHTML = `<b class="gain">No entry.</b> The filters kept you out${key === 'fake' ? ' of the trap.' : ', and you missed the real move.'}`);
          const r = last / e.px - 1;
          read.innerHTML = `Entered day ${e.j + 1} at <b>${usd(e.px)}</b>. By the last day: <b class="${SS.plClass(r)}">${pct(r, { sign: true })}</b>. ${key === 'fake' ? 'Without filters, the intraday poke above $56 pulled you into a trap.' : 'Filters delay the entry on real breakouts, so you give up part of the move.'}`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- breakout entry vs retest entry ---------- */
  V.retestEntry = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 52], [8, 55.6], [15, 50.6], [22, 55.7], [30, 50.8], [37, 55.6], [40, 57.5], [44, 59.4], [50, 56.6], [53, 57.4], [60, 62.4], [64, 62]], 65, { seed: 71, noise: 0.0025 }), { seed: 71, wick: 0.004 });
    const E = {
      brk: { label: 'Breakout entry', j: 40, stop: 54.9 },
      ret: { label: 'Retest entry', j: 50, stop: 55.4 },
    };
    const target = 62;
    let pick = 'ret';
    const sg = seg({ label: 'Entry', options: Object.keys(E).map((k) => ({ v: k, label: E[k].label })), value: pick, onChange: (v) => ((pick = v), chart.render(), table()) });
    const tbl = h('div', { class: 'table-wrap' });
    const box = stack(host, sg.el);
    const chart = TA.chart(box, ctx, {
      bars,
      yRange: [49, 64],
      label: 'Breakout entry compared with a retest entry',
      under(P, C) {
        P.hline(56, { color: C.violet, dash: [5, 4], label: 'Old resistance $56' });
        P.line([[38, target], [64, target]], { color: C.accent, width: 1.5, dash: [3, 3] });
        P.text('Target $62', P.X(44), P.Y(target) - 9, { color: C.accent });
      },
      over(P, C, i) {
        const e = E[pick];
        if (i <= e.j) return;
        const px = bars[e.j].c;
        P.line([[e.j, e.stop], [64, e.stop]], { color: C.loss, width: 1.75, dash: [4, 3] });
        P.text('Stop ' + usd(e.stop), P.X(e.j) + 4, P.Y(e.stop) + 10, { align: 'left', color: C.loss });
        P.dot(e.j, px, { color: C.accent });
        P.tag('Buy ' + usd(px), P.X(e.j), P.Y(px), { bg: C.accent });
      },
    });
    box.append(tbl);
    function table() {
      tbl.innerHTML = `<table class="cmp"><thead><tr><th>Entry</th><th>Price</th><th>Stop</th><th>Risk / share</th><th>Reward to $62</th><th>Reward ÷ risk</th></tr></thead><tbody>${Object.keys(E)
        .map((k) => {
          const e = E[k],
            px = bars[e.j].c,
            risk = px - e.stop,
            rew = target - px;
          return `<tr${k === pick ? ' class="hl"' : ''}><th>${e.label}</th><td>${usd(px)}</td><td>${usd(e.stop)}</td><td class="loss">${usd(risk)}</td><td class="gain">${usd(rew)}</td><td><b>${(rew / risk).toFixed(1)}×</b></td></tr>`;
        })
        .join('')}</tbody></table>`;
    }
    table();
    return { play: chart.play, destroy: chart.destroy };
  };
})();
