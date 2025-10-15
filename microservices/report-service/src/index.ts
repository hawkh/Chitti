import express from 'express';
import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';

const app = express();
const prisma = new PrismaClient();
let channel: amqp.Channel;

async function connectRabbitMQ() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
  channel = await conn.createChannel();
  await channel.assertQueue('report-generation', { durable: true });
  
  channel.consume('report-generation', async (msg) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString());
      await generateReport(data);
      channel.ack(msg);
    }
  });
}

async function generateReport(data: any) {
  const detections = await prisma.detection.findMany({ where: { userId: data.userId } });
  const doc = new PDFDocument();
  doc.text(`Report for ${data.userId}`);
  doc.text(`Total Detections: ${detections.length}`);
  await prisma.report.create({ data: { userId: data.userId, type: 'PDF', status: 'completed' } });
}

app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.post('/generate', async (req, res) => {
  channel.sendToQueue('report-generation', Buffer.from(JSON.stringify(req.body)));
  res.json({ status: 'queued' });
});

const PORT = process.env.PORT || 3003;
connectRabbitMQ().then(() => app.listen(PORT, () => console.log(`Report service on ${PORT}`)));
