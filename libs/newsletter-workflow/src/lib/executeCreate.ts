import { buildTestMessage } from '@newsletters-nx/email-builder';
import type {
	DraftNewsletterData,
	DraftService,
} from '@newsletters-nx/newsletters-data-client';
import {
	draftNewsletterDataToFormData,
	formDataToDraftNewsletterData,
	getEmptySchemaData,
	newsletterDataSchema,
} from '@newsletters-nx/newsletters-data-client';
import {
	StateMachineError,
	StateMachineErrorCode,
} from '@newsletters-nx/state-machine';
import type { AsyncExecution } from '@newsletters-nx/state-machine';

const defaultDraftNewsletterValues: DraftNewsletterData = {
	brazeCampaignCreationsStatus: 'NOT_REQUESTED',
	ophanCampaignCreationsStatus: 'NOT_REQUESTED',
	tagCreationsStatus: 'NOT_REQUESTED',
	signupPageCreationsStatus: 'NOT_REQUESTED',
} as const;

export const executeCreate: AsyncExecution<DraftService> = async (
	stepData,
	stepLayout,
	draftService,
) => {
	console.log('EXECUTE CREATE', { client: draftService?.emailClient });

	if (!draftService) {
		throw new StateMachineError(
			'no draft service',
			StateMachineErrorCode.StorageAccessError,
			true,
		);
	}

	const schema = stepLayout?.schema;
	if (!schema) {
		throw new StateMachineError(
			'schema not defined',
			StateMachineErrorCode.StepMethodFailed,
			true,
		);
	}

	const parseResult = schema.safeParse(stepData.formData);
	if (!parseResult.success) {
		return {
			isFailure: true,
			message: `Form data is invalid for schema: ${
				schema.description ?? '[no description]'
			}`,
			details: { zodIssues: parseResult.error.issues },
		};
	}

	const draft: DraftNewsletterData = formDataToDraftNewsletterData({
		...getEmptySchemaData(newsletterDataSchema),
		...parseResult.data,
	});

	const storageResponse = await draftService.draftStorage.create(
		{
			...draft,
			...defaultDraftNewsletterValues,
			listId: undefined,
		},
		draftService.userProfile,
	);
	if (storageResponse.ok) {
		const sendOutput = await draftService.emailClient.send(
			buildTestMessage(draft.name ?? 'new-draft'),
		);
		console.log({ sendOutput });

		return {
			data: draftNewsletterDataToFormData(storageResponse.data),
		};
	}

	return {
		isFailure: true,
		message: storageResponse.message,
	};
};
