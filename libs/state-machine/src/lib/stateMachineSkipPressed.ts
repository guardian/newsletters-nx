import type { FormDataRecord } from '@newsletters-nx/newsletters-data-client';
import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type {
	CurrentStepRouteRequest,
	GenericStorageInterface,
	WizardLayout,
	WizardStepData,
} from './types';
import {
	getFormDataForExistingItem,
	makeStepDataWithErrorMessage,
	modifyExistingItemWithFormData,
	validateIncomingFormData,
} from './utility';

export async function stateMachineSkipPressed<
	T extends GenericStorageInterface,
>(
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout<T>,
	storageInstance?: T,
): Promise<WizardStepData> {
	if (!storageInstance) {
		throw new StateMachineError(
			'no storageInstance',
			StateMachineErrorCode.StorageAccessError,
			true,
		);
	}

	if (!requestBody.stepToSkipToId) {
		return makeStepDataWithErrorMessage(
			'no stepToSkipToId',
			requestBody.stepId,
			requestBody.formData,
		);
	}

	const incomingDataError = validateIncomingFormData(
		requestBody.stepId,
		requestBody.formData,
		wizardLayout as WizardLayout<unknown>,
	);
	if (incomingDataError) {
		return makeStepDataWithErrorMessage(
			incomingDataError,
			requestBody.stepId,
			requestBody.formData,
		);
	}

	const existingFormData =
		(await getFormDataForExistingItem(requestBody, storageInstance)) ?? {};
	const combinedFormData: FormDataRecord = {
		...existingFormData,
		...{ ...requestBody.formData },
	};

	// TO DO - listId might not always be the id number property
	const listId =
		typeof combinedFormData['listId'] === 'number'
			? combinedFormData['listId']
			: undefined;

	// Do not allow skipping before the 'create' step
	if (!listId) {
		return makeStepDataWithErrorMessage(
			'Cannot skip from this step',
			requestBody.stepId,
			requestBody.formData,
		);
	}

	// modify the existing item with the combinedFormData
	const modifiedData = await modifyExistingItemWithFormData(
		listId,
		combinedFormData,
		storageInstance,
	);

	return {
		formData: modifiedData,
		currentStepId: requestBody.stepToSkipToId,
	};
}
