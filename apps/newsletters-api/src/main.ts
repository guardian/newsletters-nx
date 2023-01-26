import Fastify from 'fastify';
import {
	isNewsletter,
	newslettersDataClient,
} from '@newsletters-nx/newsletters-data-client';
import liveNewslettersData from '../static/newsletters.live.json';
import { makeError, makeSuccess } from './app/responses';

const app = Fastify();

app.get('/health', async () => {
	return Promise.resolve({
		message: 'Hello API',
		stringFromLib: newslettersDataClient(),
	});
});

// not using the makeSuccess function on this route as
// we are emulating the response of the legacy API
app.get('/newsletters', async (req, res) => {
	const newsletters = liveNewslettersData.filter(isNewsletter);
	return newsletters;
});

app.get('/v1/newsletters', async (req, res) => {
	const newsletters = liveNewslettersData.filter(isNewsletter);
	return makeSuccess({ newsletters });
});

app.get<{ Params: { newsletterId: string } }>(
	'/v1/newsletters/:newsletterId',
	async (req, res) => {
		const { newsletterId } = req.params;
		if (newsletterId.length === 0) {
			return res.status(400).send(makeError('no identity name', 400));
		}

		const parsedLive = liveNewslettersData.filter(isNewsletter);
		const newsletter = parsedLive.find(
			(newsletter) => newsletter.identityName === newsletterId,
		);

		if (!newsletter) {
			return res
				.status(404)
				.send(makeError(`no match for id ${newsletterId}`, 404));
		}

		return makeSuccess({ newsletter });
	},
);

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
