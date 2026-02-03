#!/usr/bin/env npx tsx
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp, collection, getDocs } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDF7sggsBkCZxl_9IcZP_K7thbsymcqGfE",
  authDomain: "wifirst-tech-blog.firebaseapp.com",
  projectId: "wifirst-tech-blog",
  storageBucket: "wifirst-tech-blog.firebasestorage.app",
  messagingSenderId: "859792971226",
  appId: "1:859792971226:web:18e02c03db7d00c5e95ce3",
});

const db = getFirestore(app);

async function cleanTitles() {
  const snapshot = await getDocs(collection(db, "articles"));
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    let content = data.content || "";
    const title = data.title || "";

    if (!content) continue;

    console.log(`Checking article: ${docSnap.id}`);

    // Remove Frontmatter
    if (content.startsWith('---')) {
      const endOfFrontmatter = content.indexOf('---', 3);
      if (endOfFrontmatter !== -1) {
        content = content.substring(endOfFrontmatter + 3).trim();
      }
    }

    // Remove first H1 if it matches the title exactly (ignoring case/whitespace)
    // or just remove the first H1 regardless since we already have the title in metadata
    const h1Regex = /^#\s+(.+)$/m;
    const match = content.match(h1Regex);
    
    if (match) {
        console.log(`Found H1: "${match[1]}". Removing it.`);
        content = content.replace(h1Regex, '').trim();
    }

    // Also remove duplicated cover images if they follow the title
    const imgRegex = /^!\[.*\]\(.*\)$/m;
    if (content.match(imgRegex)) {
        console.log("Found leading image, keeping it but ensure no double titles remain.");
    }

    await setDoc(doc(db, "articles", docSnap.id), {
      content: content
    }, { merge: true });
    
    console.log(`✅ Cleaned ${docSnap.id}`);
  }
  
  process.exit(0);
}

cleanTitles();
