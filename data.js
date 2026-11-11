const CUP = 10; // 1 ถ้วย = กี่ชิ้น (แก้ได้)

// type: 'buy' = ลูกค้ามาซื้อ, 'help' = ผู้ช่วยมาย่างเติมถาด
// min/max = สุ่มจำนวนชิ้น, cups = จำนวนถ้วย, tier = ความหายากของปลา (1-6)
// match = ชื่อของขวัญใน TikTok (ตัวพิมพ์เล็กใหญ่ไม่สำคัญ)
const GIFT_TABLE = [
  { id: 'rose',   icon: '🌹', type: 'buy',  min: 1,  max: 1,  text: 'สุ่มซื้อ 1 ชิ้น',      tier: 1, coins: 1,  match: ['rose'] },
  { id: 'finger', icon: '🫰', type: 'buy',  min: 5,  max: 15, text: 'สุ่มซื้อ 5-15 ชิ้น',  tier: 2, coins: 5,  match: ['finger heart'] },
  { id: 'box',    icon: '🎁', type: 'buy',  cups: 1,          text: 'ซื้อ 1 ถ้วย',         tier: 3, coins: 10, match: ['__ใส่ชื่อของขวัญกล่องสีชมพู__'] },
  { id: 'donut',  icon: '🍩', type: 'buy',  cups: 3,          text: 'สั่ง 3 ถ้วย',         tier: 4, coins: 30, match: ['donut'] },
  { id: 'gg',     icon: '🏅', type: 'help', min: 5,  max: 5,  text: 'ช่วย 5 ชิ้น',         tier: 3, coins: 1,  match: ['gg'] },
  { id: 'donut2', icon: '🍩', type: 'help', min: 20, max: 20, text: 'ช่วย 20 ชิ้น',        tier: 4, coins: 30, match: ['__ใส่ชื่อของขวัญโดนัทช่วย__'] },
  { id: 'pet',    icon: '🐕', type: 'help', min: 10, max: 25, text: 'สุ่มช่วย 10-25 ชิ้น', tier: 5, coins: 99, match: ['__ใส่ชื่อของขวัญตัวส้ม__'] }
];

// ไลก์สะสม: ครบทุกๆ every ไลก์ ได้ n ชิ้น
const LIKE_RULES = [
  { every: 100, type: 'buy',  n: 5, icon: '❤️', text: 'ครบ 100 ซื้อ 5 ชิ้น' },
  { every: 300, type: 'help', n: 5, icon: '❤️', text: 'ครบ 300 ช่วย 5 ชิ้น' }
];

function matchGift(name = '') {
  const n = String(name).toLowerCase();
  return GIFT_TABLE.find((g) => g.match.some((m) => {
    m = String(m).toLowerCase();
    return n === m || (m.length > 3 && n.includes(m));
  })) || null;
}

const FISH = [
  { key: 'koi',    th: 'ปลาคาร์ฟ',    rar: 1, colors: ['#ff7a45', '#ffd9c2'] },
  { key: 'gold',   th: 'ปลาทอง',      rar: 2, colors: ['#ffb300', '#fff1b8'] },
  { key: 'neon',   th: 'ปลานีออน',    rar: 3, colors: ['#22c3ff', '#d6f6ff'] },
  { key: 'big',    th: 'ปลายักษ์',    rar: 4, colors: ['#7b5cff', '#e1d9ff'] },
  { key: 'glow',   th: 'ปลาเรืองแสง', rar: 5, colors: ['#2effa8', '#d9fff0'] },
  { key: 'dragon', th: 'มังกรน้ำ',    rar: 6, colors: ['#ff3d6e', '#ffe0ea'] }
];

// tier สูง = ได้ปลาหายากกว่า
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
