import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';

// Mock KafkaConfig to avoid real Kafka connections during tests
vi.mock('../src/KafkaConfig', () => {
  const producer = {
    connect: vi.fn().mockResolvedValue(undefined),
    send: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
  const admin = {
    connect: vi.fn().mockResolvedValue(undefined),
    fetchTopicOffsets: vi
      .fn()
      .mockResolvedValue([{ high: '5', low: '2' }]), // => count = 3
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
  const kafka = {
    producer: () => producer,
    admin: () => admin,
  };
  class KafkaConfig {
    static getInstance() {
      return new KafkaConfig();
    }
    getKafka() {
      return kafka as any;
    }
  }
  return { KafkaConfig };
});

let app: any;

beforeAll(async () => {
  // Use an ephemeral port so importing server doesn't collide with dev server
  process.env.PORT = '0';
  const mod = await import('../src/server');
  app = mod.default;
});

describe('Kafka API Endpoints', () => {
  it('POST /api/kafka/message', async () => {
    const response = await request(app)
      .post('/api/kafka/message')
      .send({ message: 'test message' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });

  it('GET /api/kafka/count', async () => {
    const response = await request(app).get('/api/kafka/count');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('count');
    expect(typeof response.body.count).toBe('number');
  });
});