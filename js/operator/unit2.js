/* Lessons of a Stock Operator, Unit 2 — Making the big money: the line of least resistance, sitting tight, pyramiding. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'line-of-least-resistance', term: 'Line of least resistance', w: 'line of least resistance', def: 'The direction price moves most easily. Livingston waited for price to reveal it, usually by breaking out of a range, and then traded with it instead of predicting it.' },
      { id: 'sitting-tight', term: 'Sitting tight', w: 'sitting tight', def: 'Holding a winning position through ordinary pullbacks until there is real evidence the trend has ended, instead of grabbing quick profits.' },
      { id: 'pyramiding', term: 'Pyramiding', w: 'pyramiding', def: 'Starting with a small position and adding more only as the market proves the idea right. The position is largest when you are most clearly right.' },
      { id: 'averaging-down', term: 'Averaging down', w: 'averaging down', def: 'Buying more of a losing position to lower the average cost. It makes the position largest exactly when the market is proving you wrong.' },
    ],
    'operator'
  );

  SS.OPERATOR_UNITS.push({
    n: 2,
    title: 'Making the big money',
    blurb: 'Let the market show its direction, sit tight while it pays, and add to winners instead of losers.',
    lessons: [
      {
        id: 'least-resistance',
        title: 'The line of least resistance',
        hook: 'Stop predicting. Wait for the market to show its hand, then follow it.',
        mins: 8,
        steps: [
          {
            h: 'Let the market show its hand',
            body: `<p>Livingston's big change was to stop guessing. When a stock moves sideways, nobody knows which way it will break, so he did nothing. When price finally broke out into new ground, it revealed the [[line-of-least-resistance]], and he followed it: buying a break above resistance, selling short a break below support.</p>
<p>And when a breakout failed and price slipped back into the range, he got out at once, for a small loss. Replay all three cases.</p>`,
            predict: {
              q: 'A stock breaks above its range, then two days later closes back inside it. What does this approach say to do?',
              choices: ['Get out: the breakout failed', 'Buy more at the lower price', 'Hold and hope it breaks out again'],
              a: 0,
              why: 'A real breakout should hold. Closing back in the range means the market didn’t confirm the move, so the trade idea is wrong.',
            },
            viz: { type: 'leastResistance' },
          },
          {
            h: 'Buying high and selling higher',
            body: `<p>Following the line of least resistance feels wrong at first. You buy when the price is already higher than it has been, and you sit out while it goes nowhere. Tap each card for why it works.</p>`,
            viz: {
              type: 'flipCards',
              front: 'It feels…',
              back: 'But…',
              items: [
                ['Buying a new high', 'Feels expensive.', 'Above a range there are few trapped buyers waiting to sell at breakeven, so the path up is clearer.'],
                ['Waiting in a range', 'Feels like missing out.', 'Inside a range the direction is unknown. Waiting costs nothing; guessing costs money.'],
                ['Shorting a breakdown', 'Feels scary.', 'A stock breaking to new lows has sellers in control. The same logic works in both directions.'],
                ['Being early', 'Feels smart.', 'Being early is the same as being wrong until the market agrees. Livingston paid for that lesson more than once.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'In the book’s approach, what do you do while a stock moves sideways in a range?', choices: ['Wait: the direction isn’t known yet', 'Buy at the bottom of the range every time', 'Short it'], a: 0, why: 'The line of least resistance hasn’t shown itself, so there is no trade.' },
          { q: 'A breakout above a long range signals…', choices: ['The line of least resistance is up', 'The stock is too expensive', 'A guaranteed rally'], a: 0, why: 'Price moving into new ground shows which way it moves most easily. Nothing is guaranteed.' },
          { q: 'What do you do if the breakout fails back into the range?', choices: ['Exit quickly with a small loss', 'Add to the position', 'Ignore it'], a: 0, why: 'A failed breakout means you were wrong; small losses are the cost of finding real moves.' },
        ],
        takeaways: ['Don’t predict the direction; wait for price to reveal it.', 'Follow breakouts out of ranges, up or down.', 'If a breakout fails, get out at once.'],
      },
      {
        id: 'sitting-tight',
        title: 'It’s a bull market, you know',
        hook: 'The big money is in the big move, not the wiggles.',
        mins: 8,
        steps: [
          {
            h: 'Old Partridge',
            body: `<p>In one brokerage office sat an old trader, Mr. Partridge, whom the others nicknamed Old Turkey. Whenever younger traders urged him to take his profit and buy back cheaper after a dip, he would answer that it was a bull market, and keep his stock.</p>
<p>Livingston came to see it as the wisest thing said in the office: you can't buy back cheaper if the dip never comes, and selling costs you your position. Replay a simulated bull market. One trader [[sitting-tight|sits tight]]; the other takes profits at +6% and buys back after each 4% pullback.</p>`,
            viz: { type: 'sitTight' },
          },
          {
            h: 'Thinking versus sitting',
            body: `<p>Livingston says plainly that it was never his thinking that made him the big money; it was his sitting. Being right about the direction is fairly common. Staying with the position while it pays off is rare, because every pullback tempts you to grab the profit you have.</p>
<p>Sitting tight is not the same as holding forever. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Habit',
              back: 'What happens',
              items: [
                ['Grabbing quick profits', 'Feels safe.', 'In a strong trend you sell, then buy back higher, or never get back in at all.'],
                ['Sitting tight', 'Feels risky.', 'It lets the big move do the work. That is where most of a trend’s profit is.'],
                ['An exit rule', 'Decided before you need it.', 'Know what would prove the trend over, like a deep drop from the high. Sitting tight means sitting with a plan, not with hope.'],
                ['Doing nothing', 'Feels lazy.', 'Fewer trades mean fewer mistakes and lower costs. Activity is not the same as progress.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'What did Old Partridge mean by “it’s a bull market”?', choices: ['Keep your position; don’t trade the dips away', 'Sell everything now', 'Prices will fall soon'], a: 0, why: 'In a strong uptrend, the profit is in holding the position, not in trading around it.' },
          { q: 'Why does taking quick profits hurt in a strong trend?', choices: ['You often buy back higher, or miss the rest of the move', 'Brokers forbid it', 'Profits are taxed less'], a: 0, why: 'Dips in a strong trend are shallow, so the chance to buy back cheaper may never come.' },
          { q: 'Sitting tight should still include…', choices: ['An exit rule for when the trend truly breaks', 'Adding to every loser', 'Ignoring all price action'], a: 0, why: 'Without an exit rule, sitting tight turns into hoping.' },
        ],
        takeaways: ['The big money is made in the big move.', 'Being right is common; sitting tight while right is rare.', 'Sit with an exit rule, not with hope.'],
      },
      {
        id: 'pyramiding',
        title: 'Test, then add',
        hook: 'Make your position biggest when you are most clearly right.',
        mins: 8,
        steps: [
          {
            h: 'Probe first',
            body: `<p>Livingston rarely bet his full size at once. He bought a small first piece to test the idea. If the market proved him right, he added more at higher prices; if it proved him wrong, he lost only on the small piece. That is [[pyramiding]].</p>
<p>The beginner's habit is the reverse: [[averaging-down]], buying more as the price falls to lower the average cost. Switch the market between rising and falling and compare the two traders.</p>`,
            viz: { type: 'pyramid' },
          },
          {
            h: 'Never average losses',
            body: `<p>The book is blunt: adding to a loser is one of the surest ways a speculator ruins himself. A loss is the market telling you that you are wrong. Averaging down makes your position biggest at exactly that moment.</p>`,
            predict: {
              q: 'With pyramiding, when is your position largest?',
              choices: ['When the market has proven you right', 'When the trade shows its biggest loss', 'Always at the start'],
              a: 0,
              why: 'You only add after the price moves your way, so size grows with evidence, and a wrong idea stays small.',
            },
            viz: { type: 'pyramid', start: 'down' },
          },
        ],
        quiz: [
          { q: 'Pyramiding means…', choices: ['Adding to a position as it moves in your favor', 'Adding as it moves against you', 'Buying everything at once'], a: 0, why: 'You start small and add as the market confirms the idea.' },
          { q: 'The danger of averaging down is that…', choices: ['Your position grows exactly when you are wrong', 'It lowers your profits in a rally', 'It is illegal'], a: 0, why: 'Each new purchase increases exposure to a trade that is already failing.' },
          { q: 'If the first small position shows a loss, the pyramid trader…', choices: ['Exits with a small loss and doesn’t add', 'Doubles the position', 'Holds forever'], a: 0, why: 'The probe failed; the loss stays small because no more was added.' },
        ],
        takeaways: ['Start small to test the idea.', 'Add only when the market proves you right.', 'Never add to a loser: a loss means you are wrong.'],
      },
    ],
  });
})();
