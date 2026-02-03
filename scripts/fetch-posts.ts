import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { writeFileSync } from 'fs';
import { join } from 'path';

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function fetchPosts() {
  console.log('Fetching posts from Firestore...');
  const snapshot = await db.collection('posts').orderBy('publishedAt', 'desc').get();
  
  const posts = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      slug: data.slug || doc.id,
      title: data.title || 'Untitled',
      excerpt: data.excerpt || '',
      content: data.content || '',
      coverImage: data.coverImage || '',
      category: data.category || 'Uncategorized',
      tags: data.tags || [],
      author: data.author || { name: 'Wifirst Team', role: 'Contributor', avatar: '' },
      featured: data.featured || false,
      publishedAt: data.publishedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.publishedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  });

  console.log(`Fetched ${posts.length} posts`);
  
  const outputPath = join(__dirname, '../src/data/posts.json');
  writeFileSync(outputPath, JSON.stringify(posts, null, 2));
  console.log(`Written to ${outputPath}`);
  
  process.exit(0);
}

fetchPosts();
