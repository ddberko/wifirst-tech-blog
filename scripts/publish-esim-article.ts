import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { Storage } from '@google-cloud/storage';
import { readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

const ARTICLE: any = {
  slug: "esim-iot-sgp32-isim-provisioning-b2b-2026",
  title: "eSIM IoT (SGP.32) et iSIM : La Révolution du Provisioning Cellulaire B2B et l'Adieu aux Cartes SIM Physiques en 2026",
  excerpt: "En 2026, l'architecture SGP.32 et les puces iSIM sonnent le glas de la SIM physique. Découvrez comment l'In-Factory Profile Provisioning et l'eIM redéfinissent la connectivité IoT pour les infrastructures B2B massives.",
  category: "Infrastructure",
  tags: ["esim", "iot", "sgp32", "isim", "sgp41", "b2b", "infrastructure", "5g", "ltem", "nbiot", "wifirst", "m2m", "provisioning", "gsma", "2026"],
  readTime: 12,
  coverImage: "https://firebasestorage.googleapis.com/v0/b/wifirst-tech-blog.firebasestorage.app/o/images%2Fesim-iot-cover.jpg?alt=media",
  contentFile: "/tmp/article-draft.md",
  analysis: {
    "technicalScore": 10,
    "editorialScore": 10,
    "factCheckPassed": true,
    "comment": "L'article est d'une qualité technique et rédactionnelle exceptionnelle. Il présente une vision extrêmement précise et pertinente de l'état des technologies eSIM/iSIM (SGP.32, SGP.41/42) en mars 2026. Les analyses des défis passés, des architectures actuelles et des cas d'usage sont rigoureuses. La prise en compte des évolutions réglementaires (NIS 2, Cyber Resilience Act) et des défis sécuritaires est particulièrement appréciable. Aucune inexactitude technique ou factuelle n'a été relevée, même les projections sont réalistes et bien argumentées pour la période."
  }
};

const AUTHOR = {
  name: 'David Berkowicz',
  role: 'CTO @ Wifirst',
  avatar: 'https://ui-avatars.com/api/?name=David+Berkowicz&background=0D8ABC&color=fff'
};

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const SERVICE_ACCOUNT_PATH = join(PROJECT_ROOT, 'service-account.json');
const BUCKET_NAME = 'wifirst-tech-blog.firebasestorage.app';

async function uploadCoverImage(localPath: string, slug: string): Promise<string> {
  const fullLocalPath = join(PROJECT_ROOT, 'public', localPath);
  if (!existsSync(fullLocalPath)) {
    console.warn(`⚠️  Image locale non trouvée: ${fullLocalPath}. On continue sans upload.`);
    return localPath;
  }
  const storage = new Storage({ keyFilename: SERVICE_ACCOUNT_PATH });
  const bucket = storage.bucket(BUCKET_NAME);
  const destination = `covers/${slug}-${basename(localPath)}`;
  await bucket.upload(fullLocalPath, {
    destination,
    public: true,
    metadata: { cacheControl: 'public, max-age=31536000' }
  });
  return `https://storage.googleapis.com/${BUCKET_NAME}/${destination}`;
}

async function main() {
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: BUCKET_NAME
  });
  const db = getFirestore();

  let finalCoverImageUrl = ARTICLE.coverImage;
  if (finalCoverImageUrl.startsWith('/images/')) {
     finalCoverImageUrl = await uploadCoverImage(finalCoverImageUrl, ARTICLE.slug);
  }

  const contentPath = ARTICLE.contentFile;
  let content: string;
  try {
    content = readFileSync(contentPath, 'utf8');
    const wordCount = content.trim().split(/\s+/).length;
    console.log('✅ Contenu lu:', contentPath, `(${content.length} caractères, ~${wordCount} mots)`);
    
    if (wordCount < 1800) {
      console.error(`❌ ERREUR : L'article est trop court (${wordCount} mots). Le minimum requis est de 1800 mots.`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Erreur lecture contenu:', error);
    process.exit(1);
  }

  const now = Timestamp.now();
  const articleData = {
    slug: ARTICLE.slug,
    title: ARTICLE.title,
    excerpt: ARTICLE.excerpt,
    content: content,
    category: ARTICLE.category,
    tags: ARTICLE.tags,
    readTime: ARTICLE.readTime,
    coverImage: finalCoverImageUrl,
    author: AUTHOR,
    publishedAt: now,
    updatedAt: now,
    status: 'published',
    ...(ARTICLE.analysis ? { analysis: ARTICLE.analysis } : {})
  };

  try {
    await db.collection('articles').doc(ARTICLE.slug).set(articleData, { merge: true });
    console.log('✅ Article publié/mis à jour sur Firestore (collection: articles)');
  } catch (error) {
    console.error('❌ Erreur Firestore:', error);
    process.exit(1);
  }

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
