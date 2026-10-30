/* Strike School — Technical Analysis course. Each unit file pushes onto SS.TECH_UNITS. */
(function () {
  'use strict';
  const SS = window.SS;
  SS.TECH_UNITS = [];
  SS.registerCourse({
    id: 'technical',
    order: 2,
    title: 'Technical Analysis',
    short: 'Technical',
    blurb: 'Read price charts: candlesticks, trends, support and resistance, patterns and indicators, with every idea animated on the chart.',
    units: SS.TECH_UNITS,
  });
})();
