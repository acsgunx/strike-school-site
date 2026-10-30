/* The Trading Mindset, Unit 2 — Thinking in probabilities: five truths, the casino mindset, random streaks. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'probabilistic-thinking', term: 'Thinking in probabilities', w: 'thinking in probabilities', def: 'Treating each trade as one outcome from a series, not as a test of whether you are right. You expect individual losses and judge your edge over many trades.' },
      { id: 'law-of-large-numbers', term: 'Law of large numbers', w: 'law of large numbers', def: 'As the number of independent trials grows, the average result settles closer to its expected value. A small edge becomes reliable only over many trades.' },
      { id: 'losing-streak', term: 'Losing streak', w: 'losing streak', def: 'Several losing trades in a row. Even a strong edge produces them regularly, because wins and losses arrive in random order.' },
    ],
    'zone'
  );

  SS.ZONE_UNITS.push({
    n: 2,
    title: 'Thinking in probabilities',
    blurb: 'Five truths about the market, why casinos win without knowing the next spin, and why losing streaks are normal.',
    lessons: [
      {
        id: 'zone-five-truths',
        title: 'Five truths about the market',
        hook: 'Beliefs that make losses feel like information, not insults.',
        mins: 8,
        steps: [
          {
            h: 'Five truths, in our words',
            body: `<p>At the heart of the book is a set of five beliefs about the market that Douglas says a consistent trader holds without reservation. Here they are, put in our own words. Together they describe [[probabilistic-thinking]]: no single trade is a verdict on you. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Truth',
              back: 'What it means for you',
              items: [
                ['Anything can happen', 'Any trade can go either way, however good it looks.', 'Other traders can always push price against you. Expect it, and a loss stops being a shock.'],
                ['You don’t need to know what comes next', 'Profit comes from the edge, not from predicting each trade.', 'You can make money while being unsure about every single trade.'],
                ['Wins and losses arrive in random order', 'An edge says how many, not which ones.', 'You can’t tell in advance which trades in a series will win, so take them all.'],
                ['An edge is just better odds', 'A tilt in probability, never a certainty.', 'A losing trade doesn’t mean the edge stopped working.'],
                ['Every moment is unique', 'No two setups are ever truly the same.', 'Past patterns guide the odds; they don’t promise a repeat.'],
              ],
            },
          },
          {
            h: 'Probability or certainty?',
            body: `<p>Sort each thought. Certainty thinking treats one trade as proof; probability thinking treats it as one result among many.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'red', label: 'Certainty' },
                { k: 'good', label: 'Probability' },
              ],
              items: [
                ['“This setup can’t fail; everything lines up.”', 'red', 'Anything can happen on a single trade, however perfect it looks.'],
                ['“I lost three in a row, so the system is broken.”', 'red', 'Three losses fit easily inside a normal random sequence.'],
                ['“This is one of the next fifty trades I’ll take with this edge.”', 'good', 'Thinking in series keeps any single trade in proportion.'],
                ['“I knew it would turn; I’m adding more.”', 'red', 'Feeling sure is not the same as being right.'],
                ['“It lost, but it met all my criteria, so I’ll take the next one too.”', 'good', 'The edge plays out over many trades, including this one.'],
                ['“I don’t know what happens next, and I don’t need to.”', 'good', 'That is the whole point: the edge, not the prediction, makes the money.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Which belief best describes thinking in probabilities?', choices: ['Any single trade can go either way; the edge works over many', 'A good setup always works', 'Losses mean the method is broken'], a: 0, why: 'An edge is a tendency across a series, not a promise on one trade.' },
          { q: 'To make money with an edge, you need to know…', choices: ['That the edge holds over many trades', 'Exactly what happens next', 'What other traders are thinking'], a: 0, why: 'Prediction of individual trades isn’t required.' },
          { q: 'A losing trade that met all your criteria means…', choices: ['It was one of the expected losses', 'The edge has disappeared', 'You should abandon the method'], a: 0, why: 'Losses are built into every edge.' },
        ],
        takeaways: ['Any single trade can go either way.', 'An edge is better odds, never certainty.', 'Think in series: no one trade is a verdict on you.'],
      },
      {
        id: 'zone-casino',
        title: 'Think like a casino',
        hook: 'The house doesn’t know the next spin, and doesn’t need to.',
        mins: 8,
        steps: [
          {
            h: 'Why the house always wins',
            body: `<p>A casino doesn't know whether the next spin of the roulette wheel will win or lose, and it doesn't care. Its edge on any one bet is small, but over thousands of bets the [[law-of-large-numbers]] makes the result close to certain. Douglas asks traders to think the same way about their edge.</p>
<p>Below, 400 simulated traders each use the same edge: 45% of trades win 2 units, 55% lose 1. Change how many trades each one takes and watch how many end up ahead.</p>`,
            predict: {
              q: 'With this edge, what is the chance of being ahead after a single trade?',
              choices: ['45%', '73%', '99%'],
              a: 0,
              why: 'One trade is a coin flip tilted the wrong way: 45% win. The edge only shows up over many trades: about 73% are ahead after 10, about 99% after 100.',
            },
            viz: { type: 'casinoEdge' },
          },
          {
            h: 'Your job is to take the trades',
            body: `<p>If the edge only pays over a series, then the trader's real job is simple, though not easy: take every trade the edge signals, with the same risk, for long enough that the odds can work. Skipping trades after a loss, or doubling up after a win, breaks the series the edge depends on.</p>`,
            viz: { type: 'casinoEdge', n: 100 },
          },
        ],
        quiz: [
          { q: 'Why does a casino win reliably with a small edge?', choices: ['It takes so many bets that the edge dominates', 'It knows the next outcome', 'Its edge is huge on each bet'], a: 0, why: 'The law of large numbers turns a small edge into a near-certain result.' },
          { q: 'With 45% wins at +2 and 55% losses at −1, the chance of being ahead after 100 trades is about…', choices: ['99%', '45%', '50%'], a: 0, why: 'Over 100 trades, the +0.35-unit average per trade dominates the randomness.' },
          { q: 'Skipping trades after a loss hurts because…', choices: ['It breaks the series the edge needs', 'It saves money', 'It improves the win rate'], a: 0, why: 'The skipped trades are as likely to be winners as any others.' },
        ],
        takeaways: ['One trade is close to a coin flip; many trades reveal the edge.', 'Think like the house: the next result doesn’t matter.', 'Take every signal, at the same risk, long enough for the odds to work.'],
      },
      {
        id: 'zone-streaks',
        title: 'Losing streaks are normal',
        hook: 'Randomness clusters. Expect it before it happens.',
        mins: 7,
        steps: [
          {
            h: 'What random really looks like',
            body: `<p>People expect wins and losses to alternate neatly. Real randomness clusters. With a 55% win rate, a [[losing-streak]] of five or more somewhere in 100 trades isn't bad luck; it's more likely than not. Knowing that in advance is what keeps a trader from abandoning a good method at exactly the wrong time.</p>`,
            predict: {
              q: 'With a 55% win rate, how likely is at least one streak of 5 or more losses in 100 trades?',
              choices: ['About two chances in three', 'About one in twenty', 'Almost impossible'],
              a: 0,
              why: 'The exact figure is about 65%. Streaks that feel like proof the method is broken are a normal part of a winning edge.',
            },
            viz: { type: 'streaks' },
          },
          {
            h: 'Plan for the streak',
            body: `<p>Since streaks are certain to come, plan for them before they do: size each trade so that the worst streak you can expect is uncomfortable but not damaging. Change the win rate and see how long the longest streaks get.</p>`,
            viz: { type: 'streaks', win: 0.45 },
          },
        ],
        quiz: [
          { q: 'A trader with a 55% win rate loses five in a row. This most likely means…', choices: ['A normal streak inside a working edge', 'The method has stopped working', 'The market is rigged'], a: 0, why: 'At 55%, a 5-loss streak in 100 trades happens about 65% of the time.' },
          { q: 'Why do losing streaks happen even with an edge?', choices: ['Wins and losses arrive in random order', 'Edges expire after a few trades', 'Brokers cause them'], a: 0, why: 'Random sequences naturally cluster.' },
          { q: 'The best preparation for a losing streak is…', choices: ['Sizing trades so the expected worst streak is survivable', 'Doubling up after each loss', 'Stopping after two losses'], a: 0, why: 'Planning the size in advance keeps the streak from becoming a disaster.' },
        ],
        takeaways: ['Random results cluster into streaks.', 'Five losses in a row is normal even at a 55% win rate.', 'Size for the streak before it arrives.'],
      },
    ],
  });
})();
