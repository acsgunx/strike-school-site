/* Pivot Point Trading, Unit 4 visuals: a volume profile that builds bar by bar, the value area, money-zone replays,
   the playbook by where price opens, value migration across days, profile shapes and a shape quiz. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, usd, pal, alpha, tween } = SS;
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

  const BINS = 24,
    EX = 34; // empty bar slots to the right of the session, where the profile is drawn
  const NORMAL = [[0, 100], [10, 100.8], [20, 99.4], [30, 100.6], [40, 99.6], [50, 100.5], [60, 99.8], [70, 100.3], [77, 100.1]];
  const yesterday = () => PV.sessionAt(NORMAL, { seed: 91 });

  /** A sideways volume histogram starting at x0, `w` bar slots wide at its longest. */
  function drawProfile(P, C, va, x0, w, o = {}) {
    const mx = Math.max(...va.hist.map((x) => x.v)) || 1,
      f = o.alpha == null ? 1 : o.alpha;
    va.hist.forEach((b, j) => {
      if (!b.v) return;
      const poc = j === va.pocI,
        inVA = o.va && j >= va.a && j <= va.z;
      P.rect(x0, b.p - va.step * 0.42, x0 + (w * b.v) / mx, b.p + va.step * 0.42, alpha(poc ? C.warn : inVA ? C.violet : C.stock, (poc ? 0.9 : inVA ? 0.6 : 0.45) * f));
    });
  }
  const vaLevels = (va) => [{ name: 'VAH', v: va.vah }, { name: 'POC', v: va.poc, dash: null, width: 2 }, { name: 'VAL', v: va.val }];
  const where = (v, va) => (v > va.vah ? 'above value' : v < va.val ? 'below value' : 'inside value');

  /* ---------- a profile that builds as the day trades ---------- */
  V.profileBuild = function (host, p, ctx) {
    const bars = yesterday(),
      n = bars.length;
    let share = 0.7,
      chart = null;
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const sl = p.va ? slider({ id: ctx.key + '-s', label: 'Share of volume in the value area', min: 50, max: 90, step: 5, value: 70, fmt: (v) => v + '%', onInput: (v) => ((share = v / 100), chart.render()) }) : null;
    stack(host, holder, sl ? sl.el : null, read, h('div', { class: 'legend' }, lg('var(--warn)', 'Point of control'), p.va ? lg('var(--violet)', 'Value area') : null, lg('var(--stock)', p.va ? 'Outside value' : 'Volume at price')));
    const vaAt = (i) => PV.valueArea(bars, { bins: BINS, upto: i, share });
    chart = TA.chart(holder, ctx, {
      bars,
      extraX: EX,
      pad: { l: 50, r: 78 },
      xTicks: PV.TICKS,
      xf: PV.clock,
      yf: PV.yf,
      dayFmt: (v) => PV.clock(v - 1),
      sliderLabel: 'Time',
      ms: 4200,
      label: 'A session with its volume profile building on the right',
      under(P, C, i) {
        if (p.va && i >= 2) {
          const va = vaAt(i);
          PV.drawZone(P, va.val, va.vah, C.violet, 0.1, -0.8, n - 0.5);
        }
      },
      over(P, C, i) {
        const va = vaAt(i);
        drawProfile(P, C, va, n + 1, EX - 3, { va: p.va });
        PV.drawLevels(P, p.va ? vaLevels(va) : [{ name: 'POC', v: va.poc, dash: [4, 3], width: 1.5 }]);
      },
      onIndex(i) {
        const va = vaAt(i);
        if (i < n) read.innerHTML = `${PV.clock(i - 1)}: so far the most volume traded near <b>${usd(va.poc)}</b>.` + (p.va ? ` Value area: ${usd(va.val)} to ${usd(va.vah)}.` : '');
        else read.innerHTML = p.va ? `The value area runs from <b>${usd(va.val)}</b> to <b>${usd(va.vah)}</b> and holds ${Math.round(share * 100)}% of the day’s volume, built outward from the POC at ${usd(va.poc)}.` : `By the close, the point of control was <b>${usd(va.poc)}</b>: the price where the most volume traded, near the middle of the day’s back-and-forth.`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- yesterday’s value as today’s map ---------- */
  const TODAY = {
    inside: { label: 'Opens inside value', seed: 93, a: [[0, 100.2], [10, 100.5], [16, 100.55], [28, 100.0], [40, 99.85], [46, 99.9], [60, 100.3], [77, 100.15]], end: 'Price opened inside yesterday’s value and rotated between the edges. Each poke beyond VAH or VAL was pushed back, and the day closed near the POC.' },
    accept: { label: 'Accepted above value', seed: 92, a: [[0, 100.95], [6, 100.8], [12, 100.95], [24, 101.3], [40, 101.7], [55, 101.6], [77, 102.1]], end: 'Price opened above value and held above VAH through the first hour. The higher prices were accepted, and the day trended up.' },
    reject: { label: 'Rejected back into value', seed: 93, a: [[0, 100.9], [6, 100.55], [12, 100.4], [24, 100.2], [40, 99.9], [55, 99.6], [65, 99.7], [77, 99.65]], end: 'Price opened above value but fell back inside within half an hour and never closed above VAH again. The higher prices were rejected, and price rotated across value to VAL and beyond.' },
  };
  V.moneyZoneDay = function (host, p, ctx) {
    const set = p.set || ['inside'],
      N = PV.BARS;
    let key = set[0],
      chart = null;
    const sg = set.length > 1 ? seg({ label: 'Day', options: set.map((k) => ({ v: k, label: TODAY[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) }) : null;
    const holder = h('div');
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg ? sg.el : null, info, holder, read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const sc = TODAY[key],
        y = yesterday(),
        t = PV.sessionAt(sc.a, { seed: sc.seed }),
        bars = y.concat(t);
      const full = PV.valueArea(y, { bins: BINS });
      info.replaceChildren(stat('Yesterday’s VAH', usd(full.vah)), stat('POC', usd(full.poc)), stat('VAL', usd(full.val)));
      chart = TA.chart(holder, ctx, {
        bars,
        extraX: 26,
        pad: { l: 50, r: 78 },
        xTicks: [0, 39, N, N + 39, 2 * N - 1],
        xf: (v) => PV.clock(Math.round(v) % N),
        yf: PV.yf,
        dayFmt: (v) => (v <= N ? 'Yesterday ' : 'Today ') + PV.clock((v - 1) % N),
        sliderLabel: 'Time',
        ms: 4600,
        label: sc.label + ': yesterday’s profile and today’s trading',
        under(P, C, i) {
          P.vline(N - 0.5, { color: C.muted, dash: [3, 3], alpha: 0.6 });
          P.text('Yesterday', P.X(N / 2), P.pad.t + 9, { color: C.muted });
          P.text('Today', P.X(N * 1.5), P.pad.t + 9, { color: C.muted });
          if (i > N) PV.drawZone(P, full.val, full.vah, C.violet, 0.12, N - 0.5, 2 * N - 0.5);
        },
        over(P, C, i) {
          const va = i > N ? full : PV.valueArea(y, { bins: BINS, upto: i });
          drawProfile(P, C, va, 2 * N + 1, 22, { va: true, alpha: i > N ? 0.7 : 1 });
          if (i > N) PV.drawLevels(P, vaLevels(full), { x0: N - 0.5, x1: 2 * N - 0.5 });
        },
        onIndex(i) {
          const b = bars[i - 1];
          if (i >= bars.length) return (read.innerHTML = sc.end);
          if (i <= N) return (read.innerHTML = `Yesterday, ${PV.clock(i - 1)}: price ${usd(b.c)}. The profile on the right is still building.`);
          const k = i - N,
            first = t.slice(0, Math.min(k, 12)),
            held = first.filter((x) => x.c > full.vah).length;
          let s = `Today, ${PV.clock(k - 1)}: price ${usd(b.c)}, ${where(b.c, full)}.`;
          if (key !== 'inside') s += k < 12 ? ` First hour so far: ${held} of ${first.length} closes above VAH.` : ` First hour: ${held} of 12 closes held above VAH, so the higher prices were ${held >= 10 ? 'accepted' : 'rejected'}.`;
          read.innerHTML = s;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- the playbook by where price opens ---------- */
  V.valuePlaybook = function (host, p, ctx) {
    const va = PV.valueArea(yesterday(), { bins: BINS });
    let open = 100.4,
      cancel = null;
    const sl = slider({ id: ctx.key + '-o', label: 'Where price opens', min: 98.9, max: 101.6, step: 0.05, value: open, fmt: (v) => usd(v), onInput: (v) => (stop(), (open = v), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, sl.el, read);
    const zone = () => (open > va.vah ? 'above' : open < va.val ? 'below' : 'inside');
    const TXT = {
      above: ['Above value', 'gain', () => `Watch the first hour. If price holds above VAH (${usd(va.vah)}), the higher prices are being accepted: buy pullbacks to VAH. If it falls back inside and stays, expect a rotation across value toward VAL (${usd(va.val)}).`],
      inside: ['Inside value', 'accent', () => `The market is still balanced. Expect rotation between VAL (${usd(va.val)}) and VAH (${usd(va.vah)}), with the POC (${usd(va.poc)}) as a magnet. Fade the edges and stay patient in the middle.`],
      below: ['Below value', 'loss', () => `Watch the first hour. If price stays below VAL (${usd(va.val)}), the lower prices are being accepted: sell bounces to VAL. If it climbs back inside and stays, expect a rotation across value toward VAH (${usd(va.vah)}).`],
    };
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 290 : 330),
      pad: { l: 10, r: 10, t: 12, b: 12 },
      label: 'Yesterday’s profile, its value area and where price opens',
      draw(P) {
        const C = pal(),
          z = zone();
        P.domain(0, 10, 98.8, 101.7);
        [[101.7, va.vah, 'above', C.gain], [va.vah, va.val, 'inside', C.accent], [va.val, 98.8, 'below', C.loss]].forEach(([t, b, k, col]) => {
          P.rect(0, b, 10, t, alpha(col, k === z ? 0.22 : 0.07));
          P.text(TXT[k][0], P.X(0.25), P.Y((t + b) / 2), { align: 'left', color: k === z ? col : C.muted, weight: k === z ? 700 : 600 });
        });
        drawProfile(P, C, va, 2.6, 3, { va: true });
        PV.drawLevels(P, vaLevels(va), { x0: 2.6, x1: 10 });
        P.dot(6, open, { color: C.ink, r: 5 });
        P.tag('Open ' + usd(open), P.X(6), P.Y(open), { dy: -32, bg: C.ink, size: 10.5 });
      },
    });
    function paint() {
      plot.render();
      const z = TXT[zone()];
      read.innerHTML = `<b class="${z[1]}">${z[0]}</b>. ${z[2]()}`;
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    paint();
    return {
      play() {
        stop();
        const path = [100.4, 101.3, 100.4, 99.2, 100.4];
        cancel = tween(4200, (k) => {
          const t = k * (path.length - 1),
            j = Math.min(path.length - 2, Math.floor(t));
          open = path[j] + (path[j + 1] - path[j]) * SS.ease.inOut(t - j);
          sl.set(open);
          paint();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- value migration over five days ---------- */
  V.valueMigration = function (host, p, ctx) {
    const SH = [[0, 0], [12, 0.7], [24, -0.4], [36, 0.5], [50, -0.2], [64, 0.6], [77, 0.4]];
    const days = [];
    let c = 100;
    for (let d = 0; d < 5; d++) {
      const a = SH.map(([x, y]) => [x, 100 + d * 0.75 + y]);
      a[0][1] = c;
      const b = PV.sessionAt(a, { seed: 101 + d });
      c = b[b.length - 1].c;
      days.push(b);
    }
    const vas = days.map((b) => PV.valueArea(b, { bins: 20 }));
    const rels = vas.map((v, d) => (d ? PV.relationship({ bot: vas[d - 1].val, top: vas[d - 1].vah }, { bot: v.val, top: v.vah }) : null));
    let shown = 5,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, read, h('p', { class: 'fine' }, 'Simulated sessions. Each box is that day’s value area; the amber bar is its POC.'));
    const lo = Math.min(...days.flat().map((b) => b.l)),
      hi = Math.max(...days.flat().map((b) => b.h));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 280 : 320),
      pad: { l: 44, r: 10, t: 22, b: 24 },
      label: 'Five days of volume profiles and value areas',
      draw(P) {
        const C = pal();
        P.domain(0, 5, lo - 0.2, hi + 0.2);
        P.grid({ xTicks: [], yf: PV.yf, zero: false });
        for (let d = 0; d < Math.floor(shown); d++) {
          const va = vas[d],
            col = d ? PV.relColor(rels[d], C) : C.stock;
          P.rect(d + 0.06, va.val, d + 0.94, va.vah, alpha(col, 0.14));
          [va.val, va.vah].forEach((v) => P.line([[d + 0.06, v], [d + 0.94, v]], { color: col, width: 1.5 }));
          drawProfile(P, C, va, d + 0.1, 0.78, { va: true });
          P.text('Day ' + (d + 1), P.X(d + 0.5), P.h - 9, { color: C.muted });
          if (d) P.text(PV.REL[rels[d]][0].replace(' value', ''), P.X(d + 0.5), P.Y(va.vah) - 10, { color: col, size: 9.5 });
        }
      },
    });
    function paint() {
      plot.render();
      const k = Math.floor(shown);
      read.innerHTML = k < 2 ? 'Day 1 sets the first value area.' : `Day ${k}: value area ${usd(vas[k - 1].val)} to ${usd(vas[k - 1].vah)}, <b class="${PV.relCls(rels[k - 1])}">${PV.REL[rels[k - 1]][0].toLowerCase()}</b> than day ${k - 1}.` + (k === 5 ? ` Value migrated up for four days in a row: ${rels.slice(1).filter((r) => PV.BIAS[r] > 0).length} of 4 relationships were bullish.` : '');
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(3200, (k) => {
          shown = 1 + k * 4.999;
          paint();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- profile shapes ---------- */
  const SHAPES = {
    normal: { label: 'Bell', a: NORMAL, text: 'Most volume piled up in the middle and thinned out at both ends: a balanced day. Traders expect rotation around this value until something breaks it.' },
    trend: { label: 'Long and thin', a: [[0, 100], [15, 100.9], [30, 101.8], [45, 102.6], [60, 103.5], [77, 104.2]], text: 'Volume spread thinly along the whole move, with no fat middle: a trend day. The market never stopped long enough to agree on a fair price.' },
    double: { label: 'Two humps', a: [[0, 100], [12, 100.4], [24, 99.9], [30, 100.2], [36, 101.9], [48, 102.4], [62, 102.0], [77, 102.3]], text: 'Two humps with a thin gap between them: value built in one area, then moved up and built again. Price can travel quickly through that thin gap if it returns.' },
    pshape: { label: 'P shape', a: [[0, 99], [8, 100.6], [14, 101.5], [24, 101.9], [36, 101.4], [50, 101.9], [64, 101.5], [77, 101.7]], text: 'A fast early rally, then balance near the highs: a P shape. It often comes from short sellers buying back, so traders wait to see whether new buyers follow.' },
    bshape: { label: 'b shape', a: [[0, 102], [8, 100.4], [14, 99.5], [24, 99.1], [36, 99.6], [50, 99.1], [64, 99.5], [77, 99.3]], text: 'A fast early drop, then balance near the lows: a b shape. It often comes from holders selling out, so traders wait to see whether new sellers follow.' },
  };
  function shapeChart(holder, ctx, key, o = {}) {
    const bars = PV.sessionAt(SHAPES[key].a, { seed: 91 }),
      n = bars.length;
    return TA.chart(holder, ctx, {
      bars,
      extraX: EX,
      pad: { l: 50, r: 78 },
      xTicks: PV.TICKS,
      xf: PV.clock,
      yf: PV.yf,
      dayFmt: (v) => PV.clock(v - 1),
      sliderLabel: 'Time',
      ms: o.ms || 3400,
      controls: o.controls,
      scrub: o.scrub,
      label: 'A session and its volume profile',
      over(P, C, i) {
        const va = PV.valueArea(bars, { bins: BINS, upto: i });
        drawProfile(P, C, va, n + 1, EX - 3, { va: true });
        if (!o.hideLevels || !o.hideLevels()) PV.drawLevels(P, vaLevels(va));
      },
      onIndex: o.onIndex,
    });
  }
  V.profileShapes = function (host, p, ctx) {
    let key = 'normal',
      chart = null;
    const sg = seg({ label: 'Shape', options: Object.keys(SHAPES).map((k) => ({ v: k, label: SHAPES[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) });
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, holder, read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      chart = shapeChart(holder, ctx, key, { onIndex: (i) => (read.innerHTML = i >= PV.BARS ? `<b>${SHAPES[key].label}.</b> ${SHAPES[key].text}` : `${PV.clock(i - 1)}: the profile is building.`) });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };
  V.shapeQuiz = function (host, p, ctx) {
    const r = SS.rng((Date.now() % 100000) + 13),
      keys = Object.keys(SHAPES);
    let order = [],
      at = 0,
      score = 0,
      seen = 0,
      answered = false,
      chart = null;
    const holder = h('div');
    const choices = h('div', { class: 'choices' });
    const fb = h('p', { class: 'readout', 'aria-live': 'polite' });
    const tally = h('p', { class: 'sorter-tally' });
    const next = h('button', { type: 'button', class: 'btn primary', hidden: true, onclick: () => round() }, 'Next profile');
    stack(host, holder, h('p', { class: 'plot-h' }, 'Which profile shape is this?'), choices, fb, h('div', { class: 'ctl-row' }, next, tally));
    function round() {
      if (at % keys.length === 0) order = keys.slice().sort(() => r() - 0.5);
      const key = order[at % keys.length];
      at++;
      answered = false;
      next.hidden = true;
      if (chart) chart.destroy();
      holder.replaceChildren();
      chart = shapeChart(holder, ctx, key, { controls: false, scrub: false, ms: 2200, hideLevels: () => !answered });
      chart.play();
      fb.textContent = 'Watch the profile build, then name its shape.';
      const opts = keys
        .filter((x) => x !== key)
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
                fb.innerHTML = `<b>${ok ? 'Correct.' : 'Not quite.'}</b> ${SHAPES[key].label}: ${SHAPES[key].text}`;
                tally.textContent = `${score} of ${seen} correct`;
                next.hidden = false;
                chart.set(PV.BARS);
              },
            },
            h('span', { class: 'choice-k' }, 'ABCD'[j]),
            h('span', null, SHAPES[o].label)
          )
        )
      );
    }
    round();
    return { destroy: () => chart && chart.destroy() };
  };
})();
