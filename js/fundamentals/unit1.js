/* Fundamentals, Unit 1 — How the stock market works. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'stock', term: 'Stock (share)', w: 'stock', def: 'A unit of ownership in a company. Shareholders own a slice of its profits and assets, and usually get a vote on major decisions.', ex: 'Own 50,000 of 1,000,000 shares and you own 5% of the company.' },
      { id: 'shares-outstanding', term: 'Shares outstanding', w: 'shares outstanding', def: 'The total number of a company’s shares held by all investors.' },
      { id: 'ipo', term: 'IPO', w: 'initial public offering (IPO)', def: 'Initial public offering: the first time a company sells shares to the public. The money from an IPO goes to the company.' },
      { id: 'stock-exchange', term: 'Stock exchange', w: 'stock exchange', def: 'A marketplace that matches buyers and sellers of shares, such as the New York Stock Exchange or Nasdaq.' },
      { id: 'dividend', term: 'Dividend', w: 'dividend', def: 'A cash payment a company makes to shareholders out of its profits, usually quarterly in the US.', ex: 'A $0.50 quarterly dividend on 100 shares pays $50 every three months.' },
      { id: 'capital-gain', term: 'Capital gain', w: 'capital gain', def: 'The profit from selling an investment for more than you paid. A sale below your cost is a capital loss.' },
      { id: 'total-return', term: 'Total return', w: 'total return', def: 'Everything an investment earned: the price change plus any dividends or interest, usually shown as a percentage of what you paid.' },
      { id: 'market-cap', term: 'Market capitalization', w: 'market cap', def: 'The market value of a whole company: share price × shares outstanding.', ex: '$40 a share × 25 million shares = $1 billion market cap.' },
      { id: 'order-book', term: 'Order book', w: 'order book', def: 'The live list of buy orders (bids) and sell orders (asks) waiting at each price for a stock.' },
      { id: 'market-order', term: 'Market order', w: 'market order', def: 'An order to buy or sell right away at the best price currently available. Fast, but the price is not guaranteed.' },
      { id: 'limit-order', term: 'Limit order', w: 'limit order', def: 'An order to buy at or below, or sell at or above, a price you set. The price is guaranteed, but the order may never fill.' },
      { id: 'stop-order', term: 'Stop order', w: 'stop order', def: 'An order that becomes a market order once the price reaches your stop price. Often used to limit losses, but in a fast drop it can fill well below the stop.' },
      { id: 'slippage', term: 'Slippage', w: 'slippage', def: 'The difference between the price you expected and the price you actually got, often because a large order used up several price levels.' },
      { id: 'liquidity', term: 'Liquidity', w: 'liquidity', def: 'How easily you can buy or sell without moving the price. Liquid stocks have many traders, deep order books and tight spreads.' },
      { id: 'settlement', term: 'Settlement (T+1)', w: 'settlement', def: 'When cash and shares officially change hands after a trade. US stock trades settle one business day after the trade date.' },
      { id: 'index', term: 'Stock index', w: 'index', def: 'A number that tracks the combined value of a basket of stocks, used to measure a market or a part of it.' },
      { id: 'sp500', term: 'S&P 500', w: 'S&P 500', def: 'An index of about 500 large US companies, weighted by market capitalization. The most widely used gauge of the US stock market.' },
      { id: 'cap-weighted', term: 'Cap-weighted index', w: 'cap-weighted', def: 'An index where each company counts in proportion to its market cap, so the biggest companies move it the most.' },
      { id: 'price-weighted', term: 'Price-weighted index', w: 'price-weighted', def: 'An index where each company counts in proportion to its share price, regardless of company size. The Dow Jones Industrial Average works this way.' },
      { id: 'bull-market', term: 'Bull market', w: 'bull market', def: 'A long period of rising stock prices.' },
      { id: 'bear-market', term: 'Bear market', w: 'bear market', def: 'A fall of 20% or more from a recent peak.' },
      { id: 'correction', term: 'Correction', w: 'correction', def: 'A fall of 10% or more from a recent peak, but less than 20%.' },
      { id: 'drawdown', term: 'Drawdown', w: 'drawdown', def: 'How far an investment has fallen from its highest point so far, as a percentage.' },
      { id: 'asset-class', term: 'Asset class', w: 'asset class', def: 'A group of investments that behave alike, such as stocks, bonds, cash or real estate.' },
      { id: 'bond', term: 'Bond', w: 'bond', def: 'A loan you make to a government or company. It pays interest (the coupon) and returns your principal at maturity.' },
      { id: 'coupon', term: 'Coupon', w: 'coupon', def: 'The fixed interest a bond pays each year, as a percentage of its face value.', ex: 'A $1,000 bond with a 4% coupon pays $40 a year.' },
      { id: 'bond-yield', term: 'Yield', w: 'yield', def: 'The return a bond pays at its current market price. When bond prices fall, yields rise, and the other way around.' },
      { id: 'mutual-fund', term: 'Mutual fund', w: 'mutual fund', def: 'A pooled investment that buys many securities. Shares are bought and sold once a day at the closing price (net asset value).' },
      { id: 'etf', term: 'ETF', w: 'ETF', def: 'Exchange-traded fund: a pooled investment, often tracking an index, whose shares trade on an exchange throughout the day like a stock.' },
    ],
    'fundamentals'
  );

  SS.FUND_UNITS.push({
    n: 1,
    title: 'How the stock market works',
    blurb: 'What a share is, how trading works, what indexes measure, and the main kinds of investments.',
    lessons: [
      {
        id: 'what-is-a-stock',
        title: 'What is a stock?',
        hook: 'Owning a slice of a business, and the two ways it pays you.',
        mins: 7,
        steps: [
          {
            h: 'A company cut into slices',
            body: `<p>Picture a bakery, Maple Bakery, worth <b>$1,000,000</b>. Its owners split it into <b>1,000,000</b> equal pieces called shares, so each share is worth $1.</p>
<p>A [[stock]] is one of those pieces. Owning shares makes you a part-owner: you own a slice of the bakery's profits, its ovens and its cash, and you usually get a vote on big decisions.</p>
<p>Drag the slider to buy more of the bakery and watch your slice grow.</p>`,
            predict: {
              q: 'Maple Bakery has 1,000,000 shares. You buy 50,000. What do you own?',
              choices: ['50,000 loaves of bread', '5% of the company', 'A loan to the bakery'],
              a: 1,
              why: '50,000 ÷ 1,000,000 = 5%. A share is a slice of ownership, so you own 5% of everything the bakery owns and earns.',
            },
            viz: { type: 'slices', shares: 50000 },
          },
          {
            h: 'Why companies sell shares',
            body: `<p>To grow, a company needs money for new stores, factories or research. It can borrow it, or it can sell slices of ownership.</p>
<p>The first time a company sells shares to the public is its [[ipo]]. That money goes to the company. After that, the shares trade between investors on a [[stock-exchange]], and the company is not part of those trades.</p>
<p><mark>Most of what you see on a stock chart is investors trading with each other.</mark></p>`,
            viz: { type: 'ipoFlow' },
          },
          {
            h: 'Two ways a stock pays you',
            body: `<p>You make money from a stock in two ways.</p>
<p>First, a [[capital-gain]]: you sell for more than you paid. Second, a [[dividend]]: some companies pay out part of their profits in cash, usually every quarter.</p>
<p>Together they make your [[total-return]]. Try a stock bought at $50 and held for 5 years.</p>`,
            viz: { type: 'totalReturn' },
          },
          {
            h: 'Market cap: the price of the whole company',
            body: `<p>A share price alone tells you nothing about how big a company is. What matters is the [[market-cap]]: <b>share price × [[shares-outstanding]]</b>.</p>
<p>A $500 stock can belong to a smaller company than a $50 stock, if the $50 company has far more shares.</p>`,
            predict: {
              q: 'Company A: $500 a share, 10 million shares. Company B: $50 a share, 2 billion shares. Which is bigger?',
              choices: ['Company A, because its share price is higher', 'Company B', 'They are the same size'],
              a: 1,
              why: 'A is worth $500 × 10 million = $5 billion. B is worth $50 × 2 billion = $100 billion, twenty times bigger.',
            },
            viz: { type: 'marketCap' },
          },
        ],
        quiz: [
          { q: 'A company has 50 million shares. You own 500,000 of them. What share of the company do you own?', choices: ['0.1%', '1%', '10%'], a: 1, why: '500,000 ÷ 50,000,000 = 0.01, or 1%.' },
          { q: 'You buy shares from another investor on an exchange. How much of your money goes to the company?', choices: ['All of it', 'None; it goes to the seller', 'Half of it'], a: 1, why: 'After the IPO, trades are between investors. The company only gets money when it issues new shares.' },
          { q: 'A stock costs $40 and the company has 25 million shares. What is its market cap?', choices: ['$1 billion', '$40 million', '$625 million'], a: 0, why: '$40 × 25,000,000 = $1,000,000,000.' },
          { q: "A stock's total return is made of…", choices: ['Price change plus dividends', 'Interest plus principal', 'Revenue plus profit'], a: 0, why: 'You earn from the price going up and from any cash the company pays out.' },
        ],
        takeaways: ['A share is a slice of ownership in a real business.', 'Companies raise money in an IPO; after that, investors trade with each other.', 'Market cap (price × shares), not share price, tells you how big a company is.'],
      },
      {
        id: 'how-trading-works',
        title: 'How buying and selling works',
        hook: 'The order book, why prices move, and which order to use.',
        mins: 8,
        steps: [
          {
            h: 'The order book',
            body: `<p>An exchange is a matching machine. Buyers post [[bid|bids]]: the price they are willing to pay. Sellers post [[ask|asks]]: the price they want. All of these waiting orders form the [[order-book]].</p>
<p>The highest bid and the lowest ask are the quote you see in your app. The gap between them is the [[bid-ask]].</p>
<p>Send a market order and watch it eat through the sell orders. A big order can use up several price levels and pay more on average. That extra cost is called [[slippage]].</p>`,
            predict: {
              q: 'You send a market order to buy 500 shares, but only 200 are offered at the lowest ask. What happens?',
              choices: ['It waits until 500 shares appear at that price', 'You buy 200 at the lowest ask, and the rest at higher asks', 'It is canceled'],
              a: 1,
              why: 'A market order takes whatever is available, level by level, until it is filled. Big orders in thin markets pay more. That extra cost is called slippage.',
            },
            viz: { type: 'orderBook' },
          },
          {
            h: 'Why prices move',
            body: `<p>The price is simply the last trade. It moves when one side is more eager than the other.</p>
<p>After good news, more buyers show up and accept higher asks, so trades print at higher prices. After bad news, sellers hit lower bids. When nothing happens, buyers and sellers roughly balance and the price drifts.</p>
<p>Release some news and watch the pressure gauge and the price.</p>`,
            viz: { type: 'newsMarket' },
          },
          {
            h: 'Market, limit and stop orders',
            body: `<p>A [[market-order]] fills right away at the best available price. It is fast, but the price is not guaranteed.</p>
<p>A [[limit-order]] sets your price: buy at this price or lower, or sell at this price or higher. The price is guaranteed, but it may never fill.</p>
<p>A [[stop-order]] waits until the price falls to your stop, then becomes a market order. It is often used as a stop-loss. <mark>In a sudden gap down, a stop can fill far below your stop price.</mark></p>`,
            viz: { type: 'orderTypes' },
          },
          {
            h: 'The trading day',
            body: `<p>The main US exchanges hold their regular session from <b>9:30 a.m. to 4:00 p.m. Eastern time</b>, Monday to Friday. Many brokers also offer pre-market and after-hours trading, when fewer people trade. [[liquidity|Liquidity]] is thinner then, so spreads are wider.</p>
<p>Trading is busiest right after the open and just before the close. Companies often report earnings outside regular hours, so big moves can happen while most people cannot trade.</p>
<p>When you buy, the shares and cash officially change hands one business day later. This is called [[settlement]].</p>`,
            viz: { type: 'tradingDay' },
          },
        ],
        quiz: [
          { q: 'You want to buy only if the price drops to $48 or lower. Which order fits?', choices: ['A market order', 'A limit order at $48', 'A stop order at $48'], a: 1, why: 'A buy limit at $48 only fills at $48 or better.' },
          { q: 'The best bid is $20.00 and the best ask is $20.05. A small market sell order fills at about…', choices: ['$20.05', '$20.00', '$20.025'], a: 1, why: 'Selling at market means accepting the highest bid.' },
          { q: 'You set a stop-loss to sell at $45. Overnight bad news hits, and the stock opens at $40. Your order fills near…', choices: ['$45', '$40', 'It does not fill'], a: 1, why: 'The stop triggers at the open and becomes a market order, which fills at the price available then: about $40.' },
          { q: 'Why can after-hours trading be riskier?', choices: ['Fewer traders, so spreads are wider and prices jump more', 'Trades are not real', 'Orders cannot be canceled'], a: 0, why: 'Thin trading means less liquidity: each order moves the price more.' },
        ],
        takeaways: ['Prices come from matching bids and asks in the order book.', 'Market orders are fast; limit orders control price; stops can slip in gaps.', 'Regular US hours are 9:30 a.m. to 4:00 p.m. Eastern; trades settle the next business day.'],
      },
      {
        id: 'indexes',
        title: 'Indexes and market cycles',
        hook: 'What the S&P 500 measures, and why drops are normal.',
        mins: 7,
        steps: [
          {
            h: 'One number for the whole market',
            body: `<p>An [[index]] tracks a basket of stocks with a single number. The [[sp500]] follows about 500 large US companies. The Nasdaq Composite follows the thousands of stocks listed on Nasdaq, with a heavy tilt to technology.</p>
<p>The S&P 500 is [[cap-weighted]]: bigger companies count for more. Pick a company below and move its price.</p>`,
            predict: {
              q: 'In a market-cap-weighted index, which move shifts the index more?',
              choices: ['The biggest company rising 10%', 'The smallest company rising 10%', 'Both shift it equally'],
              a: 0,
              why: 'Each company counts in proportion to its size. A giant with 45% of the index moves it 4.5% when it rises 10%. A company with 1.5% moves it only 0.15%.',
            },
            viz: { type: 'indexWeights', method: 'cap' },
          },
          {
            h: 'Not every index weights by size',
            body: `<p>The Dow Jones Industrial Average is older and works differently. It is [[price-weighted]]: it adds up share prices, so a $600 stock matters more than a $60 stock, whatever the size of the company.</p>
<p>Switch between the two methods. Watch Blue Harbor, a small company with a high share price, jump to the top of the price-weighted list.</p>`,
            viz: { type: 'indexWeights', method: 'price' },
          },
          {
            h: 'Bulls, bears and corrections',
            body: `<p>Markets rise over long periods, but never in a straight line. A fall of 10% from a peak is called a [[correction]]. A fall of 20% or more is a [[bear-market]]. A long climb is a [[bull-market]].</p>
<p>The bottom chart shows the [[drawdown]]: how far the index sits below its last high. Run a few simulated 30-year periods and count the drops along the way.</p>
<p><mark>Drops are the price of the long-run gains, not a sign that something is broken.</mark></p>`,
            viz: { type: 'drawdown' },
          },
        ],
        quiz: [
          { q: 'The S&P 500 gives each company a weight based on its…', choices: ['Share price', 'Market cap', 'Number of employees'], a: 1, why: 'It is a cap-weighted index, so bigger companies count for more.' },
          { q: 'A fall of 20% or more from a recent peak is usually called…', choices: ['A correction', 'A bear market', 'A dividend'], a: 1, why: 'A correction is 10% or more; a bear market is 20% or more.' },
          { q: 'The S&P 500 rises 1% today. That means…', choices: ['Every stock in it rose 1%', 'The size-weighted average of its stocks rose about 1%', 'The biggest company rose 1%'], a: 1, why: 'Some stocks rose more, some fell. The index shows the weighted result.' },
        ],
        takeaways: ['An index tracks a whole basket of stocks with one number.', 'In cap-weighted indexes like the S&P 500, the biggest companies move it most.', 'Corrections (−10%) and bear markets (−20%) happen regularly on the way up.'],
      },
      {
        id: 'asset-classes',
        title: 'Stocks, bonds, cash and funds',
        hook: 'The main things you can invest in, and how they trade off risk and return.',
        mins: 8,
        steps: [
          {
            h: 'The risk ladder',
            body: `<p>Each [[asset-class]] offers a different deal. Stocks are ownership: the highest long-run returns, with the biggest swings. Bonds are loans: steadier, with lower returns. Cash is the steadiest of all, but it barely grows.</p>
<p>Higher returns usually come with bigger swings, but not every risky asset is rewarded. Tap each asset to read about it.</p>`,
            viz: { type: 'riskLadder' },
          },
          {
            h: 'How a bond works',
            body: `<p>When you buy a [[bond]], you lend money. A 10-year, $1,000 bond with a 4% [[coupon]] pays you $40 a year, then returns your $1,000 at the end.</p>
<p>If interest rates rise, new bonds pay more than yours, so yours is worth less to a buyer. <mark>Bond prices and interest rates move in opposite directions.</mark> That is why a bond's [[bond-yield]] rises when its price falls.</p>`,
            predict: {
              q: 'You own a bond paying 4%. New bonds now pay 6%. What happens to the price of your bond?',
              choices: ['It rises', 'It falls', 'It stays at $1,000'],
              a: 1,
              why: 'No one will pay full price for $40 a year when new bonds pay $60. Your bond’s price falls until its yield matches the market.',
            },
            viz: { type: 'bondSeesaw' },
          },
          {
            h: 'Funds: buy the whole basket',
            body: `<p>Picking single stocks is hard, and one bad pick can hurt a lot. Funds solve this by pooling money from many investors to buy hundreds of securities at once.</p>
<p>A [[mutual-fund]] trades once a day at the closing price. An [[etf]] trades on an exchange all day, like a stock. Many of both simply track an index, such as the S&P 500.</p>
<p>Put money into an index fund and see where it goes.</p>`,
            viz: { type: 'fundBasket' },
          },
        ],
        quiz: [
          { q: 'Buying a bond means you are…', choices: ['Buying part of the company', 'Lending money to the issuer', 'Buying an option'], a: 1, why: 'A bond is a loan. You receive interest and your principal back.' },
          { q: 'Interest rates rise. Prices of existing bonds generally…', choices: ['Rise', 'Fall', 'Stay the same'], a: 1, why: 'Older bonds pay less than new ones, so buyers pay less for them.' },
          { q: 'What is a key difference between an ETF and a traditional mutual fund?', choices: ['ETFs trade throughout the day on an exchange', 'ETFs hold only one stock', 'Mutual funds cannot hold stocks'], a: 0, why: 'Mutual funds are priced once a day after the close; ETFs trade like stocks all day.' },
          { q: 'Which has historically had the highest long-run return, and the largest swings?', choices: ['Cash', 'Government bonds', 'Stocks'], a: 2, why: 'Stocks have rewarded long-term owners most, but with the deepest drops along the way.' },
        ],
        takeaways: ['Stocks are ownership, bonds are loans, cash is steady but slow.', 'Bond prices move opposite to interest rates.', 'Funds and ETFs let you own a whole basket in one purchase.'],
      },
    ],
  });
})();
