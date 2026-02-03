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
  const slug = "pqc-2026-migration";
  console.log(`🚀 Publishing article: ${slug}`);
  
  const content = fs.readFileSync('/Users/davidberkowicz/.openclaw/workspace/posts/cryptographie-post-quantique-2026.md', 'utf-8');
  
  await setDoc(doc(db, "articles", slug), {
    slug: slug,
    title: "Cryptographie Post-Quantique (PQC) : Pourquoi 2026 est l'année de la bascule",
    content: content,
    excerpt: "NIST, ANSSI et Apple PQ3 : comment nous préparons l'infrastructure Wifirst à la menace quantique. Guide technique de migration.",
    category: "Security",
    tags: ["PQC", "Security", "Crypto", "Quantum", "TLS"],
    coverImage: "/images/blog/article-pqc-header.png", // Fallback path if custom image not mapped
    featured: false,
    author: {
      name: "David Berkowicz",
      role: "CTO",
      avatar: "https://ui-avatars.com/api/?name=David+Berkowicz&background=0D8ABC&color=fff"
    },
    readTime: 18,
    publishedAt: Timestamp.now()
  }, { merge: true });
  
  console.log("✅ Success: PQC article published.");
  process.exit(0);
}

publish();