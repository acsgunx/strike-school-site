/* Reading the Market Profile, Unit 3 — Trading with the profile: open types, balance and imbalance, putting it together. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'open-type', term: 'Open type', w: 'open type', def: 'How the market behaves in the first minutes of the session: driving one way, testing then driving, rejecting and reversing, or auctioning around the open. It shows how confident early traders are.' },
      { id: 'balance-imbalance', term: 'Balance and imbalance', w: 'balance and imbalance', def: 'Balance is a market moving sideways in a range because buyers and sellers agree on value. Imbalance is a market trending to new prices because one side has taken control.' },
      { id: 'four-steps', term: 'Four steps of market activity', w: 'four steps of market activity', def: 'A repeating cycle: a directional move, the move being stopped (often leaving excess), sideways balance, and a transition into the next move.' },
    ],
    'profile'
  );

  SS.PROFILE_UNITS.push({
    n: 3,
    title: 'Trading with the profile',
    blurb: 'Judge conviction from the open, follow markets between balance and imbalance, and combine the clues into a plan.',
    lessons: [
      {
        id: 'mp-open-types',
        title: 'Four ways the market opens',
        hook: 'The first minutes show how confident the early traders are.',
        mins: 8,
        steps: [
          {
            h: 'From most to least conviction',
            body: `<p>The book sorts the first minutes of trading into four [[open-type|open types]], from the most confident to the least. <b>Open-drive</b>: price leaves the open and never looks back. <b>Open-test-drive</b>: price first checks a nearby level, then drives the other way. <b>Open-rejection-reverse</b>: price pushes one way, meets resistance, and reverses through the open. <b>Open-auction</b>: price rotates around the open with no clear direction.</p>
<p>Replay each one. The dashed line is the open; the shaded band is yesterday's value area.</p>`,
            viz: { type: 'openTypes' },
          },
          {
            h: 'What the open tells you',
            body: `<p>The open type doesn't predict the close, but it tells you how much conviction is behind the early move, and so how much room to give a trade. Tap each card.</p>`,
            predict: {
              q: 'Price opens and immediately drives higher, never trading back to the opening price. What does that suggest?',
              choices: ['Strong conviction from buyers', 'An undecided market', 'Sellers in control'],
              a: 0,
              why: 'An open-drive shows a side arriving with urgency and size. Fading it means trading against the most confident open there is.',
            },
            viz: {
              type: 'flipCards',
              front: 'Open type',
              back: 'What traders take from it',
              items: [
                ['Open-drive', 'Away from the open at once.', 'High conviction. Don’t fade it; if you trade, go with it.'],
                ['Open-test-drive', 'A quick test, then a drive.', 'Strong conviction once the test is passed. The tested level often holds.'],
                ['Open-rejection-reverse', 'A push, a rejection, a reversal.', 'Moderate conviction. The rejected extreme becomes a reference.'],
                ['Open-auction', 'Rotation around the open.', 'Low conviction. Expect a balanced day until something changes.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Which open type shows the most conviction?', choices: ['Open-drive', 'Open-auction', 'Open-rejection-reverse'], a: 0, why: 'Price leaves the open and never returns.' },
          { q: 'Price tests below the open, finds buyers at yesterday’s value, then drives up through the open. That is an…', choices: ['Open-test-drive', 'Open-auction', 'Open-drive'], a: 0, why: 'A test first, then a drive the other way.' },
          { q: 'An open-auction usually points to…', choices: ['A balanced, undecided day', 'A strong trend', 'A guaranteed reversal'], a: 0, why: 'Rotation around the open shows no side is in control yet.' },
        ],
        takeaways: ['Open types run from drive (most conviction) to auction (least).', 'Don’t fade an open-drive.', 'The open shows conviction, not the close.'],
      },
      {
        id: 'mp-balance',
        title: 'Balance and imbalance',
        hook: 'Markets alternate between sideways agreement and trending searches.',
        mins: 9,
        steps: [
          {
            h: 'Brackets and breakouts',
            body: `<p>Across days, markets alternate between [[balance-imbalance|balance and imbalance]]. In balance, each day's value area overlaps the last: buyers and sellers agree, and price rotates in a range, often called a bracket. In imbalance, one side takes control and value moves to new prices, until the move is stopped and a new balance forms.</p>
<p>The book describes this as [[four-steps|four steps of market activity]]: a directional move, the move being stopped, sideways balance, and a transition to the next move. Replay ten days.</p>`,
            viz: { type: 'balanceCycle' },
          },
          {
            h: 'Trading each state',
            body: `<p>Balance and imbalance call for opposite tactics. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'State',
              back: 'Typical approach',
              items: [
                ['Balance (bracket)', 'Value areas overlap day after day.', 'Fade the edges of the bracket and expect a return toward the middle.'],
                ['Breakout attempt', 'Price leaves the bracket.', 'Watch for acceptance: value building outside the bracket confirms the move.'],
                ['Imbalance (trend)', 'Value moves higher or lower each day.', 'Trade with the move; don’t fade it until it is stopped.'],
                ['Excess at the end', 'A tail marks where the move was stopped.', 'The tail becomes a reference, and a new balance often forms next.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Day after day of overlapping value areas describes…', choices: ['Balance', 'Imbalance', 'A trend day'], a: 0, why: 'Overlapping value means agreement on price.' },
          { q: 'In imbalance, the usual approach is to…', choices: ['Trade with the move', 'Fade every move', 'Stop trading'], a: 0, why: 'One side is in control until the move is stopped.' },
          { q: 'Which order matches the four steps of market activity?', choices: ['Directional move, move stopped, balance, transition', 'Balance, balance, balance, balance', 'Transition, crash, rally, close'], a: 0, why: 'Move, stop, balance, transition, then the next move.' },
        ],
        takeaways: ['Balance: overlapping value, fade the edges.', 'Imbalance: value moves, trade with it.', 'Move, stop, balance, transition: the cycle repeats.'],
      },
      {
        id: 'mp-checklist',
        title: 'Putting it together',
        hook: 'Every structure is a clue. Read them together.',
        mins: 7,
        steps: [
          {
            h: 'Bullish or bearish clue?',
            body: `<p>No single structure is a signal on its own. Profile traders weigh the clues together. Sort each one.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'good', label: 'Bullish' },
                { k: 'red', label: 'Bearish' },
              ],
              items: [
                ['A buying tail at the day’s low.', 'good', 'Buyers rejected lower prices fast.'],
                ['Range extension down after the first hour.', 'red', 'Longer-term sellers pushed beyond the opening range.'],
                ['Each half-hour making a higher low.', 'good', 'One-timeframing up: buyers in control.'],
                ['Value area well below yesterday’s.', 'red', 'Value is migrating lower.'],
                ['An open-drive higher that never revisits the open.', 'good', 'The most confident open, to the upside.'],
                ['A selling tail at the day’s high.', 'red', 'Sellers rejected higher prices fast.'],
              ],
            },
          },
          {
            h: 'A profile reader’s checklist',
            body: `<p>The whole course on six cards. Tap each one.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Ask',
              back: 'Why',
              items: [
                ['Where is value?', 'Today’s value area versus yesterday’s.', 'Higher, lower or overlapping value tells you which way acceptance is moving.'],
                ['How did it open?', 'Drive, test-drive, rejection-reverse or auction.', 'It sets how much conviction to expect early on.'],
                ['Who is acting?', 'Range extension, tails, one-timeframing.', 'These are the fingerprints of longer-term money.'],
                ['How did the extremes end?', 'Tails or poor highs and lows.', 'Excess means the auction finished; a poor extreme will often be retested.'],
                ['Balance or imbalance?', 'Bracket or trend across days.', 'Fade the edges in balance; go with the move in imbalance.'],
                ['What would change my mind?', 'A level where the read is wrong.', 'Every read is a probability. Decide in advance where you are wrong.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'A selling tail at the high plus value migrating lower is…', choices: ['A bearish combination', 'A bullish combination', 'Meaningless'], a: 0, why: 'Both clues point to sellers in control.' },
          { q: 'Why weigh several clues instead of one?', choices: ['Each structure is only a probability on its own', 'One clue is always enough', 'Clues never conflict'], a: 0, why: 'Agreement among clues strengthens a read.' },
          { q: 'A poor high on yesterday’s profile suggests…', choices: ['The high may be retested', 'The high can never be reached', 'A guaranteed crash'], a: 0, why: 'Unfinished auctions tend to be revisited.' },
        ],
        takeaways: ['Read value, the open, who is acting, the extremes, and balance versus imbalance.', 'Weigh clues together; no single one decides.', 'Know where your read would be wrong.'],
      },
    ],
  });
})();
