/* Strike School — Lessons of a Stock Operator: trading lessons from Edwin Lefèvre's 1923 book
   "Reminiscences of a Stock Operator", the thinly veiled story of Jesse Livermore, explained in our own words.
   Each unit pushes onto SS.OPERATOR_UNITS. */
(function () {
  'use strict';
  const SS = window.SS;
  SS.OPERATOR_UNITS = [];
  SS.registerCourse({
    id: 'operator',
    order: 5,
    title: 'Lessons of a Stock Operator',
    short: 'Operator',
    blurb: 'The trading lessons of Edwin Lefèvre’s 1923 classic Reminiscences of a Stock Operator, the story of speculator Jesse Livermore, in plain words: reading the tape, trading with the trend, sitting tight, cutting losses, and the human nature that never changes.',
    units: SS.OPERATOR_UNITS,
  });
})();
