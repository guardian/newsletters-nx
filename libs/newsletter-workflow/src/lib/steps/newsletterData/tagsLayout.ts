import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Specify the Tags

## Series Tag

What is the URL showing the Series tag for **{{name}}**?

For example: [https://www.theguardian.com/tv-and-radio/series/what-s-on-tv](https://www.theguardian.com/tv-and-radio/series/what-s-on-tv) for the **What's On** newsletter

## Composer Tag Relationship

In Composer, we now have a feature where a newsletter signup embed is proposed when a tag is added to an article

For example, the **Gaming** tag recommends the **Pushing Buttons** newsletter signup

How would you like this to work?

***ARE WE GOING TO CAPTURE THIS INFORMATION AS A FREEFORM FIELD AND EMAIL IT TO CENTRAL PRODUCTION ONCE THE DATA COLLECTION SECTION OF THE WIZARD HAS BEEN COMPLETED?***

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const tagsLayout: WizardStepLayout = {
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
			stepToMoveTo: 'onlineArticle',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'designBrief',
			executeStep: executeModify,
		},
	},
};
