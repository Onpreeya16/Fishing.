const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
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
    send({
      type: 'gift',
      name: d.giftName,
      user: d.nickname || d.uniqueId,
      count: d.repeatCount || 1,
      diamonds: d.diamondCount
    });
  });
  conn.on('disconnected', () => setTimeout(connect, 5000));
  connect();
} else {
  console.log('ไม่ได้ใส่ชื่อ TikTok: เล่นแบบทดสอบได้ (กดปุ่มของขวัญในเกม)');
}

const port = process.env.PORT || 3000;
server.listen(port, () => console.log('เปิดที่ http://localhost:' + port));
