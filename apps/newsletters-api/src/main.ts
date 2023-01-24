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

app.get('/v1/newsletters/detail/:id', async (req, res) => {
	//to Check Fastify docs for how best to parse req.params
	const params = req.params as Record<string, unknown> | undefined;
	console.log(params);

	if (
		params &&
		'id' in params &&
		typeof params.id === 'string' &&
		params.id.length > 0
	) {

		const parsedLive = liveNewslettersData.filter(isNewsletter);
		const match = parsedLive.find(newsletter => newsletter.identityName === params.id)

		if (!match) {
			return res.status(404).send({ ok: false, message: `no match for id ${params.id}` })
		}

		return match;
	}

	return res.status(400).send({ ok: false, message: 'no id!' });
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
