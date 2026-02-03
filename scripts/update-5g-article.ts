#!/usr/bin/env npx tsx
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, Timestamp } from "firebase/firestore";
import * as fs from 'fs';

const app = initializeApp({
  apiKey: "AIzaSyDF7sggsBkCZxl_9IcZP_K7thbsymcqGfE",
  authDomain: "wifirst-tech-blog.firebaseapp.com",
  projectId: "wifirst-tech-blog",
  storageBucket: "wifirst-tech-blog.firebasestorage.app",
  messagingSenderId: "859792971226",
  appId: "1:859792971226:web:18e02c03db7d00c5e95ce3",
});

const db = getFirestore(app);

async function update() {
  const slug = "5g-vs-wifi-7-industrie-2026";
  console.log(`🚀 Updating article: ${slug}`);
  
  const content = fs.readFileSync('posts/5g-privee-vs-wifi7-2026.md', 'utf-8');
  
  try {
    await updateDoc(doc(db, "articles", slug), {
      content: content,
      updatedAt: Timestamp.now(),
      readTime: 15
    });
    console.log("✅ Success: Long-form article published to Firestore.");
  } catch (error) {
    console.error("❌ Error updating article:", error);
    console.log("Attempting setDoc instead...");
    // Fallback if update fails because doc doesn't exist under this slug
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "articles", slug), {
      slug: slug,
      title: "5G Privée vs Wi-Fi 7 : Arbitrage et Coexistence en 2026",
      content: content,
      excerpt: "Analyse approfondie du duel technologique de 2026. Pourquoi le Wi-Fi 7 et la 5G Privée sont complémentaires dans l'Industrie 4.0.",
      category: "Network",
      tags: ["5G", "Wi-Fi 7", "Industrie 4.0", "MLO", "URLLC"],
      coverImage: "/images/header-5g-wifi7.png",
      featured: true,
      author: {
        name: "David Berkowicz",
        role: "CTO",
        avatar: "https://ui-avatars.com/api/?name=David+Berkowicz&background=0D8ABC&color=fff"
      },
      readTime: 15,
      publishedAt: Timestamp.now()
    }, { merge: true });
    console.log("✅ Success: Article created/updated with full metadata.");
  }
  process.exit(0);
}

update();