/* Pivot Point Trading, Unit 5 — Reversal setups at pivot levels: wick, extreme, outside and doji reversals, and putting it all together. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'wick-reversal', term: 'Wick reversal', w: 'wick reversal', def: 'A single bar with a long wick on one side and a small body near the other end. In our version the wick is at least 2.5 times the body, the close sits in the far third of the bar, and the bar is at least as big as recent bars.' },
      { id: 'extreme-reversal', term: 'Extreme reversal', w: 'extreme reversal', def: 'An unusually large bar in the direction of the move, at least twice the recent average with a body of at least half its range, followed by a bar that turns the other way and closes beyond the big bar’s midpoint.' },
      { id: 'outside-reversal', term: 'Outside reversal', w: 'outside reversal', def: 'A bar that takes out both the high and the low of the bar before it, then closes beyond that bar’s far extreme: above its high for a bullish reversal, below its low for a bearish one.' },
      { id: 'doji-reversal', term: 'Doji reversal', w: 'doji reversal', def: 'A doji, a bar whose body is at most a tenth of its range, followed by a bar that closes beyond the doji’s high (bullish) or low (bearish), confirming that the indecision resolved.' },
      { id: 'setup-at-level', term: 'Setup at a level', w: 'setup at a level', def: 'A price-action setup that forms right at a pivot, Camarilla or value level. Setups appear all day; the ones at levels are the ones pivot traders act on.' },
    ],
    'pivots'
  );

  SS.PIVOT_UNITS.push({
    n: 5,
    title: 'Reversal setups at the levels',
    blurb: 'Levels show where to look; price action shows when to act. Learn four reversal setups, trade them with stops and targets, and put the whole method together.',
    lessons: [
      {
        id: 'wick-reversal',
        title: 'The wick reversal',
        hook: 'One bar that shows a level being defended.',
        mins: 8,
        steps: [
          {
            h: 'Anatomy of a wick reversal',
            body: `<p>A level tells you where to pay attention. A setup tells you that something actually happened there. The simplest is the [[wick-reversal]]: price pushes through a level during the bar, gets slammed back, and closes near the other end. The long [[wick]] is the footprint of the rejected prices.</p>
<p>Our version has three checks. Shape the bar and watch them turn green.</p>`,
            predict: {
              q: 'At S1, a bar’s lower wick is three times its body and it closes near its high. What does that suggest?',
              choices: ['Buyers rejected the lower prices at S1', 'Sellers are firmly in control', 'Nothing, because wicks are random'],
              a: 0,
              why: 'Price traded below the level, then buyers pushed it back up before the bar closed. That rejection is the whole point of the setup.',
            },
            viz: { type: 'candleBuilder' },
          },
          {
            h: 'Trading it at L3',
            body: `<p>Here price drifts down into the Camarilla L3. A bullish wick reversal forms right on the level. The trade:</p>
<p>Buy at the close of the signal bar. Put the [[stop-loss]] just below the wick, because if price breaks the low that buyers defended, the idea is wrong. Aim for the next level up, here the top of the CPR. Watch the [[r-multiple|R]] it earns.</p>`,
            viz: { type: 'setupDay', set: ['wickL3'] },
          },
          {
            h: 'When the setup fails',
            body: `<p>The same picture can fail. Here the wick reversal at S1 looks just as good, but sellers return and break the wick's low. The stop turns a bad trade into a small, planned loss.</p>
<p>No setup works every time. What makes the method work is that wins tend to be larger than the fixed, small losses.</p>`,
            viz: { type: 'setupDay', set: ['failWick'] },
          },
        ],
        quiz: [
          { q: 'A bullish wick reversal has…', choices: ['A long lower wick and a close near the high', 'A long upper wick and a close near the low', 'No wicks at all'], a: 0, why: 'The long lower wick shows lower prices being rejected.' },
          { q: 'Where does the stop go on a bullish wick reversal?', choices: ['Just below the wick’s low', 'At the day’s high', 'There is no stop'], a: 0, why: 'Breaking the low that buyers defended means the idea is wrong.' },
          { q: 'Why insist that the bar be at least as big as recent bars?', choices: ['A tiny bar with a wick shows little real rejection', 'Big bars always win', 'It is a broker rule'], a: 0, why: 'A meaningful rejection needs a meaningful move.' },
        ],
        takeaways: ['A wick reversal is a long rejection wick with the close at the other end.', 'Enter on the close, stop beyond the wick, target the next level.', 'Some setups fail; the stop keeps those losses small.'],
      },
      {
        id: 'more-reversals',
        title: 'Extreme, outside and doji reversals',
        hook: 'Three two-bar patterns that flip a move at a level.',
        mins: 10,
        steps: [
          {
            h: 'Three two-bar setups',
            body: `<p>The other three setups each take two bars:</p>
<p>An [[extreme-reversal]] starts with an unusually big bar in the direction of the move, a final flush, and then a bar that turns and closes past its midpoint. An [[outside-reversal]] is a bar that takes out both ends of the bar before it and closes beyond the far end. A [[doji-reversal]] is a moment of indecision followed by a bar that settles it.</p>
<p>Pick each one and watch it build. The thresholds are our versions; traders tune them.</p>`,
            viz: { type: 'setupGallery' },
          },
          {
            h: 'Extreme reversal at L3',
            body: `<p>A big bearish bar flushes price through L3, the kind of move that often marks the last sellers giving up. The next bar turns up and closes above the big bar's midpoint: buy, with the stop just below the two bars' low.</p>`,
            viz: { type: 'setupDay', set: ['extremeL3'] },
          },
          {
            h: 'Outside reversal at H3',
            body: `<p>The mirror image of a bullish setup works for shorts. Price rallies into H3, then one bar pokes above the prior bar's high, reverses and closes below its low. Sell, with the stop just above the outside bar, aiming for the middle of the Camarilla, yesterday's close.</p>`,
            viz: { type: 'setupDay', set: ['outsideH3'] },
          },
          {
            h: 'Doji reversal at the CPR',
            body: `<p>Price slides to the bottom of the CPR, where the Camarilla L3 sits just 10 cents lower. That makes it a small hot zone. A [[doji]] forms: neither side wins the bar. The next bar closes above the doji's high, and the tie is broken in the buyers' favor.</p>`,
            viz: { type: 'setupDay', set: ['dojiBC'] },
          },
        ],
        quiz: [
          { q: 'An extreme reversal begins with…', choices: ['An unusually large bar in the direction of the move', 'A doji', 'A gap'], a: 0, why: 'The big bar is the final push; the next bar reverses it.' },
          { q: 'A bullish outside reversal bar…', choices: ['Takes out the prior bar’s high and low and closes above its high', 'Stays inside the prior bar', 'Closes below the prior low'], a: 0, why: 'It engulfs the prior bar and closes beyond its top.' },
          { q: 'A doji reversal is confirmed when…', choices: ['The next bar closes beyond the doji’s high or low', 'The doji itself closes up', 'Volume is zero'], a: 0, why: 'The doji shows indecision; the next close shows which side won.' },
        ],
        takeaways: ['Extreme: a big flush, then a close back past its midpoint.', 'Outside: engulf the prior bar and close beyond its far end.', 'Doji: indecision, then a close beyond the doji confirms the turn.'],
      },
      {
        id: 'setups-in-context',
        title: 'Putting it all together',
        hook: 'Levels for where, setups for when, a plan for how much.',
        mins: 10,
        steps: [
          {
            h: 'Setups are everywhere',
            body: `<p>Scan any chart and reversal patterns show up all day, most of them in the middle of nowhere. The method's edge comes from the [[setup-at-level|setups at levels]]: patterns that form right where many traders are already watching.</p>
<p>Toggle the filter and see how many drop out. Even the survivors still need a plan: a stop, a target and a reason to favor that side.</p>`,
            viz: { type: 'setupScan' },
          },
          {
            h: 'Name that setup',
            body: `<p>Each round shows a short stretch of bars ending at a level. Name the setup that just formed.</p>`,
            viz: { type: 'setupQuiz' },
          },
          {
            h: 'One day, start to finish',
            body: `<p>Now everything at once. Before the open: read the CPR, note where price opens, and mark hot zones where methods agree. During the day: wait for price to reach a zone, then wait for a setup. Then trade it with a stop and a target you chose in advance.</p>
<p>Replay the day and follow the plan step by step.</p>`,
            viz: { type: 'setupDay', set: ['fullDay'] },
          },
          {
            h: 'The pivot trader’s checklist',
            body: `<p>The whole course on six cards. Tap each one for the reason behind it.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Rule',
              back: 'Why',
              items: [
                ['Map the levels first', 'Floor pivots, the CPR, Camarilla and the money zone, before the open.', 'Reactions happen where many traders are watching. Know those prices before you need them.'],
                ['Read the bias', 'CPR width, two-day relationships and the open.', 'They tell you which side to favor and whether to expect a trend or a range.'],
                ['Favor hot zones', 'Levels from different methods or timeframes that line up.', 'More eyes on the same price make reactions there more likely.'],
                ['Wait for a setup', 'A wick, extreme, outside or doji reversal at the level.', 'The level says where; the setup says the reaction is actually happening.'],
                ['Decide the exit first', 'Stop beyond the setup, target at the next level.', 'You know the risk before you enter, so one loss can never be a disaster.'],
                ['Judge the process', 'A good trade can lose; a bad one can win.', 'Over many trades, following the plan is what adds up, not any single result.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Why do pivot traders ignore most reversal patterns?', choices: ['Most form away from any level that others are watching', 'Patterns never work', 'They only trade on Fridays'], a: 0, why: 'A setup matters when it forms at a level with shared attention.' },
          { q: 'Which order matches the method?', choices: ['Map levels, read the bias, wait for a setup at a level, trade with a stop and target', 'Buy the open, then look for levels', 'Trade every pattern immediately'], a: 0, why: 'Preparation first, then patience, then a defined-risk trade.' },
          { q: 'A trade followed the plan and lost 1R. That was…', choices: ['A good trade with a bad outcome', 'Proof the method is broken', 'A reason to double the size next time'], a: 0, why: 'Losses within plan are part of any method. Judge the process over many trades.' },
        ],
        takeaways: ['Levels say where, setups say when, the plan says how much.', 'Favor setups at hot zones where methods agree.', 'Small planned losses plus larger wins is the goal, not winning every trade.'],
      },
    ],
  });
})();
