/* Crypto, Explained, Unit 4 — Investing with your eyes open: price versus market cap, boom-and-bust cycles,
   volatility and sizing, buying a little at a time, and staying safe from scams. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'circulating-supply', term: 'Circulating supply', w: 'circulating supply', def: 'How many coins of a cryptocurrency exist and can be traded right now. Multiply by the price to get the market cap.' },
      { id: 'fomo', term: 'FOMO', w: 'FOMO', def: 'Fear of missing out: the urge to buy because prices are rising and everyone seems to be getting rich. It tends to peak near the top of a boom.' },
      { id: 'phishing', term: 'Phishing', w: 'phishing', def: 'Tricking someone into giving away passwords, keys or a seed phrase, usually with a fake website, email or message that looks official.' },
      { id: 'rug-pull', term: 'Rug pull', w: 'rug pull', def: 'A scam where a project’s creators collect investors’ money, then abandon the project and disappear with the funds.' },
      { id: 'pump-and-dump', term: 'Pump and dump', w: 'pump and dump', def: 'A scheme where organizers hype a small coin to push its price up, then sell their own coins to the latecomers, leaving them with the losses.' },
    ],
    'crypto'
  );

  SS.CRYPTO_UNITS.push({
    n: 4,
    title: 'Investing with your eyes open',
    blurb: 'Why a cheap coin isn’t cheap, how hype cycles work, how wild crypto prices can be, how to size and pace a purchase, and how to avoid the most common scams.',
    lessons: [
      {
        id: 'cr-price',
        title: 'Price, market cap and hype',
        hook: 'A $0.01 coin isn’t cheap, and a $50 coin isn’t expensive. Here’s why.',
        mins: 8,
        steps: [
          {
            h: 'The cheap-coin trap',
            body: `<p>A coin’s price alone tells you almost nothing. What matters is its [[market-cap|market cap]]: the price times the number of coins, its [[circulating-supply|circulating supply]].</p>
<p>Below, two coins are worth exactly the same today, $50 million each. One has a million coins at $50; the other has 5 billion coins at a penny. Slide the penny coin up to $1 and see what that would really take.</p>`,
            predict: {
              q: 'A coin costs $0.01 and there are 5 billion of them. For it to reach $1, its total value must…',
              choices: ['Grow 100 times, to $5 billion', 'Grow by 99 cents', 'Stay the same'],
              a: 0,
              why: 'Each of the 5 billion coins would be worth 100 times more, so the whole thing must be worth 100 times more.',
            },
            viz: { type: 'capMyth' },
          },
          {
            h: 'Booms and busts',
            body: `<p>Crypto prices have moved in dramatic cycles. Rising prices attract attention, attention brings new buyers, and new buyers push prices higher, until they don’t. [[fomo|FOMO]], the fear of missing out, tends to peak right near the top.</p>
<p>This is a simulated cycle, not real prices, but the shape is typical. Watch the crowd’s mood alongside the price.</p>`,
            viz: { type: 'hypeCycle' },
          },
        ],
        quiz: [
          { q: 'Market cap equals…', choices: ['Price × number of coins', 'Price ÷ number of coins', 'The highest price ever'], a: 0, why: 'It’s the value of all the coins together.' },
          { q: 'Coin A: 5 billion coins at $0.01. Coin B: 1 million coins at $50. Which is worth more?', choices: ['Neither: both are worth $50 million', 'Coin A, it has more coins', 'Coin B, its price is higher'], a: 0, why: '5 billion × $0.01 = 1 million × $50 = $50 million.' },
          { q: 'When does FOMO usually peak?', choices: ['Near the top of a boom', 'Near the bottom of a crash', 'It stays about the same'], a: 0, why: 'Excitement is highest after prices have already risen the most.' },
        ],
        takeaways: ['Judge a coin by its market cap, not its price.', 'A “cheap” coin needs enormous new money to reach $1.', 'Booms feed on excitement, and excitement often peaks near the top.'],
      },
      {
        id: 'cr-volatility',
        title: 'Volatility, sizing and buying over time',
        hook: 'Crypto can fall 70% and keep going. Plan for it before it happens.',
        mins: 9,
        steps: [
          {
            h: 'How wild is the ride?',
            body: `<p>Crypto is far more [[volatility|volatile]] than the stock market. Bitcoin has fallen more than 70% from a peak several times, and many smaller coins have fallen 90% or more and never recovered.</p>
<p>Compare a simulated stock index fund with a simulated crypto coin. Then choose how much of a portfolio to put in crypto, and see how deep the worst [[drawdown]] gets.</p>`,
            viz: { type: 'volCompare' },
          },
          {
            h: 'Buying a little at a time',
            body: `<p>Many people buy volatile assets with [[dollar-cost-averaging|dollar-cost averaging]]: the same amount every month, whatever the price. You buy more coins when prices are low and fewer when they’re high. It doesn’t guarantee a profit, but it avoids betting everything on one day.</p>
<p>Compare it with investing everything at once, in three different futures.</p>`,
            predict: {
              q: 'Prices crash soon after you start, then recover. Who ends up ahead?',
              choices: ['Buying monthly: it bought cheap coins during the crash', 'Investing everything at once', 'They end up the same'],
              a: 0,
              why: 'The monthly buyer picked up many coins at low prices, so the recovery lifts them further.',
            },
            viz: { type: 'dcaSim' },
          },
        ],
        quiz: [
          { q: 'Bitcoin’s history includes…', choices: ['Several drops of more than 70% from a peak', 'No drop bigger than 20%', 'Steady gains every year'], a: 0, why: 'Deep crashes have been a regular part of crypto.' },
          { q: 'Dollar-cost averaging means…', choices: ['Investing the same amount at regular intervals', 'Buying only after prices fall', 'Selling half every month'], a: 0, why: 'You buy more coins when prices are low and fewer when high.' },
          { q: 'You put 5% of your savings into crypto and it falls 80%. Your total savings fall about…', choices: ['4%', '80%', '40%'], a: 0, why: '5% × 80% = 4%. Keeping the position small limits the damage.' },
        ],
        takeaways: ['Crypto can fall 70% or more, sometimes for years.', 'Keep it a small share of your savings, so a crash can’t sink you.', 'Buying a fixed amount regularly avoids betting everything on one day.'],
      },
      {
        id: 'cr-safety',
        title: 'Staying safe',
        hook: 'In crypto there’s usually no one to call. Prevention is everything.',
        mins: 8,
        steps: [
          {
            h: 'Red flag or fine?',
            body: `<p>Crypto attracts scams, because payments are fast, global and usually final. Common tricks include [[phishing]], fake support staff, [[rug-pull|rug pulls]] and [[pump-and-dump|pump-and-dump schemes]]. Sort each situation.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'scam', label: 'Red flag' },
                { k: 'ok', label: 'Probably fine' },
              ],
              items: [
                ['A “support agent” messages you first and asks for your seed phrase to fix your account.', 'scam', 'No real support team ever needs your seed phrase. Anyone asking is trying to steal.'],
                ['A new coin promises a guaranteed 2% return every day.', 'scam', 'Guaranteed high returns are the classic sign of a Ponzi scheme.'],
                ['Before a big transfer to a new address, you send a small test amount first.', 'ok', 'A good habit: check the test arrived before sending the rest.'],
                ['A celebrity account promises to send back double any crypto you send it.', 'scam', 'Giveaway scams use hacked or fake accounts. No one doubles your money.'],
                ['You turn on two-factor authentication for your exchange account.', 'ok', 'It stops most account takeovers that start with a stolen password.'],
                ['A group chat urges everyone to buy a tiny coin at the same minute.', 'scam', 'A pump and dump: the organizers sell into the rush and leave latecomers with the losses.'],
                ['You buy on a large, regulated exchange and move long-term savings to your own wallet.', 'ok', 'A common, sensible setup, as long as you guard your seed phrase.'],
              ],
            },
          },
          {
            h: 'Habits that protect you',
            body: `<p>Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Habit',
              back: 'Why it matters',
              items: [
                ['Seed phrase offline', 'Paper or metal, never a screenshot.', 'Photos and cloud notes can be hacked. Anyone with the words owns the coins.'],
                ['Two-factor authentication', 'Use an app or a security key.', 'Codes sent by text message can be stolen by hijacking your phone number.'],
                ['Double-check addresses', 'Compare the first and last characters.', 'Some malware swaps an address you copied for the thief’s.'],
                ['Too good to be true', 'It is.', 'Guaranteed returns, doubling offers and secret “insider” coins are scams.'],
                ['Size it small', 'Only what you can afford to lose.', 'Even honest crypto can fall 80%. Never borrow money to buy it.'],
                ['Keep records', 'Taxes may apply.', 'In many countries, selling, swapping or spending crypto can be taxable. Keep a record of every trade.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Someone offering support asks for your seed phrase. You should…', choices: ['Refuse: it’s a scam', 'Share it if they seem official', 'Share only half of it'], a: 0, why: 'Anyone with the seed phrase can take everything.' },
          { q: 'A coin that promises guaranteed daily returns is most likely…', choices: ['A scam', 'A safe savings product', 'A stablecoin'], a: 0, why: 'Real investments don’t guarantee high returns.' },
          { q: 'Why send a small test amount first?', choices: ['To check the address is right before risking more', 'To pay lower fees', 'Because the law requires it'], a: 0, why: 'Crypto payments are usually final, so a mistake can’t be undone.' },
        ],
        takeaways: ['Never share your seed phrase, with anyone.', 'Guaranteed returns and urgent pressure are red flags.', 'Use two-factor authentication, test transfers and small position sizes.'],
      },
    ],
  });
})();
