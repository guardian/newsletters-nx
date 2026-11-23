import type {
	NewsletterData,
	UserPermissions,
} from '@newsletters-nx/newsletters-data-client';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { fetchApiData } from '../api-requests/fetch-api-data';
import { detailLoader } from './newsletters';

export type NewsletterLayoutData = {
	newsletter?: NewsletterData;
	canEdit: boolean;
};

export const newsletterLayoutLoader = async (
	args: LoaderFunctionArgs,
): Promise<NewsletterLayoutData> => {
	const [newsletter, permissions] = await Promise.all([
		detailLoader(args),
		fetchApiData<UserPermissions>('/api/user/permissions'),
	]);
	return {
		newsletter: isNewsletterData(newsletter) ? newsletter : undefined,
		canEdit: permissions?.editEverything ?? false,
	};
};
