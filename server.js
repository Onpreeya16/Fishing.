const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();

// ตัวกลางโหลดรูปโปรไฟล์ TikTok (กันปัญหาบล็อกรูปข้ามเว็บ) อนุญาตเฉพาะโดเมนรูปของ TikTok
const AVATAR_HOSTS = [
  'tiktokcdn.com', 'tiktokcdn-us.com', 'tiktokcdn-eu.com',
  'ibyteimg.com', 'byteimg.com', 'tiktokv.com', 'tiktokv.us', 'muscdn.com', 'tiktok.com'
];
app.get('/avatar', async (req, res) => {
  try {
    const u = new URL(String(req.query.u || ''));
    const h = u.hostname.toLowerCase();
    if (u.protocol !== 'https:' || !AVATAR_HOSTS.some((s) => h === s || h.endsWith('.' + s))) {
      return res.sendStatus(400);
    }
    const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' }, redirect: 'error' });
    if (!r.ok) return res.sendStatus(404);
    const type = r.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return res.sendStatus(415);
    res.set('content-type', type);
    res.set('cache-control', 'public, max-age=86400');
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    res.sendStatus(404);
  }
});

app.use(express.static(__dirname));
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const send = (o) => {
  const s = JSON.stringify(o);
  wss.clients.forEach((c) => c.readyState === 1 && c.send(s));
};

const user = process.env.TIKTOK_USER || process.argv[2];
if (user) {
  const conn = new WebcastPushConnection(user);
  const connect = () =>
    conn.connect()
      .then(() => console.log('เชื่อม TikTok แล้ว:', user))
      .catch((e) => { console.error(e.message || e); setTimeout(connect, 10000); });

  conn.on('gift', (d) => {
    if (d.giftType === 1 && !d.repeatEnd) return; // รอจบคอมโบก่อน
    console.log('ของขวัญ:', d.giftName, '| เหรียญ:', d.diamondCount, '| x' + (d.repeatCount || 1), '|', d.nickname);
    send({
      type: 'gift',
      name: d.giftName,
      id: d.uniqueId || d.nickname || '',
      user: d.nickname || d.uniqueId || 'ผู้ชม',
      pic: d.profilePictureUrl || '',
      count: d.repeatCount || 1,
      diamonds: d.diamondCount || 0
    });
  });
  conn.on('like', (d) => {
    send({
      type: 'like',
      id: d.uniqueId || d.nickname || '',
      user: d.nickname || d.uniqueId || 'ผู้ชม',
      pic: d.profilePictureUrl || '',
      count: d.likeCount || 1
    });
  });
  conn.on('disconnected', () => setTimeout(connect, 5000));
  connect();
} else {
  console.log('ไม่ได้ใส่ชื่อ TikTok: เล่นแบบทดสอบได้ (แตะป้ายของขวัญในเกม)');
}

const port = process.env.PORT || 3000;
server.listen(port, () => console.log('เปิดที่ http://localhost:' + port));
