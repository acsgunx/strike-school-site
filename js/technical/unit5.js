/* Technical Analysis, Unit 5 — Trading with a plan. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'stop-loss', term: 'Stop-loss', w: 'stop-loss', def: 'A pre-set exit price where you accept that a trade idea was wrong, capping the loss.' },
      { id: 'risk-reward', term: 'Reward-to-risk ratio', w: 'reward-to-risk ratio', def: 'The distance to your target divided by the distance to your stop.', ex: 'Entry $50, stop $48, target $56: $6 of reward for $2 of risk, or 3 to 1.' },
      { id: 'r-multiple', term: 'R-multiple', w: 'R', def: 'A trade’s result measured in units of the amount risked. Losing the planned amount is −1R; making three times it is +3R.' },
      { id: 'position-size', term: 'Position sizing', w: 'position sizing', def: 'Choosing how many shares to buy so that hitting your stop loses only a set slice of the account.', ex: 'Risk $100 with a $2 stop: 50 shares.' },
      { id: 'win-rate', term: 'Win rate', w: 'win rate', def: 'The share of trades that make money. On its own it says little without the size of wins and losses.' },
      { id: 'expectancy', term: 'Expectancy', w: 'expectancy', def: 'The average result per trade: win rate × average win − loss rate × average loss. Positive expectancy is an edge.' },
      { id: 'losing-streak', term: 'Losing streak', w: 'losing streaks', def: 'A run of losing trades in a row. Even good strategies have long ones, which is why position size must be small.' },
      { id: 'backtest', term: 'Backtest', w: 'backtest', def: 'Testing a set of trading rules on historical data to see how they would have performed.' },
      { id: 'overfitting', term: 'Overfitting', w: 'overfitting', def: 'Tuning rules so closely to past data that they capture noise instead of a real pattern, and then fail on new data.' },
      { id: 'out-of-sample', term: 'Out-of-sample test', w: 'out-of-sample', def: 'Checking rules on data that was not used to design them, the honest test of whether an edge is real.' },
      { id: 'look-ahead-bias', term: 'Look-ahead bias', w: 'look-ahead bias', def: 'A backtest mistake: using information that would not have been known at the time of the trade.' },
      { id: 'survivorship-bias', term: 'Survivorship bias', w: 'survivorship bias', def: 'Testing only on stocks that still exist today, ignoring those that failed, which makes results look better than reality.' },
      { id: 'trading-journal', term: 'Trading journal', w: 'trading journal', def: 'A record of every trade: the setup, entry, stop, target, result and what you were thinking, used to find what works.' },
      { id: 'revenge-trading', term: 'Revenge trading', w: 'revenge trading', def: 'Taking hasty, oversized trades to win back a loss quickly. A common way small losses become big ones.' },
    ],
    'technical'
  );

  SS.TECH_UNITS.push({
    n: 5,
    title: 'Trading with a plan',
    blurb: 'Stops, targets and position size, expectancy and losing streaks, honest backtesting, and a plan and journal you actually follow.',
    lessons: [
      {
        id: 'stops-targets-size',
        title: 'Stops, targets and position size',
        hook: 'Plan the exit before the entry, then size the trade from the risk.',
        mins: 8,
        steps: [
          {
            h: 'Plan the exit before the entry',
            body: `<p>Every trade needs three prices before you click buy: the entry, the [[stop-loss]] (where the idea is proven wrong) and the target.</p>
<p>The distance to the target divided by the distance to the stop is the [[risk-reward]]. Set the three levels, then play the price to see which one gets hit first.</p>`,
            viz: { type: 'tradePlanner' },
          },
          {
            h: 'Size the position from the risk',
            body: `<p>Professionals do not ask "how many shares can I afford?" They ask "how much am I willing to lose if I am wrong?" That is [[position-size|position sizing]].</p>
<p>Risk a small, fixed slice of the account, often 1%. Divide that dollar amount by the distance to your stop to get the share count. Results are often measured in [[r-multiple|R]]: −1R is losing the planned amount.</p>`,
            predict: {
              q: 'Your account is $20,000 and you risk 1% per trade. Entry is $50 and your stop is $48. How many shares?',
              choices: ['400 shares', '100 shares', '50 shares'],
              a: 1,
              why: '1% of $20,000 is $200. The stop is $2 away, so $200 ÷ $2 = 100 shares. If the stop is hit, you lose $200 plus any slippage.',
            },
            viz: { type: 'positionSize' },
          },
          {
            h: 'Where to put the stop',
            body: `<p>A stop that is too tight gets hit by normal noise. One that is too wide makes each loss huge, or forces a tiny position.</p>
<p>Good stops sit where the trade idea is actually wrong: just beyond support, or a couple of ATRs away. Compare three stops on the same trade.</p>`,
            viz: { type: 'stopPlacement' },
          },
        ],
        quiz: [
          { q: 'Entry $40, stop $38, target $46. The reward-to-risk ratio is…', choices: ['3 to 1', '2 to 1', '1 to 3'], a: 0, why: '$6 of reward for $2 of risk.' },
          { q: 'With $10,000 and 1% risk, a trade with a $0.50 stop distance allows…', choices: ['200 shares', '20 shares', '2,000 shares'], a: 0, why: '1% is $100; $100 ÷ $0.50 = 200 shares.' },
          { q: 'Where does a sensible stop usually go?', choices: ['Where the trade idea is proven wrong, such as below support', 'At a random round number', 'As close as possible to the entry'], a: 0, why: 'A stop should mark the point where the setup no longer makes sense.' },
        ],
        takeaways: ['Decide entry, stop and target before you trade.', 'Size positions from the dollar risk, not from what you can afford.', 'Place stops beyond normal noise, where the idea is wrong.'],
      },
      {
        id: 'expectancy',
        title: 'Win rate, expectancy and streaks',
        hook: 'Why winning less than half your trades can still work, and why streaks will test you.',
        mins: 8,
        steps: [
          {
            h: 'Expectancy',
            body: `<p>A high [[win-rate]] is not the goal. What matters is [[expectancy]]: the average result per trade, combining how often you win with how much you win and lose.</p>
<p>Expectancy in R = win rate × average win − loss rate × average loss. The green area of the grid shows combinations that make money over time.</p>`,
            predict: {
              q: 'A strategy wins only 35% of the time, but its winners are 3 times its losers. Over many trades it…',
              choices: ['Makes money', 'Loses money', 'Breaks even'],
              a: 0,
              why: '0.35 × 3R − 0.65 × 1R = +0.4R per trade. Small, frequent losses and big, rarer wins can be a strong edge.',
            },
            viz: { type: 'expectancyGrid' },
          },
          {
            h: 'Same edge, very different paths',
            body: `<p>Even with a real edge, results arrive in a random order. Here are 20 possible runs of the same strategy, each risking 1% per trade.</p>
<p>Some paths look brilliant, others painful, yet the edge is identical. That is why you judge a strategy over many trades, not the last few.</p>`,
            viz: { type: 'tradePaths' },
          },
          {
            h: 'Losing streaks are normal',
            body: `<p>[[losing-streak|Losing streaks]] are guaranteed. A strategy that wins 40% of the time will, over 100 trades, very likely see 6 or more losses in a row at some point.</p>
<p>See how likely each streak length is. <mark>If a normal streak would empty your account or break your nerve, your size is too big.</mark></p>`,
            viz: { type: 'streaks' },
          },
        ],
        quiz: [
          { q: 'Win rate 50%, average win 2R, average loss 1R. Expectancy is…', choices: ['+0.5R per trade', '0', '−0.5R per trade'], a: 0, why: '0.5 × 2 − 0.5 × 1 = 0.5R.' },
          { q: 'Why can a 70% win rate still lose money?', choices: ['The average loss can be much bigger than the average win', 'It cannot', 'Brokers take the wins'], a: 0, why: 'For example, winning 1R seven times and losing 4R three times nets −5R.' },
          { q: 'A long losing streak in a strategy with a proven edge usually means…', choices: ['Normal randomness; keep size small and stick to the rules', 'The strategy is broken and must be abandoned', 'You should double your size to win it back'], a: 0, why: 'Streaks are expected. Doubling size after losses is how accounts blow up.' },
        ],
        takeaways: ['Expectancy, not win rate, decides whether a strategy works.', 'The same edge can produce very different paths.', 'Expect losing streaks and size positions to survive them.'],
      },
      {
        id: 'backtesting',
        title: 'Backtesting and its traps',
        hook: 'Testing rules on the past, honestly.',
        mins: 8,
        steps: [
          {
            h: 'What a backtest is',
            body: `<p>A [[backtest]] applies exact rules to past data to see how they would have done. Here the rule is simple: own the stock while it closes above its moving average, and sell when it closes below.</p>
<p>Compare it with simply buying and holding, then add realistic trading costs. Small costs per trade add up quickly for rules that trade often.</p>`,
            viz: { type: 'backtest' },
          },
          {
            h: 'Overfitting',
            body: `<p>With enough tweaking, you can make any rule look great on past data. That is [[overfitting]]: you have fitted the noise.</p>
<p>The fix is an [[out-of-sample]] test: design on one period, then test on data you never touched. Here the prices are pure coin flips. Find the "best" moving average on the first half, then watch it on the second half.</p>`,
            predict: {
              q: 'The best moving-average length on the first half of a random chart returned +40%. What will it most likely do on the second half?',
              choices: ['About +40% again', 'Something close to random, often much worse', 'Exactly zero'],
              a: 1,
              why: 'On random data there is no real pattern to find. The “best” setting just matched past noise, and that noise does not repeat.',
            },
            viz: { type: 'overfit' },
          },
          {
            h: 'Other backtest traps',
            body: `<p>Backtests can mislead in several other ways, including [[look-ahead-bias]] and [[survivorship-bias]]. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Trap',
              back: 'What goes wrong',
              items: [
                ['Look-ahead bias', 'Using information you would not have had.', 'Such as trading at a day’s close based on that same close, or using earnings figures before their release date.'],
                ['Survivorship bias', 'Testing only today’s survivors.', 'Companies that went bankrupt or were delisted vanish from the data, so the past looks rosier than it was.'],
                ['Ignoring costs', 'Leaving out commissions, spreads and slippage.', 'A strategy that trades daily can turn a paper profit into a real loss.'],
                ['Too few trades', 'Judging from a handful of results.', 'Ten trades can look great by luck. Hundreds are needed to trust an edge.'],
                ['Data snooping', 'Testing hundreds of ideas and keeping the winner.', 'Some will look good by chance alone. The more you test, the more you must discount the best result.'],
                ['Changing markets', 'Assuming the past repeats.', 'Market behavior shifts. Rules need re-checking, and edges can fade once widely known.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Overfitting means…', choices: ['Tuning rules to past noise so they fail on new data', 'Using too little data on purpose', 'Trading too rarely'], a: 0, why: 'The rules memorize the past instead of capturing something real.' },
          { q: 'The most honest check of a backtested idea is…', choices: ['Testing it on data that was not used to design it', 'Running it again on the same data', 'Adding more indicators'], a: 0, why: 'Out-of-sample results show whether the edge survives contact with new data.' },
          { q: 'A backtest that only uses companies that exist today suffers from…', choices: ['Survivorship bias', 'Look-ahead bias', 'Low volume'], a: 0, why: 'The failures are missing, which flatters the results.' },
        ],
        takeaways: ['Backtests apply exact rules to past data; include realistic costs.', 'Overfitting is easy; always test out of sample.', 'Watch for look-ahead bias, survivorship bias and too few trades.'],
      },
      {
        id: 'trading-plan',
        title: 'Your trading plan and journal',
        hook: 'Rules written in calm moments, and records that show what works.',
        mins: 8,
        steps: [
          {
            h: 'A pre-trade checklist',
            body: `<p>A written plan turns trading from reacting into following rules. Before every trade, run the same checklist. If any box stays empty, there is no trade.</p>
<p>Tick the boxes for a trade you are considering.</p>`,
            viz: { type: 'tradeChecklist' },
          },
          {
            h: 'Keep a journal',
            body: `<p>A [[trading-journal]] records every trade: the setup, entry, stop, exit and the result in R. Over time it shows which setups actually work for you, and which habits cost you.</p>
<p>Here is a sample journal. Add your own practice trades and watch the statistics update. They are saved only in this browser.</p>`,
            viz: { type: 'journal' },
          },
          {
            h: 'Discipline or emotion?',
            body: `<p>Most trading damage is self-inflicted: moving stops, [[revenge-trading]], and doubling down. Sort these.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'good', label: 'Discipline' },
                { k: 'red', label: 'Emotion' },
              ],
              items: [
                ['Moving the stop further away because the trade is going against you.', 'red', 'It turns a planned small loss into an unplanned big one.'],
                ['Taking the stop exactly where you planned, then moving on.', 'good', 'A planned loss is part of the business.'],
                ['Doubling the size on the next trade to win back yesterday’s loss.', 'red', 'Revenge trading: bigger risk exactly when judgment is worst.'],
                ['Stopping for the day after hitting your maximum daily loss.', 'good', 'A circuit breaker protects you from spiraling.'],
                ['Adding more shares to a losing position to “lower the average.”', 'red', 'It increases risk on a trade that is already proving you wrong.'],
                ['Skipping a trade because it does not meet every checklist item.', 'good', 'No trade is a valid decision.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'What should you do if a setup fails one item on your checklist?', choices: ['Skip the trade', 'Take it with double size', 'Remove the item from the checklist'], a: 0, why: 'The checklist only works if it is followed.' },
          { q: 'What is the main value of a trading journal?', choices: ['It reveals which setups and habits actually work for you', 'Brokers require it', 'It guarantees profits'], a: 0, why: 'Your own data, honestly recorded, is the best teacher.' },
          { q: 'Revenge trading is…', choices: ['Hasty, larger trades to win back a loss', 'Following your plan', 'Taking a planned stop'], a: 0, why: 'It is one of the fastest ways to turn small losses into large ones.' },
        ],
        takeaways: ['Use a written checklist: no complete checklist, no trade.', 'Journal every trade in R and review it regularly.', 'Discipline beats emotion: honor stops, size and daily limits.'],
      },
    ],
  });
})();
