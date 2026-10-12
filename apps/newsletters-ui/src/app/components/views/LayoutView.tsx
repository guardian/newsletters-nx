import { Box, Container, Typography } from '@mui/material';
import type {
	EditionId,
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import {
	editionIdSchema,
	makeBlankLayout,
} from '@newsletters-nx/newsletters-data-client';
import { useLoaderData, useLocation } from 'react-router-dom';
import { ContentWrapper } from '../../ContentWrapper';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
import { usePermissions } from '../../hooks/user-hooks';
import { LayoutDisplay } from '../edition-layouts/LayoutDisplay';
import { MissingLayoutContent } from '../edition-layouts/MissingLayoutContent';
import { EditLayoutButton } from '../EditLayoutButton';
import { HubEditionHeader } from '../HubEditionHeader';
import { NavigateButton } from '../NavigateButton';

const regionNames: Record<EditionId, string> = {
	UK: 'United Kingdom',
	US: 'United States',
	AU: 'Australia',
	INT: 'International',
	EUR: 'Europe',
};

export const LayoutView = () => {
	const data = useLoaderData<
		{ layout?: Layout; newsletters: NewsletterData[] } | undefined
	>();

	const isUsingStand = isFeatureSwitchEnabled('switch-stand');

	const location = useLocation();
	const permissions = usePermissions();
	const editionId = location.pathname.split('/').pop()?.toUpperCase();

	if (!data || !editionId) {
		return <MissingLayoutContent editionId={editionId} />;
	}
	const region = editionIdSchema.safeParse(editionId);
	const regionName = region.success ? regionNames[region.data] : editionId;

	return isUsingStand ? (
		<Container maxWidth="lg">
			<HubEditionHeader
				title={regionName}
				breadcrumbs={{
					ancestors: [{ label: 'Newsletters front', href: '/layouts' }],
					currentLabel: regionName,
				}}
			>
				{permissions?.editEverything && (
					<EditLayoutButton editionId={editionId} />
				)}
			</HubEditionHeader>
		</Container>
	) : (
		<ContentWrapper>
			<Typography variant="h2">Layout for {editionId}</Typography>
			<LayoutDisplay
				newsletters={data.newsletters}
				layout={data.layout ?? makeBlankLayout()}
			/>
			{permissions?.editEverything && (
				<Box sx={{ paddingY: 2 }}>
					<NavigateButton href={`/layouts/edit/${editionId}`}>
						Edit layout
					</NavigateButton>
					<NavigateButton href={`/layouts/edit-json/${editionId}`}>
						{' '}
						edit layout as JSON
					</NavigateButton>
				</Box>
			)}
		</ContentWrapper>
	);
};
