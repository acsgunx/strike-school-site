/* Crypto, Explained, Unit 1 — The big idea: money as a shared ledger, the double-spend problem, hashes and the chain
   of blocks, and keys, signatures and wallets. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'ledger', term: 'Ledger', w: 'ledger', def: 'A list of who paid whom and who owns what. Your bank balance is a line in your bank’s ledger.' },
      { id: 'cryptocurrency', term: 'Cryptocurrency', w: 'cryptocurrency', def: 'Digital money whose ledger is kept by a network of computers instead of a bank, secured with cryptography. Bitcoin, launched in 2009, was the first.' },
      { id: 'crypto-node', term: 'Node', w: 'node', def: 'A computer in a crypto network that keeps a full copy of the ledger, checks new payments and passes them on to other nodes.' },
      { id: 'double-spending', term: 'Double spending', w: 'double spending', def: 'Spending the same digital coin twice. A cryptocurrency prevents it by getting the whole network to agree on one order of payments.' },
      { id: 'hash-function', term: 'Hash', w: 'hash', def: 'A fixed-length fingerprint of any data. The same input always gives the same hash, a tiny change gives a completely different one, and you can’t work backward from the hash to the input.' },
      { id: 'crypto-block', term: 'Block', w: 'block', def: 'A batch of payments added to the ledger together. Each block also stores the hash of the block before it.' },
      { id: 'blockchain', term: 'Blockchain', w: 'blockchain', def: 'A ledger made of blocks, each linked to the one before by its hash. Changing an old block breaks every link after it, which makes tampering easy to spot.' },
      { id: 'private-key', term: 'Private key', w: 'private key', def: 'A secret number that lets you sign payments and spend your coins. Anyone who has it controls the coins.' },
      { id: 'public-key', term: 'Public key', w: 'public key', def: 'A number shared openly, made from your private key. Anyone can use it to check your signatures, but not to work out the private key.' },
      { id: 'digital-signature', term: 'Digital signature', w: 'digital signature', def: 'A number made from a message and a private key. It proves the owner of the key approved that exact message, without revealing the key.' },
      { id: 'crypto-wallet', term: 'Wallet', w: 'wallet', def: 'An app or device that stores your keys. The coins themselves stay on the blockchain; the wallet holds what you need to spend them.' },
      { id: 'seed-phrase', term: 'Seed phrase', w: 'seed phrase', def: 'A list of 12 or 24 words that can rebuild all the keys in a wallet. Whoever has it controls the coins, so it must never be shared.' },
    ],
    'crypto'
  );

  SS.CRYPTO_UNITS.push({
    n: 1,
    title: 'The big idea',
    blurb: 'Money as a shared list, why digital money needs a way to stop double spending, how hashes chain blocks together, and the keys that prove what’s yours.',
    lessons: [
      {
        id: 'cr-ledger',
        title: 'Money is a list',
        hook: 'Your bank balance is just a line in a list. Crypto asks: what if everyone kept a copy?',
        mins: 7,
        steps: [
          {
            h: 'Who keeps the list?',
            body: `<p>When you pay a friend through your bank, no coins move. The bank simply edits its list, called a [[ledger]]: your balance goes down and your friend’s goes up. You trust the bank to keep that list honest and running.</p>
<p>A [[cryptocurrency]] like Bitcoin works without a bank. Instead, thousands of computers, called [[crypto-node|nodes]], each keep a full copy of the list and check every payment. Compare the two below, and try switching computers off.</p>`,
            predict: {
              q: 'In a shared ledger with thousands of copies, what happens if a few of the computers switch off?',
              choices: ['The others keep going', 'All payments stop', 'Everyone loses their coins'],
              a: 0,
              why: 'No single computer is in charge. As long as many copies stay online, the network keeps working.',
            },
            viz: { type: 'ledgerSync' },
          },
          {
            h: 'The double-spend problem',
            body: `<p>Digital things are easy to copy. So what stops someone from spending the same coin twice, sending it to two people at once? That’s the [[double-spending|double-spend]] problem, and it’s the puzzle Bitcoin solved in 2009.</p>
<p>The trick: the network agrees on <mark>one order</mark> for all payments. Whichever payment gets recorded first wins; the other is rejected because the coin is already spent. Watch Alice try.</p>`,
            viz: { type: 'doubleSpend' },
          },
        ],
        quiz: [
          { q: 'When you pay someone through a bank, what actually changes?', choices: ['The numbers in the bank’s ledger', 'Coins move between vaults', 'Nothing until the end of the month'], a: 0, why: 'Bank money is an entry in the bank’s list.' },
          { q: 'In a cryptocurrency, who keeps the ledger?', choices: ['Thousands of computers, each with a full copy', 'One central company', 'Only the coin’s creator'], a: 0, why: 'Every node keeps and checks its own copy.' },
          { q: 'What is double spending?', choices: ['Spending the same digital coin twice', 'Paying a fee twice', 'Buying two coins at once'], a: 0, why: 'Agreeing on one order of payments stops it.' },
        ],
        takeaways: ['Money in a bank is an entry in a ledger.', 'Crypto shares one ledger across thousands of computers, with no one in charge.', 'The network agrees on one order of payments, which stops double spending.'],
      },
      {
        id: 'cr-hash',
        title: 'Hashes and the chain of blocks',
        hook: 'A digital fingerprint makes the ledger tamper-proof.',
        mins: 9,
        steps: [
          {
            h: 'A fingerprint for any data',
            body: `<p>A [[hash-function|hash]] turns any text or file into a short code of fixed length, like a fingerprint. Bitcoin uses one called SHA-256, which always gives 64 characters. Three things make it useful:</p>
<ul><li>The same input always gives the same hash.</li>
<li>Change even one letter, and the hash changes completely.</li>
<li>You can’t work backward from the hash to the input.</li></ul>
<p>Type anything below. This is the real SHA-256, running in your browser.</p>`,
            viz: { type: 'hashPlay' },
          },
          {
            h: 'Blocks chained together',
            body: `<p>Payments are grouped into [[crypto-block|blocks]]. Each block stores the hash of the block before it, so the blocks form a chain: a [[blockchain]].</p>
<p>Now try to cheat. Change an old payment, and that block’s hash changes, so it no longer matches what the next block stored. To cover it up you would have to rebuild <mark>every block after it</mark>, faster than the rest of the network adds new ones.</p>`,
            predict: {
              q: 'Someone secretly changes a payment in block 1 of a 4-block chain. What happens?',
              choices: ['Block 1’s hash changes and no longer matches what block 2 stored', 'Nothing: no one can tell', 'The payment is quietly updated everywhere'],
              a: 0,
              why: 'Block 2 stored block 1’s old hash. Every node can see the mismatch.',
            },
            viz: { type: 'chainBuild' },
          },
        ],
        quiz: [
          { q: 'A hash function always…', choices: ['Gives the same output for the same input', 'Gives a random output each time', 'Can be reversed to find the input'], a: 0, why: 'That’s what makes it a reliable fingerprint.' },
          { q: 'Change one letter of the input, and the hash…', choices: ['Changes completely', 'Changes by one letter', 'Stays the same'], a: 0, why: 'About half of its 256 bits flip.' },
          { q: 'Why does each block store the previous block’s hash?', choices: ['So any change to an old block breaks the chain', 'To save space', 'To make blocks load faster'], a: 0, why: 'The links make tampering obvious.' },
        ],
        takeaways: ['A hash is a fingerprint: same input, same hash; a tiny change, a totally different hash.', 'Each block stores the hash of the one before it.', 'Changing old data breaks the links after it, so tampering is easy to spot.'],
      },
      {
        id: 'cr-keys',
        title: 'Keys, signatures and wallets',
        hook: 'Your coins are protected by a secret number. Lose it, and no one can help you.',
        mins: 9,
        steps: [
          {
            h: 'Signing with a secret key',
            body: `<p>How does the network know a payment really came from you? Each user has a pair of keys:</p>
<ul><li>A [[private-key]]: a secret number only you know. You use it to sign payments.</li>
<li>A [[public-key]]: shared with everyone. Anyone can use it to check your signature.</li></ul>
<p>A [[digital-signature]] proves the payment came from the key’s owner and wasn’t changed on the way, without revealing the key. Below is the real math, with tiny numbers. Sign a payment, then try to tamper with it or forge one.</p>`,
            viz: { type: 'signVerify' },
          },
          {
            h: 'What a wallet really holds',
            body: `<p>A [[crypto-wallet]] doesn’t hold coins. The coins are entries on the blockchain; the wallet holds the <mark>keys</mark> that let you spend them. Most wallets back the keys up as a [[seed-phrase]] of 12 or 24 words. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Wallet basics',
              back: 'What to know',
              items: [
                ['Seed phrase', '12 or 24 ordinary words.', 'They can rebuild all your keys, so anyone who sees them can take everything. Write them down offline and never share them.'],
                ['Hot wallet', 'An app on your phone or computer.', 'Convenient for small amounts, but it’s online, so it can be hacked.'],
                ['Cold wallet', 'A small device kept offline.', 'Much harder to hack. Better for larger amounts you rarely move.'],
                ['Exchange account', 'The exchange holds the keys for you.', 'Easy, but you’re trusting the company. If it fails or freezes withdrawals, you may lose access.'],
                ['Lost keys', 'There is no password reset.', 'No bank can help. Coins whose keys are lost can never be moved again.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'What does your private key let you do?', choices: ['Sign payments to spend your coins', 'See everyone’s balance', 'Create new coins'], a: 0, why: 'Whoever has the private key controls the coins.' },
          { q: 'Who should ever see your seed phrase?', choices: ['No one but you', 'Your exchange’s support team', 'Anyone who asks politely'], a: 0, why: 'Real support staff never ask for it. Anyone asking is a scammer.' },
          { q: 'A crypto wallet actually holds…', choices: ['The keys that control your coins', 'The coins themselves', 'A copy of your bank card'], a: 0, why: 'The coins are entries on the blockchain.' },
        ],
        takeaways: ['The private key signs; the public key lets anyone check the signature.', 'A wallet holds keys, not coins.', 'Never share your seed phrase. If the keys are lost, the coins are gone.'],
      },
    ],
  });
})();
