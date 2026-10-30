/* Strike School — glossary. `w` is the default inline word when a lesson links the term. */
(function () {
  'use strict';
  const SS = (window.SS = window.SS || {});
  SS.GLOSSARY = [
    { id: 'option', term: 'Option', w: 'option', def: 'A contract that gives the buyer the right, but not the obligation, to buy or sell an asset at a set price before a set date.' },
    { id: 'call', term: 'Call option', w: 'call', def: 'The right to buy the underlying at the strike price before expiration. It gains value when the price rises.', ex: 'A $105 call lets you buy ACME at $105 even if ACME trades at $120.' },
    { id: 'put', term: 'Put option', w: 'put', def: 'The right to sell the underlying at the strike price before expiration. It gains value when the price falls.', ex: 'A $95 put lets you sell ACME at $95 even if ACME drops to $80.' },
    { id: 'underlying', term: 'Underlying', w: 'underlying', def: 'The asset an option is based on, usually a stock or an ETF.' },
    { id: 'strike', term: 'Strike price', w: 'strike price', def: 'The locked-in price at which an option lets you buy (call) or sell (put).' },
    { id: 'expiration', term: 'Expiration date', w: 'expiration date', def: 'The last day an option exists. After the close, it is either exercised or expires worthless.' },
    { id: 'premium', term: 'Premium', w: 'premium', def: 'The price of an option, quoted per share. Multiply by 100 for the cost of one contract.', ex: 'A premium of $2.15 costs $215 per contract.' },
    { id: 'contract', term: 'Contract', w: 'contract', def: 'One standard US stock option covers 100 shares of the underlying.' },
    { id: 'writer', term: 'Writer', w: 'writer', def: 'The seller of an option. The writer collects the premium and takes on the obligation.' },
    { id: 'long', term: 'Long', w: 'long', def: 'Owning a position. Being long an option means you bought it.' },
    { id: 'short', term: 'Short', w: 'short', def: 'Having sold a position you do not own. Being short an option means you wrote it.' },
    { id: 'breakeven', term: 'Breakeven', w: 'breakeven', def: 'The stock price at expiration where a trade neither makes nor loses money. For a bought call: strike + premium. For a bought put: strike − premium.' },
    { id: 'leverage', term: 'Leverage', w: 'leverage', def: 'Controlling a large position with a small amount of money. It magnifies percentage gains and losses.' },
    { id: 'chain', term: 'Option chain', w: 'option chain', def: 'A table of every available strike for one underlying and expiration, with calls on one side and puts on the other.' },
    { id: 'itm', term: 'In the money (ITM)', w: 'in the money (ITM)', def: 'An option that would be worth something if exercised now. Calls: stock above the strike. Puts: stock below the strike.' },
    { id: 'atm', term: 'At the money (ATM)', w: 'at the money (ATM)', def: 'The stock price is at, or very close to, the strike.' },
    { id: 'otm', term: 'Out of the money (OTM)', w: 'out of the money (OTM)', def: 'An option with no intrinsic value. Calls: stock below the strike. Puts: stock above the strike.' },
    { id: 'bid', term: 'Bid', w: 'bid', def: 'The highest price a buyer is currently willing to pay. When you sell at market, you get the bid.' },
    { id: 'ask', term: 'Ask', w: 'ask', def: 'The lowest price a seller is currently willing to accept. When you buy at market, you pay the ask.' },
    { id: 'bid-ask', term: 'Bid-ask spread', w: 'bid-ask spread', def: 'The gap between the bid and the ask. It is a hidden cost you pay on every round trip.' },
    { id: 'volume', term: 'Volume', w: 'volume', def: 'How many contracts have traded today.' },
    { id: 'open-interest', term: 'Open interest', w: 'open interest', def: 'How many contracts are currently open, meaning not yet closed or expired. Higher open interest usually means a more liquid market.' },
    { id: 'leaps', term: 'LEAPS', w: 'LEAPS', def: 'Long-term options with more than a year until expiration.' },
    { id: 'dte', term: 'DTE', w: 'days to expiration', def: 'Days to expiration: how many calendar days an option has left.' },
    { id: 'intrinsic', term: 'Intrinsic value', w: 'intrinsic value', def: 'What an option would be worth if exercised right now. It is never below zero.', ex: 'ACME at $106: the $100 call has $6 of intrinsic value.' },
    { id: 'extrinsic', term: 'Time value', w: 'time value', def: 'The part of the premium above intrinsic value, also called extrinsic value. It pays for the chance of a better outcome and shrinks to zero at expiration.' },
    { id: 'greeks', term: 'The Greeks', w: 'Greeks', def: 'Measures of how an option price reacts to the stock price (delta, gamma), time (theta), volatility (vega) and interest rates (rho).' },
    { id: 'delta', term: 'Delta (Δ)', w: 'delta', def: 'How much an option price changes for a $1 move in the stock. Also a rough estimate of the chance of finishing in the money.', ex: 'Delta 0.40: ACME +$1 → option +$0.40 a share, or $40 a contract.' },
    { id: 'gamma', term: 'Gamma (Γ)', w: 'gamma', def: 'How much delta changes for a $1 move in the stock. Highest for at-the-money options near expiration.' },
    { id: 'theta', term: 'Theta (Θ)', w: 'theta', def: 'How much value an option loses per day as time passes, all else equal.', ex: 'Theta −0.05: about $5 per contract per day.' },
    { id: 'vega', term: 'Vega (ν)', w: 'vega', def: 'How much an option price changes when implied volatility moves 1 percentage point.' },
    { id: 'rho', term: 'Rho (ρ)', w: 'rho', def: 'How much an option price changes when interest rates move 1 percentage point. Usually small for short-term options.' },
    { id: 'volatility', term: 'Volatility', w: 'volatility', def: 'How much a stock price swings. Bigger swings make options more valuable.' },
    { id: 'iv', term: 'Implied volatility (IV)', w: 'implied volatility (IV)', def: 'The future volatility the market is pricing in, worked backwards from option prices. High IV means expensive options.' },
    { id: 'iv-crush', term: 'IV crush', w: 'IV crush', def: 'A sharp drop in implied volatility after an expected event such as earnings. It deflates option prices even if the stock moves.' },
    { id: 'exercise', term: 'Exercise', w: 'exercise', def: 'Using an option: buying (call) or selling (put) the shares at the strike price.' },
    { id: 'assignment', term: 'Assignment', w: 'assignment', def: 'When an option you sold is exercised, you are assigned and must fulfill the obligation: deliver or buy the shares at the strike.' },
    { id: 'american', term: 'American-style', w: 'American-style', def: 'An option that can be exercised on any trading day before expiration. Most US stock options are American-style.' },
    { id: 'european', term: 'European-style', w: 'European-style', def: 'An option that can only be exercised at expiration. Many index options, such as SPX, are European-style and cash-settled.' },
    { id: 'naked', term: 'Naked option', w: 'naked', def: 'Selling an option without owning the shares or a protecting option. Naked calls have unlimited risk.' },
    { id: 'margin', term: 'Margin', w: 'margin', def: 'Collateral your broker requires to hold positions that can lose money, such as sold options.' },
    { id: 'pop', term: 'Probability of profit (POP)', w: 'probability of profit', def: 'The estimated chance that a trade makes at least $0.01 at expiration, based on a pricing model.' },
    { id: 'debit', term: 'Debit', w: 'debit', def: 'Money you pay to open a trade. For a bought option or debit spread, the debit is usually your max loss.' },
    { id: 'credit-spread', term: 'Credit spread', w: 'credit spread', def: 'A spread that pays you upfront: you sell a more expensive option and buy a cheaper one at a farther strike for protection.' },
    { id: 'vertical', term: 'Vertical spread', w: 'vertical spread', def: 'Buying one option and selling another of the same type and expiration at a different strike.' },
    { id: 'covered-call', term: 'Covered call', w: 'covered call', def: 'Owning 100 shares and selling a call against them for income. Upside above the strike is given up.' },
    { id: 'csp', term: 'Cash-secured put', w: 'cash-secured put', def: 'Selling a put while holding enough cash to buy the shares if assigned.' },
    { id: 'protective-put', term: 'Protective put', w: 'protective put', def: 'Buying a put on shares you own to put a floor under your losses.' },
    { id: 'collar', term: 'Collar', w: 'collar', def: 'Owning shares, buying a protective put, and selling a call to help pay for it. Both downside and upside are capped.' },
    { id: 'straddle', term: 'Straddle', w: 'straddle', def: 'Buying a call and a put at the same strike and expiration. It profits from a big move in either direction.' },
    { id: 'strangle', term: 'Strangle', w: 'strangle', def: 'Buying an out-of-the-money call and an out-of-the-money put. Cheaper than a straddle, but it needs a bigger move.' },
    { id: 'iron-condor', term: 'Iron condor', w: 'iron condor', def: 'Selling an out-of-the-money put spread and an out-of-the-money call spread. It profits if the stock stays in a range.' },
    { id: 'butterfly', term: 'Butterfly', w: 'butterfly', def: 'Three strikes: buy one low, sell two in the middle, buy one high. It profits most if the stock ends at the middle strike.' },
    { id: 'wheel', term: 'The wheel', w: 'the wheel', def: 'Selling cash-secured puts until assigned, then selling covered calls until the shares are called away, then repeating.' },
  ];
  const byId = {};
  SS.GLOSSARY.forEach((t) => {
    t.course = t.course || 'options';
    byId[t.id] = t;
  });
  SS.term = (id) => byId[id];
  /** Courses add their own terms. Ids must be unique across the whole glossary. */
  SS.addTerms = function (terms, course) {
    terms.forEach((t) => {
      if (byId[t.id]) return;
      t.course = course;
      byId[t.id] = t;
      SS.GLOSSARY.push(t);
    });
  };
})();
