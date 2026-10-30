/* Japanese Candlesticks — shared helpers: hand-built candle sequences, single candles drawn at any size, highlight
   boxes around patterns, and the path of a session for animating a candle as it forms. */
(function () {
  'use strict';
  const SS = window.SS;
  const { pal } = SS;
  const TA = SS.TA;
  const CS = (SS.CS = {});

  const fix = (b) => ((b.h = Math.max(b.h, b.o, b.c)), (b.l = Math.min(b.l, b.o, b.c)), b);

  /** Chain segments into one list of bars. A segment is one of:
      { from, to, n, seed } or { by, n, seed }: n bars drifting from the previous close (or `from`) to `to` (or by `by`);
      { rel: [[o, h, l, c, vol?], ...] }: hand-built bars, each priced relative to the close just before it;
      { abs: [[o, h, l, c, vol?], ...] }: hand-built bars at absolute prices (an open of null means the previous close).
      Returns { bars, at } where at[k] is the index of segment k's first bar. */
  CS.chain = function (segs) {
    const bars = [],
      at = [];
    segs.forEach((s) => {
      at.push(bars.length);
      const prev = bars.length ? bars[bars.length - 1].c : s.from;
      if (s.abs) {
        s.abs.forEach(([o, hi, lo, c, v]) => bars.push(fix({ o: o == null ? bars[bars.length - 1].c : o, h: hi, l: lo, c, v: v || 1e6 })));
        return;
      }
      if (s.rel) {
        s.rel.forEach(([o, hi, lo, c, v]) => {
          const p = bars.length ? bars[bars.length - 1].c : s.from;
          bars.push(fix({ o: p + o, h: p + hi, l: p + lo, c: p + c, v: v || 1e6 }));
        });
        return;
      }
      const to = s.to != null ? s.to : prev + s.by;
      const bs = TA.bars(TA.path(s.a || [[-1, prev], [s.n - 1, to]], s.n, { seed: s.seed || 3, noise: s.noise == null ? 0.005 : s.noise }), { seed: s.seed || 3, wick: s.wick || 0.005, volMul: s.volMul });
      if (bars.length) fix(Object.assign(bs[0], { o: prev + (bs[0].c - prev) * 0.15 }));
      bars.push(...bs);
    });
    return { bars, at };
  };

  /** A short, steady trend of n candles from one price to another, for the backdrop of a single pattern. */
  CS.mini = function (from, to, n = 7) {
    const out = [];
    let prev = from;
    for (let i = 0; i < n; i++) {
      const c = from + ((to - from) * (i + 1)) / n + (i === 3 ? (to > from ? -0.7 : 0.7) : 0);
      out.push({ o: prev, c, h: Math.max(prev, c) + 0.35, l: Math.min(prev, c) - 0.35 });
      prev = c;
    }
    return out;
  };

  /** Draw one candle centered on bar x. o: { w (px), color, alpha, ghost (dashed outline, no fill) }. */
  CS.candle = function (P, x, b, o = {}) {
    const C = pal(),
      k = P.c,
      col = o.color || (b.c >= b.o ? C.gain : C.loss),
      px = Math.round(P.X(x)) + 0.5,
      w = o.w || TA.candleWidth(P),
      y1 = P.Y(Math.max(b.o, b.c)),
      y2 = P.Y(Math.min(b.o, b.c));
    k.save();
    k.globalAlpha = o.alpha == null ? 1 : o.alpha;
    k.strokeStyle = col;
    k.fillStyle = col;
    k.lineWidth = w > 20 ? 2.5 : w > 6 ? 1.5 : 1;
    if (o.ghost) k.setLineDash([4, 3]);
    k.beginPath();
    k.moveTo(px, P.Y(b.h));
    k.lineTo(px, y1);
    k.moveTo(px, y2);
    k.lineTo(px, P.Y(b.l));
    k.stroke();
    if (y2 - y1 < 2.5) {
      // A doji: the open and close are one horizontal line.
      k.lineWidth = w > 20 ? 3 : 2;
      k.beginPath();
      k.moveTo(px - w / 2, (y1 + y2) / 2);
      k.lineTo(px + w / 2, (y1 + y2) / 2);
      k.stroke();
    } else if (o.ghost) k.strokeRect(px - w / 2, y1, w, y2 - y1);
    else k.fillRect(px - w / 2, y1, w, y2 - y1);
    k.restore();
  };

  /** A dashed box around bars from..to, with an optional tag at its upper left (dir < 0, a top) or lower left (dir > 0,
      a bottom), where the trend that led into the pattern left empty space. o.over, or a box too close to the left edge,
      puts the tag right above or below it instead. */
  CS.box = function (P, bars, from, to, o = {}) {
    const C = pal(),
      k = P.c,
      g = bars.slice(from, to + 1),
      hi = Math.max(...g.map((b) => b.h)),
      lo = Math.min(...g.map((b) => b.l)),
      col = o.color || C.violet,
      x0 = P.X(from - 0.6),
      x1 = P.X(to + 0.6),
      y0 = P.Y(hi) - 5,
      y1 = P.Y(lo) + 5;
    k.save();
    k.strokeStyle = col;
    k.lineWidth = 1.75;
    k.setLineDash([4, 3]);
    k.strokeRect(x0, y0, x1 - x0, y1 - y0);
    k.restore();
    if (o.label) {
      // Beside the box when there is room to its left; otherwise straight above or below it.
      k.save();
      k.font = SS.MONO(o.size || 11.5, 600);
      const side = !o.over && x0 + 4 - k.measureText(o.label).width - 24 >= P.pad.l;
      k.restore();
      P.tag(o.label, side ? x0 + 4 : (x0 + x1) / 2, o.dir > 0 ? y1 : y0, { bg: col, dy: o.dir > 0 ? 4 : -25, size: o.size, align: side ? 'right' : null });
    }
    return { hi, lo };
  };

  /** Where a session stands at fraction u (0..1) of its path through the given prices: { o, cur, hi, lo }. */
  CS.forming = function (pts, u) {
    const n = pts.length - 1,
      s = Math.min(n - 1, Math.floor(u * n)),
      f = Math.min(1, u * n - s),
      cur = pts[s] + (pts[s + 1] - pts[s]) * f,
      seen = pts.slice(0, s + 1).concat(cur);
    return { o: pts[0], cur, hi: Math.max(...seen), lo: Math.min(...seen) };
  };

  /** Percent change from a to b, formatted with a true minus sign, or in words: "fell 4.2%". */
  CS.chg = (a, b) => (b < a ? SS.MINUS : '+') + Math.abs((b / a - 1) * 100).toFixed(1) + '%';
  CS.moved = (a, b) => (b < a ? 'fell ' : 'rose ') + Math.abs((b / a - 1) * 100).toFixed(1) + '%';
  /** A y range with extra headroom on the side where a pattern's tag goes: above for dir < 0, below for dir > 0. */
  CS.room = function (bars, dir) {
    const lo = Math.min(...bars.map((b) => b.l)),
      hi = Math.max(...bars.map((b) => b.h)),
      r = hi - lo;
    return [lo - r * (dir > 0 ? 0.26 : 0.07), hi + r * (dir < 0 ? 0.26 : 0.08)];
  };
  CS.body = (b) => Math.abs(b.c - b.o);
})();
