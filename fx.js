const FX = {
  ctx: null, parts: [], sq: [], talking: false, mus: 0,
  init() {
    if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; this.ctx = new A(); }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(f, d, type, v, when, slide) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + (when || 0), o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.linearRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(v || 0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + d);
  },
  gong() { this.tone(110, 2.2, 'sine', 0.4); this.tone(220, 1.6, 'triangle', 0.15); },
  chime() { [880, 1175, 1568].forEach((f, i) => this.tone(f, 0.9, 'sine', 0.12, i * 0.12)); },
  clack() { this.tone(900, 0.08, 'square', 0.12); this.tone(600, 0.08, 'square', 0.1, 0.12); },
  splash() { this.tone(400, 0.25, 'sine', 0.1, 0, -250); },
  // เพลงบรรเลงสไตล์จีน (pentatonic) เล่นวนตลอด เสียงเบา
  music() {
    if (this.mus || !this.ctx) return; this.mus = 1;
    const P = [293.66, 329.63, 392, 440, 493.88, 587.33, 659.25]; let i = 3;
    setInterval(() => {
      i = Math.max(0, Math.min(P.length - 1, i + Math.floor(Math.random() * 5) - 2));
      this.tone(P[i], 1.4, 'triangle', 0.05);
      if (Math.random() < 0.3) this.tone(P[i] / 2, 2, 'sine', 0.04, 0.2);
      if (Math.random() < 0.05) this.tone(1760, 3, 'sine', 0.03);
    }, 900);
  },
  // อ่านออกเสียงทีละข้อความ ไม่ตัดกัน; start() เรียกตอนเริ่มพูด, end() ตอนพูดจบ
  say(text, start, end) {
    const t = String(text).replace(/[\u3400-\u9fff]/g, '').replace(/[·›\/]/g, ', ').replace(/[^\u0E00-\u0E7Fa-zA-Z0-9 ,.:!?()]/g, ' ').replace(/\s+/g, ' ').trim();
    this.sq.push({ t, start, end }); if (!this.talking) this.next();
  },
  next() {
    const j = this.sq.shift(); if (!j) { this.talking = false; return; }
    this.talking = true; let done = false;
    const fin = () => { if (done) return; done = true; clearTimeout(tm); j.end && j.end(); this.next(); };
    const tm = setTimeout(fin, j.t.length * 110 + 2500);
    j.start && j.start();
    try {
      if (!j.t) return fin();
      const u = new SpeechSynthesisUtterance(j.t); u.lang = 'th-TH'; u.rate = 0.95;
      const v = speechSynthesis.getVoices().find((x) => x.lang.replace('_', '-').startsWith('th')); if (v) u.voice = v;
      u.onend = fin; u.onerror = fin; speechSynthesis.speak(u);
    } catch (e) { fin(); }
  },
  burst(x, y, n, col) {
    for (let i = 0; i < (n || 24); i++) this.parts.push({ x, y, vx: (Math.random() - 0.5) * 7, vy: -Math.random() * 6 - 1, l: 1, c: col || '#ffd54a', s: 3 + Math.random() * 4 });
  },
  step(g) {
    this.parts = this.parts.filter((p) => p.l > 0);
    this.parts.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.l -= 0.015;
      g.globalAlpha = Math.max(0, p.l); g.fillStyle = p.c; g.fillRect(p.x, p.y, p.s, p.s);
    });
    g.globalAlpha = 1;
  }
};
