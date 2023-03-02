import type { FastifyInstance } from 'fastify';
import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardStepData,
} from '@newsletters-nx/state-machine';
import {
	convertWizardStepLayoutButtonsToWizardButtons,
	unsafelyGetState,
} from '../state-machine';

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

			let state: WizardStepData = { currentStepId: '' };
			try {
				state = await unsafelyGetState(body);
			} catch (error) {
				if (error instanceof Error) {
					const errorResponse: CurrentStepRouteResponse = {
						errorMessage: error.message,
						currentStepId: body.stepId,
					};
					return res.status(400).send(errorResponse);
				}
			}

			console.log('checking formdata in currentstep');
			console.table(state.formData);

			const nextWizardStepLayout =
				newslettersWorkflowStepLayout[state.currentStepId];

			if (!nextWizardStepLayout) {
				return res
					.status(400)
					.send({ message: 'No next step found', body: body });
			}

			const { staticMarkdown, dynamicMarkdown } = nextWizardStepLayout;

			const markdown = dynamicMarkdown
				? dynamicMarkdown(body.formData, state.formData)
				: staticMarkdown;

			return {
				markdownToDisplay: markdown,
				currentStepId: state.currentStepId,
				buttons: convertWizardStepLayoutButtonsToWizardButtons(
					nextWizardStepLayout.buttons,
				),
				errorMessage: state.errorMessage,
				formData: state.formData,
			};
		},
	);
}
