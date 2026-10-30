/* Strike School — The Trading Mindset: ideas from Mark Douglas's book "Trading in the Zone" (2000),
   explained in our own words. Each unit pushes onto SS.ZONE_UNITS. */
(function () {
  'use strict';
  const SS = window.SS;
  SS.ZONE_UNITS = [];
  SS.registerCourse({
    id: 'zone',
    order: 6,
    title: 'The Trading Mindset',
    short: 'Mindset',
    blurb: 'The ideas of Mark Douglas’s book Trading in the Zone, explained in our own words: why analysis isn’t enough, thinking in probabilities, accepting risk, and building consistency, with simulations you can play with. Not affiliated with the author or publisher.',
    units: SS.ZONE_UNITS,
  });
})();
