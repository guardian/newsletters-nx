import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	formDataToPartialNewsletter,
	partialNewsletterToFormData,
} from '@newsletters-nx/newsletters-data-client';
import {
	StateMachineError,
	StateMachineErrorCode,
} from '@newsletters-nx/state-machine';
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
		throw new StateMachineError(
			'no storageInstance',
			StateMachineErrorCode.StorageAccessError,
			true,
		);
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

		const draft: Partial<NewsletterData> = {
			...formDataToPartialNewsletter({
				...parseResult.data,
			}),
			...derivedFields,
		};

		const storageResponse = await storageInstance.createDraftNewsletter({
			...draft,
			listId: undefined,
		});
		if (storageResponse.ok) {
			return partialNewsletterToFormData(storageResponse.data);
		}

		return storageResponse.message;
	}

	return executeModify(stepData, stepLayout, storageInstance);
};
