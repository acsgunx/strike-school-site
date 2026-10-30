/* Strike School — Options course, Unit 6 visuals: the VIX. Expected moves, the VIX from an option strip, historical
   levels, a simulated year of stocks and the VIX, implied versus realized, option prices, the futures curve,
   roll decay in VIX funds, and volatility indexes worldwide. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, seg, usd, pct, pal, alpha, tween, ease } = SS;
  const V = SS.viz,
    TA = SS.TA;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };
  const stat = (label, value, cls = '') => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, label), h('span', { class: 'stat-v ' + cls }, value));
  const lg = (color, text, dashed) => h('span', { class: 'lg', style: '--c:' + color }, h('span', { class: 'lg-sw' + (dashed ? ' dashed' : '') }), text);
  const regime = (v) => (v < 15 ? ['Calm', 'gain'] : v < 20 ? ['Normal', 'accent'] : v < 30 ? ['Elevated', ''] : v < 40 ? ['Stressed', 'loss'] : ['Panic', 'loss']);
  const n0 = (v) => Math.round(v).toLocaleString('en-US');
  /** Glide a value with a tween; returns the cancel function. */
  const glideTo = (from, to, ms, fn) => tween(ms, (k) => fn(from + (to - from) * ease.inOut(k)));

  /* ---------- expected moves from the VIX ---------- */
  V.vixMove = function (host, p, ctx) {
    const SPX = 5000;
    let vix = 19.5,
      cancel = null;
    const PRE = [[9.14, 'Record low'], [19.5, 'Average'], [37.3, 'Feb 2018'], [82.7, 'Mar 2020']];
    const sl = slider({ id: ctx.key + '-v', label: 'VIX', min: 9, max: 85, step: 0.1, value: vix, fmt: (v) => v.toFixed(1), onInput: (v) => (stop(), (vix = v), paint()) });
    const sg = seg({ label: 'Jump to a real level', options: PRE.map(([v, l]) => ({ v: String(v), label: `${l} ${v}` })), value: '', onChange: (v) => (stop(), (cancel = glideTo(vix, +v, 600, set))) });
    const plotEl = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, info, plotEl, sl.el, sg.el, read, h('p', { class: 'fine' }, 'Illustration with the S&P 500 at 5,000. Ranges are one standard deviation: the market expects to stay inside them about two times in three.'));
    const ROWS = [['1 day', 252], ['1 week', 52], ['1 month', 12]];
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 220 : 250),
      pad: { l: 12, r: 12, t: 10, b: 26 },
      label: 'Expected S&P 500 ranges for a day, a week and a month',
      draw(P) {
        const C = pal(),
          col = vix < 20 ? C.accent : vix < 30 ? C.warn : C.loss;
        P.domain(3700, 6300, 0, 3.4);
        P.grid({ xTicks: [4000, 4500, 5000, 5500, 6000], yTicks: [], xf: n0 });
        P.line([[SPX, 0], [SPX, 3.4]], { color: C.ink, width: 1, dash: [3, 3], alpha: 0.6 });
        ROWS.forEach(([name, k], j) => {
          const y = 2.6 - j * 1.05,
            m = vix / 100 / Math.sqrt(k),
            lo = SPX * (1 - m),
            hi = SPX * (1 + m);
          P.rect(lo, y - 0.22, hi, y + 0.22, alpha(col, 0.32));
          [lo, hi].forEach((x) => P.line([[x, y - 0.3], [x, y + 0.3]], { color: col, width: 2.5 }));
          P.text(name, P.X(3720), P.Y(y + 0.45), { align: 'left', color: C.ink });
          P.text(`±${(m * 100).toFixed(1)}% · ±${n0(SPX * m)}`, P.X(hi) + 6, P.Y(y), { align: 'left', color: col });
        });
      },
    });
    function set(v) {
      vix = v;
      sl.set(v);
      paint();
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    function paint() {
      plot.render();
      const r = regime(vix);
      info.replaceChildren(stat('VIX', vix.toFixed(1), r[1]), stat('Daily (÷16)', `±${(vix / Math.sqrt(252)).toFixed(2)}%`), stat('Monthly (÷3.5)', `±${(vix / Math.sqrt(12)).toFixed(1)}%`));
      read.innerHTML = `<b class="${r[1]}">${r[0]}.</b> At a VIX of ${vix.toFixed(1)} the S&P 500 is priced for about ±${n0((SPX * vix) / 100 / Math.sqrt(252))} points on a typical day and ±${n0((SPX * vix) / 100 / Math.sqrt(12))} over a month, in either direction.`;
    }
    paint();
    return {
      play() {
        stop();
        const path = [vix, 12, 45, 19.5];
        cancel = tween(4200, (k) => {
          const t = k * (path.length - 1),
            j = Math.min(path.length - 2, Math.floor(t));
          set(path[j] + (path[j + 1] - path[j]) * ease.inOut(t - j));
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- the VIX from a strip of options ---------- */
  /** VIX-style variance from out-of-the-money options with an implied-volatility skew (forward 100, 30 days). */
  function strip(atm, skew) {
    const days = 30,
      T = days / 365,
      r = SS.RATE,
      F = 100,
      S0 = F * Math.exp(-r * T);
    const items = [];
    let sum = 0,
      puts = 0;
    for (let K = 55; K <= 145; K++) {
      const iv = Math.max(0.05, atm + skew * Math.max(0, (F - K) / F) + 0.3 * Math.pow((K - F) / F, 2));
      const q = K < F ? SS.bs('put', S0, K, days, iv).price : K > F ? SS.bs('call', S0, K, days, iv).price : (SS.bs('put', S0, K, days, iv).price + SS.bs('call', S0, K, days, iv).price) / 2;
      const c = (1 / (K * K)) * Math.exp(r * T) * q;
      sum += c;
      if (K < F) puts += c;
      else if (K === F) puts += c / 2;
      items.push({ K, c, side: K < F ? -1 : K > F ? 1 : 0 });
    }
    return { vix: 100 * Math.sqrt((2 / T) * sum), items, putShare: puts / sum };
  }
  V.vixBuild = function (host, p, ctx) {
    let atm = 0.18,
      skew = 0.6,
      cancel = null;
    const sA = slider({ id: ctx.key + '-a', label: 'At-the-money implied volatility', min: 10, max: 50, step: 1, value: atm * 100, fmt: (v) => v + '%', onInput: (v) => (stop(), (atm = v / 100), paint()) });
    const sS = slider({ id: ctx.key + '-s', label: 'Put demand (skew)', min: 0, max: 1.5, step: 0.05, value: skew, fmt: (v) => (v < 0.2 ? 'none' : v < 0.7 ? 'normal' : v < 1.1 ? 'high' : 'panic'), onInput: (v) => (stop(), (skew = v), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, info, plotEl, sA.el, sS.el, read, h('p', { class: 'fine' }, 'A simplified strip: an index scaled to 100, options 30 days out, every strike from 55 to 145. Each bar is that option’s weighted contribution to the VIX.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 210 : 240),
      pad: { l: 12, r: 12, t: 22, b: 26 },
      label: 'Each option’s contribution to the VIX, by strike',
      draw(P) {
        const C = pal(),
          s = strip(atm, skew),
          mx = Math.max(...s.items.map((x) => x.c));
        P.domain(54, 146, 0, mx * 1.08);
        P.grid({ xTicks: [60, 80, 100, 120, 140], yTicks: [], xf: (v) => 'K ' + v });
        s.items.forEach((x) => P.rect(x.K - 0.42, 0, x.K + 0.42, x.c, alpha(x.side < 0 ? C.loss : x.side > 0 ? C.gain : C.accent, 0.75)));
        P.text('Puts (downside)', P.X(75), 12, { color: C.loss });
        P.text('Calls (upside)', P.X(125), 12, { color: C.gain });
      },
    });
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    function paint() {
      plot.render();
      const s = strip(atm, skew),
        flat = strip(atm, 0);
      info.replaceChildren(stat('VIX', s.vix.toFixed(1), 'accent'), stat('ATM implied vol', (atm * 100).toFixed(0) + '%'), stat('From puts', Math.round(s.putShare * 100) + '%', 'loss'));
      read.innerHTML = `With no extra put demand, the VIX would be about <b>${flat.vix.toFixed(1)}</b>, close to at-the-money volatility. Put demand adds <b>${(s.vix - flat.vix).toFixed(1)}</b> points, and puts supply ${Math.round(s.putShare * 100)}% of the total.`;
    }
    paint();
    return {
      play() {
        stop();
        const path = [skew, 0, 1.3, skew];
        cancel = tween(3600, (k) => {
          const t = k * (path.length - 1),
            j = Math.min(path.length - 2, Math.floor(t));
          skew = path[j] + (path[j + 1] - path[j]) * ease.inOut(t - j);
          sS.set(skew);
          paint();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- historical levels ---------- */
  const MARKS = [
    [9.14, 'Record low close, November 2017: an unusually calm market.'],
    [19.5, 'Roughly the long-run average since 1990.'],
    [37.3, 'February 5, 2018: the VIX more than doubled in a day; the inverse note XIV collapsed.'],
    [65, 'August 5, 2024: briefly above 65 intraday during the yen carry-trade unwind.'],
    [82.69, 'Record close, March 16, 2020: the COVID crash.'],
    [89.53, 'Record intraday high, October 24, 2008: the financial crisis.'],
  ];
  V.vixLevels = function (host, p, ctx) {
    let needle = 92,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const list = h('ol', { class: 'vix-marks' });
    stack(host, plotEl, h('div', { class: 'legend' }, lg('var(--gain)', 'Calm < 15'), lg('var(--accent)', 'Normal 15–20'), lg('var(--warn)', 'Elevated 20–30'), lg('var(--loss)', 'Stressed 30+')), list);
    const plot = new Plot(plotEl, {
      height: 150,
      pad: { l: 12, r: 12, t: 12, b: 26 },
      label: 'The VIX scale with historical landmarks',
      draw(P) {
        const C = pal();
        P.domain(0, 92, 0, 1);
        P.grid({ xTicks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90], yTicks: [] });
        [[0, 15, C.gain, 0.22], [15, 20, C.accent, 0.22], [20, 30, C.warn, 0.22], [30, 40, C.loss, 0.18], [40, 92, C.loss, 0.3]].forEach(([a, b, c, al]) => P.rect(a, 0.12, Math.min(b, needle), 0.42, alpha(c, al)));
        MARKS.forEach(([v], j) => {
          if (v > needle) return;
          const y = j % 2 ? 0.86 : 0.64;
          P.line([[v, 0.12], [v, y - 0.08]], { color: C.ink, width: 1.25, alpha: 0.7 });
          P.dot(v, y, { color: v >= 30 ? C.loss : v >= 20 ? C.warn : C.accent, r: 8 });
          P.text(String(j + 1), P.X(v), P.Y(y), { color: C.onsolid, weight: 700, size: 10 });
        });
        if (needle < 92) P.line([[needle, 0.05], [needle, 0.5]], { color: C.ink, width: 2.5 });
      },
    });
    list.innerHTML = MARKS.map(([v, t]) => `<li><b>${v}</b> ${t}</li>`).join('');
    return {
      play() {
        if (cancel) cancel();
        cancel = tween(3200, (k) => {
          needle = 92 * ease.inOut(k);
          plot.render();
        });
      },
      destroy: () => (cancel && cancel(), plot.destroy()),
    };
  };

  /* ---------- a simulated year: the S&P 500 and the VIX ---------- */
  /** Daily S&P closes from a designed volatility schedule (calm, a selloff, a recovery) and a VIX that reacts to them. */
  function simYear() {
    const r = SS.rng(14);
    let vix = 14,
      px = 5000;
    const out = [{ px, vix, ret: 0 }];
    for (let t = 1; t < 252; t++) {
      const crash = t >= 150 && t < 166,
        rec = t >= 166 && t < 200;
      const sig = crash ? 0.021 : rec ? 0.012 : t > 200 ? 0.0092 : 0.0078,
        mu = crash ? -0.0062 : rec ? 0.0028 : 0.0009;
      const ret = mu + sig * SS.gauss(r);
      px *= 1 + ret;
      const a = ret < 0 ? 6.5 : 3.0; // the VIX reacts more to drops than to gains
      const lv = Math.log(vix) + 0.06 * (Math.log(15.5) - Math.log(vix)) - a * ret + 0.025 * SS.gauss(r);
      vix = Math.min(85, Math.max(9.5, Math.exp(lv)));
      out.push({ px, vix, ret });
    }
    return out;
  }
  const asBars = (vals) => vals.map((v, i) => ({ o: i ? vals[i - 1] : v, h: Math.max(v, i ? vals[i - 1] : v), l: Math.min(v, i ? vals[i - 1] : v), c: v }));
  V.vixSeesaw = function (host, p, ctx) {
    const s = simYear(),
      n = s.length,
      px = s.map((x) => x.px),
      vx = s.map((x) => x.vix);
    const rets = s.slice(1).map((x) => x.ret),
      dv = vx.slice(1).map((v, i) => v - vx[i]);
    const worst = rets.indexOf(Math.min(...rets)) + 1,
      vmax = Math.max(...vx),
      imax = vx.indexOf(vmax);
    const opposite = dv.filter((d, i) => Math.sign(d) !== Math.sign(rets[i])).length;
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const corr = (() => {
      const ma = mean(dv),
        mb = mean(rets);
      const c = mean(dv.map((x, i) => (x - ma) * (rets[i] - mb))),
        va = mean(dv.map((x) => (x - ma) ** 2)),
        vb = mean(rets.map((x) => (x - mb) ** 2));
      return c / Math.sqrt(va * vb);
    })();
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const holder = h('div');
    stack(host, holder, h('div', { class: 'legend' }, lg('var(--ink)', 'S&P 500'), lg('var(--loss)', 'VIX'), lg('var(--muted)', 'Its usual level', true)), read, h('p', { class: 'fine' }, 'Simulated prices, built to behave like the real index.'));
    const chart = TA.chart(holder, ctx, {
      bars: asBars(px),
      type: 'line',
      cursor: false,
      yf: n0,
      pad: { l: 50 },
      ms: 5200,
      label: 'A simulated year of the S&P 500 and the VIX',
      over(P, C, i) {
        if (i > worst) {
          P.dot(worst, px[worst], { color: C.loss, r: 4.5 });
          P.tag(`${(rets[worst - 1] * 100).toFixed(1)}% day`, P.X(worst), P.Y(px[worst]), { bg: C.loss, dy: 10, size: 10.5 });
        }
      },
      lower: {
        height: 120,
        range: [0, 60],
        yTicks: [0, 15, 30, 45, 60],
        yf: (v) => String(v),
        label: 'VIX',
        draw(P, C, i) {
          P.line([[0, 15.5], [n - 1, 15.5]], { color: C.muted, width: 1, dash: [4, 4] });
          TA.series(P, vx, i, { color: C.loss, width: 2 });
          if (i > imax) P.dot(imax, vmax, { color: C.loss, r: 4 });
        },
      },
      onIndex(i) {
        const k = i - 1;
        if (i >= n) {
          read.innerHTML = `On <b>${Math.round((opposite / dv.length) * 100)}%</b> of days the two moved in opposite directions (correlation ${corr.toFixed(2).replace('-', '−')}). On the worst day the S&P fell ${(rets[worst - 1] * -100).toFixed(1)}% and the VIX jumped <b>${dv[worst - 1].toFixed(1)}</b> points. The VIX peaked at ${vmax.toFixed(1)} and drifted back to ${vx[n - 1].toFixed(1)} by year-end: spikes fade.`;
          return;
        }
        read.innerHTML = `Day ${k + 1}: S&P ${n0(px[k])} (${pct(px[k] / px[0] - 1, { d: 1, sign: true })} on the year) · VIX <b>${vx[k].toFixed(1)}</b>${k ? ` (${dv[k - 1] >= 0 ? '+' : ''}${dv[k - 1].toFixed(1)} today)` : ''}.`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- implied versus the volatility that followed ---------- */
  V.vixPremium = function (host, p, ctx) {
    const s = simYear(),
      W = 21,
      n = s.length - W;
    const vx = s.slice(0, n).map((x) => x.vix);
    const rv = vx.map((_, t) => {
      const rs = s.slice(t + 1, t + 1 + W).map((x) => x.ret);
      return 100 * Math.sqrt((252 * rs.reduce((a, x) => a + x * x, 0)) / rs.length);
    });
    const gaps = vx.map((v, t) => v - rv[t]),
      above = gaps.filter((g) => g > 0).length,
      avg = gaps.reduce((a, g) => a + g, 0) / n;
    const miss = gaps.indexOf(Math.min(...gaps));
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const holder = h('div');
    stack(host, holder, h('div', { class: 'legend' }, lg('var(--accent)', 'VIX (forecast)'), lg('var(--ink)', 'Volatility over the next month'), lg('var(--gain)', 'VIX too high'), lg('var(--loss)', 'VIX too low')), read, h('p', { class: 'fine' }, 'The same simulated year. Realized volatility is measured over the 21 trading days after each date.'));
    const top = Math.ceil(Math.max(...vx, ...rv) / 10) * 10;
    const chart = TA.chart(holder, ctx, {
      bars: asBars(vx),
      type: 'none',
      cursor: false,
      yRange: [0, top],
      yf: (v) => String(Math.round(v)),
      pad: { l: 40 },
      ms: 4600,
      label: 'The VIX against the volatility that actually followed',
      over(P, C, i) {
        const c = P.c;
        c.save();
        for (let t = 1; t < Math.min(i, n); t++) {
          c.beginPath();
          c.moveTo(P.X(t - 1), P.Y(vx[t - 1]));
          c.lineTo(P.X(t), P.Y(vx[t]));
          c.lineTo(P.X(t), P.Y(rv[t]));
          c.lineTo(P.X(t - 1), P.Y(rv[t - 1]));
          c.closePath();
          c.fillStyle = alpha(gaps[t] >= 0 ? C.gain : C.loss, 0.3);
          c.fill();
        }
        c.restore();
        TA.series(P, rv, Math.min(i, n), { color: C.ink, width: 1.75 });
        TA.series(P, vx, Math.min(i, n), { color: C.accent, width: 2.25 });
      },
      onIndex(i) {
        const k = Math.min(i, n) - 1;
        read.innerHTML =
          i >= n
            ? `The VIX was above the volatility that followed on <b>${Math.round((above / n) * 100)}%</b> of days, by ${avg.toFixed(1)} points on average. Then on day ${miss + 1}, with the VIX at just ${vx[miss].toFixed(1)}, the next month delivered ${rv[miss].toFixed(1)}. Sellers of insurance win often and lose big.`
            : `Day ${k + 1}: VIX ${vx[k].toFixed(1)}; the next month delivered ${rv[k].toFixed(1)}. ${gaps[k] >= 0 ? 'Insurance was overpriced.' : 'Insurance was too cheap.'}`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- what the VIX does to option prices ---------- */
  V.vixOptionPrice = function (host, p, ctx) {
    const S = 500,
      D = 30;
    let vix = 15,
      cancel = null;
    const price = (v, type = 'call') => SS.bs(type, S, S, D, v / 100);
    const sl = slider({ id: ctx.key + '-v', label: 'VIX', min: 10, max: 60, step: 0.5, value: vix, fmt: (v) => v.toFixed(1), onInput: (v) => (stop(), (vix = v), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const info = h('div', { class: 'stats' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, info, plotEl, sl.el, read, h('p', { class: 'fine' }, `An S&P 500 fund at $${S}, a $${S} strike, ${D} days to expiration, Black-Scholes pricing with the VIX as implied volatility.`));
    const top = price(62).price;
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 210 : 240),
      pad: { l: 44, r: 14, t: 14, b: 26 },
      label: 'At-the-money call price as the VIX changes',
      draw(P) {
        const C = pal();
        P.domain(10, 60, 0, top);
        P.grid({ xTicks: [10, 20, 30, 40, 50, 60], yTicks: SS.niceTicks(0, top, 4).filter((v) => v > 0), yf: (v) => '$' + Math.round(v) });
        P.text('VIX →', P.X(60) - 4, P.Y(0) - 9, { align: 'right', color: C.muted });
        P.line(P.sample((v) => price(v).price, 10, 60, 100), { color: C.call, width: 2.5 });
        P.line(P.sample((v) => price(v, 'put').price, 10, 60, 100), { color: C.put, width: 2, dash: [5, 4] });
        P.dot(vix, price(vix).price, { color: C.call, r: 5 });
        P.tag(usd(price(vix).price), P.X(vix), P.Y(price(vix).price), { bg: C.call, align: vix > 45 ? 'right' : 'left', dy: -12, size: 10.5 });
      },
    });
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    function paint() {
      plot.render();
      const c = price(vix),
        pu = price(vix, 'put'),
        move = S * (vix / 100) * Math.sqrt(D / 365);
      info.replaceChildren(stat('Call', `${usd(c.price)} · ${usd(c.price * 100, 0)}/contract`, 'accent'), stat('Put', usd(pu.price)), stat('Vega per contract', `${usd(c.vega * 100, 0)} per VIX point`));
      const hint = vix < 15 ? 'Options are cheap: buying protection or debit spreads costs less, but time decay still bites.' : vix < 25 ? 'Normal pricing: match the strategy to your view.' : 'Options are expensive: defined-risk selling collects more premium, but moves are bigger, so size small.';
      read.innerHTML = `Expected 30-day move: about ±${usd(move)} (±${((vix / 100) * Math.sqrt(D / 365) * 100).toFixed(1)}%). ${hint}`;
    }
    paint();
    return {
      play() {
        stop();
        cancel = tween(3000, (k) => {
          vix = 15 + 15 * Math.sin(k * Math.PI);
          if (k >= 1) vix = 15;
          sl.set(vix);
          paint();
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- the VIX futures curve ---------- */
  const TH = 17,
    KAP = 0.7,
    PREM = 1.0;
  /** A simple model of a VIX future `tau` months out: mean reversion toward TH, plus a small term premium. */
  const fut = (spot, tau) => TH + (spot - TH) * Math.exp(-KAP * tau) + PREM * (1 - Math.exp(-tau / 1.5));
  const monthlyRoll = (spot) => Math.pow(fut(spot, 1 - 1 / 21) / fut(spot, 1), 21) - 1;
  V.vixCurve = function (host, p, ctx) {
    let spot = 14,
      cancel = null;
    const sg = seg({ label: 'Market', options: [{ v: '14', label: 'Calm (VIX 14)' }, { v: '17', label: 'Normal (17)' }, { v: '40', label: 'Panic (40)' }], value: '14', onChange: (v) => (stop(), (cancel = glideTo(spot, +v, 700, set))) });
    const sl = slider({ id: ctx.key + '-s', label: 'Spot VIX', min: 10, max: 60, step: 0.5, value: spot, fmt: (v) => v.toFixed(1), onInput: (v) => (stop(), (spot = v), paint()) });
    const plotEl = h('div', { class: 'plot' });
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    stack(host, sg.el, plotEl, sl.el, read, h('p', { class: 'fine' }, 'A simplified model of the curve: futures drift toward a long-run level of about 17, plus a small premium for later months.'));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 230 : 260),
      pad: { l: 34, r: 14, t: 16, b: 26 },
      label: 'VIX futures prices by months to expiration',
      draw(P) {
        const C = pal(),
          up = fut(spot, 1) >= spot,
          col = up ? C.gain : C.loss;
        P.domain(-0.3, 8.3, 0, Math.max(30, spot + 6));
        P.grid({ xTicks: [0, 1, 2, 3, 4, 5, 6, 7, 8], xf: (v) => (v ? 'M' + v : 'Spot'), yf: (v) => String(Math.round(v)) });
        P.line([[-0.3, spot], [8.3, spot]], { color: C.muted, width: 1, dash: [3, 4] });
        const pts = P.sample((t) => fut(spot, t), 0, 8, 80);
        P.area(pts, spot, col, 0.14);
        P.line(pts, { color: col, width: 2.5 });
        for (let t = 1; t <= 8; t++) P.dot(t, fut(spot, t), { color: col, r: 3.5 });
        P.dot(0, spot, { color: C.ink, r: 5 });
        P.text(up ? 'Contango' : 'Backwardation', P.X(5), P.Y(fut(spot, 5)) + (up ? 18 : -18), { color: col, weight: 700 });
      },
    });
    function set(v) {
      spot = v;
      sl.set(v);
      paint();
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    function paint() {
      plot.render();
      const f1 = fut(spot, 1),
        roll = monthlyRoll(spot);
      read.innerHTML =
        f1 >= spot
          ? `<b class="gain">Contango.</b> The 1-month future (${f1.toFixed(1)}) sits ${(f1 - spot).toFixed(1)} above spot. A fund that keeps buying it loses about <b>${pct(-roll, { d: 1 })}</b> a month if the VIX just stays put.`
          : `<b class="loss">Backwardation.</b> The 1-month future (${f1.toFixed(1)}) sits ${(spot - f1).toFixed(1)} below spot: the market expects the panic to fade. Rolling now earns about ${pct(roll, { d: 1 })} a month, but only while fear stays high.`;
    }
    paint();
    return {
      play() {
        stop();
        const path = [spot, 40, 14];
        cancel = tween(3600, (k) => {
          const t = k * (path.length - 1),
            j = Math.min(path.length - 2, Math.floor(t));
          set(path[j] + (path[j + 1] - path[j]) * ease.inOut(t - j));
        });
      },
      destroy: () => (stop(), plot.destroy()),
    };
  };

  /* ---------- roll decay in a VIX futures fund ---------- */
  V.vixRoll = function (host, p, ctx) {
    const r = SS.rng(3);
    let spot = 14;
    const sp = [spot];
    for (let t = 1; t < 252; t++) {
      let lv = Math.log(spot) + 0.05 * (Math.log(14) - Math.log(spot)) + 0.06 * SS.gauss(r);
      if (t === 120) lv += 0.75;
      if (t === 121) lv += 0.35;
      spot = Math.min(80, Math.max(9.5, Math.exp(lv)));
      sp.push(spot);
    }
    const fund = [100];
    for (let t = 1; t < sp.length; t++) fund.push(fund[t - 1] * (fut(sp[t], 1 - 1 / 21) / fut(sp[t - 1], 1)));
    const spotIdx = sp.map((v) => (v / sp[0]) * 100),
      n = sp.length;
    const contango = sp.filter((v) => fut(v, 1) > v).length,
      spike = sp.indexOf(Math.max(...sp)),
      fundPeak = Math.max(...fund.slice(spike - 2, spike + 20));
    const read = h('p', { class: 'readout', 'aria-live': 'polite' });
    const holder = h('div');
    stack(host, holder, h('div', { class: 'legend' }, lg('var(--loss)', 'Spot VIX (rebased to 100)'), lg('var(--accent)', 'Fund holding 1-month VIX futures')), read, h('p', { class: 'fine' }, 'Simulated. The fund rolls daily to keep about one month to expiration, like short-term VIX funds and notes.'));
    const chart = TA.chart(holder, ctx, {
      bars: asBars(fund),
      type: 'none',
      cursor: false,
      yRange: [0, Math.ceil(Math.max(...spotIdx, ...fund) / 50) * 50],
      yf: (v) => String(Math.round(v)),
      pad: { l: 40 },
      ms: 4600,
      label: 'Spot VIX versus a fund holding VIX futures',
      over(P, C, i) {
        P.line([[0, 100], [n - 1, 100]], { color: C.muted, width: 1, dash: [3, 4] });
        TA.series(P, spotIdx, i, { color: C.loss, width: 1.75 });
        TA.series(P, fund, i, { color: C.accent, width: 2.5 });
      },
      lower: {
        height: 40,
        range: [0, 1],
        yTicks: [],
        label: 'Curve each day: green contango, red backwardation',
        draw(P, C, i) {
          for (let t = 0; t < i; t++) P.rect(t - 0.5, 0.15, t + 0.5, 0.85, alpha(fut(sp[t], 1) > sp[t] ? C.gain : C.loss, 0.7));
        },
      },
      onIndex(i) {
        const k = i - 1;
        read.innerHTML =
          i >= n
            ? `Spot VIX went from ${sp[0].toFixed(1)} to ${sp[n - 1].toFixed(1)} (${pct(sp[n - 1] / sp[0] - 1, { d: 0, sign: true })}). The fund ended at <b>${fund[n - 1].toFixed(1)}</b>, down ${pct(1 - fund[n - 1] / 100, { d: 0 })}. The curve was in contango on ${contango} of ${n} days, and even the spike to ${sp[spike].toFixed(1)} only lifted the fund to ${fundPeak.toFixed(0)}.`
            : `Day ${k + 1}: spot VIX ${sp[k].toFixed(1)} · fund ${fund[k].toFixed(1)} · ${fut(sp[k], 1) > sp[k] ? 'contango: the roll costs money' : 'backwardation: the roll pays'}.`;
      },
    });
    return { play: () => chart.play(), destroy: () => chart.destroy() };
  };

  /* ---------- volatility indexes worldwide: official publisher and TradingView symbol (links checked October 30, 2026) ---------- */
  const WORLD = [
    ['United States', 'VIX', 'S&P 500', 'https://www.cboe.com/us/indices/dashboard/vix/', 'CBOE-VIX'],
    ['United States', 'VXN', 'Nasdaq-100', 'https://www.cboe.com/us/indices/dashboard/vxn/', 'CBOE-VXN'],
    ['United States', 'RVX', 'Russell 2000', 'https://www.cboe.com/us/indices/dashboard/rvx/', 'CBOE-RVX'],
    ['India', 'India VIX', 'Nifty 50', 'https://www.nseindia.com/reports-indices-historical-vix', 'NSE-INDIAVIX'],
    ['Eurozone', 'VSTOXX', 'EURO STOXX 50', 'https://stoxx.com/index/v2tx/', 'EUREX-FVS1!', true],
    ['Germany', 'VDAX', 'DAX', 'https://stoxx.com/index/v1x/', 'INDEX-DV1X'],
    ['Japan', 'Nikkei 225 VI', 'Nikkei 225', 'https://indexes.nikkei.co.jp/en/nkave/index/profile?idx=nk225vi', 'TOCOM-NVI'],
    ['Hong Kong', 'VHSI', 'Hang Seng Index', 'https://www.hsi.com.hk/en-hk/indexes/all-indexes/index-details/?seriesCode=volatilityindex', 'HSI-VHSI'],
    ['Taiwan', 'TAIWAN VIX', 'TAIEX', 'https://www.taifex.com.tw/enl/eng7/vixMinNew', null],
    ['South Korea', 'VKOSPI', 'KOSPI 200', 'https://index.krx.co.kr/', 'KRX-VKI1!', true],
    ['China (US-listed ETF)', 'VXFXI', 'iShares China Large-Cap ETF', 'https://www.cboe.com/us/indices/dashboard/vxfxi/', 'CBOE-VXFXI'],
    ['Emerging markets', 'VXEEM', 'iShares MSCI Emerging Markets ETF', 'https://www.cboe.com/us/indices/dashboard/vxeem/', 'CBOE-VXEEM'],
  ];
  V.vixWorld = function (host) {
    const a = (href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    const rows = WORLD.map(([m, name, und, url, tv, fut]) => `<tr><th>${m}<br><span class="fine">${und}</span></th><td>${a(url, name)}</td><td>${tv ? a(`https://www.tradingview.com/symbols/${tv}/`, fut ? 'Futures' : 'Chart') : '—'}</td></tr>`).join('');
    stack(
      host,
      h('div', { class: 'table-wrap', html: `<table class="cmp vix-world"><thead><tr><th>Market, built from</th><th>Official</th><th>TradingView</th></tr></thead><tbody>${rows}</tbody></table>` }),
      h('div', {
        class: 'readout',
        html: `<b>Singapore:</b> SGX does not publish a volatility index for the STI. Traders there usually watch the VIX for global risk and VHSI or the Nikkei 225 VI for Asia.<br><b>Australia, Canada, Brazil:</b> S&P Dow Jones Indices publishes the S&P/ASX 200 VIX, the S&P/TSX 60 VIX and the S&P/B3 Ibovespa VIX; search for them on spglobal.com.<br><b>South Korea:</b> the link opens KRX’s index site; search there for VKOSPI.<br><b>TradingView:</b> it carries VSTOXX and VKOSPI only as futures, and does not list the Taiwan VIX.`,
      }),
      h('p', { class: 'fine' }, 'Links go to each official publisher and to TradingView, and were checked on October 30, 2026. Some sites block automated visitors, so a page may ask you to confirm you are human.')
    );
  };
})();
