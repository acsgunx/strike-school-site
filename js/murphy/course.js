/* Strike School — Technical Analysis in Depth: ideas from John J. Murphy's "Technical Analysis of the Financial
   Markets" (1999), explained in our own words. It builds on the Technical Analysis course and covers what that
   course leaves out. Each unit pushes onto SS.MURPHY_UNITS. */
(function () {
  'use strict';
  const SS = window.SS;
  SS.MURPHY_UNITS = [];
  SS.registerCourse({
    id: 'murphy',
    order: 9,
    title: 'Technical Analysis in Depth',
    short: 'TA in Depth',
    blurb: 'The big ideas of John J. Murphy’s classic Technical Analysis of the Financial Markets, explained in our own words with animated charts: Dow Theory, retracements, gaps and more chart patterns, oscillators, point and figure, Elliott Wave, cycles, and how markets move together. Take the Technical Analysis course first. Not affiliated with the author or publisher.',
    units: SS.MURPHY_UNITS,
  });
})();
