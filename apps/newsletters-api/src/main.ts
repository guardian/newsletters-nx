import fastify from 'fastify';

const app = fastify();

app.get('/api/health', async (req, res) => {
  return { message: 'Hello API' };
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
