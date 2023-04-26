import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type {
	CurrentStepRouteRequest,
	GenericStorageInterface,
	WizardLayout,
	WizardStepData,
} from './types';

export async function setupInitialState<T extends GenericStorageInterface>(
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout<T>,
	storageInstance?: T,
): Promise<WizardStepData> {
	const step = wizardLayout[requestBody.stepId];

	if (!step) {
		throw new StateMachineError(
			`no such step ${requestBody.stepId}`,
			StateMachineErrorCode.NoSuchStep,
		);
	}

	if (step.getInitialFormData) {
		if (!storageInstance) {
			throw new StateMachineError(
				'no storageInstance',
				StateMachineErrorCode.StorageAccessError,
				true,
			);
		}
		const intialFormData = await step.getInitialFormData(
			requestBody,
			storageInstance,
		);
		return {
			formData: intialFormData,
			currentStepId: requestBody.stepId,
		};
	}

	const itemId = requestBody.id;
	if (!itemId) {
		return {
			currentStepId: requestBody.stepId,
		};
	}

	throw new StateMachineError(
		`The step ${requestBody.stepId} wants to edit an existing item with id ${itemId}, but does not have a method to fetch the item.`,
		StateMachineErrorCode.StepMethodFailed,
		true,
	);
}
