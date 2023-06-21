import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { Stack, Typography } from '@mui/material';

interface Props {
	name: string;
	url?: string;
}

export const Illustration = ({ name, url }: Props) => {
	const image = url ? (
		<img src={url} alt="" height={100} />
	) : (
		<ImageNotSupportedIcon color="primary" sx={{ height: 100, width: 100 }} />
	);

	const captionText = url
		? `illustration for ${name}`
		: `${name} has no illustration`;

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
			<Typography component={'figcaption'} variant="caption">
				{captionText}
			</Typography>
		</Stack>
	);
};
