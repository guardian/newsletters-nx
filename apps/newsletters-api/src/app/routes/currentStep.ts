import type { FastifyInstance } from 'fastify';
import type { WizardButtonProps } from '@newsletters-nx/newsletters-data-client';

interface CurrentStepRouteParams {
	/** If the newletterId is undefined then this is a new newsletter otherwise
	 * an existing one */
	newsletterId?: string;
	/** ID of the button that was pressed to get to the current step */
	pressedButtonId?: string;
}

/**
 * Register the current step route for the newsletter wizard
 * TODO: This is a placeholder that will be changed to a state machine
 * @param app - Fastify instance to add the route to
 */
export function registerCurrentStepRoute(app: FastifyInstance) {
	app.get<{ Params: CurrentStepRouteParams }>('/v1/currentStep', (req, res) => {
		const backButton: Omit<WizardButtonProps, 'onClick'> = {
			label: 'Back',
			buttonType: 'RED',
			id: 'back',
		};
		const nextButton: Omit<WizardButtonProps, 'onClick'> = {
			label: 'Next',
			buttonType: 'GREEN',
			id: 'next',
		};

		return {
			markdownToDisplay: '# From the API\n\nThis is the markdown from the API',
			currentStepId: 'step1',
			buttons: [backButton, nextButton],
		};
	});
}
