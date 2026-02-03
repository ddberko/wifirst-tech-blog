const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: "wifirst-tech-blog"
  });
}

const db = admin.firestore();

async function check() {
  const doc = await db.collection('articles').doc('edge-ai-reseau-npu-2026').get();
  if (!doc.exists) {
    console.log('NOT_FOUND_IN_FIRESTORE');
  } else {
    console.log('FOUND_IN_FIRESTORE');
    console.log(JSON.stringify(doc.data(), null, 2));
  }
  process.exit(0);
}

check();
