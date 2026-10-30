/* Strike School — Trade Simulator: a practice trade, 30 simulated days, and a P&L debrief. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, seg, money, pct, usd, pal } = SS;
  const M = 100,
    DAYS = 30;

  const SCEN = {
    climb: { label: 'Steady climb', mu: 1.2, vol: 0.15, iv: () => 0.25, note: 'ACME grinds higher with small daily swings.' },
    chop: { label: 'Sideways chop', mu: 0, vol: 0.24, revert: 8, iv: (d) => 0.3 - (0.05 * d) / DAYS, note: 'ACME bounces around and goes nowhere.' },
    drop: { label: 'Sharp drop', mu: -1.8, vol: 0.35, iv: (d) => 0.3 + 0.25 * Math.min(1, d / 12), note: 'A sell-off. Fear pushes implied volatility up.' },
    earnings: { label: 'Earnings jump', mu: 0.1, vol: 0.18, jumpDay: 8, jump: 0.05, iv: (d) => (d < 8 ? 0.7 : 0.3), note: 'Earnings come out on day 8. ACME pops about 5% and implied volatility collapses.' },
  };
  const TRADES = [
    { v: 'long-call', label: 'Buy a call', single: true },
    { v: 'long-put', label: 'Buy a put', single: true },
    { v: 'short-put', label: 'Sell a put', single: true },
    { v: 'straddle', label: 'Buy a straddle' },
    { v: 'bull-call', label: 'Bull call spread' },
    { v: 'iron-condor', label: 'Iron condor' },
  ];

  function legsFor(t, mny, iv) {
    const off = { itm: -5, atm: 0, otm: 5 }[mny];
    const L = (type, side, K, qty = 1) => ({ type, side, K, qty, premium: SS.r2(SS.bs(type, 100, K, DAYS, iv).price) });
    switch (t) {
      case 'long-call':
        return [L('call', 1, 100 + off)];
      case 'long-put':
        return [L('put', 1, 100 - off)];
      case 'short-put':
        return [L('put', -1, 100 - off)];
      case 'straddle':
        return [L('call', 1, 100), L('put', 1, 100)];
      case 'bull-call':
        return [L('call', 1, 100), L('call', -1, 110)];
      default:
        return [L('put', -1, 95), L('put', 1, 90), L('call', -1, 105), L('call', 1, 110)];
    }
  }

  function makePath(sc, seed) {
    const r = SS.rng(seed),
      dt = 1 / 365,
      S = [100];
    for (let d = 1; d <= DAYS; d++) {
      const s = S[d - 1];
      let mu = sc.mu;
      if (sc.revert) mu += sc.revert * Math.log(100 / s);
      let ret = (mu - (sc.vol * sc.vol) / 2) * dt + sc.vol * Math.sqrt(dt) * SS.gauss(r);
      if (sc.jumpDay === d) ret += sc.jump;
      S.push(s * Math.exp(ret));
    }
    return S;
  }

  SS.sim = function (root, cleanups) {
    let scenKey = 'mystery',
      hidden = pickHidden(),
      trade = 'long-call',
      mny = 'atm',
      speed = 1,
      seed = (Math.random() * 1e9) | 0;
    let run = null,
      timer = null;

    const page = h('div', { class: 'page sim' });
    root.append(page);
    page.append(
      h(
        'header',
        { class: 'page-head' },
        h('p', { class: 'eyebrow' }, 'Trade Simulator'),
        h('h1', null, 'Thirty days in fast-forward'),
        h('p', { class: 'lede' }, 'Choose a market, place a practice trade and watch it play out. Afterwards, a debrief splits your result into what the stock move, time decay and volatility each did. Practice money only.')
      )
    );

    const scenSeg = seg({ label: 'Market', options: [{ v: 'mystery', label: 'Mystery' }].concat(Object.keys(SCEN).map((k) => ({ v: k, label: SCEN[k].label }))), value: scenKey, onChange: (v) => ((scenKey = v), (hidden = pickHidden()), (seed = newSeed()), preview()) });
    const scenNote = h('p', { class: 'fine' });
    const tradeSeg = seg({ label: 'Trade', options: TRADES.map((t) => ({ v: t.v, label: t.label })), value: trade, onChange: (v) => ((trade = v), preview()) });
    const mnySeg = seg({ label: 'Strike', options: [{ v: 'itm', label: 'In the money' }, { v: 'atm', label: 'At the money' }, { v: 'otm', label: 'Out of the money' }], value: mny, onChange: (v) => ((mny = v), preview()) });
    const ticket = h('div', { class: 'sim-ticket' });
    const startBtn = h('button', { type: 'button', class: 'btn primary', onclick: () => start() }, 'Open trade and start');
    const speedSeg = seg({ label: 'Speed', options: [{ v: '1', label: '1×' }, { v: '2', label: '2×' }, { v: '4', label: '4×' }], value: '1', onChange: (v) => (speed = +v) });
    const setup = h(
      'section',
      { class: 'panel sim-setup' },
      h('h3', { class: 'panel-h' }, '1 · Market'),
      scenSeg.el,
      scenNote,
      h('h3', { class: 'panel-h' }, '2 · Trade'),
      tradeSeg.el,
      h('h3', { class: 'panel-h' }, '3 · Strike'),
      mnySeg.el,
      ticket,
      h('div', { class: 'ctl-row' }, startBtn, h('span', { class: 'fine' }, 'Speed'), speedSeg.el)
    );

    const kpis = h('div', { class: 'kpis' });
    const top = h('div', { class: 'plot' }),
      bot = h('div', { class: 'plot' });
    const closeBtn = h('button', { type: 'button', class: 'btn', disabled: true, onclick: () => finish(true) }, 'Close position now');
    const log = h('ol', { class: 'sim-log', 'aria-live': 'polite' });
    const debrief = h('div', { class: 'debrief', hidden: true });
    const runPanel = h('section', { class: 'panel sim-run' }, kpis, h('p', { class: 'plot-h' }, 'ACME price'), top, h('p', { class: 'plot-h' }, 'Your profit or loss'), bot, h('div', { class: 'ctl-row' }, closeBtn), debrief, h('h3', { class: 'panel-h' }, 'Trade log'), log);
    page.append(h('div', { class: 'sim-grid' }, setup, runPanel));

    function pickHidden() {
      const ks = Object.keys(SCEN);
      return ks[(Math.random() * ks.length) | 0];
    }
    function newSeed() {
      return (Math.random() * 1e9) | 0;
    }
    const activeScen = () => (scenKey === 'mystery' ? hidden : scenKey);

    function preview() {
      const single = TRADES.find((t) => t.v === trade).single;
      mnySeg.disable(!single);
      const sc = SCEN[activeScen()];
      const iv0 = sc.iv(0);
      scenNote.textContent = scenKey === 'mystery' ? 'A random market. Implied volatility at entry is your only clue.' : sc.note;
      const legs = legsFor(trade, single ? mny : 'atm', iv0);
      const A = SS.analyze(legs),
        net = A.net * M;
      ticket.innerHTML = `<span class="duo-l">Order ticket · ACME at $100.00 · 30 days · IV ${Math.round(iv0 * 100)}%</span><ul>${legs.map((l) => `<li>${SS.legLabel(l)}</li>`).join('')}</ul>
        <div class="stats"><div class="stat"><span class="stat-l">${net >= 0 ? 'You pay' : 'You collect'}</span><span class="stat-v">${money(Math.abs(net), { cents: false })}</span></div>
        <div class="stat"><span class="stat-l">Max loss</span><span class="stat-v loss">${isFinite(A.maxLoss) ? money(A.maxLoss * M, { cents: false }) : 'Unlimited'}</span></div>
        <div class="stat"><span class="stat-l">Max profit</span><span class="stat-v gain">${isFinite(A.maxProfit) ? money(A.maxProfit * M, { cents: false }) : 'Unlimited'}</span></div></div>`;
      if (!run) idleCharts(legs);
    }

    function build() {
      const key = activeScen(),
        sc = SCEN[key];
      const single = TRADES.find((t) => t.v === trade).single;
      const legs = legsFor(trade, single ? mny : 'atm', sc.iv(0));
      const S = makePath(sc, seed),
        iv = S.map((_, d) => sc.iv(d));
      const V = (d, s = S[d], dd = DAYS - d, v = iv[d]) => SS.posValue(legs, s, dd, v);
      const V0 = legs.reduce((a, l) => a + l.side * (l.qty || 1) * l.premium, 0);
      const pl = [0],
        attr = [{ price: 0, time: 0, vol: 0 }];
      let vals = [V0];
      for (let d = 1; d <= DAYS; d++) {
        const a = attr[d - 1];
        const p1 = V(d, S[d], DAYS - d + 1, iv[d - 1]),
          p0 = vals[d - 1];
        const t1 = V(d, S[d], DAYS - d, iv[d - 1]);
        const v1 = V(d);
        attr.push({ price: a.price + (p1 - p0), time: a.time + (t1 - p1), vol: a.vol + (v1 - t1) });
        vals.push(v1);
        pl.push((v1 - V0) * M);
      }
      const A = SS.analyze(legs);
      const risk = isFinite(A.maxLoss) ? Math.abs(A.maxLoss) * M : 100 * M;
      return { key, sc, legs, S, iv, vals, pl, attr, V0, A, risk, day: 0, done: false, closedEarly: false };
    }

    function start() {
      stop();
      run = build();
      startBtn.disabled = true;
      closeBtn.disabled = false;
      scenSeg.disable(true);
      tradeSeg.disable(true);
      mnySeg.disable(true);
      debrief.hidden = true;
      log.replaceChildren();
      const net = run.V0 * M;
      addLog(0, `You open the trade: ${run.legs.map(SS.legLabel).join(', ')}. ${net >= 0 ? 'You pay' : 'You collect'} ${money(Math.abs(net), { cents: false })}.`);
      render();
      tick();
    }
    function tick() {
      timer = setTimeout(() => {
        if (!run) return;
        run.day++;
        events(run.day);
        render();
        if (run.day >= DAYS) finish(false);
        else tick();
      }, 420 / speed);
    }
    function stop() {
      clearTimeout(timer);
      timer = null;
    }
    cleanups.push(stop);

    function events(d) {
      const r = run,
        ret = r.S[d] / r.S[d - 1] - 1;
      if (r.sc.jumpDay === d) addLog(d, `Earnings are out. ACME moves ${pct(ret, { sign: true })} overnight and implied volatility falls from ${Math.round(r.iv[d - 1] * 100)}% to ${Math.round(r.iv[d] * 100)}%.`, 'event');
      else if (Math.abs(ret) > 0.022) addLog(d, `ACME ${ret > 0 ? 'jumps' : 'drops'} ${pct(Math.abs(ret))} in a day.`);
      if (!r.flaggedIV && r.iv[d] - r.iv[0] >= 0.1) {
        r.flaggedIV = true;
        addLog(d, `Fear is rising: implied volatility is up to ${Math.round(r.iv[d] * 100)}%, which inflates option prices.`, 'event');
      }
      const cur = r.pl[d],
        sig = Math.max(25, r.risk * 0.08);
      if (Math.abs(cur) > sig) {
        const s = Math.sign(cur);
        if (r.lastSign && s !== r.lastSign) addLog(d, s > 0 ? 'Your position has swung into profit.' : 'Your position has slipped into a loss.');
        r.lastSign = s;
      }
      if (d === DAYS - 7) {
        const th = SS.posGreeks(r.legs, r.S[d], DAYS - d, r.iv[d]).theta * M;
        addLog(d, th < 0 ? `One week left. Time decay now costs you about ${money(Math.abs(th))} a day.` : `One week left. Time decay now earns you about ${money(th)} a day.`);
      }
    }
    function addLog(d, txt, cls = '') {
      log.prepend(h('li', { class: cls }, h('span', { class: 'log-d' }, d === 0 ? 'Day 0' : 'Day ' + d), h('span', null, txt)));
    }

    function finish(early) {
      if (!run || run.done) return;
      stop();
      run.done = true;
      run.closedEarly = early;
      startBtn.disabled = false;
      closeBtn.disabled = true;
      scenSeg.disable(false);
      tradeSeg.disable(false);
      preview();
      const d = run.day;
      addLog(d, d >= DAYS ? `Expiration. ACME closes at ${usd(run.S[d])}.` : `You close the position early at ${usd(run.S[d])}, with ${DAYS - d} days left.`, 'event');
      showDebrief();
    }

    function showDebrief() {
      const r = run,
        d = r.day,
        a = r.attr[d],
        total = r.pl[d];
      const parts = [
        ['price', 'Stock movement', a.price * M],
        ['time', 'Time decay', a.time * M],
        ['vol', 'Volatility change', a.vol * M],
      ];
      const maxAbs = Math.max(1, ...parts.map((p) => Math.abs(p[2])));
      const longVega = SS.posGreeks(r.legs, 100, DAYS, r.iv[0]).vega > 0;
      const lead = parts.slice().sort((x, y) => Math.abs(y[2]) - Math.abs(x[2]))[0];
      const msgs = {
        price: (v) => (v >= 0 ? 'The stock moved your way, and direction was the biggest driver.' : 'The stock moved against you, and direction was the biggest driver.'),
        time: (v) => (v >= 0 ? 'Time decay paid you. Every day that passed made the options you sold cheaper to buy back.' : 'Time decay was the biggest force. Bought options lose value every day, and the melt is fastest in the final week.'),
        vol: (v) =>
          longVega
            ? v < 0
              ? 'Falling implied volatility deflated your options. This is IV crush.'
              : 'Rising implied volatility inflated option prices in your favor.'
            : v < 0
              ? 'Rising implied volatility made the options you sold more expensive to buy back.'
              : 'Falling implied volatility helped you: the options you sold got cheaper.',
      };
      const insight = msgs[lead[0]](lead[2]);
      const links = { price: ['delta', 'Delta'], time: ['time-decay', 'Time decay'], vol: ['volatility', 'Volatility and IV crush'] };
      const [lid, ltitle] = links[lead[0]];
      debrief.hidden = false;
      debrief.replaceChildren(
        h('p', { class: 'eyebrow' }, 'Debrief' + (scenKey === 'mystery' ? ` · The market was: ${r.sc.label}` : '')),
        h('p', { class: 'debrief-total' }, h('b', { class: SS.plClass(total) }, money(total, { sign: true, cents: false })), h('span', null, ` ${pct(total / r.risk, { sign: true, d: 0 })} of the ${money(r.risk, { cents: false })} at risk`)),
        h(
          'div',
          { class: 'attr' },
          parts.map(([k, label, v]) =>
            h(
              'div',
              { class: 'attr-row' },
              h('span', { class: 'attr-l' }, label),
              h('div', { class: 'attr-track' }, h('span', { class: 'attr-zero' }), h('span', { class: 'attr-bar ' + (v >= 0 ? 'pos' : 'neg'), style: { width: (Math.abs(v) / maxAbs) * 50 + '%', left: v >= 0 ? '50%' : 50 - (Math.abs(v) / maxAbs) * 50 + '%' } })),
              h('b', { class: SS.plClass(v) }, money(v, { sign: true, cents: false }))
            )
          )
        ),
        h('p', { class: 'readout' }, insight, ' ', h('a', { href: '#lesson-' + lid }, 'Revisit: ' + ltitle)),
        h(
          'div',
          { class: 'ctl-row' },
          h('button', { type: 'button', class: 'btn primary', onclick: () => start() }, 'Same market, run again'),
          h(
            'button',
            {
              type: 'button',
              class: 'btn',
              onclick: () => {
                seed = newSeed();
                hidden = pickHidden();
                run = null;
                debrief.hidden = true;
                log.replaceChildren();
                preview();
                render();
              },
            },
            'New market'
          )
        ),
        h('p', { class: 'fine' }, 'Tip: “Same market” replays the identical price path, so you can switch the trade on the left and compare.')
      );
    }

    /* ---------- charts ---------- */
    let idleLegs = null;
    function idleCharts(legs) {
      idleLegs = legs;
      render();
    }
    function render() {
      pTop.render();
      pBot.render();
      const r = run;
      if (!r) {
        kpis.replaceChildren(kpi('Day', '0 of 30'), kpi('ACME', '$100.00'), kpi('IV', Math.round(SCEN[activeScen()].iv(0) * 100) + '%'), kpi('P&L', '$0'));
        return;
      }
      const d = r.day;
      kpis.replaceChildren(kpi('Day', `${d} of ${DAYS}`), kpi('ACME', usd(r.S[d]), SS.plClass(r.S[d] - 100)), kpi('IV', Math.round(r.iv[d] * 100) + '%'), kpi('P&L', money(r.pl[d], { sign: true, cents: false }), SS.plClass(r.pl[d])));
    }
    function kpi(l, v, cls = '') {
      return h('div', { class: 'kpi' }, h('span', { class: 'stat-l' }, l), h('b', { class: cls }, v));
    }
    const pTop = new Plot(top, {
      height: (w) => (w < 480 ? 170 : 200),
      label: 'Simulated ACME price',
      draw(P) {
        const C = pal(),
          r = run,
          legs = r ? r.legs : idleLegs || [];
        const ks = legs.filter((l) => l.type !== 'stock').map((l) => l.K);
        const seen = r ? r.S.slice(0, r.day + 1) : [100];
        const a = Math.min(92, ...ks, ...seen) - 2,
          b = Math.max(108, ...ks, ...seen) + 2;
        P.domain(0, DAYS, a, b);
        P.grid({ xf: (v) => 'D' + v, yf: (v) => '$' + v, xTicks: [0, 5, 10, 15, 20, 25, 30] });
        [...new Set(ks)].forEach((k, i) => P.hline(k, { color: C.muted, dash: [2, 4], label: '$' + k + ' strike', alpha: 0.9, row: i }));
        if (r && r.sc.jumpDay && r.day >= r.sc.jumpDay) P.vline(r.sc.jumpDay, { color: C.warn, dash: [3, 3], label: 'Earnings' });
        if (r) {
          const pts = seen.map((v, i) => [i, v]);
          P.line(pts, { color: C.ink, width: 2.5 });
          P.dot(r.day, r.S[r.day], { color: C.ink, r: 4 });
        } else P.dot(0, 100, { color: C.ink, r: 4 });
      },
    });
    const pBot = new Plot(bot, {
      height: (w) => (w < 480 ? 150 : 180),
      label: 'Simulated profit or loss',
      draw(P) {
        const C = pal(),
          r = run;
        const seen = r ? r.pl.slice(0, r.day + 1) : [0];
        const span = Math.max(100, ...seen.map(Math.abs));
        P.domain(0, DAYS, -span * 1.15, span * 1.15);
        P.grid({ xf: (v) => 'D' + v, yf: SS.axisMoney, xTicks: [0, 5, 10, 15, 20, 25, 30] });
        if (!r) return;
        const pts = seen.map((v, i) => [i, v]);
        P.fillPL(pts, 0.2);
        P.line(pts, { color: C.accent, width: 2.5 });
        const v = r.pl[r.day];
        P.dot(r.day, v, { color: v >= 0 ? C.gain : C.loss });
        P.tag(money(v, { sign: true, cents: false }), P.X(r.day), P.Y(v), { bg: v >= 0 ? C.gain : C.loss });
      },
    });
    cleanups.push(() => (pTop.destroy(), pBot.destroy()));
    preview();
    render();
  };
})();
