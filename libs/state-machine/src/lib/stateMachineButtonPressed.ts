import { getFormSchema } from '../schemas';
import type { StorageInterface, WizardLayout, WizardStepData } from './types';

export function setupInitialState(): WizardStepData {
	return {
		currentStepId: 'createNewsletter', //  TO DO - this needs to be generalised - each WizardLayout could have a different initial step
	};
}

/**
 * Perform the vaidation and actions required for a button press.Result a
 * new WizardStepData containing either:
 *
 *  - a copy of the incomingStepData with an error message added if the step
 * failed; or
 *  - the currentStepId for the next step and the submitted form data
 *  if the step was success
 */
export async function stateMachineButtonPressed(
	buttonPressed: string,
	incomingStepData: WizardStepData,
	wizardLayout: WizardLayout,
	storageInstance: StorageInterface,
): Promise<WizardStepData> {
	const currentStepLayout = wizardLayout[incomingStepData.currentStepId];
	const buttonPressedDetails = currentStepLayout?.buttons[buttonPressed];

	const formSchemaForIncomingStep = getFormSchema(
		incomingStepData.currentStepId,
	);
	console.log('form data should be:', formSchemaForIncomingStep?.description);
	console.table(incomingStepData.formData);

	if (!buttonPressedDetails) {
		throw new Error(
			`Button ${buttonPressed} not found in step ${incomingStepData.currentStepId}`,
		);
	}

	if (formSchemaForIncomingStep) {
		if (!incomingStepData.formData) {
			return {
				...incomingStepData,
				errorMessage: 'MISSING FORM DATA',
			};
		}

		const parseResult = formSchemaForIncomingStep.safeParse(
			incomingStepData.formData,
		);
		if (!parseResult.success) {
			return {
				...incomingStepData,
				errorMessage: 'INVALID FORM DATA',
			};
		}
	}

	if (buttonPressedDetails.onAfterStepStartValidate) {
		const validationResult =
			await buttonPressedDetails.onAfterStepStartValidate(incomingStepData);
		if (validationResult !== undefined) {
			return {
				...incomingStepData,
				errorMessage: validationResult,
			};
		}
	}

	if (buttonPressedDetails.executeStep) {
		const validationResult = await buttonPressedDetails.executeStep(
			incomingStepData,
			currentStepLayout,
			storageInstance,
		);
		if (validationResult !== undefined) {
			return {
				...incomingStepData,
				errorMessage: validationResult,
			};
		}
	}

	if (buttonPressedDetails.onBeforeStepChangeValidate) {
		const validationResult =
			await buttonPressedDetails.onBeforeStepChangeValidate(
				incomingStepData,
				currentStepLayout,
			);
		if (validationResult !== undefined) {
			return {
				...incomingStepData,
				errorMessage: validationResult,
			};
		}
	}

	return {
		currentStepId: buttonPressedDetails.stepToMoveTo,
		formData: incomingStepData.formData,
	};
}
