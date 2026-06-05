import { css } from '@emotion/react';
import { semanticSpacing, semanticTypography } from '@guardian/stand';
import type { IconProps } from '@guardian/stand/Icon';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { convertTypographyToEmotionStringStyle } from '@guardian/stand/utils';
import type { Element } from 'hast';
import type { TextDirective } from 'mdast-util-directive';
import type { ReactNode } from 'react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkDirective from 'remark-directive';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

// Converts :icon{symbol="text_snippet"} text directives into hast <icon> elements
const remarkIconDirective: Plugin = () => (tree) => {
	visit(tree, 'textDirective', (node: TextDirective) => {
		if (node.name !== 'icon') {
			return;
		}
		node.data = {
			hName: 'icon',
			hProperties: node.attributes ?? {},
		};
	});
};

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

const H1 = (props: {iconVariant?: IconProps['symbol']; children?: ReactNode}) => {
	return (
		<Typography
			element="h1"
			variant="heading2Xl"
			cssOverrides={css`
				display: inline-flex;
				align-items: center;
				gap: 7px;
				margin-bottom: ${semanticSpacing.stackXl};
			`}
		>
			{props.iconVariant && <Icon aria-hidden={true} symbol={props.iconVariant}/>}{props.children}
		</Typography>
	);
};

const H2 = (props: {iconVariant?: IconProps['symbol']; children?: ReactNode}) => {
	return (
		<Typography
			element="h2"
			variant="headingMd"
			cssOverrides={css`
				margin-bottom: ${semanticSpacing.stackSm};
				display: inline-flex;
				align-items: center;
				gap: 7px;
			`}
		>
			{props.children}
		</Typography>
	);
};
const H3 = (props: { children?: ReactNode }) => {
	return (
		<Typography
			element="h3"
			variant="headingSm"
			cssOverrides={css`
				margin-bottom: ${semanticSpacing.stackSm};
				display: inline-flex;
				align-items: center;
				gap: 7px;
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
			variant="bodySm"
			cssOverrides={css`
				margin-bottom: ${semanticSpacing.stackXl};
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
				${convertTypographyToEmotionStringStyle(semanticTypography.bodyMd)}
				margin-bottom: ${semanticSpacing.stackXl};
				padding-left: 1.5em;
				p {
					margin-bottom: ${semanticSpacing.stackSm};
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
				margin-bottom: ${semanticSpacing.stackXl};
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
				remarkPlugins={[remarkDirective, remarkIconDirective]}
				components={
					{
						a: LinkWithNewTabIfExternal,
						h1: ({ children }) => <H1>{children}</H1>,
						h2: ({ children }) => <H2>{children}</H2>,
						h3: ({ children }) => <H3>{children}</H3>,
						p: TypographyP,
						ul: UlMarginOverride,
						strong: TypographyStrong,
						icon: ({ node }: { node?: Element }) => (
							<Icon
								cssOverrides={css`
									vertical-align: middle;
								`}
								size="sm"
								aria-hidden={true}
								symbol={node?.properties.symbol as IconProps['symbol']}
							/>
						),
					} as React.ComponentProps<typeof ReactMarkdown>['components']
				}
			>
				{markdown}
			</ReactMarkdown>
		</div>
	);
};
