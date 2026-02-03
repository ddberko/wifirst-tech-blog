#!/usr/bin/env npx tsx
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";
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

async function publish() {
  const articles = [
    {
      slug: "edge-ai-reseau-npu-2026",
      title: "Edge AI Réseau : La Révolution des NPU au Cœur de nos Points d'Accès",
      path: "/Users/davidberkowicz/.openclaw/workspace/posts/edge-ai-reseau-la-revolution-des-npu.md",
      category: "IA",
      tags: ["Edge AI", "NPU", "Qualcomm", "Machine Learning"],
      readTime: 18
    },
    {
      slug: "wifi-7-mlo-deep-dive-2026",
      title: "Wi-Fi 7 Multi-Link Operation (MLO) : la fin du déterminisme aléatoire",
      path: "/Users/davidberkowicz/.openclaw/workspace/posts/wifi-7-mlo-deep-dive.md",
      category: "Wi-Fi",
      tags: ["Wi-Fi 7", "MLO", "MLD", "High Density"],
      readTime: 18
    }
  ];

  for (const art of articles) {
    console.log(`🚀 Publishing: ${art.slug}`);
    const content = fs.readFileSync(art.path, 'utf-8');
    await setDoc(doc(db, "articles", art.slug), {
      slug: art.slug,
      title: art.title,
      content: content,
      excerpt: "Analyse technique approfondie des nouvelles architectures.",
      category: art.category,
      tags: art.tags,
      coverImage: "/images/blog/generic-header.png",
      author: {
        name: "David Berkowicz",
        role: "CTO",
        avatar: "https://ui-avatars.com/api/?name=David+Berkowicz&background=0D8ABC&color=fff"
      },
      readTime: art.readTime,
      publishedAt: Timestamp.now()
    }, { merge: true });
  }
  
  process.exit(0);
}

publish();