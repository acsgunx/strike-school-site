/* Pivot Point Trading, Unit 1 visuals: pivot calculator, intraday pivot days, CPR builder, CPR width. */
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
  /** Inputs for "yesterday": high, low, and where the close sat in the range. */
  function yesterdayInputs(ctx, o, onChange) {
    const st = { h: o.h || 102, l: o.l || 98, pos: o.pos == null ? 0.75 : o.pos };
    const close = () => st.l + (st.h - st.l) * st.pos;
    const sH = slider({ id: ctx.key + '-h', label: 'Yesterday’s high', min: 100, max: 110, step: 0.25, value: st.h, fmt: (v) => usd(v), onInput: (v) => ((st.h = v), onChange()) });
    const sL = slider({ id: ctx.key + '-l', label: 'Yesterday’s low', min: 90, max: 100, step: 0.25, value: st.l, fmt: (v) => usd(v), onInput: (v) => ((st.l = v), onChange()) });
    const sC = slider({ id: ctx.key + '-c', label: 'Where it closed in the range', min: 0, max: 100, step: 1, value: st.pos * 100, fmt: (v) => `${v}% up · ${usd(st.l + ((st.h - st.l) * v) / 100)}`, onInput: (v) => ((st.pos = v / 100), onChange()) });
    return {
      st,
      els: o.only === 'close' ? [sC.el] : [sH.el, sL.el, sC.el],
      ohlc: () => ({ h: st.h, l: st.l, c: close() }),
      refresh: () => sC.set(st.pos * 100),
    };
  }
  function drawCandle(P, C, x, y, wpx) {
    const up = y.c >= (y.o == null ? (y.h + y.l) / 2 : y.o),
      col = up ? C.gain : C.loss,
      X = P.X(x),
      k = P.c,
      o = y.o == null ? (y.h + y.l) / 2 - (y.c - (y.h + y.l) / 2) * 0.35 : y.o;
    k.save();
    k.strokeStyle = col;
    k.lineWidth = 2.5;
    k.beginPath();
    k.moveTo(X, P.Y(y.h));
    k.lineTo(X, P.Y(y.l));
    k.stroke();
    k.fillStyle = col;
    k.fillRect(X - wpx / 2, P.Y(Math.max(o, y.c)), wpx, Math.max(3, P.Y(Math.min(o, y.c)) - P.Y(Math.max(o, y.c))));
    k.restore();
  }
  // Shared with later pivot units.
  PV.yesterdayInputs = yesterdayInputs;
  PV.drawCandle = drawCandle;

  /* ---------- pivot calculator ---------- */
  V.pivotCalc = function (host, p, ctx) {
    let reveal = 1,
      shown = null,
      cancel = null,
      glide = null;
    const formulas = h('div', { class: 'pv-formulas', 'aria-live': 'polite' });
    const plotEl = h('div', { class: 'plot' });
    const inp = yesterdayInputs(ctx, {}, () => update(true));
    shown = PV.floor(inp.ohlc());
    stack(host, plotEl, ...inp.els, formulas);
    const names = ['R3', 'R2', 'R1', 'P', 'S1', 'S2', 'S3'];
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 300 : 340),
      pad: { l: 10, r: 10, t: 14, b: 22 },
      label: 'Yesterday’s candle and today’s pivot levels',
      draw(P) {
        const C = pal(),
          y = inp.ohlc(),
          L = shown;
        const vals = names.map((n) => L[n]).concat([y.h, y.l]);
        const lo = Math.min(...vals),
          hi = Math.max(...vals),
          pad = (hi - lo) * 0.06;
        P.domain(0, 10, lo - pad, hi + pad);
        P.rect(3, lo - pad, 10, hi + pad, alpha(C.accent, 0.04));
        P.text('Yesterday', P.X(1.4), P.h - 8, { color: C.muted });
        P.text('Today', P.X(6.5), P.h - 8, { color: C.muted });
        drawCandle(P, C, 1.4, y, Math.min(34, P.w * 0.07));
        [['H', y.h], ['L', y.l], ['C', y.c]].forEach(([n, v]) => P.text(n + ' ' + usd(v), P.X(2.1), P.Y(v), { align: 'left', color: C.ink }));
        PV.drawLevels(
          P,
          names.map((n) => ({ name: n, v: L[n], width: n === 'P' ? 2.5 : 1.75, dash: n === 'P' ? null : [6, 4] })),
          { x0: 3.1, x1: 3.1 + 6.8 * reveal }
        );
      },
    });
    function update(animate) {
      const target = PV.floor(inp.ohlc());
      if (glide) glide();
      if (!shown || !animate) shown = target;
      else {
        const from = Object.assign({}, shown);
        glide = tween(260, (k) => {
          shown = {};
          for (const n of names) shown[n] = from[n] + (target[n] - from[n]) * ease.out(k);
          plot.render();
        });
      }
      plot.render();
      const y = inp.ohlc(),
        T = target;
      const rows = [
        ['P', '(H + L + C) ÷ 3', `(${y.h.toFixed(2)} + ${y.l.toFixed(2)} + ${y.c.toFixed(2)}) ÷ 3`, T.P],
        ['R1', '2 × P − L', `2 × ${T.P.toFixed(2)} − ${y.l.toFixed(2)}`, T.R1],
        ['S1', '2 × P − H', `2 × ${T.P.toFixed(2)} − ${y.h.toFixed(2)}`, T.S1],
        ['R2', 'P + (H − L)', `${T.P.toFixed(2)} + ${(y.h - y.l).toFixed(2)}`, T.R2],
        ['S2', 'P − (H − L)', `${T.P.toFixed(2)} − ${(y.h - y.l).toFixed(2)}`, T.S2],
        ['R3', 'H + 2 × (P − L)', `${y.h.toFixed(2)} + 2 × ${(T.P - y.l).toFixed(2)}`, T.R3],
        ['S3', 'L − 2 × (H − P)', `${y.l.toFixed(2)} − 2 × ${(y.h - T.P).toFixed(2)}`, T.S3],
      ];
      formulas.innerHTML = p.formulas
        ? `<div class="table-wrap"><table class="cmp pv-tbl"><tbody>${rows.map(([n, f, w, v]) => `<tr><th class="lv-${n[0]}">${n}</th><td>${f}</td><td>${w}</td><td><b>${usd(v)}</b></td></tr>`).join('')}</tbody></table></div>`
        : `<div class="stats">${['R1', 'P', 'S1'].map((n) => `<div class="stat"><span class="stat-l">${n}</span><span class="stat-v lv-${n[0]}">${usd(T[n])}</span></div>`).join('')}</div>`;
    }
    update(false);
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(1300, (k) => {
          reveal = Math.max(0.01, ease.out(k));
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), glide && glide(), plot.destroy()),
    };
  };

  /* ---------- intraday days around the levels ---------- */
  const Y1 = { h: 102, l: 98, c: 101 };
  const SCEN = {
    above: { label: 'Opens above the pivot', y: Y1, a: (F) => [[0, 101.2], [10, 100.8], [18, 101.9], [30, 101.1], [45, 102.2], [60, 101.6], [77, 102.3]], end: 'Price opened above the pivot and never closed below it: buyers were in control all day.' },
    below: { label: 'Opens below the pivot', y: Y1, a: () => [[0, 99.6], [12, 100.05], [20, 99.2], [35, 99.75], [50, 98.95], [65, 99.3], [77, 98.85]], end: 'Every rally stalled below the pivot: sellers were in control.' },
    inside: { label: 'Chops inside the CPR', y: Y1, a: () => [[0, 100.4], [10, 100.62], [20, 100.08], [30, 100.56], [40, 100.04], [50, 100.5], [60, 100.12], [77, 100.36]], end: 'Price never escaped the central pivot range: an undecided, balanced day.' },
    range: { label: 'Range day', y: Y1, a: () => [[0, 100.6], [14, 98.74], [24, 99.8], [38, 102.6], [50, 101.1], [62, 98.76], [72, 100.2], [77, 100.5]], end: 'A classic range day: buyers defended S1 twice and sellers defended R1. Fading the edges worked.' },
    trend: { label: 'Trend day', y: Y1, a: () => [[0, 100.9], [10, 101.5], [22, 102.95], [30, 102.75], [42, 104.55], [50, 104.38], [62, 105.7], [77, 106.2]], end: 'A trend day: R1 and R2 both broke, and each one held as support on the pullback. Fading this day would have hurt.' },
    cprtest: { label: 'Dip to the CPR holds', y: Y1, a: (F, Cp) => [[0, 101.3], [12, Cp.top + 0.08], [16, Cp.top + 0.05], [30, 101.8], [44, 102.4], [60, 101.7], [77, 102.2]], end: 'Price dipped to the top of the CPR, found buyers and rallied: the zone acted as support.' },
    narrow: { label: 'After a narrow CPR', y: { h: 102, l: 98, c: 100.1 }, a: () => [[0, 100.1], [10, 100.6], [25, 101.8], [40, 102.4], [55, 103.6], [77, 104.5]], end: 'After a narrow CPR, the day trended: it left the tiny balance zone and kept going.' },
    wide: { label: 'After a wide CPR', y: { h: 102, l: 98, c: 101.9 }, a: () => [[0, 101.5], [15, 100.45], [30, 101.6], [45, 100.25], [60, 101.3], [77, 100.85]], end: 'After a wide CPR, the day rotated sideways, mostly inside the zone.' },
  };
  V.pivotDay = function (host, p, ctx) {
    const set = p.set || ['range'];
    let key = set[0],
      chart = null;
    const sg = set.length > 1 ? seg({ label: 'Day', options: set.map((k) => ({ v: k, label: SCEN[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) }) : null;
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const info = h('div', { class: 'stats' });
    stack(host, sg ? sg.el : null, info, holder, read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const sc = SCEN[key],
        F = PV.floor(sc.y),
        Cp = PV.cpr(sc.y);
      const bars = PV.session(sc.a(F, Cp), { seed: 7 + set.indexOf(key) });
      const names = p.cpr ? ['R2', 'R1', 'S1', 'S2'] : ['R3', 'R2', 'R1', 'P', 'S1', 'S2', 'S3'];
      const lo = Math.min(...bars.map((b) => b.l)),
        hi = Math.max(...bars.map((b) => b.h));
      let levels = names.map((n) => ({ name: n, v: F[n] }));
      if (p.cpr) levels = levels.concat([{ name: 'TC', v: Cp.TC, color: pal().accent }, { name: 'P', v: Cp.P }, { name: 'BC', v: Cp.BC, color: pal().accent }]);
      const above = levels.filter((L) => L.v > hi).sort((a, b) => a.v - b.v)[0],
        below = levels.filter((L) => L.v < lo).sort((a, b) => b.v - a.v)[0];
      const y0 = Math.min(lo, below ? below.v : lo),
        y1 = Math.max(hi, above ? above.v : hi);
      const vis = levels.filter((L) => L.v >= y0 - 1e-9 && L.v <= y1 + 1e-9);
      const reacts = PV.reactions(bars, vis.filter((L) => L.name !== 'BC' && L.name !== 'TC').concat(p.cpr ? [{ name: 'CPR top', v: Cp.top }] : []));
      info.replaceChildren(stat('Yesterday H / L / C', `${usd(sc.y.h)} / ${usd(sc.y.l)} / ${usd(sc.y.c)}`), p.cpr ? stat('CPR width', pct(Cp.width / Cp.P, { d: 2 }), Cp.width / Cp.P < 0.0025 ? 'accent' : '') : stat('Pivot', usd(F.P), 'accent'));
      chart = TA.chart(holder, ctx, {
        bars,
        yRange: [y0 - (y1 - y0) * 0.06, y1 + (y1 - y0) * 0.08],
        pad: { l: 50, r: 92 },
        xTicks: PV.TICKS,
        xf: PV.clock,
        yf: PV.yf,
        dayFmt: (v) => PV.clock(v - 1),
        sliderLabel: 'Time',
        ms: 3400,
        label: sc.label + ' with pivot levels',
        under(P, C) {
          if (p.cpr) PV.drawZone(P, Cp.bot, Cp.top, C.accent, 0.16);
        },
        over(P, C, i) {
          PV.drawLevels(P, vis);
          reacts
            .filter((r) => r.i < i)
            .forEach((r, k, arr) => {
              const up = r.kind === 'bounce' || r.kind === 'break-up';
              P.dot(r.i, up ? bars[r.i].l : bars[r.i].h, { color: up ? C.gain : C.loss, r: 4 });
              if (k === arr.length - 1) P.tag(PV.reactionLabel(r), P.X(r.i), P.Y(up ? bars[r.i].l : bars[r.i].h), { bg: up ? C.gain : C.loss, dy: up ? 8 : -30, size: 10.5 });
            });
        },
        onIndex(i) {
          const seen = reacts.filter((r) => r.i < i);
          read.innerHTML = i >= bars.length ? sc.end : seen.length ? `${PV.clock(seen[seen.length - 1].i)}: ${PV.reactionLabel(seen[seen.length - 1])} (${usd(seen[seen.length - 1].L.v)}).` : `${PV.clock(i - 1)}: price ${usd(bars[i - 1].c)}.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- CPR builder ---------- */
  V.cprBuild = function (host, p, ctx) {
    const plotEl = h('div', { class: 'plot' });
    const out = h('div', { class: 'pv-formulas', 'aria-live': 'polite' });
    const inp = yesterdayInputs(ctx, { pos: 0.75 }, () => paint());
    let reveal = 1,
      cancel = null;
    stack(host, plotEl, ...inp.els, out);
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 260 : 300),
      pad: { l: 10, r: 10, t: 14, b: 22 },
      label: 'Building the central pivot range',
      draw(P) {
        const C = pal(),
          y = inp.ohlc(),
          Cp = PV.cpr(y);
        const lo = y.l - (y.h - y.l) * 0.15,
          hi = y.h + (y.h - y.l) * 0.15;
        P.domain(0, 10, lo, hi);
        P.text('Yesterday', P.X(1.4), P.h - 8, { color: C.muted });
        P.text('Today', P.X(6.5), P.h - 8, { color: C.muted });
        drawCandle(P, C, 1.4, y, Math.min(34, P.w * 0.07));
        P.line([[0.6, (y.h + y.l) / 2], [2.2, (y.h + y.l) / 2]], { color: C.muted, width: 1, dash: [2, 3] });
        P.text('midpoint', P.X(2.3), P.Y((y.h + y.l) / 2), { align: 'left', color: C.muted, weight: 500 });
        const x1 = 3.1 + 6.8 * reveal;
        PV.drawZone(P, Cp.bot, Cp.top, C.accent, 0.2, 3.1, x1);
        PV.drawLevels(P, [{ name: 'TC', v: Cp.TC, color: C.accent }, { name: 'P', v: Cp.P, width: 2.5, dash: null }, { name: 'BC', v: Cp.BC, color: C.accent }], { x0: 3.1, x1 });
      },
    });
    function paint() {
      plot.render();
      const y = inp.ohlc(),
        Cp = PV.cpr(y);
      out.innerHTML = `<div class="table-wrap"><table class="cmp pv-tbl"><tbody>
        <tr><th>P</th><td>(H + L + C) ÷ 3</td><td><b>${usd(Cp.P)}</b></td></tr>
        <tr><th>BC</th><td>(H + L) ÷ 2</td><td><b>${usd(Cp.BC)}</b></td></tr>
        <tr><th>TC</th><td>2 × P − BC</td><td><b>${usd(Cp.TC)}</b></td></tr></tbody></table></div>
        <p class="readout">${Cp.TC >= Cp.BC ? 'Yesterday closed above its midpoint, so TC sits above BC.' : 'Yesterday closed below its midpoint, so TC sits below BC. The zone is the same, just flipped.'} Width: <b>${usd(Cp.width)}</b> (${pct(Cp.width / Cp.P, { d: 2 })} of price).</p>`;
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

  /* ---------- what sets CPR width ---------- */
  V.cprWidth = function (host, p, ctx) {
    const plotEl = h('div', { class: 'plot' });
    const big = h('div', { class: 'eps-big', 'aria-live': 'polite' });
    const inp = yesterdayInputs(ctx, { pos: 0.5, only: 'close' }, () => paint());
    let cancel = null;
    stack(host, big, plotEl, ...inp.els, h('p', { class: 'fine' }, 'Yesterday’s high and low are fixed at $102 and $98. Only the close moves.'));
    const plot = new Plot(plotEl, {
      height: 240,
      pad: { l: 10, r: 10, t: 12, b: 12 },
      label: 'CPR width changing with the close',
      draw(P) {
        const C = pal(),
          y = inp.ohlc(),
          Cp = PV.cpr(y);
        P.domain(0, 10, 97.4, 102.6);
        drawCandle(P, C, 1.4, y, 30);
        P.line([[0.6, 100], [2.2, 100]], { color: C.muted, width: 1, dash: [2, 3] });
        PV.drawZone(P, Cp.bot, Cp.top, C.accent, 0.25, 3.1, 9.9);
        PV.drawLevels(P, [{ name: 'TC', v: Cp.TC, color: C.accent }, { name: 'BC', v: Cp.BC, color: C.accent }], { x0: 3.1, x1: 9.9, values: false });
      },
    });
    function paint() {
      plot.render();
      const y = inp.ohlc(),
        Cp = PV.cpr(y),
        w = Cp.width / Cp.P;
      const kind = w < 0.0025 ? ['Narrow', 'gain', 'A balanced day: a possible trending day ahead.'] : w > 0.0075 ? ['Wide', 'loss', 'An extreme close: often a quieter, sideways day ahead.'] : ['Moderate', '', 'Neither especially narrow nor wide.'];
      big.innerHTML = `<span class="duo-l">CPR width = |2C − H − L| ÷ 3</span><b class="${kind[1]}">${usd(Cp.width)}</b><span>${pct(w, { d: 2 })} of price · <b>${kind[0]}</b>. ${kind[2]}</span>`;
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(2600, (k) => {
          inp.st.pos = 0.5 + 0.5 * Math.sin(k * Math.PI * 1.5);
          inp.refresh();
          paint();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- width compared with recent days ---------- */
  V.cprHistory = function (host, p, ctx) {
    const daily = TA.bars(TA.walk(45, { seed: 404, start: 100, vol: 0.013 }), { seed: 404, wick: 0.008 });
    const widths = daily.map((b, i) => (i === 0 ? null : PV.cpr(daily[i - 1]).width / PV.cpr(daily[i - 1]).P));
    let day = 44;
    const sl = slider({ id: ctx.key + '-d', label: 'Day', min: 21, max: 44, step: 1, value: day, fmt: (v) => 'Day ' + v, onInput: (v) => ((day = v), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, sl.el, read, h('p', { class: 'fine' }, 'Simulated daily prices.'));
    const plot = new Plot(plotEl, {
      height: 200,
      label: 'CPR width for the selected day and the 20 before it',
      draw(P) {
        const C = pal(),
          win = widths.slice(day - 20, day + 1),
          mx = Math.max(...win) * 1.15;
        P.domain(-0.6, 20.6, 0, mx);
        P.grid({ xTicks: [0, 5, 10, 15, 20], xf: (v) => 'D' + (day - 20 + Math.round(v)), yf: (v) => (v * 100).toFixed(1) + '%', yTicks: SS.niceTicks(0, mx, 3) });
        win.forEach((w, k) => P.rect(k - 0.36, 0, k + 0.36, w, k === 20 ? C.accent : alpha(C.stock, 0.55)));
      },
    });
    function paint() {
      plot.render();
      const prior = widths.slice(day - 20, day),
        w = widths[day];
      const rank = prior.filter((x) => x < w).length;
      read.innerHTML = `Day ${day}: CPR width <b>${pct(w, { d: 2 })}</b> of price. It is narrower than <b>${20 - rank}</b> of the previous 20 days${rank <= 2 ? ': one of the narrowest, a possible trend-day setup.' : rank >= 18 ? ': one of the widest, a possible range day.' : '.'}`;
    }
    paint();
    return { destroy: () => plot.destroy() };
  };
})();
