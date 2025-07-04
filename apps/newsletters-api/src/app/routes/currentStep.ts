import type { Express } from 'express';
import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import { replaceNullWithUndefinedForUnknown } from '@newsletters-nx/newsletters-data-client';
import type { UserProfile } from '@newsletters-nx/newsletters-data-client';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
} from '@newsletters-nx/state-machine';
import {
	currentStepRouteRequestSchema,
	handleWizardRequestAndReturnWizardResponse,
	StateMachineError,
	StateMachineErrorCode,
} from '@newsletters-nx/state-machine';
import { makeEmailEnvInfo } from '../../services/notifications/email-env';
import { makeSesClient } from '../../services/notifications/email-service';
import { permissionService } from '../../services/permissions';
import {
	makeDraftServiceForUser,
	makelaunchServiceForUser,
} from '../../services/storage';
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
	const permissions = await permissionService.get(user.profile);
	const { wizardId, stepId } = requestBody;

	switch (wizardId) {
		case 'LAUNCH_NEWSLETTER':
			if (!permissions.launchNewsletters) {
				return {
					errorMessage: 'You do not have permissions to launch a newsletter',
					currentStepId: stepId,
					hasPersistentError: true,
				};
			}
			break;

		case 'NEWSLETTER_DATA':
		case 'RENDERING_OPTIONS':
			if (!permissions.writeToDrafts) {
				return {
					errorMessage: 'You do not have permissions to create or edit drafts.',
					currentStepId: stepId,
					hasPersistentError: true,
				};
			}
			break;
	}

	return undefined;
};

/**
 * Register the current step route for the newsletter wizard
 * TODO: This is a placeholder that will be changed to a state machine
 * @param app - Express instance to add the route to
 */
export function registerCurrentStepRoute(app: Express) {
	app.post(
		'/api/currentstep',
		async (req, res) => {
			const user = getUserProfile(req);
			const parsedBodyResult = currentStepRouteRequestSchema.safeParse(replaceNullWithUndefinedForUnknown(req.body))
			if (!parsedBodyResult.success) {
				console.error(`invalid currentStepRouteRequest on ${req.path}`, parsedBodyResult.error.issues)
				const badDataError: CurrentStepRouteResponse = {
					currentStepId: '',
					errorMessage: "The application sent data that the server could not interpret",
					errorDetails: {
						zodIssues: parsedBodyResult.error.issues
					},
					hasPersistentError: true
				}

				return res.status(400).send(badDataError);
			}

			const currentStepRouteRequest = parsedBodyResult.data;
			const accessDeniedError = await getAccessDeniedError(user, currentStepRouteRequest);
			if (accessDeniedError) {
				return res.status(403).send(accessDeniedError);
			}

			const layout = newslettersWorkflowStepLayout[currentStepRouteRequest.wizardId];

			if (!layout) {
				const errorResponse: CurrentStepRouteResponse = {
					errorMessage: 'No layout found',
					currentStepId: currentStepRouteRequest.stepId,
					hasPersistentError: true,
				};
				return res.status(400).send(errorResponse);
			}

			const serviceInterface = user.profile
				? currentStepRouteRequest.wizardId === 'LAUNCH_NEWSLETTER'
					? makelaunchServiceForUser(user.profile)
					: makeDraftServiceForUser(
						user.profile,
						makeSesClient(),
						makeEmailEnvInfo(),
					)
				: undefined;

			if (!serviceInterface) {
				const errorResponse: CurrentStepRouteResponse = {
					errorMessage: 'FAILED to CONSTRUCT SERVICE',
					currentStepId: currentStepRouteRequest.stepId,
					hasPersistentError: true,
				};
				return res.status(500).send(errorResponse);
			}

			try {
				const response = await handleWizardRequestAndReturnWizardResponse(
					currentStepRouteRequest,
					layout,
					serviceInterface,
				)
				return res.send(response);
			} catch (error) {
				if (error instanceof StateMachineError) {
					const errorResponse: CurrentStepRouteResponse = {
						errorMessage: error.message,
						currentStepId: currentStepRouteRequest.stepId,
						hasPersistentError: error.isPersistant,
					};
					return res.status(getHttpCode(error)).send(errorResponse);
				}

				const errorResponse: CurrentStepRouteResponse = {
					errorMessage: 'UNHANDLED ERROR',
					currentStepId: currentStepRouteRequest.stepId,
					hasPersistentError: true,
				};
				return res.status(500).send(errorResponse);
			}
		},
	);
}
