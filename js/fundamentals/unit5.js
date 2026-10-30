/* Fundamentals, Unit 5 — Valuing a company. Ridgeline Gear: price $22, EPS $1.10, 100M shares,
   market cap $2,200M, debt $280M, cash $150M, EBITDA $200M, FCF $80M, dividend $0.30 a share. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'fair-value', term: 'Intrinsic value (of a business)', w: 'intrinsic value', def: 'An estimate of what a business is really worth, based on the cash it can produce over its life. Different investors estimate it differently.' },
      { id: 'mr-market', term: 'Mr. Market', w: 'Mr. Market', def: 'Benjamin Graham’s imaginary business partner who offers to buy or sell every day at prices driven by his mood. You can take his offers or ignore them.' },
      { id: 'margin-of-safety', term: 'Margin of safety', w: 'margin of safety', def: 'Buying well below your estimate of value, so that you can still do well if your estimate turns out to be too optimistic.' },
      { id: 'enterprise-value', term: 'Enterprise value (EV)', w: 'enterprise value', def: 'Market cap plus debt minus cash: roughly what it would cost to buy the whole business, debts included.', ex: '$2,200M market cap + $280M debt − $150M cash = $2,330M.' },
      { id: 'pe-ratio', term: 'Price-to-earnings (P/E)', w: 'price-to-earnings (P/E) ratio', def: 'Share price divided by earnings per share: how many dollars you pay for each $1 of yearly profit.', ex: '$22 ÷ $1.10 EPS = a P/E of 20.' },
      { id: 'earnings-yield', term: 'Earnings yield', w: 'earnings yield', def: 'EPS divided by share price, the inverse of the P/E. A P/E of 20 is an earnings yield of 5%.' },
      { id: 'peg-ratio', term: 'PEG ratio', w: 'PEG ratio', def: 'The P/E divided by the expected yearly earnings growth rate in percent. A rough way to adjust the P/E for growth.' },
      { id: 'price-to-sales', term: 'Price-to-sales (P/S)', w: 'price-to-sales', def: 'Market cap divided by yearly revenue. Useful for companies that do not have profits yet.' },
      { id: 'ebitda', term: 'EBITDA', w: 'EBITDA', def: 'Earnings before interest, taxes, depreciation and amortization: operating profit with non-cash charges added back.' },
      { id: 'ev-ebitda', term: 'EV/EBITDA', w: 'EV/EBITDA', def: 'Enterprise value divided by EBITDA. It compares companies regardless of how much debt they carry.' },
      { id: 'time-value-of-money', term: 'Time value of money', w: 'time value of money', def: 'The idea that a dollar today is worth more than a dollar in the future, because today’s dollar can be invested.' },
      { id: 'discount-rate', term: 'Discount rate', w: 'discount rate', def: 'The yearly return you require, used to convert future cash into today’s value. Riskier cash flows get higher discount rates.' },
      { id: 'dcf', term: 'Discounted cash flow (DCF)', w: 'discounted cash flow (DCF)', def: 'A valuation method: forecast a company’s future free cash flows, convert each into today’s money with a discount rate, and add them up.' },
      { id: 'terminal-value', term: 'Terminal value', w: 'terminal value', def: 'In a DCF, the value of all the cash flows beyond the forecast period, rolled into one number. It is often most of the total.' },
      { id: 'dividend-yield', term: 'Dividend yield', w: 'dividend yield', def: 'The yearly dividend per share divided by the share price.', ex: '$0.30 ÷ $22 ≈ 1.4%.' },
      { id: 'payout-ratio', term: 'Payout ratio', w: 'payout ratio', def: 'The share of earnings paid out as dividends. Above 100% means the company pays more than it earns.' },
      { id: 'drip', term: 'Dividend reinvestment (DRIP)', w: 'dividend reinvestment', def: 'Automatically using dividends to buy more shares, so future dividends are paid on a growing number of shares.' },
      { id: 'ex-dividend-date', term: 'Ex-dividend date', w: 'ex-dividend date', def: 'The first day a stock trades without its next dividend. Buy before it to receive the dividend; on it, the price usually drops by about the dividend.' },
    ],
    'fundamentals'
  );

  SS.FUND_UNITS.push({
    n: 5,
    title: 'Valuing a company',
    blurb: 'Price versus value, valuation ratios, discounted cash flow and dividends.',
    lessons: [
      {
        id: 'price-vs-value',
        title: 'Price versus value',
        hook: 'Mr. Market’s mood swings, and why you want a margin of safety.',
        mins: 7,
        steps: [
          {
            h: 'Meet Mr. Market',
            body: `<p>In <i>The Intelligent Investor</i> (1949), Benjamin Graham imagined a business partner, [[mr-market]]. Every day he shouts a price at which he will buy your share of the business or sell you his.</p>
<p>When he is cheerful, his prices are high. When he is gloomy, they are low. But the business itself, and its [[fair-value]], changes slowly. <mark>His offers are there to serve you, not to guide you.</mark></p>
<p>Watch his mood swing around the slowly rising value of the business.</p>`,
            predict: {
              q: 'Mr. Market offers to buy your share of a business you believe is worth $100 for $60 today, because he is gloomy. What should you do?',
              choices: ['Sell to him; he must know something', 'Ignore him, or even buy more from him at $60', 'Panic'],
              a: 1,
              why: 'If nothing about the business has changed, a low price is an opportunity, not a verdict. You never have to accept his offer.',
            },
            viz: { type: 'mrMarket' },
          },
          {
            h: 'Margin of safety',
            body: `<p>Any estimate of value is uncertain. You might be too optimistic about growth, or something might go wrong. Graham's answer was the [[margin-of-safety]]: only buy when the price is well below your estimate.</p>
<p>Instead of one number, estimate a range: a bear case, a base case and a bull case. Then see how much room for error each price gives you.</p>`,
            viz: { type: 'safety' },
          },
          {
            h: 'Buying the whole company',
            body: `<p>Market cap is the price of the shares. But if you bought the whole company, you would also take on its debt and get its cash. [[enterprise-value]] captures that: <b>market cap + debt − cash</b>.</p>
<p>Two companies with the same market cap can be very different deals if one is loaded with debt.</p>`,
            viz: { type: 'evBuilder' },
          },
        ],
        quiz: [
          { q: "In Graham's parable, Mr. Market's daily prices are best treated as…", choices: ['Orders you must follow', 'Offers you can take or ignore', 'Exact measures of value'], a: 1, why: 'The price is what someone will pay today, not necessarily what the business is worth.' },
          { q: 'You estimate a stock is worth $50. With a 30% margin of safety, you would buy at or below…', choices: ['$35', '$50', '$65'], a: 0, why: '$50 × (1 − 0.30) = $35.' },
          { q: 'Market cap is $1,000M, debt $300M and cash $100M. Enterprise value is…', choices: ['$1,200M', '$1,400M', '$800M'], a: 0, why: '$1,000M + $300M − $100M = $1,200M.' },
        ],
        takeaways: ['Price is what you pay; value is what you get.', 'Buy with a margin of safety, using a range of estimates.', 'Enterprise value counts debt and cash, not just the shares.'],
      },
      {
        id: 'valuation-ratios',
        title: 'P/E and other valuation ratios',
        hook: 'Quick ways to tell cheap from expensive, and their limits.',
        mins: 8,
        steps: [
          {
            h: 'The P/E ratio',
            body: `<p>The [[pe-ratio]] divides the share price by earnings per share. Ridgeline: $22 ÷ $1.10 = <b>20</b>. You are paying $20 for each $1 of yearly profit, so at today's profit it would take 20 years to earn back the price.</p>
<p>Flip it over and you get the [[earnings-yield]]: 1 ÷ 20 = 5%. That makes stocks easy to compare with what bonds or savings pay.</p>`,
            viz: { type: 'peBuilder' },
          },
          {
            h: 'Growth changes everything',
            body: `<p>A high P/E is not automatically expensive. If earnings grow fast, today's high multiple shrinks quickly against future profits.</p>
<p>The [[peg-ratio]] divides the P/E by the growth rate as a rough adjustment. But growth forecasts are often wrong, and high-growth stocks fall hard when growth disappoints.</p>`,
            predict: {
              q: 'Steady Co has a P/E of 15 and grows earnings 3% a year. Rocket Co has a P/E of 40 and grows 25% a year. If both share prices stay flat, whose P/E is lower after 5 years?',
              choices: ['Steady Co', 'Rocket Co', 'About the same'],
              a: 2,
              why: 'Steady falls to 15 ÷ 1.03⁵ ≈ 12.9. Rocket falls to 40 ÷ 1.25⁵ ≈ 13.1. Rocket’s high P/E was paying for growth that, if it happens, makes it no more expensive than Steady.',
            },
            viz: { type: 'peGrowth' },
          },
          {
            h: 'A toolbox of ratios',
            body: `<p>No single ratio works for every business. [[price-to-sales]] helps when a company has no profit yet. Price-to-book suits banks. [[ev-ebitda]] compares companies with different amounts of debt, using [[ebitda]] as a rough measure of operating cash profit. Dividend yield and free-cash-flow yield show the cash coming back to you.</p>
<p>Move Ridgeline's share price and watch every ratio change at once.</p>`,
            viz: { type: 'ratioTable' },
          },
        ],
        quiz: [
          { q: 'A stock trades at $30 with EPS of $2. Its P/E is…', choices: ['15', '60', '2'], a: 0, why: '$30 ÷ $2 = 15.' },
          { q: 'A P/E of 25 means an earnings yield of…', choices: ['25%', '4%', '2.5%'], a: 1, why: '1 ÷ 25 = 0.04, or 4%.' },
          { q: 'Why might a fast-growing company deserve a higher P/E?', choices: ['Its earnings may grow into the price', 'A high P/E always means cheap', 'P/E ignores profit'], a: 0, why: 'If profits grow quickly, the P/E on future earnings falls, as long as the growth arrives.' },
          { q: 'Which ratio works for a company that has no profit yet?', choices: ['P/E', 'Price-to-sales', 'Payout ratio'], a: 1, why: 'With zero or negative earnings, P/E is meaningless, but revenue still exists.' },
        ],
        takeaways: ['P/E = price ÷ EPS; its inverse is the earnings yield.', 'Judge a P/E against growth, and be humble about forecasts.', 'Use the ratio that fits the business: P/S, P/B, EV/EBITDA, yields.'],
      },
      {
        id: 'dcf',
        title: 'Discounted cash flow',
        hook: 'What future cash is worth today, and why the answer is a range.',
        mins: 9,
        steps: [
          {
            h: 'A dollar later is worth less than a dollar today',
            body: `<p>$100 today can be invested and grow. So $100 promised in ten years is worth less than $100 now. This is the [[time-value-of-money]].</p>
<p>To compare, divide future cash by (1 + [[discount-rate]]) once for each year of waiting. The discount rate is the return you require; riskier cash deserves a higher rate.</p>`,
            predict: {
              q: 'At an 8% discount rate, what is $100 received 10 years from now worth today?',
              choices: ['About $92', 'About $46', 'About $8'],
              a: 1,
              why: '$100 ÷ 1.08¹⁰ ≈ $46. Waiting ten years more than halves its value at 8%.',
            },
            viz: { type: 'discountBars' },
          },
          {
            h: 'Valuing Ridgeline',
            body: `<p>A [[dcf]] model forecasts free cash flow, discounts each year back to today, and adds a [[terminal-value]] for everything after the forecast period. Then it subtracts debt and adds cash to reach the value of the shares.</p>
<p>With Ridgeline's $80M of free cash flow growing 6% a year and a 9% discount rate, the shares are worth about <b>$15</b>, below their $22 price. Either the market expects faster growth, or it accepts a lower return. Try the inputs.</p>`,
            viz: { type: 'dcf' },
          },
          {
            h: 'Small changes, big swings',
            body: `<p>DCF values are extremely sensitive. One point more growth, or one point less discount rate, can move the answer by 20% or more. The terminal value is often more than half of the total.</p>
<p><mark>Treat a DCF as a way to see what you must believe, not as a precise answer.</mark> At $22, what combinations of growth and discount rate justify Ridgeline's price?</p>`,
            viz: { type: 'dcfGrid' },
          },
        ],
        quiz: [
          { q: 'Raising the discount rate makes a DCF value…', choices: ['Higher', 'Lower', 'Unchanged'], a: 1, why: 'Future cash is divided by a bigger number, so it is worth less today.' },
          { q: 'In many DCF models, the largest single piece of value is…', choices: ['The first year’s cash flow', 'The terminal value', 'Cash on the balance sheet'], a: 1, why: 'Everything beyond the forecast period is rolled into one number, and it is usually the biggest.' },
          { q: '$110 received one year from now, at a 10% discount rate, is worth today…', choices: ['$100', '$110', '$121'], a: 0, why: '$110 ÷ 1.10 = $100.' },
        ],
        takeaways: ['A dollar today is worth more than a dollar later.', 'DCF = the discounted sum of future free cash flows.', 'Small input changes move the result a lot; think in ranges.'],
      },
      {
        id: 'dividends',
        title: 'Dividends',
        hook: 'Yield, payout ratio, and the power of reinvesting.',
        mins: 7,
        steps: [
          {
            h: 'Yield and payout ratio',
            body: `<p>The [[dividend-yield]] is the yearly dividend divided by the price. Ridgeline pays $0.30 a share at a $22 price: a 1.4% yield. The [[payout-ratio]] is the dividend divided by earnings: $0.30 ÷ $1.10 = 27%.</p>
<p>A very high yield can be a trap. Sometimes the price has collapsed because the business is in trouble, or the company pays out more than it earns. That dividend is likely to be cut.</p>`,
            viz: { type: 'divCalc' },
          },
          {
            h: 'Reinvesting dividends',
            body: `<p>With [[drip]], each dividend buys more shares, and those shares pay dividends too. It is compounding again.</p>
<p>$10,000 in a stock yielding 3% whose price grows 5% a year becomes about <b>$100,000</b> in 30 years with dividends reinvested, against $43,000 in shares plus about $20,000 of cash dividends if you spend them.</p>`,
            viz: { type: 'drip' },
          },
          {
            h: 'The dividend calendar',
            body: `<p>Each dividend has four dates. The company announces it on the declaration date. On the [[ex-dividend-date]], the stock starts trading without the dividend. The record date is usually the same day or one business day later. Cash arrives on the payment date.</p>
<p><mark>You must own the stock before the ex-dividend date.</mark> On that day the price usually drops by about the dividend, so buying just to collect it does not create free money.</p>`,
            viz: { type: 'divDates' },
          },
        ],
        quiz: [
          { q: 'A $40 stock pays $1.20 a year in dividends. Its yield is…', choices: ['3%', '1.2%', '30%'], a: 0, why: '$1.20 ÷ $40 = 0.03.' },
          { q: 'A company pays out 130% of its earnings as dividends. This is…', choices: ['Very safe', 'A warning sign: it cannot last without a change', 'Required by law'], a: 1, why: 'Paying more than you earn drains cash or requires borrowing. A cut is likely.' },
          { q: 'To receive the next dividend, you must buy the stock…', choices: ['Before the ex-dividend date', 'On the payment date', 'Any time that year'], a: 0, why: 'Buyers on or after the ex-dividend date do not get that dividend.' },
        ],
        takeaways: ['Yield = dividend ÷ price; payout ratio = dividend ÷ earnings.', 'Very high yields and payout ratios above 100% are warning signs.', 'Reinvested dividends compound; buy before the ex-dividend date to receive one.'],
      },
    ],
  });
})();
