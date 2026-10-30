/* Technical Analysis in Depth, Unit 1 — Dow Theory and the trend: three trends, three phases, confirmation and
   reversal, retracements and the fan principle. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'dow-theory', term: 'Dow Theory', w: 'Dow Theory', def: 'Charles Dow’s ideas about how markets trend, written up around 1900 and refined by his successors. Much of modern technical analysis grew out of them.' },
      { id: 'primary-trend', term: 'Primary trend', w: 'primary trend', def: 'The major direction of the market, lasting from about a year to several years. Dow compared it to the tide.' },
      { id: 'secondary-correction', term: 'Secondary correction', w: 'secondary correction', def: 'A move against the primary trend lasting weeks to months, usually giving back a third to two-thirds of the move before it. Dow compared these to waves.' },
      { id: 'accumulation-phase', term: 'Accumulation phase', w: 'accumulation phase', def: 'The first phase of a bull market, when the best-informed investors buy quietly while the news is still bad and prices move sideways near the lows.' },
      { id: 'distribution-phase', term: 'Distribution phase', w: 'distribution phase', def: 'The last phase of a bull market, when the news is at its best, the public buys eagerly, and the early buyers sell to them.' },
      { id: 'non-confirmation', term: 'Non-confirmation', w: 'non-confirmation', def: 'When one market average makes a new high (or low) and a related average does not. Dow Theory treats it as a warning that the trend may be weakening, not as a signal on its own.' },
      { id: 'failure-swing', term: 'Failure swing', w: 'failure swing', def: 'A Dow Theory reversal: in an uptrend, a rally fails to reach the previous peak, and then the price falls below the previous low. Mirror it for a downtrend.' },
      { id: 'retracement', term: 'Retracement', w: 'retracement', def: 'A pullback that gives back part of the previous move, measured in percent of that move. A third, a half and two-thirds are the classic levels; Fibonacci followers also watch 38.2% and 61.8%.' },
      { id: 'fan-principle', term: 'Fan principle', w: 'fan principle', def: 'When a trendline breaks, draw a new one from the same starting point through the new low, and again if that one breaks. A break of the third line suggests the trend has reversed.' },
    ],
    'murphy'
  );

  SS.MURPHY_UNITS.push({
    n: 1,
    title: 'Dow Theory and the trend',
    blurb: 'The oldest ideas in chart reading: three trends at once, the phases of a bull market, confirmation and reversal, and how far pullbacks go.',
    lessons: [
      {
        id: 'mu-dow-trends',
        title: 'The tide, the waves and the ripples',
        hook: 'Every market has three trends at once. Knowing which one you are looking at changes everything.',
        mins: 8,
        steps: [
          {
            h: 'Three trends at once',
            body: `<p>In <i>Technical Analysis of the Financial Markets</i> (1999), John J. Murphy gathered a century of chart-reading ideas into one guide. This course covers the parts the Technical Analysis course leaves out, in our own words. It isn’t affiliated with the author or publisher, and the book has far more detail.</p>
<p>Murphy starts with [[dow-theory]]. Charles Dow saw three trends at once and compared them to the sea. The [[primary-trend]] is the tide, lasting a year or more. [[secondary-correction|Secondary corrections]] are the waves, lasting weeks to months. Minor trends are the ripples, lasting days. Build the price one layer at a time.</p>`,
            predict: {
              q: 'Halfway through a two-year rise, a stock falls about 10% over nine weeks. In Dow’s terms, this is most likely…',
              choices: ['A secondary correction within the primary uptrend', 'Proof that a bear market has started', 'A minor ripple'],
              a: 0,
              why: 'A drop lasting weeks against the main trend is a classic secondary correction. The size of a dip alone doesn’t say the tide has turned; a break in the trend’s structure does.',
            },
            viz: { type: 'trendLayers' },
          },
          {
            h: 'The three phases of a major trend',
            body: `<p>Dow also saw that a big bull market tends to unfold in three phases, each driven by a different crowd:</p>
<ul><li>In the [[accumulation-phase|accumulation phase]], the best-informed buyers quietly buy while the news is still bad.</li>
<li>In the public participation phase, improving news brings in trend followers, and prices climb the fastest.</li>
<li>In the [[distribution-phase|distribution phase]], the news is wonderful and the public piles in, while the early buyers sell to them.</li></ul>
<p>Play it, or drag the slider to step through.</p>`,
            viz: { type: 'trendPhases' },
          },
        ],
        quiz: [
          { q: 'Dow compared the primary trend to…', choices: ['The tide', 'A ripple', 'A wave'], a: 0, why: 'The tide is the big, slow movement that the waves and ripples ride on.' },
          { q: 'A secondary correction typically gives back…', choices: ['About a third to two-thirds of the move before it', 'Less than 1%', 'The whole move, every time'], a: 0, why: 'That range is the classic size of a correction inside a healthy trend.' },
          { q: 'During the distribution phase, the news is usually…', choices: ['Very good, with the public buying', 'Terrible, with nobody buying', 'Not available'], a: 0, why: 'The early buyers sell into the good news to a public that arrives late.' },
        ],
        takeaways: ['Every chart has a tide, waves and ripples.', 'Corrections against the tide are normal, not the end of the trend.', 'Big trends move from quiet accumulation to public excitement to distribution.'],
      },
      {
        id: 'mu-dow-confirm',
        title: 'Confirmation and reversal',
        hook: 'Dow’s rules for when a trend is healthy, and when it has really turned.',
        mins: 9,
        steps: [
          {
            h: 'The averages must agree',
            body: `<p>Dow tracked two averages: one of industrial companies and one of railroads, the transport companies of his day. His reasoning was that if factories are busy, the companies that ship their goods should be busy too. A new high in one average needed a new high in the other to confirm it. When only one makes it, that is a [[non-confirmation]]: a warning, not a sell signal.</p>
<p>Below are two made-up indexes, a makers index and a movers index.</p>`,
            viz: { type: 'dowConfirm' },
          },
          {
            h: 'When has the trend turned?',
            body: `<p>Dow Theory assumes a trend stays in force until it gives a clear signal that it has reversed. In an uptrend, the classic signal is a [[failure-swing]]: a rally that fails to reach the previous peak, followed by a fall below the previous low. In a second version, the non-failure swing, the price makes a new high first and then breaks the previous low.</p>`,
            predict: {
              q: 'In an uptrend, a rally stalls below the previous peak. By Dow’s rules, the trend has reversed when…',
              choices: ['The price then falls below the previous low', 'The rally stalls', 'The next day closes lower'],
              a: 0,
              why: 'A lower peak is only a warning. The break of the previous low completes the pattern of lower highs and lower lows.',
            },
            viz: { type: 'dowReversal' },
          },
          {
            h: 'Dow’s six ideas',
            body: `<p>Murphy sums up Dow Theory in six ideas. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Idea',
              back: 'In plain words',
              items: [
                ['The averages discount everything', 'Prices reflect what is known.', 'Every hope, fear and fact that people know about is already in the price.'],
                ['Three trends', 'Primary, secondary and minor.', 'The tide, the waves and the ripples.'],
                ['Three phases', 'Accumulation, public participation, distribution.', 'Each phase of a big trend is driven by a different crowd.'],
                ['The averages must confirm', 'Related averages should agree.', 'A new high in one needs a new high in the other.'],
                ['Volume confirms the trend', 'Busier in the trend’s direction.', 'In an uptrend, up days should draw more volume than down days.'],
                ['A trend lasts until it reverses', 'Assume it continues.', 'Wait for a clear reversal signal instead of guessing the top.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Dow wanted the industrial and transport averages to…', choices: ['Confirm each other with new highs', 'Move in opposite directions', 'Be watched separately'], a: 0, why: 'Busy factories should mean busy shippers, so both should rise together.' },
          { q: 'A non-confirmation is…', choices: ['A warning that the trend may be weakening', 'An automatic sell signal', 'A sign the trend is stronger'], a: 0, why: 'It raises a doubt; a reversal signal settles it.' },
          { q: 'Dow Theory assumes a trend continues until…', choices: ['It gives a clear reversal signal', 'The news turns bad', 'It has lasted a year'], a: 0, why: 'Guessing tops is costly; waiting for the signal keeps you with the trend.' },
        ],
        takeaways: ['Related averages should confirm each other.', 'A lower peak is a warning; a break of the last low is the signal.', 'Assume the trend continues until it clearly reverses.'],
      },
      {
        id: 'mu-retracements',
        title: 'Retracements and fan lines',
        hook: 'How far a pullback goes tells you how healthy the trend is.',
        mins: 9,
        steps: [
          {
            h: 'How far do pullbacks go?',
            body: `<p>Prices rarely move in a straight line. After a move, they usually give back part of it before the trend resumes. That give-back is a [[retracement]], measured in percent of the move before it. Murphy highlights a third, a half and two-thirds; followers of Fibonacci numbers also watch 38.2% and 61.8%. The 50% level is the best known of all.</p>
<p>Drag the pullback and see what each depth tends to say about the trend.</p>`,
            predict: {
              q: 'A stock rises from $40 to $60, then pulls back. Which level do the most traders watch?',
              choices: ['$50, the halfway point', '$59', '$35'],
              a: 0,
              why: 'The 50% retracement, here $50, is the most widely watched level, though pullbacks often stop anywhere from a third to two-thirds of the way back.',
            },
            viz: { type: 'retracement' },
          },
          {
            h: 'The fan principle',
            body: `<p>Trendlines break, and the first break doesn’t always end the trend. Murphy describes the [[fan-principle|fan principle]]. When a rising [[trendline]] breaks, draw a new one from the same starting point through the new low. If that one breaks, draw a third. The lines fan out flatter and flatter, and a break of the third line signals that the trend has likely reversed.</p>`,
            viz: { type: 'fanLines' },
          },
        ],
        quiz: [
          { q: 'A pullback that gives back only 25% of the prior rise suggests…', choices: ['A strong trend', 'The trend has surely ended', 'Nothing at all'], a: 0, why: 'Shallow pullbacks show buyers are eager to step in.' },
          { q: 'Which retracement levels come from Fibonacci numbers?', choices: ['38.2% and 61.8%', '10% and 90%', '25% and 75%'], a: 0, why: 'Both come from ratios between Fibonacci numbers.' },
          { q: 'Under the fan principle, the trend has likely reversed when…', choices: ['The third fan line breaks', 'The first trendline breaks', 'The price touches a trendline'], a: 0, why: 'The first two breaks are warnings; the third is the signal.' },
        ],
        takeaways: ['Pullbacks of a third to two-thirds are normal in a healthy trend.', 'Beyond two-thirds, the trend is in doubt.', 'One broken trendline is a warning; a broken third fan line is the signal.'],
      },
    ],
  });
})();
