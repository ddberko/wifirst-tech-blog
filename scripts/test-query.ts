#!/usr/bin/env npx tsx
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, limit } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDF7sggsBkCZxl_9IcZP_K7thbsymcqGfE",
  authDomain: "wifirst-tech-blog.firebaseapp.com",
  projectId: "wifirst-tech-blog",
  storageBucket: "wifirst-tech-blog.firebasestorage.app",
  messagingSenderId: "859792971226",
  appId: "1:859792971226:web:18e02c03db7d00c5e95ce3",
});

const db = getFirestore(app);

async function test() {
  const slugs = [
    "edge-ai-reseau-npu-2026",
    "5g-vs-wifi-7-industrie-2026",
    "observabilite-reseau-2026-gnmi",
    "wifi-7-mlo-deep-dive-2026",
    "pqc-2026-migration"
  ];
  for (const slug of slugs) {
    console.log(`Checking slug: ${slug}`);
    const q = query(collection(db, "articles"), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log(`❌ NOT FOUND: ${slug}`);
    } else {
      console.log(`✅ FOUND: ${slug} - Title: ${snapshot.docs[0].data().title}`);
    }
  }
  process.exit(0);
}

test();
