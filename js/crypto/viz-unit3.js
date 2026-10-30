/* Crypto, Explained, Unit 3 visuals: an escrow smart contract running line by line, a proof-of-stake wheel with
   slashing, a run on three kinds of stablecoin, and a liquidity pool's constant-product curve with price impact. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, pal, alpha, tween, ease, usd } = SS;
  const V = SS.viz;
  const CR = SS.CR;
  const { circle, label, seg2, pill, cross, rrect } = CR.draw;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------- an escrow contract running line by line ---------- */
  V.escrowContract = function (host, p, ctx) {
    const LINES = ['contract Escrow {', '  buyer pays 1 ETH   → lock it', '  buyer confirms     → pay seller', '  deadline passes    → refund buyer', '}'];
    const PHASES = {
      ok: [
        [0, 1, 'The buyer sends 1 ETH. The contract locks it, so neither side can touch it now.'],
        [0.22, -1, 'The seller ships the goods.'],
        [0.45, 2, 'The buyer confirms delivery, which triggers the next rule…'],
        [0.58, 2, '…and the contract pays the seller, automatically.'],
        [0.84, -1, '<b class="gain">Done, with no middleman.</b> The rules ran exactly as written, and each step paid a small gas fee to the network.'],
      ],
      no: [
        [0, 1, 'The buyer sends 1 ETH. The contract locks it, so neither side can touch it now.'],
        [0.22, -1, 'The seller doesn’t ship. The contract simply waits while the clock runs.'],
        [0.75, 3, 'The deadline passes, and the refund rule runs by itself.'],
        [0.95, -1, '<b class="gain">Refunded automatically.</b> No court or customer service needed. The flip side: if the code had a bug, there would be no one to appeal to.'],
      ],
    };
    let mode = 'ok',
      t = 1,
      cancel = null;
    const sg = SS.seg({ label: 'Ending', options: [{ v: 'ok', label: 'Seller delivers' }, { v: 'no', label: 'Seller never delivers' }], value: mode, onChange: (v) => ((mode = v), play()) });
    const lines = LINES.map((l) => h('span', null, l));
    const code = h('pre', { class: 'cr-code', 'aria-label': 'The contract’s rules' }, lines);
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, code, el, read);
    const phase = () => PHASES[mode].filter(([s]) => t >= s).pop();
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 200 : 220),
      pad: { l: 0, r: 0, t: 0, b: 0 },
      label: 'Buyer, contract and seller',
      draw(P) {
        const C = pal(),
          k = P.c,
          W = P.w,
          H = P.h,
          ok = mode === 'ok',
          bx = [W * 0.15, W * 0.5, W * 0.85],
          y = H * 0.4,
          box = (x, name, c) => {
            k.save();
            k.fillStyle = C.surface;
            k.strokeStyle = c;
            k.lineWidth = 2;
            k.beginPath();
            rrect(k, x - 40, y - 28, 80, 56, 10);
            k.fill();
            k.stroke();
            k.restore();
            label(k, name, x, y - 12, { size: 11.5, weight: 700 });
          };
        seg2(k, [bx[0] + 40, y], [bx[1] - 40, y], C.line, 1.5, [4, 4]);
        seg2(k, [bx[1] + 40, y], [bx[2] - 40, y], C.line, 1.5, [4, 4]);
        box(bx[0], 'Buyer', C.ink);
        box(bx[1], 'Contract', C.accent);
        box(bx[2], 'Seller', C.ink);
        // Where the coin is: moving to the contract, locked, then out to the seller or back to the buyer.
        const pay = clamp01(t / 0.2),
          out = ok ? clamp01((t - 0.6) / 0.22) : clamp01((t - 0.77) / 0.18),
          dest = ok ? bx[2] : bx[0],
          held = pay >= 1 && out <= 0;
        label(k, held ? '1 ETH locked' : out >= 1 ? 'empty' : pay < 1 ? 'empty' : '', bx[1], y + 10, { color: held ? C.accent : C.muted, size: 10.5 });
        let cx = lerp(bx[0], bx[1], ease.inOut(pay));
        if (out > 0) cx = lerp(bx[1], dest, ease.inOut(out));
        circle(k, cx, y - 46, 13, C.warn, C.surface, 2);
        label(k, 'ETH', cx, y - 46, { color: C.onsolid, size: 9, weight: 700 });
        if (ok) {
          const ship = clamp01((t - 0.24) / 0.2);
          if (ship > 0 && t < 0.62) {
            const px = lerp(bx[2], bx[0], ease.inOut(ship));
            k.save();
            k.fillStyle = C.put;
            k.fillRect(px - 9, y + 36, 18, 14);
            k.restore();
          }
          if (t >= 0.45) {
            circle(k, bx[0], y + 44, 11, C.gain);
            label(k, '✓', bx[0], y + 44.5, { color: C.onsolid, size: 12, weight: 700 });
          }
        }
        // The deadline clock.
        const fill = ok ? Math.min(clamp01((t - 0.2) / 0.55), 0.45) : clamp01((t - 0.2) / 0.55),
          bw = W - 40,
          by = H - 26;
        k.save();
        k.fillStyle = alpha(C.muted, 0.18);
        k.fillRect(20, by, bw, 8);
        k.fillStyle = fill >= 1 ? C.loss : C.muted;
        k.fillRect(20, by, bw * fill, 8);
        k.restore();
        label(k, fill >= 1 ? 'Deadline passed' : 'Time until the deadline', 20, by - 10, { align: 'left', color: fill >= 1 ? C.loss : C.muted, size: 10.5 });
      },
    });
    function paint() {
      plot.render();
      const [, line, txt] = phase();
      lines.forEach((s, i) => s.classList.toggle('on', i === line));
      read.innerHTML = txt;
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(6500, (k) => ((t = k), paint()));
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- proof of stake: a wheel weighted by stake ---------- */
  V.stakeWheel = function (host, p, ctx) {
    const START = [
      { n: 'Ana', s: 64 },
      { n: 'Ben', s: 32 },
      { n: 'Cy', s: 96 },
      { n: 'Dee', s: 32 },
      { n: 'Eli', s: 160 },
    ];
    let V5 = START.map((v) => ({ ...v, picks: 0, out: false })),
      rot = 0,
      pick = -1,
      cheat = false,
      slashing = 0,
      spins = 0,
      cancel = null;
    const rng = SS.rng(77);
    const spinBtn = h('button', { type: 'button', class: 'btn sm primary', onclick: () => spin(false) }, 'Spin the wheel');
    const manyBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => many() }, 'Spin 50 times');
    const cheatBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => spin(true) }, 'Next one cheats');
    const resetBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => reset() }, 'Reset');
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, el, h('div', { class: 'ctl-row' }, spinBtn, manyBtn, cheatBtn, resetBtn), read);
    const live = () => V5.filter((v) => !v.out);
    const total = () => live().reduce((s, v) => s + v.s, 0);
    const colors = (C) => [C.accent, C.gain, C.warn, C.violet, C.put];
    // Each live validator's slice of the wheel, in wheel coordinates.
    const slices = () => {
      let a = 0;
      const T = total();
      return V5.map((v) => {
        if (v.out) return null;
        const w = (v.s / T) * Math.PI * 2,
          s = { a0: a, a1: a + w };
        a += w;
        return s;
      });
    };
    const choose = () => {
      let x = rng() * total();
      for (let i = 0; i < V5.length; i++) if (!V5[i].out && (x -= V5[i].s) < 0) return i;
      return V5.findIndex((v) => !v.out);
    };
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 250 : 270),
      pad: { l: 0, r: 0, t: 0, b: 0 },
      label: 'Validators on a wheel, each slice sized by stake',
      draw(P) {
        const C = pal(),
          k = P.c,
          W = P.w,
          H = P.h,
          R = Math.min(H / 2 - 18, W * 0.27),
          cx = Math.min(W * 0.36, R + 16),
          cy = H / 2 + 6,
          S = slices(),
          col = colors(C);
        V5.forEach((v, i) => {
          if (!S[i]) return;
          k.save();
          k.beginPath();
          k.moveTo(cx, cy);
          k.arc(cx, cy, R, S[i].a0 + rot, S[i].a1 + rot);
          k.closePath();
          k.fillStyle = i === pick && slashing ? alpha(C.loss, 0.85) : alpha(col[i], i === pick ? 0.95 : 0.6);
          k.fill();
          k.strokeStyle = C.surface;
          k.lineWidth = 2;
          k.stroke();
          k.restore();
          const m = (S[i].a0 + S[i].a1) / 2 + rot;
          if (S[i].a1 - S[i].a0 > 0.35) label(k, v.n, cx + Math.cos(m) * R * 0.62, cy + Math.sin(m) * R * 0.62, { color: C.onsolid, size: 11, weight: 700 });
        });
        // The pointer at the top.
        k.save();
        k.fillStyle = C.ink;
        k.beginPath();
        k.moveTo(cx, cy - R + 12);
        k.lineTo(cx - 9, cy - R - 10);
        k.lineTo(cx + 9, cy - R - 10);
        k.closePath();
        k.fill();
        k.restore();
        // The legend: stake and blocks proposed.
        const lx = cx + R + 18;
        label(k, 'Stake · blocks', lx, 16, { align: 'left', color: C.muted, size: 10 });
        V5.forEach((v, i) => {
          const y = 40 + i * ((H - 50) / 5);
          circle(k, lx + 5, y, 5, v.out ? C.line : col[i]);
          label(k, v.n, lx + 16, y - 7, { align: 'left', color: v.out ? C.muted : C.ink, size: 11, weight: 700 });
          label(k, v.out ? 'slashed, out' : `${fmt(v.s, v.s % 1 ? 1 : 0)} ETH · ${v.picks}`, lx + 16, y + 8, { align: 'left', color: v.out ? C.loss : C.muted, size: 10 });
        });
      },
    });
    function paint(msg) {
      plot.render();
      if (msg) read.innerHTML = msg;
      cheatBtn.disabled = live().length <= 2;
    }
    function spin(cheats) {
      if (cancel) cancel();
      slashing = 0;
      const i = choose(),
        S = slices(),
        m = (S[i].a0 + S[i].a1) / 2 + (rng() - 0.5) * (S[i].a1 - S[i].a0) * 0.6,
        from = rot,
        to = rot + Math.PI * 6 + ((((-Math.PI / 2 - m - rot) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));
      pick = -1;
      paint('Spinning… the bigger your stake, the bigger your slice.');
      cancel = tween(2200, (k) => ((rot = lerp(from, to, ease.out(k))), plot.render()), () => {
        pick = i;
        spins++;
        const v = V5[i],
          share = Math.round((v.s / total()) * 100);
        if (!cheats) {
          v.picks++;
          return paint(`<b>${v.n} is picked</b> to propose the next block (${share}% of the stake, so about a ${share}% chance). The other validators check the block and vote for it. Honest work earns a small reward.`);
        }
        // Signing two different blocks for the same slot is provable cheating: slash and remove.
        const lost = Math.max(1, v.s / 32);
        slashing = 1;
        paint(`<b class="loss">${v.n} cheats</b>, signing two different blocks for the same slot. Both signatures are public, so anyone can prove it…`);
        cancel = tween(1600, () => plot.render(), () => {
          v.s -= lost;
          v.out = true;
          pick = -1;
          slashing = 0;
          paint(`<b class="loss">Slashed.</b> ${v.n} lost ${fmt(lost)} ETH of stake as an immediate penalty, more if many validators cheat together, and was forced out of the network. Cheating costs real money, which is what keeps validators honest.`);
        });
      });
    }
    function many() {
      if (cancel) cancel();
      pick = -1;
      for (let n = 0; n < 50; n++) V5[choose()].picks++;
      spins += 50;
      const T = total(),
        rows = live().map((v) => `${v.n} ${Math.round((v.s / T) * 100)}% of stake → ${v.picks} blocks`);
      paint(`<b>${spins} picks so far.</b> ${rows.join('; ')}. The more you stake, the more often you’re picked, and over many picks the counts track the stakes.`);
    }
    function reset() {
      if (cancel) cancel();
      V5 = START.map((v) => ({ ...v, picks: 0, out: false }));
      rot = 0;
      pick = -1;
      spins = 0;
      slashing = 0;
      paint('Five validators with different stakes. Spin to pick who proposes the next block.');
    }
    reset();
    return { play: () => spin(false), destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- a run on a stablecoin ---------- */
  function runSeries(kind) {
    const out = [];
    let C = 100,
      R = kind === 'full' ? 100 : kind === 'part' ? 80 : 0,
      S = 100,
      paid = 0;
    for (let t = 0; t <= 30; t++) {
      let price;
      if (t < 3) price = 1;
      else if (kind === 'algo') price = Math.min(1, (S / C) * 0.9);
      else price = kind === 'full' ? 1 - 0.003 * Math.sin(t) : Math.min(1, C > 0 ? R / C : 0);
      out.push({ t, C, R, S, price, paid });
      if (t < 3) continue;
      // Holders turn in a tenth of the remaining coins each step, for $1 each while the backing lasts.
      const x = C * 0.1;
      if (kind === 'algo') {
        S *= 0.72;
        C -= x;
        paid += x * price;
      } else {
        const pay = Math.min(x, R);
        R -= pay;
        C -= pay;
        paid += pay;
      }
    }
    return out;
  }
  V.stablePeg = function (host, p, ctx) {
    const OPTS = { full: 'Fully backed', part: 'Partly backed (80%)', algo: 'Algorithmic' };
    let kind = 'part',
      S = runSeries(kind),
      i = S.length - 1,
      cancel = null;
    const sg = SS.seg({ label: 'Backing', options: Object.keys(OPTS).map((k) => ({ v: k, label: OPTS[k] })), value: kind, onChange: (v) => ((kind = v), (S = runSeries(v)), play()) });
    const el = h('div', { class: 'plot' }),
      el2 = h('div', { class: 'plot' });
    const btn = h('button', { type: 'button', class: 'btn sm primary', onclick: () => play() }, 'Start a run');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, h('p', { class: 'plot-h' }, 'Coins out there, and what backs them (millions of dollars)'), el, h('p', { class: 'plot-h' }, 'Market price of one coin'), el2, h('div', { class: 'ctl-row' }, btn), read, h('p', { class: 'fine' }, 'A simplified simulation of a run: holders try to cash out a tenth of the remaining coins at each step.'));
    const plot = new Plot(el, {
      height: 96,
      pad: { l: 74, r: 46, t: 6, b: 6 },
      label: 'Coins in circulation versus backing',
      draw(P) {
        const C = pal(),
          s = S[i],
          back = kind === 'algo' ? s.S : s.R,
          rows = [
            ['Coins', s.C, C.accent],
            [kind === 'algo' ? 'Sister token' : 'Reserves', back, kind === 'algo' ? C.violet : C.gain],
          ];
        P.domain(0, 105, -0.5, 1.5);
        rows.forEach(([name, v, c], j) => {
          const y = 1 - j;
          P.rect(0, y - 0.32, 100, y + 0.32, alpha(C.muted, 0.12));
          P.rect(0, y - 0.32, Math.max(0, v), y + 0.32, c);
          P.text(name, P.pad.l - 8, P.Y(y), { align: 'right', color: C.ink });
          P.text('$' + fmt(v) + 'M', P.X(Math.max(0, v)) + 6, P.Y(y), { align: 'left', color: C.muted });
        });
      },
    });
    const plot2 = new Plot(el2, {
      height: (w) => (w < 480 ? 170 : 190),
      pad: { l: 46, r: 26, t: 12, b: 26 },
      label: 'The coin’s market price during the run',
      draw(P) {
        const C = pal();
        P.domain(0, 30, 0, 1.12);
        P.grid({ xTicks: [0, 10, 20, 30], xf: (v) => 'Day ' + v, yTicks: [0, 0.5, 1], yf: (v) => '$' + v.toFixed(2) });
        P.line([[0, 1], [30, 1]], { color: C.gain, width: 1.5, dash: [5, 4] });
        const pts = S.slice(0, i + 1).map((s) => [s.t, s.price]),
          bad = S[i].price < 0.97;
        P.line(pts, { color: bad ? C.loss : C.accent, width: 2.5 });
        P.dot(S[i].t, S[i].price, { color: bad ? C.loss : C.accent, r: 4 });
        if (i >= 3) P.vline(3, { color: C.warn, label: 'Panic starts', labelColor: C.warn });
      },
    });
    function paint() {
      plot.render();
      plot2.render();
      if (i < S.length - 1) return void (read.textContent = i < 3 ? 'All calm: the coin trades at $1.' : 'Everyone is trying to cash out at once…');
      const end = S[S.length - 1],
        redeemed = 100 - end.C;
      const TXT = {
        full: `<b class="gain">The peg held.</b> Every coin turned in was paid $1 from the reserves, so the coins left were still fully backed. ${fmt(redeemed)} million coins were cashed out. Even well-backed coins can wobble, though: in March 2023, USDC briefly fell to about 88 cents when part of its reserves was stuck at a failed bank, then recovered.`,
        part: `<b class="loss">The peg broke.</b> The first ${fmt(end.paid)} million coins were paid $1 each, until the reserves ran out. The other ${fmt(end.C)} million were left with nothing behind them. First in line got paid; latecomers lost everything.`,
        algo: `<b class="loss">A death spiral.</b> With no dollars in reserve, each coin was backed by a sister token. Cashing out created more sister tokens, crashing their price, which made the stablecoin less trusted, which caused more cashing out. The price ended at ${end.price < 0.01 ? 'less than a cent' : usd(end.price)}. This is roughly what happened to TerraUSD in May 2022.`,
      };
      read.innerHTML = TXT[kind];
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(4500, (k) => ((i = Math.round((S.length - 1) * k)), paint()));
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), plot.destroy(), plot2.destroy()) };
  };

  /* ---------- a liquidity pool: x × y = k ---------- */
  V.ammPool = function (host, p, ctx) {
    const POOLS = { small: { x: 100, y: 300000, label: 'Small pool' }, big: { x: 1000, y: 3000000, label: 'Big pool' } },
      FEE = 0.003;
    let key = 'small',
      sell = 10,
      cancel = null;
    const sg = SS.seg({ label: 'Pool', options: [{ v: 'small', label: 'Small pool (100 ETH)' }, { v: 'big', label: 'Big pool (1,000 ETH)' }], value: key, onChange: (v) => ((key = v), paint()) });
    const sl = slider({ id: ctx.key + '-sell', label: 'Ether you sell into the pool', min: 0, max: 50, step: 1, value: sell, fmt: (v) => v + ' ETH', onInput: (v) => (stop(), (sell = v), paint()) });
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, h('p', { class: 'plot-h' }, 'Ether in the pool (across) and dollars in the pool (up)'), el, sl.el, read, h('p', { class: 'fine' }, 'The pool keeps ether × dollars constant, after a 0.3% fee paid to the people who supplied the pool.'));
    const stop = () => (cancel && cancel(), (cancel = null));
    const trade = () => {
      const P0 = POOLS[key],
        k = P0.x * P0.y,
        dx = sell * (1 - FEE),
        dy = P0.y - k / (P0.x + dx);
      return { P0, k, dy, x1: P0.x + sell, y1: P0.y - dy, avg: sell ? dy / sell : 3000, after: (P0.y - dy) / (P0.x + sell) };
    };
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 250 : 280),
      pad: { l: 56, r: 26, t: 14, b: 30 },
      label: 'The pool’s curve: ether times dollars stays the same',
      draw(Pl) {
        const C = pal(),
          { P0, k, dy, x1, y1 } = trade(),
          xa = P0.x * 0.9,
          xb = P0.x * 1.6,
          ya = P0.y / 1.6 - P0.y * 0.04,
          yb = P0.y * 1.1;
        Pl.domain(xa, xb, ya, yb);
        Pl.grid({ xTicks: SS.niceTicks(xa, xb, 4), yTicks: SS.niceTicks(ya, yb, 4), xf: (v) => fmt(v), yf: (v) => '$' + fmt(v / 1000) + 'k' });
        Pl.line(Pl.sample((x) => k / x), { color: C.accent, width: 2.5 });
        if (sell > 0) {
          // The trade as a right triangle: ether in along the bottom, dollars out down the side.
          Pl.line([[P0.x, P0.y], [x1, P0.y]], { color: C.warn, width: 2, dash: [5, 4] });
          Pl.line([[x1, P0.y], [x1, y1]], { color: C.gain, width: 2, dash: [5, 4] });
          Pl.text(`+${sell} ETH in`, Pl.X((P0.x + x1) / 2), Pl.Y(P0.y) - 10, { color: C.warn });
          Pl.text(`−$${fmt(dy)} out`, Pl.X(x1) + 6, Pl.Y((P0.y + y1) / 2), { align: 'left', color: C.gain });
          Pl.dot(x1, y1, { color: C.loss, r: 5 });
        }
        Pl.dot(P0.x, P0.y, { color: C.accent, r: 5 });
        Pl.text('Start', Pl.X(P0.x) - 8, Pl.Y(P0.y) + 14, { align: 'right', color: C.accent });
      },
    });
    function paint() {
      plot.render();
      const { P0, dy, avg, after } = trade(),
        worse = ((3000 - avg) / 3000) * 100;
      read.innerHTML = sell
        ? `You sell <b>${sell} ETH</b> and get <b>$${fmt(dy)}</b>: an average of $${fmt(avg)} per ether, <b class="${worse > 2 ? 'loss' : ''}">${worse.toFixed(1)}% below</b> the starting $3,000 (fee included). The pool’s price is now $${fmt(after)}. ${key === 'small' ? 'In a small pool, your trade is a big share of it, so the price moves a lot.' : 'In a big pool, the same trade barely moves the price.'}`
        : `The pool holds ${fmt(P0.x)} ETH and $${fmt(P0.y)}, so one ether costs $3,000. Slide to sell some.`;
    }
    paint();
    return {
      play() {
        stop();
        cancel = tween(2400, (k) => ((sell = Math.round(20 * ease.inOut(k))), sl.set(sell), paint()));
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };
})();
