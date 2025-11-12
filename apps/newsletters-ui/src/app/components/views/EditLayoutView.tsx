import { Typography } from '@mui/material';
import { useLoaderData, useLocation } from 'react-router-dom';
import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { usePermissions } from '../../hooks/user-hooks';
import { LayoutEditor } from '../edition-layouts/LayoutEditor';
import { MissingLayoutContent } from '../edition-layouts/MissingLayoutContent';

export const EditLayoutView = () => {
	const data = useLoaderData() as
		| { layout: Layout; newsletters: NewsletterData[] }
		| undefined;


	const location = useLocation();
	const permissions = usePermissions();
	const editionId = location.pathname.split('/').pop()?.toUpperCase();

	if (!data || !editionId) {
		return (
			<MissingLayoutContent editionId={editionId} />
		);
	}

	return (
		<ContentWrapper maxWidth='xl'>
			<Typography variant="h2">Edit Layout for {editionId}</Typography>
			{permissions?.editLayouts && (
				<LayoutEditor editionId={editionId} layout={data.layout} newsletters={data.newsletters} />
			)}
		</ContentWrapper>
	);
};
