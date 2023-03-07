import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { setupInitialState } from './setupInitialState';
import { stateMachineButtonPressed } from './stateMachineButtonPressed';
import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
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
 * Will throw a StateMachineError if the requestBody includes
 * a request for a step which does not exist in the WizardLayout.
 */
export async function handleWizardRequest(
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout,
	draftStorage: DraftStorage,
): Promise<{ stepData: WizardStepData; nextStep: WizardStepLayout }> {
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

	const nextStep = wizardLayout[stepData.currentStepId];

	if (!nextStep) {
		throw new StateMachineError(
			`The requested step "${stepData.currentStepId}" was not found.`,
			StateMachineErrorCode.NoSuchStep,
			true,
		);
	}

	return { stepData, nextStep };
}
