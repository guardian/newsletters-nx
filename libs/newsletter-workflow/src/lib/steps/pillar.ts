import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

const markdownToDisplay = `
# Select a Pillar

Now we choose the pillar that the newletter will appear under.

For example:
news, opinion, sport, culture, lifestyle

![Pillars](wizard-screenshots/pillarScreenshot.png){:height=”50%” width=”50%”}

`.trim();

export const pillarLayout: WizardStepLayout = {
	markdownToDisplay,
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'createNewsletter',
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Headline',
			stepToMoveTo: 'signUpHeadline',
			onBeforeStepChangeValidate: (
				stepData: WizardStepData,
				stepLayout?: WizardStepLayout,
			) => {
				// if (!stepData.formData?.theme) {
				// 	return 'NO PILLAR PROVIDED';
				// }

				return undefined;
			},
		},
	},
};
