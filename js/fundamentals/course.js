/* Strike School — Stock Market Fundamentals course. Each unit file pushes onto SS.FUND_UNITS. */
(function () {
  'use strict';
  const SS = window.SS;
  SS.FUND_UNITS = [];
  SS.registerCourse({
    id: 'fundamentals',
    order: 1,
    title: 'Stock Market Fundamentals',
    short: 'Fundamentals',
    blurb: 'Start here. How the stock market works and how to invest with confidence, explained with charts you can drag.',
    units: SS.FUND_UNITS,
  });
})();
