import express, { Request, Response } from 'express';
import cors from 'cors';
import { Kafka, logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
  logLevel: logLevel.DEBUG, // Enable debug logging to see what's happening
  retry: {
    initialRetryTime: 300,
    retries: 8
  },
  connectionTimeout: 10000,
  requestTimeout: 30000
});

const producer = kafka.producer();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json()).use(cors());

// Connect producer once at startup
let producerConnected = false;

const connectProducer = async () => {
  if (!producerConnected) {
    try {
      console.log('🔌 Connecting to Kafka at localhost:9092...');
      await producer.connect();
      producerConnected = true;
      console.log('✅ Kafka producer connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect Kafka producer:');
      console.error(error);
      throw error;
    }
  }
};

// Try to connect on startup (non-blocking)
connectProducer().catch(err => {
  console.error('⚠️ Initial Kafka connection failed, will retry on first message');
});

app.get('/health', (_req: Request, res: Response) => res.status(200).send('ok'));

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from backend' });
});

app.post('/api/kafka/message', async (req: Request, res: Response) => {
  try {
    // Ensure producer is connected
    await connectProducer();
    
    const message = JSON.stringify(req.body);
    console.log('📤 Sending message to Kafka:', message);
    
    const result = await producer.send({
      topic: 'test-topic',
      messages: [
        { 
          value: message,
          timestamp: Date.now().toString()
        }
      ],
    });

    const topicMetadata = await admin.fetchTopicMetadata({ topics: [topic] });

    if (!topicMetadata.topics[0]) {
      console.log(`Topic '${topic}' not found.`);
      return;
    }
    
    console.log('✅ Message sent successfully:', result);
    res.json({ 
      success: true,
      message: 'Message sent successfully',
      metadata: result
    });
  } catch (error) {
    console.error('❌ Failed to send message to Kafka:');
    console.error(error);
    
    // Reset connection flag to retry next time
    producerConnected = false;
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log('🛑 Shutting down...');
  if (producerConnected) {
    try {
      await producer.disconnect();
      console.log('✅ Kafka producer disconnected');
    } catch (error) {
      console.error('Error disconnecting producer:', error);
    }
  }
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Backend listening on ${port}`);
  console.log(`📡 Kafka broker: localhost:9092`);
});