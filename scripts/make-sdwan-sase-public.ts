import { Storage } from '@google-cloud/storage';
import { join } from 'path';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');
const BUCKET_NAME = 'wifirst-tech-blog.firebasestorage.app';

async function main() {
  const storage = new Storage({
    keyFilename: SERVICE_ACCOUNT_PATH,
    projectId: 'wifirst-tech-blog',
  });
  
  const bucket = storage.bucket(BUCKET_NAME);
  
  const imagesToPublish = [
    'images/images/sdwan-sase-zerotrust.png',
    'images/images/sdwan-sase-pops.png',
    'images/images/sdwan-sase-remote.png',
  ];
  
  for (const imagePath of imagesToPublish) {
    try {
      const file = bucket.file(imagePath);
      await file.makePublic();
      console.log(`✅ Public: ${imagePath}`);
    } catch (error) {
      console.error(`❌ Erreur ${imagePath}:`, error);
    }
  }
}

main();
