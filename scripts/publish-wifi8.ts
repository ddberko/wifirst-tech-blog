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

async function publish() {
  const art = {
    slug: "wifi-8-802-11bn-uhr-explications",
    title: "Wi-Fi 8 (802.11bn) : Pourquoi la vitesse n'est plus la priorité",
    path: "/Users/davidberkowicz/.openclaw/workspace/posts/2026-02-02-wifi-8-uhr-deep-dive.md",
    category: "Wi-Fi",
    tags: ["Wi-Fi 8", "802.11bn", "UHR", "Infrastructure"],
    coverImage: "/images/wifi8-header.png",
    excerpt: "Le Wi-Fi 8 arrive avec une promesse radicale : oublier la course aux Gbps pour se concentrer sur l'Ultra High Reliability (UHR). Découvrez comment cette norme va révolutionner la stabilité des réseaux denses."
  };

  if (!fs.existsSync(art.path)) {
    console.error(`❌ File not found: ${art.path}`);
    process.exit(1);
  }

  console.log(`🚀 Publishing (Admin) to Firestore: ${art.slug}`);
  let content = fs.readFileSync(art.path, 'utf-8');
  
  // Safety check: remove any leading H1 that might have slipped in
  content = content.replace(/^# .*\n+/, "");
  
  const now = admin.firestore.Timestamp.now();

  await db.collection("articles").doc(art.slug).set({
    slug: art.slug,
    title: art.title,
    excerpt: art.excerpt,
    content: content,
    category: art.category,
    tags: art.tags,
    coverImage: art.coverImage,
    featured: false,
    author: {
      name: "David Berkowicz",
      role: "CTO",
      avatar: "https://media.licdn.com/dms/image/v2/D4E03AQGv2040i66u9A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1715502476573?e=1743638400&v=beta&t=GqFp08L7V8eN1v-S3E8y8Z0nE19U5WfW-P2-U1Y-Z7k"
    },
    publishedAt: now,
    updatedAt: now
  }, { merge: true });
  
  console.log("✅ Article published successfully.");
  process.exit(0);
}

publish().catch(err => {
  console.error("🔥 Fatal error:", err);
  process.exit(1);
});
