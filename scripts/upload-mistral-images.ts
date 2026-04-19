import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');
const BUCKET_NAME = 'wifirst-tech-blog.firebasestorage.app';

const IMAGES = [
  {
    local: '/tmp/2026-04-18-mistral-cover.png',
    remote: 'images/2026-04-18-mistral-cover.png'
  },
  {
    local: '/tmp/2026-04-18-mistral-moa.png',
    remote: 'images/2026-04-18-mistral-moa.png'
  },
  {
    local: '/tmp/2026-04-18-mistral-netops.png',
    remote: 'images/2026-04-18-mistral-netops.png'
  },
  {
    local: '/tmp/2026-04-18-mistral-security.png',
    remote: 'images/2026-04-18-mistral-security.png'
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
        contentType: 'image/png'
      }
    });
    const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(img.remote)}?alt=media`;
    console.log(`URL: ${url}`);
  }
}

main().catch(console.error);