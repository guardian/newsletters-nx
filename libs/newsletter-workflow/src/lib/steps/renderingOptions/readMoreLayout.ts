import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from '../newsletterData/formSchemas';

const markdownTemplate = `
# Rendering 'Read More' sections in {{name}}

At the end of some sections in **{{name}}** you may wish to have a link encouraging the reader to 'Read more on the Guardian'.

![Read More](https://i.guim.co.uk/img/uploads/2023/03/15/Read_More_links.png?quality=85&dpr=2&width=300&s=1021b8ae17a7c52b4b3c62ebc94a8517)

In order to render that link at the end of one or more sections, you need to specify the following for each:
- the subheading that will trigger the display of the Read More link (the link will be displayed wherever the subheading is used)
- the wording to display e.g. Read more on the Guardian
- the URL of the page that will open when the reader clicks on the link

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const readMoreLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Read More Sections',
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
			label: 'Back',
			stepToMoveTo: getPreviousOrEditStartStepId,
			executeStep: executeModify,
		},
		next: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			onBeforeStepChangeValidate: (stepData): string | undefined => {
				const readMoreDetails = stepData.formData
					? (stepData.formData[
							'renderingOptions.readMoreSections'
					  ] as unknown as Array<{
							subheading: string;
							wording: string;
							url: string;
					  }>)
					: undefined;
				if (readMoreDetails) {
					if (Array.isArray(readMoreDetails)) {
						const invalidReadMoreDetails = readMoreDetails.filter(
							(readMoreEntry) =>
								!readMoreEntry.subheading ||
								!readMoreEntry.wording ||
								!readMoreEntry.url,
						);
						if (invalidReadMoreDetails.length > 0) {
							return 'ALL READ MORE DETAILS MUST BE SPECIFIED FOR A CONFIGURATION';
						}
					}
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.readMore,
	canSkipTo: true,
	executeSkip: executeModify,
};
