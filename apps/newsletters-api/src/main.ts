import fastify from 'fastify';
import { newslettersDataClient } from '@newsletters-nx/newsletters-data-client';

const app = fastify();

app.get('/api/health', async (req, res) => {
  return { message: 'Hello API', stringFromLib: newslettersDataClient() };
});

const start = async () => {
  try {
    console.log('Starting API...on http://localhost:3000');
    await app.listen({ port: 3000 });
  } catch (err) {
    // Errors are logged here
    process.exit(1);
  }
};

start();
