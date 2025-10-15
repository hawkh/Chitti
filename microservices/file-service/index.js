const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const sharp = require('sharp');
const amqp = require('amqplib');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

let channel;
amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost').then(conn => {
  return conn.createChannel();
}).then(ch => {
  channel = ch;
  return channel.assertQueue('detection-queue', { durable: true });
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const processed = await sharp(req.file.buffer).resize(640, 640, { fit: 'inside' }).toBuffer();
    
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: `uploads/${Date.now()}-${req.file.originalname}`,
      Body: processed,
      ContentType: req.file.mimetype
    };
    
    const result = await s3.upload(params).promise();
    
    channel.sendToQueue('detection-queue', Buffer.from(JSON.stringify({
      fileUrl: result.Location,
      fileKey: result.Key,
      userId: req.body.userId
    })), { persistent: true });
    
    res.json({ success: true, url: result.Location, key: result.Key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3002, () => console.log('File service on 3002'));
