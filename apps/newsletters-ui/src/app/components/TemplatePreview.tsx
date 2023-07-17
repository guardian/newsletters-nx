import { Box, Button, ButtonGroup, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchApiData } from '../api-requests/fetch-api-data';

interface Props {
	identityName?: string;
}

export const TemplatePreview = ({ identityName }: Props) => {
	const [content, setContent] = useState<string | undefined>(undefined);
	const [frameWidth, setFrameWidth] = useState(360);

	useEffect(() => {
		const fetchData = async () => {
			if (!identityName) {
				return setContent(undefined);
			}

			const data = await fetchApiData<{ content: string }>(
				`/api/rendering-templates/preview/${identityName}`,
			);
			if (data) {
				setContent(data.content);
			}
		};

		void fetchData();
	}, [content, identityName]);

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
		<Container>
			<ButtonGroup>
				<WidthButton width={320} />
				<WidthButton width={375} />
				<WidthButton width={425} />
				<WidthButton width={768} />
			</ButtonGroup>

			<Box
				width={'100%'}
				minHeight={800}
				display={'flex'}
				justifyContent={'center'}
				paddingY={2}
				sx={{ width: '100%', backgroundColor: 'primary.light' }}
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
