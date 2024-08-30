import { Typography } from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import type { EditionsLayouts } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';

export const LayoutMapView = () => {
	const layouts = useLoaderData() as EditionsLayouts[];

	return (
		<ContentWrapper>
			<Typography variant="h2">Layouts</Typography>
			<Typography>Please find below</Typography>

			<p>{JSON.stringify(layouts)}</p>
		</ContentWrapper>
	);
};
