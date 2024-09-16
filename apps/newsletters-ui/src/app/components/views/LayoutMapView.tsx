import { Alert, Typography } from '@mui/material';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import type {
	EditionId,
	EditionsLayouts,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { editionIds } from '@newsletters-nx/newsletters-data-client';
import { fetchPostApiData } from '../../api-requests/fetch-api-data';
import { ContentWrapper } from '../../ContentWrapper';

export const LayoutMapView = () => {
	const data = useLoaderData() as {
		editionsLayouts: EditionsLayouts;
		newsletters: NewsletterData[];
	};

	const navigate = useNavigate();

	const handleCreate = async (editionId: EditionId) => {
		const result = await fetchPostApiData(`/api/layouts/${editionId}`, []);
		if (result) {
			navigate(`/layouts/${editionId.toLowerCase()}`);
		} else {
			alert('failed to create layout');
		}
	};

	return (
		<ContentWrapper>
			<Typography variant="h2">Layouts</Typography>

			{editionIds.map((editionId) => {
				const layout = data.editionsLayouts[editionId];
				const newsletterCount = layout?.flatMap(
					(section) => section.newsletters,
				).length;
				const invalidNewsletterCount = layout
					?.flatMap((section) => section.newsletters)
					.filter(
						(newsletterId) =>
							!data.newsletters.some(
								(newsletter) => newsletter.identityName === newsletterId,
							),
					).length;

				return (
					<section key={editionId}>
						<Link to={`/layouts/${editionId.toLowerCase()}`}>
							<Typography variant="h3">{editionId}</Typography>
						</Link>
						{newsletterCount !== undefined && (
							<Alert>{newsletterCount} newsletters in layout</Alert>
						)}
						{!!invalidNewsletterCount && (
							<Alert severity="warning">
								{invalidNewsletterCount} newsletters named in the layout do not
								exist
							</Alert>
						)}
						{!layout && (
							<>
								<Alert severity="warning">
									no layout defined for {editionId}
								</Alert>
								<button
									onClick={() => {
										void handleCreate(editionId);
									}}
								>
									create?
								</button>
							</>
						)}
					</section>
				);
			})}
		</ContentWrapper>
	);
};
