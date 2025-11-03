import express, { Request, Response } from 'express';
import cors from 'cors';
import { Kafka } from 'kafkajs';



const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json()).use(cors())

app.get('/health', (_req: Request, res: Response) => res.status(200).send('ok'));

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from backend' });
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
