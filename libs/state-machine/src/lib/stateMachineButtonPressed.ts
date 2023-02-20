import type { WizardLayout, WizardStepData } from './types';

export function setupInitialState(): WizardStepData {
	return {
		currentStepId: 'createNewsletter',
	};
}

export async function stateMachineButtonPressed(
	buttonPressed: string,
	incomingStepData: WizardStepData,
	wizardLayout: WizardLayout,
): Promise<WizardStepData> {
	const currentStepLayout = wizardLayout[incomingStepData.currentStepId];
	const buttonPressedDetails = currentStepLayout?.buttons[buttonPressed];

	if (!buttonPressedDetails) {
		throw new Error(
			`Button ${buttonPressed} not found in step ${incomingStepData.currentStepId}`,
		);
	}

	// TO DO - stop mutating the input!
	if (buttonPressedDetails.onAfterStepStartValidate) {
		const validationResult =
			await buttonPressedDetails.onAfterStepStartValidate(incomingStepData);
		if (validationResult !== undefined) {
			incomingStepData.errorMessage = validationResult;
			return incomingStepData;
		}
	}

	if (buttonPressedDetails.executeStep) {
		const validationResult = await buttonPressedDetails.executeStep(
			incomingStepData,
			currentStepLayout,
		);
		if (validationResult !== undefined) {
			incomingStepData.errorMessage = validationResult;
			return incomingStepData;
		}
	}

	if (buttonPressedDetails.onBeforeStepChangeValidate) {
		const validationResult =
			await buttonPressedDetails.onBeforeStepChangeValidate(
				incomingStepData,
				currentStepLayout,
			);
		if (validationResult !== undefined) {
			incomingStepData.errorMessage = validationResult;
			return incomingStepData;
		}
	}

	const returnValue = {
		...incomingStepData,
		currentStepId: buttonPressedDetails.stepToMoveTo,
	};
	return returnValue;
}
