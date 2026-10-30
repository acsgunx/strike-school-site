/* Reading the Market Profile, Unit 2 visuals: a name-that-day-type quiz built on the profile builder. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, pal, tween, ease } = SS;
  const V = SS.viz,
    MP = SS.MP;
  const stack = (host, ...kids) => {
    const box = h('div', { class: 'viz-stack' }, ...kids);
    host.append(box);
    return box;
  };

  const TYPES = ['normal', 'normalVar', 'trend', 'neutral', 'nontrend', 'double'];
  V.dayTypeQuiz = function (host, p, ctx) {
    const r = SS.rng((Date.now() % 100000) + 23);
    let order = [],
      at = 0,
      key = null,
      score = 0,
      seen = 0,
      answered = false,
      shown = 13,
      collapse = 1,
      cancel = null;
    const plotEl = h('div', { class: 'plot' });
    const choices = h('div', { class: 'choices' });
    const fb = h('p', { class: 'readout', 'aria-live': 'polite' });
    const tally = h('p', { class: 'sorter-tally' });
    const next = h('button', { type: 'button', class: 'btn primary', hidden: true, onclick: () => round() }, 'Next day');
    stack(host, plotEl, h('p', { class: 'plot-h' }, 'Which day type is this?'), choices, fb, h('div', { class: 'ctl-row' }, next, tally));
    const plot = new Plot(plotEl, {
      height: (w) => (w < 480 ? 280 : 320),
      pad: { l: 46, r: 8, t: 10, b: 22 },
      label: 'A day’s Market Profile to identify',
      draw(P) {
        if (!key) return;
        const C = pal(),
          day = MP.DAYS[key],
          prof = MP.profile(day);
        P.domain(0, 16, prof.lo - day.tick * 1.5, prof.hi + day.tick * 1.5);
        P.grid({ xTicks: [], yTicks: SS.niceTicks(prof.lo, prof.hi, 5), yf: (v) => '$' + v.toFixed(day.tick < 0.1 ? 2 : 1) });
        MP.drawTPO(P, C, day, prof, { shown, collapse, show: { ib: true } });
      },
    });
    function round() {
      if (at % TYPES.length === 0) order = TYPES.slice().sort(() => r() - 0.5);
      key = order[at % TYPES.length];
      at++;
      answered = false;
      next.hidden = true;
      fb.textContent = 'Watch the day build, then pick its type.';
      const opts = TYPES.filter((x) => x !== key)
        .sort(() => r() - 0.5)
        .slice(0, 3)
        .concat(key)
        .sort(() => r() - 0.5);
      choices.replaceChildren(
        ...opts.map((o, j) =>
          h(
            'button',
            {
              type: 'button',
              class: 'choice',
              'data-k': o,
              onclick: (e) => {
                if (answered) return;
                answered = true;
                const ok = o === key;
                seen++;
                if (ok) score++;
                choices.querySelectorAll('.choice').forEach((b) => {
                  b.disabled = true;
                  if (b.dataset.k === key) b.classList.add('right');
                });
                if (!ok) e.currentTarget.classList.add('wrong');
                fb.innerHTML = `<b>${ok ? 'Correct.' : 'Not quite.'}</b> ${MP.DAYS[key].name}: ${MP.DAYS[key].about}`;
                tally.textContent = `${score} of ${seen} correct`;
                next.hidden = false;
              },
            },
            h('span', { class: 'choice-k' }, 'ABCD'[j]),
            h('span', null, MP.DAYS[o].name)
          )
        )
      );
      if (cancel) cancel();
      cancel = tween(3600, (k) => {
        shown = Math.max(1, Math.min(13, Math.ceil(13 * Math.min(1, k / 0.6))));
        collapse = k > 0.66 ? ease.inOut((k - 0.66) / 0.34) : 0;
        if (k >= 1) (shown = 13), (collapse = 1);
        plot.render();
      });
    }
    round();
    return { destroy: () => (cancel && cancel(), plot.destroy()) };
  };
})();
