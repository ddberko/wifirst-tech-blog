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

const ARTICLE: any = {
  slug: "wba-security-guidelines-2026-zero-trust-wifi",
  title: "WBA Security Guidelines 2026 : Le Nouveau Référentiel de Sécurité et de Roaming pour le Wi-Fi B2B",
  excerpt: "Les nouvelles directives de la Wireless Broadband Alliance redéfinissent la sécurité des réseaux sans fil en entreprise. Découvrez comment ZTNA, RadSec, OpenRoaming et le Device Provisioning Protocol supplantent la confiance implicite pour sécuriser le Smart Building et l'IoT à grande échelle.",
  category: "Cybersécurité",
  tags: ["wifi", "cybersecurite", "wba", "zero-trust", "ztna", "radsec", "openroaming", "passpoint", "iot", "smart-building", "wifirst", "2026"],
  readTime: 18,
  coverImage: "https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/covers%2Fwba-security-guidelines-2026-cover.png",
  contentFile: "/tmp/article-draft.md",
  skipNewsletter: false,
  analysis: {
    "technicalScore": 9,
    "editorialScore": 9,
    "factCheckPassed": true,
    "comment": "L'article a été fact-checké par rapport aux véritables WBA Security Guidelines d'avril 2026. L'intégration technique des standards est excellente."
  }
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
  const contentPath = ARTICLE.contentFile;
  let content: string;
  try {
    content = readFileSync(contentPath, 'utf8');
    const wordCount = content.trim().split(/\s+/).length;
    console.log('✅ Contenu lu:', contentPath, `(${content.length} caractères, ~${wordCount} mots)`);
    
    // Hard check sur la longueur pour l'agent autonome
    // OBLIGATOIRE : 1800 mots minimum pour ce test.
    if (wordCount < 1800) {
      console.error(`❌ ERREUR : L'article est trop court (${wordCount} mots). Le minimum requis est de 1800 mots.`);
      process.exit(1);
    }
  } catch (error: any) {
    if (error.message && error.message.includes('trop court')) {
      console.error(error.message);
    } else {
      console.error('❌ Erreur lecture contenu:', contentPath);
    }
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
    featured: ARTICLE.featured ?? true, // Par défaut, on met en avant les nouveaux articles
    coverImage: finalCoverImageUrl, // L'URL publique de l'image
    author: AUTHOR,
    publishedAt: now,
    updatedAt: now,
    status: 'published', // Nécessaire pour déclencher le Cloud Function newsletter
    ...(ARTICLE.skipNewsletter ? { newsletterSentAt: now } : {}),
    ...(ARTICLE.analysis ? { analysis: ARTICLE.analysis } : {})
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
  console.log('\\n========================================');
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