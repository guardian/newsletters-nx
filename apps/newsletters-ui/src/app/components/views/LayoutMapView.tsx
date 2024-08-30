import { Typography } from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import { editionIds } from '@newsletters-nx/newsletters-data-client';
import type {
	EditionsLayouts,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';

export const LayoutMapView = () => {
	const data = useLoaderData() as {
		editionsLayouts: EditionsLayouts;
		newsletters: NewsletterData[];
	};

	return (
		<ContentWrapper>
			<Typography variant="h2">Layouts</Typography>
			<Typography>{data.newsletters.length} newsletters</Typography>
			<Typography>Please find below</Typography>

			{editionIds.map((editionId) => (
				<section key={editionId}>
					<Typography variant="h3">{editionId}</Typography>
					<pre>
						{JSON.stringify(data.editionsLayouts[editionId], undefined, 2)}
					</pre>
				</section>
			))}
		</ContentWrapper>
	);
};
