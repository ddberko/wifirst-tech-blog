const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: 'service-account.json', projectId: 'wifirst-tech-blog' });
const bucket = storage.bucket('wifirst-tech-blog.firebasestorage.app');

async function uploadFile(localPath, destination) {
  try {
    const [file] = await bucket.upload(localPath, {
      destination: destination,
      public: true,
      metadata: { cacheControl: 'public, max-age=31536000' }
    });
    console.log(`Uploaded ${localPath} to ${file.publicUrl()}`);
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error);
  }
}

async function main() {
  await uploadFile('/tmp/seb-cover.png', 'covers/secure-enterprise-browser-sase-cover.png');
  await uploadFile('/tmp/seb-inline1.png', 'images/secure-enterprise-browser-inline1.png');
  await uploadFile('/tmp/seb-inline2.png', 'images/secure-enterprise-browser-inline2.png');
  await uploadFile('/tmp/seb-inline3.png', 'images/secure-enterprise-browser-inline3.png');
}

main();