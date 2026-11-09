
/* ===== เสียง: แก้ Safari / Chrome iPhone ===== */
let AC = null, muted = true, NB = null;
const lastS = {};
let audioUnlocking = null;

function ac() {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.error('AudioContext ไม่รองรับ:', e);
      return null;
    }
  }

  if (AC.state !== 'running') {
    if (!audioUnlocking) {
      audioUnlocking = AC.resume()
        .catch(e => console.warn('เปิดเสียงไม่สำเร็จ:', e))
        .finally(() => {
          audioUnlocking = null;
        });
    }
  }

  return AC;
}

function withAudio(fn) {
  if (muted) return;

  const a = ac();
  if (!a) return;

  if (a.state === 'running') {
    fn(a);
    return;
  }

  a.resume().then(() => {
    if (!muted && a.state === 'running') fn(a);
  }).catch(e => console.warn('เล่นเสียงไม่สำเร็จ:', e));
}

function tone(f, t0, d, type, v, f2) {
  withAudio(a => {
    const t = a.currentTime + t0;
    const o = a.createOscillator();
    const g = a.createGain();

    o.type = type;
    o.frequency.setValueAtTime(f, t);

    if (f2 && f2 > 0) {
      o.frequency.exponentialRampToValueAtTime(f2, t + d);
    }

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);

    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + d + 0.05);
  });
}

function noise(t0, d, f, v, f2) {
  withAudio(a => {
    if (!NB) {
      NB = a.createBuffer(1, a.sampleRate, a.sampleRate);
      const b = NB.getChannelData(0);

      for (let i = 0; i < b.length; i++) {
        b[i] = Math.random() * 2 - 1;
      }
    }

    const t = a.currentTime + t0;
    const s = a.createBufferSource();
    const fl = a.createBiquadFilter();
    const g = a.createGain();

    s.buffer = NB;
    s.loop = true;

    fl.type = 'bandpass';
    fl.Q.value = 1.2;
    fl.frequency.setValueAtTime(f, t);

    if (f2 && f2 > 0) {
      fl.frequency.exponentialRampToValueAtTime(f2, t + d);
    }

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);

    s.connect(fl);
    fl.connect(g);
    g.connect(a.destination);

    s.start(t);
    s.stop(t + d + 0.05);
  });
}

const SFX = {
  gift() {
    tone(880, 0, .12, 'sine', .12);
    tone(1320, .09, .18, 'sine', .12);
  },

  cast() {
    noise(0, .35, 400, .14, 2600);
  },

  splash() {
    noise(0, .3, 2000, .12, 500);
    tone(320, 0, .14, 'sine', .12, 120);
  },

  bite() {
    tone(520, 0, .06, 'square', .05);
    tone(520, .1, .06, 'square', .05);
    tone(200, .16, .22, 'sine', .16, 90);
  },

  reel() {
    noise(0, .05, 3200, .06);
  },

  catch() {
    [784, 988, 1175].forEach((f, i) =>
      tone(f, i * .08, .28, 'triangle', .14)
    );
  },

  big() {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone(f, i * .09, .55, 'sawtooth', .06)
    );
    tone(130, 0, .6, 'sine', .22, 60);
    noise(.35, .9, 6000, .05);
  },

  legend() {
    [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) =>
      tone(f, i * .1, .8, 'sawtooth', .06)
    );

    [523, 659, 784].forEach(f =>
      tone(f, .8, 1.6, 'triangle', .09)
    );

    tone(90, 0, 1, 'sine', .3, 40);
    noise(0, .5, 300, .15, 100);
    noise(.7, 1.5, 7000, .06);
  }
};

const GAP = {
  reel: 260,
  cast: 120,
  splash: 120,
  bite: 120
};

function sfx(n) {
  if (muted || !SFX[n]) return;

  const t = performance.now();

  if (t - (lastS[n] || 0) < (GAP[n] || 60)) return;

  lastS[n] = t;

  try {
    SFX[n]();
  } catch (e) {
    console.warn('SFX error:', n, e);
  }
}

/* ปลดล็อกเสียงจากการสัมผัสหน้าจอ */
function unlockGameAudio() {
  if (!muted) ac();
}

document.addEventListener('pointerdown', unlockGameAudio, true);
document.addEventListener('touchstart', unlockGameAudio, {
  capture: true,
  passive: true
});

/* ===== อ่านคำทำนาย (TTS) + พิมพ์ทีละตัวอักษร ===== */
const TTSX={on:true,voice:null};
const TTS_OK='speechSynthesis' in window;
const ttsBtn=document.createElement('button');
ttsBtn.type='button';ttsBtn.className='alt';
document.querySelector('.ctrl .row').appendChild(ttsBtn);
function ttsLabel(){ttsBtn.textContent='อ่านคำทำนาย: '+(TTSX.on?(TTS_OK&&!TTSX.voice?'เปิด (ไม่พบเสียงไทย)':'เปิด'):'ปิด')}
function ttsPick(){if(!TTS_OK)return;TTSX.voice=speechSynthesis.getVoices().find(v=>/^th/i.test(v.lang))||null;ttsLabel()}
if(TTS_OK){ttsPick();speechSynthesis.onvoiceschanged=ttsPick}
ttsLabel();
ttsBtn.onclick=()=>{TTSX.on=!TTSX.on;if(!TTSX.on&&TTS_OK)speechSynthesis.cancel();ttsLabel()};
function ttsSpeak(t){
  if(!TTSX.on||muted||!TTS_OK||!TTSX.voice)return false;
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.voice=TTSX.voice;u.lang=TTSX.voice.lang||'th-TH';u.rate=.95;speechSynthesis.speak(u);return true}catch(e){return false}
}
const SEGX=(window.Intl&&Intl.Segmenter)?new Intl.Segmenter('th',{granularity:'grapheme'}):null;
function thSplit(t){return SEGX?Array.from(SEGX.segment(t),s=>s.segment):Array.from(t)}
addEventListener('pointerdown',()=>{if(TTS_OK){try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}catch(e){}}},{once:true});

/* ===== ป๊อปอัปตกปลา ===== */
const popQ=[];let pop=null,parts=[],lastP=0;
function catchPop(name,k,txt,g){
  const w=+(g.sz[0]+(g.sz[1]-g.sz[0])*Math.min(1,Math.random()*.55+k*.15)).toFixed(1),tier=k===3?2:(k===2||w>=5)?1:0;
  popQ.push({name,k,txt,w,tier});
  if(popQ.filter(p=>!p.tier).length>4)popQ.splice(popQ.findIndex(p=>!p.tier),1)
}
function burst(n){
  const cf=document.getElementById('conf');if(cf.width!==W||cf.height!==H){cf.width=W;cf.height=H}
  const m=Math.max(2,Math.round(n*.45));
  for(let i=0;i<m;i++)parts.push({x:W*.27,y:H*.3,vx:rnd(-220,220),vy:rnd(-340,-80),r:rnd(0,6),vr:rnd(-8,8),c:['#f2c14e','#f08aa6','#6fffd0','#fff6e0','#9b7bff'][i%5],s:rnd(4,7)});
}
const puEl=document.createElement('div'),pnEl=document.getElementById('pn'),phdEl=document.createElement('div'),pnWrap=document.createElement('div');
puEl.id='pu';phdEl.id='phd';pnEl.parentNode.insertBefore(puEl,pnEl);pnWrap.append(pnEl,phdEl);puEl.appendChild(pnWrap);

function popupTick(now){
  const el=document.getElementById('pop'),dt=Math.min((now-lastP)/1000,.05);lastP=now;
  if(!pop&&popQ.length){
    pop=popQ.shift();pop.t0=now;
    pop.seg=thSplit('“'+pop.txt+'”');pop.shown=-1;
    const spoke=popQ.length<=2&&ttsSpeak(pop.txt);
    const est=pop.txt.length/8*1000+700;
    pop.typeMs=spoke?est*.85:Math.min(1800,pop.seg.length*45);
    const base=pop.tier===2?7000:pop.tier?5500:(popQ.length>2?2600:4200);
    pop.dur=Math.max(base,pop.typeMs+1200,spoke?est+500:0);
    const u=userOf(pop.name);
    puEl.querySelectorAll('.av').forEach(a=>a.remove());puEl.prepend(avEl(pop.name,pop.tier?30:22));
    pnEl.textContent=u.nick;phdEl.textContent='@'+u.id;
    el.className=(pop.tier?'b':'n')+(pop.tier===2?' l':'');
    document.getElementById('pt').textContent=pop.tier===2?'ปลาในตำนาน! 🐉':pop.tier?'ตกได้ปลาตัวใหญ่!':'ตกได้แล้ว';
    document.getElementById('pf').textContent=RAR[pop.k].n+' · '+pop.w+' กก.';
    void el.offsetWidth;el.classList.add('on');sfx(pop.tier===2?'legend':pop.tier?'big':'catch');
    if(pop.tier){burst(pop.tier===2?190:110);if(pop.tier===2){const st=document.getElementById('stage');st.classList.remove('shake');void st.offsetWidth;st.classList.add('shake')}}
  }
  if(pop){
    const age=now-pop.t0,k=pop.k,g=document.getElementById('pcv').getContext('2d');
    const sP=(12+k*5)*(k===3?1.12:1),L=(.85+FSP[k].tl)*sP,R=1.1*sP,m=Math.min(2.9,130/((L+R)/2));
    g.clearRect(0,0,280,160);g.save();g.translate(140-m*(R-L)/2,80);g.scale(m,m);
    drawFishOn(g,{x:0,y:Math.sin(age/400)*4/m,vx:1,ph:age/170,glow:1,r:k});g.restore();
    const n=Math.min(pop.seg.length,Math.floor(Math.max(0,age-250)/pop.typeMs*pop.seg.length));
    if(n!==pop.shown){
      pop.shown=n;const q=document.getElementById('pq');q.textContent='';
      const a=document.createElement('span'),b=document.createElement('span');
      a.textContent=pop.seg.slice(0,n).join('');b.textContent=pop.seg.slice(n).join('');b.style.opacity='0';
      q.append(a,b);
    }
    if(pop.tier)document.getElementById('pf').textContent=RAR[k].n+' · '+(pop.w*Math.min(1,age/1400)).toFixed(1)+' กก.';
    if(pop.tier===2&&Math.random()<dt*12)burst(4);
    if(age>pop.dur){el.classList.remove('on');pop=null}
  }
  if(parts.length){
    const cf=document.getElementById('conf'),c2=cf.getContext('2d');c2.clearRect(0,0,cf.width,cf.height);
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.vy+=520*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;
      if(p.y>H+20){parts.splice(i,1);continue}
      c2.fillStyle=p.c;c2.save();c2.translate(p.x,p.y);c2.rotate(p.r);c2.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);c2.restore()}
    if(!parts.length)c2.clearRect(0,0,cf.width,cf.height)
  }
}

/* ===== วาดปลา ===== */
function sm(c,p,mv){if(mv)c.moveTo(p[0][0],p[0][1]);else c.lineTo(p[0][0],p[0][1]);for(let i=1;i<p.length-1;i++){c.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2)}c.lineTo(p[p.length-1][0],p[p.length-1][1])}
function drawFishOn(c,f){
  const k=f.r,P=FSP[k],s=(12+k*5)*(k===3?1.12:1),d=f.vx>0?1:-1,sw=Math.sin(f.ph),H=P.H,N=26,now=Date.now();
  const T=[],B=[],X=u=>-.85*s+u*1.9*s,Y=u=>sw*s*.16*Math.pow(1-u,1.6);
  for(let i=0;i<=N;i++){const u=i/N,pr=.1+.9*Math.pow(Math.sin(Math.PI*Math.pow(u,.8)),.65);T.push([X(u),-pr*H*s*.95+Y(u)]);B.push([X(u),pr*H*s*(k===3?.7:1)+Y(u)])}
  const fg=(x0,x1,a,b)=>{const g=c.createLinearGradient(x0,0,x1,0);g.addColorStop(0,a);g.addColorStop(1,b);return g};
  const ell=(x,y,rx,ry)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.3);c.fill()};
  c.save();c.translate(f.x,f.y);c.scale(d,1);c.rotate(sw*.04);
  const ag=c.createRadialGradient(0,0,s*.3,0,0,s*2.6),al=(k>=2?.28:.1)+(f.glow>0?.25:0);
  ag.addColorStop(0,'rgba('+P.aura+','+al+')');ag.addColorStop(1,'rgba('+P.aura+',0)');c.fillStyle=ag;c.beginPath();c.arc(0,0,s*2.6,0,6.3);c.fill();
  {const sx=sw*s*.32;c.save();c.translate(X(0),Y(0));c.fillStyle=fg(0,-s*P.tl,P.fin[0],P.fin[1]);c.globalAlpha=k>=2?.88:.95;
   c.beginPath();c.moveTo(0,-s*.07);c.bezierCurveTo(-s*P.tl*.5,-s*P.tw*.75+sx*.5,-s*P.tl,-s*P.tw+sx,-s*P.tl,-s*P.tw*.9+sx);
   c.bezierCurveTo(-s*P.tl*(1-P.fk),-s*P.tw*.3+sx*.8,-s*P.tl*(1-P.fk),s*P.tw*.3+sx*.8,-s*P.tl,s*P.tw*.9+sx);
   c.bezierCurveTo(-s*P.tl,s*P.tw+sx,-s*P.tl*.5,s*P.tw*.75+sx*.5,0,s*.07);c.closePath();c.fill();c.globalAlpha=1;
   c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=.6;c.beginPath();for(let i=-3;i<=3;i++){c.moveTo(0,i*s*.02);c.quadraticCurveTo(-s*P.tl*.6,i*s*P.tw*.3+sx*.5,-s*P.tl*.96,i*s*P.tw*.32+sx)}c.stroke();c.restore()}
  const fin=(ua,ub,h,dir)=>{const arr=dir<0?T:B,A=arr[Math.round(ua*N)],Z=arr[Math.round(ub*N)],hh=h*s*dir;
   c.beginPath();c.moveTo(A[0],A[1]);c.bezierCurveTo(A[0]-s*.05,A[1]+hh*1.05+sw*s*.05,Z[0]+s*.25,Z[1]+hh*.8+sw*s*.1,Z[0]-s*.05,Z[1]+hh*.2);c.lineTo(Z[0],Z[1]);c.closePath();
   c.fillStyle=fg(A[0],Z[0],P.fin[0],P.fin[1]);c.globalAlpha=.88;c.fill();c.globalAlpha=1;
   c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=.5;c.beginPath();for(let i=1;i<5;i++){const t=i/5;c.moveTo(A[0]+(Z[0]-A[0])*t,A[1]+(Z[1]-A[1])*t);c.lineTo(A[0]+(Z[0]-A[0])*t*.8+s*.1*(1-t),A[1]+hh*(1-t*.5))}c.stroke()};
  fin(k===3?.46:.64,k===3?.06:.3,P.dh,-1);fin(k===3?.44:.42,k===3?.08:.2,k===3?.28:.3,1);
  c.beginPath();sm(c,T,1);sm(c,B.slice().reverse(),0);c.closePath();
  const bg=c.createLinearGradient(0,-H*s,0,H*s);bg.addColorStop(0,P.bk);bg.addColorStop(.5,P.md);bg.addColorStop(1,P.bl);c.fillStyle=bg;c.fill();
  c.save();c.clip();
  if(k===1){c.fillStyle='#ff5a1f';ell(.3*s,-.2*s,.4*s,.2*s);ell(-.38*s,-.06*s,.3*s,.22*s);c.fillStyle='#e8321e';ell(.05*s,-.32*s,.16*s,.1*s);c.fillStyle='#2a1a1a';ell(-.12*s,-.14*s,.07*s,.05*s)}
  const sc=s*(k===3?.2:k===2?.15:.14),rr=sc*.6;c.strokeStyle=P.sc;c.lineWidth=.6;c.beginPath();
  for(let r=-6;r<=6;r++){const yy=r*sc*.75;if(Math.abs(yy)>H*s)continue;for(let x=-.7*s+((r&1)?sc*.5:0);x<.5*s;x+=sc){c.moveTo(x+Math.cos(2)*rr,yy+Math.sin(2)*rr);c.arc(x,yy,rr,2,4.28)}}c.stroke();
  let g2=c.createLinearGradient(0,-H*s,0,H*s);g2.addColorStop(0,'rgba(0,0,0,.3)');g2.addColorStop(.35,'rgba(0,0,0,0)');g2.addColorStop(.7,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,.2)');c.fillStyle=g2;c.fillRect(-s,-H*s*1.2,s*2.4,H*s*2.4);
  g2=c.createLinearGradient(0,-H*s*.75,0,-H*s*.15);g2.addColorStop(0,'rgba(255,255,255,.42)');g2.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g2;c.fillRect(-s,-H*s*1.2,s*2.4,H*s*2.4);
  const t=(now%2800)/2800,sx0=-s+t*3*s;g2=c.createLinearGradient(sx0-s*.25,0,sx0+s*.25,0);g2.addColorStop(0,'rgba(255,255,255,0)');g2.addColorStop(.5,'rgba(255,255,255,'+(k>=2?.45:.22)+')');g2.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g2;c.fillRect(-s,-H*s*1.2,s*2.4,H*s*2.4);
  c.restore();c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=.8;c.stroke();
  c.strokeStyle='rgba(0,0,0,.32)';c.lineWidth=.9;c.beginPath();c.arc(.5*s,0,H*s*.78,2.05,4.23);c.stroke();
  c.strokeStyle='rgba(255,255,255,.3)';c.beginPath();c.arc(.5*s+.7,0,H*s*.78,2.1,4.2);c.stroke();
  c.save();c.translate(.42*s,H*s*.28);c.rotate(.5+Math.sin(f.ph*1.3)*.25);c.fillStyle=fg(0,-s*.5,P.fin[0],P.fin[1]);c.globalAlpha=.8;
  c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-s*.25,-s*.12,-s*.5,s*.02);c.quadraticCurveTo(-s*.25,s*.14,0,0);c.fill();c.restore();
  const ex=.7*s,ey=-H*s*.2,er=s*(k===3?.085:.1);
  c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.arc(ex,ey,er+.8,0,6.3);c.fill();
  const ig=c.createRadialGradient(ex,ey,0,ex,ey,er);ig.addColorStop(0,'#ffe9a0');ig.addColorStop(1,k===3?'#ff9d2e':'#d9a441');c.fillStyle=ig;c.beginPath();c.arc(ex,ey,er,0,6.3);c.fill();
  c.fillStyle='#07070a';c.beginPath();c.arc(ex+er*.1,ey,er*.55,0,6.3);c.fill();
  c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.arc(ex-er*.25,ey-er*.3,er*.22,0,6.3);c.fill();
  c.strokeStyle='rgba(60,20,20,.55)';c.lineWidth=.9;c.beginPath();c.moveTo(1.03*s,H*s*.02);c.quadraticCurveTo(.9*s,H*s*.12,.8*s,H*s*.1);c.stroke();
  if(k===1||k===3){c.strokeStyle=k===3?'rgba(255,214,120,.9)':'rgba(255,240,220,.9)';c.lineWidth=.9;for(let o=0;o<2;o++){c.beginPath();c.moveTo(s,H*s*(.1+o*.04));c.quadraticCurveTo(1.1*s,H*s*(.4+o*.2)+sw*s*.05,.95*s+o*.1*s,H*s*(.75+o*.25));c.stroke()}}
  if(k>=2){const n=k===3?5:3;for(let i=0;i<n;i++){const a=now/700+i*6.28/n,px=Math.cos(a)*s*(1.1+.3*Math.sin(i*2.3)),py=Math.sin(a*1.3)*s*H*1.2,z=s*.09*(.6+.4*Math.sin(now/180+i*2));
   c.fillStyle='rgba(255,246,200,.9)';c.beginPath();c.moveTo(px,py-z*2);c.lineTo(px+z*.5,py-z*.5);c.lineTo(px+z*2,py);c.lineTo(px+z*.5,py+z*.5);c.lineTo(px,py+z*2);c.lineTo(px-z*.5,py+z*.5);c.lineTo(px-z*2,py);c.lineTo(px-z*.5,py-z*.5);c.closePath();c.fill()}}
  c.restore()
}
