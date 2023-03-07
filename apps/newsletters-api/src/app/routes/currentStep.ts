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
import { safeStringify } from '../safeStringify';

const getHttpCode = (error: StateMachineError): number => {
	switch (error.code) {
		case StateMachineErrorCode.NoSuchButton:
			return 501;
		case StateMachineErrorCode.NoSuchStep:
			return 501;
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
			const body: CurrentStepRouteRequest = req.body;
			try {
				const { stepData, nextStep } = await handleWizardRequest(
					body,
					newslettersWorkflowStepLayout,
					storageInstance,
				);

				// TO DO - should handleWizardRequest be throwing an exception
				// if there is no nextStep? this indicates a bug in the WizardLayout
				if (!nextStep) {
					const errorResponse: CurrentStepRouteResponse = {
						errorMessage: 'No next step found',
						currentStepId: body.stepId,
					};
					return res.status(400).send(errorResponse);
				}

				return makeResponse(body, stepData, nextStep);
			} catch (error) {
				// TO DO - define a subclass of StateMachineError in the state-machine library
				// with an enum of internal error codes.
				if (error instanceof StateMachineError) {
					const errorResponse: CurrentStepRouteResponse = {
						errorMessage: error.message,
						currentStepId: body.stepId,
						hasFatalError: error.isFatal,
					};
					return res.status(getHttpCode(error)).send(errorResponse);
				}

				if (error instanceof Error) {
					const errorResponse: CurrentStepRouteResponse = {
						errorMessage: error.message,
						currentStepId: body.stepId,
					};
					return res.status(400).send(errorResponse);
				}

				// FIX ME - in this case, the return value is not a CurrentStepRouteResponse
				// as the function signature expects

				return res.status(500).send({
					errorMessage: safeStringify(error, {
						message: 'UNHANDLED ERROR',
					}),
				});
			}
		},
	);
}
