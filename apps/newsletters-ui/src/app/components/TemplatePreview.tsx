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

const sleep = (time: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, time);
	});

export const TemplatePreview = ({
	identityName,
	newsletterData,
	minHeight = 800,
}: Props) => {
	const [content, setContent] = useState<string | undefined>(undefined);
	const [waitingForUpdate, setWaitingForUpdate] = useState(false);
	const [frameWidth, setFrameWidth] = useState(360);

	const fetchData = useCallback(async () => {
		if (!identityName && !newsletterData) {
			setWaitingForUpdate(false);
			setContent(undefined);
			return;
		}

		const delay = 100 + 100 * Math.floor(Math.random() * 10);
		await sleep(delay);

		if (identityName) {
			const data = await fetchApiData<{ content: string }>(
				`/api/rendering-templates/preview/${identityName}`,
			);
			setWaitingForUpdate(false);
			if (data) {
				setContent(data.content);
			}
		}

		if (newsletterData) {
			const data = await fetchPostApiData<{ content: string }>(
				`/api/rendering-templates/preview`,
				newsletterData,
			);
			setWaitingForUpdate(false);
			if (data) {
				setContent(data.content);
			}
		}
	}, [identityName, newsletterData]);

	useEffect(() => {
		setWaitingForUpdate(true);
		void fetchData();
	}, [fetchData]);

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

			{waitingForUpdate && (
				<Box sx={{ position: 'absolute', top: 0, right: 0 }}>
					<RefreshIcon sx={{ fontSize: 160 }} color="secondary" />
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
