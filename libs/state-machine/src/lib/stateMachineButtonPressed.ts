import type { WizardStatic, WizardStep } from './types';

export async function stateMachineButtonPressed(
	buttonPressed: string,
	state: WizardStep,
	staticState: WizardStatic,
): Promise<WizardStep | undefined> {
	const staticStep = staticState[state.currentStepId];
	const buttonPressedDetails = staticStep?.buttons[buttonPressed];

	if (!buttonPressedDetails) {
		throw new Error(
			`Button ${buttonPressed} not found in step ${state.currentStepId}`,
		);
	}
	if (buttonPressedDetails.onBeforeStepChangeValidate) {
		const validationResult =
			await buttonPressedDetails.onBeforeStepChangeValidate(state, staticStep);
		if (validationResult !== undefined) {
			state.errorMessage = validationResult;
			return state;
		}
	}
	if (buttonPressedDetails.executeStep) {
		const validationResult = await buttonPressedDetails.executeStep(
			state,
			staticStep,
		);
		if (validationResult !== undefined) {
			state.errorMessage = validationResult;
			return state;
		}
	}
	state.currentStepId = buttonPressedDetails.stepToMoveTo;

	if (buttonPressedDetails.onAfterStepStartValidate) {
		const validationResult =
			await buttonPressedDetails.onAfterStepStartValidate(state);
		if (validationResult !== undefined) {
			state.errorMessage = validationResult;
			return state;
		}
	}
	return state;
}
