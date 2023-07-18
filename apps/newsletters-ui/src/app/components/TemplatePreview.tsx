import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, ButtonGroup, Container } from '@mui/material';
import { useState } from 'react';

interface Props {
	html?: string;
	minHeight?: number;
	isLoading?: boolean;
}

export const TemplatePreview = ({
	html,
	minHeight = 800,
	isLoading,
}: Props) => {
	const [frameWidth, setFrameWidth] = useState(360);

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

			{isLoading && (
				<Box sx={{ position: 'absolute', top: 0, right: 0 }}>
					<RefreshIcon sx={{ fontSize: 160 }} />
				</Box>
			)}

			<Box
				width={'100%'}
				minHeight={minHeight}
				display={'flex'}
				justifyContent={'center'}
				paddingY={2}
			>
				{html && (
					<iframe
						style={{
							width: frameWidth,
							border: 'none',
						}}
						title="preview"
						srcDoc={html}
					/>
				)}
			</Box>
		</Container>
	);
};
