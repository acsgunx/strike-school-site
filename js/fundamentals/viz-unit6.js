/* Fundamentals, Unit 6 visuals: loss aversion, the order of operations, a plan builder. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, money, pal } = SS;
  const V = SS.viz;
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const m0 = (v) => money(v, { cents: false });

  /* ---------- loss aversion experiment ---------- */
  V.lossAversion = function (host, p, ctx) {
    let x = 100;
    const answers = {};
    const bet = h('div', { class: 'la-bet', 'aria-live': 'polite' });
    const yes = h('button', { type: 'button', class: 'btn primary', onclick: () => answer(true) }, 'I’d take it');
    const no = h('button', { type: 'button', class: 'btn', onclick: () => answer(false) }, 'I’d pass');
    const sl = slider({ id: ctx.key + '-x', label: 'If heads, you win', min: 50, max: 400, step: 25, value: x, fmt: (v) => m0(v), onInput: (v) => ((x = v), paint()) });
    const marks = h('div', { class: 'la-marks', 'aria-hidden': 'true' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const plotEl = h('div', { class: 'plot' });
    stack(host, bet, h('div', { class: 'ctl-row' }, yes, no), sl.el, marks, read, h('p', { class: 'plot-h' }, 'How gains and losses feel (prospect theory)'), plotEl);
    const feel = (d) => (d >= 0 ? Math.pow(d, 0.88) : -2.25 * Math.pow(-d, 0.88));
    const plot = new Plot(plotEl, {
      height: 180,
      label: 'Prospect theory value curve',
      draw(P) {
        const C = pal();
        P.domain(-200, 200, -230, 120);
        P.grid({ xf: (v) => (v < 0 ? '−$' + -v : v > 0 ? '+$' + v : '$0'), xTicks: [-200, -100, 0, 100, 200], noYLabels: true, yTicks: [-200, -100, 0, 100] });
        P.line(P.sample(feel, -200, 0, 100), { color: C.loss, width: 3 });
        P.line(P.sample(feel, 0, 200, 100), { color: C.gain, width: 3 });
        P.dot(100, feel(100), { color: C.gain, r: 4 });
        P.dot(-100, feel(-100), { color: C.loss, r: 4 });
        P.text('Winning $100 feels like this much', P.X(100), P.Y(feel(100)) - 14, { color: C.gain });
        P.text('Losing $100 hurts about twice as much', P.X(-100), P.Y(feel(-100)) + 16, { color: C.loss });
      },
    });
    function threshold() {
      const keys = Object.keys(answers).map(Number);
      const ys = keys.filter((k) => answers[k]),
        ns = keys.filter((k) => !answers[k]);
      if (!ys.length) return null;
      const maxNo = ns.length ? Math.max(...ns) : -Infinity;
      const above = ys.filter((v) => v > maxNo);
      return above.length ? Math.min(...above) : Math.min(...ys);
    }
    function paint() {
      const ev = 0.5 * x - 50;
      bet.innerHTML = `<span class="duo-l">A fair coin flip</span><div class="la-sides"><span class="la-h">Heads<b class="gain">+${m0(x)}</b></span><span class="la-t">Tails<b class="loss">−$100</b></span></div><span class="la-ev">Average result per flip: <b class="${ev > 0 ? 'gain' : ev < 0 ? 'loss' : ''}">${ev >= 0 ? '+' : '−'}${m0(Math.abs(ev))}</b></span>`;
      marks.replaceChildren(
        ...Object.keys(answers)
          .map(Number)
          .sort((a, b) => a - b)
          .map((k) => h('span', { class: 'la-m ' + (answers[k] ? 'y' : 'n'), style: { left: ((k - 50) / 350) * 100 + '%' } }, (answers[k] ? '✓ ' : '× ') + '$' + k))
      );
      const t = threshold();
      read.innerHTML =
        t == null
          ? 'Every bet above $100 has a positive average result, yet most people turn down a 50/50 chance at $150 against $100. Answer a few times to find your own threshold.'
          : `You would accept from about <b>${m0(t)}</b>, ${(t / 100).toFixed(2).replace(/\.?0+$/, '')}× the possible loss. In studies, many people need roughly twice the loss before they will take the bet. Any amount above $100 is a good bet on average.`;
    }
    function answer(y) {
      answers[x] = y;
      x = Math.max(50, Math.min(400, y ? x - 25 : x + 50));
      sl.set(x);
      paint();
    }
    paint();
    return { destroy: () => plot.destroy() };
  };

  /* ---------- order of operations ---------- */
  V.planLadder = function (host, p, ctx) {
    const R = [
      ['Emergency fund', 'Keep 3 to 6 months of essential expenses in cash, such as a high-yield savings account. A surprise bill then never forces you to sell investments at a bad time.'],
      ['Pay off high-interest debt', 'Clear credit cards and other debt charging high rates before investing. Low-rate debt, such as many mortgages, can be paid on its normal schedule.'],
      ['Get any employer match', 'If your employer matches retirement contributions, contribute at least enough to get the full match. It is an instant return on your money.'],
      ['Tax-advantaged accounts', 'Next, fill accounts such as a 401(k) or IRA in the US, or an ISA or pension in the UK, up to your goals and the yearly limits.'],
      ['Regular investment account', 'Beyond that, invest in a regular account using low-cost, diversified funds that match your plan.'],
    ];
    let cur = 0,
      exp = 3000,
      months = 6,
      timers = [];
    const ladder = h('ol', { class: 'pl' });
    const items = R.map(([t], i) => {
      const b = h('button', { type: 'button', class: 'pl-rung', onclick: () => sel(i) }, h('span', { class: 'pl-n' }, String(i + 1)), h('span', null, t));
      ladder.append(h('li', null, b));
      return b;
    });
    const card = h('div', { class: 'duo-card txt', 'aria-live': 'polite' });
    const calc = h('div', { class: 'pl-calc' });
    const sE = slider({ id: ctx.key + '-exp', label: 'Your essential monthly expenses', min: 500, max: 10000, step: 100, value: exp, fmt: m0, onInput: (v) => ((exp = v), paintCalc()) });
    const sM = seg({ label: 'Months of cover', options: [{ v: '3', label: '3 months' }, { v: '6', label: '6 months' }], value: '6', onChange: (v) => ((months = +v), paintCalc()) });
    stack(host, ladder, card, calc);
    calc.append(h('p', { class: 'plot-h' }, 'Emergency fund calculator'), sE.el, sM.el, h('p', { class: 'readout pl-out' }));
    function paintCalc() {
      calc.querySelector('.pl-out').innerHTML = `Target emergency fund: <b>${m0(exp * months)}</b> (${months} × ${m0(exp)}).`;
    }
    function sel(i) {
      cur = i;
      items.forEach((b, j) => {
        b.setAttribute('aria-pressed', String(j === i));
        b.classList.toggle('done', j < i);
      });
      card.innerHTML = `<span class="duo-l">Step ${i + 1} of ${R.length}</span><b>${R[i][0]}</b><span>${R[i][1]}</span>`;
      calc.hidden = i !== 0;
    }
    function clear() {
      timers.forEach(clearTimeout);
      timers = [];
    }
    sel(0);
    paintCalc();
    return {
      play() {
        if (SS.reduced) return;
        clear();
        R.forEach((_, i) => timers.push(setTimeout(() => sel(i), 300 + i * 700)));
        timers.push(setTimeout(() => sel(0), 300 + R.length * 700 + 400));
      },
      destroy: clear,
    };
  };

  /* ---------- plan builder ---------- */
  V.planBuilder = function (host, p, ctx) {
    const saved = SS.store.get('plan', {});
    const st = Object.assign({ goal: 'retire', yrs: 25, mo: 400, start: 5000, comfort: 'bal' }, saved);
    const GOALS = { retire: 'Retirement', home: 'A home down payment', edu: 'Education costs', wealth: 'Long-term wealth' };
    const goalSel = h('select', { id: ctx.key + '-goal', class: 'select' }, Object.keys(GOALS).map((k) => h('option', { value: k }, GOALS[k])));
    goalSel.value = st.goal;
    goalSel.addEventListener('change', () => ((st.goal = goalSel.value), update()));
    const sY = slider({ id: ctx.key + '-yrs', label: 'Years until you need the money', min: 1, max: 40, step: 1, value: st.yrs, fmt: (v) => v + (v === 1 ? ' year' : ' years'), onInput: (v) => ((st.yrs = v), update()) });
    const sM = slider({ id: ctx.key + '-mo', label: 'You will add each month', min: 50, max: 3000, step: 50, value: st.mo, fmt: m0, onInput: (v) => ((st.mo = v), update()) });
    const sS = slider({ id: ctx.key + '-st', label: 'Starting amount', min: 0, max: 100000, step: 1000, value: st.start, fmt: m0, onInput: (v) => ((st.start = v), update()) });
    const sC = seg({ label: 'Comfort with big swings', options: [{ v: 'low', label: 'Cautious' }, { v: 'bal', label: 'Balanced' }, { v: 'high', label: 'Comfortable' }], value: st.comfort, onChange: (v) => ((st.comfort = v), update()) });
    const card = h('pre', { class: 'plan-card', id: ctx.key + '-plan', tabindex: '0' });
    const copyBtn = h('button', { type: 'button', class: 'btn sm' }, 'Copy plan');
    const copied = h('span', { class: 'fine', 'aria-live': 'polite' });
    copyBtn.addEventListener('click', () => {
      const txt = card.textContent;
      const sel = () => {
        const r = document.createRange();
        r.selectNodeContents(card);
        const s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
        copied.textContent = 'Selected. Press Ctrl+C or ⌘C to copy.';
      };
      try {
        navigator.clipboard.writeText(txt).then(() => (copied.textContent = 'Copied to your clipboard.'), sel);
      } catch (e) {
        sel();
      }
    });
    const stats = h('div', { class: 'stats' });
    stack(host, h('div', { class: 'pb-form' }, h('label', { class: 'field-l', for: ctx.key + '-goal' }, 'Goal'), goalSel, sY.el, sM.el, sS.el, h('span', { class: 'field-l' }, 'Comfort with big swings'), sC.el), stats, card, h('div', { class: 'ctl-row' }, copyBtn, copied), h('p', { class: 'fine' }, 'A learning exercise using textbook rules of thumb: illustrative returns of 7% for stocks and 3.5% for bonds, plus or minus 2 points. Not personal advice. Saved only in this browser.'));
    const fv = (r) => {
      let v = st.start;
      const i = r / 12;
      for (let m = 0; m < st.yrs * 12; m++) v = v * (1 + i) + st.mo;
      return v;
    };
    function mix() {
      const y = st.yrs;
      let s = y < 3 ? 10 : y < 5 ? 30 : y < 10 ? 50 : y < 20 ? 70 : 85;
      s += st.comfort === 'low' ? -15 : st.comfort === 'high' ? 10 : 0;
      return Math.max(0, Math.min(95, Math.round(s / 5) * 5));
    }
    function update() {
      SS.store.set('plan', st);
      const s = mix(),
        r = (s * 0.07 + (100 - s) * 0.035) / 100;
      const lo = fv(Math.max(0, r - 0.02)),
        mid = fv(r),
        hi = fv(r + 0.02),
        put = st.start + st.mo * 12 * st.yrs;
      stats.replaceChildren(stat('Target mix', `${s}% stocks / ${100 - s}% bonds and cash`), stat('You will put in', m0(put)), stat('Possible value', `${m0(lo)} to ${m0(hi)}`, 'gain'), stat('Middle estimate', m0(mid)));
      card.textContent = [
        'MY INVESTING PLAN',
        '',
        `Goal: ${GOALS[st.goal]}, in ${st.yrs} ${st.yrs === 1 ? 'year' : 'years'}.`,
        `I will invest ${m0(st.mo)} every month, starting with ${m0(st.start)}.`,
        `Target mix: ${s}% stocks (broad, low-cost index funds), ${100 - s}% bonds and cash.`,
        st.yrs < 3 ? 'Because I need this money soon, I will keep most of it in cash or short-term bonds.' : 'I will automate contributions so they happen without a decision.',
        'I will rebalance once a year, or when my mix drifts more than 5 points.',
        'When markets fall 20% or more, I will keep investing on schedule and will not sell in a panic.',
        `I will review this plan once a year${st.yrs > 5 ? ', shifting toward bonds as my goal gets closer' : ''}.`,
        '',
        `Possible value at the goal: ${m0(lo)} to ${m0(hi)} (illustrative, not guaranteed).`,
      ].join('\n');
    }
    update();
  };
})();
