/* Technical Analysis in Depth, Unit 4 — Point and figure, waves and cycles: charts without time, the Elliott Wave
   Principle, and time cycles. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'point-and-figure', term: 'Point and figure chart', w: 'point and figure', def: 'A chart of price moves only, with no time axis: columns of Xs for rises and Os for falls. A new column starts only when the price reverses by a set number of boxes, so small wiggles disappear.' },
      { id: 'pnf-box', term: 'Box size', w: 'box size', def: 'In a point and figure chart, the price step each X or O stands for. Together with the reversal amount, it decides how much noise the chart filters out.' },
      { id: 'elliott-wave', term: 'Elliott Wave Principle', w: 'Elliott Wave', def: 'R. N. Elliott’s idea that markets move in a repeating pattern: five waves with the trend, then three against it, with each wave made of smaller waves of the same shape.' },
      { id: 'impulse-wave', term: 'Impulse wave', w: 'impulse wave', def: 'In Elliott Wave terms, a five-wave move in the direction of the larger trend, numbered 1 to 5.' },
      { id: 'corrective-wave', term: 'Corrective wave', w: 'corrective wave', def: 'In Elliott Wave terms, a move against the larger trend, usually in three waves labeled A, B and C.' },
      { id: 'market-cycle', term: 'Cycle (time cycle)', w: 'cycle', def: 'A rhythm in prices measured from low to low. Its length is the period, the size of its swing is the amplitude, and the timing of its lows is the phase.' },
      { id: 'cycle-translation', term: 'Translation', w: 'translation', def: 'How a cycle’s peak leans away from its midpoint. In uptrends peaks come late (right translation); in downtrends they come early (left translation).' },
    ],
    'murphy'
  );

  SS.MURPHY_UNITS.push({
    n: 4,
    title: 'Point and figure, waves and cycles',
    blurb: 'Three other ways to look at price: charts that ignore time, the five-and-three wave pattern, and the rhythm of cycles.',
    lessons: [
      {
        id: 'mu-pnf',
        title: 'Point and figure charts',
        hook: 'A chart that ignores time and noise, and records only the moves that matter.',
        mins: 9,
        steps: [
          {
            h: 'Price without time',
            body: `<p>A [[point-and-figure]] chart is one of the oldest charting methods. It has no time axis at all. Rising prices fill a column with Xs and falling prices a column of Os, one box at a time. The chart moves to a new column only when the price reverses by a set number of boxes, three in the classic version. Small wiggles never show up.</p>
<p>Play the prices and watch the chart build itself below. Then change the [[pnf-box|box size]] and the reversal amount.</p>`,
            predict: {
              q: 'With $1 boxes and a 3-box reversal, the price is in an X column topping at $60 and dips to $58.20. What happens?',
              choices: ['Nothing: the dip is less than 3 boxes', 'A new O column starts', 'An X is erased'],
              a: 0,
              why: 'A reversal needs a $3 move against the column. $1.80 is not enough, so the chart doesn’t change at all.',
            },
            viz: { type: 'pnfBuild' },
          },
          {
            h: 'Buy and sell signals',
            body: `<p>Point and figure signals are simple and objective. A buy signal, the double top, comes when an X column rises above the top of the previous X column. A sell signal, the double bottom, comes when an O column falls below the bottom of the previous O column. Chartists also project targets by counting how wide a base is, a technique called the horizontal count.</p>`,
            viz: { type: 'pnfBuild', signals: true },
          },
        ],
        quiz: [
          { q: 'What does the horizontal axis of a point and figure chart show?', choices: ['Columns of moves, not time', 'Days', 'Volume'], a: 0, why: 'A column can cover one day or a month; time is ignored.' },
          { q: 'A larger box size makes the chart…', choices: ['Filter out more noise, with fewer columns', 'Show more detail', 'Show volume'], a: 0, why: 'Bigger boxes need bigger moves to register.' },
          { q: 'A point and figure buy signal comes when…', choices: ['An X column rises above the previous X column’s top', 'An O column appears', 'Time passes'], a: 0, why: 'Breaking the previous high is the simplest buy signal, the double top.' },
        ],
        takeaways: ['Point and figure records price moves and ignores time.', 'The box size and reversal amount set how much noise is filtered out.', 'Signals: X above the previous X high (buy), O below the previous O low (sell).'],
      },
      {
        id: 'mu-elliott',
        title: 'Elliott Wave',
        hook: 'Five waves up, three down, and waves inside the waves.',
        mins: 10,
        steps: [
          {
            h: 'Five up, three down',
            body: `<p>In the 1930s, R. N. Elliott proposed that markets move in a repeating pattern, the [[elliott-wave]]. Five waves move with the trend: an [[impulse-wave]], numbered 1 to 5. Then three waves move against it: a [[corrective-wave]], labeled A, B and C. Look closer and each wave is made of smaller waves of the same shape. Murphy notes the pattern is often linked to Fibonacci ratios, such as 61.8% and 1.618.</p>
<p>Play the big pattern, then switch to the waves within the waves.</p>`,
            viz: { type: 'elliottBuild' },
          },
          {
            h: 'The three rules',
            body: `<p>Elliott Wave counts are notoriously open to interpretation, and two analysts often count the same chart differently. But three rules are firm:</p>
<ul><li>Wave 2 never retraces more than all of wave 1.</li>
<li>Wave 3 is never the shortest of waves 1, 3 and 5.</li>
<li>Wave 4 never overlaps the price territory of wave 1.</li></ul>
<p>Drag the waves and test the rules.</p>`,
            predict: {
              q: 'In what looks like an uptrend, wave 4 falls below the top of wave 1. Under Elliott’s rules, this means…',
              choices: ['The count is wrong: this can’t be wave 4', 'A strong buy signal', 'Wave 5 will be huge'],
              a: 0,
              why: 'Wave 4 may not overlap wave 1. If it does, the waves have to be counted differently.',
            },
            viz: { type: 'elliottRules' },
          },
        ],
        quiz: [
          { q: 'A complete Elliott cycle has…', choices: ['Five waves with the trend and three against it', 'Three waves up and five down', 'Two waves'], a: 0, why: '5 + 3 = 8 waves in one full cycle.' },
          { q: 'Which is an Elliott rule?', choices: ['Wave 3 is never the shortest of waves 1, 3 and 5', 'Wave 5 is always the longest', 'Wave 2 must retrace exactly 50%'], a: 0, why: 'The other two are guidelines at best.' },
          { q: 'A common criticism of Elliott Wave is that…', choices: ['Different analysts often count the same chart differently', 'It only works on Tuesdays', 'It ignores price'], a: 0, why: 'The rules narrow the counts, but judgment still plays a large part.' },
        ],
        takeaways: ['Five waves with the trend, three against it.', 'Each wave contains smaller waves of the same shape.', 'Three firm rules; everything else is interpretation.'],
      },
      {
        id: 'mu-cycles',
        title: 'Time cycles',
        hook: 'Markets have rhythms. They aren’t clocks, but they can tilt the odds on timing.',
        mins: 8,
        steps: [
          {
            h: 'Period, amplitude and translation',
            body: `<p>Cycle analysts measure a [[market-cycle|cycle]] from low to low, because lows tend to be cleaner than peaks. In a sideways market, a cycle’s peak sits near the middle. In an uptrend, the peaks lean late, which is called right [[cycle-translation|translation]]. In a downtrend, they lean early (left translation). Change the period and the trend and watch where the peaks land.</p>`,
            viz: { type: 'cycleBuild' },
          },
          {
            h: 'Cycle principles',
            body: `<p>Murphy summarizes a set of cycle principles. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Principle',
              back: 'In plain words',
              items: [
                ['Summation', 'Price is many cycles added up.', 'Short, medium and long cycles plus a trend combine into the price you see.'],
                ['Harmonicity', 'Neighboring cycles are related.', 'A longer cycle is often about twice as long as the next shorter one.'],
                ['Synchronicity', 'Cycles tend to bottom together.', 'When several cycle lows line up, the low is usually a more important one.'],
                ['Proportionality', 'Longer cycles, bigger swings.', 'The longer the cycle, the larger its price swing tends to be.'],
                ['Variation', 'Cycles are not exact.', 'Real cycles stretch and shrink. Treat them as tendencies, not clocks.'],
                ['Translation', 'Peaks lean with the trend.', 'Late peaks in uptrends, early peaks in downtrends.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Cycles are usually measured…', choices: ['From low to low', 'From high to high', 'From open to close'], a: 0, why: 'Lows tend to be cleaner and easier to time.' },
          { q: 'Right translation means the cycle’s peak comes…', choices: ['Late, which is typical of an uptrend', 'Early, typical of a downtrend', 'Exactly in the middle'], a: 0, why: 'A rising trend pushes the peak later in the cycle.' },
          { q: 'Real market cycles are best treated as…', choices: ['Tendencies that vary', 'Exact clocks', 'Random noise'], a: 0, why: 'Cycles stretch and shrink, so use them to tilt the odds on timing.' },
        ],
        takeaways: ['Measure cycles from low to low.', 'Peaks lean late in uptrends and early in downtrends.', 'Cycles are rhythms, not clocks.'],
      },
    ],
  });
})();
