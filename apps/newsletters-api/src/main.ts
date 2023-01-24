import Fastify from 'fastify';
import {
	isNewsletter,
	newslettersDataClient,
} from '@newsletters-nx/newsletters-data-client';
import liveNewslettersData from '../static/newsletters.live.json';

const app = Fastify();

app.get('/health', async () => {
	return Promise.resolve({
		message: 'Hello API',
		stringFromLib: newslettersDataClient(),
	});
});

app.get('/v1/newsletters', async (req, res) => {
	const parsedLive = liveNewslettersData.filter(isNewsletter);
	return parsedLive;
});

const start = async () => {
	try {
		console.log('Starting newsletters-api server on http://localhost:3000');
		await app.listen({ port: 3000 });
	} catch (err) {
		// Errors are logged here
		console.error(err);
		process.exit(1);
	}
};

// This is just to please eslint for now. We should think about a more concrete solution!
start()
	.then(() => console.log('Running'))
	.catch((err) => console.error(err));
