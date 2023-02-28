import { deriveNewsletterFieldsFromName } from '@newsletters-nx/newsletters-data-client';
import type { WizardFormData } from '@newsletters-nx/state-machine';

export const calculateFieldsFromName = (formName: string): WizardFormData => {
	const derivedFields = deriveNewsletterFieldsFromName(formName);
	const updatedFormData: Partial<WizardFormData> = {
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
					? derivedFields.brazeSubscribeAttributeNameAlternate[0]
					: undefined,
		},
		...{ campaignName: derivedFields.campaignName },
		...{ campaignCode: derivedFields.campaignCode },
	};

	return updatedFormData;
};
