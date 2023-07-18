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
	const [fetchInProgress, setFetchInProgress] = useState(false);
	const [madeInitialFetch, setMadeInitalFetch] = useState(false);
	const [gotInitalContent, setGotInitialContent] = useState(false);
	const [hasChangedSinceLastRequest, setHasChangeSinceLastRequest] =
		useState(false);

	const fetchData = useCallback(
		async (isInitial: boolean) => {
			setFetchInProgress(true);

			const data = await fetchPostApiData<{ content: string }>(
				`/api/rendering-templates/preview`,
				newsletterData,
			);
			setFetchInProgress(false);
			if (isInitial) {
				setGotInitialContent(true);
			}
			if (data) {
				setContent(data.content);
			}
		},
		[newsletterData],
	);

	// fetch on initial render
	useEffect(() => {
		if (madeInitialFetch) {
			return;
		}
		setMadeInitalFetch(true);
		void fetchData(true);
	}, [fetchData, madeInitialFetch]);

	// set the flag to mark changes to the data
	useEffect(() => {
		if (!gotInitalContent) {
			return;
		}
		setHasChangeSinceLastRequest(true);
	}, [newsletterData, gotInitalContent]);

	// every five seconds, fetch data if there have been any changes
	// since the last fetch
	useEffect(() => {
		const timer = setInterval(() => {
			if (hasChangedSinceLastRequest) {
				setHasChangeSinceLastRequest(false);
				void fetchData(false);
			}
		}, 5000);

		return () => {
			clearInterval(timer);
		};
	}, [hasChangedSinceLastRequest, fetchData]);

	return (
		<TemplatePreview
			html={content}
			isLoading={hasChangedSinceLastRequest || fetchInProgress}
			minHeight={minHeight}
		/>
	);
};
