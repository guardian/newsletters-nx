import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

const markdownToDisplay = `
# Specify the Sign Up Page Headline

This will appear on the sign up page e.g.

![Sign Up Headline](wizard-screenshots/signUpHeadlineScreenshot.png){: width="50%"}

`.trim();

export const headlineLayout: WizardStepLayout = {
	markdownToDisplay,
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'pillar',
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Finish',
			stepToMoveTo: 'finish',
			onBeforeStepChangeValidate: (
				stepData: WizardStepData,
				stepLayout?: WizardStepLayout,
			) => {
				if (!stepData.formData?.headline) {
					return 'NO HEADLINE PROVIDED';
				}

				return undefined;
			},
		},
	},
};
