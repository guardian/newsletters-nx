import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from '../newsletterData/formSchemas';

const markdownTemplate = `
# Specify the footer setup for {{name}}

What email address would you like to display in the footer of **{{name}}**?

For example: newsletters@theguardian.com

![Email footer](https://i.guim.co.uk/img/uploads/2023/03/15/Email_address_contact.png?quality=85&dpr=2&width=300&s=98ce6a07791b0bfb45f2df9c732ea1d2)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const footerLayout: WizardStepLayout = {
	staticMarkdown,
	label: 'Footer Setup',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'podcast',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'finish',
			onBeforeStepChangeValidate: (stepData): string | undefined => {
				const email = stepData.formData
					? stepData.formData['renderingOptions.contactEmail']
					: undefined;
				return email ? undefined : 'NO EMAIL ADDRESS PROVIDED';
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.footer,
	canSkipTo: true,
};
