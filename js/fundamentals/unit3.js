/* Fundamentals, Unit 3 — Building a portfolio. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'diversification', term: 'Diversification', w: 'diversification', def: 'Spreading money across many investments so that no single failure can do serious damage.' },
      { id: 'specific-risk', term: 'Company-specific risk', w: 'company-specific risk', def: 'Risk that hits one company, such as a failed product or a scandal. Diversification can almost eliminate it.' },
      { id: 'market-risk', term: 'Market risk', w: 'market risk', def: 'Risk that hits nearly everything at once, such as a recession. Diversification across stocks cannot remove it.' },
      { id: 'correlation', term: 'Correlation', w: 'correlation', def: 'How closely two investments move together, from +1 (always together) through 0 (unrelated) to −1 (always opposite).' },
      { id: 'active-fund', term: 'Active fund', w: 'actively managed funds', def: 'A fund whose managers pick investments to try to beat the market, usually charging higher fees.' },
      { id: 'passive-investing', term: 'Passive investing', w: 'passive investing', def: 'Buying a fund that simply tracks an index, accepting the market’s return at very low cost instead of trying to beat it.' },
      { id: 'nav', term: 'Net asset value (NAV)', w: 'net asset value (NAV)', def: 'The value of everything a fund owns, minus what it owes, divided by its number of shares.' },
      { id: 'tracking-error', term: 'Tracking difference', w: 'tracking difference', def: 'How far an index fund’s return falls short of (or beats) the index it follows, mostly because of fees.' },
      { id: 'asset-allocation', term: 'Asset allocation', w: 'asset allocation', def: 'How you split your money between stocks, bonds, cash and other asset classes.' },
      { id: 'risk-tolerance', term: 'Risk tolerance', w: 'risk tolerance', def: 'How much the value of your investments can swing before it changes your plans or your sleep.' },
      { id: 'target-date-fund', term: 'Target-date fund', w: 'target-date fund', def: 'A single fund that holds a stock and bond mix and shifts it toward bonds as a chosen year, usually retirement, gets closer.' },
      { id: 'rebalancing', term: 'Rebalancing', w: 'rebalancing', def: 'Selling some of what has grown and buying what has lagged, to bring a portfolio back to its target mix.' },
      { id: 'dollar-cost-averaging', term: 'Dollar-cost averaging', w: 'dollar-cost averaging', def: 'Investing a fixed amount on a regular schedule, whatever the price. You automatically buy more shares when prices are low.' },
      { id: 'behavior-gap', term: 'Behavior gap', w: 'behavior gap', def: 'The difference between what an investment earned and what its investors earned, because they bought and sold at the wrong times.' },
    ],
    'fundamentals'
  );

  SS.FUND_UNITS.push({
    n: 3,
    title: 'Building a portfolio',
    blurb: 'Diversification, index funds, the stock and bond mix, and habits that keep you invested.',
    lessons: [
      {
        id: 'diversification',
        title: 'Diversification',
        hook: 'Why owning many things beats betting on one.',
        mins: 7,
        steps: [
          {
            h: 'Don’t bet everything on one company',
            body: `<p>Any single company can stumble: a failed product, a scandal, a new competitor. Owning one stock means one disaster can wipe you out. Owning fifty means it costs you about 2%.</p>
<p>That is [[diversification]]. Choose how many stocks to hold and simulate ten years. Each tile is one company.</p>`,
            predict: {
              q: 'A single stock and a 50-stock portfolio have the same average expected return. Which is more likely to lose money over 10 years?',
              choices: ['The single stock', 'The 50-stock portfolio', 'They are equally likely'],
              a: 0,
              why: 'One stock’s fate depends on one company. Across fifty, the disasters and the big winners average out, so the result clusters near the market’s return.',
            },
            viz: { type: 'diversify' },
          },
          {
            h: 'Risk you can remove, and risk you can’t',
            body: `<p>Adding stocks shrinks [[specific-risk]] fast: most of it is gone by 20 or 30 holdings. But it never gets rid of [[market-risk]], because a recession hits nearly every company at once.</p>
<p><mark>Diversification removes the risk you aren’t paid to take.</mark> The market risk that remains is the price of the stock market’s long-run return.</p>`,
            viz: { type: 'riskCurve' },
          },
          {
            h: 'Correlation: mixing things that zig and zag',
            body: `<p>Diversification works best with investments that do not move together. [[correlation]] measures this, from +1 (move in lockstep) to −1 (move in opposite directions).</p>
<p>Mix two assets 50/50 and slide their correlation. The lower it is, the smoother the combined ride, even though each asset is just as bumpy on its own.</p>`,
            viz: { type: 'correlation' },
          },
        ],
        quiz: [
          { q: 'Which risk can diversifying across many stocks remove?', choices: ['A single company failing', 'A market-wide recession', 'Inflation'], a: 0, why: 'Company-specific risk averages out across many holdings. Market-wide risk does not.' },
          { q: 'Two assets with a correlation near −1…', choices: ['Move in the same direction', 'Tend to move in opposite directions', 'Never move at all'], a: 1, why: 'Negative correlation means when one rises, the other tends to fall.' },
          { q: 'Adding more stocks to a portfolio reduces its risk…', choices: ['Without limit', 'Quickly at first, then levels off at market risk', 'Not at all'], a: 1, why: 'The first 20 to 30 holdings remove most company-specific risk. Market risk remains.' },
        ],
        takeaways: ['Diversification stops one failure from sinking you.', 'It removes company-specific risk, but not market risk.', 'Assets with low correlation smooth each other out.'],
      },
      {
        id: 'index-funds',
        title: 'Index funds and ETFs',
        hook: 'Why many investors stop trying to beat the market.',
        mins: 7,
        steps: [
          {
            h: 'Beating the market is hard',
            body: `<p>[[active-fund|Actively managed funds]] pay professionals to pick winners. [[passive-investing|Passive]] index funds simply buy the whole market at very low cost.</p>
<p>Every year, S&P Dow Jones Indices publishes SPIVA scorecards comparing active funds with their benchmarks. They have repeatedly found that most active funds trail their index over 10 to 15 years, largely because of fees.</p>
<p>Simulate 100 managers who are, on average, no better than the market and charge 1% a year.</p>`,
            predict: {
              q: 'In this simulation, managers have no special skill on average and charge 1% a year. After 15 years, roughly how many of 100 beat the index?',
              choices: ['About 50', 'About 30', 'About 5'],
              a: 1,
              why: 'Luck lets plenty win in any one year, but the 1% fee is a steady headwind. Over 15 years, only about 30 in 100 stay ahead, and it is hard to know in advance which ones.',
            },
            viz: { type: 'managers' },
          },
          {
            h: 'How an ETF works',
            body: `<p>An ETF owns a basket of investments and splits it into shares that trade on an exchange. Its price stays close to its [[nav]], the value of everything it holds.</p>
<p>A fund's fact sheet tells you the essentials: what it tracks, its expense ratio, how many holdings it has, and how closely it has followed its index. That last measure is its [[tracking-error]]. Explore an example fact sheet.</p>`,
            viz: { type: 'etfSheet' },
          },
          {
            h: 'Good signs and red flags',
            body: `<p>Choosing a broad index fund is mostly about a few checks: what it tracks, what it costs, and whether it trades easily. Sort these features.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'good', label: 'Good sign' },
                { k: 'red', label: 'Red flag' },
              ],
              items: [
                ['Expense ratio of 0.03% for a total-market index fund.', 'good', 'Very low costs leave almost all of the market’s return for you.'],
                ['An index fund charging 1.5% a year.', 'red', 'You can usually get the same index for a small fraction of that.'],
                ['Tracks a broad index of thousands of companies.', 'good', 'Broad coverage gives you diversification in a single fund.'],
                ['Average daily volume of 40 shares, with a wide bid-ask spread.', 'red', 'Thin trading means you lose more to the spread every time you buy or sell.'],
                ['Has trailed its index by about 0.04% a year.', 'good', 'Tiny tracking difference: it does what it promises.'],
                ['Promises 25% a year with no risk of loss.', 'red', 'No legitimate investment guarantees high returns without risk. This is a classic sign of fraud.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'A passive index fund aims to…', choices: ['Beat the market', 'Match the index it tracks, at low cost', 'Avoid all losses'], a: 1, why: 'It accepts the market’s return and keeps costs as low as possible.' },
          { q: 'Why do most active funds trail their index over long periods?', choices: ['Higher fees and trading costs, plus how hard it is to pick winners consistently', 'Index funds are given better prices', 'Active funds are not allowed to own large companies'], a: 0, why: 'Before costs, active managers as a group earn roughly the market’s return. After costs, the average manager must trail it.' },
          { q: "An ETF's market price stays close to…", choices: ['The value of the holdings it owns', 'The price of gold', 'Its manager’s forecast'], a: 0, why: 'Large institutions create and redeem ETF shares, which keeps the price close to the net asset value.' },
        ],
        takeaways: ['Most active funds trail their index over long periods, mainly because of costs.', 'Index funds and ETFs buy the whole market cheaply.', 'Check what a fund tracks, what it costs and how easily it trades.'],
      },
      {
        id: 'asset-allocation',
        title: 'Asset allocation and rebalancing',
        hook: 'Your stock and bond mix is your biggest decision.',
        mins: 8,
        steps: [
          {
            h: 'The stock and bond mix',
            body: `<p>Your [[asset-allocation]] is how you split money between stocks, bonds and cash. For a diversified investor, it drives most of how bumpy the ride is, far more than which particular funds you pick.</p>
<p>Slide the mix and watch expected return and risk change.</p>`,
            predict: {
              q: 'Moving from 100% stocks to 80% stocks and 20% bonds typically…',
              choices: ['Cuts return and risk by the same proportion', 'Cuts risk proportionally more than return', 'Cuts return proportionally more than risk'],
              a: 1,
              why: 'Because bonds and stocks are only loosely correlated, here risk falls about 19% while expected return falls only 10%.',
            },
            viz: { type: 'allocation' },
          },
          {
            h: 'Matching the mix to you',
            body: `<p>The right mix depends on your time horizon, your goals and your [[risk-tolerance]]. Money you need in two years belongs mostly in bonds and cash. Money for 30 years from now can ride out more swings.</p>
<p>Rules of thumb such as “110 minus your age in stocks” are only starting points. A [[target-date-fund]] does this automatically, shifting toward bonds as its target year nears.</p>`,
            viz: { type: 'glidePath' },
          },
          {
            h: 'Rebalancing',
            body: `<p>As markets move, your mix drifts. After a great year for stocks, a 60/40 portfolio might become 66/34: riskier than you chose.</p>
<p>[[rebalancing]] sells some of what rose and buys what lagged, back to your target. It is a built-in way to sell high and buy low. Many people rebalance once a year, or when the mix drifts by more than about 5 points.</p>`,
            viz: { type: 'rebalance' },
          },
        ],
        quiz: [
          { q: 'Asset allocation means…', choices: ['Choosing which single stock to buy', 'How you split money between stocks, bonds and cash', 'Guessing when the market will turn'], a: 1, why: 'It is the mix of asset classes, the biggest driver of a diversified portfolio’s risk.' },
          { q: 'After a big stock rally, a 60/40 portfolio drifts to 70/30. Rebalancing means…', choices: ['Buying more stocks', 'Selling some stocks and buying bonds to get back to 60/40', 'Selling everything'], a: 1, why: 'You trim what grew beyond its target and top up what fell behind.' },
          { q: 'Generally, a longer time horizon allows…', choices: ['A higher share of stocks', 'Only cash', 'A higher share of bonds'], a: 0, why: 'More time means more chances for good years to outweigh bad ones.' },
        ],
        takeaways: ['Your stock and bond mix drives most of your portfolio’s risk.', 'Choose it from your time horizon, goals and risk tolerance.', 'Rebalance to keep the risk you chose.'],
      },
      {
        id: 'staying-invested',
        title: 'Dollar-cost averaging and staying the course',
        hook: 'Simple habits that beat trying to time the market.',
        mins: 7,
        steps: [
          {
            h: 'Dollar-cost averaging',
            body: `<p>[[dollar-cost-averaging]] means investing the same amount on a fixed schedule, such as $300 every month, whatever the market is doing.</p>
<p>When prices fall, the same $300 buys more shares. So your average cost per share ends up below the average price. It also removes the stress of picking a perfect moment.</p>`,
            predict: {
              q: 'You invest $300 every month. Prices drop by half for a few months, then recover. Compared with the average price over the year, your average cost per share will be…',
              choices: ['Higher', 'Lower', 'Exactly the same'],
              a: 1,
              why: 'You bought many more shares in the cheap months, which pulls your average cost below the simple average of the prices.',
            },
            viz: { type: 'dca' },
          },
          {
            h: 'Time in the market beats timing the market',
            body: `<p>It is tempting to step aside when markets look scary. The problem is that the best days often come right after the worst ones, while fear is highest.</p>
<p>In this simulation, missing just a handful of the best days out of 20 years sharply cuts the result.</p>`,
            viz: { type: 'missedDays' },
          },
          {
            h: 'The emotional cycle',
            body: `<p>Markets move in cycles, and so do investors’ feelings. Excitement peaks near the top, when risk is highest. Panic peaks near the bottom, when the opportunity is greatest.</p>
<p>The [[behavior-gap]] is what investors lose by acting on those feelings. Press play and follow the cycle.</p>`,
            viz: { type: 'emotionCycle' },
          },
        ],
        quiz: [
          { q: 'Dollar-cost averaging means…', choices: ['Investing everything at the lowest price', 'Investing a fixed amount on a regular schedule', 'Only buying when the news is good'], a: 1, why: 'The schedule decides, not your feelings or forecasts.' },
          { q: 'Why is trying to sit out bad markets risky?', choices: ['The best days often come right after the worst, so you may miss the rebound', 'Markets never have bad days', 'Brokers charge extra for selling'], a: 0, why: 'Big up days cluster in turbulent periods. Missing a few of them can cost years of returns.' },
          { q: 'At the peak of excitement in a bull market, a disciplined investor typically…', choices: ['Borrows to buy more', 'Sticks to the plan and rebalances', 'Sells everything and waits'], a: 1, why: 'Rebalancing trims stocks that have run up, without trying to predict the top.' },
        ],
        takeaways: ['Investing a fixed amount regularly buys more shares when prices are low.', 'Missing a few of the best days can cost a lot, and they arrive when it feels worst.', 'A written plan protects you from the emotional cycle.'],
      },
    ],
  });
})();
