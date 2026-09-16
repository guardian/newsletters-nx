import { isPublicReadOnlyApi } from '../apiDeploymentSettings';
import { redactMetaForPublicApi } from './responses';

jest.mock('../apiDeploymentSettings', () => ({
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- inline import() type needed for jest.requireActual's generic
	...jest.requireActual<typeof import('../apiDeploymentSettings')>(
		'../apiDeploymentSettings',
	),
	isPublicReadOnlyApi: jest.fn(),
}));

const mockIsPublicReadOnlyApi = isPublicReadOnlyApi as jest.Mock;

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
			description: 'leaves meta untouched on the internal read/write deployment',
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
