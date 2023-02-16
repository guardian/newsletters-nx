import type { WizardLayout, WizardStepData } from './types';

export function setupInitialState(): WizardStepData {
	return {
		currentStepId: 'createNewsletter',
	};
}

export async function stateMachineButtonPressed(
	buttonPressed: string,
	stepData: WizardStepData,
	stepLayout: WizardLayout,
): Promise<WizardStepData> {
	const wizardStepLayout = stepLayout[stepData.currentStepId];
	const buttonPressedDetails = wizardStepLayout?.buttons[buttonPressed];

	if (!buttonPressedDetails) {
		throw new Error(
			`Button ${buttonPressed} not found in step ${stepData.currentStepId}`,
		);
	}

	if (buttonPressedDetails.onAfterStepStartValidate) {
		const validationResult =
			await buttonPressedDetails.onAfterStepStartValidate(stepData);
		if (validationResult !== undefined) {
			stepData.errorMessage = validationResult;
			return stepData;
		}
	}

	if (buttonPressedDetails.executeStep) {
		const validationResult = await buttonPressedDetails.executeStep(
			stepData,
			wizardStepLayout,
		);
		if (validationResult !== undefined) {
			stepData.errorMessage = validationResult;
			return stepData;
		}
	}

	if (buttonPressedDetails.onBeforeStepChangeValidate) {
		const validationResult =
			await buttonPressedDetails.onBeforeStepChangeValidate(
				stepData,
				wizardStepLayout,
			);
		if (validationResult !== undefined) {
			stepData.errorMessage = validationResult;
			return stepData;
		}
	}

	const returnValue = {
		...stepData,
		currentStepId: buttonPressedDetails.stepToMoveTo,
	};
	return returnValue;
}
