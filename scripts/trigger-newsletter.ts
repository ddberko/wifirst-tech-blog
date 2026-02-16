/**
 * Trigger newsletter for an existing article by setting status to "published"
 * (simulates a draft→published transition to fire onArticlePublished)
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { join } from 'path';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');

initializeApp({ credential: cert(SERVICE_ACCOUNT_PATH) });
const db = getFirestore();

const SLUG = 'network-digital-twins-anticipation-reseau';

async function main() {
  // Find article by slug
  const snap = await db.collection('articles').where('slug', '==', SLUG).limit(1).get();
  if (snap.empty) {
    console.error(`❌ Article with slug "${SLUG}" not found.`);
    return;
  }

  const docRef = snap.docs[0].ref;
  const data = snap.docs[0].data();
  
  console.log(`📝 Article: ${data.title}`);
  console.log(`   Status: ${data.status || '(none)'}`);
  console.log(`   newsletterSentAt: ${data.newsletterSentAt || '(none)'}`);

  // Step 1: Set status to "draft" (so the update trigger sees a transition)
  console.log('\n⏳ Setting status to "draft"...');
  await docRef.update({ status: 'draft' });
  
  // Wait 2 seconds for Firestore propagation
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Set status back to "published" (triggers the newsletter)
  console.log('⏳ Setting status to "published" (this triggers the newsletter)...');
  await docRef.update({ status: 'published' });
  
  console.log('\n✅ Done! The onArticlePublished trigger should fire and send emails.');
  console.log('   Check Cloud Functions logs for confirmation.');
}

main().catch(console.error);
