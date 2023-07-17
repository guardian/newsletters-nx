import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, ButtonGroup, Container } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { fetchApiData, fetchPostApiData } from '../api-requests/fetch-api-data';

interface Props {
	identityName?: string;
	newsletterData?: NewsletterData;
	minHeight?: number;
}

export const TemplatePreview = ({
	identityName,
	newsletterData,
	minHeight = 800,
}: Props) => {
	const [frameWidth, setFrameWidth] = useState(360);
	const [content, setContent] = useState<string | undefined>(undefined);
	const [fetchInProgress, setFetchInProgress] = useState(false);
	const [madeInitialFetch, setMadeInitalFetch] = useState(false);
	const [gotInitalContent, setGotInitialContent] = useState(false);
	const [hasChangedSinceLastRequest, setHasChangeSinceLastRequest] =
		useState(false);

	const fetchData = useCallback(
		async (isInitial: boolean) => {
			setFetchInProgress(true);
			if (!identityName && !newsletterData) {
				setFetchInProgress(false);
				setContent(undefined);
				return;
			}

			if (identityName) {
				const data = await fetchApiData<{ content: string }>(
					`/api/rendering-templates/preview/${identityName}`,
				);
				setFetchInProgress(false);
				if (isInitial) {
					setGotInitialContent(true);
				}
				if (data) {
					setContent(data.content);
				}
			}

			if (newsletterData) {
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
			}
		},
		[identityName, newsletterData],
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

	const WidthButton = (props: { width: number }) => (
		<Button
			onClick={() => {
				setFrameWidth(props.width);
			}}
			variant={frameWidth === props.width ? 'contained' : 'outlined'}
		>
			{props.width}
		</Button>
	);

	return (
		<Container
			sx={{
				paddingTop: 1,
				borderStyle: 'solid',
				borderColor: 'primary.dark',
				position: 'relative',
			}}
		>
			<ButtonGroup>
				<WidthButton width={320} />
				<WidthButton width={375} />
				<WidthButton width={425} />
				<WidthButton width={650} />
			</ButtonGroup>

			{(fetchInProgress || hasChangedSinceLastRequest) && (
				<Box sx={{ position: 'absolute', top: 0, right: 0 }}>
					<RefreshIcon
						sx={{ fontSize: 160 }}
						color={fetchInProgress ? 'success' : 'warning'}
					/>
				</Box>
			)}

			<Box
				width={'100%'}
				minHeight={minHeight}
				display={'flex'}
				justifyContent={'center'}
				paddingY={2}
			>
				{content && (
					<iframe
						style={{
							width: frameWidth,
							border: 'none',
						}}
						title="preview"
						srcDoc={content}
					/>
				)}
			</Box>
		</Container>
	);
};
