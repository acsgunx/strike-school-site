/* Technical Analysis, Unit 5 visuals: trade planning, sizing, expectancy, streaks, backtests, plan and journal. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, money, pct, usd, pal, alpha, tween, ease } = SS;
  const V = SS.viz,
    TA = SS.TA;
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const R = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2) + 'R';
  const m0 = (v) => money(v, { cents: false });

  /* ---------- plan the exit before the entry ---------- */
  V.tradePlanner = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 48], [20, 52], [30, 50], [36, 48.3], [42, 51], [52, 55.5], [62, 57.5], [69, 56.8]], 70, { seed: 301, noise: 0.004 }), { seed: 301, wick: 0.006 });
    const E = 30,
      entry = bars[E].c;
    let stopPct = 0.03,
      tgtPct = 0.1;
    const sS = slider({ id: ctx.key + '-s', label: 'Stop below entry', min: 1, max: 8, step: 0.5, value: 3, fmt: (v) => v + '%', onInput: (v) => ((stopPct = v / 100), chart.render()) });
    const sT = slider({ id: ctx.key + '-t', label: 'Target above entry', min: 2, max: 16, step: 0.5, value: 10, fmt: (v) => v + '%', onInput: (v) => ((tgtPct = v / 100), chart.render()) });
    const stats = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const outcome = () => {
      const st = entry * (1 - stopPct),
        tg = entry * (1 + tgtPct);
      for (let j = E + 1; j < bars.length; j++) {
        if (bars[j].l <= st) return { j, hit: 'stop', st, tg };
        if (bars[j].h >= tg) return { j, hit: 'target', st, tg };
      }
      return { j: null, st, tg };
    };
    const box = stack(host);
    const chart = TA.chart(box, ctx, {
      bars,
      ms: 3200,
      label: 'A trade with its stop and target',
      over(P, C, i) {
        const o = outcome();
        if (i <= E) return;
        P.line([[E, o.tg], [69, o.tg]], { color: C.gain, width: 2, dash: [5, 4] });
        P.line([[E, o.st], [69, o.st]], { color: C.loss, width: 2, dash: [5, 4] });
        P.line([[E, entry], [69, entry]], { color: C.accent, width: 1.5 });
        P.text('Target ' + usd(o.tg), P.X(E) + 4, P.Y(o.tg) - 9, { align: 'left', color: C.gain });
        P.text('Stop ' + usd(o.st), P.X(E) + 4, P.Y(o.st) + 11, { align: 'left', color: C.loss });
        P.tag('Buy ' + usd(entry), P.X(E), P.Y(entry), { bg: C.accent, align: 'right', dy: -10 });
        if (o.j != null && i > o.j) P.tag(o.hit === 'stop' ? 'Stopped out' : 'Target hit', P.X(o.j), P.Y(o.hit === 'stop' ? o.st : o.tg), { bg: o.hit === 'stop' ? C.loss : C.gain, dy: o.hit === 'stop' ? 10 : -30 });
      },
      onIndex(i) {
        const o = outcome(),
          risk = entry - o.st,
          rew = o.tg - entry;
        stats.replaceChildren(stat('Risk per share', usd(risk), 'loss'), stat('Reward per share', usd(rew), 'gain'), stat('Reward to risk', (rew / risk).toFixed(1) + ' to 1'));
        read.innerHTML = i <= E ? 'The trade is planned for day 31. Set the stop and target first.' : o.j != null && i > o.j ? (o.hit === 'stop' ? `Stopped out on day ${o.j + 1}: <b class="loss">−1R</b>. ${stopPct <= 0.035 ? 'A tight stop caught the normal dip before the rally.' : ''}` : `Target hit on day ${o.j + 1}: <b class="gain">${R(rew / risk)}</b>.`) : `Day ${i}: neither level hit yet.`;
      },
    });
    box.append(sS.el, sT.el, stats, read);
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- position size calculator ---------- */
  V.positionSize = function (host, p, ctx) {
    let acct = 20000,
      rp = 1,
      entry = 50,
      dist = 2;
    const sA = slider({ id: ctx.key + '-a', label: 'Account size', min: 1000, max: 100000, step: 1000, value: acct, fmt: m0, onInput: (v) => ((acct = v), paint()) });
    const sR = slider({ id: ctx.key + '-r', label: 'Risk per trade', min: 0.25, max: 5, step: 0.25, value: rp, fmt: (v) => v + '% of the account', onInput: (v) => ((rp = v), paint()) });
    const sE = slider({ id: ctx.key + '-e', label: 'Entry price', min: 5, max: 200, step: 1, value: entry, fmt: (v) => usd(v), onInput: (v) => ((entry = v), (dist = Math.min(dist, v * 0.5)), sD.set(dist), paint()) });
    const sD = slider({ id: ctx.key + '-d', label: 'Distance to stop', min: 0.25, max: 10, step: 0.25, value: dist, fmt: (v) => usd(v) + ' a share', onInput: (v) => ((dist = Math.min(v, entry * 0.5)), paint()) });
    const big = h('div', { class: 'eps-big', 'aria-live': 'polite' });
    const bars = h('div', { class: 'bv' });
    const read = h('p', { class: 'readout' });
    stack(host, big, bars, sA.el, sR.el, sE.el, sD.el, read);
    function paint() {
      const risk = (acct * rp) / 100,
        sh = Math.floor(risk / dist),
        val = sh * entry,
        share = val / acct;
      big.innerHTML = `<span class="duo-l">Shares to buy</span><b>${sh.toLocaleString('en-US')}</b><span>${m0(risk)} risk ÷ ${usd(dist)} stop distance</span>`;
      const w = (v) => Math.min(100, (v / Math.max(acct, val)) * 100) + '%';
      bars.innerHTML = `<div class="bv-row"><span>Account</span><span class="bv-track"><i class="book" style="width:${w(acct)}"></i></span><b>${m0(acct)}</b></div><div class="bv-row"><span>Position value</span><span class="bv-track"><i class="mkt" style="width:${w(val)}"></i></span><b>${m0(val)}</b></div><div class="bv-row"><span>Loss if stopped</span><span class="bv-track"><i class="neg" style="width:${w(risk)}"></i></span><b class="loss">${m0(risk)}</b></div>`;
      read.innerHTML = share > 1 ? `<b class="loss">The position would be ${pct(share, { d: 0 })} of the account:</b> more than you have. Lower the risk per trade, find a setup with a closer stop, or skip it.` : `The position is <b>${pct(share, { d: 0 })}</b> of the account, but a stop-out costs only <b>${rp}%</b>. A run of 10 straight losses would cost about ${pct(1 - Math.pow(1 - rp / 100, 10), { d: 0 })}.`;
    }
    paint();
  };

  /* ---------- three stops compared ---------- */
  V.stopPlacement = function (host, p, ctx) {
    const bars = TA.bars(TA.path([[0, 46], [8, 50.2], [12, 48.2], [15, 50], [20, 49.1], [24, 48.9], [28, 49.6], [40, 53.5], [50, 56], [59, 57]], 60, { seed: 311, noise: 0.0025 }), { seed: 311, wick: 0.004 });
    const E = 15,
      entry = bars[E].c,
      atr = TA.atr(bars, 10)[E] || 0.8;
    const support = Math.min(...bars.slice(8, 14).map((b) => b.l));
    const STOPS = [
      ['Tight: 1.5% below entry', entry * 0.985, 'warn'],
      ['Below support, with a small buffer', support - 0.25 * atr, 'violet'],
      ['2.5 ATRs below entry', entry - 2.5 * atr, 'put'],
    ];
    const res = STOPS.map(([l, s, c]) => {
      let hit = null;
      for (let j = E + 1; j < bars.length; j++)
        if (bars[j].l <= s) {
          hit = j;
          break;
        }
      return { l, s, c, hit, r: hit != null ? -1 : (bars[bars.length - 1].c - entry) / (entry - s) };
    });
    const box = stack(host);
    const tbl = h('div', { class: 'table-wrap' });
    const chart = TA.chart(box, ctx, {
      bars,
      ms: 2600,
      label: 'Three stop placements on the same trade',
      over(P, C, i) {
        if (i <= E) return;
        P.tag('Buy', P.X(E), P.Y(entry), { bg: C.accent, align: 'right', dy: -10 });
        res.forEach((s) => {
          const end = s.hit != null && i > s.hit ? s.hit : 59;
          P.line([[E, s.s], [end, s.s]], { color: C[s.c], width: 2, dash: [5, 4] });
          if (s.hit != null && i > s.hit) P.dot(s.hit, s.s, { color: C[s.c], r: 4 });
        });
      },
      onIndex(i) {
        tbl.innerHTML = `<table class="cmp"><thead><tr><th>Stop</th><th>Price</th><th>Outcome</th><th>Result</th></tr></thead><tbody>${res
          .map((s) => {
            const done = s.hit != null && i > s.hit;
            return `<tr><th><i class="sw sw-${s.c}"></i>${s.l}</th><td>${usd(s.s)}</td><td>${done ? 'Stopped on day ' + (s.hit + 1) : i >= 60 ? 'Held to the end' : 'Open'}</td><td class="${done ? 'loss' : i >= 60 ? 'gain' : ''}">${done ? '−1R' : i >= 60 ? R(s.r) : '…'}</td></tr>`;
          })
          .join('')}</tbody></table>`;
      },
    });
    box.append(tbl, h('p', { class: 'fine' }, 'Each stop risks the same 1% of the account, so wider stops mean fewer shares. Results are in R.'));
    return { play: chart.play, destroy: chart.destroy };
  };

  /* ---------- expectancy grid ---------- */
  V.expectancyGrid = function (host, p, ctx) {
    let w = 0.35,
      rr = 3;
    const sW = slider({ id: ctx.key + '-w', label: 'Win rate', min: 10, max: 90, step: 1, value: 35, fmt: (v) => v + '%', onInput: (v) => ((w = v / 100), paint()) });
    const sR = slider({ id: ctx.key + '-r', label: 'Average win ÷ average loss', min: 0.5, max: 4, step: 0.1, value: 3, fmt: (v) => v.toFixed(1) + ' to 1', onInput: (v) => ((rr = v), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const stats = h('div', { class: 'stats' });
    stack(host, plotEl, sW.el, sR.el, stats);
    const E = (wr, r) => wr * r - (1 - wr);
    const plot = new Plot(plotEl, {
      height: (x) => (x < 480 ? 230 : 270),
      label: 'Expectancy by win rate and reward-to-risk',
      onScrub: (x) => ((rr = Math.round(x * 10) / 10), sR.set(rr), paint()),
      draw(P) {
        const C = pal();
        P.domain(0.5, 4, 0.1, 0.9);
        const nx = 35,
          ny = 32;
        for (let a = 0; a < nx; a++)
          for (let b = 0; b < ny; b++) {
            const r = 0.5 + (3.5 * (a + 0.5)) / nx,
              wr = 0.1 + (0.8 * (b + 0.5)) / ny,
              e = E(wr, r);
            P.rect(0.5 + (3.5 * a) / nx, 0.1 + (0.8 * b) / ny, 0.5 + (3.5 * (a + 1)) / nx, 0.1 + (0.8 * (b + 1)) / ny, alpha(e >= 0 ? C.gain : C.loss, Math.min(0.75, 0.12 + Math.abs(e) * 0.35)));
          }
        P.grid({ xf: (v) => v + ':1', yf: (v) => Math.round(v * 100) + '%', xTicks: [0.5, 1, 2, 3, 4], yTicks: [0.2, 0.4, 0.6, 0.8], zero: false });
        P.line(P.sample((r) => 1 / (1 + r), 0.5, 4, 120), { color: C.ink, width: 2, dash: [5, 4] });
        P.text('Breakeven', P.X(3.3), P.Y(1 / 4.3) - 10, { color: C.ink });
        P.dot(rr, w, { color: C.ink, r: 6 });
      },
    });
    function paint() {
      plot.render();
      const e = E(w, rr);
      stats.replaceChildren(stat('Expectancy per trade', R(e), SS.plClass(e)), stat('Over 100 trades at 1% risk', `about ${pct(e, { sign: true, d: 0 })} of the account`, SS.plClass(e)), stat('Breakeven win rate at this ratio', pct(1 / (1 + rr), { d: 0 })));
    }
    paint();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- same edge, many paths ---------- */
  V.tradePaths = function (host, p, ctx) {
    let w = 0.4,
      rr = 2,
      seed = 5,
      reveal = 1,
      cancel = null;
    const N = 100,
      K = 20,
      risk = 0.01;
    let outcomes = [];
    const roll = () => {
      const r = SS.rng(seed * 997);
      outcomes = Array.from({ length: K }, () => Array.from({ length: N }, () => r()));
    };
    const paths = () =>
      outcomes.map((row) => {
        const s = [100];
        row.forEach((u) => s.push(s[s.length - 1] * (1 + risk * (u < w ? rr : -1))));
        return s;
      });
    roll();
    const plotEl = h('div', { class: 'plot' });
    const sW = slider({ id: ctx.key + '-w', label: 'Win rate', min: 20, max: 70, step: 1, value: 40, fmt: (v) => v + '%', onInput: (v) => ((w = v / 100), update()) });
    const sR = slider({ id: ctx.key + '-r', label: 'Average win ÷ average loss', min: 0.5, max: 4, step: 0.1, value: 2, fmt: (v) => v.toFixed(1) + ' to 1', onInput: (v) => ((rr = v), update()) });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => (seed++, roll(), play()) }, 'New random paths');
    const stats = h('div', { class: 'stats' });
    stack(host, plotEl, h('div', { class: 'ctl-row' }, btn), sW.el, sR.el, stats, h('p', { class: 'fine' }, 'Each line: 100 trades, risking 1% of the account per trade. Starting balance 100.'));
    const plot = new Plot(plotEl, {
      height: (x) => (x < 480 ? 220 : 260),
      label: 'Twenty equity curves from the same strategy',
      draw(P) {
        const C = pal(),
          ps = paths(),
          all = ps.flat();
        P.domain(0, N, Math.min(80, ...all) * 0.98, Math.max(120, ...all) * 1.02);
        P.grid({ xf: (v) => 'T' + v, yf: (v) => String(Math.round(v)) });
        P.hline(100, { color: C.muted, dash: [3, 3] });
        const n = Math.max(1, Math.round(N * reveal));
        ps.forEach((s) => P.line(s.slice(0, n + 1).map((v, i) => [i, v]), { color: s[N] >= 100 ? C.gain : C.loss, width: 1.4, alpha: 0.7 }));
      },
    });
    function update() {
      plot.render();
      const ps = paths(),
        ends = ps.map((s) => s[N]).sort((a, b) => a - b);
      const dd = ps.map((s) => {
        let pk = s[0],
          m = 0;
        s.forEach((v) => ((pk = Math.max(pk, v)), (m = Math.min(m, v / pk - 1))));
        return m;
      });
      const streak = Math.max(
        ...outcomes.map((row) => {
          let c = 0,
            b = 0;
          row.forEach((u) => (u < w ? (c = 0) : (b = Math.max(b, ++c))));
          return b;
        })
      );
      stats.replaceChildren(stat('Median ending balance', ends[K / 2].toFixed(0), SS.plClass(ends[K / 2] - 100)), stat('Best and worst', `${ends[K - 1].toFixed(0)} / ${ends[0].toFixed(0)}`), stat('Typical worst drawdown', pct(dd.sort((a, b) => a - b)[K / 2], { d: 0 }), 'loss'), stat('Longest losing streak seen', String(streak), 'loss'));
    }
    function play() {
      if (cancel) cancel();
      update();
      cancel = tween(1800, (k) => {
        reveal = ease.out(k);
        plot.render();
      });
    }
    update();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- losing streak odds ---------- */
  V.streaks = function (host, p, ctx) {
    let w = 0.4;
    const N = 100,
      RUNS = 3000;
    const plotEl = h('div', { class: 'plot' });
    const sW = slider({ id: ctx.key + '-w', label: 'Win rate', min: 20, max: 80, step: 1, value: 40, fmt: (v) => v + '%', onInput: (v) => ((w = v / 100), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('p', { class: 'plot-h' }, 'Chance of at least one losing streak this long in 100 trades'), plotEl, sW.el, read);
    let probs = [];
    function sim() {
      const r = SS.rng(777),
        longest = new Array(31).fill(0);
      for (let k = 0; k < RUNS; k++) {
        let c = 0,
          b = 0;
        for (let t = 0; t < N; t++) r() < w ? (c = 0) : (b = Math.max(b, ++c));
        longest[Math.min(30, b)]++;
      }
      probs = [];
      let acc = 0;
      for (let n = 30; n >= 1; n--) ((acc += longest[n]), (probs[n] = acc / RUNS));
    }
    const plot = new Plot(plotEl, {
      height: 220,
      label: 'Probability of losing streaks',
      draw(P) {
        const C = pal();
        P.domain(0.4, 15.6, 0, 1);
        P.grid({ xTicks: [1, 3, 5, 7, 9, 11, 13, 15], xf: (v) => v + '+', yf: (v) => Math.round(v * 100) + '%', yTicks: [0, 0.25, 0.5, 0.75, 1] });
        for (let n = 1; n <= 15; n++) P.rect(n - 0.36, 0, n + 0.36, probs[n] || 0, alpha(C.loss, 0.25 + 0.6 * (probs[n] || 0)));
      },
    });
    function update() {
      sim();
      plot.render();
      let typical = 1;
      for (let n = 1; n <= 30; n++) if ((probs[n] || 0) >= 0.5) typical = n;
      read.innerHTML = `With a ${Math.round(w * 100)}% win rate, half of all 100-trade runs include a streak of <b class="loss">${typical} or more</b> losses in a row. A streak of ${typical + 3}+ still happens in ${pct(probs[typical + 3] || 0, { d: 0 })} of runs.`;
    }
    update();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- a simple backtest ---------- */
  V.backtest = function (host, p, ctx) {
    const cs = TA.walk(250, { seed: 321, start: 50, drift: 0.0006, vol: 0.017 });
    let n = 50,
      cost = 0.001;
    const run = () => {
      const ma = TA.sma(cs, n),
        eq = [100],
        bh = [100];
      let pos = 0,
        trades = 0,
        days = 0;
      for (let i = 1; i < cs.length; i++) {
        const r = cs[i] / cs[i - 1] - 1;
        let e = eq[i - 1] * (1 + pos * r);
        const want = ma[i] != null && cs[i] > ma[i] ? 1 : 0;
        if (want !== pos) ((e *= 1 - cost), trades++, (pos = want));
        if (pos) days++;
        eq.push(e);
        bh.push(bh[i - 1] * (1 + r));
      }
      const dd = (s) => {
        let pk = s[0],
          m = 0;
        s.forEach((v) => ((pk = Math.max(pk, v)), (m = Math.min(m, v / pk - 1))));
        return m;
      };
      return { eq, bh, trades, days, ddS: dd(eq), ddB: dd(bh), ma };
    };
    const priceEl = h('div', { class: 'plot' }),
      eqEl = h('div', { class: 'plot' });
    const sN = slider({ id: ctx.key + '-n', label: 'Moving average length', min: 10, max: 100, step: 5, value: n, fmt: (v) => v + ' days', onInput: (v) => ((n = v), update()) });
    const sC = slider({ id: ctx.key + '-c', label: 'Cost per trade (spread, slippage, fees)', min: 0, max: 0.5, step: 0.05, value: 0.1, fmt: (v) => v.toFixed(2) + '%', onInput: (v) => ((cost = v / 100), update()) });
    const stats = h('div', { class: 'stats' });
    stack(host, h('p', { class: 'plot-h' }, 'Price and its moving average (shaded: in the market)'), priceEl, h('p', { class: 'plot-h' }, 'Growth of 100: rule vs buy and hold'), eqEl, sN.el, sC.el, stats, h('p', { class: 'fine' }, 'Simulated prices. Decisions use each day’s close and take effect from the next day, so there is no look-ahead.'));
    const pP = new Plot(priceEl, {
      height: 170,
      label: 'Price with moving average',
      draw(P) {
        const C = pal(),
          r = run();
        P.domain(0, 249, Math.min(...cs) * 0.97, Math.max(...cs) * 1.03);
        P.grid({ noXLabels: true, yf: (v) => '$' + Math.round(v) });
        for (let i = 1; i < cs.length; i++) if (r.ma[i - 1] != null && cs[i - 1] > r.ma[i - 1]) P.rect(i - 0.5, Math.min(...cs) * 0.97, i + 0.5, Math.max(...cs) * 1.03, alpha(C.gain, 0.08));
        P.line(cs.map((v, i) => [i, v]), { color: C.ink, width: 1.5 });
        TA.series(P, r.ma, 250, { color: C.put, width: 2 });
      },
    });
    const pE = new Plot(eqEl, {
      height: 150,
      label: 'Equity curves',
      draw(P) {
        const C = pal(),
          r = run(),
          all = r.eq.concat(r.bh);
        P.domain(0, 249, Math.min(...all) * 0.97, Math.max(...all) * 1.03);
        P.grid({ xf: (v) => 'D' + v, yf: (v) => String(Math.round(v)) });
        P.line(r.bh.map((v, i) => [i, v]), { color: C.stock, width: 2 });
        P.line(r.eq.map((v, i) => [i, v]), { color: C.accent, width: 2.25 });
      },
    });
    function update() {
      pP.render();
      pE.render();
      const r = run(),
        s = r.eq[249] / 100 - 1,
        b = r.bh[249] / 100 - 1;
      stats.replaceChildren(stat('Rule', pct(s, { sign: true, d: 0 }), SS.plClass(s)), stat('Buy and hold', pct(b, { sign: true, d: 0 }), SS.plClass(b)), stat('Trades', String(r.trades)), stat('Time in market', pct(r.days / 249, { d: 0 })), stat('Worst drop: rule vs hold', `${pct(r.ddS, { d: 0 })} / ${pct(r.ddB, { d: 0 })}`, 'loss'));
    }
    update();
    return { destroy: () => (pP.destroy(), pE.destroy()) };
  };

  /* ---------- overfitting ---------- */
  V.overfit = function (host) {
    const LENS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    let seed = 41,
      shown = false,
      cs = [];
    const ruleReturn = (ma, a, b) => {
      let e = 1,
        pos = 0;
      for (let i = a + 1; i <= b; i++) {
        e *= 1 + pos * (cs[i] / cs[i - 1] - 1);
        const want = ma[i] != null && cs[i] > ma[i] ? 1 : 0;
        if (want !== pos) ((e *= 0.999), (pos = want));
      }
      return e - 1;
    };
    let res = [];
    function compute() {
      cs = TA.walk(320, { seed: seed * 131, start: 50, vol: 0.017 });
      res = LENS.map((n) => {
        const ma = TA.sma(cs, n);
        return { n, ins: ruleReturn(ma, 60, 189), out: ruleReturn(ma, 190, 319) };
      });
    }
    compute();
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const bTest = h('button', { type: 'button', class: 'btn sm primary', onclick: () => ((shown = true), paint()) }, 'Test the best one on new data');
    const bNew = h('button', { type: 'button', class: 'btn sm', onclick: () => (seed++, (shown = false), compute(), paint()) }, 'New random chart');
    const bMany = h('button', { type: 'button', class: 'btn sm', onclick: () => many() }, 'Repeat on 50 random charts');
    stack(host, h('p', { class: 'plot-h' }, 'Return of the moving-average rule for each length'), plotEl, h('div', { class: 'ctl-row' }, bTest, bNew, bMany), read, h('p', { class: 'fine' }, 'Prices are pure random walks: there is nothing real to find. Design period: days 60–190. New data: days 190–320.'));
    const plot = new Plot(plotEl, {
      height: (x) => (x < 480 ? 220 : 250),
      label: 'In-sample and out-of-sample returns by moving-average length',
      draw(P) {
        const C = pal(),
          vals = res.flatMap((r) => [r.ins, r.out]),
          m = Math.max(0.1, ...vals.map(Math.abs)) * 1.15;
        P.domain(0, LENS.length, -m, m);
        P.grid({ xTicks: LENS.map((_, i) => i + 0.5), xf: (v) => LENS[Math.floor(v)] + 'd', yf: (v) => Math.round(v * 100) + '%' });
        const best = res.reduce((a, b) => (b.ins > a.ins ? b : a));
        res.forEach((r, i) => {
          const isBest = r === best;
          P.rect(i + 0.12, 0, i + 0.48, r.ins, alpha(isBest ? C.accent : C.stock, isBest ? 0.95 : 0.55));
          if (shown) P.rect(i + 0.52, 0, i + 0.88, r.out, alpha(isBest ? C.warn : C.muted, isBest ? 0.95 : 0.35));
        });
      },
    });
    function paint() {
      plot.render();
      const best = res.reduce((a, b) => (b.ins > a.ins ? b : a));
      read.innerHTML = shown ? `Best in the design period: the <b>${best.n}-day</b> average at <b class="${SS.plClass(best.ins)}">${pct(best.ins, { sign: true, d: 0 })}</b>. On new data, the same setting made <b class="${SS.plClass(best.out)}">${pct(best.out, { sign: true, d: 0 })}</b>. Gray bars show every length on the new data.` : `Searching 12 lengths, the best one, the ${best.n}-day, made ${pct(best.ins, { sign: true, d: 0 })} in the design period. Looks like an edge. Now test it.`;
    }
    function many() {
      const save = seed;
      let sumIn = 0,
        sumOut = 0;
      for (let k = 0; k < 50; k++) {
        seed = 1000 + k;
        compute();
        const best = res.reduce((a, b) => (b.ins > a.ins ? b : a));
        sumIn += best.ins;
        sumOut += best.out;
      }
      seed = save;
      compute();
      shown = true;
      plot.render();
      read.innerHTML = `Across 50 random charts, the best setting averaged <b class="gain">${pct(sumIn / 50, { sign: true, d: 0 })}</b> in the design period but only <b class="${SS.plClass(sumOut)}">${pct(sumOut / 50, { sign: true, d: 0 })}</b> on new data. The “edge” was noise.`;
    }
    paint();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- pre-trade checklist ---------- */
  V.tradeChecklist = function (host) {
    const ITEMS = ['The setup matches one written in my plan', 'There is a clear entry trigger', 'My stop sits where the idea is proven wrong', 'The target offers at least 2 to 1', 'The position risks 1% of the account or less', 'No earnings or major news before my planned exit', 'The stock is liquid: tight spread, solid volume', 'I am within my daily loss limit and calm'];
    const on = ITEMS.map(() => false);
    const ring = h('div', { class: 'ck-ring' }, h('b'), h('span'));
    const list = h(
      'div',
      { class: 'ck-list' },
      ITEMS.map((t, i) =>
        h(
          'button',
          {
            type: 'button',
            class: 'ck-item',
            'aria-pressed': 'false',
            onclick: (e) => {
              on[i] = !on[i];
              e.currentTarget.setAttribute('aria-pressed', String(on[i]));
              paint();
            },
          },
          h('span', { class: 'ck-box', 'aria-hidden': 'true' }),
          t
        )
      )
    );
    const banner = h('p', { class: 'ck-banner', 'aria-live': 'polite' });
    stack(host, h('div', { class: 'ck-wrap' }, ring, banner), list);
    function paint() {
      const n = on.filter(Boolean).length;
      ring.style.setProperty('--p', n / ITEMS.length);
      ring.querySelector('b').textContent = n + '/' + ITEMS.length;
      ring.querySelector('span').textContent = 'checked';
      banner.className = 'ck-banner ' + (n === ITEMS.length ? 'ok' : 'no');
      banner.innerHTML = n === ITEMS.length ? '<b>Ready.</b> Every item checks out. Place the trade exactly as planned.' : `<b>No trade.</b> ${ITEMS.length - n} item${ITEMS.length - n === 1 ? '' : 's'} still unchecked. Skipping is a valid decision.`;
    }
    paint();
  };

  /* ---------- trading journal ---------- */
  V.journal = function (host, p, ctx) {
    const SAMPLE = [
      ['Pullback to support', 50, 48.5, 54.2],
      ['Breakout', 32, 31, 30.9],
      ['Pullback to support', 75, 72, 81.5],
      ['Breakout', 18, 17.2, 17.15],
      ['Reversal pattern', 44, 46, 46.1],
      ['Pullback to support', 61, 59, 64.8],
      ['Breakout', 27, 26, 25.95],
      ['Reversal pattern', 90, 86, 85.6],
    ];
    let rows = SS.store.get('journal', null) || SAMPLE.slice();
    const save = () => SS.store.set('journal', rows);
    const rOf = ([, e, s, x]) => {
      const risk = Math.abs(e - s);
      if (!risk) return 0;
      return ((x - e) * Math.sign(e - s)) / risk;
    };
    const tbl = h('div', { class: 'table-wrap' });
    const stats = h('div', { class: 'stats' });
    const plotEl = h('div', { class: 'plot' });
    const setupSel = h('select', { id: ctx.key + '-setup', class: 'select sm', 'aria-label': 'Setup' }, ['Pullback to support', 'Breakout', 'Reversal pattern', 'Other'].map((s) => h('option', { value: s }, s)));
    const num = (id, ph) => h('input', { id: ctx.key + '-' + id, class: 'input sm', type: 'number', step: '0.01', min: '0', placeholder: ph, 'aria-label': ph });
    const fE = num('e', 'Entry'),
      fS = num('s', 'Stop'),
      fX = num('x', 'Exit');
    const err = h('span', { class: 'fine', 'aria-live': 'polite' });
    const add = h(
      'button',
      {
        type: 'button',
        class: 'btn sm primary',
        onclick: () => {
          const e = +fE.value,
            s = +fS.value,
            x = +fX.value;
          if (!(e > 0 && s > 0 && x > 0) || e === s) return (err.textContent = 'Enter an entry, a stop different from the entry, and an exit.');
          err.textContent = '';
          rows.push([setupSel.value, e, s, x]);
          fE.value = fS.value = fX.value = '';
          save();
          paint();
        },
      },
      'Add trade'
    );
    const reset = h('button', { type: 'button', class: 'btn sm ghost', onclick: () => ((rows = SAMPLE.slice()), save(), paint()) }, 'Reset to sample');
    stack(host, stats, h('p', { class: 'plot-h' }, 'Cumulative result in R'), plotEl, tbl, h('div', { class: 'jr-form' }, setupSel, fE, fS, fX, add, reset), err);
    const plot = new Plot(plotEl, {
      height: 140,
      label: 'Cumulative R',
      draw(P) {
        const C = pal(),
          cum = [0];
        rows.forEach((r) => cum.push(cum[cum.length - 1] + rOf(r)));
        const lo = Math.min(-1, ...cum),
          hi = Math.max(1, ...cum);
        P.domain(0, Math.max(1, rows.length), lo * 1.15, hi * 1.15);
        P.grid({ xf: (v) => '#' + Math.round(v), yf: (v) => v.toFixed(0) + 'R', xTicks: SS.niceTicks(0, Math.max(1, rows.length), 6).filter((t) => t % 1 === 0) });
        const pts = cum.map((v, i) => [i, v]);
        P.fillPL(pts, 0.18);
        P.line(pts, { color: C.accent, width: 2.5 });
      },
    });
    function paint() {
      plot.render();
      const rs = rows.map(rOf),
        wins = rs.filter((r) => r > 0),
        losses = rs.filter((r) => r <= 0);
      const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
      const exp = avg(rs);
      stats.replaceChildren(stat('Trades', String(rows.length)), stat('Win rate', rows.length ? pct(wins.length / rows.length, { d: 0 }) : '—'), stat('Average win / loss', `${R(avg(wins))} / ${R(avg(losses))}`), stat('Expectancy', R(exp), SS.plClass(exp)));
      const bySetup = {};
      rows.forEach((r) => ((bySetup[r[0]] = bySetup[r[0]] || []), bySetup[r[0]].push(rOf(r))));
      tbl.innerHTML = `<table class="cmp jr"><thead><tr><th>#</th><th>Setup</th><th>Entry</th><th>Stop</th><th>Exit</th><th>Result</th><th></th></tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td><th>${r[0]}</th><td>${usd(r[1])}</td><td>${usd(r[2])}</td><td>${usd(r[3])}</td><td class="${SS.plClass(rOf(r))}"><b>${R(rOf(r))}</b></td><td><button type="button" class="icon-btn" data-del="${i}" aria-label="Delete trade ${i + 1}">×</button></td></tr>`).join('')}</tbody></table><p class="fine">By setup: ${Object.keys(bySetup)
        .map((k) => `${k} ${R(avg(bySetup[k]))} avg over ${bySetup[k].length}`)
        .join(' · ')}</p>`;
    }
    tbl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-del]');
      if (!b) return;
      rows.splice(+b.dataset.del, 1);
      save();
      paint();
    });
    paint();
    return { destroy: () => plot.destroy() };
  };
})();
