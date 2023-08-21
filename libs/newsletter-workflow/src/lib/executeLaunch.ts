import { sendEmailNotifications } from '@newsletters-nx/email-builder';
import type {
	FormDataRecord,
	LaunchService,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import type { AsyncExecution } from '@newsletters-nx/state-machine';
import { parseToNumber } from './util';

const DERIVED_FIELD_KEYS: Array<keyof NewsletterData> = [
	'identityName',
	'brazeSubscribeEventNamePrefix',
	'brazeNewsletterName',
	'brazeSubscribeAttributeName',
	'brazeSubscribeAttributeNameAlternate',
	'campaignName',
	'campaignCode',
];

const getExtraValuesFromFormData = (
	formData: FormDataRecord = {},
): Partial<NewsletterData> => {
	const stringValue = (key: string): string | undefined =>
		typeof formData[key] === 'string' ? (formData[key] as string) : undefined;

	return DERIVED_FIELD_KEYS.reduce<Partial<NewsletterData>>(
		(previousRecord, key) => {
			const value = stringValue(key);
			if (value) {
				return { ...previousRecord, [key]: value };
			}
			return previousRecord;
		},
		{},
	);
};

export const executeLaunch: AsyncExecution<LaunchService> = async (
	stepData,
	wizardStepData,
	launchService,
) => {
	const draftId = parseToNumber(stepData['id']);
	if (draftId === undefined) {
		return { isFailure: true, message: 'ERROR: invalid id.' };
	}

	if (!launchService) {
		return { isFailure: true, message: 'ERROR: no launch service available' };
	}

	const response = await launchService.launchDraft(
		draftId,
		getExtraValuesFromFormData(stepData.formData),
	);
	if (!response.ok) {
		return { isFailure: true, message: response.message };
	}

	void sendEmailNotifications(
		{ messageTemplateId: 'NEWSLETTER_LAUNCH', newsletter: response.data },
		launchService.emailClent,
		launchService.emailEnvInfo,
	);

	return {
		data: {
			newNewsletterListId: response.data.listId,
			newNewsletterName: response.data.name,
			newNewsletterIdentityName: response.data.identityName,
		},
	};
};
