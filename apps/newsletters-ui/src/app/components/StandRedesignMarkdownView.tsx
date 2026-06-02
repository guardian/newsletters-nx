import { css } from '@emotion/react';
import { baseSpacing } from '@guardian/stand';
import type { IconProps } from '@guardian/stand/Icon';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewProps {
	markdown: string;
	addIconToH3?: IconProps['symbol'];
	id?: string ;
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

const H2 = (props: {iconVariant?: IconProps['symbol']; children?: ReactNode}) => {
	return (
		<Typography
			element="h2"
			variant="heading2Xl"
			cssOverrides={css`
				margin-bottom: ${baseSpacing['16Rem']};
				display: inline-flex;
				align-items: center;
				gap: 7px;
			`}
		>
			{props.iconVariant && <Icon aria-hidden={true} symbol={props.iconVariant}/>}{props.children}
		</Typography>
	);
};
const H3 = (props: {iconVariant?: IconProps['symbol']; children?: ReactNode }) => {
	return (
			<Typography
			element="h3"
			variant="headingMd"
			cssOverrides={css`
				margin-bottom: ${baseSpacing['12Rem']};
				display: inline-flex;
				align-items: center;
				gap: 7px;
			`}
		>
			{props.iconVariant && <Icon aria-hidden={true} symbol={props.iconVariant}/>}{props.children}
		</Typography>
	);
};
const TypographyP = (props: { children?: ReactNode }) => {
	return (
		<Typography
			element="p"
			variant="bodyMd"
			cssOverrides={css`
				margin-bottom: ${baseSpacing['40Rem']};
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
				margin-bottom: ${baseSpacing['40Rem']};
				padding-left: 1.5em;
				p {
					margin-bottom: ${baseSpacing['12Rem']};
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
			variant="bodyBoldMd"
			cssOverrides={css`
				margin-bottom: ${baseSpacing['40Rem']};
			`}
		>
			{props.children}
		</Typography>
	);
};

export const StandRedesignMarkdownView: React.FC<MarkdownViewProps> = ({
	markdown,
	addIconToH3,
}) => {
	return (
		<div
			className="markdown-block"
			css={css`
				img {
					max-width: 100%;
					height: auto;
					display: block;
				}
			`}
		>
			<ReactMarkdown
				components={{
					a: LinkWithNewTabIfExternal,
					h1: ({ children }) => (
						<H2 iconVariant={addIconToH3}>
							{children}
						</H2>
					),
					h2: ({ children }) => (
						<H2 iconVariant={addIconToH3}>
							{children}
						</H2>
					),
					h3: ({ children }) => (
						<H3 iconVariant={addIconToH3}>
							{children}
						</H3>
					),
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
