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
  pluck(f) { this.tone(f, 0.5, 'triangle', 0.06); this.tone(f * 2, 0.25, 'sine', 0.02); },
  drum() { this.tone(130, 0.3, 'sine', 0.2, 0, -90); },
  cym() {
    if (!this.ctx) return; const c = this.ctx, n = c.sampleRate * 0.4, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; fl.type = 'highpass'; fl.frequency.value = 5000; g.gain.value = 0.07;
    s.connect(fl); fl.connect(g); g.connect(c.destination); s.start();
  },
  erhu(f, d, v) { // เสียงซอ: เลื่อยฟันปลา + กรอง + สั่นเสียง
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime, o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), fl = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = f; l.frequency.value = 5.5; lg.gain.value = f * 0.012; l.connect(lg); lg.connect(o.frequency); fl.type = 'lowpass'; fl.frequency.value = 1600;
    g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(v, t + 0.12); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(fl); fl.connect(g); g.connect(c.destination); o.start(t); l.start(t); o.stop(t + d); l.stop(t + d);
  },
  // เพลงบรรเลงสไตล์ตรุษจีน: กู่เจิงเดินทำนอง + ซอ + กลองและฉาบจังหวะสิงโต (เรียบเรียงเอง)
  music() {
    if (this.mus || !this.ctx) return; this.mus = 1;
    const S = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1318.5];
    const PH = [[0, 2, 3, 2, 4, 3, 2, 0, 3, 4, 5, 4, 3, 2, 0, -1], [2, 3, 4, 5, 4, 3, 2, 3, 4, 5, 6, 5, 4, 3, 2, -1], [0, 0, 2, 3, 4, 3, 2, 3, 5, 4, 3, 2, 3, 2, 0, 0]];
    let n = 0, ph = PH[0];
    setInterval(() => {
      const k = n % 16, b = k % 8; n++;
      if (k === 0 && Math.random() < 0.6) ph = PH[Math.floor(Math.random() * PH.length)];
      const i = ph[k];
      if (i >= 0) { this.pluck(S[i]); if (b === 0) this.erhu(S[i] / 2, 1.6, 0.035); }
      if (b === 0 || b === 2 || b === 4 || b === 5) this.drum();
      if (b === 6) this.cym();
    }, 230);
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
      const u = new SpeechSynthesisUtterance(j.t); u.lang = 'th-TH'; u.rate = 1.1;
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
