import type { FastifyInstance } from 'fastify';
import type { WizardStepData } from '@newsletters-nx/state-machine';
import {
	setupInitialState,
	stateMachineButtonPressed,
} from '@newsletters-nx/state-machine';
import { newslettersWorkflowStepLayout } from './newsletterWorkflow';

interface CurrentStepRouteParams {
	/** If the newletterId is undefined then this is a new newsletter otherwise
	 * an existing one */
	newsletterId?: string;
	/** ID of the button that was pressed to get to the current step */
	buttonPressed?: string;
}

// TODO: This is a dummy for the S3 bucket.
// Make the current step id optional
let stepData: WizardStepData = {
	currentStepId: 'createNewsletter',
};

/**
 * Register the current step route for the newsletter wizard
 * TODO: This is a placeholder that will be changed to a state machine
 * @param app - Fastify instance to add the route to
 */
export function registerCurrentStepRoute(app: FastifyInstance) {
	app.post<{ Body: CurrentStepRouteParams }>(
		'/v1/currentstep',
		async (req, res) => {
			const body: CurrentStepRouteParams = req.body;

			if (body.newsletterId === undefined) {
				return res
					.status(400)
					.send({ message: 'newsletter id is required', body: body });
			}
			const result =
				body.buttonPressed !== undefined
					? await stateMachineButtonPressed(
							body.buttonPressed,
							stepData,
							newslettersWorkflowStepLayout,
					  )
					: setupInitialState();

			// TODO: This is ugly, we would be better with a better response.
			if (typeof result === 'string') {
				return res.status(400).send({ message: result });
			}
			stepData = result;

			return {
				markdownToDisplay:
					'# From the API\n\nThis is the markdown from the API',
				currentStepId: stepData.currentStepId,
				buttons: newslettersWorkflowStepLayout[stepData.currentStepId]?.buttons,
			};
		},
	);
}
