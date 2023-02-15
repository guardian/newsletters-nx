import type { WIZARD_BUTTON_TYPES } from '@newsletters-nx/newsletters-data-client';

interface WizardStep {
	formData?: Record<string, string>;
	currentStepId: string;
	errorMessage?: string;
}
interface WizardStepLayout {
	markdownToDisplay: string;
	buttons: Record<
		string,
		{
			buttonType: keyof typeof WIZARD_BUTTON_TYPES;
			label: string;
			stepToMoveTo: string;
			onAfterStepStartValidate?: (
				step: WizardStep,
			) => Promise<string | undefined>;
			executeStep?: (
				step: WizardStep,
				stepLayout: WizardStepLayout,
			) => Promise<string | undefined>;
			onBeforeStepChangeValidate?: (
				step: WizardStep,
				stepLayout: WizardStepLayout,
			) => Promise<string | undefined>;
		}
	>;
}

type WizardLayout = Record<string, WizardStepLayout>;
