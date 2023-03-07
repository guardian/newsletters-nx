import type {
	DraftStorage,
	WIZARD_BUTTON_TYPES,
} from '@newsletters-nx/newsletters-data-client';

export type WizardFormData = Record<
	string,
	string | number | boolean | undefined
>;

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
	formData?: WizardFormData;
	currentStepId: string;
	errorMessage?: string;
}

type AsyncValidator = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	storageInstance?: DraftStorage,
) => Promise<string | undefined>;

type Validator = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	storageInstance?: DraftStorage,
) => string | undefined;

export type AsyncExecution = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	storageInstance?: DraftStorage,
) => Promise<WizardFormData | string>;

type Execution = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	storageInstance?: DraftStorage,
) => WizardFormData | string;

export interface WizardStepLayoutButton {
	buttonType: keyof typeof WIZARD_BUTTON_TYPES;
	label: string;
	stepToMoveTo: string;
	onAfterStepStartValidate?: AsyncValidator | Validator;
	onBeforeStepChangeValidate?: AsyncValidator | Validator;
	executeStep?: AsyncExecution | Execution;
}
export interface WizardStepLayout {
	staticMarkdown: string;
	dynamicMarkdown?: {
		(requestData?: WizardFormData, responseData?: WizardFormData): string;
	};
	buttons: Record<string, WizardStepLayoutButton>;
}

export type WizardLayout = Record<string, WizardStepLayout>;

/**
 * Interface for the data payload sent to by the client for a single step in the wizard.
 */
export interface CurrentStepRouteRequest {
	/** If the id is undefined then this is new otherwise pre-existing */
	id?: string;
	/** ID of the button that was pressed to get to the current step */
	buttonId?: string;
	/**ID of the step the use was on when thye pressed the button */
	stepId: string;
	/** arbitrary data entered by the user into a form before pressing the button */
	formData?: WizardFormData;
}

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
	/** arbitrary data entered by the user into a form before pressing the button */
	formData?: WizardFormData;

	/** a user-friendly error message */
	errorMessage?: string;

	/** Whether the request resulted in a fatal error, so the user shoudl not be prompted to try again */
	hasFatalError?: boolean;
}
