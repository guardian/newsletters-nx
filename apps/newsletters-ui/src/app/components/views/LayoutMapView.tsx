import { Typography } from '@mui/material';
import type {
	EditionsLayouts,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { useLoaderData } from 'react-router-dom';
import { ContentWrapper } from '../../ContentWrapper';
import { LayoutsMapDisplay } from '../edition-layouts/LayoutsMapDisplay';

export const LayoutMapView = () => {
	const data = useLoaderData<{
		editionsLayouts: EditionsLayouts;
		newsletters: NewsletterData[];
	}>();

	return (
		<ContentWrapper>
			<Typography variant="h2">Layouts</Typography>
			<LayoutsMapDisplay
				editionsLayouts={data.editionsLayouts}
				newsletters={data.newsletters}
			/>
		</ContentWrapper>
	);
};
