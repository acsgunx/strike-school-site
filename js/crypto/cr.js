/* Crypto, Explained — shared helpers: a real SHA-256 (synchronous, so the mining demo can try thousands of nonces a
   frame and the page also works from file://), tiny-number RSA for the signature demo, and formatting. */
(function () {
  'use strict';
  const SS = window.SS;
  const CR = (SS.CR = {});

  /* ---------- SHA-256 ---------- */
  // The round constants and starting values are the fractional parts of the cube and square roots of the first
  // primes, computed here rather than typed out.
  const primes = [];
  for (let n = 2; primes.length < 64; n++) if (primes.every((p) => n % p)) primes.push(n);
  const frac = (x) => ((x - Math.floor(x)) * 0x100000000) >>> 0;
  const K = Uint32Array.from(primes, (p) => frac(Math.cbrt(p)));
  const H0 = Uint32Array.from(primes.slice(0, 8), (p) => frac(Math.sqrt(p)));
  const ror = (x, n) => (x >>> n) | (x << (32 - n));
  const enc = new TextEncoder();
  const W = new Uint32Array(64);
  /** SHA-256 of a string, as 64 hex characters. */
  CR.sha256 = function (msg) {
    const bytes = enc.encode(msg),
      len = bytes.length,
      size = ((len + 9 + 63) >> 6) << 6,
      buf = new Uint8Array(size);
    buf.set(bytes);
    buf[len] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(size - 8, Math.floor((len * 8) / 0x100000000));
    dv.setUint32(size - 4, (len * 8) >>> 0);
    const hv = Uint32Array.from(H0);
    for (let off = 0; off < size; off += 64) {
      for (let i = 0; i < 16; i++) W[i] = dv.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++) {
        const a = W[i - 15],
          b = W[i - 2];
        W[i] = (W[i - 16] + (ror(a, 7) ^ ror(a, 18) ^ (a >>> 3)) + W[i - 7] + (ror(b, 17) ^ ror(b, 19) ^ (b >>> 10))) | 0;
      }
      let [a, b, c, d, e, f, g, h] = hv;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0,
          t2 = ((ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g;
        g = f;
        f = e;
        e = (d + t1) | 0;
        d = c;
        c = b;
        b = a;
        a = (t1 + t2) | 0;
      }
      hv[0] += a;
      hv[1] += b;
      hv[2] += c;
      hv[3] += d;
      hv[4] += e;
      hv[5] += f;
      hv[6] += g;
      hv[7] += h;
    }
    return Array.from(hv, (x) => x.toString(16).padStart(8, '0')).join('');
  };
  /** The 256 bits of a hex hash, as an array of 0s and 1s. */
  CR.bits = (hex) => Array.from(hex).flatMap((ch) => parseInt(ch, 16).toString(2).padStart(4, '0').split('').map(Number));
  CR.short = (hex, n = 10) => hex.slice(0, n) + '…';

  /* ---------- canvas helpers in pixel space, for diagrams that aren't charts ---------- */
  function circle(k, x, y, r, fill, stroke, lw = 2, dash) {
    k.save();
    k.beginPath();
    k.arc(x, y, r, 0, Math.PI * 2);
    if (fill) (k.fillStyle = fill), k.fill();
    if (stroke) {
      k.strokeStyle = stroke;
      k.lineWidth = lw;
      if (dash) k.setLineDash(dash);
      k.stroke();
    }
    k.restore();
  }
  function label(k, s, x, y, o = {}) {
    k.save();
    k.font = SS.MONO(o.size || 11, o.weight || 600);
    k.fillStyle = o.color || SS.pal().ink;
    k.textAlign = o.align || 'center';
    k.textBaseline = 'middle';
    k.fillText(s, x, y);
    k.restore();
  }
  function seg2(k, a, b, color, w = 1.5, dash) {
    k.save();
    k.strokeStyle = color;
    k.lineWidth = w;
    if (dash) k.setLineDash(dash);
    k.beginPath();
    k.moveTo(a[0], a[1]);
    k.lineTo(b[0], b[1]);
    k.stroke();
    k.restore();
  }
  function pill(k, s, x, y, bg, fg) {
    k.save();
    k.font = SS.MONO(10.5, 700);
    const w = k.measureText(s).width + 12;
    k.fillStyle = bg;
    k.beginPath();
    rrect(k, x - w / 2, y - 9, w, 18, 9);
    k.fill();
    k.fillStyle = fg;
    k.textAlign = 'center';
    k.textBaseline = 'middle';
    k.fillText(s, x, y + 0.5);
    k.restore();
  }
  // A rounded rectangle path, with a plain rectangle where roundRect isn't supported.
  const rrect = (k, x, y, w, hh, r) => (k.roundRect ? k.roundRect(x, y, w, hh, r) : k.rect(x, y, w, hh));
  function cross(k, x, y, s, color) {
    seg2(k, [x - s, y - s], [x + s, y + s], color, 3);
    seg2(k, [x - s, y + s], [x + s, y - s], color, 3);
  }
  CR.draw = { circle, label, seg2, pill, cross, rrect };

  /* ---------- tiny RSA: real signature math with numbers small enough to read ---------- */
  CR.RSA = { p: 61, q: 53, n: 3233, e: 17, d: 2753 };
  CR.modpow = function (b, e, m) {
    let r = 1n,
      x = BigInt(b) % BigInt(m),
      k = BigInt(e);
    const M = BigInt(m);
    while (k > 0n) {
      if (k & 1n) r = (r * x) % M;
      x = (x * x) % M;
      k >>= 1n;
    }
    return Number(r);
  };
  /** A message's fingerprint, shrunk below n so the tiny key can sign it. */
  CR.digest = (msg) => parseInt(CR.sha256(msg).slice(0, 8), 16) % CR.RSA.n;
})();
