const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { PubSub } = require('@google-cloud/pubsub');
const sharp = require('sharp');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const pubsub = new PubSub({
  projectId: process.env.GCP_PROJECT_ID
});

const bucket = storage.bucket(process.env.GCS_BUCKET || 'chitti-ndt-storage');
const topic = pubsub.topic('file-processing');

app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file' });

    const processed = await sharp(file.buffer).resize(640, 640).toBuffer();
    const filename = `uploads/${Date.now()}-${file.originalname}`;
    const blob = bucket.file(filename);

    await blob.save(processed, {
      contentType: file.mimetype,
      metadata: { cacheControl: 'public, max-age=31536000' }
    });

    await topic.publishMessage({
      json: { filename, userId: req.body.userId }
    });

    res.json({ fileId: filename, status: 'queued' });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/download/:filename(*)', async (req, res) => {
  try {
    const file = bucket.file(req.params.filename);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    file.createReadStream().pipe(res);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`File service (GCP Native) on ${PORT}`));
