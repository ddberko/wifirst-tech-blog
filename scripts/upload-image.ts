#!/usr/bin/env npx tsx
/**
 * Upload une image vers Firebase Storage
 * Usage: npx tsx scripts/upload-image.ts <local-path> [remote-name]
 *
 * Exemple:
 *   npx tsx scripts/upload-image.ts public/images/test.png
 *   npx tsx scripts/upload-image.ts ./photo.jpg custom-name.jpg
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import * as fs from "fs";
import * as path from "path";

// Format du bucket Firebase Storage
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

const storage = getStorage();
const bucket = storage.bucket();

/**
 * Upload un fichier vers Firebase Storage et retourne l'URL publique
 */
export async function uploadImage(localPath: string, remoteName?: string): Promise<string> {
  // Vérifier que le fichier existe
  if (!fs.existsSync(localPath)) {
    throw new Error(`Fichier non trouvé: ${localPath}`);
  }

  // Déterminer le nom du fichier dans Storage
  const fileName = remoteName || path.basename(localPath);
  const destination = `images/${fileName}`;

  // Déterminer le content-type
  const ext = path.extname(fileName).toLowerCase();
  const contentTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  const contentType = contentTypes[ext] || "application/octet-stream";

  console.log(`📤 Upload de ${localPath} vers ${destination}...`);

  // Upload du fichier
  await bucket.upload(localPath, {
    destination,
    metadata: {
      contentType,
      cacheControl: "public, max-age=31536000",
    },
  });

  // Construire l'URL publique
  const encodedPath = encodeURIComponent(destination);
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodedPath}?alt=media`;

  console.log(`✅ Upload réussi !`);
  console.log(`🔗 URL: ${publicUrl}`);

  return publicUrl;
}

// Exécution en CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: npx tsx scripts/upload-image.ts <local-path> [remote-name]");
    console.log("");
    console.log("Exemples:");
    console.log("  npx tsx scripts/upload-image.ts public/images/test.png");
    console.log("  npx tsx scripts/upload-image.ts ./photo.jpg custom-name.jpg");
    process.exit(1);
  }

  const localPath = args[0];
  const remoteName = args[1];

  try {
    const url = await uploadImage(localPath, remoteName);
    console.log("");
    console.log("Pour utiliser cette image dans un article:");
    console.log(`  coverImage: "${url}"`);
  } catch (error) {
    console.error("❌ Erreur:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
