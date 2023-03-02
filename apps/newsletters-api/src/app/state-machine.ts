import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import {
	convertWizardStepLayoutButtonsToWizardButtons,
	setupInitialState,
	stateMachineButtonPressed,
} from '@newsletters-nx/state-machine';
import { storageInstance } from '../services/storageInstance';

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
