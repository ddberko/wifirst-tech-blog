#!/usr/bin/env npx tsx
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'service-account.json');
const POSTS_DIR = '/Users/davidberkowicz/.openclaw/workspace/posts';

let db: any;

if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.log('🔐 Using Firebase Admin SDK with Service Account');
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
  db = getFirestore();
} else {
  console.error('❌ Service account key not found at:', SERVICE_ACCOUNT_PATH);
  console.log('Fallback to Client SDK not recommended for automated sync.');
  process.exit(1);
}

async function sync() {
  const articles = [
    {
      slug: "observabilite-reseau-2026-gnmi",
      title: "Observabilité Réseau 2026 : gNMI et Streaming Telemetry pour le Monitoring Haute Fréquence",
      path: path.join(POSTS_DIR, "2026-02-02-observabilite-reseau-2026-gnmi-streaming-telemetry.md"),
      category: "Monitoring",
      tags: ["gNMI", "Streaming Telemetry", "AIOps", "Observability"],
      coverImage: "/images/header-observability-2026.png"
    },
    {
      slug: "5g-vs-wifi-7-industrie-2026",
      title: "5G Privée vs Wi-Fi 7 : Arbitrage et Coexistence en 2026",
      path: path.join(POSTS_DIR, "5g-privee-vs-wifi7-2026.md"),
      category: "Connectivité",
      tags: ["5G Privée", "Wi-Fi 7", "Industrie 4.0", "Handover"],
      coverImage: "/images/5g-wifi7-convergence.png"
    },
    {
      slug: "pqc-2026-migration",
      title: "Cryptographie Post-Quantique (PQC) : Sécuriser les Infrastructures Réseau à l'Aube de 2026",
      path: path.join(POSTS_DIR, "cryptographie-post-quantique-2026.md"),
      category: "Sécurité",
      tags: ["PQC", "Quantum", "Security", "Crypto"],
      coverImage: "/images/pqc-header.png"
    },
    {
      slug: "wifi-7-mlo-deep-dive-2026",
      title: "Wi-Fi 7 (802.11be) : La Révolution MLO et le Futur de la Connectivité Sans Fil",
      path: path.join(POSTS_DIR, "wifi-7-mlo-deep-dive.md"),
      category: "Wi-Fi",
      tags: ["Wi-Fi 7", "MLO", "MLD", "High Density"],
      coverImage: "/images/wifi7-header.png"
    },
    {
      slug: "edge-ai-reseau-npu-2026",
      title: "Edge AI Réseau : La Révolution des NPU au Cœur de nos Points d'Accès",
      path: path.join(POSTS_DIR, "edge-ai-reseau-la-revolution-des-npu.md"),
      category: "IA",
      tags: ["Edge AI", "NPU", "Qualcomm", "Machine Learning"],
      coverImage: "/images/edge_ai_network_header.png"
    },
    {
      slug: "evolution-developpeur-ia-2026",
      title: "L'Évolution du Métier de Développeur à l'Ère de l'IA : De l'Artisan du Code à l'Architecte de Solutions Augmenté",
      path: path.join(POSTS_DIR, "2026-02-02-ia-dev-evolution.md"),
      category: "IA",
      tags: ["IA", "Développement", "Futur", "Software Engineering"],
      coverImage: "/images/ia-dev-header.png"
    }
  ];

  for (const art of articles) {
    if (!fs.existsSync(art.path)) {
      console.error(`❌ File not found: ${art.path}`);
      continue;
    }
    console.log(`🚀 Syncing to Firestore: ${art.slug}`);
    const content = fs.readFileSync(art.path, 'utf-8');
    await db.collection("articles").doc(art.slug).set({
      slug: art.slug,
      title: art.title,
      content: content,
      category: art.category,
      tags: art.tags,
      coverImage: art.coverImage,
      author: {
        name: "David Berkowicz",
        role: "CTO",
        avatar: "https://ui-avatars.com/api/?name=David+Berkowicz&background=0D8ABC&color=fff"
      },
      publishedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });
  }
  
  console.log('✅ All articles synced successfully!');
  process.exit(0);
}

sync();
