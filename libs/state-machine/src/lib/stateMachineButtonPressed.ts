import type { WizardStatic, WizardStep } from './types';

export async function stateMachineButtonPressed(
	buttonPressed: string,
	step: WizardStep,
	staticState: WizardStatic,
): Promise<WizardStep> {
	const staticStep = staticState[step.currentStepId];
	const buttonPressedDetails = staticStep?.buttons[buttonPressed];

	if (!buttonPressedDetails) {
		throw new Error(
			`Button ${buttonPressed} not found in step ${step.currentStepId}`,
		);
	}

	if (buttonPressedDetails.onAfterStepStartValidate) {
		const validationResult =
			await buttonPressedDetails.onAfterStepStartValidate(step);
		if (validationResult !== undefined) {
			step.errorMessage = validationResult;
			return step;
		}
	}

	if (buttonPressedDetails.executeStep) {
		const validationResult = await buttonPressedDetails.executeStep(
			step,
			staticStep,
		);
		if (validationResult !== undefined) {
			step.errorMessage = validationResult;
			return step;
		}
	}

	if (buttonPressedDetails.onBeforeStepChangeValidate) {
		const validationResult =
			await buttonPressedDetails.onBeforeStepChangeValidate(step, staticStep);
		if (validationResult !== undefined) {
			step.errorMessage = validationResult;
			return step;
		}
	}

	step.currentStepId = buttonPressedDetails.stepToMoveTo;
	return step;
}
