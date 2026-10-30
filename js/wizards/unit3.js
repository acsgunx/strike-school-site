/* Lessons from the Market Wizards, Unit 3 — Finding an edge: trend following, buying leaders, the inner game. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'channel-breakout-rule', term: 'Channel breakout rule', w: 'channel breakout', def: 'A trend-following rule: buy when the price closes above its highest point of the last several weeks, and sell when it closes below its lowest point of a shorter recent stretch. It catches every big trend, at the cost of many small false starts.' },
      { id: 'can-slim', term: 'CAN SLIM', w: 'CAN SLIM', def: 'William O’Neil’s checklist for growth stocks, one letter per trait: strong current and annual earnings growth, something new, shares in demand, a market leader, buying by big funds, and a rising overall market.' },
      { id: 'price-base', term: 'Base (chart pattern)', w: 'base', def: 'A sideways stretch of weeks or months after a rise, where a stock rests and digests its gains. A move above the top of the base on heavy volume is the classic growth-stock buy point.' },
    ],
    'wizards'
  );

  SS.WIZARD_UNITS.push({
    n: 3,
    title: 'Finding an edge',
    blurb: 'Three edges from the interviews: riding trends, buying market leaders as they break out, and mastering your own mind.',
    lessons: [
      {
        id: 'mw-trend',
        title: 'Ride the trend',
        hook: 'Lose small and often, win big and rarely: the trend follower’s bargain.',
        mins: 9,
        steps: [
          {
            h: 'Buy new highs, sell new lows',
            body: `<p>Richard Dennis and Ed Seykota made their fortunes following trends: buying markets that were already rising and selling ones that were already falling, then holding on while the move lasted.</p>
<p>Here is a simple rule in that spirit (a simplified [[channel-breakout-rule|channel breakout]], not their actual systems): buy when the price closes above its highest point of the last 20 days, and sell when it closes below its lowest point of the last 10 days. Watch it trade 200 days of a simulated market.</p>`,
            predict: {
              q: 'In a market that chops sideways before it trends, most of this rule’s trades will…',
              choices: ['Be small losses from false starts', 'Be big wins', 'Never trigger'],
              a: 0,
              why: 'Every move that looks like the start of a trend gets bought, and most fizzle out. The rule keeps those losses small and waits for the one that runs.',
            },
            viz: { type: 'trendSystem' },
          },
          {
            h: 'The hardest part: the next signal',
            body: `<p>Losses tend to come in clusters, and a big trend often starts right after a string of them, just when it is hardest to keep going. Several of the interviewed traders stressed taking every signal the method gives.</p>
<p>Compare a trader who takes every signal with a nervous one who sits out the next signal after three losses in a row.</p>`,
            viz: { type: 'trendSystem', compare: true },
          },
        ],
        quiz: [
          { q: 'A channel breakout rule buys when…', choices: ['The price closes above its recent highest point', 'The price falls to a new low', 'A news headline is positive'], a: 0, why: 'It buys strength: a new high says the market may be starting to trend.' },
          { q: 'Why do trend followers accept many small losses?', choices: ['They are the cost of catching the few big trends', 'Losses are tax-free', 'They don’t; they never lose'], a: 0, why: 'False starts are unavoidable; keeping them small is what makes the big trends pay.' },
          { q: 'Skipping signals after a losing streak is risky because…', choices: ['The big winner can come right after the losses', 'It saves money every time', 'Signals get more accurate after losses'], a: 0, why: 'You can’t know in advance which signal will be the big one, so skipping any of them risks missing it.' },
        ],
        takeaways: ['Buy strength, sell weakness, and let the trend do the work.', 'Expect many small false starts before the big move.', 'Take every signal: the one you skip may be the one that pays.'],
      },
      {
        id: 'mw-growth-stocks',
        title: 'Buy the leaders',
        hook: 'William O’Neil’s approach: buy the strongest stocks as they break out, and sell fast when wrong.',
        mins: 9,
        steps: [
          {
            h: 'What O’Neil looked for',
            body: `<p>William O’Neil studied the biggest winning stocks of the past and listed what they had in common just before their big moves. His checklist is called [[can-slim]], one letter per trait. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Letter',
              back: 'What it means',
              items: [
                ['C: Current earnings', 'The latest quarter’s profit.', 'Sharply higher than the same quarter a year earlier: the business is accelerating.'],
                ['A: Annual earnings', 'Growth over several years.', 'Steady growth year after year, not one lucky quarter.'],
                ['N: New', 'A new product, leader or high.', 'Something new drives the story, and the stock is near a new price high, not near its lows.'],
                ['S: Supply and demand', 'Shares available versus wanted.', 'Heavy volume on up days shows buyers overwhelming the shares for sale.'],
                ['L: Leader or laggard', 'The best in its industry?', 'Buy the strongest stock in a strong group, not the cheap laggard.'],
                ['I: Institutional sponsorship', 'Are big funds buying?', 'Buying by quality funds gives a stock the fuel for a long rise.'],
                ['M: Market direction', 'Is the overall market rising?', 'Most stocks follow the market, so even great stocks struggle in a falling one.'],
              ],
            },
          },
          {
            h: 'The buy point, and the 7–8% rule',
            body: `<p>O’Neil’s favorite entry: a leading stock rests in a sideways [[price-base|base]] for several weeks, then pushes above the top of it on heavy volume. Many breakouts fail, so he paired the entry with a firm [[stop-loss]] rule: sell any stock that falls 7–8% below what you paid, with no exceptions.</p>
<p>Here is one base with two possible futures.</p>`,
            predict: {
              q: 'The breakout fails, and the stock falls 8% below your buy price. O’Neil’s rule says…',
              choices: ['Sell now and take the small loss', 'Buy more while it’s cheaper', 'Hold until it comes back'],
              a: 0,
              why: 'A small loss is cheap insurance. Holding a failed breakout can turn 8% into 30% or more, and a 30% loss needs a gain of over 40% just to get back to even.',
            },
            viz: { type: 'baseBreakout' },
          },
        ],
        quiz: [
          { q: 'In CAN SLIM, the L stands for…', choices: ['Leader or laggard: buy the strongest stock in a strong group', 'Low price', 'Long-term hold'], a: 0, why: 'O’Neil favored leaders over cheap laggards.' },
          { q: 'O’Neil’s classic buy point is…', choices: ['A move above the top of a base on heavy volume', 'A new 52-week low', 'Any day the stock falls 10%'], a: 0, why: 'He bought strength as it emerged from a rest, with volume confirming the demand.' },
          { q: 'Why sell a stock 7–8% below the buy price?', choices: ['To keep a failed idea from becoming a big loss', 'Because it will always go to zero', 'To lock in a profit'], a: 0, why: 'Small losses are easy to recover from; big ones are not.' },
        ],
        takeaways: ['Buy leaders with strong earnings, near new highs, in a rising market.', 'Enter as the stock breaks out of a base on heavy volume.', 'Sell any stock 7–8% below your cost, no exceptions.'],
      },
      {
        id: 'mw-psychology',
        title: 'The inner game',
        hook: 'Many of the wizards said the hardest market to master was their own mind.',
        mins: 7,
        steps: [
          {
            h: 'What the wizards said about the mind',
            body: `<p>Again and again, the interviewed traders said that once you have a sound method, the remaining battle is mostly psychological. Ed Seykota, for one, argued that traders tend to get what they really want from the market, even when what they want is excitement rather than profit. Tap each card for a theme that kept coming up.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Trap',
              back: 'What the wizards did',
              items: [
                ['Ego', 'Needing to be right.', 'Holding a loser to avoid admitting a mistake. They admitted errors fast and moved on.'],
                ['Excitement', 'Trading for the thrill.', 'Action feels good but costs money. Good trading is often boring.'],
                ['Out of sync', 'Nothing is working.', 'Several of them cut their size or took a break until they felt in tune again.'],
                ['Overconfidence', 'After a big winning run.', 'Some of their worst losses came right after their best stretches, when they got careless.'],
                ['Personal stress', 'Trouble outside the market.', 'Problems at home or poor health leaked into decisions; some stepped away until it passed.'],
                ['Impatience', 'Forcing trades that aren’t there.', 'Waiting until the odds clearly favor you is a skill in itself.'],
              ],
            },
          },
          {
            h: 'Healthy or harmful?',
            body: `<p>Sort each habit.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'good', label: 'Healthy' },
                { k: 'red', label: 'Harmful' },
              ],
              items: [
                ['Taking a break after a string of losses that left you angry.', 'good', 'Stepping back protects both your money and your judgment.'],
                ['Holding a losing trade because selling would mean admitting you were wrong.', 'red', 'Ego keeps losers open far too long.'],
                ['Doubling your usual size because you feel unstoppable after a great month.', 'red', 'Overconfidence after a hot streak is a classic trap.'],
                ['Doing nothing because no trade meets your rules today.', 'good', 'Patience is part of the method.'],
                ['Trading because you are bored and want some action.', 'red', 'Trading for excitement usually costs money.'],
                ['Writing down why you took each trade, and reviewing the notes every week.', 'good', 'Honest review turns mistakes into lessons.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Once a trader has a sound method, the wizards said the biggest remaining challenge is usually…', choices: ['Their own psychology', 'A faster computer', 'Better tips'], a: 0, why: 'Following the method under pressure is the hard part.' },
          { q: 'When nothing is working and you feel out of sync, a common wizard habit was to…', choices: ['Trade smaller or step away for a while', 'Trade bigger to catch up', 'Switch methods every day'], a: 0, why: 'Shrinking or pausing limits the damage until judgment returns.' },
          { q: 'Why is trading for excitement a problem?', choices: ['It leads to trades that don’t meet your rules', 'Excitement makes markets rise', 'It isn’t; more trades are always better'], a: 0, why: 'Trades taken for the thrill have no edge behind them.' },
        ],
        takeaways: ['The method is the easy part; following it is the hard part.', 'Watch for ego, boredom and overconfidence.', 'When out of sync, trade smaller or step back.'],
      },
    ],
  });
})();
