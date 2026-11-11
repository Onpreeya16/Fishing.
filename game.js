const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 720, H = 1280;
cv.width = W; cv.height = H;
const SANS = "'Noto Sans Thai',Sarabun,Tahoma,sans-serif";
const TEST = location.search.includes('test'), seg = new Intl.Segmenter('th', { granularity: 'word' });
const VOICE = !location.search.includes('voice=off'); // ?voice=off ปิดเสียงอ่านของเกม (ใช้เสียงอ่านจากโปรแกรมอื่นแทน)
const READ_ALL = true; // true = อ่านคำทำนายทุกบรรทัด, false = อ่านแค่บรรทัดแรก
const IDLE = 'ส่งของขวัญเพื่อรับคำอวยพร กดหัวใจครบ 50 ครั้งเพื่อเสี่ยงเซียมซี พิมพ์ สาธุ ในแชตเพื่อน้อมรับ';
const POP_MS = 4500;   // ป๊อปอัปแสดงอย่างน้อยกี่มิลลิวินาที (เปิดเสียง = รออ่านจบก่อนค่อยเปลี่ยน)
const MAXP = 24;       // จำนวนคนสูงสุดบนจอ เต็มแล้วคนเก่าสุดจะค่อยๆ จางหายไป
const HEARTS = 50;     // กดหัวใจครบกี่ครั้งถึงได้เสี่ยงเซียมซี 1 ครั้ง
const queue = [], users = {}, counts = { altar: 0, rice: 0, fish: 0 }, shared = {}, ST = {}, walkers = [], sadhu = [], lastSadhu = {}, likes = {};
let hits = [], pops = [], pq = [], lastStep = 0, lastIdle = performance.now(), started = false, goal = 0, goalMax = 35, goalFlash = 0;
const bg = new Image(); bg.src = 'bg.jpg';

// ---------- ตัวสร้างคำทำนาย: ประกอบจากชิ้นส่วน ได้หลายหมื่นแบบต่ออาคาร ----------
const FT = {
  lead: {
    good: ['ดวงดีมาก', 'เทพเจ้าเมตตา', 'ดวงชะตากำลังขึ้น', 'ลมดีพัดมาแล้ว', 'บุญหนุนนำ', 'ฟ้าเปิดทางให้', 'สิ่งศักดิ์สิทธิ์คุ้มครอง', 'ดาวมงคลส่องแสง', 'พลังบุญเปล่งประกาย', 'ความโชคดีกำลังมาเยือน', 'ชะตาส่งยิ้มให้', 'ฤกษ์งามยามดี'],
    mid: ['ดวงทรงตัว', 'ชะตาอยู่ในช่วงพัก', 'ลมเปลี่ยนทิศแล้ว', 'ดาวส่องแสงอ่อนๆ', 'ฟ้ายังไม่เปิดเต็มที่', 'ชะตากำลังรอจังหวะ', 'เทพเจ้าฝากข้อคิด', 'ดวงอยู่ในจังหวะกลางๆ', 'ช่วงนี้ต้องใจเย็น', 'พลังกำลังสะสม', 'ลมสงบก่อนคลื่นลูกใหม่', 'ดวงคงที่ รอสัญญาณ'],
    caution: ['เทพเจ้าเตือนด้วยความหวังดี', 'ดวงมีเมฆบังเล็กน้อย', 'ชะตาให้ระวังไว้ก่อน', 'ลมเริ่มแปรปรวน', 'ดาวเตือนให้รอบคอบ', 'ช่วงนี้ต้องตั้งสติ', 'เทพเจ้าส่งสัญญาณเตือน', 'ดวงอ่อนลงชั่วคราว', 'ฟ้าให้ชะลอสักนิด', 'พลังกำลังต่ำ ควรถนอมใจ', 'ชะตากำลังทดสอบใจ', 'ควรเว้นจังหวะสักหน่อย']
  },
  subj: {
    altar: ['ความสุขในครอบครัว', 'สุขภาพกายและใจ', 'ความมั่นคงของชีวิต', 'ความตั้งใจที่อธิษฐานไว้', 'ความเป็นสิริมงคลรอบตัว', 'บารมีและเกียรติยศ', 'ความสงบในจิตใจ', 'ผู้ใหญ่ที่คอยอุปถัมภ์', 'งานบุญที่ทำไว้', 'ความเชื่อมั่นในตัวเอง'],
    rice: ['ปัจจัยสี่ในชีวิต', 'ความอุดมสมบูรณ์ในบ้าน', 'น้ำใจที่ให้ผู้อื่น', 'อาหารการกินและรายได้ประจำ', 'ความเอื้อเฟื้อที่ส่งออกไป', 'ผลบุญจากการแบ่งปัน', 'ความอบอุ่นในครอบครัว', 'มิตรภาพรอบตัว', 'ความไม่ขาดแคลน', 'ทรัพย์เล็กทรัพย์น้อยที่สะสมไว้'],
    fish: ['เส้นทางเงินทอง', 'โชคลาภที่ไหลมาเทมา', 'ความราบรื่นของชีวิต', 'โอกาสใหม่ๆ', 'ลาภที่ไม่คาดฝัน', 'กระแสเงินในกระเป๋า', 'พลังแห่งสายน้ำมงคล', 'การปล่อยวางสิ่งที่หนักใจ', 'ความคล่องตัวในทุกเรื่อง', 'อุปสรรคเก่าๆ'],
    almanac: ['วันนี้', 'สามวันข้างหน้า', 'ฤกษ์เดินทาง', 'ฤกษ์เซ็นสัญญา', 'ฤกษ์ขอพร', 'ฤกษ์เริ่มงานใหม่', 'ฤกษ์พบปะผู้ใหญ่', 'ฤกษ์ซื้อของสำคัญ', 'ฤกษ์ตัดสินใจเรื่องใหญ่', 'ช่วงสุดสัปดาห์นี้'],
    work: ['เรื่องงาน', 'หน้าที่การงาน', 'โอกาสเลื่อนตำแหน่ง', 'ความสัมพันธ์กับเพื่อนร่วมงาน', 'โปรเจกต์ที่ทำอยู่', 'เจ้านายและผู้ใหญ่ที่ทำงาน', 'การเปลี่ยนงาน', 'ธุรกิจส่วนตัว', 'ผลงานที่ตั้งใจทำ', 'รายได้จากการทำงาน'],
    love: ['เรื่องความรัก', 'คนที่แอบชอบ', 'คนข้างกาย', 'โอกาสพบคนถูกใจ', 'ความสัมพันธ์ปัจจุบัน', 'คนในอดีต', 'ความรักของครอบครัว', 'มิตรภาพที่ลึกซึ้ง', 'หัวใจของคุณ', 'การสื่อสารกับคนรัก'],
    study: ['การเรียน', 'การสอบที่รออยู่', 'ความตั้งใจอ่านหนังสือ', 'ความจำและสมาธิ', 'ทักษะใหม่ที่กำลังฝึก', 'ครูบาอาจารย์', 'งานกลุ่มที่ทำอยู่', 'เป้าหมายการศึกษา', 'ความรู้ที่สะสมไว้', 'การพัฒนาตัวเอง'],
    money: ['การเงิน', 'รายได้เสริม', 'เงินออม', 'การลงทุน', 'หนี้สินที่มีอยู่', 'การใช้จ่ายประจำ', 'โชคลาภทางการเงิน', 'การค้าขาย', 'เงินก้อนที่รอคอย', 'แผนการเงินระยะยาว'],
    qian: ['โชคชะตาโดยรวม', 'เรื่องที่ตั้งใจขอ', 'ช่วงเวลาต่อจากนี้', 'งาน การเงิน และความรัก', 'คำตอบที่รอคอย', 'ทิศทางชีวิต', 'คนรอบข้าง', 'ความตั้งใจของคุณ', 'อนาคตอันใกล้', 'สิ่งที่กังวลใจ'],
    buei: ['ทุกความตั้งใจ', 'สิ่งที่ขอไว้', 'ทุกการเดินทาง', 'ทุกก้าวของชีวิต', 'ครอบครัวและคนที่รัก', 'โชคลาภเงินทอง', 'งานที่ทำ', 'สุขภาพ', 'หัวใจที่ตั้งมั่น', 'ปีนี้ทั้งปี']
  },
  pred: {
    good: ['กำลังมีข่าวดีเข้ามา', 'เป็นไปด้วยดีเกินคาด', 'เปล่งประกายสดใส', 'มีผู้ใหญ่ใจดีช่วยหนุนนำ', 'จะราบรื่นกว่าที่คิด', 'มีโอกาสดีรออยู่ใกล้ๆ', 'เริ่มเห็นผลสมหวัง', 'ดีขึ้นทุกวัน', 'มั่นคงและเติบโต', 'จะเป็นที่น่าพอใจอย่างยิ่ง', 'ได้รับพรจากเทพเจ้าเต็มที่', 'มีแต่เรื่องน่ายินดี'],
    mid: ['ต้องใช้เวลาและความอดทนอีกนิด', 'ยังนิ่งๆ แต่กำลังค่อยๆ ขยับ', 'ต้องรอจังหวะที่เหมาะสม', 'อยู่ในช่วงทรงตัว ไม่ต้องเร่งรีบ', 'มีทั้งดีและท้าทายปนกัน', 'ต้องอาศัยการวางแผนให้ดี', 'ยังไม่ชัดเจนนัก ควรรอดูก่อน', 'จะดีขึ้นหากไม่ใจร้อน', 'เหมือนเมฆบางๆ บังแสง', 'ต้องการความมั่นคงทางใจ', 'ใกล้ถึงจุดเปลี่ยนแล้ว', 'เดินช้าแต่แน่นอน'],
    caution: ['ควรระวังความผิดพลาดเล็กๆ', 'อาจมีอุปสรรคเข้ามาทดสอบใจ', 'ต้องรอบคอบเป็นพิเศษ', 'มีเรื่องเข้าใจผิดแฝงอยู่', 'อาจเหนื่อยกว่าที่คิด', 'อย่าเพิ่งรีบตัดสินใจ', 'มีเรื่องกวนใจเล็กน้อย', 'ต้องระวังคำพูดและอารมณ์', 'อาจมีค่าใช้จ่ายไม่คาดคิด', 'ต้องตั้งสติให้มั่น', 'มีเงาเมฆบังอยู่ชั่วคราว', 'อย่าประมาทรายละเอียด']
  },
  adv: {
    good: ['ลงมือทำสิ่งที่ตั้งใจได้เลย', 'เปิดใจรับโอกาสใหม่ๆ', 'ยิ้มรับโชคดีไว้ให้เต็มที่', 'ทำบุญเพิ่มพลังให้ยิ่งส่งผล', 'แบ่งปันความสุขให้คนรอบข้าง', 'เดินหน้าอย่างมั่นใจ', 'ขอบคุณสิ่งดีๆ ที่ได้รับ', 'รักษาน้ำใจดีๆ นี้ไว้', 'พูดสิ่งดีๆ ให้ตัวเองฟัง', 'ตื่นเช้าสักนิดจะยิ่งเฮง', 'ใส่เสื้อสีสดใสเสริมดวง', 'ใช้โอกาสนี้ให้คุ้มที่สุด'],
    mid: ['ตั้งสติ วางแผนทีละขั้น', 'พักใจสักนิดแล้วค่อยลุย', 'ปรึกษาคนที่ไว้ใจก่อนตัดสินใจ', 'อดทนอีกนิด ผลดีกำลังตามมา', 'ทำสิ่งเล็กๆ ให้ดีที่สุด', 'จดสิ่งที่ต้องทำไว้ให้ชัดเจน', 'พักผ่อนให้พอ ใจจะนิ่งขึ้น', 'อย่าเปรียบเทียบกับคนอื่น', 'ใจเย็นแล้วทุกอย่างจะลงตัว', 'นั่งสงบสักห้านาทีจะช่วยได้', 'เก็บแรงไว้สำหรับจังหวะสำคัญ', 'ฟังให้มากกว่าพูด'],
    caution: ['ชะลอก่อน ตรวจทุกอย่างให้ดี', 'หายใจลึกๆ แล้วค่อยตอบโต้', 'อ่านรายละเอียดก่อนเซ็นหรือโอน', 'เลี่ยงการทะเลาะและคำพูดแรงๆ', 'เดินทางอย่างระมัดระวัง', 'ทำบุญสะเดาะเคราะห์จะช่วยได้', 'อย่ากู้หรือใช้จ่ายเกินตัว', 'พักผ่อนให้พอ ดูแลสุขภาพด้วย', 'ขอคำแนะนำจากผู้ใหญ่ที่ไว้ใจ', 'เก็บของมีค่าและเอกสารให้ดี', 'ให้อภัยตัวเองและคนรอบข้าง', 'ทำใจให้สบาย เรื่องนี้ผ่านไปได้']
  },
  end: {
    good: ['สาธุ ขอให้สมหวัง', 'ขอให้เฮงๆ รวยๆ', 'โชคดีมีชัยนะ', 'ขอให้สุขสมใจตลอดไป', 'พรเทพเจ้าอยู่กับคุณ', 'ขอให้ร่ำรวยเงินทอง', 'ปีนี้เฮงแน่นอน', 'ขอให้ปลอดภัยทุกย่างก้าว', 'ขอให้มีแต่รอยยิ้ม', 'มงคลชีวิตตลอดปี'],
    mid: ['ค่อยเป็นค่อยไปนะ', 'เทพเจ้าคอยดูแลอยู่', 'ขอให้ใจสงบ', 'พรอยู่กับคุณเสมอ', 'ขอให้ผ่านไปด้วยดี', 'เชื่อมั่นแล้วทุกอย่างจะดี', 'ขอให้โชคดีนะ', 'ขอให้เดินทางราบรื่น'],
    caution: ['เทพเจ้าคุ้มครองนะ', 'ขอให้แคล้วคลาดปลอดภัย', 'เรื่องร้ายกลายเป็นดี', 'ขอให้ผ่านพ้นไปโดยเร็ว', 'ขอให้ใจเข้มแข็ง', 'สิ่งศักดิ์สิทธิ์อยู่เคียงข้าง', 'ขอให้ปลอดภัยนะ', 'เบาใจได้ พรคุ้มครองอยู่']
  }
};
const recentFt = new Set(), pickA = (a) => a[Math.floor(Math.random() * a.length)];
const GOODONLY = ['buei', 'altar', 'rice', 'fish'];
function genReading(id, lv) {
  const tone = GOODONLY.includes(id) || lv == null || lv <= 1 ? 'good' : lv === 2 ? 'mid' : 'caution';
  const sj = FT.subj[id] || FT.subj.qian;
  let a, b, key;
  for (let i = 0; i < 25; i++) {
    a = pickA(FT.lead[tone]) + ' ' + pickA(sj) + pickA(FT.pred[tone]);
    b = pickA(FT.adv[tone]) + ' ' + pickA(FT.end[tone]);
    key = a + '|' + b; if (!recentFt.has(key)) break;
  }
  recentFt.add(key); if (recentFt.size > 400) recentFt.delete(recentFt.values().next().value);
  return [a, b];
}
const _mk = makeReading;
makeReading = (id) => { const o = _mk(id); o.lines = genReading(id, o.lv); return o; };

// คำพูดตอนอ่านออกเสียง: "ขอบคุณคุณ ... <ทำอะไร> <คำอวยพร/คำทำนาย>"
const ACT = { altar: 'ไหว้เทพประธาน', rice: 'แจกข้าวสาร', fish: 'ปล่อยปลาคาร์ป', almanac: 'ดูวันดีวันห้าม', work: 'ดูดวงการงาน', love: 'ดูดวงความรัก', study: 'ดูดวงการเรียน', money: 'ดูดวงการเงิน', buei: 'ทอยปวย', qian: 'เสี่ยงเซียมซี' };
const LUCK = ['โชคดีมีชัย การงานราบรื่น', 'โชคดีมีชัย ทำสิ่งใดก็ราบรื่น', 'ใจเย็นๆ รอจังหวะดีๆ จะมาถึง', 'ระวังตัวสักนิด แล้วจะปลอดภัย'];

// [กลางอาคาร x,y, จุดยืนหน้าอาคาร x,y] พิกัดบนภาพ 720x1280
const POS = {
  altar: [192, 500, 192, 598], fish: [361, 502, 361, 608], rice: [539, 502, 539, 598],
  qian: [155, 735, 155, 822], buei: [361, 745, 361, 822], almanac: [553, 735, 553, 822],
  money: [159, 930, 159, 1020], love: [361, 940, 361, 1030], study: [558, 940, 558, 1020], work: [361, 307, 361, 410]
};
STATIONS.forEach((s) => { const p = POS[s.id]; Object.assign(s, { cx: p[0], cy: p[1], fx: p[2], fy: p[3] }); ST[s.id] = s; });

const hs = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const trunc = (s, n) => ([...s].length > n ? [...s].slice(0, n).join('') + '…' : s);
const animalOf = (id, name) => (users[id] !== undefined ? users[id] : hs(id || name) % 12);

// ---------- เส้นทางเดิน ----------
function mkPath(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); return { pts, c, L: c[c.length - 1] }; }
function posAt(p, d) {
  if (d >= p.L) return { x: p.pts[p.pts.length - 1].x, y: p.pts[p.pts.length - 1].y, done: 1 };
  let i = 1; while (p.c[i] < d) i++;
  const a = p.pts[i - 1], b = p.pts[i], l = p.c[i] - p.c[i - 1], k = l ? (d - p.c[i - 1]) / l : 0;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, done: 0 };
}
const route = (a, b) => mkPath([a, { x: 361, y: a.y }, { x: 361, y: b.y }, b]);
// เลือกจุดยืนหน้าอาคารที่ห่างจากคนอื่นมากที่สุด (ลดการซ้อนทับกัน)
function spot(s) {
  let best = null, bd = -1;
  for (let i = 0; i < 10; i++) {
    const c = { x: s.fx - 55 + Math.random() * 110, y: s.fy + 10 + Math.random() * 50 };
    let md = 1e9;
    walkers.forEach((w) => { if (w.leave) return; const d = Math.hypot((w.dest.x - c.x) / 2, w.dest.y - c.y); if (d < md) md = d; });
    if (md > bd) { bd = md; best = c; }
  }
  return best;
}

// ---------- ของขวัญ / แชต / หัวใจ ----------
function matchGift(name) {
  const n = String(name || '').toLowerCase();
  return GIFTS.find((q) => q.m.some((x) => (q.x ? n === x : n.includes(x))));
}
function enqueue(it) { if (queue.length >= 150) return; if (it.f) queue.unshift(it); else queue.push(it); FX.tone(1046, 0.25, 'sine', 0.08); }
function onGift(m) {
  const q = matchGift(m.name); if (!q) return;
  const n = Math.min(m.count || 1, 5);
  for (let i = 0; i < n; i++) q.st.forEach((st) => enqueue({ st, user: m.user, id: m.id, pic: m.pic, handle: m.handle, f: q.f }));
}
function onShare(m) { if (shared[m.id]) return; shared[m.id] = 1; enqueue({ st: 'altar', user: m.user, id: m.id, pic: m.pic, handle: m.handle }); }
// กดหัวใจสะสมรายคน ครบ HEARTS ครั้ง = เสี่ยงเซียมซี 1 ครั้ง
function onLike(m) {
  const k = m.id || m.user || '?';
  likes[k] = (likes[k] || 0) + Math.max(1, m.count || 1);
  let n = 0;
  while (likes[k] >= HEARTS && n < 3) {
    likes[k] -= HEARTS; n++;
    enqueue({ st: 'qian', user: m.user, id: m.id, pic: m.pic, handle: m.handle });
  }
}
function onChat(m) {
  const raw = String(m.text || '').trim();
  if (raw.includes('สาธุ')) {
    const n = Date.now();
    if (pops.length && n - (lastSadhu[m.id] || 0) > 10000) {
      lastSadhu[m.id] = n; sadhu.push({ n: m.user, pic: m.pic, t: performance.now() });
      if (sadhu.length > 4) sadhu.shift();
      FX.tone(660, 0.5, 'sine', 0.08);
      if (VOICE && !FX.talking) FX.say(trunc(m.user, 10) + ' สาธุ');
    }
    return;
  }
}

function sfx(st) {
  if (st === 'altar') FX.gong();
  else if (st === 'fish') { FX.splash(); FX.chime(); }
  else if (st === 'buei') FX.clack();
  else if (st === 'qian') { FX.clack(); FX.chime(); }
  else FX.chime();
}

// ออกจากทางเข้าด้านล่าง เดินขึ้นพรมแดงไปหน้าอาคาร และยืนอยู่จนกว่าจอจะเต็ม
function run(it) {
  const now = performance.now(), a = { x: 361 + (Math.random() - 0.5) * 60, y: 1200 }, n = it.user || 'ผู้ใจบุญ';
  const dest = spot(ST[it.st]);
  walkers.push({ n, pic: it.pic, handle: it.handle, id: it.id, st: it.st, p: route(a, dest), dest, t0: now, arrivedAt: 0, leave: 0, cx: a.x, cy: a.y, col: 'hsl(' + (hs(n) % 360) + ',70%,60%)' });
}
// ถึงแล้ว: เสียง/เอฟเฟกต์ทันที แล้วต่อคิวป๊อปอัปคำอวยพร (อ่านออกเสียงพร้อมกล่องข้อความ)
function arrive(w, now) {
  w.arrivedAt = now;
  const r = makeReading(w.st), s = ST[w.st];
  const body = READ_ALL ? r.lines.join(' ') : r.lines[0];
  const msg = w.st === 'qian' ? LUCK[r.lv >= 0 ? r.lv : 1] + (READ_ALL ? '. ' + body : '') : body;
  const txt = 'ขอบคุณคุณ ' + trunc(w.n, 10) + ' ' + ACT[w.st] + '. ' + msg;
  pq.push(Object.assign(r, { user: w.n, pic: w.pic, handle: w.handle, st: w.st, txt, w, t0: 0, end: 0 }));
  if (pq.length > 25) { const d = pq.shift(); d.w.done = 1; }
  if (counts[w.st] !== undefined) counts[w.st]++;
  sfx(w.st); FX.burst(s.cx, s.cy, 36);
  if (++goal >= goalMax) {
    goal = 0; goalMax = Math.min(100, goalMax + 5); goalFlash = now;
    FX.gong(); FX.burst(W / 2, 640, 80, '#ff5a36'); VOICE && FX.say('ครบเป้าหมายร่วมทำบุญ ขอบคุณทุกคนที่ร่วมทำบุญ');
  }
}
function step(now) {
  if (!started) return;
  // ป๊อปอัปคำอวยพรขึ้นทีละใบ: เปิดเสียง = ค้างจนอ่านจบ (แล้วค้างต่ออีกครึ่งวินาที) ถึงจะขึ้นใบถัดไป
  if (!pops.length && pq.length) {
    const p = pq.shift(); p.t0 = now; pops.push(p);
    if (VOICE) {
      p.end = now + 90000; // รอจนเสียงอ่านจบ (ตัวกันค้างอยู่ใน fx.js)
      FX.say(p.txt, null, () => { p.end = Math.max(performance.now() + 700, p.t0 + POP_MS); });
    } else p.end = now + Math.max(POP_MS, 2500 + [...p.txt].length * 110);
  }
  const active = pops.length > 0 || pq.length > 0;
  if (queue.length && now - lastStep > (queue.length > 10 ? 250 : 600) && walkers.filter((w) => !w.arrivedAt).length < 6) {
    // คนเข้ามาต่อเนื่อง ไม่ต้องรอคำทำนายจบ; จอเต็มแล้วให้คนที่ได้รับคำอวยพรแล้ว (เก่าสุด) ออกก่อน
    // ถ้ายังไม่มีใครรับคำอวยพรครบ คนถัดไปจะรออยู่ในลิสต์คิว
    const stay = walkers.filter((w) => !w.leave);
    let ok = stay.length < MAXP;
    if (!ok) { const old = stay.find((w) => w.done); if (old) { old.leave = now; ok = true; } }
    if (ok) { lastStep = now; run(queue.shift()); }
  }
  else if (!queue.length && !active && !FX.talking && !FX.sq.length && now - lastIdle > 45000) { lastIdle = now; VOICE && FX.say(IDLE); }
}

// ---------- วาด ----------
const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function tx(s, x, y, size, col, al, font) { g.font = size + 'px ' + (font || SANS); g.fillStyle = col; g.textAlign = al || 'left'; g.fillText(s, x, y); }
function lab(s, x, y, size, col, al) { g.font = 'bold ' + size + 'px ' + SANS; g.textAlign = al || 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.75)'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); }
function wrap(s, x, y, mw, lh, size, col, max) {
  g.font = size + 'px ' + SANS; let line = '', n = 1;
  for (const w of seg.segment(s)) {
    const t = line + w.segment;
    if (g.measureText(t).width > mw && line) { tx(line, x, y, size, col); y += lh; line = w.segment.trimStart(); if (++n > max) return y; }
    else line = t;
  }
  tx(line, x, y, size, col); return y + lh;
}

function person(x, y, col, t, mv, sc) {
  const sw = mv ? Math.sin(t / 110) * 5 : 0, bob = mv ? Math.abs(Math.sin(t / 110)) * 2 : 0;
  g.save(); g.translate(x, y - bob); g.scale(sc, sc);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 26 + bob, 11, 4, 0, 0, 7); g.fill();
  g.strokeStyle = '#3a2210'; g.lineWidth = 4; g.beginPath(); g.moveTo(-3, 14); g.lineTo(-3 + sw, 26 + bob); g.moveTo(3, 14); g.lineTo(3 - sw, 26 + bob); g.stroke();
  g.fillStyle = col; rr(-9, -4, 18, 22, 6); g.fill();
  g.fillStyle = '#f3cfa0'; g.beginPath(); g.arc(0, -12, 8, 0, 7); g.fill();
  g.fillStyle = '#222'; g.beginPath(); g.arc(0, -15, 8, Math.PI, 0); g.fill();
  g.restore();
}

const AV = {}, GI = {};
const ICONKEY = { light: 'light', windvane: 'windvane', rose: 'rose', dallah: 'dallah', mantap: 'mantap', glow: 'glow', 'love you so much': 'love', tiktok: 'tiktok', encore: 'encore', 'finger heart': 'finger', diny: 'diny', doughnut: 'doughnut' };
GIFTS.forEach((q) => { const k = ICONKEY[q.m[0]]; if (k && typeof ICONS !== 'undefined' && ICONS[k]) { const im = new Image(); im.src = ICONS[k]; GI[q.n] = im; } });
function avatar(url, x, y, r, name) {
  let im = null;
  if (url) {
    im = AV[url];
    if (!im) {
      im = AV[url] = new Image(); im.referrerPolicy = 'no-referrer';
      im.onerror = () => setTimeout(() => { if (AV[url] === im) delete AV[url]; }, 15000); // โหลดพลาดให้ลองใหม่
      im.src = '/avatar?u=' + encodeURIComponent(url); // ผ่านพร็อกซีของเซิร์ฟเวอร์
    }
  }
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.closePath(); g.clip();
  if (im && im.complete && im.naturalWidth) g.drawImage(im, x - r, y - r, r * 2, r * 2);
  else { g.fillStyle = 'hsl(' + (hs(name) % 360) + ',60%,50%)'; g.fillRect(x - r, y - r, r * 2, r * 2); tx([...String(name || '?')][0] || '?', x, y + r * 0.35, r, '#fff', 'center'); }
  g.restore(); g.beginPath(); g.arc(x, y, r, 0, 7); g.lineWidth = 2; g.strokeStyle = '#ffd54a'; g.stroke();
}
function fit(s, x, y, mw, size, col, bold) {
  const f = () => { g.font = (bold ? 'bold ' : '') + size + 'px ' + SANS; }; f();
  while (size > 8 && g.measureText(s).width > mw) { size--; f(); }
  g.fillStyle = col; g.textAlign = 'left'; g.fillText(s, x, y);
}
function plate(w, x, y) {
  const n = trunc(w.n, 10); g.font = 'bold 15px ' + SANS; const pw = g.measureText(n).width + 46;
  rr(x - pw / 2, y, pw, 30, 15); g.fillStyle = 'rgba(20,0,0,.85)'; g.fill();
  avatar(w.pic, x - pw / 2 + 16, y + 15, 12, w.n); tx(n, x - pw / 2 + 34, y + 21, 15, '#fff');
}
// แผงของขวัญแสดงตลอดด้านบน (การ์ดสไตล์เมนูของขวัญ TikTok)
function drawGifts() {
  g.fillStyle = 'rgba(10,10,20,.9)'; g.fillRect(0, 86, W, Math.ceil(GIFTS.length / 4) * 44 + 8);
  GIFTS.forEach((q, i) => {
    const x = 6 + (i % 4) * 177, y = 90 + Math.floor(i / 4) * 44;
    rr(x, y, 171, 40, 10); g.fillStyle = '#14161f'; g.fill(); g.strokeStyle = 'rgba(232,185,35,.6)'; g.lineWidth = 1.5; g.stroke();
    const im = GI[q.n];
    if (im && im.complete && im.naturalWidth) g.drawImage(im, x + 4, y + 3, 34, 34); else tx(q.e, x + 21, y + 28, 24, '#fff', 'center');
    fit(q.n, x + 44, y + 17, 122, 15, '#fff', true); fit(q.a, x + 44, y + 34, 122, 12, '#ffd54a');
    if (TEST) hits.push({ x, y, w: 171, h: 40, q });
  });
}

// ป๊อปอัปคำอวยพรใต้แผงของขวัญ (ทีละใบ)
function drawPops(t) {
  for (let i = pops.length - 1; i >= 0; i--) if (t > pops[i].end) { pops[i].w.done = 1; pops.splice(i, 1); } // อ่านคำทำนายจบแล้ว = ออกได้
  const y = 86 + Math.ceil(GIFTS.length / 4) * 44 + 14;
  pops.forEach((p) => {
    g.globalAlpha = Math.min(1, (p.end - t) / 400, (t - p.t0) / 250 + 0.01);
    rr(14, y, 500, 160, 14); g.fillStyle = 'rgba(20,0,0,.88)'; g.fill(); g.strokeStyle = '#ffd54a'; g.lineWidth = 2; g.stroke();
    avatar(p.pic, 50, y + 32, 26, p.user);
    fit(trunc(p.user, 12) + ' · ' + p.th, 90, y + 30, 330, 22, '#ffd54a');
    if (p.lv >= 0) tx(LEVELS[p.lv].n, 502, y + 30, 20, LEVELS[p.lv].c, 'right');
    if (p.handle) tx('@' + trunc(p.handle, 20), 90, y + 50, 14, '#f0c0c0');
    let ly = y + 74; p.lines.forEach((l) => { ly = wrap(l, 26, ly, 470, 22, 17, '#fff', 2); });
    g.globalAlpha = 1;
  });
}

function drawSt(s, t) {
  if (pops.some((p) => p.st === s.id && t < p.end)) {
    const a = 0.35 + 0.2 * Math.sin(t / 180), gr = g.createRadialGradient(s.cx, s.cy, 10, s.cx, s.cy, 110);
    gr.addColorStop(0, 'rgba(255,230,120,' + a + ')'); gr.addColorStop(1, 'rgba(255,230,120,0)');
    g.fillStyle = gr; g.fillRect(s.cx - 110, s.cy - 110, 220, 220);
  }
  if (counts[s.id] !== undefined) lab(s.th + ' ×' + counts[s.id], s.cx, s.cy - 78, 18, '#ffd54a');
}

// ลิสต์คิวรอ (ข้างป๊อปอัปคำอวยพร): รูปโปรไฟล์ + ชื่อ + @account
function drawQueue(t) {
  if (!queue.length) return;
  const x0 = 522, y0 = 86 + Math.ceil(GIFTS.length / 4) * 44 + 14, rows = Math.min(4, queue.length);
  const h = 30 + rows * 34 + (queue.length > rows ? 22 : 0);
  rr(x0, y0, 184, h, 14); g.fillStyle = 'rgba(20,0,0,.88)'; g.fill(); g.strokeStyle = '#ffd54a'; g.lineWidth = 2; g.stroke();
  tx('คิวรอ ' + queue.length + ' คน', x0 + 92, y0 + 21, 16, '#ffd54a', 'center');
  queue.slice(0, rows).forEach((q, i) => {
    const y = y0 + 30 + i * 34;
    avatar(q.pic, x0 + 22, y + 15, 13, q.user);
    fit(trunc(q.user || 'ผู้ใจบุญ', 12), x0 + 42, y + 14, 134, 14, '#fff', true);
    fit(q.handle ? '@' + q.handle : ACT[q.st], x0 + 42, y + 29, 134, 11, '#f0c0c0');
  });
  if (queue.length > rows) tx('+ อีก ' + (queue.length - rows) + ' คน', x0 + 92, y0 + h - 7, 12, '#f0c0c0', 'center');
}

// กลีบดอกไม้ลอยเบาๆ ให้ฉากมีชีวิต
const petals = [];
for (let i = 0; i < 26; i++) petals.push({ x: Math.random() * W, y: Math.random() * H, vx: -0.2 + Math.random() * 0.4, vy: 0.4 + Math.random() * 0.7, s: 3 + Math.random() * 3, ph: Math.random() * 6, c: ['#ffc2d4', '#fff0f3', '#ffd54a', '#ff9fb8'][i % 4] });
function drawAmbient(t) {
  g.globalAlpha = 0.8;
  petals.forEach((p) => {
    p.y += p.vy; p.x += p.vx + Math.sin(t / 900 + p.ph) * 0.4;
    if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
    g.fillStyle = p.c; g.beginPath(); g.ellipse(p.x, p.y, p.s, p.s * 0.55, p.ph + t / 700, 0, 7); g.fill();
  });
  g.globalAlpha = 1;
}

// คนที่ยืนอยู่หน้าอาคารเดินวนไปมาเบาๆ ในโซนของตัวเอง
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function wander(w, t) {
  if (!w.wp) {
    if (!w.wwait) w.wwait = t + 500 + Math.random() * 1800;
    if (t >= w.wwait) {
      const s = ST[w.st], d = { x: clamp(w.cx + (Math.random() - 0.5) * 140, s.fx - 80, s.fx + 80), y: clamp(w.cy + (Math.random() - 0.5) * 60, s.fy + 5, s.fy + 70) };
      w.wp = mkPath([{ x: w.cx, y: w.cy }, d]); w.wt0 = t; w.dest = d; w.wwait = 0;
    }
  }
  if (w.wp) { const r = posAt(w.wp, (t - w.wt0) * 0.045); w.cx = r.x; w.cy = r.y; w.mv = !r.done; if (r.done) w.wp = null; } else w.mv = false;
}

// มีตัวคนเฉพาะคนที่ส่งของขวัญ/กดหัวใจครบ เดินไปมาจนกว่าจอจะเต็ม แล้วคนที่รับคำอวยพรแล้วจะค่อยๆ จางหาย
function drawPeople(t) {
  for (let i = walkers.length - 1; i >= 0; i--) if (walkers[i].leave && t - walkers[i].leave > 1000) walkers.splice(i, 1);
  walkers.slice().sort((a, b) => a.cy - b.cy).forEach((w) => {
    if (!w.arrivedAt) { const r = posAt(w.p, (t - w.t0) * 0.17); w.cx = r.x; w.cy = r.y; if (r.done) arrive(w, t); }
    else if (!w.leave) wander(w, t);
    let a = Math.min(1, (t - w.t0) / 400);
    if (w.leave) a *= Math.max(0, 1 - (t - w.leave) / 1000);
    g.globalAlpha = a;
    person(w.cx, w.cy, w.col, t, w.arrivedAt ? !!w.mv : true, 1.2);
    plate(w, w.cx, w.cy + 34);
    if (!w.leave && (!w.arrivedAt || t - w.arrivedAt < 3500)) {
      // ป้ายเหนือหัว: รูปโปรไฟล์ + @ชื่อแอคเคานต์ของคนส่งของขวัญ (ไม่แสดงปลายทางแล้ว)
      const bx = Math.max(4, Math.min(W - 172, w.cx - 84)), by = w.cy - 80;
      rr(bx, by, 168, 50, 12); g.fillStyle = 'rgba(255,255,255,.95)'; g.fill();
      avatar(w.pic, bx + 28, by + 25, 19, w.n);
      fit(w.handle ? '@' + trunc(w.handle, 16) : trunc(w.n, 12), bx + 54, by + 22, 108, 15, '#5c0f0f', true);
      if (w.handle) fit(trunc(w.n, 12), bx + 54, by + 40, 108, 13, '#9b1c1c');
    }
    g.globalAlpha = 1;
  });
}

function draw(t) {
  hits = [];
  if (bg.complete && bg.naturalWidth) g.drawImage(bg, 0, 0, W, H);
  else { g.fillStyle = '#3a0808'; g.fillRect(0, 0, W, H); }
  const tg = g.createLinearGradient(0, 0, 0, 140); tg.addColorStop(0, 'rgba(30,0,0,.8)'); tg.addColorStop(1, 'rgba(30,0,0,0)');
  g.fillStyle = tg; g.fillRect(0, 0, W, 140);
  lab('ศาลเจ้ามงคล 福', W / 2, 52, 36, '#ffd54a');
  lab('ดูดวงเพื่อความบันเทิง', W / 2, 76, 13, '#f0c0c0');
  lab('🎯 ' + goal + '/' + goalMax, 12, 32, 22, '#ffd54a', 'left');
  lab('คิว ' + queue.length, W - 12, 32, 22, '#fff', 'right');
  STATIONS.forEach((s) => drawSt(s, t));
  drawPeople(t);
  drawAmbient(t); drawGifts(); drawPops(t); drawQueue(t);
  g.fillStyle = 'rgba(20,0,0,.6)'; rr(14, 1226, 692, 50, 14); g.fill();
  wrap('ส่งของขวัญ · กดหัวใจครบ ' + HEARTS + ' ครั้งเพื่อเสี่ยงเซียมซี · พิมพ์ "สาธุ"', 30, 1258, 660, 24, 20, '#f0c0c0', 1);
  for (let i = sadhu.length - 1; i >= 0; i--) if (t - sadhu[i].t > 3500) sadhu.splice(i, 1);
  sadhu.forEach((s, i) => {
    g.globalAlpha = Math.min(1, (3500 - (t - s.t)) / 500);
    const y = 1196 - i * 36; avatar(s.pic, 28, y - 6, 14, s.n); lab('🙏 ' + trunc(s.n, 10) + ': สาธุ', 52, y, 20, '#ffd54a', 'left');
  });
  g.globalAlpha = 1;
  if (goalFlash && t - goalFlash < 4000) {
    g.globalAlpha = Math.min(1, (4000 - (t - goalFlash)) / 600);
    lab('ครบเป้าหมายร่วมทำบุญ! 🎉', W / 2, 700, 40, '#ffd54a');
    g.globalAlpha = 1;
  }
  FX.step(g);
  if (!started) { g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 0, W, H); tx('แตะหน้าจอเพื่อเริ่ม (เปิดเสียง)', W / 2, H / 2, 34, '#ffd54a', 'center'); }
}

function begin() { FX.init(); started = true; lastStep = performance.now() - 10000; lastIdle = performance.now(); }
cv.addEventListener('click', (e) => {
  if (!started) return begin();
  if (!TEST) return;
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
  hits.forEach((h) => {
    if (x > h.x && x < h.x + h.w && y > h.y && y < h.y + h.h) {
      const id = 't' + Math.floor(Math.random() * 5), user = 'ทดสอบ' + id;
      if (h.q.share) onShare({ id: id + Math.random(), user }); else onGift({ name: h.q.m[0], count: 1, user, id });
    }
  });
});
// เปิดใน OBS ที่แตะไม่ได้: ถ้าเบราว์เซอร์อนุญาตเสียงอัตโนมัติ ให้เริ่มเอง
setTimeout(() => { try { FX.init(); if (FX.ctx.state === 'running' && !started) begin(); } catch (e) {} }, 1500);
// โหมดทดสอบ: กด s = สาธุ, กด l = กดหัวใจ 50 ครั้ง (ได้เซียมซี)
if (TEST) document.addEventListener('keydown', (e) => {
  if (e.key === 's') onChat({ id: 'k' + Math.random(), user: 'ทดสอบสาธุ', text: 'สาธุ' });
  if (e.key === 'l') onLike({ id: 'tl' + Math.floor(Math.random() * 30), user: 'ทดสอบหัวใจ', count: HEARTS });
});

function connect() {
  const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.t === 'gift') onGift(m); else if (m.t === 'chat') onChat(m); else if (m.t === 'share') onShare(m); else if (m.t === 'like') onLike(m); };
  ws.onclose = () => setTimeout(connect, 2000);
}
connect();
(function loop(t) { step(t); draw(t); requestAnimationFrame(loop); })(performance.now());
