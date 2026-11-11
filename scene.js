// วาดฉากศาลเจ้าด้วยโค้ด แล้วส่งให้ game.js ใช้เป็นพื้นหลัง (โหลดหลัง game.js)
(function () {
  const c = document.createElement('canvas'); c.width = 720; c.height = 1280;
  const x = c.getContext('2d'), SANS = "'Noto Sans Thai',Sarabun,Tahoma,sans-serif", R = rnd(7);
  const poly = (p, f, s) => { x.beginPath(); p.forEach((q, i) => (i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]))); x.closePath(); x.fillStyle = f; x.fill(); if (s) { x.strokeStyle = s; x.lineWidth = 2; x.stroke(); } };
  const rect = (a, b, w, h, f) => { x.fillStyle = f; x.fillRect(a, b, w, h); };
  const ell = (a, b, rx, ry, f) => { x.fillStyle = f; x.beginPath(); x.ellipse(a, b, rx, ry, 0, 0, 7); x.fill(); };
  const glow = (a, b, r, col) => { const q = x.createRadialGradient(a, b, 0, a, b, r); q.addColorStop(0, col); q.addColorStop(1, 'rgba(255,200,80,0)'); x.fillStyle = q; x.fillRect(a - r, b - r, r * 2, r * 2); };
  const hw = (y) => 60 + (y - 420) * 0.12;

  function roof(cx, y, w, h, col) {
    poly([[cx - w - 16, y + h - 6], [cx - w + 10, y + h], [cx + w - 10, y + h], [cx + w + 16, y + h - 6], [cx + w * 0.6, y + h * 0.35], [cx + w * 0.2, y], [cx - w * 0.2, y], [cx - w * 0.6, y + h * 0.35]], col, '#ffd54a');
    for (let i = -3; i <= 3; i++) { x.strokeStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.moveTo(cx + i * w * 0.28, y + h * 0.3); x.lineTo(cx + i * w * 0.34, y + h); x.stroke(); }
  }
  function pav(cx, cy, col) {
    rect(cx - 44, cy - 14, 88, 56, 'rgba(50,15,10,.55)');
    rect(cx - 52, cy + 40, 104, 16, '#8d7d6c'); rect(cx - 44, cy - 14, 6, 56, '#a02020'); rect(cx + 38, cy - 14, 6, 56, '#a02020');
    roof(cx, cy - 56, 54, 44, col || '#c8892a'); ell(cx, cy - 60, 4, 4, '#ffd54a');
  }
  function lantern(a, b) {
    glow(a, b + 12, 34, 'rgba(255,170,60,.45)');
    x.strokeStyle = '#ffd54a'; x.lineWidth = 2; x.beginPath(); x.moveTo(a, b - 14); x.lineTo(a, b); x.stroke();
    ell(a, b + 12, 10, 13, '#e02a1f'); rect(a - 6, b - 1, 12, 3, '#ffd54a'); rect(a - 1, b + 24, 2, 8, '#ffd54a');
  }
  function tree(a, b, s) {
    poly([[a - 8, b + 110], [a - 4, b], [a + 6, b], [a + 12, b + 110]], '#4a2e22');
    for (let i = 0; i < 26; i++) { const ang = R() * 6.28, d = R() * 70 * s; ell(a + Math.cos(ang) * d, b - 20 + Math.sin(ang) * d * 0.8, 16 + R() * 12, 14 + R() * 10, ['#f3b6c8', '#f8d4de', '#fff0f3', '#ee9fb8'][Math.floor(R() * 4)]); }
  }
  function label(s, a, b, size) { x.font = 'bold ' + (size || 17) + 'px ' + SANS; x.textAlign = 'center'; x.lineWidth = 4; x.strokeStyle = 'rgba(0,0,0,.8)'; x.strokeText(s, a, b); x.fillStyle = '#fff'; x.fillText(s, a, b); }

  function paint() {
    let q = x.createLinearGradient(0, 0, 0, 420); q.addColorStop(0, '#f2b35e'); q.addColorStop(1, '#c9593a'); rect(0, 0, 720, 440, q);
    poly([[430, 300], [560, 190], [640, 230], [720, 150], [720, 340]], '#9a6a63'); poly([[0, 330], [90, 260], [190, 330]], '#a8736a');
    q = x.createLinearGradient(0, 330, 0, 1280); q.addColorStop(0, '#9a7a60'); q.addColorStop(1, '#4e382b'); rect(0, 330, 720, 950, q);
    x.strokeStyle = 'rgba(0,0,0,.07)'; for (let y = 350; y < 1280; y += 38) { x.beginPath(); x.moveTo(0, y); x.lineTo(720, y); x.stroke(); }
    glow(361, 300, 300, 'rgba(255,225,120,.6)');
    poly([[0, 400], [30, 380], [100, 380], [130, 400], [110, 470], [0, 470]], '#8f1d1d', '#ffd54a'); poly([[590, 360], [720, 330], [720, 450], [600, 450]], '#8f1d1d', '#ffd54a');
    // ศาลใหญ่
    rect(171, 395, 380, 22, '#a58f78'); rect(211, 300, 300, 100, '#8f1d1d');
    for (let i = 0; i < 6; i++) rect(221 + i * 56, 300, 10, 100, '#d4a020');
    rect(331, 322, 60, 78, '#3a0808'); glow(361, 360, 50, 'rgba(255,220,100,.8)');
    roof(361, 196, 150, 56, '#d49a30'); roof(361, 240, 190, 56, '#c8892a'); roof(361, 284, 226, 54, '#b97a22'); ell(361, 190, 7, 7, '#ffd54a');
    // บันไดและพรมแดง
    const st = (y0, y1, e) => { poly([[361 - hw(y0) - e, y0], [361 + hw(y0) + e, y0], [361 + hw(y1) + e, y1], [361 - hw(y1) - e, y1]], '#a8977f'); x.strokeStyle = 'rgba(0,0,0,.2)'; for (let y = y0 + 10; y < y1; y += 16) { x.beginPath(); x.moveTo(361 - hw(y) - e, y); x.lineTo(361 + hw(y) + e, y); x.stroke(); } };
    st(415, 600, 45); st(640, 1010, 45);
    poly([[361 - hw(417), 417], [361 + hw(417), 417], [361 + hw(1280), 1280], [361 - hw(1280), 1280]], '#b3262a', '#e8b923');
    x.strokeStyle = 'rgba(0,0,0,.18)'; for (let y = 420; y < 1010; y += 16) { if (y > 600 && y < 640) continue; x.beginPath(); x.moveTo(361 - hw(y), y); x.lineTo(361 + hw(y), y); x.stroke(); }
    // อาคาร
    pav(192, 500); pav(361, 502, '#2aa6a0'); pav(539, 500); pav(155, 735); pav(553, 735); pav(159, 930); pav(558, 940);
    // ธูป
    poly([[172, 520], [212, 520], [206, 540], [178, 540]], '#d4a020'); x.strokeStyle = 'rgba(230,230,230,.5)'; x.lineWidth = 3; x.beginPath(); x.moveTo(192, 515); x.bezierCurveTo(182, 495, 202, 485, 192, 470); x.stroke();
    // บ่อปลา
    ell(361, 536, 48, 14, '#3fb6c8'); [-20, 5, 24].forEach((d, i) => ell(361 + d, 536 + (i % 2) * 3, 9, 4, '#ff7a1a'));
    // ข้าว
    rect(509, 520, 60, 14, '#7a1414'); [-18, 0, 18].forEach((d) => ell(539 + d, 518, 11, 8, '#f6f3e8'));
    // เซียมซี
    rect(143, 724, 24, 34, '#c8892a'); x.strokeStyle = '#ffd54a'; x.lineWidth = 2; [-8, -3, 3, 8].forEach((d) => { x.beginPath(); x.moveTo(155 + d, 724); x.lineTo(155 + d * 1.3, 700); x.stroke(); });
    // ไม้เสี่ยงทาย
    [[-26, 20], [0, 20], [26, 20], [-13, 0], [13, 0], [0, -20]].forEach((d) => { const a = 361 + d[0], b = 750 + d[1]; rect(a - 14, b - 12, 28, 24, '#a9a9c4'); poly([[a - 14, b - 12], [a - 8, b - 20], [a + 20, b - 20], [a + 14, b - 12]], '#d4d4e6'); });
    // ปฏิทิน (ม้วนคัมภีร์)
    rect(533, 722, 40, 30, '#f3e3b8'); rect(529, 718, 6, 38, '#8f1d1d'); rect(571, 718, 6, 38, '#8f1d1d');
    // เหรียญ
    [-30, 0, 30].forEach((d) => { x.strokeStyle = '#e02a1f'; x.beginPath(); x.moveTo(159 + d, 916); x.lineTo(159 + d, 962); x.stroke(); for (let i = 0; i < 4; i++) ell(159 + d, 922 + i * 11, 6, 6, '#ffd54a'); });
    // โคมไฟรัก
    x.fillStyle = '#ff3355'; x.font = '30px sans-serif'; x.textAlign = 'center';
    [[-60, 0], [-30, 20], [0, 34], [30, 20], [60, 0], [-15, 4], [15, 4]].forEach((d) => { glow(361 + d[0], 930 + d[1], 24, 'rgba(255,60,80,.4)'); x.fillStyle = '#ff3355'; x.fillText('♥', 361 + d[0], 940 + d[1]); });
    // ตำรา
    ['#2a5aa0', '#a02a2a', '#2a8a5a', '#d4a020'].forEach((col, i) => rect(542 + (i % 2) * 6, 972 - i * 10, 34, 9, col));
    // โคมริมพรม
    for (let y = 450; y < 1110; y += 66) { lantern(361 - hw(y) - 52, y); lantern(361 + hw(y) + 52, y); }
    tree(60, 520, 1.1); tree(660, 560, 1.1); tree(45, 880, 0.9); tree(675, 900, 1);
    q = x.createRadialGradient(360, 640, 380, 360, 640, 820); q.addColorStop(0, 'rgba(0,0,0,0)'); q.addColorStop(1, 'rgba(0,0,0,.45)'); rect(0, 0, 720, 1280, q);
    // ป้ายชื่ออาคาร
    label('อาคารธูปหอม', 192, 586); label('อาคารบ่อปลาคราฟ', 361, 588); label('โต๊ะถวายข้าว', 539, 586);
    label('อาคารเซียมซี', 155, 820); label('อาคารไม้เสี่ยงทาย', 361, 800); label('อาคารปฏิทินจีน', 553, 820);
    label('อาคารเหรียญนำโชค', 159, 1015); label('อาคารโคมไฟแห่งรัก', 361, 1008); label('อาคารตำราและม้วนคัมภีร์', 558, 1015, 15);
    label('ศาลใหญ่ · ดวงการงาน', 361, 452);
    bg.src = c.toDataURL('image/jpeg', 0.9);
  }
  const f = document.fonts ? document.fonts.load('16px "Noto Sans Thai"').catch(() => {}) : Promise.resolve();
  Promise.race([f, new Promise((r) => setTimeout(r, 2000))]).then(paint);
})();
