const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: './service-account.json', projectId: 'wifirst-tech-blog' });
const bucket = storage.bucket('wifirst-tech-blog.firebasestorage.app');

async function uploadImages() {
  const images = [
    { src: '/tmp/cover-stanford-2026.png', dest: 'covers/stanford-ai-index-2026-cover.png' },
    { src: '/tmp/inline-cyber-2026.png', dest: 'images/stanford-ai-index-2026-cyber.png' },
    { src: '/tmp/inline-energy-2026.png', dest: 'images/stanford-ai-index-2026-energy.png' },
    { src: '/tmp/inline-code-2026.png', dest: 'images/stanford-ai-index-2026-code.png' },
  ];

  for (const img of images) {
    try {
      const [file] = await bucket.upload(img.src, {
        destination: img.dest,
        public: true,
        metadata: { cacheControl: 'public, max-age=31536000' }
      });
      console.log(`URL for ${img.dest}:`, file.publicUrl());
    } catch (e) {
      console.error(`Failed to upload ${img.src}:`, e);
    }
  }
}

uploadImages();