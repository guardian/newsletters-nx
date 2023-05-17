import type {
	FormDataRecord,
	LaunchService,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import type { AsyncExecution } from '@newsletters-nx/state-machine';
import { parseToNumber } from './util';

const getExtraValuesFromFormData = (
	formData: FormDataRecord = {},
): Partial<NewsletterData> => {
	const data: Partial<NewsletterData> = {
		identityName:
			typeof formData.identityName === 'string'
				? formData.identityName
				: undefined,
		brazeNewsletterName:
			typeof formData.brazeNewsletterName === 'string'
				? formData.brazeNewsletterName
				: undefined,
		brazeSubscribeAttributeName:
			typeof formData.brazeSubscribeAttributeName === 'string'
				? formData.brazeSubscribeAttributeName
				: undefined,
		brazeSubscribeEventNamePrefix:
			typeof formData.brazeSubscribeEventNamePrefix === 'string'
				? formData.brazeSubscribeEventNamePrefix
				: undefined,
		campaignCode:
			typeof formData.campaignCode === 'string'
				? formData.campaignCode
				: undefined,
		campaignName:
			typeof formData.campaignName === 'string'
				? formData.campaignName
				: undefined,
	};

	const populatedKeys = Object.keys(data) as Array<keyof NewsletterData>;

	populatedKeys.forEach((key) => {
		if (typeof data[key] === 'undefined') {
			delete data[key];
		}
	});

	return data;
};

export const executeLaunch: AsyncExecution<LaunchService> = async (
	stepData,
	wizardStepData,
	launchService,
) => {
	const draftId = parseToNumber(stepData['id']);
	if (draftId === undefined) {
		return `ERROR: invalid id.`;
	}

	if (!launchService) {
		return 'ERROR: no launch service available';
	}

	const response = await launchService.launchDraft(
		draftId,
		getExtraValuesFromFormData(stepData.formData),
	);
	if (!response.ok) {
		return response.message;
	}

	return {
		newNewsletterListId: response.data.listId,
		newNewsletterName: response.data.name,
		newNewsletterIdentityName: response.data.identityName,
	};
};
