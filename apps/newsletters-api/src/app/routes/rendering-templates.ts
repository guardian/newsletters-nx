import type { FastifyInstance } from 'fastify';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

export type RenderingTemplate = {
	id: string;
	status: string;
	title: string;
};

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
}
