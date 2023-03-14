import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { formSchemas } from './formSchemas';

const markdownToDisplay = `
# Specify the Description

This will appear on the sign up page e.g.

[comment]: <> (TODO - use URL Image Signer to resize the image)
[comment]: <> (https://uploads.guim.co.uk/2023/02/24/descScreenshot.png)
![Description](wizard-screenshots/descriptionScreenshotSmall.png)

`.trim();

export const designLinkLayout: WizardStepLayout = {
	staticMarkdown: markdownToDisplay,
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'description',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Finish',
			stepToMoveTo: 'finish',
			executeStep: executeModify,
		},
	},
	schema: formSchemas.designLink,
};
