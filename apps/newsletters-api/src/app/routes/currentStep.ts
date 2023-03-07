import type { FastifyInstance } from 'fastify';
import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
} from '@newsletters-nx/state-machine';
import {
	handleWizardRequest,
	makeResponse,
	StateMachineError,
	StateMachineErrorCode,
} from '@newsletters-nx/state-machine';
import { storageInstance } from '../../services/storageInstance';

const getHttpCode = (error: StateMachineError): number => {
	switch (error.code) {
		case StateMachineErrorCode.NoSuchButton:
			return 400;
		case StateMachineErrorCode.NoSuchStep:
			return 400;
		case StateMachineErrorCode.StepMethodFailed:
			return 500;
		case StateMachineErrorCode.StorageAccessError:
			return 500;
		default:
			return 500;
	}
};

/**
 * Register the current step route for the newsletter wizard
 * TODO: This is a placeholder that will be changed to a state machine
 * @param app - Fastify instance to add the route to
 */
export function registerCurrentStepRoute(app: FastifyInstance) {
	app.post<{ Body: CurrentStepRouteRequest }>(
		'/api/currentstep',
		async (req, res): Promise<CurrentStepRouteResponse> => {
			const requestBody: CurrentStepRouteRequest = req.body;
			try {
				const { stepData, nextStep } = await handleWizardRequest(
					requestBody,
					newslettersWorkflowStepLayout,
					storageInstance,
				);
				return makeResponse(requestBody, stepData, nextStep);
			} catch (error) {
				if (error instanceof StateMachineError) {
					const errorResponse: CurrentStepRouteResponse = {
						errorMessage: error.message,
						currentStepId: requestBody.stepId,
						hasFatalError: error.isFatal,
					};
					return res.status(getHttpCode(error)).send(errorResponse);
				}

				// Any error that is not caught and coded as a StateMachineError is treated
				// unhandled as an internal error.
				// messaging may not be user-safe, so using a default message.
				console.warn('Non StateMachineError exception in currentStep handler');
				console.log(error);
				const errorResponse: CurrentStepRouteResponse = {
					errorMessage: 'UNHANDLED ERROR',
					currentStepId: requestBody.stepId,
					hasFatalError: true,
				};
				return res.status(500).send(errorResponse);
			}
		},
	);
}
