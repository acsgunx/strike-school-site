/* Technical Analysis in Depth, Unit 3 — Oscillators and sentiment: momentum and rate of change, the stochastic
   oscillator, and contrary opinion. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'oscillator', term: 'Oscillator', w: 'oscillator', def: 'An indicator that swings between extremes, or around a center line, below a price chart. It measures how stretched or how fast a move is, rather than its direction alone.' },
      { id: 'momentum-indicator', term: 'Momentum', w: 'momentum', def: 'Today’s close minus the close a set number of days ago. It measures the speed of a move, and it often turns before the price does.' },
      { id: 'rate-of-change', term: 'Rate of change (ROC)', w: 'rate of change', def: 'Momentum as a percentage: how much the price has changed, in percent, over a set number of days.' },
      { id: 'stochastic-oscillator', term: 'Stochastic oscillator', w: 'stochastic', def: 'Where today’s close sits within the range of the last 14 days, from 0 (at the low) to 100 (at the high). The line is called %K, and its 3-day average is %D.' },
      { id: 'contrary-opinion', term: 'Contrary opinion', w: 'contrary opinion', def: 'The idea that when nearly everyone agrees on the market’s direction, they have mostly acted on that view already, leaving few buyers (or sellers) to push it further.' },
      { id: 'put-call-ratio', term: 'Put/call ratio', w: 'put/call ratio', def: 'The number of put options traded divided by the number of calls. A high ratio means traders are buying protection (fear); a low one means they are buying upside bets (greed).' },
    ],
    'murphy'
  );

  SS.MURPHY_UNITS.push({
    n: 3,
    title: 'Oscillators and sentiment',
    blurb: 'Indicators that measure speed and stretch: momentum, the stochastic oscillator, and reading the crowd with contrary opinion.',
    lessons: [
      {
        id: 'mu-momentum',
        title: 'Momentum: the speed of a move',
        hook: 'A car slows down before it turns around. So do prices.',
        mins: 8,
        steps: [
          {
            h: 'Measuring speed, not price',
            body: `<p>The Technical Analysis course covered [[rsi|RSI]] and [[macd|MACD]]. Murphy starts the topic of [[oscillator|oscillators]] with the simplest one of all, [[momentum-indicator|momentum]]: today’s close minus the close a set number of days ago. If the price is rising faster and faster, momentum rises. If it is still rising but more slowly, momentum falls, often well before the price turns. [[rate-of-change|Rate of change]] is the same idea in percent.</p>
<p>Play the chart, then change the lookback.</p>`,
            predict: {
              q: 'A stock is still rising, but more slowly each week. Its momentum line is most likely…',
              choices: ['Falling, even though the price is rising', 'Rising faster', 'Exactly zero'],
              a: 0,
              why: 'Momentum measures the speed of the rise. Slower gains mean a smaller difference from N days ago, so the line falls while the price still climbs.',
            },
            viz: { type: 'momentumLine' },
          },
          {
            h: 'Three ways to read any oscillator',
            body: `<p>Murphy describes three main uses that apply to almost every oscillator. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Use',
              back: 'How it works',
              items: [
                ['Extremes', 'Overbought and oversold.', 'At an extreme reading, the move is stretched and may pause. It is a warning, not a sell or buy signal on its own.'],
                ['Divergence', 'Price and oscillator disagree.', 'A new price high with a lower oscillator high shows the push is weakening. Often the most valuable signal.'],
                ['Center-line crossings', 'Crossing zero or 50.', 'A cross above the middle line favors buying; a cross below favors selling, usually in the trend’s direction.'],
                ['Respect the trend', 'Strong trends stay extreme.', 'In a strong uptrend an oscillator can stay overbought for weeks. Use its signals mainly in the trend’s direction.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Momentum with a 10-day lookback is…', choices: ['Today’s close minus the close 10 days ago', 'The 10-day average price', 'The number of up days'], a: 0, why: 'It measures how far the price has traveled over the lookback.' },
          { q: 'Momentum often turns before the price because…', choices: ['A move slows down before it reverses', 'It uses future prices', 'It is random'], a: 0, why: 'Slowing gains shrink momentum while the price is still rising.' },
          { q: 'In a strong uptrend, an oscillator that stays overbought for weeks is…', choices: ['Normal; use it mainly for buy signals', 'A reason to sell immediately', 'Broken'], a: 0, why: 'Overbought readings are common in strong trends.' },
        ],
        takeaways: ['Momentum measures the speed of a move, not its level.', 'It often turns before the price does.', 'Read oscillators for extremes, divergence and center-line crossings, and respect the trend.'],
      },
      {
        id: 'mu-stochastics',
        title: 'The stochastic oscillator',
        hook: 'Where today’s close sits in the recent range says a lot about who is winning.',
        mins: 9,
        steps: [
          {
            h: 'Where did it close in its range?',
            body: `<p>George Lane’s [[stochastic-oscillator|stochastic oscillator]] rests on a simple observation: in uptrends, closes tend to sit near the top of the recent range; in downtrends, near the bottom. %K measures exactly that over the last 14 days: 0 means today closed at the 14-day low, 100 at the 14-day high. %D, a 3-day average of %K, is the slower signal line.</p>
<p>Drag the day slider and watch the 14-day box move with it.</p>`,
            predict: {
              q: 'Today’s close is exactly at the top of the last 14 days’ range. %K is…',
              choices: ['100', '50', '0'],
              a: 0,
              why: 'A close at the top of the range is 100% of the way up it.',
            },
            viz: { type: 'stochBuild' },
          },
          {
            h: 'Signals, and when they fail',
            body: `<p>The classic signals come from %K crossing %D in the extreme zones: a cross down above 80 suggests selling, and a cross up below 20 suggests buying. Murphy warns that these work best in sideways markets. In a strong trend the oscillator stays stretched, and signals against the trend keep failing.</p>
<p>Compare the same rules in two markets. A signal counts as working if the price moved its way over the next 10 days.</p>`,
            viz: { type: 'stochSignals' },
          },
        ],
        quiz: [
          { q: '%K near 0 means today’s close is…', choices: ['Near the low of the last 14 days', 'Near the high', 'Unchanged from yesterday'], a: 0, why: '0 is the bottom of the range.' },
          { q: '%D is…', choices: ['A 3-day average of %K', 'The daily volume', 'A 200-day moving average'], a: 0, why: 'It smooths %K into a slower signal line.' },
          { q: 'Stochastic signals work best in…', choices: ['Sideways, swinging markets', 'Strong trends', 'Any market equally'], a: 0, why: 'In strong trends the oscillator stays extreme, and counter-trend signals fail.' },
        ],
        takeaways: ['%K shows where the close sits in the 14-day range.', 'Signals: %K crossing %D above 80 or below 20.', 'In a strong trend, take only the signals in the trend’s direction.'],
      },
      {
        id: 'mu-contrary',
        title: 'Contrary opinion',
        hook: 'When everyone is already bullish, who is left to buy?',
        mins: 8,
        steps: [
          {
            h: 'When everyone agrees',
            body: `<p>[[contrary-opinion|Contrary opinion]] isn’t about always betting against the crowd. The crowd is usually right during the trend. The point is about extremes: when nearly everyone is bullish, they have mostly bought already, so there are few buyers left. When nearly everyone is bearish, the selling is mostly done.</p>
<p>Below, a simulated survey of market advisors tracks the price through a top and a bottom.</p>`,
            predict: {
              q: 'If 85% of advisors are bullish after a long rally, the most likely meaning is…',
              choices: ['Most buying has already happened, so upside may be limited', 'The rally will surely accelerate', 'Nothing at all'],
              a: 0,
              why: 'Extreme agreement means the crowd has already acted. It warns that a turn is likely, though not exactly when.',
            },
            viz: { type: 'sentimentCycle' },
          },
          {
            h: 'Ways to measure the crowd',
            body: `<p>Tap each card for a common sentiment gauge, from advisor surveys to the [[put-call-ratio]]. The VIX is covered in depth in the Options Trading course.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Gauge',
              back: 'What an extreme says',
              items: [
                ['Advisor surveys', 'Percent of newsletter writers who are bullish.', 'Very high readings come near tops; very low ones near bottoms.'],
                ['Put/call ratio', 'Puts traded divided by calls.', 'A high ratio means fear and hedging; a very low one means greed.'],
                ['The VIX', 'Expected volatility from options prices.', 'Spikes show panic, often near lows; very low readings show complacency.'],
                ['Cash levels', 'How much cash funds hold.', 'Lots of cash is fuel for buying; very little means they are fully invested.'],
                ['Magazine covers', 'When the story hits the mainstream.', 'By the time a trend is front-page news, most people have already acted on it.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Contrary opinion matters most when sentiment is…', choices: ['At an extreme', 'Neutral', 'Missing'], a: 0, why: 'During most of a trend, the crowd is right; extremes are the warning.' },
          { q: 'A very high put/call ratio suggests…', choices: ['Fear, which often appears near lows', 'Greed', 'Nothing'], a: 0, why: 'Traders are rushing to buy protection.' },
          { q: 'Sentiment extremes tell you…', choices: ['A turn is likely, but not exactly when', 'The exact day of the top', 'To always do the opposite of the crowd'], a: 0, why: 'Extremes can last a while; use price to time the turn.' },
        ],
        takeaways: ['The crowd is usually right during a trend and wrong at the extremes.', 'Extreme agreement means the buying (or selling) is mostly done.', 'Sentiment says a turn is near; price action says when.'],
      },
    ],
  });
})();
