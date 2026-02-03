import * as admin from 'firebase-admin';
import * as fs from 'fs';

const serviceAccountPath = '/Users/davidberkowicz/Projects/wifirst-tech-blog/service-account.json';

if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function deletePost() {
  const slug = "wifi-8-802-11bn-uhr-explications";
  await db.collection("articles").doc(slug).delete();
  console.log(`✅ Article ${slug} supprimé.`);
}

deletePost().catch(console.error);
