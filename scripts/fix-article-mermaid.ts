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

  // Fix Mermaid diagrams
  // 1. Quoting labels with special characters (like ')
  content = content.replace(/AP1\[Point d'Accès Wi-Fi 7 - Chambre 101\]/g, 'AP1["Point d\'Accès Wi-Fi 7 - Chambre 101"]');
  content = content.replace(/AP2\[Point d'Accès Wi-Fi 7 - Chambre 102\]/g, 'AP2["Point d\'Accès Wi-Fi 7 - Chambre 102"]');
  content = content.replace(/AP3\[Point d'Accès Wi-Fi 7 - Couloir\]/g, 'AP3["Point d\'Accès Wi-Fi 7 - Couloir"]');
  content = content.replace(/AP\[AP Wi-Fi d'Entreprise Wifirst\n\(IT \+ OT Gateway\)\]/g, 'AP["AP Wi-Fi d\'Entreprise Wifirst (IT + OT Gateway)"]');
  content = content.replace(/AP\[AP Wi-Fi d'Entreprise Wifirst\\n\(IT \+ OT Gateway\)\]/g, 'AP["AP Wi-Fi d\'Entreprise Wifirst (IT + OT Gateway)"]');

  await doc.ref.update({ content });
  console.log('Article content updated with Mermaid fixes');
}

main().catch(console.error);
