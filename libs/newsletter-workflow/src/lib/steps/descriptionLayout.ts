import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../executeModify';
import { formSchemas } from '../schemas';

const markdownToDisplay = `
# Specify the Description

This will appear on the sign up page e.g.

[comment]: <> (TODO - use URL Image Signer to resize the image)
[comment]: <> (https://uploads.guim.co.uk/2023/02/24/descScreenshot.png)
![Description](wizard-screenshots/descriptionScreenshotSmall.png)

`.trim();

export const descriptionLayout: WizardStepLayout = {
	staticMarkdown: markdownToDisplay,
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'pillar',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Finish',
			stepToMoveTo: 'finish',
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const description: string | number | boolean | undefined =
					stepData.formData ? stepData.formData['description'] : undefined;
				if (!description) {
					return 'NO DESCRIPTION PROVIDED';
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.description,
};
