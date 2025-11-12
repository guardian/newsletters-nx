import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { Stack, Typography } from '@mui/material';

interface Props {
	name: string;
	url?: string;
	height?: number;
	noCaption?: boolean;
}

export const Illustration = ({ name, url, height = 200, noCaption }: Props) => {
	const captionText = url
		? `Illustration for ${name}`
		: `${name} has no illustration`;

	const image = url ? (
		<img src={url} alt={captionText} height={height} />
	) : (
		<ImageNotSupportedIcon
			color="primary"
			sx={{ height: height, width: height }}
		/>
	);



	return (
		<Stack
			component={'figure'}
			alignItems={'center'}
			margin={0}
			marginBottom={1}
			padding={1}
			sx={{
				borderWidth: 1,
				borderColor: 'primary.dark',
				borderStyle: 'dashed',
			}}
		>
			{image}
			{!noCaption &&
				<Typography component={'figcaption'} variant="caption">
					{captionText}
				</Typography>
			}
		</Stack>
	);
};
