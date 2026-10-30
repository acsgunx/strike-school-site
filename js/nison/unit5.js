/* Japanese Candlesticks, Unit 5 — East meets West: candles at support, resistance, trendlines and retracements; the
   convergence of candles with the RSI, volume and moving averages; and risk, reward and failed signals. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'change-of-polarity', term: 'Change of polarity', w: 'change of polarity', def: 'Nison’s name for the idea that broken support tends to become resistance, and broken resistance tends to become support. Also called role reversal.' },
      { id: 'convergence-candles', term: 'Convergence', w: 'convergence', def: 'Several independent signals, such as a candle pattern, a support or resistance level and an oscillator, pointing to the same turn at the same place. The more that agree, the more weight the turn deserves.' },
    ],
    'nison'
  );

  SS.NISON_UNITS.push({
    n: 5,
    title: 'East meets West',
    blurb: 'Candles tell you when; Western tools tell you where and how far. Combine them, check the risk and reward, and know when a signal has failed.',
    lessons: [
      {
        id: 'ni-polarity',
        title: 'Candles at support and resistance',
        hook: 'Candles tell you when; Western tools tell you where. Together they are stronger.',
        mins: 9,
        steps: [
          {
            h: 'Change of polarity',
            body: `<p>The second half of Nison’s book is about combining candles with Western tools. The first of these is [[support]] and [[resistance]]. Nison calls the idea that broken support becomes resistance the [[change-of-polarity|change of polarity]]; the Technical Analysis course called it [[role-reversal|role reversal]].</p>
<p>Candles add timing. A bearish candle signal right at old support, now resistance, shows the sellers defending the level <mark>right now</mark>. Play both versions.</p>`,
            predict: {
              q: 'Support at $50 breaks. Weeks later, prices rally back to $50 and form a shooting star. What does that suggest?',
              choices: ['Old support is now acting as resistance: a bearish sign', 'A breakout above $50 is certain', 'Nothing: candles don’t work at old levels'],
              a: 0,
              why: 'Broken support often becomes resistance, and the shooting star shows the rally being rejected right at that level.',
            },
            viz: { type: 'polarityCandles' },
          },
          {
            h: 'Candles at trendlines and retracements',
            body: `<p>The same goes for other Western levels. A bullish candle signal where a pullback meets a rising [[trendline]], or a common [[retracement]] level such as 50%, means more than the same candle in the middle of nowhere. The candle says the buyers showed up; the level says why there.</p>`,
            viz: { type: 'retraceCandle' },
          },
        ],
        quiz: [
          { q: 'The change of polarity principle says…', choices: ['Broken support tends to become resistance, and the reverse', 'Candles change color in a trend', 'Prices always return to the open'], a: 0, why: 'It’s the candle world’s name for role reversal.' },
          { q: 'What do candles add to support and resistance?', choices: ['Timing: a sign the level is being defended now', 'A price target', 'A guarantee'], a: 0, why: 'The level says where to watch; the candle says the defense has started.' },
          { q: 'A hammer forms right on a rising trendline. That is…', choices: ['Convergence: two signals at one place', 'A sell signal', 'Meaningless'], a: 0, why: 'The trendline and the hammer agree, so the signal carries more weight.' },
        ],
        takeaways: ['Candles tell you when; Western levels tell you where.', 'Broken support often becomes resistance: the change of polarity.', 'A candle signal at a trendline or retracement level carries more weight.'],
      },
      {
        id: 'ni-convergence',
        title: 'Candles with indicators and volume',
        hook: 'The more signals that agree at one place, the more a turn deserves your attention.',
        mins: 9,
        steps: [
          {
            h: 'Adding up the evidence',
            body: `<p>Nison’s word for this is [[convergence-candles|convergence]]: independent signals pointing to the same turn. Here a bearish engulfing pattern forms near a top. Switch on the Western tools one at a time and watch the evidence add up:</p>
<ul><li>The old high, acting as [[resistance]].</li>
<li>A bearish [[divergence]] on the [[rsi|RSI]]: a price peak as high as the last one, with a lower RSI peak.</li>
<li>Heavy [[trading-volume|volume]] on the engulfing day.</li></ul>`,
            viz: { type: 'convergence' },
          },
          {
            h: 'Candles and moving averages',
            body: `<p>A [[sma|moving average]] can act as support or resistance, too. In an uptrend, pullbacks often stop near a rising average, and a bullish candle there is a classic entry. In a downtrend, bounces often stall at a falling average, and a bearish candle there is a classic warning.</p>`,
            viz: { type: 'maCandles' },
          },
        ],
        quiz: [
          { q: 'Convergence means…', choices: ['Several independent signals agreeing at one place', 'Two moving averages crossing', 'A gap closing'], a: 0, why: 'Each signal looks at something different, so agreement means more.' },
          { q: 'A bearish engulfing pattern at a top with a lower RSI peak than the last high is…', choices: ['Stronger: the RSI divergence agrees', 'Weaker', 'Unrelated to the RSI'], a: 0, why: 'The divergence shows fading momentum behind the price high.' },
          { q: 'In an uptrend, a hammer at a rising moving average is…', choices: ['A classic entry: support and a candle signal agree', 'A sell signal', 'Impossible'], a: 0, why: 'The average says where buyers have stepped in before; the hammer says they did again.' },
        ],
        takeaways: ['Look for candle signals where Western tools agree.', 'Resistance, RSI divergence and heavy volume all add weight to a bearish candle signal.', 'Moving averages work as support and resistance, and candles time them.'],
      },
      {
        id: 'ni-candle-risk',
        title: 'Risk, reward and the candle trader’s rules',
        hook: 'A good signal can still be a bad trade.',
        mins: 10,
        steps: [
          {
            h: 'Is the trade worth it?',
            body: `<p>Candles say a turn may be coming, but they <mark>don’t give price targets</mark>. Use Western tools for the target, such as the last swing high, and the pattern itself for the [[stop-loss|stop]]: here, just under the bullish engulfing pattern’s low.</p>
<p>Nison warns that a big candle signal can be a poor trade. Buying at the close of a tall candle puts the stop far away and the target close, which hurts the [[risk-reward|risk and reward]]. Grow the candle, then try waiting for a pullback.</p>`,
            viz: { type: 'candleRR' },
          },
          {
            h: 'When the signal fails',
            body: `<p>A candle signal also tells you when you’re wrong. A hammer’s low should hold. If prices close below it, the buyers who made the hammer have lost. Nison’s advice: if the market doesn’t do what the signal said, get out, and treat the failure itself as information.</p>`,
            predict: {
              q: 'You bought after a hammer. Two days later, prices close below the hammer’s low. What does that say?',
              choices: ['The signal failed: exit and reassess', 'Buy more: it’s cheaper now', 'Wait: hammers always work eventually'],
              a: 0,
              why: 'A close under the hammer’s low cancels it. Taking a small loss there keeps a failed signal from turning into a big loss.',
            },
            viz: { type: 'signalFails' },
          },
          {
            h: 'The candle trader’s rules',
            body: `<p>Seven habits to take away from the whole course. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Rule',
              back: 'Why',
              items: [
                ['1. Trend first', 'Know what you’re reversing.', 'A reversal pattern needs a trend before it. In a sideways market, most patterns mean little.'],
                ['2. Wait for the close', 'A candle isn’t done until the session ends.', 'A hammer at noon can be a long red candle by the close.'],
                ['3. Look for convergence', 'Candle plus level plus indicator.', 'The more independent signals agree, the more weight the turn deserves.'],
                ['4. Use the pattern for stops', 'Its far end is your line in the sand.', 'A close beyond the pattern’s extreme cancels the signal.'],
                ['5. Check risk and reward', 'A good signal can be a bad trade.', 'If the stop is far and the target close, wait for a better entry or let it go.'],
                ['6. Targets come from elsewhere', 'Candles say when, not how far.', 'Use swing highs and lows, measured moves or other Western tools for targets.'],
                ['7. Signals aren’t commands', 'A warning is not a forecast.', 'A reversal pattern may only mean the trend pauses. Respond to what the market does next.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Do candle patterns give price targets?', choices: ['No: use Western tools for targets', 'Yes: always the pattern’s height', 'Only doji do'], a: 0, why: 'Candles are good at timing turns, not at measuring how far they go.' },
          { q: 'Why can a tall bullish engulfing candle make a poor trade?', choices: ['Buying at its close puts the stop far away', 'Tall candles are always false', 'Its volume is too high'], a: 0, why: 'A distant stop and a nearby target make a poor risk and reward.' },
          { q: 'After a hammer, prices close below its low. The signal…', choices: ['Has failed', 'Is confirmed', 'Is stronger'], a: 0, why: 'The hammer’s low was the line the buyers had to hold.' },
        ],
        takeaways: ['Candles time turns; Western tools set targets.', 'Put stops beyond the pattern, and check the risk and reward before trading it.', 'When a signal fails, get out: the failure is information too.'],
      },
    ],
  });
})();
