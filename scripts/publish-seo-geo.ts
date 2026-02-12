/**
 * Script de publication : SEO → GEO Evolution
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ============================================================================
// CONFIG
// ============================================================================

const ARTICLE = {
  slug: 'seo-geo-evolution-ia-2026',
  title: 'Du SEO au GEO : Comment Optimiser Votre Site pour les Moteurs de Recherche IA',
  excerpt: 'AI Overviews, GEO, LLMO : l\'IA transforme les règles du SEO. Du zero-click aux nouvelles métriques, guide complet pour adapter sa stratégie de visibilité en 2026.',
  category: 'Marketing',
  tags: ['seo', 'geo', 'ia', 'llmo', 'ai-overviews', 'google', 'chatgpt', 'perplexity', 'eeat', 'marketing-digital'],
  readTime: 10,
  coverImage: 'https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/covers/seo-geo-evolution.png',
  contentFile: 'content/seo-geo-evolution.md',
};

const AUTHOR = {
  name: 'David Berkowicz',
  role: 'CTO @ Wifirst',
  avatar: 'https://ui-avatars.com/api/?name=David+Berkowicz&background=0D8ABC&color=fff'
};

// ============================================================================
// SCRIPT
// ============================================================================

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');

async function main() {
  console.log('🚀 Publication de l\'article...\n');
  
  // Vérifications
  if (!existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ service-account.json non trouvé');
    process.exit(1);
  }
  
  const contentPath = join(PROJECT_ROOT, ARTICLE.contentFile);
  if (!existsSync(contentPath)) {
    console.error(`❌ Fichier content non trouvé: ${contentPath}`);
    process.exit(1);
  }
  
  // Init Firebase
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
  initializeApp({
    credential: cert(serviceAccount),
  });
  
  const db = getFirestore();
  const content = readFileSync(contentPath, 'utf-8');
  
  // Document Firestore
  const articleData = {
    slug: ARTICLE.slug,
    title: ARTICLE.title,
    content: content,
    excerpt: ARTICLE.excerpt,
    author: AUTHOR,
    publishedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    category: ARTICLE.category,
    tags: ARTICLE.tags,
    coverImage: ARTICLE.coverImage,
    readTime: ARTICLE.readTime,
  };
  
  console.log('📝 Données article:');
  console.log(`   Slug: ${ARTICLE.slug}`);
  console.log(`   Titre: ${ARTICLE.title}`);
  console.log(`   Catégorie: ${ARTICLE.category}`);
  console.log(`   Cover: ${ARTICLE.coverImage}`);
  console.log(`   Contenu: ${content.length} caractères\n`);
  
  // Publication
  await db.collection('articles').doc(ARTICLE.slug).set(articleData);
  
  console.log('✅ Article publié avec succès !');
  console.log(`🔗 URL: https://wifirst-tech-blog.web.app/post?slug=${ARTICLE.slug}`);
}

main().catch(console.error);
