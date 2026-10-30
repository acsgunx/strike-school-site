/* Technical Analysis, Unit 1 — Reading price charts. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'technical-analysis', term: 'Technical analysis', w: 'technical analysis', def: 'Studying price charts and trading volume to judge supply, demand and the odds of a move, rather than studying the business itself.' },
      { id: 'fundamental-analysis', term: 'Fundamental analysis', w: 'fundamental analysis', def: 'Judging what a business is worth from its financial statements, competitive position and future cash flows.' },
      { id: 'random-walk', term: 'Random walk', w: 'random walk', def: 'A path where each step is up or down by chance. Random walks often look as if they have trends and patterns even though none are real.' },
      { id: 'candlestick', term: 'Candlestick', w: 'candlestick', def: 'A chart symbol for one period showing the open, high, low and close. The thick body spans open to close; thin wicks reach the high and low.', ex: 'A green candle closed above its open; a red one closed below it.' },
      { id: 'ohlc', term: 'OHLC', w: 'OHLC', def: 'Open, high, low, close: the four prices that summarize trading in one period.' },
      { id: 'wick', term: 'Wick (shadow)', w: 'wick', def: 'The thin line above or below a candle body, showing how far price traveled before being pushed back.' },
      { id: 'candle-body', term: 'Candle body', w: 'body', def: 'The thick part of a candle, from the open to the close. A long body means one side clearly won the period.' },
      { id: 'trading-volume', term: 'Volume (shares)', w: 'volume', def: 'The number of shares traded in a period. High volume means many participants; low volume means few.' },
      { id: 'obv', term: 'On-balance volume (OBV)', w: 'on-balance volume (OBV)', def: 'A running total that adds the day’s volume when price closes up and subtracts it when price closes down, to show whether volume is flowing in or out.' },
      { id: 'divergence', term: 'Divergence', w: 'divergence', def: 'When price and an indicator disagree, such as price making a new high while the indicator does not. Often an early sign that a move is losing strength.' },
      { id: 'timeframe', term: 'Timeframe', w: 'timeframe', def: 'How much time each candle covers: one minute, one day, one week. Longer timeframes show the bigger picture with less noise.' },
      { id: 'log-scale', term: 'Logarithmic scale', w: 'logarithmic scale', def: 'A chart scale where equal percentage moves take equal vertical space, so a move from $10 to $20 looks the same size as $100 to $200.' },
    ],
    'technical'
  );

  SS.TECH_UNITS.push({
    n: 1,
    title: 'Reading price charts',
    blurb: 'What technical analysis is, how to read candlesticks and volume, and how timeframe and scale change the picture.',
    lessons: [
      {
        id: 'what-is-ta',
        title: 'What technical analysis is',
        hook: 'Reading supply and demand from the chart, and an honest look at what it can and cannot do.',
        mins: 7,
        steps: [
          {
            h: 'Reading the chart itself',
            body: `<p>[[fundamental-analysis]] asks what a business is worth. [[technical-analysis]] studies the price chart itself: where buyers and sellers have been active, which way prices are trending, and how strong the move is.</p>
<p>Watch a chart draw itself, then see what a technical analyst would point out. Every term on the chart gets its own lesson in this course.</p>`,
            viz: { type: 'taAnnotate' },
          },
          {
            h: 'Three core ideas',
            body: `<p>Technical analysis rests on three ideas. Tap each card to see the idea and its limit.</p>`,
            viz: {
              type: 'flipCards',
              front: 'The idea',
              back: 'Why it might work, and its limit',
              items: [
                ['Price reflects information', 'News, expectations and fear all show up in what people pay.', 'The chart is a record of every buyer and seller. It does not tell you why they acted.'],
                ['Prices move in trends', 'Moves tend to continue for a while before reversing.', 'Researchers have documented momentum and trend-following effects across many markets, but trends end without warning.'],
                ['History rhymes', 'Fear and greed repeat, so chart shapes repeat.', 'Crowd behavior does repeat, but a shape that worked before can fail the next time.'],
                ['Not a crystal ball', 'A chart gives odds, never certainty.', 'Its real strength is planning: where you are wrong, how much you risk, and where you get out.'],
              ],
            },
          },
          {
            h: 'An honest test: is it random?',
            body: `<p>Here is the catch every technician must face. Our brains find patterns everywhere, even in pure chance.</p>
<p>Each chart below is a [[random-walk]] built from coin flips. Yet you will see trends, support levels and familiar shapes. <mark>A pattern only matters if it shows up more often than chance would produce.</mark> That is why later lessons focus on confirmation and risk control, not prediction.</p>`,
            predict: {
              q: 'Four charts are about to appear. Which one shows a real, meaningful trend?',
              choices: ['Chart A', 'Chart C', 'None of them: all four are random coin flips', 'All of them'],
              a: 2,
              why: 'Every chart is generated by flipping a coin each day. Any trend or pattern you see is chance, which is exactly why technical signals need evidence and risk control.',
            },
            viz: { type: 'randomPatterns' },
          },
        ],
        quiz: [
          { q: 'Technical analysis mainly studies…', choices: ['Price and volume on a chart', 'Financial statements', 'Management interviews'], a: 0, why: 'It reads supply and demand from the chart rather than from the business.' },
          { q: 'Why did the random charts matter?', choices: ['Chance alone creates trends and patterns that look meaningful', 'Random charts always go up', 'They prove charts never work'], a: 0, why: 'Before trusting a pattern, ask whether it beats what randomness would produce.' },
          { q: 'Where is technical analysis most useful, even for skeptics?', choices: ['Planning entries, exits and risk', 'Guaranteeing profits', 'Valuing a company'], a: 0, why: 'Charts give clear levels for where an idea is wrong and how much to risk.' },
        ],
        takeaways: ['Technical analysis reads supply and demand from price and volume.', 'It gives odds, never certainty, and chance alone creates convincing patterns.', 'Its most reliable use is planning risk: where you are wrong and how much you can lose.'],
      },
      {
        id: 'candlesticks',
        title: 'Line, bar and candlestick charts',
        hook: 'Three ways to draw the same prices, and how to read a candle.',
        mins: 7,
        steps: [
          {
            h: 'Same prices, three pictures',
            body: `<p>A line chart connects each day's closing price. It is clean but hides what happened during the day.</p>
<p>A bar chart and a [[candlestick]] chart both show all four [[ohlc]] prices: open, high, low and close. Candles are the most popular because the color and the body make each day's winner obvious. Switch between them, and drag across the chart to read each day.</p>`,
            viz: { type: 'chartTypes' },
          },
          {
            h: 'Anatomy of a candle',
            body: `<p>The [[candle-body|body]] spans the open and the close. Green means it closed higher than it opened: buyers won. Red means it closed lower: sellers won.</p>
<p>The [[wick|wicks]] show how far price traveled before being pushed back. A long upper wick means buyers pushed up but sellers drove it back down. Move the four prices and watch the candle change.</p>`,
            viz: { type: 'candleAnatomy' },
          },
          {
            h: 'Watch a candle being born',
            body: `<p>Every candle is a summary of a whole day of trading. On the left, watch the price move tick by tick through the day. On the right, the candle grows as it happens: the wicks stretch to each new high and low, and the body follows the current price.</p>
<p>Try each kind of day.</p>`,
            predict: {
              q: 'A stock opens at $50, rallies to $54, then falls back to close at $50.20. What does the candle look like?',
              choices: ['A tall green body', 'A small body with a long upper wick', 'A long lower wick'],
              a: 1,
              why: 'Open and close are close together, so the body is small. The trip to $54 that was rejected leaves a long upper wick, a shape called a shooting star.',
            },
            viz: { type: 'candleBirth' },
          },
        ],
        quiz: [
          { q: 'A candle with a long red body means…', choices: ['It closed far below where it opened', 'Volume was high', 'It closed far above the open'], a: 0, why: 'Red means the close was below the open, and a long body means by a lot.' },
          { q: 'A long lower wick shows that…', choices: ['Sellers pushed price down, but buyers pushed it back up', 'Price never moved', 'Buyers controlled the whole day'], a: 0, why: 'The wick marks how low price went before it was rejected.' },
          { q: 'What does a line chart leave out?', choices: ['The open, high and low of each day', 'The closing prices', 'The dates'], a: 0, why: 'A line chart usually connects only the closes.' },
        ],
        takeaways: ['Candles show open, high, low and close at a glance.', 'The body shows who won the period; the wicks show rejected prices.', 'Each candle summarizes all the trading in its period.'],
      },
      {
        id: 'volume',
        title: 'Volume: the fuel behind moves',
        hook: 'Why moves on heavy trading count for more.',
        mins: 7,
        steps: [
          {
            h: 'Volume shows conviction',
            body: `<p>[[trading-volume|Volume]] is the number of shares traded. It sits in bars below the price chart. A price move on heavy volume means many participants agreed. A move on light volume means few did.</p>
<p>Traders compare each day with its recent average. Drag across the chart: days with more than twice the 20-day average are outlined.</p>`,
            viz: { type: 'volumeChart' },
          },
          {
            h: 'Volume confirms breakouts',
            body: `<p>When price breaks above a ceiling it has failed at before, volume is a lie detector. A surge in volume suggests real buyers are behind the move. A breakout on thin volume often fails and falls back.</p>
<p>Compare the two cases. The price action before the breakout is identical.</p>`,
            viz: { type: 'volumeConfirm' },
          },
          {
            h: 'On-balance volume',
            body: `<p>[[obv]] keeps a running total: add the day's volume when price closes up, subtract it when price closes down. Rising OBV suggests buying pressure; falling OBV suggests selling pressure.</p>
<p>Watch for a [[divergence]]. Here price keeps making new highs, but OBV does not, a sign the rally is running on fewer and fewer buyers.</p>`,
            viz: { type: 'obvChart' },
          },
        ],
        quiz: [
          { q: 'A breakout to new highs on very light volume is…', choices: ['More likely to fail', 'Guaranteed to succeed', 'Impossible'], a: 0, why: 'Few participants backed the move, so it often falls back.' },
          { q: 'OBV adds the day’s volume when…', choices: ['The close is higher than the day before', 'Volume is above average', 'The stock pays a dividend'], a: 0, why: 'Up closes add volume; down closes subtract it.' },
          { q: 'Price makes a new high but the indicator makes a lower high. This is called…', choices: ['A divergence', 'A breakout', 'A dividend'], a: 0, why: 'Price and indicator disagree, which often warns that momentum is fading.' },
        ],
        takeaways: ['Volume measures participation and conviction.', 'Breakouts on heavy volume are more trustworthy than those on light volume.', 'OBV tracks whether volume is flowing in or out; divergences are early warnings.'],
      },
      {
        id: 'timeframes',
        title: 'Timeframes and chart scales',
        hook: 'Zooming out changes what you see.',
        mins: 6,
        steps: [
          {
            h: 'Zoom out, zoom in',
            body: `<p>The same price history can be drawn with one candle per day, per week or per month. That is the [[timeframe]].</p>
<p>Short timeframes are full of noise. Longer ones show the main trend. A common habit is to read direction on a longer timeframe and time entries on a shorter one. Switch timeframes and watch the candles merge.</p>`,
            viz: { type: 'timeframes' },
          },
          {
            h: 'Linear versus logarithmic scale',
            body: `<p>On a normal (linear) scale, a $10 move looks the same size anywhere on the chart. But a $10 move from $10 is a doubling, while from $600 it is under 2%.</p>
<p>A [[log-scale]] makes equal percentage moves equal in height. For long histories, it shows how a stock really grew. Toggle the scale and watch the early years come to life.</p>`,
            viz: { type: 'logScale' },
          },
          {
            h: 'Match the timeframe to the goal',
            body: `<p>Different goals call for different charts. Sort these.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'long', label: 'Weekly or monthly' },
                { k: 'day', label: 'Daily' },
                { k: 'intra', label: 'Intraday' },
              ],
              items: [
                ['You invest for retirement and check in a few times a year.', 'long', 'Long-term investors care about the big trend, best seen on weekly or monthly charts.'],
                ['You hold trades for a few days to a few weeks.', 'day', 'Swing traders usually work from daily charts.'],
                ['You open and close trades within the same day.', 'intra', 'Day traders use minute or hourly charts, which are noisy and demanding.'],
                ['You want to know whether a stock has been in a multi-year uptrend.', 'long', 'Multi-year trends are clearest on weekly or monthly candles.'],
                ['You want to time the exact entry for a trade planned on a daily chart.', 'intra', 'A shorter timeframe can fine-tune timing within a longer-term plan.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Which timeframe shows the most noise?', choices: ['Five-minute candles', 'Weekly candles', 'Monthly candles'], a: 0, why: 'The shorter the period, the more random back-and-forth shows up.' },
          { q: 'On a log scale, a move from $10 to $20 takes the same height as a move from…', choices: ['$100 to $200', '$100 to $110', '$20 to $30'], a: 0, why: 'Both are 100% moves, and a log scale gives equal percentages equal space.' },
          { q: 'A common way to combine timeframes is…', choices: ['Direction from a longer timeframe, timing from a shorter one', 'Use only one-minute charts', 'Ignore timeframes'], a: 0, why: 'The longer trend sets the bias; the shorter chart refines the entry.' },
        ],
        takeaways: ['Longer timeframes show the trend; shorter ones show noise and timing.', 'Use a log scale for long histories so percentage moves compare fairly.', 'Pick the timeframe that matches how long you plan to hold.'],
      },
    ],
  });
})();
