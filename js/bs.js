/* Strike School — option math: Black-Scholes prices and Greeks, payoff analysis, strategy presets. */
(function () {
  'use strict';
  const SS = (window.SS = window.SS || {});
  SS.RATE = 0.04; // risk-free rate used everywhere
  const M = 100; // shares per contract
  SS.MULT = M;

  function erf(x) {
    const s = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const N = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
  const pdf = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  SS.N = N;
  SS.npdf = pdf;
  SS.r2 = (x) => Math.round(x * 100) / 100;

  /**
   * Black-Scholes for European options. `days` is calendar days to expiration.
   * theta is per calendar day, vega and rho per 1 percentage point. All per share.
   */
  SS.bs = function (type, S, K, days, iv, r) {
    if (r == null) r = SS.RATE;
    if (type === 'stock') return { price: S, delta: 1, gamma: 0, theta: 0, vega: 0, rho: 0, prob: 1 };
    const T = days / 365;
    if (T <= 1e-9 || iv <= 1e-9) {
      const call = type === 'call';
      const itm = call ? S > K : S < K;
      return { price: call ? Math.max(S - K, 0) : Math.max(K - S, 0), delta: itm ? (call ? 1 : -1) : 0, gamma: 0, theta: 0, vega: 0, rho: 0, prob: itm ? 1 : 0 };
    }
    const sq = Math.sqrt(T),
      v = iv * sq;
    const d1 = (Math.log(S / K) + (r + 0.5 * iv * iv) * T) / v,
      d2 = d1 - v;
    const disc = Math.exp(-r * T),
      nd1 = pdf(d1);
    const gamma = nd1 / (S * v),
      vega = (S * nd1 * sq) / 100;
    if (type === 'call') {
      return {
        price: S * N(d1) - K * disc * N(d2),
        delta: N(d1),
        gamma,
        vega,
        theta: ((-S * nd1 * iv) / (2 * sq) - r * K * disc * N(d2)) / 365,
        rho: (K * T * disc * N(d2)) / 100,
        prob: N(d2),
      };
    }
    return {
      price: K * disc * N(-d2) - S * N(-d1),
      delta: N(d1) - 1,
      gamma,
      vega,
      theta: ((-S * nd1 * iv) / (2 * sq) + r * K * disc * N(-d2)) / 365,
      rho: (-K * T * disc * N(-d2)) / 100,
      prob: N(-d2),
    };
  };

  /** Density of the stock price at expiration under the same lognormal model. */
  SS.lognPdf = function (x, S0, days, iv, r) {
    if (r == null) r = SS.RATE;
    if (x <= 0) return 0;
    const T = days / 365,
      s = iv * Math.sqrt(T),
      m = Math.log(S0) + (r - (iv * iv) / 2) * T;
    const z = (Math.log(x) - m) / s;
    return Math.exp(-0.5 * z * z) / (x * s * Math.sqrt(2 * Math.PI));
  };
  SS.probBelow = function (x, S0, days, iv, r) {
    if (r == null) r = SS.RATE;
    if (x <= 0) return 0;
    const T = days / 365,
      s = iv * Math.sqrt(T),
      m = Math.log(S0) + (r - (iv * iv) / 2) * T;
    return N((Math.log(x) - m) / s);
  };

  /* ---------- positions ----------
     A leg: { type: 'call'|'put'|'stock', side: 1 (bought) | -1 (sold), K, qty, premium }
     For stock, premium is the entry price. Values below are per share; multiply by 100 per contract. */
  SS.intrinsic = (type, S, K) => (type === 'call' ? Math.max(S - K, 0) : type === 'put' ? Math.max(K - S, 0) : S);
  SS.legExpiry = (l, S) => l.side * (l.qty || 1) * (SS.intrinsic(l.type, S, l.K) - l.premium);
  SS.plExpiry = (legs, S) => legs.reduce((a, l) => a + SS.legExpiry(l, S), 0);
  SS.legPrice = (l, S, days, iv) => (l.type === 'stock' ? S : SS.bs(l.type, S, l.K, days, iv).price);
  SS.posValue = (legs, S, days, iv) => legs.reduce((a, l) => a + l.side * (l.qty || 1) * SS.legPrice(l, S, days, iv), 0);
  SS.plNow = (legs, S, days, iv) => legs.reduce((a, l) => a + l.side * (l.qty || 1) * (SS.legPrice(l, S, days, iv) - l.premium), 0);
  SS.posGreeks = function (legs, S, days, iv) {
    const g = { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
    legs.forEach((l) => {
      const q = l.side * (l.qty || 1),
        b = SS.bs(l.type, S, l.K, days, iv);
      for (const k in g) g[k] += q * b[k];
    });
    return g;
  };

  /** Exact max profit / max loss / breakevens of an expiration payoff (piecewise linear). */
  SS.analyze = function (legs) {
    const ks = [...new Set(legs.filter((l) => l.type !== 'stock').map((l) => l.K))].sort((a, b) => a - b);
    const slopeR = legs.reduce((a, l) => a + l.side * (l.qty || 1) * (l.type === 'put' ? 0 : 1), 0);
    const pts = [0, ...ks];
    const vals = pts.map((s) => SS.plExpiry(legs, s));
    let maxProfit = Math.max(...vals),
      maxLoss = Math.min(...vals);
    if (slopeR > 1e-9) maxProfit = Infinity;
    else if (slopeR < -1e-9) maxLoss = -Infinity;
    const be = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        b = pts[i + 1],
        fa = vals[i],
        fb = vals[i + 1];
      if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) be.push(a + ((0 - fa) * (b - a)) / (fb - fa));
      else if (Math.abs(fb) < 1e-9 && i + 2 < pts.length) {
        const fc = vals[i + 2];
        if ((fa < 0 && fc > 0) || (fa > 0 && fc < 0)) be.push(b);
      }
    }
    const last = pts[pts.length - 1],
      fl = vals[vals.length - 1];
    if (Math.abs(slopeR) > 1e-9) {
      const x = last - fl / slopeR;
      if (x > last + 1e-9) be.push(x);
    }
    const net = legs.reduce((a, l) => a + l.side * (l.qty || 1) * l.premium, 0);
    return { maxProfit, maxLoss, breakevens: be.map((x) => Math.round(x * 100) / 100), net, strikes: ks };
  };

  /** Probability the expiration P&L is above zero, under the lognormal model. */
  SS.pop = function (legs, S0, days, iv) {
    if (days <= 0) return SS.plExpiry(legs, S0) > 0 ? 1 : 0;
    const s = iv * Math.sqrt(days / 365);
    const lo = S0 * Math.exp(-6 * s),
      hi = S0 * Math.exp(6 * s),
      n = 800;
    let p = 0,
      prev = SS.probBelow(lo, S0, days, iv);
    for (let i = 1; i <= n; i++) {
      const x = lo + ((hi - lo) * i) / n;
      const c = SS.probBelow(x, S0, days, iv);
      if (SS.plExpiry(legs, x - (hi - lo) / (2 * n)) > 0) p += c - prev;
      prev = c;
    }
    if (SS.plExpiry(legs, hi * 2) > 0) p += 1 - prev;
    if (SS.plExpiry(legs, lo / 2) > 0) p += SS.probBelow(lo, S0, days, iv);
    return Math.min(1, Math.max(0, p));
  };

  SS.legLabel = function (l) {
    if (l.type === 'stock') return `${l.side > 0 ? 'Own' : 'Short'} 100 shares at ${SS.usd(l.premium)}`;
    const q = l.qty || 1;
    return `${l.side > 0 ? 'Buy' : 'Sell'} ${q > 1 ? q + ' × ' : ''}$${l.K} ${l.type} at ${SS.usd(l.premium)}`;
  };

  /* ---------- strategy presets ----------
     legs: [type, side, strike offset from the stock price (in $ at a $100 stock), qty] */
  SS.STRATS = [
    { id: 'long-call', name: 'Long call', view: 'Bullish', risk: 'Defined', legs: [['call', 1, 0]], blurb: 'Pay a premium for upside. Your loss is capped at what you paid.' },
    { id: 'long-put', name: 'Long put', view: 'Bearish', risk: 'Defined', legs: [['put', 1, 0]], blurb: 'Profit from a drop, or insure shares you own.' },
    { id: 'covered-call', name: 'Covered call', view: 'Neutral to mildly bullish', risk: 'Stock risk', legs: [['stock', 1], ['call', -1, 5]], blurb: 'Own shares and sell a call above. Income now, capped upside.' },
    { id: 'csp', name: 'Cash-secured put', view: 'Neutral to bullish', risk: 'Stock risk', legs: [['put', -1, -5]], blurb: 'Get paid to wait for a lower purchase price.' },
    { id: 'protective-put', name: 'Protective put', view: 'Bullish but worried', risk: 'Defined', legs: [['stock', 1], ['put', 1, -5]], blurb: 'Shares plus insurance. Losses stop at the put strike.' },
    { id: 'collar', name: 'Collar', view: 'Protect a position', risk: 'Defined', legs: [['stock', 1], ['put', 1, -5], ['call', -1, 5]], blurb: 'A floor and a ceiling. The sold call pays for the put.' },
    { id: 'bull-call', name: 'Bull call spread', view: 'Moderately bullish', risk: 'Defined', legs: [['call', 1, 0], ['call', -1, 10]], blurb: 'Cheaper than a call. Gains stop at the upper strike.' },
    { id: 'bear-put', name: 'Bear put spread', view: 'Moderately bearish', risk: 'Defined', legs: [['put', 1, 0], ['put', -1, -10]], blurb: 'Cheaper than a put. Gains stop at the lower strike.' },
    { id: 'bull-put', name: 'Bull put spread', view: 'Neutral to bullish', risk: 'Defined', legs: [['put', -1, -5], ['put', 1, -10]], blurb: 'Collect a credit if the stock stays above the sold put.' },
    { id: 'bear-call', name: 'Bear call spread', view: 'Neutral to bearish', risk: 'Defined', legs: [['call', -1, 5], ['call', 1, 10]], blurb: 'Collect a credit if the stock stays below the sold call.' },
    { id: 'straddle', name: 'Long straddle', view: 'Big move either way', risk: 'Defined', legs: [['call', 1, 0], ['put', 1, 0]], blurb: 'Profit from a large move up or down. Hurt by calm markets and IV crush.' },
    { id: 'strangle', name: 'Long strangle', view: 'Very big move', risk: 'Defined', legs: [['call', 1, 5], ['put', 1, -5]], blurb: 'Cheaper than a straddle, but needs a bigger move.' },
    { id: 'iron-condor', name: 'Iron condor', view: 'Range-bound', risk: 'Defined', legs: [['put', -1, -5], ['put', 1, -10], ['call', -1, 5], ['call', 1, 10]], blurb: 'Collect a credit if the stock stays between the sold strikes.' },
    { id: 'butterfly', name: 'Call butterfly', view: 'Pinned near a price', risk: 'Defined', legs: [['call', 1, -5], ['call', -1, 0, 2], ['call', 1, 5]], blurb: 'A cheap bet that the stock ends near the middle strike.' },
    { id: 'short-call', name: 'Naked call', view: 'Bearish (dangerous)', risk: 'Unlimited', legs: [['call', -1, 5]], blurb: 'Collect premium with unlimited upside risk. Shown for learning only.' },
  ];
  SS.strat = (id) => SS.STRATS.find((s) => s.id === id);

  SS.buildLegs = function (id, S, days, iv) {
    const st = SS.strat(id);
    const step = S >= 50 ? 1 : 0.5,
      scale = S / 100;
    return st.legs.map(([type, side, off = 0, qty = 1]) => {
      if (type === 'stock') return { type, side, qty: 1, premium: SS.r2(S) };
      const K = Math.round((S + off * scale) / step) * step;
      return { type, side, K, qty, premium: Math.max(0.01, SS.r2(SS.bs(type, S, K, days, iv).price)) };
    });
  };
  SS.reprice = function (legs, S, days, iv) {
    legs.forEach((l) => {
      l.premium = l.type === 'stock' ? SS.r2(S) : Math.max(0.01, SS.r2(SS.bs(l.type, S, l.K, days, iv).price));
    });
    return legs;
  };
})();
