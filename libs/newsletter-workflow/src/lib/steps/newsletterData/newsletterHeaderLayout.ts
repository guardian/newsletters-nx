import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Specify the header setup for {{name}}

## Date

Should the publication date display in each edition?

This is typically shown for daily emails, but not for weekly ones.

![Date](https://i.guim.co.uk/img/uploads/2023/03/15/Date.png?quality=85&dpr=2&width=300&s=815d857cb40089e47f501bf6d5838c2a)

## Standfirst

Would you like this to be displayed?

![Standfirst](https://i.guim.co.uk/img/uploads/2023/03/15/Standfirst.png?quality=85&dpr=2&width=300&s=52779b0975a45a2cc9e4ae3a6b034aac)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const newsletterHeaderLayout: WizardStepLayout = {
	staticMarkdown,
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
			stepToMoveTo: 'signUp',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'image',
			executeStep: executeModify,
		},
	},
	schema: formSchemas.newsletterHeader,
};
