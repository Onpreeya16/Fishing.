const FX = {
  ctx: null, parts: [], sq: [], talking: false, mus: 0, u: null, aud: null, unlocked: 0, dbg: 'TTS: ยังไม่ได้เริ่ม',
  init() {
    if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; this.ctx = new A(); }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    try { if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); } } catch (e) {}
    this.unlock();
  },
  // มือถือต้องปลดล็อกเสียงพูดในจังหวะที่ผู้ใช้แตะจอ (เรียกจาก init ตอนแตะเริ่ม)
  unlock() {
    if (this.unlocked) return;
    const ua = navigator.userActivation; if (ua && !ua.isActive) return; // ไม่ได้มาจากการแตะ ยังปลดล็อกไม่ได้
    this.unlocked = 1; this.dbg = 'TTS: ปลดล็อกแล้ว';
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'th-TH'; speechSynthesis.speak(u); } catch (e) {}
    try {
      if (!this.aud) this.aud = new Audio();
      this.aud.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      const p = this.aud.play(); if (p && p.catch) p.catch(() => {});
    } catch (e) {}
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

  // ---------- เสียงพูด ----------
  // อ่านออกเสียงทีละข้อความ ไม่ตัดกัน; start() เรียกตอนเริ่มพูด, end() ตอนพูดจบ
  say(text, start, end) {
    const t = String(text).replace(/[\u3400-\u9fff]/g, '').replace(/[·›\/]/g, ', ').replace(/[^\u0E00-\u0E7Fa-zA-Z0-9 ,.:!?()]/g, ' ').replace(/\s+/g, ' ').trim();
    this.sq.push({ t, start, end }); if (!this.talking) this.next();
  },
  // ตัดข้อความเป็นท่อนสั้น (ไม่เกิน ~80 ตัวอักษร) ตัดตามคำ เพื่อไม่ให้เบราว์เซอร์หยุดอ่านกลางคัน
  chunk(t) {
    const out = []; let cur = '';
    const words = (typeof Intl !== 'undefined' && Intl.Segmenter) ? [...new Intl.Segmenter('th', { granularity: 'word' }).segment(t)].map((s) => s.segment) : t.split(/(?<= )/);
    for (const w of words) {
      if ((cur + w).length > 80 && cur) { out.push(cur.trim()); cur = w; } else cur += w;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  },
  next() {
    const j = this.sq.shift(); if (!j) { this.talking = false; return; }
    this.talking = true; let done = false;
    const fin = () => { if (done) return; done = true; clearTimeout(tm); j.end && j.end(); this.next(); };
    // กันค้าง: ถ้าพูดนานเกินไปให้ตัดแล้วไปข้อความถัดไป
    const tm = setTimeout(() => {
      if (done) return;
      this.dbg = 'TTS: หมดเวลา ข้ามข้อความ';
      try { speechSynthesis.cancel(); } catch (e) {}
      try { this.aud && this.aud.pause(); } catch (e) {}
      fin();
    }, j.t.length * 140 + 6000);
    j.start && j.start();
    if (!j.t) return fin();
    const parts = this.chunk(j.t), alive = () => !done;
    const run = (i) => {
      if (done) return;
      if (i >= parts.length) return fin();
      this.speak(parts[i], () => run(i + 1), alive);
    };
    run(0);
  },
  // พูดท่อนเดียว: ใช้เสียงไทยในเครื่องก่อน ถ้าไม่มี/ใช้ไม่ได้ ใช้เสียงออนไลน์แทน
  speak(t, cb, alive) {
    let called = false; const go = () => { if (called) return; called = true; cb(); };
    const web = () => this.web(t, go, alive);
    const ss = window.speechSynthesis;
    if (!ss || typeof SpeechSynthesisUtterance === 'undefined') { this.dbg = 'TTS: เครื่องไม่รองรับ -> ออนไลน์'; return web(); }
    const vs = ss.getVoices(), v = vs.find((x) => x.lang.replace('_', '-').toLowerCase().startsWith('th'));
    if (vs.length && !v) { this.dbg = 'TTS: ไม่มีเสียงไทยในเครื่อง -> ออนไลน์'; return web(); }
    try {
      const u = new SpeechSynthesisUtterance(t); u.lang = 'th-TH'; u.rate = 1.05; if (v) u.voice = v;
      u.onstart = () => { this.dbg = 'TTS: กำลังพูด (เสียงในเครื่อง)'; };
      u.onend = go;
      u.onerror = (e) => {
        if (!alive() || e.error === 'canceled' || e.error === 'interrupted') return go();
        this.dbg = 'TTS: เสียงในเครื่องผิดพลาด (' + e.error + ') -> ออนไลน์';
        if (!called) web();
      };
      this.u = u; // เก็บอ้างอิงไว้ กันเบราว์เซอร์เก็บกวาดทิ้งจน onend ไม่ทำงาน
      ss.resume(); ss.speak(u);
    } catch (e) { web(); }
  },
  // เสียงไทยออนไลน์ (Google Translate TTS แบบไม่เป็นทางการ ต้องมีอินเทอร์เน็ต) ใช้ตัวเล่นเสียงตัวเดิมที่ปลดล็อกไว้แล้ว
  web(t, go, alive) {
    if (!alive()) return go();
    try {
      if (!this.aud) this.aud = new Audio();
      const a = this.aud;
      a.onended = () => { this.dbg = 'TTS: เล่นเสียงออนไลน์จบ'; go(); };
      a.onerror = () => { this.dbg = 'TTS: โหลดเสียงออนไลน์ไม่ได้'; go(); };
      a.src = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=th&q=' + encodeURIComponent(t);
      this.dbg = 'TTS: กำลังพูด (เสียงออนไลน์)';
      const p = a.play(); if (p && p.catch) p.catch((e) => { this.dbg = 'TTS: เล่นเสียงออนไลน์ไม่ได้ (' + e.name + ')'; go(); });
    } catch (e) { go(); }
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
    // โหมดแก้ปัญหา: เปิดเกมด้วย ?debug เพื่อดูสถานะเสียงพูดบนจอ
    if (location.search.includes('debug')) {
      g.font = '16px sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = '#000'; g.fillStyle = '#7CFC00';
      const s = this.dbg + ' | คิวพูด ' + this.sq.length + (this.talking ? ' | talking' : '');
      g.strokeText(s, 14, 1215); g.fillText(s, 14, 1215);
    }
  }
};
