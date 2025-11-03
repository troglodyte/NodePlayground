import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json()).use(cors())

app.get('/health', (_req: Request, res: Response) => res.status(200).send('ok'));

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from backend' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on ${port}`);
});
