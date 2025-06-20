import { Express } from 'express';
import type {
	EmailRenderingOutput,
} from '@newsletters-nx/newsletters-data-client';
import { getEmailRenderingHost } from '../../apiDeploymentSettings';
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

const emailRenderingHost = getEmailRenderingHost();
const NEWSLETTER_RENDER_URL = `${emailRenderingHost}/data-article/render-template.json`;
const TEMPLATES_LIST_URL = `${emailRenderingHost}/info/templates/`;

export function registerRenderingTemplatesRoutes(app: Express) {
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
		return res.send(makeSuccessResponse(body));
	});

	app.get<{ newsletterId: string }>(
		'/api/rendering-templates/preview/:newsletterId',
		async (req, res) => {
			const { newsletterId } = req.params;
			const storageResponse = await newsletterStore.readByName(newsletterId);

			if (!storageResponse.ok) {
				return res
					.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
					.send(makeErrorResponse(storageResponse.message));
			}

			try {
				const emailRenderingResponse = await fetch(NEWSLETTER_RENDER_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(storageResponse.data),
				});

				const emailRenderingJson =
					(await emailRenderingResponse.json()) as EmailRenderingOutput;
				return res.send(makeSuccessResponse(emailRenderingJson));
			} catch (fetchFail) {
				return res.status(500).send(makeErrorResponse('Failed to fetch from email rendering'))
			}
		},
	);

	app.post(
		'/api/rendering-templates/preview',
		async (req, res) => {
			const emailRenderingResponse = await fetch(NEWSLETTER_RENDER_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(req.body),
			});

			const emailRenderingJson =
				(await emailRenderingResponse.json()) as EmailRenderingOutput;

			return res.send(makeSuccessResponse(emailRenderingJson));
		},
	);
}
