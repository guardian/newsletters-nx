import type {
	CurrentStepRouteRequest,
	WizardLayout,
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import {
	setupInitialState,
	stateMachineButtonPressed,
} from '@newsletters-nx/state-machine';
import { storageInstance } from '../services/storageInstance';

/**
 * Get the the next step in the wizardLayout and the
 * data to populate it with, based on the data provided
 * in the user's request.
 *
 * The nextStep can be undefined, which indicates an error
 * in the wizardLayout - that it has produced step data with
 * a currentStepId that does not match any step in that
 * wizardLayout.
 */
export async function getNextStepAndStepData(
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout,
): Promise<{ stepData: WizardStepData; nextStep?: WizardStepLayout }> {
	const stepData =
		requestBody.buttonId !== undefined
			? await stateMachineButtonPressed(
					requestBody.buttonId,
					{
						currentStepId: requestBody.stepId,
						formData: requestBody.formData,
					},
					wizardLayout,
					storageInstance,
			  )
			: await setupInitialState(requestBody, storageInstance);

	const nextStep = wizardLayout[stepData.currentStepId];

	return { stepData, nextStep };
}
