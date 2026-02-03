import fs from 'fs';
import path from 'path';

const postsPath = '/Users/davidberkowicz/Projects/wifirst-tech-blog/src/data/posts.json';
const data = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

const cleanData = data.map((post: any) => {
  let content = post.content;
  // Remove YAML frontmatter if present
  if (content.startsWith('---')) {
    const parts = content.split('---');
    if (parts.length >= 3) {
      // Keep everything after the second ---
      content = parts.slice(2).join('---').trim();
    }
  }
  return { ...post, content };
});

fs.writeFileSync(postsPath, JSON.stringify(cleanData, null, 2));
console.log('Frontmatter cleaned from posts.json');
