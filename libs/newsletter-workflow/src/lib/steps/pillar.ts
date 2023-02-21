import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

const markdownToDisplay = `
# Select a Pillar

Newsletters 

Now we choose the pillar that the newletter will appear under.

For example:
news, opinion, sport, culture, lifestyle


![Pillars](pillarScreenshot.png)

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
