import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = '/Users/davidberkowicz/Projects/wifirst-tech-blog';
const sa = JSON.parse(readFileSync(join(PROJECT_ROOT, 'service-account.json'), 'utf8'));
initializeApp({ credential: cert(sa) });

const slug = process.argv[2];
if (!slug) { console.error('Usage: npx tsx update-article-content.ts <slug>'); process.exit(1); }

const contentPath = join(PROJECT_ROOT, 'content', slug.replace(/-claude-code-codex-gemini$/, '') + '.md');

async function main() {
  const db = getFirestore();
  const content = readFileSync(contentPath, 'utf8');
  
  const ref = db.collection('articles').doc(slug);
  const doc = await ref.get();
  if (!doc.exists) { console.error('Article not found:', slug); process.exit(1); }
  
  await ref.update({
    content,
    updatedAt: new Date(),
  });
  
  console.log(`✅ Updated "${doc.data()!.title}"`);
  console.log(`   Content: ${content.length} chars from ${contentPath}`);
}

main().catch(console.error);
