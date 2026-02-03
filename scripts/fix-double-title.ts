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

async function fixTitle() {
  const slug = "souverainete-numerique-europe-semi-conducteurs";
  const docRef = db.collection("articles").doc(slug);
  const doc = await docRef.get();
  
  if (doc.exists) {
    let content = doc.data()?.content || "";
    // Remove the first H1 line if it exists
    content = content.replace(/^# .*\n+/, "");
    await docRef.update({ content });
    console.log("✅ Title duplication fixed in Firestore.");
  }
}

fixTitle().catch(console.error);
