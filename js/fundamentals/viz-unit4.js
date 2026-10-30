/* Fundamentals, Unit 4 visuals: financial statements and business quality (Ridgeline Gear, $ millions). */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, money, pct, usd, pal, MINUS } = SS;
  const V = SS.viz;
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const $m = (v) => (v < 0 ? MINUS : '') + '$' + Math.abs(Math.round(v)).toLocaleString('en-US') + 'M';
  const PRICE = 22,
    SHARES = 100;

  /* ---------- horizontal waterfall (income statement, cash flow) ---------- */
  V.waterfall = function (host, p) {
    const items = p.items;
    let run = 0,
      max = 0,
      showPct = false,
      timers = [];
    const rows = items.map((it) => {
      let a, b, val;
      if (it.t === 'start') {
        a = 0;
        b = it.v;
        run = it.v;
        val = it.v;
      } else if (it.t === 'sub') {
        a = 0;
        b = run;
        val = run;
      } else {
        a = run;
        b = run + it.v;
        run = b;
        val = it.v;
      }
      max = Math.max(max, a, b);
      return Object.assign({}, it, { a, b, val });
    });
    const list = h('div', { class: 'wf' });
    const note = h('div', { class: 'duo-card txt', 'aria-live': 'polite' }, h('span', { class: 'duo-l' }, 'Tap a line'), h('b', null, rows[0].l), h('span', null, rows[0].note));
    const els = rows.map((r, i) => {
      const bar = h('i', { class: 'wf-bar ' + (r.t ? (r.key ? 'key' : 'tot') : r.val < 0 ? 'neg' : 'pos') });
      const valEl = h('b', { class: 'wf-v' });
      const row = h(
        'button',
        {
          type: 'button',
          class: 'wf-row' + (r.t === 'sub' ? ' sub' : ''),
          onclick: () => select(i),
        },
        h('span', { class: 'wf-l' }, r.l),
        h('span', { class: 'wf-track' }, bar),
        valEl
      );
      list.append(row);
      return { row, bar, valEl };
    });
    const toggle = p.pctOf ? seg({ label: 'Show values as', options: [{ v: 'usd', label: 'Dollars' }, { v: 'pct', label: '% of revenue' }], value: 'usd', onChange: (v) => ((showPct = v === 'pct'), paint()) }) : null;
    stack(host, toggle ? toggle.el : null, list, note, h('p', { class: 'fine' }, 'Ridgeline Gear is a made-up company. Figures in millions of dollars.'));
    function paint() {
      rows.forEach((r, i) => {
        const lo = Math.min(r.a, r.b),
          hi = Math.max(r.a, r.b);
        els[i].bar.style.left = (lo / max) * 100 + '%';
        els[i].bar.style.width = Math.max(0.6, ((hi - lo) / max) * 100) + '%';
        els[i].valEl.textContent = showPct ? pct(r.val / p.pctOf, { d: 0, sign: !r.t && r.val > 0 }) : (r.t || r.val < 0 ? '' : '+') + $m(r.val);
      });
    }
    function select(i) {
      els.forEach((e, j) => e.row.setAttribute('aria-pressed', String(i === j)));
      const r = rows[i];
      note.innerHTML = `<span class="duo-l">${r.t ? 'Total' : r.val < 0 ? 'Money out' : 'Money in'} · ${$m(r.val)}</span><b>${r.l}</b><span>${r.note}</span>`;
    }
    function clear() {
      timers.forEach(clearTimeout);
      timers = [];
    }
    paint();
    select(rows.length - 1);
    return {
      play() {
        if (SS.reduced) return;
        clear();
        els.forEach((e) => e.row.classList.add('pre'));
        els.forEach((e, i) =>
          timers.push(
            setTimeout(() => {
              e.row.classList.remove('pre');
              select(i);
            }, 200 + i * 420)
          )
        );
        timers.push(setTimeout(() => select(rows.length - 1), 200 + els.length * 420 + 300));
      },
      destroy: clear,
    };
  };

  /* ---------- margins: where $100 of sales goes ---------- */
  V.margins = function (host) {
    const C = {
      ridge: ['Ridgeline Gear', 'Outdoor gear retailer', 60, 25, 4, 11],
      soft: ['Cloudbase Software', 'Business software', 20, 50, 6, 24],
      groc: ['FreshCart Grocery', 'Supermarket chain', 75, 21.5, 1.5, 2],
    };
    let cur = 'ridge';
    const sg = seg({ label: 'Company', options: Object.keys(C).map((k) => ({ v: k, label: C[k][0] })), value: cur, onChange: (v) => ((cur = v), paint()) });
    const parts = [
      ['cogs', 'Cost of goods'],
      ['opex', 'Running the business'],
      ['tax', 'Interest and taxes'],
      ['keep', 'Profit kept'],
    ];
    const bar = h('div', { class: 'mg-bar' }, parts.map(([k]) => h('span', { class: 'mg-' + k })));
    const legend = h('div', { class: 'legend' }, parts.map(([k, l]) => h('span', { class: 'lg mg-lg-' + k }, h('i', { class: 'lg-sw block' }), l)));
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const tbl = h('div', { class: 'table-wrap' });
    tbl.innerHTML = `<table class="cmp"><thead><tr><th>Company</th><th>Gross margin</th><th>Operating margin</th><th>Net margin</th></tr></thead><tbody>${Object.values(C)
      .map((c) => `<tr><th>${c[0]}</th><td>${100 - c[2]}%</td><td>${100 - c[2] - c[3]}%</td><td>${c[5]}%</td></tr>`)
      .join('')}</tbody></table>`;
    stack(host, sg.el, h('p', { class: 'plot-h' }, 'Where $100 of sales goes'), bar, legend, read, tbl, h('p', { class: 'fine' }, 'Made-up companies with margins typical of their industries.'));
    function paint() {
      const c = C[cur];
      [c[2], c[3], c[4], c[5]].forEach((v, i) => {
        const el = bar.children[i];
        el.style.width = v + '%';
        el.textContent = v >= 6 ? '$' + v : '';
      });
      read.innerHTML = `<b>${c[0]}</b> (${c[1]}) keeps <b class="gain">$${c[5]}</b> of every $100 in sales. Gross margin ${100 - c[2]}%, operating margin ${100 - c[2] - c[3]}%, net margin ${c[5]}%.`;
    }
    paint();
  };

  /* ---------- earnings per share ---------- */
  V.eps = function (host, p, ctx) {
    let ni = 110,
      sh = 100;
    const big = h('div', { class: 'eps-big', 'aria-live': 'polite' });
    const coins = h('div', { class: 'eps-coins', 'aria-hidden': 'true' });
    const sN = slider({ id: ctx.key + '-ni', label: 'Net income', min: 40, max: 220, step: 5, value: ni, fmt: $m, onInput: (v) => ((ni = v), paint()) });
    const sS = slider({ id: ctx.key + '-sh', label: 'Shares outstanding', min: 60, max: 140, step: 5, value: sh, fmt: (v) => v + 'M', onInput: (v) => ((sh = v), paint()) });
    const btn = (label, d) => h('button', { type: 'button', class: 'btn sm', onclick: () => ((sh = Math.max(60, Math.min(140, sh + d))), sS.set(sh), paint()) }, label);
    const read = h('p', { class: 'readout' });
    stack(host, big, coins, h('div', { class: 'ctl-row' }, btn('Buy back 10M shares', -10), btn('Issue 10M new shares', 10)), sN.el, sS.el, read);
    function paint() {
      const eps = ni / sh;
      big.innerHTML = `<span class="duo-l">Earnings per share</span><b>${usd(eps)}</b><span>${$m(ni)} ÷ ${sh}M shares</span>`;
      const n = Math.round(sh / 5);
      coins.replaceChildren(...Array.from({ length: 28 }, (_, i) => h('span', { class: 'coin-s' + (i < n ? ' on' : '') })));
      const own = (1000 / (sh * 1e6)) * ni * 1e6;
      read.innerHTML = `Each dot is 5M shares. If you own 1,000 shares, your slice of this year's profit is <b>${money(own)}</b>. ${sh < 100 ? 'Fewer shares means a bigger slice each, with no change in profit.' : sh > 100 ? 'More shares dilutes every existing owner.' : ''}`;
    }
    paint();
  };

  /* ---------- balance sheet ---------- */
  V.balanceSheet = function (host) {
    const START = { cash: 150, recv: 250, ppe: 450, other: 150, pay: 120, debt: 280, otherL: 50 };
    let s = Object.assign({}, START);
    const eq = () => s.cash + s.recv + s.ppe + s.other - s.pay - s.debt - s.otherL;
    const A = [
      ['cash', 'Cash'],
      ['recv', 'Receivables and inventory'],
      ['ppe', 'Property and equipment'],
      ['other', 'Brands and other'],
    ];
    const L = [
      ['pay', 'Bills owed to suppliers'],
      ['debt', 'Debt'],
      ['otherL', 'Other liabilities'],
      ['equity', 'Shareholder equity'],
    ];
    const col = (list, cls) => h('div', { class: 'bs-col ' + cls }, list.map(([k, l]) => h('div', { class: 'bs-blk bs-' + k, 'data-k': k }, h('span', null, l), h('b'))));
    const left = col(A, 'a'),
      right = col(L, 'l');
    const eqn = h('p', { class: 'bs-eq', 'aria-live': 'polite' });
    const log = h('ol', { class: 'rb-log' });
    const acts = [
      ['Borrow $100M', () => ((s.cash += 100), (s.debt += 100)), 'Borrowed $100M: cash and debt both rise. Equity does not change.'],
      ['Earn $50M profit', () => ((s.cash += 50), 0), 'Earned $50M in profit, kept as cash. Equity rises $50M: the owners are richer.'],
      ['Pay a $30M dividend', () => ((s.cash -= 30), 0), 'Paid $30M to shareholders. Cash and equity both fall $30M.'],
      ['Buy $80M of equipment', () => ((s.cash -= 80), (s.ppe += 80)), 'Swapped $80M of cash for equipment. Total assets and equity do not change.'],
      ['Write off $60M', () => ((s.other -= 60), 0), 'A failed acquisition is written down by $60M. Assets and equity both shrink.'],
    ];
    const btns = h(
      'div',
      { class: 'ctl-row' },
      acts.map(([l, fn, txt]) =>
        h(
          'button',
          {
            type: 'button',
            class: 'btn sm',
            onclick: () => {
              const before = Object.assign({}, s);
              fn();
              if (s.cash < 0 || s.other < 0) {
                s = before;
                log.prepend(h('li', null, 'Not enough left to do that. Try another transaction or reset.'));
              } else log.prepend(h('li', null, txt));
              paint();
            },
          },
          l
        )
      ),
      h('button', { type: 'button', class: 'btn sm ghost', onclick: () => ((s = Object.assign({}, START)), log.replaceChildren(), paint()) }, 'Reset')
    );
    stack(host, h('div', { class: 'bs' }, h('div', { class: 'bs-side' }, h('p', { class: 'plot-h' }, 'Assets'), left), h('div', { class: 'bs-side' }, h('p', { class: 'plot-h' }, 'Liabilities + equity'), right)), eqn, btns, log);
    const scale = 1300;
    function paint() {
      const vals = Object.assign({}, s, { equity: eq() });
      [left, right].forEach((c) =>
        c.querySelectorAll('.bs-blk').forEach((b) => {
          const v = Math.max(0, vals[b.dataset.k]);
          b.style.height = (v / scale) * 320 + 'px';
          b.querySelector('b').textContent = $m(vals[b.dataset.k]);
          b.classList.toggle('tiny', v / scale < 0.07);
        })
      );
      const ta = s.cash + s.recv + s.ppe + s.other,
        tl = s.pay + s.debt + s.otherL;
      eqn.innerHTML = `Assets <b>${$m(ta)}</b> = liabilities <b>${$m(tl)}</b> + equity <b>${$m(vals.equity)}</b>`;
    }
    paint();
  };

  /* ---------- debt and financial health ---------- */
  V.debtHealth = function (host, p, ctx) {
    let x = 0,
      recession = false;
    const sl = slider({ id: ctx.key + '-x', label: 'Extra borrowing used to buy back shares', min: 0, max: 500, step: 25, value: 0, fmt: $m, onInput: (v) => ((x = v), paint()) });
    const sg = seg({ label: 'Economy', options: [{ v: 'normal', label: 'Normal year' }, { v: 'rec', label: 'Recession: profit halves' }], value: 'normal', onChange: (v) => ((recession = v === 'rec'), paint()) });
    const gauges = h('div', { class: 'dh' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, sl.el, gauges, read, h('p', { class: 'fine' }, 'New debt costs 6% a year. Zones are rough rules of thumb, not hard limits.'));
    const gauge = (label, value, txt, zone) => h('div', { class: 'dh-g ' + zone }, h('span', { class: 'duo-l' }, label), h('b', null, value), h('span', { class: 'dh-z' }, txt));
    function paint() {
      const debt = 280 + x,
        equity = 550 - x,
        interest = 10 + 0.06 * x,
        op = recession ? 75 : 150;
      const de = debt / equity,
        cov = op / interest;
      const zDE = de < 1 ? 'ok' : de < 2.5 ? 'warn' : 'bad',
        zC = cov > 8 ? 'ok' : cov > 3 ? 'warn' : 'bad';
      gauges.replaceChildren(
        gauge('Debt-to-equity', de.toFixed(2), zDE === 'ok' ? 'Comfortable' : zDE === 'warn' ? 'Elevated' : 'Heavy', zDE),
        gauge('Interest coverage', cov.toFixed(1) + '×', zC === 'ok' ? 'Comfortable' : zC === 'warn' ? 'Getting tight' : 'Danger zone', zC),
        gauge('Yearly interest', $m(interest), `${pct(interest / op, { d: 0 })} of operating profit`, zC),
        gauge('Current ratio', '2.7', 'Unchanged: this debt is long-term', 'ok')
      );
      read.innerHTML =
        x === 0 && !recession
          ? 'Ridgeline today: modest debt, and profits cover interest 15 times over.'
          : `With ${$m(debt)} of debt and ${$m(op)} of operating profit, interest takes <b class="${zC === 'bad' ? 'loss' : ''}">${pct(interest / op, { d: 0 })}</b> of profits. ${zC === 'bad' ? 'One more bad year could put the company in real trouble.' : recession ? 'A recession squeezes the cushion, but the company copes.' : 'Borrowing boosts EPS through the buyback, but adds fixed bills.'}`;
    }
    paint();
  };

  /* ---------- book value and P/B ---------- */
  V.bookValue = function (host, p, ctx) {
    let price = PRICE;
    const sl = slider({ id: ctx.key + '-px', label: 'Ridgeline share price', min: 3, max: 60, step: 0.5, value: price, fmt: (v) => usd(v), onInput: (v) => ((price = v), paint()) });
    const bars = h('div', { class: 'bv' });
    const stats = h('div', { class: 'stats' });
    stack(host, sl.el, bars, stats);
    function paint() {
      const cap = price * SHARES,
        book = 550,
        max = 6000;
      bars.innerHTML = `<div class="bv-row"><span>Market value (price × shares)</span><span class="bv-track"><i class="mkt" style="width:${Math.min(100, (cap / max) * 100)}%"></i></span><b>${$m(cap)}</b></div>
        <div class="bv-row"><span>Book value (equity)</span><span class="bv-track"><i class="book" style="width:${(book / max) * 100}%"></i></span><b>${$m(book)}</b></div>`;
      const pb = price / 5.5;
      stats.replaceChildren(stat('Book value per share', '$5.50'), stat('Price-to-book', pb.toFixed(1) + '×'), stat(cap >= book ? 'Value the market sees off the balance sheet' : 'Discount to book value', $m(Math.abs(cap - book)), cap >= book ? 'accent' : 'loss'));
    }
    paint();
  };

  /* ---------- free cash flow ---------- */
  V.fcf = function (host, p, ctx) {
    let cfo = 140,
      capex = 60;
    const sO = slider({ id: ctx.key + '-cfo', label: 'Operating cash flow', min: 40, max: 250, step: 5, value: cfo, fmt: $m, onInput: (v) => ((cfo = v), paint()) });
    const sC = slider({ id: ctx.key + '-cap', label: 'Capital expenditures', min: 10, max: 200, step: 5, value: capex, fmt: $m, onInput: (v) => ((capex = v), paint()) });
    const bars = h('div', { class: 'bv' });
    const stats = h('div', { class: 'stats' });
    stack(host, bars, sO.el, sC.el, stats);
    function paint() {
      const f = cfo - capex,
        max = 250;
      const row = (l, v, cls) => `<div class="bv-row"><span>${l}</span><span class="bv-track"><i class="${cls}" style="width:${(Math.abs(v) / max) * 100}%"></i></span><b class="${v < 0 ? 'loss' : ''}">${$m(v)}</b></div>`;
      bars.innerHTML = row('Operating cash flow', cfo, 'book') + row('Capital expenditures', -capex, 'neg') + row('Free cash flow', f, f >= 0 ? 'fcf' : 'neg');
      stats.replaceChildren(stat('Free cash flow per share', usd(f / SHARES), SS.plClass(f)), stat('FCF yield at $22 a share', pct(f / (PRICE * SHARES), { d: 1 }), SS.plClass(f)), stat('Compared with net income', pct(f / 110, { d: 0 })));
    }
    paint();
  };

  /* ---------- earnings vs cash ---------- */
  V.earningsVsCash = function (host) {
    const D = {
      ok: { ni: [80, 88, 97, 105, 110], cfo: [95, 104, 112, 124, 140], rec: [60, 64, 68, 74, 80], txt: 'Profits and cash grow together, and receivables rise in line with sales. Earnings are turning into real cash.' },
      bad: { ni: [80, 95, 112, 128, 145], cfo: [92, 85, 70, 55, 38], rec: [60, 90, 130, 175, 230], txt: 'Reported profit nearly doubled, but cash from operations fell by more than half. Money owed by customers almost quadrupled: sales are being booked faster than they are collected.' },
    };
    let k = 'ok';
    const sg = seg({ label: 'Company', options: [{ v: 'ok', label: 'Healthy company' }, { v: 'bad', label: 'Warning signs' }], value: k, onChange: (v) => ((k = v), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-ink' }, h('i', { class: 'lg-sw' }), 'Net income'), h('span', { class: 'lg lg-gain' }, h('i', { class: 'lg-sw' }), 'Operating cash flow'), h('span', { class: 'lg lg-put' }, h('i', { class: 'lg-sw block' }), 'Money customers owe'));
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, legend, read);
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 220 : 260),
      label: 'Net income versus operating cash flow',
      draw(P) {
        const C = pal(),
          d = D[k];
        P.domain(0.5, 5.5, 0, 240);
        P.grid({ xTicks: [1, 2, 3, 4, 5], xf: (v) => 'Year ' + v, yf: (v) => '$' + v + 'M', yTicks: [0, 80, 160, 240] });
        d.rec.forEach((v, i) => P.rect(i + 1 - 0.28, 0, i + 1 + 0.28, v, SS.alpha(C.put, 0.22)));
        P.line(
          d.ni.map((v, i) => [i + 1, v]),
          { color: C.ink, width: 3 }
        );
        P.line(
          d.cfo.map((v, i) => [i + 1, v]),
          { color: C.gain, width: 3 }
        );
        d.ni.forEach((v, i) => P.dot(i + 1, v, { color: C.ink, r: 3.5 }));
        d.cfo.forEach((v, i) => P.dot(i + 1, v, { color: C.gain, r: 3.5 }));
      },
    });
    function paint() {
      plot.render();
      read.textContent = D[k].txt;
    }
    paint();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- ROE breakdown ---------- */
  V.dupont = function (host, p, ctx) {
    let m = 0.11,
      t = 1.0,
      lev = 1.82;
    const sM = slider({ id: ctx.key + '-m', label: 'Net margin', min: 1, max: 30, step: 1, value: 11, fmt: (v) => v + '%', onInput: (v) => ((m = v / 100), paint()) });
    const sT = slider({ id: ctx.key + '-t', label: 'Asset turnover (sales per $1 of assets)', min: 0.3, max: 3, step: 0.1, value: 1, fmt: (v) => v.toFixed(1) + '×', onInput: (v) => ((t = v), paint()) });
    const sL = slider({ id: ctx.key + '-l', label: 'Leverage (assets per $1 of equity)', min: 1, max: 6, step: 0.1, value: 1.8, fmt: (v) => v.toFixed(1) + '×', onInput: (v) => ((lev = v), paint()) });
    const eqn = h('div', { class: 'dp', 'aria-live': 'polite' });
    const read = h('p', { class: 'readout' });
    stack(host, eqn, sM.el, sT.el, sL.el, read);
    function paint() {
      const roe = m * t * lev;
      eqn.innerHTML = `<span class="dp-t"><small>Net margin</small><b>${Math.round(m * 100)}%</b></span><span class="dp-op">×</span><span class="dp-t"><small>Turnover</small><b>${t.toFixed(1)}×</b></span><span class="dp-op">×</span><span class="dp-t${lev > 3 ? ' warn' : ''}"><small>Leverage</small><b>${lev.toFixed(1)}×</b></span><span class="dp-op">=</span><span class="dp-t res"><small>ROE</small><b>${pct(roe, { d: 0 })}</b></span>`;
      read.innerHTML = lev > 3 ? `ROE of <b>${pct(roe, { d: 0 })}</b>, but much of it comes from borrowing. Debt magnifies returns in good years and losses in bad ones.` : roe >= 0.15 ? `ROE of <b class="gain">${pct(roe, { d: 0 })}</b>, earned mostly through the business itself. That is the healthy kind.` : `ROE of <b>${pct(roe, { d: 0 })}</b>. Ridgeline earns 20% with an 11% margin, 1.0× turnover and 1.8× leverage.`;
    }
    paint();
  };
})();
