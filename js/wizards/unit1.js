/* Lessons from the Market Wizards, Unit 1 — What the wizards share: many paths, early losses, common traits. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'trading-style', term: 'Trading style', w: 'trading style', def: 'The combination of how long you hold (minutes to years) and how you decide (systematic rules or judgment, technical or fundamental). Many styles can work; the one that fits you is the one you can follow.' },
      { id: 'systematic-trading', term: 'Systematic trading', w: 'systematic trading', def: 'Trading by fixed rules, often coded into a computer, so the same conditions always produce the same action. It removes in-the-moment judgment but requires faith in the rules through losing stretches.' },
      { id: 'blowing-up', term: 'Blowing up', w: 'blowing up', def: 'Losing most or all of a trading account. It usually comes from trading too big for the account, not from a single bad idea.' },
    ],
    'wizards'
  );

  SS.WIZARD_UNITS.push({
    n: 1,
    title: 'What the wizards share',
    blurb: 'Top traders used wildly different methods, most lost money first, and they shared a handful of habits that mattered more than any method.',
    lessons: [
      {
        id: 'mw-many-paths',
        title: 'Many paths to the top',
        hook: 'The best traders disagreed about almost everything, except the essentials.',
        mins: 8,
        steps: [
          {
            h: 'A map of styles',
            body: `<p>In <i>Market Wizards</i> (1989, updated 2012), Jack Schwager interviewed some of the most successful traders of his time. This course draws out their shared lessons in our own words; it isn't affiliated with the author or publisher, and the book has the full interviews.</p>
<p>What jumps out first is how different their methods were: computer-driven trend followers, floor traders holding positions for seconds, growth-stock buyers, global economic thinkers, long-term value investors. Each has a [[trading-style]]. Tap a name to see where it sits.</p>`,
            predict: {
              q: 'With methods this different, what did the most successful traders in the book have in common?',
              choices: ['Discipline and tight control of risk', 'The same indicator', 'The same holding period'],
              a: 0,
              why: 'Their methods varied enormously. What they shared was a method they believed in, the discipline to follow it, and careful risk control.',
            },
            viz: { type: 'wizardMap' },
          },
          {
            h: 'No single right method',
            body: `<p>Schwager's conclusion is that there is no holy grail. Every approach has strengths and costs, from [[systematic-trading]] to pure judgment, and the right one is the one that fits your temperament well enough that you can follow it when it hurts. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Approach',
              back: 'Strength and cost',
              items: [
                ['Systematic', 'Rules decide every trade.', 'Removes emotion, but you must stick with it through long losing stretches.'],
                ['Discretionary', 'Judgment in the moment.', 'Flexible, but only as good as the trader’s discipline that day.'],
                ['Short term', 'Minutes to days.', 'Many small edges; focus and execution matter most.'],
                ['Long term', 'Months to years.', 'Few big ideas; patience and conviction through deep pullbacks.'],
                ['Fundamental', 'Economics, earnings, supply and demand.', 'Explains why a price should move; price action still decides when.'],
                ['Technical', 'Price and volume patterns.', 'Shows what the market is doing now; needs firm rules for when it is wrong.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'What was the most consistent finding across the interviews?', choices: ['Very different methods, shared discipline and risk control', 'Everyone used the same system', 'Only long-term investing works'], a: 0, why: 'Methods varied widely; habits around risk and discipline did not.' },
          { q: 'According to the book’s conclusions, the best method for you is…', choices: ['One that fits your temperament so you can follow it', 'Whatever made the most money last year', 'The most complex one'], a: 0, why: 'A method you abandon under pressure doesn’t help.' },
          { q: 'A systematic trader’s main challenge is usually…', choices: ['Sticking with the rules through losing stretches', 'Reading the news fast enough', 'Picking which rule to follow each day'], a: 0, why: 'The rules work only if they are followed through the bad periods too.' },
        ],
        takeaways: ['Top traders used very different methods.', 'There is no holy grail, only methods that fit or don’t fit you.', 'What they shared was discipline and risk control.'],
      },
      {
        id: 'mw-losing-first',
        title: 'Most of them lost first',
        hook: 'Early blowups were common. Survival was the real skill.',
        mins: 7,
        steps: [
          {
            h: 'Blowing up early',
            body: `<p>A striking theme in the interviews: several of these traders wiped out their first accounts. Michael Marcus, for one, lost money repeatedly before he learned discipline from the trend follower Ed Seykota. What changed wasn't their ideas so much as how much they risked on each one. [[blowing-up|Blowing up]] usually comes from size, not from one bad call.</p>
<p>Below, one trader with a modest edge takes the same 200 trades three ways: risking 25%, 10% or 1% of the account on each.</p>`,
            viz: { type: 'blowupStory' },
          },
          {
            h: 'What the early losses taught',
            body: `<p>The interviewed traders kept returning to the same handful of lessons from their early losses. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Early mistake',
              back: 'The lesson',
              items: [
                ['Trading too big', 'A few losses wiped out the account.', 'Size small enough that a long losing streak is survivable.'],
                ['No exit plan', 'Holding losers and hoping.', 'Decide where you are wrong before you enter, and act on it.'],
                ['Following others', 'Tips and borrowed opinions.', 'Success came once they trusted their own method.'],
                ['Not reviewing', 'Repeating the same errors.', 'They treated each loss as tuition and studied what went wrong.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Why did many early trading accounts fail?', choices: ['Too much risk per trade', 'Bad luck only', 'Too few trades'], a: 0, why: 'Oversized bets turn a normal losing streak into ruin.' },
          { q: 'With the same edge, risking 1% instead of 25% per trade…', choices: ['Lets the trader survive streaks long enough for the edge to work', 'Removes all losses', 'Guarantees a profit on every trade'], a: 0, why: 'Small size doesn’t prevent losses; it prevents ruin.' },
          { q: 'How did the wizards treat their losses?', choices: ['As lessons to study', 'As bad luck to forget', 'As reasons to double up'], a: 0, why: 'Reviewing mistakes is how they stopped repeating them.' },
        ],
        takeaways: ['Many top traders lost their first accounts.', 'Blowups come from size more than from bad ideas.', 'Survive first; the edge needs time to work.'],
      },
      {
        id: 'mw-traits',
        title: 'What they had in common',
        hook: 'The habits that mattered more than any method.',
        mins: 7,
        steps: [
          {
            h: 'Shared traits',
            body: `<p>Schwager ends the book by pulling together what the interviews had in common. In our words, here are the traits that came up again and again. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Trait',
              back: 'Why it mattered',
              items: [
                ['A method', 'Every one of them had a defined way of trading.', 'Without one, every decision is improvised, and emotion fills the gap.'],
                ['Discipline', 'They followed the method when it was hard.', 'A method only works if it is followed through the bad stretches.'],
                ['Risk control', 'Losses were kept small, always.', 'Survival comes first; the big wins take care of themselves.'],
                ['Independence', 'They made their own decisions.', 'Crowded opinions rarely pay; their edge came from their own judgment.'],
                ['Patience', 'Waiting for the right trade, and holding it.', 'Most of their profits came from a small number of well-chosen trades.'],
                ['Love of the game', 'They found trading fascinating, not just lucrative.', 'Curiosity kept them learning through the losing years.'],
              ],
            },
          },
          {
            h: 'Wizard habit or amateur habit?',
            body: `<p>Sort each habit.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'good', label: 'Wizard habit' },
                { k: 'red', label: 'Amateur habit' },
              ],
              items: [
                ['Deciding the exit before entering the trade.', 'good', 'Every wizard knew where they were wrong in advance.'],
                ['Doubling up to win back yesterday’s loss.', 'red', 'Revenge trading is how accounts blow up.'],
                ['Trading less after a losing streak.', 'good', 'Cutting size when out of sync was a common defensive habit.'],
                ['Buying because a popular commentator recommended it.', 'red', 'The wizards made their own decisions.'],
                ['Sticking with a tested method through a rough month.', 'good', 'Discipline through the bad stretches is what lets an edge pay.'],
                ['Changing strategy after every losing trade.', 'red', 'A method needs a long series of trades to be judged.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Which trait did the wizards share most clearly?', choices: ['Strict risk control', 'Using the same indicator', 'Trading only stocks'], a: 0, why: 'Keeping losses small was universal.' },
          { q: 'Independence in trading means…', choices: ['Making your own decisions instead of following the crowd', 'Never using any rules', 'Trading alone at night'], a: 0, why: 'Their edge came from their own reasoned views.' },
          { q: 'Most of the wizards’ profits tended to come from…', choices: ['A relatively small number of big winners', 'Every single trade', 'Tips from insiders'], a: 0, why: 'Patience to wait for and hold the right trades paid the most.' },
        ],
        takeaways: ['Have a method, and follow it.', 'Control risk on every trade, and think for yourself.', 'Be patient: a few great trades do most of the work.'],
      },
    ],
  });
})();
