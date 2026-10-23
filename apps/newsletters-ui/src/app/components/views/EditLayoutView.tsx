import { Typography as StandTypography } from '@guardian/stand/Typography';
import { Container, Typography } from '@mui/material';
import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import {
	editionIdSchema,
	makeBlankLayout,
} from '@newsletters-nx/newsletters-data-client';
import { useLoaderData, useLocation } from 'react-router-dom';
import * as z from 'zod';
import { ContentWrapper } from '../../ContentWrapper';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
import { usePermissions } from '../../hooks/user-hooks';
import { LayoutEditor } from '../edition-layouts/LayoutEditor';
import { MissingLayoutContent } from '../edition-layouts/MissingLayoutContent';
import { Stand404Block } from '../errors/Stand404Block';
import { StandErrorBlock } from '../errors/StandErrorBlock';
import { StandEditLayoutView } from './StandEditLayoutView';

export const EditLayoutView = () => {
	const data = useLoaderData<
		{ layout?: Layout; newsletters: NewsletterData[] } | undefined
	>();

	const location = useLocation();
	const permissions = usePermissions();
	const editionId = location.pathname.split('/').pop()?.toUpperCase();

	if (!isFeatureSwitchEnabled('switch-legacy')) {
		if (!z.validate(editionIdSchema, editionId)) {
			return (
				<Container maxWidth="lg">
					<Stand404Block />
				</Container>
			);
		}

		if (!data) {
			return (
				<Container maxWidth="lg">
					<StandErrorBlock
						title="Newsletters data could not be loaded"
						description={
							<StandTypography element="p">
								Please try again later.
							</StandTypography>
						}
						backText="Return to previous page"
					/>
				</Container>
			);
		}

		return (
			<StandEditLayoutView
				editionId={editionId}
				layout={data.layout ?? makeBlankLayout()}
				newsletters={data.newsletters}
				permissions={permissions}
			/>
		);
	}

	if (!data?.layout || !editionId) {
		return <MissingLayoutContent editionId={editionId} />;
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
