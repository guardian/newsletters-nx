import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardButton,
	WizardStepData,
	WizardStepLayout,
	WizardStepLayoutButton,
} from '@newsletters-nx/state-machine';
import {
	setupInitialState,
	stateMachineButtonPressed,
} from '@newsletters-nx/state-machine';
import { storageInstance } from '../services/storageInstance';

const convertWizardStepLayoutButtonsToWizardButtons = (
	layoutButtons: WizardStepLayout['buttons'],
): CurrentStepRouteResponse['buttons'] => {
	const convertButton = (
		index: string,
		input: WizardStepLayoutButton,
	): WizardButton => {
		return {
			id: index,
			label: input.label,
			buttonType: input.buttonType,
		};
	};

	const outputRecord: CurrentStepRouteResponse['buttons'] = {};

	Object.entries(layoutButtons).forEach(([index, layoutButton]) => {
		outputRecord[index] = convertButton(index, layoutButton);
	});

	return outputRecord;
};

export async function getState(
	requestBody: CurrentStepRouteRequest,
): Promise<WizardStepData> {
	return requestBody.buttonId !== undefined
		? await stateMachineButtonPressed(
				requestBody.buttonId,
				{
					currentStepId: requestBody.stepId,
					formData: requestBody.formData,
				},
				newslettersWorkflowStepLayout,
				storageInstance,
		  )
		: await setupInitialState(requestBody, storageInstance);
}

export const getResponseFromBodyAndStateAndWizardStepLayout = (
	requestBody: CurrentStepRouteRequest,
	state: WizardStepData,
	nextWizardStepLayout: WizardStepLayout,
): CurrentStepRouteResponse => {
	const { staticMarkdown, dynamicMarkdown } = nextWizardStepLayout;

	const markdown = dynamicMarkdown
		? dynamicMarkdown(requestBody.formData, state.formData)
		: staticMarkdown;

	const currentStepRouteResponse = {
		markdownToDisplay: markdown,
		currentStepId: state.currentStepId,
		buttons: convertWizardStepLayoutButtonsToWizardButtons(
			nextWizardStepLayout.buttons,
		),
		errorMessage: state.errorMessage,
		formData: state.formData,
	};

	return currentStepRouteResponse;
};
