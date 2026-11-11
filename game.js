(() => {
  const $ = (id) => document.getElementById(id);
  const cv = $('cv'), c = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, S = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    S = Math.max(0.6, Math.min(W / 420, H / 760));
    cv.width = W * DPR; cv.height = H * DPR;
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  addEventListener('resize', resize); resize();

  const OUT = 'rgba(50,20,50,.6)';
  const rr = (x, y, w, h, r) => {
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const mix = (a, b, k) => {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
  };
  const cooked = (f, k) => ({ ...f, rar: 1, colors: [mix(f.colors[0], '#7a3f17', k), mix(f.colors[1], '#e0a45f', k)] });
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function starPath(ctx, x, y, r) {
    ctx.beginPath(); ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
  }

  // ---------- วาดปลาสไตล์อนิเมะ ----------
  function drawFishOn(ctx, x, y, s, f, t = 0, dir = 1, alpha = 1) {
    const [c1, c2] = f.colors, sw = Math.sin(t * 6) * 0.2;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y); ctx.scale(dir * s, s);
    ctx.lineJoin = 'round'; ctx.lineWidth = 2.2; ctx.strokeStyle = OUT;
    let g;
    if (f.rar >= 4) {
      g = ctx.createRadialGradient(0, 0, 10, 0, 0, 100);
      g.addColorStop(0, c1 + '88'); g.addColorStop(1, c1 + '00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 100, 0, 7); ctx.fill();
    }
    ctx.save(); ctx.translate(-46, 0); ctx.rotate(sw);
    g = ctx.createLinearGradient(-76, 0, 0, 0);
    g.addColorStop(0, c2 + 'cc'); g.addColorStop(1, c1);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-25, -8, -50, -42, -76, -38);
    ctx.bezierCurveTo(-60, -14, -60, 14, -76, 38);
    ctx.bezierCurveTo(-50, 42, -25, 8, 0, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(25, -30);
    ctx.quadraticCurveTo(0, -72 + sw * 20, -38, -14);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    g = ctx.createLinearGradient(0, -40, 0, 40);
    g.addColorStop(0, c1); g.addColorStop(0.6, c2); g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(60, 4);
    ctx.bezierCurveTo(54, -34, 0, -46, -50, -8); ctx.lineTo(-50, 8);
    ctx.bezierCurveTo(0, 44, 54, 32, 60, 4);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      ctx.arc(-28 + i * 16, -18 + j * 13 + (i % 2) * 6, 9, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath();
    ctx.ellipse(5, -22, 30, 6, -0.1, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(10, 10); ctx.rotate(0.5 + sw);
    ctx.strokeStyle = OUT; ctx.lineWidth = 2.2; ctx.fillStyle = c2;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-22, 6, -30, 26); ctx.quadraticCurveTo(-6, 22, 0, 0);
    ctx.fill(); ctx.stroke(); ctx.restore();
    if (f.rar >= 6) {
      ctx.strokeStyle = c1; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(58, 2);
        ctx.bezierCurveTo(80, 2 + d * 14, 95, 2 + d * 20 + sw * 30, 112, 2 + d * 8);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = OUT; ctx.lineWidth = 2;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(38, -8, 10, 0, 7); ctx.fill(); ctx.stroke();
    g = ctx.createRadialGradient(39, -8, 1, 39, -8, 8);
    g.addColorStop(0, '#ffffff55'); g.addColorStop(0.4, c1); g.addColorStop(1, '#2b1b4d');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(39, -8, 7.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#1a1030'; ctx.beginPath(); ctx.arc(40, -8, 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(36, -12, 3, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(43, -4, 1.4, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,160,.45)'; ctx.beginPath();
    ctx.ellipse(34, 8, 6, 3.5, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(55, 4); ctx.quadraticCurveTo(58, 9, 52, 10); ctx.stroke();
    if (f.rar >= 3) {
      ctx.fillStyle = '#fff';
      [[-10, -48], [20, 38], [48, -36]].forEach(([px, py], i) =>
        starPath(ctx, px, py, 3 + 3 * Math.abs(Math.sin(t * 4 + i * 2))));
    }
    ctx.restore();
  }

  // ---------- สถานะร้าน ----------
  const ROLES = {
    fisher:  { emoji: '🎣', col: '#3b82f6' },
    griller: { emoji: '🔥', col: '#ef4444' },
    helper:  { emoji: '🤝', col: '#8b5cf6' },
    buyer:   { emoji: '🛒', col: '#22c55e' }
  };
  const CAP = 1000;
  // ช่องยืน: ผู้ช่วยใช้ช่องย่างหมายเลข 1-2 (ช่อง 0 เป็นของแม่ค้าประจำร้าน)
  const slots = { fisher: [null], griller: [null, null, null], buyer: Array(5).fill(null) };
  const pending = { helper: [], buyer: [] };
  let actors = [], raw = [], ready = [], sold = 0, time = 0, uid = 0, wsOK = false, soldShown = -1;
  const floats = [], toasts = [];
  let toastOn = false, toastT = 0;

  raw = Array.from({ length: 5 }, () => pickFish(1));
  ready = Array.from({ length: 30 }, () => pickFish(rnd(1, 2)));

  const ambient = Array.from({ length: 6 }, (_, i) => ({
    x: Math.random() * 400, y: 0.16 + Math.random() * 0.2,
    v: (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 25),
    s: 0.35 + Math.random() * 0.25, f: FISH[i % 4], ph: Math.random() * 6
  }));

  function slotPos(role, i) {
    if (role === 'fisher') return { x: W * 0.3, y: H * 0.415 };
    if (role === 'griller' || role === 'helper') return { x: W * (0.25 + i * 0.25), y: H * 0.55 };
    return { x: W * (0.09 + i * 0.125), y: H * 0.82 };
  }

  function makeActor(role, i, o) {
    const p = slotPos(role, i);
    const a = {
      id: ++uid, role, slot: i, lv: o.lv || 2, name: String(o.name || 'ผู้เล่น').slice(0, 9),
      need: o.need || 0, got: 0, done: 0, perm: !!o.perm,
      x: role === 'buyer' ? W + 50 : -50, y: p.y, tx: p.x, ty: p.y,
      st: 'walk', t: 0, dur: 0, cool: 0, idle: 0, hue: Math.floor(Math.random() * 360),
      born: time, fish: null, bag: [], say: '', sayT: 0, dead: false
    };
    actors.push(a);
    return a;
  }

  function assign() {
    while (pending.helper.length) {
      const i = [1, 2].find((k) => !slots.griller[k]);
      if (i === undefined) break;
      slots.griller[i] = makeActor('helper', i, pending.helper.shift());
    }
    while (pending.buyer.length) {
      const i = slots.buyer.indexOf(null);
      if (i < 0) break;
      slots.buyer[i] = makeActor('buyer', i, pending.buyer.shift());
    }
  }

  const say = (a, t, d = 1.6) => { a.say = t; a.sayT = d; };
  const float = (x, y, text, col) => floats.push({ x, y, text, col, life: 1.4 });
  function leave(a) {
    if (a.st === 'leave' || a.perm) return;
    const arr = a.role === 'helper' ? slots.griller : slots[a.role];
    arr[a.slot] = null;
    a.st = 'leave'; a.tx = a.role === 'buyer' ? W + 60 : -60;
  }

  // ---------- ของขวัญ / ไลก์ ----------
  const coins = new Map(), likes = new Map();
  const likeAcc = LIKE_RULES.map(() => 0);

  function order(type, n, name, tier) {
    n = Math.max(1, Math.min(n, 60));
    (type === 'buy' ? pending.buyer : pending.helper).push({ name, need: n, lv: tier || 3 });
  }
  function onGift(g, user, count, coin) {
    let n = g.cups ? g.cups * CUP : rnd(g.min, g.max);
    n *= Math.max(1, count || 1);
    order(g.type, n, user, g.tier);
    coins.set(user, (coins.get(user) || 0) + (coin || 0) * Math.max(1, count || 1));
  }
  function onLike(user, count) {
    likes.set(user, (likes.get(user) || 0) + count);
    LIKE_RULES.forEach((r, i) => {
      likeAcc[i] += count;
      while (likeAcc[i] >= r.every) { likeAcc[i] -= r.every; order(r.type, r.n, user, 2); }
    });
  }

  // ---------- ข้อความดวงตอนลูกค้าซื้อ ----------
  function showToast(a, f) {
    if (toasts.length > 6) toasts.shift();
    toasts.push({ who: a.name, n: a.got, f, fo: nextFortune(f.key) });
  }
  function toastStep(dt) {
    if (toastOn) { toastT -= dt; if (toastT <= 0) { toastOn = false; $('toast').style.display = 'none'; } }
    if (!toastOn && toasts.length) {
      const t = toasts.shift();
      toastOn = true; toastT = Math.max(5, t.fo.text.length * 0.09);
      $('tName').textContent = `${t.f.th} ${'★'.repeat(t.f.rar)}`;
      $('tWho').textContent = `${t.who} ซื้อปลาย่าง ${t.n} ชิ้น`;
      $('tText').textContent = t.fo.text;
      $('tLucky').textContent = t.fo.lucky;
      $('toast').style.display = 'block';
      FX.win(t.f.rar); FX.speak(t.fo.text);
    }
  }

  // ---------- พฤติกรรม ----------
  function arrive(a) {
    a.t = 0;
    if (a.role === 'fisher') { a.st = 'cast'; FX.cast(); }
    else if (a.role === 'helper') { a.st = 'work'; a.fish = null; a.done = 0; }
    else { a.st = 'wait'; a.idle = 0; }
  }

  function fisherStep(a) {
    switch (a.st) {
      case 'cast':
        if (a.t > 0.6) { a.st = 'wait'; a.t = 0; a.dur = 3 + Math.random() * 2; }
        break;
      case 'wait':
        if (a.t > a.dur) { a.st = 'bite'; a.t = 0; a.fish = pickFish(a.lv); FX.bite(); say(a, '!', 0.6); }
        break;
      case 'bite':
        if (a.t > 0.6) { a.st = 'reel'; a.t = 0; }
        break;
      case 'reel':
        if (a.t > 0.8) {
          if (raw.length < 40) { raw.push(a.fish); float(a.x, a.y - 110 * S, '+' + a.fish.th, '#ffd666'); }
          FX.splash(); a.fish = null; a.st = 'cast'; a.t = 0;
        }
        break;
    }
  }
  function grillerStep(a) {
    switch (a.st) {
      case 'wait':
        if (raw.length) { a.fish = raw.shift(); a.st = 'grill'; a.t = 0; a.dur = 5; FX.sizzle(); }
        break;
      case 'grill':
        if (a.t >= a.dur) {
          if (ready.length < CAP) { ready.push(a.fish); float(a.x, a.y - 110 * S, '+ปลาย่าง', '#ff9f43'); }
          FX.ding(); a.fish = null; a.st = 'done'; a.t = 0;
        }
        break;
      case 'done':
        if (a.t > 0.4) { a.st = 'wait'; a.t = 0; }
        break;
    }
  }
  function helperStep(a) {
    if (a.st !== 'work') return;
    if (!a.fish) {
      if (ready.length >= CAP) { if (a.sayT <= 0) say(a, 'ถาดเต็มแล้ว!', 1.5); return; }
      a.fish = pickFish(a.lv); a.t = 0; a.dur = a.need >= 20 ? 0.2 : 0.45;
      if (a.done === 0) FX.sizzle();
    } else if (a.t >= a.dur) {
      ready.push(a.fish); a.fish = null; a.done++;
      if (a.done >= a.need) {
        float(a.x, a.y - 110 * S, `+${a.need} ชิ้น`, '#c4a1ff');
        FX.ding(); say(a, 'ช่วยเสร็จแล้ว!'); leave(a);
      }
    }
  }
  function finishBuyer(a) {
    if (a.got > 0) {
      const best = a.bag.reduce((m, f) => (f.rar > m.rar ? f : m), a.bag[0]);
      showToast(a, best); say(a, 'อร่อยแน่!');
    } else say(a, 'รอนานไป ไว้มาใหม่นะ', 2);
    leave(a);
  }
  function buyerStep(a, dt) {
    if (a.st !== 'wait') return;
    a.idle += dt;
    if (a.got >= a.need || a.idle > 40) finishBuyer(a);
  }

  function update(dt) {
    time += dt;
    assign();
    const wb = actors.filter((a) => a.role === 'buyer' && a.st === 'wait').sort((a, b) => a.born - b.born);
    for (const a of wb) {
      if (a.cool <= 0 && ready.length && a.got < a.need) {
        a.bag.push(ready.shift()); a.got++; sold++; a.idle = 0;
        a.cool = a.need >= 20 ? 0.12 : 0.3;
        if (a.got % 3 === 1) FX.coin();
      }
    }
    for (const a of actors) {
      a.t += dt; a.sayT -= dt; a.cool -= dt;
      const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), moving = d > 2;
      if (moving) {
        const sp = 170 * S * dt;
        if (d <= sp) { a.x = a.tx; a.y = a.ty; } else { a.x += (dx / d) * sp; a.y += (dy / d) * sp; }
      }
      if (a.st === 'walk' && !moving) arrive(a);
      else if (a.st === 'leave' && !moving) a.dead = true;
      else if (a.role === 'fisher') fisherStep(a);
      else if (a.role === 'griller') grillerStep(a);
      else if (a.role === 'helper') helperStep(a);
      else buyerStep(a, dt);
    }
    actors = actors.filter((a) => !a.dead);
    ambient.forEach((a) => { a.x += a.v * dt; if (a.x > W + 80) a.x = -80; if (a.x < -80) a.x = W + 80; });
    floats.forEach((f) => { f.y -= 30 * dt; f.life -= dt; });
    for (let i = floats.length - 1; i >= 0; i--) if (floats[i].life <= 0) floats.splice(i, 1);
    toastStep(dt);
    if (sold !== soldShown) { soldShown = sold; $('sold').textContent = sold.toLocaleString('en-US'); }
  }

  // ---------- วาดตัวละคร ----------
  function drawBubble(x, y, text) {
    c.font = `${Math.round(13 * S)}px system-ui,sans-serif`;
    const w = c.measureText(text).width + 14, h = 22 * S;
    c.fillStyle = 'rgba(255,255,255,.95)'; rr(x - w / 2, y - h, w, h, 8); c.fill();
    c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y); c.lineTo(x, y + 6); c.closePath(); c.fill();
    c.fillStyle = '#222'; c.textAlign = 'center'; c.fillText(text, x, y - h * 0.3);
  }

  function drawPerson(a) {
    const s = S * 0.95, walking = a.st === 'walk' || a.st === 'leave';
    const bob = walking ? Math.abs(Math.sin(time * 10 + a.id)) * 3 : Math.sin(time * 2 + a.id);
    const lx = walking ? Math.sin(time * 10 + a.id) * 5 : 0;
    const col = ROLES[a.role].col, hy = -60 - bob;
    const cook = a.role === 'griller' || a.role === 'helper';
    c.save(); c.translate(a.x, a.y); c.scale(s, s);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 0, 20, 6, 0, 0, 7); c.fill();
    c.fillStyle = '#3b3b5c'; rr(-9 + lx, -16, 7, 16, 3); c.fill(); rr(2 - lx, -16, 7, 16, 3); c.fill();
    c.fillStyle = col; c.strokeStyle = OUT; c.lineWidth = 2; rr(-13, -46 - bob, 26, 34, 9); c.fill(); c.stroke();
    if (cook) { c.fillStyle = '#fff'; rr(-9, -42 - bob, 18, 26, 5); c.fill(); }
    c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-12, -40 - bob); c.lineTo(-18, -26 - bob); c.stroke();
    c.beginPath(); c.moveTo(12, -40 - bob); c.lineTo(18, -30 - bob); c.stroke();
    if (a.role === 'fisher') {
      c.strokeStyle = '#8b5a2b'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(16, -30 - bob); c.lineTo(34, -100 - bob); c.stroke();
    } else if (cook) {
      c.strokeStyle = '#999'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(18, -30 - bob); c.lineTo(26, -50 - bob); c.stroke();
      c.fillStyle = '#bbb'; rr(21, -62 - bob, 10, 12, 3); c.fill();
    } else {
      c.fillStyle = '#c28a4a'; rr(14, -28 - bob, 14, 14, 3); c.fill();
    }
    c.fillStyle = '#ffe0c8'; c.strokeStyle = OUT; c.lineWidth = 2;
    c.beginPath(); c.arc(0, hy, 15, 0, 7); c.fill(); c.stroke();
    c.fillStyle = `hsl(${a.hue},55%,30%)`;
    c.beginPath(); c.arc(0, hy - 1, 16, Math.PI, 0); c.quadraticCurveTo(0, hy - 9, -16, hy - 1); c.fill();
    c.fillStyle = '#2b1b3d';
    c.beginPath(); c.ellipse(-6, hy + 1, 3, 4.2, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(6, hy + 1, 3, 4.2, 0, 0, 7); c.fill();
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(-7, hy - 1, 1.2, 0, 7); c.fill();
    c.beginPath(); c.arc(5, hy - 1, 1.2, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,120,160,.5)';
    c.beginPath(); c.ellipse(-10, hy + 7, 3.5, 2.2, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(10, hy + 7, 3.5, 2.2, 0, 0, 7); c.fill();
    c.strokeStyle = '#a0525a'; c.lineWidth = 1.6;
    c.beginPath(); c.arc(0, hy + 6, 3.5, 0.2, Math.PI - 0.2); c.stroke();
    if (a.role === 'fisher') {
      c.fillStyle = '#e8c26b'; c.beginPath(); c.ellipse(0, hy - 10, 22, 5, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(0, hy - 11, 11, Math.PI, 0); c.fill();
    } else if (cook) {
      c.fillStyle = '#fff'; rr(-10, hy - 14, 20, 10, 4); c.fill();
      [-7, 0, 7].forEach((px) => { c.beginPath(); c.arc(px, hy - 17, 7, 0, 7); c.fill(); });
    } else {
      c.fillStyle = '#ff7eb6'; c.beginPath(); c.arc(11, hy - 11, 4, 0, 7); c.fill();
    }
    c.restore();

    c.font = `bold ${Math.round(12 * S)}px system-ui,sans-serif`; c.textAlign = 'center';
    c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.6)';
    let label = `${ROLES[a.role].emoji} ${a.name}`;
    if (a.role === 'buyer') label += ` ${a.got}/${a.need}`;
    if (a.role === 'helper') label += ` ${a.done}/${a.need}`;
    const ly = a.y - 100 * s;
    c.strokeText(label, a.x, ly); c.fillStyle = '#fff'; c.fillText(label, a.x, ly);
    if (a.sayT > 0 && a.say) drawBubble(a.x, a.y - 114 * s, a.say);
  }

  function drawFisherLine(a) {
    if (!['cast', 'wait', 'bite', 'reel'].includes(a.st)) return;
    const s = S * 0.95;
    const tip = { x: a.x + 34 * s, y: a.y - 102 * s };
    const tg = { x: a.x + 46 * S, y: a.y - H * 0.13 };
    let bx, by;
    if (a.st === 'cast') {
      const p = Math.min(1, a.t / 0.6);
      bx = tip.x + (tg.x - tip.x) * p; by = tip.y + (tg.y - tip.y) * p - Math.sin(p * Math.PI) * 30 * S;
    } else if (a.st === 'reel') {
      const p = Math.min(1, a.t / 0.8);
      bx = tg.x + (tip.x - tg.x) * p; by = tg.y + (tip.y - tg.y) * p - Math.sin(p * Math.PI) * 20 * S;
    } else {
      bx = tg.x; by = tg.y + (a.st === 'bite' ? 6 * S + Math.sin(a.t * 40) * 3 * S : Math.sin(time * 2 + a.id) * 2 * S);
    }
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(tip.x, tip.y);
    c.quadraticCurveTo((tip.x + bx) / 2, Math.max(tip.y, by) - 6 * S, bx, by); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by, 6 * S, 0, 7); c.fill();
    c.fillStyle = '#ff3b4e'; c.beginPath(); c.arc(bx, by, 6 * S, Math.PI, 0); c.fill();
    if (a.st === 'reel' && a.fish) drawFishOn(c, bx, by + 8 * S, 0.3 * S, a.fish, time, 1);
  }

  // ---------- วาดฉาก ----------
  function drawScene() {
    let g = c.createLinearGradient(0, 0, 0, H * 0.12);
    g.addColorStop(0, '#ffb3a7'); g.addColorStop(1, '#ffe2b8');
    c.fillStyle = g; c.fillRect(0, 0, W, H * 0.12);
    g = c.createLinearGradient(0, H * 0.12, 0, H * 0.4);
    g.addColorStop(0, '#7ad0ff'); g.addColorStop(1, '#1b6fb5');
    c.fillStyle = g; c.fillRect(0, H * 0.12, W, H * 0.28);
    ambient.forEach((a) => drawFishOn(c, a.x, H * a.y + Math.sin(time + a.ph) * 6, a.s * S, a.f, time + a.ph, a.v > 0 ? 1 : -1, 0.45));
    c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 2;
    for (let k = 0; k < 4; k++) {
      const y = H * 0.14 + k * H * 0.065;
      c.beginPath();
      for (let x = 0; x <= W; x += 12) c.lineTo(x, y + Math.sin(x * 0.03 + time * 1.5 + k) * 3);
      c.stroke();
    }
    c.fillStyle = '#9a6a3a'; c.fillRect(0, H * 0.4, W, H * 0.03);
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1;
    for (let x = 0; x < W; x += 40 * S) { c.beginPath(); c.moveTo(x, H * 0.4); c.lineTo(x, H * 0.43); c.stroke(); }
    g = c.createLinearGradient(0, H * 0.43, 0, H);
    g.addColorStop(0, '#f3d9a4'); g.addColorStop(1, '#e0b878');
    c.fillStyle = g; c.fillRect(0, H * 0.43, W, H * 0.57);
    drawGrill(); drawBasket(); drawCounter(); drawTray();
  }

  function drawGrill() {
    for (let i = 0; i < 3; i++) {
      const p = slotPos('griller', i), w = 100 * S, y0 = H * 0.56, h = H * 0.04;
      const ga = slots.griller[i];
      const active = ga && ga.fish && (ga.st === 'grill' || ga.st === 'work');
      const base = y0 + h + 16 * S, fh = active ? (14 + 8 * Math.sin(time * 9 + i)) * S : 4 * S;
      for (let k = 0; k < 6; k++) {
        const fx = p.x - w / 2 + ((k + 0.5) * w) / 6, hh = fh * (0.7 + 0.3 * Math.sin(time * 11 + k * 2));
        c.fillStyle = active ? '#ff8a1f' : '#a34a1a';
        c.beginPath(); c.moveTo(fx - 6 * S, base);
        c.quadraticCurveTo(fx - 3 * S, base - hh * 0.6, fx, base - hh);
        c.quadraticCurveTo(fx + 3 * S, base - hh * 0.6, fx + 6 * S, base); c.fill();
      }
      c.fillStyle = '#2b2b33'; rr(p.x - w / 2, y0, w, h, 6); c.fill();
      c.strokeStyle = '#666'; c.lineWidth = 2;
      for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(p.x - w / 2 + (k * w) / 6, y0 + 3); c.lineTo(p.x - w / 2 + (k * w) / 6, y0 + h - 3); c.stroke(); }
      if (active) {
        const k = Math.min(1, ga.t / ga.dur);
        drawFishOn(c, p.x, y0 - 2 * S, 0.42 * S, cooked(ga.fish, k), time, 1);
        for (let m = 0; m < 3; m++) {
          const u = ((time * 30 + m * 20) % 50);
          c.fillStyle = `rgba(230,230,230,${0.5 - u / 100})`;
          c.beginPath(); c.arc(p.x + Math.sin(u * 0.2 + m) * 6 * S, y0 - 12 * S - u * S, (5 + u * 0.1) * S, 0, 7); c.fill();
        }
      }
    }
  }

  function drawBasket() {
    const x = W * 0.07, y = H * 0.6;
    for (let i = 0; i < Math.min(raw.length, 6); i++) {
      drawFishOn(c, x + ((i % 3) - 1) * 14 * S, y - 8 * S - Math.floor(i / 3) * 8 * S, 0.22 * S, raw[i], 0, 1);
    }
    c.fillStyle = '#a9743c'; c.strokeStyle = OUT; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x - 30 * S, y - 8 * S); c.lineTo(x + 30 * S, y - 8 * S);
    c.lineTo(x + 22 * S, y + 14 * S); c.lineTo(x - 22 * S, y + 14 * S); c.closePath(); c.fill(); c.stroke();
    c.font = `bold ${Math.round(11 * S)}px system-ui,sans-serif`; c.textAlign = 'center';
    c.fillStyle = '#5b3a29'; c.fillText(`ปลาดิบ ${raw.length}`, x, y + 28 * S);
  }

  function drawCounter() {
    const n = 10, aw = W * 0.92, ax = W * 0.04;
    for (let k = 0; k < n; k++) {
      c.fillStyle = k % 2 ? '#fff' : '#e8403a';
      c.beginPath(); c.moveTo(ax + (k * aw) / n, H * 0.625); c.lineTo(ax + ((k + 1) * aw) / n, H * 0.625);
      c.lineTo(ax + ((k + 1) * aw) / n, H * 0.655); c.arc(ax + ((k + 0.5) * aw) / n, H * 0.655, aw / n / 2, 0, Math.PI);
      c.closePath(); c.fill();
    }
    c.font = `bold ${Math.round(14 * S)}px system-ui,sans-serif`; c.textAlign = 'center';
    c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.5)';
    c.strokeText('🍢 ร้านปลาย่าง 🍢', W / 2, H * 0.618); c.fillStyle = '#fff'; c.fillText('🍢 ร้านปลาย่าง 🍢', W / 2, H * 0.618);
    c.fillStyle = '#8b5a2b'; rr(W * 0.04, H * 0.675, W * 0.92, H * 0.03, 6); c.fill();
    c.fillStyle = '#b57a3d'; rr(W * 0.04, H * 0.675, W * 0.92, H * 0.012, 6); c.fill();
    const cnt = Math.min(ready.length, 8);
    for (let i = 0; i < cnt; i++) drawFishOn(c, W * 0.12 + i * ((W * 0.76) / 8), H * 0.675, 0.3 * S, cooked(ready[i], 1), 0, 1);
  }

  function drawTray() {
    const w = Math.min(W * 0.58, 240 * S), h = 26 * S, x = W * 0.04, y = H * 0.925;
    c.fillStyle = 'rgba(255,255,255,.95)'; rr(x, y, w, h, h / 2); c.fill();
    c.textAlign = 'left'; c.font = `bold ${Math.round(13 * S)}px system-ui,sans-serif`;
    let px = x + 12 * S; const ty = y + h * 0.68;
    c.fillStyle = '#333'; c.fillText('บนถาด ', px, ty); px += c.measureText('บนถาด ').width;
    c.fillStyle = '#16a34a'; c.fillText(String(ready.length), px, ty); px += c.measureText(String(ready.length)).width;
    c.fillStyle = '#777'; c.fillText(' /' + CAP.toLocaleString('en-US'), px, ty);
  }

  function draw() {
    drawScene();
    actors.slice().sort((a, b) => a.y - b.y).forEach((a) => { drawPerson(a); if (a.role === 'fisher') drawFisherLine(a); });
    floats.forEach((f) => {
      c.globalAlpha = Math.max(0, Math.min(1, f.life));
      c.font = `bold ${Math.round(16 * S)}px system-ui,sans-serif`; c.textAlign = 'center';
      c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.6)'; c.strokeText(f.text, f.x, f.y);
      c.fillStyle = f.col; c.fillText(f.text, f.x, f.y);
    });
    c.globalAlpha = 1;
  }

  // ---------- UI: ป้ายของขวัญ + อันดับ ----------
  const testNames = ['พี่หมี', 'น้องมะนาว', 'ลุงโอ', 'แม่ส้ม', 'เจ้าเหมียว', 'ต้นกล้า'];
  const randName = () => testNames[Math.floor(Math.random() * testNames.length)];

  function addRow(parent, icon, text, onClick) {
    const row = document.createElement('div'); row.className = 'gr';
    const ic = document.createElement('span'); ic.className = 'ic'; ic.textContent = icon;
    const tx = document.createElement('span'); tx.textContent = text;
    row.appendChild(ic); row.appendChild(tx);
    row.onclick = () => { FX.unlock(); onClick(); };
    parent.appendChild(row);
  }
  GIFT_TABLE.forEach((g) => addRow($(g.type === 'buy' ? 'pBuy' : 'pHelp'), g.icon, g.text, () => onGift(g, randName(), 1, g.coins)));
  LIKE_RULES.forEach((r) => addRow($(r.type === 'buy' ? 'pBuy' : 'pHelp'), r.icon, r.text, () => onLike(randName(), r.every)));

  function renderBoard(el, map, icon) {
    el.textContent = '';
    [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([name, v], i) => {
      const r = document.createElement('div'); r.className = 'r';
      const rank = document.createElement('span'); rank.textContent = String(i + 1);
      const n = document.createElement('span'); n.className = 'n'; n.textContent = name;
      const val = document.createElement('span'); val.className = 'v'; val.textContent = icon + ' ' + v.toLocaleString('en-US');
      r.appendChild(rank); r.appendChild(n); r.appendChild(val);
      el.appendChild(r);
    });
  }
  setInterval(() => {
    renderBoard($('bCoins'), coins, '🪙');
    renderBoard($('bLikes'), likes, '♥');
    const q = pending.buyer.length ? ` · คิวซื้อ ${pending.buyer.length}` : '';
    const q2 = pending.helper.length ? ` · คิวช่วย ${pending.helper.length}` : '';
    $('status').textContent = (wsOK ? '🟢 เชื่อมต่อ TikTok แล้ว' : '⚪ ออฟไลน์ (โหมดทดสอบ)') + q + q2;
  }, 1000);

  document.addEventListener('pointerdown', () => FX.unlock());

  function connectWS() {
    if (location.protocol === 'file:') return;
    try {
      const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
      ws.onopen = () => { wsOK = true; };
      ws.onclose = () => { wsOK = false; setTimeout(connectWS, 3000); };
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d.type === 'gift') {
          const g = matchGift(d.name);
          if (g) onGift(g, d.user, d.count, d.diamonds);
          else console.log('ของขวัญที่ยังไม่ได้ตั้งค่าใน data.js:', d.name);
        } else if (d.type === 'like') onLike(d.user, d.count || 1);
      };
    } catch (e) {}
  }
  connectWS();

  // แม่ค้ากับลุงตกปลาประจำร้าน
  slots.fisher[0] = makeActor('fisher', 0, { name: 'ลุงเบ็ด', perm: true, lv: 2 });
  slots.griller[0] = makeActor('griller', 0, { name: 'แม่ค้า', perm: true, lv: 2 });

  let t0 = performance.now();
  function frame(now) {
    const dt = Math.min((now - t0) / 1000, 0.05);
    t0 = now; update(dt); draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
