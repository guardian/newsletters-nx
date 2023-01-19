import fastify from 'fastify';
import {
  newslettersDataClient,
  isNewsletter,
} from '@newsletters-nx/newsletters-data-client';
import liveNewslettersData from '../static/newsletters.live.json';

const app = fastify();

app.get('/api/health', async (req, res) => {
  return { message: 'Hello API', stringFromLib: newslettersDataClient() };
});

app.get('/v1/newsletters', async (req, res) => {
  const parsedLive = liveNewslettersData.filter(isNewsletter);
  return parsedLive;
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
