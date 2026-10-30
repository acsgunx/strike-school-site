/* Lessons of a Stock Operator, Unit 1 — Learning the game: the tape, bucket shops, and other people's opinions. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'tape-reading', term: 'Tape reading', w: 'tape reading', def: 'Judging a stock from its trades as they print: price, volume, and how it reacts to news. Named after the paper ticker tape that once carried every trade.' },
      { id: 'bucket-shop', term: 'Bucket shop', w: 'bucket shop', def: 'A fake brokerage of the early 1900s that took customers’ bets on stock prices without ever sending orders to an exchange. Bucket shops were outlawed in the United States.' },
      { id: 'slippage', term: 'Slippage', w: 'slippage', def: 'The difference between the price you expected and the price you actually got. It grows in fast markets and with large orders.' },
      { id: 'market-impact', term: 'Market impact', w: 'market impact', def: 'How much your own order moves the price against you. Small orders barely move it; large ones can push it noticeably.' },
    ],
    'operator'
  );

  SS.OPERATOR_UNITS.push({
    n: 1,
    title: 'Learning the game',
    blurb: 'A teenage board boy learns to read the tape, beats the bucket shops, fails on Wall Street, and learns what tips really cost.',
    lessons: [
      {
        id: 'tape-reading',
        title: 'Reading the tape',
        hook: 'He didn’t care why a stock moved. He cared how it moved.',
        mins: 7,
        steps: [
          {
            h: 'The boy at the quotation board',
            body: `<p><i>Reminiscences of a Stock Operator</i> (1923), by journalist Edwin Lefèvre, tells the career of the speculator Jesse Livermore through a narrator named Larry Livingston. It is still one of the most widely recommended trading books, because its lessons are about people, and people haven't changed.</p>
<p>The story starts with a 14-year-old chalking prices on a brokerage's quotation board. Good with numbers, he jots down how stocks behave before they move, and notices that the same patterns keep repeating. That is [[tape-reading]]: reading the trades themselves instead of the news. Replay a stock the way he would have watched it.</p>`,
            predict: {
              q: 'A stock has bounced between $99.50 and $103.50 for weeks. Today it closes at $104 on almost four times its usual volume. What would a tape reader conclude?',
              choices: ['Buyers have finally overpowered the sellers', 'It is now too expensive, so sell', 'Nothing: volume doesn’t matter'],
              a: 0,
              why: 'A long stalemate ending on heavy volume shows one side has won. The tape reader follows the winners instead of arguing with them.',
            },
            viz: { type: 'tapeReplay' },
          },
          {
            h: 'What the tape tells you',
            body: `<p>The tape never explains itself. It only records what people did with real money. Livingston learned to read four things in it. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Clue',
              back: 'What it tells you',
              items: [
                ['Price', 'Where trades actually happen.', 'Not opinions or forecasts: the record of what buyers and sellers really paid.'],
                ['Volume', 'How many shares changed hands.', 'A move on heavy volume has more money behind it than the same move on light volume.'],
                ['Reaction to news', 'How price behaves when news hits.', 'A stock that shrugs off bad news is strong. One that falls on good news is weak.'],
                ['Ranges and breaks', 'Where price keeps turning back, and where it finally doesn’t.', 'Breaking out of a long range shows that one side has won the tug-of-war.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Tape reading means…', choices: ['Judging a stock from its trades: price, volume and reactions', 'Reading company reports', 'Following analysts’ forecasts'], a: 0, why: 'It focuses on what traders actually did, not on what anyone says.' },
          { q: 'A breakout on heavy volume is more convincing than one on light volume because…', choices: ['More money is behind the move', 'Heavy volume always means a top', 'Volume never matters'], a: 0, why: 'Volume shows how much conviction backs the price change.' },
          { q: 'A stock rises even though bad news just came out. A tape reader sees that as…', choices: ['A sign of strength', 'A sign of weakness', 'Irrelevant'], a: 0, why: 'If bad news can’t push it down, buyers are firmly in control.' },
        ],
        takeaways: ['The tape shows what people did with real money, not what they said.', 'Watch price, volume, reactions to news, and ranges.', 'Patterns repeat because the people behind them don’t change.'],
      },
      {
        id: 'bucket-shops',
        title: 'Bucket shops and the real market',
        hook: 'A method that won every day in a betting parlor lost money on Wall Street.',
        mins: 8,
        steps: [
          {
            h: 'Betting on the tape',
            body: `<p>Livingston made his first fortune in [[bucket-shop|bucket shops]], betting parlors dressed up as brokerages. Customers “bought” or “sold” at the last printed price, but no order ever reached an exchange: the shop simply took the other side of the bet. Margins were so thin that a small move against a customer wiped out the stake.</p>
<p>His tape reading beat them so often that shop after shop banned him; they called him the Boy Plunger. In a bucket shop, the price on the tape is exactly the price you get. Replay one of his quick trades.</p>`,
            viz: { type: 'slippageSim', mode: 'shop' },
          },
          {
            h: 'Why the method failed on Wall Street',
            body: `<p>When he moved to a real New York brokerage, the same method started losing. His orders now had to find real sellers on the exchange, and in fast markets the tape ran minutes behind the actual trading. By the time he saw a move and acted, the real price had already gone further. That gap is [[slippage]], and bigger orders add [[market-impact]] on top.</p>
<p>Slide the tape delay and order size, and watch a quick one-dollar scalp shrink, then turn into a loss.</p>`,
            predict: {
              q: 'In a fast-rising market, the tape you watch is two minutes behind. You send a buy order. Where will it most likely fill?',
              choices: ['Above the price on the tape', 'Exactly at the tape price', 'Below the tape price'],
              a: 0,
              why: 'The real price has kept rising during those two minutes, so you pay more than the tape shows.',
            },
            viz: { type: 'slippageSim', mode: 'real' },
          },
        ],
        quiz: [
          { q: 'In a bucket shop, customers’ orders…', choices: ['Never reached an exchange; the shop took the other side', 'Were sent to the New York Stock Exchange', 'Were matched with other customers'], a: 0, why: 'Bucket shops were betting operations, later outlawed.' },
          { q: 'Why did quick scalping work worse on a real exchange?', choices: ['Fills came at worse prices than the tape showed', 'Commissions were lower', 'Prices moved more slowly'], a: 0, why: 'Tape delays and real order matching meant slippage on every entry and exit.' },
          { q: 'Which trades suffer most from slippage?', choices: ['Quick trades aiming for small profits', 'Long-term holdings', 'Trades that never execute'], a: 0, why: 'A fixed cost per trade eats a large share of a small target.' },
        ],
        takeaways: ['A method is only as good as the prices you can actually get.', 'Slippage grows in fast markets and with bigger orders.', 'Small, quick targets are the most fragile to trading costs.'],
      },
      {
        id: 'tips',
        title: 'Tips and other people’s opinions',
        hook: 'The most expensive advice is the kind that overrides your own judgment.',
        mins: 7,
        steps: [
          {
            h: 'Why tips are dangerous',
            body: `<p>The book returns again and again to how badly people want tips, and how much they cost. Even an honest tip leaves you dependent on someone else: you don't know why they think it, when they will change their mind, or when they will sell. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Source',
              back: 'The problem',
              items: [
                ['The hot tip', 'Someone “knows” a stock will rise.', 'Even if they are right, you don’t know when they will get out, so you can’t manage your own trade.'],
                ['The insider', 'A company insider says the stock is a buy.', 'Insiders may be selling to the very people they tell. Today, trading on true inside information is also illegal.'],
                ['The expert', 'A brilliant, persuasive specialist.', 'Livingston let a famous cotton trader talk him out of his own reading, and it cost him most of a fortune.'],
                ['Your own read', 'What the tape and your rules say.', 'Only your own reasons tell you when you are wrong, so only they let you manage the risk.'],
              ],
            },
          },
          {
            h: 'The cotton and wheat mistake',
            body: `<p>Under the expert's spell, Livingston held a big losing position in cotton and kept buying more as it fell. At the same time he held a profitable position in wheat. Needing cash, he sold the winning wheat and kept the losing cotton: the exact opposite of what his own rules said.</p>
<p>Switch between what he did and what his rules said. The prices are illustrative, not the real ones.</p>`,
            viz: { type: 'twoPositions' },
          },
        ],
        quiz: [
          { q: 'Why is a correct tip still risky?', choices: ['You don’t know when the source will change their mind or sell', 'Tips are always wrong', 'Tips are illegal'], a: 0, why: 'Without your own reasons, you have no signal for getting out.' },
          { q: 'Holding a losing trade and selling a winning one to raise cash is…', choices: ['Backwards: cut the loser and keep the winner', 'The safest choice', 'What the rules recommend'], a: 0, why: 'Winners show you are right; losers show you are wrong. Keep the first, cut the second.' },
          { q: 'What finally protects you from a persuasive expert?', choices: ['Your own rules for when you are wrong', 'A second expert', 'Ignoring prices'], a: 0, why: 'Rules you trust let you act on what the market does, not on what someone says.' },
        ],
        takeaways: ['Tips leave you without a plan for getting out.', 'Never let anyone’s opinion override what the market is telling you.', 'When you must cut, cut the loser and keep the winner.'],
      },
    ],
  });
})();
