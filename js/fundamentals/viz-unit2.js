/* Fundamentals, Unit 2 visuals: compounding, inflation, risk and time, costs. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, money, pct, pal, alpha, tween, ease, MINUS } = SS;
  const V = SS.viz;
  const plc = SS.plClass;
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const m0 = (v) => money(v, { cents: false });
  const ph = (w) => (w < 480 ? 220 : 270);
  const pctTxt = (v) => v + '%';

  /* ---------- compounding vs simple ---------- */
  V.compound = function (host, p, ctx) {
    let P0 = 10000,
      r = 0.07,
      yrs = 30,
      reveal = 1,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const ball = h('span', { class: 'snowball' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const sP = slider({ id: ctx.key + '-p', label: 'Starting amount', min: 1000, max: 100000, step: 1000, value: P0, fmt: m0, onInput: (v) => ((P0 = v), update()) });
    const sR = slider({ id: ctx.key + '-r', label: 'Yearly return', min: 1, max: 12, step: 0.5, value: 7, fmt: pctTxt, onInput: (v) => ((r = v / 100), update()) });
    const sY = slider({ id: ctx.key + '-y', label: 'Years', min: 1, max: 50, step: 1, value: yrs, fmt: (v) => v + ' years', onInput: (v) => ((yrs = v), update()) });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-stock' }, h('i', { class: 'lg-sw block' }), 'Your original money'), h('span', { class: 'lg lg-gain' }, h('i', { class: 'lg-sw block' }), 'Growth from compounding'), h('span', { class: 'lg lg-ink' }, h('i', { class: 'lg-sw dashed' }), 'Simple interest'));
    stack(host, h('div', { class: 'cmp-row' }, plotEl, h('div', { class: 'snow-wrap', 'aria-hidden': 'true' }, ball, h('small', null, 'Your snowball'))), legend, sP.el, sR.el, sY.el, read);
    const comp = (t) => P0 * Math.pow(1 + r, t),
      simp = (t) => P0 * (1 + r * t);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Compound versus simple growth',
      draw(P) {
        const C = pal();
        const top = comp(yrs) * 1.08;
        P.domain(0, yrs, 0, top);
        P.grid({ xf: (v) => 'Y' + v, yf: SS.axisMoney });
        const T = yrs * reveal;
        const c = P.sample(comp, 0, T, 200);
        P.area(
          c.map(([x]) => [x, P0]),
          0,
          C.stock,
          0.35
        );
        P.between(
          c,
          c.map(([x]) => [x, P0]),
          C.gain,
          0.3
        );
        P.line(P.sample(simp, 0, T, 60), { color: C.ink, width: 1.75, dash: [6, 4] });
        P.line(c, { color: C.gain, width: 3 });
        P.dot(T, comp(T), { color: C.gain });
        P.tag(m0(comp(T)), P.X(T), P.Y(comp(T)), { bg: C.gain, align: 'right' });
      },
    });
    function update() {
      plot.render();
      const t = yrs * reveal,
        c = comp(t),
        s = simp(t);
      ball.style.setProperty('--s', Math.sqrt(c / comp(yrs)).toFixed(3));
      read.innerHTML = `After <b>${Math.round(t)} years</b>: compounding gives <b class="gain">${m0(c)}</b>; simple interest gives ${m0(s)}. The extra <b>${m0(c - s)}</b> is growth earned on earlier growth.`;
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(2400, (k) => {
        reveal = Math.max(0.02, ease.inOut(k));
        update();
      });
    }
    update();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- rule of 72 ---------- */
  V.rule72 = function (host, p, ctx) {
    const H = 40;
    let r = 0.08,
      reveal = 1,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const sR = slider({ id: ctx.key + '-r', label: 'Yearly growth rate', min: 2, max: 12, step: 1, value: 8, fmt: pctTxt, onInput: (v) => ((r = v / 100), update()) });
    const stats = h('div', { class: 'stats' });
    const blocks = h('div', { class: 'dbl', 'aria-hidden': 'true' });
    stack(host, plotEl, sR.el, blocks, stats);
    const val = (t) => 1000 * Math.pow(1 + r, t);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Doubling over 40 years',
      draw(P) {
        const C = pal();
        P.domain(0, H, 0, 1000 * Math.pow(1.12, H) * 1.02);
        P.grid({ xf: (v) => 'Y' + v, yf: SS.axisMoney, xTicks: [0, 10, 20, 30, 40] });
        const d = 72 / (r * 100);
        const T = H * reveal;
        P.line(P.sample(val, 0, T, 200), { color: C.accent, width: 3 });
        for (let k = 1; k * d <= T + 1e-9; k++) {
          P.vline(k * d, { color: C.muted, dash: [2, 4] });
          P.dot(k * d, val(k * d), { color: C.accent, r: 4 });
          if (val(k * d) > 3000) P.text('×' + Math.pow(2, k), P.X(k * d), P.Y(val(k * d)) - 14, { color: C.ink });
        }
      },
    });
    function update() {
      plot.render();
      const d = 72 / (r * 100),
        exact = Math.log(2) / Math.log(1 + r),
        n = Math.floor(H / d + 1e-9);
      blocks.replaceChildren(...Array.from({ length: Math.min(n, 9) + 1 }, (_, k) => h('span', { class: 'dbl-b' }, SS.axisMoney(1000 * Math.pow(2, k)))));
      stats.replaceChildren(stat('Rule of 72 says', d.toFixed(1) + ' years to double'), stat('Exact answer', exact.toFixed(1) + ' years'), stat('Doublings in 40 years', String(n)), stat('$1,000 becomes', m0(val(H)), 'gain'));
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(2200, (k) => {
        reveal = Math.max(0.02, k);
        plot.render();
      });
    }
    update();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- start early ---------- */
  V.startEarly = function (host, p, ctx) {
    let r = 0.07,
      reveal = 1,
      cancel = null;
    const path = (from, to) => {
      const out = [[25, 0]];
      let v = 0;
      for (let a = 25; a < 65; a++) {
        v = v * (1 + r) + (a >= from && a < to ? 5000 : 0);
        out.push([a + 1, v]);
      }
      return out;
    };
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-violet' }, h('i', { class: 'lg-sw' }), 'Ava: $5,000 a year, ages 25 to 35'), h('span', { class: 'lg lg-put' }, h('i', { class: 'lg-sw' }), 'Ben: $5,000 a year, ages 35 to 65'));
    const sR = slider({ id: ctx.key + '-r', label: 'Yearly return', min: 3, max: 10, step: 0.5, value: 7, fmt: pctTxt, onInput: (v) => ((r = v / 100), update()) });
    const stats = h('div', { class: 'stats' });
    stack(host, plotEl, legend, sR.el, stats);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Starting early versus starting late',
      draw(P) {
        const C = pal();
        const A = path(25, 35),
          B = path(35, 65);
        const top = Math.max(A[40][1], B[40][1]) * 1.1;
        P.domain(25, 65, 0, top);
        P.grid({ xf: (v) => 'Age ' + v, yf: SS.axisMoney, xTicks: [25, 35, 45, 55, 65] });
        P.vline(35, { color: C.muted, dash: [2, 4], label: 'Ava stops, Ben starts' });
        const cut = 25 + 40 * reveal;
        const show = (pts) => pts.filter(([a]) => a <= cut + 1e-9);
        P.line(show(A), { color: C.violet, width: 3 });
        P.line(show(B), { color: C.put, width: 3 });
        if (reveal >= 1) {
          P.tag('Ava ' + SS.axisMoney(Math.round(A[40][1] / 1000) * 1000), P.X(65), P.Y(A[40][1]), { bg: C.violet, align: 'right', dy: A[40][1] > B[40][1] ? -30 : 8 });
          P.tag('Ben ' + SS.axisMoney(Math.round(B[40][1] / 1000) * 1000), P.X(65), P.Y(B[40][1]), { bg: C.put, align: 'right', dy: A[40][1] > B[40][1] ? 8 : -30 });
        }
      },
    });
    function update() {
      plot.render();
      const a = path(25, 35)[40][1],
        b = path(35, 65)[40][1];
      stats.replaceChildren(stat('Ava put in', '$50,000'), stat('Ava at 65', m0(a), a >= b ? 'gain' : ''), stat('Ben put in', '$150,000'), stat('Ben at 65', m0(b), b > a ? 'gain' : ''));
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(2600, (k) => {
        reveal = Math.max(0.01, ease.inOut(k));
        plot.render();
      });
    }
    update();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- monthly contributions ---------- */
  V.contrib = function (host, p, ctx) {
    let mo = 200,
      yrs = 40,
      r = 0.07;
    const series = () => {
      const out = [];
      let v = 0,
        put = 0;
      const i = r / 12;
      out.push([0, 0, 0]);
      for (let m = 1; m <= yrs * 12; m++) {
        v = v * (1 + i) + mo;
        put += mo;
        if (m % 12 === 0) out.push([m / 12, v, put]);
      }
      return out;
    };
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-stock' }, h('i', { class: 'lg-sw block' }), 'Money you put in'), h('span', { class: 'lg lg-gain' }, h('i', { class: 'lg-sw block' }), 'Growth'));
    const sM = slider({ id: ctx.key + '-m', label: 'Each month', min: 25, max: 2000, step: 25, value: mo, fmt: m0, onInput: (v) => ((mo = v), update()) });
    const sY = slider({ id: ctx.key + '-y', label: 'Years', min: 5, max: 50, step: 1, value: yrs, fmt: (v) => v + ' years', onInput: (v) => ((yrs = v), update()) });
    const sR = slider({ id: ctx.key + '-r', label: 'Yearly return', min: 0, max: 12, step: 0.5, value: 7, fmt: pctTxt, onInput: (v) => ((r = v / 100), update()) });
    const stats = h('div', { class: 'stats' });
    stack(host, plotEl, legend, sM.el, sY.el, sR.el, stats);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Growth of monthly contributions',
      draw(P) {
        const C = pal(),
          s = series();
        P.domain(0, yrs, 0, s[s.length - 1][1] * 1.08 || 1);
        P.grid({ xf: (v) => 'Y' + v, yf: SS.axisMoney });
        const tot = s.map(([t, v]) => [t, v]),
          put = s.map(([t, , c]) => [t, c]);
        P.area(put, 0, C.stock, 0.4);
        P.between(tot, put, C.gain, 0.32);
        P.line(tot, { color: C.gain, width: 2.5 });
      },
    });
    function update() {
      plot.render();
      const s = series(),
        end = s[s.length - 1],
        v = end[1],
        put = end[2];
      const tenAgo = s[Math.max(0, s.length - 11)][1];
      stats.replaceChildren(stat('You end with', m0(v), 'gain'), stat('You put in', m0(put)), stat('Growth', m0(v - put), 'gain'), stat('Added in the final 10 years', yrs > 10 ? pct((v - tenAgo) / v, { d: 0 }) : '—'));
    }
    update();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- inflation ---------- */
  V.inflation = function (host, p, ctx) {
    let yrs = 30,
      inf = 0.03,
      cancel = null;
    const basket = h('div', { class: 'infl-card' }, h('span', { class: 'duo-l' }, 'Groceries that cost $100 today'), h('b', { class: 'infl-v' }), h('span', { class: 'infl-sub' }));
    const note = h('div', { class: 'banknote' }, h('span', null, '$100'));
    const cash = h('div', { class: 'infl-card' }, h('span', { class: 'duo-l' }, '$100 kept in cash buys'), h('div', { class: 'note-wrap', 'aria-hidden': 'true' }, note), h('b', { class: 'infl-v' }), h('span', { class: 'infl-sub' }));
    const sY = slider({ id: ctx.key + '-y', label: 'Years from now', min: 0, max: 40, step: 1, value: yrs, fmt: (v) => v + ' years', onInput: (v) => (stop(), (yrs = v), update()) });
    const sI = slider({ id: ctx.key + '-i', label: 'Inflation per year', min: 0, max: 8, step: 0.5, value: 3, fmt: pctTxt, onInput: (v) => ((inf = v / 100), update()) });
    stack(host, h('div', { class: 'duo' }, basket, cash), sY.el, sI.el);
    function update() {
      const cost = 100 * Math.pow(1 + inf, yrs),
        power = 100 / Math.pow(1 + inf, yrs);
      basket.querySelector('.infl-v').textContent = money(cost);
      basket.querySelector('.infl-sub').textContent = yrs ? `in ${yrs} years, at ${(inf * 100).toFixed(1)}% inflation` : 'today';
      cash.querySelector('.infl-v').textContent = money(power);
      cash.querySelector('.infl-sub').textContent = yrs ? `worth of today’s groceries, ${pct(1 - power / 100, { d: 0 })} less` : 'of groceries';
      note.style.setProperty('--k', (power / 100).toFixed(3));
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    update();
    return {
      play() {
        stop();
        cancel = tween(2200, (k) => {
          yrs = Math.round(30 * k);
          sY.set(yrs);
          update();
        });
      },
      destroy: stop,
    };
  };

  /* ---------- real returns ---------- */
  V.realReturn = function (host, p, ctx) {
    const A = [
      ['Savings account', 0.015],
      ['Bonds', 0.04],
      ['Stocks', 0.09],
    ];
    let inf = 0.03;
    const sI = slider({ id: ctx.key + '-i', label: 'Inflation per year', min: 0, max: 8, step: 0.5, value: 3, fmt: pctTxt, onInput: (v) => ((inf = v / 100), update()) });
    const rows = h('div', { class: 'attr' });
    const tbl = h('div', { class: 'table-wrap' });
    stack(host, h('p', { class: 'plot-h' }, 'Real return per year (after inflation)'), rows, sI.el, tbl, h('p', { class: 'fine' }, 'Nominal returns are illustrative long-run figures, not forecasts.'));
    function update() {
      const max = 0.1;
      rows.replaceChildren(
        ...A.map(([n, nom]) => {
          const real = (1 + nom) / (1 + inf) - 1,
            w = (Math.min(Math.abs(real), max) / max) * 50;
          return h('div', { class: 'attr-row' }, h('span', { class: 'attr-l' }, n, h('small', { class: 'attr-sub' }, ' ' + pct(nom) + ' nominal')), h('div', { class: 'attr-track' }, h('span', { class: 'attr-zero' }), h('span', { class: 'attr-bar ' + (real >= 0 ? 'pos' : 'neg'), style: { width: w + '%', left: real >= 0 ? '50%' : 50 - w + '%' } })), h('b', { class: plc(real) }, pct(real, { sign: true })));
        })
      );
      tbl.innerHTML = `<table class="cmp"><thead><tr><th>$10,000 for 30 years</th><th>Shows on statement</th><th>Buys, in today’s money</th></tr></thead><tbody>${A.map(([n, nom]) => {
        const v = 10000 * Math.pow(1 + nom, 30),
          real = v / Math.pow(1 + inf, 30);
        return `<tr><th>${n}</th><td>${m0(v)}</td><td class="${plc(real - 10000)}">${m0(real)}</td></tr>`;
      }).join('')}</tbody></table>`;
    }
    update();
  };

  /* ---------- same average, different swings ---------- */
  V.swings = function (host, p, ctx) {
    const N = 20,
      mu = 0.07;
    let sw = 0.25,
      seed = 4,
      z = [];
    function roll() {
      const r = SS.rng(seed * 7717);
      z = Array.from({ length: N }, () => SS.gauss(r));
      const m = z.reduce((a, b) => a + b, 0) / N;
      const sd = Math.sqrt(z.reduce((a, b) => a + (b - m) * (b - m), 0) / N);
      z = z.map((v) => (v - m) / sd);
    }
    const calm = () => z.map((v) => mu + 0.05 * v),
      wild = () => z.map((v) => Math.max(-0.9, mu + sw * v));
    const grow = (rs) => rs.reduce((a, x) => (a.push(a[a.length - 1] * (1 + x)), a), [10000]);
    const top = h('div', { class: 'plot' }),
      bot = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-call' }, h('i', { class: 'lg-sw block' }), 'Calm fund (swings ±5%)'), h('span', { class: 'lg lg-put' }, h('i', { class: 'lg-sw block' }), 'Wild fund'));
    const sS = slider({ id: ctx.key + '-sw', label: 'How much the wild fund swings', min: 10, max: 35, step: 1, value: 25, fmt: (v) => '±' + v + '%', onInput: (v) => ((sw = v / 100), update()) });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => (seed++, roll(), update()) }, 'New 20-year sample');
    const stats = h('div', { class: 'stats' });
    stack(host, h('p', { class: 'plot-h' }, 'Yearly returns'), top, h('p', { class: 'plot-h' }, 'Growth of $10,000'), bot, legend, h('div', { class: 'ctl-row' }, btn, sS.el), stats);
    const pTop = new Plot(top, {
      height: 160,
      label: 'Yearly returns of two funds',
      draw(P) {
        const C = pal(),
          a = calm(),
          b = wild();
        P.domain(0.4, N + 0.6, -0.6, 0.8);
        P.grid({ xTicks: [1, 5, 10, 15, 20], xf: (v) => 'Y' + v, yf: (v) => Math.round(v * 100) + '%', yTicks: [-0.5, 0, 0.5] });
        for (let i = 0; i < N; i++) {
          P.rect(i + 1 - 0.38, 0, i + 1 - 0.02, a[i], alpha(C.call, 0.85));
          P.rect(i + 1 + 0.02, 0, i + 1 + 0.38, b[i], alpha(C.put, 0.85));
        }
      },
    });
    const pBot = new Plot(bot, {
      height: 170,
      label: 'Growth of $10,000 in each fund',
      draw(P) {
        const C = pal(),
          a = grow(calm()),
          b = grow(wild());
        P.domain(0, N, 0, Math.max(...a, ...b) * 1.1);
        P.grid({ xTicks: [0, 5, 10, 15, 20], xf: (v) => 'Y' + v, yf: SS.axisMoney });
        P.line(
          a.map((v, i) => [i, v]),
          { color: C.call, width: 2.5 }
        );
        P.line(
          b.map((v, i) => [i, v]),
          { color: C.put, width: 2.5 }
        );
      },
    });
    function update() {
      pTop.render();
      pBot.render();
      const a = grow(calm()),
        b = grow(wild());
      const avgB = wild().reduce((x, y) => x + y, 0) / N;
      const cg = (s) => Math.pow(s[N] / 10000, 1 / N) - 1;
      stats.replaceChildren(stat('Average yearly return', `${pct(mu)} vs ${pct(avgB)}`), stat('Calm fund ends', m0(a[N]), 'gain'), stat('Wild fund ends', m0(b[N]), b[N] < a[N] ? 'loss' : 'gain'), stat('Compound growth per year', `${pct(cg(a))} vs ${pct(cg(b))}`));
    }
    roll();
    update();
    return { destroy: () => (pTop.destroy(), pBot.destroy()) };
  };

  /* ---------- losses need bigger gains ---------- */
  V.lossRecovery = function (host, p, ctx) {
    let L = 0.5,
      cancel = null;
    const need = (l) => 1 / (1 - l) - 1;
    const plotEl = h('div', { class: 'plot' });
    const bars = h('div', { class: 'lr' });
    const sl = slider({ id: ctx.key + '-l', label: 'Size of the loss', min: 0, max: 90, step: 5, value: 50, fmt: (v) => MINUS + v + '%', onInput: (v) => (stop(), (L = v / 100), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, bars, plotEl, sl.el, read);
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 190 : 220),
      label: 'Gain needed to recover from a loss',
      onScrub: (v) => {
        stop();
        L = Math.round(v / 5) * 0.05;
        sl.set(L * 100);
        update();
      },
      draw(P) {
        const C = pal();
        P.domain(0, 90, 0, 400);
        P.grid({ xf: (v) => MINUS + v + '%', yf: (v) => '+' + v + '%', xTicks: [0, 20, 40, 60, 80], yTicks: [0, 100, 200, 300, 400] });
        P.line(P.sample((x) => need(x / 100) * 100, 0, 90, 300), { color: C.loss, width: 3 });
        P.line([[0, 0], [90, 90]], { color: C.muted, width: 1.5, dash: [5, 4] });
        P.text('If gains and losses were symmetric', P.X(62), P.Y(62) + 14, { color: C.muted });
        const y = need(L) * 100;
        P.dot(L * 100, Math.min(400, y), { color: C.loss });
        P.tag('+' + Math.round(y) + '%', P.X(L * 100), P.Y(Math.min(400, y)), { bg: C.loss });
      },
    });
    function update() {
      plot.render();
      const after = 100 * (1 - L),
        g = need(L),
        yrs = L > 0 ? Math.log(1 / (1 - L)) / Math.log(1.07) : 0;
      const mk = (label, v, cls) => h('div', { class: 'lr-col' }, h('div', { class: 'lr-bar' }, h('i', { class: cls, style: { height: Math.min(100, v) + '%' } })), h('b', null, label));
      bars.replaceChildren(mk('Start: $100', 100, 'start'), mk(`After the loss: ${money(after, { cents: false })}`, after, 'after'), mk(`Need +${Math.round(g * 100)}% to get back`, 100, 'need'));
      read.innerHTML = L === 0 ? 'No loss, nothing to recover.' : `A ${Math.round(L * 100)}% loss takes a <b class="loss">+${Math.round(g * 100)}%</b> gain to recover. At 7% a year, that is about <b>${yrs.toFixed(1)} years</b> just to get back to where you started.`;
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    update();
    return {
      play() {
        stop();
        cancel = tween(1800, (k) => {
          L = Math.round((0.1 + 0.4 * ease.inOut(k)) * 20) / 20;
          sl.set(L * 100);
          update();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- time horizon ---------- */
  V.horizon = function (host, p, ctx) {
    const mA = 0.09,
      s = 0.17,
      m = mA - (s * s) / 2;
    let T = 1,
      cancel = null;
    const pLoss = (t) => SS.N((-m * Math.sqrt(t)) / s);
    const dens = (y, t) => {
      if (y <= -1) return 0;
      const sd = s / Math.sqrt(t),
        z = (Math.log(1 + y) - m) / sd;
      return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI) * (1 + y));
    };
    const plotEl = h('div', { class: 'plot' });
    const sl = slider({ id: ctx.key + '-t', label: 'Years you stay invested', min: 1, max: 30, step: 1, value: T, fmt: (v) => v + (v === 1 ? ' year' : ' years'), onInput: (v) => (stop(), (T = v), update()) });
    const odds = h('div', { class: 'odds' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('p', { class: 'plot-h' }, 'Possible average yearly returns over the whole period'), plotEl, sl.el, read, odds, h('p', { class: 'fine' }, 'A simple model of a stock index: 9% average return and 17% yearly swings. Real markets can have longer losing stretches than a model like this suggests.'));
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Distribution of average yearly returns',
      draw(P) {
        const C = pal();
        P.domain(-0.45, 0.6, 0, 13);
        P.grid({ xf: (v) => Math.round(v * 100) + '%', noYLabels: true, yTicks: [], zero: false, xTicks: [-0.4, -0.2, 0, 0.2, 0.4, 0.6] });
        const all = P.sample((y) => dens(y, T), -0.45, 0.6, 400);
        P.area(
          all.filter(([y]) => y <= 0),
          0,
          C.loss,
          0.45
        );
        P.area(
          all.filter(([y]) => y >= 0),
          0,
          C.gain,
          0.3
        );
        P.line(all, { color: C.ink, width: 2 });
        P.vline(0, { color: C.ink, dash: [3, 3], label: 'Break even' });
      },
    });
    function update() {
      plot.render();
      read.innerHTML = `Over <b>${T} ${T === 1 ? 'year' : 'years'}</b>, the chance of ending with less than you started is about <b class="loss">${pct(pLoss(T), { d: 0 })}</b> in this model.`;
      odds.replaceChildren(...[1, 5, 10, 20].map((t) => h('div', { class: 'odds-col' + (t === T ? ' on' : '') }, h('div', { class: 'odds-bar' }, h('i', { style: { height: (pLoss(t) / 0.35) * 100 + '%' } })), h('b', null, pct(pLoss(t), { d: 0 })), h('span', null, t + (t === 1 ? ' year' : ' years')))));
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    update();
    return {
      play() {
        stop();
        cancel = tween(3200, (k) => {
          T = Math.max(1, Math.round(1 + 19 * ease.inOut(k)));
          sl.set(T);
          update();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- fee and cost drag ---------- */
  V.feeDrag = function (host, p, ctx) {
    const trading = p.mode === 'trading';
    const start = 100000,
      gross = 0.07;
    const lowFee = trading ? 0.001 : 0.0005;
    let hiFee = trading ? 0.015 : 0.01,
      yrs = 30,
      reveal = 1,
      cancel = null;
    const labA = trading ? 'Buy and hold' : 'Index fund, 0.05% fee',
      labB = trading ? 'Frequent trader' : 'Higher-fee fund';
    const val = (f, t) => start * Math.pow(1 + gross - f, t);
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-gain' }, h('i', { class: 'lg-sw' }), labA), h('span', { class: 'lg lg-loss' }, h('i', { class: 'lg-sw' }), labB), h('span', { class: 'lg lg-loss' }, h('i', { class: 'lg-sw block' }), trading ? 'Lost to costs and taxes' : 'Lost to fees'));
    const sF = slider({ id: ctx.key + '-f', label: trading ? 'Yearly drag from trading costs and taxes' : 'Higher fund fee', min: 0.25, max: 3, step: 0.05, value: hiFee * 100, fmt: (v) => v.toFixed(2) + '%', onInput: (v) => ((hiFee = v / 100), update()) });
    const sY = slider({ id: ctx.key + '-y', label: 'Years', min: 5, max: 40, step: 1, value: yrs, fmt: (v) => v + ' years', onInput: (v) => ((yrs = v), update()) });
    const stats = h('div', { class: 'stats' });
    stack(host, plotEl, legend, sF.el, sY.el, stats, h('p', { class: 'fine' }, `$100,000 growing 7% a year before ${trading ? 'costs' : 'fees'}.`));
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Growth with low and high costs',
      draw(P) {
        const C = pal();
        P.domain(0, yrs, 0, val(0, yrs) * 1.06);
        P.grid({ xf: (v) => 'Y' + v, yf: SS.axisMoney });
        const T = yrs * reveal;
        const a = P.sample((t) => val(lowFee, t), 0, T, 200),
          b = P.sample((t) => val(hiFee, t), 0, T, 200);
        P.between(a, b, C.loss, 0.25);
        P.line(a, { color: C.gain, width: 3 });
        P.line(b, { color: C.loss, width: 3 });
      },
    });
    function update() {
      plot.render();
      const a = val(lowFee, yrs),
        b = val(hiFee, yrs);
      stats.replaceChildren(stat(labA, m0(a), 'gain'), stat(labB, m0(b), 'loss'), stat('Difference', m0(a - b), 'loss'), stat('Share of the result lost', pct(1 - b / a, { d: 0 }), 'loss'));
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(2000, (k) => {
        reveal = Math.max(0.02, ease.inOut(k));
        plot.render();
      });
    }
    update();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };
})();
