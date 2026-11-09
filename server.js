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
tt.on('gift',d=>{
 if(d.giftType===1&&!d.repeatEnd)return;
 const msg=JSON.stringify({
  uniqueId:d.uniqueId,nickname:d.nickname,avatar:d.profilePictureUrl,
  gift:MAP[d.giftName]||'rose',count:d.repeatCount||1
 });
 clients.forEach(c=>c.write('data: '+msg+'\n\n'));
});
