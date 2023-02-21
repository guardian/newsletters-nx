import type { WIZARD_BUTTON_TYPES } from '@newsletters-nx/newsletters-data-client';

/**
 * Interface for a button displayed in the wizard.
 */
export interface WizardButton {
	/** Unique identifier for the button. */
	id: string;
	/** Label displayed on the button. */
	label: string;
	/** Type of the button, mapped to a specific background and border color. */
	buttonType: keyof typeof WIZARD_BUTTON_TYPES;
}

export interface WizardStepData {
	formData?: Record<string, string>;
	currentStepId: string;
	errorMessage?: string;
}

type AsyncValidator = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
) => Promise<string | undefined>;

type Validator = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
) => string | undefined;

export interface WizardStepLayoutButton {
	buttonType: keyof typeof WIZARD_BUTTON_TYPES;
	label: string;
	stepToMoveTo: string;
	onAfterStepStartValidate?: AsyncValidator | Validator;
	executeStep?: AsyncValidator | Validator;
	onBeforeStepChangeValidate?: AsyncValidator | Validator;
}
export interface WizardStepLayout {
	markdownToDisplay: string;
	buttons: Record<string, WizardStepLayoutButton>;
}

export type WizardLayout = Record<string, WizardStepLayout>;

/**
 * Interface for the data payload sent to by the client for a single step in the wizard.
 */
export interface CurrentStepRouteRequest {
	/** If the newletterId is undefined then this is a new newsletter otherwise
	 * an existing one */
	newsletterId?: string;
	/** ID of the button that was pressed to get to the current step */
	buttonId?: string;
	/**ID of the step the use was on when thye pressed the button */
	stepId: string;
	/** arbitrary data entered by the user into a form before pressing the button */
	formData?: Record<string, string>;
}

// TO DO - define type in library for form data

/**
 * Interface for the response received from the server for a single step in the wizard.
 */
export interface CurrentStepRouteResponse {
	/** Markdown content to display for the current step. */
	markdownToDisplay?: string;
	/** Unique identifier for the current step. */
	currentStepId: string;
	/** Buttons to display for the current step. */
	buttons?: Record<string, WizardButton>;
	errorMessage?: string;
}
