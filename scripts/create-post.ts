#!/usr/bin/env npx tsx
/**
 * Create a blog post in Firestore.
 * Usage: npx tsx scripts/create-post.ts --slug my-post --title "My Post" --excerpt "..." --content "# Hello" --category Network --author "David B." [--tags "wifi,lan"] [--featured]
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (serviceAccount) {
  initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
} else {
  // Use ADC or project default
  initializeApp({ projectId: "wifirst-tech-blog" });
}

const db = getFirestore();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const slug = arg("slug");
  const title = arg("title");
  const excerpt = arg("excerpt");
  const content = arg("content");
  const category = arg("category");
  let authorRaw = arg("author");
  let author: any = authorRaw;
  
  try {
    if (authorRaw?.startsWith("{")) {
      author = JSON.parse(authorRaw);
    } else {
      author = {
        name: authorRaw || "David Berkowicz",
        role: "CTO",
        avatar: "https://media.licdn.com/dms/image/v2/D4E03AQGv2040i66u9A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1715502476573?e=1743638400&v=beta&t=GqFp08L7V8eN1v-S3E8y8Z0nE19U5WfW-P2-U1Y-Z7k"
      };
    }
  } catch (e) {
    author = { name: authorRaw, role: "Author", avatar: "" };
  }

  const tags = arg("tags")?.split(",").map((t) => t.trim()) || [];
  const featured = process.argv.includes("--featured");

  if (!slug || !title || !excerpt || !content || !category || !author) {
    console.error("Missing required args: --slug --title --excerpt --content --category --author");
    process.exit(1);
  }

  const now = Timestamp.now();
  await db.collection("articles").doc(slug).set({
    slug, title, excerpt, content, coverImage: arg("coverImage") || "",
    category, tags, author, featured, publishedAt: now, updatedAt: now,
  });

  console.log(`✅ Post "${title}" created at slug: ${slug}`);
}

main().catch(console.error);
