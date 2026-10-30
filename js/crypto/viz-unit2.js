/* Crypto, Explained, Unit 2 visuals: a real proof-of-work miner with a live count of hashes by leading zeros, the
   difficulty adjustment as miners join, an attacker racing the honest chain (with Nakamoto's odds), and the halving
   schedule toward 21 million. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, pal, alpha, tween, ease } = SS;
  const V = SS.viz;
  const CR = SS.CR;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const lead = (hex) => hex.match(/^0*/)[0].length;

  /* ---------- a real proof-of-work miner ---------- */
  V.miner = function (host, p, ctx) {
    const TX = 'Ana pays Ben 5';
    let zeros = 2,
      block = 1,
      nonce = 0,
      tries = 0,
      hist = [0, 0, 0, 0, 0, 0],
      recent = [],
      found = null,
      raf = 0,
      acc = 0,
      last = 0;
    const prev = () => CR.sha256('block ' + (block - 1)),
      data = (n) => `${block}|${prev()}|${TX}|${n}`;
    const sg = SS.seg({ label: 'Difficulty', options: [1, 2, 3, 4].map((z) => ({ v: z, label: z + (z === 1 ? ' zero' : ' zeros') })), value: zeros, onChange: (v) => ((zeros = +v), reset(), start()) });
    const blockN = h('b'),
      prevEl = h('code'),
      nonceEl = h('b', { class: 'cr-big' }),
      card = h('div', { class: 'cr-mblock' }, h('div', { class: 'cr-row' }, h('span', null, 'Block'), blockN), h('div', { class: 'cr-row' }, h('span', null, 'Payments'), h('b', null, TX)), h('div', { class: 'cr-row' }, h('span', null, 'Previous block’s hash'), prevEl), h('div', { class: 'cr-row' }, h('span', null, 'Nonce (the number we keep changing)'), nonceEl));
    const rows = Array.from({ length: 4 }, () => h('div', { class: 'cr-mrow' }));
    const triesEl = h('p', { class: 'cr-lbl' });
    const el = h('div', { class: 'plot' });
    const goBtn = h('button', { type: 'button', class: 'btn sm primary', onclick: () => (found ? (block++, reset(), start()) : raf ? stop() : start()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, card, h('p', { class: 'cr-lbl' }, 'Latest tries'), h('div', { class: 'cr-mlist' }, rows), triesEl, el, h('div', { class: 'ctl-row' }, goBtn), read);
    const plot = new Plot(el, {
      height: 150,
      pad: { l: 8, r: 8, t: 24, b: 22 },
      label: 'Hashes tried, counted by how many zeros they start with',
      draw(P) {
        const C = pal(),
          top = Math.log10(Math.max(100, ...hist) + 1);
        P.domain(-0.6, 5.6, 0, top * 1.22);
        P.text('Hashes tried, by leading zeros (log scale)', 8, 10, { align: 'left', color: C.muted });
        hist.forEach((c, i) => {
          const v = Math.log10(c + 1);
          P.rect(i - 0.34, 0, i + 0.34, v, i >= zeros ? C.gain : alpha(C.accent, 0.55));
          P.text(fmt(c), P.X(i), P.Y(v) - 8, { color: i >= zeros ? C.gain : C.ink });
          P.text(i === 5 ? '5+' : String(i), P.X(i), P.h - 9, { color: i >= zeros ? C.gain : C.muted });
        });
      },
    });
    function tryOne() {
      const hx = CR.sha256(data(nonce)),
        z = lead(hx);
      hist[Math.min(z, 5)]++;
      tries++;
      recent.unshift({ n: nonce, hx });
      recent.length = Math.min(recent.length, 4);
      if (z >= zeros) found = { n: nonce, hx };
      else nonce++;
      return found;
    }
    function frame(now) {
      // Paced by the clock, not the frame rate: about 2.5 seconds per block on average, whatever the difficulty.
      const dt = Math.min(100, now - (last || now));
      last = now;
      acc += (dt * 16 ** zeros) / 2500;
      let k = Math.floor(acc);
      acc -= k;
      while (k-- > 0 && !tryOne());
      paint();
      raf = found ? 0 : requestAnimationFrame(frame);
    }
    function paint() {
      blockN.textContent = '#' + block;
      prevEl.textContent = CR.short(prev(), 12);
      nonceEl.textContent = fmt(found ? found.n : nonce);
      card.classList.toggle('ok', !!found);
      rows.forEach((r, i) => {
        const x = recent[i];
        if (!x) return r.replaceChildren(h('span', null, ' '));
        const z = lead(x.hx),
          good = z >= zeros,
          head = x.hx.slice(0, zeros);
        r.className = 'cr-mrow' + (good ? ' ok' : '');
        r.replaceChildren(h('span', null, 'nonce ' + fmt(x.n)), h('code', null, h('span', { class: good ? 'cr-z ok' : 'cr-z' }, head), x.hx.slice(zeros, 22) + '…'));
      });
      triesEl.textContent = `Tries so far: ${fmt(tries)} · about ${fmt(16 ** zeros)} needed on average`;
      plot.render();
      goBtn.textContent = found ? 'Mine the next block' : raf ? 'Pause' : tries ? 'Keep mining' : 'Start mining';
      if (found)
        read.innerHTML = `<b class="gain">Found it!</b> Nonce ${fmt(found.n)} gives a hash starting with ${zeros} zero${zeros > 1 ? 's' : ''}, after ${fmt(tries)} tries. Luck varies a lot from block to block, but it averages about ${fmt(16 ** zeros)}. Anyone can check the answer with a single hash. Real Bitcoin blocks need about 19 zeros, and miners worldwide make hundreds of billions of billions of tries every second.`;
      else if (tries) read.innerHTML = `Trying nonce after nonce. Notice in the chart how each extra zero is about <b>16 times rarer</b>: the green bars are the hashes good enough to win.`;
      else read.textContent = 'Press “Start mining” to try nonces 0, 1, 2… until the block’s hash starts with enough zeros.';
    }
    function start() {
      if (raf || found) return;
      last = 0;
      raf = requestAnimationFrame(frame);
      paint();
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      paint();
    }
    function reset() {
      cancelAnimationFrame(raf);
      raf = 0;
      nonce = 0;
      tries = 0;
      acc = 0;
      hist = [0, 0, 0, 0, 0, 0];
      recent = [];
      found = null;
      paint();
    }
    reset();
    return { play: start, destroy: () => cancelAnimationFrame(raf) };
  };

  /* ---------- the difficulty adjustment ---------- */
  V.difficultyAdjust = function (host, p, ctx) {
    const N = 60,
      R = 12,
      power = (b) => (b < 10 ? 1 : b < 34 ? 1 + (2 * (b - 10)) / 24 : b < 48 ? 3 : 2),
      r = SS.rng(p.seed || 20),
      T = [],
      D = [];
    let d = 1;
    for (let b = 0; b < N; b++) {
      if (b && b % R === 0) d *= 10 / (T.slice(b - R, b).reduce((s, x) => s + x, 0) / R);
      D.push(d);
      T.push((-Math.log(1 - r()) * 10 * d) / power(b));
    }
    const avg = Array.from({ length: N / R }, (_, k) => T.slice(k * R, k * R + R).reduce((s, x) => s + x, 0) / R);
    let i = N,
      cancel = null;
    const el = h('div', { class: 'plot' }),
      el2 = h('div', { class: 'plot' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Replay');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const lg = (c, t) => h('span', { class: 'lg', style: '--c:' + c }, h('span', { class: 'lg-sw' }), t);
    stack(host, h('p', { class: 'plot-h' }, 'Minutes to find each block (green line: the 10-minute target)'), el, h('p', { class: 'plot-h' }, 'Mining power and difficulty (start = 1)'), el2, h('div', { class: 'legend' }, lg('var(--accent)', 'Mining power'), lg('var(--violet)', 'Difficulty')), h('div', { class: 'ctl-row' }, btn), read, h('p', { class: 'fine' }, 'Simulated block times. Real Bitcoin adjusts every 2,016 blocks, about two weeks.'));
    const grid = (P, top, yt, yf) => {
      P.domain(-1, N, 0, top);
      P.grid({ xTicks: [0, 12, 24, 36, 48], xf: (v) => 'B' + (v + 1), yTicks: yt, yf });
      for (let b = R; b < N; b += R) if (b <= i) P.vline(b - 0.5, { color: pal().muted, alpha: 0.6 });
    };
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 200 : 230),
      pad: { l: 40, r: 10, t: 14, b: 26 },
      label: 'Minutes per block, with the 10-minute target',
      draw(P) {
        const C = pal();
        grid(P, 30, [0, 10, 20, 30], (v) => v + 'm');
        P.line([[-1, 10], [N, 10]], { color: C.gain, width: 1.5, dash: [5, 4] });
        P.c.save();
        P.clip();
        for (let b = 0; b < i; b++) {
          P.c.beginPath();
          P.c.arc(P.X(b), P.Y(Math.min(T[b], 29.5)), 3, 0, Math.PI * 2);
          P.c.fillStyle = alpha(C.accent, 0.55);
          P.c.fill();
        }
        P.c.restore();
        avg.forEach((a, k) => {
          const x0 = k * R - 0.4,
            x1 = Math.min(i, k * R + R) - 0.6;
          if (x1 > x0) P.line([[x0, a], [x1, a]], { color: C.ink, width: 3 });
        });
      },
    });
    const plot2 = new Plot(el2, {
      height: 110,
      pad: { l: 40, r: 10, t: 10, b: 26 },
      label: 'Mining power and difficulty over the blocks',
      draw(P) {
        const C = pal();
        grid(P, 3.6, [0, 1, 2, 3], (v) => v + '×');
        const upto = Math.max(1, i);
        P.line(Array.from({ length: upto }, (_, b) => [b, power(b)]), { color: C.accent, width: 2.25 });
        P.line(Array.from({ length: upto }, (_, b) => [b, D[b]]), { color: C.violet, width: 2.25 });
      },
    });
    function paint() {
      plot.render();
      plot2.render();
      if (i < N) return void (read.textContent = 'New miners are joining. Each dot is one block; the black lines show each period’s average.');
      const f = (v) => v.toFixed(1);
      read.innerHTML = `Average minutes per block, 12 blocks at a time: <b>${avg.map(f).join(' → ')}</b>. As miners joined, blocks came faster than every 10 minutes, so at each adjustment the puzzle got harder, about ${f(D[N - 1])}× harder by the end, pulling the pace back toward 10 minutes. When some miners left near the end, the next adjustment would make it easier again.`;
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(4200, (k) => ((i = Math.max(1, Math.round(N * k))), paint()));
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), plot.destroy(), plot2.destroy()) };
  };

  /* ---------- an attacker racing the honest chain ---------- */
  // Nakamoto (2008), section 11: the chance an attacker with share q ever catches up after z confirmations.
  const nakamoto = (q, z) => {
    const pp = 1 - q,
      lam = (z * q) / pp;
    let s = 1,
      poi = Math.exp(-lam);
    for (let k = 0; k <= z; k++) {
      if (k) poi *= lam / k;
      s -= poi * (1 - Math.pow(q / pp, z - k));
    }
    return Math.max(0, s);
  };
  function race(q, z, r) {
    const ev = [],
      giveUp = Math.ceil(Math.log(1e-4) / Math.log(q / (1 - q)));
    let hh = 0,
      a = 0;
    for (let step = 0; step < 5000; step++) {
      const att = r() < q;
      ev.push(att ? 'a' : 'h');
      att ? a++ : hh++;
      if (hh >= z && a >= hh) return { ev, win: true };
      if (hh >= z && hh - a >= giveUp) return { ev, win: false };
    }
    return { ev, win: false };
  }
  V.chainRace = function (host, p, ctx) {
    let q = 0.3,
      z = 3,
      cur = null,
      shown = 0,
      wins = 0,
      runs = 0,
      seed = 1,
      cancel = null;
    const sQ = slider({ id: ctx.key + '-q', label: 'Attacker’s share of mining power', min: 5, max: 49, step: 1, value: 30, fmt: (v) => v + '%', onInput: (v) => ((q = v / 100), tally0(), paint()) });
    const sZ = slider({ id: ctx.key + '-z', label: 'Confirmations the seller waits for', min: 1, max: 6, step: 1, value: z, fmt: (v) => String(v), onInput: (v) => ((z = v), tally0(), paint()) });
    const runBtn = h('button', { type: 'button', class: 'btn sm primary', onclick: () => run() }, 'Run a race');
    const manyBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => many() }, 'Run 1,000 races');
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, el, sQ.el, sZ.el, h('div', { class: 'ctl-row' }, runBtn, manyBtn), read);
    const tally0 = () => ((wins = 0), (runs = 0), (cur = null));
    const counts = () => {
      let hh = 0,
        a = 0;
      if (cur) cur.ev.slice(0, shown).forEach((e) => (e === 'a' ? a++ : hh++));
      return { hh, a };
    };
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 210 : 230),
      pad: { l: 0, r: 0, t: 0, b: 0 },
      label: 'The honest chain and the attacker’s secret chain',
      draw(P) {
        const C = pal(),
          k = P.c,
          W = P.w,
          H = P.h,
          { hh, a } = counts(),
          yH = H * 0.32,
          yA = H * 0.72,
          ym = (yH + yA) / 2,
          s = 22,
          slot = 28,
          fx = 12 + 2 * slot,
          cap = Math.max(4, Math.floor((W - fx - 12) / slot)),
          box = (x, y, fill, txt) => {
            k.save();
            k.fillStyle = fill;
            k.beginPath();
            k.roundRect ? k.roundRect(x, y - s / 2, s, s, 4) : k.rect(x, y - s / 2, s, s);
            k.fill();
            k.restore();
            if (txt) P.text(txt, x + s / 2, y, { color: C.onsolid, size: 8.5, weight: 700, clamp: false });
          };
        // Shared history, then the fork.
        box(12, ym, alpha(C.muted, 0.5));
        box(12 + slot, ym, alpha(C.muted, 0.5));
        const line = (y) => {
          k.save();
          k.strokeStyle = C.line;
          k.lineWidth = 1.5;
          k.beginPath();
          k.moveTo(12 + slot + s, ym);
          k.lineTo(fx, y);
          k.stroke();
          k.restore();
        };
        line(yH);
        line(yA);
        const lane = (n, y, first, color, firstTxt) => {
          const off = Math.max(0, n - cap);
          for (let j = off; j < n; j++) box(fx + (j - off) * slot, y, j === 0 ? first : color, j === 0 ? firstTxt : null);
          if (off) P.text('…', fx - 6, y, { color: C.muted, clamp: false });
        };
        P.text('Honest chain', 12, yH - 24, { align: 'left', color: C.ink });
        P.text('Attacker’s secret chain', 12, yA + 24, { align: 'left', color: C.loss });
        lane(hh, yH, C.gain, C.accent, 'Pay');
        lane(a, yA, C.loss, alpha(C.loss, 0.6), 'Undo');
        P.text(`${Math.min(hh, z)}/${z} confirmations${hh >= z ? ' · shipped' : ''}`, W - 10, yH - 24, { align: 'right', color: hh >= z ? C.gain : C.muted });
        P.text(`${a} block${a === 1 ? '' : 's'}`, W - 10, yA + 24, { align: 'right', color: C.loss });
      },
    });
    function paint() {
      plot.render();
      const P0 = nakamoto(q, z),
        pct = (v) => (v === 0 ? '0%' : v * 100 < 0.01 ? 'under 0.01%' : (v * 100 < 1 ? (v * 100).toFixed(2) : (v * 100).toFixed(1)) + '%');
      let t = `<b>Theory</b> (Nakamoto’s 2008 Bitcoin paper): with ${Math.round(q * 100)}% of the power against ${z} confirmation${z > 1 ? 's' : ''}, the attacker succeeds ${pct(P0)} of the time.`;
      if (runs) t += ` <b>Your races:</b> the attacker won ${fmt(wins)} of ${fmt(runs)} (${pct(wins / runs)}).`;
      if (cur && shown >= Math.min(cur.ev.length, 30)) {
        const { hh, a } = counts();
        t = (cur.win ? `<b class="loss">The attacker caught up</b> (${a} blocks vs ${hh}) and published the secret chain, undoing the payment after the seller shipped. ` : `<b class="gain">The attacker fell behind and gave up.</b> The payment stands. `) + t;
      }
      read.innerHTML = t;
    }
    function run() {
      if (cancel) cancel();
      cur = race(q, z, SS.rng(1000 + seed++));
      runs++;
      if (cur.win) wins++;
      const steps = Math.min(cur.ev.length, 30);
      cancel = tween(steps * 260, (k) => ((shown = Math.round(steps * k)), paint()), () => ((shown = cur.ev.length), paint()));
    }
    function many() {
      if (cancel) cancel();
      const r = SS.rng(5000 + seed++);
      for (let n = 0; n < 1000; n++) if (race(q, z, r).win) wins++;
      runs += 1000;
      cur = null;
      paint();
    }
    paint();
    return { play: run, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- the halving toward 21 million ---------- */
  // Approximate start of each reward era; after 2024 each era is about four years.
  const ERAS = [2009.01, 2012.91, 2016.52, 2020.36, 2024.3];
  for (let k = 5; k <= 33; k++) ERAS.push(ERAS[4] + 4 * (k - 4));
  const eraOf = (y) => Math.max(0, ERAS.findIndex((s, k) => y >= s && y < ERAS[k + 1]));
  const supplyAt = (y) => ERAS.slice(0, -1).reduce((sum, s, k) => sum + 210000 * (50 / 2 ** k) * clamp01((y - s) / (ERAS[k + 1] - s)), 0);
  V.halving = function (host, p, ctx) {
    const X0 = 2009,
      X1 = 2050;
    let year = 2026.8,
      cancel = null;
    const sl = slider({ id: ctx.key + '-y', label: 'Year', min: X0, max: X1, step: 0.5, value: 2026.5, fmt: (v) => String(Math.floor(v)), onInput: (v) => (stop(), (year = v), paint()) });
    const el = h('div', { class: 'plot' }),
      el2 = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('p', { class: 'plot-h' }, 'Bitcoins in existence (millions)'), el, h('p', { class: 'plot-h' }, 'Reward per block (bitcoins)'), el2, sl.el, read, h('p', { class: 'fine' }, 'Dates after 2024 are estimates: halvings follow the block count, not the calendar.'));
    const stop = () => (cancel && cancel(), (cancel = null));
    const xt = [2009, 2016, 2024, 2032, 2040, 2048];
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 190 : 220),
      pad: { l: 40, r: 12, t: 14, b: 8 },
      label: 'Total bitcoin supply over time, approaching 21 million',
      draw(P) {
        const C = pal();
        P.domain(X0, X1, 0, 23);
        P.grid({ xTicks: xt, yTicks: [0, 7, 14, 21], noXLabels: true, noXLines: true });
        P.line([[X0, 21], [X1, 21]], { color: C.loss, width: 1.5, dash: [5, 4] });
        P.text('Cap: 21 million', P.X(X1) - 2, P.Y(21) - 9, { align: 'right', color: C.loss });
        const pts = [];
        for (let y = X0; y <= year + 1e-9; y += 0.25) pts.push([y, supplyAt(y) / 1e6]);
        pts.push([year, supplyAt(year) / 1e6]);
        P.area(pts, 0, C.accent, 0.12);
        P.line(pts, { color: C.accent, width: 2.5 });
        ERAS.slice(1).forEach((s) => s <= year && s < X1 && P.vline(s, { color: C.muted, alpha: 0.5 }));
        P.dot(year, supplyAt(year) / 1e6, { color: C.accent, r: 4.5 });
      },
    });
    const plot2 = new Plot(el2, {
      height: 120,
      pad: { l: 40, r: 12, t: 12, b: 26 },
      label: 'Block reward, halving about every four years',
      draw(P) {
        const C = pal();
        P.domain(X0, X1, 0, 56);
        P.grid({ xTicks: xt, yTicks: [0, 25, 50] });
        for (let k = 0; k < ERAS.length - 1; k++) {
          const s = ERAS[k],
            e = Math.min(ERAS[k + 1], year);
          if (s > year || s >= X1) break;
          P.rect(s, 0, Math.min(e, X1), 50 / 2 ** k, alpha(k === eraOf(year) ? C.warn : C.accent, k === eraOf(year) ? 0.85 : 0.35));
        }
        ERAS.slice(1, 5).forEach((s) => s <= year && P.text('½', P.X(s), P.Y(50 / 2 ** (ERAS.indexOf(s) - 1)) - 8, { color: C.muted }));
      },
    });
    function paint() {
      plot.render();
      plot2.render();
      const k = eraOf(year),
        reward = 50 / 2 ** k,
        perDay = (reward * 210000) / ((ERAS[k + 1] - ERAS[k]) * 365.25),
        sup = supplyAt(year),
        est = year >= 2026.8 ? ' (estimated)' : '';
      if (sup < 1e5) return void (read.innerHTML = '<b>January 2009:</b> Bitcoin launches. The reward is 50 bitcoins per block, and only the first few blocks exist.');
      read.innerHTML = `<b>In ${Math.floor(year)}${est}:</b> the reward is ${reward >= 1 ? reward : reward.toFixed(4)} bitcoins per block, about ${fmt(perDay)} new bitcoins a day. About ${(sup / 1e6).toFixed(2)} million exist: ${((sup / 21e6) * 100).toFixed(1)}% of all that ever will.${k ? ` That’s after ${k} halving${k > 1 ? 's' : ''}.` : ''}`;
    }
    function play() {
      stop();
      cancel = tween(4500, (k) => ((year = X0 + (2026.5 - X0) * ease.inOut(k)), sl.set(Math.round(year * 2) / 2), paint()));
    }
    paint();
    return { play, destroy: () => (stop(), plot.destroy(), plot2.destroy()) };
  };
})();
