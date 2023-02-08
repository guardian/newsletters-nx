/**
 * The current step is taken from the newletter's step property.
 * The route returns the buttons to display for the new state as well as any form elements
 */

import type { FastifyInstance } from 'fastify';

interface CurrentStepRouteParams {
	/** If the newletterId is undefined then this is a new newsletter otherwise
	 * an existing one */
	newsletterId?: string;
	pressedButtonId?: string;
}

/* Why is this return xml instead of json? */
export function registerCurrentStepRoute(app: FastifyInstance) {
	app.get<{ Params: CurrentStepRouteParams }>('/v1/currentStep', (req, res) => {
		//const { newsletterId, pressedButtonId } = req.params;
		res.header('Content-Type', 'application/json');
		return {
			markdownToDisplay: '# From the API\n\nThis is the markdown from the API',
			currentStepId: 'step1',
			buttons: [
				{ label: 'Next', buttonType: 'GREEN', id: 'next' },
				{ label: 'Back', buttonType: 'RED', id: 'back' },
			],
		};
	});
}
