#!/usr/bin/env npx tsx
/**
 * Active Firebase Storage via l'API REST
 *
 * Usage: npx tsx scripts/enable-firebase-storage.ts
 */

import * as fs from "fs";
import * as path from "path";
import { GoogleAuth } from "google-auth-library";

const PROJECT_ID = "wifirst-tech-blog";
const REGION = "europe-west1";

async function main(): Promise<void> {
  const serviceAccountPath = path.join(process.cwd(), "service-account.json");

  if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ Fichier service-account.json non trouvé");
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

  // Créer le client d'authentification
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/firebase",
    ],
  });

  const client = await auth.getClient();

  console.log("🚀 Activation de Firebase Storage...");

  // Étape 1: Activer l'API Firebase Storage
  console.log("\n1️⃣ Activation de l'API firebasestorage.googleapis.com...");
  try {
    const enableApiUrl = `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/firebasestorage.googleapis.com:enable`;
    const enableRes = await client.request({
      url: enableApiUrl,
      method: "POST",
    });
    console.log("   ✅ API activée ou déjà active");
  } catch (error: any) {
    if (error.code === 400 && error.message?.includes("already enabled")) {
      console.log("   ✅ API déjà activée");
    } else {
      console.log("   ⚠️  Erreur (peut être normal si déjà activé):", error.message);
    }
  }

  // Étape 2: Activer l'API Storage
  console.log("\n2️⃣ Activation de l'API storage.googleapis.com...");
  try {
    const enableStorageUrl = `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/storage.googleapis.com:enable`;
    const enableRes = await client.request({
      url: enableStorageUrl,
      method: "POST",
    });
    console.log("   ✅ API Storage activée ou déjà active");
  } catch (error: any) {
    console.log("   ⚠️  Erreur:", error.message);
  }

  // Étape 3: Créer le bucket par défaut Firebase Storage
  console.log("\n3️⃣ Création/vérification du bucket Firebase Storage...");
  const bucketName = `${PROJECT_ID}.firebasestorage.app`;

  try {
    // Essayer de créer le bucket via l'API Cloud Storage
    const createBucketUrl = `https://storage.googleapis.com/storage/v1/b?project=${PROJECT_ID}`;
    const bucketData = {
      name: bucketName,
      location: REGION.toUpperCase(),
      storageClass: "STANDARD",
      iamConfiguration: {
        uniformBucketLevelAccess: {
          enabled: true,
        },
      },
    };

    const createRes = await client.request({
      url: createBucketUrl,
      method: "POST",
      data: bucketData,
    });
    console.log(`   ✅ Bucket ${bucketName} créé avec succès!`);
  } catch (error: any) {
    if (error.code === 409 || error.message?.includes("already exists")) {
      console.log(`   ✅ Bucket ${bucketName} existe déjà`);
    } else if (error.code === 403) {
      console.log("   ⚠️  Permission refusée. Essayons avec le bucket appspot.com...");

      // Essayer avec le format appspot.com
      const appspotBucket = `${PROJECT_ID}.appspot.com`;
      try {
        const createAppspotUrl = `https://storage.googleapis.com/storage/v1/b?project=${PROJECT_ID}`;
        const appspotData = {
          name: appspotBucket,
          location: REGION.toUpperCase(),
          storageClass: "STANDARD",
        };

        const appspotRes = await client.request({
          url: createAppspotUrl,
          method: "POST",
          data: appspotData,
        });
        console.log(`   ✅ Bucket ${appspotBucket} créé avec succès!`);
      } catch (appspotError: any) {
        if (appspotError.code === 409) {
          console.log(`   ✅ Bucket ${appspotBucket} existe déjà`);
        } else {
          console.log("   ❌ Erreur création appspot bucket:", appspotError.message);
        }
      }
    } else {
      console.log("   ❌ Erreur:", error.message);
      console.log("\n   💡 Vous devez peut-être activer Firebase Storage manuellement:");
      console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/storage`);
    }
  }

  // Étape 4: Lier le bucket à Firebase (addFirebase)
  console.log("\n4️⃣ Liaison du bucket à Firebase...");
  try {
    const addFirebaseUrl = `https://firebasestorage.googleapis.com/v1beta/projects/${PROJECT_ID}/buckets/${bucketName}:addFirebase`;
    const addRes = await client.request({
      url: addFirebaseUrl,
      method: "POST",
    });
    console.log("   ✅ Bucket lié à Firebase");
  } catch (error: any) {
    if (error.code === 409 || error.message?.includes("already")) {
      console.log("   ✅ Bucket déjà lié à Firebase");
    } else {
      console.log("   ⚠️  Erreur:", error.message);
    }
  }

  console.log("\n✅ Configuration terminée!");
  console.log(`\n📦 Bucket: ${bucketName}`);
  console.log(`🔗 URL: https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/`);
}

main().catch((error) => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});
