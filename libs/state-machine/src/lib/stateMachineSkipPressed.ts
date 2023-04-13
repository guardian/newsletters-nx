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
		console.log('no execute skip function on', requestBody.stepId);
		// TO DO - the UI could check for executeSkip on the current step
		// when deciding whether to render any skip buttons in the nav
		// when that is in place, should throw an error here since it should not occur
		return makeStepDataWithErrorMessage(
			'no executeSkip function!',
			requestBody.stepId,
			requestBody.formData,
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
