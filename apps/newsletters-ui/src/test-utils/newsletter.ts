import type {
	NewsletterData,
	UserPermissions,
} from '@newsletters-nx/newsletters-data-client';
import { vi } from 'vitest';
import { usePermissions } from '../app/hooks/user-hooks';

/**
 * A launched newsletter for component tests. Only the fields the detail page
 * needs are set; pass `overrides` for anything a test depends on.
 */
export const newsletterFixture = (
	overrides: Partial<NewsletterData> = {},
): NewsletterData =>
	({
		name: 'Afternoon update',
		listId: 123,
		status: 'live',
		theme: 'news',
		category: 'article-based',
		regionFocus: 'AU',
		frequency: 'Weekly',
		group: 'News in depth',
		signupPageCreationStatus: 'NOT_REQUESTED',
		tagCreationStatus: 'NOT_REQUESTED',
		brazeCampaignCreationStatus: 'NOT_REQUESTED',
		...overrides,
	}) as NewsletterData;

export const editorPermissions: UserPermissions = {
	editEverything: true,
	useJsonEditor: false,
};

export const viewerPermissions: UserPermissions = {
	editEverything: false,
	useJsonEditor: false,
};

/**
 * Sets what `usePermissions` returns. The calling spec must mock the hook:
 * `vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));`
 */
export const mockPermissions = (permissions: UserPermissions | undefined) => {
	vi.mocked(usePermissions).mockReturnValue(permissions);
};

/** Lets the current user edit panels. See `mockPermissions`. */
export const allowEditing = () => mockPermissions(editorPermissions);

/** A response from `/api/signup-path-validation`. */
export const signupPathCheckResponse = (valid: boolean) =>
	({
		ok: true,
		json: () => Promise.resolve({ ok: true, data: { valid } }),
	}) as Response;

/** A `/api/signup-path-validation` request that failed, e.g. a 502. */
export const failedSignupPathCheckResponse = (status = 502) =>
	({ ok: false, status }) as Response;

/**
 * Replaces `fetch` so that every sign-up path is checked as `valid`. Returns
 * the mock so tests can change the response.
 */
export const mockSignupPathCheck = (valid = true) => {
	const fetchMock = vi.fn().mockResolvedValue(signupPathCheckResponse(valid));
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
};
