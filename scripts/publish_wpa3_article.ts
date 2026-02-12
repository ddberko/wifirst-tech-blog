
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// --- Config
const slug = 'wpa3-securite-ce-qui-change-vraiment';
const projectRoot = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const serviceAccountPath = join(projectRoot, 'service-account.json');
const articleContentPath = join(projectRoot, 'content/wpa3-security-article.md');
// ---

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function publishArticle() {
  console.log(`Publishing article with slug: ${slug}...`);

  try {
    const content = readFileSync(articleContentPath, 'utf8');

    const articleData = {
      slug: slug,
      title: 'Sécurité WPA3 : ce qui change vraiment',
      author: 'David Berkowicz',
      authorId: 'david-berkowicz',
      publishedAt: new Date().toISOString(),
      coverImage: `/images/header-wpa3-security.png`,
      summary: "WPA3 n'est pas un patch, c'est une refonte architecturale de la sécurité Wi-Fi. SAE, PMF, OWE : voici ce qui change vraiment face à WPA2.",
      content: content,
      tags: ['wifi', 'securite', 'wpa3', '802.11', 'cna'],
    };

    await db.collection('posts').doc(slug).set(articleData);

    console.log('✅ Article published successfully to Firestore collection "posts".');
    console.log('Next step: run `npm run build` and `firebase deploy` to see it live.');

  } catch (error) {
    console.error('❌ Error publishing article:', error);
    process.exit(1);
  }
}

publishArticle();
