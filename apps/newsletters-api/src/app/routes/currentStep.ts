import type { FastifyInstance } from 'fastify';
import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
} from '@newsletters-nx/state-machine';
import {
	getResponseFromBodyAndStateAndWizardStepLayout,
	handleWizardRequest,
} from '@newsletters-nx/state-machine';
import { storageInstance } from '../../services/storageInstance';

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

				if (!nextStep) {
					const errorResponse = {
						errorMessage: 'No next step found',
						currentStepId: body.stepId,
					};
					return res.status(400).send(errorResponse);
				}

				return getResponseFromBodyAndStateAndWizardStepLayout(
					body,
					stepData,
					nextStep,
				);
			} catch (error) {
				if (error instanceof Error) {
					const errorResponse: CurrentStepRouteResponse = {
						errorMessage: error.message,
						currentStepId: body.stepId,
					};
					return res.status(400).send(errorResponse);
				} else {
					return res.status(500).send({ errorMessage: JSON.stringify(error) });
				}
			}
		},
	);
}
