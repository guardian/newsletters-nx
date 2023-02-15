import type { WIZARD_BUTTON_TYPES } from '@newsletters-nx/newsletters-data-client';

interface WizardStep {
	formData?: Record<string, string>;
	currentStepId: string;
	errorMessage?: string;
}

type WizardStatic = Record<string, WizardStaticStep>;

interface WizardStaticStep {
	markdownToDisplay: string;
	buttons: Record<
		string,
		{
			buttonType: keyof typeof WIZARD_BUTTON_TYPES;
			label: string;
			stepToMoveTo: string;
			executeStep?: (
				state: WizardStep,
				staticState: WizardStaticStep,
			) => Promise<string | undefined>;
			onAfterStepStartValidate?: (
				state: WizardStep,
			) => Promise<string | undefined>;
			onBeforeStepChangeValidate?: (
				state: WizardStep,
				staticState: WizardStaticStep,
			) => Promise<string | undefined>;
		}
	>;
}
