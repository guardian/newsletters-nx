import type { FastifyInstance } from 'fastify';
import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import type { UserProfile } from '@newsletters-nx/newsletters-data-client';
import { getPermissions } from '@newsletters-nx/newsletters-data-client';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
} from '@newsletters-nx/state-machine';
import {
	handleWizardRequestAndReturnWizardResponse,
	StateMachineError,
	StateMachineErrorCode,
} from '@newsletters-nx/state-machine';
import { draftStore, launchService } from '../../services/storage';
import { getUserProfile } from '../get-user-profile';

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

const getAccessDeniedError = async (
	user: { profile?: UserProfile },
	requestBody: CurrentStepRouteRequest,
): Promise<CurrentStepRouteResponse | undefined> => {
	const permissions = await getPermissions(user.profile);
	const { wizardId, stepId } = requestBody;

	if (!permissions.launchNewsletters && wizardId === 'LAUNCH_NEWSLETTER') {
		return {
			errorMessage: 'You do not have permissions to launch a newsletter',
			currentStepId: stepId,
			hasPersistentError: true,
		};
	}

	return undefined;
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
			const user = getUserProfile(req);
			const accessDeniedError = await getAccessDeniedError(user, req.body);
			if (accessDeniedError) {
				return res.status(403).send(accessDeniedError);
			}

			const requestBody: CurrentStepRouteRequest = req.body;
			const layout = newslettersWorkflowStepLayout[requestBody.wizardId];

			if (!layout) {
				const errorResponse: CurrentStepRouteResponse = {
					errorMessage: 'No layout found',
					currentStepId: requestBody.stepId,
					hasPersistentError: true,
				};
				return res.status(400).send(errorResponse);
			}

			const serviceInterface =
				requestBody.wizardId === 'LAUNCH_NEWSLETTER'
					? launchService
					: draftStore;

			try {
				return await handleWizardRequestAndReturnWizardResponse(
					requestBody,
					layout,
					serviceInterface,
				);
			} catch (error) {
				if (error instanceof StateMachineError) {
					const errorResponse: CurrentStepRouteResponse = {
						errorMessage: error.message,
						currentStepId: requestBody.stepId,
						hasPersistentError: error.isPersistant,
					};
					return res.status(getHttpCode(error)).send(errorResponse);
				}

				const errorResponse: CurrentStepRouteResponse = {
					errorMessage: 'UNHANDLED ERROR',
					currentStepId: requestBody.stepId,
					hasPersistentError: true,
				};
				return res.status(500).send(errorResponse);
			}
		},
	);
}
