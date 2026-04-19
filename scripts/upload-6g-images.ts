import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');
const BUCKET_NAME = 'wifirst-tech-blog.firebasestorage.app';

const IMAGES = [
  {
    local: '/Users/davidberkowicz/.openclaw/media/tool-image-generation/6g-isac-cover---8f65a6d0-80c1-4ea5-946a-5824b2589093.jpg',
    remote: 'images/6g-isac-cover.png'
  },
  {
    local: '/Users/davidberkowicz/.openclaw/media/tool-image-generation/6g-sensing-diagram---9e6e0720-e8dd-4e4c-a6ec-f3645c74ce79.jpg',
    remote: 'images/6g-sensing-diagram.png'
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
    console.log(`Uploaded ${img.remote}`);
  }
}

main().catch(console.error);
