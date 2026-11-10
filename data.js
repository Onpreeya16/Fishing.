const GIFTS = [
  { id: 'rose',     th: 'เบ็ดกุหลาบ',     lv: 1, match: ['rose'] },
  { id: 'goldfish', th: 'หัวใจปลาทอง',   lv: 2, match: ['heart me', 'goldfish'] },
  { id: 'gg',       th: 'GG ปลาใหญ่',     lv: 3, match: ['gg'] },
  { id: 'glow',     th: 'เหยื่อเรืองแสง', lv: 4, match: ['glow'] },
  { id: 'finger',   th: 'ฟิงเกอร์ฮาร์ท',  lv: 5, match: ['finger heart'] },
  { id: 'dragon',   th: 'กอดมังกร',       lv: 6, match: ['dragon'] }
];

function matchGift(name = '', diamonds = 0) {
  const n = String(name).toLowerCase();
  const hit = GIFTS.find((g) => g.match.some((m) => n.includes(m)));
  if (hit) return hit;
  const i = diamonds >= 1000 ? 5 : diamonds >= 300 ? 4 : diamonds >= 100 ? 3 : diamonds >= 30 ? 2 : diamonds >= 5 ? 1 : 0;
  return GIFTS[i];
}

const FISH = [
  { key: 'koi',    th: 'ปลาคาร์ฟ',    rar: 1, colors: ['#ff7a45', '#ffd9c2'] },
  { key: 'gold',   th: 'ปลาทอง',      rar: 2, colors: ['#ffb300', '#fff1b8'] },
  { key: 'neon',   th: 'ปลานีออน',    rar: 3, colors: ['#22c3ff', '#d6f6ff'] },
  { key: 'big',    th: 'ปลายักษ์',    rar: 4, colors: ['#7b5cff', '#e1d9ff'] },
  { key: 'glow',   th: 'ปลาเรืองแสง', rar: 5, colors: ['#2effa8', '#d9fff0'] },
  { key: 'dragon', th: 'มังกรน้ำ',    rar: 6, colors: ['#ff3d6e', '#ffe0ea'] }
];

// ของขวัญเลเวลสูง = ได้ปลาหายากกว่า
function pickFish(lv = 1) {
  const w = FISH.map((f) => Math.max(0, 6 - 2 * Math.abs(f.rar - lv)) + 0.2);
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i++) { if ((r -= w[i]) < 0) return FISH[i]; }
  return FISH[0];
}

// ดวง: ประโยคเปิดเฉพาะปลา x หัวข้อ x ช่วงเวลา x คำอวยพร = 4,000 แบบ/ตัว ไม่ซ้ำจนกว่าจะครบรอบ
const FORT = {
  koi:    ['ปลาคาร์ฟแหวกน้ำมาบอกว่า', 'คาร์ฟสีส้มกระซิบว่า', 'เกล็ดคาร์ฟส่องแสงทำนายว่า', 'ปลาคาร์ฟยิ้มให้แล้วว่า', 'น้ำนิ่งๆ คาร์ฟบอกว่า'],
  gold:   ['ปลาทองส่ายหางบอกว่า', 'ประกายทองบนเกล็ดทำนายว่า', 'ปลาทองกระพริบตาแล้วว่า', 'ฟองน้ำสีทองเผยว่า', 'ปลาทองตัวนี้รู้มาว่า'],
  neon:   ['ปลานีออนวาบแสงบอกว่า', 'แสงฟ้าใต้น้ำทำนายว่า', 'ปลานีออนว่ายวนแล้วว่า', 'ประกายนีออนกระซิบว่า', 'ปลาแสงฟ้าส่งสัญญาณว่า'],
  big:    ['ปลายักษ์ผงาดขึ้นมาประกาศว่า', 'เงาใหญ่ใต้น้ำบอกว่า', 'ปลายักษ์ตัวนี้ฟันธงว่า', 'คลื่นใหญ่หอบข่าวมาว่า', 'ปลายักษ์พยักหน้าแล้วว่า'],
  glow:   ['ปลาเรืองแสงสว่างวาบบอกว่า', 'แสงเขียวมรกตทำนายว่า', 'ปลาเรืองแสงนำทางไปว่า', 'ประกายลึกลับกระซิบว่า', 'ปลาแห่งแสงเปิดเผยว่า'],
  dragon: ['มังกรน้ำคำรามเบาๆ ว่า', 'หนวดมังกรสั่นไหวทำนายว่า', 'มังกรน้ำตัวนี้สัญญาว่า', 'เกล็ดมังกรส่องแสงประกาศว่า', 'มังกรจากใต้สมุทรลั่นวาจาว่า']
};
FORT.T = ['เรื่องงานกำลังมีข่าวดี', 'เงินทองไหลมาเทมา', 'ความรักเริ่มสดใส', 'สุขภาพแข็งแรงขึ้น', 'เพื่อนเก่าจะติดต่อมา', 'จะมีโชคเล็กๆ เข้ามา', 'การเรียนรู้ไปได้สวย', 'จะได้ของขวัญที่ไม่คาดคิด', 'ความกังวลจะค่อยๆ จางไป', 'ไอเดียใหม่กำลังมา'];
FORT.D = ['ในช่วงเช้า', 'ก่อนเที่ยงนี้', 'ในบ่ายนี้', 'ในตอนเย็น', 'คืนนี้', 'ภายในสุดสัปดาห์นี้', 'ภายในสามวัน', 'ภายในเดือนนี้'];
FORT.B = ['ใจเย็นแล้วทุกอย่างจะลงตัว', 'อย่ากลัวที่จะเริ่มต้น', 'ยิ้มไว้ โชคจะตามมา', 'เชื่อมั่นในจังหวะของตัวเอง', 'แบ่งปันแล้วจะได้คืน', 'พักสักนิดแล้วไปต่อ', 'กล้าถามกล้าลองได้เลย', 'ขอบคุณตัวเองที่สู้มาถึงตรงนี้', 'คนใกล้ตัวคือพลังสำคัญ', 'วันนี้เหมาะกับการเริ่มสิ่งใหม่'];
const LUCKY_COLORS = ['แดง', 'ทอง', 'ฟ้า', 'เขียว', 'ม่วง', 'ชมพู', 'ขาว', 'ส้ม'];

const _used = {};
function nextFortune(key) {
  const f = FORT[key], T = FORT.T, D = FORT.D, B = FORT.B;
  const total = f.length * T.length * D.length * B.length;
  const u = _used[key] || (_used[key] = new Set());
  if (u.size >= total) u.clear();
  let n;
  do { n = Math.floor(Math.random() * total); } while (u.has(n));
  u.add(n);
  const bi = n % B.length; n = Math.floor(n / B.length);
  const di = n % D.length; n = Math.floor(n / D.length);
  const ti = n % T.length; n = Math.floor(n / T.length);
  const num = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return {
    text: `${f[n]} ${T[ti]}${D[di]} — ${B[bi]}`,
    lucky: `เลขนำโชค ${num} · สีมงคล ${LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)]}`
  };
}
