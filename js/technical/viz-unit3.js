/* Technical Analysis, Unit 3 visuals: animated chart patterns, a pattern-naming game, candlestick patterns. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, seg, usd, pal, alpha, tween } = SS;
  const V = SS.viz,
    TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };

  /* ---------- pattern specs ----------
     anchors: price path; parts: [bar, 'h'|'l'|'c', label]; lines: [[bar,'h'|'l'], [bar,'h'|'l']];
     brk: index of the line whose break confirms; dir: +1 up / -1 down; height: [bar,'h'|'l'] extreme
     measured against the break line, or pole: [[bar,ref],[bar,ref]]; fail: [bar,ref] level that voids it. */
  const BASE = {
    hs: {
      label: 'Head and shoulders top', n: 70, dir: -1, after: 41,
      anchors: [[0, 40], [10, 48], [15, 45.5], [25, 52], [32, 45.8], [40, 49], [46, 44.4], [52, 46.1], [62, 39.6], [69, 37.8]],
      parts: [[10, 'h', 'Left shoulder'], [25, 'h', 'Head'], [40, 'h', 'Right shoulder']],
      lines: [[[15, 'l'], [32, 'l']]], brk: 0, height: [25, 'h'],
      txt: ['Three peaks are forming, the middle one highest.', 'The neckline joins the two troughs. Not confirmed yet: this could still be a pullback.', 'Confirmed: a close below the neckline. The head’s height, projected down, gives a rough target.', 'Price reached roughly the projected target.'],
    },
    dtop: {
      label: 'Double top', n: 60, dir: -1, after: 28,
      anchors: [[0, 40], [12, 50], [19, 45.5], [27, 50.1], [33, 44.6], [39, 46], [49, 41], [59, 39.6]],
      parts: [[12, 'h', 'First top'], [27, 'h', 'Second top']],
      lines: [[[19, 'l'], [19, 'l']]], brk: 0, height: [12, 'h'],
      txt: ['Price stalls at the same high twice.', 'The trough between the tops is the line to watch.', 'Confirmed: a close below the trough. Two failed attempts at $50 turned into a reversal.', 'The pattern’s height, projected down, was roughly reached.'],
    },
    fail: {
      label: 'Failed head and shoulders', n: 70, dir: -1, after: 41,
      anchors: [[0, 40], [10, 48], [15, 45.5], [25, 52], [32, 45.8], [40, 49], [44, 45.6], [46, 44.1], [50, 47.6], [56, 51], [63, 53.6], [69, 54.2]],
      parts: [[10, 'h', 'Left shoulder'], [25, 'h', 'Head'], [40, 'h', 'Right shoulder']],
      lines: [[[15, 'l'], [32, 'l']]], brk: 0, height: [25, 'h'], fail: [40, 'h'],
      txt: ['A textbook head and shoulders is forming.', 'The neckline is drawn. Sellers are waiting for the break.', 'The neckline breaks: pattern traders sell.', ''],
    },
    asc: {
      label: 'Ascending triangle', n: 60, dir: 1, after: 42,
      anchors: [[0, 48], [6, 55.8], [12, 50], [18, 55.9], [24, 51.8], [30, 55.8], [36, 53.4], [41, 55.9], [44, 54.8], [47, 57.4], [52, 59.6], [59, 63.2]],
      parts: [[18, 'h', 'Flat top'], [24, 'l', 'Rising lows']],
      lines: [[[6, 'h'], [41, 'h']], [[12, 'l'], [36, 'l']]], brk: 0, height: [12, 'l'],
      txt: ['Sellers hold one price while buyers step in higher each time.', 'A flat top and rising lows are squeezing together.', 'Breakout above the flat top. The triangle’s height, added to the break, gives a target.', 'The measured target was roughly reached.'],
    },
    sym: {
      label: 'Symmetrical triangle', n: 60, dir: 1, after: 41,
      anchors: [[0, 46], [6, 56], [12, 47.5], [18, 54.6], [24, 49], [30, 53.3], [35, 50.3], [40, 52.2], [43, 51.3], [46, 54.1], [52, 57.4], [59, 61.4]],
      parts: [[18, 'h', 'Lower highs'], [24, 'l', 'Higher lows']],
      lines: [[[6, 'h'], [30, 'h']], [[12, 'l'], [35, 'l']]], brk: 0, height: [12, 'l'],
      txt: ['Swings get smaller on both sides.', 'Lower highs and higher lows converge. The break could come either way.', 'This one breaks upward. The widest part of the triangle gives a target.', 'The target was roughly reached.'],
    },
    flag: {
      label: 'Bull flag', n: 50, dir: 1, after: 26,
      anchors: [[0, 40], [8, 49], [11, 47.7], [14, 48.7], [18, 47.1], [21, 48.1], [25, 46.8], [28, 49.4], [34, 53], [42, 56.8], [49, 57.6]],
      parts: [[4, 'c', 'Pole'], [18, 'l', 'Flag']],
      lines: [[[14, 'h'], [21, 'h']], [[11, 'l'], [25, 'l']]], brk: 0, pole: [[0, 'l'], [8, 'h']], volPole: true,
      txt: ['A sharp, almost straight rally: the pole.', 'Price drifts down in a tight channel on lighter volume: the flag.', 'Breakout from the flag. The pole’s length, added to the break, gives a target.', 'The target was roughly reached.'],
    },
  };
  function mirror(s, label, M = 92) {
    const flip = (r) => (r === 'h' ? 'l' : r === 'l' ? 'h' : r);
    const relabel = { 'Left shoulder': 'Left shoulder', Head: 'Head', 'Right shoulder': 'Right shoulder', 'First top': 'First bottom', 'Second top': 'Second bottom', 'Flat top': 'Flat bottom', 'Rising lows': 'Falling highs' };
    return Object.assign({}, s, {
      label,
      dir: -s.dir,
      anchors: s.anchors.map(([i, p]) => [i, M - p]),
      parts: s.parts.map(([i, r, l]) => [i, flip(r), relabel[l] || l]),
      lines: s.lines.map((ln) => ln.map(([i, r]) => [i, flip(r)])),
      height: s.height && [s.height[0], flip(s.height[1])],
      pole: s.pole && s.pole.map(([i, r]) => [i, flip(r)]),
      fail: s.fail && [s.fail[0], flip(s.fail[1])],
      txt: s.txt.map((t) => t.replace('below', 'above').replace('down', 'up').replace('Sellers hold one price while buyers step in higher', 'Buyers hold one price while sellers step in lower').replace('flat top and rising lows', 'flat bottom and falling highs').replace('above the flat top', 'below the flat bottom').replace('added to the break', 'subtracted from the break').replace('stalls at the same high', 'bounces off the same low').replace('Two failed attempts at $50 turned into a reversal.', 'Two failed attempts to go lower turned into a reversal.').replace('The trough between the tops', 'The peak between the bottoms').replace('trough.', 'peak.').replace('two troughs', 'two peaks').replace('the middle one highest', 'the middle one lowest').replace('Three peaks', 'Three troughs')),
    });
  }
  const PAT = Object.assign({}, BASE, { ihs: mirror(BASE.hs, 'Inverse head and shoulders'), dbot: mirror(BASE.dtop, 'Double bottom'), desc: mirror(BASE.asc, 'Descending triangle') });
  SS.PATTERNS = PAT;
  SS.preparePattern = (key, seed) => preparePattern(key, seed);

  function preparePattern(key, seed = 3) {
    const s = PAT[key];
    const bars = TA.bars(TA.path(s.anchors, s.n, { seed, noise: 0.0025 }), { seed, wick: 0.004, volMul: (i) => (s.volPole ? (i <= 8 ? 1.8 : i < 26 ? 0.6 : 1.3) : 1) });
    const ref = ([i, r]) => {
      if (r === 'c') return [i, bars[i].c];
      let k = i;
      for (let j = Math.max(0, i - 2); j <= Math.min(s.n - 1, i + 2); j++) if (r === 'h' ? bars[j].h > bars[k].h : bars[j].l < bars[k].l) k = j;
      return [k, r === 'h' ? bars[k].h : bars[k].l];
    };
    const lines = s.lines.map(([a, b]) => {
      const A = ref(a),
        B = ref(b);
      const slope = B[0] === A[0] ? 0 : (B[1] - A[1]) / (B[0] - A[0]);
      return { A, B, at: (x) => A[1] + slope * (x - A[0]), shown: Math.max(A[0], B[0]) + 2 };
    });
    const L = lines[s.brk];
    let brk = null;
    for (let j = s.after; j < s.n; j++)
      if ((s.dir < 0 && bars[j].c < L.at(j) * 0.996) || (s.dir > 0 && bars[j].c > L.at(j) * 1.004)) {
        brk = j;
        break;
      }
    let height;
    if (s.pole) height = Math.abs(ref(s.pole[1])[1] - ref(s.pole[0])[1]);
    else {
      const E = ref(s.height);
      height = Math.abs(E[1] - L.at(E[0]));
    }
    const base = brk != null ? L.at(brk) : L.at(s.n - 1);
    const target = base + s.dir * height;
    let failed = null;
    if (s.fail && brk != null) {
      const F = ref(s.fail)[1];
      for (let j = brk + 1; j < s.n; j++)
        if ((s.dir < 0 && bars[j].c > F) || (s.dir > 0 && bars[j].c < F)) {
          failed = j;
          break;
        }
    }
    const parts = s.parts.map((pt) => ({ at: ref(pt), label: pt[2], r: pt[1] }));
    const lo = Math.min(...bars.map((b) => b.l), target),
      hi = Math.max(...bars.map((b) => b.h), target);
    return { s, bars, lines, brk, target, height, failed, parts, yRange: [lo - (hi - lo) * 0.08, hi + (hi - lo) * 0.12] };
  }

  function patternChart(holder, ctx, pr, opts) {
    const { s, bars, lines, brk, target, failed, parts } = pr;
    return TA.chart(holder, ctx, {
      bars,
      yRange: pr.yRange,
      label: s.label,
      controls: opts.controls,
      ms: opts.ms,
      lower: s.volPole ? { height: 56, range: [0, Math.max(...bars.map((b) => b.v)) * 1.1], yTicks: [], yf: TA.fmtVol, draw: (P, C, i) => TA.drawVolume(P, bars, i) } : null,
      over(P, C, i) {
        if (!opts.marks()) return;
        parts.forEach((pt) => {
          if (pt.at[0] + 2 >= i) return;
          P.tag(pt.label, P.X(pt.at[0]), P.Y(pt.at[1]), { bg: C.violet, dy: pt.r === 'l' ? 10 : -30, size: 10.5 });
        });
        const end = brk != null ? Math.min(s.n - 1, brk + 6) : s.n - 1;
        lines.forEach((ln, k) => {
          if (ln.shown >= i) return;
          P.line([[ln.A[0], ln.A[1]], [end, ln.at(end)]], { color: k === s.brk ? C.accent : C.muted, width: 2, dash: k === s.brk ? null : [5, 4] });
        });
        if (brk != null && i > brk) {
          P.dot(brk, bars[brk].c, { color: s.dir > 0 ? C.gain : C.loss });
          const k = Math.min(1, (i - brk) / 10);
          P.line([[brk, target], [s.n - 1, target]], { color: s.dir > 0 ? C.gain : C.loss, width: 1.75, dash: [4, 4], alpha: k });
          P.text('Target ' + usd(target), P.X(Math.min(s.n - 4, brk + 10)), P.Y(target) + (s.dir > 0 ? -10 : 12), { color: s.dir > 0 ? C.gain : C.loss, clamp: true });
        }
        if (failed != null && i > failed) P.tag('Pattern failed', P.X(failed), P.Y(bars[failed].c), { bg: C.warn });
      },
      onIndex: opts.onIndex,
    });
  }
  function phaseText(pr, i) {
    const { s, brk, failed, parts, lines, bars, target } = pr;
    if (failed != null && i > failed) return 'Price climbed back above the right shoulder: the pattern failed. A stop there would have limited the loss, while traders without one kept losing.';
    if (brk != null && i > brk) {
      const after = bars.slice(brk + 1, i);
      const hit = after.some((b) => (s.dir < 0 ? b.l <= target * 1.004 : b.h >= target * 0.996));
      return hit && s.txt[3] ? s.txt[3] : s.txt[2];
    }
    if (lines[s.brk].shown < i) return s.txt[1];
    void parts;
    return s.txt[0];
  }

  /* ---------- animated pattern builder ---------- */
  V.patternBuild = function (host, p, ctx) {
    const set = p.set || ['hs'];
    let key = set[0],
      chart = null,
      pr = null;
    const sg = set.length > 1 ? seg({ label: 'Pattern', options: set.map((k) => ({ v: k, label: PAT[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) }) : null;
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg ? sg.el : null, holder, read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      pr = preparePattern(key);
      chart = patternChart(holder, ctx, pr, { marks: () => true, ms: 3600, onIndex: (i) => (read.textContent = phaseText(pr, i)) });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- name that pattern ---------- */
  V.patternQuiz = function (host, p, ctx) {
    const POOL = ['hs', 'ihs', 'dtop', 'dbot', 'asc', 'desc', 'sym', 'flag'];
    const r = SS.rng(Date.now() % 100000);
    let order = POOL.slice().sort(() => r() - 0.5),
      at = 0,
      score = 0,
      seen = 0,
      marks = false,
      chart = null,
      pr = null,
      raf = 0,
      fallback = 0,
      answered = false;
    const holder = h('div');
    const choices = h('div', { class: 'choices pq-choices' });
    const fb = h('p', { class: 'readout', 'aria-live': 'polite' });
    const tally = h('p', { class: 'sorter-tally' });
    const next = h('button', { type: 'button', class: 'btn primary', hidden: true, onclick: () => ((at = (at + 1) % order.length), round()) }, 'Next pattern');
    stack(host, holder, h('p', { class: 'plot-h' }, 'Which pattern is this?'), choices, fb, h('div', { class: 'ctl-row' }, next, tally));
    function clearTimers() {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    }
    function round() {
      clearTimers();
      answered = false;
      if (chart) chart.destroy();
      holder.replaceChildren();
      marks = false;
      next.hidden = true;
      const key = order[at];
      pr = preparePattern(key, 3 + at * 11);
      chart = patternChart(holder, ctx, pr, { marks: () => marks, controls: false, ms: 2400 });
      const stopAt = Math.min(pr.s.n, (pr.brk != null ? pr.brk : pr.s.n - 6) + 2);
      chart.set(1);
      let k0 = null;
      const step = (t) => {
        if (k0 == null) k0 = t;
        const k = Math.min(1, (t - k0) / 2400);
        chart.set(Math.max(1, Math.round(stopAt * k)));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      if (SS.reduced) chart.set(stopAt);
      else raf = requestAnimationFrame(step);
      fallback = setTimeout(() => !answered && chart.set(stopAt), 2700);
      const others = POOL.filter((x) => x !== key && PAT[x].label !== PAT[key].label)
        .sort(() => r() - 0.5)
        .slice(0, 3);
      const opts = others.concat(key).sort(() => r() - 0.5);
      fb.textContent = 'Watch the chart, then pick a name.';
      choices.replaceChildren(
        ...opts.map((o, j) =>
          h(
            'button',
            {
              type: 'button',
              class: 'choice',
              onclick: (e) => {
                if (answered) return;
                answered = true;
                clearTimers();
                const ok = o === key;
                seen++;
                if (ok) score++;
                choices.querySelectorAll('.choice').forEach((b) => {
                  b.disabled = true;
                  if (b.dataset.k === key) b.classList.add('right');
                });
                if (!ok) e.currentTarget.classList.add('wrong');
                fb.innerHTML = `<b>${ok ? 'Correct.' : 'Not quite.'}</b> It is a <b>${PAT[key].label.toLowerCase()}</b>. ${phaseText(pr, pr.s.n)}`;
                tally.textContent = `${score} of ${seen} correct`;
                marks = true;
                chart.play();
                next.hidden = false;
              },
              'data-k': o,
            },
            h('span', { class: 'choice-k' }, 'ABCD'[j]),
            h('span', null, PAT[o].label)
          )
        )
      );
    }
    round();
    return { destroy: () => (clearTimers(), chart && chart.destroy()) };
  };

  /* ---------- single-candle gallery ---------- */
  const DAYTYPES = [
    ['Doji', [[0, 50], [18, 52], [42, 48.2], [62, 50.8], [77, 50.02]], 'Open and close nearly equal: indecision. Neither side won.'],
    ['Hammer', [[0, 50], [28, 46], [52, 48.7], [77, 50.3]], 'Sellers drove it down, buyers took it all back. After a decline, a possible bottom.'],
    ['Shooting star', [[0, 50], [28, 54], [50, 52.3], [77, 49.8]], 'A rally that was rejected. After an advance, a possible top.'],
    ['Bullish marubozu', [[0, 50], [20, 51.2], [45, 52.7], [77, 54]], 'Almost no wicks: buyers in control from open to close.'],
    ['Bearish marubozu', [[0, 50], [20, 48.8], [45, 47.3], [77, 46]], 'Almost no wicks: sellers in control all day.'],
    ['Spinning top', [[0, 50], [15, 51.8], [35, 48.3], [60, 50.9], [77, 50.5]], 'A small body with wicks on both sides: a hesitant market.'],
  ];
  function drawOneCandle(P, C, ticks, m, yr) {
    const seen = ticks.slice(0, Math.max(1, m)),
      o = ticks[0],
      c = seen[seen.length - 1],
      H = Math.max(...seen),
      L = Math.min(...seen),
      col = c >= o ? C.gain : C.loss;
    P.domain(-1, 1, yr[0], yr[1]);
    const x = P.X(0),
      w = Math.min(30, P.w * 0.32),
      k = P.c;
    k.save();
    k.strokeStyle = col;
    k.lineWidth = 2.5;
    k.beginPath();
    k.moveTo(x, P.Y(H));
    k.lineTo(x, P.Y(L));
    k.stroke();
    k.fillStyle = col;
    const y1 = P.Y(Math.max(o, c)),
      y2 = P.Y(Math.min(o, c));
    k.fillRect(x - w / 2, y1, w, Math.max(2.5, y2 - y1));
    k.restore();
  }
  V.candleGallery = function (host) {
    const grid = h('div', { class: 'cg-grid' });
    const items = DAYTYPES.map(([name, a, mean], idx) => {
      const ticks = TA.path(a, 78, { seed: 20 + idx, noise: 0.0012 });
      ticks[0] = 50;
      const el = h('div', { class: 'plot' });
      const card = h('button', { type: 'button', class: 'cg-card', 'aria-label': 'Replay ' + name }, el, h('b', null, name), h('span', null, mean));
      grid.append(card);
      const it = { ticks, m: 78, cancel: null };
      it.plot = new Plot(el, { height: 120, pad: { l: 4, r: 4, t: 6, b: 6 }, label: name + ' candle', draw: (P) => drawOneCandle(P, pal(), ticks, it.m, [45, 55]) });
      it.play = (delay = 0) =>
        setTimeout(() => {
          if (it.cancel) it.cancel();
          it.cancel = tween(1400, (k) => {
            it.m = Math.max(1, Math.round(78 * k));
            it.plot.render();
          });
        }, delay);
      card.addEventListener('click', () => it.play(0));
      return it;
    });
    stack(host, grid);
    let timers = [];
    return {
      play: () => (timers = items.map((it, i) => it.play(i * 250))),
      destroy: () => (timers.forEach(clearTimeout), items.forEach((it) => (it.cancel && it.cancel(), it.plot.destroy()))),
    };
  };

  /* ---------- two- and three-candle patterns ---------- */
  const COMBOS = {
    bullEng: { label: 'Bullish engulfing', pre: [[0, 57], [13, 50.5]], pat: [[50.4, 50.6, 49.4, 49.6], [49.3, 51.7, 49.1, 51.5]], post: [[51.6, 52.6], [52.5, 53.4], [53.3, 54.1]], dir: 1, txt: 'After a decline, a green body swallows the prior red body: buyers suddenly took control. The next candles confirm.' },
    bearEng: { label: 'Bearish engulfing', pre: [[0, 43], [13, 49.5]], pat: [[49.6, 50.6, 49.4, 50.4], [50.7, 50.9, 48.3, 48.5]], post: [[48.4, 47.5], [47.6, 46.7], [46.8, 46.1]], dir: -1, txt: 'After a rally, a red body swallows the prior green body: sellers took over.' },
    morning: { label: 'Morning star', pre: [[0, 58], [13, 52.2]], pat: [[52, 52.2, 49.6, 49.8], [49.5, 49.9, 48.9, 49.4], [49.7, 52.1, 49.5, 51.9]], post: [[52, 52.8], [52.7, 53.6]], dir: 1, txt: 'A big red day, a small hesitant day, then a strong green day: the selling ran out and buyers arrived.' },
    evening: { label: 'Evening star', pre: [[0, 42], [13, 47.8]], pat: [[48, 50.4, 47.8, 50.2], [50.5, 51.1, 50.1, 50.6], [50.3, 50.5, 47.9, 48.1]], post: [[48, 47.2], [47.3, 46.4]], dir: -1, txt: 'A big green day, a small hesitant day, then a strong red day: a possible top.' },
  };
  function comboBars(key) {
    const c = COMBOS[key];
    const pre = TA.bars(TA.path(c.pre, 14, { seed: 7, noise: 0.004 }), { seed: 7, wick: 0.004 });
    const pat = c.pat.map(([o, hi, lo, cl]) => ({ o, h: hi, l: lo, c: cl, v: 1.6e6 }));
    let prev = pat[pat.length - 1].c;
    const post = c.post.map(([o, cl]) => {
      const b = { o: Math.min(o, prev + 0.2), c: cl, v: 1.2e6 };
      b.o = prev + (o - prev) * 0.3;
      b.h = Math.max(b.o, b.c) + 0.25;
      b.l = Math.min(b.o, b.c) - 0.25;
      prev = cl;
      return b;
    });
    return { bars: pre.concat(pat, post), from: pre.length, to: pre.length + pat.length - 1 };
  }
  V.candleCombos = function (host, p, ctx) {
    let key = 'bullEng',
      chart = null;
    const sg = seg({ label: 'Pattern', options: Object.keys(COMBOS).map((k) => ({ v: k, label: COMBOS[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const { bars, from, to } = comboBars(key),
        c = COMBOS[key];
      chart = TA.chart(holder, ctx, {
        bars,
        ms: 2600,
        label: c.label + ' at the end of a trend',
        candleColor: (j, b) => (j < from || j > to ? alpha(b.c >= b.o ? pal().gain : pal().loss, 0.45) : null),
        over(P, C, i) {
          if (i <= to) return;
          const lo = Math.min(...bars.slice(from, to + 1).map((b) => b.l)),
            hi = Math.max(...bars.slice(from, to + 1).map((b) => b.h));
          const k = P.c;
          k.save();
          k.strokeStyle = C.violet;
          k.lineWidth = 2;
          k.setLineDash([4, 3]);
          k.strokeRect(P.X(from - 0.6), P.Y(hi + 0.4), P.X(to + 0.6) - P.X(from - 0.6), P.Y(lo - 0.4) - P.Y(hi + 0.4));
          k.restore();
          P.tag(c.label, P.X((from + to) / 2), P.Y(c.dir > 0 ? lo - 0.4 : hi + 0.4), { bg: C.violet, dy: c.dir > 0 ? 8 : -30 });
        },
        onIndex: (i) => (read.textContent = i > to ? c.txt : 'Watch the end of the trend.'),
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- context decides ---------- */
  V.candleContext = function (host, p, ctx) {
    const CTX = {
      support: { label: 'After a decline, at support', path: [[0, 52], [6, 49.9], [12, 56], [22, 59.5], [34, 52.5], [43, 50.6]], at: 50.4, zone: [49.4, 50.6], next: 1, verdict: 'Strong signal. Sellers pushed below a level that held before, and buyers rejected it. A green confirming candle the next day strengthens the case.', cls: 'gain' },
      middle: { label: 'In the middle of a range', path: [[0, 54], [5, 57], [10, 53], [15, 56.5], [20, 54], [25, 56], [30, 54.4], [36, 56], [43, 55.3]], at: 55.2, next: 0, verdict: 'Weak signal. There is no trend to reverse and no level to defend. In choppy markets, candles like this appear all the time and mean little.', cls: '' },
      rally: { label: 'After a big rally', path: [[0, 40], [12, 45], [20, 44], [32, 52], [38, 51], [43, 57.6]], at: 57.8, next: -1, verdict: 'Same shape, different meaning: after a rally it is called a hanging man. Sellers briefly took control, an early warning. A red candle the next day would confirm it.', cls: 'loss' },
    };
    let key = 'support',
      chart = null;
    const sg = seg({ label: 'Context', options: Object.keys(CTX).map((k) => ({ v: k, label: CTX[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const c = CTX[key];
      const pre = TA.bars(TA.path(c.path, 44, { seed: 13, noise: 0.004 }), { seed: 13, wick: 0.004 });
      const x = c.at,
        hammer = { o: x - 0.1, c: x + 0.1, h: x + 0.25, l: x - 2.4, v: 1.5e6 };
      const nb = c.next ? [{ o: x + 0.1, c: x + 0.1 + c.next * 1.3, v: 1.3e6 }] : [{ o: x + 0.1, c: x - 0.2, v: 1e6 }];
      nb.forEach((b) => ((b.h = Math.max(b.o, b.c) + 0.25), (b.l = Math.min(b.o, b.c) - 0.25)));
      const bars = pre.concat([hammer], nb),
        hi = pre.length;
      chart = TA.chart(holder, ctx, {
        bars,
        ms: 2400,
        yRange: [Math.min(...bars.map((b) => b.l)) - 1, Math.max(...bars.map((b) => b.h)) + 1],
        label: 'The same hammer candle in a different context',
        candleColor: (j, b) => (j === hi ? pal().accent : j !== hi + 1 ? alpha(b.c >= b.o ? pal().gain : pal().loss, 0.5) : null),
        under(P, C) {
          if (c.zone) {
            P.rect(-1, c.zone[0], bars.length, c.zone[1], alpha(C.gain, 0.15));
            P.text('Support', P.X(1), P.Y(c.zone[0]) + 10, { align: 'left', color: C.gain });
          }
        },
        over(P, C, i) {
          if (i > hi) P.tag(key === 'rally' ? 'Hanging man' : 'Hammer', P.X(hi), P.Y(hammer.l), { bg: C.accent, dy: 8 });
        },
        onIndex(i) {
          read.innerHTML = i > hi ? `<b class="${c.cls}">${key === 'middle' ? 'Little meaning here.' : key === 'support' ? 'Meaningful here.' : 'A warning here.'}</b> ${c.verdict}` : 'Watch where the hammer appears.';
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };
})();
