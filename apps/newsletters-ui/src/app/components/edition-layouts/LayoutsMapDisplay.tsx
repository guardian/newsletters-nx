import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import type {
	EditionId,
	EditionsLayouts,
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { editionIds, makeBlankLayout } from '@newsletters-nx/newsletters-data-client';
import { fetchPostApiData } from '../../api-requests/fetch-api-data';
import { usePermissions } from '../../hooks/user-hooks';

interface Props {
	editionsLayouts: EditionsLayouts;
	newsletters: NewsletterData[];
}

const LayoutOverview = ({
	editionId,
	newsletters,
	layout,
}: {
	editionId: EditionId;
	newsletters: NewsletterData[];
	layout?: Layout;
}) => {
	const navigate = useNavigate();
	const permissions = usePermissions();
	const newsletterCount = layout?.groups.flatMap(
		(section) => section.newsletters,
	).length;
	const invalidNewsletterCount = layout?.groups
		.flatMap((section) => section.newsletters)
		.filter(
			(newsletterId) =>
				!newsletters.some(
					(newsletter) => newsletter.identityName === newsletterId,
				),
		).length;

	const handleCreate = async (editionId: EditionId) => {
		const result = await fetchPostApiData(`/api/layouts/${editionId}`, makeBlankLayout());
		if (result) {
			navigate(`/layouts/${editionId.toLowerCase()}`);
		} else {
			alert('failed to create layout');
		}
	};

	const title = <Typography variant="h3">{editionId} Layout</Typography>;

	return (
		<Box component={'section'}>
			{layout ? (
				<Link to={`/layouts/${editionId.toLowerCase()}`}>{title}</Link>
			) : (
				<Box display={'flex'} alignItems={'flex-end'} gap={4}>
					{title}

					{permissions?.editLayouts && (
						<Button
							onClick={() => {
								void handleCreate(editionId);
							}}
							variant="outlined"
						>
							create layout for {editionId}
						</Button>
					)}
				</Box>
			)}

			{!!newsletterCount && (
				<Alert>
					{newsletterCount} newsletters and {layout?.groups.length ?? 0} groups in
					layout
				</Alert>
			)}
			{newsletterCount === 0 && (
				<Alert severity="warning">Layout is empty</Alert>
			)}
			{!!invalidNewsletterCount && (
				<Alert severity="warning">
					{invalidNewsletterCount} newsletters named in the layout do not exist
				</Alert>
			)}
			{!layout && (
				<Alert severity="warning">no layout defined for {editionId}</Alert>
			)}
		</Box>
	);
};

export const LayoutsMapDisplay = ({ editionsLayouts, newsletters }: Props) => {
	return (
		<Stack divider={<Divider />} gap={2}>
			{editionIds.map((editionId) => (
				<LayoutOverview
					key={editionId}
					editionId={editionId}
					newsletters={newsletters}
					layout={editionsLayouts[editionId]}
				/>
			))}
		</Stack>
	);
};
