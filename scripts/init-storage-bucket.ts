#!/usr/bin/env npx tsx
/**
 * Initialise le bucket Firebase Storage si nécessaire
 *
 * Usage: npx tsx scripts/init-storage-bucket.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import * as fs from "fs";
import * as path from "path";

const BUCKET_NAME = "wifirst-tech-blog.firebasestorage.app";

// Initialisation Firebase Admin
if (getApps().length === 0) {
  const serviceAccountPath = path.join(process.cwd(), "service-account.json");

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
  } else {
    console.error("❌ Fichier service-account.json non trouvé");
    process.exit(1);
  }
}

const storage = getStorage();

async function main(): Promise<void> {
  console.log(`🔍 Vérification du bucket: ${BUCKET_NAME}`);

  const bucket = storage.bucket();

  try {
    const [exists] = await bucket.exists();
    if (exists) {
      console.log("✅ Le bucket existe déjà");

      // Lister quelques fichiers pour confirmer
      const [files] = await bucket.getFiles({ maxResults: 5 });
      console.log(`\n📁 Fichiers existants (max 5):`);
      for (const file of files) {
        console.log(`   - ${file.name}`);
      }
    } else {
      console.log("⚠️  Le bucket n'existe pas");
      console.log("\nPour activer Firebase Storage:");
      console.log("1. Allez sur https://console.firebase.google.com/project/wifirst-tech-blog/storage");
      console.log("2. Cliquez sur 'Get Started'");
      console.log("3. Choisissez les règles de sécurité (Production mode recommandé)");
      console.log("4. Sélectionnez une région (europe-west1 recommandé)");
      console.log("5. Cliquez sur 'Done'");
      console.log("\nEnsuite relancez ce script pour vérifier.");
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (errorMsg.includes("does not exist") || errorMsg.includes("404")) {
      console.log("⚠️  Le bucket n'existe pas ou Firebase Storage n'est pas activé");
      console.log("\nPour activer Firebase Storage:");
      console.log("1. Allez sur https://console.firebase.google.com/project/wifirst-tech-blog/storage");
      console.log("2. Cliquez sur 'Get Started'");
      console.log("3. Choisissez les règles de sécurité (Production mode recommandé)");
      console.log("4. Sélectionnez une région (europe-west1 recommandé)");
      console.log("5. Cliquez sur 'Done'");
    } else {
      console.error("❌ Erreur:", errorMsg);
    }
  }
}

main();
