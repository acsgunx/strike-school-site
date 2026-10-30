/* Japanese Candlesticks, Unit 4 visuals: a window as support (held or broken on a close) and as resistance, three
   window plays, the rising and falling three methods, and a chart that stops at each pattern for you to name it. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, seg, pal, alpha, tween, usd } = SS;
  const V = SS.viz;
  const TA = SS.TA;
  const CS = SS.CS;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const grow = (b, u) => {
    const c = b.o + (b.c - b.o) * u;
    return { o: b.o, c, h: Math.max(b.o, c) + (b.h - Math.max(b.o, b.c)) * u, l: Math.min(b.o, c) - (Math.min(b.o, b.c) - b.l) * u };
  };
  // The band of a window, from the bar before the gap to the right edge.
  const windowBand = (P, C, x, lo, hi, up, to) => {
    P.rect(x - 1.4, lo, to, hi, alpha(up ? C.gain : C.loss, 0.16));
    P.line([[x - 1.4, lo], [to, lo]], { color: up ? C.gain : C.loss, width: 1, dash: [3, 3] });
    P.line([[x - 1.4, hi], [to, hi]], { color: up ? C.gain : C.loss, width: 1, dash: [3, 3] });
  };

  /* ---------- windows as support and resistance ---------- */
  function windowCase(kind) {
    const up = kind !== 'falling',
      head = up
        ? [{ from: 44, to: 49.6, n: 14, seed: 81, wick: 0.004 }, { rel: [[1.2, 2.2, 1.05, 2.0, 1.6e6]] }, { by: 2.4, n: 5, seed: 82 }]
        : [{ from: 56, to: 50.4, n: 14, seed: 84, wick: 0.004 }, { rel: [[-1.2, -1.05, -2.2, -2.0, 1.6e6]] }, { by: -2.4, n: 5, seed: 85 }],
      first = CS.chain(head),
      g = first.at[1],
      wb = up ? first.bars[g - 1].h : first.bars[g].h,
      wt = up ? first.bars[g].l : first.bars[g - 1].l;
    const tail = {
      hold: [{ to: wt + 0.25, n: 6, seed: 83 }, { abs: [[null, wt + 0.5, wb - 0.35, wb + 0.3, 1.5e6]] }, { by: 4, n: 8, seed: 86 }],
      fail: [{ to: wt + 0.25, n: 6, seed: 83 }, { abs: [[null, wt + 0.4, wb - 1.0, wb - 0.75, 1.8e6]] }, { by: -3.2, n: 8, seed: 87 }],
      falling: [{ to: wb - 0.25, n: 6, seed: 88 }, { abs: [[null, wt + 0.35, wb - 0.5, wt - 0.3, 1.5e6]] }, { by: -4, n: 8, seed: 89 }],
    }[kind];
    const all = CS.chain(head.concat(tail));
    return { B: all.bars, g, wb, wt, T: all.at[4], up };
  }
  V.windowSupport = function (host, p, ctx) {
    const OPTS = { hold: 'Window holds', fail: 'Window fails', falling: 'Falling window' };
    let key = 'hold',
      chart = null;
    const sg = seg({ label: 'Case', options: Object.keys(OPTS).map((k) => ({ v: k, label: OPTS[k] })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const { B, g, wb, wt, T, up } = windowCase(key),
        n = B.length,
        t = B[T],
        moved = CS.moved(t.c, B[n - 1].c);
      const FINAL = {
        hold: `<b class="gain">Support held.</b> The pullback dipped to ${usd(t.l)} during the session, below the window’s bottom of ${usd(wb)}, but closed back inside the window at ${usd(t.c)}. On a closing basis the window held, and from that close prices ${moved} by the end of the chart.`,
        fail: `<b class="loss">Support broken.</b> The pullback closed at ${usd(t.c)}, below the window’s bottom of ${usd(wb)}. The window no longer counts as support, and from that close prices ${moved} by the end of the chart.`,
        falling: `<b class="loss">Resistance held.</b> The bounce poked up to ${usd(t.h)} during the session, above the window’s top of ${usd(wt)}, but closed back inside at ${usd(t.c)}. The falling window capped the bounce, and from that close prices ${moved} by the end of the chart.`,
      };
      chart = TA.chart(holder, ctx, {
        bars: B,
        ms: 3600,
        label: OPTS[key],
        yRange: CS.room(B, up ? 1 : -1),
        over(P, C, i) {
          if (i <= g) return;
          windowBand(P, C, g, wb, wt, up, n);
          // Above-left of a rising window and below-left of a falling one: the trend leading in left that space empty.
          P.tag(up ? 'Rising window' : 'Falling window', P.X(g - 1.4), P.Y(up ? wt : wb), { bg: up ? C.gain : C.loss, align: 'right', dy: up ? -27 : 6 });
          if (i > T) {
            const broke = key === 'fail';
            P.tag(broke ? 'Broken' : 'Holds', P.X(T), P.Y(up ? t.l : t.h), { bg: broke ? C.loss : C.ink, dy: up ? 8 : -29 });
          }
        },
        onIndex(i) {
          if (i <= g) read.textContent = 'Watch for a gap.';
          else if (i <= T) read.innerHTML = `A ${up ? 'rising' : 'falling'} window opened between ${usd(wb)} and ${usd(wt)}. ${up ? 'Will a pullback stop there?' : 'Will a bounce stop there?'}`;
          else read.innerHTML = i < n ? 'Watch the close, not the intraday low or high.' : FINAL[key];
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- window plays ---------- */
  function playCase(kind) {
    if (kind === 'tasuki') {
      const { bars: B, at } = CS.chain([{ from: 45, to: 50, n: 14, seed: 91, wick: 0.004 }, { rel: [[0.1, 1.3, -0.05, 1.2, 1.3e6], [0.9, 2.0, 0.8, 1.8, 1.5e6], [-0.8, -0.6, -1.65, -1.5, 1.2e6]] }, { by: 3, n: 7, seed: 92 }]);
      const K = at[1];
      return { B, from: K, to: K + 2, wins: [[K + 1, B[K].h, B[K + 1].l]] };
    }
    if (kind === 'gapping') {
      const head = [{ from: 43.5, to: 50, n: 12, seed: 93, wick: 0.004 }, { by: 0.15, n: 6, seed: 94, noise: 0.0025, wick: 0.003 }],
        first = CS.chain(head),
        ph = Math.max(...first.bars.slice(first.at[1]).map((b) => b.h)),
        { bars: B, at } = CS.chain(head.concat([{ abs: [[ph + 0.55, ph + 1.6, ph + 0.45, ph + 1.4, 1.6e6]] }, { by: 2.5, n: 6, seed: 95 }]));
      return { B, from: at[1], to: at[2] - 1, gap: at[2], wins: [[at[2], ph, B[at[2]].l]] };
    }
    // Each gap opens a fixed distance above the previous session's high, so all three windows are real.
    const segs = [{ from: 44, to: 47, n: 8, seed: 96, wick: 0.003 }];
    [{ by: 0.8, n: 3, seed: 97, wick: 0.003 }, { by: 0.8, n: 3, seed: 98, wick: 0.003 }, { by: 0.3, n: 2, seed: 99, wick: 0.003 }].forEach((next) => {
      const prev = CS.chain(segs).bars,
        ph = prev[prev.length - 1].h;
      segs.push({ abs: [[ph + 0.45, ph + 1.3, ph + 0.35, ph + 1.15, 1.5e6]] }, next);
    });
    segs.push({ by: -3.2, n: 9, seed: 100 });
    const { bars: B, at } = CS.chain(segs);
    return { B, from: at[1], to: at[6] + 1, start: at[1] - 1, wins: [at[1], at[3], at[5]].map((g) => [g, B[g - 1].h, B[g].l]) };
  }
  V.windowPlays = function (host, p, ctx) {
    const OPTS = { tasuki: 'Upside tasuki gap', gapping: 'High-price gapping play', three: 'Three windows' };
    let key = 'tasuki',
      chart = null;
    const sg = seg({ label: 'Pattern', options: Object.keys(OPTS).map((k) => ({ v: k, label: OPTS[k] })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const c = playCase(key),
        B = c.B,
        n = B.length;
      let final;
      if (key === 'tasuki') {
        const red = B[c.to];
        final = `<b class="gain">Upside tasuki gap.</b> A rising window, then a red day that opened inside the green body and closed at ${usd(red.c)}, inside the window, without closing it. The uptrend resumed: from that close, prices ${CS.moved(red.c, B[n - 1].c)} by the end of the chart.`;
      } else if (key === 'gapping') {
        final = `<b class="gain">High-price gapping play.</b> After a sharp rally, prices paused for ${c.to - c.from + 1} sessions in a tight cluster near the high. Then a rising window opened above the cluster’s top of ${usd(c.wins[0][1])}. From the gap day’s close, prices ${CS.moved(B[c.gap].c, B[n - 1].c)} by the end of the chart.`;
      } else {
        let top = c.from;
        for (let j = c.from; j < n; j++) if (B[j].c > B[top].c) top = j;
        final = `<b class="loss">Three windows.</b> Three rising windows in a row, and prices ${CS.moved(B[c.start].c, B[top].c)} in ${top - c.start} sessions. In Japanese tradition that is overextended. From the high close, prices ${CS.moved(B[top].c, B[n - 1].c)} as the market rested.`;
      }
      chart = TA.chart(holder, ctx, {
        bars: B,
        ms: 3400,
        label: OPTS[key],
        yRange: CS.room(B, 1),
        over(P, C, i) {
          c.wins.forEach(([g, lo, hi], j) => {
            if (i <= g || hi <= lo) return;
            const end = key === 'three' ? g + 3 : n;
            windowBand(P, C, g, lo, hi, true, end);
            if (key === 'three') P.tag(String(j + 1), P.X(g - 1.4), P.Y(hi), { bg: C.gain, align: 'right', dy: -27 });
          });
          if (key === 'tasuki' && i > c.to) CS.box(P, B, c.from, c.to, { label: 'Tasuki gap', dir: 1 });
          if (key === 'gapping' && i > c.to) CS.box(P, B, c.from, c.to, { label: 'Pause', dir: 1, over: true });
        },
        onIndex: (i) => (read.innerHTML = i < n ? 'Watch for windows.' : final),
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- rising and falling three methods ---------- */
  const flip = (b) => ({ o: 100 - b.o, c: 100 - b.c, h: 100 - b.l, l: 100 - b.h });
  const TM = {
    hold: [[48.5, 52.3, 48.3, 52.0], [51.8, 52.1, 51.0, 51.2], [51.1, 51.4, 50.3, 50.5], [50.6, 51.0, 49.8, 50.0], [50.3, 53.6, 50.1, 53.4]],
    break: [[48.5, 52.3, 48.3, 52.0], [51.8, 52.1, 51.0, 51.2], [51.1, 51.4, 49.6, 49.8], [49.7, 49.9, 47.6, 47.8], [47.9, 48.6, 47.5, 48.3]],
  };
  V.threeMethods = function (host, p, ctx) {
    const XS = [4.9, 6.1, 7.3, 8.5, 9.7];
    let dir = 'rising',
      ok = 'hold',
      prog = 5,
      cancel = null;
    const sgD = seg({ label: 'Trend', options: [{ v: 'rising', label: 'Rising (uptrend)' }, { v: 'falling', label: 'Falling (downtrend)' }], value: dir, onChange: (v) => ((dir = v), play()) });
    const sgO = seg({ label: 'Rest', options: [{ v: 'hold', label: 'Rest stays inside' }, { v: 'break', label: 'Rest breaks out' }], value: ok, onChange: (v) => ((ok = v), play()) });
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sgD.el, sgO.el, el, read, h('p', { class: 'fine' }, 'The shaded band is the first candle’s range.'));
    const data = () => {
      const up = dir === 'rising',
        B = TM[ok].map(([o, hi, l, c]) => ({ o, h: hi, l, c })),
        T = CS.mini(44.6, 48.5, 4);
      return up ? { B, T, y: [43.4, 54.6] } : { B: B.map(flip), T: T.map(flip), y: [45.4, 56.6] };
    };
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 240 : 270),
      pad: { l: 46, r: 8, t: 12, b: 12 },
      label: 'Five candles: a long one, a rest, then another long one',
      draw(P) {
        const C = pal(),
          { B, T, y } = data(),
          c1 = B[0],
          w = Math.min(26, (P.X(1) - P.X(0)) * 0.8);
        P.domain(-0.8, 10.5, y[0], y[1]);
        P.grid({ xTicks: [], yf: (v) => '$' + v, noXLabels: true });
        T.forEach((t, i) => CS.candle(P, i, t, { alpha: 0.45 }));
        if (prog >= 1) {
          P.rect(4.4, c1.l, 10.3, c1.h, alpha(C.accent, 0.08));
          P.line([[4.4, c1.h], [10.3, c1.h]], { color: C.accent, width: 1, dash: [3, 3] });
          P.line([[4.4, c1.l], [10.3, c1.l]], { color: C.accent, width: 1, dash: [3, 3] });
        }
        B.forEach((b, j) => {
          const u = clamp01(prog - j);
          if (u > 0) CS.candle(P, XS[j], grow(b, u), { w });
        });
        // The small candle that broke out of the first candle's range.
        if (ok === 'break' && prog >= 4) P.dot(XS[3], dir === 'rising' ? B[3].l : B[3].h, { color: C.loss, r: 4 });
      },
    });
    function paint() {
      plot.render();
      if (prog < 5) return void (read.textContent = 'Watch the five sessions form.');
      const { B } = data(),
        c1 = B[0],
        c5 = B[4],
        up = dir === 'rising',
        lo = Math.min(...B.slice(1, 4).map((b) => b.l)),
        hi = Math.max(...B.slice(1, 4).map((b) => b.h));
      if (ok === 'hold')
        read.innerHTML = up
          ? `<b class="gain">Rising three methods.</b> A long green day, three small red days that stayed inside its range, then a long green day that closed at ${usd(c5.c)}, above the first close of ${usd(c1.c)}. The uptrend rested, then resumed.`
          : `<b class="loss">Falling three methods.</b> A long red day, three small green days that stayed inside its range, then a long red day that closed at ${usd(c5.c)}, below the first close of ${usd(c1.c)}. The downtrend rested, then resumed.`;
      else
        read.innerHTML = up
          ? `<b class="loss">Not a three methods.</b> The small candles fell to ${usd(lo)}, below the first candle’s low of ${usd(c1.l)}. That is more than a rest: the uptrend is in doubt.`
          : `<b class="gain">Not a three methods.</b> The small candles rose to ${usd(hi)}, above the first candle’s high of ${usd(c1.h)}. That is more than a rest: the downtrend is in doubt.`;
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(3500, (k) => ((prog = 5 * k), paint()));
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- read the chart: a game that stops at each pattern ---------- */
  V.patternHunt = function (host, p, ctx) {
    const { bars: B, at } = CS.chain([
      { from: 56, to: 50.6, n: 8, seed: 101 },
      { rel: [[-0.6, -0.25, -2.3, -0.3, 1.6e6], [0.1, 1.3, 0.0, 1.2, 1.3e6]] },
      { by: 2.5, n: 6, seed: 102 },
      { rel: [[1.1, 2.0, 0.95, 1.8, 1.6e6]] },
      { by: 1, n: 3, seed: 103 },
      { rel: [[0.1, 2.1, -0.05, 1.9, 1.4e6], [-0.15, 0.1, -0.7, -0.5], [-0.1, 0.1, -0.6, -0.45], [-0.1, 0.05, -0.55, -0.4], [0.1, 2.2, 0.0, 2.1, 1.5e6]] },
      { by: 1.2, n: 4, seed: 104 },
      { rel: [[0.1, 2.0, -0.05, 1.85, 1.4e6], [0.45, 0.95, 0.3, 0.6, 1.1e6], [-0.7, -0.5, -2.0, -1.85, 1.6e6]] },
      { by: -2.5, n: 4, seed: 105 },
      { rel: [[-1.1, -0.95, -2.0, -1.8, 1.6e6]] },
      { by: -2, n: 5, seed: 106 },
    ]);
    const n = B.length;
    const Q = [
      { name: 'Hammer', from: at[1], to: at[1], dir: 1, q: 'After the decline, what is this candle?', choices: ['Hammer', 'Hanging man', 'Shooting star'], a: 0, why: 'A small body at the top of the range and a long lower shadow, after a decline: a hammer. The next day’s green candle confirms it.' },
      { name: 'Rising window', from: at[3] - 1, to: at[3], dir: 1, q: 'What did prices just leave behind?', choices: ['A rising window', 'A falling window', 'A harami'], a: 0, why: 'The session’s low is above the previous high: a gap up. It may act as support later.' },
      { name: 'Rising three methods', from: at[5], to: at[5] + 4, dir: 1, q: 'Name these five candles.', choices: ['Rising three methods', 'Three black crows', 'Evening star'], a: 0, why: 'A long green candle, three small red ones inside its range, then a long green close above the first: the uptrend rested, then resumed.' },
      { name: 'Evening star', from: at[7], to: at[7] + 2, dir: -1, q: 'After the rally, what are these three?', choices: ['Evening star', 'Morning star', 'Three white soldiers'], a: 0, why: 'A tall green day, a small star that gapped higher, then a tall red day deep into the first body: a top.' },
      { name: 'Falling window', from: at[9] - 1, to: at[9], dir: -1, q: 'What should this gap do now?', choices: ['Act as resistance on bounces', 'Act as support on dips', 'Nothing'], a: 0, why: 'It is a falling window. Bounces often stall there unless prices close above its top.' },
    ];
    let qi = 0,
      done = [],
      score = 0,
      cancel = null;
    const holder = h('div');
    const tag = h('p', { class: 'gate-tag' });
    const qEl = h('p', { class: 'ni-hunt-q' });
    const choicesEl = h('div', { class: 'choices' });
    const fb = h('p', { class: 'readout', 'aria-live': 'polite' });
    const nextBtn = h('button', { type: 'button', class: 'btn sm primary', onclick: () => next() }, 'Continue');
    const scoreEl = h('span', { class: 'fine' });
    const box = h('div', { class: 'ni-hunt', hidden: '' }, tag, qEl, choicesEl, fb, h('div', { class: 'ni-hunt-row' }, scoreEl, nextBtn));
    const restart = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Start over');
    stack(host, holder, box, h('div', { class: 'ctl-row' }, restart), h('p', { class: 'fine' }, 'Simulated daily prices.'));
    const chart = TA.chart(holder, ctx, {
      bars: B,
      controls: false,
      cursor: false,
      scrub: false,
      label: 'A chart to read, pattern by pattern',
      yRange: (() => {
        const lo = Math.min(...B.map((b) => b.l)),
          hi = Math.max(...B.map((b) => b.h));
        return [lo - (hi - lo) * 0.2, hi + (hi - lo) * 0.2];
      })(),
      over(P, C) {
        // Numbered tags keep the chart readable; the names are listed in the question box.
        done.forEach((j) => CS.box(P, B, Q[j].from, Q[j].to, { label: String(j + 1), dir: Q[j].dir, over: true }));
      },
    });
    const stop = () => (cancel && cancel(), (cancel = null));
    function runTo(target, then) {
      stop();
      const from = chart.i;
      cancel = tween(Math.max(500, (target - from) * 90), (k) => chart.set(Math.max(1, Math.round(from + (target - from) * k))), then);
    }
    function ask() {
      const q = Q[qi];
      box.hidden = false;
      tag.textContent = `Pattern ${qi + 1} of ${Q.length}`;
      qEl.textContent = q.q;
      fb.textContent = '';
      nextBtn.hidden = true;
      scoreEl.textContent = `Score: ${score} of ${qi}`;
      // Rotate the choices so the right answer isn't always in the same place.
      const order = q.choices.map((_, j) => (j + qi) % q.choices.length),
        btns = order.map((c, k) => h('button', { type: 'button', class: 'choice', onclick: () => answer(c) }, h('span', { class: 'choice-k' }, 'ABC'[k]), h('span', null, q.choices[c])));
      choicesEl.replaceChildren(...btns);
      function answer(j) {
        const right = j === q.a;
        if (right) score++;
        btns.forEach((b, k) => ((b.disabled = true), order[k] === q.a ? b.classList.add('right') : order[k] === j && b.classList.add('wrong')));
        fb.innerHTML = `<b class="${right ? 'gain' : 'loss'}">${right ? 'Right.' : 'Not quite.'}</b> ${q.why} It’s marked ${qi + 1} on the chart.`;
        done.push(qi);
        chart.render();
        scoreEl.textContent = `Score: ${score} of ${qi + 1}`;
        nextBtn.textContent = qi + 1 < Q.length ? 'Continue' : 'See the end';
        nextBtn.hidden = false;
      }
    }
    function next() {
      qi++;
      if (qi < Q.length) {
        box.hidden = true;
        runTo(Q[qi].to + 1, ask);
      } else {
        nextBtn.hidden = true;
        choicesEl.replaceChildren();
        runTo(n, () => {
          tag.textContent = 'Finished';
          qEl.textContent = `You named ${score} of ${Q.length} patterns.`;
          fb.innerHTML = `${Q.map((x, j) => `${j + 1}: ${x.name}`).join(' · ')}. From the hammer’s close to the first close of the evening star, prices ${CS.moved(B[at[1]].c, B[at[7]].c)}; from the evening star’s last close, they ${CS.moved(B[at[7] + 2].c, B[n - 1].c)} by the end of the chart. Every pattern here behaved as the book describes. Real charts are messier, which is why the next unit adds Western tools.`;
        });
      }
    }
    function play() {
      stop();
      qi = 0;
      score = 0;
      done = [];
      box.hidden = true;
      chart.set(1);
      runTo(Q[0].to + 1, ask);
    }
    return { play, destroy: () => (stop(), chart.destroy()) };
  };
})();
