import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type { StepFindFunction, WizardStepLayout } from './types';

const isNormalStep = (step: WizardStepLayout) =>
	step.parentStepId === undefined && step.role === undefined;

export const goToNextNormalStep: StepFindFunction = (wizard, step) => {
	const allIds: string[] = Object.keys(wizard);
	const allSteps: WizardStepLayout[] = Object.values(wizard);

	const indexOfCurrentStep = allSteps.indexOf(step);

	console.log(
		'current step is',
		indexOfCurrentStep,
		allIds[indexOfCurrentStep],
	);

	if (indexOfCurrentStep === -1) {
		throw new StateMachineError(
			'step is not part of wizard',
			StateMachineErrorCode.NoSuchStep,
			true,
		);
	}

	const followingIds = allIds.slice(indexOfCurrentStep + 1);
	const followingSteps = allSteps.slice(indexOfCurrentStep + 1);

	const indexOfNextStep = followingSteps.findIndex(isNormalStep);
	const idOfNextStep = followingIds[indexOfNextStep];

	if (!idOfNextStep) {
		throw new StateMachineError(
			'Could not find a next normal step',
			StateMachineErrorCode.NoSuchStep,
			true,
		);
	}

	console.log('next normal step', idOfNextStep);

	return idOfNextStep;
};
