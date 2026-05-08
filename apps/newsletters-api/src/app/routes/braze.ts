import type { Express } from 'express';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getAllCampaigns } from '../../services/braze/braze-campaign-client';
import { newsletterStore } from '../../services/storage';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

export interface BrazeNewsletterUrlEntry {
	identityName: string;
	newsletterName: string;
	exampleUrl: string | undefined;
	brazeUrl: string | undefined;
	isMatch: boolean;
}

export function registerBrazeRoutes(app: Express) {
	app.get('/api/braze/newsletter-urls', async (_req, res) => {
		try {
			const [campaigns, storageResponse] = await Promise.all([
				getAllCampaigns(),
				newsletterStore.list(),
			]);

			if (!storageResponse.ok) {
				return res
					.status(500)
					.send(makeErrorResponse(storageResponse.message));
			}

			const newsletters: NewsletterData[] = storageResponse.data;
			const newsletterMap = new Map(
				newsletters.map((n) => [n.identityName, n]),
			);

			const entries: BrazeNewsletterUrlEntry[] = campaigns
				.filter((c) => c.extracted.identity_newsletter_id !== undefined)
				.map((campaign) => {
					const identityName = campaign.extracted.identity_newsletter_id as string;
					const newsletter = newsletterMap.get(identityName);
					const brazeUrl = campaign.extracted.rendering_url;
					const exampleUrl = newsletter?.exampleUrl ?? undefined;

					return {
						identityName,
						newsletterName: newsletter?.name ?? campaign.name,
						exampleUrl,
						brazeUrl,
						isMatch:
							brazeUrl !== undefined &&
							exampleUrl !== undefined &&
							brazeUrl === exampleUrl,
					};
				});


			return res.send(makeSuccessResponse(entries));
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Unknown error fetching Braze data';
			return res.status(500).send(makeErrorResponse(message));
		}
	});
}


