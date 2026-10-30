/* Technical Analysis, Unit 2 — Trends, support and resistance. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'uptrend', term: 'Uptrend', w: 'uptrend', def: 'A series of higher highs and higher lows: each rally goes further and each dip stops sooner.' },
      { id: 'downtrend', term: 'Downtrend', w: 'downtrend', def: 'A series of lower highs and lower lows.' },
      { id: 'swing-point', term: 'Swing high and swing low', w: 'swing highs and lows', def: 'A swing high is a peak with lower prices on both sides; a swing low is a trough with higher prices on both sides. Trends are read from them.' },
      { id: 'support', term: 'Support', w: 'support', def: 'A price area where buying has repeatedly stopped declines, like a floor.' },
      { id: 'resistance', term: 'Resistance', w: 'resistance', def: 'A price area where selling has repeatedly capped rallies, like a ceiling.' },
      { id: 'role-reversal', term: 'Role reversal', w: 'role reversal', def: 'When broken resistance later acts as support, or broken support later acts as resistance.' },
      { id: 'trendline', term: 'Trendline', w: 'trendline', def: 'A straight line connecting two or more swing lows in an uptrend, or swing highs in a downtrend.' },
      { id: 'channel', term: 'Channel', w: 'channel', def: 'Two parallel lines that contain price as it trends: a trendline and a matching line on the other side.' },
      { id: 'consolidation', term: 'Consolidation', w: 'consolidation', def: 'A pause where price moves sideways in a range, often before the next trend move.' },
      { id: 'breakout', term: 'Breakout', w: 'breakout', def: 'When price moves decisively beyond support, resistance or a trendline that had contained it.' },
      { id: 'false-breakout', term: 'False breakout (bull trap)', w: 'false breakout', def: 'A breakout that quickly reverses back into the range, trapping traders who bought or sold on the break.' },
      { id: 'measured-move', term: 'Measured move', w: 'measured move', def: 'A rough price target made by adding the height of a range or pattern to the breakout level.' },
      { id: 'retest', term: 'Retest', w: 'retest', def: 'A return to a level just broken, such as a pullback to old resistance after a breakout, to see whether it now holds.' },
    ],
    'technical'
  );

  SS.TECH_UNITS.push({
    n: 2,
    title: 'Trends, support and resistance',
    blurb: 'Read trends from swing points, find floors and ceilings, draw trendlines and channels, and handle breakouts.',
    lessons: [
      {
        id: 'trends',
        title: 'Trends',
        hook: 'Higher highs, higher lows, and the first sign a trend is ending.',
        mins: 7,
        steps: [
          {
            h: 'What a trend looks like',
            body: `<p>Prices never move in straight lines. They zigzag. The peaks and troughs of the zigzag are [[swing-point|swing highs and lows]], and they define the trend.</p>
<p>An [[uptrend]] makes higher highs and higher lows. A [[downtrend]] makes lower highs and lower lows. A sideways market does neither. Play each chart and watch the swing points get labeled as they form.</p>`,
            viz: { type: 'swingTrend' },
          },
          {
            h: 'When a trend breaks',
            body: `<p>An uptrend stays intact as long as each dip stops above the previous low. The first lower low is the warning that buyers are losing control.</p>
<p>It does not guarantee a reversal: many trends pause and resume. But it is where a trend follower would reassess.</p>`,
            predict: {
              q: 'In an uptrend, which event is the first warning that it may be ending?',
              choices: ['A new higher high', 'A lower low: a dip that breaks below the previous low', 'A single red candle'],
              a: 1,
              why: 'Red candles and pullbacks are normal in an uptrend. Breaking below the last swing low is what breaks the pattern of higher lows.',
            },
            viz: { type: 'trendBreak' },
          },
          {
            h: 'The trend is your friend',
            body: `<p>Trading with the trend means the odds and the momentum are on your side. Trading against it, such as buying every dip in a downtrend, is often called catching a falling knife.</p>
<p>Sort these ideas: are they trading with the trend or against it?</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'with', label: 'With the trend' },
                { k: 'against', label: 'Against the trend' },
              ],
              items: [
                ['Buying a pullback to a higher low in a clear uptrend.', 'with', 'Higher lows are where uptrends usually find buyers.'],
                ['Buying a stock because it fell 40% and “must bounce.”', 'against', 'A big drop alone is not a reason. Downtrends can keep falling.'],
                ['Selling short after a lower high in a downtrend.', 'with', 'Lower highs are where downtrends usually find sellers.'],
                ['Shorting a stock making new all-time highs because it “looks too high.”', 'against', 'Strong uptrends can stay “too high” for a long time.'],
                ['Waiting for a higher low to form before buying after a decline.', 'with', 'A higher low is the first sign a new uptrend may be starting.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'An uptrend is defined by…', choices: ['Higher highs and higher lows', 'Any green candle', 'Lower highs and lower lows'], a: 0, why: 'Each rally goes further and each dip stops sooner.' },
          { q: 'Which first warns that a downtrend may be ending?', choices: ['A higher high above the last swing high', 'Another lower low', 'A red candle'], a: 0, why: 'Breaking above the last lower high breaks the pattern of lower highs.' },
          { q: '“Catching a falling knife” means…', choices: ['Buying into a strong downtrend hoping for a bounce', 'Selling at the top', 'Holding cash'], a: 0, why: 'Trades against a strong trend often keep losing.' },
        ],
        takeaways: ['Read trends from swing points: higher highs and lows, or lower highs and lows.', 'The first break of the pattern is a warning, not a guarantee.', 'Trading with the trend puts momentum on your side.'],
      },
      {
        id: 'support-resistance',
        title: 'Support and resistance',
        hook: 'The floors and ceilings that show up again and again.',
        mins: 7,
        steps: [
          {
            h: 'Floors and ceilings',
            body: `<p>[[support]] is a price area where buying has repeatedly stopped declines. [[resistance]] is where selling has repeatedly capped rallies. Each time a level holds, more traders notice it.</p>
<p>Think of them as zones, not exact prices. Play the chart and watch each touch light up.</p>`,
            viz: { type: 'srLevels' },
          },
          {
            h: 'Why levels work',
            body: `<p>Levels work because people remember prices. Buyers who missed $50 last time leave orders there. Sellers who bought at $60 and saw it fall want to get out at breakeven. Round numbers attract orders too.</p>
<p>On the right are the orders waiting at each price. Watch the price run into the wall of buy orders.</p>`,
            viz: { type: 'srOrders' },
          },
          {
            h: 'Broken resistance becomes support',
            body: `<p>When price finally breaks through resistance, that old ceiling often becomes a new floor. This is called [[role-reversal]].</p>
<p>Traders who sold too early want back in near the old level, and those who bought the breakout defend it.</p>`,
            predict: {
              q: 'A stock breaks above $60 resistance, then dips back toward $60. What often happens?',
              choices: ['It finds buyers near $60', 'It crashes straight through to $40', 'Nothing: $60 no longer matters'],
              a: 0,
              why: 'The old ceiling is where many traders now want to buy, so it frequently acts as support on the first pullback.',
            },
            viz: { type: 'roleReversal' },
          },
        ],
        quiz: [
          { q: 'Support is…', choices: ['A price area where buying has repeatedly stopped declines', 'The highest price of the year', 'A type of order'], a: 0, why: 'It acts like a floor because buyers keep showing up there.' },
          { q: 'Why might round numbers like $100 act as levels?', choices: ['Many traders place orders at them', 'Exchanges stop trading there', 'They are required by law'], a: 0, why: 'Clusters of orders at memorable prices create real supply and demand.' },
          { q: 'After price breaks below support, the old support level often becomes…', choices: ['Resistance', 'Irrelevant', 'A dividend'], a: 0, why: 'Role reversal works both ways: broken floors become ceilings.' },
        ],
        takeaways: ['Support stops declines; resistance caps rallies.', 'Levels work because of memory and clustered orders.', 'Broken levels often switch roles.'],
      },
      {
        id: 'trendlines',
        title: 'Trendlines and channels',
        hook: 'Drawing the lines traders watch, without fooling yourself.',
        mins: 8,
        steps: [
          {
            h: 'Draw a trendline',
            body: `<p>A [[trendline]] connects swing lows in an uptrend, or swing highs in a downtrend. Two points make a line; the third touch is what makes it meaningful.</p>
<p>Drag the two handles to draw your own line. The counter shows how many times price touched it and how many closes broke below it. Then compare with the suggested line.</p>`,
            viz: { type: 'drawTrendline' },
          },
          {
            h: 'Channels',
            body: `<p>Draw a parallel line through the swing highs and you get a [[channel]]. In a rising channel, price tends to bounce between the lower and upper lines.</p>
<p>Traders use the bottom of the channel to look for entries and the top to take profits. Scrub through the chart to see where price sits in the channel each day.</p>`,
            viz: { type: 'channel' },
          },
          {
            h: 'When the line breaks',
            body: `<p>A close below a rising trendline warns that the trend is weakening. Often price comes back to test the line from below, and the old support acts as resistance.</p>
<p><mark>Draw lines before the fact, and don't keep redrawing them to fit.</mark> A line you adjust after every break tells you nothing.</p>`,
            viz: { type: 'trendlineBreak' },
          },
        ],
        quiz: [
          { q: 'In an uptrend, a trendline connects…', choices: ['Swing lows', 'Swing highs', 'Random closes'], a: 0, why: 'It tracks the rising floor of the trend.' },
          { q: 'What makes a trendline more significant?', choices: ['More touches that held', 'Drawing it thicker', 'Redrawing it after every break'], a: 0, why: 'Each successful test shows more traders are watching it.' },
          { q: 'In a rising channel, where do traders usually look to take profits?', choices: ['Near the upper line', 'Near the lower line', 'Exactly in the middle'], a: 0, why: 'The upper line has capped rallies, so that is where selling tends to appear.' },
        ],
        takeaways: ['Trendlines connect swing lows (uptrend) or swing highs (downtrend).', 'Channels add a parallel line for the other side.', 'Draw lines in advance and respect breaks instead of redrawing.'],
      },
      {
        id: 'breakouts',
        title: 'Breakouts and false breakouts',
        hook: 'Riding real breakouts, avoiding traps.',
        mins: 8,
        steps: [
          {
            h: 'Anatomy of a breakout',
            body: `<p>Trends often pause in a sideways range called a [[consolidation]]. When price finally escapes it, that is a [[breakout]].</p>
<p>A simple target is the [[measured-move]]: take the height of the range and add it to the breakout level. Play the chart and watch the range height get carried upward.</p>`,
            viz: { type: 'breakoutMeasure' },
          },
          {
            h: 'False breakouts and how to filter them',
            body: `<p>A [[false-breakout]] pokes above resistance, pulls in buyers, then falls back. Traders use filters to avoid them, each with a cost.</p>
<p>Turn the filters on and off, and switch between a false and a real breakout. Filters keep you out of traps, but they also make you enter later on the real ones.</p>`,
            viz: { type: 'fakeoutFilters' },
          },
          {
            h: 'Buying the retest',
            body: `<p>Instead of buying the breakout day, some traders wait for a [[retest]]: a pullback to the old resistance. If it holds, they buy with a stop just below it.</p>
<p>The entry is cheaper and the stop is closer, so the risk per share is smaller. The catch: strong breakouts sometimes never come back.</p>`,
            viz: { type: 'retestEntry' },
          },
        ],
        quiz: [
          { q: 'A range runs from $50 to $56, and price breaks out above $56. A measured-move target is about…', choices: ['$62', '$56', '$106'], a: 0, why: 'Range height $6, added to the $56 breakout level.' },
          { q: 'A bull trap is…', choices: ['A breakout that quickly reverses back into the range', 'A strong uptrend', 'A type of dividend'], a: 0, why: 'It traps buyers who bought the break.' },
          { q: 'What is the main trade-off of waiting for a confirming close or a retest?', choices: ['Fewer false signals, but later or missed entries', 'Higher fees', 'No trade-off'], a: 0, why: 'Every filter that removes traps also delays you on genuine moves.' },
        ],
        takeaways: ['Breakouts escape a consolidation; the range height gives a rough target.', 'Filters such as closes, volume and time reduce false breakouts, at the cost of later entries.', 'Retest entries cut risk per share but can be missed.'],
      },
    ],
  });
})();
