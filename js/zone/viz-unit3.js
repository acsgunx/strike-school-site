/* The Trading Mindset, Unit 3 visuals: a risk calculator with a losing-streak view, and an interactive 20-trade exercise. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, usd, pal, alpha, tween, ease } = SS;
  const V = SS.viz;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const money = (v) => '$' + Math.round(v).toLocaleString('en-US');
  const units = (v) => (v > 0 ? '+' : '') + v + (Math.abs(v) === 1 ? ' unit' : ' units');
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);

  /* ---------- the risk calculator ---------- */
  V.riskCalc = function (host, p, ctx) {
    const st = { acct: 25000, risk: 1, entry: 50, dist: 5 };
    let reveal = 1,
      cancel = null;
    const mk = (key, label, min, max, step, fmt) => slider({ id: ctx.key + '-' + key, label, min, max, step, value: st[key], fmt, onInput: (v) => ((st[key] = v), paint()) });
    const sA = mk('acct', 'Account size', 5000, 200000, 1000, money),
      sR = mk('risk', 'Risk per trade', 0.25, 5, 0.25, (v) => v + '% of the account'),
      sE = mk('entry', 'Entry price', 10, 500, 1, (v) => usd(v)),
      sD = mk('dist', 'Stop distance', 1, 25, 0.5, (v) => v + '% below entry');
    const info = h('div', { class: 'stats' });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, info, sA.el, sR.el, sE.el, sD.el, h('p', { class: 'plot-h' }, 'The account after a streak of losses (losses in a row)'), plotEl, h('div', { class: 'legend' }, lg('var(--accent)', 'Your risk'), lg('var(--loss)', 'Risking 5% instead', true)), read);
    const calc = () => {
      const riskAmt = (st.acct * st.risk) / 100,
        stop = st.entry * (1 - st.dist / 100),
        shares = Math.floor(riskAmt / (st.entry - stop));
      return { riskAmt, stop, shares, value: shares * st.entry, loss: shares * (st.entry - stop) };
    };
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 190 : 220),
      pad: { l: 44, r: 12, t: 12, b: 26 },
      label: 'Account value after each loss in a row',
      draw(P) {
        const C = pal(),
          k = Math.round(10 * reveal);
        P.domain(-0.6, 10.6, 0, 100);
        P.grid({ xTicks: [0, 2, 4, 6, 8, 10], xf: (v) => (v ? String(v) : 'Start'), yTicks: [0, 25, 50, 75, 100], yf: (v) => v + '%' });
        for (let j = 0; j <= k; j++) {
          const v = 100 * Math.pow(1 - st.risk / 100, j),
            v5 = 100 * Math.pow(0.95, j);
          P.rect(j - 0.36, 0, j + 0.36, v, alpha(C.accent, 0.75));
          P.line([[j - 0.36, v5], [j + 0.36, v5]], { color: C.loss, width: 2, dash: [3, 2] });
        }
      },
    });
    function paint() {
      plot.render();
      const c = calc(),
        after = st.acct * Math.pow(1 - st.risk / 100, 10);
      info.replaceChildren(stat('Shares to buy', c.shares.toLocaleString('en-US'), 'accent'), stat('Position value', money(c.value), c.value > st.acct ? 'loss' : ''), stat('Loss if stopped', `${money(c.loss)} · ${((c.loss / st.acct) * 100).toFixed(2)}%`, 'loss'));
      read.innerHTML =
        (c.shares < 1
          ? `At this risk and stop distance you can’t afford even one share. Widen the risk, tighten the stop, or pick a cheaper stock. `
          : `Buy <b>${c.shares.toLocaleString('en-US')}</b> shares at ${usd(st.entry)} with a stop at ${usd(c.stop)}. If the stop is hit, you lose <b>${money(c.loss)}</b>, ${st.risk}% of the account. `) +
        (c.value > st.acct ? 'That position is bigger than your account, so it would need margin: tighten the risk or widen the stop. ' : '') +
        `Ten losses in a row would leave ${money(after)} (−${(100 - (after / st.acct) * 100).toFixed(1)}%)` + (st.risk < 5 ? `, against −${(100 - 100 * Math.pow(0.95, 10)).toFixed(1)}% at 5% per trade.` : '.');
    }
    paint();
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(1500, (k) => {
          reveal = Math.max(0.01, ease.out(k));
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- the 20-trade exercise ---------- */
  V.twentyTrades = function (host, p, ctx) {
    const N = 20;
    let seed = Date.now() % 100000,
      outcomes = [],
      log = [];
    const card = h('div', { class: 'zn-signal', 'aria-live': 'polite' });
    const takeBtn = h('button', { type: 'button', class: 'btn primary', onclick: () => act(true) }, 'Take the trade');
    const skipBtn = h('button', { type: 'button', class: 'btn', onclick: () => act(false) }, 'Skip it');
    const againBtn = h('button', { type: 'button', class: 'btn primary', hidden: true, onclick: () => start() }, 'Start a new 20');
    const strip = h('div', { class: 'zn-strip', 'aria-hidden': 'true' });
    const info = h('div', { class: 'stats' });
    const plotEl = h('div', { class: 'plot' });
    stack(host, card, h('div', { class: 'ctl-row' }, takeBtn, skipBtn, againBtn), strip, info, plotEl, h('div', { class: 'legend' }, lg('var(--accent)', 'Your result'), lg('var(--muted)', 'If you took all of them', true)));
    const curve = (all) => {
      const out = [0];
      log.forEach((e) => out.push(out[out.length - 1] + (all || e.taken ? (e.win ? 2 : -1) : 0)));
      return out;
    };
    const plot = new Plot(plotEl, {
      height: 170,
      pad: { l: 36, r: 12, t: 12, b: 24 },
      label: 'Your running result versus taking every signal',
      draw(P) {
        const C = pal(),
          a = curve(true),
          y = curve(false),
          lo = Math.min(-4, ...a, ...y),
          hi = Math.max(6, ...a, ...y);
        P.domain(0, N, lo - 1, hi + 1);
        P.grid({ xTicks: [0, 5, 10, 15, 20], yf: (v) => (v > 0 ? '+' : '') + Math.round(v) });
        P.line([[0, 0], [N, 0]], { color: C.ink, width: 1, alpha: 0.4 });
        P.line(a.map((v, i) => [i, v]), { color: C.muted, width: 1.75, dash: [5, 4] });
        P.line(y.map((v, i) => [i, v]), { color: C.accent, width: 2.5 });
      },
    });
    function start() {
      seed += 1;
      const r = SS.rng(seed);
      outcomes = Array.from({ length: N }, () => r() < 0.45);
      log = [];
      againBtn.hidden = true;
      takeBtn.hidden = skipBtn.hidden = false;
      paint('Signal 1 of 20. It meets every rule of your edge. What do you do?');
    }
    function act(taken) {
      const k = log.length,
        win = outcomes[k];
      log.push({ taken, win });
      const res = win ? '+2' : '−1';
      let msg = taken ? `Trade ${k + 1}: ${win ? 'a winner' : 'a loser'}, ${res} ${win ? 'units' : 'unit'}.` : `You skipped trade ${k + 1}. It would have ${win ? 'won +2' : 'lost −1'}.`;
      const last = log.slice(-2);
      if (k + 1 < N) {
        if (last.length === 2 && last.every((e) => !e.win)) msg += ' Two losses in a row. Your edge hasn’t changed: the next signal is as good as any.';
        else if (!taken) msg += ' You couldn’t have known; nobody can. That’s why the rule is to take them all.';
        msg += ` Signal ${k + 2} of 20 is here.`;
      }
      if (log.length >= N) finish(msg);
      else paint(msg);
    }
    function finish(msg) {
      takeBtn.hidden = skipBtn.hidden = true;
      againBtn.hidden = false;
      const y = curve(false)[N],
        a = curve(true)[N],
        taken = log.filter((e) => e.taken).length;
      paint(`${msg} Done: you followed the rule on <b>${taken} of 20</b> signals and finished at <b>${units(y)}</b>. Taking all 20 would have made ${units(a)}. ${taken === N ? 'That is the exercise: every signal, no exceptions. Judge yourself on that, whatever the result.' : 'Each skip was a coin you didn’t flip; over many series, skipping only shrinks the edge.'}`);
    }
    function paint(msg) {
      card.innerHTML = msg;
      strip.innerHTML = Array.from({ length: N }, (_, i) => {
        const e = log[i];
        return `<span class="${e ? (e.taken ? (e.win ? 'win' : 'loss') : 'skip ' + (e.win ? 'win' : 'loss')) : i === log.length ? 'next' : ''}"></span>`;
      }).join('');
      const taken = log.filter((e) => e.taken).length,
        y = curve(false)[log.length];
      info.replaceChildren(stat('Rule followed', `${taken} of ${log.length}`, taken === log.length ? 'gain' : 'loss'), stat('Your result', units(y), y > 0 ? 'gain' : y < 0 ? 'loss' : ''), stat('Winners so far', `${log.filter((e) => e.win).length} of ${log.length}`));
      plot.render();
    }
    start();
    return { destroy: () => plot.destroy() };
  };
})();
