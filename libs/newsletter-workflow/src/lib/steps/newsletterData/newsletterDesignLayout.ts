import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
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
# Add the design brief and Figma design link for {{name}}

Please share the following for **{{name}}**:
- The design brief Google document URL
- The signed off and final Figma design URL, including thrasher designs for mobile and desktop
`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const newsletterDesignLayout: WizardStepLayout<DraftStorage> = {
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
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: getPreviousOrEditStartStepId,
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			onBeforeStepChangeValidate: (stepData): string | undefined => {
				const newsletterDesignDoc = stepData.formData
					? stepData.formData['designBriefDoc']
					: undefined;
				if (!newsletterDesignDoc) return 'NO DESIGN BRIEF DOC PROVIDED';
				const figmaDesignUrl = stepData.formData
					? stepData.formData['figmaDesignUrl']
					: undefined;
				if (!figmaDesignUrl) return 'NO FIGMA DESIGN URL PROVIDED';
				const singleThrasher = stepData.formData
					? stepData.formData['singleThrasher']
					: undefined;
				const multiThrasher = stepData.formData
					? stepData.formData['multiThrasher']
					: undefined;
				if (singleThrasher || multiThrasher) {
					const figmaIncludesThrashers = stepData.formData
						? stepData.formData['figmaIncludesThrashers']
						: undefined;
					if (!figmaIncludesThrashers) {
						return 'FIGMA DESIGN MUST INCLUDE THRASHERS IF SINGLE/MULTI THRASHERS ARE REQUIRED';
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
