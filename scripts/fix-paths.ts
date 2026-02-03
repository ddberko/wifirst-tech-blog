#!/usr/bin/env npx tsx
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDF7sggsBkCZxl_9IcZP_K7thbsymcqGfE",
  authDomain: "wifirst-tech-blog.firebaseapp.com",
  projectId: "wifirst-tech-blog",
  storageBucket: "wifirst-tech-blog.firebasestorage.app",
  messagingSenderId: "859792971226",
  appId: "1:859792971226:web:18e02c03db7d00c5e95ce3",
});

const db = getFirestore(app);

async function fixPaths() {
  const snapshot = await getDocs(collection(db, "articles"));
  for (const d of snapshot.docs) {
    const data = d.data();
    if (data.content && data.content.includes("../images/")) {
      console.log(`🛠️ Fixing paths for: ${d.id}`);
      const newContent = data.content.replace(/\.\.\/images\//g, "/images/");
      await updateDoc(doc(db, "articles", d.id), {
        content: newContent
      });
    }
  }
  process.exit(0);
}

fixPaths();