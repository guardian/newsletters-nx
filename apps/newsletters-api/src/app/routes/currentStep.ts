import type { FastifyInstance } from 'fastify';
import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import type {
	CurrentStepRouteRequest,
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
import { storageInstance } from '../../services/storageInstance';

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
	app.post<{ Body: CurrentStepRouteRequest }>(
		'/v1/currentstep',
		async (req, res): Promise<CurrentStepRouteResponse> => {
			const body: CurrentStepRouteRequest = req.body;

			if (body.newsletterId === undefined) {
				return res
					.status(400)
					.send({ message: 'newsletter id is required', body: body });
			}

			let result: WizardStepData = { currentStepId: '' };
			try {
				result =
					body.buttonId !== undefined
						? await stateMachineButtonPressed(
								body.buttonId,
								{
									currentStepId: body.stepId,
									formData: body.formData,
								},
								newslettersWorkflowStepLayout,
								storageInstance,
						  )
						: setupInitialState();
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
			console.table(result.formData);

			const nextWizardStepLayout =
				newslettersWorkflowStepLayout[result.currentStepId];

			if (!nextWizardStepLayout) {
				return res
					.status(400)
					.send({ message: 'No next step found', body: body });
			}

			return {
				markdownToDisplay: nextWizardStepLayout.markdownToDisplay,
				currentStepId: result.currentStepId,
				buttons: convertWizardStepLayoutButtonsToWizardButtons(
					nextWizardStepLayout.buttons,
				),
				errorMessage: result.errorMessage,
				formData: result.formData,
			};
		},
	);
}
