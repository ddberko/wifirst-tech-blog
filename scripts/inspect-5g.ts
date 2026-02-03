#!/usr/bin/env npx tsx
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDF7sggsBkCZxl_9IcZP_K7thbsymcqGfE",
  authDomain: "wifirst-tech-blog.firebaseapp.com",
  projectId: "wifirst-tech-blog",
  storageBucket: "wifirst-tech-blog.firebasestorage.app",
  messagingSenderId: "859792971226",
  appId: "1:859792971226:web:18e02c03db7d00c5e95ce3",
});

const db = getFirestore(app);

async function inspect() {
  const slug = "5g-vs-wifi-7-industrie-2026";
  const snap = await getDoc(doc(db, "articles", slug));
  if (snap.exists()) {
    console.log(JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("Not found");
  }
  process.exit(0);
}

inspect();