import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { setupInitialState } from './setupInitialState';
import { stateMachineButtonPressed } from './stateMachineButtonPressed';
import type {
	CurrentStepRouteRequest,
	WizardLayout,
	WizardStepData,
	WizardStepLayout,
} from './types';

/**
 * Execute the changes to state (if any) in response to a
 * user's request and return next step in the wizardLayout
 * that the user needs to see and the
 * data to populate it with.
 *
 * If the user has provided invalid or unactionable data,
 * the "next step" may be the same step that they just responded
 * to, with an errorMessage in the data indicating why the
 * submission was not accepted.
 *
 * The nextStep returned can be undefined, which indicates an error
 * in the wizardLayout - that it has produced step data with
 * a currentStepId that does not match any step in that
 * wizardLayout.
 */
export async function handleWizardRequest(
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout,
	draftStorage: DraftStorage,
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
					draftStorage,
			  )
			: await setupInitialState(requestBody, draftStorage);

	// TO DO - should we be throwing an exception
	// if there is no nextStep? this indicates a bug in the WizardLayout
	const nextStep = wizardLayout[stepData.currentStepId];

	return { stepData, nextStep };
}
