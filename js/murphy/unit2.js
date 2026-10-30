/* Technical Analysis in Depth, Unit 2 — Patterns, gaps and targets: more reversal and continuation patterns, the key
   reversal day, the measured move, and the four kinds of gaps. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'triple-top', term: 'Triple top', w: 'triple top', def: 'A reversal pattern with three peaks at about the same level (a triple bottom is the mirror image). It completes when the price closes below the lows between the peaks; the usual target is the pattern’s height, measured down from there.' },
      { id: 'rounding-bottom', term: 'Rounding bottom', w: 'rounding bottom', def: 'A slow, bowl-shaped turn from falling to rising prices, also called a saucer. Volume often traces the same bowl. It completes when the price clears the bowl’s left rim.' },
      { id: 'v-reversal', term: 'V reversal', w: 'V reversal', def: 'A sudden turn with no base and no warning: a steep fall followed at once by a steep rise, or the reverse. The first clue is often a break of the steep trendline on heavy volume.' },
      { id: 'key-reversal-day', term: 'Key reversal day', w: 'key reversal day', def: 'In an uptrend, a day that sets a new high and then closes below the previous day’s low (mirror it in a downtrend). Heavy volume and a weekly chart make it more meaningful.' },
      { id: 'wedge', term: 'Wedge', w: 'wedge', def: 'A pattern between two converging trendlines that slope the same way. A falling wedge usually breaks upward and a rising wedge downward.' },
      { id: 'rectangle-pattern', term: 'Rectangle', w: 'rectangle', def: 'A pause in a trend where the price bounces between a flat ceiling and a flat floor. It usually breaks in the trend’s direction; the usual target is the rectangle’s height added to the breakout.' },
      { id: 'price-gap', term: 'Gap', w: 'gap', def: 'A price range on a chart where no trading took place, because one bar’s low is above the previous bar’s high, or its high is below the previous bar’s low.' },
      { id: 'breakaway-gap', term: 'Breakaway gap', w: 'breakaway gap', def: 'A gap that launches a move out of a trading range, usually on heavy volume. It often stays unfilled for a long time.' },
      { id: 'runaway-gap', term: 'Runaway gap', w: 'runaway gap', def: 'A gap in the middle of a strong trend, also called a measuring gap, because it often appears about halfway through the move.' },
      { id: 'exhaustion-gap', term: 'Exhaustion gap', w: 'exhaustion gap', def: 'A last gap near the end of a move, as the final buyers (or sellers) rush in. It is usually filled within days.' },
      { id: 'island-reversal', term: 'Island reversal', w: 'island reversal', def: 'A cluster of bars cut off by an exhaustion gap on one side and a gap in the opposite direction on the other, leaving it stranded like an island. A strong reversal sign.' },
    ],
    'murphy'
  );

  SS.MURPHY_UNITS.push({
    n: 2,
    title: 'Patterns, gaps and targets',
    blurb: 'More reversal and continuation patterns, the one-day key reversal, how far a move might go, and what the empty spaces on a chart mean.',
    lessons: [
      {
        id: 'mu-reversals',
        title: 'More reversal patterns',
        hook: 'Tops that test three times, bottoms that turn slowly, and turns that happen overnight.',
        mins: 9,
        steps: [
          {
            h: 'Three shapes of a turn',
            body: `<p>The Technical Analysis course covered [[head-shoulders|head and shoulders]] and [[double-top|double tops]]. Murphy describes several more reversal patterns:</p>
<ul><li>A [[triple-top]] tests the same ceiling three times before breaking down.</li>
<li>A [[rounding-bottom]] turns slowly, like a saucer.</li>
<li>A [[v-reversal]] turns at once, with no warning.</li></ul>
<p>Pick a pattern and watch it form, with volume underneath.</p>`,
            predict: {
              q: 'A stock hits the same ceiling three times. When is a triple top complete?',
              choices: ['When the price closes below the lows between the peaks', 'When the third peak forms', 'When volume rises'],
              a: 0,
              why: 'Until the floor breaks, it could still be a trading range that later breaks upward. The break of the lows completes the pattern.',
            },
            viz: { type: 'chartPattern', set: 'reversal' },
          },
          {
            h: 'The key reversal day',
            body: `<p>Sometimes a single day hints at a turn. In an uptrend, a [[key-reversal-day]] opens with a new high for the move, then sells off and closes below the previous day’s low. Heavy volume and a wide range make it more meaningful, and Murphy notes the same pattern on a weekly chart carries more weight. Watch one form during the day.</p>`,
            viz: { type: 'keyReversal' },
          },
        ],
        quiz: [
          { q: 'A rounding bottom completes when…', choices: ['The price clears the left rim of the bowl', 'Volume hits a new low', 'The price makes a new low'], a: 0, why: 'Clearing the rim shows buyers have taken over from the slow decline.' },
          { q: 'Why is a V reversal hard to trade?', choices: ['It turns suddenly, with no base to build first', 'It takes years to form', 'It always fails'], a: 0, why: 'There is no pattern to wait for, so the turn is easy to miss or mistake for a bounce.' },
          { q: 'A key reversal day in an uptrend sets a new high and then…', choices: ['Closes below the previous day’s low', 'Closes at its high', 'Doesn’t trade at all'], a: 0, why: 'Buyers were in control at the open and sellers at the close.' },
        ],
        takeaways: ['A triple top completes on a close below the lows between the peaks.', 'Rounding bottoms are slow; V reversals give no warning.', 'A key reversal day is a clue, stronger on heavy volume and on weekly charts.'],
      },
      {
        id: 'mu-continuations',
        title: 'Wedges, rectangles and measured moves',
        hook: 'Pauses that usually end the way the trend was going, and how far the next leg might reach.',
        mins: 9,
        steps: [
          {
            h: 'Wedges and rectangles',
            body: `<p>Continuation patterns are pauses that usually resolve in the direction of the trend. The Technical Analysis course covered [[triangle|triangles]] and [[flag|flags]]. Two more are the [[wedge]], whose two lines converge and slope the same way, and the [[rectangle-pattern|rectangle]], a flat range. A falling wedge in an uptrend usually breaks upward; a rising wedge in a downtrend usually breaks downward.</p>`,
            viz: { type: 'chartPattern', set: 'continuation' },
          },
          {
            h: 'The measured move',
            body: `<p>Murphy describes a simple way to project how far a trend might go: the [[measured-move]]. A strong move (leg 1) is followed by a correction, often giving back a third to a half of it, and then by a second move about as long as the first. Drag the correction low and watch the projection.</p>`,
            predict: {
              q: 'A stock rises from $40 to $55, corrects to $50, then starts rising again. A measured move projects about…',
              choices: ['$65', '$55', '$90'],
              a: 0,
              why: 'The second leg is projected to equal the first: the $15 of leg 1 added to the $50 low gives about $65.',
            },
            viz: { type: 'measuredMove' },
          },
        ],
        quiz: [
          { q: 'A falling wedge in an uptrend usually…', choices: ['Breaks upward', 'Breaks downward', 'Never breaks'], a: 0, why: 'Wedges slope against the trend and usually break with it.' },
          { q: 'The usual price target for a rectangle is…', choices: ['Its height added to the breakout point', 'Double the price', 'The bottom of the rectangle'], a: 0, why: 'The height of the range is projected from the side it breaks.' },
          { q: 'A measured move assumes the second leg is…', choices: ['About as long as the first', 'Always longer', 'In the opposite direction'], a: 0, why: 'It’s a rough guide to symmetry, not a promise.' },
        ],
        takeaways: ['Wedges slope against the trend and usually break with it.', 'Rectangle target: add its height to the breakout.', 'Measured move: the second leg tends to match the first, as a guide, not a promise.'],
      },
      {
        id: 'mu-gaps',
        title: 'Gaps and what they mean',
        hook: 'Empty spaces on a chart tell you who was in a hurry, and when.',
        mins: 9,
        steps: [
          {
            h: 'Four kinds of gaps',
            body: `<p>A [[price-gap|gap]] is a range on the chart where no trading took place. Murphy sorts gaps by where they appear:</p>
<ul><li>Common gaps happen inside trading ranges and mean little.</li>
<li>A [[breakaway-gap]] launches a new move.</li>
<li>A [[runaway-gap]] appears in the middle of a strong trend, often about halfway, which is why it is also called a measuring gap.</li>
<li>An [[exhaustion-gap]] appears near the end, as the last buyers rush in.</li></ul>
<p>Watch them appear on one chart, followed by an [[island-reversal]].</p>`,
            viz: { type: 'gapStory' },
          },
          {
            h: 'Name that gap',
            body: `<p>Sort each gap by where it appears.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'common', label: 'Common' },
                { k: 'breakaway', label: 'Breakaway' },
                { k: 'runaway', label: 'Runaway' },
                { k: 'exhaustion', label: 'Exhaustion' },
              ],
              items: [
                ['The price gaps up out of a three-month trading range on heavy volume.', 'breakaway', 'Leaving a range with a gap is a breakaway gap.'],
                ['Halfway through a strong rally, the price gaps up again and keeps going.', 'runaway', 'Gaps in the middle of a trend are runaway, or measuring, gaps.'],
                ['After a long, steep rise, the price gaps up, stalls, and fills the gap three days later.', 'exhaustion', 'A late gap that is quickly filled signals exhaustion.'],
                ['Inside a quiet sideways range, the price gaps slightly and fills it the next day.', 'common', 'Gaps inside ranges usually mean little.'],
                ['A stock gaps down out of a long top as volume surges.', 'breakaway', 'Breakaway gaps happen in both directions.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'A runaway gap is also called a measuring gap because…', choices: ['It often appears about halfway through the move', 'It measures volume', 'It is always 5% wide'], a: 0, why: 'Doubling the distance from the start of the move to the gap gives a rough target.' },
          { q: 'An exhaustion gap is usually…', choices: ['Filled within a few days', 'Never filled', 'The start of a new trend'], a: 0, why: 'It marks the last burst of buying, and the price soon falls back through it.' },
          { q: 'An island reversal forms when…', choices: ['A cluster of bars is cut off by gaps on both sides', 'Prices stay flat for a month', 'A stock lists on a new exchange'], a: 0, why: 'The gaps strand the last buyers above the market.' },
        ],
        takeaways: ['Where a gap appears tells you what it means.', 'Breakaway gaps start moves, runaway gaps measure them, exhaustion gaps end them.', 'An island reversal is one of the strongest reversal signs.'],
      },
    ],
  });
})();
