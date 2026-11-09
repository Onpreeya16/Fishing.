const http=require('http'),fs=require('fs'),path=require('path');
const {WebcastPushConnection}=require('tiktok-live-connector');
const USER='thesecretlore';
const clients=[];
const MAP={'Rose':'rose'};
const TYPE={'.html':'text/html','.js':'text/javascript'};

http.createServer((req,res)=>{
 if(req.url==='/events'){
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache'});
  clients.push(res);
  req.on('close',()=>clients.splice(clients.indexOf(res),1));
  return;
 }
 if(req.url==='/ping'){res.writeHead(200);return res.end('ok')}
 const f=path.join(__dirname,req.url==='/'?'index.html':req.url.split('?')[0]);
 fs.readFile(f,(e,d)=>{
  if(e){res.writeHead(404);return res.end()}
  res.writeHead(200,{'Content-Type':TYPE[path.extname(f)]||'text/plain'});
  res.end(d);
 });
}).listen(process.env.PORT||80,()=>console.log('Fishing Server is running'));

setInterval(()=>clients.forEach(c=>c.write(':\n\n')),25000);

const tt=new WebcastPushConnection(USER);
tt.connect().then(()=>console.log('connected to TikTok')).catch(e=>console.log('error: '+e.message));
const giftCombos = new Map();
const COMBO_DELAY = 1500;

function sendGift(msg) {
  const data = 'data: ' + JSON.stringify(msg) + '\n\n';

  clients.forEach(c => {
    try {
      c.write(data);
    } catch (e) {}
  });
}

tt.on('gift', d => {
  // รอจนจบการส่งของขวัญแบบคอมโบของ TikTok
  if (d.giftType === 1 && !d.repeatEnd) return;

  const gift = MAP[d.giftName];
  if (!gift) return;

  const user = d.uniqueId || d.nickname || 'unknown';
  const key = user + ':' + gift;
  const count = Math.max(1, Number(d.repeatCount) || 1);

  let combo = giftCombos.get(key);

  if (!combo) {
    combo = {
      uniqueId: d.uniqueId,
      nickname: d.nickname,
      avatar: d.profilePictureUrl,
      gift,
      count: 0,
      timer: null
    };
    giftCombos.set(key, combo);
  }

  combo.count += count;
  combo.nickname = d.nickname || combo.nickname;
  combo.avatar = d.profilePictureUrl || combo.avatar;

  clearTimeout(combo.timer);

  combo.timer = setTimeout(() => {
    sendGift({
      uniqueId: combo.uniqueId,
      nickname: combo.nickname,
      avatar: combo.avatar,
      gift: combo.gift,
      count: combo.count
    });

    giftCombos.delete(key);
  }, COMBO_DELAY);
});
