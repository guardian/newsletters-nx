import { Alert, Box, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type {
	EmailRenderingOutput,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { fetchPostApiData } from '../api-requests/fetch-api-data';
import { TemplatePreview } from './TemplatePreview';

interface Props {
	newsletterData: NewsletterData;
	minHeight?: number;
}

export const TemplatePreviewLoader = ({
	newsletterData,
	minHeight = 800,
}: Props) => {
	const [content, setContent] = useState<string | undefined>(undefined);
	const [warnings, setWarnings] = useState<
		EmailRenderingOutput['warnings'] | undefined
	>(undefined);

	const [dataLastPosted, setDataLastPosted] = useState<
		NewsletterData | undefined
	>(undefined);

	const [fetchTime, setFetchTime] = useState(0);
	const [fetchScheduled, setFetchScheduled] = useState(false);
	const [fetchInProgress, setFetchInProgress] = useState(false);
	const [madeInitialFetch, setMadeInitalFetch] = useState(false);

	const fetchData = useCallback(async () => {
		setFetchInProgress(true);
		setFetchTime(Date.now());
		setDataLastPosted(newsletterData);
		const data = await fetchPostApiData<EmailRenderingOutput>(
			`/api/rendering-templates/preview`,
			newsletterData,
		);
		setFetchInProgress(false);
		if (data) {
			setContent(data.html);
			setWarnings(data.warnings);
		}
	}, [newsletterData]);

	// Schedule a fetchData at a time 5 seconds
	// after the time of the last update, or right
	// away if the last update was more than 5 seconds
	// ago.
	const scheduleUpdate = useCallback(() => {
		setFetchScheduled(true);
		const now = Date.now();
		const delay = Math.max(0, 5000 - (now - fetchTime));
		setTimeout(() => {
			setFetchScheduled(false);
			void fetchData();
		}, delay);
	}, [fetchData, fetchTime]);

	// fetch once immediately on initial render
	useEffect(() => {
		if (madeInitialFetch) {
			return;
		}
		setMadeInitalFetch(true);
		void fetchData();
	}, [fetchData, madeInitialFetch]);

	// When the newsletterData changes, if there
	// is not already a fetch scheduled and the
	// data is not the data already posed,
	// schedule an update.
	useEffect(() => {
		if (!madeInitialFetch || fetchScheduled) {
			return;
		}
		if (newsletterData === dataLastPosted) {
			return;
		}
		scheduleUpdate();
	}, [
		newsletterData,
		madeInitialFetch,
		dataLastPosted,
		scheduleUpdate,
		fetchScheduled,
	]);

	return (
		<>
			{warnings && warnings.length > 0 && (
				<Alert severity="warning">
					<Typography>Render Warnings</Typography>
					<Box component="ul">
						{warnings.map((warning, index) => (
							<Typography component={'li'} key={index}>
								{warning.message}
							</Typography>
						))}
					</Box>
				</Alert>
			)}
			<TemplatePreview
				html={content}
				isLoading={fetchScheduled || fetchInProgress}
				minHeight={minHeight}
			/>
		</>
	);
};
