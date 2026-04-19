const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const { readFileSync } = require('fs');
const { join } = require('path');

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');
const BUCKET_NAME = 'wifirst-tech-blog.firebasestorage.app';

const IMAGES = [
  {
    local: '/Users/davidberkowicz/.openclaw/workspace/cover.jpg',
    remote: 'images/esim-iot-cover.jpg'
  },
  {
    local: '/Users/davidberkowicz/.openclaw/workspace/inline1.jpg',
    remote: 'images/esim-iot-inline1.jpg'
  },
  {
    local: '/Users/davidberkowicz/.openclaw/workspace/inline2.jpg',
    remote: 'images/esim-iot-inline2.jpg'
  },
  {
    local: '/Users/davidberkowicz/.openclaw/workspace/inline3.jpg',
    remote: 'images/esim-iot-inline3.jpg'
  }
];

async function main() {
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: BUCKET_NAME
  });

  const bucket = getStorage().bucket();

  for (const img of IMAGES) {
    console.log(`Uploading ${img.local} to ${img.remote}...`);
    await bucket.upload(img.local, {
      destination: img.remote,
      public: true,
      metadata: {
        contentType: 'image/jpeg'
      }
    });
    console.log(`Uploaded ${img.remote}. URL: https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(img.remote)}?alt=media`);
  }
}

main().catch(console.error);