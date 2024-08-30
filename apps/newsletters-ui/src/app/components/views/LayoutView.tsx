import { Typography } from '@mui/material';
import { useLoaderData, useLocation } from 'react-router-dom';
import {
	editionIds,
	type Layout,
	type NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';

export const LayoutView = () => {
	const data = useLoaderData() as
		| { layout: Layout; newsletters: NewsletterData[] }
		| undefined;

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

	const { layout, newsletters } = data;

	return (
		<ContentWrapper>
			<Typography variant="h2">Layout for {editionId}</Typography>
			<Typography>{newsletters.length} newsletters</Typography>
			<Typography>Please find below</Typography>
			<pre>{JSON.stringify(layout, undefined, 2)}</pre>
		</ContentWrapper>
	);
};
