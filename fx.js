const FX = {
  ctx: null, parts: [],
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
  speak(t) {
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'th-TH'; speechSynthesis.speak(u); } catch (e) {}
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
