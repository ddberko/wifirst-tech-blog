import { Storage } from '@google-cloud/storage';
import { join } from 'path';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');
const BUCKET_NAME = 'wifirst-tech-blog.firebasestorage.app';

const IMAGES = [
  { local: 'public/images/covers/geolocalisation-indoor-retail.png', dest: 'images/covers/geolocalisation-indoor-retail.png' },
  { local: 'public/images/images/geolocalisation-indoor-technologies.png', dest: 'images/images/geolocalisation-indoor-technologies.png' },
  { local: 'public/images/images/geolocalisation-indoor-technique.png', dest: 'images/images/geolocalisation-indoor-technique.png' },
  { local: 'public/images/images/geolocalisation-indoor-usecases.png', dest: 'images/images/geolocalisation-indoor-usecases.png' },
  { local: 'public/images/images/geolocalisation-indoor-tendances.png', dest: 'images/images/geolocalisation-indoor-tendances.png' },
];

async function main() {
  const storage = new Storage({
    keyFilename: SERVICE_ACCOUNT_PATH,
    projectId: 'wifirst-tech-blog',
  });

  const bucket = storage.bucket(BUCKET_NAME);

  for (const img of IMAGES) {
    const localPath = join(PROJECT_ROOT, img.local);
    console.log(`📤 Uploading ${img.local}...`);

    const [file] = await bucket.upload(localPath, {
      destination: img.dest,
      public: true,
      metadata: { cacheControl: 'public, max-age=31536000' },
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${img.dest}`;
    console.log(`✅ ${publicUrl}`);
  }

  console.log('\n🎉 All images uploaded and made public!');
}

main().catch(console.error);
