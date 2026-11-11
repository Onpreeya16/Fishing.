// วาดฉากศาลเจ้าด้วยโค้ด แล้วส่งให้ game.js ใช้เป็นพื้นหลัง (โหลดหลัง game.js)
(function () {
  const c = document.createElement('canvas'); c.width = 720; c.height = 1280;
  const x = c.getContext('2d'), SANS = "'Noto Sans Thai',Sarabun,Tahoma,sans-serif", SERIF = "'Noto Serif TC','Songti TC',serif", R = rnd(7);
  const zhOf = (id) => { const s = STATIONS.find((q) => q.id === id); return s ? s.zh : '福'; };
  const lg = (x0, y0, x1, y1, st) => { const q = x.createLinearGradient(x0, y0, x1, y1); st.forEach((s) => q.addColorStop(s[0], s[1])); return q; };
  const poly = (p, f, s) => { x.beginPath(); p.forEach((q, i) => (i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]))); x.closePath(); x.fillStyle = f; x.fill(); if (s) { x.strokeStyle = s; x.lineWidth = 2; x.stroke(); } };
  const rect = (a, b, w, h, f) => { x.fillStyle = f; x.fillRect(a, b, w, h); };
  const ell = (a, b, rx, ry, f) => { x.fillStyle = f; x.beginPath(); x.ellipse(a, b, rx, ry, 0, 0, 7); x.fill(); };
  const glow = (a, b, r, col) => { const q = x.createRadialGradient(a, b, 0, a, b, r); q.addColorStop(0, col); q.addColorStop(1, 'rgba(255,200,80,0)'); x.fillStyle = q; x.fillRect(a - r, b - r, r * 2, r * 2); };
  const rrect = (a, b, w, h, r, f, s) => { x.beginPath(); x.roundRect(a, b, w, h, r); if (f) { x.fillStyle = f; x.fill(); } if (s) { x.strokeStyle = s; x.lineWidth = 2; x.stroke(); } };
  const line = (a, b, c2, d, col, w) => { x.strokeStyle = col; x.lineWidth = w || 1; x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke(); };
  const hw = (y) => 60 + (y - 420) * 0.12;
  const GOLD = ['#ffe27a', '#c98b1e'], TEAL = ['#4fd4c8', '#17776f'], BLUE = ['#5a9be8', '#27538f'], RED = ['#f06a4a', '#8f2a14'], GREEN = ['#74c97e', '#2a6e3a'], PURP = ['#a97be0', '#5a3a9a'];

  // ---------- ท้องฟ้า ภูเขา ----------
  function ridge(base, amp, col) {
    const p = [[-30, 460]]; for (let a = -30; a <= 750; a += 30) p.push([a, base - amp * (0.25 + R() * 0.75)]); p.push([750, 460]);
    poly(p, col);
  }
  function tower(a, b, s, col) {
    for (let i = 0; i < 4; i++) {
      const w = (24 - i * 4) * s, y = b - i * 20 * s;
      rect(a - w * 0.55, y - 12 * s, w * 1.1, 12 * s, col);
      poly([[a - w - 8 * s, y - 12 * s], [a + w + 8 * s, y - 12 * s], [a + w * 0.7, y - 22 * s], [a - w * 0.7, y - 22 * s]], col);
    }
    rect(a - 1.5 * s, b - 4 * 20 * s - 18 * s, 3 * s, 18 * s, col);
  }
  function sky() {
    x.fillStyle = lg(0, 0, 0, 450, [[0, '#1d1440'], [0.3, '#5b2a62'], [0.62, '#c4506a'], [0.85, '#f59b55'], [1, '#ffd98a']]); x.fillRect(0, 0, 720, 460);
    for (let i = 0; i < 80; i++) { x.globalAlpha = 0.25 + R() * 0.6; ell(R() * 720, R() * 200, 0.8 + R() * 1.3, 0.8 + R() * 1.3, '#fff'); }
    x.globalAlpha = 1;
    glow(361, 330, 300, 'rgba(255,225,140,.8)'); ell(361, 300, 74, 74, 'rgba(255,244,200,.92)');
    [[90, 150, 120], [610, 120, 150], [480, 235, 110], [150, 265, 100]].forEach((cl) => { for (let k = 0; k < 6; k++) ell(cl[0] + (k - 2.5) * cl[2] * 0.2, cl[1] + (k % 2) * 7, cl[2] * 0.22, 13, 'rgba(255,196,170,.38)'); });
    ridge(380, 110, '#8a6396'); tower(95, 345, 0.9, '#6d4a7e'); tower(640, 335, 0.8, '#6d4a7e');
    ridge(400, 80, '#5e456f'); x.fillStyle = lg(0, 320, 0, 430, [[0, 'rgba(255,200,170,0)'], [1, 'rgba(255,210,180,.5)']]); x.fillRect(0, 320, 720, 110);
    ridge(425, 55, '#3f3050');
  }

  // ---------- พื้นลานหิน ----------
  function ground() {
    x.fillStyle = lg(0, 395, 0, 1280, [[0, '#c9b393'], [0.35, '#9f896a'], [1, '#56423a']]); x.fillRect(0, 395, 720, 885);
    for (let i = 0; i < 160; i++) { x.globalAlpha = 0.05; ell(R() * 720, 400 + R() * 880, 20 + R() * 40, 6 + R() * 12, R() < 0.5 ? '#000' : '#fff'); }
    x.globalAlpha = 1;
    x.strokeStyle = 'rgba(40,20,10,.14)'; x.lineWidth = 1.5;
    for (let i = 0, y = 400; y < 1290; i++) { y = 400 + Math.pow(i, 1.5) * 7.5; x.beginPath(); x.moveTo(0, y); x.lineTo(720, y); x.stroke(); }
    for (let k = -16; k <= 16; k++) { x.beginPath(); x.moveTo(361 + k * 18, 400); x.lineTo(361 + k * 95, 1280); x.stroke(); }
  }

  // ---------- ชิ้นส่วนอาคาร ----------
  function roof(cx, y, w, h, c1, c2) {
    x.beginPath();
    x.moveTo(cx - w * 0.16, y); x.lineTo(cx + w * 0.16, y);
    x.quadraticCurveTo(cx + w * 0.5, y + h * 0.6, cx + w, y + h - 8);
    x.quadraticCurveTo(cx + w + 14, y + h - 4, cx + w + 24, y + h - 24);
    x.quadraticCurveTo(cx + w + 6, y + h + 8, cx + w - 16, y + h + 6);
    x.lineTo(cx - w + 16, y + h + 6);
    x.quadraticCurveTo(cx - w - 6, y + h + 8, cx - w - 24, y + h - 24);
    x.quadraticCurveTo(cx - w - 14, y + h - 4, cx - w, y + h - 8);
    x.quadraticCurveTo(cx - w * 0.5, y + h * 0.6, cx - w * 0.16, y);
    x.closePath();
    x.fillStyle = lg(0, y, 0, y + h, [[0, c1], [1, c2]]); x.fill(); x.strokeStyle = '#ffe27a'; x.lineWidth = 2; x.stroke();
    x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = 1;
    for (let i = -5; i <= 5; i++) { x.beginPath(); x.moveTo(cx + i * w * 0.03, y + 2); x.lineTo(cx + i * w * 0.2, y + h - 6); x.stroke(); }
    rect(cx - w + 14, y + h + 6, w * 2 - 28, 8, '#7d1414');
    for (let a = cx - w + 16; a < cx + w - 20; a += 14) rect(a, y + h + 6, 6, 8, '#e0b030');
    rect(cx - w * 0.16, y - 5, w * 0.32, 6, '#ffd54a'); ell(cx - w * 0.16, y - 7, 4, 7, '#ffd54a'); ell(cx + w * 0.16, y - 7, 4, 7, '#ffd54a');
  }
  function lantern(a, b, s) {
    s = s || 1; glow(a, b + 12 * s, 36 * s, 'rgba(255,170,60,.5)');
    line(a, b - 14 * s, a, b, '#ffd54a', 2);
    x.fillStyle = lg(a - 10 * s, 0, a + 10 * s, 0, [[0, '#a81410'], [0.5, '#ff4a36'], [1, '#a81410']]); x.beginPath(); x.ellipse(a, b + 12 * s, 10 * s, 13 * s, 0, 0, 7); x.fill();
    rect(a - 6 * s, b - 1, 12 * s, 3 * s, '#ffd54a'); rect(a - 6 * s, b + 23 * s, 12 * s, 3 * s, '#ffd54a'); rect(a - 1, b + 26 * s, 2, 9 * s, '#ffd54a');
  }
  function pole(a, b) { rect(a - 2, b - 14, 4, 72, '#5a3a22'); rect(a - 7, b + 54, 14, 6, '#8d7d6c'); lantern(a, b, 1); }
  function pav(cx, cy, id, col) {
    ell(cx, cy + 66, 80, 8, 'rgba(0,0,0,.25)');
    rect(cx - 62, cy + 42, 124, 14, lg(0, cy + 42, 0, cy + 56, [[0, '#e8dfca'], [1, '#a99b82']])); rect(cx - 68, cy + 56, 136, 9, '#8d7d6c');
    rect(cx - 46, cy - 12, 92, 54, lg(0, cy - 12, 0, cy + 42, [[0, '#8a1818'], [1, '#4a0a0a']]));
    for (let i = -3; i <= 3; i++) line(cx + i * 12, cy - 8, cx + i * 12, cy + 40, 'rgba(255,213,74,.3)');
    line(cx - 46, cy + 8, cx + 46, cy + 8, 'rgba(255,213,74,.3)'); line(cx - 46, cy + 26, cx + 46, cy + 26, 'rgba(255,213,74,.3)');
    glow(cx, cy + 24, 32, 'rgba(255,200,90,.55)'); rect(cx - 11, cy + 12, 22, 30, '#2a0606'); x.strokeStyle = '#ffd54a'; x.lineWidth = 1.5; x.strokeRect(cx - 11, cy + 12, 22, 30);
    [-48, -24, 18, 42].forEach((d) => rect(cx + d, cy - 12, 6, 54, lg(cx + d, 0, cx + d + 6, 0, [[0, '#a87a10'], [0.5, '#ffe27a'], [1, '#a87a10']])));
    rrect(cx - 17, cy - 4, 34, 14, 3, '#7d1414', '#ffd54a'); x.font = 'bold 12px ' + SERIF; x.textAlign = 'center'; x.fillStyle = '#ffe27a'; x.fillText(zhOf(id), cx, cy + 8);
    roof(cx, cy - 58, 58, 44, col[0], col[1]); ell(cx, cy - 63, 4, 4, '#ffd54a');
    lantern(cx - 62, cy - 4, 0.7); lantern(cx + 62, cy - 4, 0.7);
  }
  function wall(x0, x1, y) {
    rect(x0, y, x1 - x0, 34, lg(0, y, 0, y + 34, [[0, '#b52a2a'], [1, '#7d1414']])); rect(x0, y - 4, x1 - x0, 6, '#d4a020');
    for (let a = x0; a < x1; a += 22) { poly([[a, y - 4], [a + 22, y - 4], [a + 17, y - 14], [a + 5, y - 14]], '#2a9a8e', '#ffe27a'); ell(a + 11, y + 18, 5, 5, '#ffd54a'); }
  }
  function stairs(y0, y1, e) {
    poly([[361 - hw(y0) - e, y0], [361 + hw(y0) + e, y0], [361 + hw(y1) + e, y1], [361 - hw(y1) - e, y1]], lg(0, y0, 0, y1, [[0, '#f4eddd'], [1, '#c4b79f']]));
    for (let y = y0 + 12; y < y1; y += 16) { line(361 - hw(y) - e, y, 361 + hw(y) + e, y, 'rgba(0,0,0,.2)'); line(361 - hw(y) - e, y + 1, 361 + hw(y) + e, y + 1, 'rgba(255,255,255,.5)'); }
    line(361 - hw(y0) - e - 3, y0 - 8, 361 - hw(y1) - e - 3, y1 - 8, '#e2d6bd', 5); line(361 + hw(y0) + e + 3, y0 - 8, 361 + hw(y1) + e + 3, y1 - 8, '#e2d6bd', 5);
    for (let y = y0 + 6; y < y1; y += 22) { rect(361 - hw(y) - e - 6, y - 10, 6, 16, '#f0e6d0'); rect(361 + hw(y) + e, y - 10, 6, 16, '#f0e6d0'); }
  }
  function hall() {
    glow(361, 340, 290, 'rgba(255,220,120,.4)');
    rect(131, 408, 460, 22, lg(0, 408, 0, 430, [[0, '#f0e7d2'], [1, '#b3a58c']])); rect(151, 396, 420, 14, lg(0, 396, 0, 410, [[0, '#e8dfca'], [1, '#bfb198']]));
    rect(211, 300, 300, 100, lg(0, 300, 0, 400, [[0, '#a31f20'], [1, '#6e1010']]));
    for (let i = 0; i < 6; i++) rect(221 + i * 56, 300, 12, 100, lg(221 + i * 56, 0, 233 + i * 56, 0, [[0, '#a87a10'], [0.5, '#ffe27a'], [1, '#a87a10']]));
    for (let i = 0; i < 5; i++) { const a = 233 + i * 56; if (i === 2) continue; rect(a + 6, 360, 38, 34, 'rgba(40,6,6,.7)'); for (let k = 1; k < 4; k++) line(a + 6 + k * 9.5, 360, a + 6 + k * 9.5, 394, 'rgba(255,213,74,.4)'); }
    glow(361, 380, 70, 'rgba(255,215,110,.9)');
    x.beginPath(); x.moveTo(331, 400); x.lineTo(331, 366); x.quadraticCurveTo(361, 336, 391, 366); x.lineTo(391, 400); x.closePath(); x.fillStyle = '#2a0606'; x.fill(); x.strokeStyle = '#ffd54a'; x.lineWidth = 2; x.stroke();
    line(361, 352, 361, 400, 'rgba(255,213,74,.6)', 2);
    roof(361, 196, 150, 56, GOLD[0], GOLD[1]); roof(361, 240, 190, 56, GOLD[0], GOLD[1]); roof(361, 284, 226, 54, GOLD[0], GOLD[1]);
    ell(361, 184, 8, 10, '#ffd54a'); line(361, 160, 361, 184, '#ffd54a', 3);
    rrect(321, 258, 80, 26, 4, '#7d1414', '#ffd54a'); x.font = 'bold 20px ' + SERIF; x.textAlign = 'center'; x.fillStyle = '#ffe27a'; x.fillText('福 壽 殿', 361, 278);
    for (let a = 150; a <= 572; a += 70) lantern(a, 346, 0.6);
  }
  function carpet() {
    poly([[361 - hw(417), 417], [361 + hw(417), 417], [361 + hw(1280), 1280], [361 - hw(1280), 1280]], lg(0, 417, 0, 1280, [[0, '#c3252b'], [1, '#8f1519']]), '#e8b923');
    poly([[361 - hw(417) + 8, 417], [361 + hw(417) - 8, 417], [361 + hw(1280) - 12, 1280], [361 - hw(1280) + 12, 1280]], 'rgba(0,0,0,0)', 'rgba(255,215,90,.55)');
    for (let y = 470; y < 1250; y += 110) {
      if (y > 590 && y < 650) continue;
      const r = 10 + (y - 420) * 0.022;
      x.strokeStyle = '#f0c84a'; x.lineWidth = 2; x.beginPath(); x.ellipse(361, y, r * 1.5, r * 0.85, 0, 0, 7); x.stroke();
      poly([[361, y - r * 0.7], [361 + r * 0.9, y], [361, y + r * 0.7], [361 - r * 0.9, y]], 'rgba(255,215,90,.8)');
    }
  }
  function lion(a, b, flip) {
    const f = flip ? -1 : 1;
    ell(a, b + 38, 30, 7, 'rgba(0,0,0,.3)'); rect(a - 22, b + 14, 44, 24, lg(0, b + 14, 0, b + 38, [[0, '#cfc3ab'], [1, '#8d7d6c']]));
    ell(a, b + 2, 17, 17, '#bdb09a'); ell(a + f * 4, b - 18, 15, 14, '#cfc3ab');
    for (let i = 0; i < 7; i++) ell(a + f * 4 + Math.cos(i * 0.9 - 1) * 14, b - 18 + Math.sin(i * 0.9 - 1) * 12, 6, 6, '#a89a82');
    ell(a + f * 9, b - 22, 2.5, 2.5, '#222'); ell(a + f * 1, b - 22, 2.5, 2.5, '#222'); rect(a + f * 3 - 4, b - 14, 8, 4, '#7a6a55');
  }
  function tree(a, b, s) {
    x.strokeStyle = '#4a2e22'; x.lineCap = 'round'; x.lineWidth = 13 * s; x.beginPath(); x.moveTo(a, b + 112); x.quadraticCurveTo(a - 16 * s, b + 55, a + 4, b); x.stroke();
    x.lineWidth = 6 * s; [[-30, -10], [32, -22], [-6, -34]].forEach((d) => { x.beginPath(); x.moveTo(a + 2, b + 20); x.lineTo(a + d[0] * s, b + d[1] * s); x.stroke(); }); x.lineCap = 'butt';
    for (let i = 0; i < 52; i++) { const ang = R() * 6.28, d = R() * 72 * s; ell(a + Math.cos(ang) * d, b - 18 + Math.sin(ang) * d * 0.78, 14 + R() * 12, 12 + R() * 10, ['#f3b6c8', '#f8d4de', '#fff0f3', '#ee9fb8', '#ffc9d9'][Math.floor(R() * 5)]); }
    for (let i = 0; i < 16; i++) ell(a + (R() - 0.5) * 150 * s, b + 108 + R() * 14, 5, 2.5, '#f8d4de');
  }
  function label(s, a, b, size) {
    size = size || 19; x.font = 'bold ' + size + 'px ' + SANS; const w = x.measureText(s).width + 28, h = size + 12;
    rrect(a - w / 2, b - size - 1, w, h, h / 2, lg(0, b - size, 0, b - size + h, [[0, '#c3252b'], [1, '#7d1414']]), '#ffd54a');
    x.textAlign = 'center'; x.fillStyle = '#ffeab0'; x.fillText(s, a, b + 4);
  }

  // ---------- ของประจำแต่ละอาคาร ----------
  function props() {
    // ธูป: กระถางทองแดงสามขา + ควัน
    let a = 192, b = 552; ell(a, b + 20, 32, 7, 'rgba(0,0,0,.3)');
    rect(a - 22, b + 8, 5, 14, '#6b4a1a'); rect(a + 17, b + 8, 5, 14, '#6b4a1a');
    ell(a, b, 27, 19, lg(a - 27, 0, a + 27, 0, [[0, '#7a5a1c'], [0.5, '#f0c85a'], [1, '#7a5a1c']])); ell(a, b - 12, 25, 7, '#b88a2a'); ell(a, b - 12, 19, 4, '#3a2a14');
    for (let i = -2; i <= 2; i++) { line(a + i * 7, b - 12, a + i * 8, b - 38, '#c8321e', 2); ell(a + i * 8, b - 38, 2, 2, '#ffb040'); }
    x.strokeStyle = 'rgba(235,235,235,.38)'; x.lineWidth = 5; x.beginPath(); x.moveTo(a, b - 40); x.bezierCurveTo(a - 14, b - 56, a + 14, b - 66, a, b - 84); x.stroke();
    // บ่อปลา
    a = 361; b = 556; ell(a, b + 5, 84, 26, 'rgba(0,0,0,.25)');
    x.fillStyle = lg(0, b - 22, 0, b + 22, [[0, '#ebe1cb'], [1, '#a89a80']]); x.beginPath(); x.ellipse(a, b, 80, 23, 0, 0, 7); x.fill();
    x.fillStyle = lg(0, b - 16, 0, b + 16, [[0, '#62d3e2'], [1, '#1c7f9a']]); x.beginPath(); x.ellipse(a, b + 1, 70, 16, 0, 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 1.5; [[-22, 2, 22, 5], [26, -3, 16, 4]].forEach((r) => { x.beginPath(); x.ellipse(a + r[0], b + r[1], r[2], r[3], 0, 0, 7); x.stroke(); });
    [[-42, 4, 12, 5], [44, 6, 11, 4.5], [8, -8, 10, 4]].forEach((r) => ell(a + r[0], b + r[1], r[2], r[3], '#2f9a4a')); ell(a - 42, b + 1, 5, 4, '#ff9ec0'); ell(a + 44, b + 3, 5, 4, '#ffffff');
    [[-12, 3, '#ff7a1a'], [22, 7, '#fff3e0'], [-30, -4, '#ff5a2a']].forEach((k) => { ell(a + k[0], b + k[1], 10, 4, k[2]); poly([[a + k[0] + 8, b + k[1]], [a + k[0] + 17, b + k[1] - 4], [a + k[0] + 17, b + k[1] + 4]], k[2]); ell(a + k[0] - 5, b + k[1] - 1, 1.2, 1.2, '#000'); });
    // ข้าวสาร
    a = 539; b = 548; rrect(a - 40, b, 80, 18, 3, lg(0, b, 0, b + 18, [[0, '#b3262a'], [1, '#7a1414']]), '#ffd54a');
    [-24, 0, 24].forEach((d) => { ell(a + d, b + 2, 13, 5, '#d9d2c0'); x.fillStyle = '#fbf8ee'; x.beginPath(); x.ellipse(a + d, b - 2, 11, 9, 0, Math.PI, 0); x.fill(); });
    // เซียมซี
    a = 155; b = 770; rrect(a - 14, b - 8, 28, 40, 4, lg(a - 14, 0, a + 14, 0, [[0, '#a8571a'], [0.5, '#e0a040'], [1, '#a8571a']]), '#ffd54a');
    for (let i = -3; i <= 3; i++) line(a + i * 3.5, b - 8, a + i * 5, b - 30, i % 2 ? '#e8c050' : '#c8321e', 2.5);
    x.font = 'bold 14px ' + SERIF; x.textAlign = 'center'; x.fillStyle = '#7d1414'; x.fillText('籤', a, b + 18);
    // ทอยปวย: โต๊ะแท่นกลม + ไม้เสี่ยงทาย
    a = 361; b = 772; ell(a, b + 22, 56, 12, 'rgba(0,0,0,.3)'); ell(a, b + 14, 52, 14, '#8d7d6c'); ell(a, b + 8, 50, 13, lg(0, b - 5, 0, b + 21, [[0, '#d44a3a'], [1, '#8f1d1d']])); x.strokeStyle = '#ffd54a'; x.lineWidth = 2; x.beginPath(); x.ellipse(a, b + 8, 50, 13, 0, 0, 7); x.stroke();
    [[-16, 0, -0.5], [16, 2, 0.5]].forEach((d) => { x.save(); x.translate(a + d[0], b + d[1]); x.rotate(d[2]); x.fillStyle = lg(0, -10, 0, 10, [[0, '#ff6a50'], [1, '#a82418']]); x.beginPath(); x.ellipse(0, 0, 17, 9, 0, 0, Math.PI); x.fill(); x.fillStyle = '#c83a2a'; x.beginPath(); x.ellipse(0, 0, 17, 5, 0, 0, 7); x.fill(); x.restore(); });
    glow(a, b, 50, 'rgba(255,210,100,.35)');
    // ปฏิทินจีน: ม้วนคัมภีร์
    a = 553; b = 776; rect(a - 24, b - 12, 48, 34, lg(0, b - 12, 0, b + 22, [[0, '#f8ecc6'], [1, '#e0cc98']])); rect(a - 30, b - 16, 7, 42, '#8f1d1d'); rect(a + 23, b - 16, 7, 42, '#8f1d1d'); ell(a - 26, b - 16, 5, 2.5, '#ffd54a'); ell(a + 26, b - 16, 5, 2.5, '#ffd54a');
    x.font = 'bold 16px ' + SERIF; x.textAlign = 'center'; x.fillStyle = '#a02020'; x.fillText('曆', a, b + 10);
    // เหรียญนำโชค: สายเหรียญ + ก้อนเงินก้อนทอง
    [-34, 0, 34].forEach((d) => { line(159 + d, 906, 159 + d, 962, '#e02a1f', 2); for (let i = 0; i < 5; i++) { ell(159 + d, 914 + i * 11, 6.5, 6.5, '#ffd54a'); rect(159 + d - 1.6, 914 + i * 11 - 1.6, 3.2, 3.2, '#8a5a10'); } });
    a = 159; b = 996; poly([[a - 28, b], [a + 28, b], [a + 19, b - 17], [a - 19, b - 17]], lg(0, b - 17, 0, b, [[0, '#ffe27a'], [1, '#c98b1e']]), '#8a5a10'); ell(a, b - 18, 19, 7, '#ffe98a'); x.strokeStyle = '#8a5a10'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(a, b - 18, 19, 7, 0, 0, 7); x.stroke();
    // โคมไฟแห่งรัก: ซุ้มประตู + หัวใจ
    rect(268, 896, 9, 76, lg(268, 0, 277, 0, [[0, '#8f1d1d'], [0.5, '#e04a3a'], [1, '#8f1d1d']])); rect(445, 896, 9, 76, lg(445, 0, 454, 0, [[0, '#8f1d1d'], [0.5, '#e04a3a'], [1, '#8f1d1d']]));
    rect(258, 888, 204, 12, '#b3262a'); rect(258, 888, 204, 3, '#ffd54a'); roof(361, 862, 90, 26, GOLD[0], GOLD[1]);
    x.font = '30px sans-serif'; x.textAlign = 'center';
    [[-60, 0], [-30, 20], [0, 34], [30, 20], [60, 0], [-15, 4], [15, 4]].forEach((d) => { glow(361 + d[0], 936 + d[1], 26, 'rgba(255,60,80,.45)'); x.fillStyle = '#ff3355'; x.fillText('♥', 361 + d[0], 946 + d[1]); });
    // ตำรา
    ['#2a5aa0', '#a02a2a', '#2a8a5a', '#d4a020'].forEach((col, i) => { rrect(540 + (i % 2) * 6, 984 - i * 11, 38, 10, 2, col, 'rgba(0,0,0,.3)'); rect(540 + (i % 2) * 6 + 3, 984 - i * 11 + 4, 32, 2, 'rgba(255,255,255,.5)'); });
    rect(588, 960, 14, 26, '#a02020'); ell(595, 956, 7, 3, '#ffd54a');
  }

  function paint() {
    sky(); ground();
    wall(0, 150, 440); wall(570, 720, 440);
    pav(70, 396, 'work', GREEN); pav(650, 396, 'work', GREEN);
    hall();
    stairs(415, 600, 45); stairs(640, 1010, 45);
    carpet();
    lion(361 - 128, 612, 0); lion(361 + 128, 612, 1);
    pav(192, 500, 'altar', GOLD); pav(361, 496, 'fish', TEAL); pav(539, 500, 'rice', GOLD);
    pav(155, 735, 'qian', PURP); pav(553, 735, 'almanac', RED); pav(159, 930, 'money', GOLD); pav(558, 940, 'study', BLUE);
    props();
    for (let y = 660; y < 1130; y += 70) { pole(361 - hw(y) - 16, y); pole(361 + hw(y) + 16, y); }
    tree(60, 520, 1.1); tree(660, 560, 1.1); tree(45, 880, 0.9); tree(675, 900, 1);
    let q = x.createRadialGradient(360, 640, 380, 360, 640, 820); q.addColorStop(0, 'rgba(0,0,0,0)'); q.addColorStop(1, 'rgba(0,0,0,.5)'); rect(0, 0, 720, 1280, q);
    label('อาคารธูปหอม', 192, 586); label('อาคารบ่อปลาคราฟ', 361, 590); label('โต๊ะถวายข้าว', 539, 586);
    label('อาคารเซียมซี', 155, 820); label('อาคารไม้เสี่ยงทาย', 361, 806); label('อาคารปฏิทินจีน', 553, 820);
    label('อาคารเหรียญนำโชค', 159, 1015); label('อาคารโคมไฟแห่งรัก', 361, 1010); label('อาคารตำราและม้วนคัมภีร์', 558, 1015, 17);
    label('ศาลใหญ่ · ดวงการงาน', 361, 388);
    bg.src = c.toDataURL('image/jpeg', 0.92);
  }
  const f = document.fonts ? Promise.all([document.fonts.load('16px "Noto Sans Thai"'), document.fonts.load('bold 16px "Noto Serif TC"', '福壽殿曆籤')]).catch(() => {}) : Promise.resolve();
  Promise.race([f, new Promise((r) => setTimeout(r, 2500))]).then(paint);
})();
