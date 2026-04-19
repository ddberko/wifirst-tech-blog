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
  let content = doc.data().content;

  // Final Mermaid Polish: ensure labels are quoted and use <br/> for newlines
  content = content.replace(/AP1\["Point d'Accès Wi-Fi 7 - Chambre 101"\]/g, 'AP1["Point d\'Accès Wi-Fi 7 - Chambre 101"]');
  // Ensuring no unquoted complex labels remain
  // Any bracket label with ' should be quoted
  content = content.replace(/AP\["AP Wi-Fi d'Entreprise Wifirst \(IT \+ OT Gateway\)"\]/g, 'AP["AP Wi-Fi d\'Entreprise Wifirst<br/>(IT + OT Gateway)"]');

  await doc.ref.update({ content });
  console.log('Article content polished');
}

main().catch(console.error);
