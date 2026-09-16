import type { Express, Request, Response } from 'express';
import { isPublicReadOnlyApi } from '../../apiDeploymentSettings';
import { newsletterStore } from '../../services/storage';
import { registerReadNewsletterRoutes } from './newsletters';

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

jest.mock('../../apiDeploymentSettings', () => ({
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- inline import() type needed for jest.requireActual's generic
	...jest.requireActual<typeof import('../../apiDeploymentSettings')>(
		'../../apiDeploymentSettings',
	),
	isDynamicImageSigningEnabled: jest.fn(() => false),
	isPublicReadOnlyApi: jest.fn(() => false),
}));

jest.mock('../../services/image/image-signer', () => ({
	signTemplateImages: jest.fn((newsletter: unknown) => newsletter),
}));

jest.mock('../../services/storage', () => ({
	newsletterStore: {
		list: jest.fn(),
		readByName: jest.fn(),
	},
}));

const mockIsPublicReadOnlyApi = isPublicReadOnlyApi as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method -- these are jest.fn() mocks, not real methods with a `this`
const mockList = newsletterStore.list as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method -- these are jest.fn() mocks, not real methods with a `this`
const mockReadByName = newsletterStore.readByName as jest.Mock;

const NEWSLETTER_WITH_META = {
	...VALID_NEWSLETTER_DATA,
	meta: { createdBy: 'editor@example.com', createdTimestamp: 1 },
};

/** Captures the handlers registered on a fake Express app so they can be invoked directly, without booting a real server. */
const makeFakeApp = () => {
	const handlers = new Map<string, (req: Request, res: Response) => unknown>();
	const app = {
		get: (path: string, handler: (req: Request, res: Response) => unknown) => {
			handlers.set(`GET ${path}`, handler);
		},
	} as unknown as Express;
	return {
		app,
		get: (path: string) => handlers.get(`GET ${path}`),
	};
};

const makeMockResponse = () => {
	const send = jest.fn<Response, [unknown]>().mockReturnThis();
	const status = jest.fn<Response, [number]>().mockReturnThis();
	const res = { status, send } as unknown as Response;
	return { res, send };
};

describe('registerReadNewsletterRoutes meta visibility', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('strips meta from /api/newsletters on the public read-only deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(true);
		mockList.mockResolvedValue({ ok: true, data: [NEWSLETTER_WITH_META] });
		const { app, get } = makeFakeApp();
		registerReadNewsletterRoutes(app);
		const { res, send } = makeMockResponse();

		await get('/api/newsletters')?.({ query: {} } as unknown as Request, res);

		const body = send.mock.calls[0]?.[0] as { data: Array<{ meta?: unknown }> };
		expect(body.data[0]?.meta).toBeUndefined();
	});

	it('keeps meta on /api/newsletters for the internal read/write deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(false);
		mockList.mockResolvedValue({ ok: true, data: [NEWSLETTER_WITH_META] });
		const { app, get } = makeFakeApp();
		registerReadNewsletterRoutes(app);
		const { res, send } = makeMockResponse();

		await get('/api/newsletters')?.({ query: {} } as unknown as Request, res);

		const body = send.mock.calls[0]?.[0] as { data: Array<{ meta?: unknown }> };
		expect(body.data[0]?.meta).toEqual(NEWSLETTER_WITH_META.meta);
	});

	it('strips meta from /api/newsletters/:newsletterId on the public read-only deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(true);
		mockReadByName.mockResolvedValue({ ok: true, data: NEWSLETTER_WITH_META });
		const { app, get } = makeFakeApp();
		registerReadNewsletterRoutes(app);
		const { res, send } = makeMockResponse();

		await get('/api/newsletters/:newsletterId')?.(
			{
				query: {},
				params: { newsletterId: 'a-newsletter' },
			} as unknown as Request,
			res,
		);

		const body = send.mock.calls[0]?.[0] as { data: { meta?: unknown } };
		expect(body.data.meta).toBeUndefined();
	});

	it('never exposes meta on the legacy endpoint, regardless of deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(false);
		mockList.mockResolvedValue({ ok: true, data: [NEWSLETTER_WITH_META] });
		const { app, get } = makeFakeApp();
		registerReadNewsletterRoutes(app);
		const { res, send } = makeMockResponse();

		await get('/api/legacy/newsletters')?.(
			{ query: {} } as unknown as Request,
			res,
		);

		const body = send.mock.calls[0]?.[0] as Array<Record<string, unknown>>;
		expect(body[0]?.meta).toBeUndefined();
	});
});
