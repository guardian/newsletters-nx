import { useCallback, useEffect, useState } from 'react';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
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
		const data = await fetchPostApiData<{ content: string }>(
			`/api/rendering-templates/preview`,
			newsletterData,
		);
		setFetchInProgress(false);
		if (data) {
			setContent(data.content);
		}
	}, [newsletterData]);

	const scheduleUpdate = useCallback(() => {
		setFetchScheduled(true);
		const now = Date.now();
		const delay = Math.max(0, 5000 - (now - fetchTime));
		setTimeout(() => {
			setFetchScheduled(false);
			void fetchData();
		}, delay);
	}, [fetchData, fetchTime]);

	// fetch on initial render
	useEffect(() => {
		if (madeInitialFetch) {
			return;
		}
		setMadeInitalFetch(true);
		void fetchData();
	}, [fetchData, madeInitialFetch]);

	// Schedule an update if the data changes
	// and and update is not already scheduled
	useEffect(() => {
		if (!madeInitialFetch) {
			return;
		}
		if (newsletterData === dataLastPosted) {
			return;
		}
		if (fetchScheduled) {
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
		<TemplatePreview
			html={content}
			isLoading={fetchScheduled || fetchInProgress}
			minHeight={minHeight}
		/>
	);
};
