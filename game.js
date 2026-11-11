const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 720, H = 1280;
cv.width = W; cv.height = H;
const SANS = "'Noto Sans Thai',Sarabun,Tahoma,sans-serif";
const TEST = location.search.includes('test'), seg = new Intl.Segmenter('th', { granularity: 'word' });
const VOICE = !location.search.includes('voice=off'); // ?voice=off ปิดเสียงอ่านของเกม (ใช้เสียงอ่านจากโปรแกรมอื่นแทน)
const IDLE = 'ส่งของขวัญเพื่อรับคำอวยพร พิมพ์ สาธุ ในแชตเพื่อน้อมรับ';
const queue = [], users = {}, counts = { altar: 0, rice: 0, fish: 0 }, shared = {}, ST = {}, walkers = [], sadhu = [], lastSadhu = {}, crowd = [];
let hits = [], pops = [], pq = [], lastStep = 0, lastIdle = performance.now(), started = false, goal = 0, goalMax = 35, goalFlash = 0;
const bg = new Image(); bg.src = 'bg.jpg';
// ทอยปวย: ไม่ต้องตอบใช่/ไม่ใช่ ให้เป็นคำอวยพรปกติ
BLESS.buei = ['ขอให้ทุกความตั้งใจสมหวัง สิ่งที่ขอเป็นจริงทุกประการ', 'ขอให้เจ้าประทานพร มีโชคมีชัย ทำสิ่งใดก็สำเร็จ', 'ขอให้ใจสงบ เดินทางไหนก็ราบรื่น มีแต่เรื่องดี'];
const _mk = makeReading;
makeReading = (id) => { const o = _mk(id); if (id === 'buei') o.lines = [pk(BLESS.buei)]; return o; };

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
const spot = (s) => ({ x: s.fx - 30 + Math.random() * 60, y: s.fy + 14 + Math.random() * 14 });

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
function enqueue(it) { if (queue.length >= 150) return; if (it.f) queue.unshift(it); else queue.push(it); FX.tone(1046, 0.25, 'sine', 0.08); }
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
    if (pops.length && n - (lastSadhu[m.id] || 0) > 10000) {
      lastSadhu[m.id] = n; sadhu.push({ n: m.user, pic: m.pic, t: performance.now() });
      if (sadhu.length > 4) sadhu.shift();
      FX.tone(660, 0.5, 'sine', 0.08);
      if (VOICE && !FX.talking) FX.say(trunc(m.user, 10) + ' สาธุ');
    }
    return;
  }
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
  const now = performance.now(), a = { x: 361 + (Math.random() - 0.5) * 60, y: 1200 }, n = it.user || 'ผู้ใจบุญ';
  walkers.push({ n, pic: it.pic, handle: it.handle, id: it.id, st: it.st, p: route(a, spot(ST[it.st])), t0: now, arrivedAt: 0, cx: a.x, cy: a.y, col: 'hsl(' + (hs(n) % 360) + ',70%,60%)' });
  if (walkers.length > 40) walkers.shift();
}
// ถึงแล้ว: เสียง/เอฟเฟกต์ทันที แล้วต่อคิวอ่านคำทำนายออกเสียง (กล่องข้อความขึ้นพร้อมเริ่มพูด)
function arrive(w, now) {
  w.arrivedAt = now;
  const r = makeReading(w.st), s = ST[w.st];
  const txt = 'คุณ ' + w.n + '. ' + r.th + '. ' + (r.lv >= 0 ? 'ระดับ ' + LEVELS[r.lv].n + '. ' : '') + r.lines.join('. ');
  pq.push(Object.assign(r, { user: w.n, pic: w.pic, handle: w.handle, st: w.st, txt, t0: 0, end: 0 }));
  if (pq.length > 25) pq.shift();
  if (counts[w.st] !== undefined) counts[w.st]++;
  sfx(w.st); FX.burst(s.cx, s.cy, 36);
  if (++goal >= goalMax) {
    goal = 0; goalMax = Math.min(100, goalMax + 5); goalFlash = now;
    FX.gong(); FX.burst(W / 2, 640, 80, '#ff5a36'); VOICE && FX.say('ครบเป้าหมายร่วมทำบุญ ขอบคุณทุกคนที่ร่วมทำบุญ');
  }
}
function step(now) {
  if (!started) return;
  // ป๊อปอัปคำอวยพรขึ้นทีละใบ: ใบใหม่ขึ้นเมื่อใบเก่าหายแล้ว
  if (!pops.length && pq.length) {
    const p = pq.shift(); p.t0 = now; pops.push(p);
    if (VOICE) { p.end = 1e12; FX.say(p.txt, null, () => { p.end = Math.max(p.t0 + 5000, performance.now() + 1500); }); }
    else p.end = now + (pq.length > 3 ? 4500 : 7000);
  }
  const active = pops.length > 0 || pq.length > 0;
  if (queue.length && now - lastStep > (queue.length > 10 ? 250 : 600) && walkers.filter((w) => !w.arrivedAt).length < 6 && pq.length < 8) { lastStep = now; run(queue.shift()); }
  else if (!queue.length && !active && !FX.talking && !FX.sq.length && now - lastIdle > 45000) { lastIdle = now; VOICE && FX.say(IDLE); }
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
function plate(w, x, y) {
  const n = trunc(w.n, 10); g.font = 'bold 15px ' + SANS; const pw = g.measureText(n).width + 46;
  rr(x - pw / 2, y, pw, 30, 15); g.fillStyle = 'rgba(20,0,0,.85)'; g.fill();
  avatar(w.pic, x - pw / 2 + 16, y + 15, 12, w.n); tx(n, x - pw / 2 + 34, y + 21, 15, '#fff');
}
// แผงของขวัญแสดงตลอดด้านบน (การ์ดสไตล์เมนูของขวัญ TikTok)
function drawGifts() {
  g.fillStyle = 'rgba(10,10,20,.9)'; g.fillRect(0, 86, W, Math.ceil(GIFTS.length / 4) * 44 + 8);
  GIFTS.forEach((q, i) => {
    const x = 6 + (i % 4) * 177, y = 90 + Math.floor(i / 4) * 44;
    rr(x, y, 171, 40, 10); g.fillStyle = '#14161f'; g.fill(); g.strokeStyle = 'rgba(232,185,35,.6)'; g.lineWidth = 1.5; g.stroke();
    const im = GI[q.n];
    if (im && im.complete && im.naturalWidth) g.drawImage(im, x + 4, y + 3, 34, 34); else tx(q.e, x + 21, y + 28, 24, '#fff', 'center');
    fit(q.n, x + 44, y + 17, 122, 15, '#fff', true); fit(q.a, x + 44, y + 34, 122, 12, '#ffd54a');
    if (TEST) hits.push({ x, y, w: 171, h: 40, q });
  });
}

// ป๊อปอัปคำอวยพรใต้แผงของขวัญ (ทีละใบ)
function drawPops(t) {
  for (let i = pops.length - 1; i >= 0; i--) if (t > pops[i].end) pops.splice(i, 1);
  const y = 86 + Math.ceil(GIFTS.length / 4) * 44 + 14;
  pops.forEach((p) => {
    g.globalAlpha = Math.min(1, (p.end - t) / 400, (t - p.t0) / 250 + 0.01);
    rr(14, y, 692, 124, 14); g.fillStyle = 'rgba(20,0,0,.88)'; g.fill(); g.strokeStyle = '#ffd54a'; g.lineWidth = 2; g.stroke();
    avatar(p.pic, 50, y + 32, 26, p.user);
    tx(trunc(p.user, 12) + ' · ' + p.th, 90, y + 30, 22, '#ffd54a');
    if (p.lv >= 0) tx(LEVELS[p.lv].n, 696, y + 30, 20, LEVELS[p.lv].c, 'right');
    if (p.handle) tx('@' + trunc(p.handle, 20), 90, y + 50, 14, '#f0c0c0');
    let ly = y + 74; p.lines.forEach((l) => { ly = wrap(l, 26, ly, 660, 22, 18, '#fff', 2); });
    g.globalAlpha = 1;
  });
}

function drawSt(s, t) {
  if (pops.some((p) => p.st === s.id && t < p.end)) {
    const a = 0.35 + 0.2 * Math.sin(t / 180), gr = g.createRadialGradient(s.cx, s.cy, 10, s.cx, s.cy, 110);
    gr.addColorStop(0, 'rgba(255,230,120,' + a + ')'); gr.addColorStop(1, 'rgba(255,230,120,0)');
    g.fillStyle = gr; g.fillRect(s.cx - 110, s.cy - 110, 220, 220);
  }
  if (counts[s.id] !== undefined) lab(s.th + ' ×' + counts[s.id], s.cx, s.cy - 78, 18, '#ffd54a');
}

function drawPeople(t) {
  for (let i = walkers.length - 1; i >= 0; i--) if (walkers[i].arrivedAt && t - walkers[i].arrivedAt > 5000) walkers.splice(i, 1);
  crowd.forEach((c) => person(c.x, c.y, c.col, t, c.mv, 1));
  walkers.forEach((w) => {
    if (!w.arrivedAt) { const r = posAt(w.p, (t - w.t0) * 0.17); w.cx = r.x; w.cy = r.y; if (r.done) arrive(w, t); }
    g.globalAlpha = Math.min(1, (t - w.t0) / 400);
    person(w.cx, w.cy, w.col, t, !w.arrivedAt, 1.2);
    g.globalAlpha = 1;
    plate(w, w.cx, w.cy + 34);
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
  lab('🎯 ' + goal + '/' + goalMax, 12, 32, 22, '#ffd54a', 'left');
  lab('คิว ' + queue.length, W - 12, 32, 22, '#fff', 'right');
  STATIONS.forEach((s) => drawSt(s, t));
  stepCrowd(t); drawPeople(t);
  drawGifts(); drawPops(t);
  g.fillStyle = 'rgba(20,0,0,.6)'; rr(14, 1226, 692, 50, 14); g.fill();
  wrap('ส่งของขวัญเพื่อรับคำอวยพร · พิมพ์ "สาธุ" ในแชตเพื่อน้อมรับ', 30, 1258, 660, 24, 20, '#f0c0c0', 1);
  for (let i = sadhu.length - 1; i >= 0; i--) if (t - sadhu[i].t > 3500) sadhu.splice(i, 1);
  sadhu.forEach((s, i) => {
    g.globalAlpha = Math.min(1, (3500 - (t - s.t)) / 500);
    const y = 1196 - i * 36; avatar(s.pic, 28, y - 6, 14, s.n); lab('🙏 ' + trunc(s.n, 10) + ': สาธุ', 52, y, 20, '#ffd54a', 'left');
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

function begin() { FX.init(); started = true; lastStep = performance.now() - 10000; lastIdle = performance.now(); }
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
