const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 720, H = 1280;
cv.width = W; cv.height = H;
const SANS = "'Noto Sans Thai',Sarabun,Tahoma,sans-serif", SERIF = "'Noto Serif TC','Songti TC',SimSun,serif";
const TEST = location.search.includes('test'), seg = new Intl.Segmenter('th', { granularity: 'word' });
const queue = [], users = {}, counts = { altar: 0, rice: 0, fish: 0 }, shared = {}, ST = {}, walkers = [], sadhu = [], lastSadhu = {};
let hits = [], cur = null, curT = 0, lastStep = 0, started = false, goal = 0, goalMax = 35, goalFlash = 0;

STATIONS.forEach((s, i) => {
  if (i === 0) Object.assign(s, { x: 200, y: 318, w: 320, h: 172 });
  else { const k = i - 1; Object.assign(s, { x: 8 + (k % 3) * 236, y: 505 + Math.floor(k / 3) * 192, w: 224, h: 178 }); }
  ST[s.id] = s;
});

const hs = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const trunc = (s, n) => ([...s].length > n ? [...s].slice(0, n).join('') + '…' : s);
const animalOf = (id, name) => (users[id] !== undefined ? users[id] : hs(id || name) % 12);

function matchGift(name) {
  const n = String(name || '').toLowerCase();
  return GIFTS.find((q) => q.m.some((x) => (q.x ? n === x : n.includes(x))));
}
function enqueue(it) { if (queue.length >= 40) return; if (it.f) queue.unshift(it); else queue.push(it); }
function onGift(m) {
  const q = matchGift(m.name); if (!q) return;
  const n = Math.min(m.count || 1, 5);
  for (let i = 0; i < n; i++) q.st.forEach((st) => enqueue({ st, user: m.user, id: m.id, f: q.f }));
}
function onShare(m) { if (shared[m.id]) return; shared[m.id] = 1; enqueue({ st: 'altar', user: m.user, id: m.id }); }
function onChat(m) {
  const raw = String(m.text || '').trim();
  if (raw.includes('สาธุ')) {
    const n = Date.now();
    if (cur && n - (lastSadhu[m.id] || 0) > 10000) {
      lastSadhu[m.id] = n; sadhu.push({ n: m.user, t: performance.now() });
      if (sadhu.length > 4) sadhu.shift();
      FX.tone(660, 0.5, 'sine', 0.08);
    }
    return;
  }
  const t = raw.replace(/^ปี/, '');
  const a = ANIMALS.indexOf(t); if (a >= 0) { users[m.id] = a; return; }
  const y = t.match(/\b(\d{4})\b/);
  if (y) { let v = +y[1]; if (v > 2300) v -= 543; if (v >= 1940 && v <= 2020) users[m.id] = (((v - 4) % 12) + 12) % 12; }
}

function sfx(st) {
  if (st === 'altar') FX.gong();
  else if (st === 'fish') { FX.splash(); FX.chime(); }
  else if (st === 'buei') FX.clack();
  else if (st === 'qian') { FX.clack(); FX.chime(); }
  else FX.chime();
}

// เริ่มเดิน: ตัวละครออกจากบันไดด้านล่างไปที่จุดของขวัญ
function run(it) {
  const s = ST[it.st], now = performance.now(), sx = W / 2 + (Math.random() - 0.5) * 140, sy = 1050;
  walkers.push({
    n: it.user || 'ผู้ใจบุญ', id: it.id, st: it.st, sx, sy, cx: sx, cy: sy,
    tx: s.x + 36 + Math.random() * (s.w - 72), ty: s.y + s.h - 46, t0: now, arrivedAt: 0
  });
  if (walkers.length > 40) walkers.shift();
}
// เดินถึงแล้ว: ให้ผลดวง เสียง เอฟเฟกต์ และนับเป้าหมาย
function arrive(w, now) {
  w.arrivedAt = now;
  const a = animalOf(w.id, w.n), r = makeReading(w.st);
  cur = Object.assign(r, { user: w.n, a, st: w.st }); curT = now;
  if (counts[w.st] !== undefined) counts[w.st]++;
  sfx(w.st);
  const s = ST[w.st]; FX.burst(s.x + s.w / 2, s.y + s.h / 2, 36);
  FX.speak(w.n + ' ' + r.th + ' ' + r.lines.join(' '));
  if (++goal >= goalMax) {
    goal = 0; goalMax = Math.min(100, goalMax + 5); goalFlash = now;
    FX.gong(); FX.burst(W / 2, 640, 80, '#ff5a36');
  }
}
function step(now) {
  if (!started || !queue.length) return;
  if (now - lastStep > Math.max(2500, 7000 - queue.length * 350)) { lastStep = now; run(queue.shift()); }
}

const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function tx(s, x, y, size, col, al, font) { g.font = size + 'px ' + (font || SANS); g.fillStyle = col; g.textAlign = al || 'left'; g.fillText(s, x, y); }
function wrap(s, x, y, mw, lh, size, col, max) {
  g.font = size + 'px ' + SANS; let line = '', n = 1;
  for (const w of seg.segment(s)) {
    const t = line + w.segment;
    if (g.measureText(t).width > mw && line) { tx(line, x, y, size, col); y += lh; line = w.segment.trimStart(); if (++n > max) return y; }
    else line = t;
  }
  tx(line, x, y, size, col); return y + lh;
}

function panel(side, x, title) {
  rr(x, 88, 348, 226, 12); g.fillStyle = 'rgba(40,0,0,.85)'; g.fill(); g.strokeStyle = '#e8b923'; g.lineWidth = 2; g.stroke();
  tx(title, x + 174, 114, 18, '#ffd54a', 'center');
  let y = 140;
  GIFTS.filter((q) => q.s === side).forEach((q) => {
    tx(q.e + ' ' + q.n + ' › ' + q.a, x + 12, y, 15, '#fff');
    if (TEST) hits.push({ x, y: y - 18, w: 348, h: 26, q });
    y += 26;
  });
}

function drawSt(s, t) {
  const on = cur && cur.st === s.id && t - curT < 7000;
  rr(s.x, s.y, s.w, s.h, 16); g.fillStyle = on ? '#9b1c1c' : '#5c0f0f'; g.fill();
  g.lineWidth = on ? 5 : 3; g.strokeStyle = on ? '#fff3a0' : '#e8b923'; g.stroke();
  tx(s.zh, s.x + s.w / 2, s.y + s.h * 0.62, s.id === 'altar' ? 90 : 64, 'rgba(255,213,74,.35)', 'center', SERIF);
  tx(s.th, s.x + s.w / 2, s.y + 24, 17, '#fff', 'center');
  if (counts[s.id] !== undefined) tx('×' + counts[s.id], s.x + s.w - 10, s.y + s.h - 10, 16, '#ffd54a', 'right');
  if (s.id === 'fish') {
    const n = Math.min(8, 2 + counts.fish);
    for (let i = 0; i < n; i++) {
      const fx = s.x + 24 + ((t / 25 * (0.6 + i * 0.1) + i * 47) % (s.w - 48)), fy = s.y + s.h - 30 + Math.sin(t / 400 + i) * 8;
      g.fillStyle = i % 2 ? '#ff8c1a' : '#ff5a36';
      g.beginPath(); g.ellipse(fx, fy, 15, 7, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(fx - 12, fy); g.lineTo(fx - 24, fy - 7); g.lineTo(fx - 24, fy + 7); g.fill();
    }
  }
}

function drawWalkers(t) {
  for (let i = walkers.length - 1; i >= 0; i--) if (walkers[i].arrivedAt && t - walkers[i].arrivedAt > 20000) walkers.splice(i, 1);
  walkers.forEach((w) => {
    if (!w.arrivedAt) {
      const p = Math.min(1, (t - w.t0) / 1800), e = p * p * (3 - 2 * p);
      w.cx = w.sx + (w.tx - w.sx) * e;
      w.cy = w.sy + (w.ty - w.sy) * e - (p < 1 ? Math.abs(Math.sin(p * Math.PI * 6)) * 7 : 0);
      if (p >= 1) arrive(w, t);
    }
    const col = 'hsl(' + (hs(w.n) % 360) + ',70%,60%)';
    g.fillStyle = col; g.beginPath(); g.arc(w.cx, w.cy, 9, 0, 7); g.fill(); g.fillRect(w.cx - 8, w.cy + 10, 16, 14);
    tx(trunc(w.n, 8), w.cx, w.cy + 38, 12, '#fff', 'center');
    if (!w.arrivedAt || t - w.arrivedAt < 3500) {
      const bx = Math.max(4, Math.min(W - 144, w.cx - 70)), by = w.cy - 68;
      rr(bx, by, 140, 44, 10); g.fillStyle = 'rgba(255,255,255,.95)'; g.fill();
      tx(ST[w.st].th, bx + 70, by + 19, 15, '#5c0f0f', 'center');
      tx(trunc(w.n, 12), bx + 70, by + 37, 13, '#9b1c1c', 'center');
    }
  });
}

function draw(t) {
  hits = [];
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#5a0b0b'); bg.addColorStop(1, '#220404');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) {
    const x = 50 + i * 103, y = 16 + Math.sin(t / 900 + i) * 4;
    g.fillStyle = '#d62828'; g.beginPath(); g.ellipse(x, y + 12, 16, 13, 0, 0, 7); g.fill();
    g.fillStyle = '#ffd54a'; g.fillRect(x - 6, y - 2, 12, 4);
  }
  tx('ศาลเจ้ามงคล 福', W / 2, 64, 36, '#ffd54a', 'center');
  tx('ดูดวงเพื่อความบันเทิง', W / 2, 82, 12, '#f0c0c0', 'center');
  tx('🎯 ' + goal + '/' + goalMax, 12, 64, 18, '#ffd54a');
  tx('คิว ' + queue.length, W - 12, 64, 18, '#fff', 'right');
  panel(0, 8, 'ส่งสติกเกอร์ทำบุญ'); panel(1, 364, 'ร่วมทำบุญ');
  STATIONS.forEach((s) => drawSt(s, t));
  drawWalkers(t);
  if (cur && t - curT < 7500) {
    g.globalAlpha = Math.min(1, (7500 - (t - curT)) / 500);
    rr(14, 1085, 692, 190, 16); g.fillStyle = 'rgba(20,0,0,.9)'; g.fill(); g.strokeStyle = '#ffd54a'; g.lineWidth = 3; g.stroke();
    tx(cur.zh + ' ' + cur.th, 28, 1120, 24, '#ffd54a');
    tx(trunc(cur.user, 14) + ' · ปี' + ANIMALS[cur.a] + AEMO[cur.a], 692, 1120, 18, '#fff', 'right');
    if (cur.lv >= 0) tx('ระดับ: ' + LEVELS[cur.lv].n, 28, 1148, 18, LEVELS[cur.lv].c);
    let y = cur.lv >= 0 ? 1176 : 1156;
    cur.lines.forEach((l) => { y = wrap(l, 28, y, 660, 26, 20, '#fff', 2); });
    g.globalAlpha = 1;
  } else {
    wrap('ส่งของขวัญเพื่อดูดวง · พิมพ์ปีเกิด (เช่น 2540) หรือปีนักษัตร (เช่น มะเส็ง) ในแชต · พิมพ์ "สาธุ" เพื่อน้อมรับคำทำนาย', 30, 1150, 660, 28, 20, '#f0c0c0', 3);
  }
  for (let i = sadhu.length - 1; i >= 0; i--) if (t - sadhu[i].t > 3500) sadhu.splice(i, 1);
  sadhu.forEach((s, i) => {
    g.globalAlpha = Math.min(1, (3500 - (t - s.t)) / 500);
    tx('🙏 ' + trunc(s.n, 10) + ': สาธุ', 700, 1072 - i * 26, 18, '#ffd54a', 'right');
  });
  g.globalAlpha = 1;
  if (goalFlash && t - goalFlash < 4000) {
    g.globalAlpha = Math.min(1, (4000 - (t - goalFlash)) / 600);
    tx('ครบเป้าหมายร่วมทำบุญ! 🎉', W / 2, 700, 40, '#ffd54a', 'center');
    g.globalAlpha = 1;
  }
  FX.step(g);
  if (!started) { g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 0, W, H); tx('แตะหน้าจอเพื่อเริ่ม (เปิดเสียง)', W / 2, H / 2, 34, '#ffd54a', 'center'); }
}

cv.addEventListener('click', (e) => {
  if (!started) { FX.init(); started = true; lastStep = performance.now() - 10000; return; }
  if (!TEST) return;
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
  hits.forEach((h) => {
    if (x > h.x && x < h.x + h.w && y > h.y && y < h.y + h.h) {
      const id = 't' + Math.floor(Math.random() * 5), user = 'ทดสอบ' + id;
      if (h.q.share) onShare({ id: id + Math.random(), user }); else onGift({ name: h.q.m[0], count: 1, user, id });
    }
  });
});
if (TEST) document.addEventListener('keydown', (e) => { if (e.key === 's') onChat({ id: 'k' + Math.random(), user: 'ทดสอบสาธุ', text: 'สาธุ' }); });

function connect() {
  const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.t === 'gift') onGift(m); else if (m.t === 'chat') onChat(m); else if (m.t === 'share') onShare(m); };
  ws.onclose = () => setTimeout(connect, 2000);
}
connect();
(function loop(t) { step(t); draw(t); requestAnimationFrame(loop); })(performance.now());
