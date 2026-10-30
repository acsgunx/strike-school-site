/* Strike School — app shell: routing, courses, lesson engine, quizzes, flashcards, glossary. */
(function () {
  'use strict';
  const SS = window.SS;
  const { h, Plot, money, pal } = SS;
  const main = document.getElementById('main');
  const xpEl = document.getElementById('xp');
  const pop = document.getElementById('pop');

  const COURSES = SS.COURSES.slice().sort((a, b) => a.order - b.order);
  const LESSONS = [];
  COURSES.forEach((c, ci) => {
    c.idx = ci + 1;
    c.lessons = [];
    c.units.forEach((u) =>
      u.lessons.forEach((l) => {
        l.unit = u;
        l.course = c;
        c.lessons.push(l);
        l.n = c.lessons.length;
        LESSONS.push(l);
      })
    );
  });
  const courseById = (id) => COURSES.find((c) => c.id === id);
  // first lesson that links each glossary term, in course order
  const TERM_LESSON = {};
  LESSONS.forEach((l) => {
    const text = l.steps.map((s) => s.body).join(' ');
    (text.match(/\[\[([a-z0-9-]+)/g) || []).forEach((m) => {
      const id = m.slice(2);
      if (!TERM_LESSON[id]) TERM_LESSON[id] = l;
    });
  });

  const prog = Object.assign({ done: {}, xp: 0 }, SS.store.get('progress', {}));
  function save() {
    SS.store.set('progress', prog);
    paintXP();
  }
  const doneIn = (c) => c.lessons.filter((l) => prog.done[l.id]).length;
  const nextIn = (c) => c.lessons.find((l) => !prog.done[l.id]) || null;
  function paintXP() {
    const n = LESSONS.filter((l) => prog.done[l.id]).length;
    xpEl.innerHTML = `<b>${prog.xp}</b> XP <span>· ${n}/${LESSONS.length} lessons</span>`;
  }

  // A term that opens a paragraph, list item or sentence gets a capital first letter.
  const startsSentence = (before) => /(^|<p>|<li>|[.!?]\s)\s*$/.test(before.slice(-12));
  SS.richText = (html) =>
    html.replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, id, label, off) => {
      const t = SS.term(id);
      let text = label || (t && (t.w || t.term)) || id;
      if (startsSentence(html.slice(0, off))) text = text.charAt(0).toUpperCase() + text.slice(1);
      if (!t) return text;
      return `<button type="button" class="term" data-t="${id}">${text}</button>`;
    });

  /* ---------- glossary popover ---------- */
  let popFor = null;
  function openPop(btn) {
    const t = SS.term(btn.dataset.t);
    if (!t) return;
    popFor = btn;
    pop.innerHTML = `<b>${t.term}</b><p>${t.def}</p>${t.ex ? `<p class="pop-ex">${t.ex}</p>` : ''}<a href="#glossary" class="pop-link">Open the glossary</a>`;
    pop.hidden = false;
    const r = btn.getBoundingClientRect(),
      pw = Math.min(320, window.innerWidth - 32);
    pop.style.width = pw + 'px';
    const left = Math.max(16, Math.min(window.innerWidth - pw - 16, r.left + r.width / 2 - pw / 2));
    let topY = r.bottom + 8;
    const ph = pop.offsetHeight;
    if (topY + ph > window.innerHeight - 8) topY = Math.max(8, r.top - ph - 8);
    pop.style.left = left + 'px';
    pop.style.top = topY + 'px';
  }
  function closePop() {
    pop.hidden = true;
    popFor = null;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.term');
    if (b) {
      e.preventDefault();
      if (popFor === b) closePop();
      else openPop(b);
      return;
    }
    if (!e.target.closest('#pop')) closePop();
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closePop());
  window.addEventListener('scroll', closePop, { passive: true });
  pop.addEventListener('click', (e) => e.target.closest('.pop-link') && closePop());

  /* ---------- routing ---------- */
  let cleanups = [];
  function teardown() {
    cleanups.forEach((f) => {
      try {
        f();
      } catch (err) {
        /* ignore */
      }
    });
    cleanups = [];
    closePop();
    main.replaceChildren();
  }
  function setTab(id) {
    document.querySelectorAll('.tabs a').forEach((a) => (a.dataset.tab === id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  }
  const routes = { home: viewHome, lab: viewLab, sim: viewSim, cards: viewCards, glossary: viewGlossary };
  function route() {
    const hash = (location.hash || '#home').slice(1);
    teardown();
    window.scrollTo(0, 0);
    if (hash.indexOf('lesson-') === 0) {
      const l = LESSONS.find((x) => x.id === hash.slice(7));
      if (l) {
        setTab('home');
        return viewLesson(l);
      }
    }
    const c = courseById(hash);
    if (c) {
      setTab('home');
      return viewCourse(c);
    }
    const key = routes[hash] ? hash : 'home';
    setTab(key);
    routes[key]();
  }
  window.addEventListener('hashchange', route);

  /* ---------- home ---------- */
  function activeCourse() {
    const last = LESSONS.find((l) => l.id === prog.last);
    if (last && nextIn(last.course)) return last.course;
    return COURSES.find((c) => nextIn(c)) || COURSES[0];
  }
  function viewHome() {
    const course = activeCourse();
    const pending = nextIn(course);
    const next = pending || course.lessons[0];
    const done = LESSONS.filter((l) => prog.done[l.id]).length;
    const ctaLabel = (!pending ? 'Review: ' : done ? 'Continue: ' : 'Start: ') + next.title;
    const path = COURSES.length > 1 ? `Start with ${COURSES[0].title}, then move on to ${COURSES.slice(1).map((c) => c.title).join(' and ')}.` : `The course: ${COURSES[0].title}.`;
    const fig = h('figure', { class: 'hero-fig' });
    const hero = h(
      'section',
      { class: 'hero' },
      h(
        'div',
        { class: 'hero-copy' },
        h('p', { class: 'eyebrow' }, 'Stock market and options, from zero'),
        h('h1', null, 'Learn the market by ', h('em', null, 'moving'), ' it.'),
        h('p', { class: 'lede' }, `Short lessons where every idea comes with a chart you can drag. You predict, you play with it, then you check yourself. ${path}`),
        h('div', { class: 'hero-cta' }, h('a', { class: 'btn primary', href: '#lesson-' + next.id }, ctaLabel), h('a', { class: 'btn', href: '#sim' }, 'Try the simulator')),
        h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': LESSONS.length, 'aria-valuenow': done, 'aria-label': 'Overall progress' }, h('span', { style: { width: (done / LESSONS.length) * 100 + '%' } })),
        h('p', { class: 'fine' }, done ? `${done} of ${LESSONS.length} lessons done · ${prog.xp} XP` : `${LESSONS.length} lessons in total. Progress is saved in this browser.`)
      ),
      fig
    );
    const courses = h('section', { class: 'courses', 'aria-labelledby': 'courses-h' }, h('h2', { id: 'courses-h' }, 'Courses'), h('div', { class: 'course-cards' }, COURSES.map(courseCard)));
    const tile = (href, t, d, tag) => h('a', { class: 'tile', href }, h('span', { class: 'tile-tag' }, tag), h('b', null, t), h('span', null, d));
    const practice = h(
      'section',
      { class: 'practice', 'aria-labelledby': 'practice-h' },
      h('h2', { id: 'practice-h' }, 'Practice'),
      h(
        'div',
        { class: 'tiles' },
        tile('#lab', 'Strategy Lab', 'Build any options position from calls, puts and shares. See the payoff, breakevens and Greeks.', 'Build'),
        tile('#sim', 'Trade Simulator', 'Place a practice options trade, watch 30 days unfold, and get a debrief of what made or lost money.', 'Play'),
        tile('#cards', 'Flashcards', 'Every key term with spaced review, so they stick.', 'Recall'),
        tile('#glossary', 'Glossary', 'Every term in plain English, linked to the lesson that teaches it.', 'Look up')
      )
    );
    main.append(h('div', { class: 'page home' }, hero, courses, practice));
    heroViz(fig);
  }

  function courseCard(c) {
    const d = doneIn(c),
      nx = nextIn(c);
    const target = nx || c.lessons[0];
    return h(
      'article',
      { class: 'course-card' },
      h('span', { class: 'unit-n' }, `Course ${c.idx}` + (c.idx === 1 ? ' · Start here' : '')),
      h('h3', null, h('a', { href: '#' + c.id }, c.title)),
      h('p', { class: 'course-blurb' }, c.blurb),
      h('ol', { class: 'course-units' }, c.units.map((u) => h('li', null, u.title))),
      h('div', { class: 'meter', 'aria-hidden': 'true' }, h('span', { style: { width: (d / c.lessons.length) * 100 + '%' } })),
      h('p', { class: 'fine' }, `${d} of ${c.lessons.length} lessons done · ${c.units.length} units`),
      h('div', { class: 'hero-cta' }, h('a', { class: 'btn primary', href: '#lesson-' + target.id }, d ? (nx ? 'Continue: ' + nx.title : 'Review the course') : 'Start the course'), h('a', { class: 'btn', href: '#' + c.id }, 'All lessons'))
    );
  }

  function viewCourse(c) {
    const next = nextIn(c);
    const d = doneIn(c);
    main.append(
      h(
        'div',
        { class: 'page course' },
        h(
          'header',
          { class: 'page-head' },
          h('a', { class: 'back', href: '#home' }, '← All courses'),
          h('p', { class: 'eyebrow' }, `Course ${c.idx} of ${COURSES.length}`),
          h('h1', null, c.title),
          h('p', { class: 'lede' }, c.blurb),
          h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': c.lessons.length, 'aria-valuenow': d, 'aria-label': c.title + ' progress' }, h('span', { style: { width: (d / c.lessons.length) * 100 + '%' } })),
          h('p', { class: 'fine' }, `${d} of ${c.lessons.length} lessons done`)
        ),
        h(
          'section',
          { class: 'path' },
          c.units.map((u) =>
            h(
              'div',
              { class: 'unit' },
              h('div', { class: 'unit-head' }, h('span', { class: 'unit-n' }, 'Unit ' + u.n), h('h3', null, u.title), h('p', null, u.blurb)),
              h(
                'ol',
                { class: 'lessons' },
                u.lessons.map((l) => {
                  const dl = prog.done[l.id];
                  return h(
                    'li',
                    null,
                    h(
                      'a',
                      { class: 'lesson-row' + (dl ? ' done' : '') + (l === next ? ' next' : ''), href: '#lesson-' + l.id },
                      h('span', { class: 'l-n' }, String(l.n).padStart(2, '0')),
                      h('span', { class: 'l-t' }, h('b', null, l.title), h('small', null, l.hook)),
                      h('span', { class: 'l-s' }, dl ? `✓ ${dl.score}/${dl.of}` : l === next ? 'Up next' : l.mins + ' min')
                    )
                  );
                })
              )
            )
          )
        )
      )
    );
  }

  // Home hero: $200 a month compounding at 7% for 40 years. It draws itself in once, then the reader scrubs it.
  function heroViz(fig) {
    const MO = 200,
      R = 0.07,
      YRS = 40;
    const series = [[0, 0, 0]];
    let bal = 0;
    for (let m = 1; m <= YRS * 12; m++) {
      bal = bal * (1 + R / 12) + MO;
      if (m % 12 === 0) series.push([m / 12, bal, MO * m]);
    }
    const at = (x) => {
      const i = Math.floor(x);
      if (i >= YRS) return series[YRS];
      const f = x - i,
        a = series[i],
        b = series[i + 1];
      return [x, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    };
    const el = h('div', { class: 'plot' });
    const cap = h('figcaption', { class: 'hero-cap', 'aria-live': 'off' });
    const legend = h('div', { class: 'legend' }, h('span', { class: 'lg lg-stock' }, h('i', { class: 'lg-sw block' }), 'Money you put in'), h('span', { class: 'lg lg-gain' }, h('i', { class: 'lg-sw block' }), 'Growth from compounding'));
    fig.append(h('div', { class: 'hero-chip' }, h('span', null, '$200 a month · 7% a year · 40 years'), h('span', { class: 'drag-hint' }, 'Drag across the chart')), el, legend, cap);
    let t = YRS,
      reveal = 1,
      cancel = null;
    const k$ = (v) => SS.axisMoney(Math.round(v / 1000) * 1000);
    const plot = new Plot(el, {
      height: (w) => (w < 480 ? 250 : 320),
      pad: { r: 30 },
      label: 'Growth of $200 a month invested at 7% a year for 40 years',
      onScrub: (x) => {
        if (cancel) cancel();
        cancel = null;
        reveal = 1;
        t = Math.max(1, Math.round(x));
        paint();
      },
      draw(P) {
        const C = pal();
        P.domain(0, YRS, 0, 580000);
        P.grid({ xTicks: [0, 10, 20, 30, 40], xf: (x) => (x ? 'Year ' + x : 'Start'), yTicks: [0, 100000, 200000, 300000, 400000, 500000], yf: SS.axisMoney });
        const end = YRS * reveal;
        const shown = series.filter(([x]) => x <= end);
        if (end % 1) shown.push(at(end));
        const tot = shown.map(([x, v]) => [x, v]),
          put = shown.map(([x, , c]) => [x, c]);
        P.area(put, 0, C.stock, 0.35);
        P.between(tot, put, C.gain, 0.3);
        P.line(tot, { color: C.gain, width: 3.5 });
        if (reveal >= 1 && t === YRS) {
          // bracket the final decade and label it in the empty space left of the curve
          const v30 = series[30][1],
            v40 = series[YRS][1],
            c = P.c;
          c.save();
          c.strokeStyle = C.ink;
          c.lineWidth = 1.25;
          c.setLineDash([3, 3]);
          c.beginPath();
          c.moveTo(P.X(30), P.Y(v30));
          c.lineTo(P.X(YRS), P.Y(v30));
          c.lineTo(P.X(YRS), P.Y(v40));
          c.stroke();
          c.restore();
          P.tag('Last 10 years: +' + k$(v40 - v30), P.X(32), P.Y((v30 + v40) / 2), { bg: C.ink, align: 'right', dy: -10 });
        }
        const x = Math.min(t, end),
          v = at(x)[1];
        P.vline(x, { color: C.ink, dash: null, alpha: 0.22 });
        P.dot(x, v, { color: C.gain, r: 6 });
        P.tag(k$(v), P.X(x), P.Y(v), { bg: C.gain, align: x > 34 ? 'right' : undefined });
      },
    });
    function paint() {
      plot.render();
      const [, v, put] = series[t];
      cap.innerHTML = `After <b>${t} ${t === 1 ? 'year' : 'years'}</b>: <b class="gain">${money(v, { cents: false })}</b>. You put in ${money(put, { cents: false })}; the other <b>${money(v - put, { cents: false })}</b> is growth on top of growth.`;
    }
    paint();
    if (!SS.reduced) {
      reveal = 0;
      cancel = SS.tween(2600, (k) => {
        reveal = SS.ease.inOut(k);
        t = Math.max(1, Math.round(YRS * reveal));
        paint();
      });
    }
    cleanups.push(() => (cancel && cancel(), plot.destroy()));
  }

  /* ---------- lesson ---------- */
  function viewLesson(L) {
    const total = L.steps.length,
      C = L.course;
    let i = 0,
      api = null;
    const bar = h('div', { class: 'stepbar', 'aria-hidden': 'true' });
    for (let k = 0; k <= total; k++) bar.append(h('span', { class: k === total ? 'q' : '' }));
    const body = h('div', { class: 'lesson-body' });
    const btnBack = h('button', { type: 'button', class: 'btn', onclick: () => go(i - 1) }, '← Back');
    const btnNext = h('button', { type: 'button', class: 'btn primary', onclick: () => go(i + 1) }, 'Next →');
    const counter = h('span', { class: 'nav-count' });
    const nav = h('div', { class: 'lesson-nav' }, btnBack, counter, btnNext);
    main.append(
      h(
        'article',
        { class: 'page lesson' },
        h('header', { class: 'lesson-head' }, h('a', { class: 'back', href: '#' + C.id }, '← ' + C.title), h('p', { class: 'eyebrow' }, `${C.short} · Unit ${L.unit.n} · ${L.unit.title} · Lesson ${L.n} of ${C.lessons.length}`), h('h1', null, L.title), bar),
        body,
        nav
      )
    );
    prog.last = L.id;
    save();
    function killViz() {
      if (api && api.destroy) api.destroy();
      api = null;
    }
    cleanups.push(killViz);
    const onKey = (e) => {
      if (e.target.closest('input, select, textarea')) return;
      if (e.key === 'ArrowRight' && i < total) go(i + 1);
      if (e.key === 'ArrowLeft' && i > 0) go(i - 1);
    };
    document.addEventListener('keydown', onKey);
    cleanups.push(() => document.removeEventListener('keydown', onKey));

    function paintBar() {
      [...bar.children].forEach((s, k) => (s.className = (k === total ? 'q ' : '') + (k < i ? 'done' : k === i ? 'on' : '')));
      btnBack.disabled = i === 0;
      btnNext.hidden = i >= total;
      btnNext.textContent = i === total - 1 ? 'Check yourself →' : 'Next →';
      counter.textContent = i < total ? `Step ${i + 1} of ${total}` : 'Quiz';
    }
    function go(k) {
      if (k < 0 || k > total) return;
      i = k;
      killViz();
      paintBar();
      if (k === total) showQuiz();
      else showStep(L.steps[k], k);
      const top = document.querySelector('.lesson-head');
      if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: SS.reduced ? 'auto' : 'smooth', block: 'start' });
    }
    function showStep(st, k) {
      const stage = h('div', { class: 'stage' });
      const inner = h('div', { class: 'stage-inner' });
      stage.append(inner);
      body.replaceChildren(h('div', { class: 'step' }, h('div', { class: 'prose' }, h('p', { class: 'step-n' }, `Step ${k + 1} of ${total}`), h('h2', null, st.h), h('div', { class: 'step-body', html: SS.richText(st.body) })), stage));
      const fn = SS.viz[st.viz.type];
      api = (fn && fn(inner, st.viz, { key: `${L.id}-${k}` })) || {};
      if (st.predict) gate(stage, st.predict, () => api && api.play && api.play());
      else if (api.play) api.play();
    }
    function gate(stage, pr, onDone) {
      stage.classList.add('gated');
      const fb = h('div', { class: 'gate-fb', 'aria-live': 'polite' });
      const box = h('div', { class: 'gate', role: 'group', 'aria-label': 'Predict first' });
      const choices = pr.choices.map((c, j) => h('button', { type: 'button', class: 'choice', onclick: () => answer(j) }, h('span', { class: 'choice-k' }, 'ABCD'[j]), h('span', null, c)));
      box.append(h('p', { class: 'gate-tag' }, 'Predict first'), h('p', { class: 'gate-q' }, pr.q), h('div', { class: 'choices' }, choices), fb);
      stage.append(box);
      function answer(j) {
        const ok = j === pr.a;
        choices.forEach((b, k) => {
          b.disabled = true;
          if (k === pr.a) b.classList.add('right');
          else if (k === j) b.classList.add('wrong');
        });
        if (ok) {
          prog.xp += 5;
          save();
        }
        fb.innerHTML = `<p><b>${ok ? 'Good instinct. +5 XP' : 'Not quite.'}</b> ${pr.why}</p>`;
        const show = h(
          'button',
          {
            type: 'button',
            class: 'btn primary',
            onclick: () => {
              stage.classList.remove('gated');
              box.remove();
              onDone();
            },
          },
          'Show me'
        );
        fb.append(show);
        show.focus({ preventScroll: true });
      }
    }
    function showQuiz() {
      let qi = 0,
        score = 0;
      const qs = L.quiz;
      const wrap = h('div', { class: 'quiz' });
      body.replaceChildren(wrap);
      function q() {
        const Q = qs[qi];
        const fb = h('div', { class: 'q-fb', 'aria-live': 'polite' });
        const choices = Q.choices.map((c, j) => h('button', { type: 'button', class: 'choice', onclick: () => pick(j) }, h('span', { class: 'choice-k' }, 'ABCD'[j]), h('span', null, c)));
        const card = h('div', { class: 'q-card' }, h('p', { class: 'step-n' }, `Question ${qi + 1} of ${qs.length}`), h('h2', null, Q.q), h('div', { class: 'choices' }, choices), fb);
        wrap.replaceChildren(card);
        function pick(j) {
          const ok = j === Q.a;
          if (ok) score++;
          choices.forEach((b, k) => {
            b.disabled = true;
            if (k === Q.a) b.classList.add('right');
            else if (k === j) b.classList.add('wrong');
          });
          fb.innerHTML = `<p><b>${ok ? 'Correct.' : 'Not quite.'}</b> ${Q.why || ''}</p>`;
          const nxt = h('button', { type: 'button', class: 'btn primary', onclick: () => (++qi < qs.length ? q() : finish()) }, qi + 1 < qs.length ? 'Next question' : 'See results');
          fb.append(nxt);
          nxt.focus({ preventScroll: true });
        }
      }
      function finish() {
        const first = !prog.done[L.id];
        const gained = first ? score * 10 + 20 : 0;
        const best = Math.max(score, (prog.done[L.id] && prog.done[L.id].score) || 0);
        prog.xp += gained;
        prog.done[L.id] = { score: best, of: qs.length, at: Date.now() };
        save();
        const nextL = C.lessons[L.n] || (COURSES[C.idx] && COURSES[C.idx].lessons[0]);
        const perfect = score === qs.length;
        const nextLabel = !nextL ? null : nextL.course !== C ? `Start the next course: ${nextL.course.title}` : 'Next: ' + nextL.title;
        wrap.replaceChildren(
          h(
            'div',
            { class: 'done-card' },
            h('p', { class: 'eyebrow' }, L.n === C.lessons.length ? `${C.title} complete` : 'Lesson complete'),
            h('h2', null, `${score} of ${qs.length} correct`),
            h('p', { class: 'xp-gain' }, gained ? `+${gained} XP` : perfect ? 'Perfect review.' : 'Review complete. XP is awarded on your first pass.'),
            h('h3', null, 'Remember'),
            h('ul', { class: 'takeaways' }, L.takeaways.map((t) => h('li', null, t))),
            h(
              'div',
              { class: 'hero-cta' },
              nextL ? h('a', { class: 'btn primary', href: '#lesson-' + nextL.id }, nextLabel) : h('a', { class: 'btn primary', href: '#sim' }, 'Graduate to the simulator'),
              h('button', { type: 'button', class: 'btn', onclick: () => go(0) }, 'Review this lesson'),
              h('a', { class: 'btn ghost', href: '#' + C.id }, 'Back to the course')
            )
          )
        );
      }
      q();
    }
    go(0);
  }

  /* ---------- lab and simulator ---------- */
  function viewLab() {
    SS.lab(main, cleanups);
  }
  function viewSim() {
    SS.sim(main, cleanups);
  }

  /* ---------- flashcards (Leitner boxes) ---------- */
  function viewCards() {
    const boxes = SS.store.get('cards', {});
    const withTerms = COURSES.filter((c) => SS.GLOSSARY.some((t) => t.course === c.id));
    let deckId = SS.store.get('cards-deck', 'all');
    if (deckId !== 'all' && !withTerms.some((c) => c.id === deckId)) deckId = 'all';
    const deck = () => SS.GLOSSARY.filter((t) => deckId === 'all' || t.course === deckId);
    const boxOf = (id) => boxes[id] || 1;
    let queue = [],
      cur = null,
      flipped = false;
    function build() {
      const r = SS.rng((Date.now() / 1000) | 0);
      const all = deck();
      const pick = all.filter((t) => {
        const b = boxOf(t.id);
        return b === 1 || (b === 2 && r() < 0.5) || (b === 3 && r() < 0.2);
      });
      queue = (pick.length ? pick : all.slice()).sort(() => r() - 0.5).sort((a, b) => boxOf(a.id) - boxOf(b.id));
    }
    const deckSeg =
      withTerms.length > 1
        ? SS.seg({
            label: 'Deck',
            options: [{ v: 'all', label: 'All terms' }].concat(withTerms.map((c) => ({ v: c.id, label: c.title }))),
            value: deckId,
            onChange: (v) => {
              deckId = v;
              SS.store.set('cards-deck', v);
              build();
              next();
            },
          })
        : null;
    const counts = h('div', { class: 'fc-counts' });
    const front = h('div', { class: 'fc-face fc-front' }),
      back = h('div', { class: 'fc-face fc-back' });
    const card = h('button', { type: 'button', class: 'fc-card', 'aria-label': 'Flip card', onclick: () => flip() }, h('span', { class: 'fc-in' }, front, back));
    const again = h('button', { type: 'button', class: 'btn', onclick: () => grade(false) }, 'Again');
    const got = h('button', { type: 'button', class: 'btn primary', onclick: () => grade(true) }, 'Got it');
    const actions = h('div', { class: 'fc-actions' }, again, got);
    const hint = h('p', { class: 'fine center' }, 'Tap the card or press Space to flip. Press 1 for Again, 2 for Got it.');
    main.append(
      h(
        'div',
        { class: 'page cards' },
        h('header', { class: 'page-head' }, h('p', { class: 'eyebrow' }, 'Flashcards'), h('h1', null, 'Make the vocabulary automatic'), h('p', { class: 'lede' }, 'Say the meaning out loud before you flip. Cards you know move to a later box and come back less often. Cards you miss come back soon.')),
        deckSeg ? h('div', { class: 'fc-deck' }, deckSeg.el) : null,
        counts,
        h('div', { class: 'fc-wrap' }, card, actions, hint)
      )
    );
    function paintCounts() {
      const c = [0, 0, 0];
      deck().forEach((t) => c[boxOf(t.id) - 1]++);
      counts.replaceChildren(...['Learning', 'Reviewing', 'Mastered'].map((l, k) => h('div', { class: 'fc-box b' + (k + 1) }, h('b', null, c[k]), h('span', null, l))));
    }
    function next() {
      if (!queue.length) build();
      cur = queue.shift();
      flipped = false;
      card.classList.remove('flipped');
      front.innerHTML = `<span class="flip-tag">Box ${boxOf(cur.id)}</span><b>${cur.term}</b><span class="fine">What does it mean?</span>`;
      back.innerHTML = `<span class="flip-tag">${cur.term}</span><p>${cur.def}</p>${cur.ex ? `<p class="pop-ex">${cur.ex}</p>` : ''}`;
      actions.classList.add('wait');
      paintCounts();
    }
    function flip() {
      flipped = !flipped;
      card.classList.toggle('flipped', flipped);
      if (flipped) actions.classList.remove('wait');
    }
    function grade(ok) {
      if (!cur) return;
      boxes[cur.id] = ok ? Math.min(3, boxOf(cur.id) + 1) : 1;
      SS.store.set('cards', boxes);
      next();
    }
    const onKey = (e) => {
      if (e.target.closest('input, select, textarea, .seg')) return;
      if (e.key === ' ') {
        e.preventDefault();
        flip();
      } else if (e.key === '1' && flipped) grade(false);
      else if (e.key === '2' && flipped) grade(true);
    };
    document.addEventListener('keydown', onKey);
    cleanups.push(() => document.removeEventListener('keydown', onKey));
    build();
    next();
  }

  /* ---------- glossary ---------- */
  function viewGlossary() {
    const input = h('input', { id: 'gloss-q', class: 'input', type: 'search', placeholder: 'Search terms, e.g. dividend or theta', 'aria-label': 'Search the glossary' });
    const list = h('div', { class: 'gl-list' });
    const empty = h('p', { class: 'fine', hidden: true }, 'No terms match. Try a shorter word.');
    main.append(
      h(
        'div',
        { class: 'page glossary' },
        h('header', { class: 'page-head' }, h('p', { class: 'eyebrow' }, 'Glossary'), h('h1', null, 'Every term, in plain English'), h('p', { class: 'lede' }, `${SS.GLOSSARY.length} terms. Underlined words in lessons open these definitions too.`)),
        input,
        empty,
        list
      )
    );
    const sorted = SS.GLOSSARY.slice().sort((a, b) => a.term.localeCompare(b.term));
    function render() {
      const q = input.value.trim().toLowerCase();
      const items = sorted.filter((t) => !q || (t.term + ' ' + t.def + ' ' + t.id).toLowerCase().includes(q));
      empty.hidden = items.length > 0;
      list.replaceChildren();
      let letter = '';
      items.forEach((t) => {
        const L0 = t.term[0].toUpperCase();
        if (L0 !== letter) {
          letter = L0;
          list.append(h('h2', { class: 'gl-letter' }, letter));
        }
        const l = TERM_LESSON[t.id];
        list.append(h('div', { class: 'gl-item', id: 'term-' + t.id }, h('b', { class: 'gl-term' }, t.term), h('p', { class: 'gl-def' }, t.def), t.ex ? h('p', { class: 'gl-ex' }, t.ex) : null, l ? h('a', { class: 'gl-link', href: '#lesson-' + l.id }, `Taught in ${l.course.short}, lesson ${l.n}: ${l.title}`) : null));
      });
    }
    input.addEventListener('input', render);
    render();
  }

  paintXP();
  route();
})();
