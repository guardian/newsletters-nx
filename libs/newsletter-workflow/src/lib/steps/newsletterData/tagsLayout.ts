import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
## Specify the tag setup for {{name}}

### Series Tag

Please share the series tag URL & description for the newsletter.

For example: [tv-and-radio/series/what-s-on-tv](https://www.theguardian.com/tv-and-radio/series/what-s-on-tv) for the What's On newsletter.

### Composer tag relationship for newsletter embeds

In Composer, we now have a feature where a newsletter signup embed is proposed to the user once a tag is added to the article - find out more [here](https://docs.google.com/document/d/1HC_Y6kOStrBNwQR322N8NdiCuhyIjlUke5RWmsRUcpM/edit).

For example, the **Games (video games only)** tag recommends the user adds the **Pushing Buttons (newsletter signup)** campaign tag, which displays the sign up embed for Pushing Buttons.

Which tag(s) would you like to propose the sign up embed for **{{name}}**?

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const tagsLayout: WizardStepLayout<DraftService> = {
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
			buttonType: 'PREVIOUS',
			label: 'Back to previous step',
			stepToMoveTo: getPreviousOrEditStartStepId,
			executeStep: executeSkip,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
			onBeforeStepChangeValidate: (stepData) => {
				if (!stepData.formData) {
					return undefined;
				}
				const seriesTag = stepData.formData['seriesTag'] ?? undefined;
				const seriesTagDescription = stepData.formData['seriesTagDescription'] ?? undefined;
				if (seriesTag && !seriesTagDescription) {
					return {
						message: 'Series tag description is required if series tag specified',
					};
				}
				const composerTag = stepData.formData['composerTag'] ?? undefined;
				const composerCampaignTag = stepData.formData['composerCampaignTag'] ?? undefined;
				if (composerTag || composerCampaignTag) {
					if (!composerTag) {
						return {
							message:
								'Enter at least one composer tag if specifying composer campaign tag',
						};
					}
					if (!composerCampaignTag) {
						return {
							message: 'Enter composer campaign tag if specifying composer tag',
						};
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
