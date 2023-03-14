import { Button } from '@mui/material';

interface Props {
	text: string;
	href: string;
}

export const ExternalLinkButton = ({ text, href }: Props) => (
	<Button
		href={href}
		variant="outlined"
		target="_blank"
		endIcon={<span>↗</span>}
	>
		{text}
	</Button>
);
