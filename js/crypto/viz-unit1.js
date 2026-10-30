/* Crypto, Explained, Unit 1 visuals: a bank's single ledger versus a shared one, Alice's double-spend attempt, a live
   SHA-256 fingerprint, a chain of blocks you can tamper with and repair, and a signature signed and checked with real
   (tiny) numbers. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, pal, alpha, tween, ease } = SS;
  const V = SS.viz;
  const CR = SS.CR;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const { circle, label, seg2, pill, cross, rrect } = CR.draw;

  /* ---------- one bank's ledger versus a shared one ---------- */
  V.ledgerSync = function (host, p, ctx) {
    const NAMES = ['Ana', 'Ben', 'Cy', 'Dee', 'Eli', 'Fay'],
      N = 6,
      EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4], [2, 5]],
      OFF_ORDER = [1, 4, 3],
      HOP = 0.55;
    let mode = 'shared',
      count = Array(N).fill(3),
      bank = 3,
      off = [],
      bankOff = false,
      made = 3,
      sender = 0,
      run = null, // the payment being animated: { t, plan }
      cancel = null;
    const sg = SS.seg({ label: 'Who keeps the ledger', options: [{ v: 'bank', label: 'One bank' }, { v: 'shared', label: 'Shared ledger' }], value: mode, onChange: (v) => (stop(), (mode = v), paint()) });
    const payBtn = h('button', { type: 'button', class: 'btn sm primary', onclick: () => pay() }, 'Send a payment');
    const offBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => toggleOff() });
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, el, h('div', { class: 'ctl-row' }, payBtn, offBtn), read, h('p', { class: 'fine' }, 'The number under each computer is how many payments its copy of the ledger holds.'));
    const stop = () => (cancel && cancel(), (cancel = null), (run = null));
    const geo = (P) => {
      const cx = P.w / 2,
        cy = P.h / 2 - 6,
        R = Math.min(P.w / 2 - 40, P.h / 2 - 54);
      return { cx, cy, R, at: (i) => [cx + R * Math.cos(-Math.PI / 2 + (i * Math.PI * 2) / N), cy + R * Math.sin(-Math.PI / 2 + (i * Math.PI * 2) / N)] };
    };
    // Plan a payment: when each computer hears about it, and along which link.
    function plan(s, r) {
      if (mode === 'bank') return { s, r, total: bankOff ? 1.6 : 1.9 };
      const hop = Array(N).fill(-1),
        from = Array(N).fill(-1),
        q = [s];
      hop[s] = 0;
      while (q.length) {
        const a = q.shift();
        EDGES.forEach(([x, y]) => {
          const b = x === a ? y : y === a ? x : -1;
          if (b >= 0 && hop[b] < 0 && !off.includes(b)) (hop[b] = hop[a] + 1), (from[b] = a), q.push(b);
        });
      }
      return { s, r, hop, from, total: Math.max(...hop) * HOP + 0.7 };
    }
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 290 : 320),
      pad: { l: 0, r: 0, t: 0, b: 0 },
      label: 'Computers and the ledger they keep',
      draw(P) {
        const C = pal(),
          k = P.c,
          G = geo(P),
          t = run ? run.t : 0,
          pl = run && run.plan;
        if (mode === 'bank') {
          for (let i = 0; i < N; i++) seg2(k, G.at(i), [G.cx, G.cy], C.line, 1.5);
          // The bank in the middle holds the only ledger.
          k.save();
          k.fillStyle = bankOff ? C.grid : C.accent;
          k.beginPath();
          rrect(k, G.cx - 30, G.cy - 26, 60, 52, 8);
          k.fill();
          k.restore();
          label(k, 'Bank', G.cx, G.cy - 9, { color: bankOff ? C.muted : C.onsolid });
          label(k, bankOff ? 'offline' : String(bank), G.cx, G.cy + 9, { color: bankOff ? C.loss : C.onsolid, size: 12, weight: 700 });
          if (pl) {
            const a = G.at(pl.s),
              b = G.at(pl.r),
              u1 = clamp01(t / 0.8),
              u2 = clamp01((t - 1.0) / 0.8);
            if (t < 0.8 || (bankOff && t < 1.6)) circle(k, lerp(a[0], G.cx, ease.inOut(u1)), lerp(a[1], G.cy, ease.inOut(u1)), 7, C.warn);
            if (bankOff && t >= 0.8) cross(k, G.cx + 38, G.cy - 30, 7, C.loss);
            if (!bankOff && t >= 1.0) circle(k, lerp(G.cx, b[0], ease.inOut(u2)), lerp(G.cy, b[1], ease.inOut(u2)), 7, C.warn);
          }
        } else {
          EDGES.forEach(([x, y]) => seg2(k, G.at(x), G.at(y), off.includes(x) || off.includes(y) ? alpha(C.line, 0.5) : C.line, 1.5, off.includes(x) || off.includes(y) ? [3, 4] : null));
          if (pl)
            for (let b = 0; b < N; b++) {
              if (pl.from[b] < 0) continue;
              const t0 = pl.hop[pl.from[b]] * HOP,
                u = clamp01((t - t0) / HOP);
              if (u > 0 && u < 1) {
                const A = G.at(pl.from[b]),
                  B = G.at(b);
                circle(k, lerp(A[0], B[0], u), lerp(A[1], B[1], u), 6, C.warn);
              }
            }
        }
        for (let i = 0; i < N; i++) {
          const [x, y] = G.at(i),
            down = mode === 'shared' && off.includes(i);
          // A ring that spreads out when this computer hears about the payment.
          const heard = pl && mode === 'shared' && pl.hop[i] >= 0 ? pl.hop[i] * HOP : null;
          if (heard != null && t > heard && t < heard + 0.5) circle(k, x, y, 20 + (t - heard) * 30, null, alpha(C.warn, 1 - (t - heard) / 0.5), 2);
          circle(k, x, y, 20, down ? C.grid : C.surface, down ? C.muted : mode === 'bank' ? C.line : C.accent, 2, down ? [3, 3] : null);
          label(k, NAMES[i], x, y, { color: down ? C.muted : C.ink });
          if (mode === 'shared') {
            const n = count[i] + (heard != null && t >= heard ? 1 : 0);
            pill(k, down ? 'off' : String(n), x, y + 31, down ? C.grid : C.accent, down ? C.muted : C.onsolid);
          }
        }
      },
    });
    function paint() {
      plot.render();
      offBtn.textContent = mode === 'bank' ? (bankOff ? 'Bank comes back' : 'Bank goes offline') : off.length >= 3 ? 'Switch them back on' : 'Switch a computer off';
      const on = N - off.length;
      if (mode === 'bank') read.innerHTML = bankOff ? `<b class="loss">The bank is offline.</b> Its ledger is the only one, so no one can pay anyone until it comes back. You also have to trust it not to freeze or change your balance.` : `<b>One bank, one ledger.</b> Every payment goes through the bank, which records it (${bank} so far). Simple, but everything depends on that one bank.`;
      else read.innerHTML = `<b>${on} of ${N} copies online.</b> ${made} payments sent, and every online copy holds all of them.${off.length ? ' The switched-off computers will catch up when they come back. The network keeps working without them.' : ' No one is in charge; every computer checks and passes on each payment.'}`;
    }
    function pay() {
      stop();
      if (mode === 'bank' && bankOff) {
        const s = sender++ % N;
        run = { t: 0, plan: plan(s, (s + 3) % N) };
        cancel = tween(run.plan.total * 1000, (k) => ((run.t = k * run.plan.total), plot.render()), () => ((run = null), paint()));
        return;
      }
      let s = sender++ % N;
      while (mode === 'shared' && off.includes(s)) s = sender++ % N;
      const pl = plan(s, (s + 3) % N);
      run = { t: 0, plan: pl };
      cancel = tween(
        pl.total * 1000,
        (k) => ((run.t = k * pl.total), plot.render()),
        () => {
          // Each mode keeps its own tally, so switching back and forth stays consistent.
          if (mode === 'bank') bank++;
          else {
            made++;
            for (let i = 0; i < N; i++) if (pl.hop[i] >= 0) count[i]++;
          }
          run = null;
          paint();
        }
      );
    }
    function toggleOff() {
      stop();
      if (mode === 'bank') bankOff = !bankOff;
      else if (off.length >= 3) {
        // Computers coming back download the payments they missed.
        const top = Math.max(...count);
        off = [];
        count = count.map(() => top);
      } else off.push(OFF_ORDER[off.length]);
      paint();
    }
    paint();
    return { play: () => pay(), destroy: () => (stop(), plot.destroy()) };
  };

  /* ---------- the double-spend attempt ---------- */
  V.doubleSpend = function (host, p, ctx) {
    let t = 1,
      cancel = null;
    const el = h('div', { class: 'plot' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Replay');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, el, h('div', { class: 'ctl-row' }, btn), read);
    const NODES = [[0.47, 0.18], [0.62, 0.34], [0.47, 0.5], [0.62, 0.66], [0.47, 0.82]],
      FIRST = ['bob', 'bob', 'bob', 'carol', 'carol'],
      ARRIVE = [0.22, 0.27, 0.33, 0.27, 0.22],
      MINER = 1;
    const STORY = [
      [0, 'Alice owns <b>one coin</b>. She signs two payments at once, sending the same coin to Bob and to Carol.'],
      [0.14, 'Both payments race across the network. Some computers hear about the payment to Bob first, others about the one to Carol.'],
      [0.4, 'For a moment the network disagrees. Then one computer bundles the payments it saw into a <b>block</b>, including the one to Bob, and shares it.'],
      [0.62, 'Every computer accepts the block, so the payment to Bob comes first. The payment to Carol is now <b class="loss">rejected: that coin is already spent.</b>'],
      [0.82, '<b class="gain">Bob gets the coin; Carol gets nothing.</b> By agreeing on one order of payments, the network stops the same coin from being spent twice.'],
    ];
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 280 : 310),
      pad: { l: 0, r: 0, t: 0, b: 0 },
      label: 'Alice tries to send the same coin to Bob and Carol',
      draw(P) {
        const C = pal(),
          k = P.c,
          W = P.w,
          H = P.h,
          A = [W * 0.11, H * 0.5],
          Bp = [W * 0.89, H * 0.2],
          Cp = [W * 0.89, H * 0.8],
          nodes = NODES.map(([x, y]) => [x * W, y * H]),
          col = { bob: C.accent, carol: C.violet },
          blockAt = t >= 0.42 ? clamp01((t - 0.42) / 0.18) : 0;
        nodes.forEach((a, i) => nodes.forEach((b, j) => j > i && Math.abs(i - j) <= 2 && seg2(k, a, b, C.line, 1.2)));
        // The two payments travel to the nearest computers.
        ['bob', 'carol'].forEach((who) => {
          nodes.forEach((n, i) => {
            const t0 = 0.12,
              t1 = ARRIVE[i] + (FIRST[i] === who ? 0 : 0.1),
              u = clamp01((t - t0) / (t1 - t0));
            if (u > 0 && u < 1) circle(k, lerp(A[0], n[0], ease.inOut(u)), lerp(A[1], n[1], ease.inOut(u)), 5, col[who]);
          });
        });
        nodes.forEach((n, i) => {
          const heard = t >= ARRIVE[i],
            agreed = blockAt >= 1 || (blockAt > 0 && Math.abs(i - MINER) <= blockAt * 4),
            c = agreed ? col.bob : heard ? col[FIRST[i]] : null;
          circle(k, n[0], n[1], 13, C.surface);
          circle(k, n[0], n[1], 13, c ? alpha(c, 0.25) : C.surface, c || C.line, 2);
        });
        if (blockAt > 0) {
          const [x, y] = nodes[MINER];
          k.save();
          k.fillStyle = C.accent;
          k.beginPath();
          rrect(k, x - 23, y - 41, 46, 22, 5);
          k.fill();
          k.restore();
          label(k, 'Block', x, y - 30, { color: C.onsolid, size: 10.5 });
        }
        // People.
        const person = (pt, name, c) => {
          circle(k, pt[0], pt[1], 24, C.surface, c, 2.5);
          label(k, name, pt[0], pt[1], { size: 11, weight: 700 });
        };
        person(A, 'Alice', C.ink);
        person(Bp, 'Bob', col.bob);
        person(Cp, 'Carol', col.carol);
        // The coin moves to Bob at the end.
        const cu = clamp01((t - 0.8) / 0.15),
          coin = t < 0.8 ? [A[0], A[1] - 34] : [lerp(A[0], Bp[0], ease.inOut(cu)), lerp(A[1] - 34, Bp[1] - 34, ease.inOut(cu))];
        circle(k, coin[0], coin[1], 10, C.gain, C.surface, 2);
        label(k, '1', coin[0], coin[1] + 0.5, { color: C.onsolid, size: 10, weight: 700 });
        if (t >= 0.62) {
          cross(k, Cp[0], Cp[1] - 38, 7, C.loss);
          label(k, 'already spent', Cp[0] - 4, Cp[1] + 36, { color: C.loss, size: 10.5, align: 'right' });
        }
        if (t >= 0.97) label(k, '+1 coin', Bp[0], Bp[1] + 36, { color: C.gain, size: 10.5 });
      },
    });
    function paint() {
      plot.render();
      read.innerHTML = STORY.filter(([s]) => t >= s).pop()[1];
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(7500, (k) => ((t = k), paint()));
    }
    paint();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- a live SHA-256 fingerprint ---------- */
  V.hashPlay = function (host, p, ctx) {
    const START = 'Alice pays Bob 5';
    let text = START,
      hash = CR.sha256(text),
      prevBits = CR.bits(hash),
      flipped = new Set(),
      u = 1,
      cancel = null;
    const input = h('input', { id: ctx.key + '-in', class: 'input cr-in', type: 'text', maxlength: '60', value: text, 'aria-label': 'Text to hash', spellcheck: 'false' });
    const chars = Array.from({ length: 64 }, () => h('span'));
    const hashEl = h('div', { class: 'cr-hash', 'aria-label': 'SHA-256 hash' }, chars);
    const el = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const oneBtn = h('button', { type: 'button', class: 'btn sm primary', onclick: () => changeOne() }, 'Change one letter');
    const resetBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => set(START, 'Back to the start: the same text gives exactly the same hash as before.') }, 'Back to the start');
    stack(host, h('label', { class: 'cr-lbl', for: input.id }, 'Your text'), input, h('p', { class: 'cr-lbl' }, 'Its SHA-256 hash: 64 characters, 256 bits'), hashEl, h('p', { class: 'cr-lbl' }, 'The same 256 bits as a picture'), el, h('div', { class: 'ctl-row' }, oneBtn, resetBtn), read);
    input.addEventListener('input', () => set(input.value));
    const plot = new Plot(el, {
      height: 84,
      pad: { l: 0, r: 0, t: 2, b: 2 },
      label: 'The hash as a grid of 256 bits',
      draw(P) {
        const C = pal(),
          k = P.c,
          bits = CR.bits(hash),
          cw = P.w / 32,
          ch = (P.h - 4) / 8;
        for (let i = 0; i < 256; i++) {
          const x = (i % 32) * cw,
            y = 2 + Math.floor(i / 32) * ch,
            on = bits[i] ? 1 : 0,
            was = prevBits[i] ? 1 : 0,
            v = lerp(was, on, ease.out(u));
          k.fillStyle = alpha(C.accent, 0.12 + 0.78 * v);
          k.fillRect(x + 1, y + 1, cw - 2, ch - 2);
          if (flipped.has(i) && u < 1) {
            k.strokeStyle = alpha(C.warn, 1 - u);
            k.lineWidth = 2;
            k.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
          }
        }
      },
    });
    function showHash(old) {
      chars.forEach((s, i) => {
        s.textContent = hash[i];
        if (old && old[i] !== hash[i]) {
          s.classList.remove('cr-flip');
          void s.offsetWidth;
          s.classList.add('cr-flip');
        }
      });
    }
    function set(next, msg) {
      const oldHash = hash,
        oldBits = CR.bits(oldHash);
      text = next;
      if (input.value !== next) input.value = next;
      hash = CR.sha256(text);
      const nb = CR.bits(hash);
      flipped = new Set(nb.map((b, i) => (b !== oldBits[i] ? i : -1)).filter((i) => i >= 0));
      prevBits = oldBits;
      showHash(oldHash);
      if (cancel) cancel();
      cancel = tween(700, (k) => ((u = k), plot.render()));
      if (msg) read.innerHTML = msg;
      else if (oldHash === hash) read.innerHTML = 'Same text, same hash.';
      else read.innerHTML = `<b>${flipped.size} of 256 bits changed.</b> About half flip for any change, however small, so the new hash looks nothing like the old one.`;
    }
    function changeOne() {
      const s = text || 'a',
        i = s.length - 1,
        c = s[i],
        n = /\d/.test(c) ? String((+c + 1) % 10) : /[a-z]/.test(c) ? c.toUpperCase() : /[A-Z]/.test(c) ? c.toLowerCase() : c === '!' ? '?' : '!',
        next = s.slice(0, i) + n;
      const oldBits = CR.bits(hash),
        nb = CR.bits(CR.sha256(next)),
        diff = nb.filter((b, j) => b !== oldBits[j]).length;
      set(next, `<b>Changed “${c}” to “${n}”: ${diff} of 256 bits flipped.</b> One character, and the hash is completely different. That’s why a hash works as a fingerprint.`);
    }
    showHash();
    read.innerHTML = 'Same text, same hash, every time. Try typing, or change one letter.';
    return {
      // Type the starting text one letter at a time, hashing as we go.
      play() {
        if (cancel) cancel();
        let shown = -1;
        cancel = tween(2000, (k) => {
          const n = Math.max(1, Math.round(START.length * k));
          if (n === shown) return;
          shown = n;
          const old = hash;
          text = START.slice(0, n);
          input.value = text;
          hash = CR.sha256(text);
          prevBits = CR.bits(hash);
          u = 1;
          showHash(old);
          plot.render();
          if (n === START.length) read.innerHTML = 'Every letter you add changes the whole hash. Now try typing, or change one letter.';
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- a chain of blocks to tamper with ---------- */
  V.chainBuild = function (host, p, ctx) {
    const ZERO = '0'.repeat(64),
      MORE = [['Fay pays Ana 2'], ['Eli pays Ben 4', 'Dee pays Cy 1']];
    const fresh = () => {
      const B = [
        { tx: ['New coins: 50 to Ana'] },
        { tx: ['Ana pays Ben 5', 'Ben pays Cy 2'] },
        { tx: ['Cy pays Dee 1', 'Ana pays Eli 3'] },
        { tx: ['Dee pays Fay 1'] },
      ];
      B.forEach((b, i) => (b.prev = i ? hashOf(B[i - 1], i - 1) : ZERO));
      return B;
    };
    const hashOf = (b, i) => CR.sha256(i + '|' + b.prev + '|' + b.tx.join(';'));
    let B = fresh(),
      tampered = false,
      rebuilt = new Set(),
      timers = [];
    const later = (ms, fn) => timers.push(setTimeout(fn, ms));
    const clear = () => (timers.forEach(clearTimeout), (timers = []));
    const chainEl = h('div', { class: 'cr-chain' });
    const tamperBtn = h('button', { type: 'button', class: 'btn sm primary', onclick: () => tamper() });
    const repairBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => repair() }, 'Cover it up');
    const addBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => add() }, 'Add a block');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('div', { class: 'ctl-row' }, tamperBtn, repairBtn, addBtn), chainEl, read);
    const links = () => B.map((b, i) => (i === 0 ? true : b.prev === hashOf(B[i - 1], i - 1)));
    const statusPill = (i, bad, firstBad) => {
      const [cls, txt] = bad ? (i === firstBad ? ['no', 'link broken'] : ['meh', 'built on a broken link']) : tampered && i === 1 ? ['meh', 'changed'] : rebuilt.has(i) ? ['meh', 'rebuilt'] : ['ok', 'valid'];
      return h('span', { class: 'cr-pill ' + cls }, txt);
    };
    function render(o = {}) {
      const L = links(),
        firstBad = L.indexOf(false);
      chainEl.replaceChildren(
        ...B.flatMap((b, i) => {
          const ok = L[i],
            bad = firstBad >= 0 && i >= firstBad,
            card = h(
              'div',
              { class: 'cr-block' + (bad ? (i === firstBad ? ' bad' : ' warn') : '') + (o.pop === i ? ' cr-pop' : ''), style: o.stagger ? { animationDelay: i * 0.18 + 's' } : null },
              h('div', { class: 'cr-bh' }, h('b', null, i === 0 ? 'Block 0 (the first)' : 'Block ' + i), statusPill(i, bad, firstBad)),
              h('ul', { class: 'cr-tx' }, b.tx.map((t) => h('li', { class: tampered && i === 1 && t.includes('50') ? 'cr-hot' : null }, t))),
              h('div', { class: 'cr-hl' + (!ok ? ' no' : '') }, h('span', null, 'Previous block’s hash'), h('code', null, i === 0 ? 'none' : CR.short(b.prev, 12))),
              h('div', { class: 'cr-hl' }, h('span', null, 'This block’s hash'), h('code', null, CR.short(hashOf(b, i), 12)))
            );
          if (o.stagger) card.classList.add('cr-pop');
          if (i === B.length - 1) return [card];
          const nextOk = L[i + 1];
          return [card, h('div', { class: 'cr-link' + (nextOk ? '' : ' no') }, nextOk ? '↓ stored in the next block: matches' : '↓ the next block stored a different hash')];
        })
      );
      tamperBtn.textContent = tampered ? 'Undo the change' : 'Change a payment in block 1';
      repairBtn.hidden = firstBad < 0;
      addBtn.disabled = B.length >= 6;
      if (o.msg) read.innerHTML = o.msg;
    }
    function tamper() {
      clear();
      if (tampered) {
        B = fresh();
        tampered = false;
        rebuilt = new Set();
        return render({ msg: 'Back to the honest chain: every link matches.' });
      }
      B[1].tx[0] = 'Ana pays Ben 50';
      tampered = true;
      render({ msg: '<b class="loss">The chain is broken.</b> Changing “5” to “50” changed block 1’s hash, so it no longer matches what block 2 stored. Every computer in the network can see it, and every block after it rests on a broken link.' });
    }
    function repair() {
      clear();
      const first = links().indexOf(false);
      if (first < 0) return;
      // Re-link each later block in turn: fixing one link changes that block's hash, which breaks the next one.
      for (let i = first; i < B.length; i++)
        later((i - first) * 700, () => {
          B[i].prev = hashOf(B[i - 1], i - 1);
          rebuilt.add(i);
          const left = B.length - 1 - i;
          render({ pop: i, msg: left ? `Rebuilt block ${i}, so its own hash changed too, and now block ${i + 1} doesn’t match. ${left} more to go…` : `<b>Covered up, but only because we skipped the hard part.</b> The cheater had to rebuild every block after the changed one (${B.length - first} here). In Bitcoin, the changed block and every rebuilt block would each need a huge amount of computing work (Unit 2), while the honest network keeps adding new blocks. The cheater can’t catch up.` });
        });
    }
    function add() {
      clear();
      const n = B.length,
        b = { tx: MORE[(n - 4) % MORE.length].slice(), prev: hashOf(B[n - 1], n - 1) };
      B.push(b);
      render({ pop: n, msg: `Block ${n} stores block ${n - 1}’s hash, locking everything before it in place.` });
    }
    render({ msg: 'Each block stores the hash of the block before it. Try changing an old payment.' });
    return {
      play: () => (clear(), render({ stagger: true })),
      destroy: clear,
    };
  };

  /* ---------- signing and checking with real (tiny) numbers ---------- */
  V.signVerify = function (host, p, ctx) {
    const { n, e, d } = CR.RSA,
      MSG = 'Alice pays Bob 5';
    let sent = null,
      timers = [];
    const later = (ms, fn) => timers.push(setTimeout(fn, ms));
    const clear = () => (timers.forEach(clearTimeout), (timers = []));
    const num = (v) => h('b', { class: 'cr-num' }, String(v));
    // replaceChildren would print a null as text, so drop the rows that aren't shown yet.
    const fill = (el, ...kids) => el.replaceChildren(...kids.filter(Boolean));
    const row = (k, v, cls) => h('div', { class: 'cr-row' + (cls ? ' ' + cls : '') }, h('span', null, k), v);
    const s1 = h('div', { class: 'cr-stage' }),
      s2 = h('div', { class: 'cr-stage' }),
      s3 = h('div', { class: 'cr-stage' }),
      f1 = h('div', { class: 'cr-flow' }),
      f2 = h('div', { class: 'cr-flow' });
    const signBtn = h('button', { type: 'button', class: 'btn sm primary', onclick: () => sign() }, 'Sign and send');
    const tamperBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => tamper() }, 'Tamper on the way');
    const forgeBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => forge() }, 'Forge a signature');
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('div', { class: 'ctl-row' }, signBtn, tamperBtn, forgeBtn), s1, f1, s2, f2, s3, read, h('p', { class: 'fine' }, '“mod 3233” means: keep only the remainder after dividing by 3233, like a clock that wraps around at 3233.'));
    const hsh = CR.digest(MSG),
      sig = CR.modpow(hsh, d, n);
    function stage1(show) {
      fill(
        s1,
        h('p', { class: 'cr-st' }, '1 · Alice signs'),
        row('Message', h('b', null, MSG)),
        show > 0 ? row('Its fingerprint (hash, shrunk to fit)', num(hsh), 'cr-pop') : null,
        show > 1 ? row('Private key (secret)', num(d), 'cr-pop') : null,
        show > 2 ? row(`Signature = ${hsh}^${d} mod ${n}`, num(sig), 'cr-pop') : null
      );
    }
    function stage2(m, s, note) {
      fill(s2, h('p', { class: 'cr-st' }, '2 · Sent across the network'), row('Message', h('b', { class: m !== MSG ? 'cr-hot' : null }, m)), row('Signature', num(s)), note ? h('p', { class: 'cr-note' }, note) : null);
    }
    function stage3(m, s, show) {
      const want = CR.digest(m),
        got = CR.modpow(s, e, n),
        ok = want === got;
      fill(
        s3,
        h('p', { class: 'cr-st' }, '3 · Anyone checks, with the public key'),
        row('Public key', h('b', null, `${e} and ${n}`)),
        show > 0 ? row(`Signature ${s}^${e} mod ${n}`, num(got), 'cr-pop') : null,
        show > 1 ? row('Fingerprint of the message received', num(want), 'cr-pop') : null,
        show > 2 ? h('p', { class: 'cr-verdict cr-pop ' + (ok ? 'ok' : 'no') }, ok ? '✓ They match: signed by the key’s owner, unchanged' : '✗ They don’t match: reject it') : null
      );
      return ok;
    }
    const flow = (f, on) => f.classList.toggle('on', !!on);
    function run(m, s, note, done) {
      stage2(m, s, note);
      flow(f1, true);
      s2.classList.add('cr-pop');
      later(500, () => flow(f2, true));
      [1, 2, 3].forEach((k) => later(500 + k * 550, () => stage3(m, s, k)));
      later(500 + 3 * 550, done);
    }
    function reset() {
      clear();
      flow(f1, false);
      flow(f2, false);
      s2.classList.remove('cr-pop');
      stage1(0);
      s2.replaceChildren(h('p', { class: 'cr-st' }, '2 · Sent across the network'), h('p', { class: 'cr-note' }, 'Nothing sent yet.'));
      s3.replaceChildren(h('p', { class: 'cr-st' }, '3 · Anyone checks, with the public key'), row('Public key', h('b', null, `${e} and ${n}`)));
    }
    function sign() {
      reset();
      read.textContent = 'Alice signs the payment with her private key…';
      [1, 2, 3].forEach((k) => later(k * 500, () => stage1(k)));
      later(1700, () =>
        run(MSG, sig, null, () => {
          sent = true;
          read.innerHTML = `<b class="gain">Valid.</b> Unlocking the signature with the public key (${sig}^${e} mod ${n}) gives back exactly the message’s fingerprint, ${hsh}. Only the private key could have made a signature that does that, and it never left Alice.`;
        })
      );
    }
    function tamper() {
      if (!sent) return sign();
      clear();
      stage1(3);
      const m = 'Alice pays Bob 50';
      read.textContent = 'Someone changes “5” to “50” on the way, but can’t change the signature to match…';
      run(m, sig, 'Changed on the way: “5” became “50”.', () => (read.innerHTML = `<b class="loss">Rejected.</b> The new message has a different fingerprint (${CR.digest(m)}), but the signature still unlocks to ${hsh}. Any change to a signed payment is caught.`));
    }
    function forge() {
      clear();
      stage1(0);
      const m = 'Alice pays Mallory 50',
        guess = 2025;
      read.textContent = 'Mallory writes a payment to herself and guesses a signature, because she doesn’t have Alice’s private key…';
      run(m, guess, 'Written by Mallory, with a guessed signature.', () => (read.innerHTML = `<b class="loss">Rejected.</b> Without the private key, Mallory can only guess, and the guess unlocks to ${CR.modpow(guess, e, n)} instead of ${CR.digest(m)}. With numbers this small a computer could find the key quickly; real keys are about 78 digits long, far beyond any computer. Bitcoin uses a different kind of math, elliptic curves, but the idea is the same.`));
    }
    reset();
    read.textContent = 'Press “Sign and send” to follow a payment from Alice to the network.';
    return { play: () => sign(), destroy: clear };
  };
})();
