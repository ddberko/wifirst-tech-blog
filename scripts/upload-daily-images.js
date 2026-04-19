const { Storage } = require('@google-cloud/storage');
const path = require('path');
const storage = new Storage({ keyFilename: 'service-account.json', projectId: 'wifirst-tech-blog' });
const bucket = storage.bucket('wifirst-tech-blog.firebasestorage.app');

const filesToUpload = [
  { local: '/tmp/cisco-ai-factory-cover.png', dest: 'covers/cisco-ai-factory-cover.png' },
  { local: '/tmp/bluefield-dpu-security.png', dest: 'images/bluefield-dpu-security.png' },
  { local: '/tmp/multi-agent-system.png', dest: 'images/multi-agent-system.png' },
  { local: '/tmp/edge-ai-device.png', dest: 'images/edge-ai-device.png' }
];

async function uploadFiles() {
  for (const f of filesToUpload) {
    try {
      const [file] = await bucket.upload(f.local, {
        destination: f.dest,
        public: true,
        metadata: { cacheControl: 'public, max-age=31536000' }
      });
      console.log(`Uploaded ${f.local} to ${f.dest}: https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/${f.dest}`);
    } catch (err) {
      console.error(`Error uploading ${f.local}:`, err);
    }
  }
}

uploadFiles();
