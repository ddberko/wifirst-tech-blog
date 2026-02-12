/**
 * Upload LLM article images to Firebase Storage and make them public.
 */
import { Storage } from '@google-cloud/storage';
import { join } from 'path';
import { existsSync } from 'fs';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');
const BUCKET_NAME = 'wifirst-tech-blog.firebasestorage.app';
const WORKSPACE = '/Users/davidberkowicz/.openclaw/workspace';

const images = [
  { local: join(WORKSPACE, 'llm-codage-cover.png'), remote: 'images/covers/evolution-llm-codage-2026-cover.png' },
  { local: join(WORKSPACE, 'llm-codage-timeline.png'), remote: 'images/images/llm-codage-timeline.png' },
  { local: join(WORKSPACE, 'llm-codage-benchmarks.png'), remote: 'images/images/llm-codage-benchmarks.png' },
  { local: join(WORKSPACE, 'llm-codage-ecosystem.png'), remote: 'images/images/llm-codage-ecosystem.png' },
  { local: join(WORKSPACE, 'llm-codage-impact.png'), remote: 'images/images/llm-codage-impact.png' },
];

async function main() {
  const storage = new Storage({
    keyFilename: SERVICE_ACCOUNT_PATH,
    projectId: 'wifirst-tech-blog',
  });
  const bucket = storage.bucket(BUCKET_NAME);

  for (const img of images) {
    if (!existsSync(img.local)) {
      console.error(`❌ File not found: ${img.local}`);
      continue;
    }

    console.log(`📤 Uploading ${img.remote}...`);
    await bucket.upload(img.local, {
      destination: img.remote,
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000',
      },
    });

    const file = bucket.file(img.remote);
    await file.makePublic();
    console.log(`✅ Public: https://storage.googleapis.com/${BUCKET_NAME}/${img.remote}`);
  }

  console.log('\n🎉 All images uploaded and public!');
}

main().catch(console.error);
