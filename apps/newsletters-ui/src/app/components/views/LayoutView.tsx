import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { Link, useLoaderData, useLocation } from 'react-router-dom';
import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import {
	editionIds,
	makeBlankLayout,
} from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { usePermissions } from '../../hooks/user-hooks';
import { LayoutDisplay } from '../edition-layouts/LayoutDisplay';

export const LayoutView = () => {
	const data = useLoaderData() as
		| { layout: Layout; newsletters: NewsletterData[] }
		| undefined;

	const location = useLocation();
	const permissions = usePermissions();

	const editionId = location.pathname.split('/').pop()?.toUpperCase();
	const editionIdIsValid =
		(editionId && (editionIds as string[]).includes(editionId)) || false;

	if (!data) {
		return (
			<ContentWrapper>
				{editionIdIsValid ? (
					<Typography variant="h2">no layout set for "{editionId}"</Typography>
				) : (
					<Typography variant="h2">no such edition "{editionId}"</Typography>
				)}
			</ContentWrapper>
		);
	}

	if (!editionId) {
		return (
			<ContentWrapper>
				<Typography variant="h2">edition id not provided"</Typography>
			</ContentWrapper>
		);
	}

	return (
		<ContentWrapper>
			<Typography variant="h2">Layout for {editionId}</Typography>
			<LayoutDisplay newsletters={data.newsletters} layout={data?.layout ?? makeBlankLayout()} />
			<Box paddingY={2}>
				{permissions?.editLayouts && (
					<Link to={`../edit-json/${editionId}`}> edit JSON</Link>
				)}
			</Box>
		</ContentWrapper>
	);
};
