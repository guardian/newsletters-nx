import type { FastifyInstance } from 'fastify';
import { isNewsletter } from '@newsletters-nx/newsletters-data-client';
import newslettersData from '../../../static/newsletters.prod.json';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

export function registerNewsletterRoutes(app: FastifyInstance) {
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
}