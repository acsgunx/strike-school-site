/* Technical Analysis, Unit 4 — Indicators. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'indicator', term: 'Indicator', w: 'indicator', def: 'A calculation from price or volume, drawn on or below the chart, that summarizes trend, momentum, volatility or participation.' },
      { id: 'sma', term: 'Simple moving average (SMA)', w: 'simple moving average (SMA)', def: 'The average closing price over the last N periods, recalculated each day.', ex: 'A 20-day SMA averages the last 20 closes.' },
      { id: 'ema', term: 'Exponential moving average (EMA)', w: 'exponential moving average (EMA)', def: 'A moving average that gives more weight to recent prices, so it reacts faster than an SMA of the same length.' },
      { id: 'golden-cross', term: 'Golden cross and death cross', w: 'golden cross', def: 'A shorter moving average crossing above a longer one (golden cross) or below it (death cross). The best-known pair is the 50-day and 200-day.' },
      { id: 'whipsaw', term: 'Whipsaw', w: 'whipsaw', def: 'A signal that quickly reverses, causing a loss, common for trend indicators in sideways markets.' },
      { id: 'lag', term: 'Lag', w: 'lag', def: 'The delay between a price move and an indicator’s response. Smoother indicators lag more.' },
      { id: 'rsi', term: 'Relative Strength Index (RSI)', w: 'Relative Strength Index (RSI)', def: 'A 0–100 momentum gauge comparing average gains with average losses, usually over 14 periods. Above 70 is called overbought, below 30 oversold.' },
      { id: 'overbought', term: 'Overbought and oversold', w: 'overbought', def: 'When a momentum indicator is unusually high or low. It describes a strong recent move, not a guaranteed reversal.' },
      { id: 'macd', term: 'MACD', w: 'MACD', def: 'Moving average convergence divergence: the 12-period EMA minus the 26-period EMA, with a 9-period EMA of that line as the signal line and their difference as a histogram.' },
      { id: 'bollinger-bands', term: 'Bollinger Bands', w: 'Bollinger Bands', def: 'A 20-period moving average with bands two standard deviations above and below it. The bands widen when volatility rises and narrow when it falls.' },
      { id: 'squeeze', term: 'Squeeze', w: 'squeeze', def: 'A period when Bollinger Bands narrow to an unusually tight range. Quiet periods often come before bigger moves.' },
      { id: 'atr', term: 'Average True Range (ATR)', w: 'Average True Range (ATR)', def: 'The average size of each period’s full range, including gaps, usually over 14 periods. A common way to size stops.' },
      { id: 'confluence', term: 'Confluence', w: 'confluence', def: 'When several independent signals, such as trend, level, momentum and volume, agree at the same place and time.' },
    ],
    'technical'
  );

  SS.TECH_UNITS.push({
    n: 4,
    title: 'Indicators',
    blurb: 'Moving averages, RSI, MACD, Bollinger Bands and ATR: what each one measures, and how to combine them sensibly.',
    lessons: [
      {
        id: 'moving-averages',
        title: 'Moving averages',
        hook: 'Smoothing the noise, crossovers, and why they whipsaw.',
        mins: 8,
        steps: [
          {
            h: 'Smoothing the noise',
            body: `<p>An [[indicator]] turns price into a simpler picture. The most common is the moving average. A [[sma]] averages the last N closes. An [[ema]] weights recent closes more, so it turns sooner.</p>
<p>Both suffer from [[lag]]: they only react after price moves. Longer averages are smoother but slower. Change the period and compare the two.</p>`,
            viz: { type: 'maLab' },
          },
          {
            h: 'Crossovers',
            body: `<p>When a faster average crosses above a slower one, trend followers call it a buy signal; crossing below, a sell signal. The famous pair is the 50-day and 200-day: the [[golden-cross]] and the death cross.</p>
<p>Crossovers catch big trends, but in sideways markets they flip back and forth, and each flip is a small loss: a [[whipsaw]]. Watch the signals appear.</p>`,
            predict: {
              q: 'What happens to moving-average crossover signals in a choppy, sideways market?',
              choices: ['They give many false signals', 'They work best', 'They stop updating'],
              a: 0,
              why: 'Without a trend, the averages keep crossing back and forth. Each signal reverses soon after, so the losses add up.',
            },
            viz: { type: 'maCross' },
          },
          {
            h: 'The moving average as a moving floor',
            body: `<p>In a healthy uptrend, pullbacks often stop near a short moving average such as the 20-day EMA. Traders treat it as dynamic support: a floor that rises with the trend.</p>
<p>When price starts closing below it, and the average flattens, the trend is losing steam.</p>`,
            viz: { type: 'maSupport' },
          },
        ],
        quiz: [
          { q: 'Compared with a 20-day SMA, a 20-day EMA…', choices: ['Reacts faster, because recent prices count more', 'Is always higher', 'Ignores recent prices'], a: 0, why: 'The exponential weighting emphasizes the latest closes.' },
          { q: 'A 50-day average crossing above the 200-day is called…', choices: ['A golden cross', 'A death cross', 'A squeeze'], a: 0, why: 'It is the classic long-term bullish crossover.' },
          { q: 'Why do moving averages lag?', choices: ['They average past prices, so they respond only after a move', 'They use future prices', 'Brokers delay them'], a: 0, why: 'Smoothing always trades speed for stability.' },
        ],
        takeaways: ['Moving averages smooth noise; EMAs react faster than SMAs.', 'Crossovers catch trends but whipsaw in ranges.', 'Short averages can act as rising support in strong trends.'],
      },
      {
        id: 'rsi',
        title: 'RSI and momentum',
        hook: 'Measuring the strength of a move, and what “overbought” really means.',
        mins: 8,
        steps: [
          {
            h: 'What RSI measures',
            body: `<p>The [[rsi]] compares the average size of up days with the average size of down days over the last 14 days, on a 0 to 100 scale. Strong up moves push it high; strong down moves push it low.</p>
<p>Readings above 70 are called [[overbought]]; below 30, oversold. Drag across the chart to see the averages behind each reading.</p>`,
            viz: { type: 'rsiChart' },
          },
          {
            h: 'Overbought is not a sell signal',
            body: `<p>A common beginner mistake is to sell as soon as RSI passes 70. In a strong trend, RSI can stay above 70 for weeks while price keeps climbing.</p>
<p><mark>“Overbought” describes a strong move, not a guaranteed top.</mark> In strong uptrends, many traders treat dips toward 40–50 as the more useful signal.</p>`,
            predict: {
              q: 'RSI has just crossed above 70 in a powerful uptrend. What usually happens next?',
              choices: ['Price must fall right away', 'Price can keep rising while RSI stays high', 'RSI resets to 50'],
              a: 1,
              why: 'Momentum can stay strong for a long time. Selling every time RSI crosses 70 means missing most of a big trend.',
            },
            viz: { type: 'rsiTrend' },
          },
          {
            h: 'Divergence',
            body: `<p>RSI is most useful when it disagrees with price. Here price makes a higher high, but RSI makes a lower high: each push up has less force behind it. This is a bearish [[divergence]].</p>
<p>Divergences can last a long time before price turns, so treat them as a warning, not a trigger.</p>`,
            viz: { type: 'rsiDivergence' },
          },
        ],
        quiz: [
          { q: 'An RSI reading of 25 is usually called…', choices: ['Oversold', 'Overbought', 'Neutral'], a: 0, why: 'Below 30 is the conventional oversold zone.' },
          { q: 'Why can selling every time RSI passes 70 be costly?', choices: ['Strong trends can keep RSI high for a long time', 'RSI never goes above 70', 'It is against exchange rules'], a: 0, why: 'High momentum often persists in strong trends.' },
          { q: 'Price makes a higher high while RSI makes a lower high. This is…', choices: ['A bearish divergence', 'A bullish divergence', 'A golden cross'], a: 0, why: 'Momentum is weakening even as price edges higher.' },
        ],
        takeaways: ['RSI compares average gains with average losses on a 0–100 scale.', 'Overbought and oversold describe strength, not certain reversals.', 'Divergences warn that momentum is fading.'],
      },
      {
        id: 'macd',
        title: 'MACD',
        hook: 'Two moving averages, the gap between them, and what that gap is telling you.',
        mins: 7,
        steps: [
          {
            h: 'Building MACD, piece by piece',
            body: `<p>[[macd]] sounds complicated but is built from simple parts. Step through them:</p>
<ul><li><b>1.</b> A fast 12-day EMA and a slow 26-day EMA on the price.</li><li><b>2.</b> The MACD line is the gap between them: fast minus slow.</li><li><b>3.</b> The signal line is a 9-day EMA of the MACD line, and the histogram is the gap between those two.</li></ul>`,
            viz: { type: 'macdBuild' },
          },
          {
            h: 'Reading MACD',
            body: `<p>When the MACD line crosses above its signal line, momentum is turning up; crossing below, it is turning down. When MACD itself crosses zero, the fast average has crossed the slow one.</p>
<p>A shrinking histogram shows momentum fading even before a crossover. Watch the signals form.</p>`,
            viz: { type: 'macdCross' },
          },
        ],
        quiz: [
          { q: 'The MACD line is…', choices: ['The 12-day EMA minus the 26-day EMA', 'The 14-day RSI', 'The average daily range'], a: 0, why: 'It measures the gap between a fast and a slow average.' },
          { q: 'MACD crossing above zero means…', choices: ['The 12-day EMA has crossed above the 26-day EMA', 'Volume doubled', 'The stock paid a dividend'], a: 0, why: 'Zero is where the two averages are equal.' },
          { q: 'A shrinking MACD histogram suggests…', choices: ['Momentum is fading', 'A guaranteed reversal', 'Higher volume'], a: 0, why: 'The MACD line is getting closer to its signal line.' },
        ],
        takeaways: ['MACD is the gap between a 12-day and a 26-day EMA.', 'Signal-line and zero-line crossovers mark momentum shifts.', 'The histogram shows momentum building or fading.'],
      },
      {
        id: 'volatility-bands',
        title: 'Bollinger Bands and ATR',
        hook: 'Measuring how much a stock moves, and using it.',
        mins: 8,
        steps: [
          {
            h: 'Bollinger Bands',
            body: `<p>[[bollinger-bands]] draw a 20-day average with bands two standard deviations above and below. When the market gets wild, the bands widen; when it calms down, they narrow.</p>
<p>In ranges, touches of the bands often mean stretched prices. In strong trends, price can “walk the band” for weeks. Change the settings and see how many closes stay inside.</p>`,
            viz: { type: 'bollinger' },
          },
          {
            h: 'The squeeze',
            body: `<p>Volatility moves in cycles: quiet periods tend to be followed by bigger moves. A [[squeeze]] is when the bands narrow to an unusually tight width.</p>
<p>The squeeze does not tell you the direction, only that a bigger move may be coming. Watch the band width shrink, then explode.</p>`,
            viz: { type: 'squeeze' },
          },
          {
            h: 'ATR and volatility-based stops',
            body: `<p>The [[atr]] is the average size of a day's full range, including gaps. If a stock's ATR is $2, a $1 dip is normal noise.</p>
<p>That makes ATR useful for stops: set them a couple of ATRs away so normal noise does not knock you out. Here a stop trails 3 ATRs below the highest close. Change the multiple and see where it gets hit.</p>`,
            viz: { type: 'atrStop' },
          },
        ],
        quiz: [
          { q: 'Bollinger Bands widen when…', choices: ['Volatility rises', 'Volume falls', 'The stock pays a dividend'], a: 0, why: 'The bands are built from the standard deviation of recent prices.' },
          { q: 'A squeeze tells you…', choices: ['A bigger move may be coming, direction unknown', 'Price will rise', 'Price will fall'], a: 0, why: 'Low volatility tends to give way to higher volatility, in either direction.' },
          { q: 'A stock has an ATR of $1.50. A stop 2 ATRs below your entry is about…', choices: ['$3 below', '$1.50 below', '$0.75 below'], a: 0, why: '2 × $1.50 = $3.' },
        ],
        takeaways: ['Bollinger Bands track volatility around a moving average.', 'Squeezes often come before bigger moves, in either direction.', 'ATR measures normal daily movement; use it to place stops beyond the noise.'],
      },
      {
        id: 'combining-indicators',
        title: 'Using indicators together',
        hook: 'Confluence beats clutter.',
        mins: 7,
        steps: [
          {
            h: 'Four families of indicators',
            body: `<p>Most indicators answer one of four questions. Using two from the same family tells you the same thing twice. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Family',
              back: 'What it answers, and examples',
              items: [
                ['Trend', 'Which way is it going?', 'Moving averages, MACD, trendlines. Best in trending markets; whipsaw in ranges.'],
                ['Momentum', 'How strong is the move?', 'RSI, stochastics, rate of change. Best for spotting stretched moves and divergences.'],
                ['Volatility', 'How much does it usually move?', 'Bollinger Bands, ATR. Best for sizing stops and spotting squeezes.'],
                ['Volume', 'Who is participating?', 'Volume bars, OBV. Best for confirming breakouts and spotting divergences.'],
              ],
            },
          },
          {
            h: 'Confluence',
            body: `<p>[[confluence]] means several independent clues agree. A pullback in an uptrend, to support, with RSI cooling off and then turning up, is a stronger setup than any one of those alone.</p>
<p>Choose which conditions a buy signal needs. More conditions mean fewer signals, usually better ones, but never a guarantee.</p>`,
            viz: { type: 'confluence' },
          },
          {
            h: 'Indicator overload',
            body: `<p>It is tempting to add more indicators until the chart “confirms” everything. But they are all calculated from the same prices, so piling them up adds clutter, not information.</p>
<p><mark>Pick one tool per question, learn it well, and keep the price itself in view.</mark></p>`,
            viz: { type: 'overload' },
          },
        ],
        quiz: [
          { q: 'RSI and stochastics both belong to which family?', choices: ['Momentum', 'Volume', 'Volatility'], a: 0, why: 'Both measure how strong recent moves have been.' },
          { q: 'Confluence means…', choices: ['Several independent signals agree', 'Using as many indicators as possible', 'Ignoring price'], a: 0, why: 'Independent clues pointing the same way add evidence.' },
          { q: 'Why does adding more indicators often not help?', choices: ['They are all derived from the same prices', 'They are illegal', 'They slow down the computer'], a: 0, why: 'More views of the same data rarely add real information.' },
        ],
        takeaways: ['Indicators answer four questions: trend, momentum, volatility and volume.', 'Look for confluence from different families.', 'Keep charts simple: one tool per question.'],
      },
    ],
  });
})();
