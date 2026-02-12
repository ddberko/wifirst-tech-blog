#!/usr/bin/env npx tsx
/**
 * Migration des images de public/images/ vers Firebase Storage
 *
 * Ce script :
 * 1. Upload toutes les images de public/images/ vers Firebase Storage
 * 2. Met à jour les documents Firestore pour pointer vers les nouvelles URLs
 * 3. Affiche un rapport de migration
 *
 * Usage: npx tsx scripts/migrate-images-to-storage.ts [--dry-run]
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as fs from "fs";
import * as path from "path";

// Format du bucket Firebase Storage (nouveau format recommandé)
// L'ancien format serait: wifirst-tech-blog.appspot.com
const BUCKET_NAME = process.env.STORAGE_BUCKET || "wifirst-tech-blog.firebasestorage.app";
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), "public", "images");

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

const db = getFirestore();
const storage = getStorage();
const bucket = storage.bucket();

interface MigrationReport {
  imagesUploaded: { file: string; url: string }[];
  imagesSkipped: { file: string; reason: string }[];
  documentsUpdated: { collection: string; docId: string; field: string; oldValue: string; newValue: string }[];
  errors: { step: string; error: string }[];
}

const report: MigrationReport = {
  imagesUploaded: [],
  imagesSkipped: [],
  documentsUpdated: [],
  errors: [],
};

/**
 * Retourne le content-type basé sur l'extension
 */
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  return contentTypes[ext] || "application/octet-stream";
}

/**
 * Construit l'URL publique Firebase Storage
 */
function buildStorageUrl(filename: string): string {
  const encodedPath = encodeURIComponent(`images/${filename}`);
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodedPath}?alt=media`;
}

/**
 * Vérifie si un fichier existe déjà dans Storage
 */
async function fileExistsInStorage(filename: string): Promise<boolean> {
  try {
    const [exists] = await bucket.file(`images/${filename}`).exists();
    return exists;
  } catch {
    return false;
  }
}

/**
 * Upload une image vers Firebase Storage
 */
async function uploadImage(localPath: string, filename: string, dryRun: boolean): Promise<string> {
  const destination = `images/${filename}`;
  const contentType = getContentType(filename);
  const publicUrl = buildStorageUrl(filename);

  if (dryRun) {
    console.log(`  [DRY-RUN] Uploadrait ${filename} vers ${destination}`);
    return publicUrl;
  }

  await bucket.upload(localPath, {
    destination,
    metadata: {
      contentType,
      cacheControl: "public, max-age=31536000",
    },
  });

  return publicUrl;
}

/**
 * Upload toutes les images du dossier public/images/
 */
async function uploadAllImages(dryRun: boolean): Promise<Map<string, string>> {
  const urlMapping = new Map<string, string>(); // old path -> new URL

  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    console.error(`❌ Dossier ${PUBLIC_IMAGES_DIR} non trouvé`);
    return urlMapping;
  }

  const files = fs.readdirSync(PUBLIC_IMAGES_DIR);
  const imageFiles = files.filter((f) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f));

  console.log(`\n📁 Trouvé ${imageFiles.length} images dans public/images/\n`);

  for (const file of imageFiles) {
    const localPath = path.join(PUBLIC_IMAGES_DIR, file);
    const oldPath = `/images/${file}`;

    try {
      // Vérifier si le fichier existe déjà dans Storage
      const exists = await fileExistsInStorage(file);
      if (exists && !dryRun) {
        console.log(`  ⏭️  ${file} - déjà présent dans Storage`);
        report.imagesSkipped.push({ file, reason: "Déjà présent dans Storage" });
        urlMapping.set(oldPath, buildStorageUrl(file));
        continue;
      }

      // Upload
      const newUrl = await uploadImage(localPath, file, dryRun);
      urlMapping.set(oldPath, newUrl);

      console.log(`  ✅ ${file} → Storage`);
      report.imagesUploaded.push({ file, url: newUrl });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ ${file} - Erreur: ${errorMsg}`);
      report.errors.push({ step: `Upload ${file}`, error: errorMsg });
    }
  }

  return urlMapping;
}

/**
 * Met à jour les documents Firestore avec les nouvelles URLs
 */
async function updateFirestoreDocuments(
  urlMapping: Map<string, string>,
  dryRun: boolean
): Promise<void> {
  const collections = ["posts", "articles"];

  for (const collectionName of collections) {
    console.log(`\n📚 Mise à jour de la collection '${collectionName}'...`);

    try {
      const snapshot = await db.collection(collectionName).get();

      if (snapshot.empty) {
        console.log(`  (collection vide ou inexistante)`);
        continue;
      }

      console.log(`  Trouvé ${snapshot.size} documents`);

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const updates: Record<string, string> = {};

        // Vérifier coverImage
        if (data.coverImage && typeof data.coverImage === "string") {
          const oldPath = data.coverImage;
          if (oldPath.startsWith("/images/") && urlMapping.has(oldPath)) {
            const newUrl = urlMapping.get(oldPath)!;
            updates.coverImage = newUrl;
          }
        }

        // Vérifier d'autres champs image potentiels
        const imageFields = ["image", "thumbnail", "headerImage", "featuredImage"];
        for (const field of imageFields) {
          if (data[field] && typeof data[field] === "string") {
            const oldPath = data[field];
            if (oldPath.startsWith("/images/") && urlMapping.has(oldPath)) {
              const newUrl = urlMapping.get(oldPath)!;
              updates[field] = newUrl;
            }
          }
        }

        // Appliquer les mises à jour
        if (Object.keys(updates).length > 0) {
          for (const [field, newValue] of Object.entries(updates)) {
            const oldValue = data[field];
            if (dryRun) {
              console.log(`  [DRY-RUN] ${doc.id}: ${field}`);
              console.log(`    Ancien: ${oldValue}`);
              console.log(`    Nouveau: ${newValue}`);
            } else {
              await doc.ref.update({ [field]: newValue });
              console.log(`  ✅ ${doc.id}: ${field} mis à jour`);
            }
            report.documentsUpdated.push({
              collection: collectionName,
              docId: doc.id,
              field,
              oldValue,
              newValue,
            });
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Erreur collection ${collectionName}: ${errorMsg}`);
      report.errors.push({ step: `Collection ${collectionName}`, error: errorMsg });
    }
  }
}

/**
 * Affiche le rapport final
 */
function printReport(dryRun: boolean): void {
  console.log("\n" + "=".repeat(60));
  console.log(dryRun ? "📋 RAPPORT DE SIMULATION (DRY-RUN)" : "📋 RAPPORT DE MIGRATION");
  console.log("=".repeat(60));

  console.log(`\n📤 Images uploadées: ${report.imagesUploaded.length}`);
  for (const img of report.imagesUploaded) {
    console.log(`   - ${img.file}`);
  }

  console.log(`\n⏭️  Images ignorées: ${report.imagesSkipped.length}`);
  for (const img of report.imagesSkipped) {
    console.log(`   - ${img.file} (${img.reason})`);
  }

  console.log(`\n📝 Documents mis à jour: ${report.documentsUpdated.length}`);
  for (const doc of report.documentsUpdated) {
    console.log(`   - ${doc.collection}/${doc.docId}: ${doc.field}`);
  }

  if (report.errors.length > 0) {
    console.log(`\n❌ Erreurs: ${report.errors.length}`);
    for (const err of report.errors) {
      console.log(`   - ${err.step}: ${err.error}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  if (dryRun) {
    console.log("💡 Exécutez sans --dry-run pour appliquer les changements");
  } else {
    console.log("✅ Migration terminée !");
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("🚀 Migration des images vers Firebase Storage");
  console.log(`   Bucket: ${BUCKET_NAME}`);
  console.log(`   Mode: ${dryRun ? "DRY-RUN (simulation)" : "PRODUCTION"}`);

  // Étape 1: Upload des images
  console.log("\n" + "-".repeat(40));
  console.log("ÉTAPE 1: Upload des images");
  console.log("-".repeat(40));
  const urlMapping = await uploadAllImages(dryRun);

  // Étape 2: Mise à jour Firestore
  console.log("\n" + "-".repeat(40));
  console.log("ÉTAPE 2: Mise à jour Firestore");
  console.log("-".repeat(40));
  await updateFirestoreDocuments(urlMapping, dryRun);

  // Rapport final
  printReport(dryRun);

  process.exit(report.errors.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});
