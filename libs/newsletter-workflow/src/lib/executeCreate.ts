import { sendEmailNotifications } from '@newsletters-nx/email-builder';
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
	brazeCampaignCreationStatus: 'NOT_REQUESTED',
	tagCreationStatus: 'NOT_REQUESTED',
	signupPageCreationStatus: 'NOT_REQUESTED',
} as const;

export const executeCreate: AsyncExecution<DraftService> = async (
	stepData,
	stepLayout,
	draftService,
) => {
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
			message: `Form data is invalid for schema: ${schema.description ?? '[no description]'
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
		void sendEmailNotifications(
			{
				messageTemplateId: 'NEW_DRAFT',
				draft: storageResponse.data,
			},
			draftService.emailClient,
			draftService.emailEnvInfo,
			draftService.userProfile,
		);

		return {
			data: draftNewsletterDataToFormData(storageResponse.data),
		};
	}

	return {
		isFailure: true,
		message: storageResponse.message,
	};
};
