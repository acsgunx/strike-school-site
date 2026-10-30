/* Strike School — interactive visuals used inside lesson steps.
   Each visual: (host, params, ctx) => { play?(), destroy?() }. ctx.key makes control ids unique. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, money, pct, usd, pal, alpha, tween, ease, MINUS } = SS;
  const V = (SS.viz = {});
  const M = 100;
  const plc = SS.plClass;
  const ph = (w) => (w < 480 ? 230 : 280);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const k$ = (v) => (v % 1 ? usd(v) : '$' + v);
  const legColor = (l, C) => (l.type === 'call' ? C.call : l.type === 'put' ? C.put : C.stock);
  const legCls = (l) => 'lg-' + l.type;

  function yDomain(vals, padFrac = 0.14) {
    let a = Math.min(0, ...vals),
      b = Math.max(0, ...vals);
    const span = b - a || 1;
    return [a - span * padFrac, b + span * padFrac];
  }
  function stack(host, ...kids) {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  }
  function replay(el, cls = 'go') {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* ---------------- payoff diagram (the workhorse) ---------------- */
  V.payoff = function (host, p, ctx) {
    const legs = p.legs,
      [lo, hi] = p.range || [80, 120];
    const A = SS.analyze(legs);
    const single = legs.length === 1 && legs[0].type !== 'stock' ? legs[0] : null;
    let S = p.S != null ? p.S : (lo + hi) / 2;
    let reveal = 0,
      cancel = null;
    const legA = legs.map(() => 0);
    const vals = [];
    for (let i = 0; i <= 200; i++) {
      const x = lo + ((hi - lo) * i) / 200;
      vals.push(SS.plExpiry(legs, x) * M);
      if (p.compareStock) vals.push((x - (p.stockFrom || 100)) * M);
      if (p.build) legs.forEach((l) => vals.push(SS.legExpiry(l, x) * M));
    }
    const [y0, y1] = yDomain(vals);
    const plotEl = h('div', { class: 'plot' });
    let legend = null;
    if (p.build || p.compareStock) {
      legend = h('div', { class: 'legend' });
      if (p.build) legs.forEach((l) => legend.append(h('span', { class: 'lg ' + legCls(l) }, h('i', { class: 'lg-sw dashed' }), SS.legLabel(l))));
      if (p.compareStock) legend.append(h('span', { class: 'lg lg-stock' }, h('i', { class: 'lg-sw dashed' }), '100 shares bought at $' + (p.stockFrom || 100)));
      legend.append(h('span', { class: 'lg ' + (single ? legCls(single) : 'lg-ink') }, h('i', { class: 'lg-sw' }), p.build ? 'Combined position' : 'Your option'));
      if (p.build) legend.append(h('button', { type: 'button', class: 'btn sm ghost', onclick: () => play() }, 'Replay build'));
    }
    const sl = slider({ id: ctx.key + '-price', label: p.sliderLabel || 'ACME price on expiration day', min: lo, max: hi, step: 0.5, value: S, fmt: (v) => usd(v), onInput: (v) => ((S = v), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const stats = h('div', { class: 'stats' });
    stack(host, plotEl, legend, sl.el, read, stats);

    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Payoff diagram at expiration',
      onScrub: (v) => {
        S = Math.round(v * 2) / 2;
        sl.set(S);
        update();
      },
      draw(P) {
        const C = pal();
        P.domain(lo, hi, y0, y1);
        P.grid({ xf: (v) => '$' + v, yf: SS.axisMoney });
        A.strikes.forEach((k, i) => P.vline(k, { color: C.muted, dash: [2, 4], label: k$(k), row: i % 2 }));
        if (p.prob) {
          const S0 = p.S0 || 100,
            days = p.days || 30,
            iv = p.iv || 0.3;
          let mx = 0;
          for (let i = 0; i <= 200; i++) mx = Math.max(mx, SS.lognPdf(lo + ((hi - lo) * i) / 200, S0, days, iv));
          const H = (y1 - y0) * 0.3;
          const pts = P.sample((x) => y0 + (SS.lognPdf(x, S0, days, iv) / mx) * H);
          P.area(pts, y0, C.muted, 0.16);
          P.line(pts, { color: C.muted, width: 1, alpha: 0.7 });
        }
        if (p.compareStock) P.line(P.sample((x) => (x - (p.stockFrom || 100)) * M), { color: C.stock, width: 2, dash: [6, 5], alpha: Math.min(1, reveal * 2) });
        if (p.build) legs.forEach((l, i) => legA[i] > 0 && P.line(P.sample((x) => SS.legExpiry(l, x) * M), { color: legColor(l, C), width: 2, dash: [5, 4], alpha: legA[i] }));
        if (reveal > 0) {
          const pts = P.sample((x) => SS.plExpiry(legs, x) * M, lo, lo + (hi - lo) * reveal, 320);
          P.fillPL(pts);
          P.line(pts, { color: single ? legColor(single, C) : C.ink, width: 3 });
        }
        if (reveal >= 1) {
          if (p.be !== false)
            A.breakevens.forEach((b) => {
              if (b <= lo || b >= hi) return;
              P.diamond(b, 0, C.ink);
              P.text('BE ' + usd(b), P.X(b), P.Y(0) + 15, { color: C.ink });
            });
          const v = SS.plExpiry(legs, S) * M;
          P.vline(S, { color: C.ink, dash: null, alpha: 0.22 });
          P.dot(S, v, { color: v >= 0 ? C.gain : C.loss });
          P.tag(money(v, { sign: true, cents: false }), P.X(S), P.Y(v), { bg: v >= 0 ? C.gain : C.loss });
        }
      },
    });

    function explain() {
      const v = SS.plExpiry(legs, S) * M;
      let txt;
      if (single) {
        const iv = SS.intrinsic(single.type, S, single.K);
        const worth = iv > 0 ? `the ${single.type} is worth ${usd(iv)}` : `the ${single.type} expires worthless`;
        txt = single.side > 0 ? `At ${usd(S)}, ${worth}. You paid ${usd(single.premium)}.` : `At ${usd(S)}, ${worth}. You collected ${usd(single.premium)}${iv > 0 ? ' but owe the difference' : ''}.`;
      } else txt = `At ${usd(S)} on expiration day:`;
      read.innerHTML = `${txt} <b class="${plc(v)}">${money(v, { sign: true, cents: false })}</b> per contract.`;
    }
    const net = A.net * M;
    stats.append(
      stat(net >= 0 ? 'Net cost' : 'Net credit', money(Math.abs(net), { cents: false })),
      stat('Max profit', isFinite(A.maxProfit) ? money(A.maxProfit * M, { cents: false }) : 'Unlimited', 'gain'),
      stat('Max loss', isFinite(A.maxLoss) ? money(A.maxLoss * M, { cents: false }) : 'Unlimited', 'loss'),
      stat(A.breakevens.length > 1 ? 'Breakevens' : 'Breakeven', A.breakevens.map((b) => usd(b)).join(' · ') || 'None')
    );
    if (p.prob) stats.append(stat('Chance of profit', pct(SS.pop(legs, p.S0 || 100, p.days || 30, p.iv || 0.3), { d: 0 })));
    function update() {
      plot.render();
      explain();
    }
    function play() {
      if (cancel) cancel();
      if (p.build) {
        const L = legs.length,
          per = 650,
          tot = L * per + 900;
        cancel = tween(tot, (k) => {
          const t = k * tot;
          legs.forEach((_, i) => (legA[i] = clamp((t - i * per) / 450, 0, 1)));
          reveal = clamp((t - L * per) / 900, 0, 1);
          plot.render();
        });
      } else
        cancel = tween(900, (k) => {
          reveal = ease.out(k);
          plot.render();
        });
    }
    explain();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------------- the house deal ---------------- */
  V.house = function (host, p, ctx) {
    const K = 300,
      fee = 5,
      lo = 220,
      hi = 400;
    let v = p.value || 340,
      reveal = 0,
      cancel = null;
    const deal = (x) => Math.max(x - K, 0) - fee,
      own = (x) => x - K;
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-call' }, h('i', { class: 'lg-sw' }), 'Your $5k option'), h('span', { class: 'lg lg-stock' }, h('i', { class: 'lg-sw dashed' }), 'Buying the house today instead'));
    const cDeal = h('div', { class: 'duo-card' }),
      cOwn = h('div', { class: 'duo-card' });
    const sl = slider({ id: ctx.key + '-house', label: 'House value in 6 months', min: lo, max: hi, step: 5, value: v, fmt: (x) => '$' + x + 'k', onInput: (x) => ((v = x), update()) });
    stack(host, plotEl, legend, sl.el, h('div', { class: 'duo' }, cDeal, cOwn), h('p', { class: 'axis-cap' }, 'Across: what the house is worth in 6 months. Up and down: your profit or loss, in thousands.'));
    const kk = (x) => (x < 0 ? MINUS : x > 0 ? '+' : '') + '$' + Math.abs(x) + 'k';
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Profit or loss of the house option',
      onScrub: (x) => {
        v = Math.round(x / 5) * 5;
        sl.set(v);
        update();
      },
      draw(P) {
        const C = pal();
        P.domain(lo, hi, -90, 110);
        P.grid({ xf: (x) => '$' + x + 'k', yf: kk });
        P.vline(K, { label: 'Locked price $300k', color: C.muted });
        P.line(P.sample(own), { color: C.stock, width: 2, dash: [6, 5], alpha: Math.min(1, reveal * 2) });
        if (reveal > 0) {
          const pts = P.sample(deal, lo, lo + (hi - lo) * reveal, 300);
          P.fillPL(pts);
          P.line(pts, { color: C.call, width: 3 });
        }
        if (reveal >= 1) {
          const d = deal(v);
          P.vline(v, { color: C.ink, dash: null, alpha: 0.22 });
          P.dot(v, own(v), { color: C.stock, r: 4 });
          P.dot(v, d, { color: d >= 0 ? C.gain : C.loss });
          P.tag(kk(d), P.X(v), P.Y(d), { bg: d >= 0 ? C.gain : C.loss });
        }
      },
    });
    function update() {
      plot.render();
      const d = deal(v),
        o = own(v);
      cDeal.innerHTML =
        `<span class="duo-l">With your $5k option</span>` +
        (v > K
          ? `<b class="${plc(d)}">${kk(d)}</b><span>Use your right: buy for $300k a house worth $${v}k.${d < 0 ? ' The fee still leaves you slightly behind.' : ''}</span>`
          : `<b class="loss">${MINUS}$5k</b><span>Walk away. You lose only the fee.</span>`);
      cOwn.innerHTML = `<span class="duo-l">If you had bought at $300k</span><b class="${plc(o)}">${kk(o)}</b><span>${o >= 0 ? 'You keep the full rise, but you tied up $300k.' : 'You absorb the whole drop.'}</span>`;
    }
    update();
    function play() {
      if (cancel) cancel();
      const end = p.value || 340;
      cancel = tween(
        800,
        (k) => {
          reveal = ease.out(k);
          plot.render();
        },
        () => {
          cancel = tween(1800, (k) => {
            v = Math.round((250 + (end - 250) * ease.inOut(k)) / 5) * 5;
            sl.set(v);
            update();
          });
        }
      );
    }
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------------- analogy mapping ---------------- */
  V.mapping = function (host) {
    const rows = [
      ['The house', 'Underlying', 'The stock the option is about'],
      ['$300,000 locked price', 'Strike price', 'The price you lock in'],
      ['6 months to decide', 'Expiration date', 'The deadline to use it'],
      ['$5,000 fee', 'Premium', 'What you pay for the right'],
    ];
    const box = h('div', { class: 'mapping' }, h('div', { class: 'map-head' }, h('span', null, 'House deal'), h('span'), h('span', null, 'Stock option')));
    const els = rows.map(([a, b, d]) => {
      const r = h('div', { class: 'map-row' }, h('span', { class: 'map-a' }, a), h('span', { class: 'map-arrow', 'aria-hidden': 'true' }), h('span', { class: 'map-b' }, h('b', null, b), h('small', null, d)));
      box.append(r);
      return r;
    });
    box.append(h('p', { class: 'fine' }, 'ACME $105 call, expiring Dec 18, premium $2.15 = underlying ACME, strike $105, expiration Dec 18, premium $2.15.'));
    host.append(box);
    return {
      play() {
        if (SS.reduced) return;
        els.forEach((r) => {
          r.style.transitionDelay = '0ms';
          r.classList.add('pre');
        });
        void box.offsetWidth;
        els.forEach((r, i) => {
          r.style.transitionDelay = i * 280 + 'ms';
          r.classList.remove('pre');
        });
      },
    };
  };

  /* ---------------- call vs put side by side ---------------- */
  V.callPut = function (host, p, ctx) {
    const lo = 80,
      hi = 120,
      K = 100,
      prem = 3;
    let S = 112,
      cancel = null,
      sl = null;
    const grid = h('div', { class: 'pair' });
    const plots = [];
    const mk = (type) => {
      const el = h('div', { class: 'plot' });
      grid.append(h('div', { class: 'pair-cell' }, h('p', { class: 'pair-h ' + type }, type === 'call' ? 'Call: right to buy at $100' : 'Put: right to sell at $100'), el, h('p', { class: 'pair-sub' }, type === 'call' ? 'Profits when ACME rises' : 'Profits when ACME falls')));
      const leg = [{ type, side: 1, K, premium: prem }];
      plots.push(
        new Plot(el, {
          height: 190,
          pad: { l: 46 },
          label: type + ' payoff',
          onScrub: (v) => {
            S = Math.round(v);
            sl.set(S);
            renderAll();
          },
          draw(P) {
            const C = pal(),
              col = type === 'call' ? C.call : C.put;
            P.domain(lo, hi, -600, 2000);
            P.grid({ xf: (v) => '$' + v, yf: SS.axisMoney, xTicks: [80, 90, 100, 110, 120], yTicks: [0, 1000, 2000] });
            const pts = P.sample((x) => SS.plExpiry(leg, x) * M);
            P.fillPL(pts);
            P.line(pts, { color: col, width: 3 });
            const v = SS.plExpiry(leg, S) * M;
            P.vline(S, { color: C.ink, dash: null, alpha: 0.22 });
            P.dot(S, v, { color: v >= 0 ? C.gain : C.loss });
            P.tag(money(v, { sign: true, cents: false }), P.X(S), P.Y(v), { bg: v >= 0 ? C.gain : C.loss });
          },
        })
      );
    };
    sl = slider({ id: ctx.key + '-cp', label: 'ACME price on expiration day', min: lo, max: hi, step: 1, value: S, fmt: (v) => '$' + v, onInput: (v) => ((S = v), renderAll()) });
    stack(host, grid, sl.el, h('p', { class: 'axis-cap' }, 'Both options have a $100 strike and cost $3.00 ($300). Up and down: profit or loss for one contract.'));
    mk('call');
    mk('put');
    function renderAll() {
      plots.forEach((pl) => pl.render());
    }
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(2600, (k) => {
          S = Math.round(84 + 32 * ease.inOut(k));
          sl.set(S);
          renderAll();
        });
      },
      destroy: () => (cancel && cancel(), plots.forEach((pl) => pl.destroy())),
    };
  };

  /* ---------------- buyer and seller ---------------- */
  V.twoSides = function (host) {
    const box = h('div', { class: 'sides' });
    box.innerHTML = `
      <div class="side side-buyer"><span class="side-tag">Buyer</span><b>Pays the premium</b><ul><li>Gets the <strong>right</strong> to buy or sell</li><li>Chooses whether to use it</li><li>Max loss: the premium</li></ul></div>
      <div class="side side-seller"><span class="side-tag">Seller (writer)</span><b>Receives the premium</b><ul><li>Takes on the <strong>obligation</strong></li><li>Must deliver if the buyer exercises</li><li>Max gain: the premium</li></ul></div>
      <div class="lanes" aria-hidden="true">
        <div class="lane"><span class="lane-end">Buyer</span><div class="track"><span class="token coin">$200 premium</span></div><span class="lane-end">Seller</span></div>
        <div class="lane"><span class="lane-end">Buyer</span><div class="track rev"><span class="token doc">The right</span></div><span class="lane-end">Seller</span></div>
      </div>
      <p class="fine">Quoted price $2.00 × 100 shares = $200 for one contract.</p>`;
    host.append(box);
    return { play: () => !SS.reduced && replay(box) };
  };

  /* ---------------- leverage bars ---------------- */
  V.leverage = function (host, p, ctx) {
    const K = p.K || 105,
      prem = p.premium || 2,
      S0 = 100;
    let S = p.S || 110,
      cancel = null;
    const rows = h('div', { class: 'lev' });
    const mkRow = (cls, title, sub) => {
      const bar = h('div', { class: 'lev-fill ' + cls });
      const val = h('div', { class: 'lev-val' });
      rows.append(h('div', { class: 'lev-row' }, h('div', { class: 'lev-h' }, h('b', null, title), h('small', null, sub)), h('div', { class: 'lev-track' }, h('span', { class: 'lev-zero' }), bar), val));
      return { bar, val };
    };
    const rs = mkRow('stock', 'Buy 100 shares', 'Costs $10,000');
    const rc = mkRow('call', `Buy one $${K} call`, `Costs $${prem * 100}`);
    const sl = slider({ id: ctx.key + '-lev', label: 'ACME price on expiration day', min: 90, max: 114, step: 1, value: S, fmt: (v) => '$' + v, onInput: (v) => ((S = v), update()) });
    stack(host, sl.el, rows, h('p', { class: 'fine' }, 'Bars show the return on the money you put in. The scale runs from −100% to +350%.'));
    function set(r, ret, dollars) {
      const span = 4.5,
        z = 1 / span,
        w = Math.min(Math.abs(ret), 3.5) / span;
      r.bar.style.left = (ret >= 0 ? z : z - w) * 100 + '%';
      r.bar.style.width = Math.max(w * 100, 0.4) + '%';
      r.bar.classList.toggle('neg', ret < 0);
      r.val.innerHTML = `<b class="${plc(ret)}">${pct(ret, { sign: true, d: 0 })}</b><small>${money(dollars, { sign: true, cents: false })}</small>`;
    }
    function update() {
      const pl = Math.max(S - K, 0) - prem;
      set(rs, (S - S0) / S0, (S - S0) * 100);
      set(rc, pl / prem, pl * 100);
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        const end = p.S || 110;
        cancel = tween(1600, (k) => {
          S = Math.round(100 + (end - 100) * ease.inOut(k));
          sl.set(S);
          update();
        });
      },
      destroy: () => cancel && cancel(),
    };
  };

  /* ---------------- call or put sorter ---------------- */
  V.sorter = function (host, p = {}) {
    const opts = p.options || [
      { k: 'call', label: 'Call' },
      { k: 'put', label: 'Put' },
    ];
    const items = p.items || [
      ['ACME reports earnings next week and you expect a big beat.', 'call', 'A call profits if the price jumps.'],
      ['You own 100 ACME shares and fear a crash next month.', 'put', 'A put sets a floor under your shares, like insurance.'],
      ['A struggling retailer keeps missing targets and you expect more slide.', 'put', 'A put gains as the price falls.'],
      ['You want to ride a rally while risking only a small, fixed amount.', 'call', 'Buying a call caps your loss at the premium.'],
      ['You expect a sector-wide sell-off after a weak jobs report.', 'put', 'Falling prices favor puts.'],
    ];
    let score = 0,
      answered = 0;
    const box = h('div', { class: 'sorter' });
    const tally = h('p', { class: 'sorter-tally', 'aria-live': 'polite' }, `0 of ${items.length} sorted`);
    items.forEach(([q, a, why]) => {
      const fb = h('p', { class: 'sort-fb' });
      const card = h('div', { class: 'sort-card' });
      const btns = opts.map((o) => h('button', { type: 'button', class: 'sort-btn ' + o.k, onclick: () => pick(o.k) }, o.label));
      card.append(h('p', { class: 'sort-q' }, q), h('div', { class: 'sort-btns' }, btns), fb);
      function pick(k) {
        if (card.dataset.done) return;
        card.dataset.done = '1';
        answered++;
        const ok = k === a;
        if (ok) score++;
        card.classList.add(ok ? 'ok' : 'no');
        btns.forEach((b) => {
          b.disabled = true;
          if (b.classList.contains(a)) b.classList.add('right');
        });
        fb.innerHTML = `<b>${ok ? 'Right.' : 'Not quite.'}</b> ${why}`;
        tally.textContent = `${answered} of ${items.length} sorted · ${score} correct`;
      }
      box.append(card);
    });
    box.append(tally);
    host.append(box);
  };

  /* ---------------- contract anatomy ---------------- */
  V.anatomy = function (host) {
    const parts = [
      ['ACME', 'Underlying', 'The stock the option is about. One contract controls 100 shares of it.'],
      ["DEC 18 '26", 'Expiration', 'The last trading day for this option. After the close that day it is either exercised or gone.'],
      ['105', 'Strike', 'The locked-in price. This call lets you buy ACME at $105, wherever ACME trades.'],
      ['CALL', 'Type', 'Call = the right to buy. Put = the right to sell.'],
      ['2.15', 'Premium', 'The price per share. One contract costs $2.15 × 100 = $215.'],
    ];
    let i = 0,
      timer = null;
    const chips = parts.map(([t, l], k) =>
      h(
        'button',
        {
          type: 'button',
          class: 'ana-chip',
          onclick: () => {
            stop();
            sel(k);
          },
        },
        h('span', { class: 'ana-t' }, t),
        h('span', { class: 'ana-l' }, l)
      )
    );
    const info = h('div', { class: 'ana-info', 'aria-live': 'polite' });
    const ticket = h('div', { class: 'ticket' }, h('div', { class: 'ticket-head' }, h('span', null, 'Order ticket'), h('span', null, 'Buy to open · 1 contract')), h('div', { class: 'ana-row' }, chips));
    const cost = h('div', { class: 'ana-cost' }, h('span', null, 'Premium $2.15'), h('span', { class: 'op' }, '×'), h('span', null, '100 shares'), h('span', { class: 'op' }, '='), h('b', null, '$215 per contract'));
    stack(host, ticket, info, cost);
    function sel(k) {
      i = k;
      chips.forEach((c, j) => c.setAttribute('aria-pressed', String(j === k)));
      info.innerHTML = `<b>${parts[k][1]}</b><p>${parts[k][2]}</p>`;
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }
    sel(0);
    return {
      play() {
        if (SS.reduced) return;
        stop();
        timer = setInterval(() => sel((i + 1) % parts.length), 2600);
      },
      destroy: stop,
    };
  };

  /* ---------------- option chain ---------------- */
  V.chain = function (host, p, ctx) {
    let S = p.S || 100,
      selK = null;
    const iv = 0.3,
      days = 30,
      strikes = [85, 90, 95, 100, 105, 110, 115];
    const wrap = h('div', { class: 'table-wrap' });
    const note = h('p', { class: 'chain-note', 'aria-live': 'polite' }, 'Tap a row to read it in plain English.');
    const sl = slider({ id: ctx.key + '-chain', label: 'ACME stock price', min: 86, max: 114, step: 0.5, value: S, fmt: (v) => usd(v), onInput: (v) => ((S = v), render()) });
    stack(host, sl.el, wrap, note, h('p', { class: 'fine' }, '30 days to expiration. Δ is delta, which you will meet in Unit 3.'));
    const q = (type, K) => {
      const b = SS.bs(type, S, K, days, iv);
      const half = Math.max(0.03, b.price * 0.02);
      return { bid: Math.max(0, SS.r2(b.price - half)), ask: SS.r2(b.price + half), d: b.delta };
    };
    function render() {
      let rows = '';
      let placed = false;
      strikes.forEach((K) => {
        if (!placed && S <= K) {
          rows += `<tr class="px-row"><td colspan="7"><span>ACME ${usd(S)}</span></td></tr>`;
          placed = true;
        }
        const c = q('call', K),
          pu = q('put', K);
        const ci = S > K ? ' itm' : '',
          pi = S < K ? ' itm' : '';
        rows += `<tr data-k="${K}" class="${selK === K ? 'sel' : ''}" tabindex="0"><td class="c${ci}">${c.bid.toFixed(2)}</td><td class="c${ci}">${c.ask.toFixed(2)}</td><td class="c d${ci}">${c.d.toFixed(2)}</td><th class="k">${K}</th><td class="p${pi}">${pu.bid.toFixed(2)}</td><td class="p${pi}">${pu.ask.toFixed(2)}</td><td class="p d${pi}">${pu.d.toFixed(2)}</td></tr>`;
      });
      if (!placed) rows += `<tr class="px-row"><td colspan="7"><span>ACME ${usd(S)}</span></td></tr>`;
      wrap.innerHTML = `<table class="chain"><thead><tr><th colspan="3" class="ch-calls">Calls</th><th class="k-head">Strike</th><th colspan="3" class="ch-puts">Puts</th></tr><tr><th>Bid</th><th>Ask</th><th>Δ</th><th></th><th>Bid</th><th>Ask</th><th>Δ</th></tr></thead><tbody>${rows}</tbody></table>`;
      if (selK != null) explain(selK);
    }
    function explain(K) {
      const c = q('call', K),
        pu = q('put', K);
      const cs = S > K ? `in the money by ${usd(S - K)}` : S < K ? `out of the money: ACME must rise ${usd(K - S)} to reach it` : 'at the money';
      const ps = S < K ? `in the money by ${usd(K - S)}` : S > K ? `out of the money: ACME must fall ${usd(S - K)} to reach it` : 'at the money';
      note.innerHTML = `<b>$${K} strike.</b> The call costs ${usd(c.ask)} to buy (${money(c.ask * 100, { cents: false })} per contract) and is ${cs}. The put costs ${usd(pu.ask)} and is ${ps}.`;
    }
    const choose = (e) => {
      const tr = e.target.closest('tr[data-k]');
      if (!tr) return;
      selK = +tr.dataset.k;
      render();
    };
    wrap.addEventListener('click', choose);
    wrap.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), choose(e)));
    render();
  };

  /* ---------------- bid / ask spread ---------------- */
  V.spread = function (host) {
    const modes = { liquid: { bid: 2.0, ask: 2.05, vol: '12,480', oi: '48,915' }, thin: { bid: 1.8, ask: 2.4, vol: '3', oi: '41' } };
    let m = 'liquid';
    const sg = seg({ label: 'Option liquidity', options: [{ v: 'liquid', label: 'Busy option' }, { v: 'thin', label: 'Thinly traded option' }], value: m, onChange: (v) => ((m = v), update()) });
    const lane = h('div', { class: 'sp-lane' });
    const band = h('div', { class: 'sp-band' });
    lane.append(band);
    const mk = (cls, label) => {
      const e = h('div', { class: 'sp-mark ' + cls }, h('span', { class: 'sp-l' }, label, ' ', h('b')));
      lane.append(e);
      return e;
    };
    const mb = mk('bid', 'Bid, you sell:'),
      ma = mk('ask', 'Ask, you buy:');
    const ticks = h('div', { class: 'sp-ticks' });
    [1.6, 1.8, 2.0, 2.2, 2.4, 2.6].forEach((t) => ticks.append(h('span', { style: { left: ((t - 1.6) / 1.0) * 100 + '%' } }, usd(t))));
    const out = h('div', { class: 'stats' });
    stack(host, sg.el, h('div', { class: 'sp-wrap' }, lane, ticks), out, h('p', { class: 'fine' }, 'Example quotes for illustration.'));
    const pos = (v) => ((v - 1.6) / 1.0) * 100 + '%';
    function update() {
      const d = modes[m],
        cost = (d.ask - d.bid) * 100;
      mb.style.left = pos(d.bid);
      ma.style.left = pos(d.ask);
      band.style.left = pos(d.bid);
      band.style.width = ((d.ask - d.bid) / 1.0) * 100 + '%';
      mb.querySelector('b').textContent = usd(d.bid);
      ma.querySelector('b').textContent = usd(d.ask);
      out.replaceChildren(
        stat('Cost of a round trip', money(cost, { cents: false }), 'loss'),
        stat('Share of the premium', pct(cost / (d.ask * 100), { d: 1 })),
        stat('Volume today', d.vol),
        stat('Open interest', d.oi)
      );
    }
    update();
  };

  /* ---------------- price by expiration ---------------- */
  V.expiryLadder = function (host) {
    const dtes = [7, 30, 60, 90, 180, 365];
    const vals = dtes.map((d) => SS.bs('call', 100, 100, d, 0.3).price);
    const max = Math.max(...vals);
    const box = h('div', { class: 'ladder' });
    const fills = dtes.map((d, i) => {
      const fill = h('div', { class: 'lad-fill' });
      const perDay = (vals[i] * 100) / d;
      box.append(h('div', { class: 'lad-col' }, h('span', { class: 'lad-v' }, usd(vals[i])), h('div', { class: 'lad-bar' }, fill), h('span', { class: 'lad-d' }, d < 365 ? d + ' days' : '1 year'), h('span', { class: 'lad-pd' }, '$' + perDay.toFixed(perDay < 10 ? 2 : 0) + '/day')));
      fill.style.height = (vals[i] / max) * 100 + '%';
      return fill;
    });
    stack(host, box, h('p', { class: 'axis-cap' }, 'ACME $100 call at IV 30%. Top: price per share. Bottom: what each day of time costs for one contract.'));
    return {
      play() {
        if (SS.reduced) return;
        fills.forEach((f) => {
          f.style.transitionDelay = '0ms';
          f.style.transform = 'scaleY(0)';
        });
        void box.offsetWidth;
        fills.forEach((f, i) => {
          f.style.transitionDelay = i * 140 + 'ms';
          f.style.transform = 'scaleY(1)';
        });
      },
    };
  };

  /* ---------------- moneyness number line ---------------- */
  V.moneyness = function (host, p, ctx) {
    const K = 100,
      lo = 80,
      hi = 120;
    let S = p.S || 106,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const cards = h('div', { class: 'duo' });
    const sl = slider({ id: ctx.key + '-mny', label: 'ACME stock price', min: lo, max: hi, step: 0.5, value: S, fmt: (v) => usd(v), onInput: (v) => ((S = v), update()) });
    stack(host, plotEl, sl.el, cards);
    const plot = new Plot(plotEl, {
      height: 180,
      pad: { l: 14, r: 14, t: 22, b: 28 },
      label: 'Moneyness of a $100 call and put',
      onScrub: (v) => {
        S = Math.round(v * 2) / 2;
        sl.set(S);
        update();
      },
      draw(P) {
        const C = pal();
        P.domain(lo, hi, 0, 2);
        P.grid({ xf: (v) => '$' + v, noYLabels: true, yTicks: [], zero: false });
        P.rect(K, 1.12, hi, 1.86, alpha(C.call, 0.18));
        P.rect(lo, 1.12, K, 1.86, alpha(C.muted, 0.07));
        P.rect(lo, 0.14, K, 0.88, alpha(C.put, 0.18));
        P.rect(K, 0.14, hi, 0.88, alpha(C.muted, 0.07));
        const yC = P.Y(1.49),
          yP = P.Y(0.51);
        P.text('Call ITM →', P.X(K) + 8, yC, { align: 'left', color: C.call });
        P.text('← Call OTM', P.X(K) - 8, yC, { align: 'right', color: C.muted });
        P.text('← Put ITM', P.X(K) - 8, yP, { align: 'right', color: C.put });
        P.text('Put OTM →', P.X(K) + 8, yP, { align: 'left', color: C.muted });
        P.vline(K, { color: C.ink, dash: [3, 3] });
        P.text('Strike $100', P.X(K), 10, { color: C.ink });
        P.vline(S, { color: C.ink, dash: null, width: 2 });
        P.tag('ACME ' + usd(S), P.X(S), P.Y(1), { dy: -10, bg: C.ink });
      },
    });
    function status(type) {
      if (Math.abs(S - K) < 0.5) return ['atm', 'At the money', 0];
      const d = type === 'call' ? S - K : K - S;
      return d > 0 ? ['itm', 'In the money', d] : ['otm', 'Out of the money', 0];
    }
    function update() {
      plot.render();
      cards.replaceChildren(
        ...['call', 'put'].map((t) => {
          const [cls, full, iv] = status(t);
          return h('div', { class: 'duo-card' }, h('span', { class: 'duo-l' }, `$100 ${t}`), h('b', { class: 'mny ' + cls }, full), h('span', null, iv > 0 ? `Intrinsic value ${usd(iv)} a share, or ${money(iv * 100, { cents: false })} a contract.` : 'No intrinsic value: exercising now would gain nothing.'));
        })
      );
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        const end = p.S || 106;
        cancel = tween(2400, (k) => {
          const t = ease.inOut(k);
          S = Math.round((k < 0.5 ? 92 + 20 * (t * 2) : 112 - (112 - end) * (t * 2 - 1)) * 2) / 2;
          sl.set(S);
          update();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------------- compare several positions ---------------- */
  V.compare = function (host, p, ctx) {
    const [lo, hi] = p.range;
    let S = p.S,
      reveal = 0,
      cancel = null;
    const alts = p.alts.map((a, i) => Object.assign({}, a, { col: ['violet', 'call', 'put'][i % 3], A: SS.analyze(a.legs) }));
    const vals = [];
    alts.forEach((a) => {
      for (let i = 0; i <= 120; i++) vals.push(SS.plExpiry(a.legs, lo + ((hi - lo) * i) / 120) * M);
    });
    const [y0, y1] = yDomain(vals, 0.1);
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, alts.map((a) => h('span', { class: 'lg lg-' + a.col }, h('i', { class: 'lg-sw' }), a.label)));
    const sl = slider({ id: ctx.key + '-cmp', label: 'ACME price on expiration day', min: lo, max: hi, step: 0.5, value: S, fmt: (v) => usd(v), onInput: (v) => ((S = v), update()) });
    const tbl = h('div', { class: 'table-wrap' });
    stack(host, plotEl, legend, sl.el, tbl);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Payoff comparison',
      onScrub: (v) => {
        S = Math.round(v * 2) / 2;
        sl.set(S);
        update();
      },
      draw(P) {
        const C = pal();
        P.domain(lo, hi, y0, y1);
        P.grid({ xf: (v) => '$' + v, yf: SS.axisMoney });
        alts.forEach((a) => P.line(P.sample((x) => SS.plExpiry(a.legs, x) * M, lo, lo + (hi - lo) * reveal, 300), { color: C[a.col], width: 3 }));
        if (reveal >= 1) {
          P.vline(S, { color: C.ink, dash: null, alpha: 0.22 });
          alts.forEach((a) => P.dot(S, SS.plExpiry(a.legs, S) * M, { color: C[a.col], r: 4.5 }));
        }
      },
    });
    function update() {
      plot.render();
      const rows = alts
        .map((a) => {
          const cost = a.A.net * M,
            v = SS.plExpiry(a.legs, S) * M;
          return `<tr><th><i class="sw sw-${a.col}"></i>${a.label}</th><td>${money(cost, { cents: false })}</td><td>${a.A.breakevens.map((b) => usd(b)).join(', ') || '—'}</td><td class="${plc(v)}">${money(v, { sign: true, cents: false })}</td><td class="${plc(v)}">${cost > 0 ? pct(v / cost, { sign: true, d: 0 }) : '—'}</td></tr>`;
        })
        .join('');
      tbl.innerHTML = `<table class="cmp"><thead><tr><th>Position</th><th>Cost</th><th>Breakeven</th><th>P&amp;L at ${usd(S)}</th><th>Return</th></tr></thead><tbody>${rows}</tbody></table>`;
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(1000, (k) => {
          reveal = ease.out(k);
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------------- intrinsic vs time value ---------------- */
  V.valueStack = function (host, p, ctx) {
    const K = 100,
      iv = 0.3,
      lo = 80,
      hi = 120,
      maxV = 24;
    let S = p.S || 106,
      days = p.days != null ? p.days : 30,
      type = 'call',
      cancel = null;
    const sg = seg({ label: 'Option type', options: [{ v: 'call', label: '$100 call' }, { v: 'put', label: '$100 put' }], value: type, onChange: (v) => ((type = v), update()) });
    const plotEl = h('div', { class: 'plot' });
    const sS = slider({ id: ctx.key + '-vs-s', label: 'ACME stock price', min: lo, max: hi, step: 0.5, value: S, fmt: (v) => usd(v), onInput: (v) => ((S = v), update()) });
    const sD = slider({ id: ctx.key + '-vs-d', label: 'Days to expiration', min: 0, max: 90, step: 1, value: days, fmt: (v) => v + (v === 1 ? ' day' : ' days'), onInput: (v) => ((days = v), update()) });
    const barI = h('span', { class: 'vs-i' }),
      barT = h('span', { class: 'vs-t' });
    const bar = h('div', { class: 'vs-bar', 'aria-hidden': 'true' }, barI, barT);
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-stock' }, h('i', { class: 'lg-sw' }), 'Intrinsic value'), h('span', { class: 'lg lg-call' }, h('i', { class: 'lg-sw' }), 'Market price'), h('span', { class: 'lg lg-accent' }, h('i', { class: 'lg-sw block' }), 'Time value'));
    const controls = p.focusDays ? [sD.el, sS.el] : [sS.el, sD.el];
    stack(host, sg.el, plotEl, legend, ...controls, bar, read);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Option price versus intrinsic value',
      onScrub: (v) => {
        S = Math.round(v * 2) / 2;
        sS.set(S);
        update();
      },
      draw(P) {
        const C = pal(),
          col = type === 'call' ? C.call : C.put;
        P.domain(lo, hi, 0, maxV);
        P.grid({ xf: (v) => '$' + v, yf: (v) => '$' + v });
        const intr = P.sample((x) => SS.intrinsic(type, x, K));
        const price = P.sample((x) => SS.bs(type, x, K, days, iv).price);
        P.between(price, intr, C.accent, 0.2);
        P.line(intr, { color: C.stock, width: 2 });
        P.line(price, { color: col, width: 3 });
        P.vline(K, { color: C.muted, dash: [2, 4], label: 'Strike $100' });
        const pr = SS.bs(type, S, K, days, iv).price;
        P.vline(S, { color: C.ink, dash: null, alpha: 0.22 });
        P.dot(S, pr, { color: col });
        P.tag(usd(pr), P.X(S), P.Y(pr), { bg: col });
      },
    });
    function update() {
      plot.render();
      const pr = SS.bs(type, S, K, days, iv).price,
        it = SS.intrinsic(type, S, K),
        tv = Math.max(0, pr - it);
      barI.style.width = (it / maxV) * 100 + '%';
      barT.style.width = (tv / maxV) * 100 + '%';
      barI.textContent = it >= 1.5 ? usd(it) : '';
      barT.textContent = tv >= 1.5 ? usd(tv) : '';
      read.innerHTML = `Premium <b>${usd(pr)}</b> = intrinsic <b>${usd(it)}</b> + time value <b class="accent">${usd(tv)}</b>${days === 0 ? '. Expiration day: no time value left.' : '.'}`;
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        if (p.focusDays) {
          const from = p.days || 45;
          cancel = tween(2800, (k) => {
            days = Math.round(from * (1 - ease.inOut(k)));
            sD.set(days);
            update();
          });
        } else {
          const end = p.S || 100;
          cancel = tween(2600, (k) => {
            const t = ease.inOut(k);
            S = Math.round((k < 0.5 ? 84 + 32 * (t * 2) : 116 - (116 - end) * (t * 2 - 1)) * 2) / 2;
            sS.set(S);
            update();
          });
        }
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------------- time decay ---------------- */
  V.theta = function (host, p, ctx) {
    const S0 = 100,
      iv = 0.3,
      D = p.from || 90;
    const defs = { itm: { K: 90, label: 'ITM $90 call', col: 'violet' }, atm: { K: 100, label: 'ATM $100 call', col: 'call' }, otm: { K: 110, label: 'OTM $110 call', col: 'put' } };
    const curves = (p.curves || ['atm']).map((k) => defs[k]);
    const val = (K, d) => SS.bs('call', S0, K, d, iv).price;
    const ymax = Math.max(...curves.map((c) => val(c.K, D))) * 1.12;
    const atm0 = val(100, D);
    let day = D,
      cancel = null;
    const decayMax = val(100, 1) - val(100, 0);
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, curves.map((c) => h('span', { class: 'lg lg-' + c.col }, h('i', { class: 'lg-sw' }), c.label)), h('span', { class: 'lg lg-loss' }, h('i', { class: 'lg-sw block' }), 'Value lost that day (ATM)'));
    const ice = h('div', { class: 'ice' }, h('span', { class: 'ice-cube' }), h('span', { class: 'puddle' }));
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const playBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Play');
    const sl = slider({ id: ctx.key + '-th', label: 'Days left', min: 0, max: D, step: 1, value: day, fmt: (v) => v + (v === 1 ? ' day' : ' days'), onInput: (v) => (stopAnim(), (day = v), update()) });
    stack(host, plotEl, legend, h('div', { class: 'ctl-row' }, playBtn, sl.el), h('div', { class: 'ice-row' }, ice, read));
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Option value as expiration approaches',
      onScrub: (v) => {
        stopAnim();
        day = Math.round(v);
        sl.set(day);
        update();
      },
      draw(P) {
        const C = pal();
        P.domain(D, 0, 0, ymax);
        P.grid({ xf: (v) => v + 'd', yf: (v) => '$' + v });
        // daily decay bars for the ATM option, along the bottom 26% of the chart
        const H = ymax * 0.26;
        for (let d = D; d > day; d--) {
          const loss = val(100, d) - val(100, d - 1);
          P.rect(d - 0.15, 0, d - 0.85, (loss / decayMax) * H, alpha(C.loss, 0.55));
        }
        curves.forEach((c) => {
          const pts = P.sample((d) => val(c.K, d), D, 0, 300);
          P.line(pts, { color: C[c.col], width: 1.5, alpha: 0.25 });
          P.line(
            pts.filter(([d]) => d >= day),
            { color: C[c.col], width: 3 }
          );
          const v = val(c.K, day);
          P.dot(day, v, { color: C[c.col], r: 4.5 });
        });
        P.vline(day, { color: C.ink, dash: null, alpha: 0.2 });
      },
    });
    function update() {
      plot.render();
      const v = val(100, day),
        lossToday = day < D ? val(100, day + 1) - v : 0;
      const frac = atm0 ? v / atm0 : 0;
      ice.style.setProperty('--melt', frac.toFixed(3));
      read.innerHTML =
        day === 0
          ? `<b>Expiration.</b> The ATM call is worth ${usd(0)}: every cent of time value has melted.`
          : `<b>${day} days left.</b> ATM call worth <b>${usd(v)}</b>${day < D ? `, lost <b class="loss">${usd(lossToday)}</b> in the last day` : ''}. ${Math.round((1 - frac) * 100)}% of its value is gone.`;
    }
    function stopAnim() {
      if (cancel) cancel();
      cancel = null;
    }
    function play() {
      stopAnim();
      cancel = tween(Math.max(2600, D * 55), (k) => {
        day = Math.round(D * (1 - k));
        sl.set(day);
        update();
      });
    }
    update();
    return { play, destroy: () => (stopAnim(), plot.destroy()) };
  };

  /* ---------------- volatility distribution ---------------- */
  V.vol = function (host, p, ctx) {
    const S0 = 100,
      K = 110,
      days = 30,
      lo = 60,
      hi = 145;
    let iv = p.iv || 0.3,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const sl = slider({ id: ctx.key + '-vol', label: 'Volatility (IV)', min: 10, max: 100, step: 1, value: Math.round(iv * 100), fmt: (v) => v + '%', onInput: (v) => (stopAnim(), (iv = v / 100), update()) });
    const out = h('div', { class: 'stats' });
    stack(host, plotEl, sl.el, out, h('p', { class: 'axis-cap' }, 'The hill is the model’s spread of possible ACME prices in 30 days, starting from $100.'));
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Distribution of possible prices',
      draw(P) {
        const C = pal();
        P.domain(lo, hi, 0, 0.15);
        P.grid({ xf: (v) => '$' + v, noYLabels: true, yTicks: [0.05, 0.1], zero: false });
        const pdf = (x) => SS.lognPdf(x, S0, days, iv);
        const all = P.sample(pdf, lo, hi, 300);
        P.area(all, 0, C.muted, 0.14);
        P.area(P.sample(pdf, K, hi, 200), 0, C.call, 0.4);
        P.line(all, { color: C.ink, width: 2 });
        P.vline(K, { color: C.call, dash: [3, 3], label: '$110 strike' });
        P.vline(S0, { color: C.muted, dash: [2, 4], label: 'Today $100', row: 1 });
        if (p.showMove) {
          const mv = S0 * iv * Math.sqrt(days / 365),
            y = 0.128;
          const a = P.X(S0 - mv),
            b = P.X(S0 + mv),
            c = P.c;
          c.save();
          c.strokeStyle = C.ink;
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(a, P.Y(y) - 5);
          c.lineTo(a, P.Y(y) + 5);
          c.moveTo(a, P.Y(y));
          c.lineTo(b, P.Y(y));
          c.moveTo(b, P.Y(y) - 5);
          c.lineTo(b, P.Y(y) + 5);
          c.stroke();
          c.restore();
          P.text('±' + usd(mv) + ' typical move', (a + b) / 2, P.Y(y) - 11, { color: C.ink });
        }
      },
    });
    function update() {
      plot.render();
      const call100 = SS.bs('call', S0, 100, days, iv).price,
        call110 = SS.bs('call', S0, K, days, iv);
      out.replaceChildren(
        stat('$100 call price', usd(call100)),
        stat('$110 call price', usd(call110.price)),
        stat('Chance ACME ends above $110', pct(call110.prob, { d: 0 }), 'accent'),
        stat('Typical 30-day move', '±' + usd(S0 * iv * Math.sqrt(days / 365)))
      );
    }
    function stopAnim() {
      if (cancel) cancel();
      cancel = null;
    }
    update();
    return {
      play() {
        stopAnim();
        const end = p.iv || 0.3;
        cancel = tween(2600, (k) => {
          iv = k < 0.6 ? 0.12 + 0.48 * ease.inOut(k / 0.6) : 0.6 - (0.6 - end) * ease.inOut((k - 0.6) / 0.4);
          sl.set(Math.round(iv * 100));
          update();
        });
      },
      destroy: () => (stopAnim(), plot.destroy()),
    };
  };

  /* ---------------- IV crush ---------------- */
  V.ivCrush = function (host, p, ctx) {
    const S0 = 100,
      K = 100,
      ivB = 0.8,
      ivA = 0.3,
      dB = 7,
      dA = 6,
      scale = 16;
    const before = SS.bs('call', S0, K, dB, ivB).price;
    let move = 0.03,
      ivNow = ivA,
      cancel = null;
    const after = () => SS.bs('call', S0 * (1 + move), K, dA, ivNow).price;
    let lo = 0,
      hi = 0.5;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (SS.bs('call', S0 * (1 + mid), K, dA, ivA).price < before) lo = mid;
      else hi = mid;
    }
    const beMove = (lo + hi) / 2;
    const sl = slider({ id: ctx.key + '-crush', label: 'Earnings reaction', min: -10, max: 15, step: 0.5, value: move * 100, fmt: (v) => (v > 0 ? '+' : v < 0 ? MINUS : '') + Math.abs(v).toFixed(1) + '%', onInput: (v) => ((move = v / 100), update()) });
    const mkBar = (label) => {
      const fill = h('div', { class: 'cr-fill' }),
        val = h('b');
      return { row: h('div', { class: 'cr-row' }, h('span', { class: 'cr-l' }, label), h('div', { class: 'cr-track' }, fill), val), fill, val };
    };
    const bB = mkBar('Before earnings'),
      bA = mkBar('After earnings');
    bB.fill.classList.add('before');
    const ivGauge = h('div', { class: 'iv-gauge' }, h('span', { class: 'iv-l' }, 'Implied volatility'), h('div', { class: 'iv-track' }, h('div', { class: 'iv-fill' })), h('b', { class: 'iv-v' }));
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Replay earnings');
    stack(host, ivGauge, h('div', { class: 'cr' }, bB.row, bA.row), sl.el, read, h('div', { class: 'ctl-row' }, btn));
    function update() {
      const a = after();
      bB.fill.style.width = (before / scale) * 100 + '%';
      bB.val.textContent = usd(before);
      bA.fill.style.width = Math.min(100, (a / scale) * 100) + '%';
      bA.val.textContent = usd(a);
      bA.fill.classList.toggle('up', a >= before);
      ivGauge.querySelector('.iv-fill').style.width = ivNow * 100 + '%';
      ivGauge.querySelector('.iv-v').textContent = Math.round(ivNow * 100) + '%';
      const pl = (a - before) * 100;
      read.innerHTML = `You paid <b>${usd(before)}</b> at IV 80%. After a ${move >= 0 ? '+' : MINUS}${Math.abs(move * 100).toFixed(1)}% move and IV at ${Math.round(ivNow * 100)}%, the call is worth <b>${usd(a)}</b>: <b class="${plc(pl)}">${money(pl, { sign: true, cents: false })}</b> per contract. You needed a jump of about <b>+${(beMove * 100).toFixed(1)}%</b> just to break even.`;
    }
    function play() {
      if (cancel) cancel();
      ivNow = ivB;
      update();
      cancel = tween(1500, (k) => {
        ivNow = ivB - (ivB - ivA) * ease.inOut(k);
        update();
      });
    }
    update();
    return { play, destroy: () => cancel && cancel() };
  };

  /* ---------------- delta as slope ---------------- */
  V.delta = function (host, p, ctx) {
    const K = 100,
      iv = 0.3,
      lo = 80,
      hi = 120;
    let S = p.S || 100,
      days = p.days || 30,
      type = 'call',
      cancel = null;
    const sg = seg({ label: 'Option type', options: [{ v: 'call', label: '$100 call' }, { v: 'put', label: '$100 put' }], value: type, onChange: (v) => ((type = v), update()) });
    const plotEl = h('div', { class: 'plot' });
    const sS = slider({ id: ctx.key + '-dl-s', label: 'ACME stock price', min: lo, max: hi, step: 0.5, value: S, fmt: (v) => usd(v), onInput: (v) => ((S = v), update()) });
    const sD = slider({ id: ctx.key + '-dl-d', label: 'Days to expiration', min: 1, max: 90, step: 1, value: days, fmt: (v) => v + (v === 1 ? ' day' : ' days'), onInput: (v) => ((days = v), update()) });
    const fill = h('div', { class: 'dm-fill' });
    const meter = h('div', { class: 'dmeter' }, h('span', { class: 'dm-end' }, MINUS + '1'), h('div', { class: 'dm-track' }, h('span', { class: 'dm-zero' }), fill), h('span', { class: 'dm-end' }, '+1'));
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, sS.el, sD.el, meter, read);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Option price with tangent line showing delta',
      onScrub: (v) => {
        S = Math.round(v * 2) / 2;
        sS.set(S);
        update();
      },
      draw(P) {
        const C = pal(),
          col = type === 'call' ? C.call : C.put;
        P.domain(lo, hi, 0, 24);
        P.grid({ xf: (v) => '$' + v, yf: (v) => '$' + v });
        P.line(P.sample((x) => SS.intrinsic(type, x, K)), { color: C.stock, width: 1.5, alpha: 0.6 });
        P.line(P.sample((x) => SS.bs(type, x, K, days, iv).price), { color: col, width: 3 });
        const b = SS.bs(type, S, K, days, iv);
        P.line([[S - 12, b.price - 12 * b.delta], [S + 12, b.price + 12 * b.delta]], { color: C.ink, width: 1.75, dash: [6, 4] });
        P.dot(S, b.price, { color: col });
        P.tag('Δ ' + b.delta.toFixed(2), P.X(S), P.Y(b.price), { bg: C.ink });
      },
    });
    function update() {
      plot.render();
      const b = SS.bs(type, S, K, days, iv),
        d = b.delta;
      fill.style.left = (d >= 0 ? 50 : 50 + d * 50) + '%';
      fill.style.width = Math.abs(d) * 50 + '%';
      fill.className = 'dm-fill ' + type;
      let txt = `<b>Delta ${d.toFixed(2)}.</b> If ACME rises $1, this ${type} ${d >= 0 ? 'gains' : 'loses'} about <b>${usd(Math.abs(d))}</b> a share (${money(Math.abs(d) * 100, { cents: false })} a contract).`;
      if (p.showProb) txt += ` Rough odds of finishing in the money: <b>${Math.round(Math.abs(d) * 100)}%</b>. The model's exact estimate is ${Math.round(b.prob * 100)}%.`;
      if (p.gammaNote) txt += ` Gamma is <b>${b.gamma.toFixed(3)}</b>, so after a $1 rise delta becomes about ${(d + b.gamma).toFixed(2)}.`;
      read.innerHTML = txt;
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        const end = p.S || 100;
        cancel = tween(2400, (k) => {
          const t = ease.inOut(k);
          S = Math.round((k < 0.5 ? 86 + 28 * (t * 2) : 114 - (114 - end) * (t * 2 - 1)) * 2) / 2;
          sS.set(S);
          update();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------------- delta as shares ---------------- */
  V.deltaShares = function (host, p, ctx) {
    const K = 100,
      days = 30,
      iv = 0.3;
    let S = 104,
      type = 'call',
      cancel = null;
    const sg = seg({ label: 'Option type', options: [{ v: 'call', label: '$100 call' }, { v: 'put', label: '$100 put' }], value: type, onChange: (v) => ((type = v), update()) });
    const sl = slider({ id: ctx.key + '-ds', label: 'ACME stock price', min: 80, max: 120, step: 0.5, value: S, fmt: (v) => usd(v), onInput: (v) => ((S = v), update()) });
    const grid = h('div', { class: 'shares-grid', 'aria-hidden': 'true' });
    const cells = [];
    for (let i = 0; i < 100; i++) {
      const c = h('span', { class: 'cell' });
      c.style.transitionDelay = i * 3 + 'ms';
      cells.push(c);
      grid.append(c);
    }
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, sl.el, h('div', { class: 'shares-wrap' }, grid, read));
    function update() {
      const d = SS.bs(type, S, K, days, iv).delta,
        n = Math.round(Math.abs(d) * 100);
      cells.forEach((c, i) => (c.className = 'cell' + (i < n ? ' on ' + type : '')));
      read.innerHTML = `<span class="big ${type}">${n}</span><span>${type === 'call' ? `Delta ${d.toFixed(2)}: one contract moves like <b>owning ${n} shares</b>.` : `Delta ${d.toFixed(2)}: one contract moves like <b>being short ${n} shares</b>.`}</span>`;
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(2000, (k) => {
          S = Math.round((88 + 24 * ease.inOut(k)) * 2) / 2;
          sl.set(S);
          update();
        });
      },
      destroy: () => cancel && cancel(),
    };
  };

  /* ---------------- gamma ---------------- */
  V.gamma = function (host, p, ctx) {
    const K = 100,
      iv = 0.3,
      lo = 80,
      hi = 120;
    let days = p.days || 30,
      S = 100,
      cancel = null;
    const top = h('div', { class: 'plot' }),
      bot = h('div', { class: 'plot' });
    const playBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Play: run the clock');
    const sD = slider({ id: ctx.key + '-g-d', label: 'Days to expiration', min: 1, max: 90, step: 1, value: days, fmt: (v) => v + (v === 1 ? ' day' : ' days'), onInput: (v) => (stopAnim(), (days = v), update()) });
    const sS = slider({ id: ctx.key + '-g-s', label: 'ACME stock price', min: lo, max: hi, step: 0.5, value: S, fmt: (v) => usd(v), onInput: (v) => ((S = v), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('p', { class: 'plot-h' }, 'Delta of the $100 call'), top, h('p', { class: 'plot-h' }, 'Gamma: how fast delta changes'), bot, h('div', { class: 'ctl-row' }, playBtn, sD.el), sS.el, read);
    const scrub = (v) => {
      S = Math.round(v * 2) / 2;
      sS.set(S);
      update();
    };
    const pTop = new Plot(top, {
      height: 160,
      label: 'Delta across stock prices',
      onScrub: scrub,
      draw(P) {
        const C = pal();
        P.domain(lo, hi, 0, 1);
        P.grid({ xf: (v) => '$' + v, yf: (v) => v.toFixed(1), yTicks: [0, 0.5, 1] });
        P.vline(K, { color: C.muted, dash: [2, 4] });
        P.line(P.sample((x) => SS.bs('call', x, K, days, iv).delta), { color: C.call, width: 3 });
        const d = SS.bs('call', S, K, days, iv).delta;
        P.dot(S, d, { color: C.call });
      },
    });
    const pBot = new Plot(bot, {
      height: 140,
      label: 'Gamma across stock prices',
      onScrub: scrub,
      draw(P) {
        const C = pal();
        P.domain(lo, hi, 0, 0.28);
        P.grid({ xf: (v) => '$' + v, yf: (v) => v.toFixed(2), yTicks: [0, 0.1, 0.2] });
        P.vline(K, { color: C.muted, dash: [2, 4] });
        const pts = P.sample((x) => SS.bs('call', x, K, days, iv).gamma, lo, hi, 300);
        P.area(pts, 0, C.violet, 0.22);
        P.line(pts, { color: C.violet, width: 2.5 });
        P.dot(S, SS.bs('call', S, K, days, iv).gamma, { color: C.violet, r: 4 });
      },
    });
    function update() {
      pTop.render();
      pBot.render();
      const b = SS.bs('call', S, K, days, iv);
      read.innerHTML = `At ${usd(S)} with <b>${days} ${days === 1 ? 'day' : 'days'}</b> left: delta <b>${b.delta.toFixed(2)}</b>, gamma <b>${b.gamma.toFixed(3)}</b>. A $1 rise would push delta to about ${Math.min(1, b.delta + b.gamma).toFixed(2)}.`;
    }
    function stopAnim() {
      if (cancel) cancel();
      cancel = null;
    }
    function play() {
      stopAnim();
      cancel = tween(3600, (k) => {
        days = Math.max(1, Math.round(90 - 89 * ease.inOut(k)));
        sD.set(days);
        update();
      });
    }
    update();
    return { play: p.autoplay ? play : () => {}, destroy: () => (stopAnim(), pTop.destroy(), pBot.destroy()) };
  };

  /* ---------------- greeks dashboard ---------------- */
  V.greeks = function (host, p, ctx) {
    let type = 'call',
      S = 100,
      K = 100,
      days = 30,
      iv = 0.3;
    const sg = seg({ label: 'Option type', options: [{ v: 'call', label: 'Call' }, { v: 'put', label: 'Put' }], value: type, onChange: (v) => ((type = v), update()) });
    const sS = slider({ id: ctx.key + '-gk-s', label: 'Stock price', min: 50, max: 150, step: 1, value: S, fmt: (v) => '$' + v, onInput: (v) => ((S = v), update()) });
    const sK = slider({ id: ctx.key + '-gk-k', label: 'Strike', min: 50, max: 150, step: 1, value: K, fmt: (v) => '$' + v, onInput: (v) => ((K = v), update()) });
    const sD = slider({ id: ctx.key + '-gk-d', label: 'Days to expiration', min: 1, max: 365, step: 1, value: days, fmt: (v) => v + (v === 1 ? ' day' : ' days'), onInput: (v) => ((days = v), update()) });
    const sV = slider({ id: ctx.key + '-gk-v', label: 'Implied volatility', min: 5, max: 150, step: 1, value: 30, fmt: (v) => v + '%', onInput: (v) => ((iv = v / 100), update()) });
    const price = h('div', { class: 'g-price' });
    const cards = h('div', { class: 'gcards' });
    const wi = h('div', { class: 'whatif' });
    const wiOut = h('p', { class: 'wi-out', 'aria-live': 'polite' }, 'Pick a nudge to compare the Greeks’ estimate with the real repriced option.');
    const controls = h('div', { class: 'g-controls' }, sS.el, sK.el, sD.el, sV.el);
    if (p.whatIf) {
      const nudges = [
        ['+$1 stock', (b) => b.delta, () => SS.bs(type, S + 1, K, days, iv).price, 'delta'],
        ['+$5 stock', (b) => b.delta * 5, () => SS.bs(type, S + 5, K, days, iv).price, 'delta × 5'],
        ['One day passes', (b) => b.theta, () => SS.bs(type, S, K, Math.max(0, days - 1), iv).price, 'theta'],
        ['IV +1 point', (b) => b.vega, () => SS.bs(type, S, K, days, iv + 0.01).price, 'vega'],
      ];
      nudges.forEach(([label, est, act, why]) =>
        wi.append(
          h(
            'button',
            {
              type: 'button',
              class: 'btn sm',
              onclick: () => {
                const b = SS.bs(type, S, K, days, iv),
                  e = est(b),
                  a = act() - b.price;
                let extra = '';
                if (label === '+$5 stock') extra = ` Adding gamma (½ × Γ × 5²) gives ${usd(e + 0.5 * b.gamma * 25)}, much closer.`;
                wiOut.innerHTML = `<b>${label}.</b> Greeks predicted <b>${e >= 0 ? '+' : ''}${usd(e)}</b> (from ${why}). Actual change: <b>${a >= 0 ? '+' : ''}${usd(a)}</b>.${extra}`;
              },
            },
            label
          )
        )
      );
    }
    stack(host, sg.el, price, cards, p.whatIf ? h('div', { class: 'wi-wrap' }, h('p', { class: 'plot-h' }, 'Nudge the inputs'), wi, wiOut) : null, controls);
    function update() {
      const b = SS.bs(type, S, K, days, iv);
      price.innerHTML = `<span class="g-price-l">${type === 'call' ? 'Call' : 'Put'} price</span><b>${usd(b.price)}</b><span>a share · ${money(b.price * 100)} a contract</span>`;
      const gains = (v) => (v >= 0 ? 'gains' : 'loses');
      const rows = [
        ['Δ', 'Delta', b.delta.toFixed(3), `Stock +$1 → option ${gains(b.delta)} about ${usd(Math.abs(b.delta))}.`],
        ['Γ', 'Gamma', b.gamma.toFixed(4), `Stock +$1 → delta moves from ${b.delta.toFixed(2)} to about ${(b.delta + b.gamma).toFixed(2)}.`],
        ['Θ', 'Theta', b.theta.toFixed(3), `One day passes → option ${gains(b.theta)} about ${usd(Math.abs(b.theta))} (${money(Math.abs(b.theta) * 100)} a contract).`],
        ['ν', 'Vega', b.vega.toFixed(3), `IV +1 point → option ${gains(b.vega)} about ${usd(Math.abs(b.vega))}.`],
        ['ρ', 'Rho', b.rho.toFixed(3), `Rates +1 point → option ${gains(b.rho)} about ${usd(Math.abs(b.rho))}.`],
      ];
      cards.replaceChildren(...rows.map(([sym, name, val, txt]) => h('div', { class: 'gcard' }, h('span', { class: 'g-sym' }, sym), h('span', { class: 'g-name' }, name), h('b', { class: 'g-val' }, val.replace('-', MINUS)), h('p', { class: 'g-txt' }, txt))));
    }
    update();
  };

  V.greekTable = function (host) {
    const P = '<td class="pos">+ helps</td>',
      N = '<td class="neg">− hurts</td>';
    const box = h('div', { class: 'table-wrap' });
    box.innerHTML = `<table class="gtable"><thead><tr><th>When this rises…</th><th>Bought call</th><th>Bought put</th><th>Sold call</th><th>Sold put</th></tr></thead><tbody>
      <tr><th><b>Δ</b> Stock price</th>${P}${N}${N}${P}</tr>
      <tr><th><b>Γ</b> Size of moves</th>${P}${P}${N}${N}</tr>
      <tr><th><b>Θ</b> Days passed</th>${N}${N}${P}${P}</tr>
      <tr><th><b>ν</b> Implied volatility</th>${P}${P}${N}${N}</tr>
      <tr><th><b>ρ</b> Interest rates</th>${P}${N}${N}${P}</tr></tbody></table>`;
    stack(host, box, h('p', { class: 'fine' }, 'Read each row as: if this input goes up, does it help or hurt the position? Gamma helps whoever bought, because big moves in either direction work in their favor.'));
  };

  /* ---------------- buyer vs seller mirror ---------------- */
  V.mirror = function (host, p, ctx) {
    const leg = [{ type: 'call', side: 1, K: 100, premium: 3 }];
    const lo = 85,
      hi = 120;
    let S = 108,
      m = 1,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-call' }, h('i', { class: 'lg-sw' }), 'Buyer of the $100 call'), h('span', { class: 'lg lg-violet' }, h('i', { class: 'lg-sw' }), 'Seller of the same call'));
    const sl = slider({ id: ctx.key + '-mir', label: 'ACME price on expiration day', min: lo, max: hi, step: 0.5, value: S, fmt: (v) => usd(v), onInput: (v) => ((S = v), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Flip to the seller');
    stack(host, plotEl, legend, h('div', { class: 'ctl-row' }, btn), sl.el, read);
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Buyer and seller payoffs',
      onScrub: (v) => {
        S = Math.round(v * 2) / 2;
        sl.set(S);
        update();
      },
      draw(P) {
        const C = pal();
        P.domain(lo, hi, -2200, 2200);
        P.grid({ xf: (v) => '$' + v, yf: SS.axisMoney });
        P.vline(100, { color: C.muted, dash: [2, 4], label: '$100 strike' });
        const buy = (x) => SS.plExpiry(leg, x) * M;
        P.line(P.sample(buy), { color: C.call, width: 3 });
        const sell = P.sample((x) => buy(x) * (1 - 2 * m));
        P.line(sell, { color: C.violet, width: 3, alpha: m > 0 ? 1 : 0 });
        if (m >= 1) {
          const v = buy(S);
          P.vline(S, { color: C.ink, dash: null, alpha: 0.22 });
          P.dot(S, v, { color: C.call });
          P.dot(S, -v, { color: C.violet });
          P.tag('Buyer ' + money(v, { sign: true, cents: false }), P.X(S), P.Y(v), { bg: C.call });
          P.tag('Seller ' + money(-v, { sign: true, cents: false }), P.X(S), P.Y(-v), { bg: C.violet, dy: 10 });
        }
      },
    });
    function update() {
      plot.render();
      const v = SS.plExpiry(leg, S) * M;
      read.innerHTML = `Buyer <b class="${plc(v)}">${money(v, { sign: true, cents: false })}</b> · Seller <b class="${plc(-v)}">${money(-v, { sign: true, cents: false })}</b>. Added together they always equal zero, before fees.`;
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(1300, (k) => {
        m = ease.inOut(k);
        plot.render();
      });
    }
    update();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------------- three ways out ---------------- */
  V.exits = function (host, p = {}) {
    const tabs = p.tabs || {
      sell: { label: 'Sell to close', steps: ['You bought the $100 call for $3.00, paying $300.', 'With 10 days left ACME is at $108, and the call trades at $8.40.', 'You sell it and $840 lands in your account.', 'Profit: $840 − $300 = <b class="gain">+$540</b>, with no extra cash needed.'], note: 'The most common exit. You also capture the remaining time value.' },
      ex: { label: 'Exercise', steps: ['Same call, same day: ACME at $108.', 'You exercise and pay $100 × 100 = <b>$10,000</b> for 100 shares.', 'The shares are worth $10,800, so the option gained $800 − $300 = <b class="gain">+$500</b>.', 'You gave up $40 of time value and needed $10,000 in cash.'], note: 'Exercising makes sense mainly when you want to own the shares.' },
      exp: { label: 'Let it expire', steps: ['ACME drifts down to $97 by expiration day.', 'Your $100 call is out of the money.', 'It expires worthless and disappears from your account.', 'Loss: the full <b class="loss">−$300</b> premium.'], note: 'Only out-of-the-money options should be left to expire. In-the-money ones get auto-exercised.' },
    };
    let cur = Object.keys(tabs)[0],
      timers = [];
    const list = h('ol', { class: 'flow-steps' });
    const note = h('p', { class: 'flow-note' });
    const sg = seg({ label: p.label || 'Exit type', options: Object.keys(tabs).map((k) => ({ v: k, label: tabs[k].label })), value: cur, onChange: (v) => ((cur = v), render(true)) });
    stack(host, sg.el, list, note);
    function clear() {
      timers.forEach(clearTimeout);
      timers = [];
    }
    function render(animate) {
      clear();
      const t = tabs[cur];
      list.replaceChildren(...t.steps.map((s) => h('li', { class: 'flow-step' + (animate && !SS.reduced ? ' pre' : ''), html: s })));
      note.textContent = t.note;
      if (animate && !SS.reduced) [...list.children].forEach((li, i) => timers.push(setTimeout(() => li.classList.remove('pre'), 120 + i * 450)));
    }
    render(false);
    return { play: () => render(true), destroy: clear };
  };

  /* ---------------- expiration day ---------------- */
  V.expiryDay = function (host, p, ctx) {
    const K = 100;
    let pos = 'lc',
      close = 100.5;
    const POS = { lc: ['Bought call', 'call', 1], sc: ['Sold call', 'call', -1], lp: ['Bought put', 'put', 1], sp: ['Sold put', 'put', -1] };
    const sg = seg({ label: 'Your position', options: Object.keys(POS).map((k) => ({ v: k, label: POS[k][0] })), value: pos, onChange: (v) => ((pos = v), update()) });
    const sl = slider({ id: ctx.key + '-ed', label: 'ACME closing price on expiration day', min: 97, max: 103, step: 0.05, value: close, fmt: (v) => usd(v), onInput: (v) => ((close = v), update()) });
    const zone = h('div', { class: 'ed-zone' });
    const mark = h('div', { class: 'ed-mark' }, h('span'));
    const lane = h('div', { class: 'ed-lane' }, zone, h('div', { class: 'ed-k' }, h('span', null, 'Strike $100')), mark);
    const card = h('div', { class: 'outcome', 'aria-live': 'polite' });
    stack(host, sg.el, lane, sl.el, card);
    const pctX = (v) => ((v - 97) / 6) * 100 + '%';
    function update() {
      const [, type, side] = POS[pos];
      const itm = type === 'call' ? close >= K + 0.01 : close <= K - 0.01;
      zone.className = 'ed-zone ' + type;
      zone.style.left = type === 'call' ? '50%' : '0';
      mark.style.left = pctX(close);
      mark.querySelector('span').textContent = usd(close);
      const by = Math.abs(close - K);
      let title, body;
      if (!itm) {
        title = 'Expires worthless';
        body = side > 0 ? 'You lose the premium you paid. Nothing else happens.' : 'You keep the full premium and the obligation disappears.';
      } else if (type === 'call' && side > 0) {
        title = 'Auto-exercised';
        body = 'You buy 100 ACME shares at $100. That is $10,000 out of your account on the next business day. Without the cash, your broker may sell the shares or issue a margin call.';
      } else if (type === 'call') {
        title = 'Assigned';
        body = 'You must sell 100 shares at $100. If you own them, they are called away. If you do not, you are now short 100 shares.';
      } else if (side > 0) {
        title = 'Auto-exercised';
        body = 'You sell 100 shares at $100. If you do not own them, you are now short 100 shares.';
      } else {
        title = 'Assigned';
        body = 'You must buy 100 shares at $100: $10,000 from your account.';
      }
      const status = Math.abs(close - K) < 0.005 ? 'Exactly at the money' : `${itm ? 'In' : 'Out of'} the money by ${usd(by)}`;
      card.className = 'outcome ' + (itm ? 'itm' : 'otm');
      card.innerHTML = `<span class="duo-l">${status}</span><b>${title}</b><p>${body}</p>${by <= 0.25 ? '<p class="warn"><b>Pin risk.</b> ACME is within 25¢ of the strike. After-hours moves can change the outcome, so many traders close these positions before the bell.</p>' : ''}`;
    }
    update();
  };

  /* ---------------- early exercise vs selling ---------------- */
  V.earlyExercise = function (host, p, ctx) {
    const S = 110,
      K = 100,
      iv = 0.3;
    let days = 30;
    const scale = SS.bs('call', S, K, 90, iv).price * 1.05;
    const mk = (label, cls) => {
      const fill = h('div', { class: 'ee-fill ' + cls }),
        val = h('b');
      return { row: h('div', { class: 'cr-row' }, h('span', { class: 'cr-l' }, label), h('div', { class: 'cr-track' }, fill), val), fill, val };
    };
    const ex = mk('Exercise now', 'ex'),
      se = mk('Sell the option now', 'se');
    const sl = slider({ id: ctx.key + '-ee', label: 'Days left on the option', min: 0, max: 90, step: 1, value: days, fmt: (v) => v + (v === 1 ? ' day' : ' days'), onInput: (v) => ((days = v), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('p', { class: 'plot-h' }, 'ACME at $110, you hold the $100 call'), h('div', { class: 'cr' }, ex.row, se.row), sl.el, read);
    function update() {
      const sell = SS.bs('call', S, K, days, iv).price,
        diff = sell - 10;
      ex.fill.style.width = (10 / scale) * 100 + '%';
      ex.val.textContent = usd(10);
      se.fill.style.width = (sell / scale) * 100 + '%';
      se.val.textContent = usd(sell);
      read.innerHTML = days === 0 ? 'On expiration day they are equal: only intrinsic value is left.' : `Selling beats exercising by <b class="gain">${usd(diff)}</b> a share (${money(diff * 100)} a contract). That is the time value exercise would throw away.`;
    }
    update();
  };

  /* ---------------- the wheel ---------------- */
  V.wheel = function (host) {
    const stages = [
      ['Sell a cash-secured put', 'Collect premium and keep cash ready to buy 100 shares at the strike.', 'If the put expires out of the money, keep the premium and sell another put.'],
      ['Get assigned', 'ACME fell below the strike. You buy 100 shares at the strike, and the premium you collected lowers your real cost.', null],
      ['Sell a covered call', 'Collect premium on your shares, using a strike above what you paid.', 'If the call expires out of the money, keep the shares and the premium and sell another call.'],
      ['Shares called away', 'ACME rose above the call strike. Your shares are sold at the strike and you are back to cash.', null],
    ];
    const labels = ['Sell put', 'Assigned', 'Sell call', 'Called away'];
    const pos = [
      [160, 52],
      [268, 160],
      [160, 268],
      [52, 160],
    ];
    const lpos = [
      [160, 22, 'middle'],
      [268, 202, 'middle'],
      [160, 306, 'middle'],
      [52, 202, 'middle'],
    ];
    let cur = 0,
      timer = null,
      ang = -90,
      raf = 0;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 320 320');
    svg.setAttribute('class', 'wheel-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'The wheel: sell put, get assigned, sell call, shares called away, repeat');
    svg.innerHTML = `<defs><marker id="wh-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="wh-arrowhead"/></marker></defs>
      <circle cx="160" cy="160" r="108" class="wh-ring"/>
      ${[0, 1, 2, 3].map((i) => {
        const a0 = (-90 + i * 90 + 16) * (Math.PI / 180),
          a1 = (-90 + (i + 1) * 90 - 16) * (Math.PI / 180);
        return `<path class="wh-arc" marker-end="url(#wh-arrow)" d="M${160 + 108 * Math.cos(a0)} ${160 + 108 * Math.sin(a0)} A108 108 0 0 1 ${160 + 108 * Math.cos(a1)} ${160 + 108 * Math.sin(a1)}"/>`;
      }).join('')}
      <circle class="wh-runner" r="6" cx="160" cy="52"/>
      ${pos.map(([x, y], i) => `<g class="wh-node" data-i="${i}" tabindex="0" role="button" aria-label="${labels[i]}"><circle cx="${x}" cy="${y}" r="22"/><text x="${x}" y="${y + 5}" class="wh-n">${i + 1}</text></g>`).join('')}
      ${lpos.map(([x, y, a], i) => `<text x="${x}" y="${y}" text-anchor="${a}" class="wh-label">${labels[i]}</text>`).join('')}
      <text x="160" y="156" text-anchor="middle" class="wh-center">The</text><text x="160" y="176" text-anchor="middle" class="wh-center big">wheel</text>`;
    const info = h('div', { class: 'wh-info', 'aria-live': 'polite' });
    stack(host, h('div', { class: 'wheel' }, svg, info));
    const runner = svg.querySelector('.wh-runner');
    function placeRunner(a) {
      const r = (a * Math.PI) / 180;
      runner.setAttribute('cx', 160 + 108 * Math.cos(r));
      runner.setAttribute('cy', 160 + 108 * Math.sin(r));
    }
    function sel(i, animate) {
      cur = i;
      svg.querySelectorAll('.wh-node').forEach((g) => g.classList.toggle('on', +g.dataset.i === i));
      const [t, d, loop] = stages[i];
      info.innerHTML = `<span class="duo-l">Step ${i + 1} of 4</span><b>${t}</b><p>${d}</p>${loop ? `<p class="wh-loop">↻ ${loop}</p>` : ''}`;
      const target = -90 + i * 90;
      let to = target;
      while (to < ang) to += 360;
      if (!animate || SS.reduced) {
        ang = to % 360;
        placeRunner(ang);
        return;
      }
      cancelAnimationFrame(raf);
      const from = ang,
        t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 700);
        ang = from + (to - from) * ease.inOut(k);
        placeRunner(ang);
        if (k < 1) raf = requestAnimationFrame(step);
        else ang = ang % 360;
      };
      raf = requestAnimationFrame(step);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }
    svg.addEventListener('click', (e) => {
      const g = e.target.closest('.wh-node');
      if (!g) return;
      stop();
      sel(+g.dataset.i, true);
    });
    svg.addEventListener('keydown', (e) => {
      const g = e.target.closest('.wh-node');
      if (g && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        stop();
        sel(+g.dataset.i, true);
      }
    });
    sel(0, false);
    return {
      play() {
        if (SS.reduced) return;
        stop();
        timer = setInterval(() => sel((cur + 1) % 4, true), 3000);
      },
      destroy: () => (stop(), cancelAnimationFrame(raf)),
    };
  };

  /* ---------------- position sizing ---------------- */
  V.sizing = function (host, p, ctx) {
    const N = 40,
      paths = 14,
      win = 0.4,
      payoff = 2,
      start = 10000;
    let risk = 0.05,
      seed = 11,
      reveal = 1,
      cancel = null;
    let outcomes = [];
    function roll() {
      const r = SS.rng(seed);
      outcomes = [];
      for (let i = 0; i < paths; i++) {
        const row = [];
        for (let t = 0; t < N; t++) row.push(r() < win);
        outcomes.push(row);
      }
    }
    function series() {
      return outcomes.map((row) => {
        const s = [start];
        row.forEach((w) => {
          const e = s[s.length - 1];
          s.push(e * (1 + risk * (w ? payoff : -1)));
        });
        return s;
      });
    }
    const plotEl = h('div', { class: 'plot' });
    const sl = slider({ id: ctx.key + '-sz', label: 'Risk per trade', min: 1, max: 30, step: 1, value: risk * 100, fmt: (v) => v + '% of the account', onInput: (v) => ((risk = v / 100), update()) });
    const btn = h(
      'button',
      {
        type: 'button',
        class: 'btn sm',
        onclick: () => {
          seed = (seed * 7919 + 13) % 100003;
          roll();
          play();
        },
      },
      'Run 14 new paths'
    );
    const out = h('div', { class: 'stats' });
    stack(host, plotEl, h('div', { class: 'ctl-row' }, btn, sl.el), out, h('p', { class: 'fine' }, 'Each trade wins 40% of the time. A win earns 2× the amount risked; a loss costs the amount risked. Starting balance $10,000.'));
    const plot = new Plot(plotEl, {
      height: ph,
      label: 'Account balance paths',
      draw(P) {
        const C = pal();
        P.domain(0, N, 0, 40000);
        P.grid({ xf: (v) => 'T' + v, yf: SS.axisMoney, yTicks: [0, 10000, 20000, 30000, 40000] });
        P.hline(start, { color: C.muted, dash: [3, 4], label: 'Start $10k' });
        P.hline(5000, { color: C.loss, dash: [2, 4], label: 'Half gone', alpha: 0.7 });
        const S = series(),
          upto = Math.round(N * reveal);
        S.forEach((s) => {
          const pts = s.slice(0, upto + 1).map((v, i) => [i, v]);
          const end = s[N];
          P.line(pts, { color: end < 5000 ? C.loss : end >= start ? C.gain : C.muted, width: 1.6, alpha: 0.75 });
        });
      },
    });
    function update() {
      plot.render();
      const ends = series()
        .map((s) => s[N])
        .sort((a, b) => a - b);
      const med = (ends[6] + ends[7]) / 2,
        broke = ends.filter((e) => e < 5000).length;
      out.replaceChildren(stat('Median ending balance', money(med, { cents: false }), plc(med - start)), stat('Paths that lost over half', `${broke} of ${paths}`, broke ? 'loss' : ''), stat('Worst path', money(ends[0], { cents: false }), 'loss'), stat('Best path', money(ends[paths - 1], { cents: false }), 'gain'));
    }
    function play() {
      if (cancel) cancel();
      update();
      cancel = tween(1500, (k) => {
        reveal = k;
        plot.render();
      });
    }
    roll();
    update();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------------- flip cards ---------------- */
  V.mistakes = function (host, p = {}) {
    const frontTag = p.front || 'Mistake',
      backTag = p.back || 'The fix';
    const items = p.items || [
      ['Buying lottery tickets', 'Buying far out-of-the-money options because they are cheap.', 'Cheap usually means unlikely. Use delta as a rough probability and favor strikes closer to the money.'],
      ['Ignoring implied volatility', 'Buying options right before earnings, when IV is sky-high.', 'Compare IV with its usual level. After the event, IV crush can erase gains even when you are right.'],
      ['Trading illiquid options', 'Wide bid-ask spreads quietly eat 10% or more per round trip.', 'Stick to options with tight spreads and solid volume. Use limit orders near the mid price.'],
      ['No exit plan', 'Holding and hoping until expiration day.', 'Decide upfront: a profit target, a max loss and a time limit. Most trades should be closed before the final week.'],
      ['Selling naked calls', 'Collecting small premiums while taking unlimited risk.', 'Use defined-risk structures like spreads, or sell calls only against shares you own.'],
      ['Betting too big', 'Putting a large share of the account on one trade.', 'Risk a small, fixed percentage per trade so a losing streak cannot knock you out.'],
    ];
    const grid = h('div', { class: 'flip-grid' });
    items.forEach(([t, f, b]) => {
      const card = h('button', { type: 'button', class: 'flip', 'aria-pressed': 'false' }, h('span', { class: 'flip-in' }, h('span', { class: 'flip-face flip-front' }, h('span', { class: 'flip-tag' }, frontTag), h('b', null, t), h('span', null, f)), h('span', { class: 'flip-face flip-back' }, h('span', { class: 'flip-tag' }, backTag), h('b', null, t), h('span', null, b))));
      card.addEventListener('click', () => card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true')));
      grid.append(card);
    });
    host.append(grid);
  };

  // Generic names for the reusable versions: pass { items, front, back } or { tabs, label }.
  V.flipCards = V.mistakes;
  V.flow = V.exits;

  /* ---------------- strategy planner ---------------- */
  V.planner = function (host, p, ctx) {
    const MAP = {
      bull: { low: [['long-call', 'bull-call'], 'Options are cheap, so buying them is reasonable. A spread lowers the cost further.'], high: [['bull-put', 'csp'], 'Options are expensive, so collect premium instead of paying it.'] },
      bear: { low: [['long-put', 'bear-put'], 'Cheap options favor buying puts or put spreads.'], high: [['bear-call', 'collar'], 'Sell expensive premium above the price, or protect shares you hold with a collar.'] },
      flat: { low: [['butterfly', 'covered-call'], 'A butterfly is a cheap bet on a pinned price. Covered calls add income to shares you already own.'], high: [['iron-condor', 'covered-call'], 'Rich premiums reward selling a range. Define your risk with wings.'] },
      move: { low: [['straddle', 'strangle'], 'Cheap options make buying both sides more attractive.'], high: [['strangle', 'iron-condor'], 'Big moves are already priced in. A smaller strangle limits the cost; a condor bets the market overestimates the move.'] },
    };
    let view = 'bull',
      ivv = 'low',
      minis = [];
    const s1 = seg({ label: 'Your view', options: [{ v: 'bull', label: 'Bullish' }, { v: 'bear', label: 'Bearish' }, { v: 'flat', label: 'Range-bound' }, { v: 'move', label: 'Big move' }], value: view, onChange: (v) => ((view = v), render()) });
    const s2 = seg({ label: 'Implied volatility', options: [{ v: 'low', label: 'IV low' }, { v: 'high', label: 'IV high' }], value: ivv, onChange: (v) => ((ivv = v), render()) });
    const why = h('p', { class: 'readout' });
    const cards = h('div', { class: 'plan-cards' });
    stack(host, h('div', { class: 'plan-segs' }, s1.el, s2.el), why, cards, h('p', { class: 'fine' }, 'Textbook pairings for learning, not recommendations for any real trade.'));
    function render() {
      minis.forEach((m) => m.destroy());
      minis = [];
      const [ids, txt] = MAP[view][ivv];
      why.textContent = txt;
      cards.replaceChildren();
      ids.forEach((id) => {
        const st = SS.strat(id),
          legs = SS.buildLegs(id, 100, 30, 0.3);
        const el = h('div', { class: 'plot mini' });
        cards.append(h('div', { class: 'plan-card' }, h('span', { class: 'duo-l' }, st.view + ' · ' + st.risk + ' risk'), h('b', null, st.name), el, h('p', null, st.blurb)));
        const vals = [];
        for (let i = 0; i <= 60; i++) vals.push(SS.plExpiry(legs, 80 + (40 * i) / 60));
        const [y0, y1] = yDomain(vals, 0.15);
        minis.push(
          new Plot(el, {
            height: 90,
            pad: { l: 6, r: 6, t: 8, b: 8 },
            label: st.name + ' payoff shape',
            draw(P) {
              const C = pal();
              P.domain(80, 120, y0, y1);
              P.hline(0, { color: C.muted, dash: null, alpha: 0.6 });
              const pts = P.sample((x) => SS.plExpiry(legs, x));
              P.fillPL(pts, 0.2);
              P.line(pts, { color: C.ink, width: 2.25 });
            },
          })
        );
      });
    }
    render();
    return { destroy: () => minis.forEach((m) => m.destroy()) };
  };
})();
