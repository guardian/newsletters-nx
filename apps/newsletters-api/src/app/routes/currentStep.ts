import type { FastifyInstance } from 'fastify';
import type {
	CurrentStepRouteResponse,
	WizardButton,
	WizardStepData,
	WizardStepLayout,
	WizardStepLayoutButton,
} from '@newsletters-nx/state-machine';
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
	buttonId?: string;
}

// TODO: This is a dummy for the S3 bucket.
// Make the current step id optional
const stepData: WizardStepData = {
	currentStepId: 'createNewsletter',
};

const convertWizardStepLayoutButtonsToWizardButtons = (
	layoutButtons: WizardStepLayout['buttons'],
): CurrentStepRouteResponse['buttons'] => {
	const convertButton = (
		index: string,
		input: WizardStepLayoutButton,
	): WizardButton => {
		return {
			id: index,
			label: input.label,
			buttonType: input.buttonType,
		};
	};

	const outputRecord: CurrentStepRouteResponse['buttons'] = {};

	Object.entries(layoutButtons).forEach(([index, layoutButton]) => {
		outputRecord[index] = convertButton(index, layoutButton);
	});

	return outputRecord;
};

/**
 * Register the current step route for the newsletter wizard
 * TODO: This is a placeholder that will be changed to a state machine
 * @param app - Fastify instance to add the route to
 */
export function registerCurrentStepRoute(app: FastifyInstance) {
	app.post<{ Body: CurrentStepRouteParams }>(
		'/v1/currentstep',
		async (req, res): Promise<CurrentStepRouteResponse> => {
			const body: CurrentStepRouteParams = req.body;

			if (body.newsletterId === undefined) {
				return res
					.status(400)
					.send({ message: 'newsletter id is required', body: body });
			}
			const result =
				body.buttonId !== undefined
					? await stateMachineButtonPressed(
							body.buttonId,
							stepData,
							newslettersWorkflowStepLayout,
					  )
					: setupInitialState();

			// TODO - error handling if stateMachineButtonPressed returns error message
			const nextWizardStepLayout =
				newslettersWorkflowStepLayout[result.currentStepId];

			if (!nextWizardStepLayout) {
				throw 'no next step found.';
			}

			return {
				markdownToDisplay: nextWizardStepLayout.markdownToDisplay,
				currentStepId: result.currentStepId,
				buttons: convertWizardStepLayoutButtonsToWizardButtons(
					nextWizardStepLayout.buttons,
				),
			};
		},
	);
}
