#!/usr/bin/env npx tsx
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDF7sggsBkCZxl_9IcZP_K7thbsymcqGfE",
  authDomain: "wifirst-tech-blog.firebaseapp.com",
  projectId: "wifirst-tech-blog",
  storageBucket: "wifirst-tech-blog.firebasestorage.app",
  messagingSenderId: "859792971226",
  appId: "1:859792971226:web:18e02c03db7d00c5e95ce3",
});

const db = getFirestore(app);

async function list() {
  const snapshot = await getDocs(collection(db, "articles"));
  console.log(`Found ${snapshot.size} articles:`);
  snapshot.forEach(doc => {
    console.log(`- ID: ${doc.id} | Slug field: ${doc.data().slug} | Title: ${doc.data().title}`);
  });
  process.exit(0);
}

list();