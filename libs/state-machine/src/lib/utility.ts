import type {
	DraftStorage,
	DraftWithId,
} from '@newsletters-nx/newsletters-data-client';
import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type {
	CurrentStepRouteRequest,
	WizardLayout,
	WizardStepData,
} from './types';

export const makeStepDataWithErrorMessage = (
	errorMessage: string,
	requestBody: CurrentStepRouteRequest,
): WizardStepData => {
	return {
		...{
			currentStepId: requestBody.stepId,
			formData: requestBody.formData,
		},
		currentStepId: requestBody.stepId,
		errorMessage,
	};
};

export const validateIncomingFormData = (
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout,
) => {
	const currentStepLayout = wizardLayout[requestBody.stepId];
	const formSchemaForIncomingStep = currentStepLayout?.schema;

	if (formSchemaForIncomingStep) {
		if (!requestBody.formData) {
			return 'MISSING FORM DATA';
		}

		const parseResult = formSchemaForIncomingStep.safeParse(
			requestBody.formData,
		);
		if (!parseResult.success) {
			return 'INVALID FORM DATA';
		}
	}

	return false;
};

export const getExistingItem = async (
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
