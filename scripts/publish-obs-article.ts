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
  const slug = "observabilite-reseau-2026-gnmi";
  console.log(`🚀 Publishing article: ${slug}`);
  
  const content = fs.readFileSync('posts/2026-02-02-observabilite-reseau-2026-gnmi-streaming-telemetry.md', 'utf-8');
  
  await setDoc(doc(db, "articles", slug), {
    slug: slug,
    title: "L'Observabilité Réseau en 2026 : Pourquoi le SNMP est mort et comment gNMI redéfinit le futur",
    content: content,
    excerpt: "Plongée dans gNMI et le Streaming Telemetry pour le monitoring haute fréquence (2M métriques/min). État de l'art et architectures 2026.",
    category: "Observability",
    tags: ["gNMI", "gRPC", "Telemetry", "Monitoring", "OpenConfig"],
    coverImage: "/images/header-observability-2026.png",
    featured: false,
    author: {
      name: "David Berkowicz",
      role: "CTO",
      avatar: "https://ui-avatars.com/api/?name=David+Berkowicz&background=0D8ABC&color=fff"
    },
    readTime: 12,
    publishedAt: Timestamp.now()
  }, { merge: true });
  
  console.log("✅ Success: Observability article published.");
  process.exit(0);
}

publish();