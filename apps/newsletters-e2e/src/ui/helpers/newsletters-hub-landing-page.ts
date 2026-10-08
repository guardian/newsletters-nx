import { faker } from '@faker-js/faker';
import type {
	EditionId,
	EditionsLayouts,
	Layout,
} from '@newsletters-nx/newsletters-data-client';
import type { APIRequestContext, Page } from '@playwright/test';
import {
	backupFixtureLayouts,
	createFixtureLayout,
	deleteFixtureLayout,
	restoreFixtureLayouts,
} from '../../../helpers/test-fixtures';
import { chunk } from '../../../utils/chunk';

const editionIdsByName: Record<string, EditionId> = {
	'United Kingdom': 'UK',
	'United States': 'US',
	Australia: 'AU',
	Europe: 'EUR',
	International: 'INT',
};

/**
 * Utility class for managing e2e test scenarios for the newsletters hub landing page.
 *
 */
export default class NewslettersHubLandingPage {
	private backedUpLayouts: EditionsLayouts | null = null;
	constructor(
		public readonly page: Page,
		public readonly request: APIRequestContext,
	) {}

	public async backupLayouts() {
		this.backedUpLayouts = await backupFixtureLayouts(this.request);
	}

	public async restoreLayouts() {
		if (this.backedUpLayouts === null) {
			return;
		}
		await restoreFixtureLayouts(this.request, this.backedUpLayouts);
		this.backedUpLayouts = null;
	}

	public getEditionIdByName(edition: string): EditionId {
		const editionId = editionIdsByName[edition];
		if (!editionId) {
			throw new Error(`No edition id found for edition '${edition}'`);
		}
		return editionId;
	}

	public async goto() {
		await this.page.goto('/layouts');
	}

	public async removeLayout(edition: string) {
		await deleteFixtureLayout(this.request, this.getEditionIdByName(edition));
	}

	/** Creates a layout with random newsletter names spread evenly across the groups. */
	public async createLayout(
		edition: string,
		newsletterCount: number,
		groupCount: number,
	) {
		const newsletterNames = faker.helpers.uniqueArray(
			faker.word.noun.bind(undefined),
			newsletterCount,
		);
		const groupNames = faker.helpers.uniqueArray(
			faker.word.noun.bind(undefined),
			groupCount,
		);
		const chunked = chunk(newsletterNames, groupNames.length);

		const layout: Layout = {
			groups: groupNames.map((title, idx) => ({
				title,
				newsletters: chunked[idx] ?? [],
			})),
		};

		await createFixtureLayout(
			this.request,
			this.getEditionIdByName(edition),
			layout,
		);
	}

	public locateAllNewsletterPagesLink() {
		return this.page.getByRole('link', { name: 'all newsletter pages' });
	}

	public locateEditionTile(edition: string) {
		return this.page
			.getByRole('list', { name: 'Available editions' })
			.getByRole('link', { name: edition });
	}

	public locateStandTopBarNav() {
		return this.page.getByRole('navigation').filter({
			has: this.page.getByRole('link', { name: 'All newsletters' }),
		});
	}

	public locateLegacyTopBarNav() {
		return this.page.getByRole('navigation').filter({
			has: this.page.getByRole('link', { name: 'Draft newsletters' }),
		});
	}

	public locateStandHeading() {
		return this.page.getByRole('heading', {
			name: 'Newsletters hub layouts',
			exact: true,
		});
	}

	public locateLegacyHeading() {
		return this.page.getByRole('heading', { name: 'Layouts', exact: true });
	}

	public getUrl() {
		return this.page.url();
	}
}
