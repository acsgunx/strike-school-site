/* Fundamentals, Unit 2 — The math of investing. */
(function () {
  'use strict';
  const SS = window.SS;

  SS.addTerms(
    [
      { id: 'simple-interest', term: 'Simple interest', w: 'simple interest', def: 'Interest paid only on the original amount. It adds the same number of dollars every year.' },
      { id: 'compound-interest', term: 'Compounding', w: 'compounding', def: 'Earning returns on your past returns as well as on your original money, so growth speeds up over time.', ex: '$10,000 at 7% grows to about $76,000 in 30 years with compounding, versus $31,000 with simple interest.' },
      { id: 'rule-of-72', term: 'Rule of 72', w: 'rule of 72', def: 'A shortcut: 72 divided by a yearly growth rate gives roughly the number of years to double.', ex: 'At 8% a year, money doubles in about 72 ÷ 8 = 9 years.' },
      { id: 'inflation', term: 'Inflation', w: 'inflation', def: 'The general rise in prices over time, which means each dollar buys a little less every year.' },
      { id: 'purchasing-power', term: 'Purchasing power', w: 'purchasing power', def: 'How much a sum of money can actually buy. Inflation erodes it.' },
      { id: 'nominal-return', term: 'Nominal return', w: 'nominal return', def: 'The return you see in dollars, before adjusting for inflation.' },
      { id: 'real-return', term: 'Real return', w: 'real return', def: 'The return after inflation: how much more you can actually buy. Roughly the nominal return minus the inflation rate.' },
      { id: 'std-dev', term: 'Standard deviation', w: 'standard deviation', def: 'A measure of how widely returns spread around their average. About two years in three land within one standard deviation of the average.' },
      { id: 'volatility-drag', term: 'Volatility drag', w: 'volatility drag', def: 'The way big swings lower long-run compound growth. A 50% loss needs a 100% gain to recover, so a bumpy path ends lower than a smooth one with the same average.' },
      { id: 'time-horizon', term: 'Time horizon', w: 'time horizon', def: 'How long you plan to keep money invested before you need to spend it.' },
      { id: 'expense-ratio', term: 'Expense ratio', w: 'expense ratio', def: 'The yearly fee a fund charges, as a percentage of the money you have in it. It is taken out automatically.', ex: 'A 0.5% expense ratio on $20,000 costs about $100 a year.' },
      { id: 'capital-gains-tax', term: 'Capital gains tax', w: 'capital gains tax', def: 'Tax on the profit when you sell an investment for more than you paid. Many countries, including the US, tax gains on investments held for over a year at lower rates.' },
      { id: 'tax-advantaged', term: 'Tax-advantaged account', w: 'tax-advantaged accounts', def: 'An account where investments grow with taxes deferred or avoided, such as a 401(k) or IRA in the US or an ISA in the UK. Rules differ by country.' },
      { id: 'employer-match', term: 'Employer match', w: 'employer match', def: 'Money an employer adds to your retirement account when you contribute, such as 50 cents for every dollar up to a limit.' },
    ],
    'fundamentals'
  );

  SS.FUND_UNITS.push({
    n: 2,
    title: 'The math of investing',
    blurb: 'Compounding, inflation, risk and costs: the four forces that decide what you end up with.',
    lessons: [
      {
        id: 'compounding',
        title: 'Compounding',
        hook: 'Why time is the most powerful thing you can give your money.',
        mins: 8,
        steps: [
          {
            h: 'Interest on your interest',
            body: `<p>With [[simple-interest]], $10,000 at 7% earns $700 every year, forever. With [[compound-interest]], each year's growth is added to the pile, and next year you earn 7% on the bigger pile.</p>
<p>At first the difference is tiny. Then it explodes, because the growth itself starts growing. Watch the snowball.</p>`,
            predict: {
              q: '$10,000 grows at 7% a year, compounding, for 30 years. Roughly what do you end with?',
              choices: ['About $31,000', 'About $76,000', 'About $210,000'],
              a: 1,
              why: '$10,000 × 1.07³⁰ ≈ $76,100. Simple interest would give only $31,000: the original $10,000 plus 30 × $700.',
            },
            viz: { type: 'compound' },
          },
          {
            h: 'The rule of 72',
            body: `<p>Here is a handy shortcut. Divide 72 by the yearly growth rate to get roughly how many years it takes to double: the [[rule-of-72]].</p>
<p>At 8%, money doubles in about 9 years. Over 36 years that is four doublings: $1,000 becomes $16,000. At 4%, it doubles only twice in the same time.</p>
<p><mark>A few extra percentage points, compounded, make an enormous difference.</mark></p>`,
            viz: { type: 'rule72' },
          },
          {
            h: 'Start early, or start big?',
            body: `<p>Ava invests $5,000 a year from age 25 to 35, then stops: $50,000 in total. Ben waits, then invests $5,000 a year from 35 to 65: $150,000 in total. Both earn 7% a year.</p>
<p>At 65, Ava has more, despite putting in a third as much. Her money had ten extra years to compound.</p>`,
            viz: { type: 'startEarly' },
          },
          {
            h: 'Small amounts, every month',
            body: `<p>You do not need a fortune to start. $200 a month at 7% for 40 years adds up to about <b>$525,000</b>. You put in $96,000; the other $429,000 is growth.</p>
<p>Play with the amount and the years. Notice how much of the final value arrives in the last decade.</p>`,
            viz: { type: 'contrib' },
          },
        ],
        quiz: [
          { q: 'Using the rule of 72, money growing at 6% a year doubles in about…', choices: ['6 years', '12 years', '18 years'], a: 1, why: '72 ÷ 6 = 12 years.' },
          { q: 'Why did Ava, who started early, end up with more than Ben?', choices: ['Her money had more years to compound', 'She picked better stocks', 'She paid lower fees'], a: 0, why: 'They earned the same 7%. Time was the only difference.' },
          { q: '$1,000 grows 10% a year. After two years it is worth…', choices: ['$1,200', '$1,210', '$1,100'], a: 1, why: 'Year one: $1,100. Year two: 10% of $1,100 = $110 more, so $1,210.' },
          { q: 'For a long-term investor, most of the final value usually comes from…', choices: ['The money you put in', 'Growth on top of growth in the later years', 'Dividends in the first year'], a: 1, why: 'Compounding is back-loaded. The biggest dollar gains come at the end, when the pile is largest.' },
        ],
        takeaways: ['Compounding means earning returns on your returns, so growth accelerates.', 'Rule of 72: 72 ÷ rate ≈ years to double.', 'Starting early beats starting big, because time does the heavy lifting.'],
      },
      {
        id: 'inflation',
        title: 'Inflation and real returns',
        hook: 'Why cash quietly loses value, and what a return really buys you.',
        mins: 6,
        steps: [
          {
            h: 'Prices creep up',
            body: `<p>[[inflation]] is the general rise in prices. A basket of groceries that costs $100 today costs more next year, and much more in 30 years.</p>
<p>The flip side is that cash loses [[purchasing-power]]. At 3% inflation, prices double in about 24 years, by the rule of 72.</p>`,
            predict: {
              q: 'Inflation averages 3% a year. After 30 years, $100 kept in a drawer buys about as much as…',
              choices: ['$97 does today', '$41 does today', '$10 does today'],
              a: 1,
              why: '$100 ÷ 1.03³⁰ ≈ $41. The bill still says $100, but it buys less than half as much.',
            },
            viz: { type: 'inflation' },
          },
          {
            h: 'Real return = return minus inflation',
            body: `<p>The [[nominal-return]] is what your statement shows. The [[real-return]] is what you can actually buy with it: roughly the nominal return minus inflation.</p>
<p>A savings account paying 1.5% while inflation runs at 3% is quietly losing about 1.5% a year. Slide inflation and watch what each option really earns.</p>`,
            viz: { type: 'realReturn' },
          },
          {
            h: 'Who wins and who loses',
            body: `<p>Inflation does not hit every investment the same way. Fixed payments lose value; businesses that can raise prices can keep up.</p>
<p>Tap each card to see how inflation treats it.</p>`,
            viz: {
              type: 'flipCards',
              front: 'Inflation rises',
              back: 'What happens',
              items: [
                ['Cash and savings', 'Interest is often below inflation.', 'Purchasing power shrinks year after year. Fine for an emergency fund, but a slow leak for long-term money.'],
                ['Fixed-rate bonds', 'You get the same $40 a year no matter what.', 'Each payment buys less, and bond prices fall as interest rates rise to fight inflation. Long bonds are hit hardest.'],
                ['Stocks', 'Companies can raise their prices.', 'Over long periods, profits and share prices have tended to outpace inflation, though stocks can stumble when inflation surprises.'],
                ['Real estate', 'Rents and property values tend to rise with prices.', 'Often a partial hedge, but high interest rates can weigh on property values.'],
                ['Inflation-protected bonds', 'Payments are linked to an inflation index.', 'Government bonds such as US TIPS adjust their principal with inflation, protecting purchasing power.'],
                ['Your salary', 'Raises may or may not keep up.', 'This is why investing matters: savings need to grow faster than prices to fund future goals.'],
              ],
            },
          },
        ],
        quiz: [
          { q: 'Your savings earn 2% while inflation is 3%. Your real return is about…', choices: ['+5%', '−1%', '+2%'], a: 1, why: 'Real return ≈ 2% − 3% = −1%. You can buy less each year.' },
          { q: 'At 4% inflation, prices double in about…', choices: ['18 years', '4 years', '40 years'], a: 0, why: 'Rule of 72: 72 ÷ 4 = 18 years.' },
          { q: 'Which is most exposed to unexpected inflation?', choices: ['A long-term fixed-rate bond', 'Shares of a company that can raise prices', 'An inflation-protected government bond'], a: 0, why: 'Its payments never change, and its price falls as interest rates rise.' },
        ],
        takeaways: ['Inflation shrinks what each dollar can buy.', 'Real return ≈ nominal return − inflation.', 'Long-term money needs to grow faster than prices.'],
      },
      {
        id: 'risk-and-return',
        title: 'Risk, volatility and time',
        hook: 'Why big swings cost you, and how time changes the odds.',
        mins: 8,
        steps: [
          {
            h: 'Same average, different result',
            body: `<p>Risk in investing usually means how much returns swing from year to year, measured by the [[std-dev]].</p>
<p>Here are two funds whose yearly returns average exactly the same. One is calm, one is wild. Watch where each ends up. The wild one ends lower, because big losses take bigger gains to repair. This is [[volatility-drag]].</p>`,
            viz: { type: 'swings' },
          },
          {
            h: 'Losses need bigger gains to recover',
            body: `<p>If you lose 10%, you need about 11% to get back. Lose 50% and you need 100%. The deeper the hole, the harder the climb.</p>
<p><mark>Avoiding big losses matters more than catching every gain.</mark> This is one reason diversification and sensible sizing matter so much.</p>`,
            predict: {
              q: 'Your investment falls 50%. What gain gets you back to even?',
              choices: ['50%', '75%', '100%'],
              a: 2,
              why: '$100 falls to $50. To get from $50 back to $100 you need to double: a 100% gain.',
            },
            viz: { type: 'lossRecovery' },
          },
          {
            h: 'Time changes the odds',
            body: `<p>In any single year, stocks lose money fairly often. Over longer periods the good and bad years tend to balance out, and the chance of ending with a loss shrinks. It never reaches zero.</p>
<p>Your [[time-horizon]] is how long until you need the money. The longer it is, the more short-term swings you can ride out.</p>`,
            viz: { type: 'horizon' },
          },
        ],
        quiz: [
          { q: 'A fund falls 25%. What gain does it need to get back to even?', choices: ['25%', 'About 33%', '50%'], a: 1, why: '$100 → $75. Getting from $75 back to $100 takes $25 ÷ $75 ≈ 33%.' },
          { q: 'Two funds average the same yearly return, but one swings much more. Over time, the steadier one usually ends…', choices: ['Lower', 'Higher', 'Exactly the same'], a: 1, why: 'Volatility drag: big losses cost more than equal gains add back, so the bumpy path compounds to less.' },
          { q: 'Why can long-term investors usually hold more stocks than people saving for next year?', choices: ['Over long periods the chance of a loss shrinks', 'Stocks cannot fall over long periods', 'Volatility increases with time'], a: 0, why: 'Long horizons give good years time to outweigh bad ones. Short horizons do not.' },
        ],
        takeaways: ['Risk is the size of the swings, measured by standard deviation.', 'Losses need bigger gains to recover, so big swings drag down growth.', 'A longer time horizon lowers the odds of ending with a loss.'],
      },
      {
        id: 'fees-and-taxes',
        title: 'Fees, costs and taxes',
        hook: 'The small percentages that eat a big slice of your future.',
        mins: 7,
        steps: [
          {
            h: 'Fees compound too',
            body: `<p>Funds charge a yearly [[expense-ratio]]. It sounds tiny: 1% a year. But it is taken every year from a growing balance, so it compounds against you.</p>
<p>Compare $100,000 invested for 30 years at 7% before fees.</p>`,
            predict: {
              q: 'A 1% yearly fee on a 30-year investment growing 7% a year shrinks the final amount by about…',
              choices: ['1%', '10%', '25%'],
              a: 2,
              why: 'About $574,000 instead of $761,000 with no fee: roughly a quarter of the result is gone.',
            },
            viz: { type: 'feeDrag', mode: 'fee' },
          },
          {
            h: 'Trading costs and taxes',
            body: `<p>Every trade has costs: the [[bid-ask]] spread, sometimes a commission, and, in a regular account, [[capital-gains-tax]] when you sell at a profit. Many countries, including the US, tax gains held over a year at a lower rate than short-term gains.</p>
<p>Frequent trading turns part of your return into costs. Compare a buy-and-hold investor with one who loses a little more to costs and taxes each year.</p>`,
            viz: { type: 'feeDrag', mode: 'trading' },
          },
          {
            h: 'Let the tax rules work for you',
            body: `<p>Most countries offer [[tax-advantaged]] retirement accounts, where investments grow without yearly taxes. In the US, workplace plans often add an [[employer-match]]: free money when you contribute.</p>
<p>Pick an account type to see how it works. Rules, limits and names differ by country and change over time, so check the current rules where you live.</p>`,
            viz: {
              type: 'flow',
              label: 'Account type',
              tabs: {
                taxable: { label: 'Regular account', steps: ['You invest money you have already paid income tax on.', 'Dividends and interest are taxed each year.', 'When you sell at a profit, you pay capital gains tax on the gain.', 'Flexible: you can withdraw any time.'], note: 'Simple and flexible, but taxes take a bite along the way.' },
                deferred: { label: 'Tax-deferred (e.g. traditional 401(k), IRA)', steps: ['Contributions may reduce your taxable income today.', 'Investments grow with no yearly tax on dividends or gains.', 'You pay income tax when you withdraw in retirement.', 'Early withdrawals usually carry penalties.'], note: 'Tax now is postponed, so more money compounds for longer.' },
                free: { label: 'Tax-free growth (e.g. Roth IRA, ISA)', steps: ['You contribute money that has already been taxed.', 'Investments grow with no yearly tax.', 'Qualified withdrawals are tax-free.', 'Contribution limits apply each year.'], note: 'Pay tax once, up front, and keep all the growth.' },
              },
            },
          },
        ],
        quiz: [
          { q: 'Fund A charges 0.05% a year and Fund B charges 1%. Both track the same index. Over 30 years, Fund B will likely end…', choices: ['About the same', 'Noticeably lower', 'Higher, because it costs more'], a: 1, why: 'They hold the same stocks, so the extra 0.95% a year comes straight out of your returns and compounds.' },
          { q: 'An expense ratio of 0.5% on $20,000 costs about how much per year?', choices: ['$10', '$100', '$1,000'], a: 1, why: '0.5% × $20,000 = $100.' },
          { q: 'Why does frequent trading tend to hurt returns?', choices: ['Spreads, commissions and taxes add up', 'Trading more is not allowed', 'Prices never move within a day'], a: 0, why: 'Each trade leaks a little, and the leaks compound over time.' },
        ],
        takeaways: ['Fees are taken every year, so they compound against you.', 'Frequent trading converts returns into costs and taxes.', 'Tax-advantaged accounts let more of your money compound.'],
      },
    ],
  });
})();
