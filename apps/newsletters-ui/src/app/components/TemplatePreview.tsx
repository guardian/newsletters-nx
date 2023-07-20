import {
	Box,
	Button,
	ButtonGroup,
	Card,
	CircularProgress,
	Container,
} from '@mui/material';
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
	const [frameWidth, setFrameWidth] = useState(650);

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
			component={Card}
			elevation={3}
			sx={{
				position: 'relative',
				paddingY: 3,
			}}
		>
			<ButtonGroup>
				<WidthButton width={320} />
				<WidthButton width={375} />
				<WidthButton width={425} />
				<WidthButton width={650} />
			</ButtonGroup>

			<Box
				width={'100%'}
				minHeight={minHeight}
				display={'flex'}
				justifyContent={'center'}
				paddingY={2}
				sx={{
					filter: isLoading ? 'blur(3px)' : undefined,
					transition: 'filter .25s',
				}}
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

			{isLoading && (
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translateX(-50%)',
					}}
				>
					<CircularProgress size={200} />
				</Box>
			)}
		</Container>
	);
};
