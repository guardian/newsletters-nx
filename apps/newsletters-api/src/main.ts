import Fastify from 'fastify';
import { isNewsletter } from '@newsletters-nx/newsletters-data-client';
import newslettersData from '../static/newsletters.prod.json';
import { makeErrorResponse, makeSuccessResponse } from './app/responses';

const app = Fastify();

/** Health check endpoint */
app.get('/healthcheck', () => {
	console.log('====> Health check endpoint called');
	return {
		message: 'Newsletters API running',
	};
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
		const options = {
			port: 3000,

			/**
			 * 0.0.0.0 so that we listen on every network interface.
			 * This is essential for running the app within AWS.
			 *
			 * See:
			 *   - https://www.fastify.io/docs/latest/Reference/Server/#listen
			 * 	 - https://serverfault.com/questions/78048/whats-the-difference-between-ip-address-0-0-0-0-and-127-0-0-1
			 */
			host: '0.0.0.0'
		}

		console.log(`Starting newsletters-api server on http://${options.host}:${options.port}`);
		await app.listen(options);
	} catch (err) {
		// Errors are logged here
		console.error(err);
		process.exit(1);
	}
};

/* eslint-disable-next-line -- intentionally asynchronous */
start();
