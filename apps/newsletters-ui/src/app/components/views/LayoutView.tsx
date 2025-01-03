import { Typography } from '@mui/material';
import { useState } from 'react';
import { useLoaderData, useLocation } from 'react-router-dom';
import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import {
	editionIds,
	layoutSchema,
} from '@newsletters-nx/newsletters-data-client';
import { fetchPostApiData } from '../../api-requests/fetch-api-data';
import { ContentWrapper } from '../../ContentWrapper';
import { usePermissions } from '../../hooks/user-hooks';
import { LayoutDisplay } from '../edition-layouts/LayoutDisplay';
import { JsonEditor } from '../JsonEditor';

export const LayoutView = () => {
	const data = useLoaderData() as
		| { layout: Layout; newsletters: NewsletterData[] }
		| undefined;

	const [localLayout, setLocalLayout] = useState(data?.layout);
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

	const { layout: originalLayout, newsletters } = data;

	const handleUpdate = async (updatedLayout: Layout) => {
		const result = await fetchPostApiData(
			`/api/layouts/${editionId}`,
			updatedLayout,
		);
		if (result) {
			setLocalLayout(updatedLayout);
		} else {
			alert('failed to edit layout');
		}
	};

	return (
		<ContentWrapper>
			<Typography variant="h2">Layout for {editionId}</Typography>
			<LayoutDisplay newsletters={newsletters} layout={localLayout ?? { groups: [] }} />
			{permissions?.editLayouts && (
				<JsonEditor
					schema={layoutSchema}
					originalData={originalLayout}
					submit={(updatedLayout) => {
						void handleUpdate(updatedLayout);
					}}
				/>
			)}
		</ContentWrapper>
	);
};
