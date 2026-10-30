/* Pivot Point Trading, Unit 3 — The Camarilla equation: levels, the fade and breakout plays, relationships and confluence. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'camarilla', term: 'Camarilla equation', w: 'Camarilla equation', def: 'A set of eight levels built around the prior close: H1–H4 above and L1–L4 below. Each adds or subtracts a slice of 1.1 × the prior range, so the levels sit much closer to price than floor pivots.', ex: 'H $102, L $98, C $101 → H3 $102.10, L3 $99.90, H4 $103.20, L4 $98.80.' },
      { id: 'camarilla-reversal', term: 'H3 and L3', w: 'H3 and L3', def: 'The inner Camarilla levels, C ± 1.1 × (H − L) ÷ 4. When price opens between them, traders look to sell rejections at H3 and buy bounces at L3.' },
      { id: 'camarilla-breakout', term: 'H4 and L4', w: 'H4 and L4', def: 'The outer Camarilla levels, C ± 1.1 × (H − L) ÷ 2. A close beyond H4 or L4 suggests the range has broken and a trend day may follow.' },
      { id: 'fade', term: 'Fade', w: 'fade', def: 'To trade against a move at a level: selling a rally into resistance or buying a drop into support, expecting price to turn back.' },
      { id: 'camarilla-width', term: 'Camarilla width', w: 'Camarilla width', def: 'The distance from L3 to H3, equal to 0.55 × the prior day’s range. Unlike CPR width, it depends only on how big the range was, not on where the close sat.' },
    ],
    'pivots'
  );

  SS.PIVOT_UNITS.push({
    n: 3,
    title: 'The Camarilla equation',
    blurb: 'Eight levels hugging yesterday’s close: fade H3 and L3 inside the range, follow H4 and L4 when it breaks, and combine them with floor pivots.',
    lessons: [
      {
        id: 'camarilla-equation',
        title: 'The Camarilla equation',
        hook: 'Eight levels that hug yesterday’s close.',
        mins: 9,
        steps: [
          {
            h: 'A different kind of pivot',
            body: `<p>The [[camarilla]] is another way to turn yesterday's high, low and close into levels for today. Floor pivots start from the pivot point. The Camarilla starts from yesterday's close and adds or subtracts slices of yesterday's range, stretched by a factor of 1.1.</p>
<p>The result is eight levels: H1 to H4 above the close and L1 to L4 below it. Move yesterday's candle and watch them follow the close.</p>`,
            predict: {
              q: 'Yesterday’s high was $102, its low $98 and its close $101. So 1.1 × the range is $4.40. H3 adds a quarter of that to the close. Where is H3?',
              choices: ['$102.10', '$103.20', '$102.67'],
              a: 0,
              why: '$101 + $4.40 ÷ 4 = $102.10. $103.20 is H4, which adds half; $102.67 is the floor pivot R1.',
            },
            viz: { type: 'camCalc' },
          },
          {
            h: 'Every formula',
            body: `<p>All eight levels share one recipe: yesterday's close, plus or minus 1.1 × (H − L), divided by 2, 4, 6 or 12. The smaller the divisor, the farther the level sits from the close.</p>
<p>Two pairs matter most. [[camarilla-reversal|H3 and L3]] are where traders expect price to turn back. [[camarilla-breakout|H4 and L4]] are where they expect a range to break. H1, H2, L1 and L2 sit so close to the close that most traders treat them as minor.</p>`,
            viz: { type: 'camCalc', formulas: true },
          },
          {
            h: 'Camarilla next to floor pivots',
            body: `<p>Put both sets side by side and two differences stand out. The Camarilla centers on yesterday's close, while floor pivots center on P. And the Camarilla is much tighter: H4 and L4 always sit inside R2 and S2, so its main levels are within reach on an ordinary day.</p>
<p>Neither set is better. Floor pivots map the bigger picture, and the Camarilla maps the day's likely turning points. Many traders watch both.</p>`,
            viz: { type: 'camCalc', compare: true },
          },
          {
            h: 'Width follows the range',
            body: `<p>The [[camarilla-width]], from L3 to H3, works out to exactly 0.55 × yesterday's range. Compare that with the CPR, whose width depends on where yesterday closed.</p>
<p>So the two measure different things. A tight Camarilla means yesterday was a quiet, small-range day, and quiet days often come before a [[breakout]]. Slide the close and watch the CPR change size while the Camarilla only slides along with it.</p>`,
            predict: {
              q: 'Yesterday’s range doubles while the close stays in the same spot within it. What happens to the distance from L3 to H3?',
              choices: ['It doubles', 'It stays the same', 'It halves'],
              a: 0,
              why: 'H3 − L3 = 0.55 × (H − L), so it scales directly with the range.',
            },
            viz: { type: 'camWidth' },
          },
        ],
        quiz: [
          { q: 'The Camarilla levels are centered on…', choices: ['Yesterday’s close', 'The floor pivot P', 'Today’s open'], a: 0, why: 'Every Camarilla level is the prior close plus or minus a slice of the range.' },
          { q: 'H: $50, L: $48, C: $49. H4 is…', choices: ['$50.10', '$49.55', '$51.20'], a: 0, why: '1.1 × $2 = $2.20; half of that is $1.10, so H4 = $49 + $1.10 = $50.10.' },
          { q: 'Which levels are the main reversal levels?', choices: ['H3 and L3', 'H1 and L1', 'R3 and S3'], a: 0, why: 'H3 and L3 are where range traders fade moves; H4 and L4 are the breakout levels.' },
        ],
        takeaways: ['Camarilla levels = yesterday’s close ± 1.1 × the range ÷ 2, 4, 6 or 12.', 'H3/L3 are reversal levels; H4/L4 are breakout levels.', 'The L3-to-H3 width is 0.55 × yesterday’s range: tight after quiet days.'],
      },
      {
        id: 'camarilla-plays',
        title: 'Trading H3, L3, H4 and L4',
        hook: 'Fade the inner levels, follow the outer ones.',
        mins: 10,
        steps: [
          {
            h: 'The open sets the play',
            body: `<p>The Camarilla playbook starts with where price opens. Between L3 and H3 is the <mark>range zone</mark>, where traders [[fade]] moves to the edges. Between H3 and H4, or L3 and L4, is a decision zone: price either breaks out or falls back inside. Beyond H4 or L4 is trend territory.</p>
<p>Slide the open through the levels and read the play for each zone.</p>`,
            viz: { type: 'camPlaybook' },
          },
          {
            h: 'Fading H3 and L3',
            body: `<p>When price opens inside the range and rallies to H3, the classic play is to sell the rejection and aim back at the middle, yesterday's close. The [[stop-loss]] goes at H4: if price gets there, the range idea is wrong. L3 is the mirror image.</p>
<p>Notice the numbers. These fades risk a little more than they aim to make, about 0.8 [[r-multiple|R]] here. That only pays if fades work most of the time, which is why they belong to range days.</p>`,
            viz: { type: 'camDay', set: ['fadeH3', 'fadeL3'] },
          },
          {
            h: 'Following H4 and L4',
            body: `<p>A close beyond H4 says yesterday's range could not hold price. Now the play flips from fading to following: buy the [[breakout]], and exit if price closes back below H3, inside the range it just escaped. L4 is the mirror image for shorts.</p>
<p>Breakouts have no fixed target. On a trend day the move can run into the close, so traders hold while the level holds.</p>`,
            viz: { type: 'camDay', set: ['breakH4', 'breakL4'] },
          },
          {
            h: 'When a breakout fails',
            body: `<p>Not every close above H4 starts a trend. A [[false-breakout]] slips back inside the range, and the exit rule decides the damage: a close back below H3 ends the trade at about −1R.</p>
<p>Failed breakouts often swing back toward the middle, which is why fast exits matter. Holding and hoping turns a planned loss into a big one.</p>`,
            predict: {
              q: 'You bought a close above H4. Twenty minutes later price closes back below H3. What does the plan say?',
              choices: ['Exit the long: the breakout failed', 'Buy more at the lower price', 'Wait for the close of the day'],
              a: 0,
              why: 'A close back inside the range means the breakout idea is wrong. Taking the planned loss keeps it small.',
            },
            viz: { type: 'camDay', set: ['failH4'] },
          },
        ],
        quiz: [
          { q: 'Price opens between L3 and H3 and rallies to H3. The classic Camarilla play is to…', choices: ['Sell the rejection, stop beyond H4', 'Buy the breakout immediately', 'Sell at L3'], a: 0, why: 'Inside the range, H3 is where sellers are expected, and H4 is where the idea is wrong.' },
          { q: 'A close above H4 suggests…', choices: ['The range has broken; look to follow the move', 'A guaranteed reversal', 'Nothing important'], a: 0, why: 'H4 and L4 are breakout levels; beyond them, fading gets dangerous.' },
          { q: 'After a long breakout above H4, where does the trade admit it is wrong?', choices: ['On a close back below H3', 'Only at the end of the day', 'At R3'], a: 0, why: 'Back inside the H3–L3 range, the breakout has failed.' },
        ],
        takeaways: ['Inside H3–L3: fade the edges, aim for the middle, stop beyond H4 or L4.', 'Beyond H4 or L4: follow the breakout, exit on a close back inside H3 or L3.', 'Failed breakouts happen; a fast, planned exit keeps them small.'],
      },
      {
        id: 'camarilla-confluence',
        title: 'Camarilla relationships and confluence',
        hook: 'Compare days, stack levels, and practice the calls.',
        mins: 9,
        steps: [
          {
            h: 'Two-day Camarilla relationships',
            body: `<p>The relationship idea from Unit 2 works with the Camarilla too: compare today's L3-to-H3 range with yesterday's. A range that sits entirely higher is bullish, entirely lower is bearish, and a range that fits inside yesterday's warns of a breakout.</p>
<p>Inside relationships are especially telling here, because a small Camarilla means yesterday's range shrank. Replay both and watch H4 on day two.</p>`,
            viz: { type: 'camRelDay', set: ['inside', 'higher'] },
          },
          {
            h: 'Where Camarilla meets the floor pivots',
            body: `<p>When a Camarilla level lands right next to a floor pivot or CPR line, two groups of traders are watching the same price. That confluence makes the level stronger, just like the hot zones in Unit 2.</p>
<p>With yesterday at $102, $98 and $101, L4 ($98.80) sits 13 cents from S1 and L3 ($99.90) sits 10 cents from the CPR bottom. Change yesterday's prices and see which levels line up.</p>`,
            viz: { type: 'camConfluence' },
          },
          {
            h: 'Fade, follow or get out?',
            body: `<p>Practice the calls. Each round stops a day at a decision point. Read where price is against the Camarilla levels and pick what the playbook says. Then watch how the rest of the day played out.</p>`,
            viz: { type: 'camQuiz' },
          },
        ],
        quiz: [
          { q: 'Today’s L3-to-H3 range fits inside yesterday’s. That warns of…', choices: ['A possible breakout', 'A guaranteed range day', 'A gap down'], a: 0, why: 'A smaller range inside the last one shows contraction, which often resolves with a strong move.' },
          { q: 'Camarilla L4 is $98.80 and the floor S1 is $98.67. That cluster is…', choices: ['A stronger support area', 'A contradiction to ignore', 'A sell signal'], a: 0, why: 'Two methods pointing at nearly the same price draw more attention to it.' },
          { q: 'Price is between H3 and H4, drifting with no close beyond either. The playbook says…', choices: ['Wait for a close above H4 or back below H3', 'Sell immediately', 'Buy immediately'], a: 0, why: 'The decision zone needs a decision: a break of H4, or a fall back inside the range.' },
        ],
        takeaways: ['Compare L3–H3 ranges across days like CPRs: higher, lower, inside or outside.', 'Camarilla levels near floor pivots or the CPR form stronger zones.', 'Name the play before the trade: fade, follow, or get out.'],
      },
    ],
  });
})();
