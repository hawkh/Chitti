import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import amqp from 'amqplib';
import sharp from 'sharp';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || ''
  }
});

let channel: amqp.Channel;

async function connectRabbitMQ() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
  channel = await conn.createChannel();
  await channel.assertQueue('file-processing', { durable: true });
}

app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file' });

    const processed = await sharp(file.buffer).resize(640, 640).toBuffer();
    const key = `uploads/${Date.now()}-${file.originalname}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || 'chitti-ndt',
      Key: key,
      Body: processed,
      ContentType: file.mimetype
    }));

    channel.sendToQueue('file-processing', Buffer.from(JSON.stringify({ key, userId: req.body.userId })));
    res.json({ fileId: key, status: 'queued' });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/download/:key', async (req, res) => {
  try {
    const data = await s3.send(new GetObjectCommand({
      Bucket: process.env.S3_BUCKET || 'chitti-ndt',
      Key: req.params.key
    }));
    data.Body?.pipe(res);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

const PORT = process.env.PORT || 3002;
connectRabbitMQ().then(() => app.listen(PORT, () => console.log(`File service on ${PORT}`)));
