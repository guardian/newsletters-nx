import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

const markdownToDisplay = `
# Specify the Sign Up Page Headline

Newsletters 

Now we choose the pillar that the newletter will appear under.

For example:
news, opinion, sport, culture, lifestyle


![Pillars](pillarScreenshot.png)

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
