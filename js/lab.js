/* Strike School — Strategy Lab: assemble legs, see the payoff now and at expiration. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, money, pct, usd, pal, MINUS } = SS;
  const M = 100;

  SS.lab = function (root, cleanups) {
    let S = 100,
      iv = 0.3,
      days = 30,
      elapsed = 0,
      preset = 'iron-condor';
    let legs = SS.buildLegs(preset, S, days, iv);
    let px = S;

    const page = h('div', { class: 'page lab' });
    root.append(page);
    page.append(
      h(
        'header',
        { class: 'page-head' },
        h('p', { class: 'eyebrow' }, 'Strategy Lab'),
        h('h1', null, 'Build a position, see its shape'),
        h('p', { class: 'lede' }, 'Pick a preset or assemble your own legs. Every leg is priced with the Black-Scholes model, so changing the stock price, volatility or time re-prices the whole position.')
      )
    );

    const presetSel = h('select', { id: 'lab-preset', class: 'select' }, SS.STRATS.map((s) => h('option', { value: s.id }, s.name)), h('option', { value: 'custom' }, 'Custom position'));
    presetSel.value = preset;
    presetSel.addEventListener('change', () => {
      if (presetSel.value === 'custom') return;
      preset = presetSel.value;
      legs = SS.buildLegs(preset, S, days, iv);
      px = S;
      refresh();
    });
    const desc = h('div', { class: 'lab-desc' });
    const sS = slider({ id: 'lab-s', label: 'ACME price today', min: 20, max: 300, step: 1, value: S, fmt: (v) => '$' + v, onInput: (v) => ((S = v), market()) });
    const sV = slider({ id: 'lab-iv', label: 'Implied volatility', min: 5, max: 150, step: 1, value: 30, fmt: (v) => v + '%', onInput: (v) => ((iv = v / 100), market()) });
    const sD = slider({
      id: 'lab-d',
      label: 'Days to expiration',
      min: 1,
      max: 365,
      step: 1,
      value: days,
      fmt: (v) => v + (v === 1 ? ' day' : ' days'),
      onInput: (v) => {
        days = v;
        elapsed = Math.min(elapsed, days);
        sT.setMax(days);
        sT.set(elapsed);
        market();
      },
    });
    const sT = slider({ id: 'lab-t', label: 'Fast-forward', min: 0, max: days, step: 1, value: 0, fmt: (v) => (v === 0 ? 'Today' : v + (v === 1 ? ' day' : ' days') + ' from now'), onInput: (v) => ((elapsed = v), draw()) });

    const legsWrap = h('div', { class: 'table-wrap' });
    const addBtn = h(
      'button',
      {
        type: 'button',
        class: 'btn sm',
        onclick: () => {
          legs.push({ type: 'call', side: 1, K: Math.round(S), qty: 1, premium: 0 });
          custom();
        },
      },
      '+ Add leg'
    );

    const plotEl = h('div', { class: 'plot' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-ink' }, h('i', { class: 'lg-sw' }), 'At expiration'), h('span', { class: 'lg lg-accent' }, h('i', { class: 'lg-sw dashed' }), 'Before expiration (see Fast-forward)'));
    const sP = slider({ id: 'lab-px', label: 'What if ACME is at…', min: 1, max: 600, step: 0.5, value: px, fmt: (v) => usd(v), onInput: (v) => ((px = v), draw()) });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const stats = h('div', { class: 'stats' });
    const greeks = h('div', { class: 'stats' });

    const left = h(
      'section',
      { class: 'panel lab-setup' },
      h('label', { class: 'field-l', for: 'lab-preset' }, 'Strategy'),
      presetSel,
      desc,
      h('h3', { class: 'panel-h' }, 'Market'),
      sS.el,
      sV.el,
      sD.el,
      h('h3', { class: 'panel-h' }, 'Legs'),
      legsWrap,
      addBtn
    );
    const right = h('section', { class: 'panel lab-chart' }, plotEl, legend, sP.el, sT.el, read, h('h3', { class: 'panel-h' }, 'At expiration, per position'), stats, h('h3', { class: 'panel-h' }, 'Position Greeks today'), greeks);
    page.append(h('div', { class: 'lab-grid' }, left, right));

    let lo = 70,
      hi = 130,
      y0 = -500,
      y1 = 500;
    function range() {
      const ks = legs.filter((l) => l.type !== 'stock').map((l) => l.K);
      lo = Math.max(0.5, Math.floor(Math.min(S * 0.75, ...ks.map((k) => k * 0.9))));
      hi = Math.ceil(Math.max(S * 1.25, ...ks.map((k) => k * 1.1)));
      const vals = [];
      for (let i = 0; i <= 200; i++) {
        const x = lo + ((hi - lo) * i) / 200;
        vals.push(SS.plExpiry(legs, x) * M, SS.plNow(legs, x, days, iv) * M);
      }
      let a = Math.min(0, ...vals),
        b = Math.max(0, ...vals);
      const span = b - a || 100;
      y0 = a - span * 0.12;
      y1 = b + span * 0.12;
      sP.setRange(lo, hi);
      px = Math.min(hi, Math.max(lo, px));
      sP.set(px);
    }

    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 260 : 340),
      label: 'Strategy payoff',
      onScrub: (v) => {
        px = Math.round(v * 2) / 2;
        sP.set(px);
        draw();
      },
      draw(P) {
        const C = pal();
        P.domain(lo, hi, y0, y1);
        P.grid({ xf: (v) => '$' + v, yf: SS.axisMoney });
        const A = SS.analyze(legs);
        A.strikes.forEach((k, i) => P.vline(k, { color: C.muted, dash: [2, 4], label: '$' + k, row: i % 2 }));
        P.vline(S, { color: C.accent, dash: [2, 3], label: 'Today', row: 2, alpha: 0.8 });
        const exp = P.sample((x) => SS.plExpiry(legs, x) * M, lo, hi, 400);
        P.fillPL(exp);
        P.line(exp, { color: C.ink, width: 3 });
        const left = days - elapsed;
        if (left > 0) P.line(P.sample((x) => SS.plNow(legs, x, left, iv) * M, lo, hi, 200), { color: C.accent, width: 2, dash: [6, 4] });
        A.breakevens.forEach((b) => {
          if (b > lo && b < hi) P.diamond(b, 0, C.ink);
        });
        const v = SS.plExpiry(legs, px) * M;
        P.vline(px, { color: C.ink, dash: null, alpha: 0.2 });
        if (left > 0) {
          const n = SS.plNow(legs, px, left, iv) * M;
          P.dot(px, n, { color: C.accent, r: 4 });
        }
        P.dot(px, v, { color: v >= 0 ? C.gain : C.loss });
        P.tag(money(v, { sign: true, cents: false }), P.X(px), P.Y(v), { bg: v >= 0 ? C.gain : C.loss });
      },
    });
    cleanups.push(() => plot.destroy());

    function legRow(l, i) {
      const sideSel = h('select', { id: `lab-leg-${i}-side`, class: 'select sm', 'aria-label': 'Buy or sell' }, h('option', { value: '1' }, 'Buy'), h('option', { value: '-1' }, 'Sell'));
      sideSel.value = String(l.side);
      const qty = h('input', { id: `lab-leg-${i}-qty`, class: 'input sm', type: 'number', min: 1, max: 20, step: 1, value: l.qty || 1, 'aria-label': 'Quantity' });
      const typeSel = h('select', { id: `lab-leg-${i}-type`, class: 'select sm', 'aria-label': 'Instrument' }, h('option', { value: 'call' }, 'Call'), h('option', { value: 'put' }, 'Put'), h('option', { value: 'stock' }, '100 shares'));
      typeSel.value = l.type;
      const strike = h('input', { id: `lab-leg-${i}-k`, class: 'input sm', type: 'number', min: 1, step: 0.5, value: l.K != null ? l.K : Math.round(S), disabled: l.type === 'stock' ? true : null, 'aria-label': 'Strike' });
      const del = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Remove leg', onclick: () => (legs.splice(i, 1), custom()) }, '×');
      sideSel.addEventListener('change', () => ((l.side = +sideSel.value), custom()));
      qty.addEventListener('change', () => ((l.qty = Math.max(1, Math.min(20, Math.round(+qty.value || 1)))), custom()));
      typeSel.addEventListener('change', () => {
        l.type = typeSel.value;
        if (l.type !== 'stock' && l.K == null) l.K = Math.round(S);
        if (l.type === 'stock') l.qty = 1;
        custom();
      });
      strike.addEventListener('change', () => ((l.K = Math.max(0.5, +strike.value || Math.round(S))), custom()));
      return h('tr', null, h('td', null, sideSel), h('td', null, l.type === 'stock' ? '1' : qty), h('td', null, typeSel), h('td', null, l.type === 'stock' ? '—' : strike), h('td', { class: 'num' }, usd(l.premium)), h('td', null, legs.length > 1 ? del : null));
    }
    function renderLegs() {
      const t = h('table', { class: 'legs-table' }, h('thead', null, h('tr', null, h('th', null, 'Side'), h('th', null, 'Qty'), h('th', null, 'Type'), h('th', null, 'Strike'), h('th', null, 'Price'), h('th', null, ''))), h('tbody', null, legs.map(legRow)));
      legsWrap.replaceChildren(t);
    }
    function renderDesc() {
      const st = SS.strat(preset);
      desc.innerHTML = st ? `<p><b>${st.view}</b> · ${st.risk} risk</p><p>${st.blurb}</p>` : '<p><b>Custom position.</b> Edit any leg or add new ones.</p>';
    }
    function custom() {
      preset = 'custom';
      presetSel.value = 'custom';
      SS.reprice(legs, S, days, iv);
      refresh();
    }
    function market() {
      if (preset !== 'custom') legs = SS.buildLegs(preset, S, days, iv);
      else SS.reprice(legs, S, days, iv);
      refresh();
    }
    function refresh() {
      if (!legs.length) legs.push({ type: 'call', side: 1, K: Math.round(S), qty: 1, premium: 0 });
      SS.reprice(legs, S, days, iv);
      renderDesc();
      renderLegs();
      range();
      const A = SS.analyze(legs),
        net = A.net * M;
      stats.replaceChildren(
        st(net >= 0 ? 'Net cost' : 'Net credit', money(Math.abs(net), { cents: false })),
        st('Max profit', isFinite(A.maxProfit) ? money(A.maxProfit * M, { cents: false }) : 'Unlimited', 'gain'),
        st('Max loss', isFinite(A.maxLoss) ? money(A.maxLoss * M, { cents: false }) : 'Unlimited', 'loss'),
        st(A.breakevens.length > 1 ? 'Breakevens' : 'Breakeven', A.breakevens.map((b) => usd(b)).join(' · ') || 'None'),
        st('Chance of profit', pct(SS.pop(legs, S, days, iv), { d: 0 }))
      );
      const g = SS.posGreeks(legs, S, days, iv);
      const sg = (v, d = 2) => (v < 0 ? MINUS : '+') + Math.abs(v).toFixed(d);
      greeks.replaceChildren(
        st('Δ Delta', sg(g.delta * M, 0) + ' shares'),
        st('Γ Gamma', sg(g.gamma * M, 2) + ' Δ per $1'),
        st('Θ Theta', money(g.theta * M, { sign: true }) + ' / day', SS.plClass(g.theta)),
        st('ν Vega', money(g.vega * M, { sign: true }) + ' / IV pt')
      );
      draw();
    }
    function st(label, value, cls = '') {
      return h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
    }
    function draw() {
      plot.render();
      const v = SS.plExpiry(legs, px) * M,
        left = days - elapsed;
      const now = left > 0 ? SS.plNow(legs, px, left, iv) * M : v;
      read.innerHTML = `If ACME is at <b>${usd(px)}</b>: at expiration <b class="${SS.plClass(v)}">${money(v, { sign: true, cents: false })}</b>${left > 0 ? `; with ${left} ${left === 1 ? 'day' : 'days'} still left, about <b class="${SS.plClass(now)}">${money(now, { sign: true, cents: false })}</b>` : ''}.`;
    }
    refresh();
  };
})();
