/* Reading the Market Profile, Unit 1 visuals: an auction finding value, and the TPO profile builder that the whole
   course uses (letters by period, collapsing into a profile, with structures marked). */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, seg, usd, pal, alpha, tween, ease } = SS;
  const V = SS.viz,
    TA = SS.TA,
    MP = SS.MP;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);

  /* ---------- the auction ---------- */
  const PATH = [[0, 100], [15, 100.6], [25, 101.8], [28, 102.4], [31, 101.6], [45, 100.5], [60, 99.8], [70, 98.6], [73, 98.2], [76, 99.0], [90, 100.1], [105, 100.4], [119, 100.2]];
  V.auctionSim = function (host, p, ctx) {
    const px = TA.path(PATH, 120, { seed: 4, noise: 0.0012 }),
      n = px.length,
      T = 0.2,
      LO = 97.8,
      HI = 102.8;
    const bins = Math.round((HI - LO) / T);
    let i = n,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Replay');
    stack(host, plotEl, h('div', { class: 'ctl-row' }, btn), h('div', { class: 'legend' }, lg('var(--ink)', 'Price over time'), lg('var(--accent)', 'Time spent trading at each price')), read);
    const hist = (upto) => {
      const c = new Array(bins).fill(0);
      for (let t = 0; t < upto; t++) c[Math.max(0, Math.min(bins - 1, Math.floor((px[t] - LO) / T)))]++;
      return c;
    };
    const NOTES = [
      [26, 'Price advertises higher, but buyers stop showing up.', C => C.loss],
      [31, 'Rejected fast: few trades up there. That quick turn is excess.', C => C.loss],
      [72, 'Too low now: sellers dry up and buyers rush in.', C => C.gain],
      [119, 'Back in the middle, both sides keep trading: that is value.', C => C.accent],
    ];
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 250 : 290),
      pad: { l: 46, r: 10, t: 12, b: 22 },
      label: 'Price searching up and down, and where trading concentrated',
      draw(P) {
        const C = pal(),
          c = hist(i),
          mx = Math.max(...hist(n));
        P.domain(0, 165, LO, HI);
        P.grid({ xTicks: [], yTicks: [98, 99, 100, 101, 102], yf: (v) => '$' + v });
        c.forEach((v, k) => v && P.rect(124, LO + k * T + T * 0.08, 124 + (40 * v) / mx, LO + (k + 1) * T - T * 0.08, alpha(C.accent, 0.7)));
        P.line(px.slice(0, i).map((v, t) => [t, v]), { color: C.ink, width: 2.25 });
        if (i > 0) P.dot(i - 1, px[i - 1], { color: C.ink, r: 5 });
        const note = NOTES.filter((x) => i - 1 >= x[0]).pop();
        if (note && i < n) P.tag(note[1].split(':')[0].split(',')[0], P.X(note[0]), P.Y(px[note[0]]), { bg: note[2](C), dy: px[note[0]] > 100.5 ? 10 : -32, size: 10 });
      },
    });
    function paint() {
      plot.render();
      const note = NOTES.filter((x) => i - 1 >= x[0]).pop();
      read.innerHTML = i >= n ? `Price went looking for buyers above and sellers below. Where it found only a few, it turned quickly and left little trade behind. Where both sides kept trading, the bars grew: that area is <b>value</b>.` : note ? note[1] : 'Price starts searching for a level where buyers and sellers will both trade.';
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(5200, (k) => {
        i = Math.max(1, Math.round(n * k));
        paint();
      });
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- the TPO profile builder ---------- */
  /** Draws one day's TPOs. `shown` periods are visible; `collapse` 0 = one column per period, 1 = stacked profile. */
  function drawTPO(P, C, day, prof, o) {
    const t = day.tick,
      { shown, collapse, show } = o,
      done = collapse >= 0.98,
      maxRow = Math.max(...prof.rows.map((r) => r.letters.length)),
      colX = (j) => j + 0.6,
      packX = (i) => 0.45 + i * 0.58,
      fs = Math.max(7, Math.min(11.5, Math.abs(P.Y(prof.lo) - P.Y(prof.lo + t)) * 0.95));
    const tail = (k) => (k < prof.tailLo ? 'lo' : k >= prof.rows.length - prof.tailHi ? 'hi' : null);
    const inSingles = (k) => prof.singles.some(([a, b]) => k >= a && k <= b);
    if (done && show.va) P.rect(0.1, prof.val - t / 2, packX(maxRow), prof.vah + t / 2, alpha(C.accent, 0.12));
    if (collapse < 0.02 && show.ib && prof.ib) {
      P.rect(0.1, prof.lo - t, 2.1, prof.hi + t, alpha(C.accent, 0.08));
      [prof.ib.lo, prof.ib.hi].forEach((v) => P.line([[0.1, v], [13.2, v]], { color: C.accent, width: 1, dash: [4, 3] }));
    }
    const c = P.c;
    c.save();
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    prof.rows.forEach((r, k) => {
      r.letters.forEach((j, idx) => {
        if (j >= shown) return;
        const x = colX(j) + (packX(idx) - colX(j)) * collapse;
        let col = alpha(C.ink, 0.82),
          bold = false;
        if (show.ib && j < 2) col = C.accent;
        if (show.ib && prof.ib && j >= 2 && (r.p > prof.ib.hi + 1e-9 || r.p < prof.ib.lo - 1e-9)) col = r.p > prof.ib.hi ? C.gain : C.loss;
        if (done) {
          if (show.va && k === prof.poc) (col = C.warn), (bold = true);
          if (show.tails && tail(k)) (col = tail(k) === 'lo' ? C.gain : C.loss), (bold = true);
          if (show.singles && inSingles(k)) (col = C.violet), (bold = true);
        }
        c.font = SS.MONO(fs, bold ? 800 : 600);
        c.fillStyle = col;
        c.fillText(MP.LETTERS[j], P.X(x), P.Y(r.p));
      });
    });
    c.restore();
    if (collapse < 0.5) for (let j = 0; j < shown; j++) P.text(MP.LETTERS[j], P.X(colX(j)), P.h - 9, { color: C.muted, size: 9.5 });
    // One-timeframing: connect each period's low (or high) in the column view.
    if (show.otf && collapse < 0.02 && shown > 1) {
      const per = day.p.slice(0, shown),
        up = prof.otfUp >= prof.otfDn;
      P.line(per.map(([l, hh], j) => [colX(j), up ? l - t * 0.6 : hh + t * 0.6]), { color: up ? C.gain : C.loss, width: 2 });
    }
    if (!done) return;
    const lab = (txt, v, col) => P.text(txt, P.X(packX(maxRow) + 0.9), P.Y(v), { align: 'left', color: col, weight: 700, size: 10 });
    const bx = packX(maxRow) + 0.45;
    if (show.va) {
      lab('POC ' + usd(prof.pocP), prof.pocP, C.warn);
      P.line([[bx, prof.val - t / 2], [bx, prof.vah + t / 2]], { color: C.accent, width: 3 });
    }
    if (show.ib && prof.ib) {
      const ix = bx + 0.25;
      P.line([[ix, prof.ib.lo], [ix, prof.ib.hi]], { color: C.accent, width: 3 });
      lab('IB', (prof.ib.lo + prof.ib.hi) / 2 + (show.va ? t * 2 : 0), C.accent);
      if (prof.hi > prof.ib.hi + 1e-9) (P.line([[ix, prof.ib.hi], [ix, prof.hi]], { color: C.gain, width: 3 }), lab('Extension up', prof.hi, C.gain));
      if (prof.lo < prof.ib.lo - 1e-9) (P.line([[ix, prof.lo], [ix, prof.ib.lo]], { color: C.loss, width: 3 }), lab('Extension down', prof.lo, C.loss));
    }
    if (show.tails) {
      if (prof.tailLo) lab('Buying tail', prof.rows[Math.floor(prof.tailLo / 2)].p, C.gain);
      if (prof.tailHi) lab('Selling tail', prof.rows[prof.rows.length - 1 - Math.floor(prof.tailHi / 2)].p, C.loss);
      if (prof.poorHi) lab('Poor high', prof.hi, C.warn);
      if (prof.poorLo) lab('Poor low', prof.lo, C.warn);
    }
    if (show.singles) prof.singles.forEach(([a, b]) => lab('Single prints', (prof.rows[a].p + prof.rows[b].p) / 2, C.violet));
  }
  MP.drawTPO = drawTPO;

  /** A sentence describing what the chosen features show. */
  function describe(day, prof, show) {
    const out = [];
    if (show.va) out.push(`The POC is ${usd(prof.pocP)}, the price touched by the most periods; the value area, ${usd(prof.val)} to ${usd(prof.vah)}, holds about 70% of the letters.`);
    if (show.ib && prof.ib) {
      const ext = [prof.extUp >= 0 ? `up in period ${MP.LETTERS[prof.extUp]}` : null, prof.extDn >= 0 ? `down in period ${MP.LETTERS[prof.extDn]}` : null].filter(Boolean);
      out.push(`The initial balance (A and B) ran ${usd(prof.ib.lo)}–${usd(prof.ib.hi)}; ${ext.length ? 'the range was extended ' + ext.join(' and ') : 'there was no range extension'}.`);
    }
    if (show.tails) {
      const bits = [prof.tailLo ? `a ${prof.tailLo}-row buying tail` : null, prof.tailHi ? `a ${prof.tailHi}-row selling tail` : null, prof.poorHi ? 'a poor high' : null, prof.poorLo ? 'a poor low' : null].filter(Boolean);
      out.push(bits.length ? `It shows ${bits.length > 1 ? bits.slice(0, -1).join(', ') + ' and ' + bits[bits.length - 1] : bits[0]}.` : 'No tails and no poor extremes.');
    }
    if (show.singles && prof.singles.length) out.push(`Single prints from ${usd(prof.rows[prof.singles[0][0]].p)} to ${usd(prof.rows[prof.singles[0][1]].p)} mark a fast move.`);
    if (show.otf) out.push(`${prof.otfUp >= prof.otfDn ? `${prof.otfUp} of ${prof.periods - 1} periods made a higher low` : `${prof.otfDn} of ${prof.periods - 1} periods made a lower high`}.`);
    return out.join(' ');
  }
  V.tpoBuild = function (host, p, ctx) {
    const days = p.days || ['normal'],
      show = Object.fromEntries((p.show || []).map((k) => [k, true]));
    let key = days[0],
      view = p.view || 'profile',
      shown = 13,
      collapse = view === 'profile' ? 1 : 0,
      cancel = null;
    const sgDay = days.length > 1 ? seg({ label: 'Day', options: days.map((k) => ({ v: k, label: MP.DAYS[k].name })), value: key, onChange: (v) => ((key = v), play()) }) : null;
    const sgView = seg({ label: 'View', options: [{ v: 'split', label: 'By period' }, { v: 'profile', label: 'Profile' }], value: view, onChange: (v) => ((view = v), morph()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Replay');
    stack(host, sgDay ? sgDay.el : null, plotEl, h('div', { class: 'ctl-row' }, btn, sgView.el), read, h('p', { class: 'fine' }, 'Each letter is one half-hour period (A = 9:30, B = 10:00 … M = 3:30) trading at that price. Illustrative prices.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 300 : 340),
      pad: { l: 46, r: 8, t: 10, b: 22 },
      label: 'A Market Profile built from half-hour periods',
      draw(P) {
        const C = pal(),
          day = MP.DAYS[key],
          prof = MP.profile(day);
        P.domain(0, 16, prof.lo - day.tick * 1.5, prof.hi + day.tick * 1.5);
        P.grid({ xTicks: [], yTicks: SS.niceTicks(prof.lo, prof.hi, 5), yf: (v) => '$' + v.toFixed(day.tick < 0.1 ? 2 : 1) });
        drawTPO(P, C, day, MP.profile(day), { shown, collapse, show });
      },
    });
    function paint() {
      plot.render();
      const day = MP.DAYS[key],
        prof = MP.profile(day);
      if (shown < 13) read.innerHTML = `${MP.time(shown - 1)}: period ${MP.LETTERS[shown - 1]} trades between ${usd(day.p[shown - 1][0])} and ${usd(day.p[shown - 1][1])}.`;
      else if (collapse < 0.98 && collapse > 0.02) read.innerHTML = 'Now slide every letter to the left. Each price row keeps all the periods that traded there.';
      else read.innerHTML = (collapse >= 0.98 ? `<b>${day.name}.</b> ` : '<b>By period.</b> ') + (describe(day, prof, show) || day.about) + (p.about ? ' ' + day.about : '');
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    function morph() {
      stop();
      const from = collapse,
        to = view === 'profile' ? 1 : 0;
      cancel = tween(900, (k) => {
        collapse = from + (to - from) * ease.inOut(k);
        paint();
      });
    }
    function play() {
      stop();
      const end = view === 'profile';
      collapse = 0;
      cancel = tween(end ? 5200 : 3600, (k) => {
        const a = end ? Math.min(1, k / 0.6) : k;
        shown = Math.max(1, Math.min(13, Math.ceil(13 * a)));
        collapse = end && k > 0.66 ? ease.inOut((k - 0.66) / 0.34) : 0;
        if (k >= 1) (shown = 13), (collapse = end ? 1 : 0);
        paint();
      });
    }
    paint();
    return { play, destroy: () => (stop(), plot.destroy()) };
  };
})();
