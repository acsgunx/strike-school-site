/* Fundamentals, Unit 6 — The investor's mindset. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'loss-aversion', term: 'Loss aversion', w: 'loss aversion', def: 'The tendency to feel a loss roughly twice as strongly as a gain of the same size, documented by psychologists Daniel Kahneman and Amos Tversky.' },
      { id: 'anchoring', term: 'Anchoring', w: 'anchoring', def: 'Fixing on a number, such as the price you paid, and judging everything relative to it, even when it no longer matters.' },
      { id: 'herding', term: 'Herding', w: 'herding', def: 'Following what everyone else is doing, such as buying because a stock is popular. Often called FOMO: fear of missing out.' },
      { id: 'recency-bias', term: 'Recency bias', w: 'recency bias', def: 'Assuming the recent past will continue, such as expecting last year’s winner to win again.' },
      { id: 'confirmation-bias', term: 'Confirmation bias', w: 'confirmation bias', def: 'Seeking out information that supports what you already believe and ignoring what contradicts it.' },
      { id: 'overconfidence', term: 'Overconfidence', w: 'overconfidence', def: 'Believing your knowledge or skill is better than it is, which often leads to trading too much and diversifying too little.' },
      { id: 'disposition-effect', term: 'Disposition effect', w: 'disposition effect', def: 'Selling winning investments too early and holding losing ones too long, to avoid admitting a loss.' },
      { id: 'emergency-fund', term: 'Emergency fund', w: 'emergency fund', def: 'Cash set aside for surprises such as a job loss or a repair, often three to six months of essential expenses, kept somewhere safe and easy to reach.' },
      { id: 'investment-plan', term: 'Investment plan', w: 'investment plan', def: 'A short written statement of your goals, time horizon, contributions, target mix and the rules you will follow, written before markets test you.' },
      { id: 'ponzi', term: 'Ponzi scheme', w: 'Ponzi scheme', def: 'A fraud that pays earlier investors with money from newer ones, promising high, steady returns until it collapses.' },
    ],
    'fundamentals'
  );

  SS.FUND_UNITS.push({
    n: 6,
    title: 'The investor’s mindset',
    blurb: 'The biases that trip investors up, and a written plan that protects you from them.',
    lessons: [
      {
        id: 'investor-biases',
        title: 'Your brain on money',
        hook: 'The mental shortcuts that cost investors the most.',
        mins: 7,
        steps: [
          {
            h: 'Losses hurt more than gains feel good',
            body: `<p>In the late 1970s, psychologists Daniel Kahneman and Amos Tversky showed that people feel losses about twice as strongly as equal gains. This is [[loss-aversion]].</p>
<p>It protects us in daily life, but in investing it makes people sell in a panic and avoid good bets. Try the experiment: would you take this coin flip?</p>`,
            viz: { type: 'lossAversion' },
          },
          {
            h: 'Six biases to know by name',
            body: `<p>Everyone has these biases: [[overconfidence]], [[anchoring]], [[herding]], [[recency-bias]], [[confirmation-bias]] and the [[disposition-effect]]. Naming them is the first step to catching them.</p>
<p>Tap each card for what the bias sounds like in your head, and how to counter it.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Sounds like',
              back: 'The fix',
              items: [
                ['Overconfidence', '“I can pick the winners.”', 'Most professionals cannot do it reliably. Diversify, keep costs low, and track your actual results honestly.'],
                ['Anchoring', '“I’ll sell when it gets back to what I paid.”', 'The market does not know your purchase price. Ask whether you would buy it today at this price.'],
                ['Herding (FOMO)', '“Everyone is buying it. I can’t miss out.”', 'Popularity is often already in the price. Stick to your plan and your target mix.'],
                ['Recency bias', '“It went up 40% last year, so it will again.”', 'Last year’s winners are often not next year’s. Look at long periods, not the latest one.'],
                ['Confirmation bias', '“Everything I read says I’m right.”', 'Seek out the strongest case against your idea before you invest.'],
                ['Disposition effect', '“Lock in the winner, wait out the loser.”', 'Judge each holding on its future, not on whether it is currently up or down.'],
              ],
            },
          },
          {
            h: 'Bias or sound reasoning?',
            body: `<p>Practice spotting the biases in real investor thinking.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'red', label: 'Bias' },
                { k: 'good', label: 'Sound reasoning' },
              ],
              items: [
                ['“I won’t sell until it’s back to the $50 I paid.”', 'red', 'Anchoring and the disposition effect. Your purchase price is irrelevant to what the stock will do next.'],
                ['“Stocks fell 20%, but my plan says to rebalance, so I bought more.”', 'good', 'Following a written plan in a downturn is exactly what it is for.'],
                ['“Everyone at work is buying this coin, so I should too.”', 'red', 'Herding. Popularity tells you nothing about value.'],
                ['“This fund returned 40% last year. I’m moving everything into it.”', 'red', 'Recency bias, and concentration risk on top.'],
                ['“I chose my stock and bond mix based on when I need the money.”', 'good', 'Matching risk to your time horizon is sound.'],
                ['“I only follow people who agree that this stock will triple.”', 'red', 'Confirmation bias. Look for the bear case too.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Loss aversion means…', choices: ['A loss feels about twice as painful as an equal gain feels good', 'People avoid all investments', 'Losses are taxed more heavily'], a: 0, why: 'It is about how we feel, and it pushes us toward panicked selling and passing on good bets.' },
          { q: 'Refusing to sell a stock until it gets back to your purchase price is an example of…', choices: ['Anchoring', 'Diversification', 'Rebalancing'], a: 0, why: 'You are anchored to a number that has nothing to do with the stock’s future.' },
          { q: 'Buying because everyone else is buying is…', choices: ['Herding', 'Hedging', 'Compounding'], a: 0, why: 'Following the crowd often means buying after prices have already risen.' },
        ],
        takeaways: ['Losses feel about twice as strong as gains, which pushes us to bad decisions.', 'Name the common biases: overconfidence, anchoring, herding, recency, confirmation, disposition.', 'Rules written in advance beat decisions made in the moment.'],
      },
      {
        id: 'investing-plan',
        title: 'Your investing plan',
        hook: 'What to do first, how to write it down, and how to spot a scam.',
        mins: 8,
        steps: [
          {
            h: 'Order of operations',
            body: `<p>Investing works best on a solid base. A common order is: build an [[emergency-fund]], pay off high-interest debt, capture any employer match, then fill tax-advantaged accounts before regular ones.</p>
<p>Paying off a credit card charging 22% is like earning a guaranteed 22% return, which no investment can promise. Tap each rung for details.</p>`,
            viz: { type: 'planLadder' },
          },
          {
            h: 'Write it down',
            body: `<p>An [[investment-plan]] is a one-page note to your future self: your goal, how long until you need the money, how much you will add, your target mix, and what you will do when markets fall.</p>
<p>Build one below. This is a learning exercise using textbook rules of thumb, not personal advice. Your situation, taxes and local rules matter.</p>`,
            viz: { type: 'planBuilder' },
          },
          {
            h: 'Spot the scam',
            body: `<p>Fraudsters target new investors with the same few tricks: guaranteed high returns, urgency and secrecy. A [[ponzi]] can look great for years before it collapses.</p>
<p>Sort these into legitimate and suspicious.</p>`,
            viz: {
              type: 'sorter',
              options: [
                { k: 'good', label: 'Looks legitimate' },
                { k: 'red', label: 'Red flag' },
              ],
              items: [
                ['“Guaranteed 2% a week, with no risk.”', 'red', 'That is over 180% a year. Guaranteed high returns are the classic sign of fraud.'],
                ['A broad index fund from a large provider, charging 0.04% a year.', 'good', 'Low-cost, transparent and widely held.'],
                ['“You must decide today, or the opportunity is gone.”', 'red', 'Pressure and urgency are designed to stop you from checking.'],
                ['Someone you met online asks you to wire crypto to their trading platform.', 'red', 'A very common scam pattern. Legitimate firms do not recruit this way.'],
                ['You check your broker’s registration with your regulator (in the US, FINRA BrokerCheck or the SEC).', 'good', 'Verifying registration is exactly the right habit.'],
                ['A celebrity-promoted coin that “can only go up.”', 'red', 'Paid promotions and promises of one-way prices are warning signs.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'What usually comes before investing in stocks?', choices: ['An emergency fund and paying off high-interest debt', 'Buying options', 'Picking a hot stock'], a: 0, why: 'A cash cushion stops you from selling investments at a bad time, and expensive debt costs more than investing typically earns.' },
          { q: 'You have credit card debt at 22% interest. Paying it off is like earning…', choices: ['A guaranteed 22% return', 'Nothing', 'About a 2% return'], a: 0, why: 'Every dollar repaid stops costing 22% a year, with no risk.' },
          { q: 'A key reason to write your plan down in advance is…', choices: ['To avoid emotional decisions in a crash', 'Brokers require it', 'It guarantees returns'], a: 0, why: 'Decisions made calmly, in advance, hold up better than decisions made in fear.' },
          { q: 'An investment promising high returns with no risk is most likely…', choices: ['A scam', 'A government bond', 'An index fund'], a: 0, why: 'Risk and return go together. A promise of one without the other is a red flag.' },
        ],
        takeaways: ['Build an emergency fund and clear expensive debt before investing.', 'Write a one-page plan: goal, horizon, contributions, mix and rules.', 'Guaranteed high returns, urgency and secrecy are signs of fraud.'],
      },
    ],
  });
})();
