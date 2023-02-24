import { deriveNewsletterFieldsFromName } from '@newsletters-nx/newsletters-data-client';
import type { WizardFormData } from '@newsletters-nx/state-machine';

export const calculateFieldsFromName = (
	formData: WizardFormData,
): WizardFormData => {
	const derivedFields = deriveNewsletterFieldsFromName(formData.name as string);
	const updatedFormData: WizardFormData = {
		...formData,
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
