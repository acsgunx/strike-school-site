/* Technical Analysis in Depth, Unit 5 — The big picture: intermarket links, sector rotation and relative strength,
   market breadth, and a chart-reading checklist. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'intermarket-analysis', term: 'Intermarket analysis', w: 'intermarket analysis', def: 'Studying how bonds, stocks, commodities and currencies affect one another, so that one market’s chart can confirm or question another’s.' },
      { id: 'sector-rotation', term: 'Sector rotation', w: 'sector rotation', def: 'The tendency for different groups of stocks to lead at different stages of the business cycle, as money moves from one sector to the next.' },
      { id: 'relative-strength-line', term: 'Relative strength line', w: 'relative strength line', def: 'A stock’s price divided by an index, drawn as a line. When it rises, the stock is beating the market; when it falls, the stock is lagging, even if its price is rising. Not the same as RSI.' },
      { id: 'market-breadth', term: 'Market breadth', w: 'market breadth', def: 'How many stocks are taking part in a market move. Broad rallies are healthier than narrow ones carried by a few large stocks.' },
      { id: 'advance-decline-line', term: 'Advance-decline line', w: 'advance-decline line', def: 'A running total of the number of rising stocks minus the number of falling stocks each day. It shows whether most stocks are joining the index’s moves.' },
    ],
    'murphy'
  );

  SS.MURPHY_UNITS.push({
    n: 5,
    title: 'The big picture',
    blurb: 'Zoom out: how markets lead one another, which sectors lead when, whether the whole market is joining in, and a checklist to pull it all together.',
    lessons: [
      {
        id: 'mu-intermarket',
        title: 'How markets move together',
        hook: 'Bonds, stocks and commodities take turns. Watching all three tells a fuller story.',
        mins: 9,
        steps: [
          {
            h: 'Who turns first?',
            body: `<p>Murphy was one of the pioneers of [[intermarket-analysis|intermarket analysis]]. His point is that no market moves alone. Rising commodity prices mean inflation, which pushes interest rates up and bond prices down. Higher rates, in time, weigh on stocks. Around major turns, he observed a typical order: bonds turn first, then stocks, then commodities.</p>
<p>Play a stylized business cycle and watch the order.</p>`,
            predict: {
              q: 'Bond prices have been falling for months as interest rates rise. Intermarket analysis suggests stocks will…',
              choices: ['Often follow them lower, later', 'Always rise', 'Be unaffected'],
              a: 0,
              why: 'Bonds often turn before stocks: rising rates eventually make stocks less attractive. The lag can be long, and the link isn’t guaranteed.',
            },
            viz: { type: 'intermarketCycle' },
          },
          {
            h: 'Key relationships',
            body: `<p>Tap each card for one of the main links.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Link',
              back: 'How it usually works',
              items: [
                ['Bonds and commodities', 'Usually move in opposite directions.', 'Rising commodity prices signal inflation, which lifts interest rates and pushes bond prices down.'],
                ['Bonds and stocks', 'Usually move together.', 'Falling rates (rising bond prices) help stocks, and bonds often turn first.'],
                ['The dollar and commodities', 'Usually move in opposite directions.', 'A rising dollar holds inflation down and tends to weigh on commodity prices.'],
                ['Stocks and the dollar', 'A looser link.', 'A strong dollar can help by keeping rates low, but it hurts companies that export.'],
                ['A caveat', 'The links can shift.', 'In periods of deflation, bonds and stocks can move apart. These are tendencies, not laws.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Rising commodity prices usually mean…', choices: ['Inflation, higher rates and falling bond prices', 'Rising bond prices', 'Nothing for other markets'], a: 0, why: 'Commodities feed inflation, which pushes rates up.' },
          { q: 'Around major turns, which market tends to turn first?', choices: ['Bonds', 'Commodities', 'They always turn together'], a: 0, why: 'In Murphy’s typical sequence, bonds lead, then stocks, then commodities.' },
          { q: 'A rising dollar tends to be…', choices: ['Bearish for commodities', 'Bullish for commodities', 'Unrelated to commodities'], a: 0, why: 'Commodities are priced in dollars, and a strong dollar is deflationary.' },
        ],
        takeaways: ['No market moves alone.', 'Typical order at turns: bonds, then stocks, then commodities.', 'The links are tendencies that can shift, so use them to confirm, not to predict.'],
      },
      {
        id: 'mu-rotation',
        title: 'Sector rotation and relative strength',
        hook: 'Different sectors lead at different stages of the cycle. Find the leaders.',
        mins: 9,
        steps: [
          {
            h: 'The sector clock',
            body: `<p>Within the stock market, money moves from sector to sector as the economy goes through its cycle: [[sector-rotation]]. Stocks usually turn before the economy, so the leaders change early. Murphy presents a common model of which sectors tend to lead at each stage. Play the clock, or tap a stage.</p>`,
            viz: { type: 'sectorClock' },
          },
          {
            h: 'Relative strength: beating the market',
            body: `<p>To find leaders, chartists divide a stock’s price by an index and plot the result: the [[relative-strength-line|relative strength line]]. When it rises, the stock is beating the market. A stock can rise in price and still be a laggard, if the market rises faster. Murphy’s advice: look for strong stocks in strong sectors.</p>`,
            predict: {
              q: 'A stock rose 10% this year, while the index rose 20%. Its relative strength line…',
              choices: ['Fell: it lagged the market', 'Rose: it went up', 'Stayed flat'],
              a: 0,
              why: 'The ratio of stock to index went down, because the index rose faster. Owning the index would have done better.',
            },
            viz: { type: 'ratioLine' },
          },
        ],
        quiz: [
          { q: 'Sector rotation describes…', choices: ['Different sectors leading at different stages of the cycle', 'Rebalancing a portfolio monthly', 'A chart pattern'], a: 0, why: 'Money moves to the sectors that benefit most from each stage.' },
          { q: 'Late in an economic expansion, which sectors have tended to lead?', choices: ['Basic materials and energy', 'Utilities', 'Transportation'], a: 0, why: 'Strong demand pushes raw-material prices up late in the cycle.' },
          { q: 'A rising relative strength line means the stock is…', choices: ['Beating the index', 'Rising in price, for sure', 'Overbought'], a: 0, why: 'It measures performance against the index, not price alone.' },
        ],
        takeaways: ['Sector leadership rotates through the business cycle.', 'Divide a stock by its index to see whether it leads or lags.', 'Look for strong stocks in strong sectors.'],
      },
      {
        id: 'mu-breadth',
        title: 'Breadth, and pulling it together',
        hook: 'Is the whole army marching, or just the generals?',
        mins: 9,
        steps: [
          {
            h: 'Is the whole market joining in?',
            body: `<p>An index can be carried higher by a handful of big stocks while most stocks fall behind. [[market-breadth|Market breadth]] measures how many stocks take part. The best-known gauge is the [[advance-decline-line|advance-decline line]], a running total of rising stocks minus falling ones. When the index makes a new high but the advance-decline line doesn’t, that’s a negative [[divergence]]: the rally is narrowing.</p>`,
            predict: {
              q: 'The index makes a new high, but fewer stocks are rising each week. This is…',
              choices: ['A warning: the rally is narrowing', 'A sign of strength', 'Meaningless'],
              a: 0,
              why: 'A rally carried by fewer and fewer stocks is fragile. It doesn’t say when it ends, but it is a classic warning.',
            },
            viz: { type: 'breadthDivergence' },
          },
          {
            h: 'A chart-reading checklist',
            body: `<p>Murphy closes by stressing that no single tool works alone. The skill is in combining them, from the big picture down. Here is a checklist in that spirit. Tap each step.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Step',
              back: 'What to look for',
              items: [
                ['1. Start big', 'Monthly and weekly charts.', 'Find the major trend first, then zoom in to daily charts.'],
                ['2. Name the trend', 'Up, down or sideways?', 'Swing highs and lows, trendlines and moving averages tell you.'],
                ['3. Mark the levels', 'Where did prices turn before?', 'Old highs and lows, gaps and retracement levels.'],
                ['4. Look for patterns', 'Reversal or continuation?', 'Patterns give you entry points and price targets.'],
                ['5. Check volume', 'Does it confirm the move?', 'Volume should grow in the trend’s direction and on breakouts.'],
                ['6. Read the oscillators', 'Stretched? Diverging?', 'Use them for timing, mostly in the trend’s direction.'],
                ['7. Breadth and sentiment', 'Is the crowd joining in, or all in?', 'Narrowing breadth and extreme optimism are warnings.'],
                ['8. Look across markets', 'Bonds, commodities, the dollar.', 'Other markets can confirm the story, or question it.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'The advance-decline line tracks…', choices: ['Rising stocks minus falling stocks, added up day by day', 'The index price', 'Trading volume'], a: 0, why: 'It shows how many stocks take part in the move.' },
          { q: 'A new index high with a lower advance-decline line is…', choices: ['A negative divergence', 'A confirmation', 'A buy signal'], a: 0, why: 'Fewer stocks are carrying the rally.' },
          { q: 'Murphy’s overall advice is to…', choices: ['Combine tools, starting from the big picture', 'Rely on one favorite indicator', 'Ignore the trend'], a: 0, why: 'Each tool sees a different part of the picture.' },
        ],
        takeaways: ['A healthy rally is a broad one.', 'Watch for divergence between the index and its breadth.', 'Combine the tools, from the big picture down.'],
      },
    ],
  });
})();
