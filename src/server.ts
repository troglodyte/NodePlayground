import express, { Request, Response } from 'express';
import cors from 'cors';
import { Kafka } from 'kafkajs';
import { KafkaConfig } from './KafkaConfig';

const kafka: Kafka = KafkaConfig.getInstance().getKafka();
const producer = kafka.producer();
const app = express();
const port = Number(process.env.PORT ?? 3000);
app.use(express.json()).use(cors())


app.get('/health', (_req: Request, res: Response) => res.status(200).send('ok'));

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from backend' });
});

app.get('/api/kafka/count', async (_req: Request, res: Response) => {
  try {
    const admin = kafka.admin();
    await admin.connect();
    const topicOffsets = await admin.fetchTopicOffsets('test-topic');
    const messageCount = topicOffsets.reduce(
      (sum, partition) =>
        sum + (Number(partition.high) - Number(partition.low)),
      0,
    );
    await admin.disconnect();
    res.json({ count: messageCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get message count' });
  }
});

app.post('/api/kafka/message', async (req: Request, res: Response) => {
  try {
    await producer.connect();
    await producer.send({
      topic: 'test-topic',
      messages: [{ value: JSON.stringify(req.body) }],
    });
    await producer.disconnect();
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on ${port}`);
});

export default app;
