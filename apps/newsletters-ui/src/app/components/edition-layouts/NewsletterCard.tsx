import type { AlertProps } from '@mui/material';
import {
	Alert,
	Card,
	Chip,
	Tooltip,
	Typography,
	useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { Illustration } from '../Illustration';

interface NewsletterCardProps {
	newsletterId: string;
	index: number;
	newsletter?: NewsletterData;
}

const statusToAlertVariant = (
	status: NewsletterData['status'],
): AlertProps['severity'] => {
	switch (status) {
		case 'cancelled':
			return 'error';
		case 'paused':
		case 'pending':
			return 'warning';
		case 'live':
			return 'success';
	}
};

const statusToToolTipText = (
	status: NewsletterData['status'],
): string | undefined => {
	switch (status) {
		case 'cancelled':
			return 'This newsletter has been cancelled and will not be displayed.';
		case 'paused':
		case 'pending':
			return 'This newsletter is not yet live - it will not appear until its status is updated.';
		case 'live':
			return undefined;
	}
};

export const NewsletterCard = ({
	newsletterId,
	newsletter,
	index,
}: NewsletterCardProps) => {
	const { palette } = useTheme();
	const paletteSet = newsletter ? palette.primary : palette.warning;

	const tooltipText = newsletter
		? statusToToolTipText(newsletter.status)
		: undefined;

	const numberSpan = (
		<span>
			{index + 1}
			{'. '}
		</span>
	);

	return (
		<Card
			sx={{
				padding: 1,
				backgroundColor: paletteSet.light,
				minWidth: 220,
				maxWidth: 220,
				minHeight: 120,
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}
		>
			{newsletter ? (
				<>
					<Link to={`/launched/${newsletter.identityName}`}>
						{numberSpan}
						{newsletter.name}
					</Link>

					<Illustration
						name={newsletter.name}
						url={newsletter.illustrationCard ?? newsletter.illustrationCircle}
						height={80}
					/>
					<Alert severity={statusToAlertVariant(newsletter.status)}>
						{newsletter.status}{' '}
						{tooltipText && (
							<Tooltip title={tooltipText} arrow>
								<Chip size="small" label="?" />
							</Tooltip>
						)}
					</Alert>
				</>
			) : (
				<>
					<Typography component={'span'}>
						{numberSpan}
						{newsletterId}
					</Typography>

					<Alert severity="error">
						invalid id
						<Tooltip
							title={`There is no newsletter with the id "${newsletterId}"`}
							arrow
						>
							<Chip size="small" label="?" />
						</Tooltip>
					</Alert>
				</>
			)}
		</Card>
	);
};