const FX = (() => {
  let ac;
  function unlock() {
    if (!ac) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return;
      ac = new A();
    }
    if (ac.state === 'suspended') ac.resume();
  }
  function tone(f, d, type = 'sine', v = 0.15, at = 0, to = null) {
    if (!ac) return;
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + d + 0.02);
  }
  function noise(d, v = 0.1) {
    if (!ac) return;
    const n = (ac.sampleRate * d) | 0;
    const b = ac.createBuffer(1, n, ac.sampleRate);
    const a = b.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(), g = ac.createGain();
    s.buffer = b; g.gain.value = v;
    s.connect(g).connect(ac.destination);
    s.start();
  }
  return {
    unlock,
    cast()   { tone(600, 0.25, 'triangle', 0.1, 0, 200); noise(0.25, 0.06); },
    splash() { noise(0.35, 0.1); tone(300, 0.2, 'sine', 0.08, 0, 120); },
    bite()   { tone(880, 0.1, 'square', 0.08); tone(1175, 0.15, 'square', 0.08, 0.1); },
    sizzle() { noise(0.9, 0.07); },
    ding()   { tone(1320, 0.2, 'sine', 0.12); tone(1760, 0.3, 'sine', 0.08, 0.1); },
    coin()   { tone(988, 0.08, 'square', 0.07); tone(1319, 0.25, 'square', 0.07, 0.08); },
    win(r) {
      [523, 659, 784, 1047, 1319, 1568].slice(0, 2 + Math.min(r, 4))
        .forEach((f, i) => tone(f, 0.25, 'triangle', 0.13, i * 0.09));
    },
    speak(text) {
      try {
        const s = window.speechSynthesis;
        s.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'th-TH';
        const v = s.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('th'));
        if (v) u.voice = v;
        s.speak(u);
      } catch (e) {}
    }
  };
})();
