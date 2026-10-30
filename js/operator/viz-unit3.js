/* Lessons of a Stock Operator, Unit 3 visuals: hopeful versus disciplined exits on the same random trades, and the
   boom-and-bust cycle. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, pal, alpha, tween, ease } = SS;
  const V = SS.viz;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const pc = (v, d = 1) => (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(d) + '%';

  /* ---------- hope versus discipline ---------- */
  const N = 60,
    DAYS = 40;
  /** 60 random 40-day price paths, each starting at 100. */
  function deal(seed) {
    const r = SS.rng(seed),
      out = [];
    for (let k = 0; k < N; k++) {
      const p = [100];
      for (let t = 1; t <= DAYS; t++) p.push(p[t - 1] * Math.exp(0.0006 + 0.02 * SS.gauss(r)));
      out.push(p);
    }
    return out;
  }
  // Disciplined: cut at −7%; once up 5%, exit on a 10% drop from the high. Hopeful: take +5%, otherwise hold to the end.
  const RULES = {
    disciplined: (p) => {
      let peak = p[0];
      for (let t = 1; t < p.length; t++) {
        peak = Math.max(peak, p[t]);
        if (p[t] <= p[0] * 0.93 || (peak >= p[0] * 1.05 && p[t] <= peak * 0.9)) return p[t] / p[0] - 1;
      }
      return p[p.length - 1] / p[0] - 1;
    },
    hopeful: (p) => {
      for (let t = 1; t < p.length; t++) if (p[t] >= p[0] * 1.05) return p[t] / p[0] - 1;
      return p[p.length - 1] / p[0] - 1;
    },
  };
  const summary = (rs) => {
    const w = rs.filter((x) => x > 0),
      l = rs.filter((x) => x <= 0);
    return { win: w.length / rs.length, aw: w.length ? w.reduce((a, b) => a + b, 0) / w.length : 0, al: l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0, worst: Math.min(...rs), best: Math.max(...rs), tot: rs.reduce((a, b) => a + b, 0) };
  };
  V.hopeFear = function (host, p, ctx) {
    let seed = p.seed || 1,
      reveal = 1,
      cancel = null,
      res = null;
    const elD = h('div', { class: 'plot' }),
      elH = h('div', { class: 'plot' });
    const table = h('div', { class: 'table-wrap' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => ((seed += 1), compute(), play()) }, 'Deal new trades');
    stack(host, h('p', { class: 'plot-h' }, 'Disciplined: cut at −7%, let winners run'), elD, h('p', { class: 'plot-h' }, 'Hopeful: take +5%, hold losers'), elH, table, h('div', { class: 'ctl-row' }, btn), read, h('p', { class: 'fine' }, 'Each bar is one trade on a simulated stock with a tiny upward drift. The hopeful trader holds a loser until it reaches +5% or 40 days pass.'));
    function compute() {
      const T = deal(seed);
      res = { d: T.map(RULES.disciplined), h: T.map(RULES.hopeful) };
      res.lo = Math.min(-0.12, ...res.d, ...res.h) * 1.08;
      res.hi = Math.max(0.12, ...res.d, ...res.h) * 1.08;
    }
    const strip = (el, key, label) =>
      new Plot(el, {
        height: 120,
        pad: { l: 40, r: 8, t: 8, b: 8 },
        label,
        draw(P) {
          const C = pal(),
            rs = res[key],
            k = Math.round(N * reveal);
          P.domain(-0.6, N - 0.4, res.lo, res.hi);
          P.grid({ xTicks: [], yTicks: [-0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4].filter((v) => v > res.lo && v < res.hi), yf: (v) => Math.round(v * 100) + '%' });
          for (let j = 0; j < k; j++) P.rect(j - 0.38, 0, j + 0.38, rs[j], alpha(rs[j] > 0 ? C.gain : C.loss, 0.85));
          P.line([[-0.6, 0], [N - 0.4, 0]], { color: C.ink, width: 1, alpha: 0.5 });
        },
      });
    compute();
    const pD = strip(elD, 'd', 'Results of the disciplined trader'),
      pH = strip(elH, 'h', 'Results of the hopeful trader');
    function paint() {
      pD.render();
      pH.render();
      const d = summary(res.d),
        hp = summary(res.h);
      const row = (name, a, b, cls) => `<tr><th>${name}</th><td class="${cls ? cls(a) : ''}">${a.txt}</td><td class="${cls ? cls(b) : ''}">${b.txt}</td></tr>`;
      const v = (x, fmt) => ({ x, txt: fmt(x) });
      const sign = (o) => (o.x >= 0 ? 'gain' : 'loss');
      table.innerHTML = `<table class="cmp"><thead><tr><th></th><th>Disciplined</th><th>Hopeful</th></tr></thead><tbody>
        ${row('Win rate', v(d.win, (x) => Math.round(x * 100) + '%'), v(hp.win, (x) => Math.round(x * 100) + '%'))}
        ${row('Average win', v(d.aw, pc), v(hp.aw, pc), sign)}
        ${row('Average loss', v(d.al, pc), v(hp.al, pc), sign)}
        ${row('Worst trade', v(d.worst, pc), v(hp.worst, pc), sign)}
        ${row('Total of 60 trades', v(d.tot, (x) => pc(x, 0)), v(hp.tot, (x) => pc(x, 0)), sign)}
      </tbody></table>`;
      const ahead = d.tot >= hp.tot ? 'the disciplined trader' : 'the hopeful trader';
      read.innerHTML = `Set ${seed}: the hopeful trader won <b>${Math.round(hp.win * 100)}%</b> of trades but its average loss (${pc(hp.al)}) was ${(Math.abs(hp.al) / hp.aw).toFixed(1)}× its average win, and its worst trade was ${pc(hp.worst)} against ${pc(d.worst)}. This time ${ahead} ended ahead overall; deal again and that can flip. The shape of the risk doesn’t.`;
    }
    function play() {
      if (cancel) cancel();
      paint();
      cancel = tween(1600, (k) => {
        reveal = Math.max(0.02, ease.out(k));
        pD.render();
        pH.render();
      });
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), pD.destroy(), pH.destroy()) };
  };

  /* ---------- the boom-and-bust cycle ---------- */
  const CURVE = [[0, 10], [8, 12], [14, 15], [20, 22], [25, 18], [32, 26], [40, 36], [48, 52], [54, 68], [60, 86], [62, 88], [64, 80], [66, 83], [70, 66], [75, 48], [80, 32], [84, 22], [88, 15], [92, 14], [100, 21]];
  const STAGES = [
    [0, 20, 'Stealth', 'Disbelief', 'Prices rise quietly while most people still doubt the move. Few are paying attention.'],
    [20, 40, 'Awareness', 'Hope', 'The trend becomes visible. The first shakeout scares out early buyers; the line of least resistance is still up.'],
    [40, 62, 'Mania', 'Greed', '“This time is different.” Everyone is buying, borrowing to buy, and telling others to buy. Sit tight with the trend, but watch it closely.'],
    [62, 84, 'Panic', 'Fear', 'The trend breaks. Hope turns to denial, then fear and forced selling. In 1907, Livingston was short at this stage.'],
    [84, 100, 'Despair', 'Capitulation', 'Nobody wants to own anything. Bottoms form when the last sellers give up, often amid the worst news.'],
  ];
  const at = (x) => {
    for (let k = 1; k < CURVE.length; k++) if (x <= CURVE[k][0]) {
      const [x0, y0] = CURVE[k - 1],
        [x1, y1] = CURVE[k],
        f = (x - x0) / (x1 - x0),
        s = f * f * (3 - 2 * f);
      return y0 + (y1 - y0) * s;
    }
    return CURVE[CURVE.length - 1][1];
  };
  const HISTORY = [
    ['1907', 'The Panic of 1907: a banking panic in New York, the climax of the book’s early chapters.'],
    ['1929', 'The Great Crash: a margin-fueled boom ended in the worst crash in Wall Street history.'],
    ['2000', 'The dot-com bust: internet stocks with no profits had been priced for perfection.'],
    ['2008', 'The financial crisis: a housing and credit boom turned into a global bank panic.'],
    ['2020', 'The COVID crash: the fastest bear market on record, followed by a rapid rebound.'],
    ['2021', 'Meme stocks and crypto: social-media manias, then steep falls in 2022.'],
  ];
  V.maniaCycle = function (host, p, ctx) {
    let pos = 100,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const list = h('ol', { class: 'op-history' });
    list.innerHTML = HISTORY.map(([y, t]) => `<li><b>${y}</b> ${t}</li>`).join('');
    const sl = SS.slider({ id: ctx.key + '-x', label: 'Move through the cycle', min: 0, max: 100, step: 1, value: pos, fmt: (v) => stageOf(v)[2], onInput: (v) => (stop(), (pos = v), paint()) });
    stack(host, plotEl, sl.el, read, h('p', { class: 'plot-h' }, 'The same cycle, again and again'), list, h('p', { class: 'fine' }, 'A stylized cycle, not a real chart. The stages are a common way of describing speculative booms.'));
    function stageOf(x) {
      return STAGES.find((s) => x >= s[0] && x <= s[1]) || STAGES[STAGES.length - 1];
    }
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 230 : 260),
      pad: { l: 12, r: 12, t: 12, b: 28 },
      label: 'The boom-and-bust cycle with its stages',
      draw(P) {
        const C = pal(),
          cur = stageOf(pos);
        P.domain(0, 100, 0, 100);
        STAGES.forEach((s, j) => {
          P.rect(s[0], 0, s[1], 100, alpha(j === 2 ? C.warn : j === 3 ? C.loss : C.accent, s === cur ? 0.16 : 0.05));
          P.text(s[2], P.X((s[0] + s[1]) / 2), P.h - 12, { color: s === cur ? C.ink : C.muted, weight: s === cur ? 700 : 600, size: 10 });
        });
        P.line(P.sample(at, 0, 100, 200), { color: C.muted, width: 1.5, alpha: 0.5 });
        P.line(P.sample(at, 0, pos, Math.max(2, Math.round(pos * 2))), { color: C.ink, width: 2.75 });
        P.dot(pos, at(pos), { color: cur[2] === 'Mania' ? C.warn : cur[2] === 'Panic' || cur[2] === 'Despair' ? C.loss : C.accent, r: 6 });
        P.tag(cur[3], P.X(pos), P.Y(at(pos)), { bg: C.ink, dy: at(pos) > 70 ? 12 : -34, align: pos > 75 ? 'right' : pos < 15 ? 'left' : undefined, size: 10.5 });
      },
    });
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    function paint() {
      plot.render();
      const s = stageOf(pos);
      read.innerHTML = `<b>${s[2]}</b> · the mood is ${s[3].toLowerCase()}. ${s[4]}`;
    }
    paint();
    return {
      play() {
        stop();
        cancel = tween(6000, (k) => {
          pos = 100 * k;
          sl.set(pos);
          paint();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };
})();
