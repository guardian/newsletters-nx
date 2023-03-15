import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Specify the thrasher setup for {{name}}

Do you need a single thrasher?

Should the single thrasher appear on app and web?

Do you need one or more multi-thrashers i.e. sets where the thrasher for **{{name}}** is combined with thrashers for 2 or more other newsletters?

***NEED TO DETERMINE THE BEST WAY TO CAPTURE THIS INFORMATION - CLEARLY A CHECKBOX IS INSUFFICIENT!***

The description will appear on each thrasher e.g.

![Thrasher description](https://i.guim.co.uk/img/uploads/2023/03/15/thrasher.png?quality=85&dpr=2&width=300&s=d11e194cac6fd51bdd84fca862786501)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const thrasherLayout: WizardStepLayout = {
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
			stepToMoveTo: 'tags',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'designBrief',
			onBeforeStepChangeValidate: (stepData): string | undefined => {
				const singleThrasher = stepData.formData
					? stepData.formData['singleThrasher']
					: undefined;
				if (singleThrasher) {
					const singleThrasherLocation = stepData.formData
						? stepData.formData['singleThrasherLocation']
						: undefined;
					if (!singleThrasherLocation) {
						return 'NO SINGLE THRASHER LOCATION SELECTED';
					}
				}
				const multiThrasher = stepData.formData
					? stepData.formData['multiThrasher']
					: undefined;
				if (singleThrasher || multiThrasher) {
					const thrasherDescription = stepData.formData
						? stepData.formData['thrasherDescription']
						: undefined;
					if (!thrasherDescription) {
						return 'NO THRASHER DESCRIPTION PROVIDED';
					}
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.thrasher,
};
