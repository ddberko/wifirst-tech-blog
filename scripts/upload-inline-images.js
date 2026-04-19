const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

const sa = JSON.parse(fs.readFileSync('service-account.json', 'utf-8'));
initializeApp({ credential: cert(sa), storageBucket: 'wifirst-tech-blog.firebasestorage.app' });
const bucket = getStorage().bucket();

const files = [
  { local: 'public/images/images/hybrid-key-exchange.png', remote: 'images/images/hybrid-key-exchange.png' },
  { local: 'public/images/images/qkd-fiber-network.png', remote: 'images/images/qkd-fiber-network.png' },
  { local: 'public/images/images/5g-pqc-architecture.png', remote: 'images/images/5g-pqc-architecture.png' }
];

(async () => {
  for (const f of files) {
    if (fs.existsSync(f.local)) {
      console.log(`Uploading ${f.local}...`);
      await bucket.upload(f.local, {
        destination: f.remote,
        public: true,
        metadata: { cacheControl: 'public, max-age=31536000' }
      });
      // Force makePublic just in case
      await bucket.file(f.remote).makePublic();
      console.log(`✅ Public: https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/${f.remote}`);
    } else {
      console.warn(`⚠️  File not found: ${f.local}`);
    }
  }
})();
