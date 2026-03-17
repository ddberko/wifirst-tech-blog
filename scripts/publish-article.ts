/**
 * Script de publication d'article pour Wifirst Tech Blog
 *
 * Usage:
 *   cd /Users/davidberkowicz/Projects/wifirst-tech-blog
 *   NODE_PATH=./node_modules npx tsx scripts/publish-article.ts
 *
 * Modifier les variables dans la section CONFIG ci-dessous avant exécution.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { Storage } from '@google-cloud/storage';
import { readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

// ============================================================================
// CONFIG - À MODIFIER POUR CHAQUE ARTICLE
// ============================================================================

const ARTICLE = {
  slug: "rtwt-l4s-wifi7-2026",
  title: "Wi-Fi 7 rTWT & L4S : la latence déterministe enfin accessible pour l'entreprise",
  excerpt: "Le combo rTWT (Restricted TWT) et L4S transforme le Wi-Fi 7 en réseau déterministe. Fini le best-effort : slots réservés, DualQ et ECN ouvrent la porte à la XR, la robotique industrielle et le temps réel. Le point sur ce changement de paradigme.",
  category: "Infrastructure",
  tags: ["wifi-7", "rtwt", "l4s", "latence", "determinisme", "networking", "enterprise", "qos", "xr", "industrie-40", "wifirst"],
  readTime: 10,
  coverImage: "https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/covers%2Frtwt-l4s-wifi7-cover.png",
  contentFile: "content/rtwt-l4s-wifi7-2026.md",
};

const AUTHOR = {
  name: 'David Berkowicz',
  role: 'CTO @ Wifirst',
  avatar: 'https://ui-avatars.com/api/?name=David+Berkowicz&background=0D8ABC&color=fff'
};

// ============================================================================
// SCRIPT - NE PAS MODIFIER (MAINTENANT AVEC UPLOAD STORAGE)
// ============================================================================

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');
const BUCKET_NAME = 'wifirst-tech-blog.firebasestorage.app'; // Nom du bucket de Firebase Storage

/**
 * Upload a local file to Firebase Storage and return its public URL.
 * Assumes service-account.json has Storage Object Admin permissions.
 */
async function uploadCoverImage(localPath: string, slug: string): Promise<string> {
  const fullLocalPath = join(PROJECT_ROOT, 'public', localPath); // Les images sont dans /public
  if (!existsSync(fullLocalPath)) {
    console.warn(`⚠️  Image locale non trouvée: ${fullLocalPath}. On continue sans upload.`);
    return localPath; // Retourne le chemin original si le fichier n'existe pas
  }

  console.log(`📤 Upload de l'image de couverture sur Firebase Storage...`);
  const storage = new Storage({
    keyFilename: SERVICE_ACCOUNT_PATH,
    projectId: 'wifirst-tech-blog',
  });

  const bucket = storage.bucket(BUCKET_NAME);
  // Chemin dans le bucket: ex. covers/energie-reseaux-telecom-2026-header-energie-telecom.png
  const destination = `covers/${slug}-${basename(localPath)}`;

  const [file] = await bucket.upload(fullLocalPath, {
    destination: destination,
    public: true, // Rendre le fichier public
    metadata: {
      cacheControl: 'public, max-age=31536000', // Cache pour 1 an
    },
  });

  const publicUrl = file.publicUrl();
  console.log(`✅ Image uploadée: ${publicUrl}`);
  return publicUrl;
}

async function main() {
  console.log('🚀 Publication de l\'article:', ARTICLE.slug);

  // Init Firebase Admin (pour Firestore et Storage)
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: BUCKET_NAME // Indiquer le bucket de Storage pour le SDK Admin
  });
  const db = getFirestore();

  // --- Gérer l'image de couverture ---
  let finalCoverImageUrl = ARTICLE.coverImage;
  // Si le chemin est local (commence par /images/...), on l'upload sur Storage
  if (finalCoverImageUrl.startsWith('/images/')) {
     finalCoverImageUrl = await uploadCoverImage(finalCoverImageUrl, ARTICLE.slug);
  }
  // Si déjà uploadé manuellement, utiliser l'URL Storage directe
  if (finalCoverImageUrl === 'already-uploaded') {
     finalCoverImageUrl = 'https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/covers/wifi-sensing-cover.png';
  }

  // Lire le contenu markdown
  const contentPath = join(PROJECT_ROOT, ARTICLE.contentFile);
  let content: string;
  try {
    content = readFileSync(contentPath, 'utf8');
    console.log('✅ Contenu lu:', contentPath, `(${content.length} caractères)`);
  } catch (error) {
    console.error('❌ Erreur lecture contenu:', contentPath);
    process.exit(1);
  }

  // Construire le document pour Firestore
  const now = Timestamp.now();
  const articleData = {
    slug: ARTICLE.slug,
    title: ARTICLE.title,
    excerpt: ARTICLE.excerpt,
    content: content,
    category: ARTICLE.category,
    tags: ARTICLE.tags,
    readTime: ARTICLE.readTime,
    coverImage: finalCoverImageUrl, // L'URL publique de l'image
    author: AUTHOR,
    publishedAt: now,
    updatedAt: now,
    status: 'published', // Nécessaire pour déclencher le Cloud Function newsletter
  };

  // Publier sur Firestore (utilise merge: true pour ne pas écraser les champs non définis)
  try {
    await db.collection('articles').doc(ARTICLE.slug).set(articleData, { merge: true });
    console.log('✅ Article publié/mis à jour sur Firestore (collection: articles)');
  } catch (error) {
    console.error('❌ Erreur Firestore:', error);
    process.exit(1);
  }

  // Résumé de publication
  console.log('\n========================================');
  console.log('📝 PUBLICATION RÉUSSIE');
  console.log('========================================');
  console.log('Slug:', ARTICLE.slug);
  console.log('Titre:', ARTICLE.title);
  console.log('Image de couverture:', finalCoverImageUrl);
  console.log('');
  console.log('🔗 URL de l\'article:', `https://wifirst-tech-blog.web.app/post?slug=${ARTICLE.slug}`);
  console.log('========================================');
}

main().catch(console.error);
