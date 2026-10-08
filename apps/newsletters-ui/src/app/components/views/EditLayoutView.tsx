import { Typography } from '@mui/material';
import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { makeBlankLayout } from '@newsletters-nx/newsletters-data-client';
import { useLoaderData, useLocation } from 'react-router-dom';
import { ContentWrapper } from '../../ContentWrapper';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
import { usePermissions } from '../../hooks/user-hooks';
import { LayoutEditor } from '../edition-layouts/LayoutEditor';
import { MissingLayoutContent } from '../edition-layouts/MissingLayoutContent';
import { StandEditLayoutView } from './StandEditLayoutView';

export const EditLayoutView = () => {
	const data = useLoaderData<
		{ layout?: Layout; newsletters: NewsletterData[] } | undefined
	>();

	const location = useLocation();
	const permissions = usePermissions();
	const editionId = location.pathname.split('/').pop()?.toUpperCase();

	if (!data || !editionId) {
		return <MissingLayoutContent editionId={editionId} />;
	}

	if (isFeatureSwitchEnabled('switch-stand')) {
		return (
			<StandEditLayoutView
				editionId={editionId}
				layout={data.layout ?? makeBlankLayout()}
				newsletters={data.newsletters}
			/>
		);
	}

	return (
		<ContentWrapper maxWidth="xl">
			<Typography variant="h2">Edit Layout for {editionId}</Typography>
			{permissions?.editEverything && (
				<LayoutEditor
					editionId={editionId}
					layout={data.layout ?? makeBlankLayout()}
					newsletters={data.newsletters}
				/>
			)}
		</ContentWrapper>
	);
};
