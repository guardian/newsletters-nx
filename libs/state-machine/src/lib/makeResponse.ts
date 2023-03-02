import { convertWizardStepLayoutButtonsToWizardButtons } from './convertButtons';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardStepData,
	WizardStepLayout,
} from './types';

export const getResponseFromBodyAndStateAndWizardStepLayout = (
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
		formData: state.formData,
	};

	return currentStepRouteResponse;
};
