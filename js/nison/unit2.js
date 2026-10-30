/* Japanese Candlesticks, Unit 2 — Two-candle reversals: engulfing patterns, the dark-cloud cover and the piercing
   pattern, and the harami, tweezers and belt holds. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'dark-cloud-cover', term: 'Dark-cloud cover', w: 'dark-cloud cover', def: 'A two-candle top: after a tall green session, the next opens above its high but closes more than halfway down into its real body. The rally was rejected.' },
      { id: 'piercing-pattern', term: 'Piercing pattern', w: 'piercing pattern', def: 'A two-candle bottom: after a tall red session, the next opens below its low but closes more than halfway up into its real body. The selloff was rejected.' },
      { id: 'thrusting-pattern', term: 'Thrusting, in-neck and on-neck patterns', w: 'thrusting pattern', def: 'Weaker relatives of the piercing pattern. After a tall red session, a green session closes below its midpoint, near its close, or near its low. They usually mean the decline will continue.' },
      { id: 'harami', term: 'Harami', w: 'harami', def: 'A two-candle pattern where a small real body sits inside the previous session’s long real body. It warns that the trend has lost its energy. The name is an old Japanese word for pregnant.' },
      { id: 'harami-cross', term: 'Harami cross', w: 'harami cross', def: 'A harami whose second session is a doji. It is a stronger warning than an ordinary harami.' },
      { id: 'tweezers', term: 'Tweezers top and bottom', w: 'tweezers', def: 'Two or more sessions in a row with matching highs (a top) or matching lows (a bottom). They mark a level defended twice, and mean more when the candles also form another pattern.' },
      { id: 'belt-hold', term: 'Belt hold', w: 'belt hold', def: 'A long candle that opens at one end of the session’s range and closes near the other, against the trend. A bullish belt hold opens at its low in a decline; a bearish one opens at its high in a rally.' },
    ],
    'nison'
  );

  SS.NISON_UNITS.push({
    n: 2,
    title: 'Two-candle reversals',
    blurb: 'Patterns made of two sessions: engulfing patterns and what makes them stronger, how deep a dark cloud or piercing day must reach, and the harami, tweezers and belt holds.',
    lessons: [
      {
        id: 'ni-engulfing',
        title: 'Engulfing patterns',
        hook: 'When one real body swallows the one before it, control has changed hands.',
        mins: 9,
        steps: [
          {
            h: 'Swallowing the body',
            body: `<p>An [[engulfing]] pattern is two candles of opposite colors where the second real body wraps around the first. Nison gives three rules:</p>
<ul><li>The market is in a clear trend, even a short one.</li>
<li>The second real body is the opposite color of the first.</li>
<li>The second real body engulfs the first <mark>real body</mark>. It doesn’t have to cover the shadows.</li></ul>
<p>Move the second day’s close and watch for the moment it engulfs.</p>`,
            predict: {
              q: 'After a decline, a green body covers the previous red body but not its upper shadow. Is it an engulfing pattern?',
              choices: ['Yes: only the real bodies count', 'No: it must cover the shadows too', 'Only if volume is heavy'],
              a: 0,
              why: 'Nison’s rule is about the real bodies. Covering the shadows too is a bonus, not a requirement.',
            },
            viz: { type: 'engulfBuild' },
          },
          {
            h: 'What makes it stronger',
            body: `<p>Not every engulfing pattern is equal. Nison lists features that make one more convincing:</p>
<ul><li>The first real body is tiny and the second is long.</li>
<li>It comes after a long or very fast move.</li>
<li>Volume is heavy on the second day.</li>
<li>The second body engulfs more than one earlier body.</li></ul>
<p>Switch the features on and off. More of them make the signal more convincing, though none makes it certain.</p>`,
            viz: { type: 'engulfStrength' },
          },
        ],
        quiz: [
          { q: 'In a bullish engulfing pattern, the second candle must…', choices: ['Have a green real body that covers the prior red real body', 'Cover both of the prior candle’s shadows', 'Be a doji'], a: 0, why: 'Only the real bodies have to be engulfed.' },
          { q: 'Which makes an engulfing pattern more convincing?', choices: ['Heavy volume on the second day', 'A long first body and a short second body', 'Appearing in a sideways market'], a: 0, why: 'Heavy volume shows strong participation in the change of control.' },
          { q: 'An engulfing pattern needs a trend before it because…', choices: ['It is a reversal signal, so there must be a trend to reverse', 'Candles are bigger in trends', 'It only works after gaps'], a: 0, why: 'In a sideways market there is nothing to reverse, so the pattern means little.' },
        ],
        takeaways: ['Engulfing: an opposite-color real body that wraps around the one before it.', 'Only the real bodies must be engulfed, not the shadows.', 'A tiny first body, heavy volume, a long prior trend and several engulfed bodies all add weight.'],
      },
      {
        id: 'ni-dark-cloud',
        title: 'Dark-cloud cover and the piercing pattern',
        hook: 'Not a full engulfing, but more than halfway there.',
        mins: 9,
        steps: [
          {
            h: 'How far into the body?',
            body: `<p>A [[dark-cloud-cover]] is a top. After a tall green session, the next one opens above that session’s high, then falls to close <mark>more than halfway down</mark> into the green body. The rally was rejected.</p>
<p>The [[piercing-pattern]] is its mirror at a bottom: it opens below the prior low and closes more than halfway up into the red body. If it gets less than halfway, Nison calls it a [[thrusting-pattern|thrusting, in-neck or on-neck]] pattern, and the decline usually resumes. Drag the close and watch the name change.</p>`,
            predict: {
              q: 'After a tall red day, the next day opens lower and closes 30% of the way up into the red body. Is it a piercing pattern?',
              choices: ['No: it needs to close more than halfway in', 'Yes: any green day counts', 'Yes, and an especially strong one'],
              a: 0,
              why: 'Less than halfway is a thrusting pattern, a weak sign. Nison would wait for more proof that the buyers have taken over.',
            },
            viz: { type: 'penetration' },
          },
          {
            h: 'In context',
            body: `<p>Here are three of them on a chart. The dark-cloud cover and the piercing pattern each appear after a clear trend and turn it. The thrusting pattern looks hopeful for a day, but the decline goes on.</p>`,
            viz: { type: 'cloudContext' },
          },
        ],
        quiz: [
          { q: 'A dark-cloud cover’s second day opens…', choices: ['Above the first day’s high', 'Below the first day’s low', 'At the first day’s close'], a: 0, why: 'It opens with a burst of optimism that then fails.' },
          { q: 'A dark-cloud cover’s second day should close…', choices: ['More than halfway down into the first day’s green body', 'Above the first day’s close', 'Exactly at the first day’s open'], a: 0, why: 'The deeper it closes, the stronger the signal. Below the open, it becomes a bearish engulfing pattern.' },
          { q: 'In a decline, a green day that closes only slightly into the prior red body usually means…', choices: ['The decline will continue', 'A strong bottom', 'A dark-cloud cover'], a: 0, why: 'In-neck and thrusting patterns show weak buying.' },
        ],
        takeaways: ['Dark-cloud cover: opens above the prior high, closes more than halfway into the green body.', 'Piercing pattern: opens below the prior low, closes more than halfway into the red body.', 'Less than halfway is weak: in a decline, the selling usually resumes.'],
      },
      {
        id: 'ni-harami',
        title: 'Harami, tweezers and belt holds',
        hook: 'Small inside big, matching highs, and sessions that open at an extreme.',
        mins: 9,
        steps: [
          {
            h: 'The harami',
            body: `<p>A [[harami]] is the opposite of an engulfing pattern: a long real body followed by a small one that fits inside it. Harami is an old Japanese word for pregnant: the long body is the mother, the small one the baby.</p>
<p>It says the market is <mark>out of breath</mark>. The trend’s energy has faded, which often leads to a pause or a sideways range rather than a sharp reversal. When the small candle is a doji, it’s a [[harami-cross]], a stronger warning. Change the size of the second body.</p>`,
            viz: { type: 'haramiBuild' },
          },
          {
            h: 'Tweezers and belt holds',
            body: `<p>[[tweezers|Tweezers]] are sessions with matching highs at a top, or matching lows at a bottom, like the two tips of a pair of tweezers. They mark a level defended twice, and mean the most when the candles also form another pattern.</p>
<p>A [[belt-hold]] is a long candle that opens at one end of the session’s range and runs to the other, against the trend. Tap through the four.</p>`,
            viz: { type: 'twoBarTops' },
          },
        ],
        quiz: [
          { q: 'In a harami, the second real body is…', choices: ['Small and inside the first real body', 'Bigger than the first', 'Always a doji'], a: 0, why: 'When it is a doji, the pattern is called a harami cross.' },
          { q: 'A harami most often signals that…', choices: ['The trend has lost its energy', 'The trend will speed up', 'A gap is coming'], a: 0, why: 'A pause or a sideways range is a common result, not always a reversal.' },
          { q: 'A bullish belt hold…', choices: ['Opens at its low in a decline and closes near its high', 'Opens at its high in a rally', 'Has long shadows at both ends'], a: 0, why: 'It is a long green candle that never trades below its open.' },
        ],
        takeaways: ['Harami: a small body inside a long one. The trend is out of breath.', 'Tweezers: matching highs or lows, stronger with another signal.', 'Belt hold: a long candle that opens at one extreme and runs against the trend.'],
      },
    ],
  });
})();
