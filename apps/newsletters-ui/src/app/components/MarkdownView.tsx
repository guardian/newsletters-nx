import { Typography } from '@mui/material';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewProps {
	markdown: string;
}

const isExternal = (href?: string) => !href?.startsWith('/');

const LinkWithNewTabIfExternal = (props: {
	children: ReactNode;
	href?: string;
}) => {
	const extraProps = {
		target: isExternal(props.href) ? '_blank' : undefined,
	};

	return (
		<a href={props.href} {...extraProps}>
			{props.children}
		</a>
	);
};

const TypographyH2 = (props: { children: ReactNode }) => {
	return <Typography variant="h2">{props.children}</Typography>;
};
const TypographyH3 = (props: { children: ReactNode }) => {
	return <Typography variant="h3">{props.children}</Typography>;
};
const TypographyP = (props: { children: ReactNode }) => {
	return <Typography marginBottom={1}>{props.children}</Typography>;
};

export const MarkdownView: React.FC<MarkdownViewProps> = ({ markdown }) => {
	return (
		<div className="markdown-block">
			<ReactMarkdown
				components={{
					a: LinkWithNewTabIfExternal,
					h1: TypographyH2,
					h2: TypographyH2,
					h3: TypographyH3,
					p: TypographyP,
				}}
			>
				{markdown}
			</ReactMarkdown>
		</div>
	);
};
