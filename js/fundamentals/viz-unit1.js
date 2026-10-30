/* Fundamentals, Unit 1 visuals: ownership, trading mechanics, indexes, asset classes. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, money, pct, usd, pal, alpha, tween, ease, MINUS } = SS;
  const V = SS.viz;
  const plc = SS.plClass;
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const num = (v) => Math.round(v).toLocaleString('en-US');
  const big$ = (v) => (v >= 1e12 ? '$' + (v / 1e12).toFixed(2) + 'T' : v >= 1e9 ? '$' + (v / 1e9).toFixed(v >= 1e11 ? 0 : 1) + 'B' : v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : money(v, { cents: false }));
  SS.big$ = big$;
  const replay = (el) => {
    el.classList.remove('go');
    void el.offsetWidth;
    el.classList.add('go');
  };

  /* ---------- ownership slices ---------- */
  V.slices = function (host, p, ctx) {
    const total = 1e6,
      cells = 200,
      per = total / cells,
      profit = 120000;
    let mine = p.shares || 50000,
      cancel = null;
    const grid = h('div', { class: 'slice-grid', 'aria-hidden': 'true' });
    const els = [];
    for (let i = 0; i < cells; i++) {
      const c = h('span', { class: 'slice' });
      els.push(c);
      grid.append(c);
    }
    const sl = slider({ id: ctx.key + '-sh', label: 'Shares you buy', min: 0, max: 250000, step: 5000, value: mine, fmt: num, onInput: (v) => ((mine = v), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, h('div', { class: 'slice-wrap' }, h('div', { class: 'slice-co' }, h('b', null, 'Maple Bakery'), h('span', null, '1,000,000 shares · worth $1,000,000')), grid, h('p', { class: 'fine' }, 'Each square is 5,000 shares, or 0.5% of the company.')), sl.el, read);
    function update() {
      const full = mine / per;
      els.forEach((c, i) => c.style.setProperty('--f', Math.max(0, Math.min(1, full - i)).toFixed(3)));
      const share = mine / total;
      read.innerHTML = `You own <b>${num(mine)}</b> of 1,000,000 shares: <b>${pct(share, { d: share < 0.01 ? 2 : 1 })}</b> of Maple Bakery, bought for ${money(mine, { cents: false })}. If the bakery earns $120,000 this year, <b>${money(profit * share, { cents: false })}</b> of that profit is yours.`;
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        const end = p.shares || 50000;
        cancel = tween(1100, (k) => {
          mine = Math.round((end * ease.out(k)) / 5000) * 5000;
          sl.set(mine);
          update();
        });
      },
      destroy: () => cancel && cancel(),
    };
  };

  /* ---------- IPO vs everyday trading ---------- */
  V.ipoFlow = function (host) {
    const scenes = {
      ipo: {
        a: ['Investors', 'Buy the new shares', ['Pay $2,000,000 in total', 'Become part-owners', 'Can sell later to other investors']],
        b: ['Maple Bakery', 'Sells 200,000 new shares at $10', ['Receives $2,000,000 to grow', 'Gives up 20% ownership', 'Lists on a stock exchange']],
        lanes: [
          ['Investors', '$2,000,000', 'Bakery', 'coin'],
          ['Investors', '200,000 shares', 'Bakery', 'doc rev'],
        ],
        note: 'The IPO is the primary market: money flows to the company itself.',
      },
      trade: {
        a: ['Investor B', 'Buys 100 shares', ['Pays $10.50 a share', 'Takes over the ownership', 'Price set by bids and asks']],
        b: ['Investor A', 'Sells 100 shares', ['Receives $1,050', 'Made $50 on a $10 purchase', 'The bakery gets nothing']],
        lanes: [
          ['Investor B', '$1,050', 'Investor A', 'coin'],
          ['Investor B', '100 shares', 'Investor A', 'doc rev'],
        ],
        note: 'Everyday trading is the secondary market: investors trade with each other, and the company is not involved.',
      },
    };
    let cur = 'ipo';
    const box = h('div', { class: 'sides' });
    const sg = seg({ label: 'Stage', options: [{ v: 'ipo', label: '1 · The IPO' }, { v: 'trade', label: '2 · Everyday trading' }], value: cur, onChange: (v) => ((cur = v), render(true)) });
    stack(host, sg.el, box);
    function side(cls, [tag, title, items]) {
      return `<div class="side ${cls}"><span class="side-tag">${tag}</span><b>${title}</b><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`;
    }
    function render(animate) {
      const s = scenes[cur];
      box.innerHTML =
        side('side-buyer', s.a) +
        side('side-seller', s.b) +
        `<div class="lanes" aria-hidden="true">${s.lanes.map(([l, t, r, cls]) => `<div class="lane"><span class="lane-end">${l}</span><div class="track${cls.indexOf('rev') > -1 ? ' rev' : ''}"><span class="token ${cls.split(' ')[0]}">${t}</span></div><span class="lane-end">${r}</span></div>`).join('')}</div><p class="fine">${s.note}</p>`;
      if (animate && !SS.reduced) replay(box);
    }
    render(false);
    return { play: () => render(true) };
  };

  /* ---------- total return ---------- */
  V.totalReturn = function (host, p, ctx) {
    const buy = 50,
      years = 5;
    let sell = 68,
      div = 1.2;
    const sS = slider({ id: ctx.key + '-sell', label: 'Price when you sell, 5 years later', min: 30, max: 100, step: 1, value: sell, fmt: (v) => usd(v), onInput: (v) => ((sell = v), update()) });
    const sD = slider({ id: ctx.key + '-div', label: 'Dividend per share, each year', min: 0, max: 3, step: 0.1, value: div, fmt: (v) => usd(v), onInput: (v) => ((div = v), update()) });
    const attr = h('div', { class: 'attr' });
    const stats = h('div', { class: 'stats' });
    stack(host, h('p', { class: 'plot-h' }, 'One share bought at $50.00'), attr, sS.el, sD.el, stats);
    function row(label, v, max) {
      const w = (Math.min(Math.abs(v), max) / max) * 50;
      return h('div', { class: 'attr-row' }, h('span', { class: 'attr-l' }, label), h('div', { class: 'attr-track' }, h('span', { class: 'attr-zero' }), h('span', { class: 'attr-bar ' + (v >= 0 ? 'pos' : 'neg'), style: { width: w + '%', left: v >= 0 ? '50%' : 50 - w + '%' } })), h('b', { class: plc(v) }, money(v, { sign: true })));
    }
    function update() {
      const gain = sell - buy,
        divs = div * years,
        tot = gain + divs;
      attr.replaceChildren(row('Price change', gain, 65), row('Dividends', divs, 65), row('Total return', tot, 65));
      const ann = Math.pow(Math.max(0.0001, (sell + divs) / buy), 1 / years) - 1;
      stats.replaceChildren(stat('Total return', pct(tot / buy, { sign: true }), plc(tot)), stat('Per year, roughly', pct(ann, { sign: true }), plc(ann)), stat('Share from dividends', tot > 0 ? pct(divs / tot, { d: 0 }) : '—'));
    }
    update();
  };

  /* ---------- market cap bubbles ---------- */
  V.marketCap = function (host) {
    const cos = [
      { n: 'Peakline Labs', p: 520, sh: 12e6 },
      { n: 'Orbit Mobile', p: 135, sh: 400e6 },
      { n: 'Harbor Foods', p: 48, sh: 2.1e9 },
    ];
    cos.forEach((c) => (c.cap = c.p * c.sh));
    let by = 'price';
    const sg = seg({ label: 'Bubble size', options: [{ v: 'price', label: 'Size by share price' }, { v: 'cap', label: 'Size by market cap' }], value: by, onChange: (v) => ((by = v), update()) });
    const row = h('div', { class: 'bubbles' });
    const items = cos.map((c) => {
      const b = h('span', { class: 'bubble' });
      const el = h('div', { class: 'bubble-cell' }, b, h('b', null, c.n), h('span', { class: 'bubble-v' }));
      row.append(el);
      return { c, b, el };
    });
    const tbl = h('div', { class: 'table-wrap' });
    tbl.innerHTML = `<table class="cmp"><thead><tr><th>Company</th><th>Share price</th><th>Shares</th><th>Market cap</th></tr></thead><tbody>${cos.map((c) => `<tr><th>${c.n}</th><td>${usd(c.p)}</td><td>${c.sh >= 1e9 ? (c.sh / 1e9).toFixed(1) + 'B' : c.sh / 1e6 + 'M'}</td><td>${big$(c.cap)}</td></tr>`).join('')}</tbody></table>`;
    stack(host, sg.el, row, tbl);
    function update() {
      const maxV = Math.max(...cos.map((c) => (by === 'price' ? c.p : c.cap)));
      items.forEach(({ c, b, el }) => {
        const v = by === 'price' ? c.p : c.cap;
        b.style.setProperty('--s', Math.sqrt(v / maxV).toFixed(3));
        el.querySelector('.bubble-v').textContent = by === 'price' ? usd(c.p) + ' a share' : big$(c.cap) + ' company';
        b.classList.toggle('cap', by === 'cap');
      });
    }
    update();
    return {
      play() {
        if (SS.reduced) return;
        setTimeout(() => {
          by = 'cap';
          sg.set('cap');
          update();
        }, 900);
      },
    };
  };

  /* ---------- order book ---------- */
  V.orderBook = function (host) {
    const START = {
      asks: [
        [50.05, 200],
        [50.06, 300],
        [50.08, 400],
        [50.1, 600],
        [50.12, 800],
      ],
      bids: [
        [50.0, 300],
        [49.98, 400],
        [49.97, 500],
        [49.95, 700],
        [49.92, 900],
      ],
    };
    let book, last, qty = 500, busy = false, timers = [];
    const reset = () => {
      book = { asks: START.asks.map((r) => r.slice()), bids: START.bids.map((r) => r.slice()) };
      last = 50.02;
    };
    reset();
    const ladder = h('div', { class: 'ob', role: 'table', 'aria-label': 'Order book' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' }, 'Pick a size and send a market order.');
    const qs = seg({ label: 'Order size', options: [{ v: '100', label: '100 shares' }, { v: '500', label: '500 shares' }, { v: '1500', label: '1,500 shares' }], value: '500', onChange: (v) => (qty = +v) });
    const bBuy = h('button', { type: 'button', class: 'btn sm primary', onclick: () => market('buy') }, 'Market buy');
    const bSell = h('button', { type: 'button', class: 'btn sm', onclick: () => market('sell') }, 'Market sell');
    const bLim = h('button', { type: 'button', class: 'btn sm', onclick: () => limitBid() }, 'Add limit buy at $50.02');
    const bReset = h('button', { type: 'button', class: 'btn sm ghost', onclick: () => (clear(), reset(), render(), (read.textContent = 'Book reset.')) }, 'Reset');
    stack(host, qs.el, h('div', { class: 'ctl-row' }, bBuy, bSell, bLim, bReset), ladder, read);
    const maxQ = 900;
    function render(hit) {
      const row = (side, [px, q], i) => `<div class="ob-row ${side}${hit && hit.side === side && hit.i === i ? ' hit' : ''}" role="row"><span class="ob-px">${usd(px)}</span><span class="ob-bar"><i style="width:${(q / maxQ) * 100}%"></i></span><span class="ob-q">${num(q)}</span></div>`;
      const asks = book.asks.map((r, i) => row('ask', r, i)).reverse().join('');
      const bids = book.bids.map((r, i) => row('bid', r, i)).join('');
      const spread = book.asks.length && book.bids.length ? usd(book.asks[0][0] - book.bids[0][0]) : '—';
      ladder.innerHTML = `<div class="ob-head"><span>Price</span><span>Shares waiting</span><span></span></div><div class="ob-side">${asks || '<p class="fine">No sellers left</p>'}</div><div class="ob-mid"><span>Last trade <b>${usd(last)}</b></span><span>Spread <b>${spread}</b></span></div><div class="ob-side">${bids || '<p class="fine">No buyers left</p>'}</div>`;
    }
    function clear() {
      timers.forEach(clearTimeout);
      timers = [];
      busy = false;
    }
    function market(dir) {
      if (busy) return;
      busy = true;
      const side = dir === 'buy' ? 'asks' : 'bids',
        cls = dir === 'buy' ? 'ask' : 'bid';
      let left = qty;
      const fills = [];
      const step = () => {
        const lvl = book[side][0];
        if (!left || !lvl) return done();
        const take = Math.min(left, lvl[1]);
        render({ side: cls, i: 0 });
        timers.push(
          setTimeout(
            () => {
              lvl[1] -= take;
              left -= take;
              last = lvl[0];
              fills.push([take, lvl[0]]);
              if (!lvl[1]) book[side].shift();
              render();
              timers.push(setTimeout(step, SS.reduced ? 0 : 260));
            },
            SS.reduced ? 0 : 320
          )
        );
      };
      const done = () => {
        busy = false;
        const n = fills.reduce((a, f) => a + f[0], 0);
        if (!n) {
          read.textContent = 'Nothing left on that side of the book. Reset to refill it.';
          return;
        }
        const avg = fills.reduce((a, f) => a + f[0] * f[1], 0) / n;
        const best = fills[0][1];
        read.innerHTML = `${dir === 'buy' ? 'Bought' : 'Sold'} <b>${num(n)}</b> shares: ${fills.map(([q, px]) => `${num(q)} at ${usd(px)}`).join(', ')}. Average price <b>${'$' + avg.toFixed(3)}</b>${fills.length > 1 ? `, ${usd(Math.abs(avg - best) * n)} worse than if everything had filled at the first price. That is slippage.` : '.'}${left ? ` ${num(left)} shares could not be filled.` : ''}`;
      };
      step();
    }
    function limitBid() {
      if (busy) return;
      if (book.bids.length && book.bids[0][0] >= 50.02) {
        read.textContent = 'There is already a bid at $50.02 or higher.';
        return;
      }
      if (book.asks.length && book.asks[0][0] <= 50.02) {
        read.textContent = 'The best ask is at or below $50.02, so this would trade right away.';
        return;
      }
      book.bids.unshift([50.02, 300]);
      render({ side: 'bid', i: 0 });
      read.innerHTML = 'Your limit buy for 300 shares at $50.02 is now the best bid. It waits in the book until a seller accepts it, and the spread narrows.';
    }
    render();
    return { destroy: clear };
  };

  /* ---------- news moves prices ---------- */
  V.newsMarket = function (host, p, ctx) {
    const W = 140;
    let prices = [],
      pressure = 0.5,
      cancel = null,
      seed = 3;
    const r0 = SS.rng(7);
    let px = 50;
    for (let i = 0; i < 60; i++) {
      px *= Math.exp((r0() - 0.5) * 0.004);
      prices.push(px);
    }
    const events = [
      { k: 'beat', label: 'Strong earnings', p: 0.78, vol: 1, txt: 'Earnings beat forecasts. Buyers rush in and accept higher asks.' },
      { k: 'delay', label: 'Product delayed', p: 0.27, vol: 1, txt: 'A key product slips a year. Sellers accept lower bids to get out.' },
      { k: 'selloff', label: 'Market-wide sell-off', p: 0.3, vol: 2, txt: 'Fear spreads across the whole market. Even good companies get sold, with wild swings.' },
      { k: 'quiet', label: 'No news', p: 0.5, vol: 0.6, txt: 'Buyers and sellers roughly balance. The price wanders.' },
    ];
    const plotEl = h('div', { class: 'plot' });
    const gauge = h('div', { class: 'press' }, h('span', { class: 'press-l' }, 'Sellers'), h('div', { class: 'press-track' }, h('div', { class: 'press-fill' })), h('span', { class: 'press-l' }, 'Buyers'));
    const read = h('p', { class: 'readout', 'aria-live': 'polite' }, 'Release some news.');
    const btns = h(
      'div',
      { class: 'ctl-row' },
      events.map((e) => h('button', { type: 'button', class: 'btn sm', onclick: () => fire(e) }, e.label))
    );
    stack(host, btns, plotEl, gauge, read);
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 210 : 250),
      label: 'Share price over time',
      draw(P) {
        const C = pal();
        const view = prices.slice(-W);
        const lo = Math.min(...view),
          hi = Math.max(...view);
        const pad = Math.max(0.5, (hi - lo) * 0.15);
        P.domain(0, W - 1, lo - pad, hi + pad);
        P.grid({ noXLabels: true, yf: (v) => '$' + v.toFixed(v < 100 ? 1 : 0) });
        const pts = view.map((v, i) => [i, v]);
        P.line(pts, { color: C.ink, width: 2.25 });
        P.dot(pts.length - 1, view[view.length - 1], { color: C.accent, r: 4 });
        P.tag(usd(view[view.length - 1]), P.X(pts.length - 1), P.Y(view[view.length - 1]), { align: 'right', bg: C.accent });
      },
    });
    function paintGauge() {
      gauge.querySelector('.press-fill').style.width = pressure * 100 + '%';
    }
    function fire(e) {
      if (cancel) cancel();
      const r = SS.rng(seed++ * 7919);
      const start = prices[prices.length - 1];
      let n = 0;
      pressure = e.p;
      paintGauge();
      const N = 50;
      cancel = tween(2200, (k) => {
        const target = Math.round(k * N);
        while (n < target) {
          const last = prices[prices.length - 1];
          prices.push(last * Math.exp((e.p - 0.5) * 0.006 + (r() - 0.5) * 0.006 * e.vol));
          n++;
        }
        plot.render();
        if (k >= 1) {
          const end = prices[prices.length - 1];
          read.innerHTML = `${e.txt} ACME went from ${usd(start)} to <b class="${plc(end - start)}">${usd(end)}</b> (${pct(end / start - 1, { sign: true })}).`;
        }
      });
    }
    paintGauge();
    return { destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- order types ---------- */
  V.orderTypes = function (host, p, ctx) {
    const N = 60;
    let kind = 'limit',
      level = 47,
      gap = false,
      shown = N,
      cancel = null;
    function path() {
      const r = SS.rng(21),
        out = [50];
      for (let i = 1; i < N; i++) {
        const base = i < 22 ? -0.0035 : i < 30 ? -0.0015 : 0.004;
        let v = out[i - 1] * Math.exp(base + (r() - 0.5) * 0.012);
        if (gap && i === 30) v = out[i - 1] * 0.9;
        out.push(v);
      }
      return out;
    }
    let P0 = path();
    const sk = seg({ label: 'Order type', options: [{ v: 'market', label: 'Market buy' }, { v: 'limit', label: 'Buy limit' }, { v: 'stop', label: 'Sell stop' }], value: kind, onChange: (v) => ((kind = v), update()) });
    const sg = seg({ label: 'Price path', options: [{ v: 'smooth', label: 'Normal day-to-day moves' }, { v: 'gap', label: 'With an overnight gap' }], value: 'smooth', onChange: (v) => ((gap = v === 'gap'), (P0 = path()), update()) });
    const sl = slider({ id: ctx.key + '-lvl', label: 'Your order price', min: 40, max: 52, step: 0.25, value: level, fmt: (v) => usd(v), onInput: (v) => ((level = v), update()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, 'Play the price path');
    stack(host, sk.el, sg.el, plotEl, h('div', { class: 'ctl-row' }, btn, sl.el), read);
    function outcome() {
      if (kind === 'market') return { i: 0, px: P0[0] };
      for (let i = 1; i < N; i++) {
        if (kind === 'limit' && P0[i] <= level) return { i, px: Math.min(level, P0[i]) };
        if (kind === 'stop' && P0[i] <= level) return { i, px: P0[i] };
      }
      return null;
    }
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 210 : 250),
      label: 'Price path with your order level',
      draw(P) {
        const C = pal();
        P.domain(0, N - 1, 38, 54);
        P.grid({ xf: (v) => 'Day ' + Math.round(v / 6 + 1), xTicks: [0, 12, 24, 36, 48], yf: (v) => '$' + v });
        if (kind !== 'market') P.hline(level, { color: kind === 'stop' ? C.loss : C.gain, dash: [5, 4], label: (kind === 'stop' ? 'Stop ' : 'Limit ') + usd(level) });
        P.line(
          P0.slice(0, shown).map((v, i) => [i, v]),
          { color: C.ink, width: 2.25 }
        );
        const o = outcome();
        if (o && o.i < shown) {
          P.dot(o.i, o.px, { color: kind === 'stop' ? C.loss : C.gain });
          P.tag((kind === 'stop' ? 'Sold ' : 'Bought ') + usd(o.px), P.X(o.i), P.Y(o.px), { bg: kind === 'stop' ? C.loss : C.gain, dy: 12 });
        }
      },
    });
    function update() {
      plot.render();
      const o = outcome();
      let txt;
      if (kind === 'market') txt = `A market buy fills immediately at about ${usd(P0[0])}. You get speed, not price control, and you would have paid more than a patient buyer.`;
      else if (kind === 'limit') txt = o ? `Your buy limit fills at <b>${usd(o.px)}</b> when the price drops to it. You never pay more than ${usd(level)}.` : `Not filled: the price never fell to ${usd(level)}. Limit orders protect your price but can miss the trade entirely.`;
      else if (!o) txt = `Your stop at ${usd(level)} never triggered, so you still own the shares.`;
      else if (o.px < level - 0.5) txt = `The stock gapped straight through your stop at ${usd(level)}. The stop became a market order and sold at <b class="loss">${usd(o.px)}</b>, well below your stop price.`;
      else txt = `The price touched ${usd(level)}, the stop became a market order and sold at <b>${usd(o.px)}</b>, limiting your loss.`;
      read.innerHTML = txt;
    }
    function play() {
      if (cancel) cancel();
      cancel = tween(2600, (k) => {
        shown = Math.max(1, Math.round(N * k));
        plot.render();
      });
    }
    update();
    return { play, destroy: () => (cancel && cancel(), plot.destroy()) };
  };

  /* ---------- the trading day ---------- */
  V.tradingDay = function (host, p, ctx) {
    let t = 9.5,
      cancel = null;
    const vol = (x) => {
      if (x < 9.5) return 0.04 + 0.08 * Math.max(0, (x - 7) / 2.5);
      if (x < 16) {
        const u = (x - 9.5) / 6.5;
        return 0.32 + 0.68 * Math.exp(-u * 9) + 0.55 * Math.exp(-(1 - u) * 7);
      }
      if (x < 16.5) return 0.18;
      return 0.07 * Math.exp(-(x - 16.5) / 1.5) + 0.02;
    };
    const clock = (x) => {
      const hh = Math.floor(x),
        mm = Math.round((x - hh) * 60);
      const h12 = ((hh + 11) % 12) + 1;
      return `${h12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'a.m.' : 'p.m.'} ET`;
    };
    const sessions = [
      [4, 9.5, 'Pre-market', 'Few traders and wide spreads. Prices react to overnight news and earnings released before the open.'],
      [9.5, 10, 'The open', 'A burst of orders that built up overnight. The busiest, and often the most volatile, part of the day.'],
      [10, 15.5, 'Regular session', 'Steady trading with the tightest spreads. Most investors trade in this window.'],
      [15.5, 16, 'The close', 'Volume surges again as funds trade at the closing price. Mutual funds are priced off this close.'],
      [16, 20, 'After-hours', 'Many companies report earnings now. Trading is thin, so prices can jump on small orders.'],
    ];
    const plotEl = h('div', { class: 'plot' });
    const sl = slider({ id: ctx.key + '-clk', label: 'Time of day', min: 4, max: 20, step: 0.25, value: t, fmt: clock, onInput: (v) => (stop(), (t = v), update()) });
    const card = h('div', { class: 'duo-card txt', 'aria-live': 'polite' });
    stack(host, plotEl, sl.el, card, h('p', { class: 'fine' }, 'Regular US session 9:30 a.m. to 4:00 p.m. Eastern, Monday to Friday. Extended hours vary by broker. The volume curve is illustrative.'));
    const plot = new Plot(plotEl, {
      height: 200,
      label: 'Trading volume through the day',
      onScrub: (v) => {
        stop();
        t = Math.round(v * 4) / 4;
        sl.set(t);
        update();
      },
      draw(P) {
        const C = pal();
        P.domain(4, 20, 0, 1.25);
        P.rect(9.5, 0, 16, 1.25, alpha(C.accent, 0.08));
        P.grid({ xTicks: [4, 8, 9.5, 12, 16, 20], xf: (v) => (v === 9.5 ? '9:30' : v === 12 ? 'Noon' : ((v + 11) % 12) + 1 + (v < 12 ? 'am' : 'pm')), noYLabels: true, yTicks: [] });
        const pts = P.sample(vol, 4, 20, 320);
        P.area(pts, 0, C.accent, 0.25);
        P.line(pts, { color: C.accent, width: 2 });
        P.vline(9.5, { color: C.ink, dash: [3, 3], label: 'Open' });
        P.vline(16, { color: C.ink, dash: [3, 3], label: 'Close' });
        P.vline(t, { color: C.ink, dash: null, width: 2 });
        P.dot(t, vol(t), { color: C.ink, r: 4 });
      },
    });
    function update() {
      plot.render();
      const s = sessions.find(([a, b]) => t >= a && t < b) || sessions[sessions.length - 1];
      card.innerHTML = `<span class="duo-l">${clock(t)}</span><b>${s[2]}</b><span>${s[3]}</span>`;
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    update();
    return {
      play() {
        stop();
        cancel = tween(4000, (k) => {
          t = Math.round((4 + 16 * k) * 4) / 4;
          sl.set(t);
          update();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- index weighting ---------- */
  V.indexWeights = function (host, p, ctx) {
    const cos = [
      ['Titan Tech', 300, 3e9],
      ['Nova Retail', 160, 2.5e9],
      ['Orion Health', 600, 0.5e9],
      ['Delta Energy', 75, 2e9],
      ['Summit Bank', 40, 3e9],
      ['Pioneer Auto', 20, 3e9],
      ['Blue Harbor', 400, 0.1e9],
      ['Cedar Goods', 30, 1e9],
    ].map(([n, px, sh]) => ({ n, px, sh, cap: px * sh }));
    const capSum = cos.reduce((a, c) => a + c.cap, 0),
      pxSum = cos.reduce((a, c) => a + c.px, 0);
    cos.forEach((c) => ((c.wc = c.cap / capSum), (c.wp = c.px / pxSum)));
    let method = p.method || 'cap',
      sel = 0,
      move = 10;
    const sm = seg({ label: 'Weighting method', options: [{ v: 'cap', label: 'Cap-weighted (S&P 500 style)' }, { v: 'price', label: 'Price-weighted (Dow style)' }], value: method, onChange: (v) => ((method = v), update()) });
    const list = h('div', { class: 'iw' });
    const rows = cos.map((c, i) => {
      const fill = h('i');
      const r = h('button', { type: 'button', class: 'iw-row', onclick: () => ((sel = i), update()) }, h('span', { class: 'iw-n' }, h('b', null, c.n), h('small', null, `${usd(c.px)} · ${big$(c.cap)}`)), h('span', { class: 'iw-bar' }, fill), h('span', { class: 'iw-w' }));
      list.append(r);
      return { r, fill };
    });
    const sl = slider({ id: ctx.key + '-mv', label: 'Move the selected company', min: -20, max: 20, step: 1, value: move, fmt: (v) => (v > 0 ? '+' : v < 0 ? MINUS : '') + Math.abs(v) + '%', onInput: (v) => ((move = v), update()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sm.el, list, sl.el, read, h('p', { class: 'fine' }, 'Tap a company to select it. Eight made-up companies stand in for a real index.'));
    function update() {
      const key = method === 'cap' ? 'wc' : 'wp';
      const maxW = Math.max(...cos.map((c) => c[key]));
      rows.forEach(({ r, fill }, i) => {
        fill.style.width = (cos[i][key] / maxW) * 100 + '%';
        r.querySelector('.iw-w').textContent = pct(cos[i][key], { d: 1 });
        r.setAttribute('aria-pressed', String(i === sel));
      });
      const c = cos[sel],
        w = c[key],
        dI = w * (move / 100);
      read.innerHTML = `${c.n} is <b>${pct(w, { d: 1 })}</b> of this ${method === 'cap' ? 'cap-weighted' : 'price-weighted'} index. A ${move >= 0 ? '+' : MINUS}${Math.abs(move)}% move in its shares moves the index <b class="${plc(dI)}">${pct(dI, { sign: true, d: 2 })}</b>.`;
    }
    update();
  };

  /* ---------- simulated drawdowns ---------- */
  V.drawdown = function (host, p, ctx) {
    const months = 360,
      mu = 0.08,
      sig = 0.16;
    let seed = 5,
      reveal = 1,
      cancel = null,
      S = [],
      DD = [];
    function sim() {
      const r = SS.rng(seed * 104729);
      S = [100];
      DD = [0];
      let peak = 100;
      for (let m = 1; m <= months; m++) {
        const v = S[m - 1] * Math.exp((mu - (sig * sig) / 2) / 12 + (sig / Math.sqrt(12)) * SS.gauss(r));
        S.push(v);
        peak = Math.max(peak, v);
        DD.push(v / peak - 1);
      }
    }
    function episodes(th) {
      let n = 0,
        armed = true;
      DD.forEach((d) => {
        if (armed && d <= th) {
          n++;
          armed = false;
        }
        if (d >= -0.0001) armed = true;
      });
      return n;
    }
    const top = h('div', { class: 'plot' }),
      bot = h('div', { class: 'plot' });
    const stats = h('div', { class: 'stats' });
    const btn = h(
      'button',
      {
        type: 'button',
        class: 'btn sm',
        onclick: () => {
          seed++;
          sim();
          play();
        },
      },
      'Simulate another 30 years'
    );
    stack(host, h('p', { class: 'plot-h' }, 'Index value (starts at 100)'), top, h('p', { class: 'plot-h' }, 'Drawdown: distance below the last high'), bot, h('div', { class: 'ctl-row' }, btn), stats, h('p', { class: 'fine' }, 'Simulated with an 8% average yearly return and 16% volatility. Not real market history.'));
    const yr = (v) => 'Y' + Math.round(v / 12);
    const pTop = new Plot(top, {
      height: (w) => (w < 480 ? 170 : 200),
      label: 'Simulated index value',
      draw(P) {
        const C = pal();
        const n = Math.round(months * reveal);
        const mx = Math.max(...S) * 1.05;
        P.domain(0, months, 0, mx);
        P.grid({ xTicks: [0, 60, 120, 180, 240, 300, 360], xf: yr, yf: (v) => Math.round(v) });
        P.line(
          S.slice(0, n + 1).map((v, i) => [i, v]),
          { color: C.ink, width: 1.75 }
        );
      },
    });
    const pBot = new Plot(bot, {
      height: (w) => (w < 480 ? 120 : 140),
      label: 'Simulated drawdowns',
      draw(P) {
        const C = pal();
        const n = Math.round(months * reveal);
        P.domain(0, months, Math.min(-0.25, Math.min(...DD) * 1.1), 0);
        P.grid({ xTicks: [0, 60, 120, 180, 240, 300, 360], xf: yr, yf: (v) => Math.round(v * 100) + '%', zero: false });
        P.hline(-0.1, { color: C.warn, dash: [3, 3], label: 'Correction −10%' });
        P.hline(-0.2, { color: C.loss, dash: [3, 3], label: 'Bear market −20%' });
        const pts = DD.slice(0, n + 1).map((v, i) => [i, v]);
        P.area(pts, 0, C.loss, 0.3);
        P.line(pts, { color: C.loss, width: 1.25 });
      },
    });
    function update() {
      pTop.render();
      pBot.render();
      const end = S[months],
        cagr = Math.pow(end / 100, 1 / 30) - 1;
      stats.replaceChildren(stat('$10,000 became', money(end * 100, { cents: false }), 'gain'), stat('Per year on average', pct(cagr, { sign: true })), stat('Worst drop', pct(Math.min(...DD), { d: 0 }), 'loss'), stat('Drops of 10%+', String(episodes(-0.1))), stat('Drops of 20%+', String(episodes(-0.2)), 'loss'));
    }
    function play() {
      if (cancel) cancel();
      update();
      cancel = tween(2200, (k) => {
        reveal = k;
        pTop.render();
        pBot.render();
      });
    }
    sim();
    update();
    return { play, destroy: () => (cancel && cancel(), pTop.destroy(), pBot.destroy()) };
  };

  /* ---------- risk ladder ---------- */
  V.riskLadder = function (host) {
    const A = [
      ['cash', 'Cash and savings', 0.5, 2.5, 'stock', 'Steady from day to day and easy to reach. Over long periods it often barely keeps up with inflation.'],
      ['gov', 'Government bonds', 5, 4, 'call', 'Loans to governments. Usually steady, and they often hold up when stocks fall. Prices drop when interest rates rise.'],
      ['corp', 'Corporate bonds', 7, 5, 'call', 'Loans to companies. Slightly higher interest than government bonds to pay for the risk of default.'],
      ['large', 'Large-company stocks', 15, 9, 'gain', 'Ownership of big, established companies. Strong long-run growth, with drops of 30% to 50% a few times a generation.'],
      ['small', 'Small-company stocks', 20, 10.5, 'gain', 'Younger, smaller companies. More growth potential and deeper swings.'],
      ['reit', 'Real estate (REITs)', 18, 8, 'violet', 'Companies that own property and pay out most of their rental income as dividends.'],
      ['comm', 'Commodities', 16, 4, 'put', 'Raw materials like oil and metals. Big swings without the long-run growth of a business. Not all risk is rewarded.'],
    ];
    let sel = 'large',
      grow = 1,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const chips = seg({ label: 'Asset class', options: A.map((a) => ({ v: a[0], label: a[1] })), value: sel, onChange: (v) => ((sel = v), update()) });
    const card = h('div', { class: 'duo-card txt', 'aria-live': 'polite' });
    stack(host, plotEl, chips.el, card, h('p', { class: 'fine' }, 'Illustrative long-run averages before inflation, rounded. Real results vary a lot by period and country. Not a forecast.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 240 : 290),
      pad: { b: 34 },
      label: 'Risk versus return of asset classes',
      draw(P) {
        const C = pal();
        P.domain(0, 24, 0, 12);
        P.grid({ xf: (v) => v + '%', yf: (v) => v + '%', xTicks: [0, 5, 10, 15, 20], yTicks: [0, 3, 6, 9, 12] });
        P.text('Size of yearly swings →', P.w - 8, P.h - 4, { align: 'right', base: 'bottom', color: C.muted });
        P.text('↑ Long-run return per year', P.pad.l + 4, P.pad.t + 2, { align: 'left', base: 'top', color: C.muted });
        A.forEach(([k, n, x, y, col]) => {
          const on = k === sel;
          const r = (on ? 9 : 6) * grow;
          const c = P.c;
          c.save();
          c.beginPath();
          c.arc(P.X(x), P.Y(y), r + (on ? 6 : 0), 0, Math.PI * 2);
          c.fillStyle = alpha(C[col], on ? 0.25 : 0);
          c.fill();
          c.beginPath();
          c.arc(P.X(x), P.Y(y), r, 0, Math.PI * 2);
          c.fillStyle = C[col];
          c.fill();
          c.restore();
          if (grow >= 1 && (on || P.w > 520)) P.text(n, P.X(x) + (x > 17 ? -12 : 12), P.Y(y), { align: x > 17 ? 'right' : 'left', color: on ? C.ink : C.muted, weight: on ? 700 : 500 });
        });
      },
    });
    function update() {
      plot.render();
      const a = A.find((x) => x[0] === sel);
      card.innerHTML = `<span class="duo-l">Swings about ${a[2]}% a year · long-run return about ${a[3]}% a year</span><b>${a[1]}</b><span>${a[5]}</span>`;
    }
    update();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(900, (k) => {
          grow = ease.out(k);
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- bond seesaw ---------- */
  V.bondSeesaw = function (host, p, ctx) {
    const face = 1000,
      cpn = 0.04,
      yrs = 10;
    let rate = 0.04,
      cancel = null;
    const price = (r) => {
      let v = 0;
      for (let t = 1; t <= yrs; t++) v += (face * cpn) / Math.pow(1 + r, t);
      return v + face / Math.pow(1 + r, yrs);
    };
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 360 150');
    svg.setAttribute('class', 'seesaw');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Seesaw: when interest rates go up, bond prices go down');
    svg.innerHTML = `<path class="ss-base" d="M180 104 L160 140 L200 140 Z"/><g class="ss-beam"><rect x="30" y="96" width="300" height="8" rx="4" class="ss-bar"/><g class="ss-end" transform="translate(56 70)"><rect x="-46" y="-22" width="92" height="44" rx="8" class="ss-box rate"/><text y="-5" class="ss-l">Interest rates</text><text y="13" class="ss-v rate-v"></text></g><g class="ss-end" transform="translate(304 70)"><rect x="-46" y="-22" width="92" height="44" rx="8" class="ss-box px"/><text y="-5" class="ss-l">Bond price</text><text y="13" class="ss-v px-v"></text></g></g>`;
    const sl = slider({ id: ctx.key + '-rate', label: 'Interest rate on new 10-year bonds', min: 1, max: 8, step: 0.25, value: 4, fmt: (v) => v.toFixed(2) + '%', onInput: (v) => (stop(), (rate = v / 100), update()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, svg, sl.el, h('p', { class: 'plot-h' }, 'Your bond’s payments: what each one is worth today'), plotEl, read);
    const plot = new Plot(plotEl, {
      height: 170,
      label: 'Present value of each bond payment',
      draw(P) {
        const C = pal();
        P.domain(0.4, yrs + 0.6, 0, 1100);
        P.grid({ xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], xf: (v) => 'Y' + v, yf: (v) => '$' + v, yTicks: [0, 500, 1000] });
        for (let t = 1; t <= yrs; t++) {
          const cf = face * cpn + (t === yrs ? face : 0);
          P.rect(t - 0.32, 0, t + 0.32, cf, alpha(C.muted, 0.18));
          P.rect(t - 0.32, 0, t + 0.32, cf / Math.pow(1 + rate, t), alpha(C.call, 0.85));
        }
      },
    });
    function update() {
      const px = price(rate),
        ang = Math.max(-14, Math.min(14, (rate - 0.04) * 400));
      svg.querySelector('.ss-beam').setAttribute('transform', `rotate(${-ang} 180 100)`);
      svg.querySelector('.rate-v').textContent = (rate * 100).toFixed(2) + '%';
      svg.querySelector('.px-v').textContent = money(px, { cents: false });
      plot.render();
      const d = px - face;
      read.innerHTML =
        Math.abs(rate - cpn) < 1e-9
          ? 'New bonds also pay 4%, so your bond is worth its full <b>$1,000</b>.'
          : rate > cpn
            ? `New bonds pay ${(rate * 100).toFixed(2)}%, or $${Math.round(rate * 1000)} a year. Yours pays $40, so a buyer will only pay about <b class="loss">${money(px, { cents: false })}</b> (${money(d, { sign: true, cents: false })}). At that price its yield matches the market.`
            : `New bonds pay only ${(rate * 100).toFixed(2)}%. Your $40 a year is attractive, so buyers will pay about <b class="gain">${money(px, { cents: false })}</b> (${money(d, { sign: true, cents: false })}).`;
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    update();
    return {
      play() {
        stop();
        cancel = tween(2600, (k) => {
          const t = ease.inOut(k);
          rate = k < 0.5 ? 0.04 + 0.03 * Math.sin(t * Math.PI) : 0.04 - 0.02 * Math.sin((t - 0.5) * 2 * Math.PI);
          rate = Math.round(rate * 400) / 400;
          sl.set(rate * 100);
          update();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- fund basket ---------- */
  V.fundBasket = function (host, p, ctx) {
    const H = [
      ['Titan Tech', 0.07],
      ['Nova Retail', 0.05],
      ['Orion Health', 0.04],
      ['Delta Energy', 0.03],
      ['Summit Bank', 0.025],
      ['Pioneer Auto', 0.02],
      ['Cedar Goods', 0.015],
      ['492 other companies', 0.75],
    ];
    let amt = 1000;
    const rows = h('div', { class: 'fb' });
    const items = H.map(([n, w]) => {
      const fill = h('i'),
        val = h('b');
      rows.append(h('div', { class: 'fb-row' + (w > 0.5 ? ' rest' : '') }, h('span', null, n), h('span', { class: 'fb-bar' }, fill), val));
      return { w, fill, val };
    });
    const sl = slider({ id: ctx.key + '-amt', label: 'You invest', min: 10, max: 10000, step: 10, value: amt, fmt: (v) => money(v, { cents: false }), onInput: (v) => ((amt = v), update()) });
    const stats = h('div', { class: 'stats' });
    const box = stack(host, h('div', { class: 'fb-head' }, h('b', null, 'Example 500 Index Fund'), h('span', null, 'Tracks 500 large companies · expense ratio 0.05%')), sl.el, rows, stats, h('p', { class: 'fine' }, 'A made-up fund with illustrative weights.'));
    function update() {
      items.forEach(({ w, fill, val }) => {
        fill.style.width = Math.min(100, (w / 0.07) * 100) + '%';
        val.textContent = money(amt * w, { cents: amt * w < 100 });
      });
      stats.replaceChildren(stat('Companies you now own', '500'), stat('Yearly fund cost', money(amt * 0.0005)), stat('Largest single holding', '7%'));
    }
    update();
    return {
      play() {
        if (SS.reduced) return;
        replay(box);
      },
    };
  };
})();
