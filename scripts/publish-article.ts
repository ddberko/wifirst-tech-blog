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
  slug: 'cisco-live-emea-2026-ai-native-infrastructure',
  title: 'Cisco Live EMEA 2026 : les 5 annonces qui redéfinissent l\'infrastructure réseau',
  excerpt: 'Silicon One G300 à 102,4 Tbps, AgenticOps, AI Defense, cryptographie post-quantique, Nexus One unifié : décryptage des 5 annonces majeures de Cisco Live Amsterdam et ce qu\'elles changent pour les opérateurs.',
  category: 'Infrastructure',
  tags: ['cisco', 'ai', 'networking', 'silicon-one', 'agenticops', 'pqc', 'liquid-cooling', 'datacenter', 'cisco-live'],
  readTime: 12,
  coverImage: 'https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/covers/cisco-live-emea-2026-ai-native.png',
  contentFile: 'content/cisco-live-emea-2026-ai-native.md',
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
