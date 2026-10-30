/* Reading the Market Profile, Unit 2 — Reading the day: the initial balance, tails and poor highs, day types. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'initial-balance', term: 'Initial balance (IB)', w: 'initial balance', def: 'The range of the first hour, periods A and B. It is set mostly by short-term traders and becomes the yardstick for the rest of the day.' },
      { id: 'range-extension', term: 'Range extension', w: 'range extension', def: 'Trading beyond the initial balance later in the day. It is a sign that longer-term buyers (extension up) or sellers (extension down) are acting.' },
      { id: 'excess', term: 'Excess (tails)', w: 'excess', def: 'Two or more single-letter rows at the day’s high or low. Price got there briefly and was rejected fast, so the auction ended cleanly. A tail at the low is a buying tail; at the high, a selling tail.' },
      { id: 'poor-high', term: 'Poor high or low', w: 'poor high', def: 'A day’s extreme touched by several periods at the same price, with no tail. The auction there looks unfinished, and price often comes back to test it.' },
      { id: 'single-prints', term: 'Single prints', w: 'single prints', def: 'Rows with only one letter in the middle of a profile. They mark a fast move through prices that one side was eager to leave behind.' },
      { id: 'day-type', term: 'Day type', w: 'day type', def: 'The shape a day’s profile ends up with, such as normal, normal variation, trend, neutral, non-trend or double distribution. Each tells a story about who was in control.' },
    ],
    'profile'
  );

  SS.PROFILE_UNITS.push({
    n: 2,
    title: 'Reading the day',
    blurb: 'Use the first hour as a yardstick, read tails, poor highs and single prints, and recognize six kinds of day.',
    lessons: [
      {
        id: 'mp-initial-balance',
        title: 'The first hour and beyond',
        hook: 'The first hour sets a yardstick. Breaking it tells you who showed up.',
        mins: 8,
        steps: [
          {
            h: 'The initial balance',
            body: `<p>The range of the first hour, periods A and B, is the [[initial-balance]]. Early trading is dominated by short-term traders working out the overnight orders, so the initial balance shows where they found a temporary agreement.</p>
<p>What happens after that is the interesting part. Trading beyond it is called [[range-extension]], and it usually takes bigger, longer-term players. The shaded columns are A and B; letters outside their range are colored.</p>`,
            viz: { type: 'tpoBuild', days: ['normal', 'normalVar'], show: ['ib'], view: 'split' },
          },
          {
            h: 'Who won the day',
            body: `<p>Range extension in one direction means one side took control. Extension in both directions means both sides tried. Switch between the days and read the brackets on the right of each profile.</p>`,
            predict: {
              q: 'Price breaks above the initial balance in period D and spends the rest of the day up there. What does that suggest?',
              choices: ['Longer-term buyers were active', 'Only day traders were trading', 'Nothing: the first hour doesn’t matter'],
              a: 0,
              why: 'Extending the range and holding there takes buyers with size and a longer horizon.',
            },
            viz: { type: 'tpoBuild', days: ['normalVar', 'neutral', 'normal'], show: ['ib'] },
          },
        ],
        quiz: [
          { q: 'The initial balance is…', choices: ['The range of the first hour (periods A and B)', 'Yesterday’s close', 'The day’s value area'], a: 0, why: 'It is the first hour’s high and low.' },
          { q: 'Range extension above the initial balance signals…', choices: ['Longer-term buyers stepping in', 'A quiet day', 'Sellers in control'], a: 0, why: 'New highs beyond the first hour take buying with conviction.' },
          { q: 'Extension on both sides of the initial balance means…', choices: ['Both buyers and sellers tried to take control', 'One side dominated', 'No trading happened'], a: 0, why: 'Two-sided extension is the mark of a neutral day.' },
        ],
        takeaways: ['The first hour’s range is the yardstick for the day.', 'Range extension reveals longer-term players.', 'Extension one way = control; both ways = a two-sided fight.'],
      },
      {
        id: 'mp-tails',
        title: 'Tails, poor highs and single prints',
        hook: 'The edges of a profile show how cleanly the auction ended.',
        mins: 8,
        steps: [
          {
            h: 'Tails and poor highs',
            body: `<p>When price reaches a level and is rejected fast, only one period trades there. Two or more of those single-letter rows at an extreme form a tail, which the book calls [[excess]]: proof that the auction went too far and turned. A buying tail at the low says buyers jumped in; a selling tail at the high says sellers did.</p>
<p>The opposite is a [[poor-high|poor high]]: several periods stalling at exactly the same top, with no tail. The auction there looks unfinished, and price often returns to test it.</p>`,
            predict: {
              q: 'The day’s high was touched by four periods at exactly the same price, with no tail. What do profile traders expect?',
              choices: ['Price will often come back to test that high', 'That high will never be reached again', 'Nothing in particular'],
              a: 0,
              why: 'A flat, tail-less high is an unfinished auction. Markets tend to revisit such levels, though not always.',
            },
            viz: { type: 'tpoBuild', days: ['excess'], show: ['tails'] },
          },
          {
            h: 'Single prints',
            body: `<p>Single-letter rows can also appear in the middle of a profile. These [[single-prints]] mark a stretch price raced through in one period, usually because one side wanted out badly. They often separate two areas of value, and they can act as support or resistance if price comes back.</p>`,
            viz: { type: 'tpoBuild', days: ['double'], show: ['singles', 'va'] },
          },
        ],
        quiz: [
          { q: 'A buying tail at the day’s low means…', choices: ['Buyers rejected those prices quickly', 'Sellers took control', 'Price will fall further'], a: 0, why: 'Only one period traded down there before buyers pushed price back up.' },
          { q: 'A poor high is…', choices: ['A flat, tail-less extreme touched by several periods', 'A high with a long tail', 'The opening price'], a: 0, why: 'Several periods stalling at the same price, with no rejection, leaves the auction unfinished.' },
          { q: 'Single prints in the middle of a profile mark…', choices: ['A fast move through prices', 'The point of control', 'The quietest part of the day'], a: 0, why: 'Price spent only one period crossing those levels.' },
        ],
        takeaways: ['Tails (excess) show a clean rejection at an extreme.', 'Poor highs and lows are unfinished auctions that often get retested.', 'Single prints mark fast moves and often separate two value areas.'],
      },
      {
        id: 'mp-day-types',
        title: 'Day types',
        hook: 'Six shapes, six stories about who was in control.',
        mins: 9,
        steps: [
          {
            h: 'Six kinds of day',
            body: `<p>Most days end up looking like one of a few [[day-type|day types]]. Each shape tells you who was in control and how confident they were:</p>
<p><b>Normal</b>: a wide first hour that holds all day. <b>Normal variation</b>: the range extends one way, ending up to about twice the size of the first hour. <b>Trend</b>: a narrow first hour, then steady extension one way. <b>Neutral</b>: extension on both sides. <b>Non-trend</b>: a tiny, quiet range. <b>Double distribution</b>: two value areas joined by single prints. Replay each one.</p>`,
            viz: { type: 'tpoBuild', days: ['normal', 'normalVar', 'trend', 'neutral', 'nontrend', 'double'], show: ['ib'], about: true },
          },
          {
            h: 'Name that day',
            body: `<p>Each round builds a day’s profile. Name the day type from its shape and its first-hour bracket.</p>`,
            viz: { type: 'dayTypeQuiz' },
          },
        ],
        quiz: [
          { q: 'A narrow first hour followed by steady extension in one direction all day is a…', choices: ['Trend day', 'Normal day', 'Neutral day'], a: 0, why: 'Trend days start narrow and keep extending one way.' },
          { q: 'Range extension on both sides with a close in the middle is a…', choices: ['Neutral day', 'Trend day', 'Double distribution'], a: 0, why: 'Both sides tried and neither won.' },
          { q: 'Two areas of value joined by single prints is a…', choices: ['Double distribution day', 'Non-trend day', 'Normal day'], a: 0, why: 'Value built, moved fast, then built again.' },
        ],
        takeaways: ['A day’s shape tells you who was in control.', 'Narrow first hour + one-way extension = trend; wide first hour holding = normal.', 'Both-sided extension = neutral; two value areas = double distribution.'],
      },
    ],
  });
})();
