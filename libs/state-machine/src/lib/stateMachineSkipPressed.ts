import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type {
	CurrentStepRouteRequest,
	GenericStorageInterface,
	WizardLayout,
	WizardStepData,
} from './types';
import {
	makeStepDataWithErrorMessage,
	validateIncomingFormData,
} from './utility';

export async function stateMachineSkipPressed<
	T extends GenericStorageInterface,
>(
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout<T>,
	storageInstance?: T,
): Promise<WizardStepData> {
	const stepSkippingFrom = wizardLayout[requestBody.stepId];

	if (!stepSkippingFrom) {
		throw new StateMachineError(
			`no step ${requestBody.stepId}`,
			StateMachineErrorCode.NoSuchStep,
			true,
		);
	}
	if (!stepSkippingFrom.executeSkip) {
		throw new StateMachineError(
			`step ${requestBody.stepId} cannot be skipped from`,
			StateMachineErrorCode.Unhandled,
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

	const stepSkippingTo = wizardLayout[requestBody.stepToSkipToId];
	if (!stepSkippingTo) {
		throw new StateMachineError(
			`no step ${requestBody.stepToSkipToId}`,
			StateMachineErrorCode.NoSuchStep,
			true,
		);
	}

	if (!stepSkippingTo.canSkipTo) {
		throw new StateMachineError(
			`step ${requestBody.stepToSkipToId} cannot be skipped to`,
			StateMachineErrorCode.Unhandled,
			true,
		);
	}

	// validate the form on the step
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

	const executeSkipResult = await stepSkippingFrom.executeSkip(
		{
			currentStepId: requestBody.stepId,
			formData: requestBody.formData,
		},
		stepSkippingFrom,
		storageInstance,
	);

	if (typeof executeSkipResult === 'string') {
		return makeStepDataWithErrorMessage(
			executeSkipResult,
			requestBody.stepId,
			requestBody.formData,
		);
	}

	return {
		formData: executeSkipResult,
		currentStepId: requestBody.stepToSkipToId,
	};
}
