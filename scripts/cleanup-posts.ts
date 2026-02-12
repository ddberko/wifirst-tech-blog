import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";

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
  const snapshot = await getDocs(collection(db, "posts"));
  console.log(`Cleaning up ${snapshot.size} posts...`);
  
  for (const postDoc of snapshot.docs) {
    const data = postDoc.data();
    const updates: any = {};
    
    // 1. Fix publishedAt
    if (!data.publishedAt && data.date) {
      console.log(`- Setting publishedAt for ${postDoc.id} from date ${data.date}`);
      updates.publishedAt = Timestamp.fromDate(new Date(data.date));
    } else if (!data.publishedAt) {
      console.log(`- Setting publishedAt for ${postDoc.id} to NOW`);
      updates.publishedAt = Timestamp.now();
    }
    
    // 2. Fix category
    if (!data.category) {
      console.log(`- Setting category for ${postDoc.id}`);
      updates.category = data.tags?.[0] || "Networking";
    }
    
    // 3. Fix featured
    if (data.featured === undefined) {
      updates.featured = false;
    }
    
    // 4. Fix author object
    if (typeof data.author === 'string') {
      console.log(`- Normalizing author for ${postDoc.id}`);
      updates.author = {
        name: data.author,
        role: "Engineer",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.author)}&background=random`
      };
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, "posts", postDoc.id), updates);
    }
  }
  
  console.log("Cleanup complete!");
  process.exit(0);
}

cleanup();
