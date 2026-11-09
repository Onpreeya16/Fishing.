
/* ===== เสียง: iPhone Safari + Chrome ===== */
let AC = null, muted = false, NB = null;
const lastS = {};
let audioReady = false;

function ac() {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  return AC;
}

function unlockAudio() {
  const a = ac();
  if (!a || muted) return;

  if (a.state !== 'running') {
    a.resume().then(() => {
      audioReady = a.state === 'running';
      if (audioReady) {
        const o = a.createOscillator();
        const g = a.createGain();
        g.gain.value = 0.00001;
        o.connect(g);
        g.connect(a.destination);
        o.start();
        o.stop(a.currentTime + 0.03);
      }
    }).catch(() => {});
  } else {
    audioReady = true;
  }
}

function playTone(f, t0, d, type, v, f2) {
  const a = ac();
  if (!a || muted || a.state !== 'running') return;

  const t = a.currentTime + t0;
  const o = a.createOscillator();
  const g = a.createGain();

  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);

  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + d + 0.05);
}

function tone(f, t0, d, type, v, f2) {
  const a = ac();
  if (!a || muted) return;

  if (a.state === 'running') {
    playTone(f, t0, d, type, v, f2);
  } else {
    a.resume().then(() => {
      if (!muted && a.state === 'running') {
        playTone(f, t0, d, type, v, f2);
      }
    }).catch(() => {});
  }
}

function noise(t0, d, f, v, f2) {
  const a = ac();
  if (!a || muted) return;

  const play = () => {
    if (muted || a.state !== 'running') return;

    if (!NB) {
      NB = a.createBuffer(1, a.sampleRate, a.sampleRate);
      const b = NB.getChannelData(0);
      for (let i = 0; i < b.length; i++) {
        b[i] = Math.random() * 2 - 1;
      }
    }

    const t = a.currentTime + t0;
    const s = a.createBufferSource();
    const fl = a.createBiquadFilter();
    const g = a.createGain();

    s.buffer = NB;
    s.loop = true;
    fl.type = 'bandpass';
    fl.Q.value = 1.2;
    fl.frequency.setValueAtTime(f, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);

    s.connect(fl);
    fl.connect(g);
    g.connect(a.destination);
    s.start(t);
    s.stop(t + d + 0.05);
  };

  if (a.state === 'running') play();
  else a.resume().then(play).catch(() => {});
}

const SFX = {
  gift() {
    tone(880, 0, .12, 'sine', .12);
    tone(1320, .09, .18, 'sine', .12);
  },
  cast() {
    noise(0, .35, 400, .14, 2600);
  },
  splash() {
    noise(0, .3, 2000, .12, 500);
    tone(320, 0, .14, 'sine', .12, 120);
  },
  bite() {
    tone(520, 0, .06, 'square', .05);
    tone(520, .1, .06, 'square', .05);
    tone(200, .16, .22, 'sine', .16, 90);
  },
  reel() {
    noise(0, .05, 3200, .06);
  },
  catch() {
    [784, 988, 1175].forEach((f, i) =>
      tone(f, i * .08, .28, 'triangle', .14)
    );
  },
  big() {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone(f, i * .09, .55, 'sawtooth', .06)
    );
    tone(130, 0, .6, 'sine', .22, 60);
    noise(.35, .9, 6000, .05);
  },
  legend() {
    [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) =>
      tone(f, i * .1, .8, 'sawtooth', .06)
    );
    [523, 659, 784].forEach(f =>
      tone(f, .8, 1.6, 'triangle', .09)
    );
    tone(90, 0, 1, 'sine', .3, 40);
    noise(0, .5, 300, .15, 100);
    noise(.7, 1.5, 7000, .06);
  }
};

const GAP = {
  reel: 260,
  cast: 120,
  splash: 120,
  bite: 120
};

function sfx(n) {
  if (muted || !SFX[n]) return;

  const t = performance.now();
  if (t - (lastS[n] || 0) < (GAP[n] || 60)) return;

  lastS[n] = t;
  try {
    SFX[n]();
  } catch (e) {}
}

document.addEventListener('pointerdown', unlockAudio, true);
document.addEventListener('touchend', unlockAudio, {
  capture: true,
  passive: true
});

/* ===== อ่านคำทำนาย (TTS) + พิมพ์ทีละตัวอักษร ===== */
const TTSX = { on: true, voice: null };
const TTS_OK = 'speechSynthesis' in window;
const ttsBtn = document.createElement('button');

ttsBtn.type = 'button';
ttsBtn.className = 'alt';
document.querySelector('.ctrl .row').appendChild(ttsBtn);

function ttsLabel() {
  ttsBtn.textContent = 'อ่านคำทำนาย: ' +
    (TTSX.on
      ? (TTS_OK && !TTSX.voice ? 'เปิด (ไม่พบเสียงไทย)' : 'เปิด')
      : 'ปิด');
}

function ttsPick() {
  if (!TTS_OK) return;
  TTSX.voice = speechSynthesis.getVoices()
    .find(v => /^th/i.test(v.lang)) || null;
  ttsLabel();
}

if (TTS_OK) {
  ttsPick();
  speechSynthesis.onvoiceschanged = ttsPick;
}

ttsLabel();

ttsBtn.onclick = () => {
  TTSX.on = !TTSX.on;
  if (!TTSX.on && TTS_OK) speechSynthesis.cancel();
  ttsLabel();
};

function ttsSpeak(t) {
  if (!TTSX.on || muted || !TTS_OK || !TTSX.voice) return false;

  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.voice = TTSX.voice;
    u.lang = TTSX.voice.lang || 'th-TH';
    u.rate = .95;
    speechSynthesis.speak(u);
    return true;
  } catch (e) {
    return false;
  }
}

const SEGX = (window.Intl && Intl.Segmenter)
  ? new Intl.Segmenter('th', { granularity: 'grapheme' })
  : null;

function thSplit(t) {
  return SEGX
    ? Array.from(SEGX.segment(t), s => s.segment)
    : Array.from(t);
}

addEventListener('pointerdown', () => {
  if (TTS_OK) {
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
}, { once: true });

/* ===== ป๊อปอัปตกปลา ===== */
const popQ = [];
let pop = null, parts = [], lastP = 0;

function catchPop(name, k, txt, g) {
  const w = +(g.sz[0] +
    (g.sz[1] - g.sz[0]) *
    Math.min(1, Math.random() * .55 + k * .15)).toFixed(1);

  const tier = k === 3 ? 2 : (k === 2 || w >= 5) ? 1 : 0;

  popQ.push({ name, k, txt, w, tier });

  if (popQ.filter(p => !p.tier).length > 4) {
    popQ.splice(popQ.findIndex(p => !p.tier), 1);
  }
}

function burst(n) {
  const cf = document.getElementById('conf');
  if (cf.width !== W || cf.height !== H) {
    cf.width = W;
    cf.height = H;
  }

  const m = Math.max(2, Math.round(n * .45));

  for (let i = 0; i < m; i++) {
    parts.push({
      x: W * .27,
      y: H * .3,
      vx: rnd(-220, 220),
      vy: rnd(-340, -80),
      r: rnd(0, 6),
      vr: rnd(-8, 8),
      c: ['#f2c14e', '#f08aa6', '#6fffd0', '#fff6e0', '#9b7bff'][i % 5],
      s: rnd(4, 7)
    });
  }
}

const puEl = document.createElement('div');
const pnEl = document.getElementById('pn');
const phdEl = document.createElement('div');
const pnWrap = document.createElement('div');

puEl.id = 'pu';
phdEl.id = 'phd';
pnEl.parentNode.insertBefore(puEl, pnEl);
pnWrap.append(pnEl, phdEl);
puEl.appendChild(pnWrap);

function popupTick(now) {
  const el = document.getElementById('pop');
  const dt = Math.min((now - lastP) / 1000, .05);
  lastP = now;

  if (!pop && popQ.length) {
    pop = popQ.shift();
    pop.t0 = now;
    pop.seg = thSplit('“' + pop.txt + '”');
    pop.shown = -1;

    const spoke = popQ.length <= 2 && ttsSpeak(pop.txt);
    const est = pop.txt.length / 8 * 1000 + 700;

    pop.typeMs = spoke ? est * .85 : Math.min(1800, pop.seg.length * 45);

    const base = pop.tier === 2 ? 7000 :
      pop.tier ? 5500 : (popQ.length > 2 ? 2600 : 4200);

    pop.dur = Math.max(base, pop.typeMs + 1200, spoke ? est + 500 : 0);

    const u = userOf(pop.name);
    puEl.querySelectorAll('.av').forEach(a => a.remove());
    puEl.prepend(avEl(pop.name, pop.tier ? 30 : 22));

    pnEl.textContent = u.nick;
    phdEl.textContent = '@' + u.id;

    el.className = (pop.tier ? 'b' : 'n') + (pop.tier === 2 ? ' l' : '');

    document.getElementById('pt').textContent =
      pop.tier === 2 ? 'ปลาในตำนาน! 🐉' :
      pop.tier ? 'ตกได้ปลาตัวใหญ่!' : 'ตกได้แล้ว';

    document.getElementById('pf').textContent =
      RAR[pop.k].n + ' · ' + pop.w + ' กก.';

    void el.offsetWidth;
    el.classList.add('on');

    sfx(pop.tier === 2 ? 'legend' : pop.tier ? 'big' : 'catch');

    if (pop.tier) {
      burst(pop.tier === 2 ? 190 : 110);
      if (pop.tier === 2) {
        const st = document.getElementById('stage');
        st.classList.remove('shake');
        void st.offsetWidth;
        st.classList.add('shake');
      }
    }
  }

  if (pop) {
    const age = now - pop.t0;
    const k = pop.k;
    const g = document.getElementById('pcv').getContext('2d');

    const sP = (12 + k * 5) * (k === 3 ? 1.12 : 1);
    const L = (.85 + FSP[k].tl) * sP;
    const R = 1.1 * sP;
    const m = Math.min(2.9, 130 / ((L + R) / 2));

    g.clearRect(0, 0, 280, 160);
    g.save();
    g.translate(140 - m * (R - L) / 2, 80);
    g.scale(m, m);
    drawFishOn(g, {
      x: 0,
      y: Math.sin(age / 400) * 4 / m,
      vx: 1,
      ph: age / 170,
      glow: 1,
      r: k
    });
    g.restore();

    const n = Math.min(
      pop.seg.length,
      Math.floor(Math.max(0, age - 250) / pop.typeMs * pop.seg.length)
    );

    if (n !== pop.shown) {
      pop.shown = n;
      const q = document.getElementById('pq');
      q.textContent = '';

      const a = document.createElement('span');
      const b = document.createElement('span');

      a.textContent = pop.seg.slice(0, n).join('');
      b.textContent = pop.seg.slice(n).join('');
      b.style.opacity = '0';
      q.append(a, b);
    }

    if (pop.tier) {
      document.getElementById('pf').textContent =
        RAR[k].n + ' · ' +
        (pop.w * Math.min(1, age / 1400)).toFixed(1) + ' กก.';
    }

    if (pop.tier === 2 && Math.random() < dt * 12) burst(4);

    if (age > pop.dur) {
      el.classList.remove('on');
      pop = null;
    }
  }

  if (parts.length) {
    const cf = document.getElementById('conf');
    const c2 = cf.getContext('2d');
    c2.clearRect(0, 0, cf.width, cf.height);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += 520 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;

      if (p.y > H + 20) {
        parts.splice(i, 1);
        continue;
      }

      c2.fillStyle = p.c;
      c2.save();
      c2.translate(p.x, p.y);
      c2.rotate(p.r);
      c2.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      c2.restore();
    }

    if (!parts.length) c2.clearRect(0, 0, cf.width, cf.height);
  }
}

/* ===== วาดปลา ===== */
function sm(ctx, x, y, r, c) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = c;
  ctx.fill();
}

function drawFishOn(g, o) {
  const { x, y, vx, ph, glow, r } = o;
  const f = FSP[r];

  g.save();
  g.translate(x, y);
  g.scale(vx >= 0 ? 1 : -1, 1);

  const tail = Math.sin(ph) * 5;

  if (glow) {
    g.shadowColor = RAR[r].c;
    g.shadowBlur = 16;
  }

  /* ลำตัว */
  g.beginPath();
  g.moveTo(-f.tl * .45, 0);
  g.quadraticCurveTo(
    -f.tl * .2, -f.th * .75,
    f.tl * .35, 0
  );
  g.quadraticCurveTo(
    -f.tl * .2, f.th * .75,
    -f.tl * .45, 0
  );
  g.closePath();

  const grad = g.createLinearGradient(0, -f.th, 0, f.th);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(.25, RAR[r].c);
  grad.addColorStop(1, '#334b62');

  g.fillStyle = grad;
  g.fill();

  /* หาง */
  g.shadowBlur = 0;
  g.beginPath();
  g.moveTo(-f.tl * .35, 0);
  g.lineTo(-f.tl * .65, -f.th * .6 + tail);
  g.lineTo(-f.tl * .65, f.th * .6 + tail);
  g.closePath();
  g.fillStyle = RAR[r].c;
  g.fill();

  /* ครีบบน */
  g.beginPath();
  g.moveTo(-f.tl * .1, -f.th * .45);
  g.lineTo(f.tl * .1, -f.th * .85);
  g.lineTo(f.tl * .3, -f.th * .3);
  g.closePath();
  g.fillStyle = '#d8e9ef';
  g.fill();

  /* ครีบล่าง */
  g.beginPath();
  g.moveTo(-f.tl * .05, f.th * .4);
  g.lineTo(f.tl * .15, f.th * .8);
  g.lineTo(f.tl * .3, f.th * .25);
  g.closePath();
  g.fillStyle = '#d8e9ef';
  g.fill();

  /* ตา */
  sm(g, f.tl * .25, -f.th * .12, Math.max(1.5, f.th * .09), '#fff');
  sm(g, f.tl * .27, -f.th * .12, Math.max(1, f.th * .045), '#17212b');

  /* เหงือก */
  g.beginPath();
  g.arc(f.tl * .05, 0, f.th * .35, -.9, .9);
  g.strokeStyle = 'rgba(255,255,255,.65)';
  g.lineWidth = 1;
  g.stroke();

  g.restore();
}


