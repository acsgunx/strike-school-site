/* Pivot Point Trading, Unit 2 — Pivot relationships, the pivot trend, multiple timeframes and the game plan. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'pivot-relationship', term: 'Two-day pivot relationship', w: 'two-day pivot relationship', def: 'How today’s central pivot range sits compared with yesterday’s: higher, lower, overlapping, unchanged, inside or outside. It suggests the bias before the market opens.' },
      { id: 'higher-value', term: 'Higher value', w: 'higher value', def: 'Today’s whole CPR sits above yesterday’s. Buyers moved value up, so the bias is bullish.' },
      { id: 'lower-value', term: 'Lower value', w: 'lower value', def: 'Today’s whole CPR sits below yesterday’s. Sellers moved value down, so the bias is bearish.' },
      { id: 'overlapping-value', term: 'Overlapping value', w: 'overlapping value', def: 'Today’s CPR has moved up or down but still overlaps yesterday’s. It is a weaker version of higher or lower value.' },
      { id: 'inside-value', term: 'Inside value', w: 'inside value', def: 'Today’s CPR fits entirely inside yesterday’s. Value is tightening, which often comes before a breakout.' },
      { id: 'outside-value', term: 'Outside value', w: 'outside value', def: 'Today’s CPR is wider than yesterday’s on both sides. The balance zone has widened, which often means a sideways day.' },
      { id: 'pivot-trend', term: 'Pivot trend', w: 'pivot trend', def: 'The direction of the daily CPRs over several days. A run of higher values is an uptrend, a run of lower values a downtrend.' },
      { id: 'weekly-pivots', term: 'Weekly and monthly pivots', w: 'weekly and monthly pivots', def: 'Pivot levels calculated with the same formulas from last week’s or last month’s high, low and close. They change less often and are watched by longer-term traders.' },
      { id: 'hot-zone', term: 'Hot zone', w: 'hot zone', def: 'A narrow price area where levels from different timeframes, such as a daily S1 and a weekly pivot, land close together. Reactions there tend to be stronger.' },
    ],
    'pivots'
  );

  SS.PIVOT_UNITS.push({
    n: 2,
    title: 'Relationships, trend and timeframes',
    blurb: 'Compare today’s CPR with yesterday’s, follow the pivot trend across weeks, find hot zones where timeframes meet, and turn it all into a plan before the open.',
    lessons: [
      {
        id: 'two-day-relationships',
        title: 'Two-day pivot relationships',
        hook: 'Compare today’s CPR with yesterday’s to read the bias before the open.',
        mins: 9,
        steps: [
          {
            h: 'Where did value move?',
            body: `<p>The central pivot range marks where the market found balance. Today's CPR is built from yesterday's trading, so comparing it with yesterday's CPR shows which way value moved overnight. That comparison is the [[pivot-relationship]].</p>
<p>There are seven possible relationships. Pick each one, or drag today's CPR yourself, and watch the label change.</p>`,
            predict: {
              q: 'Today’s whole CPR sits above yesterday’s. Which bias does that suggest?',
              choices: ['Bullish', 'Bearish', 'Sideways'],
              a: 0,
              why: 'Value moved up: yesterday’s buyers won, and the market is now balancing at higher prices. That is higher value, a bullish relationship.',
            },
            viz: { type: 'cprRelations' },
          },
          {
            h: 'Higher and lower value',
            body: `<p>[[higher-value|Higher value]] is the most bullish relationship: today's CPR sits entirely above yesterday's. Traders lean toward buying, and they expect today's CPR to act as support. [[lower-value|Lower value]] is the mirror image and the most bearish.</p>
<p>When today's CPR moves up or down but still touches yesterday's, it is [[overlapping-value]]: the same lean, held with less conviction. Replay two days and see today's CPR appear the moment yesterday closes.</p>`,
            viz: { type: 'relationDay', set: ['higher', 'lower'] },
          },
          {
            h: 'Inside and outside value',
            body: `<p>[[inside-value|Inside value]] means today's CPR fits inside yesterday's. The market is coiling, and a coil often releases as a breakout, especially when the CPR is also narrow.</p>
<p>[[outside-value|Outside value]] means today's CPR is wider than yesterday's on both sides. That usually comes from a day that closed near an extreme, and the next day tends to rotate sideways inside the wide zone. Unchanged value, when the two ranges almost match, points to a quiet day or a breakout that is still building.</p>`,
            predict: {
              q: 'Today’s CPR is tiny and sits inside yesterday’s. What kind of day do pivot traders get ready for?',
              choices: ['A breakout in either direction', 'A quiet day with no movement', 'A guaranteed rally'],
              a: 0,
              why: 'Inside value shows tightening balance. Tight balance tends to resolve with a strong move, but the relationship alone does not say which way.',
            },
            viz: { type: 'relationDay', set: ['inside', 'outside'] },
          },
          {
            h: 'Name that relationship',
            body: `<p>Reading the relationship should take a glance. Each round shows yesterday's CPR and today's. Name the relationship, then read what it suggests.</p>`,
            viz: { type: 'relQuiz' },
          },
        ],
        quiz: [
          { q: 'Yesterday’s CPR ran from $50.00 to $50.40. Today’s runs from $50.60 to $50.90. The relationship is…', choices: ['Higher value', 'Overlapping higher value', 'Inside value'], a: 0, why: 'Today’s bottom ($50.60) is above yesterday’s top ($50.40), so the whole range moved up.' },
          { q: 'Today’s CPR is above yesterday’s but still overlaps it. The bias is…', choices: ['Moderately bullish', 'Strongly bearish', 'Exactly neutral'], a: 0, why: 'Overlapping higher value leans bullish, with less conviction than a clean higher value.' },
          { q: 'Which relationship most often comes before a breakout?', choices: ['Inside value', 'Outside value', 'Lower value'], a: 0, why: 'A CPR inside the previous one shows value tightening, and tight balance tends to resolve with a strong move.' },
        ],
        takeaways: ['Compare today’s CPR with yesterday’s to see which way value moved.', 'Higher value is bullish, lower value is bearish, and overlapping versions are weaker.', 'Inside value hints at a breakout; outside value hints at a sideways day.'],
      },
      {
        id: 'pivot-trend',
        title: 'The pivot trend',
        hook: 'String daily CPRs together to see the bigger trend.',
        mins: 8,
        steps: [
          {
            h: 'CPRs climbing a staircase',
            body: `<p>One relationship describes a single day. Line up the CPRs for several weeks and you see the [[pivot-trend]]. In a healthy uptrend, most days print higher value and the CPR boxes climb like a staircase.</p>
<p>Each box below is that day's CPR, colored by its relationship with the day before. The strip underneath keeps score. A few red boxes during pullbacks are normal; what matters is the run.</p>`,
            viz: { type: 'pivotTrend', scen: 'up' },
          },
          {
            h: 'Trading with the pivot trend',
            body: `<p>While the pivot trend is up, pivot traders mostly look for buys. A classic one: price opens above the CPR, dips into it during the day and closes back above it. The CPR acted as support, just as the trend suggested.</p>
<p>The marks below show days that met those rules while most recent CPRs were climbing. Green means the stock was higher three days later. Not every signal works, which is why every trade still needs a stop.</p>`,
            viz: { type: 'pivotTrend', scen: 'up', marks: true },
          },
          {
            h: 'When the trend turns',
            body: `<p>Trends end. The warning sign is a change in the run: after weeks of higher value, lower values start to appear and then dominate. At that point the playbook flips, from buying dips into the CPR to selling rallies into it.</p>`,
            predict: {
              q: 'After weeks of higher value, the CPR prints lower value three days in a row. What should a pivot trader do?',
              choices: ['Stop buying dips and get ready to sell rallies', 'Buy more because prices are lower', 'Ignore it; one trend lasts forever'],
              a: 0,
              why: 'A run of lower values means value is now moving down. Buying dips works against that new pivot trend.',
            },
            viz: { type: 'pivotTrend', scen: 'turn', marks: true },
          },
        ],
        quiz: [
          { q: 'The pivot trend is…', choices: ['The direction of the daily CPRs over several days', 'The pivot of a single day', 'A moving average of volume'], a: 0, why: 'It strings daily relationships together to show the bigger direction of value.' },
          { q: 'In a rising pivot trend, price dips into the CPR and closes back above it. That suggests…', choices: ['The CPR acted as support, a possible buy', 'The trend has ended', 'A sell signal'], a: 0, why: 'Holding the CPR on a dip is what an uptrend should do.' },
          { q: 'What is the clearest sign that a pivot uptrend is ending?', choices: ['A run of lower values starts to dominate', 'One red candle', 'A narrow CPR'], a: 0, why: 'One lower value can be a pullback. A run of them means value is moving down.' },
        ],
        takeaways: ['A run of higher values is a pivot uptrend; a run of lower values is a downtrend.', 'In an uptrend, dips into the CPR that close back above it are buying chances.', 'When lower values start to dominate, flip from buying dips to selling rallies.'],
      },
      {
        id: 'multi-timeframe-pivots',
        title: 'Weekly and monthly pivots',
        hook: 'Bigger timeframes, bigger levels, and the hot zones where they meet.',
        mins: 9,
        steps: [
          {
            h: 'Same formulas, longer periods',
            body: `<p>Nothing new to learn here: [[weekly-pivots]] use exactly the same formulas, fed with last week's or last month's high, low and close instead of yesterday's.</p>
<p>The difference is how long the levels last. Daily levels change every morning. Weekly levels stay put for a week, and monthly levels for about 21 trading days. Day traders lean on daily pivots, swing traders on weekly ones and position traders on monthly ones. Switch timeframes and watch how often the lines step.</p>`,
            viz: { type: 'tfPivots' },
          },
          {
            h: 'Hot zones',
            body: `<p>Different timeframes reach different traders. When a daily level, a weekly level and a monthly level land within a few cents of each other, all of those traders are watching nearly the same price. Pivot traders call that cluster a [[hot-zone]] and expect stronger reactions there.</p>
<p>Here are today's daily, weekly and monthly levels side by side. Widen or tighten what counts as “close” and see which zones light up.</p>`,
            predict: {
              q: 'The daily S1 is $98.67, the weekly pivot $98.70 and the monthly pivot $98.60. What does that cluster suggest?',
              choices: ['A strong support area to watch closely', 'Levels that cancel each other out', 'Nothing, because they come from different timeframes'],
              a: 0,
              why: 'Three timeframes agree within 10 cents, so traders of every horizon are watching the same price. Reactions there tend to be stronger.',
            },
            viz: { type: 'hotZones' },
          },
          {
            h: 'A day at the hot zones',
            body: `<p>Now trade through a session with all three timeframes on the chart. The morning sell-off runs into the support hot zone near $98.65, where three levels meet. The afternoon rally runs into the resistance zone near $102.50, where the weekly and daily R1 sit close together.</p>
<p>Single levels in between get crossed easily. The clusters are where the day turns.</p>`,
            viz: { type: 'levelDay', set: ['hotzone'] },
          },
        ],
        quiz: [
          { q: 'The weekly pivot is calculated from…', choices: ['Last week’s high, low and close', 'Yesterday’s high, low and close', 'The weekly volume'], a: 0, why: 'Same formula, longer period: the prior week’s three key prices.' },
          { q: 'Which levels change least often?', choices: ['Monthly pivots', 'Weekly pivots', 'Daily pivots'], a: 0, why: 'Monthly levels stay fixed for the whole month.' },
          { q: 'A hot zone is…', choices: ['A cluster of levels from different timeframes close together', 'The day’s highest price', 'Any level touched twice'], a: 0, why: 'When timeframes agree, more traders watch the same price.' },
        ],
        takeaways: ['Weekly and monthly pivots use the same formulas on longer periods.', 'Longer-timeframe levels change less often and reach longer-term traders.', 'Clusters of levels from different timeframes form hot zones, where reactions tend to be stronger.'],
      },
      {
        id: 'pivot-game-plan',
        title: 'Your pre-market game plan',
        hook: 'Combine width, relationship and the open into a written plan.',
        mins: 9,
        steps: [
          {
            h: 'Three questions before the open',
            body: `<p>Everything so far fits into a short routine you can run before the bell:</p>
<p>1. How wide is today's CPR? Narrow hints at a [[trend-day]], wide at a [[range-day]].<br>2. How does it relate to yesterday's? That sets the bias.<br>3. Where does price open: above, inside or below the CPR? An open that agrees with the bias strengthens it.</p>
<p>Change yesterday's prices and the open, and the plan rewrites itself.</p>`,
            viz: { type: 'gamePlan' },
          },
          {
            h: 'Plan the trade, then trade the plan',
            body: `<p>Take the starting plan from the last step. Yesterday's high was $102, its low $98 and its close $100.60, so today's CPR runs from $100.00 to $100.40, R1 is $102.40 and value moved higher. Price opens above the CPR, so the plan is to buy a dip that holds the CPR top.</p>
<p>Before entering, the plan already says where it is wrong: a close back below the CPR bottom at $100.00. Replay a day where the plan works and one where it fails. A good plan does not win every time; it keeps losses small.</p>`,
            viz: { type: 'levelDay', set: ['works', 'fails'] },
          },
          {
            h: 'A pivot trader’s checklist',
            body: `<p>Tap each card for the reason behind every step of the routine.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Step',
              back: 'Why',
              items: [
                ['Mark the levels', 'Draw P, the CPR, R1–R2 and S1–S2, plus weekly and monthly levels.', 'You cannot react to a level you have not drawn. Hot zones deserve the most attention.'],
                ['Read the width', 'Is the CPR narrow or wide compared with recent days?', 'It sets how far you aim: R2 or S2 on a possible trend day, R1 or S1 on a likely range day.'],
                ['Read the relationship', 'Higher, lower, overlapping, inside, outside or unchanged?', 'It sets the bias, the side you favor before the first trade.'],
                ['Watch the open', 'Does price open above, inside or below the CPR?', 'An open that agrees with the relationship strengthens the bias. One that disagrees calls for patience.'],
                ['Know where you are wrong', 'Every trade gets an exit beyond a level.', 'A close back through the CPR, or through the level you traded from, ends the idea while the loss is still small.'],
                ['Let price confirm', 'Levels show where to look, not when to trade.', 'Wait for a bounce, a rejection or a break with follow-through before acting.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'The relationship is higher value and price opens above the CPR. The plan leans…', choices: ['Bullish: buy dips that hold the CPR', 'Bearish: sell the open', 'Neutral: no trades'], a: 0, why: 'The relationship and the open agree, so the bias is bullish and the CPR is the first support.' },
          { q: 'Where should a bullish CPR plan admit it is wrong?', choices: ['On a close back below the CPR bottom', 'Only at the day’s close', 'Never'], a: 0, why: 'If price cannot stay above the zone that was supposed to be support, the idea has failed.' },
          { q: 'The relationship is neutral and the CPR is very narrow. A sensible plan is to…', choices: ['Wait for a break out of the CPR, then trade in that direction', 'Sell at every level', 'Buy and hold all day'], a: 0, why: 'A narrow, undecided CPR hints at a move but not its direction, so let the break decide.' },
        ],
        takeaways: ['Before the open: read the width, the relationship and the open.', 'Write the bias, the entry level, the target and the point where the idea is wrong.', 'A plan keeps losses small; it does not promise wins.'],
      },
    ],
  });
})();
