/* Crypto, Explained, Unit 3 — Beyond Bitcoin: Ethereum and smart contracts, proof of stake, stablecoins and other
   tokens, and DeFi's liquidity pools. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'ethereum', term: 'Ethereum', w: 'Ethereum', def: 'A blockchain launched in 2015 that can run programs called smart contracts. Its coin, ether (ETH), pays the network’s fees.' },
      { id: 'smart-contract', term: 'Smart contract', w: 'smart contract', def: 'A program stored on a blockchain that runs exactly as written when its conditions are met. No one can stop or change it, which also means its bugs can’t easily be fixed.' },
      { id: 'gas-fee', term: 'Gas fee', w: 'gas fee', def: 'The fee paid to a network like Ethereum for processing a transaction or running a smart contract. It rises when the network is busy.' },
      { id: 'proof-of-stake', term: 'Proof of stake', w: 'proof of stake', def: 'A way to choose who adds the next block based on coins locked up as a deposit, the stake, instead of computing work. Cheaters can lose part of their stake.' },
      { id: 'validator', term: 'Validator', w: 'validator', def: 'In proof of stake, a participant who locks up coins to propose and check blocks, earning rewards for honest work.' },
      { id: 'slashing', term: 'Slashing', w: 'slashing', def: 'The proof-of-stake penalty for provable cheating, such as approving two conflicting blocks: part of the validator’s stake is destroyed and it is removed from the network.' },
      { id: 'stablecoin', term: 'Stablecoin', w: 'stablecoin', def: 'A crypto token designed to hold a steady price, usually $1. Most are backed by reserves of cash and short-term government bonds; some have broken their peg.' },
      { id: 'crypto-token', term: 'Token', w: 'token', def: 'A crypto asset created on top of an existing blockchain, such as a stablecoin or an NFT, rather than the blockchain’s own coin.' },
      { id: 'nft', term: 'NFT', w: 'NFT', def: 'A non-fungible token: a one-of-a-kind token recording ownership of a specific item, often digital art. Owning the token doesn’t always mean owning the copyright.' },
      { id: 'defi', term: 'DeFi', w: 'DeFi', def: 'Decentralized finance: lending, borrowing and trading run by smart contracts instead of banks or brokers.' },
      { id: 'liquidity-pool', term: 'Liquidity pool', w: 'liquidity pool', def: 'Two tokens locked in a smart contract that anyone can trade against. A formula based on how much of each token the pool holds sets the price.' },
      { id: 'price-impact', term: 'Price impact', w: 'price impact', def: 'How much your own trade moves the price against you. Large trades in small pools or thin markets have large price impact.' },
    ],
    'crypto'
  );

  SS.CRYPTO_UNITS.push({
    n: 3,
    title: 'Beyond Bitcoin',
    blurb: 'Blockchains that run programs, proof of stake, stablecoins and other tokens, and DeFi’s pools that trade without a broker.',
    lessons: [
      {
        id: 'cr-contracts',
        title: 'Ethereum and smart contracts',
        hook: 'What if the ledger could also run programs?',
        mins: 9,
        steps: [
          {
            h: 'A vending machine made of code',
            body: `<p>Bitcoin’s ledger records payments. [[ethereum|Ethereum]], launched in 2015, also runs programs called [[smart-contract|smart contracts]]. Think of a vending machine: put money in, press a button, and it follows its rules without a shopkeeper.</p>
<p>Here’s a simple escrow contract, which holds a buyer’s money until delivery. No bank or lawyer is needed, and anyone can read the rules. Every action pays a small [[gas-fee|gas fee]] to the network. Try both endings.</p>`,
            predict: {
              q: 'The seller never delivers, and the deadline passes. What does the contract do?',
              choices: ['Refunds the buyer automatically', 'Asks a judge to decide', 'Keeps the money forever'],
              a: 0,
              why: 'The refund rule is written into the code, so it runs by itself once the deadline passes.',
            },
            viz: { type: 'escrowContract' },
          },
          {
            h: 'Proof of stake',
            body: `<p>In September 2022, Ethereum switched from mining to [[proof-of-stake|proof of stake]], cutting its energy use by more than 99%. Instead of burning electricity, [[validator|validators]] lock up coins as a deposit, the stake: 32 ETH each. The network picks who proposes the next block at random, <mark>weighted by stake</mark>, and the others check it.</p>
<p>Cheating is punished by [[slashing]]: a provably dishonest validator loses part of its stake and is thrown out. Spin the wheel, then try cheating.</p>`,
            viz: { type: 'stakeWheel' },
          },
        ],
        quiz: [
          { q: 'A smart contract is…', choices: ['A program on a blockchain that runs exactly as written', 'A paper contract signed online', 'A promise from an exchange'], a: 0, why: 'It runs automatically when its conditions are met.' },
          { q: 'What is a big risk of smart contracts?', choices: ['A bug can’t easily be fixed or appealed', 'They need a lawyer', 'They only run during business hours'], a: 0, why: 'Code runs as written, mistakes included. Hacks of buggy contracts have cost users billions.' },
          { q: 'In proof of stake, cheaters…', choices: ['Lose part of their locked-up stake', 'Pay a small fine in dollars', 'Earn extra rewards'], a: 0, why: 'The stake is a deposit the network can destroy.' },
        ],
        takeaways: ['Smart contracts are programs that run exactly as written on a blockchain.', 'They remove middlemen, but bugs can’t be appealed.', 'Proof of stake secures Ethereum with deposits instead of electricity.'],
      },
      {
        id: 'cr-stable',
        title: 'Stablecoins and tokens',
        hook: 'A dollar on the blockchain is only as good as what backs it.',
        mins: 8,
        steps: [
          {
            h: 'Keeping a steady price',
            body: `<p>Crypto prices swing wildly, which makes them awkward for everyday payments. A [[stablecoin]] aims to stay at exactly $1. Most do it the simple way: for every coin, the issuer holds $1 in reserves, such as cash and short-term government bonds, and promises to swap coins back for dollars.</p>
<p>The real test is a panic, when everyone wants their dollars at once. Pick how the coin is backed, then start a run.</p>`,
            predict: {
              q: 'A stablecoin holds only 80 cents of reserves for each coin. Everyone rushes to cash out. What happens?',
              choices: ['Early sellers get $1, then the reserves run out and the price falls', 'Everyone gets $1', 'The price rises'],
              a: 0,
              why: 'Like a bank run: the first in line are paid in full, and the latecomers are left holding coins worth less than $1.',
            },
            viz: { type: 'stablePeg' },
          },
          {
            h: 'Many kinds of tokens',
            body: `<p>Stablecoins are one kind of [[crypto-token|token]]: a crypto asset built on top of an existing blockchain. An [[nft|NFT]] is another. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Token',
              back: 'What to know',
              items: [
                ['Stablecoin', 'Aims to stay at $1.', 'Used for trading and payments. Check what backs it, and whether the reserves are independently checked.'],
                ['NFT', 'A one-of-a-kind token.', 'Records who owns a specific item, often digital art. Owning the token doesn’t always mean owning the copyright.'],
                ['Governance token', 'A vote in a project.', 'Holders vote on changes to a protocol. Its price swings like any other crypto asset.'],
                ['Meme coin', 'Value from attention.', 'Often started as a joke, with no product behind it. Prices can soar and collapse within days.'],
                ['Exchange token', 'Issued by one company.', 'Its value often depends on that company. When the FTX exchange collapsed in 2022, its token lost almost all of its value.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Most stablecoins keep their $1 price by…', choices: ['Holding $1 of reserves for each coin', 'Never being sold', 'A government guarantee'], a: 0, why: 'Coins can be swapped back for the reserves.' },
          { q: 'What happened to the TerraUSD stablecoin in May 2022?', choices: ['It lost its peg and collapsed toward zero', 'It rose to $10', 'It turned into a bank'], a: 0, why: 'It was backed by a sister token instead of dollars, and a run set off a death spiral.' },
          { q: 'Owning an NFT of a picture means you…', choices: ['Own a token recording it, not necessarily the copyright', 'Own all rights to the picture', 'Own the artist’s other work too'], a: 0, why: 'The rights depend on the project’s terms.' },
        ],
        takeaways: ['A stablecoin is only as strong as its reserves.', 'A run reveals weak backing: the first in line get paid, latecomers don’t.', 'Tokens come in many kinds; know what gives yours its value.'],
      },
      {
        id: 'cr-defi',
        title: 'DeFi: trading without a broker',
        hook: 'A pool of tokens and a simple formula can replace an exchange.',
        mins: 9,
        steps: [
          {
            h: 'A pool and a formula',
            body: `<p>[[defi|DeFi]], short for decentralized finance, rebuilds banking and trading with smart contracts. Its best-known invention is the [[liquidity-pool|liquidity pool]]: two tokens locked in a contract, say ether and dollars, that anyone can trade against.</p>
<p>The pool keeps one rule: <mark>ether in the pool × dollars in the pool stays the same</mark>. Sell ether into the pool and it pays you dollars, but every bit you sell makes the next bit cheaper. That’s [[price-impact|price impact]]. Slide the size of your trade.</p>`,
            predict: {
              q: 'Ether trades at $3,000 in a pool. You sell a large amount in one go. Your average price will be…',
              choices: ['Below $3,000: your own trade pushes the price down', 'Exactly $3,000', 'Above $3,000'],
              a: 0,
              why: 'As your ether flows in, the pool’s price for ether falls, so the later parts of your trade get less.',
            },
            viz: { type: 'ammPool' },
          },
          {
            h: 'The risks of DeFi',
            body: `<p>DeFi is open to anyone, around the clock, but there’s no customer service. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Risk',
              back: 'What it means',
              items: [
                ['Smart contract bugs', 'Code is law, bugs included.', 'Hackers have drained billions from buggy contracts. Audits help, but they don’t guarantee safety.'],
                ['Rug pulls', 'The creators run off.', 'Some projects exist only to collect deposits and vanish. Anonymous teams and promises of huge returns are warning signs.'],
                ['Price impact', 'Big trades, worse prices.', 'Check the expected price, and set a limit on how much worse you’ll accept, before you confirm.'],
                ['Liquidations', 'Borrowing against crypto.', 'DeFi loans are backed by crypto. If its price falls far enough, the contract sells it automatically.'],
                ['No safety net', 'No bank, no insurance, no refunds.', 'Send to the wrong address or approve a malicious contract, and the money is usually gone for good.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'A liquidity pool sets its price by…', choices: ['A formula based on how much of each token it holds', 'A broker quoting prices', 'Votes from token holders'], a: 0, why: 'Ether × dollars stays the same, so the mix sets the price.' },
          { q: 'Why does a big trade get a worse price in a small pool?', choices: ['The trade itself shifts the balance and moves the price', 'Pools charge big traders more on purpose', 'It doesn’t'], a: 0, why: 'That’s price impact.' },
          { q: 'If a DeFi contract is hacked, usually…', choices: ['The money is gone, with no one to refund it', 'A bank covers the loss', 'The government refunds everyone'], a: 0, why: 'There is no safety net.' },
        ],
        takeaways: ['DeFi rebuilds finance with smart contracts anyone can use.', 'Liquidity pools price trades with a formula; big trades move the price.', 'There’s no safety net: bugs, scams and mistakes are usually final.'],
      },
    ],
  });
})();
