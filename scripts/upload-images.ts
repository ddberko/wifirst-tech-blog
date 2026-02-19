import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { join, basename } from 'path';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const sa = JSON.parse(readFileSync(join(PROJECT_ROOT, 'service-account.json'), 'utf8'));
initializeApp({ credential: cert(sa), storageBucket: 'wifirst-tech-blog.firebasestorage.app' });

const bucket = getStorage().bucket();

const uploads: [string, string][] = [
  [join(PROJECT_ROOT, 'content/images/swe-bench-verified-feb2026.png'), 'images/images/swe-bench-verified-feb2026.png'],
  [join(PROJECT_ROOT, 'content/images/multi-benchmark-comparison-feb2026.png'), 'images/images/multi-benchmark-comparison-feb2026.png'],
  [join(PROJECT_ROOT, 'content/images/coding-ai-landscape-2026-v2.png'), 'images/images/coding-ai-landscape-2026-v2.png'],
];

async function main() {
  for (const [localPath, storagePath] of uploads) {
    await bucket.upload(localPath, {
      destination: storagePath,
      metadata: { contentType: 'image/png', cacheControl: 'public, max-age=31536000' },
    });
    await bucket.file(storagePath).makePublic();
    console.log(`✅ ${storagePath}`);
    console.log(`   https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/${storagePath}`);
  }
}

main().catch(console.error);
