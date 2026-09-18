import type {
	MetaData,
	NewsletterCategory,
	NewsletterData,
	Theme,
} from '@newsletters-nx/newsletters-data-client';
import type { APIRequestContext } from '@playwright/test';

const API_BASE = process.env['API_URL'] ?? 'http://localhost:3000';

// Helpers over `/api/test-fixtures/*`: insert a newsletter or draft directly
// into storage, bypassing the wizard and launch flow. Only available when
// the API runs with `ENABLE_TEST_FIXTURES=true` and in-memory storage.
// Prefer these over `draft-newsletter.ts`'s wizard-driven helpers when a
// scenario needs a state the wizard can't reach: a chosen `status`, a
// specific `meta.updatedTimestamp`, or a launched newsletter at all.

type MetaOverrides = Partial<MetaData>;

const defaultMeta = (overrides?: MetaOverrides) => ({
	createdTimestamp: Date.now(),
	createdBy: 'e2e-test@example.com',
	updatedTimestamp: Date.now(),
	updatedBy: 'e2e-test@example.com',
	...overrides,
});

const uniqueSuffix = () =>
	`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Fixed defaults for the required fields no row-content scenario cares about;
// kept separate from `createFixtureNewsletter` so the request-building logic
// isn't buried under a wall of boilerplate values.
const defaultNewsletterFields = (identityName: string, suffix: string) => ({
	identityName,
	name: `Fixture Newsletter ${suffix}`,
	category: 'article-based',
	restricted: false,
	status: 'live',
	emailConfirmation: false,
	brazeSubscribeAttributeName: 'Fixture_Subscribe_Email',
	brazeSubscribeEventNamePrefix: 'fixture_newsletter',
	brazeNewsletterName: 'Editorial_Fixture',
	theme: 'news',
	group: 'News in depth',
	signUpDescription: 'A fixture newsletter created for e2e tests.',
	signUpEmbedDescription: 'A fixture newsletter created for e2e tests.',
	regionFocus: 'UK',
	frequency: 'Weekly',
	listId: 0,
	listIdV1: 0,
	signupPage: `/uk/sign-up-for-the-${identityName}-newsletter`,
	figmaIncludesThrashers: false,
	creationTimeStamp: Date.now(),
	launchDate: new Date().toISOString(),
	signUpPageDate: new Date().toISOString(),
	privateUntilLaunch: false,
	brazeCampaignCreationStatus: 'COMPLETED',
	signupPageCreationStatus: 'COMPLETED',
	tagCreationStatus: 'NOT_REQUESTED',
});

type FixtureDraftOverrides = Partial<
	Pick<NewsletterData, 'name' | 'illustrationCircle'>
> & {
	theme?: Theme;
	category?: NewsletterCategory;
	meta?: MetaOverrides;
};

// Inserts a draft directly, with no wizard round-trips. Returns the created `listId`.
export async function createFixtureDraft(
	request: APIRequestContext,
	overrides: FixtureDraftOverrides = {},
): Promise<number> {
	const { meta, ...rest } = overrides;
	const response = await request.post(`${API_BASE}/api/test-fixtures/drafts`, {
		data: {
			name: `Fixture draft ${uniqueSuffix()}`,
			...rest,
			meta: defaultMeta(meta),
		},
	});
	const json = (await response.json()) as {
		ok: boolean;
		message?: string;
		data?: { listId: number };
	};
	if (!response.ok() || !json.ok || json.data === undefined) {
		throw new Error(
			`Failed to create fixture draft (${response.status()}): ${json.message ?? JSON.stringify(json)}`,
		);
	}
	return json.data.listId;
}

export async function deleteFixtureDraft(
	request: APIRequestContext,
	listId: number,
): Promise<void> {
	await request.delete(`${API_BASE}/api/test-fixtures/drafts/${listId}`);
}

type FixtureNewsletterOverrides = Partial<
	Pick<
		NewsletterData,
		'identityName' | 'name' | 'status' | 'illustrationCircle'
	>
> & {
	theme?: Theme;
	category?: NewsletterCategory;
	meta?: MetaOverrides;
};

// A minimal but schema-valid launched newsletter; fixed defaults fill in the
// required fields no row-content scenario cares about.
export async function createFixtureNewsletter(
	request: APIRequestContext,
	overrides: FixtureNewsletterOverrides = {},
): Promise<{ identityName: string; listId: number }> {
	const suffix = uniqueSuffix();
	const identityName = overrides.identityName ?? `fixture-newsletter-${suffix}`;
	const { meta, ...rest } = overrides;

	const response = await request.post(
		`${API_BASE}/api/test-fixtures/newsletters`,
		{
			data: {
				...defaultNewsletterFields(identityName, suffix),
				...rest,
				meta: defaultMeta(meta),
			},
		},
	);
	const json = (await response.json()) as {
		ok: boolean;
		message?: string;
		data?: { listId: number };
	};
	if (!response.ok() || !json.ok || json.data === undefined) {
		throw new Error(
			`Failed to create fixture newsletter (${response.status()}): ${json.message ?? JSON.stringify(json)}`,
		);
	}
	return { identityName, listId: json.data.listId };
}

export async function deleteFixtureNewsletter(
	request: APIRequestContext,
	listId: number,
): Promise<void> {
	await request.delete(`${API_BASE}/api/test-fixtures/newsletters/${listId}`);
}
