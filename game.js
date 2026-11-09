const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let W,H,dpr=Math.min(devicePixelRatio||1,2);
function fit(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',fit);fit();

const rnd=(a,b)=>a+Math.random()*(b-a);
function hsh(s){let h=0;for(const ch of s)h=(h*31+ch.codePointAt(0))>>>0;return h}
const comboBoost = Math.min(
  100,
  c.g.boost + (c.count - 1) * 8
);

f.r = pick(comboBoost);
  const w=RAR.map((r,i)=>r.w+(i>=2?boost*(i===3?.5:1):-boost*.5*(i?0:1)));
  let s=w.reduce((a,b)=>a+Math.max(b,0),0),x=Math.random()*s;
  for(let i=0;i<w.length;i++){x-=Math.max(w[i],0);if(x<=0)return i}
  return 0
}
const fish=[];
function addFish(r){fish.push({x:rnd(30,W-30),y:rnd(H*.34,H*.56),vx:rnd(12,28)*(Math.random()<.5?-1:1),r,ph:rnd(0,6),st:0,glow:0})}
for(let i=0;i<14;i++)addFish(pick(0));

const casts=[],queue=[],rings=[],score={};
const MAXF=9,GOAL=999;
let released=0,spd=1,lastList=0;

/* ===== ผู้ใช้ + รูปโปรไฟล์ ===== */
const USERS={},AVC={},EMO=['🐱','🐶','🦊','🐼','🐰','🐯','🐸','🐵','🦄','🐧'];
const DID=['nong_pak','kai_jiao_cat','sriwan.th','bakpaeng','pitchayapa_','mutita.m','fon_mai_o','kittisak_k','baifern99','bam_eng_ja'];
function demoAv(i){const h=(i*47+20)%360;return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl('+h+',75%,65%)"/><stop offset="1" stop-color="hsl('+(h+50)+',70%,45%)"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><text x="32" y="45" font-size="34" text-anchor="middle">'+EMO[i]+'</text></svg>')}
NAMES.forEach((n,i)=>{USERS[n]={id:DID[i],nick:n,av:demoAv(i)}});
function userOf(k){return USERS[k]||(USERS[k]={id:String(k).replace(/\s+/g,'_').toLowerCase(),nick:String(k),av:null})}
function avHue(k){return hsh(String(k))%360}
function avImg(k){const u=userOf(k);if(!u.av)return null;let e=AVC[u.av];if(!e){e=AVC[u.av]={i:new Image(),ok:false};e.i.referrerPolicy='no-referrer';e.i.onload=()=>{e.ok=true};e.i.src=u.av}return e.ok?e.i:null}
function avEl(k,sz){
  const u=userOf(k),d=document.createElement('span');d.className='av';
  d.style.cssText='width:'+sz+'px;height:'+sz+'px;background-color:hsl('+avHue(k)+',60%,48%);font-size:'+Math.round(sz*.55)+'px';
  d.textContent=(u.nick||'?').charAt(0).toUpperCase();
  if(u.av){const im=new Image();im.referrerPolicy='no-referrer';im.onload=()=>{d.textContent='';d.style.backgroundImage='url('+JSON.stringify(u.av)+')'};im.src=u.av}
  return d
}
function drawAv(c,x,y,r,k){
  const im=avImg(k),u=userOf(k);c.save();c.beginPath();c.arc(x,y,r,0,6.3);c.clip();
  if(im)c.drawImage(im,x-r,y-r,2*r,2*r);
  else{c.fillStyle='hsl('+avHue(k)+',60%,48%)';c.fillRect(x-r,y-r,2*r,2*r);c.fillStyle='#fff';c.font='600 '+Math.round(r*1.1)+'px Mitr,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText((u.nick||'?').charAt(0).toUpperCase(),x,y+1)}
  c.restore();c.strokeStyle='#f2c14e';c.lineWidth=1.5;c.beginPath();c.arc(x,y,r,0,6.3);c.stroke()
}

/* ===== จุดเชื่อม TikTok ===== */

function onGift({
  name,
  gift,
  count = 1,
  uniqueId,
  nickname,
  avatar
}) {
  const g = GIFT[gift];
  if (!g) return;

  const key = uniqueId || name;
  const u = userOf(key);

  if (uniqueId) u.id = uniqueId;
  if (nickname) u.nick = nickname;
  if (avatar) u.av = avatar;

  count = Math.max(1, Math.floor(Number(count) || 1));

  // หนึ่ง Gift Event = หนึ่งรายการ Combo ในคิว
  queue.push({
    name: key,
    g,
    count,
    eventId: crypto.randomUUID?.() || String(Date.now()) + Math.random()
  });

  toast(key, g, count);
}

}
function toast(name,g,n){
  sfx('gift');const u=userOf(name),feed=document.getElementById('feed'),d=document.createElement('div');d.className='msg gt';
  const t=document.createElement('div'),b=document.createElement('b'),s=document.createElement('small'),l2=document.createElement('div'),im=new Image();
  b.textContent=u.nick;s.textContent=' @'+u.id;im.className='ti';im.src=g.i;l2.append('ส่ง ',im,' '+g.l+' ×'+n);t.append(b,s,l2);d.append(avEl(name,26),t);
  feed.appendChild(d);while(feed.children.length>2)feed.firstChild.remove();setTimeout(()=>d.remove(),5000)
}

/* ===== ตกปลา ===== */
function slotPos(i){const r=Math.floor(i/3),k=i%3;return{x:W*(.5+.16*k+(r===1?.05:0)),y:H*[.67,.75,.83][r],sc:[.85,1,1.15][r]}}

function startCast({name,g,count=1,eventId}) {
  const used = casts.map(c => c.slot);
  let s = 0;

  while (used.includes(s)) s++;

  casts.push({
    name,
    g,
    count,
    eventId,
    f: null,
    t: 0,
    ph: 0,
    ent: 0,
    slot: s,
    wait: rnd(16,20),
    px: rnd(W*.1,W*.9),
    py: rnd(H*.37,H*.54)
  });
}

  const used=casts.map(c=>c.slot);let s=0;while(used.includes(s))s++;
  casts.push({name,g,f:null,t:0,ph:0,ent:0,slot:s,wait:rnd(16,20),px:rnd(W*.1,W*.9),py:rnd(H*.37,H*.54)});
}

function pump() {
  while (queue.length && casts.length < MAXF) {
    const q = queue[0];
    const rods = Math.max(1, q.g.cast || 1);

    // รอจนมีช่องว่างเพียงพอสำหรับเบ็ดทั้งหมด
    if (casts.length + rods > MAXF) break;

    queue.shift();

    // หนึ่ง Combo สามารถสร้างเบ็ดหลายคันตามชนิดของขวัญ
    for (let i = 0; i < rods; i++) {
      startCast(q);
    }
  }
}

function ring(x,y){rings.push({x,y,t:0})}
function drawRings(){for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.t+=.016;ctx.strokeStyle='rgba(180,255,235,'+Math.max(0,.5-r.t/2.4)+')';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(r.x,r.y,r.t*26,r.t*8,0,0,6.3);ctx.stroke();if(r.t>1.2)rings.splice(i,1)}}
function line(x1,y1,x2,y2){ctx.strokeStyle='rgba(255,246,224,.7)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function drawFish(f){drawFishOn(ctx,f)}
function person(x,y,sc,name,t,walk,rod){
  const h=hsh(name),sw=walk?Math.sin(t/110)*5:0,sk=['#f1c9a5','#e0ac82','#c68a63'][h%3],hr=['#2b1b12','#4a2c17','#111'][(h>>2)%3];
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.shadowBlur=0;ctx.lineCap='round';
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,0,13,4,0,0,6.3);ctx.fill();
  ctx.strokeStyle='#2b2b3a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-4,-14);ctx.lineTo(-4+sw,-1);ctx.moveTo(4,-14);ctx.lineTo(4-sw,-1);ctx.stroke();
  ctx.fillStyle='hsl('+(h%360)+',55%,55%)';ctx.beginPath();(ctx.roundRect||ctx.rect).call(ctx,-9,-32,18,20,6);ctx.fill();
  if(rod){ctx.strokeStyle='#d9b27a';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(6,-22);ctx.lineTo(30,-66);ctx.stroke();ctx.strokeStyle=sk;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(7,-28);ctx.lineTo(9,-21);ctx.stroke()}
  ctx.fillStyle=sk;ctx.beginPath();ctx.arc(0,-40,8,0,6.3);ctx.fill();
  ctx.fillStyle=hr;ctx.beginPath();ctx.arc(0,-42,8.2,3.2,6.2);ctx.fill();
  if(h%4===0){ctx.fillStyle='#e8c87a';ctx.beginPath();ctx.ellipse(0,-46,13,3.5,0,0,6.3);ctx.fill();ctx.beginPath();ctx.arc(0,-46,7,3.14,6.28);ctx.fill()}
  ctx.restore()
}
function tag(x,y,sc,name,p){
  const u=userOf(name),nk=u.nick.length>7?u.nick.slice(0,6)+'…':u.nick,hd='@'+(u.id.length>9?u.id.slice(0,8)+'…':u.id);
  ctx.save();ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.font='600 10.5px Sarabun,sans-serif';const w1=ctx.measureText(nk).width;ctx.font='8.5px Sarabun,sans-serif';const w2=ctx.measureText(hd).width;
  const w=Math.max(w1,w2)+34,lx=x-w/2,ty=y-92*sc;
  ctx.fillStyle='rgba(0,0,0,.7)';ctx.beginPath();(ctx.roundRect||ctx.rect).call(ctx,lx,ty,w,26,13);ctx.fill();
  drawAv(ctx,lx+13,ty+13,10,name);
  ctx.font='600 10.5px Sarabun,sans-serif';ctx.fillStyle='#fff6e0';ctx.fillText(nk,lx+27,ty+11);
  ctx.font='8.5px Sarabun,sans-serif';ctx.fillStyle='#f2c14e';ctx.fillText(hd,lx+27,ty+21);
  ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(lx+6,ty+28,w-12,3);ctx.fillStyle='#f2c14e';ctx.fillRect(lx+6,ty+28,(w-12)*p,3);
  ctx.restore()
}
function done(c){
  const r=RAR[c.f.r],txt=r.t[Math.floor(Math.random()*r.t.length)];
  catchPop(c.name,c.f.r,txt,c.g);
  score[c.name]=(score[c.name]||0)+r.p;
  released++;updateUI();
}

/* ===== UI ===== */
function renderList(){
  const n=performance.now();if(n-lastList<400)return;lastList=n;
  const el=document.getElementById('fl');
  el.innerHTML='<div class="qh"><b>คิวรอตกปลา</b><em>'+queue.length+'</em></div>';
  const cur=document.createElement('div');cur.className='qc';
  if(casts.length)cur.append(avEl(casts[0].name,16),userOf(casts[0].name).nick+(casts.length>1?' +'+(casts.length-1):''));
  else cur.textContent='ยังไม่มีคนตกปลา';
  el.appendChild(cur);
  queue.slice(0,5).forEach((q,i)=>{const d=document.createElement('div'),a=document.createElement('span'),b=document.createElement('span');d.className='qr';a.append((i+1)+'.',avEl(q.name,14),userOf(q.name).nick);b.textContent = q.g.l +
  (q.count > 1 ? ' ×' + q.count + ' COMBO' : '');d.append(a,b);el.appendChild(d)});
  if(queue.length>5){const m=document.createElement('div');m.className='fq';m.textContent='อีก '+(queue.length-5)+' คิว';el.appendChild(m)}
}
function updateUI(){
  document.getElementById('gt').textContent='ปล่อยปลาทำบุญ '+released+' / '+GOAL+' ตัว';
  document.getElementById('gb').style.width=Math.min(100,released/GOAL*100)+'%';
  const top=Object.entries(score).sort((a,b)=>b[1]-a[1]).slice(0,5),b=document.getElementById('board');
  b.innerHTML='<b>อันดับคนตกปลา</b>';
  top.forEach(([n,s],i)=>{const d=document.createElement('div'),a=document.createElement('span'),p=document.createElement('span');a.className='rk';a.append((i+1)+'.',avEl(n,15),userOf(n).nick);p.textContent=s;d.append(a,p);b.appendChild(d)})
}

/* ===== ฉาก ===== */
const stars=Array.from({length:60},()=>({x:Math.random(),y:Math.random()*.26,r:Math.random()*1.2+.3,p:Math.random()*6}));
const orbs=Array.from({length:22},()=>({x:Math.random(),y:Math.random(),s:Math.random()*.04+.01,r:Math.random()*2+1,p:Math.random()*6}));
function drawScene(t){
  const hz=H*.26;
  let g=ctx.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#050b1f');g.addColorStop(1,'#16315a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,hz);
  stars.forEach(s=>{ctx.fillStyle='rgba(255,255,255,'+(.5+.5*Math.sin(t/900+s.p))+')';ctx.fillRect(s.x*W,s.y*H,s.r,s.r)});
  ctx.globalCompositeOperation='lighter';
  [['60,255,170',0],['150,90,255',1.7],['255,120,200',3.1]].forEach(([c,o],k)=>{
    ctx.beginPath();ctx.moveTo(0,hz);
    for(let x=0;x<=W;x+=12)ctx.lineTo(x,hz*(.25+.12*k)+Math.sin(x/70+t/1800+o)*14+Math.sin(x/33+t/1100+o)*6);
    ctx.lineTo(W,hz);ctx.closePath();
    const a=ctx.createLinearGradient(0,0,0,hz);a.addColorStop(0,'rgba('+c+',0)');a.addColorStop(.5,'rgba('+c+',.3)');a.addColorStop(1,'rgba('+c+',0)');
    ctx.fillStyle=a;ctx.fill()});
  ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#070f26';ctx.beginPath();ctx.moveTo(0,hz);
  for(let x=0;x<=W;x+=20)ctx.lineTo(x,hz-18-Math.abs(Math.sin(x/55))*34-Math.sin(x/17)*4);
  ctx.lineTo(W,hz);ctx.fill();
  g=ctx.createLinearGradient(0,hz,0,H);g.addColorStop(0,'#173a66');g.addColorStop(1,'#04101f');
  ctx.fillStyle=g;ctx.fillRect(0,hz,W,H-hz);
  ctx.lineWidth=1.5;
  for(let i=0;i<14;i++){const y=hz+8+i*i*1.6+(i*7%5);ctx.strokeStyle='rgba(120,255,210,'+(.12-i*.007)+')';ctx.beginPath();for(let x=0;x<=W;x+=14)ctx.lineTo(x,y+Math.sin(x/40+t/700+i)*2);ctx.stroke()}
  orbs.forEach(o=>{const y=((o.y-(t/1000)*o.s)%1+1)%1,px=o.x*W+Math.sin(t/1200+o.p)*10,py=hz+y*(H-hz);
    ctx.fillStyle='rgba(150,255,220,'+(.25+.25*Math.sin(t/500+o.p))+')';ctx.shadowColor='#6fffd0';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(px,py,o.r,0,6.3);ctx.fill();ctx.shadowBlur=0});
  const b0=H*.6;g=ctx.createLinearGradient(0,b0,0,H);g.addColorStop(0,'#7a5535');g.addColorStop(1,'#2b1b10');
  ctx.fillStyle=g;ctx.fillRect(0,b0,W,H-b0);ctx.fillStyle='#a37a4c';ctx.fillRect(0,b0,W,4);
  ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;
  for(let i=1;i<9;i++){const y=b0+4+(H-b0)*Math.pow(i/9,1.4);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
}

/* ===== ลูปหลัก ===== */
let last=performance.now();
function frame(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  drawScene(now);
  fish.forEach(f=>{
    if(f.st===0){f.x+=f.vx*dt;f.ph+=dt*6;if(f.x<20||f.x>W-20)f.vx*=-1;f.y+=Math.sin(f.ph*.4)*.3}
    if(f.glow>0)f.glow-=dt;
    drawFish(f);
  });
  pump();
  for(let i=casts.length-1;i>=0;i--){
    const c=casts[i],sd=dt*spd,S=slotPos(c.slot);
    if(c.ent<1){c.ent=Math.min(1,c.ent+dt/2.5);const e=c.ent*c.ent*(3-2*c.ent),px=-30+(S.x+30)*e;person(px,S.y,S.sc,c.name,now,c.ent<1,false);tag(px,S.y,S.sc,c.name,0);continue}
    c.t+=sd;
    const ox=S.x+30*S.sc,oy=S.y-66*S.sc;let bx=c.px,by=c.py,f=c.f;
    if(c.ph===0){
      if(!c.snd){c.snd=1;sfx('cast')}const k=Math.min(c.t/1.2,1);bx=ox+(c.px-ox)*k;by=oy+(c.py-oy)*k-Math.sin(k*3.14)*60;
      if(k>=1){c.ph=1;c.t=0;sfx('splash')}
    }else if(c.ph===1){
      by+=Math.sin(now/500+c.px)*2;if(Math.random()<dt*.2)ring(bx,by);
      if(c.t>=c.wait){const free=fish.filter(q=>q.st===0);
        if(free.length){f=c.f=free[Math.floor(Math.random()*free.length)];f.st=1;f.r=pick(c.g.boost);c.ph=2;c.t=0;sfx('bite')}else c.t=c.wait-3}
    }else if(c.ph===2){
      f.x+=(c.px-f.x)*Math.min(dt*3,1);f.y+=(c.py+10-f.y)*Math.min(dt*3,1);f.vx=c.px>f.x?10:-10;f.ph+=dt*8;by+=Math.sin(now/80)*2;
      if(c.t>=2.5){c.ph=3;c.t=0}
    }else if(c.ph===3){
      f.x=c.px+Math.sin(now/130)*28;f.y=c.py+Math.cos(now/170)*14;f.vx=Math.sin(now/130)>0?-10:10;f.ph+=dt*20;by+=Math.sin(now/90)*4;
      if(Math.random()<.08)ring(bx,by);if(Math.random()<dt*5)sfx('reel');
      if(c.t>=7){c.ph=4;c.t=0}
    }else if(c.ph===4){
      f.y-=40*sd;f.glow=1.5;by=f.y;bx=f.x;
      if(c.t>=1.2){c.ph=5;done(c)}
    }else{
      f.vx=(Math.random()<.5?-1:1)*rnd(15,30);f.st=0;f.glow=2.5;casts.splice(i,1);continue
    }
    line(ox,oy,bx,by);
    if(c.ph<4){ctx.fillStyle='#ff6b6b';ctx.beginPath();ctx.arc(bx,by,3.5,0,6.3);ctx.fill()}
    const tot=c.wait+10.7,p=Math.min(1,[0,c.t,c.wait+c.t,c.wait+2.5+c.t,c.wait+9.5,tot][c.ph]/tot);
    person(S.x,S.y,S.sc,c.name,now,false,true);tag(S.x,S.y,S.sc,c.name,p)
  }
  drawRings();renderList();popupTick(now);
  requestAnimationFrame(frame)
}

/* ===== แผงของขวัญ + ปุ่มควบคุม ===== */
const gm=document.getElementById('gm');gm.innerHTML='<b>ของขวัญ</b>';
const lk=n=>'★'.repeat(n)+'☆'.repeat(5-n),rows={};
Object.entries(GIFT).forEach(([k,g])=>{
  const d=document.createElement('button');d.type='button';d.className='gr';
  d.innerHTML='<img class="gi" alt=""><span><i></i><small></small></span>';
  d.querySelector('.gi').src=g.i;d.querySelector('i').textContent=g.l;d.querySelector('small').textContent='Lv.'+g.lv+' '+lk(g.luck);
  d.onclick=()=>{showGift(k);onGift({name:document.getElementById('nm').value.trim()||NAMES[Math.floor(Math.random()*NAMES.length)],gift:k})};
  rows[k]=d;gm.appendChild(d)
});
const gd=document.createElement('div');gd.className='gd';gm.appendChild(gd);
function showGift(k){
  const g=GIFT[k];Object.entries(rows).forEach(([q,r])=>r.classList.toggle('sel',q===k));
  gd.innerHTML='<b></b><span></span><span></span><span></span>';const t=gd.children;
  t[0].textContent='Lv.'+g.lv+' '+g.l;t[1].textContent='เหยื่อ: '+g.bait;
  t[2].textContent='ปลา '+g.sz[0]+'–'+g.sz[1]+' กก. · เบ็ด '+g.cast+' คัน';t[3].textContent='โชค '+lk(g.luck)
}
const gk=Object.keys(GIFT);let gIdx=0;showGift(gk[0]);setInterval(()=>{gIdx=(gIdx+1)%gk.length;showGift(gk[gIdx])},3500);

let timer=null;const ab=document.getElementById('auto');
ab.onclick=()=>{
  if(timer){clearInterval(timer);timer=null;ab.textContent='สุ่มอัตโนมัติ: ปิด'}
  else{ab.textContent='สุ่มอัตโนมัติ: เปิด';timer=setInterval(()=>{
    const k=Object.keys(GIFT);onGift({name:NAMES[Math.floor(Math.random()*NAMES.length)],gift:k[Math.floor(Math.random()*k.length)]})
  },3000)}
};
const sb=document.getElementById('spd');
sb.onclick=()=>{spd=spd===1?10:1;sb.textContent='เร่งเวลา: x'+spd};

const sndb = document.getElementById('snd');
sndb.textContent = 'เสียง: ปิด';console.log('GAME JS LOADED', typeof ac, typeof sfx, muted);


sndb.onclick = async () => {
  muted = !muted;
  sndb.textContent = 'เสียง: ' + (muted ? 'ปิด' : 'เปิด');

  if (!muted) {
    const a = ac();

    if (!a) {
      sndb.textContent = 'เสียง: ไม่รองรับ';
      return;
    }

    try {
      await a.resume();

      if (a.state === 'running') {
        sfx('gift');
      } else {
        sndb.textContent = 'เสียง: แตะเพื่อเปิดอีกครั้ง';
      }
    } catch (e) {
      console.error('Audio error:', e);
      sndb.textContent = 'เสียง: เปิดไม่สำเร็จ';
    }
  }
};

addEventListener('pointerdown', () => {
  if (!muted) ac();
});


updateUI();
requestAnimationFrame(frame);

/* ===== เชื่อมกับเซิร์ฟเวอร์ TikTok + กันเซิร์ฟเวอร์หลับ ===== */
new EventSource('/events').onmessage=e=>onGift(JSON.parse(e.data));
setInterval(()=>fetch('/ping').catch(()=>{}),240000);
