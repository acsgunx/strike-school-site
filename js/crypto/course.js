/* Strike School — Crypto, Explained: how cryptocurrencies work, from the ground up and in plain words, with hands-on
   animations, several of them running the real math (SHA-256, a mining puzzle, digital signatures). Each unit pushes
   onto SS.CRYPTO_UNITS. */
(function () {
  'use strict';
  const SS = window.SS;
  SS.CRYPTO_UNITS = [];
  SS.registerCourse({
    id: 'crypto',
    order: 11,
    title: 'Crypto, Explained',
    short: 'Crypto',
    blurb: 'How cryptocurrencies really work, in plain words with no jargon assumed: shared ledgers, hashes and blocks, keys and wallets, mining and the halving, smart contracts, stablecoins and DeFi, and the risks of investing. Several animations run the real math, so you can mine a block and sign a payment yourself. Educational only, not investment advice.',
    units: SS.CRYPTO_UNITS,
  });
})();
