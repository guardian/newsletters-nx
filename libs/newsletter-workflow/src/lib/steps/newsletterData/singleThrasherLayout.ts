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
## Specify the single thrasher setup for {{name}}

Do you need a single thrasher?

Should the single thrasher appear on app and web?

The description will appear on each thrasher e.g.

![Thrasher description](https://i.guim.co.uk/img/uploads/2023/05/16/single-thrasher.png?quality=85&dpr=2&width=300&s=d30c77a6c732f5e85af3e11318128f2e)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const singleThrasherLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Single Thrasher',
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
			onBeforeStepChangeValidate: (stepData) => {
				const singleThrasher = stepData.formData
					? stepData.formData['thrasherOptions.singleThrasher']
					: undefined;
				const multiThrashers = stepData.formData
					? (stepData.formData[
							'thrasherOptions.multiThrashers'
					  ] as unknown as Array<{
							thrasher1: string;
							thrasher2: string;
							thrasher3: string;
					  }>)
					: undefined;

				if (singleThrasher) {
					const singleThrasherLocation = stepData.formData
						? stepData.formData['thrasherOptions.singleThrasherLocation']
						: undefined;
					if (!singleThrasherLocation) {
						return { message: 'NO SINGLE THRASHER LOCATION SELECTED' };
					}
				}

				if (singleThrasher || (multiThrashers && multiThrashers.length > 0)) {
					const thrasherDescription = stepData.formData
						? stepData.formData['thrasherOptions.thrasherDescription']
						: undefined;
					if (!thrasherDescription) {
						return { message: 'NO THRASHER DESCRIPTION PROVIDED' };
					}
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.singleThrasher,
	canSkipTo: true,
	executeSkip: executeSkip,
};
