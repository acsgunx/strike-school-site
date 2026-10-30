/* Strike School — pivot engine: floor pivots, central pivot range, Camarilla, value area, intraday sessions,
   and level drawing. Builds on SS.TA. */
(function () {
  'use strict';
  const SS = window.SS;
  const { pal, alpha, usd } = SS;
  const TA = SS.TA;
  const PV = (SS.PV = {});

  /* ---------- level math (all from the prior period's high, low and close) ---------- */
  PV.floor = ({ h, l, c }) => {
    const P = (h + l + c) / 3;
    return { P, R1: 2 * P - l, S1: 2 * P - h, R2: P + (h - l), S2: P - (h - l), R3: h + 2 * (P - l), S3: l - 2 * (h - P) };
  };
  PV.cpr = ({ h, l, c }) => {
    const P = (h + l + c) / 3,
      BC = (h + l) / 2,
      TC = 2 * P - BC;
    return { P, BC, TC, top: Math.max(BC, TC), bot: Math.min(BC, TC), width: Math.abs(TC - BC) };
  };
  PV.camarilla = ({ h, l, c }) => {
    const r = (h - l) * 1.1;
    return { H4: c + r / 2, H3: c + r / 4, H2: c + r / 6, H1: c + r / 12, L1: c - r / 12, L2: c - r / 6, L3: c - r / 4, L4: c - r / 2 };
  };
  PV.ohlc = (bars) => ({ o: bars[0].o, h: Math.max(...bars.map((b) => b.h)), l: Math.min(...bars.map((b) => b.l)), c: bars[bars.length - 1].c });

  /** Two-period relationship of value ranges (CPR or any [bot, top] zone). */
  PV.relationship = (prev, cur) => {
    const eps = (prev.top - prev.bot) * 0.05 + 1e-9;
    if (Math.abs(cur.top - prev.top) <= eps && Math.abs(cur.bot - prev.bot) <= eps) return 'unchanged';
    if (cur.bot > prev.top) return 'higher';
    if (cur.top < prev.bot) return 'lower';
    if (cur.top > prev.top && cur.bot < prev.bot) return 'outside';
    if (cur.top < prev.top && cur.bot > prev.bot) return 'inside';
    return cur.top > prev.top ? 'overlap-higher' : 'overlap-lower';
  };
  PV.REL = {
    higher: ['Higher value', 'Bullish', 'Today’s whole range sits above yesterday’s: buyers are lifting value.'],
    'overlap-higher': ['Overlapping higher value', 'Moderately bullish', 'Value has moved up, but still overlaps yesterday’s: a weaker bullish lean.'],
    lower: ['Lower value', 'Bearish', 'Today’s whole range sits below yesterday’s: sellers are pushing value down.'],
    'overlap-lower': ['Overlapping lower value', 'Moderately bearish', 'Value has moved down but still overlaps: a weaker bearish lean.'],
    unchanged: ['Unchanged value', 'Sideways, or a breakout brewing', 'Value has not moved. Markets often go quiet before they choose a direction.'],
    outside: ['Outside value', 'Sideways', 'Today’s range swallows yesterday’s: a wide, balanced zone that often means a range day.'],
    inside: ['Inside value', 'Breakout likely', 'Today’s range sits inside yesterday’s: tightening value often comes before a strong move.'],
  };

  /** Volume at price: spread each bar's volume across its range, then grow the value area out from the POC to `share`. */
  PV.valueArea = function (bars, o = {}) {
    const lo = Math.min(...bars.map((b) => b.l)),
      hi = Math.max(...bars.map((b) => b.h));
    const n = o.bins || 30,
      step = (hi - lo) / n || 1;
    const hist = Array.from({ length: n }, (_, k) => ({ p: lo + step * (k + 0.5), v: 0 }));
    const upto = o.upto == null ? bars.length : o.upto;
    for (let i = 0; i < upto; i++) {
      const b = bars[i],
        a = Math.floor((b.l - lo) / step),
        z = Math.min(n - 1, Math.floor((b.h - lo) / step));
      const cells = Math.max(1, z - a + 1);
      for (let k = Math.max(0, a); k <= z; k++) hist[k].v += (o.time ? 1 : b.v) / cells;
    }
    let poc = 0;
    hist.forEach((x, k) => x.v > hist[poc].v && (poc = k));
    const total = hist.reduce((s, x) => s + x.v, 0);
    let a = poc,
      z = poc,
      got = hist[poc].v;
    while (got < total * (o.share || 0.7) && (a > 0 || z < n - 1)) {
      const up = z < n - 1 ? hist[z + 1].v : -1,
        dn = a > 0 ? hist[a - 1].v : -1;
      if (up >= dn) got += hist[++z].v;
      else got += hist[--a].v;
    }
    return { hist, step, lo, hi, poc: hist[poc].p, vah: hist[z].p + step / 2, val: hist[a].p - step / 2, pocI: poc, a, z, total };
  };

  /* ---------- sessions ---------- */
  PV.BARS = 78; // 5-minute bars from 9:30 to 4:00
  PV.clock = (i) => {
    const m = 570 + Math.round(i) * 5,
      hh = Math.floor(m / 60),
      mm = m % 60;
    return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`;
  };
  PV.TICKS = [0, 24, 48, 77]; // few enough to stay readable on a phone
  /** Price-axis labels with one decimal, so a $2 range never shows the same label twice. */
  PV.yf = (v) => '$' + (Math.abs(v - Math.round(v)) < 1e-6 ? v.toFixed(0) : v.toFixed(1));
  PV.session = (anchors, o = {}) => TA.bars(TA.path(anchors, o.n || PV.BARS, { seed: o.seed || 1, noise: o.noise == null ? 0.0011 : o.noise }), { seed: o.seed || 1, wick: o.wick || 0.0012, gap: 0.0004, volume: o.volume || 2e5, volMul: o.volMul });

  /* ---------- drawing ---------- */
  const LEVEL_COLOR = (name, C) => (name === 'P' ? C.accent : /^R|^H/.test(name) ? C.loss : /^S|^L/.test(name) ? C.gain : name === 'POC' ? C.warn : name === 'VAH' || name === 'VAL' ? C.violet : C.muted);
  PV.levelColor = LEVEL_COLOR;
  /** Horizontal levels with right-hand labels nudged apart so they never overlap. Labels sit in the right margin when there is one. */
  PV.drawLevels = function (P, levels, o = {}) {
    const C = pal(),
      x0 = o.x0 == null ? P.dom.x0 : o.x0,
      x1 = o.x1 == null ? P.dom.x1 : o.x1;
    const vis = levels.filter((L) => L.v >= Math.min(P.dom.y0, P.dom.y1) && L.v <= Math.max(P.dom.y0, P.dom.y1));
    vis.forEach((L) => P.line([[x0, L.v], [x1, L.v]], { color: L.color || LEVEL_COLOR(L.name, C), width: L.width || 1.5, dash: L.dash === undefined ? [5, 4] : L.dash, alpha: L.alpha == null ? 1 : L.alpha }));
    if (o.labels === false) return;
    const items = vis.map((L) => ({ L, y: P.Y(L.v) })).sort((a, b) => a.y - b.y);
    for (let k = 1; k < items.length; k++) if (items[k].y - items[k - 1].y < 12) items[k].y = items[k - 1].y + 12;
    const c = P.c,
      xr = o.labelX == null ? (P.pad.r >= 48 ? P.w - 2 : P.w - P.pad.r - 3) : o.labelX;
    c.save();
    c.font = SS.MONO(10, 600);
    c.textAlign = 'right';
    c.textBaseline = 'middle';
    items.forEach(({ L, y }) => {
      const txt = L.name + (o.values === false ? '' : ' ' + usd(L.v));
      const tw = c.measureText(txt).width;
      c.fillStyle = alpha(C.surface, 0.85);
      c.fillRect(xr - tw - 4, y - 7, tw + 6, 14);
      c.fillStyle = L.color || LEVEL_COLOR(L.name, C);
      c.fillText(txt, xr, y);
    });
    c.restore();
  };
  /** A shaded price zone, clamped to the visible price range so it never spills over the axes. */
  PV.drawZone = function (P, bot, top, color, a = 0.16, x0, x1) {
    const lo = Math.min(P.dom.y0, P.dom.y1),
      hi = Math.max(P.dom.y0, P.dom.y1);
    if (top < lo || bot > hi) return;
    P.rect(x0 == null ? P.dom.x0 : x0, Math.max(lo, bot), x1 == null ? P.dom.x1 : x1, Math.min(hi, top), alpha(color, a));
  };

  /** Find reactions to levels: bounces (tested from above, closed above), rejections, and breaks. */
  PV.reactions = function (bars, levels, tol = 0.0009) {
    const out = [],
      last = {};
    for (let i = 1; i < bars.length; i++) {
      const b = bars[i],
        p = bars[i - 1];
      levels.forEach((L) => {
        if (last[L.name] != null && i - last[L.name] < 8) return;
        const t = L.v * tol;
        let kind = null;
        if (p.c > L.v && b.l <= L.v + t && b.c > L.v) kind = 'bounce';
        else if (p.c < L.v && b.h >= L.v - t && b.c < L.v) kind = 'reject';
        else if (p.c <= L.v && b.c > L.v + t) kind = 'break-up';
        else if (p.c >= L.v && b.c < L.v - t) kind = 'break-down';
        if (kind) (out.push({ i, L, kind }), (last[L.name] = i));
      });
    }
    return out;
  };
  PV.reactionLabel = (r) => ({ bounce: 'Bounce at ', reject: 'Rejected at ', 'break-up': 'Breaks above ', 'break-down': 'Breaks below ' })[r.kind] + r.L.name;
})();
