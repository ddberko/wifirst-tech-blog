import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDF7sggsBkCZxl_9IcZP_K7thbsymcqGfE",
  authDomain: "wifirst-tech-blog.firebaseapp.com",
  projectId: "wifirst-tech-blog",
  storageBucket: "wifirst-tech-blog.firebasestorage.app",
  messagingSenderId: "859792971226",
  appId: "1:859792971226:web:18e02c03db7d00c5e95ce3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log("Checking collection 'articles'...");
  const snapshot = await getDocs(collection(db, "articles"));
  console.log(`Size: ${snapshot.size}`);
  snapshot.docs.forEach(d => console.log(` - ${d.id}: ${d.data().title}`));
  
  console.log("\nChecking collection 'posts'...");
  const snapshot2 = await getDocs(collection(db, "posts"));
  console.log(`Size: ${snapshot2.size}`);
}

check().catch(console.error);
