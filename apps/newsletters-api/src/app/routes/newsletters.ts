import type { FastifyInstance } from 'fastify';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	isNewsletterData,
	newsletterDataSchema,
	transformDataToLegacyNewsletter,
} from '@newsletters-nx/newsletters-data-client';
import newslettersData from '../../../static/newsletters.local.json';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

export function registerNewsletterRoutes(app: FastifyInstance) {
	// not using the makeSuccess function on this route as
	// we are emulating the response of the legacy API
	app.get('/api/legacy/newsletters', async (req, res) => {
		const newsletters = newslettersData.filter(
			isNewsletterData,
		) as unknown[] as NewsletterData[];

		return newsletters.map(transformDataToLegacyNewsletter);
	});

	app.get('/api/newsletters', async (req, res) => {
		const newsletters = newslettersData.filter(isNewsletterData);
		return makeSuccessResponse(newsletters);
	});

	app.get<{ Params: { newsletterId: string } }>(
		'/api/newsletters/:newsletterId',
		async (req, res) => {
			const { newsletterId } = req.params;
			const newsletter = newslettersData.find(
				(newsletter) => newsletter.identityName === newsletterId,
			);

			const p = newsletterDataSchema.safeParse(newsletter);
			console.log(p);

			if (!newsletter) {
				return res
					.status(404)
					.send(makeErrorResponse(`no match for id ${newsletterId}`));
			}

			return makeSuccessResponse(newsletter);
		},
	);
}
