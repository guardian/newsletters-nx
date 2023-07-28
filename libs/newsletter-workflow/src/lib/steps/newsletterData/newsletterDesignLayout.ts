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
## Add the design brief and Figma design link for {{name}}

Please share the following for **{{name}}**:
- The design brief Google document URL
- The signed off and final Figma design URL, including thrasher designs for mobile and desktop
`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const newsletterDesignLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Newsletter Design',
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
				const newsletterDesignDoc = stepData.formData
					? stepData.formData['designBriefDoc']
					: undefined;
				if (!newsletterDesignDoc) {
					return { message: 'NO DESIGN BRIEF DOC PROVIDED' };
				}
				const figmaDesignUrl = stepData.formData
					? stepData.formData['figmaDesignUrl']
					: undefined;
				if (!figmaDesignUrl) {
					return { message: 'NO FIGMA DESIGN URL PROVIDED' };
				}
				const singleThrasher = stepData.formData
					? stepData.formData['thrasherOptions.singleThrasher']
					: undefined;
				const multiThrashers = stepData.formData
					? stepData.formData['thrasherOptions.multiThrashers']
					: undefined;
				if (singleThrasher || multiThrashers) {
					const figmaIncludesThrashers = stepData.formData
						? stepData.formData['figmaIncludesThrashers']
						: undefined;
					if (!figmaIncludesThrashers) {
						return {
							message:
								'FIGMA DESIGN MUST INCLUDE THRASHERS IF SINGLE/MULTI THRASHERS ARE REQUIRED',
						};
					}
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.newsletterDesign,
	canSkipTo: true,
	executeSkip: executeSkip,
};
