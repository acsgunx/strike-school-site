/* Crypto, Explained, Unit 2 — How Bitcoin works: mining and proof of work, the difficulty adjustment, why rewriting
   history is so hard, and the halving toward 21 million coins. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'mining', term: 'Mining', w: 'mining', def: 'The competition to add the next block. Miners race to solve a proof-of-work puzzle, and the winner earns the block reward plus fees.' },
      { id: 'proof-of-work', term: 'Proof of work', w: 'proof of work', def: 'A puzzle that takes enormous numbers of tries to solve but only one step to check. In Bitcoin, it means finding a block hash below a target, which looks like a hash starting with many zeros.' },
      { id: 'nonce', term: 'Nonce', w: 'nonce', def: 'The number miners change, again and again, until the block’s hash meets the target. Short for “number used once.”' },
      { id: 'mining-difficulty', term: 'Difficulty', w: 'difficulty', def: 'How hard the mining puzzle is. Bitcoin adjusts it every 2,016 blocks, about every two weeks, so a block arrives about every 10 minutes however many miners join.' },
      { id: 'block-reward', term: 'Block reward', w: 'block reward', def: 'The new coins paid to the miner who adds a block. It is the only way new bitcoins are created.' },
      { id: 'confirmations', term: 'Confirmations', w: 'confirmations', def: 'The number of blocks in the chain from the one holding your payment to the newest one. Each extra confirmation makes the payment much harder to reverse.' },
      { id: 'majority-attack', term: '51% attack', w: '51% attack', def: 'An attack by someone controlling most of a network’s mining power, letting them outpace the honest chain and undo their own recent payments. It can’t be used to take coins from other people’s wallets.' },
      { id: 'halving', term: 'Halving', w: 'halving', def: 'The cut of Bitcoin’s block reward in half every 210,000 blocks, about every four years. It is why the supply approaches but never exceeds 21 million.' },
    ],
    'crypto'
  );

  SS.CRYPTO_UNITS.push({
    n: 2,
    title: 'How Bitcoin works',
    blurb: 'Mine a real block, watch the difficulty keep blocks ten minutes apart, race an attacker trying to rewrite history, and follow the halvings toward 21 million coins.',
    lessons: [
      {
        id: 'cr-mining',
        title: 'Mining: a race to solve a puzzle',
        hook: 'A puzzle that takes huge effort to solve but only a moment to check.',
        mins: 9,
        steps: [
          {
            h: 'Find the magic number',
            body: `<p>Who gets to add the next block? In Bitcoin, computers called miners compete to solve a puzzle. This is [[mining]], and the puzzle is called [[proof-of-work]].</p>
<p>The puzzle: find a number, the [[nonce]], that makes the block’s hash start with enough zeros. There’s no shortcut; you just try 0, 1, 2, 3… until one works. Each extra zero makes it about <mark>16 times harder</mark>, yet checking an answer takes a single hash. The winner earns new coins, the [[block-reward]].</p>
<p>Mine a block yourself, with the real SHA-256.</p>`,
            predict: {
              q: 'Finding a hash that starts with 2 zeros takes about 256 tries. About how many for 3 zeros?',
              choices: ['About 4,096: 16 times more', 'About 384: a little more', 'About 257'],
              a: 0,
              why: 'Each character of the hash has 16 possible values, so each extra zero you require makes a lucky hash 16 times rarer.',
            },
            viz: { type: 'miner' },
          },
          {
            h: 'Ten minutes, on average',
            body: `<p>More miners means more tries per second, so blocks would come faster and faster. To keep a steady pace of about one block every 10 minutes, Bitcoin adjusts the [[mining-difficulty|difficulty]] every 2,016 blocks, roughly every two weeks. Blocks came too fast? The puzzle gets harder. Too slow? Easier.</p>
<p>Watch miners join the network. This simulation adjusts every 12 blocks so you can see it happen.</p>`,
            viz: { type: 'difficultyAdjust' },
          },
        ],
        quiz: [
          { q: 'In proof of work, miners search for…', choices: ['A number that gives the block a hash starting with enough zeros', 'The private key of the last block', 'The fastest internet connection'], a: 0, why: 'They change the nonce until the hash meets the target.' },
          { q: 'Why is a solution easy to check?', choices: ['Checking takes a single hash', 'Everyone trusts the miner', 'Solutions are kept in a list'], a: 0, why: 'Anyone can hash the block once and see the zeros.' },
          { q: 'If many new miners join, Bitcoin…', choices: ['Makes the puzzle harder, keeping blocks about 10 minutes apart', 'Produces a block every minute', 'Stops new miners joining'], a: 0, why: 'The difficulty adjustment keeps the pace steady.' },
        ],
        takeaways: ['Mining is a race to find a nonce that gives the block a hash with enough leading zeros.', 'Hard to find, instant to check: that’s proof of work.', 'The difficulty adjusts so a block arrives about every 10 minutes.'],
      },
      {
        id: 'cr-security',
        title: 'Why cheating is so hard',
        hook: 'To rewrite history, a cheater has to out-mine everyone else combined.',
        mins: 9,
        steps: [
          {
            h: 'The race',
            body: `<p>Remember the cheater from Unit 1 who changed an old payment? With proof of work, every block they rebuild needs a new puzzle solved, while honest miners keep extending the real chain. Nodes always follow the chain with the <mark>most work</mark> behind it, usually the longest.</p>
<p>So a seller waits for a few [[confirmations]]: blocks added on top of the payment. Here an attacker pays a seller, then secretly mines a chain where the payment never happened. Set the attacker’s share of the mining power and the confirmations, then run the race.</p>`,
            predict: {
              q: 'An attacker has 10% of all mining power. The seller waits for 6 confirmations. The attacker’s chance of undoing the payment is about…',
              choices: ['0.02%: almost none', '10%', '50%'],
              a: 0,
              why: 'Starting behind with only 10% of the power, the attacker almost never catches up. Satoshi Nakamoto worked out these odds in the 2008 Bitcoin paper.',
            },
            viz: { type: 'chainRace' },
          },
          {
            h: 'The fine print',
            body: `<p>Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Security',
              back: 'In plain words',
              items: [
                ['51% attack', 'Control most of the mining power.', 'Someone with more power than everyone else combined could outpace the honest chain and undo their own recent payments. They still couldn’t spend other people’s coins without their keys.'],
                ['Why it’s rare on Bitcoin', 'It would cost a fortune.', 'The machines and electricity needed are enormous, and a successful attack would likely crash the value of the coins the attacker holds.'],
                ['Smaller coins', 'Less mining power, less safety.', 'Coins with few miners have suffered 51% attacks, because renting enough power to beat them was cheap.'],
                ['How many confirmations?', 'More for bigger amounts.', 'Each block on top makes reversal much harder. Six confirmations, about an hour on Bitcoin, is a common rule of thumb for large payments.'],
                ['The energy cost', 'Security paid for in electricity.', 'Proof of work uses a lot of electricity, a common criticism. Some networks, like Ethereum since 2022, use proof of stake instead (Unit 3).'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'When two versions of the chain compete, nodes follow…', choices: ['The one with the most work, usually the longest', 'The newest one', 'The one with the most payments'], a: 0, why: 'Most work means most proof that the network built it.' },
          { q: 'A confirmation is…', choices: ['A block added after the block holding your payment', 'An email from an exchange', 'A signature from the receiver'], a: 0, why: 'Each one buries the payment deeper.' },
          { q: 'A 51% attacker could…', choices: ['Undo their own recent payments', 'Take coins from any wallet', 'Raise the 21 million limit'], a: 0, why: 'They still can’t sign for other people’s coins, and nodes reject changes to the rules.' },
        ],
        takeaways: ['Nodes follow the chain with the most work.', 'Each confirmation makes a payment much harder to reverse.', 'Rewriting history needs more mining power than the rest of the network combined.'],
      },
      {
        id: 'cr-supply',
        title: 'Only 21 million',
        hook: 'Bitcoin’s supply follows a fixed schedule, cut in half about every four years.',
        mins: 8,
        steps: [
          {
            h: 'The halving',
            body: `<p>New bitcoins enter the world only as block rewards. The reward started at 50 bitcoins per block in 2009 and is cut in half every 210,000 blocks, about every four years: the [[halving]]. After the April 2024 halving it was 3.125.</p>
<p>Because the reward keeps halving, the total supply creeps toward a hard cap of <mark>21 million</mark> and never passes it. The last tiny fraction is expected around 2140. Move through the years.</p>`,
            viz: { type: 'halving' },
          },
          {
            h: 'Scarce isn’t the same as valuable',
            body: `<p>A fixed supply is a big part of Bitcoin’s story, but it isn’t a promise about price. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Myth or fact',
              back: 'The fuller picture',
              items: [
                ['Scarcity alone', 'Many rare things are worthless.', 'Price depends on how many people want to hold it, and that can change quickly.'],
                ['Lost coins', 'Gone for good.', 'Coins whose keys are lost still count toward 21 million but can never move, so the usable supply is smaller.'],
                ['After the rewards end', 'Fees take over.', 'Once new coins stop, miners will be paid only by transaction fees. Whether fees will be enough is an open question.'],
                ['Other coins, other rules', 'Not every coin has a cap.', 'Ether, for example, has no fixed maximum supply. Always check a coin’s supply rules.'],
                ['Halvings and price', 'A popular story, not a law.', 'Some past halvings were followed by big rallies, but a handful of examples proves nothing about the next one.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'How do new bitcoins come into existence?', choices: ['As rewards to miners for new blocks', 'A company prints them', 'Banks issue them'], a: 0, why: 'The block reward is the only source of new coins.' },
          { q: 'The block reward is cut in half…', choices: ['Every 210,000 blocks, about every four years', 'Every year', 'Whenever the price rises'], a: 0, why: 'It follows the block count, not the calendar or the price.' },
          { q: 'What is Bitcoin’s maximum supply?', choices: ['21 million coins', 'Unlimited', '100 million coins'], a: 0, why: 'The halvings make the total approach 21 million without passing it.' },
        ],
        takeaways: ['New bitcoins come only from block rewards.', 'The reward halves about every four years, so the supply approaches 21 million.', 'A fixed supply doesn’t guarantee a rising price.'],
      },
    ],
  });
})();
