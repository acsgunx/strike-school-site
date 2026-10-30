/* Strike School — the Options Trading course. [[id]] or [[id|label]] links a glossary term; <mark> is the highlighter. */
(function () {
  'use strict';
  const SS = (window.SS = window.SS || {});

  const C = (K, premium, side = 1, qty = 1) => ({ type: 'call', side, K, premium, qty });
  const P = (K, premium, side = 1, qty = 1) => ({ type: 'put', side, K, premium, qty });
  const STOCK = { type: 'stock', side: 1, qty: 1, premium: 100 };

  SS.UNITS = [
    {
      n: 1,
      title: 'Foundations',
      blurb: 'What an option is, the two kinds, and how to read one.',
      lessons: [
        {
          id: 'what-is-an-option',
          title: 'What is an option?',
          hook: 'A right, not an obligation, explained with a house.',
          mins: 5,
          steps: [
            {
              h: 'Start with a house',
              body: `<p>A house is worth <b>$300,000</b>. You think the neighborhood is about to boom, but you are not ready to buy.</p>
<p>So you make a deal with the owner. You pay <b>$5,000 today</b> for the right to buy the house for <b>$300,000</b> at any time in the next <b>6 months</b>. If you never buy, the owner keeps the $5,000.</p>
<p><mark>That deal is an option.</mark> Drag the slider or the chart to see how it plays out.</p>`,
              predict: {
                q: 'Six months later the house is worth only $250,000. What do you do?',
                choices: ['Buy it for $300,000 as promised', 'Walk away and lose the $5,000', 'Pay the owner the $50,000 difference'],
                a: 1,
                why: 'You bought a <b>right</b>, not an obligation. When the deal is bad you simply do not use it, and your loss stops at the $5,000 you paid.',
              },
              viz: { type: 'house', value: 340 },
            },
            {
              h: 'The four parts of every option',
              body: `<p>Every option has the same four ingredients as the house deal. Only the names change.</p>
<p>The thing you might buy is the [[underlying]]. The locked-in price is the [[strike]]. The deadline is the [[expiration]]. The fee you pay for the right is the [[premium]].</p>
<p>In this course the underlying is a made-up stock called <b>ACME</b>, trading at $100.</p>`,
              viz: { type: 'mapping' },
            },
            {
              h: 'Two kinds of options',
              body: `<p>A [[call]] gives you the right to <b>buy</b> at the strike. It gains value when the price rises.</p>
<p>A [[put]] gives you the right to <b>sell</b> at the strike. It gains value when the price falls.</p>
<p>Memory hook: you <mark>call something up</mark>, and you <mark>put something down</mark>.</p>
<p>These hockey-stick charts are called payoff diagrams. Left to right is the stock price on expiration day. Up and down is your profit or loss.</p>`,
              viz: { type: 'callPut' },
            },
            {
              h: 'Every trade has two sides',
              body: `<p>For every option buyer there is a seller, also called the [[writer]]. The buyer pays the premium and gets the right. The seller collects the premium and takes on the obligation.</p>
<p>One standard [[contract]] covers <b>100 shares</b>. Prices are quoted per share, so a $2.00 premium costs <b>$200</b> for one contract.</p>
<p>We start as the buyer. In Unit 4 you switch sides.</p>`,
              viz: { type: 'twoSides' },
            },
          ],
          quiz: [
            { q: 'Buying an option gives you…', choices: ['The obligation to buy or sell', 'The right, but not the obligation, to buy or sell', 'Ownership of the shares'], a: 1, why: 'The buyer chooses whether to use the option. Only the seller has an obligation.' },
            { q: 'In the house deal, the $5,000 fee plays the role of the…', choices: ['Strike price', 'Premium', 'Expiration date'], a: 1, why: 'The premium is what you pay for the right. The $300,000 locked price is the strike.' },
            { q: 'You expect ACME to fall. Which option gains if you are right?', choices: ['A call', 'A put'], a: 1, why: 'A put is the right to sell at the strike, which gets more valuable as the price drops.' },
            { q: 'An option is quoted at $1.50. What does one contract cost?', choices: ['$1.50', '$15', '$150'], a: 2, why: 'One contract covers 100 shares: $1.50 × 100 = $150.' },
          ],
          takeaways: ['An option is a right, not an obligation, bought for a premium.', 'Calls are the right to buy; puts are the right to sell.', 'One contract covers 100 shares, so multiply the quoted price by 100.'],
        },
        {
          id: 'call-options',
          title: 'Call options',
          hook: 'The right to buy, breakeven, and leverage.',
          mins: 6,
          steps: [
            {
              h: 'Your first call',
              body: `<p>ACME trades at <b>$100</b>. You think it will rise over the next month.</p>
<p>You buy one ACME <b>$105 call</b> that expires in 30 days. The premium is <b>$2.00</b>, so the contract costs <b>$200</b>.</p>
<p>On expiration day the call is worth the stock price minus the strike, if that is positive. Drag the price to see your result.</p>`,
              viz: { type: 'payoff', legs: [C(105, 2)], range: [90, 120], S: 112 },
            },
            {
              h: 'Breakeven: where profit starts',
              body: `<p>Finishing above the strike is not enough. You paid $2.00, so ACME must finish above <b>$105 + $2 = $107</b> just to get your money back.</p>
<p>That price is your [[breakeven]]. <mark>Breakeven for a bought call = strike + premium.</mark> It is marked with a diamond on the chart.</p>`,
              predict: {
                q: 'ACME closes at $106 on expiration day. How did you do?',
                choices: ['Made $100', 'Lost $100', 'Lost the full $200'],
                a: 1,
                why: 'The call is worth $1.00 ($106 − $105), which is $100 per contract. You paid $200, so you are down $100.',
              },
              viz: { type: 'payoff', legs: [C(105, 2)], range: [90, 120], S: 106 },
            },
            {
              h: 'Your worst case is known upfront',
              body: `<p>If ACME finishes anywhere below $105, the call expires worthless and you lose the $200. Never more.</p>
<p>Compare that with buying 100 shares for $10,000, shown as the dashed line. The share owner gains more on a big rally, but a drop to $90 costs them $1,000.</p>
<p><mark>Max loss when you buy an option = the premium.</mark></p>`,
              viz: { type: 'payoff', legs: [C(105, 2)], range: [85, 120], S: 92, compareStock: true, stockFrom: 100 },
            },
            {
              h: 'Leverage cuts both ways',
              body: `<p>Options give you [[leverage]]: a small amount of money controls a big position.</p>
<p>If ACME rises 10% to $110, the call is worth $5.00. You turned $200 into $500, a <b>+150%</b> return while the stock rose 10%. But if ACME rises only 4% to $104, the share owner is up 4% and you lost 100%.</p>`,
              viz: { type: 'leverage', K: 105, premium: 2, S: 110 },
            },
          ],
          quiz: [
            { q: 'You buy a $50 call for $3. What is the breakeven at expiration?', choices: ['$47', '$50', '$53'], a: 2, why: 'Breakeven for a bought call = strike + premium = $50 + $3 = $53.' },
            { q: 'What is the most you can lose buying a call?', choices: ['Unlimited', 'The premium you paid', 'The strike price × 100'], a: 1, why: 'If the call expires worthless you lose what you paid, and nothing more.' },
            { q: 'You bought a $50 call for $3. The stock closes at $60 on expiration day. What is your P&L for one contract?', choices: ['+$700', '+$1,000', '+$300'], a: 0, why: 'The call is worth $10 ($60 − $50). Subtract the $3 premium: $7 × 100 = +$700.' },
          ],
          takeaways: ['A bought call profits when the stock finishes above strike + premium.', 'Your max loss buying a call is the premium.', 'Leverage magnifies gains and losses in percentage terms.'],
        },
        {
          id: 'put-options',
          title: 'Put options',
          hook: 'The right to sell, and why puts work like insurance.',
          mins: 6,
          steps: [
            {
              h: 'A put is insurance',
              body: `<p>Car insurance costs a premium. If the car is wrecked, the insurer pays. If nothing happens, the premium is gone.</p>
<p>A put works the same way for a stock. ACME is at $100. You buy a <b>$95 put</b> for <b>$2.00</b> ($200). However far ACME falls, you can still sell at $95.</p>`,
              viz: { type: 'payoff', legs: [P(95, 2)], range: [75, 110], S: 86 },
            },
            {
              h: 'Breakeven for a put',
              body: `<p>On expiration day a put is worth the strike minus the stock price, if that is positive. You paid $2.00, so you need ACME below <b>$95 − $2 = $93</b> to profit.</p>
<p><mark>Breakeven for a bought put = strike − premium.</mark></p>`,
              predict: {
                q: 'ACME crashes to $80 on expiration day. What is your $95 put worth?',
                choices: ['$0', '$15 a share ($1,500)', '$20 a share ($2,000)'],
                a: 1,
                why: '$95 − $80 = $15 a share, or $1,500 per contract. After the $200 premium you are up $1,300.',
              },
              viz: { type: 'payoff', legs: [P(95, 2)], range: [75, 110], S: 80 },
            },
            {
              h: 'Protecting shares you own',
              body: `<p>The most common use of a put is protection. Own 100 shares bought at $100, add the $95 put, and your losses stop at $95 no matter how far ACME falls.</p>
<p>Watch the pieces combine: the shares (gray) plus the put (orange) make a new shape with a floor. This is a [[protective-put]].</p>`,
              viz: { type: 'payoff', legs: [STOCK, P(95, 2)], range: [75, 120], S: 84, build: true },
            },
            {
              h: 'Call or put? Sort these',
              body: `<p>Practice picking the right tool. For each situation, decide whether a buyer would reach for a call or a put.</p>`,
              viz: { type: 'sorter' },
            },
          ],
          quiz: [
            { q: 'You buy a $40 put for $1.50. What is the breakeven?', choices: ['$38.50', '$40', '$41.50'], a: 0, why: 'Breakeven for a bought put = strike − premium = $40 − $1.50 = $38.50.' },
            { q: 'A put gains value when the stock…', choices: ['Rises', 'Falls', 'Stays exactly flat'], a: 1, why: 'The right to sell at a fixed price is worth more as the market price drops below it.' },
            { q: 'You bought a $40 put for $1.50 and the stock closes at $45. What happens?', choices: ['It expires worthless and you lose $150', 'You gain $350', 'You lose $500'], a: 0, why: 'The right to sell at $40 is worthless when the stock is at $45. You lose the $150 premium.' },
          ],
          takeaways: ['A bought put profits when the stock finishes below strike − premium.', 'Puts can act like insurance on shares you own.', 'Buying a put also risks only the premium.'],
        },
        {
          id: 'reading-a-quote',
          title: 'Reading an option quote',
          hook: 'Contract names, the option chain, and the bid-ask spread.',
          mins: 7,
          steps: [
            {
              h: 'Decode the contract',
              body: `<p>Brokers describe an option in one line. It always contains the same parts: the underlying, the expiration date, the strike and the type.</p>
<p>Tap each part of the order ticket to see what it means.</p>`,
              viz: { type: 'anatomy' },
            },
            {
              h: 'The option chain',
              body: `<p>An [[chain]] lists every strike for one expiration. Calls are on the left, puts on the right, strikes down the middle.</p>
<p>Shaded cells are [[itm]]: they would be worth something if exercised right now. Move ACME's price and watch the shading shift. Tap a row for a plain-English reading.</p>`,
              viz: { type: 'chain', S: 100 },
            },
            {
              h: 'Bid, ask and the hidden cost',
              body: `<p>Every option has two prices. The [[bid]] is the most a buyer will pay. The [[ask]] is the least a seller will accept. You usually buy at the ask and sell at the bid.</p>
<p>The gap between them is the [[bid-ask]], and you pay it every time you trade. Busy options with high [[volume]] and [[open-interest]] have tight spreads.</p>`,
              viz: { type: 'spread' },
            },
            {
              h: 'Choosing an expiration',
              body: `<p>Options come with many expirations: weeklies, monthlies (usually the third Friday) and [[leaps]] that last over a year.</p>
<p>More time costs more, but not in a straight line. Doubling the time does not double the price. <mark>Per day, longer options are cheaper.</mark></p>`,
              viz: { type: 'expiryLadder' },
            },
          ],
          quiz: [
            { q: `In "ACME DEC 18 '26 105 CALL", what is 105?`, choices: ['The premium', 'The strike price', 'The number of contracts'], a: 1, why: 'The number in the middle of a contract name is the strike: the price you can buy at.' },
            { q: 'A call is quoted 2.10 bid / 2.30 ask. You buy one contract at market. You pay…', choices: ['$210', '$220', '$230'], a: 2, why: 'Market buy orders fill at the ask: $2.30 × 100 = $230.' },
            { q: 'Why do traders prefer options with tight bid-ask spreads?', choices: ['Lower hidden cost to get in and out', 'They always make money', 'They never expire'], a: 0, why: 'Each round trip costs roughly the width of the spread. Tight spreads keep more money in your pocket.' },
          ],
          takeaways: ['A contract = underlying + expiration + strike + type.', 'The chain shows all strikes; in-the-money cells are shaded.', 'The bid-ask spread is a real cost, so prefer liquid options.'],
        },
      ],
    },
    {
      n: 2,
      title: 'How options are priced',
      blurb: 'Why an option costs what it costs, and why that price keeps changing.',
      lessons: [
        {
          id: 'moneyness',
          title: 'In, at or out of the money',
          hook: 'Where the stock sits relative to the strike.',
          mins: 5,
          steps: [
            {
              h: 'Is the option worth using right now?',
              body: `<p>Traders sort options by where the stock is compared with the strike.</p>
<p>[[itm]]: exercising now would be worth money. [[atm]]: the stock is at the strike. [[otm]]: exercising now would be worthless.</p>
<p>Drag ACME's price. The same $100 strike flips status for calls and puts.</p>`,
              viz: { type: 'moneyness', S: 106 },
            },
            {
              h: 'Calls and puts are mirror images',
              body: `<p>A call is in the money when the stock is <b>above</b> the strike. A put is in the money when the stock is <b>below</b> the strike.</p>
<p>So at any strike, if the call is in the money, the put is out of the money. In the chain, the shading sits on opposite sides of the price line.</p>`,
              viz: { type: 'chain', S: 104 },
            },
            {
              h: 'Which strike should a buyer pick?',
              body: `<p>Here are three calls on ACME at $100, all expiring in 30 days.</p>
<p><b>In the money ($95)</b> costs the most and moves almost like the stock. <b>At the money ($100)</b> is a balance. <b>Out of the money ($110)</b> is cheap, but needs a big move and usually expires worthless.</p>
<p>Drag the price and compare the dollars and the percentages.</p>`,
              viz: {
                type: 'compare',
                range: [88, 120],
                S: 108,
                alts: [
                  { label: 'ITM $95 call', legs: [C(95, 6.65)] },
                  { label: 'ATM $100 call', legs: [C(100, 3.6)] },
                  { label: 'OTM $110 call', legs: [C(110, 0.65)] },
                ],
              },
            },
          ],
          quiz: [
            { q: 'ACME is at $50. A $45 call is…', choices: ['In the money', 'At the money', 'Out of the money'], a: 0, why: 'A call is in the money when the stock is above the strike: $50 > $45.' },
            { q: 'ACME is at $50. A $45 put is…', choices: ['In the money', 'At the money', 'Out of the money'], a: 2, why: 'A put is in the money only when the stock is below the strike, and $50 is above $45.' },
            { q: 'Why are far out-of-the-money options so cheap?', choices: ['They need a big move to pay off, so they usually expire worthless', 'They carry no risk', 'Brokers discount them'], a: 0, why: 'The price reflects the odds. Low chance of paying off means a low price.' },
          ],
          takeaways: ['In the money = worth something now; out of the money = worth nothing now.', 'Calls are in the money above the strike, puts below it.', 'Cheap out-of-the-money options are cheap because the odds are low.'],
        },
        {
          id: 'intrinsic-and-time-value',
          title: 'Intrinsic value and time value',
          hook: 'The two pieces every premium is made of.',
          mins: 6,
          steps: [
            {
              h: 'A premium has two parts',
              body: `<p>Every premium splits into two pieces.</p>
<p>[[intrinsic]] is what the option would be worth if exercised right now. [[extrinsic]] is everything extra: the price of the chance that things get better before expiration.</p>
<p><mark>Premium = intrinsic value + time value.</mark></p>`,
              viz: { type: 'valueStack', S: 106, days: 30 },
            },
            {
              h: 'Time value peaks at the money',
              body: `<p>In the chart, the curved line is the option's market price. The bent line is its intrinsic value. The shaded gap between them is time value.</p>
<p>Move the price and watch where the gap is widest.</p>`,
              predict: {
                q: 'Where do you think time value is largest?',
                choices: ['Deep in the money', 'At the money', 'Far out of the money'],
                a: 1,
                why: 'At the money the outcome is most uncertain, so the chance part of the price is biggest. Deep in-the-money options are mostly intrinsic value, and far out-of-the-money options have little chance of paying.',
              },
              viz: { type: 'valueStack', S: 100, days: 30 },
            },
            {
              h: 'At expiration, time value is zero',
              body: `<p>Drag the days to expiration down to 0, or press play. The curve sinks onto the bent line.</p>
<p>On the final day an option is worth only its intrinsic value. That is why payoff diagrams at expiration are sharp hockey sticks.</p>`,
              viz: { type: 'valueStack', S: 104, days: 45, focusDays: true },
            },
          ],
          quiz: [
            { q: 'ACME is $105. The $100 call trades at $7. What are its intrinsic and time values?', choices: ['$5 intrinsic, $2 time', '$7 intrinsic, $0 time', '$2 intrinsic, $5 time'], a: 0, why: 'Intrinsic = $105 − $100 = $5. The other $2 of the $7 premium is time value.' },
            { q: `An out-of-the-money option's premium is made of…`, choices: ['Only intrinsic value', 'Only time value', 'Both'], a: 1, why: 'Out-of-the-money options have zero intrinsic value, so their whole price is time value.' },
            { q: 'At expiration, time value equals…', choices: ['Its maximum', 'Zero', 'The strike price'], a: 1, why: 'With no time left there is no chance of improvement left to pay for.' },
          ],
          takeaways: ['Premium = intrinsic value + time value.', 'Time value is largest at the money.', 'At expiration only intrinsic value remains.'],
        },
        {
          id: 'time-decay',
          title: 'Time decay',
          hook: 'Why options melt like ice cubes, faster near the end.',
          mins: 5,
          steps: [
            {
              h: 'Options melt like ice cubes',
              body: `<p>Time value shrinks every day, even if the stock does not move. This is time decay, measured by [[theta]].</p>
<p>Press play to watch an at-the-money ACME $100 call melt from 90 days to expiration.</p>`,
              predict: {
                q: 'An at-the-money option has 90 days left. How do you think its time value melts?',
                choices: ['Steadily, the same amount each day', 'Slowly at first, then faster near the end', 'Fast at first, then slower'],
                a: 1,
                why: 'Time decay accelerates. The last few weeks wipe out time value much faster than the first few.',
              },
              viz: { type: 'theta', curves: ['atm'] },
            },
            {
              h: 'The last 30 days are the steepest',
              body: `<p>The bars along the bottom show how much value is lost each day. They grow taller as expiration gets closer.</p>
<p>An option buyer who holds into the final weeks pays the highest daily rent for time.</p>`,
              viz: { type: 'theta', curves: ['atm'], from: 30 },
            },
            {
              h: 'Where the stock sits matters',
              body: `<p>Compare three calls with the same expiration. The in-the-money call sinks toward its $10 intrinsic value. The out-of-the-money call melts toward zero. The at-the-money call loses the most dollars.</p>
<p><mark>Time decay hurts buyers and pays sellers.</mark> If you buy, buy more time than you think you need.</p>`,
              viz: { type: 'theta', curves: ['itm', 'atm', 'otm'] },
            },
          ],
          quiz: [
            { q: 'For someone who bought an option, theta is usually…', choices: ['Positive: time helps', 'Negative: time hurts', 'Zero'], a: 1, why: 'Each day that passes removes some time value from the option you own.' },
            { q: 'When does an at-the-money option lose time value fastest?', choices: ['Far from expiration', 'In the final weeks', 'Evenly throughout'], a: 1, why: 'Decay accelerates as expiration approaches.' },
            { q: 'Who benefits from time decay?', choices: ['The option buyer', 'The option seller'], a: 1, why: 'The seller collected the premium upfront. As time value melts, the option they owe gets cheaper to buy back.' },
          ],
          takeaways: ['Options lose time value every day (theta).', 'Decay accelerates in the final weeks.', 'Time decay works for sellers and against buyers.'],
        },
        {
          id: 'volatility',
          title: 'Volatility and IV crush',
          hook: 'Bigger swings, pricier options, and the post-earnings trap.',
          mins: 7,
          steps: [
            {
              h: 'Wild stocks have pricier options',
              body: `<p>Imagine two stocks at $100. One barely moves. The other swings 5% a day. Which is more likely to blow past a $110 strike?</p>
<p>The wild one, so its options cost more. [[volatility]] is the size of the swings, and it is a key input to every option price.</p>
<p>Slide the volatility. The hill shows where ACME might be in 30 days. The blue part is the chance a $110 call finishes in the money.</p>`,
              viz: { type: 'vol', iv: 0.3 },
            },
            {
              h: 'Implied volatility',
              body: `<p>Nobody knows future volatility. [[iv]] is the market's estimate, worked backwards from option prices.</p>
<p>A handy rule: the typical move over a period is about <b>price × IV × √(days ÷ 365)</b>. At IV 30%, ACME's typical 30-day move is about ±$8.60. The bracket on the chart shows it.</p>
<p><mark>High IV = expensive options. Low IV = cheap options.</mark></p>`,
              viz: { type: 'vol', iv: 0.3, showMove: true },
            },
            {
              h: 'IV crush: right direction, still lose',
              body: `<p>Before earnings, uncertainty is high, so IV inflates. Once the news is out, IV collapses. This is [[iv-crush]].</p>
<p>Here you buy an ACME $100 call with 7 days left at IV 80%. Earnings come out, ACME rises, and IV drops to 30%. Move the earnings reaction to find how big a jump you actually needed.</p>`,
              viz: { type: 'ivCrush' },
            },
          ],
          quiz: [
            { q: 'If implied volatility rises, option premiums usually…', choices: ['Fall', 'Rise', 'Stay the same'], a: 1, why: 'More expected movement means a better chance of a big payoff, so options cost more.' },
            { q: 'A $200 stock has IV of 40%. Roughly what is its typical one-year move?', choices: ['±$8', '±$40', '±$80'], a: 2, why: '$200 × 40% × √1 = $80. About two times in three, the stock ends within that range.' },
            { q: 'You bought calls just before earnings. The stock rose slightly but your calls lost value. The likely cause?', choices: ['IV crush', 'A dividend', 'The bid-ask spread'], a: 0, why: 'The drop in implied volatility after the event outweighed the small gain from the price move.' },
          ],
          takeaways: ['Higher volatility means higher option prices.', "Implied volatility is the market's forecast of future movement.", 'IV often collapses after big events like earnings.'],
        },
      ],
    },
    {
      n: 3,
      title: 'The Greeks',
      blurb: 'Five numbers that tell you how an option will react.',
      lessons: [
        {
          id: 'delta',
          title: 'Delta',
          hook: 'How fast an option moves with the stock.',
          mins: 6,
          steps: [
            {
              h: "Delta is the option's speed",
              body: `<p>[[delta]] tells you how much the option's price changes when the stock moves $1.</p>
<p>The curve is the option's price today across different stock prices. The dashed line touches the curve at ACME's price, and its slope is delta. Drag the price and watch the slope change.</p>`,
              viz: { type: 'delta', S: 100 },
            },
            {
              h: 'Delta as rough odds',
              body: `<p>Delta also works as a quick estimate of the chance the option finishes in the money. A 0.30 delta call has roughly a 30% chance.</p>
<p>Deep in-the-money options have delta near 1 and move almost dollar for dollar with the stock. Far out-of-the-money options have delta near 0.</p>`,
              viz: { type: 'delta', S: 108, showProb: true },
            },
            {
              h: 'Delta in shares',
              body: `<p>Multiply delta by 100 to see how many shares one contract acts like. A 0.62 delta call moves like 62 shares.</p>
<p>Puts have <b>negative</b> delta. They gain when the stock falls, like being short shares.</p>`,
              viz: { type: 'deltaShares' },
            },
          ],
          quiz: [
            { q: "A call has delta 0.40. ACME rises $2. The option's price changes by about…", choices: ['+$0.40', '+$0.80', '+$2.00'], a: 1, why: '0.40 × $2 = $0.80 a share, or $80 a contract.' },
            { q: 'The delta of a bought put is between…', choices: ['0 and 1', '−1 and 0', '1 and 2'], a: 1, why: 'Puts gain when the stock falls, so their delta is negative.' },
            { q: 'Holding 3 calls with delta 0.50 is like holding about how many shares?', choices: ['50', '150', '300'], a: 1, why: '0.50 × 100 shares × 3 contracts = 150 shares.' },
          ],
          takeaways: ['Delta = option price change per $1 stock move.', 'Delta roughly equals the odds of finishing in the money.', 'Calls have positive delta; puts have negative delta.'],
        },
        {
          id: 'gamma',
          title: 'Gamma',
          hook: "Delta's accelerator, and why expiration week is wild.",
          mins: 6,
          steps: [
            {
              h: "Delta doesn't stay put",
              body: `<p>As ACME rises, a call's delta grows. As ACME falls, it shrinks. [[gamma]] measures how fast delta changes per $1 move.</p>
<p>The top chart is delta across stock prices. The bottom chart is gamma. Gamma peaks where delta changes fastest: near the strike.</p>`,
              viz: { type: 'gamma', days: 30 },
            },
            {
              h: 'Gamma spikes near expiration',
              body: `<p>Press play to run the clock from 90 days down to 1. The delta curve sharpens into a cliff and gamma shoots up.</p>
<p>Near expiration, at-the-money options can swing from worthless to valuable within hours.</p>`,
              predict: {
                q: 'As expiration approaches, what happens to gamma for an at-the-money option?',
                choices: ['It shrinks toward zero', 'It gets much larger', 'It stays the same'],
                a: 1,
                why: 'With little time left, a small move decides whether the option ends up worth something or nothing. Delta swings fast, so gamma soars.',
              },
              viz: { type: 'gamma', days: 90, autoplay: true },
            },
            {
              h: 'Gamma helps buyers, hurts sellers',
              body: `<p>When you own options, gamma works for you. Delta grows as the stock moves your way and shrinks as it moves against you. That is why the curve bends above the dashed tangent line.</p>
<p>When you sell options, gamma works against you: losses speed up as the stock moves the wrong way.</p>`,
              viz: { type: 'delta', S: 100, days: 10, gammaNote: true },
            },
          ],
          quiz: [
            { q: 'Gamma measures…', choices: ['How fast delta changes as the stock moves', 'Daily time decay', 'Sensitivity to interest rates'], a: 0, why: 'Gamma is the rate of change of delta for each $1 move.' },
            { q: 'Where is gamma highest?', choices: ['Deep in the money, far from expiration', 'At the money, close to expiration', 'Far out of the money, far from expiration'], a: 1, why: 'Near expiration, small moves around the strike decide everything, so delta changes fastest there.' },
            { q: 'If you sold options, your gamma is…', choices: ['Positive', 'Negative'], a: 1, why: 'The seller holds the opposite position, so the Greeks flip sign. Negative gamma means losses accelerate on big moves.' },
          ],
          takeaways: ['Gamma is the rate at which delta changes.', 'Gamma is highest at the money near expiration.', 'Bought options have positive gamma; sold options negative.'],
        },
        {
          id: 'greeks-dashboard',
          title: 'All the Greeks together',
          hook: 'Delta, gamma, theta, vega and rho on one dashboard.',
          mins: 7,
          steps: [
            {
              h: 'Five numbers, one option',
              body: `<p>Each of the [[greeks]] answers a "what if" question:</p>
<ul class="greek-list"><li><b>Δ Delta</b>: what if the stock moves $1?</li><li><b>Γ Gamma</b>: how fast does delta change?</li><li><b>Θ Theta</b>: what does one day cost?</li><li><b>ν Vega</b>: what if IV moves 1 point?</li><li><b>ρ Rho</b>: what if interest rates move 1 point?</li></ul>
<p>Change any input and read the plain-English translation.</p>`,
              viz: { type: 'greeks' },
            },
            {
              h: 'Test the predictions',
              body: `<p>The Greeks are estimates. Use the buttons to nudge the stock, the clock or IV, and compare what the Greeks predicted with the actual new price.</p>
<p>For small changes they are very close. For big moves, gamma makes delta's estimate drift.</p>`,
              viz: { type: 'greeks', whatIf: true },
            },
            {
              h: 'Cheat sheet: who the Greeks help',
              body: `<p>Whether a Greek helps or hurts depends on whether you bought or sold.</p>
<p>A quick rule: <mark>buyers have positive gamma and vega, and pay theta. Sellers are the reverse.</mark></p>`,
              viz: { type: 'greekTable' },
            },
          ],
          quiz: [
            { q: 'An option has vega 0.15. If IV rises by 1 point, the option…', choices: ['Gains about $0.15 a share', 'Loses about $0.15 a share', 'Gains $15 a share'], a: 0, why: 'Vega is the price change per 1 point of implied volatility.' },
            { q: 'An option shows theta −0.05. Roughly how much does one contract lose per day from time?', choices: ['$0.05', '$5', '$50'], a: 1, why: 'Theta is per share: −$0.05 × 100 = −$5 per day.' },
            { q: 'Which Greek usually matters least for short-term options?', choices: ['Delta', 'Rho', 'Theta'], a: 1, why: 'Interest rates barely move over a few weeks, and the effect on short-dated options is small.' },
          ],
          takeaways: ['Each Greek isolates one source of price change.', 'Greeks are estimates, accurate for small moves.', 'Buyers: + gamma, + vega, − theta. Sellers: the reverse.'],
        },
      ],
    },
    {
      n: 4,
      title: 'Selling and strategies',
      blurb: "Switch to the seller's side, then combine options into strategies.",
      lessons: [
        {
          id: 'selling-options',
          title: "The seller's side",
          hook: 'Collecting premium, and the risks that come with it.',
          mins: 7,
          steps: [
            {
              h: 'Mirror image',
              body: `<p>Every option trade has a buyer and a seller. Whatever the buyer makes, the seller loses, and the other way around.</p>
<p>Press flip to turn the call buyer's payoff into the seller's. The seller keeps the premium when the option expires worthless, but takes the loss when it pays off.</p>`,
              viz: { type: 'mirror' },
            },
            {
              h: 'Selling a put: get paid to wait',
              body: `<p>Say you would happily buy ACME at $95. Instead of waiting, you <b>sell</b> a $95 put for $1.35 and collect $135.</p>
<p>If ACME stays above $95, you keep the $135. If it falls below, you buy 100 shares at $95, which you wanted anyway, at an effective $93.65.</p>
<p>The gray hill shows where ACME is likely to end up, based on IV of 30%.</p>`,
              viz: { type: 'payoff', legs: [P(95, 1.35, -1)], range: [80, 112], S: 100, prob: true, iv: 0.3, days: 30 },
            },
            {
              h: 'Why naked calls are dangerous',
              body: `<p>Selling a call without owning the shares is called a [[naked]] call. Your profit is capped at the premium, but a stock can rise without limit.</p>`,
              predict: {
                q: 'You sold a naked $105 call for $1.65. ACME jumps to $150 on a buyout. What is your loss?',
                choices: ['$165', 'About $4,335', 'Nothing, the call expires'],
                a: 1,
                why: 'The call is worth $45 ($150 − $105), so you owe $4,500, minus the $165 you collected: −$4,335. A bigger jump would cost even more.',
              },
              viz: { type: 'payoff', legs: [C(105, 1.65, -1)], range: [90, 160], S: 150 },
            },
            {
              h: 'Win often, or win big?',
              body: `<p>Sellers win small amounts often. Buyers win big amounts rarely. Neither is automatically better.</p>
<p>Here is a bought $105 call with the likely-price hill underneath. Its [[pop]] is low, but the payoff when it works is large. The seller of this call has the reverse: high odds, small wins, rare big losses.</p>`,
              viz: { type: 'payoff', legs: [C(105, 1.65)], range: [85, 120], S: 110, prob: true, iv: 0.3, days: 30 },
            },
          ],
          quiz: [
            { q: 'The seller of a put must…', choices: ['Buy shares at the strike if assigned', 'Sell shares at the strike if assigned', 'Nothing; sellers have no obligation'], a: 0, why: 'The put buyer has the right to sell, so the seller must be ready to buy.' },
            { q: 'What is the most an option seller can earn?', choices: ['Unlimited', 'The premium received', 'The strike price'], a: 1, why: 'The best case for a seller is that the option expires worthless and they keep the premium.' },
            { q: 'Which position has theoretically unlimited risk?', choices: ['Bought call', 'Naked sold call', 'Bought put'], a: 1, why: 'A stock has no upper limit, so the loss on a naked call has none either.' },
          ],
          takeaways: ['Sellers collect premium and take on obligations.', 'A cash-secured sold put = getting paid to wait for a lower price.', 'Naked sold calls have unlimited risk.'],
        },
        {
          id: 'exercise-and-assignment',
          title: 'Exercise, assignment and expiration',
          hook: 'The three ways a trade ends, and expiration-day surprises.',
          mins: 6,
          steps: [
            {
              h: 'Three ways out',
              body: `<p>Once you own an option, there are three ways the trade ends.</p>
<p>Most traders <b>sell to close</b> before expiration. That captures any remaining time value and needs no extra cash. Exercising and letting it expire are the other two.</p>`,
              viz: { type: 'exits' },
            },
            {
              h: 'Expiration day autopilot',
              body: `<p>At the close on expiration day, brokers automatically [[exercise]] options that are in the money by $0.01 or more. Sellers of those options receive [[assignment]].</p>
<p>This can surprise beginners: an in-the-money call can turn into a $10,000 share purchase overnight. Pick a position and drag the closing price.</p>`,
              viz: { type: 'expiryDay' },
            },
            {
              h: 'Exercising early rarely pays',
              body: `<p>US stock options are [[american]]: you can exercise on any trading day. Index options like SPX are [[european]]: exercise happens only at expiration, settled in cash.</p>
<p>Exercising early throws away time value, so selling the option almost always gets you more. Slide the days left and compare.</p>`,
              viz: { type: 'earlyExercise' },
            },
          ],
          quiz: [
            { q: 'How do most option traders exit their positions?', choices: ['Exercise them', 'Sell to close before expiration', 'Wait to be assigned'], a: 1, why: 'Selling captures the full market value, including time value, without needing cash for shares.' },
            { q: 'You hold a $100 call. ACME closes at $100.50 on expiration day. Most brokers will…', choices: ['Let it expire', 'Auto-exercise it', 'Cancel the contract'], a: 1, why: 'It is in the money by $0.50, above the usual $0.01 threshold, so it is exercised unless you instruct otherwise.' },
            { q: 'Exercising an option early usually…', choices: ['Throws away remaining time value', 'Earns extra interest', 'Is required by the exchange'], a: 0, why: 'Exercise pays only intrinsic value. Selling pays intrinsic plus time value.' },
          ],
          takeaways: ['Selling to close is the most common exit.', 'In-the-money options are auto-exercised at expiration.', 'Early exercise forfeits time value; selling is usually better.'],
        },
        {
          id: 'income-strategies',
          title: 'Covered calls and cash-secured puts',
          hook: 'Two ways to collect premium, and how they form the wheel.',
          mins: 6,
          steps: [
            {
              h: 'Covered call',
              body: `<p>You own 100 ACME shares bought at $100. You sell a $105 call for $1.65 and collect $165. This is a [[covered-call]].</p>
<p>If ACME stays below $105, you keep the shares and the $165. If it rises above $105, your shares are sold at $105. <mark>You trade away upside above the strike for income now.</mark></p>`,
              viz: { type: 'payoff', legs: [STOCK, C(105, 1.65, -1)], range: [85, 120], S: 108, build: true },
            },
            {
              h: 'Cash-secured put',
              body: `<p>You would like to own ACME, but at a lower price. You sell a $95 put for $1.35 and set aside $9,500 in case you are assigned. This is a [[csp]].</p>
<p>Either you keep the $135, or you buy ACME at $95 and your real cost is <b>$93.65</b> a share.</p>`,
              viz: { type: 'payoff', legs: [P(95, 1.35, -1)], range: [80, 112], S: 92 },
            },
            {
              h: 'The wheel',
              body: `<p>Chain the two together and you get a cycle traders call [[wheel]]. Sell puts until you are assigned shares, then sell calls on those shares until they are called away. Repeat.</p>
<p>It collects premium at every step, but it does not remove the risk of owning a stock that keeps falling.</p>`,
              viz: { type: 'wheel' },
            },
          ],
          quiz: [
            { q: 'A covered call limits your…', choices: ['Downside', 'Upside', 'Dividends'], a: 1, why: 'Above the strike your shares are called away, so you miss further gains.' },
            { q: 'You own shares at $100 and sell a $105 call for $2. What is the max profit per share?', choices: ['$2', '$5', '$7'], a: 2, why: '$5 from the stock rising to the strike, plus the $2 premium = $7.' },
            { q: 'You sell a $50 put for $1.50 and get assigned. Your effective cost per share is…', choices: ['$48.50', '$50', '$51.50'], a: 0, why: 'You pay $50 for the shares but already collected $1.50: $50 − $1.50 = $48.50.' },
          ],
          takeaways: ['Covered calls trade upside for income.', 'Cash-secured puts pay you to wait for a lower entry.', 'Neither strategy protects you from a big drop in the stock.'],
        },
        {
          id: 'protection',
          title: 'Protective puts and collars',
          hook: 'Insurance for shares, and how to pay for it.',
          mins: 5,
          steps: [
            {
              h: 'Protective put',
              body: `<p>Own ACME at $100 and buy a $95 put for $1.35. Below $95, the put gains what the shares lose.</p>
<p>Your worst case is now known: <b>−$635</b>, which is the $5 drop to $95 plus the $1.35 premium. The cost is a slightly higher breakeven of $101.35.</p>`,
              viz: { type: 'payoff', legs: [STOCK, P(95, 1.35)], range: [80, 120], S: 85, build: true },
            },
            {
              h: 'Collar: protection paid for by upside',
              body: `<p>Puts cost money. To pay for one, sell a call above the price. Own ACME at $100, buy the $95 put for $1.35 and sell the $105 call for $1.65.</p>
<p>You actually collect $0.30 net. Your result is now boxed in between <b>−$470</b> and <b>+$530</b>. This is a [[collar]].</p>`,
              viz: { type: 'payoff', legs: [STOCK, P(95, 1.35), C(105, 1.65, -1)], range: [85, 115], S: 102, build: true },
            },
            {
              h: 'Insurance has a price',
              body: `<p>Protection is not free. Buying a one-month $95 put every month costs about 1.35% of the position each time, and that adds up over a year.</p>
<p>Many investors buy protection only around events they fear, or use collars to offset the cost. Compare the three shapes below.</p>`,
              viz: {
                type: 'compare',
                range: [80, 120],
                S: 90,
                alts: [
                  { label: 'Shares only', legs: [STOCK] },
                  { label: 'Shares + $95 put', legs: [STOCK, P(95, 1.35)] },
                  { label: 'Collar', legs: [STOCK, P(95, 1.35), C(105, 1.65, -1)] },
                ],
              },
            },
          ],
          quiz: [
            { q: 'A protective put puts a…', choices: ['Ceiling on your profit', 'Floor under your losses', 'Fixed dividend on your shares'], a: 1, why: 'Below the put strike, the put gains what the shares lose.' },
            { q: 'Why do investors use a collar instead of only buying a put?', choices: ['The call premium helps pay for the put', 'It has unlimited upside', 'It requires no shares'], a: 0, why: 'Selling the call brings in money that offsets the cost of the put, at the price of capped upside.' },
          ],
          takeaways: ['A protective put sets a floor under your shares.', 'A collar caps upside to pay for that floor.', 'Protection costs money, so use it deliberately.'],
        },
        {
          id: 'vertical-spreads',
          title: 'Vertical spreads',
          hook: 'Defined risk by pairing a bought and a sold option.',
          mins: 7,
          steps: [
            {
              h: 'Bull call spread',
              body: `<p>Buying a call outright can be expensive. A [[vertical]] cuts the cost by selling a higher-strike call against it.</p>
<p>Buy the $100 call for $3.60 and sell the $110 call for $0.65. Net cost: <b>$2.95</b>. Max profit: <b>$7.05</b> if ACME ends above $110. Max loss: the $2.95 you paid.</p>`,
              viz: { type: 'payoff', legs: [C(100, 3.6), C(110, 0.65, -1)], range: [90, 118], S: 106, build: true },
            },
            {
              h: 'Bear put spread',
              body: `<p>The same idea for a drop. Buy the $100 put for $3.25 and sell the $90 put for $0.40. Net cost: <b>$2.85</b>. Max profit: <b>$7.15</b> if ACME ends below $90.</p>`,
              viz: { type: 'payoff', legs: [P(100, 3.25), P(90, 0.4, -1)], range: [82, 110], S: 94, build: true },
            },
            {
              h: 'Credit spreads: get paid upfront',
              body: `<p>Flip it around and you <b>collect</b> money instead. Sell the $95 put for $1.35 and buy the $90 put for $0.40. You receive <b>$0.95</b> now.</p>
<p>If ACME stays above $95, you keep it all. The bought put caps your worst case at <b>$4.05</b>. This is a bull put [[credit-spread]].</p>`,
              viz: { type: 'payoff', legs: [P(95, 1.35, -1), P(90, 0.4)], range: [84, 108], S: 100, prob: true, iv: 0.3, days: 30 },
            },
          ],
          quiz: [
            { q: 'Bull call spread: buy the $50 call for $3, sell the $55 call for $1. What is the max profit per share?', choices: ['$2', '$3', '$5'], a: 1, why: 'The spread is $5 wide and cost $2 net: $5 − $2 = $3.' },
            { q: 'What is the main benefit of a spread over a single option?', choices: ['Lower cost and defined risk', 'Unlimited profit', 'No time decay'], a: 0, why: 'The sold option pays for part of the bought one and caps the outcome on both sides.' },
            { q: 'A credit spread earns its max profit when…', choices: ['Both options expire worthless', 'The stock moves a lot', 'IV rises'], a: 0, why: 'If both expire worthless you keep the full credit.' },
          ],
          takeaways: ['Spreads pair a bought and a sold option at different strikes.', 'They lower cost and cap both risk and reward.', 'Debit spreads pay to play; credit spreads get paid to wait.'],
        },
        {
          id: 'volatility-strategies',
          title: 'Straddles, strangles and condors',
          hook: 'Betting on a big move, or on calm.',
          mins: 8,
          steps: [
            {
              h: 'Long straddle: big move, either way',
              body: `<p>Earnings are coming and you expect a big move, but you do not know which way. Buy both the $100 call ($3.60) and the $100 put ($3.25). Total cost: <b>$6.85</b>.</p>
<p>You profit if ACME ends below $93.15 or above $106.85. This is a [[straddle]].</p>`,
              viz: { type: 'payoff', legs: [C(100, 3.6), P(100, 3.25)], range: [82, 118], S: 110, build: true },
            },
            {
              h: 'Long strangle: cheaper, needs more',
              body: `<p>Buy out-of-the-money options instead: the $105 call ($1.65) and the $95 put ($1.35). The cost drops to <b>$3.00</b>, but ACME must end below $92 or above $108. This is a [[strangle]].</p>`,
              viz: { type: 'payoff', legs: [C(105, 1.65), P(95, 1.35)], range: [82, 118], S: 100, build: true },
            },
            {
              h: 'Iron condor: betting on calm',
              body: `<p>Think ACME will stay in a range? Sell a put spread and a call spread at once: sell the $95 put, buy the $90 put, sell the $105 call, buy the $110 call. You collect <b>$1.95</b>.</p>
<p>If ACME ends between $95 and $105 you keep it all. Your max loss is capped at <b>$3.05</b>. This is an [[iron-condor]].</p>`,
              viz: { type: 'payoff', legs: [P(95, 1.35, -1), P(90, 0.4), C(105, 1.65, -1), C(110, 0.65)], range: [84, 116], S: 100, build: true, prob: true, iv: 0.3, days: 30 },
            },
            {
              h: 'Butterfly: pin the target',
              body: `<p>A [[butterfly]] bets the stock ends near one price. Buy the $95 call, sell two $100 calls and buy the $105 call. Net cost: <b>$1.10</b>.</p>
<p>Best case: ACME closes exactly at $100 for a <b>$3.90</b> profit. It is cheap, but the target is narrow.</p>`,
              viz: { type: 'payoff', legs: [C(95, 6.65), C(100, 3.6, -1, 2), C(105, 1.65)], range: [88, 112], S: 100, build: true },
            },
          ],
          quiz: [
            { q: 'A long straddle profits when…', choices: ['The stock barely moves', 'The stock makes a big move in either direction', 'IV collapses'], a: 1, why: 'One side pays off on a big move. Calm markets and IV crush both hurt it.' },
            { q: 'Compared with a straddle, a strangle is…', choices: ['Cheaper but needs a bigger move', 'More expensive with a wider profit zone', 'Identical'], a: 0, why: 'Out-of-the-money options cost less, so the stock has to travel farther to pay off.' },
            { q: 'An iron condor makes its max profit when the stock…', choices: ['Ends between the two sold strikes', 'Crashes', 'Rockets higher'], a: 0, why: 'Between the sold strikes, all four options expire worthless and you keep the credit.' },
          ],
          takeaways: ['Straddles and strangles profit from big moves.', 'Iron condors and butterflies profit from calm.', 'These strategies are really bets on volatility.'],
        },
      ],
    },
    {
      n: 5,
      title: 'Managing risk',
      blurb: 'Habits that keep a beginner in the game.',
      lessons: [
        {
          id: 'risk-management',
          title: 'Staying in the game',
          hook: 'Position sizing, common mistakes, and planning a trade.',
          mins: 7,
          steps: [
            {
              h: 'Size small to survive',
              body: `<p>Even a strategy with an edge goes through losing streaks. How much you risk per trade decides whether you survive them.</p>
<p>Each line below is one possible run of 40 trades that win 40% of the time and earn twice the amount risked when they win. Same edge, different sizing. Slide the risk per trade, then run it again.</p>`,
              viz: { type: 'sizing' },
            },
            {
              h: 'Six beginner mistakes',
              body: `<p>Most early losses come from a handful of habits. Tap each card to see the fix.</p>`,
              viz: { type: 'mistakes' },
            },
            {
              h: 'Match the strategy to the view',
              body: `<p>Before any trade, answer three questions: which direction, how big a move, and how fast?</p>
<p>Then check implied volatility. When options are expensive, selling strategies look more attractive. When they are cheap, buying does. Pick a view to see the textbook matches.</p>`,
              viz: { type: 'planner' },
            },
          ],
          quiz: [
            { q: 'Why does sizing matter even with a winning strategy?', choices: ['Losing streaks can wipe out an oversized account before the edge plays out', 'Larger trades have better odds', 'Brokers charge less for big trades'], a: 0, why: 'A string of losses at a large size can shrink the account so far that later wins cannot recover it.' },
            { q: 'Buying far out-of-the-money options because they are cheap is risky because…', choices: ['They usually expire worthless', 'They have unlimited risk', 'They cannot be sold'], a: 0, why: 'Their low price reflects low odds of paying off.' },
            { q: 'Before entering a trade you should know…', choices: ['Your max loss and your exit plan', 'Only the ticker', 'Nothing; react as it moves'], a: 0, why: 'Deciding the exit in advance keeps emotions from making the decision later.' },
          ],
          takeaways: ['Risk a small, fixed slice of your account per trade.', 'Know your max loss, breakeven and exit plan before entering.', 'Match the strategy to your view on direction, size, timing and IV.'],
        },
      ],
    },
  ];

  SS.registerCourse({
    id: 'options',
    order: 4,
    title: 'Options Trading',
    short: 'Options',
    blurb: 'Calls and puts, how options are priced, the Greeks, selling and multi-leg strategies, and managing risk.',
    units: SS.UNITS,
  });
})();
