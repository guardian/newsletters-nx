import {
	formDataToDraftNewsletterData,
	getDraftSetupProgress,
} from '@newsletters-nx/newsletters-data-client';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
} from '@newsletters-nx/state-machine';
import { makeWizardStepRequest } from './make-wizard-step-request';

/** Resume only after initialization has loaded the saved draft and its list ID. */
export const resumeDraftSetup = async (
	request: CurrentStepRouteRequest,
	initialStep: CurrentStepRouteResponse,
): Promise<CurrentStepRouteResponse> => {
	if (
		request.wizardId !== 'NEWSLETTER_DATA_STAND_REDESIGN' ||
		!request.id ||
		initialStep.errorMessage ||
		!initialStep.formData ||
		typeof initialStep.formData.listId !== 'number'
	) {
		return initialStep;
	}

	const { steps } = getDraftSetupProgress(
		formDataToDraftNewsletterData(initialStep.formData),
	);
	const stepToSkipToId = steps.find((step) => !step.isComplete)?.id;

	if (!stepToSkipToId || stepToSkipToId === initialStep.currentStepId) {
		return initialStep;
	}

	return makeWizardStepRequest({
		wizardId: request.wizardId,
		id: request.id,
		stepId: initialStep.currentStepId,
		stepToSkipToId,
		formData: initialStep.formData,
	});
};
