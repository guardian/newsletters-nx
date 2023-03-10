import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Emailing Central Production

***DEPENDING ON THE DATA ENTERED ON THE TAGS PAGE OF THE WIZARD, RENDER ONE OF THE FOLLOWING***

***EITHER***

Emails have been sent to Central Production, requesting:
- the creation of the series tag <INSERT SERIES TAG HERE>
- the creation of relationship between the <INSERT TAG HERE> and **{{name}}** newsletter

Once responses have been received confirming their creation, the wizard will automatically progress to the next step.

***OR***

An email has been sent to Central Production, requesting the creation of relationship between the <INSERT TAG HERE> and **{{name}}** newsletter.

Once a response has been received confirming its creation, the wizard will automatically progress to the next step.

***IF NO AUTOMATED ACTIONS RESULTED FROM THE TAGS PAGE OF THE WIZARD, THIS STEP WILL BE OMITTED, AND THE FOLLOWING STEP WILL BE DISPLAYED INSTEAD***

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const emailCentralProductionLayout: WizardStepLayout = {
	staticMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
	buttons: {},
};
