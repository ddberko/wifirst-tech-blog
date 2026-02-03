import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = '/Users/davidberkowicz/Projects/wifirst-tech-blog/service-account.json';

// Initialize admin SDK
if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function publish() {
  const art = {
    slug: "souverainete-numerique-europe-semi-conducteurs",
    title: "Souveraineté numérique : l'Europe face au duopole USA-Chine sur les semi-conducteurs",
    path: "/Users/davidberkowicz/.openclaw/workspace/posts/2026-02-02-souverainete-numerique-europe-deep-dive.md",
    category: "Architecture",
    tags: ["Souveraineté", "Semi-conducteurs", "Europe", "Hardware", "Deep Dive"],
    coverImage: "/images/npu_chipset_architecture.png",
    excerpt: "Plongez au cœur de la guerre des semi-conducteurs. Entre la domination américaine sur la conception et le goulot d'étranglement taïwanais, comment l'Europe tente-t-elle de regagner sa souveraineté avec le Chips Act et RISC-V ?"
  };

  if (!fs.existsSync(art.path)) {
    console.error(`❌ File not found: ${art.path}`);
    process.exit(1);
  }

  console.log(`🚀 Publishing (Admin) to Firestore: ${art.slug}`);
  const content = fs.readFileSync(art.path, 'utf-8');
  const now = admin.firestore.Timestamp.now();

  await db.collection("articles").doc(art.slug).set({
    slug: art.slug,
    title: art.title,
    excerpt: art.excerpt,
    content: content,
    category: art.category,
    tags: art.tags,
    coverImage: art.coverImage,
    featured: true,
    author: {
      name: "David Berkowicz",
      role: "CTO",
      avatar: "https://media.licdn.com/dms/image/v2/D4E03AQGv2040i66u9A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1715502476573?e=1743638400&v=beta&t=GqFp08L7V8eN1v-S3E8y8Z0nE19U5WfW-P2-U1Y-Z7k"
    },
    publishedAt: now,
    updatedAt: now
  }, { merge: true });
  
  console.log("✅ Article published successfully with Admin SDK.");
  process.exit(0);
}

publish().catch(err => {
  console.error("🔥 Fatal error:", err);
  process.exit(1);
});
