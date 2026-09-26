const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: 'service-account.json', projectId: 'wifirst-tech-blog' });
const bucket = storage.bucket('wifirst-tech-blog.firebasestorage.app');

async function upload(localPath, destination) {
  const [file] = await bucket.upload(localPath, {
    destination: destination,
    public: true,
    metadata: { cacheControl: 'public, max-age=31536000' }
  });
  console.log(`URL for ${localPath}:`, file.publicUrl());
}

async function run() {
  await upload('/tmp/schisme-agentique-cover.png', 'covers/schisme-agentique-2026-cover.png');
  await upload('/tmp/agent-symphony.png', 'images/schisme-agentique-symphony.png');
  await upload('/tmp/anthropic-moat.png', 'images/schisme-agentique-moat.png');
  await upload('/tmp/agent-economics.png', 'images/schisme-agentique-economics.png');
}
run().catch(console.error);
