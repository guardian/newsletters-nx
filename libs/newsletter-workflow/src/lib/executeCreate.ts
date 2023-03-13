import type {
	AsyncExecution,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { formSchemas } from '../lib/steps/newsletterData/formSchemas';
import { calculateFieldsFromName } from './calculateFieldsFromName';
import { executeModify } from './executeModify';

export const executeCreate: AsyncExecution = async (
	stepData,
	stepLayout,
	storageInstance,
): Promise<WizardFormData | string> => {
	const schema = formSchemas['startDraftNewsletter']; // TODO - this needs to be generalised
	if (!storageInstance) {
		throw new Error('no storageInstance');
	}

	const parseResult = schema.safeParse(stepData.formData);
	if (!parseResult.success) {
		return `Form data is invalid for schema: ${
			schema.description ?? '[no description]'
		}`;
	}

	const listId = stepData.formData ? stepData.formData['listId'] : undefined;
	if (!listId) {
		// TO DO - calculating fields from the Name at this point is not generic
		// would it be better done somewhere else?
		const derivedFields =
			typeof parseResult.data.name === 'string' && !!parseResult.data.name
				? calculateFieldsFromName(parseResult.data.name)
				: {};
		const storageResponse = await storageInstance.createDraftNewsletter({
			...parseResult.data,
			...derivedFields,
			listId: undefined,
		});
		if (storageResponse.ok) {
			console.log(
				'createNewsletter step has updated storage.',
				storageInstance,
			);
			return storageResponse.data;
		}

		return storageResponse.message;
	}

	return executeModify(stepData, stepLayout, storageInstance);
};
