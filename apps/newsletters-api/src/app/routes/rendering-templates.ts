import type { FastifyInstance } from 'fastify';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { newsletterStore } from '../../services/storage';
import {
	makeErrorResponse,
	makeSuccessResponse,
	mapStorageFailureReasonToStatusCode,
} from '../responses';

export type RenderingTemplate = {
	id: string;
	status: string;
	title: string;
};

const NEWSLETTER_RENDER_URL =
	'http://localhost:3010/data-article/render-template';

const TEMPLATES_LIST_URL =
	'https://email-rendering.guardianapis.com/info/templates/';

export function registerRenderingTemplatesRoutes(app: FastifyInstance) {
	app.get('/api/rendering-templates', async (req, res) => {
		const fetchResponse = await fetch(TEMPLATES_LIST_URL);
		if (!fetchResponse.ok) {
			return res
				.status(500)
				.send(
					makeErrorResponse(
						'Failed to get list of templates from the email-rendering service.',
					),
				);
		}

		const body = (await fetchResponse.json()) as RenderingTemplate[];
		return makeSuccessResponse(body);
	});

	app.get<{ Params: { newsletterId: string } }>(
		'/api/rendering-templates/preview/:newsletterId',
		async (req, res) => {
			const { newsletterId } = req.params;
			const storageResponse = await newsletterStore.readByName(newsletterId);

			if (!storageResponse.ok) {
				return res
					.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
					.send(makeErrorResponse(storageResponse.message));
			}

			const emailRenderingResponse = await fetch(NEWSLETTER_RENDER_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(storageResponse.data),
			});

			const content = await emailRenderingResponse.text();
			return makeSuccessResponse({ content });
		},
	);

	app.post<{ Body: NewsletterData }>(
		'/api/rendering-templates/preview',
		async (req) => {
			const emailRenderingResponse = await fetch(NEWSLETTER_RENDER_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(req.body),
			});

			const content = await emailRenderingResponse.text();
			return makeSuccessResponse({ content });
		},
	);
}
