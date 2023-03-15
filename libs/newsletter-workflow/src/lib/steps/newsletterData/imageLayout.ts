import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Specify the image caption setup for {{name}}

Would you like captions to be displayed within the newsletter?

![Image captions](https://i.guim.co.uk/img/uploads/2023/03/15/Image_captions.png?quality=85&dpr=2&width=300&s=98e19bf182b3aaa690d5436f8ec0562b)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const imageLayout: WizardStepLayout = {
	staticMarkdown,
	label: 'Images',
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
			stepToMoveTo: 'newsletterHeader',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'readMore',
			executeStep: executeModify,
		},
	},
	schema: formSchemas.images,
};
