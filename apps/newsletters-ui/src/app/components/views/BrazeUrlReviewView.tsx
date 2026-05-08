import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { fetchApiData } from '../../api-requests/fetch-api-data';
import { ContentWrapper } from '../../ContentWrapper';
import type { BrazeNewsletterUrlEntry } from '../../loaders/braze';

type LoadState = 'idle' | 'loading' | 'error';

export const BrazeUrlReviewView = () => {
	const [entries, setEntries] = useState<BrazeNewsletterUrlEntry[]>([]);
	const [loadState, setLoadState] = useState<LoadState>('idle');
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const handleLoad = async () => {
		setLoadState('loading');
		setErrorMessage(undefined);
		try {
			const data = await fetchApiData<BrazeNewsletterUrlEntry[]>(
				'api/braze/newsletter-urls',
			);
			setEntries(data ?? []);
			setLoadState('idle');
		} catch (err) {
			setErrorMessage(
				err instanceof Error ? err.message : 'Unknown error',
			);
			setLoadState('error');
		}
	};

	return (
		<ContentWrapper>
			<Typography variant="h2">Braze URL Review</Typography>
			<Box sx={{ my: 2 }}>
				<Button
					variant="contained"
			onClick={() => void handleLoad()}
				disabled={loadState === 'loading'}
					startIcon={
						loadState === 'loading' ? (
							<CircularProgress size={16} color="inherit" />
						) : undefined
					}
				>
					{loadState === 'loading' ? 'Loading…' : 'Load Braze data'}
				</Button>
			</Box>

			{loadState === 'error' && (
				<Typography color="error" sx={{ mb: 2 }}>
					Error: {errorMessage}
				</Typography>
			)}

			{entries.length > 0 && (
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Newsletter Name</TableCell>
							<TableCell>Identity Name</TableCell>
							<TableCell>Tool Example URL</TableCell>
							<TableCell>Braze URL</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{entries.map((entry) => (
							<TableRow key={entry.identityName}>
								<TableCell>{entry.newsletterName}</TableCell>
								<TableCell>{entry.identityName}</TableCell>
								<TableCell>{entry.exampleUrl ?? '—'}</TableCell>
								<TableCell>{entry.brazeUrl ?? '—'}</TableCell>
								<TableCell>
									{entry.isMatch ? (
										<Chip label="✓ Match" color="success" size="small" />
									) : (
										<Chip label="✗ Mismatch" color="error" size="small" />
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</ContentWrapper>
	);
};

