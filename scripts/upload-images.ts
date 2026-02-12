import { Storage } from '@google-cloud/storage';
import { readFileSync } from 'fs';
import { join, basename } from 'path';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');
const BUCKET_NAME = 'wifirst-tech-blog.firebasestorage.app';

const IMAGES = [
  { local: 'public/images/covers/dimensionnement-openstack-cover.png', dest: 'covers/dimensionnement-openstack-cover.png' },
  { local: 'public/images/dimensionnement-iac.png', dest: 'images/dimensionnement-iac.png' },
  { local: 'public/images/dimensionnement-monitoring.png', dest: 'images/dimensionnement-monitoring.png' },
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
    
    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${img.dest}`;
    console.log(`✅ ${publicUrl}`);
  }
  
  console.log('\n🎉 All images uploaded!');
}

main().catch(console.error);
