import Fastify from 'fastify';
import { isNewsletter } from '@newsletters-nx/newsletters-data-client';
import newslettersData from '../static/newsletters.prod.json';
import { makeErrorResponse, makeSuccessResponse } from './app/responses';

const app = Fastify();

/** Health check endpoint at root */
app.get('/', async () => {
	return Promise.resolve({
		message: 'Newsletters API running',
	});
});

// not using the makeSuccess function on this route as
// we are emulating the response of the legacy API
app.get('/newsletters', async (req, res) => {
	const newsletters = newslettersData.filter(isNewsletter);
	return newsletters;
});

app.get('/v1/newsletters', async (req, res) => {
	const newsletters = newslettersData.filter(isNewsletter);
	return makeSuccessResponse(newsletters);
});

app.get<{ Params: { newsletterId: string } }>(
	'/v1/newsletters/:newsletterId',
	async (req, res) => {
		const { newsletterId } = req.params;
		const newsletter = newslettersData
			.filter(isNewsletter)
			.find((newsletter) => newsletter.identityName === newsletterId);

		if (!newsletter) {
			return res
				.status(404)
				.send(makeErrorResponse(`no match for id ${newsletterId}`));
		}

		return makeSuccessResponse(newsletter);
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
