/* Pivot Point Trading, Unit 3 visuals: the Camarilla calculator, width compared with the CPR, the playbook by open,
   fade and breakout replays, two-day Camarilla relationships, confluence with floor pivots, and a play-calling quiz. */
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

  const CAM = ['H4', 'H3', 'H2', 'H1', 'L1', 'L2', 'L3', 'L4'];
  const MAIN = ['H4', 'H3', 'L3', 'L4'];
  const DIV = { H4: 2, H3: 4, H2: 6, H1: 12, L1: 12, L2: 6, L3: 4, L4: 2 };
  /** Labels for a ladder column, nudged apart so close levels stay readable. */
  function columnLabels(P, items, x, align) {
    const rows = items.map((L) => ({ L, y: P.Y(L.v) - 8 })).sort((a, b) => a.y - b.y);
    for (let k = 1; k < rows.length; k++) if (rows[k].y - rows[k - 1].y < 11) rows[k].y = rows[k - 1].y + 11;
    rows.forEach(({ L, y }) => P.text(L.n + ' ' + L.v.toFixed(2), P.X(x), y, { align, color: L.color, size: 9.5 }));
  }
  const camLevels = (K) => CAM.map((n) => (MAIN.includes(n) ? { name: n, v: K[n], width: 2.25, dash: null } : { name: n, v: K[n], width: 1.25, dash: [3, 4], alpha: 0.55 }));

  /* ---------- the calculator, with formulas or next to floor pivots ---------- */
  V.camCalc = function (host, p, ctx) {
    let reveal = 1,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const out = h('div', { class: 'pv-formulas', 'aria-live': 'polite' });
    const inp = PV.yesterdayInputs(ctx, {}, () => paint());
    stack(host, plotEl, ...inp.els, out);
    const plot = new Plot(plotEl, {
      height: (w) => (p.compare ? (w < 480 ? 340 : 380) : w < 480 ? 300 : 340),
      pad: { l: 10, r: 10, t: p.compare ? 26 : 14, b: 22 },
      label: p.compare ? 'Floor pivots and Camarilla levels side by side' : 'Yesterday’s candle and today’s Camarilla levels',
      draw(P) {
        const C = pal(),
          y = inp.ohlc(),
          K = PV.camarilla(y),
          F = PV.floor(y);
        const vals = (p.compare ? [F.R2, F.S2] : []).concat([K.H4, K.L4, y.h, y.l]);
        const lo = Math.min(...vals),
          hi = Math.max(...vals),
          pd = (hi - lo) * 0.06;
        P.domain(0, 10, lo - pd, hi + pd);
        P.text('Yesterday', P.X(1.2), P.h - 8, { color: C.muted });
        PV.drawCandle(P, C, 1.2, y, Math.min(30, P.w * 0.065));
        if (!p.compare) {
          const x1 = 3.1 + 6.8 * reveal;
          P.text('Today', P.X(6.5), P.h - 8, { color: C.muted });
          PV.drawLevels(P, camLevels(K).filter((L) => !MAIN.includes(L.name)), { x0: 3.1, x1, labels: false });
          PV.drawLevels(P, camLevels(K).filter((L) => MAIN.includes(L.name)).concat([{ name: 'Close', v: y.c, color: C.ink, dash: [2, 3], width: 1.25 }]), { x0: 3.1, x1 });
          return;
        }
        // Two ladders: floor pivots, then Camarilla.
        const cols = [
          ['Floor pivots', 2.6, 6.0, ['R2', 'R1', 'P', 'S1', 'S2'].map((n) => ({ n, v: F[n], color: PV.levelColor(n, C), w: n === 'P' ? 2.5 : 1.75 }))],
          ['Camarilla', 6.4, 9.8, MAIN.map((n) => ({ n, v: K[n], color: PV.levelColor(n, C), w: 2.25 })).concat([{ n: 'C', v: y.c, color: C.ink, w: 1.25 }])],
        ];
        cols.forEach(([title, x0, x1, items], j) => {
          const a = Math.max(0, Math.min(1, reveal * 2 - j));
          P.text(title, P.X((x0 + x1) / 2), 13, { color: C.ink });
          if (a <= 0) return;
          items.forEach((L) => P.line([[x0, L.v], [x0 + (x1 - x0) * a, L.v]], { color: L.color, width: L.w, dash: L.n === 'C' ? [2, 3] : null }));
          if (a >= 1) columnLabels(P, items, x0, 'left');
          if (j === 1 && a >= 1) CAM.filter((n) => !MAIN.includes(n)).forEach((n) => P.line([[x0, K[n]], [x1, K[n]]], { color: PV.levelColor(n, C), width: 1, dash: [2, 4], alpha: 0.5 }));
        });
      },
    });
    function paint() {
      plot.render();
      const y = inp.ohlc(),
        K = PV.camarilla(y),
        F = PV.floor(y),
        r = 1.1 * (y.h - y.l);
      if (p.formulas) {
        out.innerHTML = `<div class="table-wrap"><table class="cmp pv-tbl"><tbody>${CAM.map((n) => {
          const sign = n[0] === 'H' ? '+' : '−';
          return `<tr><th class="lv-${n[0] === 'H' ? 'R' : 'S'}">${n}</th><td>C ${sign} 1.1 × (H − L) ÷ ${DIV[n]}</td><td>${y.c.toFixed(2)} ${sign} ${r.toFixed(2)} ÷ ${DIV[n]}</td><td><b>${usd(K[n])}</b></td></tr>`;
        }).join('')}</tbody></table></div>`;
      } else if (p.compare) {
        out.innerHTML = `<p class="readout">Floor pivots center on P (<b>${usd(F.P)}</b>) and run from S2 ${usd(F.S2)} to R2 ${usd(F.R2)}. The Camarilla centers on the close (<b>${usd(y.c)}</b>), and its main levels run from L4 ${usd(K.L4)} to H4 ${usd(K.H4)}: <b>${Math.round(((K.H4 - K.L4) / (F.R2 - F.S2)) * 100)}%</b> of the floor span.</p>`;
      } else {
        out.innerHTML = `<div class="stats">${MAIN.map((n) => `<div class="stat"><span class="stat-l">${n}</span><span class="stat-v lv-${n[0] === 'H' ? 'R' : 'S'}">${usd(K[n])}</span></div>`).join('')}</div>`;
      }
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(1300, (k) => {
          reveal = Math.max(0.01, ease.out(k));
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- Camarilla width against CPR width ---------- */
  V.camWidth = function (host, p, ctx) {
    let cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const inp = PV.yesterdayInputs(ctx, { pos: 0.75 }, () => paint());
    stack(host, info, plotEl, ...inp.els, read);
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 250 : 290),
      pad: { l: 10, r: 10, t: 14, b: 22 },
      label: 'The CPR and the Camarilla range for the same day',
      draw(P) {
        const C = pal(),
          y = inp.ohlc(),
          K = PV.camarilla(y),
          z = PV.cpr(y);
        const lo = Math.min(y.l, K.L3),
          hi = Math.max(y.h, K.H3),
          pd = (hi - lo) * 0.08;
        P.domain(0, 10, lo - pd, hi + pd);
        PV.drawCandle(P, C, 1.2, y, Math.min(30, P.w * 0.065));
        P.text('Yesterday', P.X(1.2), P.h - 8, { color: C.muted });
        PV.cprBox(P, z, 3, 5.8, C.accent);
        P.text('CPR', P.X(4.4), P.h - 8, { color: C.accent });
        PV.cprBox(P, { bot: K.L3, top: K.H3 }, 6.8, 9.6, C.violet, 0.18);
        P.text('L3 to H3', P.X(8.2), P.h - 8, { color: C.violet });
        P.line([[2.2, y.c], [9.8, y.c]], { color: C.ink, width: 1, dash: [2, 3], alpha: 0.7 });
      },
    });
    function paint() {
      plot.render();
      const y = inp.ohlc(),
        K = PV.camarilla(y),
        z = PV.cpr(y),
        rg = y.h - y.l;
      info.replaceChildren(stat('Yesterday’s range', usd(rg)), stat('CPR width', `${usd(z.width)} · ${pct(z.width / z.P, { d: 2 })}`, 'accent'), stat('L3 to H3', `${usd(K.H3 - K.L3)} · ${pct((K.H3 - K.L3) / y.c, { d: 2 })}`));
      read.innerHTML = `L3 to H3 = 0.55 × ${usd(rg)} = <b>${usd(K.H3 - K.L3)}</b>, wherever the close sits. The CPR is <b>${usd(z.width)}</b> wide because yesterday closed ${Math.round(inp.st.pos * 100)}% of the way up its range.`;
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        const p0 = inp.st.pos;
        cancel = tween(2600, (k) => {
          inp.st.pos = 0.5 + 0.5 * Math.sin(k * Math.PI * 1.5);
          if (k >= 1) inp.st.pos = p0;
          inp.refresh();
          paint();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- the playbook by where price opens ---------- */
  const Y = { h: 102, l: 98, c: 101 };
  const zoneOf = (K, v) => (v > K.H4 ? 'aboveH4' : v > K.H3 ? 'H3H4' : v >= K.L3 ? 'range' : v >= K.L4 ? 'L3L4' : 'belowL4');
  const ZONES = {
    aboveH4: ['Trend zone', 'gain', (K) => `Opened above H4: a possible trend day up. Buy pullbacks that hold H4 (${usd(K.H4)}); the idea fails on a close back below H3 (${usd(K.H3)}).`],
    H3H4: ['Decision zone', 'pv-warn', (K) => `Opened between H3 and H4: wait for a decision. A close above H4 (${usd(K.H4)}) is a breakout buy. A drop back below H3 (${usd(K.H3)}) turns it into a fade toward the middle.`],
    range: ['Range zone', 'accent', (K) => `Opened inside the range: the classic fade setup. Sell rejections at H3 (${usd(K.H3)}) and buy bounces at L3 (${usd(K.L3)}), aiming for the middle, with stops beyond H4 and L4.`],
    L3L4: ['Decision zone', 'pv-warn', (K) => `Opened between L3 and L4: wait for a decision. A close below L4 (${usd(K.L4)}) is a breakdown short. A move back above L3 (${usd(K.L3)}) turns it into a fade toward the middle.`],
    belowL4: ['Trend zone', 'loss', (K) => `Opened below L4: a possible trend day down. Sell bounces that fail at L4 (${usd(K.L4)}); the idea fails on a close back above L3 (${usd(K.L3)}).`],
  };
  V.camPlaybook = function (host, p, ctx) {
    const K = PV.camarilla(Y);
    let open = 101.2,
      cancel = null;
    const sl = slider({ id: ctx.key + '-o', label: 'Where price opens', min: 98, max: 104.2, step: 0.05, value: open, fmt: (v) => usd(v), onInput: (v) => (stop(), (open = v), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, plotEl, sl.el, read, h('p', { class: 'fine' }, 'Yesterday: high $102, low $98, close $101.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 300 : 340),
      pad: { l: 10, r: 10, t: 12, b: 12 },
      label: 'Camarilla zones and where price opens',
      draw(P) {
        const C = pal(),
          z = zoneOf(K, open);
        P.domain(0, 10, 97.7, 104.5);
        const bands = [[104.5, K.H4, 'aboveH4', C.gain], [K.H4, K.H3, 'H3H4', C.warn], [K.H3, K.L3, 'range', C.accent], [K.L3, K.L4, 'L3L4', C.warn], [K.L4, 97.7, 'belowL4', C.loss]];
        bands.forEach(([t, b, k, col]) => {
          P.rect(0, b, 10, t, alpha(col, k === z ? 0.26 : 0.08));
          P.text(ZONES[k][0], P.X(0.25), P.Y((t + b) / 2), { align: 'left', color: k === z ? col : C.muted, weight: k === z ? 700 : 600 });
        });
        PV.drawLevels(P, MAIN.map((n) => ({ name: n, v: K[n], width: 2 })).concat([{ name: 'Close', v: Y.c, color: C.ink, dash: [2, 3], width: 1.25 }]), { x0: 4.2, x1: 10 });
        P.dot(5.4, open, { color: C.ink, r: 5 });
        P.tag('Open ' + usd(open), P.X(5.4), P.Y(open), { dy: -32, bg: C.ink, size: 10.5 });
      },
    });
    function paint() {
      plot.render();
      const z = ZONES[zoneOf(K, open)];
      read.innerHTML = `<b class="${z[1]}">${z[0]}</b>. ${z[2](K)}`;
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    paint();
    return {
      play() {
        stop();
        const path = [101.2, 103.9, 102.6, 101.2, 99.4, 98.3, 101.2];
        cancel = tween(5200, (k) => {
          const t = k * (path.length - 1),
            j = Math.min(path.length - 2, Math.floor(t));
          open = path[j] + (path[j + 1] - path[j]) * ease.inOut(t - j);
          sl.set(open);
          paint();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- fade and breakout days ---------- */
  const PLAYS = {
    fadeH3: { label: 'Fade at H3', seed: 72, side: -1, lv: 'H3', kind: 'reject', stop: 'H4', on: 'touch', tgt: 'C', a: [[0, 101.1], [8, 101.5], [18, 102.0], [21, 102.08], [24, 101.85], [34, 101.4], [46, 101.0], [60, 101.15], [77, 100.85]], sig: 'rejected at H3', end: 'Opened inside the range, rallied to H3 and was rejected: a textbook fade back to yesterday’s close.' },
    fadeL3: { label: 'Fade at L3', seed: 71, side: 1, lv: 'L3', kind: 'bounce', stop: 'L4', on: 'touch', tgt: 'C', a: [[0, 100.9], [8, 100.5], [18, 100.0], [21, 99.92], [24, 100.15], [34, 100.6], [46, 101.0], [60, 100.85], [77, 101.15]], sig: 'bounced at L3', end: 'The mirror image: a dip to L3 found buyers and rotated back to the middle.' },
    breakH4: { label: 'Breakout above H4', seed: 72, side: 1, lv: 'H4', kind: 'break-up', stop: 'H3', on: 'close', a: [[0, 101.5], [10, 102.3], [18, 102.75], [24, 102.9], [30, 103.45], [36, 103.35], [50, 104.4], [62, 104.5], [77, 105.2]], sig: 'closed above H4', end: 'Price closed above H4 and never closed back below H3: a trend day, held into the close.' },
    breakL4: { label: 'Breakdown below L4', seed: 73, side: -1, lv: 'L4', kind: 'break-down', stop: 'L3', on: 'close', a: [[0, 100.5], [10, 99.7], [18, 99.25], [24, 99.1], [30, 98.55], [36, 98.65], [50, 97.6], [62, 97.5], [77, 96.8]], sig: 'closed below L4', end: 'A close below L4 started a trend day down, and the short was held into the close.' },
    failH4: { label: 'Failed breakout', seed: 72, side: 1, lv: 'H4', kind: 'break-up', stop: 'H3', on: 'close', a: [[0, 101.6], [10, 102.4], [18, 102.9], [24, 103.45], [28, 103.5], [34, 102.9], [40, 101.9], [52, 101.5], [64, 101.7], [77, 101.2]], sig: 'closed above H4', end: 'The breakout failed and closed back below H3. The exit kept the loss to about 1R while price drifted back toward the middle.' },
  };
  /** Bars, signal and exit for one play. */
  function runPlay(key) {
    const pl = PLAYS[key],
      K = Object.assign(PV.camarilla(Y), { C: Y.c }),
      bars = PV.sessionAt(pl.a, { seed: pl.seed });
    const v = K[pl.lv],
      t = v * 0.0009;
    const hit = { reject: (q, b) => q.c < v && b.h >= v - t && b.c < v, bounce: (q, b) => q.c > v && b.l <= v + t && b.c > v, 'break-up': (q, b) => b.c > v + t, 'break-down': (q, b) => b.c < v - t }[pl.kind];
    const si = bars.findIndex((b, i) => i > 0 && hit(bars[i - 1], b));
    const tr = si < 0 ? null : { i: si, entry: bars[si].c, stop: K[pl.stop], target: pl.tgt ? K[pl.tgt] : null, side: pl.side };
    if (tr) {
      for (let j = si + 1; j < bars.length && tr.exit == null; j++) {
        const b = bars[j];
        if (tr.target != null && (pl.side > 0 ? b.h >= tr.target : b.l <= tr.target)) Object.assign(tr, { exit: j, px: tr.target, why: 'target' });
        else if (pl.on === 'touch' ? (pl.side > 0 ? b.l <= tr.stop : b.h >= tr.stop) : pl.side > 0 ? b.c < tr.stop : b.c > tr.stop) Object.assign(tr, { exit: j, px: pl.on === 'touch' ? tr.stop : b.c, why: 'stop' });
      }
      if (tr.exit == null) Object.assign(tr, { exit: bars.length - 1, px: bars[bars.length - 1].c, why: 'close' });
      tr.pl = (tr.px - tr.entry) * pl.side;
      tr.risk = Math.abs(tr.entry - tr.stop);
    }
    return { pl, K, bars, tr };
  }
  function camChart(holder, ctx, run, o = {}) {
    const { K, bars, tr } = run;
    const lo = Math.min(...bars.map((b) => b.l), K.L4),
      hi = Math.max(...bars.map((b) => b.h), K.H4);
    return TA.chart(holder, ctx, {
      bars,
      yRange: [lo - (hi - lo) * 0.05, hi + (hi - lo) * 0.07],
      pad: { l: 50, r: 78 },
      xTicks: PV.TICKS,
      xf: PV.clock,
      yf: PV.yf,
      dayFmt: (v) => PV.clock(v - 1),
      sliderLabel: 'Time',
      ms: o.ms || 3800,
      controls: o.controls,
      scrub: o.scrub,
      playFrom: o.playFrom,
      label: run.pl.label + ' with Camarilla levels',
      under(P, C) {
        PV.drawZone(P, K.L3, K.H3, C.accent, 0.07);
      },
      over(P, C, i) {
        PV.drawLevels(P, camLevels(K).filter((L) => !MAIN.includes(L.name)), { labels: false });
        PV.drawLevels(P, camLevels(K).filter((L) => MAIN.includes(L.name)).concat([{ name: 'Close', v: K.C, color: C.ink, dash: [2, 3], width: 1.25 }]));
        if (!tr || i <= tr.i || (o.hideTrade && o.hideTrade())) return;
        const x1 = Math.min(i - 1, tr.exit),
          col = tr.side > 0 ? C.gain : C.loss;
        P.line([[tr.i, tr.entry], [x1, tr.entry]], { color: C.ink, width: 1.5, dash: [4, 3] });
        P.line([[tr.i, tr.stop], [x1, tr.stop]], { color: C.loss, width: 2.25 });
        if (tr.target != null) P.line([[tr.i, tr.target], [x1, tr.target]], { color: C.gain, width: 2.25 });
        P.dot(tr.i, tr.entry, { color: col, r: 4 });
        if (i - 1 >= tr.exit) {
          const good = tr.pl > 0;
          P.dot(tr.exit, tr.px, { color: good ? C.gain : C.loss, r: 4.5 });
          P.tag(tr.why === 'target' ? 'Target hit' : tr.why === 'stop' ? 'Stopped out' : 'Closed at the bell', P.X(tr.exit), P.Y(tr.px), { bg: good ? C.gain : C.loss, align: 'right', dy: tr.side > 0 === good ? -32 : 10, size: 10.5 });
        } else P.tag((tr.side > 0 ? 'Buy ' : 'Sell ') + usd(tr.entry), P.X(tr.i), P.Y(tr.entry), { bg: col, dy: tr.side > 0 ? 10 : -32, size: 10.5 });
      },
      onIndex: o.onIndex,
    });
  }
  const rTxt = (tr) => (tr.pl >= 0 ? '+' : '−') + Math.abs(tr.pl / tr.risk).toFixed(1) + 'R';
  function playText(run, i) {
    const { pl, K, bars, tr } = run,
      b = bars[i - 1],
      verb = pl.side > 0 ? 'Bought' : 'Sold';
    if (!tr || i - 1 < tr.i) return `${PV.clock(i - 1)}: price ${usd(b.c)}. Watching ${pl.lv} (${usd(K[pl.lv])}).`;
    const rule = `${pl.on === 'touch' ? 'Stop at' : 'Exit on a close back ' + (pl.side > 0 ? 'below' : 'above')} ${pl.stop} (${usd(tr.stop)})${tr.target != null ? `, target yesterday’s close (${usd(tr.target)})` : ', no fixed target'}`;
    if (i - 1 < tr.exit) return `${PV.clock(tr.i)}: price ${pl.sig}. ${verb} at <b>${usd(tr.entry)}</b>. ${rule}. Now ${usd(b.c)}.`;
    const res = `<b class="${tr.pl >= 0 ? 'gain' : 'loss'}">${tr.pl >= 0 ? '+' : ''}${usd(tr.pl)}</b> a share, about ${rTxt(tr)}`;
    const why = tr.why === 'target' ? 'back at yesterday’s close: target hit for' : tr.why === 'stop' ? (pl.on === 'touch' ? `price reached ${pl.stop}, so the fade was wrong:` : `price closed back ${pl.side > 0 ? 'below' : 'above'} ${pl.stop} at ${usd(tr.px)}, so the trade closed for`) : 'held into the close for';
    return `${PV.clock(tr.exit)}: ${why} ${res}.${i >= bars.length ? ' ' + pl.end : ''}`;
  }
  V.camDay = function (host, p, ctx) {
    const set = p.set || ['fadeH3'];
    let key = set[0],
      chart = null;
    const sg = set.length > 1 ? seg({ label: 'Play', options: set.map((k) => ({ v: k, label: PLAYS[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) }) : null;
    const holder = h('div');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg ? sg.el : null, holder, h('div', { class: 'legend' }, lg('var(--ink)', 'Entry', true), lg('var(--loss)', 'Stop or exit level'), lg('var(--gain)', 'Target')), read, h('p', { class: 'fine' }, 'Yesterday: high $102, low $98, close $101. The shaded band is the L3-to-H3 range.'));
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const run = runPlay(key);
      chart = camChart(holder, ctx, run, { onIndex: (i) => (read.innerHTML = playText(run, i)) });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- two-day Camarilla relationships ---------- */
  const CAM_DAYS = {
    inside: {
      label: 'Inside value',
      d0: { h: 102, l: 98, c: 100.2 },
      a1: [[0, 100.2], [12, 100.7], [25, 99.8], [40, 100.6], [55, 99.9], [77, 100.3]],
      a2: [[0, 100.35], [10, 100.1], [20, 100.55], [26, 100.3], [36, 101.3], [50, 101.8], [64, 102.3], [77, 102.6]],
      end: 'Yesterday was a quiet, small-range day, so today’s Camarilla fit inside yesterday’s. The coil broke upward through H4 and the day closed near its high.',
    },
    higher: {
      label: 'Higher value',
      d0: { h: 102, l: 98, c: 100.2 },
      a1: [[0, 100.2], [15, 100.8], [30, 100.5], [50, 101.5], [77, 102.1]],
      a2: [[0, 102.15], [10, 101.95], [14, 102.0], [30, 102.6], [45, 102.4], [60, 103.2], [77, 103.6]],
      end: 'Today’s whole L3-to-H3 range sat above yesterday’s. Price held above today’s L3 all day and finished above H4: a bullish relationship that played out.',
    },
  };
  V.camRelDay = function (host, p, ctx) {
    const set = p.set || ['inside'],
      N = PV.BARS;
    let key = set[0],
      chart = null;
    const sg = set.length > 1 ? seg({ label: 'Relationship', options: set.map((k) => ({ v: k, label: CAM_DAYS[k].label })), value: key, onChange: (v) => ((key = v), build(), chart.play()) }) : null;
    const holder = h('div');
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg ? sg.el : null, info, holder, h('div', { class: 'legend' }, lg('var(--stock)', 'Yesterday’s L3 to H3'), lg('var(--accent)', 'Today’s L3 to H3'), lg('var(--loss)', 'Today’s H4 and L4', true)), read);
    function build() {
      if (chart) chart.destroy();
      holder.replaceChildren();
      const sc = CAM_DAYS[key];
      const b1 = PV.sessionAt(sc.a1, { seed: 81 }),
        b2 = PV.sessionAt(sc.a2, { seed: 131 }),
        bars = b1.concat(b2);
      const K0 = PV.camarilla(sc.d0),
        K1 = PV.camarilla(PV.ohlc(b1));
      const z0 = { bot: K0.L3, top: K0.H3 },
        z1 = { bot: K1.L3, top: K1.H3 },
        rel = PV.relationship(z0, z1);
      const vals = bars.flatMap((b) => [b.h, b.l]).concat([z0.bot, z0.top, K1.H4, K1.L4]);
      const lo = Math.min(...vals),
        hi = Math.max(...vals);
      info.replaceChildren(stat('Yesterday’s L3 to H3', `${usd(z0.bot)} to ${usd(z0.top)}`), stat('Today’s L3 to H3', `${usd(z1.bot)} to ${usd(z1.top)}`), stat('Relationship', PV.REL[rel][0], PV.relCls(rel)));
      chart = TA.chart(holder, ctx, {
        bars,
        yRange: [lo - (hi - lo) * 0.05, hi + (hi - lo) * 0.1],
        pad: { l: 50, r: 78 },
        xTicks: [0, 39, N, N + 39, 2 * N - 1],
        xf: (v) => PV.clock(Math.round(v) % N),
        yf: PV.yf,
        dayFmt: (v) => (v <= N ? 'Yesterday ' : 'Today ') + PV.clock((v - 1) % N),
        sliderLabel: 'Time',
        ms: 4600,
        label: 'Two days with their Camarilla ranges',
        under(P, C, i) {
          PV.cprBox(P, z0, -0.5, N - 0.5, C.stock, 0.18);
          if (i > N) PV.cprBox(P, z1, N - 0.5, 2 * N - 0.5, C.accent, 0.2);
          P.vline(N - 0.5, { color: C.muted, dash: [3, 3], alpha: 0.6 });
          P.text('Yesterday', P.X(N / 2), P.pad.t + 9, { color: C.muted });
          P.text('Today', P.X(N * 1.5), P.pad.t + 9, { color: C.muted });
        },
        over(P, C, i) {
          if (i > N) PV.drawLevels(P, [{ name: 'H4', v: K1.H4 }, { name: 'H3', v: K1.H3, alpha: 0 }, { name: 'L3', v: K1.L3, alpha: 0 }, { name: 'L4', v: K1.L4 }], { x0: N - 0.5 });
        },
        onIndex(i) {
          const b = bars[i - 1];
          if (i >= bars.length) read.innerHTML = PV.relLine(rel) + ' ' + sc.end;
          else if (i <= N) read.innerHTML = `Yesterday, ${PV.clock(i - 1)}: price ${usd(b.c)}. Today’s Camarilla is set once yesterday closes.`;
          else read.innerHTML = `Today, ${PV.clock(i - 1 - N)}: price ${usd(b.c)}, ${b.c > K1.H4 ? 'above H4' : b.c > K1.H3 ? 'between H3 and H4' : b.c >= K1.L3 ? 'inside L3 to H3' : b.c >= K1.L4 ? 'between L3 and L4' : 'below L4'}.`;
        },
      });
    }
    build();
    return { play: () => chart.play(), destroy: () => chart && chart.destroy() };
  };

  /* ---------- confluence with floor pivots ---------- */
  V.camConfluence = function (host, p, ctx) {
    let tol = 0.15,
      reveal = 1,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const inp = PV.yesterdayInputs(ctx, { pos: 0.75 }, () => paint());
    const sl = slider({ id: ctx.key + '-t', label: 'How close counts', min: 0.05, max: 0.4, step: 0.05, value: tol, fmt: (v) => usd(v), onInput: (v) => ((tol = v), paint()) });
    stack(host, plotEl, read, ...inp.els, sl.el);
    function levels() {
      const y = inp.ohlc(),
        F = PV.floor(y),
        z = PV.cpr(y),
        K = PV.camarilla(y);
      const floor = [['R1', F.R1], ['TC', z.TC], ['P', F.P], ['BC', z.BC], ['S1', F.S1]].map(([n, v]) => ({ n, v, set: 'floor' }));
      const cam = MAIN.map((n) => ({ n, v: K[n], set: 'cam' }));
      const pairs = [];
      cam.forEach((a) => floor.forEach((b) => Math.abs(a.v - b.v) <= tol + 1e-9 && pairs.push([a, b])));
      return { floor, cam, pairs };
    }
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 320 : 360),
      pad: { l: 10, r: 10, t: 26, b: 10 },
      label: 'Floor pivots and Camarilla levels, with matching levels highlighted',
      draw(P) {
        const C = pal(),
          { floor, cam, pairs } = levels();
        const vals = floor.concat(cam).map((L) => L.v),
          lo = Math.min(...vals),
          hi = Math.max(...vals),
          pd = (hi - lo) * 0.07;
        P.domain(0, 10, lo - pd, hi + pd);
        if (reveal >= 1) pairs.forEach(([a, b]) => P.rect(0, Math.min(a.v, b.v) - 0.06, 10, Math.max(a.v, b.v) + 0.06, alpha(C.warn, 0.28)));
        [['Floor and CPR', 0.3, 4.6, floor], ['Camarilla', 5.4, 9.7, cam]].forEach(([title, x0, x1, items], j) => {
          const a = Math.max(0, Math.min(1, reveal * 2 - j));
          P.text(title, P.X((x0 + x1) / 2), 13, { color: C.ink });
          items.forEach((L) => (L.color = L.n === 'TC' || L.n === 'BC' ? C.accent : PV.levelColor(L.n, C)));
          if (a > 0) items.forEach((L) => P.line([[x0, L.v], [x0 + (x1 - x0) * a, L.v]], { color: L.color, width: L.n === 'P' ? 2.5 : 1.75 }));
          if (a >= 1) columnLabels(P, items, j ? x1 : x0, j ? 'right' : 'left');
        });
      },
    });
    function paint() {
      plot.render();
      const { pairs } = levels();
      read.innerHTML = pairs.length ? `<b>${pairs.length} ${pairs.length === 1 ? 'match' : 'matches'}</b><br>` + pairs.map(([a, b]) => `${a.n} ${usd(a.v)} and ${b.n} ${usd(b.v)}: ${Math.round(Math.abs(a.v - b.v) * 100)}¢ apart`).join('<br>') : 'No Camarilla level is that close to a floor pivot or CPR line. Widen the range or change yesterday’s prices.';
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(1400, (k) => {
          reveal = k;
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- fade, follow or get out? ---------- */
  const CALLS = {
    fadeH3: 'Sell: rejected at H3',
    fadeL3: 'Buy: bounced at L3',
    breakH4: 'Buy: closed above H4',
    breakL4: 'Sell: closed below L4',
    failH4: 'Exit the long: the breakout failed',
  };
  V.camQuiz = function (host, p, ctx) {
    const r = SS.rng((Date.now() % 100000) + 11),
      keys = Object.keys(CALLS);
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
    const next = h('button', { type: 'button', class: 'btn primary', hidden: true, onclick: () => round() }, 'Next day');
    stack(host, holder, h('p', { class: 'plot-h' }, 'What does the Camarilla playbook say now?'), choices, fb, h('div', { class: 'ctl-row' }, next, tally));
    function round() {
      if (at % keys.length === 0) order = keys.slice().sort(() => r() - 0.5);
      const key = order[at % keys.length];
      at++;
      answered = false;
      next.hidden = true;
      if (chart) chart.destroy();
      holder.replaceChildren();
      const run = runPlay(key),
        stopAt = key === 'failH4' ? run.tr.exit : run.tr.i;
      chart = camChart(holder, ctx, run, { controls: false, scrub: false, ms: 2600, playFrom: stopAt + 1, hideTrade: () => !answered });
      chart.set(stopAt + 1);
      fb.textContent = `${PV.clock(stopAt)}: price ${usd(run.bars[stopAt].c)}.${key === 'failH4' ? ' You are long from the close above H4.' : ''} Pick the play.`;
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
                fb.innerHTML = `<b>${ok ? 'Correct.' : 'Not quite.'}</b> ${CALLS[key]}. ${run.pl.end}`;
                tally.textContent = `${score} of ${seen} correct`;
                next.hidden = false;
                chart.play();
              },
            },
            h('span', { class: 'choice-k' }, 'ABCD'[j]),
            h('span', null, CALLS[o])
          )
        )
      );
    }
    round();
    return { destroy: () => chart && chart.destroy() };
  };
})();
