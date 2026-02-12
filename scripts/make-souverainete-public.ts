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
    'images/covers/souverainete-equipements-reseau-europe.png',
    'images/images/souverainete-dependance-geopolitique.png',
    'images/images/souverainete-open-ran.png',
    'images/images/souverainete-regulation-nis2.png',
  ];
  
  for (const imagePath of imagesToPublish) {
    try {
      const file = bucket.file(imagePath);
      await file.makePublic();
      const url = 'https://storage.googleapis.com/' + BUCKET_NAME + '/' + imagePath;
      console.log('✅ Public: ' + url);
    } catch (error) {
      console.error('❌ Erreur ' + imagePath + ':', error);
    }
  }
}

main();
