/* Strike School — Reading the Market Profile: ideas from "Mind Over Markets" by James F. Dalton, Eric T. Jones and
   Robert B. Dalton, explained in our own words. Each unit pushes onto SS.PROFILE_UNITS. */
(function () {
  'use strict';
  const SS = window.SS;
  SS.PROFILE_UNITS = [];
  SS.registerCourse({
    id: 'profile',
    order: 7,
    title: 'Reading the Market Profile',
    short: 'Profile',
    blurb: 'The ideas of Mind Over Markets by James Dalton, Eric Jones and Robert Dalton, explained in our own words with animated profiles: the market as an auction, building a profile letter by letter, day types, open types, and balance versus imbalance. Not affiliated with the authors or publisher.',
    units: SS.PROFILE_UNITS,
  });
})();
