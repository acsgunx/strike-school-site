/* Lessons from the Market Wizards, Unit 2 — Risk first: small risk per trade, cutting losses, playing defense. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'growth-optimal-bet', term: 'Growth-optimal bet size', w: 'growth-optimal bet', def: 'The fraction of capital per trade that maximizes long-run growth for a known edge (the Kelly fraction). Real edges are uncertain and the swings at that size are brutal, so professionals bet a fraction of it.' },
      { id: 'fat-tail-winners', term: 'Outsized winners', w: 'outsized winners', def: 'The rare trades that make many times the amount risked. For trend followers, a handful of them produces most of the year’s profit, which is why cutting them short is so costly.' },
      { id: 'playing-defense', term: 'Playing defense', w: 'playing defense', def: 'Putting the protection of capital first: fixed limits on each trade, smaller size during losing stretches, and stepping back when out of sync with the market.' },
    ],
    'wizards'
  );

  SS.WIZARD_UNITS.push({
    n: 2,
    title: 'Risk first',
    blurb: 'Why the wizards risked so little per idea, how a few big winners paid for many small losses, and why defense came before offense.',
    lessons: [
      {
        id: 'mw-risk-per-trade',
        title: 'Risk a little on each idea',
        hook: 'Betting bigger grows faster, until it doesn’t, and the swings become unbearable long before that.',
        mins: 9,
        steps: [
          {
            h: 'More risk, more growth? Only up to a point',
            body: `<p>Many of the interviewed traders kept the risk on any single trade tiny. Larry Hite, for example, described risking around 1% of his capital per trade. Why so little, if they had an edge?</p>
<p>Take a modest edge: 40% of trades win 1.8 times the amount risked. Slide the risk per trade. Growth rises at first, peaks at the [[growth-optimal-bet]], then collapses. And long before the peak, the chance of a gut-wrenching 50% fall becomes near certain.</p>`,
            predict: {
              q: 'With this edge, risking 20% per trade instead of 2% will most likely…',
              choices: ['Shrink the account despite the edge', 'Grow it ten times faster', 'Make no difference'],
              a: 0,
              why: 'Far beyond the growth-optimal size, the losses compound faster than the wins: the median trader ends with about a tenth of the starting money.',
            },
            viz: { type: 'ruinCurve' },
          },
          {
            h: 'Small feels slow, but it compounds',
            body: `<p>Each line below is one possible run of 40 trades with an edge. Slide the risk per trade and run it again. At small sizes the lines bunch together and drift up; at large sizes a few soar and many crash. The wizards chose the boring bunch.</p>`,
            viz: { type: 'sizing' },
          },
        ],
        quiz: [
          { q: 'Why did many top traders risk only around 1% per trade?', choices: ['To survive losing streaks and keep drawdowns bearable', 'Because their edge was tiny', 'Brokers required it'], a: 0, why: 'Small risk keeps any streak from doing lasting damage, so the edge has time to work.' },
          { q: 'Betting more than the growth-optimal size…', choices: ['Reduces long-run growth and raises the risk of ruin', 'Always increases profits', 'Has no effect'], a: 0, why: 'Past the peak, bigger bets compound losses faster than gains.' },
          { q: 'Even at the growth-optimal size, most traders would face…', choices: ['A 50% drawdown at some point', 'No losses', 'Guaranteed doubling every year'], a: 0, why: 'In the simulation, about 9 in 10 hit a 50% fall at that size, which few people can stomach.' },
        ],
        takeaways: ['More risk grows faster only up to a point, then destroys.', 'Drawdowns become unbearable long before that point.', 'Risk a small, fixed slice per trade, around 1–2%.'],
      },
      {
        id: 'mw-cut-losses',
        title: 'Cut losses, let profits run',
        hook: 'A few big winners pay for many small losses, if you let them.',
        mins: 9,
        steps: [
          {
            h: 'A few trades make the year',
            body: `<p>The trend followers in the book, such as Ed Seykota and Richard Dennis, lost on most of their trades. They made their money because the losses were small and a few winners were huge. Below are 200 simulated trend-following trades. Sort them and see where the profit came from: the [[fat-tail-winners|outsized winners]].</p>`,
            predict: {
              q: 'A trend follower loses on 60% of trades but cuts each loss quickly. Where does the profit come from?',
              choices: ['A small number of very large winners', 'Many small wins', 'It can’t be profitable'],
              a: 0,
              why: 'With losses kept small, a handful of trades that run many times the risk can pay for everything else.',
            },
            viz: { type: 'tradePareto' },
          },
          {
            h: 'What happens if you don’t cut',
            body: `<p>Now take the same 200 trades, but let each loser keep running the way a hopeful trader would, instead of stopping it at the planned loss. Nothing else changes: the same winners, the same entries.</p>`,
            viz: { type: 'tradePareto', compare: true },
          },
        ],
        quiz: [
          { q: 'For a typical trend follower, most trades are…', choices: ['Small losses', 'Big wins', 'Breakeven'], a: 0, why: 'They lose often but small, and win rarely but big.' },
          { q: 'Cutting a winner short is costly because…', choices: ['A few big winners produce most of the profit', 'Winners always reverse', 'It raises the win rate'], a: 0, why: 'Clipping the big winners removes the source of the edge.' },
          { q: 'Letting losers run turns the same set of trades into…', choices: ['A much worse result, often a losing one', 'A better result', 'The same result'], a: 0, why: 'The big losses swallow the big wins.' },
        ],
        takeaways: ['Most trend-following trades lose, but small.', 'A handful of outsized winners make the year.', 'Cut losses at the plan; let winners run.'],
      },
      {
        id: 'mw-defense',
        title: 'Play great defense',
        hook: 'Protect capital first. Offense takes care of itself.',
        mins: 8,
        steps: [
          {
            h: 'Shrink when you are wrong',
            body: `<p>Paul Tudor Jones is one of several traders in the book who stressed [[playing-defense]]: protecting capital first, and cutting back when trading badly. One simple version: risk 2% a trade normally, drop to 1% whenever the account is 10% below its peak, and go back to 2% at a new high.</p>
<p>Here are 1,000 simulated traders with the same edge, trading 300 times each, with and without that rule.</p>`,
            viz: { type: 'defenseSize' },
          },
          {
            h: 'Defensive habits',
            body: `<p>Tap each card for a defensive habit and why it helps.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Habit',
              back: 'Why it helps',
              items: [
                ['A loss limit on every trade', 'Decided before entering.', 'No single trade can do serious damage.'],
                ['Smaller size in a slump', 'Cut back when out of sync.', 'Losing streaks cost less, and you regain confidence on small trades.'],
                ['A daily or weekly loss limit', 'Stop trading after a set loss.', 'Prevents a bad day from turning into a disaster driven by frustration.'],
                ['Count related positions as one', 'Ten similar bets are one big bet.', 'Positions that move together can all lose at once.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'What does playing defense mean in trading?', choices: ['Protecting capital first and cutting back when trading badly', 'Never trading', 'Only buying bonds'], a: 0, why: 'Defense is about limiting damage so you stay in the game.' },
          { q: 'Halving size during a drawdown tends to…', choices: ['Shrink the worst drawdowns, at some cost to returns', 'Increase drawdowns', 'Double returns'], a: 0, why: 'In the simulation, the bad-case drawdown fell from about 48% to about 33%, while the median result was somewhat lower.' },
          { q: 'Ten positions that all rise and fall together are…', choices: ['Effectively one big position', 'Ten independent bets', 'Risk-free'], a: 0, why: 'Correlated positions lose together.' },
        ],
        takeaways: ['Protect capital first.', 'Cut size when trading badly; rebuild at new highs.', 'Use loss limits per trade and per day, and count related positions together.'],
      },
    ],
  });
})();
