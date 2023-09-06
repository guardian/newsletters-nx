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

const sendOutEmailsAndUpdateStatus = async (
	launchService: LaunchService,
	newsletter: NewsletterData,
) => {
	const [
		launchEmailResult,
		brazeRequestEmailResult,
		tagCreationEmailResult,
		signupPageCreationEmailResult,
	] = await Promise.all([
		sendEmailNotifications(
			{ messageTemplateId: 'NEWSLETTER_LAUNCH', newsletter },
			launchService.emailClent,
			launchService.emailEnvInfo,
		),
		sendEmailNotifications(
			{ messageTemplateId: 'BRAZE_SET_UP_REQUEST', newsletter },
			launchService.emailClent,
			launchService.emailEnvInfo,
		),
		sendEmailNotifications(
			{ messageTemplateId: 'TAG_CREATION_REQUEST', newsletter },
			launchService.emailClent,
			launchService.emailEnvInfo,
		),
		sendEmailNotifications(
			{ messageTemplateId: 'SIGN_UP_PAGE_CREATION_REQUEST', newsletter },
			launchService.emailClent,
			launchService.emailEnvInfo,
		),
	]);

	return launchService.updateCreationStatus(newsletter, {
		brazeCampaignCreationStatus: brazeRequestEmailResult.success
			? 'REQUESTED'
			: 'NOT_REQUESTED',
		ophanCampaignCreationStatus: launchEmailResult.success
			? 'REQUESTED'
			: 'NOT_REQUESTED',
		signupPageCreationStatus: signupPageCreationEmailResult.success
			? 'REQUESTED'
			: 'NOT_REQUESTED',
		tagCreationStatus: tagCreationEmailResult.success
			? 'REQUESTED'
			: 'NOT_REQUESTED',
	});
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

	const response = await launchService.launchDraft(draftId, {
		...getExtraValuesFromFormData(stepData.formData),
	});
	if (!response.ok) {
		return { isFailure: true, message: response.message };
	}

	// voiding rather than awaiting - the UI doesn't need to wait for the
	// notification emails and status updates before confirming the
	// newsletter is in the API
	void sendOutEmailsAndUpdateStatus(launchService, response.data);

	return {
		data: {
			newNewsletterListId: response.data.listId,
			newNewsletterName: response.data.name,
			newNewsletterIdentityName: response.data.identityName,
		},
	};
};
