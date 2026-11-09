
/* ===== เสียง: ปรับให้รองรับ iPhone / Safari ===== */
let AC=null,muted=false,NB=null;
const lastS={};
let resumePromise=null;

function ac(){
  if(!AC){
    try{
      AC=new(window.AudioContext||window.webkitAudioContext)();
    }catch(e){
      return null;
    }
  }

  if(AC.state==='suspended' && !resumePromise){
    resumePromise=AC.resume()
      .catch(()=>{})
      .finally(()=>{resumePromise=null});
  }

  return AC;
}

function tone(f,t0,d,type,v,f2){
  const a=ac();
  if(!a||muted||a.state!=='running')return;

  const t=a.currentTime+t0;
  const o=a.createOscillator();
  const g=a.createGain();

  o.type=type;
  o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);

  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(v,t+.015);
  g.gain.exponentialRampToValueAtTime(.0001,t+d);

  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t+d+.05);
}

function noise(t0,d,f,v,f2){
  const a=ac();
  if(!a||muted||a.state!=='running')return;

  if(!NB){
    NB=a.createBuffer(1,a.sampleRate,a.sampleRate);
    const b=NB.getChannelData(0);
    for(let i=0;i<b.length;i++)b[i]=Math.random()*2-1;
  }

  const t=a.currentTime+t0;
  const s=a.createBufferSource();
  const fl=a.createBiquadFilter();
  const g=a.createGain();

  s.buffer=NB;
  s.loop=true;
  fl.type='bandpass';
  fl.Q.value=1.2;
  fl.frequency.setValueAtTime(f,t);
  if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);

  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(v,t+.02);
  g.gain.exponentialRampToValueAtTime(.0001,t+d);

  s.connect(fl);
  fl.connect(g);
  g.connect(a.destination);
  s.start(t);
  s.stop(t+d+.05);
}

const SFX={
  gift(){
    tone(880,0,.12,'sine',.12);
    tone(1320,.09,.18,'sine',.12);
  },
  cast(){noise(0,.35,400,.14,2600)},
  splash(){
    noise(0,.3,2000,.12,500);
    tone(320,0,.14,'sine',.12,120);
  },
  bite(){
    tone(520,0,.06,'square',.05);
    tone(520,.1,.06,'square',.05);
    tone(200,.16,.22,'sine',.16,90);
  },
  reel(){noise(0,.05,3200,.06)},
  catch(){
    [784,988,1175].forEach((f,i)=>tone(f,i*.08,.28,'triangle',.14));
  },
  big(){
    [523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.09,.55,'sawtooth',.06));
    tone(130,0,.6,'sine',.22,60);
    noise(.35,.9,6000,.05);
  },
  legend(){
    [392,523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,i*.1,.8,'sawtooth',.06));
    [523,659,784].forEach(f=>tone(f,.8,1.6,'triangle',.09));
    tone(90,0,1,'sine',.3,40);
    noise(0,.5,300,.15,100);
    noise(.7,1.5,7000,.06);
  }
};

const GAP={reel:260,cast:120,splash:120,bite:120};

function sfx(n){
  if(muted||!SFX[n])return;

  const t=performance.now();
  if(t-(lastS[n]||0)<(GAP[n]||60))return;
  lastS[n]=t;

  const a=ac();
  if(!a)return;

  const play=()=>{
    if(muted||a.state!=='running')return;
    try{SFX[n]()}catch(e){}
  };

  if(a.state==='running'){
    play();
  }else if(resumePromise){
    resumePromise.then(play);
  }else{
    a.resume().then(play).catch(()=>{});
  }
}
