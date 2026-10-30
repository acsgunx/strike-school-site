/* The Trading Mindset, Unit 1 — Why analysis isn’t enough: a market with no walls, responsibility, unique moments. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'trading-edge', term: 'Edge', w: 'edge', def: 'Any condition that makes one outcome more likely than another over many trades. An edge tilts the odds; it never tells you how the next trade will turn out.' },
      { id: 'self-discipline', term: 'Self-discipline (trading)', w: 'self-discipline', def: 'Following rules you set for yourself when nothing outside you forces you to. In an open-ended market, it is the only structure a trader has.' },
      { id: 'taking-responsibility', term: 'Taking responsibility', w: 'taking responsibility', def: 'Accepting that every trading result comes from your own decisions, not from the market, other traders or bad luck. It is the starting point for changing those decisions.' },
    ],
    'zone'
  );

  SS.ZONE_UNITS.push({
    n: 1,
    title: 'Why analysis isn’t enough',
    blurb: 'Many traders understand charts and still lose. Find out why: a market with no walls, the habit of blame, and setups that look identical but end differently.',
    lessons: [
      {
        id: 'zone-why-fail',
        title: 'A market with no walls',
        hook: 'Knowing what to do and doing it are two different skills.',
        mins: 8,
        steps: [
          {
            h: 'Freedom is the problem',
            body: `<p>Mark Douglas wrote <i>Trading in the Zone</i> (2000) after years of coaching traders who knew plenty about markets and still lost. His conclusion: the main problem usually isn't analysis, it's the trader's mindset. This course explains his ideas in our own words; it isn't affiliated with the author or publisher, and the book has the full argument.</p>
<p>His first point: most of life comes with structure, like a boss, working hours and rules. The market has none. You can trade any size, any time, and hold a loser forever. Nobody stops you from breaking your own plan, so the only structure is the [[self-discipline]] you bring. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'The market gives you no…',
              back: 'So you must supply',
              items: [
                ['Boss', 'Nobody tells you when to act.', 'Your own written rules for entering, exiting and standing aside.'],
                ['Limits', 'Any size, any time, as often as you like.', 'A fixed risk per trade and a limit on how much you trade.'],
                ['Ending', 'A trade stays open as long as you let it.', 'An exit decided before you enter, so hope can’t keep a loser alive.'],
                ['Honest feedback', 'A bad decision can still win by luck.', 'Judging yourself on whether you followed the rules, not on any single result.'],
              ],
            },
          },
          {
            h: 'Same edge, different trader',
            body: `<p>Two traders get the same 100 signals from the same [[trading-edge|edge]]: 45% of trades win 2 units, 55% lose 1. One takes every signal exactly as planned. The other is only human: after a few losses they skip trades, they grab half their winners early because they fear giving the profit back, and they let half their losers run further, hoping they turn around.</p>
<p>The habits sound small. Watch what they do to the same edge.</p>`,
            predict: {
              q: 'The second trader’s habits are small tweaks: skipping a few trades, taking some profits early, giving some losers extra room. What do they do to a winning edge?',
              choices: ['They can erase it completely', 'They barely matter', 'They improve it by reducing risk'],
              a: 0,
              why: 'Smaller wins and bigger losses on the same signals flip the math: on average, a trade goes from +0.35 units to slightly below zero.',
            },
            viz: { type: 'sameEdge' },
          },
        ],
        quiz: [
          { q: 'Why does the open-ended nature of the market make trading hard?', choices: ['Nothing outside you enforces your rules', 'Prices never move', 'You can only trade once a day'], a: 0, why: 'Without external structure, discipline has to come from you.' },
          { q: 'An edge of 45% winners at 2 units and 55% losers at 1 unit earns on average…', choices: ['+0.35 units per trade', '−0.10 units per trade', 'Exactly zero'], a: 0, why: '0.45 × 2 − 0.55 × 1 = 0.35.' },
          { q: 'Taking winners early and letting losers run tends to…', choices: ['Shrink or erase the edge', 'Increase the edge', 'Have no effect'], a: 0, why: 'It cuts the average win and grows the average loss.' },
        ],
        takeaways: ['The market has no walls; your rules are the only structure.', 'Skilled analysis fails when the trader doesn’t follow it.', 'Small deviations can turn a winning edge into a losing one.'],
      },
      {
        id: 'zone-responsibility',
        title: 'Taking responsibility',
        hook: 'The market offers prices. Everything else is your decision.',
        mins: 7,
        steps: [
          {
            h: 'The market owes you nothing',
            body: `<p>Douglas puts [[taking-responsibility]] at the start of everything. The market doesn't take your money or hunt your stop; it only offers prices, and every trade is your choice. As long as results feel like something done to you, you'll look for a fix outside yourself: a better indicator, a new guru, a different market.</p>
<p>Owning every outcome is uncomfortable at first, but it's freeing: if your decisions caused the result, your decisions can change it.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Blame',
              back: 'Ownership',
              items: [
                ['“The market took my money.”', 'Treats the market as an opponent.', '“I entered without an exit and held too long.” Now there’s something to fix.'],
                ['“They hunted my stop.”', 'Blames invisible players.', '“My stop sat where everyone’s sits. I’ll place it where the idea is truly wrong.”'],
                ['“I’d have won if the news hadn’t come out.”', 'Blames bad luck.', '“Unexpected news is part of the risk I accepted when I entered.”'],
                ['“This indicator failed me.”', 'Blames the tool.', '“No indicator is right every time. I sized the trade as if it were.”'],
              ],
            },
          },
          {
            h: 'Blame or ownership?',
            body: `<p>Sort each thought. Ownership sounds less comfortable, but it always points to something you can do differently.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'red', label: 'Blame' },
                { k: 'good', label: 'Ownership' },
              ],
              items: [
                ['“Wall Street is rigged against small traders.”', 'red', 'Even if the field isn’t level, this thought leaves you with nothing to change.'],
                ['“I moved my stop because I didn’t want to take the loss.”', 'good', 'An honest account of the decision, and the start of a rule against it.'],
                ['“My broker’s platform made me buy too much.”', 'red', 'You chose the size. A position-size rule fixes it.'],
                ['“I traded out of boredom and broke my plan.”', 'good', 'Naming the real cause lets you guard against it.'],
                ['“That analyst’s call cost me.”', 'red', 'Acting on the call was your decision.'],
                ['“The trade lost, but I followed every rule, so it was a good trade.”', 'good', 'Judging the process, not the single outcome, is exactly the right lens.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Why does taking responsibility help a trader?', choices: ['If your decisions caused the result, your decisions can change it', 'It makes losses smaller automatically', 'It means you never lose'], a: 0, why: 'Responsibility turns results into feedback you can act on.' },
          { q: '“They hunted my stop” is an example of…', choices: ['Blame', 'Ownership', 'Risk management'], a: 0, why: 'It points to others instead of your own stop placement.' },
          { q: 'A trade that lost but followed every rule was…', choices: ['A good trade with a bad outcome', 'A mistake', 'Proof the rules are wrong'], a: 0, why: 'Single outcomes are partly random; process is what you control.' },
        ],
        takeaways: ['The market only offers prices; every trade is your decision.', 'Blame leaves nothing to fix; ownership always does.', 'Judge a trade by whether you followed your rules.'],
      },
      {
        id: 'zone-unique-moments',
        title: 'Every moment is unique',
        hook: 'Setups that look identical can end in opposite ways.',
        mins: 7,
        steps: [
          {
            h: 'Six setups that look the same',
            body: `<p>Analysis finds patterns that have worked before. But each moment in the market comes from the choices of every trader active right then, and that mix is never exactly the same twice. So two setups can look identical and still end in opposite ways.</p>
<p>Here are six setups with the same shape. Play them out.</p>`,
            predict: {
              q: 'Your setup has worked 60% of the time in the past. What do you know about the next one?',
              choices: ['Only that the odds favor it; it can still fail', 'It will work, because the pattern is clear', 'Nothing at all'],
              a: 0,
              why: 'An edge describes many trades, not the next one. Any single setup can go either way.',
            },
            viz: { type: 'setupOutcomes' },
          },
          {
            h: 'More analysis, same uncertainty',
            body: `<p>When a trade fails, the instinct is to add another indicator so that loss can't happen again. But the outcome depends on traders you can't see, making choices they haven't made yet. Analysis can tilt the odds; it can't remove the uncertainty.</p>
<p>Deal more sets. The mix of winners and losers changes every time, even though the setups never do.</p>`,
            viz: { type: 'setupOutcomes', seed: 7 },
          },
        ],
        quiz: [
          { q: 'Why can identical-looking setups end differently?', choices: ['Each moment reflects a unique mix of traders’ decisions', 'Charts are drawn incorrectly', 'Markets are completely random'], a: 0, why: 'Patterns repeat in shape, but the people and decisions behind them differ each time.' },
          { q: 'Adding more indicators after a loss…', choices: ['Can’t remove uncertainty from the next trade', 'Guarantees the next trade wins', 'Is always a mistake'], a: 0, why: 'Indicators can refine odds, but no amount of analysis makes a single trade certain.' },
          { q: 'An edge tells you…', choices: ['What tends to happen over many trades', 'What will happen on the next trade', 'Which way the market is rigged'], a: 0, why: 'An edge is a probability, and probabilities play out over a series.' },
        ],
        takeaways: ['Every market moment is a unique mix of decisions.', 'An edge describes many trades, never the next one.', 'Analysis tilts the odds; it doesn’t remove uncertainty.'],
      },
    ],
  });
})();
