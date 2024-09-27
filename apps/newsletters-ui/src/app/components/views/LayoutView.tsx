import { Typography } from '@mui/material';
import {
	editionIds,
	layoutSchema,
	type Layout,
	type NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import { useLoaderData, useLocation } from 'react-router-dom';
import { fetchPostApiData } from '../../api-requests/fetch-api-data';
import { ContentWrapper } from '../../ContentWrapper';
import { JsonEditor } from '../JsonEditor';
import { LayoutDisplay } from '../edition-layouts/LayoutDisplay';

export const LayoutView = () => {
	const data = useLoaderData() as
		| { layout: Layout; newsletters: NewsletterData[] }
		| undefined;

	const [localLayout, setLocalLayout] = useState(data?.layout);

	const location = useLocation();
	const editionId = location.pathname.split('/').pop()?.toUpperCase();
	const editionIdIsValid =
		editionId && (editionIds as string[]).includes(editionId);

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

	const { layout: originalLayout, newsletters } = data;

	const handleUpdate = async (updatedLayout: Layout) => {
		const result = await fetchPostApiData(
			`/api/layouts/${editionId}`,
			updatedLayout,
		);
		if (result) {
			setLocalLayout(updatedLayout);
		} else {
			alert('failed to create layout');
		}
	};

	return (
		<ContentWrapper>
			<Typography variant="h2">Layout for {editionId}</Typography>
			<LayoutDisplay newsletters={newsletters} layout={localLayout ?? []} />

			<JsonEditor
				schema={layoutSchema}
				originalData={originalLayout}
				submit={(updatedLayout) => {
					void handleUpdate(updatedLayout);
				}}
			/>
		</ContentWrapper>
	);
};
