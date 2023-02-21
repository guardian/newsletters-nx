import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

const markdownToDisplay = `
# Enter the Sign Up Page Headline

Newsletters 

This will appear on the sign up page e.g.
https://www.theguardian.com/global/2022/sep/20/sign-up-for-the-first-edition-newsletter-our-free-news-email

`.trim();

export const signUpHeadlineLayout: WizardStepLayout = {
	markdownToDisplay,
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'createNewsletter',
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Finish',
			stepToMoveTo: 'finish',
			onBeforeStepChangeValidate: (
				stepData: WizardStepData,
				stepLayout?: WizardStepLayout,
			) => {
				if (!stepData.formData?.theme) {
					return 'NO THEME PROVIDED';
				}

				return undefined;
			},
		},
	},
};
