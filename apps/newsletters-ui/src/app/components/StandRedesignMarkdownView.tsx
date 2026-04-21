import { css } from '@emotion/react';
import { baseSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/typography';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewProps {
	markdown: string;
}

const isExternal = (href?: string) => !href?.startsWith('/');

const LinkWithNewTabIfExternal = (props: {
	children?: ReactNode;
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

const TypographyH2 = (props: { children?: ReactNode }) => {
	return (
		<Typography
			element="h2"
			variant="heading-2xl"
			cssOverrides={css`
				margin-bottom: ${baseSpacing['16-rem']};
			`}
		>
			{props.children}
		</Typography>
	);
};
const TypographyH3 = (props: { children?: ReactNode }) => {
	return (
		<Typography
			element="h3"
			variant="heading-md"
			cssOverrides={css`
				margin-bottom: ${baseSpacing['12-rem']};
			`}
		>
			{props.children}
		</Typography>
	);
};
const TypographyP = (props: { children?: ReactNode }) => {
	return (
		<Typography
			element="p"
			variant="body-md"
			cssOverrides={css`
				margin-bottom: ${baseSpacing['40-rem']};
			`}
		>
			{props.children}
		</Typography>
	);
};

const UlMarginOverride = (props: { children?: ReactNode }) => {
	return (
		<ul
			css={css`
				margin-bottom: ${baseSpacing['40-rem']};

				p {
					margin-bottom: ${baseSpacing['12-rem']};
				}
			`}
		>
			{props.children}
		</ul>
	);
};
const TypographyStrong = (props: { children?: ReactNode }) => {
	return (
		<Typography
			element="span"
			variant="body-bold-md"
			cssOverrides={css`
				margin-bottom: ${baseSpacing['40-rem']};
			`}
		>
			{props.children}
		</Typography>
	);
};

export const StandRedesignMarkdownView: React.FC<MarkdownViewProps> = ({
	markdown,
}) => {
	return (
		<div className="markdown-block">
			<ReactMarkdown
				components={{
					a: LinkWithNewTabIfExternal,
					h1: TypographyH2,
					h2: TypographyH2,
					h3: TypographyH3,
					p: TypographyP,
					ul: UlMarginOverride,
					strong: TypographyStrong,
				}}
			>
				{markdown}
			</ReactMarkdown>
		</div>
	);
};
