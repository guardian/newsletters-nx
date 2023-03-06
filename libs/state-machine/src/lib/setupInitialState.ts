import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { CurrentStepRouteRequest, WizardStepData } from './types';

export async function setupInitialState(
	requestBody: CurrentStepRouteRequest,
	storageInstance?: DraftStorage,
): Promise<WizardStepData> {
	if (!storageInstance) {
		throw new Error('no storageInstance');
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
		throw new Error(`cannot load draft newsletter with id ${newsletterId}`);
	}
	return {
		formData: storageResponse.data,
		currentStepId: requestBody.stepId,
	};
}
