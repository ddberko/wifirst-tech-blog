import { getStorage } from 'firebase-admin/storage';
import { initializeApp, cert } from 'firebase-admin/app';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('service-account.json', 'utf8'));
initializeApp({ credential: cert(sa), storageBucket: 'wifirst-tech-blog.firebasestorage.app' });

const bucket = getStorage().bucket();
const files = process.argv.slice(2);

async function main() {
  for (const f of files) {
    await bucket.file(f).makePublic();
    console.log('✅ Public:', f);
  }
}

main().catch(console.error);
