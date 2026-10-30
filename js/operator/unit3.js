/* Lessons of a Stock Operator, Unit 3 — The speculator’s enemies: hope and fear, going broke, and human nature. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'hope-and-fear', term: 'Hope and fear', w: 'hope and fear', def: 'The book’s two great enemies of the speculator. Hope keeps you in a losing trade; fear pushes you out of a winning one. The fix is to reverse them: fear the loss, hope for the profit.' },
      { id: 'risk-of-ruin', term: 'Risk of ruin', w: 'risk of ruin', def: 'The chance of losing so much that you can no longer trade. It rises sharply with the share of your account you risk on each trade.' },
      { id: 'boom-and-bust', term: 'Boom and bust', w: 'boom and bust', def: 'The repeating cycle of rising optimism, a speculative mania, a crash and despair. Driven by human nature, so it keeps coming back in new forms.' },
    ],
    'operator'
  );

  SS.OPERATOR_UNITS.push({
    n: 3,
    title: 'The speculator’s enemies',
    blurb: 'Hope and fear, the account-killing size of a bet, and the human nature that makes every boom and panic rhyme.',
    lessons: [
      {
        id: 'hope-and-fear',
        title: 'Hope and fear',
        hook: 'Most traders have them exactly backwards.',
        mins: 8,
        steps: [
          {
            h: 'Backwards by instinct',
            body: `<p>The book's sharpest observation about human nature: when a trade goes against you, you hope it will come back, so you hold; when a trade goes your way, you fear the profit will vanish, so you grab it. Those instincts are exactly backwards. The speculator should fear the loss and cut it, and hope the profit grows and let it run. That is [[hope-and-fear]].</p>
<p>Here are the same 60 random trades handled by two rules. The hopeful trader takes profits at +5% and holds losers until they come back. The disciplined trader cuts losses at −7% and lets winners run until they fall 10% from their high.</p>`,
            viz: { type: 'hopeFear' },
          },
          {
            h: 'The trap of a high win rate',
            body: `<p>The hopeful rule wins far more often, and that is the trap: it feels like skill. But each win is small, and the losses it sits through are large. On random prices like these, which rule ends ahead changes from run to run. What doesn't change is the shape: hope is always one bad trade from disaster.</p>
<p>Deal new sets of trades and watch which numbers stay the same.</p>`,
            predict: {
              q: 'A trader wins 8 trades out of 10. Is that a sign of a good method?',
              choices: ['Not by itself: it depends on how big the losses are', 'Yes, 80% is excellent', 'Yes, as long as the wins are positive'],
              a: 0,
              why: 'Eight wins of $100 and two losses of $600 is a losing method. Win rate means nothing without the size of wins and losses.',
            },
            viz: { type: 'hopeFear', seed: 2 },
          },
        ],
        quiz: [
          { q: 'According to the book, hope and fear should be…', choices: ['Reversed: fear losses, hope profits grow', 'Followed as they come', 'Ignored entirely'], a: 0, why: 'Instinct holds losers and sells winners; the speculator should do the opposite.' },
          { q: 'Why is a high win rate alone misleading?', choices: ['A few large losses can outweigh many small wins', 'High win rates are impossible', 'It means the trader is lucky'], a: 0, why: 'Results depend on win rate and the size of wins versus losses together.' },
          { q: 'What does cutting losses early protect you from most?', choices: ['The one large loss that wrecks an account', 'Every small loss', 'Taxes'], a: 0, why: 'Cutting early caps the size of any single loss.' },
        ],
        takeaways: ['Instinct holds losers and sells winners: reverse it.', 'A high win rate means nothing without the size of wins and losses.', 'Cutting losses caps the damage of any one mistake.'],
      },
      {
        id: 'going-broke',
        title: 'Going broke and coming back',
        hook: 'He was wiped out several times. Size decided whether he could return.',
        mins: 7,
        steps: [
          {
            h: 'Size to survive',
            body: `<p>Livingston went broke more than once, each time by betting too big on being right, or by staying too long while wrong. Each comeback started the same way: small trades, rebuilding capital, then sizing up only as he was proven right.</p>
<p>The lesson is [[risk-of-ruin]]: even a good method goes through losing streaks, and the share of your account you risk per trade decides whether a streak is a setback or the end. Each line below is one possible run of 40 trades that win 40% of the time and pay twice the amount risked. Slide the risk per trade.</p>`,
            viz: { type: 'sizing' },
          },
          {
            h: 'Rules for after a big loss',
            body: `<p>The book is honest about what a big loss does to judgment. Tap each card for a rule that helps you come back instead of digging deeper.</p>`,
            viz: {
              type: 'flipCards',
              front: 'After a loss',
              back: 'Why',
              items: [
                ['Don’t trade to get even', 'The urge to win it back fast.', 'Revenge trades are bigger and less careful, exactly when your judgment is worst.'],
                ['Step back', 'Take time off after a big hit.', 'Livingston did his best work after clearing his head, not while chasing losses.'],
                ['Shrink, then rebuild', 'Smaller size until you are back in rhythm.', 'Small trades limit the damage while you find out whether you have regained your read.'],
                ['Keep a reserve', 'Never put everything at risk.', 'Money you didn’t risk is what lets you trade again tomorrow.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Even with a winning method, risking too much per trade can…', choices: ['Wipe out the account during a normal losing streak', 'Guarantee faster profits', 'Lower the win rate'], a: 0, why: 'Losing streaks happen to every method; large size turns them into ruin.' },
          { q: 'After a big loss, the most dangerous habit is…', choices: ['Trading bigger to win it back quickly', 'Taking a break', 'Reducing size'], a: 0, why: 'Revenge trading enlarges risk exactly when judgment is weakest.' },
          { q: 'How did Livingston rebuild after going broke?', choices: ['Small trades first, sizing up only as he was proven right', 'One huge bet', 'Following tips'], a: 0, why: 'Rebuilding capital and confidence step by step kept him in the game.' },
        ],
        takeaways: ['Risk a small, fixed share of your account per trade.', 'Losing streaks are normal; size decides whether you survive them.', 'After a big loss: step back, shrink, then rebuild.'],
      },
      {
        id: 'human-nature',
        title: 'Nothing new on Wall Street',
        hook: 'The stocks change. The people don’t.',
        mins: 9,
        steps: [
          {
            h: 'The cycle that keeps coming back',
            body: `<p>One of the book's best-known ideas is that there is nothing new on Wall Street: whatever happens in the market today has happened before and will happen again, because human nature doesn't change. Greed builds booms, fear drives panics, and the [[boom-and-bust]] cycle repeats with new names.</p>
<p>In the panic of 1907, Livingston was heavily short as prices collapsed. At the bottom, word reached him that the city's most powerful bankers wanted the selling to stop. He covered his shorts and turned buyer that same day, banking a huge profit. Follow the cycle, then the history.</p>`,
            viz: { type: 'maniaCycle' },
          },
          {
            h: 'Rules from the book, in our words',
            body: `<p>The whole course on six cards. Tap each one.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Rule',
              back: 'Why',
              items: [
                ['Follow the line of least resistance', 'Trade in the direction the market is moving.', 'Wait for price to show the way, and don’t argue with it.'],
                ['Sit tight with winners', 'Let the big move do the work.', 'The big money is in the big swing, not the wiggles.'],
                ['Cut losses quickly', 'A loss means you are wrong.', 'Small losses are the cost of doing business; large ones end careers.'],
                ['Never average a loss', 'Add only to what is working.', 'Pyramid winners, never feed losers.'],
                ['Make up your own mind', 'No tips, no borrowed opinions.', 'Only your own reasons tell you when you are wrong.'],
                ['Remember human nature', 'Greed and fear never change.', 'That is why patterns repeat, and why discipline matters more than cleverness.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Why does the book say there is nothing new on Wall Street?', choices: ['Human nature, which drives markets, never changes', 'Prices never change', 'The same companies always lead'], a: 0, why: 'Greed and fear repeat, so the patterns they create repeat too.' },
          { q: 'In a classic boom-and-bust cycle, the mania stage is marked by…', choices: ['Widespread belief that prices can only go up', 'Deep pessimism', 'Low trading volume'], a: 0, why: 'Euphoria and new-era thinking peak right before the bust.' },
          { q: 'What did Livingston do at the bottom of the 1907 panic?', choices: ['Covered his shorts and turned buyer', 'Sold even more', 'Left the market for good'], a: 0, why: 'He took his profit and bought, as the bankers asked the selling to stop.' },
        ],
        takeaways: ['Booms and panics repeat because human nature doesn’t change.', 'Euphoria marks tops; despair marks bottoms.', 'Discipline beats cleverness: follow the trend, cut losses, sit tight, think for yourself.'],
      },
    ],
  });
})();
