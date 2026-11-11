const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const L = require('tiktok-live-connector');
const Conn = L.WebcastPushConnection || L.TikTokLiveConnection;

const USER = (process.argv[2] || process.env.TIKTOK_USER || '').replace('@', '');
const PORT = process.env.PORT || 3000;
const FILES = { '/': 'index.html', '/index.html': 'index.html', '/data.js': 'data.js', '/fx.js': 'fx.js', '/game.js': 'game.js', '/bg.jpg': 'bg.jpg', '/scene.js': 'scene.js' };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg' };

const server = http.createServer((req, res) => {
  const f = FILES[req.url.split('?')[0]];
  if (!f) { res.writeHead(404); return res.end('404'); }
  fs.readFile(path.join(__dirname, f), (e, d) => {
    if (e) { res.writeHead(500); return res.end('error'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    res.end(d);
  });
});

const wss = new WebSocketServer({ server });
const send = (o) => { const s = JSON.stringify(o); wss.clients.forEach((c) => { if (c.readyState === 1) c.send(s); }); };

if (USER) {
  const c = new Conn(USER);
  c.connect().then((s) => console.log('เชื่อมต่อ TikTok แล้ว room', s.roomId)).catch((e) => console.error('เชื่อมต่อไม่ได้:', e.message || e));
  c.on('gift', (d) => {
    if (d.giftType === 1 && !d.repeatEnd) return;
    console.log('GIFT:', d.giftName, 'x' + (d.repeatCount || 1), 'จาก', d.nickname);
    send({ t: 'gift', name: d.giftName, count: d.repeatCount || 1, user: d.nickname, id: d.userId });
  });
  c.on('chat', (d) => send({ t: 'chat', user: d.nickname, id: d.userId, text: d.comment }));
  c.on('share', (d) => send({ t: 'share', user: d.nickname, id: d.userId }));
} else {
  console.log('ไม่ได้ใส่ชื่อ TikTok -> โหมดทดสอบ เปิด http://localhost:' + PORT + '/?test');
}

server.listen(PORT, () => console.log('เปิดที่ http://localhost:' + PORT));
