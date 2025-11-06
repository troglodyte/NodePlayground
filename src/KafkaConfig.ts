import { Kafka, Producer, Admin } from 'kafkajs';
import 'dotenv/config';

export class KafkaConfig {
  private static instance: KafkaConfig;
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly admin: Admin;

  private constructor() {
    this.kafka = new Kafka({
      clientId: 'my-app',
      brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
  }

  public static getInstance(): KafkaConfig {
    if (!KafkaConfig.instance) {
      KafkaConfig.instance = new KafkaConfig();
    }
    return KafkaConfig.instance;
  }

  public getProducer(): Producer {
    return this.producer;
  }

  public getAdmin(): Admin {
    return this.admin;
  }

  public getKafka(): Kafka {
    return this.kafka;
  }
}
