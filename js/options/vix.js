/* Strike School — Options course, Unit 6: the VIX and market volatility. Pushes onto SS.UNITS from lessons.js. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms([
    { id: 'vix', term: 'VIX (Cboe Volatility Index)', w: 'VIX', def: 'The market’s expectation of S&P 500 volatility over the next 30 days, calculated from S&P 500 option prices and quoted as an annualized percentage. Often called the fear gauge.', ex: 'VIX 20 → about ±1.26% per day, ±5.8% per month (one standard deviation).' },
    { id: 'rule-of-16', term: 'Rule of 16', w: 'rule of 16', def: 'A shortcut for turning the VIX into a daily move: divide by 16 (because √252 ≈ 16). VIX 24 means the market expects about ±1.5% a day.' },
    { id: 'realized-volatility', term: 'Realized volatility', w: 'realized volatility', def: 'How much prices actually moved over a past period, annualized. The VIX is a forecast; realized volatility is the result.' },
    { id: 'variance-risk-premium', term: 'Variance risk premium', w: 'variance risk premium', def: 'The usual gap between implied volatility, such as the VIX, and the realized volatility that follows. Investors pay extra for protection, so implied volatility is usually higher.' },
    { id: 'vix-term-structure', term: 'VIX term structure', w: 'VIX term structure', def: 'The curve of VIX futures prices by expiration. Usually upward sloping (contango) when markets are calm, and downward sloping (backwardation) during panics.' },
    { id: 'roll-decay', term: 'Roll decay', w: 'roll decay', def: 'The steady loss suffered by funds that hold VIX futures in contango: they keep selling cheaper expiring futures and buying pricier later ones, which then drift down toward the spot VIX.' },
  ], 'options');

  SS.UNITS.push({
    n: 6,
    title: 'The VIX and market volatility',
    blurb: 'What the fear gauge measures, how it moves with stocks, what it does to option prices, how VIX futures and funds behave, and where to find volatility indexes worldwide.',
    lessons: [
      {
        id: 'vix-basics',
        title: 'What the VIX measures',
        hook: 'One number for how much the market expects to move.',
        mins: 9,
        steps: [
          {
            h: 'The market’s fear gauge',
            body: `<p>The [[vix]] is the market's own forecast of how much the S&P 500 will move over the next 30 days. It is not a guess by an analyst. It is worked out from the prices traders pay for S&P 500 options, so it rises when they rush to buy protection.</p>
<p>The number is an annual percentage. To get the expected daily move, use the [[rule-of-16]]: divide by 16. For a week, divide by about 7.2, and for a month by about 3.5. Slide the VIX and watch the S&P's expected ranges stretch.</p>`,
            predict: {
              q: 'The VIX is 32. Roughly how big a daily move is the S&P 500 priced for?',
              choices: ['About ±2%', 'About ±32%', 'About ±0.2%'],
              a: 0,
              why: '32 ÷ 16 = 2. The VIX is annualized, so a VIX of 32 means about ±2% on a typical day, not ±32%.',
            },
            viz: { type: 'vixMove' },
          },
          {
            h: 'Built from option prices',
            body: `<p>The VIX doesn't come from any single option. Cboe takes a whole strip of out-of-the-money S&P 500 puts and calls, weights each by 1 ÷ strike², and turns them into one number for expected variance. Its square root is the VIX.</p>
<p>Because of that weighting, and because investors pay extra for crash protection, the downside puts carry most of the weight. Raise the put demand and watch the VIX climb even with at-the-money volatility unchanged.</p>`,
            viz: { type: 'vixBuild' },
          },
          {
            h: 'Reading the levels',
            body: `<p>The VIX has averaged a little under 20 over the long run. Below about 15 the market is calm, 20 to 30 is uneasy, above 30 is stressed, and above 40 has meant panic.</p>
<p>A few real landmarks: a record low close of 9.14 in November 2017; February 5, 2018, when it more than doubled in one day; a record close of 82.69 on March 16, 2020; and an intraday high of 89.53 in October 2008. Watch the needle sweep through them.</p>`,
            viz: { type: 'vixLevels' },
          },
        ],
        quiz: [
          { q: 'The VIX measures…', choices: ['The expected volatility of the S&P 500 over the next 30 days', 'The S&P 500’s price', 'Last month’s trading volume'], a: 0, why: 'It is forward-looking, implied from option prices.' },
          { q: 'With the VIX at 20, the expected one-month move is about…', choices: ['±5.8%', '±20%', '±1.3%'], a: 0, why: '20 ÷ √12 ≈ 5.8%. ±1.3% is the daily figure.' },
          { q: 'Why do put prices drive the VIX so much?', choices: ['Investors pay up for downside protection, and lower strikes get more weight', 'Calls are not used at all', 'Puts are always cheaper'], a: 0, why: 'Both the 1 ÷ K² weighting and the demand for protection tilt the VIX toward puts.' },
        ],
        takeaways: ['The VIX is the market’s 30-day volatility forecast for the S&P 500.', 'Divide by 16 for the expected daily move, by about 3.5 for a month.', 'Below 15 is calm, above 30 is stressed, above 40 is panic.'],
      },
      {
        id: 'vix-behavior',
        title: 'How the VIX behaves',
        hook: 'It jumps when stocks fall, fades when they calm, and usually overestimates.',
        mins: 10,
        steps: [
          {
            h: 'Stairs up, elevator down',
            body: `<p>The VIX moves opposite to stocks, and lopsidedly. Rallies grind it down slowly. Selloffs make it jump, because traders scramble for puts. Traders say stocks take the stairs up and the elevator down; the VIX does the reverse.</p>
<p>It also snaps back. A spike rarely lasts, because fear fades and option prices settle. Replay a simulated year with a sharp selloff in the middle.</p>`,
            viz: { type: 'vixSeesaw' },
          },
          {
            h: 'Insurance usually costs more than the damage',
            body: `<p>The VIX is a forecast, so you can check it against what actually happened: the [[realized-volatility]] over the following month. Most of the time the VIX turns out too high. That gap is the [[variance-risk-premium]], the extra investors pay for protection.</p>
<p>It is why option sellers earn money on average, and why they get hurt badly when a calm market suddenly breaks. Green shows when the VIX overestimated, red when it underestimated.</p>`,
            viz: { type: 'vixPremium' },
          },
          {
            h: 'What the VIX does to option prices',
            body: `<p>The VIX is essentially the [[iv]] of the S&P 500, and an at-the-money option's price is roughly proportional to implied volatility. So when the VIX doubles, at-the-money S&P options roughly double in price too. That sensitivity is [[vega]].</p>
<p>Slide the VIX and watch a 30-day option on an S&P 500 fund at $500 reprice.</p>`,
            predict: {
              q: 'The VIX jumps from 15 to 30 while the S&P is unchanged. An at-the-money 30-day S&P option’s price roughly…',
              choices: ['Doubles', 'Stays the same', 'Halves'],
              a: 0,
              why: 'At the money, the price is about 0.4 × price × IV × √time, so doubling IV roughly doubles the premium.',
            },
            viz: { type: 'vixOptionPrice' },
          },
        ],
        quiz: [
          { q: 'On a day the S&P 500 falls 4%, the VIX most likely…', choices: ['Jumps sharply', 'Falls', 'Does not change'], a: 0, why: 'Selloffs send investors to buy puts, which lifts implied volatility.' },
          { q: 'Most of the time, the VIX compared with the volatility that follows is…', choices: ['Higher', 'Lower', 'Exactly equal'], a: 0, why: 'That gap is the variance risk premium, the price of insurance.' },
          { q: 'When the VIX is high, options are…', choices: ['Expensive, which favors defined-risk selling over buying', 'Cheap, which favors buying', 'Unaffected'], a: 0, why: 'High implied volatility means rich premiums; selling with defined risk collects them, with small size.' },
        ],
        takeaways: ['The VIX rises fast in selloffs and fades slowly in recoveries.', 'It usually overestimates the volatility that follows, until a shock.', 'At-the-money option prices move roughly in proportion to the VIX.'],
      },
      {
        id: 'vix-products',
        title: 'VIX futures, funds and indexes worldwide',
        hook: 'You can’t buy the VIX itself, and the products that track it leak value.',
        mins: 10,
        steps: [
          {
            h: 'The VIX futures curve',
            body: `<p>You cannot buy the VIX index. What trades are VIX futures, which bet on where the VIX will be at each expiration. Plot them by month and you get the [[vix-term-structure]].</p>
<p>When markets are calm, the curve slopes up (contango): traders expect calm to end eventually. In a panic it flips to slope down (backwardation): they expect the panic to fade. An inverted curve is a classic stress signal; many traders watch the VIX against the 3-month VIX (VIX3M), and a ratio above 1 means stress.</p>`,
            viz: { type: 'vixCurve' },
          },
          {
            h: 'Why VIX funds bleed',
            body: `<p>Funds and notes that track the VIX hold short-term futures and keep rolling them. In contango, they keep buying a future that sits above the spot VIX, and it drifts down toward spot as it ages. That steady leak is [[roll-decay]], often 5–10% a month in calm markets.</p>
<p>Real examples: VXX has lost more than 99% of its value over its life, and the inverse note XIV lost about 96% in one evening in February 2018 and was shut down. Replay a simulated year.</p>`,
            predict: {
              q: 'Over a year, the spot VIX ends slightly higher than it started, with one spike in between. A fund holding short-term VIX futures most likely…',
              choices: ['Lost a large part of its value', 'Rose about as much as the VIX', 'Stayed flat'],
              a: 0,
              why: 'Most days are in contango, so roll decay compounds. A spike helps briefly, but rarely makes up for months of bleeding.',
            },
            viz: { type: 'vixRoll' },
          },
          {
            h: 'Volatility indexes around the world',
            body: `<p>Many markets publish their own fear gauge, built the same way from their index options. Use them to compare stress across regions; a spike that starts in one market often spreads.</p>
<p>Each index links to its official publisher and, where available, to its chart on TradingView. Some markets, like Singapore, have no official volatility index; there, traders watch the VIX and nearby Asian gauges.</p>`,
            viz: { type: 'vixWorld' },
          },
        ],
        quiz: [
          { q: 'In a calm market, VIX futures usually trade…', choices: ['Above the spot VIX (contango)', 'Below the spot VIX', 'Exactly at the spot VIX'], a: 0, why: 'The curve slopes up when the market expects calm to end eventually.' },
          { q: 'Why do VIX funds lose value over time in calm markets?', choices: ['Roll decay: they keep buying pricier futures that drift down to spot', 'Management fees alone', 'The VIX always falls'], a: 0, why: 'In contango, every roll locks in a small loss, and it compounds.' },
          { q: 'An inverted VIX futures curve (backwardation) signals…', choices: ['Market stress', 'Complete calm', 'A holiday'], a: 0, why: 'Spot above futures means fear now, with the market expecting it to fade.' },
        ],
        takeaways: ['You trade VIX futures and options, not the VIX itself.', 'Contango is normal; backwardation signals stress.', 'VIX funds are short-term tools: roll decay drains them over time.'],
      },
    ],
  });
})();
