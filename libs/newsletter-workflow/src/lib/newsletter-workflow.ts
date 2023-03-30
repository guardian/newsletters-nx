import type { StepListing, WizardLayout } from '@newsletters-nx/state-machine';
import { listStepsIn } from '@newsletters-nx/state-machine';
import { launchLayout } from './steps/launchNewsletter';
import { newsletterDataLayout } from './steps/newsletterData';
import { renderingOptionsLayout } from './steps/renderingOptions';

export const newslettersWorkflowStepLayout: Record<string, WizardLayout> = {
	NEWSLETTER_DATA: newsletterDataLayout,
	LAUNCH_NEWSLETTER: launchLayout,
	RENDERING_OPTIONS: renderingOptionsLayout,
};

export const getFormSchema = (
	wizardId: keyof typeof newslettersWorkflowStepLayout,
	stepId: string,
) => {
	const wizard = newslettersWorkflowStepLayout[wizardId];
	if (!wizard) {
		return undefined;
	}
	const step = wizard[stepId];
	return step?.schema;
};

export const getStepList = (
	wizardId: keyof typeof newslettersWorkflowStepLayout,
): StepListing[] => {
	const wizard = newslettersWorkflowStepLayout[wizardId];
	if (!wizard) {
		return [];
	}

	return listStepsIn(wizard);
};
