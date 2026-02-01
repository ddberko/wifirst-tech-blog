#!/usr/bin/env npx tsx
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDF7sggsBkCZxl_9IcZP_K7thbsymcqGfE",
  authDomain: "wifirst-tech-blog.firebaseapp.com",
  projectId: "wifirst-tech-blog",
  storageBucket: "wifirst-tech-blog.firebasestorage.app",
  messagingSenderId: "859792971226",
  appId: "1:859792971226:web:18e02c03db7d00c5e95ce3",
});

const db = getFirestore(app);

async function main() {
  const slug = "bienvenue-sur-le-blog-tech-wifirst";
  const now = Timestamp.now();
  
  await setDoc(doc(db, "posts", slug), {
    slug,
    title: "Bienvenue sur le Blog Tech Wifirst",
    excerpt: "Découvrez les coulisses techniques de Wifirst : réseau, Wi-Fi, sécurité et innovation.",
    content: `# Bienvenue sur le Blog Tech Wifirst

Chez **Wifirst**, nous connectons des milliers de sites à travers la France. Ce blog est l'endroit où notre équipe technique partage ses retours d'expérience, ses innovations et ses bonnes pratiques.

## Ce que vous trouverez ici

- **Architecture réseau** : comment nous concevons et déployons nos infrastructures
- **Wi-Fi & LAN** : optimisation, monitoring, troubleshooting
- **Sécurité** : nos approches pour protéger les réseaux de nos clients
- **DevOps & Outils** : les outils que nous construisons en interne

## Notre mission

Fournir une connectivité fiable, performante et sécurisée à nos clients B2B. Chaque jour, nos équipes relèvent de nouveaux défis techniques que nous partagerons ici.

*Stay tuned!*`,
    coverImage: "",
    category: "General",
    tags: ["wifirst", "blog", "network"],
    author: "David Berkowicz",
    featured: true,
    publishedAt: now,
    updatedAt: now,
  });

  console.log("✅ Post créé !");
  process.exit(0);
}

main().catch(console.error);
