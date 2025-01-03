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
import { MissingLayoutContent } from '../edition-layouts/MissingLayoutContent';

export const EditLayoutView = () => {
	const data = useLoaderData() as
		| { layout: Layout; newsletters: NewsletterData[] }
		| undefined;

	const [localLayout, setLocalLayout] = useState(data?.layout);
	const location = useLocation();
	const permissions = usePermissions();
	const editionId = location.pathname.split('/').pop()?.toUpperCase();

	if (!data || !editionId) {
		return (
			<MissingLayoutContent editionId={editionId} />
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
			<Typography variant="h2">Edit Layout for {editionId}</Typography>
			{permissions?.editLayouts && (
				<JsonEditor
					schema={layoutSchema}
					originalData={originalLayout}
					submit={(updatedLayout) => {
						void handleUpdate(updatedLayout);
					}}
				/>
			)}
			<LayoutDisplay newsletters={newsletters} layout={localLayout ?? { groups: [] }} />
		</ContentWrapper>
	);
};
