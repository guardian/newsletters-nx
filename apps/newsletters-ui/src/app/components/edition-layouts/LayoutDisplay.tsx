import { Box, Typography } from '@mui/material';
import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { NewsletterCard } from './NewsletterCard';

interface Props {
	newsletters: NewsletterData[];
	layout: Layout;
}

export const LayoutDisplay = ({ newsletters, layout }: Props) => {
	return (
		<Box component={'article'}>
			{layout.groups.map((section, index) => (
				<Box key={index} component={'section'}>
					<Typography variant="h3">{section.title}</Typography>
					{section.subtitle && (
						<Typography variant="overline">{section.subtitle}</Typography>
					)}
					<Box display={'flex'} flexWrap={'wrap'} gap={1}>
						{section.newsletters.map((newsletterId, index) => (
							<NewsletterCard
								key={index}
								index={index}
								newsletterId={newsletterId}
								newsletter={newsletters.find(
									(n) => n.identityName === newsletterId,
								)}
							/>
						))}
					</Box>
				</Box>
			))}
		</Box>
	);
};
