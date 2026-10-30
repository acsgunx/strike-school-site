/* Strike School — DOM helpers, number formatting, a small canvas plotting kit and tweening. */
(function () {
  'use strict';
  const SS = (window.SS = window.SS || {});

  /* ---------- DOM ---------- */
  SS.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  };

  /* ---------- content registry ----------
     A course: { id, order, title, short, blurb, units: [{ n, title, blurb, lessons: [...] }] } */
  SS.COURSES = SS.COURSES || [];
  SS.registerCourse = (c) => SS.COURSES.push(c);

  SS.store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('strike-school:' + k);
        return v == null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('strike-school:' + k, JSON.stringify(v));
      } catch (e) {
        /* storage blocked: progress lasts for this visit only */
      }
    },
  };

  /* ---------- formatting ---------- */
  const MINUS = '−';
  SS.MINUS = MINUS;

  SS.money = function (v, o = {}) {
    if (!isFinite(v)) return 'Unlimited';
    const cents = o.cents !== false;
    const r = cents ? Math.round(v * 100) / 100 : Math.round(v);
    const a = Math.abs(r).toLocaleString('en-US', {
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    });
    if (r < 0) return MINUS + '$' + a;
    return (o.sign && r > 0 ? '+' : '') + '$' + a;
  };

  SS.usd = (v, d = 2) => (v < -0.0049 ? MINUS : '') + '$' + Math.abs(v).toFixed(d);

  SS.pct = function (v, o = {}) {
    const d = o.d == null ? 1 : o.d;
    const r = +(v * 100).toFixed(d);
    if (r < 0) return MINUS + Math.abs(r).toFixed(d) + '%';
    return (o.sign && r > 0 ? '+' : '') + r.toFixed(d) + '%';
  };

  SS.axisMoney = function (v) {
    const a = Math.abs(v);
    let s;
    if (a >= 1000) s = (a / 1000).toFixed(a % 1000 === 0 ? 0 : 1) + 'k';
    else s = a % 1 ? a.toFixed(2) : String(a);
    return (v < 0 ? MINUS : '') + '$' + s;
  };

  SS.plClass = (v) => (v > 0.004 ? 'gain' : v < -0.004 ? 'loss' : 'flat');

  /* ---------- color ---------- */
  let palette = null;
  const TOKENS = ['ink', 'muted', 'line', 'grid', 'surface', 'bg', 'call', 'put', 'violet', 'stock', 'gain', 'loss', 'accent', 'warn', 'on-solid'];
  SS.pal = function () {
    if (palette) return palette;
    const cs = getComputedStyle(document.documentElement);
    palette = {};
    TOKENS.forEach((t) => (palette[t.replace('-', '')] = cs.getPropertyValue('--' + t).trim() || '#888888'));
    return palette;
  };
  SS.alpha = function (hex, a) {
    hex = (hex || '').trim();
    if (hex[0] !== '#') return hex;
    let x = hex.slice(1);
    if (x.length === 3) x = x.split('').map((c) => c + c).join('');
    const n = parseInt(x.slice(0, 6), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  /* ---------- motion ---------- */
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  Object.defineProperty(SS, 'reduced', { get: () => motionQuery.matches });

  SS.ease = {
    out: (k) => 1 - Math.pow(1 - k, 3),
    inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  };

  SS.tween = function (ms, fn, done) {
    if (SS.reduced || ms <= 0) {
      fn(1);
      if (done) done();
      return () => {};
    }
    let raf = 0,
      t0 = null,
      stopped = false,
      finished = false;
    const end = () => {
      if (finished || stopped) return;
      finished = true;
      cancelAnimationFrame(raf);
      clearTimeout(guard);
      fn(1);
      if (done) done();
    };
    const step = (t) => {
      if (stopped || finished) return;
      if (t0 == null) t0 = t;
      const k = Math.min(1, (t - t0) / ms);
      if (k >= 1) return end();
      fn(k);
      raf = requestAnimationFrame(step);
    };
    // rAF pauses in hidden tabs and previews; this guarantees the final frame still lands.
    const guard = setTimeout(end, ms + 250);
    raf = requestAnimationFrame(step);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      clearTimeout(guard);
    };
  };

  /* ---------- random ---------- */
  SS.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  SS.gauss = function (r) {
    let u = 0,
      v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  /* ---------- controls ---------- */
  SS.slider = function ({ id, label, min, max, step = 1, value, fmt = (v) => v, onInput }) {
    const out = SS.h('output', { class: 'sl-val', for: id });
    const input = SS.h('input', { type: 'range', id, min, max, step, value });
    const wrap = SS.h('div', { class: 'sl' }, SS.h('label', { class: 'sl-top', for: id }, SS.h('span', { class: 'sl-label' }, label), out), input);
    const paint = () => {
      const v = parseFloat(input.value);
      out.textContent = fmt(v);
      input.style.setProperty('--fill', ((v - min) / (max - min)) * 100 + '%');
    };
    input.addEventListener('input', () => {
      paint();
      if (onInput) onInput(parseFloat(input.value));
    });
    paint();
    return {
      el: wrap,
      input,
      get: () => parseFloat(input.value),
      set(v, fire) {
        input.value = v;
        paint();
        if (fire && onInput) onInput(parseFloat(input.value));
      },
      setMax(m) {
        max = m;
        input.max = m;
        paint();
      },
      setRange(a, b) {
        min = a;
        max = b;
        input.min = a;
        input.max = b;
        paint();
      },
      disable(b) {
        input.disabled = !!b;
      },
    };
  };

  SS.seg = function ({ options, value, onChange, label }) {
    const wrap = SS.h('div', { class: 'seg', role: 'group', 'aria-label': label || 'Choose one' });
    const btns = options.map((o) => {
      const b = SS.h(
        'button',
        {
          type: 'button',
          class: 'seg-btn',
          'aria-pressed': String(o.v === value),
          onclick: () => {
            if (b.disabled) return;
            set(o.v);
            if (onChange) onChange(o.v);
          },
        },
        o.label
      );
      b.dataset.v = o.v;
      wrap.append(b);
      return b;
    });
    function set(v) {
      value = v;
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === String(v))));
    }
    return {
      el: wrap,
      set,
      get: () => value,
      disable(b) {
        btns.forEach((x) => (x.disabled = !!b));
      },
    };
  };

  /* ---------- plotting ---------- */
  const PLOTS = new Set();
  function refreshAll() {
    palette = null;
    PLOTS.forEach((p) => {
      if (!p.host.isConnected) return;
      p.render();
    });
  }
  SS.refreshPlots = refreshAll;
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refreshAll);
  new MutationObserver(refreshAll).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshAll);

  const MONO = (s, w = 400) => `${w} ${s}px "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace`;
  SS.MONO = MONO;

  function niceTicks(a, b, n) {
    const lo = Math.min(a, b),
      hi = Math.max(a, b),
      span = hi - lo;
    if (!(span > 0)) return [lo];
    const raw = span / Math.max(1, n);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
    const out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-6; v += step) out.push(+v.toFixed(10));
    return out;
  }
  SS.niceTicks = niceTicks;

  function rr(c, x, y, w, hgt, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + hgt, r);
    c.arcTo(x + w, y + hgt, x, y + hgt, r);
    c.arcTo(x, y + hgt, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  class Plot {
    constructor(host, o = {}) {
      this.host = host;
      this.o = Object.assign({ height: 260, draw: () => {} }, o);
      this.cv = document.createElement('canvas');
      this.cv.className = 'plot-canvas';
      this.cv.setAttribute('role', 'img');
      this.cv.setAttribute('aria-label', o.label || 'Chart');
      host.appendChild(this.cv);
      this.c = this.cv.getContext('2d');
      this.dom = { x0: 0, x1: 1, y0: 0, y1: 1 };
      this.w = 0;
      this.h = 0;
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(host);
      PLOTS.add(this);
      if (o.onScrub) this._scrub();
      this.resize();
    }
    destroy() {
      this.ro.disconnect();
      PLOTS.delete(this);
    }
    get pad() {
      const p = this.o.pad || {};
      const narrow = this.w < 420;
      return { l: p.l != null ? p.l : narrow ? 44 : 54, r: p.r != null ? p.r : 14, t: p.t != null ? p.t : 16, b: p.b != null ? p.b : 28 };
    }
    resize() {
      const w = this.host.clientWidth;
      if (!w) return;
      const hgt = typeof this.o.height === 'function' ? this.o.height(w) : this.o.height;
      if (w !== this.w || hgt !== this.h) {
        const dpr = window.devicePixelRatio || 1;
        this.w = w;
        this.h = hgt;
        this.cv.width = Math.round(w * dpr);
        this.cv.height = Math.round(hgt * dpr);
        this.cv.style.height = hgt + 'px';
        this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      this.render();
    }
    render() {
      if (!this.w) return;
      this.c.clearRect(0, 0, this.w, this.h);
      this.o.draw(this);
    }
    domain(x0, x1, y0, y1) {
      this.dom = { x0, x1, y0, y1 };
      return this;
    }
    X(v) {
      const p = this.pad,
        d = this.dom;
      return p.l + ((v - d.x0) / (d.x1 - d.x0)) * (this.w - p.l - p.r);
    }
    Y(v) {
      const p = this.pad,
        d = this.dom;
      return p.t + (1 - (v - d.y0) / (d.y1 - d.y0)) * (this.h - p.t - p.b);
    }
    invX(px) {
      const p = this.pad,
        d = this.dom;
      return d.x0 + ((px - p.l) / (this.w - p.l - p.r)) * (d.x1 - d.x0);
    }
    _scrub() {
      const cv = this.cv;
      cv.style.touchAction = 'pan-y';
      cv.style.cursor = 'ew-resize';
      let down = false;
      const fire = (e) => {
        const r = cv.getBoundingClientRect();
        const d = this.dom;
        const lo = Math.min(d.x0, d.x1),
          hi = Math.max(d.x0, d.x1);
        this.o.onScrub(Math.min(hi, Math.max(lo, this.invX(e.clientX - r.left))), e);
      };
      cv.addEventListener('pointerdown', (e) => {
        down = true;
        try {
          cv.setPointerCapture(e.pointerId);
        } catch (err) {
          /* ignore */
        }
        fire(e);
      });
      cv.addEventListener('pointermove', (e) => down && fire(e));
      const up = () => (down = false);
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);
    }
    clip() {
      const p = this.pad;
      this.c.beginPath();
      this.c.rect(p.l, p.t - 3, this.w - p.l - p.r, this.h - p.t - p.b + 6);
      this.c.clip();
    }
    grid(o = {}) {
      const c = this.c,
        P = SS.pal(),
        d = this.dom,
        p = this.pad;
      const xt = o.xTicks || niceTicks(d.x0, d.x1, Math.max(3, Math.floor((this.w - p.l - p.r) / 72)));
      const yt = o.yTicks || niceTicks(d.y0, d.y1, Math.max(2, Math.floor((this.h - p.t - p.b) / 46)));
      c.save();
      c.lineWidth = 1;
      c.font = MONO(10.5);
      c.fillStyle = P.muted;
      c.strokeStyle = P.grid;
      c.textAlign = 'center';
      c.textBaseline = 'top';
      xt.forEach((x) => {
        const px = Math.round(this.X(x)) + 0.5;
        if (!o.noXLines) {
          c.beginPath();
          c.moveTo(px, p.t);
          c.lineTo(px, this.h - p.b);
          c.stroke();
        }
        if (!o.noXLabels) c.fillText((o.xf || String)(x), px, this.h - p.b + 7);
      });
      c.textAlign = 'right';
      c.textBaseline = 'middle';
      yt.forEach((y) => {
        const py = Math.round(this.Y(y)) + 0.5;
        c.beginPath();
        c.moveTo(p.l, py);
        c.lineTo(this.w - p.r, py);
        c.stroke();
        if (!o.noYLabels) c.fillText((o.yf || String)(y), p.l - 7, py);
      });
      if (o.zero !== false && d.y0 < 0 && d.y1 > 0) {
        const py = Math.round(this.Y(0)) + 0.5;
        c.strokeStyle = P.muted;
        c.lineWidth = 1.25;
        c.beginPath();
        c.moveTo(p.l, py);
        c.lineTo(this.w - p.r, py);
        c.stroke();
      }
      c.restore();
    }
    sample(fn, x0 = this.dom.x0, x1 = this.dom.x1, n = 240) {
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n;
        pts.push([x, fn(x)]);
      }
      return pts;
    }
    path(pts) {
      const c = this.c;
      c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(this.X(x), this.Y(y)) : c.moveTo(this.X(x), this.Y(y))));
    }
    line(pts, o = {}) {
      if (!pts.length) return;
      const c = this.c;
      c.save();
      this.clip();
      c.globalAlpha = o.alpha == null ? 1 : o.alpha;
      c.strokeStyle = o.color || SS.pal().ink;
      c.lineWidth = o.width || 2;
      c.lineJoin = 'round';
      c.lineCap = 'round';
      if (o.dash) c.setLineDash(o.dash);
      this.path(pts);
      c.stroke();
      c.restore();
    }
    area(pts, base, color, a = 0.15) {
      if (!pts.length) return;
      const c = this.c;
      c.save();
      this.clip();
      c.beginPath();
      c.moveTo(this.X(pts[0][0]), this.Y(base));
      pts.forEach(([x, y]) => c.lineTo(this.X(x), this.Y(y)));
      c.lineTo(this.X(pts[pts.length - 1][0]), this.Y(base));
      c.closePath();
      c.fillStyle = SS.alpha(color, a);
      c.fill();
      c.restore();
    }
    between(top, bottom, color, a = 0.18) {
      if (!top.length) return;
      const c = this.c;
      c.save();
      this.clip();
      c.beginPath();
      top.forEach(([x, y], i) => (i ? c.lineTo(this.X(x), this.Y(y)) : c.moveTo(this.X(x), this.Y(y))));
      for (let i = bottom.length - 1; i >= 0; i--) c.lineTo(this.X(bottom[i][0]), this.Y(bottom[i][1]));
      c.closePath();
      c.fillStyle = SS.alpha(color, a);
      c.fill();
      c.restore();
    }
    fillPL(pts, a = 0.16) {
      if (!pts.length) return;
      const c = this.c,
        P = SS.pal(),
        p = this.pad,
        y0 = this.Y(0);
      const shape = () => {
        c.beginPath();
        c.moveTo(this.X(pts[0][0]), y0);
        pts.forEach(([x, y]) => c.lineTo(this.X(x), this.Y(y)));
        c.lineTo(this.X(pts[pts.length - 1][0]), y0);
        c.closePath();
      };
      c.save();
      this.clip();
      c.beginPath();
      c.rect(0, 0, this.w, y0);
      c.clip();
      shape();
      c.fillStyle = SS.alpha(P.gain, a);
      c.fill();
      c.restore();
      c.save();
      this.clip();
      c.beginPath();
      c.rect(0, y0, this.w, this.h);
      c.clip();
      shape();
      c.fillStyle = SS.alpha(P.loss, a);
      c.fill();
      c.restore();
      void p;
    }
    rect(x0, y0, x1, y1, fill) {
      const c = this.c;
      c.save();
      c.fillStyle = fill;
      const a = this.X(x0),
        b = this.X(x1),
        t = this.Y(y1),
        u = this.Y(y0);
      c.fillRect(Math.min(a, b), Math.min(t, u), Math.abs(b - a), Math.abs(u - t));
      c.restore();
    }
    vline(x, o = {}) {
      const d = this.dom;
      if (x < Math.min(d.x0, d.x1) || x > Math.max(d.x0, d.x1)) return;
      const c = this.c,
        P = SS.pal(),
        p = this.pad,
        px = Math.round(this.X(x)) + 0.5;
      const dash = o.dash === undefined ? [4, 4] : o.dash;
      c.save();
      c.globalAlpha = o.alpha == null ? 1 : o.alpha;
      c.strokeStyle = o.color || P.muted;
      c.lineWidth = o.width || 1;
      if (dash) c.setLineDash(dash);
      c.beginPath();
      c.moveTo(px, p.t);
      c.lineTo(px, this.h - p.b);
      c.stroke();
      if (o.label) {
        c.setLineDash([]);
        c.globalAlpha = 1;
        c.font = MONO(10.5, 600);
        c.fillStyle = o.labelColor || o.color || P.muted;
        const right = px > this.w - 90;
        c.textAlign = right ? 'right' : 'left';
        c.textBaseline = 'top';
        c.fillText(o.label, px + (right ? -5 : 5), p.t + (o.row || 0) * 14);
      }
      c.restore();
    }
    hline(y, o = {}) {
      const d = this.dom;
      if (y < Math.min(d.y0, d.y1) || y > Math.max(d.y0, d.y1)) return;
      const c = this.c,
        P = SS.pal(),
        p = this.pad,
        py = Math.round(this.Y(y)) + 0.5;
      const dash = o.dash === undefined ? [4, 4] : o.dash;
      c.save();
      c.globalAlpha = o.alpha == null ? 1 : o.alpha;
      c.strokeStyle = o.color || P.muted;
      c.lineWidth = o.width || 1;
      if (dash) c.setLineDash(dash);
      c.beginPath();
      c.moveTo(p.l, py);
      c.lineTo(this.w - p.r, py);
      c.stroke();
      if (o.label) {
        c.setLineDash([]);
        c.globalAlpha = 1;
        c.font = MONO(10.5, 600);
        c.fillStyle = o.labelColor || o.color || P.muted;
        c.textAlign = 'right';
        c.textBaseline = 'bottom';
        c.fillText(o.label, this.w - p.r - 4, py - 3);
      }
      c.restore();
    }
    dot(x, y, o = {}) {
      const c = this.c,
        P = SS.pal(),
        r = o.r || 5,
        px = this.X(x),
        py = this.Y(y);
      c.save();
      c.beginPath();
      c.arc(px, py, r + 4, 0, Math.PI * 2);
      c.fillStyle = SS.alpha(o.color || P.ink, 0.18);
      c.fill();
      c.beginPath();
      c.arc(px, py, r, 0, Math.PI * 2);
      c.fillStyle = o.color || P.ink;
      c.fill();
      c.lineWidth = 2;
      c.strokeStyle = P.surface;
      c.stroke();
      c.restore();
    }
    diamond(x, y, color) {
      const c = this.c,
        px = this.X(x),
        py = this.Y(y),
        s = 5;
      c.save();
      c.beginPath();
      c.moveTo(px, py - s);
      c.lineTo(px + s, py);
      c.lineTo(px, py + s);
      c.lineTo(px - s, py);
      c.closePath();
      c.fillStyle = color || SS.pal().ink;
      c.fill();
      c.lineWidth = 1.5;
      c.strokeStyle = SS.pal().surface;
      c.stroke();
      c.restore();
    }
    text(str, px, py, o = {}) {
      const c = this.c;
      c.save();
      c.font = MONO(o.size || 10.5, o.weight || 600);
      c.fillStyle = o.color || SS.pal().muted;
      c.textAlign = o.align || 'center';
      c.textBaseline = o.base || 'middle';
      let x = px;
      if (o.clamp !== false) {
        const tw = c.measureText(str).width;
        if (c.textAlign === 'center') x = Math.max(tw / 2 + 2, Math.min(this.w - tw / 2 - 2, px));
        else if (c.textAlign === 'left') x = Math.min(this.w - tw - 2, px);
        else x = Math.max(tw + 2, px);
      }
      c.fillText(str, x, py);
      c.restore();
    }
    tag(str, px, py, o = {}) {
      const c = this.c,
        P = SS.pal();
      c.save();
      c.font = MONO(o.size || 11.5, 600);
      const tw = c.measureText(str).width,
        padX = 7,
        hh = 21;
      let x = px - tw / 2 - padX;
      if (o.align === 'left') x = px + 10;
      if (o.align === 'right') x = px - tw - padX * 2 - 10;
      x = Math.max(2, Math.min(this.w - tw - padX * 2 - 2, x));
      let y = py + (o.dy == null ? -32 : o.dy);
      if (y < 2) y = py + 12;
      y = Math.max(2, Math.min(this.h - hh - 2, y));
      c.fillStyle = o.bg || P.ink;
      rr(c, x, y, tw + padX * 2, hh, 5);
      c.fill();
      c.fillStyle = o.fg || P.onsolid;
      c.textBaseline = 'middle';
      c.textAlign = 'left';
      c.fillText(str, x + padX, y + hh / 2 + 0.5);
      c.restore();
    }
  }
  SS.Plot = Plot;
})();
