import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type {
	GenericStorageInterface,
	WizardLayout,
	WizardStepData,
	WizardStepLayout,
} from './types';
import {
	makeStepDataWithErrorMessage,
	validateIncomingFormData,
} from './utility';

/**
 * Perform the vaidation and actions required for a button press.Result a
 * new WizardStepData containing either:
 *
 *  - a copy of the incomingStepData with an error message added if the step
 * failed; or
 *  - the currentStepId for the next step and the submitted form data
 *  if the step was success
 */
export async function stateMachineButtonPressed<
	T extends GenericStorageInterface,
>(
	buttonPressed: string,
	incomingStepData: WizardStepData,
	wizardLayout: WizardLayout<T>,
	storageInstance: T,
): Promise<WizardStepData> {
	const currentStepLayout = wizardLayout[incomingStepData.currentStepId];
	const buttonPressedDetails = currentStepLayout?.buttons[buttonPressed];

	if (!currentStepLayout || !buttonPressedDetails) {
		throw new StateMachineError(
			`Button ${buttonPressed} not found in step ${incomingStepData.currentStepId}`,
			StateMachineErrorCode.NoSuchStep,
		);
	}

	const stepToMoveTo =
		typeof buttonPressedDetails.stepToMoveTo === 'string'
			? buttonPressedDetails.stepToMoveTo
			: buttonPressedDetails.stepToMoveTo(
					wizardLayout,
					currentStepLayout as WizardStepLayout<unknown>,
			  );

	const incomingDataError = validateIncomingFormData(
		incomingStepData.currentStepId,
		incomingStepData.formData,
		wizardLayout[incomingStepData.currentStepId] as WizardStepLayout<unknown>,
	);
	if (incomingDataError) {
		return makeStepDataWithErrorMessage(
			incomingDataError,
			incomingStepData.currentStepId,
			incomingStepData.formData,
		);
	}

	if (buttonPressedDetails.onAfterStepStartValidate) {
		const validationResult =
			await buttonPressedDetails.onAfterStepStartValidate(incomingStepData);
		if (validationResult !== undefined) {
			return makeStepDataWithErrorMessage(
				validationResult,
				incomingStepData.currentStepId,
				incomingStepData.formData,
			);
		}
	}

	if (buttonPressedDetails.onBeforeStepChangeValidate) {
		const validationResult =
			await buttonPressedDetails.onBeforeStepChangeValidate(
				incomingStepData,
				currentStepLayout,
			);
		if (validationResult !== undefined) {
			return makeStepDataWithErrorMessage(
				validationResult,
				incomingStepData.currentStepId,
				incomingStepData.formData,
			);
		}
	}

	if (!buttonPressedDetails.executeStep) {
		return {
			currentStepId: stepToMoveTo,
			formData: incomingStepData.formData,
		};
	}

	const executionResult = await buttonPressedDetails.executeStep(
		incomingStepData,
		currentStepLayout,
		storageInstance,
	);
	if (typeof executionResult === 'string') {
		return makeStepDataWithErrorMessage(
			executionResult,
			incomingStepData.currentStepId,
			incomingStepData.formData,
		);
	}

	return {
		currentStepId: stepToMoveTo,
		formData: executionResult,
	};
}
