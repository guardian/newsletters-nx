import type { FastifyInstance } from 'fastify';
import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
} from '@newsletters-nx/state-machine';
import {
	handleWizardRequest,
	makeResponse,
} from '@newsletters-nx/state-machine';
import { storageInstance } from '../../services/storageInstance';
import { safeStringify } from '../safeStringify';

/**
 * Register the current step route for the newsletter wizard
 * TODO: This is a placeholder that will be changed to a state machine
 * @param app - Fastify instance to add the route to
 */
export function registerCurrentStepRoute(app: FastifyInstance) {
	app.post<{ Body: CurrentStepRouteRequest }>(
		'/currentstep',
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
				if (error instanceof Error) {
					const errorResponse: CurrentStepRouteResponse = {
						errorMessage: error.message,
						currentStepId: body.stepId,
					};
					return res.status(400).send(errorResponse);
				} else {
					// FIX ME - in this case, the return value is not a CurrentStepRouteResponse
					// as the function signature expects

					return res.status(500).send({
						errorMessage: safeStringify(error, {
							message: 'UNHANDLED ERROR',
						}),
					});
				}
			}
		},
	);
}
