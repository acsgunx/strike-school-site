/* Japanese Candlesticks, Unit 3 — Stars and longer patterns: morning and evening stars with their doji and abandoned
   baby versions, three soldiers and three crows, and tops and bottoms that take weeks. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'doji-star', term: 'Doji star', w: 'doji star', def: 'A doji that gaps away from the long real body before it. As the middle of a morning or evening star, it makes the pattern stronger.' },
      { id: 'abandoned-baby', term: 'Abandoned baby', w: 'abandoned baby', def: 'A rare star pattern whose middle doji gaps away from both of its neighbors, with no overlap even in the shadows. One of the strongest star signals.' },
      { id: 'three-white-soldiers', term: 'Three white soldiers', w: 'three white soldiers', def: 'Three tall rising candles in a row, each opening inside the previous body and closing near its high. A strong advance, especially out of a long, flat base.' },
      { id: 'advance-block', term: 'Advance block', w: 'advance block', def: 'Three rising candles whose real bodies shrink while their upper shadows grow. The rally is meeting more and more selling.' },
      { id: 'stalled-pattern', term: 'Stalled pattern', w: 'stalled pattern', def: 'Two tall rising candles followed by a small one: the rally has stopped making progress. Also called a deliberation pattern.' },
      { id: 'three-black-crows', term: 'Three black crows', w: 'three black crows', def: 'Three tall falling candles in a row, each closing at or near its low. A bearish signal, most meaningful at a high price level after a long advance.' },
      { id: 'three-buddha-top', term: 'Three Buddha top', w: 'three Buddha top', def: 'A Japanese top with three peaks, the middle one highest, like a large Buddha between two smaller saints. Its Western twin is the head and shoulders. The bottom version is the inverted three Buddha.' },
      { id: 'dumpling-top', term: 'Dumpling top', w: 'dumpling top', def: 'A slow, rounded top made of small candles and confirmed by a gap down, which the Japanese call a falling window. Its bottom version is the fry pan bottom.' },
      { id: 'fry-pan-bottom', term: 'Fry pan bottom', w: 'fry pan bottom', def: 'A slow, rounded bottom made of small candles and confirmed by a gap up, which the Japanese call a rising window.' },
      { id: 'tower-top', term: 'Tower top and bottom', w: 'tower', def: 'One or more tall candles, a few small ones, then tall candles going the other way: two towers standing on either side of a turn.' },
    ],
    'nison'
  );

  SS.NISON_UNITS.push({
    n: 3,
    title: 'Stars and longer patterns',
    blurb: 'Three-candle stars and their stronger versions, three soldiers and three crows with their warning cousins, and Japanese tops and bottoms that span weeks.',
    lessons: [
      {
        id: 'ni-stars',
        title: 'Morning and evening stars',
        hook: 'A small candle that gaps away from a long one: the trend is losing its grip.',
        mins: 9,
        steps: [
          {
            h: 'Building a star',
            body: `<p>In candle language, a <b>star</b> is a small real body that gaps away from the long body before it. The gap shows the trend still pushing; the small body shows it can’t make progress. The Technical Analysis course introduced the [[morning-star]]. Nison adds two stronger versions:</p>
<ul><li>A [[doji-star]], where the star is a doji.</li>
<li>An [[abandoned-baby]], where the doji gaps away from both neighbors, shadows included.</li></ul>
<p>He also looks for the third candle to close <mark>well into the first candle’s body</mark>. Try each version and move the third close.</p>`,
            predict: {
              q: 'In an evening star, what does the small middle candle show?',
              choices: ['The rally is still pushing up but can’t make progress', 'The sellers have already won', 'Nothing: only the third candle matters'],
              a: 0,
              why: 'The gap shows the buyers still pushing; the small body shows they couldn’t move prices much. The third candle then shows the sellers taking over.',
            },
            viz: { type: 'starBuild' },
          },
          {
            h: 'Stars on a chart',
            body: `<p>Here is a full swing: a morning star near the low, a rally, then an evening doji star near the high. Each star appears <mark>after a clear trend</mark>, which is what gives it meaning.</p>`,
            viz: { type: 'starContext' },
          },
        ],
        quiz: [
          { q: 'A morning star is…', choices: ['A tall red day, a small star that gaps lower, then a tall green day', 'Three green days in a row', 'A doji in a sideways market'], a: 0, why: 'It appears after a decline and signals a possible bottom.' },
          { q: 'Which version of the evening star is the strongest?', choices: ['An abandoned baby, with gaps on both sides of a doji', 'One whose third day barely enters the first body', 'One with a long middle body'], a: 0, why: 'A doji cut off by gaps on both sides is rare and forceful.' },
          { q: 'The third candle of an evening star should ideally close…', choices: ['Well into the first candle’s body', 'Above the star', 'At the first candle’s close'], a: 0, why: 'A deep close shows the sellers have really taken control.' },
        ],
        takeaways: ['A star is a small body that gaps away from a long one.', 'Doji stars and abandoned babies are stronger than ordinary stars.', 'The third candle should close well into the first body.'],
      },
      {
        id: 'ni-soldiers',
        title: 'Three soldiers and three crows',
        hook: 'Three candles in a row show how hard each side is pushing.',
        mins: 8,
        steps: [
          {
            h: 'Marching in step',
            body: `<p>[[three-white-soldiers|Three white soldiers]] are three tall rising candles in a row (white in the traditional colors, green here), each opening inside the previous body and closing near its high: a strong, steady advance. [[three-black-crows|Three black crows]] are the bearish mirror.</p>
<p>Watch the details, though. If the bodies shrink while the upper shadows grow, it’s an [[advance-block]]. If a small candle follows two tall ones, it’s a [[stalled-pattern]]. Both say the rally is tiring.</p>`,
            viz: { type: 'threeBuild' },
          },
          {
            h: 'Name the signal',
            body: `<p>Sort each description by what it most likely signals.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'bull', label: 'Bullish' },
                { k: 'bear', label: 'Bearish' },
                { k: 'warn', label: 'Rally tiring' },
              ],
              items: [
                ['After a decline: a tall red day, a small body that gaps lower, then a tall green day that closes well into the red body.', 'bull', 'A morning star.'],
                ['After a long stretch of low, flat prices: three tall green days, each closing near its high.', 'bull', 'Three white soldiers: buyers taking charge out of a base.'],
                ['After a rally: three green days whose bodies shrink while their upper shadows grow.', 'warn', 'An advance block: each push higher meets more selling.'],
                ['At a high price level after a long rise: three tall red days, each closing near its low.', 'bear', 'Three black crows.'],
                ['After a rally: a tall green day, a doji that gaps up with no overlap at all, then a red day that gaps down.', 'bear', 'An abandoned baby top, rare and strong.'],
                ['After a rally: two tall green days, then a small green spinning top.', 'warn', 'A stalled pattern: time to protect profits rather than to sell short.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Three white soldiers mean the most…', choices: ['After a long stretch of low, flat prices', 'After a long rally', 'Anywhere at all'], a: 0, why: 'Out of a base, they show buyers taking charge.' },
          { q: 'An advance block shows…', choices: ['Shrinking bodies and growing upper shadows', 'Three long red bodies', 'A doji with gaps on both sides'], a: 0, why: 'Each rise meets more selling, so the rally is tiring.' },
          { q: 'Three black crows are…', choices: ['Three tall red candles, each closing near its low', 'Three doji in a row', 'A bullish signal'], a: 0, why: 'They are most bearish at a high price level.' },
        ],
        takeaways: ['Three white soldiers: steady, strong buying.', 'Advance block and stalled pattern: the rally is tiring, so protect profits.', 'Three black crows: strong selling, most meaningful after a long rise.'],
      },
      {
        id: 'ni-big-tops',
        title: 'Tops and bottoms that take weeks',
        hook: 'Some Japanese patterns span many sessions, and several have Western twins.',
        mins: 9,
        steps: [
          {
            h: 'Buddhas, dumplings and towers',
            body: `<p>Not every candle pattern is two or three sessions long. Some of the oldest Japanese patterns describe whole tops:</p>
<ul><li>The [[three-buddha-top|three Buddha top]]: three peaks with the middle one highest, a large Buddha between two saints. The West calls it a head and shoulders. With three equal peaks it is called the three mountains top.</li>
<li>The [[dumpling-top]]: a slow, rounded top of small candles, confirmed by a [[price-gap|gap]] down, which the Japanese call a falling window.</li>
<li>The [[tower-top|tower top]]: tall candles up, a pause, then tall candles down.</li></ul>`,
            viz: { type: 'longTops' },
          },
          {
            h: 'The bottoms',
            body: `<p>Each top has a mirror image at bottoms: the inverted three Buddha (the West’s inverse head and shoulders), the [[fry-pan-bottom]], confirmed by a gap up, and the tower bottom. Three equal lows make the three rivers bottom.</p>`,
            viz: { type: 'longTops', bottoms: true },
          },
        ],
        quiz: [
          { q: 'The three Buddha top is the Japanese version of…', choices: ['The head and shoulders top', 'The double bottom', 'The flag'], a: 0, why: 'Three peaks with the middle one highest.' },
          { q: 'A dumpling top is confirmed by…', choices: ['A falling window: a gap down', 'A doji', 'Three green days'], a: 0, why: 'The gap down shows the sellers taking over after the slow, rounded top.' },
          { q: 'A tower bottom has…', choices: ['Tall red candles, a few small ones, then tall green candles', 'A single doji', 'Matching highs'], a: 0, why: 'A strong fall, a pause, then a strong rise.' },
        ],
        takeaways: ['Some Japanese patterns span weeks, and many match Western ones.', 'Three Buddha = head and shoulders; dumpling tops and fry pan bottoms = rounding tops and bottoms.', 'Towers show a strong move one way, a pause, then a strong move back.'],
      },
    ],
  });
})();
