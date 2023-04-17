import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type {
	CurrentStepRouteRequest,
	GenericStorageInterface,
	WizardStepData,
} from './types';
import { getFormDataForExistingItem } from './utility';

export async function setupInitialState<T extends GenericStorageInterface>(
	requestBody: CurrentStepRouteRequest,
	storageInstance?: T,
): Promise<WizardStepData> {
	if (!storageInstance) {
		throw new StateMachineError(
			'no storageInstance',
			StateMachineErrorCode.StorageAccessError,
			true,
		);
	}

	const itemId = requestBody.id;
	if (!itemId) {
		return {
			currentStepId: requestBody.stepId,
		};
	}

	const formDataFromStorage = await getFormDataForExistingItem(
		requestBody,
		storageInstance,
	);
	if (!formDataFromStorage) {
		throw new StateMachineError(
			`no item ${itemId} to edit`,
			StateMachineErrorCode.NoSuchItem,
			true,
		);
	}

	return {
		formData: formDataFromStorage,
		currentStepId: requestBody.stepId,
	};
}
