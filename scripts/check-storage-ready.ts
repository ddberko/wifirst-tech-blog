#!/usr/bin/env npx tsx
/**
 * Vérifie si Firebase Storage est prêt et guide l'utilisateur
 *
 * Usage: npx tsx scripts/check-storage-ready.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import * as fs from "fs";
import * as path from "path";

const BUCKET_NAME = process.env.STORAGE_BUCKET || "wifirst-tech-blog.firebasestorage.app";

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

async function main(): Promise<void> {
  console.log("🔍 Vérification de Firebase Storage...\n");
  console.log(`   Bucket: ${BUCKET_NAME}`);

  const storage = getStorage();
  const bucket = storage.bucket();

  try {
    // Tenter un upload de test minimal
    const testFile = bucket.file("__storage_test__");
    await testFile.save("test", {
      contentType: "text/plain",
      metadata: { cacheControl: "no-cache" },
    });

    // Supprimer le fichier de test
    await testFile.delete();

    console.log("\n✅ Firebase Storage est prêt !");
    console.log("\n📋 Commandes disponibles:");
    console.log("   npm run migrate-images:dry  # Simulation de la migration");
    console.log("   npm run migrate-images      # Exécuter la migration");
    console.log("   npm run upload-image <path> # Uploader une image");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (errorMsg.includes("does not exist") || errorMsg.includes("404")) {
      console.log("\n❌ Firebase Storage n'est pas encore activé.\n");
      console.log("📋 Pour activer Firebase Storage:");
      console.log("   1. Allez sur: https://console.firebase.google.com/project/wifirst-tech-blog/storage");
      console.log("   2. Cliquez sur 'Get Started'");
      console.log("   3. Choisissez 'Start in production mode' (recommandé)");
      console.log("   4. Sélectionnez la région: europe-west1");
      console.log("   5. Cliquez sur 'Done'\n");
      console.log("🔄 Après activation, relancez:");
      console.log("   npx tsx scripts/check-storage-ready.ts");
      process.exit(1);
    } else {
      console.error("\n❌ Erreur:", errorMsg);
      process.exit(1);
    }
  }
}

main();
