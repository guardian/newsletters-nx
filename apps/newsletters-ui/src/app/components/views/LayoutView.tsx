import { Box, Typography } from '@mui/material';
import { useLoaderData, useLocation } from 'react-router-dom';
import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import {
	makeBlankLayout
} from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { usePermissions } from '../../hooks/user-hooks';
import { LayoutDisplay } from '../edition-layouts/LayoutDisplay';
import { MissingLayoutContent } from '../edition-layouts/MissingLayoutContent';
import { NavigateButton } from '../NavigateButton';

export const LayoutView = () => {
	const data = useLoaderData() as
		| { layout?: Layout; newsletters: NewsletterData[] }
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
		<ContentWrapper>
			<Typography variant="h2">Layout for {editionId}</Typography>
			<LayoutDisplay newsletters={data.newsletters} layout={data.layout ?? makeBlankLayout()} />
			{permissions?.editLayouts && (
				<Box paddingY={2}>
					<NavigateButton href={`/layouts/edit/${editionId}`}>Edit layout</NavigateButton>
					<NavigateButton href={`/layouts/edit-json/${editionId}`}> edit layout as JSON</NavigateButton>
				</Box>

			)}
		</ContentWrapper>
	);
};
