/* Japanese Candlesticks, Unit 4 — Windows and rests: windows as support and resistance, window plays, the rising and
   falling three methods, Sakata's five methods, and a chart to read pattern by pattern. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'candle-window', term: 'Window', w: 'window', def: 'The Japanese name for a price gap: an empty space between one session’s range and the next. A rising window tends to act as support and a falling window as resistance, judged on closing prices.' },
      { id: 'tasuki-gap', term: 'Tasuki gap', w: 'tasuki gap', def: 'A continuation pattern: a window in the direction of the trend, then a candle the other way that closes inside the window without closing it.' },
      { id: 'gapping-play', term: 'Gapping play', w: 'gapping play', def: 'A pause of small candles near a recent high (or low), followed by a window out of the pause in the direction of the trend. A continuation signal.' },
      { id: 'rising-three-methods', term: 'Rising and falling three methods', w: 'rising three methods', def: 'A continuation pattern: a long candle with the trend, a few small candles against it that stay within its range, then another long candle that closes beyond the first.' },
      { id: 'separating-lines', term: 'Separating lines', w: 'separating lines', def: 'A continuation pattern. In an uptrend, a red candle is followed by a green candle that opens at the same price the red one opened at and rallies. The mirror version appears in downtrends.' },
      { id: 'sakata-five-methods', term: 'Sakata’s five methods', w: 'Sakata’s five methods', def: 'A traditional grouping of Japanese candle ideas into five threes: three mountains, three rivers, three gaps, three soldiers and three methods.' },
    ],
    'nison'
  );

  SS.NISON_UNITS.push({
    n: 4,
    title: 'Windows and rests',
    blurb: 'Gaps, which the Japanese call windows, as support and resistance; the patterns that show a trend resting rather than reversing; and a whole chart to read on your own.',
    lessons: [
      {
        id: 'ni-windows',
        title: 'Windows',
        hook: 'The Japanese call a gap a window, and they expect prices to come back to it.',
        mins: 9,
        steps: [
          {
            h: 'Corrections go back to the window',
            body: `<p>What Western traders call a [[price-gap|gap]], the Japanese call a [[candle-window|window]]. A rising window opens when a session’s low is above the previous high; a falling window when its high is below the previous low.</p>
<p>A Japanese saying holds that corrections go back to the window. A rising window often becomes <mark>support</mark>: pullbacks stop there. The test is the close. A dip below the window during a session is fine, but a <mark>close</mark> below its bottom cancels the support. A falling window works the same way as resistance.</p>`,
            predict: {
              q: 'Prices gapped up, leaving a rising window, and now they pull back. Where might the pullback stop?',
              choices: ['Around the window', 'At the day’s open', 'Nowhere: gaps always fill and keep going'],
              a: 0,
              why: 'Rising windows often act as support. If prices close below the bottom of the window, the support has failed.',
            },
            viz: { type: 'windowSupport' },
          },
          {
            h: 'Window plays',
            body: `<p>Windows also appear in a few continuation patterns:</p>
<ul><li>An upside [[tasuki-gap]]: a rising window, then a red candle that closes inside the window without closing it. The uptrend usually resumes.</li>
<li>A high-price [[gapping-play]]: a pause of small candles near the high, then a rising window out of the pause.</li>
<li>Three windows: after three rising windows, the Japanese consider a rally overextended and due for a rest.</li></ul>`,
            viz: { type: 'windowPlays' },
          },
        ],
        quiz: [
          { q: 'A rising window is…', choices: ['A gap up: a session’s low above the previous high', 'A tall green candle', 'A doji after a rally'], a: 0, why: 'It’s the Japanese name for a gap up.' },
          { q: 'A rising window’s support fails when…', choices: ['Prices close below the bottom of the window', 'Prices dip into the window during a session', 'Volume falls'], a: 0, why: 'Closes count. An intraday dip that recovers leaves the support intact.' },
          { q: 'After three rising windows in a row, the Japanese expect…', choices: ['The rally to need a rest', 'An even faster rally', 'Nothing in particular'], a: 0, why: 'Three gaps in a row is a sign of an overextended market.' },
        ],
        takeaways: ['A window is a gap: rising windows act as support, falling windows as resistance.', 'Corrections often go back to the window; only a close through it cancels it.', 'Tasuki gaps and gapping plays are continuation patterns; three windows in a row means overextended.'],
      },
      {
        id: 'ni-three-methods',
        title: 'Rising and falling three methods',
        hook: 'A trend can rest without reversing. The three methods show what a healthy rest looks like.',
        mins: 8,
        steps: [
          {
            h: 'A rest, not a reversal',
            body: `<p>The [[rising-three-methods|rising three methods]] is a continuation pattern in five sessions:</p>
<ul><li>A long green candle in an uptrend.</li>
<li>A few small candles, usually three and usually red, that drift lower but stay <mark>within the first candle’s range</mark>.</li>
<li>A long green candle that closes above the first candle’s close.</li></ul>
<p>The small candles are a rest. If they fall below the first candle’s low, it isn’t a rest any more: the trend is in doubt. The falling three methods is the bearish mirror.</p>`,
            viz: { type: 'threeMethods' },
          },
          {
            h: 'Continuation or reversal?',
            body: `<p>[[separating-lines|Separating lines]] are another kind of rest: in an uptrend, a red day followed by a green day that opens right where the red day opened. Sort these patterns by what they usually signal.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'cont', label: 'Continuation' },
                { k: 'rev', label: 'Reversal' },
              ],
              items: [
                ['A long green day, three small red days inside its range, then a long green day that closes at a new high.', 'cont', 'Rising three methods: a rest, then the uptrend resumes.'],
                ['After a rally, a tall green day, then a red day that opens above its high and closes deep in its body.', 'rev', 'A dark-cloud cover.'],
                ['In an uptrend, a red day followed by a green day that opens at the red day’s open and rallies.', 'cont', 'Bullish separating lines.'],
                ['In a decline, a green day that closes only slightly into the prior red body.', 'cont', 'An in-neck pattern: the decline usually continues.'],
                ['A rising window, then a red day that closes inside the window without filling it.', 'cont', 'An upside tasuki gap.'],
                ['After a decline, a doji that gaps below a tall red day, then a tall green day that gaps above the doji.', 'rev', 'An abandoned baby bottom.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'In a rising three methods, the small middle candles should…', choices: ['Stay within the first long candle’s range', 'Fall below the first candle’s low', 'Be bigger than the first candle'], a: 0, why: 'Staying inside the range is what makes them a rest.' },
          { q: 'The last candle of a rising three methods should…', choices: ['Close above the first candle’s close', 'Be a doji', 'Gap down'], a: 0, why: 'A new high close shows the uptrend has resumed.' },
          { q: 'Separating lines are…', choices: ['A continuation pattern', 'A reversal pattern', 'A kind of doji'], a: 0, why: 'The second day opens where the first opened and moves with the trend.' },
        ],
        takeaways: ['Three methods: a long candle, a small rest inside its range, then another long candle with the trend.', 'If the rest breaks the first candle’s far end, the trend is in doubt.', 'Separating lines, tasuki gaps and in-neck patterns are other continuation signs.'],
      },
      {
        id: 'ni-sakata',
        title: 'Sakata’s methods and reading a chart',
        hook: 'Five old groupings of three, then a whole chart to read on your own.',
        mins: 10,
        steps: [
          {
            h: 'Sakata’s five methods',
            body: `<p>Japanese tradition groups many candle ideas into [[sakata-five-methods|Sakata’s five methods]], each built around the number three. You have already met all five. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Method',
              back: 'What it is',
              items: [
                ['San-zan: three mountains', 'Three peaks at a top.', 'A triple top, or a three Buddha top when the middle peak is the highest.'],
                ['San-sen: three rivers', 'Three lows at a bottom.', 'The mirror of three mountains: a triple bottom, or an inverted three Buddha.'],
                ['San-ku: three gaps', 'Three windows in a row.', 'After three windows in the same direction, the market is overextended and due for a rest.'],
                ['San-pei: three soldiers', 'Three steady candles.', 'Three white soldiers on the way up, and their tiring cousins, the advance block and the stalled pattern.'],
                ['San-poh: three methods', 'A rest in a trend.', 'The rising and falling three methods: a pause inside a long candle’s range before the trend resumes.'],
              ],
            },
          },
          {
            h: 'Read the chart',
            body: `<p>Time to read a whole chart. It plays until a pattern has formed, then stops and asks you to name it. Look at the trend before each one, not just the shapes.</p>`,
            viz: { type: 'patternHunt' },
          },
        ],
        quiz: [
          { q: 'San-ku, the three gaps, warns that…', choices: ['A market is overextended after three windows in a row', 'Three doji are coming', 'Volume is rising'], a: 0, why: 'Three windows in one direction is a sign the move has gone too far, too fast.' },
          { q: 'Before naming a reversal pattern, check…', choices: ['The trend before it', 'The day of the week', 'Only the color of the last candle'], a: 0, why: 'A reversal pattern needs a trend to reverse.' },
          { q: 'San-poh, the three methods, describes…', choices: ['A rest within a trend', 'A top with three peaks', 'Three gaps in a row'], a: 0, why: 'The trend pauses inside a long candle’s range, then resumes.' },
        ],
        takeaways: ['Sakata’s five methods group candle ideas in threes: mountains, rivers, gaps, soldiers and methods.', 'Read the trend first, then the pattern.', 'Name what you see, then wait for confirmation.'],
      },
    ],
  });
})();
