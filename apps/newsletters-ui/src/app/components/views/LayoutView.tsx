import { Typography } from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import type { Layout } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';

export const LayoutView = () => {
	const layout = useLoaderData() as Layout | undefined;

	if (!layout) {
		return (
			<ContentWrapper>
				<Typography variant="h2">no such Layout</Typography>
			</ContentWrapper>
		);
	}

	return (
		<ContentWrapper>
			<Typography variant="h2">Layout</Typography>
			<Typography>Please find below</Typography>
			<p>{JSON.stringify(layout)}</p>
		</ContentWrapper>
	);
};
