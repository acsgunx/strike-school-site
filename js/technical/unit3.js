/* Technical Analysis, Unit 3 — Chart and candlestick patterns. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'head-shoulders', term: 'Head and shoulders', w: 'head and shoulders', def: 'A reversal pattern with three peaks, the middle one highest. A close below the neckline joining the two troughs confirms it. The inverse version marks a bottom.' },
      { id: 'neckline', term: 'Neckline', w: 'neckline', def: 'The line through the troughs (or peaks) of a head-and-shoulders or double top or bottom. Breaking it confirms the pattern.' },
      { id: 'double-top', term: 'Double top and bottom', w: 'double top', def: 'Two failed attempts at the same high (a top) or the same low (a bottom), confirmed when price breaks the trough or peak between them.' },
      { id: 'reversal-pattern', term: 'Reversal pattern', w: 'reversal patterns', def: 'A chart shape that often appears as a trend ends, such as head and shoulders or a double top.' },
      { id: 'continuation-pattern', term: 'Continuation pattern', w: 'continuation patterns', def: 'A pause shape, such as a triangle or flag, after which the earlier trend often resumes.' },
      { id: 'triangle', term: 'Triangle', w: 'triangle', def: 'A pattern where price swings get smaller between two converging lines. Ascending triangles have a flat top, descending ones a flat bottom.' },
      { id: 'flag', term: 'Flag and pennant', w: 'flag', def: 'A short, tight pause after a sharp move (the pole), sloping slightly against it. A pennant is the same idea shaped like a small triangle.' },
      { id: 'doji', term: 'Doji', w: 'doji', def: 'A candle whose open and close are almost equal, showing indecision.' },
      { id: 'hammer', term: 'Hammer and hanging man', w: 'hammer', def: 'A small body near the top with a long lower wick. After a decline it is a hammer (possible bottom); after a rally the same shape is a hanging man (possible top).' },
      { id: 'shooting-star', term: 'Shooting star', w: 'shooting star', def: 'A small body near the bottom with a long upper wick: a rally that was rejected.' },
      { id: 'engulfing', term: 'Engulfing pattern', w: 'engulfing pattern', def: 'A two-candle pattern where the second body completely covers the first, in the opposite color.' },
      { id: 'morning-star', term: 'Morning and evening star', w: 'morning star', def: 'Three candles: a big move, a small indecisive candle, then a strong move the other way. A morning star marks a possible bottom; an evening star a possible top.' },
    ],
    'technical'
  );

  SS.TECH_UNITS.push({
    n: 3,
    title: 'Chart and candlestick patterns',
    blurb: 'Reversal and continuation patterns, single and multi-candle signals, and why context decides what they mean.',
    lessons: [
      {
        id: 'reversal-patterns',
        title: 'Reversal patterns',
        hook: 'Head and shoulders, double tops and bottoms, and what happens when they fail.',
        mins: 8,
        steps: [
          {
            h: 'Head and shoulders',
            body: `<p>[[reversal-pattern|Reversal patterns]] often appear as a trend runs out of steam. The best known is the [[head-shoulders]]: a peak (left shoulder), a higher peak (the head), then a lower peak (right shoulder).</p>
<p>The [[neckline]] joins the two troughs. The pattern is only confirmed when price closes below it. A rough target is the head's height above the neckline, projected down from the break. Watch each part appear as it forms, then try the inverse version that marks a bottom.</p>`,
            predict: {
              q: 'When is a head-and-shoulders top confirmed?',
              choices: ['As soon as the head forms', 'When price closes below the neckline', 'When the right shoulder starts to form'],
              a: 1,
              why: 'Until the neckline breaks, the “right shoulder” could just be a pullback in an ongoing uptrend. Many traders wait for the close below the neckline.',
            },
            viz: { type: 'patternBuild', set: ['hs', 'ihs'] },
          },
          {
            h: 'Double tops and bottoms',
            body: `<p>A [[double-top]] is two failed attempts at the same high. Buyers pushed up twice and were turned back twice. The break below the trough between them confirms it. A double bottom is the mirror image at a low.</p>
<p>The target works the same way: the height of the pattern, projected from the break.</p>`,
            viz: { type: 'patternBuild', set: ['dtop', 'dbot'] },
          },
          {
            h: 'Patterns fail, too',
            body: `<p>No pattern always works. Here a textbook head and shoulders breaks its neckline, then climbs straight back above it and keeps rising. Traders who sold on the break are caught.</p>
<p><mark>Every pattern trade needs a stop: a price that says the pattern has failed.</mark> Above the right shoulder is the usual place for this one.</p>`,
            viz: { type: 'patternBuild', set: ['fail'] },
          },
        ],
        quiz: [
          { q: 'The neckline of a head-and-shoulders top connects…', choices: ['The two troughs between the peaks', 'The three peaks', 'The first and last candle'], a: 0, why: 'It runs through the lows on either side of the head.' },
          { q: 'A double top has peaks near $80 and the trough between them is $72. A rough target after the break is…', choices: ['$64', '$72', '$88'], a: 0, why: 'Pattern height $8, projected down from the $72 break: about $64.' },
          { q: 'Why does every pattern trade need a stop?', choices: ['Patterns fail, and the stop caps the loss when they do', 'Brokers require it', 'Stops make patterns work'], a: 0, why: 'A stop defines the price at which the pattern idea is proven wrong.' },
        ],
        takeaways: ['Head and shoulders and double tops mark possible reversals.', 'Wait for the neckline break to confirm; project the height for a rough target.', 'Patterns fail regularly, so always know your exit.'],
      },
      {
        id: 'continuation-patterns',
        title: 'Continuation patterns',
        hook: 'Triangles and flags: pauses before the trend resumes.',
        mins: 8,
        steps: [
          {
            h: 'Triangles',
            body: `<p>[[continuation-pattern|Continuation patterns]] are pauses where the market catches its breath. In a [[triangle]], swings get smaller between two converging lines until price breaks out.</p>
<p>An ascending triangle has a flat top and rising lows: buyers keep pushing, so breaks are more often upward. A descending triangle is the opposite. A symmetrical triangle can break either way. Play each one.</p>`,
            viz: { type: 'patternBuild', set: ['asc', 'desc', 'sym'] },
          },
          {
            h: 'Flags and pennants',
            body: `<p>A [[flag]] forms after a sharp, almost straight move called the pole. Price then drifts slightly against the move in a tight little channel, often on falling volume, before the trend resumes.</p>
<p>The usual target is the length of the pole, added to the breakout point.</p>`,
            viz: { type: 'patternBuild', set: ['flag'] },
          },
          {
            h: 'Name that pattern',
            body: `<p>Time to practice. A chart will draw itself up to the moment of decision. Name the pattern, then see it marked up.</p>
<p>Real charts are messier than these, so do not expect perfect shapes in the wild.</p>`,
            viz: { type: 'patternQuiz' },
          },
        ],
        quiz: [
          { q: 'An ascending triangle has…', choices: ['A flat top and rising lows', 'A flat bottom and falling highs', 'No trendlines'], a: 0, why: 'Buyers step in at higher and higher prices while sellers hold one level.' },
          { q: 'A stock rises from $40 to $50 (the pole), then forms a flag and breaks out at $49. A rough target is…', choices: ['$59', '$50', '$90'], a: 0, why: 'Pole length $10, added to the $49 breakout.' },
          { q: 'Which triangle is most neutral about direction?', choices: ['Symmetrical', 'Ascending', 'Descending'], a: 0, why: 'Both sides converge equally, so the break can come either way.' },
        ],
        takeaways: ['Triangles and flags are pauses; the earlier trend often resumes.', 'Ascending triangles lean bullish, descending bearish, symmetrical neutral.', 'Flag targets come from the length of the pole.'],
      },
      {
        id: 'candle-patterns',
        title: 'Candlestick patterns',
        hook: 'Single and multi-candle signals, and why context decides what they mean.',
        mins: 8,
        steps: [
          {
            h: 'Single-candle signals',
            body: `<p>Some candles tell a story on their own. A [[doji]] shows indecision. A [[hammer]] shows sellers pushed hard and buyers took it all back. A [[shooting-star]] shows the opposite. A long, wickless candle (a marubozu) shows one side in total control.</p>
<p>Tap any candle to watch its day unfold again.</p>`,
            viz: { type: 'candleGallery' },
          },
          {
            h: 'Two- and three-candle patterns',
            body: `<p>An [[engulfing]] pattern is a candle whose body completely covers the one before, in the opposite color: a sudden change of control. A [[morning-star]] is three candles: a big down day, a small hesitant one, then a strong up day. The evening star is its mirror at a top.</p>
<p>Pick a pattern and watch it form at the end of a trend.</p>`,
            viz: { type: 'candleCombos' },
          },
          {
            h: 'Context is everything',
            body: `<p>The same candle can mean very different things. A hammer after a long decline, right at support, is a meaningful sign that buyers are stepping in. The identical shape in the middle of a choppy range means little. After a big rally it is called a hanging man and warns of selling.</p>
<p><mark>On their own, candle patterns are weak signals.</mark> They matter most at an important level, in the right trend, with volume, and confirmed by the next candle.</p>`,
            predict: {
              q: 'Where does a hammer candle carry the most meaning?',
              choices: ['After a decline, at a support level', 'In the middle of a sideways range', 'Anywhere: the shape alone is enough'],
              a: 0,
              why: 'A hammer is a rejection of lower prices. It means most where sellers have been in control and buyers have a reason to defend the level.',
            },
            viz: { type: 'candleContext' },
          },
        ],
        quiz: [
          { q: 'A doji signals…', choices: ['Indecision: open and close almost equal', 'A guaranteed reversal', 'Very high volume'], a: 0, why: 'Neither buyers nor sellers won the period.' },
          { q: 'A bullish engulfing pattern is…', choices: ['A green body that completely covers the previous red body', 'Two identical doji', 'A long upper wick'], a: 0, why: 'Buyers overwhelmed the prior day’s selling.' },
          { q: 'The same shape as a hammer, appearing after a strong rally, is called…', choices: ['A hanging man', 'A morning star', 'A flag'], a: 0, why: 'Context changes the name and the meaning.' },
        ],
        takeaways: ['Doji, hammer, shooting star and marubozu each tell a story in one candle.', 'Engulfing and star patterns show a change of control over two or three candles.', 'Context (trend, level, volume, confirmation) decides what a candle means.'],
      },
    ],
  });
})();
