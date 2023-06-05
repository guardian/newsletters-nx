import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardButton,
	WizardStepData,
	WizardStepLayout,
	WizardStepLayoutButton,
} from './types';

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
 * Constuct a CurrentStepRouteResponse to return
 * to the client after the request has been handled.
 *
 * Involves constructing the markdown message and converting
 * the data about the buttons on the next step to the format
 * required by the frontend.
 */
export const makeResponse = (
	requestBody: CurrentStepRouteRequest,
	state: WizardStepData,
	nextWizardStepLayout: WizardStepLayout,
): CurrentStepRouteResponse => {
	const { staticMarkdown, dynamicMarkdown } = nextWizardStepLayout;

	const markdown = dynamicMarkdown
		? dynamicMarkdown(requestBody.formData, state.formData)
		: staticMarkdown;

	const currentStepRouteResponse = {
		markdownToDisplay: markdown,
		currentStepId: state.currentStepId,
		buttons: convertWizardStepLayoutButtonsToWizardButtons(
			nextWizardStepLayout.buttons,
		),
		errorMessage: state.errorMessage,
		errorDetails: state.errorDetails,
		formData: state.formData,
	};

	return currentStepRouteResponse;
};
