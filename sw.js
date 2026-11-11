// service worker แบบเล็กที่สุด: ไม่แคชอะไร (เกมไลฟ์ต้องได้ไฟล์ล่าสุดเสมอ) มีไว้ให้ Chrome แสดงปุ่ม "ติดตั้งแอป"
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
