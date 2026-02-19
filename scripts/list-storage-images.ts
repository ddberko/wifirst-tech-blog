import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const sa = JSON.parse(readFileSync(join(PROJECT_ROOT, 'service-account.json'), 'utf8'));
initializeApp({ credential: cert(sa), storageBucket: 'wifirst-tech-blog.firebasestorage.app' });

const prefix = process.argv[2] || 'images/';
const bucket = getStorage().bucket();

async function main() {
  const [files] = await bucket.getFiles({ prefix });
  const filtered = files.filter(f => f.name.includes('coding-ai'));
  for (const f of filtered) {
    const [metadata] = await f.getMetadata();
    const isPublic = metadata.acl?.some((a: any) => a.entity === 'allUsers') ?? false;
    console.log(`${isPublic ? '🔓' : '🔒'} ${f.name} (${Math.round((metadata.size as number) / 1024)}KB)`);
  }
}

main().catch(console.error);
