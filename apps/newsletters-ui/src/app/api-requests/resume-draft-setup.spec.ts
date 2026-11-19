import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { draftNewsletterDataToFormData } from '@newsletters-nx/newsletters-data-client';
import { TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS } from '@newsletters-nx/newsletters-data-client/fixtures';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
} from '@newsletters-nx/state-machine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeWizardStepRequest } from './make-wizard-step-request';
import { resumeDraftSetup } from './resume-draft-setup';

vi.mock('./make-wizard-step-request', () => ({
	makeWizardStepRequest: vi.fn(),
}));

const request: CurrentStepRouteRequest = {
	wizardId: 'NEWSLETTER_DATA_STAND_REDESIGN',
	id: '7',
	stepId: 'nameAndFrequencyLayout',
};
const initialStep = (
	overrides: DraftNewsletterData = {},
): CurrentStepRouteResponse => ({
	currentStepId: request.stepId,
	formData: draftNewsletterDataToFormData({
		...TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS,
		listId: 7,
		...overrides,
	}),
});

beforeEach(() => vi.resetAllMocks());

describe('resumeDraftSetup', () => {
	it.each([
		['category', 'productionDetails'],
		['launchDate', 'dates'],
		['regionFocus', 'targeting'],
		['signUpHeadline', 'signUpPage'],
	] as const)(
		'resumes at %s with the saved form data',
		async (field, target) => {
			const initial = initialStep({ [field]: undefined });
			const resumed = { ...initial, currentStepId: target };
			vi.mocked(makeWizardStepRequest).mockResolvedValue(resumed);

			expect(await resumeDraftSetup(request, initial)).toBe(resumed);
			expect(makeWizardStepRequest).toHaveBeenCalledExactlyOnceWith({
				...request,
				stepToSkipToId: target,
				formData: initial.formData,
			});
		},
	);

	it.each([undefined, ''])(
		'stays at the start when frequency is %s',
		async (frequency) => {
			const initial = initialStep({ frequency });
			expect(await resumeDraftSetup(request, initial)).toBe(initial);
			expect(makeWizardStepRequest).not.toHaveBeenCalled();
		},
	);

	it('chooses the earliest gap, not the number of completed steps', async () => {
		const initial = initialStep({
			category: undefined,
			signUpHeadline: undefined,
		});
		await resumeDraftSetup(request, initial);
		expect(makeWizardStepRequest).toHaveBeenCalledWith(
			expect.objectContaining({ stepToSkipToId: 'productionDetails' }),
		);
	});

	it('honours launch defaults and skips optional tags and rendering', async () => {
		const initial = initialStep({
			privateUntilLaunch: undefined,
			seriesTag: undefined,
			renderingOptions: undefined,
			signUpHeadline: undefined,
		});
		await resumeDraftSetup(request, initial);
		expect(makeWizardStepRequest).toHaveBeenCalledWith(
			expect.objectContaining({ stepToSkipToId: 'signUpPage' }),
		);
	});

	it('keeps the normal start when all required steps are complete', async () => {
		const initial = initialStep();
		expect(await resumeDraftSetup(request, initial)).toBe(initial);
		expect(makeWizardStepRequest).not.toHaveBeenCalled();
	});

	it.each(['NEWSLETTER_DATA', 'RENDERING_OPTIONS', 'LAUNCH_NEWSLETTER'])(
		'does not resume the %s wizard',
		async (wizardId) => {
			const initial = initialStep({ category: undefined });
			expect(await resumeDraftSetup({ ...request, wizardId }, initial)).toBe(
				initial,
			);
			expect(makeWizardStepRequest).not.toHaveBeenCalled();
		},
	);

	it('does not resume a new draft', async () => {
		const initial = initialStep({ category: undefined });
		expect(await resumeDraftSetup({ ...request, id: undefined }, initial)).toBe(
			initial,
		);
		expect(makeWizardStepRequest).not.toHaveBeenCalled();
	});

	it.each([
		{ errorMessage: 'Draft not found' },
		{ formData: undefined },
		{ formData: { name: 'Unsaved draft' } },
	])(
		'does not skip when initialization cannot provide a saved draft: %j',
		async (overrides) => {
			const initial = { ...initialStep(), ...overrides };
			expect(await resumeDraftSetup(request, initial)).toBe(initial);
			expect(makeWizardStepRequest).not.toHaveBeenCalled();
		},
	);
});
