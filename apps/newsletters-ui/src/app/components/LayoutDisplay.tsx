import { Box, Card, Typography, useTheme } from '@mui/material';
import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { Illustration } from './Illustration';

interface Props {
	newsletters: NewsletterData[];
	layout: Layout;
}

interface NewsletterCardProps {
	newsletterId: string;
	index: number;
	newsletter?: NewsletterData;
}
const NewsletterCard = ({
	newsletterId,
	newsletter,
	index,
}: NewsletterCardProps) => {
	const { palette } = useTheme();
	const paletteSet = newsletter ? palette.primary : palette.warning;

	const cardStyle = {
		padding: 1,
		backgroundColor: paletteSet.light,
		minWidth: 220,
		maxWidth: 220,
		minHeight: 120,
		boxSizing: 'border-box',
	};

	if (newsletter) {
		return (
			<Card sx={cardStyle}>
				<span>
					{index + 1}
					{'. '}
				</span>
				{newsletter.name}

				<Illustration
					name={newsletter.name}
					url={newsletter.illustrationCard ?? newsletter.illustrationCircle}
					height={80}
				/>
			</Card>
		);
	}

	return (
		<Card sx={cardStyle}>
			<span>
				{index + 1}
				{'. '}
			</span>
			<Typography component={'pre'}>{newsletterId}</Typography>
			<Typography component={'b'}>[no such newsletter]</Typography>
		</Card>
	);
};

export const LayoutDisplay = ({ newsletters, layout }: Props) => {
	return (
		<Box component={'article'}>
			{layout.map((section, index) => (
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
