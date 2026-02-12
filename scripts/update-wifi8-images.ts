import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

const BUCKET_NAME = "wifirst-tech-blog.firebasestorage.app";

if (getApps().length === 0) {
  const serviceAccountPath = path.join(process.cwd(), "service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
  }
}

const db = getFirestore();

async function update() {
  const slug = "wifi-8-leo-convergence-2026";
  const coverImageUrl = "https://firebasestorage.googleapis.com/v0/b/wifirst-tech-blog.firebasestorage.app/o/images%2Fheader-wifi8-leo-convergence.png?alt=media";
  
  // Update content to use Firebase Storage URLs
  const contentImageUrl = "https://firebasestorage.googleapis.com/v0/b/wifirst-tech-blog.firebasestorage.app/o/images%2Fcontent-wifi8-uhr-architecture.png?alt=media";
  
  const doc = await db.collection('posts').doc(slug).get();
  if (!doc.exists) {
    console.error("❌ Document non trouvé");
    process.exit(1);
  }
  
  const data = doc.data()!;
  const updatedContent = data.content.replace(
    "/images/content-wifi8-uhr-architecture.png",
    contentImageUrl
  );
  
  await db.collection('posts').doc(slug).update({
    coverImage: coverImageUrl,
    content: updatedContent
  });
  
  console.log("✅ URLs Firebase Storage mises à jour !");
}

update();
