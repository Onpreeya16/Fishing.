const http = require('http'), https = require('https'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const L = require('tiktok-live-connector');
const Conn = L.WebcastPushConnection || L.TikTokLiveConnection;

// ---------- ตั้งค่า (ตั้งใน Render > Environment) ----------
// TIKTOK_USER     = username TikTok ที่ไลฟ์ (ไม่ต้องมี @)
// ADMIN_KEY       = รหัสลับสำหรับ /api/test (ไม่ตั้ง = ปิดหน้าทดสอบ)
// TIKTOK_SESSIONID = (ไม่บังคับ) session id ของบัญชี ช่วยให้เชื่อมต่อเสถียรขึ้นถ้าโดนจำกัด
// SIGN_API_KEY    = (ไม่บังคับ) API key จาก Euler Stream แก้ error 403 SignatureError
// RENDER_EXTERNAL_URL = Render ใส่ให้เอง ใช้ปลุกตัวเองไม่ให้หลับ
const USER = String(process.argv[2] || process.env.TIKTOK_USER || '').trim().replace(/^@/, '');
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const SESSION_ID = process.env.TIKTOK_SESSIONID || '';
const SIGN_API_KEY = process.env.SIGN_API_KEY || ''; // <-- เพิ่มใหม่
const SELF_URL = (process.env.RENDER_EXTERNAL_URL || process.env.SELF_URL || '').replace(/\/$/, '');

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
process.on('uncaughtException', (e) => console.error('uncaughtException:', (e && e.stack) || e));
process.on('unhandledRejection', (e) => console.error('unhandledRejection:', (e && e.stack) || e));

// ---------- เว็บเซิร์ฟเวอร์ ----------
const FILES = { '/': 'index.html', '/index.html': 'index.html', '/data.js': 'data.js', '/fx.js': 'fx.js', '/game.js': 'game.js', '/bg.jpg': 'bg.jpg', '/scene.js': 'scene.js', '/icons.js': 'icons.js', '/manifest.json': 'manifest.json', '/sw.js': 'sw.js', '/icon-192.png': 'icon-192.png', '/icon-512.png': 'icon-512.png' };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/manifest+json; charset=utf-8' };
const startedAt = Date.now();
let state = USER ? 'connecting' : 'test', conn = null, attempts = 0, timer = null, stopping = false;
let lastErr = '', lastEvent = Date.now(), lastGift = 0, connectedAt = 0;

const getStatus = () => ({
  tiktok: state, user: USER || null, attempts, lastError: lastErr || null,
  connectedSince: connectedAt ? new Date(connectedAt).toISOString() : null,
  lastGiftAt: lastGift ? new Date(lastGift).toISOString() : null,
  clients: wss ? wss.clients.size : 0, uptimeSec: Math.round(process.uptime())
});

function adminTest(u, res) {
  const q = u.searchParams;
  if (!ADMIN_KEY || q.get('key') !== ADMIN_KEY) { res.writeHead(404); return res.end('404'); }
  const type = q.get('type') || 'gift', user = q.get('user') || 'ทดสอบ', id = q.get('id') || 'adm' + Math.floor(Math.random() * 1e6);
  const base = { user, id, handle: q.get('handle') || 'test_user', pic: '' };
  let m;
  if (type === 'gift') m = { t: 'gift', name: q.get('name') || 'Rose', count: +q.get('count') || 1, ...base };
  else if (type === 'like') m = { t: 'like', count: +q.get('count') || 50, ...base };
  else if (type === 'share') m = { t: 'share', ...base };
  else if (type === 'chat') m = { t: 'chat', text: q.get('text') || 'สาธุ', ...base };
  else { res.writeHead(400); return res.end('type = gift | like | share | chat'); }
  send(m);
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: true, sent: m, clients: wss.clients.size }));
}

const server = http.createServer((req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost'), p = u.pathname;
    if (p === '/health') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }
    if (p === '/status') { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(JSON.stringify(getStatus(), null, 2)); }
    if (p === '/api/test') return adminTest(u, res);
    if (p === '/favicon.ico') { res.writeHead(204); return res.end(); }
    const f = FILES[p];
    if (!f) { res.writeHead(404); return res.end('404'); }
    fs.readFile(path.join(__dirname, f), (e, d) => {
      if (e) { res.writeHead(500); return res.end('error'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(d);
    });
  } catch (e) { res.writeHead(400); res.end('bad request'); }
});
server.on('error', (e) => console.error('server error:', e.message || e));

// ---------- WebSocket (ส่งเหตุการณ์ไปให้หน้าเกม) ----------
const wss = new WebSocketServer({ server, maxPayload: 1024 });
const send = (o) => { const s = JSON.stringify(o); wss.clients.forEach((c) => { try { if (c.readyState === 1) c.send(s); } catch (e) {} }); };
wss.on('connection', (ws) => {
  ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('error', () => {});
  try { ws.send(JSON.stringify({ t: 'status', tiktok: state })); } catch (e) {}
});
// ตรวจการเชื่อมต่อ: ตัวที่ไม่ตอบ ปิดทิ้ง (หน้าเกมจะเชื่อมใหม่เอง) และกันพร็อกซีตัดเพราะเงียบนาน
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.alive) return ws.terminate();
    ws.alive = false; try { ws.ping(); } catch (e) {}
  });
}, 25000);
const setState = (s) => { if (state !== s) { state = s; send({ t: 'status', tiktok: s }); } };

// ---------- ตัวช่วยอ่านข้อมูลจาก TikTok (รองรับไลบรารีหลายเวอร์ชัน) ----------
const who = (d) => ({
  handle: d.uniqueId || (d.user && d.user.uniqueId) || '',
  pic: d.profilePictureUrl || (d.user && d.user.profilePictureUrl) ||
    (d.user && d.user.profilePicture && [].concat(d.user.profilePicture.urls || d.user.profilePicture.url || [])[0]) || ''
});
const nick = (d) => d.nickname || (d.user && d.user.nickname) || d.uniqueId || (d.user && d.user.uniqueId) || 'ผู้ใจบุญ';
const uid = (d) => String(d.userId || (d.user && (d.user.userId || d.user.id)) || d.uniqueId || (d.user && d.user.uniqueId) || nick(d));
const giftName = (d) => d.giftName || (d.giftDetails && d.giftDetails.giftName) || (d.gift && d.gift.name) || '';
const giftType = (d) => (d.giftType != null ? d.giftType : d.giftDetails && d.giftDetails.giftType);
const seenIds = new Set();
const dup = (d) => { // กันเหตุการณ์ซ้ำ (เช่นตอนเชื่อมใหม่)
  const id = d.msgId || (d.common && d.common.msgId); if (!id) return false;
  const k = String(id); if (seenIds.has(k)) return true;
  seenIds.add(k); if (seenIds.size > 800) seenIds.delete(seenIds.values().next().value); return false;
};

// กดหัวใจ: รวมยอดรายคนแล้วส่งทุก 0.5 วินาที กันเกมกระตุกเวลามีคนกดรัว
const likeBuf = new Map();
setInterval(() => { for (const v of likeBuf.values()) send({ t: 'like', ...v }); likeBuf.clear(); }, 500);

// ---------- เชื่อมต่อ TikTok (ลองใหม่อัตโนมัติ) ----------
function drop(c) {
  if (!c) return;
  try { c.removeAllListeners(); } catch (e) {}
  try { c.on('error', () => {}); } catch (e) {} // กัน error ที่ไม่มีคนรับจนโปรแกรมล่ม
  try { const r = c.disconnect(); if (r && r.catch) r.catch(() => {}); } catch (e) {}
}
function retry(why, ms) {
  if (stopping || !USER || timer) return;
  const c = conn; conn = null; drop(c);
  attempts++;
  const wait = ms || Math.min(60000, 5000 * Math.pow(2, Math.min(attempts - 1, 4)));
  setState('waiting');
  log('TikTok:', why, '-> ลองใหม่ใน', Math.round(wait / 1000), 'วินาที');
  timer = setTimeout(() => { timer = null; startTikTok(); }, wait);
}
function hook(c) {
  const live = () => c === conn, touch = () => { lastEvent = Date.now(); };
  c.on('gift', (d) => {
    if (!live()) return; touch();
    if (giftType(d) === 1 && !d.repeatEnd) return; // ของขวัญต่อเนื่อง: รอจบชุดก่อนค่อยนับ
    if (dup(d)) return;
    const name = giftName(d), count = d.repeatCount || 1;
    if (!name) { log('GIFT ไม่มีชื่อ ข้อมูลดิบ:', Object.keys(d).join(',')); return; }
    lastGift = Date.now();
    log('GIFT:', name, 'x' + count, 'จาก', nick(d));
    send({ t: 'gift', name, count, user: nick(d), id: uid(d), ...who(d) });
  });
  c.on('chat', (d) => { // ส่งเฉพาะข้อความที่มี "สาธุ" (เกมใช้แค่นั้น ลดภาระ)
    if (!live()) return; touch();
    const text = d.comment || d.content || '';
    if (!text.includes('สาธุ') || dup(d)) return;
    send({ t: 'chat', user: nick(d), id: uid(d), text, ...who(d) });
  });
  c.on('share', (d) => { if (!live()) return; touch(); if (dup(d)) return; send({ t: 'share', user: nick(d), id: uid(d), ...who(d) }); });
  c.on('like', (d) => { // likeCount = จำนวนครั้งที่กดในชุดนั้น
    if (!live()) return; touch();
    const k = uid(d), cur = likeBuf.get(k) || { count: 0, user: nick(d), id: k, ...who(d) };
    cur.count += d.likeCount || 1; likeBuf.set(k, cur);
  });
  c.on('roomUser', touch); c.on('member', touch);
  c.on('disconnected', () => { if (live()) retry('หลุดการเชื่อมต่อ', 5000); });
  c.on('streamEnd', () => { if (live()) retry('ไลฟ์จบแล้ว', 30000); });
  c.on('error', (e) => { if (live()) { lastErr = String((e && (e.message || e.info)) || e).slice(0, 200); log('TikTok error:', lastErr); } });
}
function startTikTok() {
  if (stopping || !USER) return;
  const opts = { processInitialData: false, enableExtendedGiftInfo: false }; // ไม่เอาข้อความ/ของขวัญเก่าที่ย้อนมาตอนเพิ่งเชื่อม
  if (SESSION_ID) opts.sessionId = SESSION_ID;
  if (SIGN_API_KEY) opts.signApiKey = SIGN_API_KEY; // <-- เพิ่มใหม่
  let c;
  try { c = new Conn(USER, opts); }
  catch (e) { lastErr = String(e.message || e); console.error('สร้างตัวเชื่อมต่อไม่ได้:', lastErr); return retry('สร้างตัวเชื่อมต่อไม่ได้', 60000); }
  conn = c; setState('connecting'); hook(c);
  const p = c.connect();
  Promise.resolve(p).then((s) => {
    if (c !== conn) return;
    attempts = 0; lastErr = ''; connectedAt = lastEvent = Date.now(); setState('connected');
    log('เชื่อมต่อ TikTok แล้ว room', s && s.roomId);
  }).catch((e) => {
    if (c !== conn) return;
    lastErr = String(((e && e.name) || '') + ' ' + ((e && (e.message || (e.exception && e.exception.message))) || e)).trim().slice(0, 200);
    const offline = /offline|not online|isn't online|not live|ended|finished/i.test(lastErr);
    const limited = /rate|429|limit|too many/i.test(lastErr);
    retry(offline ? 'ยังไม่ได้ไลฟ์ (รอไลฟ์)' : 'เชื่อมต่อไม่ได้: ' + lastErr, offline ? 30000 : limited ? 90000 : 0);
  });
}
// เฝ้าระวัง: เชื่อมต่ออยู่แต่เงียบเกิน 5 นาที = น่าจะค้าง ให้เชื่อมใหม่
setInterval(() => {
  if (state === 'connected' && Date.now() - lastEvent > 5 * 60 * 1000) { lastEvent = Date.now(); retry('เงียบเกิน 5 นาที รีเซ็ตการเชื่อมต่อ', 1000); }
}, 30000);

// ---------- กัน Render หลับ ----------
if (SELF_URL) {
  const ping = () => { try { (SELF_URL.startsWith('https') ? https : http).get(SELF_URL + '/health', (r) => r.resume()).on('error', () => {}); } catch (e) {} };
  setInterval(ping, 9 * 60 * 1000);
}

// ---------- เริ่มทำงาน / ปิดอย่างนุ่มนวล ----------
server.listen(PORT, '0.0.0.0', () => {
  log('เปิดที่ http://localhost:' + PORT, '| Node', process.version);
  if (USER) { log('บัญชี TikTok:', '@' + USER); startTikTok(); }
  else log('ไม่ได้ใส่ชื่อ TikTok -> โหมดทดสอบ เปิด http://localhost:' + PORT + '/?test (ตั้ง TIKTOK_USER เพื่อเชื่อมไลฟ์จริง)');
});
function shutdown(sig) {
  if (stopping) return; stopping = true; log('ได้รับ', sig, 'กำลังปิด...');
  if (timer) clearTimeout(timer);
  drop(conn);
  try { wss.close(); } catch (e) {}
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
