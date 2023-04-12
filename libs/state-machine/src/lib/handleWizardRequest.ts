import { makeResponse } from './makeResponse';
import { setupInitialState } from './setupInitialState';
import { stateMachineButtonPressed } from './stateMachineButtonPressed';
import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import { stateMachineSkipPressed } from './stateMachineSkipPressed';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	GenericStorageInterface,
	WizardLayout,
	WizardStepLayout,
} from './types';

/**
 * Execute the changes to state (if any) in response to a
 * user's request and return the CurrentStepRouteResponse.
 *
 * If the user has provided invalid or unactionable data,
 * the "next step" may be the same step that they just responded
 * to, with an errorMessage in the data indicating why the
 * submission was not accepted.
 *
 * Will throw a StateMachineError if the requestBody includes
 * a request for a step which does not exist in the WizardLayout,
 * or any of the methods defined on the WizardLayoutStep throws
 * any exceptions.
 */
export async function handleWizardRequestAndReturnWizardResponse<
	T extends GenericStorageInterface,
>(
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout<T>,
	genericInterface: T,
): Promise<CurrentStepRouteResponse> {
	try {
		const stepData =
			requestBody.stepToSkipToId !== undefined
				? await stateMachineSkipPressed(
						requestBody,
						wizardLayout as WizardLayout,
						genericInterface,
				  )
				: requestBody.buttonId !== undefined
				? await stateMachineButtonPressed(
						requestBody.buttonId,
						{
							currentStepId: requestBody.stepId,
							formData: requestBody.formData,
						},
						wizardLayout,
						genericInterface,
				  )
				: await setupInitialState(requestBody, genericInterface);

		const nextStep = wizardLayout[stepData.currentStepId];

		if (!nextStep) {
			throw new StateMachineError(
				`The requested step "${stepData.currentStepId}" was not found.`,
				StateMachineErrorCode.NoSuchStep,
				true,
			);
		}

		return makeResponse(
			requestBody,
			stepData,
			nextStep as WizardStepLayout<unknown>,
		);
	} catch (error) {
		if (error instanceof StateMachineError) {
			throw error;
		}

		// Any error that is not caught and coded as a StateMachineError is treated
		// unhandled as an internal error.
		// messaging may not be user-safe, so using a default message.
		console.warn('Non StateMachineError exception in currentStep handler');
		console.log(error);

		throw new StateMachineError(
			'UNHANDLED ERROR',
			StateMachineErrorCode.Unhandled,
			true,
		);
	}
}
