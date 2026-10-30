/* Japanese Candlesticks, Unit 1 — The language of candles: real bodies and shadows, the doji, and the hammer family
   with confirmation. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'spinning-top', term: 'Spinning top', w: 'spinning top', def: 'A candle with a small real body, whatever the length of its shadows. Neither buyers nor sellers made much progress in the session.' },
      { id: 'marubozu', term: 'Marubozu', w: 'marubozu', def: 'A candle with no shadows, or almost none: it opened at one end of the session’s range and closed at the other. The name comes from the Japanese for a shaved head.' },
      { id: 'high-wave-candle', term: 'High-wave candle', w: 'high-wave candle', def: 'A candle with a small real body and very long upper and lower shadows. The market swung widely and went nowhere, a sign that it has lost its sense of direction.' },
      { id: 'long-legged-doji', term: 'Long-legged doji', w: 'long-legged doji', def: 'A doji with very long upper and lower shadows. When the open and close sit near the middle of the range, it is also called a rickshaw man.' },
      { id: 'gravestone-doji', term: 'Gravestone doji', w: 'gravestone doji', def: 'A doji that opens and closes at the low of the session, after a rally that failed. It means the most after an advance.' },
      { id: 'dragonfly-doji', term: 'Dragonfly doji', w: 'dragonfly doji', def: 'A doji that opens and closes at the high of the session, after a selloff that was bought back. It means the most after a decline.' },
      { id: 'inverted-hammer', term: 'Inverted hammer', w: 'inverted hammer', def: 'After a decline, a small real body near the session’s low with a long upper shadow. It needs bullish confirmation: the next session should open above its body and close higher.' },
      { id: 'candle-confirmation', term: 'Confirmation (candles)', w: 'confirmation', def: 'Waiting for a later session to agree with a candle signal before acting on it. For example, a close below a hanging man’s real body confirms it.' },
    ],
    'nison'
  );

  SS.NISON_UNITS.push({
    n: 1,
    title: 'The language of candles',
    blurb: 'Where candles came from, what the real body and shadows say, the four kinds of doji, and the hammer family, with the confirmation some of them need.',
    lessons: [
      {
        id: 'ni-bodies',
        title: 'Real bodies and shadows',
        hook: 'Japanese traders look at the body first: it shows who won the session.',
        mins: 9,
        steps: [
          {
            h: 'From rice to charts',
            body: `<p>Candlestick charts come from Japan, where rice was traded for centuries. In the 1700s, merchants in Osaka traded receipts for future deliveries of rice, an early futures market. Japanese traders drew prices in a way that showed the mood of the market at a glance, and gave the shapes vivid names like hammer, dark clouds and morning star.</p>
<p>Steve Nison brought these charts to Western traders with his 1991 book, <i>Japanese Candlestick Charting Techniques</i>. This course walks through its main ideas in our own words. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'History',
              back: 'The story',
              items: [
                ['Osaka’s rice market', 'Rice was money.', 'Samurai were paid in rice. At the Dojima market in Osaka, merchants traded receipts for future rice, one of the world’s first organized futures markets.'],
                ['Munehisa Homma', 'A legendary rice trader.', 'Tradition credits him with studying the emotions of traders, not just the harvest. Many candle ideas are linked to his name, though the charts themselves took shape later.'],
                ['Vivid names', 'Hammer, doji, dark clouds.', 'Each pattern’s name describes the mood of the market, which also makes it easy to remember.'],
                ['To the West', 'Nison’s 1991 book.', 'Few Western traders used candles until Nison’s articles and book. Today almost every charting platform draws them.'],
                ['Our colors', 'Green and red, not white and black.', 'Traditional charts draw a rising session with a white body and a falling one with a black body. This app keeps its usual green and red.'],
              ],
            },
          },
          {
            h: 'The real body comes first',
            body: `<p>Nison calls the thick part of a candle the <b>real body</b>: it runs from the open to the close. Japanese traders see it as the session’s essential move. The thin lines, the [[wick|shadows]], show prices that were reached but not held.</p>
<p>A body is long or short only <mark>compared with recent sessions</mark>. A long body means one side clearly won. A small one, a [[spinning-top]], means neither side got far. Move the close and change the shadows.</p>`,
            predict: {
              q: 'A stock opens at $50, trades between $47 and $53, and closes at $50.10. Its candle is…',
              choices: ['A tiny body with long shadows: no winner', 'A long green body: buyers won', 'A long red body: sellers won'],
              a: 0,
              why: 'The close is only 10 cents above the open, so the real body is tiny. The long shadows show big swings both ways that went nowhere.',
            },
            viz: { type: 'bodyTug' },
          },
          {
            h: 'When the bodies shrink',
            body: `<p>Watch the bodies in a trend, not just the prices. In a healthy rally the green bodies stay long. When they shrink into spinning tops, the buyers are losing force, even if prices still edge higher. Nison treats this as an early warning, not a sell signal on its own.</p>
<p>Compare a strong rally with a tiring one. The lower panel shows the size of each real body.</p>`,
            viz: { type: 'bodyMomentum' },
          },
        ],
        quiz: [
          { q: 'The real body of a candle runs from…', choices: ['The open to the close', 'The high to the low', 'Yesterday’s close to today’s close'], a: 0, why: 'The shadows run out to the high and the low.' },
          { q: 'A marubozu has…', choices: ['No shadows: it opened at one extreme and closed at the other', 'Very long shadows', 'The same open and close'], a: 0, why: 'One side controlled the whole session.' },
          { q: 'Prices keep rising, but each green body is smaller than the last. This suggests…', choices: ['The buyers are losing force', 'The rally is speeding up', 'Nothing at all'], a: 0, why: 'Shrinking bodies show fading momentum. Look for other signs before acting.' },
        ],
        takeaways: ['The real body, from open to close, is the session’s essential move.', 'Long or short is judged against recent candles.', 'Shrinking bodies in a trend are an early warning that it is tiring.'],
      },
      {
        id: 'ni-doji',
        title: 'The doji',
        hook: 'When the open and the close match, the market is at a crossroads.',
        mins: 8,
        steps: [
          {
            h: 'Four kinds of doji',
            body: `<p>A [[doji]] opens and closes at the same price, or nearly so. What counts as "nearly" depends on the stock: for one that usually moves $3 a day, a 5-cent body is a doji. Where the open and close sit in the session’s range gives four kinds:</p>
<ul><li>[[long-legged-doji|Long-legged]]: big swings both ways.</li>
<li>[[gravestone-doji|Gravestone]]: opens and closes at the low.</li>
<li>[[dragonfly-doji|Dragonfly]]: opens and closes at the high.</li>
<li>Four-price: the price never moved.</li></ul>
<p>Watch each session unfold.</p>`,
            viz: { type: 'dojiFamily' },
          },
          {
            h: 'Doji at tops and bottoms',
            body: `<p>A doji means buyers and sellers are in balance. After a long rally, especially right after a tall green candle, that balance is a warning: the buyers who were in charge are no longer winning. Nison ranks the doji among the most important warnings at tops.</p>
<p>At bottoms it is less reliable. A falling market can keep falling under its own weight, so a doji after a decline needs [[candle-confirmation|confirmation]], such as a strong green candle the next day.</p>`,
            predict: {
              q: 'After a long rally and a tall green candle, a doji appears. It suggests…',
              choices: ['The rally may be tiring: a warning', 'A crash is certain', 'The rally is getting stronger'],
              a: 0,
              why: 'The buyers didn’t win the session. It’s a reason to protect profits, not a guarantee of a top.',
            },
            viz: { type: 'dojiTop' },
          },
        ],
        quiz: [
          { q: 'A gravestone doji opens and closes at…', choices: ['The low of the session', 'The high of the session', 'The middle of the range'], a: 0, why: 'Its long upper shadow is the rally that failed.' },
          { q: 'Nison finds the doji more reliable…', choices: ['At tops, after a rally', 'At bottoms, after a decline', 'In sideways markets'], a: 0, why: 'Markets can keep falling under their own weight, so doji at bottoms need confirmation.' },
          { q: 'Whether a small body counts as a doji depends on…', choices: ['How much the stock usually moves', 'The day of the week', 'Volume alone'], a: 0, why: 'A small body is judged against the stock’s normal range.' },
        ],
        takeaways: ['A doji is a session that neither side won.', 'Its shadows show where the fight happened: gravestone, dragonfly or long-legged.', 'Doji warn most at tops; at bottoms, wait for confirmation.'],
      },
      {
        id: 'ni-hammers',
        title: 'Hammers, hanging men and shooting stars',
        hook: 'One shape, two names: the trend before it decides what it means.',
        mins: 9,
        steps: [
          {
            h: 'The three hammer rules',
            body: `<p>The Technical Analysis course showed that a [[hammer]] after a decline and a hanging man after a rally share one shape. Nison gives three rules for that shape:</p>
<ul><li>The real body sits at the top of the session’s range. Its color matters little.</li>
<li>The lower shadow is at least twice as long as the body.</li>
<li>There is no upper shadow, or a very short one.</li></ul>
<p>Build one yourself. Turn the shape upside down and you get an [[inverted-hammer|inverted hammer]] after a decline, or a [[shooting-star]] after a rally.</p>`,
            viz: { type: 'hammerTest' },
          },
          {
            h: 'Wait for confirmation',
            body: `<p>Some candle signals need a later session to agree. A hanging man is only a warning until a session closes below its real body. An inverted hammer needs the next session to open above its body and close higher. A shooting star is stronger on its own, but confirmation still helps.</p>
<p>Choose a pattern, then see what happens when the next day confirms it, and when it doesn’t.</p>`,
            predict: {
              q: 'A hanging man appears after a rally. The next day closes above its real body. What now?',
              choices: ['No confirmation: the rally may continue', 'Sell right away', 'The top is confirmed'],
              a: 0,
              why: 'The bearish signal needs a close below the hanging man’s body. Without one, the uptrend is still intact.',
            },
            viz: { type: 'confirmNext' },
          },
        ],
        quiz: [
          { q: 'A hammer’s lower shadow should be at least…', choices: ['Twice the height of its real body', 'As long as its real body', 'Half its real body'], a: 0, why: 'The long lower shadow is the selloff that buyers rejected.' },
          { q: 'A hanging man is confirmed when…', choices: ['A later session closes below its real body', 'The next day opens higher', 'Volume falls'], a: 0, why: 'A close below the body shows the sellers followed through.' },
          { q: 'After a rally, a small body near the low with a long upper shadow is…', choices: ['A shooting star', 'A hammer', 'An inverted hammer'], a: 0, why: 'After a decline the same shape would be an inverted hammer.' },
        ],
        takeaways: ['Hammer: a small body at the top, a long lower shadow, little or no upper shadow.', 'The trend before it names the candle: hammer or hanging man, inverted hammer or shooting star.', 'Hanging men and inverted hammers need confirmation from a later session.'],
      },
    ],
  });
})();
