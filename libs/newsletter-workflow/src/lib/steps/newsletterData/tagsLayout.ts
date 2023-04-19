import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeSkip } from "../../ececuteSkip";
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Specify the tag setup for {{name}}

## Series Tag

Please share the series tag URL for the newsletter.

For example: [tv-and-radio/series/what-s-on-tv](https://www.theguardian.com/tv-and-radio/series/what-s-on-tv) for the What's On newsletter.

*If the tag does not already exist, an email will automatically be sent to Central Production to request its production.*

## Composer tag relationship for newsletter embeds

In Composer, we now have a feature where a newsletter signup embed is proposed to the user once a tag is added to the article - find out more [here](https://docs.google.com/document/d/1HC_Y6kOStrBNwQR322N8NdiCuhyIjlUke5RWmsRUcpM/edit).

For example, the **Games (video games only)** tag recommends the user adds the **Pushing Buttons (newsletter signup)** campaign tag, which displays the sign up embed for Pushing Buttons.

Which tag(s) would you like to propose the sign up embed for **{{name}}**?

*If you would like to enable this feature, your request will automatically be emailed to Central Production.*

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const tagsLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Tag Setup',
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
			stepToMoveTo: 'thrasher',
			onBeforeStepChangeValidate: (stepData): string | undefined => {
				const seriesTag = stepData.formData
					? stepData.formData['seriesTag']
					: undefined;
				if (!seriesTag) return 'NO SERIES TAG PROVIDED';
				const composerTag = stepData.formData
					? stepData.formData['composerTag']
					: undefined;
				const composerCampaignTag = stepData.formData
					? stepData.formData['composerCampaignTag']
					: undefined;
				if (composerTag || composerCampaignTag) {
					if (!composerTag) {
						return 'ENTER AT LEAST ONE COMPOSER TAG IF SPECIFYING COMPOSER CAMPAIGN TAG';
					}
					if (!composerCampaignTag) {
						return 'ENTER COMPOSER CAMPAIGN TAG IF SPECIFYING COMPOSER TAG';
					}
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.tags,
	canSkipTo: true,
	executeSkip: executeSkip,
};
