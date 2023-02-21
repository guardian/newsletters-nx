import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

const markdownToDisplay = `
# Specify the Description

This will appear on the sign up page e.g.

[comment]: <> (TODO - use URL Image Signer to resize the image)
![Sign Up Page Headline](https://uploads.guim.co.uk/2023/02/21/signUpHeadlineScreenshot.png)

`.trim();

export const descriptionLayout: WizardStepLayout = {
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
				if (!stepData.formData?.description) {
					return 'NO DESCRIPTION PROVIDED';
				}

				return undefined;
			},
		},
	},
};
