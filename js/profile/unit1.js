/* Reading the Market Profile, Unit 1 — The market is an auction: price searching for value, building a profile,
   and who is trading. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'auction-market', term: 'Two-way auction', w: 'two-way auction', def: 'The view of a market as a continuous auction whose job is to bring buyers and sellers together. Price moves up to look for buyers and down to look for sellers, and settles where both keep trading.' },
      { id: 'tpo', term: 'TPO (time-price opportunity)', w: 'TPO', def: 'One letter in a Market Profile: it marks that the market traded at that price during that half-hour period. Each period gets its own letter, A for the first, B for the next, and so on.' },
      { id: 'market-profile', term: 'Market Profile', w: 'Market Profile', def: 'A chart that stacks a day’s TPO letters at each price, showing how long the market spent at every level. Its shape reveals value, balance and who was in control.' },
      { id: 'other-timeframe', term: 'Other-timeframe traders', w: 'other-timeframe traders', def: 'Longer-term buyers and sellers, such as funds and investors, whose larger orders move price to new levels. Their activity shows up as range extension, tails and one-timeframing.' },
      { id: 'one-timeframing', term: 'One-timeframing', w: 'one-timeframing', def: 'When each period’s low stays above the previous period’s low (up), or each high stays below the previous high (down). It signals that one side is firmly in control.' },
    ],
    'profile'
  );

  SS.PROFILE_UNITS.push({
    n: 1,
    title: 'The market is an auction',
    blurb: 'Watch price search for value, build a profile letter by letter, and learn to tell short-term traders from the longer-term money that moves markets.',
    lessons: [
      {
        id: 'mp-auction',
        title: 'The market is an auction',
        hook: 'Price goes looking for buyers and sellers, and settles where it finds both.',
        mins: 7,
        steps: [
          {
            h: 'Price goes looking',
            body: `<p><i>Mind Over Markets</i>, by James Dalton, Eric Jones and Robert Dalton, teaches the market as a [[auction-market|two-way auction]]. This course explains its ideas in our own words; it isn't affiliated with the authors or publisher, and the book has the full method.</p>
<p>The idea: the market's job is to let buyers and sellers trade. Price moves up to find out whether anyone will still buy, and down to find out whether anyone will still sell. Where it overshoots, trading dries up and it turns fast. Where both sides keep trading, value forms. Watch it happen.</p>`,
            predict: {
              q: 'Price jumps to a new high, and trading there quickly dries up. What usually happens next?',
              choices: ['Price turns back: the higher price found no buyers', 'Price keeps rising on no trades', 'The market closes'],
              a: 0,
              why: 'An auction moves on when a price stops attracting the other side. A quick turn from a level with little trade is called excess.',
            },
            viz: { type: 'auctionSim' },
          },
          {
            h: 'Price, time and trade',
            body: `<p>Three things tell you how the auction is going. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Clue',
              back: 'What it tells you',
              items: [
                ['Price', 'Signals an opportunity.', 'A new price is a question to the market: will anyone trade here?'],
                ['Time', 'How long a price is offered.', 'The longer the market stays at a level, the more that level is accepted.'],
                ['Volume', 'Whether the offer worked.', 'Heavy trading means the price was accepted; thin trading means it was rejected.'],
                ['Value', 'Where most of the trade happens.', 'The area both sides agree on for now. Everything else is price testing the edges.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'In the auction view, why does price move up?', choices: ['To find out whether buyers are still willing to trade', 'Because of the time of day', 'Because sellers want it to'], a: 0, why: 'Price advertises higher to look for the other side; if no one trades, it turns back.' },
          { q: 'A quick, sharp turn from a price with very little trade is called…', choices: ['Excess', 'Value', 'Balance'], a: 0, why: 'Excess marks where the auction went too far and was rejected.' },
          { q: 'Where does value form?', choices: ['Where both buyers and sellers keep trading', 'At the day’s high', 'At the opening price'], a: 0, why: 'Value is the area of most trade, where both sides agree.' },
        ],
        takeaways: ['The market is an auction looking for both buyers and sellers.', 'Quick turns from thin trade are excess; heavy trade is acceptance.', 'Value is where most of the trade happens.'],
      },
      {
        id: 'mp-tpo',
        title: 'Building a profile, letter by letter',
        hook: 'Turn a day of half-hour bars into a picture of where the market spent its time.',
        mins: 8,
        steps: [
          {
            h: 'Letters instead of bars',
            body: `<p>A [[market-profile|Market Profile]] gives each half-hour a letter: A for 9:30, B for 10:00, and so on to M. Every price traded in that half-hour gets its letter, called a [[tpo|TPO]]. Side by side, the letters look like a bar chart. Slide them all to the left and they stack into a profile: wide where the market spent a lot of time, thin where it hurried through.</p>
<p>Watch the day build period by period, then collapse.</p>`,
            viz: { type: 'tpoBuild', days: ['normal'] },
          },
          {
            h: 'The POC and the value area',
            body: `<p>The longest row is the [[point-of-control|point of control]]: the price that the most periods traded at. Growing out from it until about 70% of all the letters are included gives the [[value-area|value area]], the day's zone of fair price.</p>
<p>Switch between the period view and the profile to see where they come from.</p>`,
            predict: {
              q: 'In a Market Profile, the point of control is…',
              choices: ['The price row with the most letters', 'The first price of the day', 'The highest price'],
              a: 0,
              why: 'Most letters means most half-hours traded there: the market treated it as the fairest price.',
            },
            viz: { type: 'tpoBuild', days: ['normal'], show: ['va'] },
          },
        ],
        quiz: [
          { q: 'What does each TPO letter represent?', choices: ['A half-hour period trading at that price', 'One share traded', 'One minute of the day'], a: 0, why: 'A letter marks that the market touched that price during that period.' },
          { q: 'A wide row in the profile means…', choices: ['The market spent a lot of time at that price', 'The price was rejected', 'Nothing traded there'], a: 0, why: 'More letters means more periods traded there.' },
          { q: 'The value area holds about…', choices: ['70% of the day’s TPOs', '10% of them', 'All of them'], a: 0, why: 'It grows out from the POC until it covers roughly 70%.' },
        ],
        takeaways: ['Each half-hour gets a letter at every price it trades.', 'Collapse the letters left to see the profile.', 'POC = most letters; value area = about 70% of them.'],
      },
      {
        id: 'mp-timeframes',
        title: 'Who is trading?',
        hook: 'Short-term traders keep price balanced; longer-term money moves it.',
        mins: 8,
        steps: [
          {
            h: 'Two kinds of traders',
            body: `<p>The book splits the market into two groups. Day-timeframe traders, such as market makers and day traders, mostly buy low and sell high inside the day's range, which keeps price balanced. [[other-timeframe|Other-timeframe traders]], such as funds and investors, act less often but with size, and they are the ones who move price to new levels. Tap each card.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Who',
              back: 'What they do',
              items: [
                ['Day-timeframe traders', 'Trade within today’s range.', 'Sell near the top, buy near the bottom, and keep the market rotating around value.'],
                ['Other-timeframe traders', 'Longer-term buyers and sellers.', 'Act when price offers them value on their own timescale, and move it to new levels.'],
                ['Signs of the bigger players', 'Range extension, tails, one-timeframing.', 'When these show up, someone with a longer horizon is acting with size.'],
                ['Why it matters', 'Follow the stronger hand.', 'Trading against other-timeframe activity means fighting the side with more money.'],
              ],
            },
          },
          {
            h: 'One-timeframing',
            body: `<p>The clearest sign of other-timeframe control is [[one-timeframing]]: each half-hour's low stays above the one before (buyers in control), or each high stays below the one before (sellers in control). The green line connects every period's low.</p>
<p>Compare a trend day with a normal day.</p>`,
            viz: { type: 'tpoBuild', days: ['trend', 'normal'], show: ['otf'], view: 'split' },
          },
        ],
        quiz: [
          { q: 'Who usually moves price to new levels?', choices: ['Other-timeframe traders with size', 'Day traders scalping inside value', 'Nobody'], a: 0, why: 'Longer-term money is what pushes price out of balance.' },
          { q: 'One-timeframing up means…', choices: ['Each period’s low is above the previous low', 'Price is unchanged', 'Each high is lower'], a: 0, why: 'Higher lows period after period show buyers in control.' },
          { q: 'Day-timeframe traders mostly…', choices: ['Trade around value inside the day’s range', 'Drive long trends', 'Avoid trading'], a: 0, why: 'They keep price rotating and balanced.' },
        ],
        takeaways: ['Day-timeframe traders balance; other-timeframe traders move price.', 'Range extension, tails and one-timeframing reveal the bigger players.', 'Higher lows every period = buyers in control.'],
      },
    ],
  });
})();
