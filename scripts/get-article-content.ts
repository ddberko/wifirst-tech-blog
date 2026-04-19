import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');

async function main() {
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  const slug = 'convergence-it-ot-thread-1-4-wifi-enterprise-smart-building-2026';
  const snapshot = await db.collection('articles').where('slug', '==', slug).get();

  if (snapshot.empty) {
    console.log('No article found');
    return;
  }

  const doc = snapshot.docs[0];
  console.log(JSON.stringify(doc.data(), null, 2));
}

main().catch(console.error);
