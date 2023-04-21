import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type { StepFindFunction, WizardLayout, WizardStepLayout } from './types';

const isNormalStep = (step: WizardStepLayout) =>
	step.parentStepId === undefined && step.role === undefined;

const isNormalStepOrEditStart = (step: WizardStepLayout) =>
	step.parentStepId === undefined &&
	(step.role === undefined || step.role === 'EDIT_START');

const isNormalStepOrCreateStart = (step: WizardStepLayout) =>
	step.parentStepId === undefined &&
	(step.role === undefined || step.role === 'CREATE_START');

const getContext = (wizard: WizardLayout, step: WizardStepLayout) => {
	const allIds: string[] = Object.keys(wizard);
	const allSteps: WizardStepLayout[] = Object.values(wizard);
	const indexOfCurrentStep = allSteps.indexOf(step);
	if (indexOfCurrentStep === -1) {
		throw new StateMachineError(
			'step is not part of wizard',
			StateMachineErrorCode.NoSuchStep,
			true,
		);
	}
	return { allIds, allSteps, indexOfCurrentStep };
};

export const goToNextNormalStep: StepFindFunction = (wizard, step) => {
	const { allIds, allSteps, indexOfCurrentStep } = getContext(wizard, step);
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
	return idOfNextStep;
};

export const goToPreviousNormalStepOrStartForPath: StepFindFunction = (
	wizard,
	step,
	isEditPath,
) => {
	const { allIds, allSteps, indexOfCurrentStep } = getContext(wizard, step);
	const previousIds = allIds.slice(0, indexOfCurrentStep).reverse();
	const previousSteps = allSteps.slice(0, indexOfCurrentStep).reverse();

	const indexOfPreviousStep = previousSteps.findIndex(
		isEditPath ? isNormalStepOrEditStart : isNormalStepOrCreateStart,
	);
	const idOfPreviousStep = previousIds[indexOfPreviousStep];

	if (!idOfPreviousStep) {
		throw new StateMachineError(
			'Could not find a previous step',
			StateMachineErrorCode.NoSuchStep,
			true,
		);
	}
	return idOfPreviousStep;
};

export const goToPreviousStepOnEditPath: StepFindFunction = (wizard, step) => {
	const { allIds, allSteps, indexOfCurrentStep } = getContext(wizard, step);
	const previousIds = allIds.slice(0, indexOfCurrentStep).reverse();
	const previousSteps = allSteps.slice(0, indexOfCurrentStep).reverse();

	const indexOfPreviousStep = previousSteps.findIndex(isNormalStepOrEditStart);
	const idOfPreviousStep = previousIds[indexOfPreviousStep];

	if (!idOfPreviousStep) {
		throw new StateMachineError(
			'Could not find a previous step',
			StateMachineErrorCode.NoSuchStep,
			true,
		);
	}
	return idOfPreviousStep;
};
