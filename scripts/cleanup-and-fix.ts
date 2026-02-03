#!/usr/bin/env npx tsx
import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc, updateDoc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDF7sggsBkCZxl_9IcZP_K7thbsymcqGfE",
  authDomain: "wifirst-tech-blog.firebaseapp.com",
  projectId: "wifirst-tech-blog",
  storageBucket: "wifirst-tech-blog.firebasestorage.app",
  messagingSenderId: "859792971226",
  appId: "1:859792971226:web:18e02c03db7d00c5e95ce3",
});

const db = getFirestore(app);

async function cleanup() {
  const toDelete = [
    "edge-ai-reseau-2026",
    "observabilite-reseau-2026-gnmi-streaming-telemetry",
    "pqc-standards-2026",
    "test-title" // just in case
  ];

  for (const id of toDelete) {
    console.log(`🗑️ Deleting old version: ${id}`);
    try {
      await deleteDoc(doc(db, "articles", id));
    } catch (e) { console.error(e); }
  }

  // Update cover images to real ones
  const updates = [
    { id: "edge-ai-reseau-npu-2026", cover: "/images/cover_edge_ai.png" },
    { id: "wifi-7-mlo-deep-dive-2026", cover: "/images/wifi7-header.png" },
    { id: "pqc-2026-migration", cover: "/images/2026-02-02-pqc.png" },
    { id: "observabilite-reseau-2026-gnmi", cover: "/images/header-observability-2026.png" },
    { id: "5g-vs-wifi-7-industrie-2026", cover: "/images/header-5g-wifi7.png" }
  ];

  for (const item of updates) {
    console.log(`🖼️ Updating cover for: ${item.id}`);
    await updateDoc(doc(db, "articles", item.id), {
      coverImage: item.cover
    });
  }

  process.exit(0);
}

cleanup();