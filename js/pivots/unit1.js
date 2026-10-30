/* Pivot Point Trading, Unit 1 — Floor pivots and the central pivot range. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'pivot-point', term: 'Pivot point (P)', w: 'pivot point', def: 'The average of the prior period’s high, low and close: (H + L + C) ÷ 3. It works as the day’s balance line: above it buyers lean in control, below it sellers do.' },
      { id: 'floor-pivots', term: 'Floor pivots', w: 'floor pivots', def: 'The classic set of levels built from the prior day: the pivot (P), three resistance levels above (R1, R2, R3) and three support levels below (S1, S2, S3).', ex: 'H $102, L $98, C $101 → P $100.33, R1 $102.67, S1 $98.67.' },
      { id: 'pivot-resistance', term: 'R1, R2, R3', w: 'resistance levels', def: 'Floor-pivot resistance levels above the pivot. R1 = 2P − L, R2 = P + (H − L), R3 = H + 2(P − L).' },
      { id: 'pivot-support', term: 'S1, S2, S3', w: 'support levels', def: 'Floor-pivot support levels below the pivot. S1 = 2P − H, S2 = P − (H − L), S3 = L − 2(H − P).' },
      { id: 'cpr', term: 'Central pivot range (CPR)', w: 'central pivot range (CPR)', def: 'A zone made of three lines: the pivot, the bottom central pivot BC = (H + L) ÷ 2, and the top central pivot TC = 2P − BC. It marks the day’s balance area.' },
      { id: 'cpr-width', term: 'CPR width', w: 'CPR width', def: 'The distance between TC and BC, equal to |2C − H − L| ÷ 3. A narrow CPR follows a day that closed mid-range; a wide CPR follows a day that closed near an extreme.' },
      { id: 'trend-day', term: 'Trend day', w: 'trend day', def: 'A day that opens near one end of its range and moves steadily to the other, breaking through several levels.' },
      { id: 'range-day', term: 'Range day', w: 'range day', def: 'A day that rotates back and forth between levels without a sustained move in either direction.' },
    ],
    'pivots'
  );

  SS.PIVOT_UNITS.push({
    n: 1,
    title: 'Floor pivots and the central pivot range',
    blurb: 'Turn yesterday’s high, low and close into today’s map, read price around it, and learn what the CPR and its width suggest.',
    lessons: [
      {
        id: 'pivot-basics',
        title: 'What pivot points are',
        hook: 'Yesterday’s high, low and close become today’s map.',
        mins: 7,
        steps: [
          {
            h: 'Yesterday’s prices, today’s map',
            body: `<p>A [[pivot-point]] turns yesterday's high, low and close into a set of price levels for today. Because the formula is simple and public, every trader who uses it sees exactly the same levels. That shared attention is a big part of why price often reacts near them.</p>
<p>Move yesterday's candle and watch today's levels project across the chart.</p>`,
            predict: {
              q: 'Yesterday’s high was $102, its low $98 and its close $101. Where is today’s pivot (P)?',
              choices: ['$100.00', '$100.33', '$101.00'],
              a: 1,
              why: '(102 + 98 + 101) ÷ 3 = $100.33. The pivot is a balance point that leans toward where yesterday closed.',
            },
            viz: { type: 'pivotCalc' },
          },
          {
            h: 'The full set of floor pivots',
            body: `<p>The [[floor-pivots]] add three [[pivot-resistance|resistance levels]] above the pivot and three [[pivot-support|support levels]] below it. Each one is a small formula of yesterday's high, low and close.</p>
<p>R1 and S1 are the first places price usually reacts. R2 and S2 mark an extended move. R3 and S3 are reached only on unusually strong days. Change yesterday's range and see every formula update.</p>`,
            viz: { type: 'pivotCalc', formulas: true },
          },
          {
            h: 'Why pivots can work, and their limits',
            body: `<p>Pivots began as quick reference levels for floor traders in the exchange pits. In <i>Secrets of a Pivot Boss</i> (2010), trader Frank O. Ochoa built a fuller framework on them: the central pivot range, pivot relationships, Camarilla levels, the money zone and price-action setups. This course explains those ideas in our own words. It is not affiliated with the author, and the book itself has the complete method.</p>
<p>Tap each card for one reason pivots matter, and one big limit.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Idea',
              back: 'Why it matters',
              items: [
                ['Shared attention', 'Everyone calculates the same levels.', 'Orders cluster near widely watched prices, so reactions there become more likely.'],
                ['Objective', 'No judgment needed to draw them.', 'Two traders never disagree about where a pivot is, unlike hand-drawn trendlines.'],
                ['Yesterday’s balance', 'They summarize where trading happened.', 'The pivot sits where yesterday’s buyers and sellers roughly balanced.'],
                ['Not magic', 'Price can slice straight through them.', 'Levels show where to pay attention. Price action at the level decides the trade.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'The pivot point is calculated as…', choices: ['(High + Low + Close) ÷ 3 of the prior day', 'Today’s opening price', 'The 20-day moving average'], a: 0, why: 'It averages the prior day’s three key prices.' },
          { q: 'With P = $50 and yesterday’s high at $52, S1 is…', choices: ['$48', '$50', '$52'], a: 0, why: 'S1 = 2P − H = 100 − 52 = $48.' },
          { q: 'Why might price react near pivot levels?', choices: ['Many traders watch the same levels and place orders near them', 'Exchanges stop trading there', 'They guarantee reversals'], a: 0, why: 'Shared attention concentrates orders, but nothing is guaranteed.' },
        ],
        takeaways: ['Pivots turn the prior day’s high, low and close into today’s levels.', 'P is the balance line; R1–R3 above, S1–S3 below.', 'They mark where to pay attention; price action decides the trade.'],
      },
      {
        id: 'reading-pivots',
        title: 'Reading price around pivots',
        hook: 'The pivot as a bias line, bounces on range days, breaks on trend days.',
        mins: 8,
        steps: [
          {
            h: 'The pivot as a bias line',
            body: `<p>The simplest use of the pivot is as a dividing line. When price holds above P, buyers are in control. When it stays below, sellers are. When it crosses back and forth, neither side is.</p>
<p>Replay a day that opens above the pivot and one that opens below it.</p>`,
            viz: { type: 'pivotDay', set: ['above', 'below'] },
          },
          {
            h: 'Bounces on a range day',
            body: `<p>On a [[range-day]], price rotates between levels. A drop toward S1 meets buyers and bounces; a rally toward R1 meets sellers and turns back.</p>
<p>Range-day traders buy near support and sell near resistance, with tight stops just beyond the level. Watch each reaction get marked.</p>`,
            viz: { type: 'pivotDay', set: ['range'] },
          },
          {
            h: 'Breaks on a trend day',
            body: `<p>On a [[trend-day]], levels give way one after another. A broken resistance often becomes support on the next pullback, the same role reversal you saw in technical analysis.</p>
<p>Trend-day traders do the opposite of range traders: they buy pullbacks to broken levels instead of fading them.</p>`,
            predict: {
              q: 'Price breaks above R1 and then pulls back. Where do pivot traders look for support?',
              choices: ['At R1, the level just broken', 'At S3', 'Nowhere: broken levels stop mattering'],
              a: 0,
              why: 'Old resistance often turns into support. Holding above R1 on the pullback keeps the trend day alive.',
            },
            viz: { type: 'pivotDay', set: ['trend'] },
          },
        ],
        quiz: [
          { q: 'Price spends the whole day above the pivot. The bias is…', choices: ['Bullish', 'Bearish', 'Neutral'], a: 0, why: 'Holding above P shows buyers in control.' },
          { q: 'On a range day, a common approach near R1 is to…', choices: ['Look for selling back toward the pivot', 'Buy the breakout immediately', 'Ignore the level'], a: 0, why: 'Range days rotate between levels, so resistance is where sellers tend to appear.' },
          { q: 'On a trend day, broken levels often…', choices: ['Act as support on pullbacks', 'Disappear', 'Become the day’s high'], a: 0, why: 'Role reversal: old resistance becomes new support.' },
        ],
        takeaways: ['Above P is bullish, below P is bearish.', 'Range days bounce between levels; trend days break through them.', 'Broken levels often switch roles on the pullback.'],
      },
      {
        id: 'central-pivot-range',
        title: 'The central pivot range',
        hook: 'Three lines that mark the day’s balance zone.',
        mins: 7,
        steps: [
          {
            h: 'Three lines, one zone',
            body: `<p>The [[cpr]] adds two lines around the pivot. The bottom central pivot (BC) is the midpoint of yesterday's high and low. The top central pivot (TC) is the same distance on the other side of P: TC = 2P − BC.</p>
<p>Together they form a zone. If yesterday closed below its midpoint, TC lands below BC; the zone is the same, just flipped. Move yesterday's close and watch the zone.</p>`,
            viz: { type: 'cprBuild' },
          },
          {
            h: 'Above, below or inside',
            body: `<p>The CPR works like a thicker pivot. Opening and holding above it is a bullish sign. Holding below it is bearish. Chopping inside it means the market is still deciding.</p>`,
            viz: { type: 'pivotDay', set: ['above', 'below', 'inside'], cpr: true },
          },
          {
            h: 'The CPR as support and resistance',
            body: `<p>Because so many traders watch it, the CPR often acts as the first support on a bullish day and the first resistance on a bearish one.</p>
<p>Here price opens above the zone, dips to its top edge, finds buyers and rallies. A close back inside the zone would weaken that bullish read.</p>`,
            viz: { type: 'pivotDay', set: ['cprtest'], cpr: true },
          },
        ],
        quiz: [
          { q: 'The bottom central pivot (BC) is…', choices: ['(High + Low) ÷ 2', '(High + Low + Close) ÷ 3', 'The prior close'], a: 0, why: 'It is the midpoint of the prior day’s range.' },
          { q: 'P = $100 and BC = $99.50. TC is…', choices: ['$100.50', '$99.50', '$101'], a: 0, why: 'TC = 2P − BC = 200 − 99.50 = $100.50.' },
          { q: 'Price chops back and forth inside the CPR all morning. This suggests…', choices: ['The market is undecided', 'A strong uptrend', 'A strong downtrend'], a: 0, why: 'Inside the balance zone, neither side has control yet.' },
        ],
        takeaways: ['CPR = pivot, BC = (H + L) ÷ 2, TC = 2P − BC.', 'Above the CPR is bullish, below bearish, inside undecided.', 'The CPR often acts as the first support or resistance of the day.'],
      },
      {
        id: 'cpr-width',
        title: 'Narrow and wide CPR',
        hook: 'What the width of the zone says about the day ahead.',
        mins: 8,
        steps: [
          {
            h: 'What sets the width',
            body: `<p>Here is a neat piece of arithmetic. The [[cpr-width]] equals |2C − H − L| ÷ 3, so it depends on where yesterday closed within its range, not on how big the range was.</p>
<p>A close right in the middle makes the CPR collapse to almost nothing. A close at the high or low makes it as wide as it gets. Slide the close and watch.</p>`,
            predict: {
              q: 'Yesterday closed exactly in the middle of its range. Today’s CPR will be…',
              choices: ['Very narrow', 'Very wide', 'Impossible to tell'],
              a: 0,
              why: 'With C at the midpoint, 2C − H − L = 0, so TC and BC land on top of each other.',
            },
            viz: { type: 'cprWidth' },
          },
          {
            h: 'What width suggests',
            body: `<p>Pivot traders read width as a hint about the day ahead. A narrow CPR follows a balanced day where neither side won, and balance often gives way to a [[trend-day]]. A wide CPR follows a day that closed at an extreme, and the next day often rests in a sideways [[range-day]].</p>
<p>These are tendencies, not rules. The two days below are illustrations.</p>`,
            viz: { type: 'pivotDay', set: ['narrow', 'wide'], cpr: true },
          },
          {
            h: 'Compare with recent days',
            body: `<p>“Narrow” and “wide” only mean something compared with recent history. Traders often compare today's width with the last few weeks.</p>
<p>Pick a day and see where its width ranks among the previous 20.</p>`,
            viz: { type: 'cprHistory' },
          },
        ],
        quiz: [
          { q: 'Yesterday closed at its high. Today’s CPR is likely…', choices: ['Wide', 'Narrow', 'Zero'], a: 0, why: 'A close at an extreme makes |2C − H − L| as large as possible.' },
          { q: 'A very narrow CPR is often read as a hint of…', choices: ['A possible trending day', 'A guaranteed range day', 'A market holiday'], a: 0, why: 'Balance (a mid-range close) often gives way to a directional move.' },
          { q: 'Why compare today’s CPR width with recent days?', choices: ['Narrow and wide are only meaningful relative to recent history', 'The width never changes', 'It is required by brokers'], a: 0, why: 'What counts as narrow depends on the stock and the period.' },
        ],
        takeaways: ['CPR width = |2C − H − L| ÷ 3: it depends on where the prior day closed.', 'Narrow CPR hints at a trend day; wide CPR hints at a range day.', 'Judge width relative to recent days, and treat it as a tendency.'],
      },
    ],
  });
})();
