import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { deriveNewsletterFieldsFromName } from '@newsletters-nx/newsletters-data-client';

export const calculateFieldsFromName = (
	formName: string,
): Partial<NewsletterData> => {
	const derivedFields = deriveNewsletterFieldsFromName(formName);
	const updatedFormData: Partial<NewsletterData> = {
		...{
			identityName: derivedFields.identityName,
		},
		...{
			brazeSubscribeEventNamePrefix:
				derivedFields.brazeSubscribeEventNamePrefix,
		},
		...{
			brazeNewsletterName: derivedFields.brazeNewsletterName,
		},
		...{
			brazeSubscribeAttributeName: derivedFields.brazeSubscribeAttributeName,
		},
		...{
			brazeSubscribeAttributeNameAlternate:
				derivedFields.brazeSubscribeAttributeNameAlternate
					? derivedFields.brazeSubscribeAttributeNameAlternate
					: undefined,
		},
		...{ campaignName: derivedFields.campaignName },
		...{ campaignCode: derivedFields.campaignCode },
	};

	return updatedFormData;
};
