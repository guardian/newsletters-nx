import type { WIZARD_BUTTON_TYPES } from '@newsletters-nx/newsletters-data-client';

export interface WizardStepData {
	formData?: Record<string, string>;
	currentStepId: string;
	errorMessage?: string;
}
export interface WizardStepLayout {
	markdownToDisplay: string;
	buttons: Record<
		string,
		{
			buttonType: keyof typeof WIZARD_BUTTON_TYPES;
			label: string;
			stepToMoveTo: string;
			onAfterStepStartValidate?: (
				stepData: WizardStepData,
			) => Promise<string | undefined>;
			executeStep?: (
				stepData: WizardStepData,
				stepLayout: WizardStepLayout,
			) => Promise<string | undefined>;
			onBeforeStepChangeValidate?: (
				stepData: WizardStepData,
				stepLayout: WizardStepLayout,
			) => Promise<string | undefined>;
		}
	>;
}

export type WizardLayout = Record<string, WizardStepLayout>;

/**
 * Interface for the response received from the server for a single step in the wizard.
 */
export interface CurrentStepRouteResponse {
	/** Markdown content to display for the current step. */
	markdownToDisplay?: string;
	/** Unique identifier for the current step. */
	currentStepId: string;
	/** Buttons to display for the current step. */
	buttons?: Record<
		string,
		{
			/** Label displayed on the button. */
			label: string;
			/** Type of the button, mapped to a specific background and border color. */
			buttonType: keyof typeof WIZARD_BUTTON_TYPES;
			/** Unique identifier for the button. */
			id: string;
		}
	>;
}
