/**
 * Liste tous les articles publiés sur Firestore
 * Usage: cd /Users/davidberkowicz/Projects/wifirst-tech-blog && NODE_PATH=./node_modules npx tsx scripts/list-articles.ts
 */

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

  const snapshot = await db.collection('articles').orderBy('publishedAt', 'desc').get();

  console.log(`📰 ${snapshot.size} articles publiés sur Firestore:\n`);
  snapshot.docs.forEach((doc, i) => {
    const d = doc.data();
    const date = d.publishedAt?.toDate?.()?.toISOString?.()?.slice(0, 10) ?? '?';
    console.log(`${i + 1}. [${date}] ${d.title}`);
    console.log(`   slug: ${d.slug} | cat: ${d.category} | tags: ${(d.tags || []).join(', ')}`);
  });
}

main().catch(console.error);
