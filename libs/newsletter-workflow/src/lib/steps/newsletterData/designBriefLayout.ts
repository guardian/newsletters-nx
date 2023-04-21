import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Add the design brief and Figma design link for {{name}}

Please share the following for **{{name}}**:
- the design brief Google document
- the signed off Figma design URL

Does the Figma design file include images designs for thrashers?

If so, please ensure the thrasher images are provided for both desktop and mobile widths.

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const designBriefLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Design Brief',
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
			stepToMoveTo: 'thrasher',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'signUpPage',
			onBeforeStepChangeValidate: (stepData): string | undefined => {
				const designBriefDoc = stepData.formData
					? stepData.formData['designBriefDoc']
					: undefined;
				if (!designBriefDoc) return 'NO DESIGN BRIEF DOC PROVIDED';
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
	schema: formSchemas.designBrief,
	canSkipTo: true,
	executeSkip: executeSkip,
};
