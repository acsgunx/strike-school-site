/* Strike School — technical analysis engine: synthetic OHLCV data, indicators, candle drawing,
   and an animated chart component (replay + scrub) that the Technical Analysis visuals build on. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, slider, usd, pal, alpha, tween } = SS;
  const TA = (SS.TA = {});

  /* ---------- data ---------- */
  /** Closes that follow anchor points [[bar, price], ...] with correlated noise around the path. */
  TA.path = function (anchors, n, o = {}) {
    const r = SS.rng(o.seed || 1),
      noise = o.noise == null ? 0.006 : o.noise,
      out = [];
    let k = 0,
      e = 0;
    for (let i = 0; i < n; i++) {
      while (k < anchors.length - 2 && i > anchors[k + 1][0]) k++;
      const [x0, y0] = anchors[k],
        [x1, y1] = anchors[k + 1];
      const f = x1 === x0 ? 0 : Math.min(1, Math.max(0, (i - x0) / (x1 - x0)));
      e = 0.55 * e + noise * SS.gauss(r);
      out.push((y0 + (y1 - y0) * f) * (1 + e));
    }
    return out;
  };
  /** A pure random walk: each bar moves up or down by chance. */
  TA.walk = function (n, o = {}) {
    const r = SS.rng(o.seed || 1),
      out = [o.start || 100];
    for (let i = 1; i < n; i++) out.push(out[i - 1] * Math.exp((o.drift || 0) + (o.vol || 0.015) * SS.gauss(r)));
    return out;
  };
  /** Turn closes into OHLCV bars. volMul(i) scales volume; wick sets typical wick size. */
  TA.bars = function (closes, o = {}) {
    const r = SS.rng((o.seed || 1) * 7 + 3),
      out = [],
      wick = o.wick || 0.006,
      base = o.volume || 1e6;
    let prev = closes[0] * 0.997;
    closes.forEach((c, i) => {
      const open = i === 0 ? prev : prev * (1 + (o.gap || 0.0025) * SS.gauss(r));
      const top = Math.max(c, open),
        bot = Math.min(c, open);
      const hi = top + Math.abs(SS.gauss(r)) * c * wick,
        lo = bot - Math.abs(SS.gauss(r)) * c * wick;
      const move = Math.abs(c / prev - 1);
      const v = base * (0.55 + 0.45 * r() + (move / 0.012) * 0.45) * (o.volMul ? o.volMul(i, c >= open) : 1);
      out.push({ o: open, h: hi, l: lo, c, v });
      prev = c;
    });
    return out;
  };
  /** Combine every `k` bars into one (daily → weekly, for example). */
  TA.aggregate = function (bars, k) {
    const out = [];
    for (let i = 0; i < bars.length; i += k) {
      const g = bars.slice(i, i + k);
      out.push({ o: g[0].o, c: g[g.length - 1].c, h: Math.max(...g.map((b) => b.h)), l: Math.min(...g.map((b) => b.l)), v: g.reduce((a, b) => a + b.v, 0) });
    }
    return out;
  };
  TA.closes = (bars) => bars.map((b) => b.c);

  /* ---------- indicators (arrays aligned to bars, null where undefined) ---------- */
  TA.sma = (xs, n) => xs.map((_, i) => (i < n - 1 ? null : xs.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n));
  TA.emaFull = (xs, n) => {
    const k = 2 / (n + 1);
    let e = xs[0];
    return xs.map((x, i) => (e = i === 0 ? x : x * k + e * (1 - k)));
  };
  TA.ema = (xs, n) => TA.emaFull(xs, n).map((v, i) => (i < n - 1 ? null : v));
  TA.rsi = function (cs, n = 14) {
    const out = cs.map(() => null);
    let g = 0,
      l = 0;
    for (let i = 1; i < cs.length; i++) {
      const d = cs[i] - cs[i - 1],
        up = Math.max(d, 0),
        dn = Math.max(-d, 0);
      if (i <= n) {
        g += up;
        l += dn;
        if (i === n) {
          g /= n;
          l /= n;
        } else continue;
      } else {
        g = (g * (n - 1) + up) / n;
        l = (l * (n - 1) + dn) / n;
      }
      out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    }
    return out;
  };
  TA.macd = function (cs, fast = 12, slow = 26, sig = 9) {
    const a = TA.emaFull(cs, fast),
      b = TA.emaFull(cs, slow);
    const m = cs.map((_, i) => a[i] - b[i]);
    const s = TA.emaFull(m, sig);
    const ok = (i) => i >= slow - 1;
    return { macd: m.map((v, i) => (ok(i) ? v : null)), signal: s.map((v, i) => (i >= slow + sig - 2 ? v : null)), hist: m.map((v, i) => (i >= slow + sig - 2 ? v - s[i] : null)) };
  };
  TA.bollinger = function (cs, n = 20, k = 2) {
    const mid = TA.sma(cs, n);
    const sd = cs.map((_, i) => {
      if (i < n - 1) return null;
      const w = cs.slice(i - n + 1, i + 1),
        m = mid[i];
      return Math.sqrt(w.reduce((a, x) => a + (x - m) * (x - m), 0) / n);
    });
    return { mid, up: mid.map((m, i) => (m == null ? null : m + k * sd[i])), lo: mid.map((m, i) => (m == null ? null : m - k * sd[i])), width: mid.map((m, i) => (m == null ? null : (2 * k * sd[i]) / m)) };
  };
  TA.atr = function (bars, n = 14) {
    const tr = bars.map((b, i) => (i === 0 ? b.h - b.l : Math.max(b.h - b.l, Math.abs(b.h - bars[i - 1].c), Math.abs(b.l - bars[i - 1].c))));
    const out = bars.map(() => null);
    let a = 0;
    for (let i = 0; i < bars.length; i++) {
      if (i < n) {
        a += tr[i];
        if (i === n - 1) out[i] = a /= n;
      } else out[i] = a = (a * (n - 1) + tr[i]) / n;
    }
    return out;
  };
  TA.obv = (bars) => {
    let v = 0;
    return bars.map((b, i) => (v += i === 0 ? 0 : b.c > bars[i - 1].c ? b.v : b.c < bars[i - 1].c ? -b.v : 0));
  };
  /** Swing highs and lows: bars that are the extreme within k bars on each side. */
  TA.swings = function (bars, k = 3) {
    const out = [];
    for (let i = k; i < bars.length - k; i++) {
      const w = bars.slice(i - k, i + k + 1);
      if (bars[i].h === Math.max(...w.map((b) => b.h))) out.push({ i, type: 'H', p: bars[i].h });
      if (bars[i].l === Math.min(...w.map((b) => b.l))) out.push({ i, type: 'L', p: bars[i].l });
    }
    return out;
  };

  /* ---------- drawing on a Plot ---------- */
  TA.candleWidth = (P) => Math.max(1.5, Math.min(16, Math.abs(P.X(1) - P.X(0)) * 0.62));
  TA.drawCandles = function (P, bars, upto, o = {}) {
    const C = pal(),
      c = P.c,
      bw = (o.widthScale == null ? 1 : o.widthScale) * TA.candleWidth(P);
    const n = Math.min(upto == null ? bars.length : upto, bars.length);
    c.save();
    P.clip();
    c.globalAlpha = o.alpha == null ? 1 : o.alpha;
    for (let i = o.from || 0; i < n; i++) {
      const b = bars[i],
        up = b.c >= b.o;
      const col = o.color ? o.color(i, b) || (up ? C.gain : C.loss) : up ? C.gain : C.loss;
      const x = Math.round(P.X(i)) + 0.5;
      c.strokeStyle = col;
      c.fillStyle = col;
      c.lineWidth = bw > 6 ? 1.5 : 1;
      c.beginPath();
      c.moveTo(x, P.Y(b.h));
      c.lineTo(x, P.Y(b.l));
      c.stroke();
      const y1 = P.Y(Math.max(b.o, b.c)),
        y2 = P.Y(Math.min(b.o, b.c));
      if (bw >= 1.5) c.fillRect(x - bw / 2, y1, bw, Math.max(1.2, y2 - y1));
    }
    c.restore();
  };
  TA.drawOHLC = function (P, bars, upto, o = {}) {
    const C = pal(),
      c = P.c,
      t = TA.candleWidth(P) / 2;
    c.save();
    P.clip();
    c.globalAlpha = o.alpha == null ? 1 : o.alpha;
    c.lineWidth = 1.5;
    for (let i = 0; i < Math.min(upto, bars.length); i++) {
      const b = bars[i],
        x = Math.round(P.X(i)) + 0.5;
      c.strokeStyle = b.c >= b.o ? C.gain : C.loss;
      c.beginPath();
      c.moveTo(x, P.Y(b.h));
      c.lineTo(x, P.Y(b.l));
      c.moveTo(x - t, P.Y(b.o));
      c.lineTo(x, P.Y(b.o));
      c.moveTo(x, P.Y(b.c));
      c.lineTo(x + t, P.Y(b.c));
      c.stroke();
    }
    c.restore();
  };
  /** Draw an indicator series, skipping nulls, up to bar `upto`. */
  TA.series = function (P, arr, upto, o = {}) {
    const pts = [];
    const n = Math.min(upto == null ? arr.length : upto, arr.length);
    for (let i = 0; i < n; i++) if (arr[i] != null && isFinite(arr[i])) pts.push([i, arr[i]]);
    if (pts.length > 1) P.line(pts, o);
    return pts;
  };
  TA.band = function (P, up, lo, upto, color, a = 0.12) {
    const top = [],
      bot = [];
    for (let i = 0; i < Math.min(upto, up.length); i++) if (up[i] != null) (top.push([i, up[i]]), bot.push([i, lo[i]]));
    if (top.length > 1) P.between(top, bot, color, a);
  };
  TA.drawVolume = function (P, bars, upto, o = {}) {
    const C = pal(),
      bw = TA.candleWidth(P);
    for (let i = 0; i < Math.min(upto, bars.length); i++) {
      const b = bars[i],
        col = o.color ? o.color(i, b) : null;
      P.rect(i - bw / 2 / Math.abs(P.X(1) - P.X(0)), 0, i + bw / 2 / Math.abs(P.X(1) - P.X(0)), b.v, col || alpha(b.c >= b.o ? C.gain : C.loss, 0.55));
    }
  };
  /** A straight line through two (bar, price) points, optionally extended to bar `toX`. */
  TA.ray = function (P, a, b, o = {}) {
    const slope = (b[1] - a[1]) / (b[0] - a[0]);
    const x2 = o.toX == null ? b[0] : o.toX;
    P.line(
      [
        [a[0], a[1]],
        [x2, a[1] + slope * (x2 - a[0])],
      ],
      o
    );
  };
  TA.fmtVol = (v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : Math.round(v / 1e3) + 'k');

  /* ---------- animated chart component ----------
     cfg: bars, height, type ('candle'|'line'|'ohlc'), yRange, under(P,C,i), over(P,C,i),
     lower: { height, range: [a,b] | (i) => [a,b], draw(P,C,i), yf, yTicks, label },
     ms, playFrom, controls (default true), cursor (default true), onIndex(i), label,
     extraX (empty bar slots after the last bar, e.g. room to draw a volume profile) */
  TA.chart = function (host, ctx, cfg) {
    const bars = cfg.bars,
      n = bars.length;
    let i = n,
      cancel = null;
    const lo = Math.min(...bars.map((b) => b.l)),
      hi = Math.max(...bars.map((b) => b.h));
    const [y0, y1] = cfg.yRange || [lo - (hi - lo) * 0.08, hi + (hi - lo) * 0.1];
    const mainEl = h('div', { class: 'plot' });
    const lowerEl = cfg.lower ? h('div', { class: 'plot' }) : null;
    const playBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => play() }, cfg.playLabel || 'Replay');
    const sl = slider({ id: ctx.key + '-day', label: cfg.sliderLabel || 'Day', min: 1, max: n, step: 1, value: n, fmt: (v) => (cfg.dayFmt ? cfg.dayFmt(v) : 'Day ' + v + ' of ' + n), onInput: (v) => (stop(), set(v)) });
    const controls = cfg.controls === false ? null : h('div', { class: 'ctl-row ta-ctl' }, playBtn, sl.el);
    const wrap = h('div', { class: 'ta-chart' }, cfg.title ? h('p', { class: 'plot-h' }, cfg.title) : null, mainEl, lowerEl && cfg.lower.label ? h('p', { class: 'plot-h' }, cfg.lower.label) : null, lowerEl, controls);
    host.append(wrap);
    const scrub = (x) => {
      stop();
      set(Math.max(1, Math.min(n, Math.round(x) + 1)));
    };
    const xTicks = cfg.xTicks || SS.niceTicks(0, n - 1, 5).filter((t) => t >= 0 && t <= n - 1);
    const xf = cfg.xf || ((v) => 'D' + (Math.round(v) + 1));
    const main = new Plot(mainEl, {
      height: cfg.height || ((w) => (w < 480 ? 230 : 280)),
      pad: cfg.pad,
      label: cfg.label || 'Price chart',
      onScrub: cfg.scrub === false ? null : scrub,
      draw(P) {
        const C = pal();
        P.domain(-0.8, n - 0.2 + (cfg.extraX || 0), y0, y1);
        P.grid({ xTicks, xf, yf: cfg.yf || ((v) => '$' + (Math.abs(v) >= 100 ? Math.round(v) : v.toFixed(v % 1 ? 1 : 0))), zero: false, noXLabels: !!lowerEl });
        if (cfg.under) cfg.under(P, C, i);
        const type = cfg.type || 'candle';
        if (type === 'line') TA.series(P, TA.closes(bars), i, { color: C.ink, width: 2.25 });
        else if (type === 'ohlc') TA.drawOHLC(P, bars, i);
        else if (type !== 'none') TA.drawCandles(P, bars, i, { color: cfg.candleColor });
        if (cfg.over) cfg.over(P, C, i);
        if (cfg.cursor !== false && i < n) {
          const b = bars[i - 1];
          P.vline(i - 1, { color: C.ink, dash: null, alpha: 0.25 });
          P.tag(usd(b.c), P.X(i - 1), P.Y(b.c), { bg: C.ink, align: i > n * 0.75 ? 'right' : 'left', dy: -10 });
        }
      },
    });
    let lower = null;
    if (lowerEl) {
      lower = new Plot(lowerEl, {
        height: cfg.lower.height || 110,
        pad: cfg.pad,
        label: cfg.lower.label || 'Indicator',
        onScrub: cfg.scrub === false ? null : scrub,
        draw(P) {
          const C = pal();
          const [a, b] = typeof cfg.lower.range === 'function' ? cfg.lower.range(i) : cfg.lower.range;
          P.domain(-0.8, n - 0.2 + (cfg.extraX || 0), a, b);
          P.grid({ xTicks, xf, yf: cfg.lower.yf || ((v) => String(Math.round(v))), yTicks: cfg.lower.yTicks, zero: false });
          cfg.lower.draw(P, C, i);
          if (cfg.cursor !== false && i < n) P.vline(i - 1, { color: C.ink, dash: null, alpha: 0.25 });
        },
      });
    }
    function render() {
      main.render();
      if (lower) lower.render();
      if (cfg.onIndex) cfg.onIndex(i);
    }
    function set(v) {
      i = v;
      sl.set(v);
      render();
    }
    function stop() {
      if (cancel) cancel();
      cancel = null;
    }
    function play() {
      stop();
      const from = cfg.playFrom || 1;
      cancel = tween(cfg.ms || Math.max(1600, n * 28), (k) => set(Math.max(from, Math.round(from + (n - from) * k))), cfg.onDone);
    }
    render();
    return {
      play,
      set,
      render,
      get i() {
        return i;
      },
      main,
      lower,
      destroy: () => (stop(), main.destroy(), lower && lower.destroy()),
    };
  };
})();
