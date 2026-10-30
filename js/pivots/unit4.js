/* Pivot Point Trading, Unit 4 — The money zone: volume at price, the value area, trading around value and profile shapes. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'volume-profile', term: 'Volume profile', w: 'volume profile', def: 'A sideways histogram of how much volume traded at each price during a session. Market profile charts do the same with time spent at each price.' },
      { id: 'point-of-control', term: 'Point of control (POC)', w: 'point of control (POC)', def: 'The price where the most volume traded in a session: the price the market treated as fairest.' },
      { id: 'value-area', term: 'Value area (VAH, VAL)', w: 'value area', def: 'The price range around the POC that holds about 70% of a session’s volume. Its top is the value area high (VAH) and its bottom the value area low (VAL).' },
      { id: 'money-zone', term: 'Money zone', w: 'money zone', def: 'Ochoa’s name for the prior session’s value area and point of control, used as levels for today, much like pivots.' },
      { id: 'value-acceptance', term: 'Acceptance and rejection', w: 'acceptance', def: 'When price trades outside yesterday’s value and stays there, value is being accepted at the new prices. When it quickly returns inside, the new prices were rejected.' },
      { id: 'profile-shape', term: 'Profile shape', w: 'profile shape', def: 'The outline of a day’s volume profile. A bell suggests balance, a long thin profile a trend, two humps a shift in value, and P or b shapes one-sided buying or selling.' },
    ],
    'pivots'
  );

  SS.PIVOT_UNITS.push({
    n: 4,
    title: 'The money zone',
    blurb: 'See where the volume traded, find the point of control and value area, trade around yesterday’s value, and read the shape of a day’s profile.',
    lessons: [
      {
        id: 'money-zone',
        title: 'Building the money zone',
        hook: 'Where the volume traded tells you where value is.',
        mins: 8,
        steps: [
          {
            h: 'Where did the volume trade?',
            body: `<p>Pivots use only three prices from yesterday. A [[volume-profile]] uses all of them: it stacks every trade at the price where it happened, building a sideways histogram as the day goes on.</p>
<p>Replay a session and watch the profile grow on the right. The longest bar marks the [[point-of-control]], the price where the most business got done.</p>`,
            predict: {
              q: 'On a quiet, back-and-forth day, where does the longest bar of the volume profile usually end up?',
              choices: ['Near the middle of the day’s range', 'At the day’s high', 'At the day’s low'],
              a: 0,
              why: 'Price spends most of a rotating day near the middle, so most of the volume trades there. The extremes are visited only briefly.',
            },
            viz: { type: 'profileBuild' },
          },
          {
            h: 'The value area',
            body: `<p>Starting at the POC and growing outward until it holds about 70% of the volume gives the [[value-area]]. Its edges are the value area high (VAH) and the value area low (VAL).</p>
<p>Inside the value area, buyers and sellers agreed the price was fair. Outside it, prices were brief and one-sided. Change the share and watch the edges move; 70% is the usual convention.</p>`,
            viz: { type: 'profileBuild', va: true },
          },
          {
            h: 'Why value matters',
            body: `<p>Ochoa calls yesterday's value area and POC the [[money-zone]]. Like pivots, it becomes a set of levels for today, but it comes from where trading actually happened. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Level',
              back: 'How traders use it',
              items: [
                ['Point of control', 'Yesterday’s fairest price.', 'It works like a magnet: on quiet days price often drifts back to it.'],
                ['Value area high', 'The top of yesterday’s fair range.', 'Above it, price looks expensive by yesterday’s standards. Sellers often show up there.'],
                ['Value area low', 'The bottom of yesterday’s fair range.', 'Below it, price looks cheap. Buyers often show up there.'],
                ['Outside value', 'Prices yesterday’s traders barely accepted.', 'Today they are either rejected, with price returning to value, or accepted, and value moves.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'The point of control is…', choices: ['The price where the most volume traded', 'The day’s closing price', 'The average of high and low'], a: 0, why: 'It is the longest bar of the volume profile.' },
          { q: 'The value area usually holds about…', choices: ['70% of the volume', '10% of the volume', 'All of the volume'], a: 0, why: 'It grows out from the POC until it holds roughly 70%.' },
          { q: 'The money zone is…', choices: ['Yesterday’s value area and POC used as today’s levels', 'Any level with high volume today', 'The space between R1 and S1'], a: 0, why: 'Ochoa’s term for the prior session’s value levels.' },
        ],
        takeaways: ['A volume profile shows where trading actually happened.', 'POC = most volume; the value area holds about 70% around it.', 'Yesterday’s POC, VAH and VAL become today’s money zone levels.'],
      },
      {
        id: 'trading-value',
        title: 'Trading around value',
        hook: 'Inside value, price rotates. Outside, watch for acceptance or rejection.',
        mins: 10,
        steps: [
          {
            h: 'The open against yesterday’s value',
            body: `<p>As with pivots and the Camarilla, the first clue is where price opens. Opening inside yesterday's value says nothing much has changed. Opening outside it says something has, and the first hour shows whether the market agrees.</p>
<p>Slide the open and read the play.</p>`,
            viz: { type: 'valuePlaybook' },
          },
          {
            h: 'Rotation inside value',
            body: `<p>When price opens inside yesterday's value, the market is still balanced. Price tends to rotate between the edges: VAH acts as resistance, VAL as support, and the POC as a magnet in the middle.</p>
<p>Replay two days. Yesterday builds the profile; today trades inside its money zone.</p>`,
            viz: { type: 'moneyZoneDay', set: ['inside'] },
          },
          {
            h: 'Acceptance or rejection',
            body: `<p>When price opens above value, two things can happen. If it holds above VAH through the first hour, the higher prices are being [[value-acceptance|accepted]] and value is moving up: buy pullbacks to VAH. If it falls back inside value and stays there, the higher prices were rejected.</p>
<p>A well-known rule of thumb, often called the 80% rule, says that after such a rejection price frequently travels all the way across value to the other edge. Treat the number as folklore, not a promise.</p>`,
            predict: {
              q: 'Price opened above yesterday’s VAH, then fell back inside value within 20 minutes and stayed there. What does the rule of thumb suggest?',
              choices: ['A rotation across value toward VAL', 'A strong rally higher', 'Nothing, value does not matter'],
              a: 0,
              why: 'The higher prices were rejected. Back inside value, price often travels to the opposite edge.',
            },
            viz: { type: 'moneyZoneDay', set: ['accept', 'reject'] },
          },
          {
            h: 'Value migration',
            body: `<p>Compare value areas across days and you get the same relationships as the CPR: higher, lower, overlapping, inside or outside. When each day's value sits above the last, value is migrating up, a sign of a healthy uptrend.</p>
<p>Play five days and watch the value areas climb.</p>`,
            viz: { type: 'valueMigration' },
          },
        ],
        quiz: [
          { q: 'Price opens inside yesterday’s value area. The typical expectation is…', choices: ['Rotation between VAL and VAH', 'A breakout trend day', 'A gap fill below VAL'], a: 0, why: 'Inside value, the market is balanced and tends to rotate.' },
          { q: 'Price opens above VAH and stays above it for the whole first hour. That suggests…', choices: ['Acceptance: value is moving higher', 'Rejection of higher prices', 'A sell signal'], a: 0, why: 'Holding outside value means the market accepts the new prices.' },
          { q: 'Each day’s value area sits above the day before. Value is…', choices: ['Migrating higher', 'Migrating lower', 'Unchanged'], a: 0, why: 'Higher value areas day after day mean value is moving up.' },
        ],
        takeaways: ['Open inside value: expect rotation, VAH and VAL as edges, POC as a magnet.', 'Open outside value: holding outside is acceptance; returning inside is rejection.', 'After a rejection, price often rotates across value, but that is a tendency, not a promise.'],
      },
      {
        id: 'profile-shapes',
        title: 'Profile shapes',
        hook: 'A day’s profile has a shape, and the shape tells a story.',
        mins: 7,
        steps: [
          {
            h: 'Five shapes, five stories',
            body: `<p>The outline of a day's volume profile, its [[profile-shape]], summarizes who was in control. A bell is a balanced day. A long, thin profile is a [[trend-day]]. Two humps mean value moved during the day. A P shape, fat at the top, often comes from short sellers buying back. A b shape, fat at the bottom, often comes from buyers giving up.</p>
<p>Switch between shapes and watch each one build.</p>`,
            viz: { type: 'profileShapes' },
          },
          {
            h: 'Name that profile',
            body: `<p>Each round builds a day's profile. Name the shape, then read what it suggests about the next session.</p>`,
            viz: { type: 'shapeQuiz' },
          },
        ],
        quiz: [
          { q: 'A long, thin profile with no clear bulge suggests…', choices: ['A trend day', 'A balanced day', 'A holiday'], a: 0, why: 'Price kept moving, so no single area built up much volume.' },
          { q: 'A profile with two separate humps means…', choices: ['Value moved during the day', 'Nothing traded', 'The day was perfectly balanced'], a: 0, why: 'Trading balanced in one area, then moved and balanced again in another.' },
          { q: 'A P-shaped profile, fat at the top, often follows…', choices: ['Short sellers buying back after an early rally', 'Heavy selling all day', 'A quiet bell-shaped day'], a: 0, why: 'A fast rally and then balance near the highs is typical of short covering.' },
        ],
        takeaways: ['Bell = balance; long and thin = trend; two humps = value moved.', 'P shape: rally then balance high; b shape: drop then balance low.', 'Shapes describe what happened; the next day still has to confirm.'],
      },
    ],
  });
})();
