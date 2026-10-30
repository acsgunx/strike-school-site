/* Strike School — Japanese Candlesticks: ideas from Steve Nison's "Japanese Candlestick Charting Techniques"
   (second edition, 2001), explained in our own words. It builds on the candlestick lessons of the Technical Analysis
   course and goes much further. Each unit pushes onto SS.NISON_UNITS. */
(function () {
  'use strict';
  const SS = window.SS;
  SS.NISON_UNITS = [];
  SS.registerCourse({
    id: 'nison',
    order: 10,
    title: 'Japanese Candlesticks',
    short: 'Candlesticks',
    blurb: 'The candlestick methods from Steve Nison’s classic Japanese Candlestick Charting Techniques, explained in our own words with animated charts: real bodies and shadows, doji, hammers and stars, two- and three-candle reversals, windows and continuation patterns, and how to combine candles with Western tools. Take the Technical Analysis course first. Not affiliated with the author or publisher.',
    units: SS.NISON_UNITS,
  });
})();
