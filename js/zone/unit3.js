/* The Trading Mindset, Unit 3 — Becoming consistent: accepting risk, seven principles, the 20-trade exercise. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'accepting-risk', term: 'Accepting risk', w: 'accepting risk', def: 'Being genuinely at peace with a trade’s predefined loss before entering, so that taking the loss, if it comes, causes no emotional pain and no hesitation.' },
      { id: 'trading-consistency', term: 'Consistency (trading)', w: 'consistency', def: 'Results that come from doing the same disciplined things every time, rather than from occasional big wins. It is a habit of mind before it is a number.' },
      { id: 'the-zone', term: 'The zone', w: 'the zone', def: 'A state of trading without fear or overconfidence: seeing what the market offers, acting on your edge, and taking each result calmly as one of many.' },
    ],
    'zone'
  );

  SS.ZONE_UNITS.push({
    n: 3,
    title: 'Becoming consistent',
    blurb: 'Accept the risk before you enter, follow seven principles of consistency, and practice thinking in series with a 20-trade exercise.',
    lessons: [
      {
        id: 'zone-accept-risk',
        title: 'Accepting risk',
        hook: 'If a loss would hurt, you haven’t accepted the risk.',
        mins: 8,
        steps: [
          {
            h: 'Four fears behind most mistakes',
            body: `<p>Douglas traces most trading errors back to fear. Nearly every trader knows the right action; fear makes the wrong one feel safer in the moment. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'The fear of…',
              back: 'What it makes you do',
              items: [
                ['Being wrong', 'A loss feels like a judgment on you.', 'You hesitate to enter, or refuse to cut a loser because closing it admits the mistake.'],
                ['Missing out', 'Watching a move happen without you.', 'You chase entries late, without a plan, often near the top.'],
                ['Losing money', 'Every loss feels like real pain.', 'You skip valid signals and grab small profits before the trade can work.'],
                ['Leaving money on the table', 'Regret over profit not taken.', 'You hold too long, add impulsively, or overtrade trying to catch everything.'],
              ],
            },
          },
          {
            h: 'Know the loss before you enter',
            body: `<p>[[accepting-risk|Accepting risk]] doesn't mean knowing a trade has risk; everyone knows that. It means being truly fine with a specific loss before entering, so that taking it causes no pain. That only works if the loss is defined in advance and sized small enough to be genuinely acceptable.</p>
<p>Set your account, risk per trade and stop. The calculator shows the position size, the exact loss if the stop is hit, and what a streak of losses would do.</p>`,
            predict: {
              q: 'You risk 1% of your account per trade. After 10 losses in a row, roughly how much of the account is gone?',
              choices: ['About 10%', 'About 1%', 'About half'],
              a: 0,
              why: 'Each loss takes 1% of what is left: 0.99¹⁰ ≈ 0.904, so about 9.6% is gone. Painful, but survivable.',
            },
            viz: { type: 'riskCalc' },
          },
        ],
        quiz: [
          { q: 'Accepting risk means…', choices: ['Being at peace with a predefined loss before entering', 'Knowing that trading is risky', 'Never taking losses'], a: 0, why: 'Acceptance is emotional, not intellectual: the loss must feel acceptable before you enter.' },
          { q: 'Fear of missing out typically leads to…', choices: ['Chasing late entries without a plan', 'Cutting losses quickly', 'Taking every signal calmly'], a: 0, why: 'The urge to be in the move overrides the plan.' },
          { q: 'Why define the loss before entering?', choices: ['So you can size it to be truly acceptable', 'Because brokers require it', 'It makes the trade win'], a: 0, why: 'A known, small loss is easy to accept; an open-ended one is not.' },
        ],
        takeaways: ['Most trading errors trace back to fear.', 'Define the loss before you enter, and size it small enough to accept.', 'At 1% risk, even ten losses in a row are survivable.'],
      },
      {
        id: 'zone-seven-principles',
        title: 'Seven principles of consistency',
        hook: 'The habits that turn an edge into consistent results.',
        mins: 7,
        steps: [
          {
            h: 'Seven principles, in our words',
            body: `<p>Douglas sums up [[trading-consistency]] as a short list of principles a trader commits to without exception. Here they are in our own words. Tap each card for why it matters.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Principle',
              back: 'Why it matters',
              items: [
                ['1. Know your edge objectively', 'Write down exactly what a setup looks like.', 'If it isn’t defined, fear and hope will define it for you in the moment.'],
                ['2. Define every trade’s risk in advance', 'Entry, stop and size before you click.', 'A loss you planned is just a cost; one you didn’t plan is a crisis.'],
                ['3. Accept that risk completely', 'Or don’t take the trade.', 'If the loss would sting, the size is too big or the trade isn’t for you.'],
                ['4. Act without hesitation', 'When the edge appears, take it.', 'Hesitating on valid signals breaks the series the edge depends on.'],
                ['5. Take profits as the market offers them', 'Have a plan for paying yourself.', 'Profit only exists once it is taken; decide in advance how you will take it.'],
                ['6. Watch yourself for errors', 'Notice when emotion starts deciding.', 'Catching a slip early keeps one mistake from becoming a habit.'],
                ['7. Treat these as non-negotiable', 'Never trade without them.', 'Consistency comes from always, not usually.'],
              ],
            },
          },
          {
            h: 'Consistent or not?',
            body: `<p>Sort each habit.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'red', label: 'Breaks a principle' },
                { k: 'good', label: 'Consistent' },
              ],
              items: [
                ['Writing down entry, stop and size before placing the order.', 'good', 'Defining the risk in advance is principle 2.'],
                ['Skipping a valid signal because the last two lost.', 'red', 'Hesitation breaks the series the edge relies on.'],
                ['Moving the stop further away because the trade is close to it.', 'red', 'That changes the risk you accepted after the fact.'],
                ['Taking partial profits at the target you planned.', 'good', 'Paying yourself as planned is principle 5.'],
                ['Doubling size after a big win because you feel on a roll.', 'red', 'Emotion is now deciding the size.'],
                ['Pausing for the day after noticing you are trading angry.', 'good', 'Monitoring yourself for errors is principle 6.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'If a trade’s potential loss would really upset you, you should…', choices: ['Reduce the size or skip the trade', 'Take it and hope', 'Remove the stop'], a: 0, why: 'The risk must be fully accepted before entering.' },
          { q: 'Which habit breaks the principle of acting without hesitation?', choices: ['Skipping valid signals after a few losses', 'Taking every signal at the same risk', 'Writing down your setup'], a: 0, why: 'The skipped trades are as likely to win as any others.' },
          { q: 'Consistency comes from…', choices: ['Following the principles every time', 'Following them when convenient', 'Occasional big wins'], a: 0, why: 'Always, not usually.' },
        ],
        takeaways: ['Define the edge, the risk and the profit plan in advance.', 'Accept the risk fully, then act without hesitation.', 'Watch yourself, and treat the rules as non-negotiable.'],
      },
      {
        id: 'zone-twenty-trades',
        title: 'The 20-trade exercise',
        hook: 'Practice thinking in series, one trade at a time.',
        mins: 9,
        steps: [
          {
            h: 'Take the next 20 trades',
            body: `<p>To build the habit, Douglas suggests an exercise: choose one simple edge, define the entry, stop and profit-taking exactly, and then take the next 20 signals precisely as defined, with small size, no matter what happens. The point isn't the money; it's to experience a series of trades as a series.</p>
<p>Try it here. Each signal has the same edge: 45% of trades win 2 units, 55% lose 1. Your only job is to take every one. If you skip a trade, you'll see what it would have done.</p>`,
            viz: { type: 'twentyTrades' },
          },
          {
            h: 'Into the zone',
            body: `<p>Douglas calls the state he is aiming for [[the-zone]]: trading without fear or overconfidence, seeing what the market offers rather than what you dread, and taking each result as one of many. It isn't a personality; it's a habit, built by doing the exercise above for real, with small size, and keeping a log of how well you followed your rules. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'In the zone',
              back: 'What it looks like',
              items: [
                ['A loss arrives', 'Calm, not crushed.', 'It was defined, accepted and expected; the next trade starts fresh.'],
                ['A signal appears', 'Action, not hesitation.', 'You don’t need this one to work; the series will.'],
                ['A trade wins big', 'Steady, not euphoric.', 'You stick to your size and rules instead of feeling invincible.'],
                ['You judge your day', 'Process, not profit.', 'Did you follow every rule? That is the score that compounds.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'The main point of the 20-trade exercise is to…', choices: ['Experience trading as a series and follow the rules every time', 'Make as much money as possible', 'Find a new indicator'], a: 0, why: 'It trains the habit of thinking in series and acting without hesitation.' },
          { q: 'During the exercise, a trade you skipped would have won. The lesson is…', choices: ['You can’t know which trades will win, so take them all', 'Skipping works if you pick well', 'Change the rules immediately'], a: 0, why: 'Wins and losses arrive in random order.' },
          { q: 'How do you judge a trading day in the zone?', choices: ['By how well you followed your rules', 'By the day’s profit only', 'By how many trades you took'], a: 0, why: 'Process is what you control; results follow over many trades.' },
        ],
        takeaways: ['Practice with 20 trades, small size, rules followed exactly.', 'Skipped trades are random; take them all.', 'Judge yourself on the process; the results follow over the series.'],
      },
    ],
  });
})();
