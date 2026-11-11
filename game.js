const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 720, H = 1280;
cv.width = W; cv.height = H;
const SANS = "'Noto Sans Thai',Sarabun,Tahoma,sans-serif";
const TEST = location.search.includes('test'), seg = new Intl.Segmenter('th', { granularity: 'word' });
const IDLE = 'ส่งของขวัญเพื่อดูดวง พิมพ์ปีเกิด เช่น 2540 หรือปีนักษัตร เช่น มะเส็ง ในแชต พิมพ์ สาธุ เพื่อน้อมรับคำทำนาย';
const queue = [], users = {}, counts = { altar: 0, rice: 0, fish: 0 }, shared = {}, ST = {}, walkers = [], sadhu = [], lastSadhu = {}, crowd = [];
let hits = [], cur = null, lastStep = 0, lastIdle = performance.now(), started = false, goal = 0, goalMax = 35, goalFlash = 0;
const bg = new Image(); bg.src = 'bg.jpg';

// [กลางอาคาร x,y, จุดยืนหน้าอาคาร x,y] พิกัดบนภาพ 720x1280
const POS = {
  altar: [192, 500, 192, 598], fish: [361, 502, 361, 608], rice: [539, 502, 539, 598],
  qian: [155, 735, 155, 822], buei: [361, 745, 361, 822], almanac: [553, 735, 553, 822],
  money: [159, 930, 159, 1020], love: [361, 940, 361, 1030], study: [558, 940, 558, 1020], work: [361, 307, 361, 410]
};
STATIONS.forEach((s) => { const p = POS[s.id]; Object.assign(s, { cx: p[0], cy: p[1], fx: p[2], fy: p[3] }); ST[s.id] = s; });

const hs = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const trunc = (s, n) => ([...s].length > n ? [...s].slice(0, n).join('') + '…' : s);
const animalOf = (id, name) => (users[id] !== undefined ? users[id] : hs(id || name) % 12);

// ---------- เส้นทางเดิน ----------
function mkPath(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); return { pts, c, L: c[c.length - 1] }; }
function posAt(p, d) {
  if (d >= p.L) return { x: p.pts[p.pts.length - 1].x, y: p.pts[p.pts.length - 1].y, done: 1 };
  let i = 1; while (p.c[i] < d) i++;
  const a = p.pts[i - 1], b = p.pts[i], l = p.c[i] - p.c[i - 1], k = l ? (d - p.c[i - 1]) / l : 0;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, done: 0 };
}
const route = (a, b) => mkPath([a, { x: 361, y: a.y }, { x: 361, y: b.y }, b]);
const spot = (s) => ({ x: s.fx - 30 + Math.random() * 60, y: s.fy + Math.random() * 16 });

function newGoal(c, t) { c.p = route({ x: c.x, y: c.y }, spot(STATIONS[Math.floor(Math.random() * STATIONS.length)])); c.t0 = t; c.wait = 0; }
for (let i = 0; i < 9; i++) { const c = { x: 361 + (Math.random() - 0.5) * 200, y: 1000 + Math.random() * 100, col: 'hsl(' + Math.floor(Math.random() * 360) + ',55%,55%)' }; newGoal(c, performance.now()); crowd.push(c); }
function stepCrowd(t) {
  crowd.forEach((c) => {
    if (c.wait) { if (t < c.wait) return; newGoal(c, t); }
    const r = posAt(c.p, (t - c.t0) * 0.05); c.x = r.x; c.y = r.y; c.mv = !r.done;
    if (r.done) c.wait = t + 2000 + Math.random() * 4000;
  });
}

// ---------- ของขวัญ / แชต ----------
function matchGift(name) {
  const n = String(name || '').toLowerCase();
  return GIFTS.find((q) => q.m.some((x) => (q.x ? n === x : n.includes(x))));
}
function enqueue(it) { if (queue.length >= 40) return; if (it.f) queue.unshift(it); else queue.push(it); FX.tone(1046, 0.25, 'sine', 0.08); }
function onGift(m) {
  const q = matchGift(m.name); if (!q) return;
  const n = Math.min(m.count || 1, 5);
  for (let i = 0; i < n; i++) q.st.forEach((st) => enqueue({ st, user: m.user, id: m.id, pic: m.pic, handle: m.handle, f: q.f }));
}
function onShare(m) { if (shared[m.id]) return; shared[m.id] = 1; enqueue({ st: 'altar', user: m.user, id: m.id, pic: m.pic, handle: m.handle }); }
function onChat(m) {
  const raw = String(m.text || '').trim();
  if (raw.includes('สาธุ')) {
    const n = Date.now();
    if (cur && n - (lastSadhu[m.id] || 0) > 10000) {
      lastSadhu[m.id] = n; sadhu.push({ n: m.user, pic: m.pic, t: performance.now() });
      if (sadhu.length > 4) sadhu.shift();
      FX.tone(660, 0.5, 'sine', 0.08);
      if (!FX.talking) FX.say(trunc(m.user, 10) + ' สาธุ');
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

// ออกจากทางเข้าด้านล่าง เดินขึ้นพรมแดงไปหน้าอาคาร
function run(it) {
  const now = performance.now(), a = { x: 361 + (Math.random() - 0.5) * 60, y: 1110 }, n = it.user || 'ผู้ใจบุญ';
  walkers.push({ n, pic: it.pic, handle: it.handle, id: it.id, st: it.st, p: route(a, spot(ST[it.st])), t0: now, arrivedAt: 0, cx: a.x, cy: a.y, col: 'hsl(' + (hs(n) % 360) + ',70%,60%)' });
  if (walkers.length > 40) walkers.shift();
}
// ถึงแล้ว: เสียง/เอฟเฟกต์ทันที แล้วต่อคิวอ่านคำทำนายออกเสียง (กล่องข้อความขึ้นพร้อมเริ่มพูด)
function arrive(w, now) {
  w.arrivedAt = now;
  const a = animalOf(w.id, w.n), r = makeReading(w.st), s = ST[w.st];
  const c = Object.assign(r, { user: w.n, pic: w.pic, handle: w.handle, a, st: w.st, end: 0, t0: 0 });
  if (counts[w.st] !== undefined) counts[w.st]++;
  sfx(w.st); FX.burst(s.cx, s.cy, 36);
  const txt = 'คุณ ' + w.n + '. ' + r.th + '. ปี' + ANIMALS[a] + '. ' + (r.lv >= 0 ? 'ระดับ ' + LEVELS[r.lv].n + '. ' : '') + r.lines.join('. ');
  FX.say(txt, () => { cur = c; c.t0 = performance.now(); c.end = 1e12; }, () => { c.end = Math.max(c.t0 + 6000, performance.now() + 1500); });
  if (++goal >= goalMax) {
    goal = 0; goalMax = Math.min(100, goalMax + 5); goalFlash = now;
    FX.gong(); FX.burst(W / 2, 640, 80, '#ff5a36'); FX.say('ครบเป้าหมายร่วมทำบุญ ขอบคุณทุกคนที่ร่วมทำบุญ');
  }
}
function step(now) {
  if (!started) return;
  const active = cur && now < cur.end;
  if (queue.length && now - lastStep > 1500 && !walkers.some((w) => !w.arrivedAt) && !FX.sq.length) { lastStep = now; run(queue.shift()); }
  else if (!queue.length && !active && !FX.talking && !FX.sq.length && now - lastIdle > 45000) { lastIdle = now; FX.say(IDLE); }
}

// ---------- วาด ----------
const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function tx(s, x, y, size, col, al, font) { g.font = size + 'px ' + (font || SANS); g.fillStyle = col; g.textAlign = al || 'left'; g.fillText(s, x, y); }
function lab(s, x, y, size, col, al) { g.font = 'bold ' + size + 'px ' + SANS; g.textAlign = al || 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.75)'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); }
function wrap(s, x, y, mw, lh, size, col, max) {
  g.font = size + 'px ' + SANS; let line = '', n = 1;
  for (const w of seg.segment(s)) {
    const t = line + w.segment;
    if (g.measureText(t).width > mw && line) { tx(line, x, y, size, col); y += lh; line = w.segment.trimStart(); if (++n > max) return y; }
    else line = t;
  }
  tx(line, x, y, size, col); return y + lh;
}

function person(x, y, col, t, mv, sc) {
  const sw = mv ? Math.sin(t / 110) * 5 : 0, bob = mv ? Math.abs(Math.sin(t / 110)) * 2 : 0;
  g.save(); g.translate(x, y - bob); g.scale(sc, sc);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 26 + bob, 11, 4, 0, 0, 7); g.fill();
  g.strokeStyle = '#3a2210'; g.lineWidth = 4; g.beginPath(); g.moveTo(-3, 14); g.lineTo(-3 + sw, 26 + bob); g.moveTo(3, 14); g.lineTo(3 - sw, 26 + bob); g.stroke();
  g.fillStyle = col; rr(-9, -4, 18, 22, 6); g.fill();
  g.fillStyle = '#f3cfa0'; g.beginPath(); g.arc(0, -12, 8, 0, 7); g.fill();
  g.fillStyle = '#222'; g.beginPath(); g.arc(0, -15, 8, Math.PI, 0); g.fill();
  g.restore();
}

const AV = {}, GI = {};
const ICONKEY = { light: 'light', windvane: 'windvane', rose: 'rose', dallah: 'dallah', mantap: 'mantap', glow: 'glow', 'love you so much': 'love', tiktok: 'tiktok', encore: 'encore', 'finger heart': 'finger', diny: 'diny', doughnut: 'doughnut' };
GIFTS.forEach((q) => { const k = ICONKEY[q.m[0]]; if (k && typeof ICONS !== 'undefined' && ICONS[k]) { const im = new Image(); im.src = ICONS[k]; GI[q.n] = im; } });
function avatar(url, x, y, r, name) {
  let im = null;
  if (url) { im = AV[url]; if (!im) { im = AV[url] = new Image(); im.referrerPolicy = 'no-referrer'; im.src = url; } }
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.closePath(); g.clip();
  if (im && im.complete && im.naturalWidth) g.drawImage(im, x - r, y - r, r * 2, r * 2);
  else { g.fillStyle = 'hsl(' + (hs(name) % 360) + ',60%,50%)'; g.fillRect(x - r, y - r, r * 2, r * 2); tx([...String(name || '?')][0] || '?', x, y + r * 0.35, r, '#fff', 'center'); }
  g.restore(); g.beginPath(); g.arc(x, y, r, 0, 7); g.lineWidth = 2; g.strokeStyle = '#ffd54a'; g.stroke();
}
function fit(s, x, y, mw, size, col, bold) {
  const f = () => { g.font = (bold ? 'bold ' : '') + size + 'px ' + SANS; }; f();
  while (size > 8 && g.measureText(s).width > mw) { size--; f(); }
  g.fillStyle = col; g.textAlign = 'left'; g.fillText(s, x, y);
}
// แผงของขวัญแสดงตลอด (การ์ดสไตล์เมนูของขวัญ TikTok)
function drawGifts() {
  g.fillStyle = 'rgba(10,10,20,.9)'; g.fillRect(0, 1108, W, 172);
  GIFTS.forEach((q, i) => {
    const x = 8 + (i % 5) * 140, y = 1114 + Math.floor(i / 5) * 54;
    rr(x, y, 136, 50, 10); g.fillStyle = '#14161f'; g.fill(); g.strokeStyle = 'rgba(232,185,35,.6)'; g.lineWidth = 1.5; g.stroke();
    const im = GI[q.n];
    if (im && im.complete && im.naturalWidth) g.drawImage(im, x + 5, y + 5, 40, 40); else tx(q.e, x + 25, y + 34, 28, '#fff', 'center');
    fit(q.n, x + 50, y + 22, 82, 14, '#fff', true); fit(q.a, x + 50, y + 40, 82, 11, '#ffd54a');
    if (TEST) hits.push({ x, y, w: 136, h: 50, q });
  });
}

function drawSt(s, t) {
  if (cur && cur.st === s.id && t < cur.end) {
    const a = 0.35 + 0.2 * Math.sin(t / 180), gr = g.createRadialGradient(s.cx, s.cy, 10, s.cx, s.cy, 110);
    gr.addColorStop(0, 'rgba(255,230,120,' + a + ')'); gr.addColorStop(1, 'rgba(255,230,120,0)');
    g.fillStyle = gr; g.fillRect(s.cx - 110, s.cy - 110, 220, 220);
  }
  if (counts[s.id] !== undefined) lab(s.th + ' ×' + counts[s.id], s.cx, s.fy + 34, 15, '#ffd54a');
}

function drawPeople(t) {
  for (let i = walkers.length - 1; i >= 0; i--) if (walkers[i].arrivedAt && t - walkers[i].arrivedAt > 5000) walkers.splice(i, 1);
  crowd.forEach((c) => person(c.x, c.y, c.col, t, c.mv, 1));
  walkers.forEach((w) => {
    if (!w.arrivedAt) { const r = posAt(w.p, (t - w.t0) * 0.1); w.cx = r.x; w.cy = r.y; if (r.done) arrive(w, t); }
    g.globalAlpha = Math.min(1, (t - w.t0) / 400);
    person(w.cx, w.cy, w.col, t, !w.arrivedAt, 1.2);
    g.globalAlpha = 1;
    lab(trunc(w.n, 8), w.cx, w.cy + 46, 13, '#fff');
    if (!w.arrivedAt || t - w.arrivedAt < 3500) {
      const bx = Math.max(4, Math.min(W - 172, w.cx - 84)), by = w.cy - 80;
      rr(bx, by, 168, 50, 12); g.fillStyle = 'rgba(255,255,255,.95)'; g.fill();
      avatar(w.pic, bx + 28, by + 25, 19, w.n);
      tx(ST[w.st].th, bx + 102, by + 21, 14, '#5c0f0f', 'center');
      tx(trunc(w.n, 10), bx + 102, by + 40, 13, '#9b1c1c', 'center');
    }
  });
}

function draw(t) {
  hits = [];
  if (bg.complete && bg.naturalWidth) g.drawImage(bg, 0, 0, W, H);
  else { g.fillStyle = '#3a0808'; g.fillRect(0, 0, W, H); }
  const tg = g.createLinearGradient(0, 0, 0, 140); tg.addColorStop(0, 'rgba(30,0,0,.8)'); tg.addColorStop(1, 'rgba(30,0,0,0)');
  g.fillStyle = tg; g.fillRect(0, 0, W, 140);
  lab('ศาลเจ้ามงคล 福', W / 2, 52, 36, '#ffd54a');
  lab('ดูดวงเพื่อความบันเทิง', W / 2, 76, 13, '#f0c0c0');
  lab('🎯 ' + goal + '/' + goalMax, 12, 30, 18, '#ffd54a', 'left');
  lab('คิว ' + queue.length, W - 12, 30, 18, '#fff', 'right');
  STATIONS.forEach((s) => drawSt(s, t));
  stepCrowd(t); drawPeople(t);
  drawGifts();
  if (cur && t < cur.end) {
    g.globalAlpha = Math.min(1, (cur.end - t) / 500, (t - cur.t0) / 300 + 0.01);
    rr(14, 92, 692, 200, 16); g.fillStyle = 'rgba(20,0,0,.92)'; g.fill(); g.strokeStyle = '#ffd54a'; g.lineWidth = 3; g.stroke();
    avatar(cur.pic, 52, 136, 28, cur.user);
    tx(cur.zh + ' ' + cur.th, 92, 122, 24, '#ffd54a');
    tx(trunc(cur.user, 14) + ' · ปี' + ANIMALS[cur.a] + AEMO[cur.a], 692, 122, 18, '#fff', 'right');
    if (cur.handle) tx('@' + trunc(cur.handle, 24), 92, 148, 14, '#f0c0c0');
    if (cur.lv >= 0) tx('ระดับ: ' + LEVELS[cur.lv].n, 28, 180, 18, LEVELS[cur.lv].c);
    let y = cur.lv >= 0 ? 206 : 186;
    cur.lines.forEach((l) => { y = wrap(l, 28, y, 660, 26, 20, '#fff', 2); });
    g.globalAlpha = 1;
  } else {
    g.fillStyle = 'rgba(20,0,0,.6)'; rr(14, 92, 692, 100, 16); g.fill();
    wrap('ส่งของขวัญเพื่อดูดวง · พิมพ์ปีเกิด (เช่น 2540) หรือปีนักษัตร (เช่น มะเส็ง) ในแชต · พิมพ์ "สาธุ" เพื่อน้อมรับคำทำนาย', 30, 124, 660, 26, 17, '#f0c0c0', 3);
  }
  for (let i = sadhu.length - 1; i >= 0; i--) if (t - sadhu[i].t > 3500) sadhu.splice(i, 1);
  sadhu.forEach((s, i) => {
    g.globalAlpha = Math.min(1, (3500 - (t - s.t)) / 500);
    const y = 1072 - i * 34; avatar(s.pic, 692, y - 6, 14, s.n); lab('🙏 ' + trunc(s.n, 10) + ': สาธุ', 668, y, 18, '#ffd54a', 'right');
  });
  g.globalAlpha = 1;
  if (goalFlash && t - goalFlash < 4000) {
    g.globalAlpha = Math.min(1, (4000 - (t - goalFlash)) / 600);
    lab('ครบเป้าหมายร่วมทำบุญ! 🎉', W / 2, 700, 40, '#ffd54a');
    g.globalAlpha = 1;
  }
  FX.step(g);
  if (!started) { g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 0, W, H); tx('แตะหน้าจอเพื่อเริ่ม (เปิดเสียง)', W / 2, H / 2, 34, '#ffd54a', 'center'); }
}

function begin() { FX.init(); FX.music(); started = true; lastStep = performance.now() - 10000; lastIdle = performance.now(); }
cv.addEventListener('click', (e) => {
  if (!started) return begin();
  if (!TEST) return;
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
  hits.forEach((h) => {
    if (x > h.x && x < h.x + h.w && y > h.y && y < h.y + h.h) {
      const id = 't' + Math.floor(Math.random() * 5), user = 'ทดสอบ' + id;
      if (h.q.share) onShare({ id: id + Math.random(), user }); else onGift({ name: h.q.m[0], count: 1, user, id });
    }
  });
});
// เปิดใน OBS ที่แตะไม่ได้: ถ้าเบราว์เซอร์อนุญาตเสียงอัตโนมัติ ให้เริ่มเอง
setTimeout(() => { try { FX.init(); if (FX.ctx.state === 'running' && !started) begin(); } catch (e) {} }, 1500);
if (TEST) document.addEventListener('keydown', (e) => { if (e.key === 's') onChat({ id: 'k' + Math.random(), user: 'ทดสอบสาธุ', text: 'สาธุ' }); });

function connect() {
  const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.t === 'gift') onGift(m); else if (m.t === 'chat') onChat(m); else if (m.t === 'share') onShare(m); };
  ws.onclose = () => setTimeout(connect, 2000);
}
connect();
(function loop(t) { step(t); draw(t); requestAnimationFrame(loop); })(performance.now());
