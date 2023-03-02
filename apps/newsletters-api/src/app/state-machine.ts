import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import type {
	CurrentStepRouteRequest,
	WizardStepData,
} from '@newsletters-nx/state-machine';
import {
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
