import type {
	DraftStorage,
	DraftWithId,
	FormDataRecord,
} from '@newsletters-nx/newsletters-data-client';
import {
	draftNewsletterDataToFormData,
	formDataToDraftNewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type {
	CurrentStepRouteRequest,
	WizardLayout,
	WizardStepData,
} from './types';
import {
	getExistingItem,
	makeStepDataWithErrorMessage,
	validateIncomingFormData,
} from './utility';

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
	if (incomingDataError) {
		return makeStepDataWithErrorMessage(incomingDataError, requestBody);
	}

	const existingItem = await getExistingItem(requestBody, storageInstance);
	const existingFormData: FormDataRecord = existingItem
		? draftNewsletterDataToFormData(existingItem)
		: {};
	const combinedFormData: FormDataRecord = {
		...existingFormData,
		...{ ...requestBody.formData },
	};

	const listId =
		typeof combinedFormData['listId'] === 'number'
			? combinedFormData['listId']
			: undefined;

	// Do not allow skipping before the 'create' step
	if (!listId) {
		return makeStepDataWithErrorMessage(
			'Cannot skip from this step',
			requestBody,
		);
	}

	// formDataToDraftNewsletterData CAN THROW
	const newDraftWithId: DraftWithId = {
		...formDataToDraftNewsletterData(combinedFormData),
		listId: listId,
	};
	const storageResponse = await storageInstance.modifyDraftNewsletter(
		newDraftWithId,
	);

	if (storageResponse.ok) {
		return {
			formData: draftNewsletterDataToFormData(storageResponse.data),
			currentStepId: requestBody.stepToSkipToId,
		};
	} else {
		throw new StateMachineError(
			`failed to update draft #${listId}`,
			StateMachineErrorCode.StorageAccessError,
		);
	}
}
