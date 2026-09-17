import { isPublicReadOnlyApi } from '../apiDeploymentSettings';
import { draftStore, newsletterStore } from '../services/storage';
import { redactMetaForPublicApi } from './responses';
import { registerDraftsRoutes } from './routes/drafts';
import { registerReadNewsletterRoutes } from './routes/newsletters';
import { invokeGetRoute } from './routes/test-helpers';

// Covers whether the public read-only API leaks `meta`, both at the
// pure-helper level (redactMetaForPublicApi) and at the route level
// (drafts and newsletters routes).

jest.mock('../apiDeploymentSettings', () => ({
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- inline import() type needed for jest.requireActual's generic
	...jest.requireActual<typeof import('../apiDeploymentSettings')>(
		'../apiDeploymentSettings',
	),
	isDynamicImageSigningEnabled: jest.fn(() => false),
	isPublicReadOnlyApi: jest.fn(() => false),
}));

jest.mock('../services/image/image-signer', () => ({
	signTemplateImages: jest.fn((newsletter: unknown) => newsletter),
}));

jest.mock('../services/storage', () => ({
	draftStore: {
		readAll: jest.fn(),
		read: jest.fn(),
	},
	newsletterStore: {
		list: jest.fn(),
		readByName: jest.fn(),
	},
}));

jest.mock('../services/permissions', () => ({
	permissionService: { get: jest.fn() },
}));

const mockIsPublicReadOnlyApi = isPublicReadOnlyApi as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method -- these are jest.fn() mocks, not real methods with a `this`
const mockDraftReadAll = draftStore.readAll as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method -- these are jest.fn() mocks, not real methods with a `this`
const mockDraftRead = draftStore.read as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method -- these are jest.fn() mocks, not real methods with a `this`
const mockNewsletterList = newsletterStore.list as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method -- these are jest.fn() mocks, not real methods with a `this`
const mockNewsletterReadByName = newsletterStore.readByName as jest.Mock;

const META = { createdBy: 'editor@example.com', createdTimestamp: 1 };

const DRAFT_WITH_META = {
	listId: 1,
	name: 'a-draft',
	meta: META,
};

const VALID_NEWSLETTER_DATA = {
	identityName: 'tech-scape',
	name: 'TechScape',
	category: 'article-based-legacy',
	status: 'live',
	restricted: false,
	emailConfirmation: false,
	brazeNewsletterName: 'Editorial_TechScape',
	brazeSubscribeAttributeName: 'TechScape_Subscribe_Email',
	brazeSubscribeEventNamePrefix: 'tech_scape',
	theme: 'news',
	group: 'News in depth',
	signUpDescription:
		"Alex Hern's weekly dive in to how technology is shaping our lives",
	signUpEmbedDescription:
		"Alex Hern's weekly dive in to how technology is shaping our lives",
	mailSuccessDescription: "We'll send you TechScape every week",
	frequency: 'Weekly',
	listIdV1: -1,
	listId: 6013,
	signupPage:
		'/info/2022/sep/20/sign-up-for-the-techscape-newsletter-our-free-technology-email',
	campaignName: 'TechScape',
	campaignCode: 'techscape_email',
	brazeSubscribeAttributeNameAlternate: [
		'email_subscribe_tech_scape',
		'TechTonic_Subscribe_Email',
		'email_subscribe_tech_tonic',
	],
	creationTimeStamp: 87678876,
	figmaIncludesThrashers: false,
	launchDate: new Date(87678876),
	signUpPageDate: new Date(87678876),
	thrasherDate: new Date(87678876),
	privateUntilLaunch: false,
	onlineArticle: 'Web for all sends',
	brazeCampaignCreationStatus: 'NOT_REQUESTED',
	ophanCampaignCreationStatus: 'NOT_REQUESTED',
	signupPageCreationStatus: 'NOT_REQUESTED',
	tagCreationStatus: 'NOT_REQUESTED',
};

const NEWSLETTER_WITH_META = {
	...VALID_NEWSLETTER_DATA,
	meta: META,
};

beforeEach(() => {
	jest.clearAllMocks();
});

describe('redactMetaForPublicApi', () => {
	const itemWithMeta = {
		identityName: 'a-newsletter',
		meta: { createdBy: 'someone@example.com', createdTimestamp: 1 },
	};

	it.each([
		{
			description: 'strips meta when serving the public read-only API',
			isPublic: true,
			expectedMeta: undefined,
		},
		{
			description:
				'leaves meta untouched on the internal read/write deployment',
			isPublic: false,
			expectedMeta: itemWithMeta.meta,
		},
	])('$description', ({ isPublic, expectedMeta }) => {
		mockIsPublicReadOnlyApi.mockReturnValue(isPublic);

		const result = redactMetaForPublicApi(itemWithMeta);

		expect(result.meta).toEqual(expectedMeta);
		expect(result.identityName).toBe('a-newsletter');
	});
});

describe('registerDraftsRoutes meta visibility', () => {
	it.each([
		{
			description:
				'strips meta from /api/drafts on the public read-only deployment',
			isPublic: true,
			expectedMeta: undefined,
		},
		{
			description:
				'keeps meta on /api/drafts for the internal read/write deployment',
			isPublic: false,
			expectedMeta: DRAFT_WITH_META.meta,
		},
	])('$description', async ({ isPublic, expectedMeta }) => {
		mockIsPublicReadOnlyApi.mockReturnValue(isPublic);
		mockDraftReadAll.mockResolvedValue({ ok: true, data: [DRAFT_WITH_META] });

		const body = await invokeGetRoute<{ data: Array<{ meta?: unknown }> }>(
			registerDraftsRoutes,
			'/api/drafts',
		);

		expect(body.data[0]?.meta).toEqual(expectedMeta);
	});

	it('strips meta from /api/drafts/:listId on the public read-only deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(true);
		mockDraftRead.mockResolvedValue({ ok: true, data: DRAFT_WITH_META });

		const body = await invokeGetRoute<{ data: { meta?: unknown } }>(
			registerDraftsRoutes,
			'/api/drafts/:listId',
			{ params: { listId: '1' } },
		);

		expect(body.data.meta).toBeUndefined();
	});
});

describe('registerReadNewsletterRoutes meta visibility', () => {
	it.each([
		{
			description:
				'strips meta from /api/newsletters on the public read-only deployment',
			isPublic: true,
			expectedMeta: undefined,
		},
		{
			description:
				'keeps meta on /api/newsletters for the internal read/write deployment',
			isPublic: false,
			expectedMeta: NEWSLETTER_WITH_META.meta,
		},
	])('$description', async ({ isPublic, expectedMeta }) => {
		mockIsPublicReadOnlyApi.mockReturnValue(isPublic);
		mockNewsletterList.mockResolvedValue({
			ok: true,
			data: [NEWSLETTER_WITH_META],
		});

		const body = await invokeGetRoute<{ data: Array<{ meta?: unknown }> }>(
			registerReadNewsletterRoutes,
			'/api/newsletters',
			{ query: {} },
		);

		expect(body.data[0]?.meta).toEqual(expectedMeta);
	});

	it('strips meta from /api/newsletters/:newsletterId on the public read-only deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(true);
		mockNewsletterReadByName.mockResolvedValue({
			ok: true,
			data: NEWSLETTER_WITH_META,
		});

		const body = await invokeGetRoute<{ data: { meta?: unknown } }>(
			registerReadNewsletterRoutes,
			'/api/newsletters/:newsletterId',
			{ query: {}, params: { newsletterId: 'a-newsletter' } },
		);

		expect(body.data.meta).toBeUndefined();
	});

	it('never exposes meta on the legacy endpoint, regardless of deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(false);
		mockNewsletterList.mockResolvedValue({
			ok: true,
			data: [NEWSLETTER_WITH_META],
		});

		const body = await invokeGetRoute<Array<Record<string, unknown>>>(
			registerReadNewsletterRoutes,
			'/api/legacy/newsletters',
			{ query: {} },
		);

		expect(body[0]?.meta).toBeUndefined();
	});
});
