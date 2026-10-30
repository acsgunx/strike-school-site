/* Strike School — Market Profile engine: hand-built sessions of 13 half-hour periods (A–M), TPO profiles, and the
   structures read from them (POC, value area, initial balance, range extension, tails, poor highs, single prints,
   one-timeframing). Used by the Reading the Market Profile course. */
(function () {
  'use strict';
  const SS = window.SS;
  const MP = (SS.MP = {});
  MP.LETTERS = 'ABCDEFGHIJKLM';
  MP.time = (j) => {
    const m = 570 + j * 30,
      hh = Math.floor(m / 60),
      mm = m % 60;
    return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`;
  };

  /* Each day is 13 periods of [low, high] in dollars, with the open and close, chosen so that the profile shows one
     structure clearly. Prices are illustrative. */
  MP.DAYS = {
    normal: {
      name: 'Normal day',
      open: 100.2,
      close: 100.1,
      tick: 0.1,
      p: [[99.0, 100.4], [99.4, 101.0], [99.8, 100.8], [99.6, 100.5], [99.9, 100.7], [100.0, 100.8], [99.7, 100.4], [99.5, 100.2], [99.8, 100.6], [100.0, 100.8], [99.9, 100.5], [99.7, 100.3], [99.8, 100.3]],
      about: 'A wide first hour set the day’s range, and the rest of the session rotated inside it. Longer-term traders made one early push each way and were rejected; the day was left to short-term traders.',
    },
    normalVar: {
      name: 'Normal variation',
      open: 99.8,
      close: 101.4,
      tick: 0.1,
      p: [[99.6, 100.4], [99.8, 100.8], [100.2, 100.9], [100.5, 101.4], [100.9, 101.7], [101.2, 101.8], [101.0, 101.6], [100.9, 101.4], [101.0, 101.5], [101.1, 101.7], [101.2, 101.6], [101.1, 101.5], [101.2, 101.6]],
      about: 'A moderate first hour, then buyers extended the range upward and value built higher. A one-sided push by longer-term buyers, but without a full trend.',
    },
    trend: {
      name: 'Trend day',
      open: 99.0,
      close: 102.8,
      tick: 0.2,
      p: [[98.9, 99.5], [99.2, 99.7], [99.5, 100.2], [99.9, 100.6], [100.3, 100.9], [100.6, 101.3], [101.0, 101.6], [101.3, 101.9], [101.6, 102.1], [101.8, 102.4], [102.1, 102.6], [102.3, 102.8], [102.5, 102.9]],
      about: 'A narrow first hour, then every period’s low stayed above the one before. Longer-term buyers were in control all day; the profile is long and thin because price never paused to build value.',
    },
    neutral: {
      name: 'Neutral day',
      open: 100.0,
      close: 100.1,
      tick: 0.1,
      p: [[99.6, 100.3], [99.7, 100.5], [99.3, 100.0], [99.0, 99.6], [99.2, 99.9], [99.6, 100.3], [100.0, 100.8], [100.4, 101.0], [100.2, 100.8], [99.9, 100.5], [99.8, 100.3], [99.9, 100.4], [99.9, 100.2]],
      about: 'The range was extended on both sides of the first hour and the day closed in the middle. Buyers and sellers each tried and neither won: a balanced, two-sided day.',
    },
    nontrend: {
      name: 'Non-trend day',
      open: 100.0,
      close: 100.0,
      tick: 0.05,
      p: [[99.8, 100.2], [99.9, 100.2], [99.8, 100.1], [99.9, 100.2], [99.8, 100.2], [99.9, 100.2], [99.8, 100.1], [99.9, 100.2], [99.8, 100.2], [99.9, 100.2], [99.9, 100.2], [99.8, 100.1], [99.9, 100.2]],
      about: 'A very narrow range all day with no range extension. Nobody with size wanted to trade, often before big news or a holiday. Quiet days like this often come before a strong move.',
    },
    double: {
      name: 'Double distribution',
      open: 99.8,
      close: 101.6,
      tick: 0.1,
      p: [[99.5, 100.1], [99.6, 100.2], [99.5, 100.0], [99.7, 100.2], [99.8, 100.3], [100.2, 101.4], [101.2, 101.8], [101.3, 101.9], [101.1, 101.7], [101.3, 101.8], [101.2, 101.7], [101.3, 101.8], [101.4, 101.8]],
      about: 'Value built in one area all morning, then one fast period jumped to a new area and value built again there. The thin single prints between the two areas mark the move.',
    },
    excess: {
      name: 'Tails and a poor high',
      open: 100.0,
      close: 100.6,
      tick: 0.1,
      p: [[99.6, 100.4], [98.9, 99.9], [99.5, 100.2], [99.8, 100.6], [100.1, 100.8], [100.2, 100.7], [100.3, 100.9], [100.4, 100.9], [100.2, 100.8], [100.3, 100.9], [100.4, 100.9], [100.2, 100.7], [100.3, 100.8]],
      about: 'Sellers pushed price down in B, but buyers rejected it so fast that only one period traded there: a buying tail. At the top, four periods stalled at exactly the same high with no tail: a poor high, an auction that hasn’t finished.',
    },
  };

  /** Build the TPO profile of a day, using the first `upto` periods. */
  MP.profile = function (day, upto = 13) {
    const t = day.tick,
      per = day.p.slice(0, upto),
      lo = Math.min(...per.map((x) => x[0])),
      hi = Math.max(...per.map((x) => x[1]));
    const n = Math.round((hi - lo) / t);
    const rows = [];
    for (let k = 0; k <= n; k++) {
      const p = +(lo + k * t).toFixed(4),
        letters = [];
      per.forEach(([l, h], j) => p >= l - 1e-9 && p <= h + 1e-9 && letters.push(j));
      rows.push({ p, letters });
    }
    const total = rows.reduce((a, r) => a + r.letters.length, 0),
      mid = (lo + hi) / 2;
    let poc = 0;
    rows.forEach((r, k) => {
      const best = rows[poc];
      if (r.letters.length > best.letters.length || (r.letters.length === best.letters.length && Math.abs(r.p - mid) < Math.abs(best.p - mid))) poc = k;
    });
    // Value area: grow from the POC, comparing the next two rows above with the next two below.
    let a = poc,
      z = poc,
      got = rows[poc].letters.length;
    while (got < total * 0.7 && (a > 0 || z < rows.length - 1)) {
      const up = (rows[z + 1] ? rows[z + 1].letters.length : -1) + (rows[z + 2] ? rows[z + 2].letters.length : 0),
        dn = (rows[a - 1] ? rows[a - 1].letters.length : -1) + (rows[a - 2] ? rows[a - 2].letters.length : 0);
      if (up >= dn && z < rows.length - 1) for (let s = 0; s < 2 && z < rows.length - 1; s++) got += rows[++z].letters.length;
      else for (let s = 0; s < 2 && a > 0; s++) got += rows[--a].letters.length;
    }
    // Initial balance (A and B) and range extension.
    const ib = per.length >= 2 ? { lo: Math.min(per[0][0], per[1][0]), hi: Math.max(per[0][1], per[1][1]) } : null;
    const extUp = ib && hi > ib.hi + 1e-9 ? per.findIndex((x) => x[1] > ib.hi + 1e-9) : -1,
      extDn = ib && lo < ib.lo - 1e-9 ? per.findIndex((x) => x[0] < ib.lo - 1e-9) : -1;
    // Tails: two or more single-letter rows at an extreme. A poor extreme has several letters at the very end.
    const run = (from, step) => {
      let k = from,
        c = 0;
      while (rows[k] && rows[k].letters.length === 1) (c++, (k += step));
      return c;
    };
    const tailLo = run(0, 1),
      tailHi = run(rows.length - 1, -1);
    // Single prints inside the profile: runs of single-letter rows that are not tails.
    const singles = [];
    for (let k = tailLo; k < rows.length - tailHi; k++) {
      if (rows[k].letters.length !== 1) continue;
      let e = k;
      while (rows[e + 1] && rows[e + 1].letters.length === 1 && e + 1 < rows.length - tailHi) e++;
      if (e - k + 1 >= 2) singles.push([k, e]);
      k = e;
    }
    // One-timeframing: each period's low above the last period's low (up), or each high below (down).
    let otfUp = 0,
      otfDn = 0;
    for (let j = 1; j < per.length; j++) {
      if (per[j][0] > per[j - 1][0] + 1e-9) otfUp++;
      if (per[j][1] < per[j - 1][1] - 1e-9) otfDn++;
    }
    return {
      rows, lo, hi, total, poc, pocP: rows[poc].p, va: [a, z], val: rows[a].p, vah: rows[z].p, ib, extUp, extDn,
      tailLo: tailLo >= 2 ? tailLo : 0, tailHi: tailHi >= 2 ? tailHi : 0,
      poorHi: rows[rows.length - 1].letters.length >= 2, poorLo: rows[0].letters.length >= 2,
      singles, otfUp, otfDn, periods: per.length,
    };
  };
})();
