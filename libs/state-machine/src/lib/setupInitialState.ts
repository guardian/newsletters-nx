import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { draftNewsletterDataToFormData } from '@newsletters-nx/newsletters-data-client';
import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type { CurrentStepRouteRequest, WizardStepData } from './types';

export async function setupInitialState(
	requestBody: CurrentStepRouteRequest,
	storageInstance?: DraftStorage,
): Promise<WizardStepData> {
	if (!storageInstance) {
		throw new StateMachineError(
			'no storageInstance',
			StateMachineErrorCode.StorageAccessError,
			true,
		);
	}

	const newsletterId = requestBody.id;
	if (!newsletterId) {
		return {
			currentStepId: requestBody.stepId,
		};
	}
	const newsletterIdAsNumber = +newsletterId;

	const storageResponse = await storageInstance.getDraftNewsletter(
		newsletterIdAsNumber,
	);
	if (!storageResponse.ok) {
		throw new StateMachineError(
			`cannot load draft newsletter with id ${newsletterId}`,
			StateMachineErrorCode.StorageAccessError,
			false,
		);
	}
	return {
		formData: draftNewsletterDataToFormData(storageResponse.data),
		currentStepId: requestBody.stepId,
	};
}
