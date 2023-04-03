import type {
	DraftStorage,
	DraftWithId,
} from '@newsletters-nx/newsletters-data-client';
import { draftNewsletterDataToFormData } from '@newsletters-nx/newsletters-data-client';
import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type {
	CurrentStepRouteRequest,
	WizardLayout,
	WizardStepData,
} from './types';
import {
	makeStepDataWithErrorMessage,
	validateIncomingFormData,
} from './utility';

const getExistingData = async (
	requestBody: CurrentStepRouteRequest,
	storageInstance: DraftStorage,
): Promise<DraftWithId | undefined> => {
	const existingItemId = requestBody.id;
	if (!existingItemId) {
		return undefined;
	}
	const idAsNumber = +existingItemId;

	const storageResponse = await storageInstance.getDraftNewsletter(idAsNumber);
	if (!storageResponse.ok) {
		throw new StateMachineError(
			`cannot load draft newsletter with id ${existingItemId}`,
			StateMachineErrorCode.StorageAccessError,
			false,
		);
	}

	return storageResponse.data;
};

export async function stateMachineSkipPressed(
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout,
	storageInstance?: DraftStorage,
): Promise<WizardStepData> {
	if (!storageInstance) {
		throw new StateMachineError(
			'no storageInstance',
			StateMachineErrorCode.StorageAccessError,
			true,
		);
	}

	if (!requestBody.stepToSkipToId) {
		return makeStepDataWithErrorMessage('no stepToSkipToId', requestBody);
	}

	const incomingDataError = validateIncomingFormData(requestBody, wizardLayout);
	console.log({ incomingDataError });
	if (incomingDataError) {
		return makeStepDataWithErrorMessage(incomingDataError, requestBody);
	}
	// TO DO storageInstance.modifyDraftNewsletter

	const existingData = await getExistingData(requestBody, storageInstance);

	const formDataToReturn = existingData
		? draftNewsletterDataToFormData(existingData)
		: {};

	return {
		formData: formDataToReturn,
		currentStepId: requestBody.stepToSkipToId,
	};
}
