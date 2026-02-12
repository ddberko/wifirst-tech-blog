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
    'images/covers/seo-geo-evolution.png',
    'images/images/seo-eeat-pillars.png',
    'images/images/seo-answer-first.png',
    'images/images/seo-geo-metrics.png',
  ];
  
  for (const imagePath of imagesToPublish) {
    try {
      const file = bucket.file(imagePath);
      await file.makePublic();
      console.log(`✅ Public: ${imagePath}`);
      console.log(`   URL: https://storage.googleapis.com/${BUCKET_NAME}/${imagePath}`);
    } catch (error) {
      console.error(`❌ Erreur ${imagePath}:`, error);
    }
  }
}

main();
