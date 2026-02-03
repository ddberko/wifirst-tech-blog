const fs = require('fs');

const postsPath = '/Users/davidberkowicz/Projects/wifirst-tech-blog/src/data/posts.json';
const data = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

const cleanData = data.map(post => {
  let content = post.content;
  // Remove YAML frontmatter if present
  if (content.trim().startsWith('---')) {
    // Regex to match from first --- to second ---
    content = content.replace(/^---[\s\S]*?---/, '').trim();
  }
  return { ...post, content };
});

fs.writeFileSync(postsPath, JSON.stringify(cleanData, null, 2));
console.log('Frontmatter cleaned from posts.json');
