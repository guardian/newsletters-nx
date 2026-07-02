import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSpacing,
	semanticTypography,
} from '@guardian/stand';
import type { IconProps } from '@guardian/stand/Icon';
import { Icon } from '@guardian/stand/Icon';
import { Link } from '@guardian/stand/Link';
import type { TypographyProps } from '@guardian/stand/Typography';
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

// Converts :link[text]{href="https://example.com" target="_blank"} text directives into @guardian/stand Link components
const remarkLinkDirective: Plugin = () => (tree) => {
	visit(tree, 'textDirective', (node: TextDirective) => {
		if (node.name !== 'link') {
			return;
		}
		node.data = {
			hName: 'link',
			hProperties: node.attributes ?? {},
		};
	});
};

interface MarkdownViewProps {
	markdown: string;
	bottomSpacing?: keyof typeof semanticSpacing;
	componentTypographyOverrides?: Partial<
		Record<
			'H1' | 'H2' | 'H3' | 'P' | 'STRONG' | 'LI' | 'LI_STRONG',
			TypographyProps['variant']
		>
	>;
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

const H1 = (props: {
	typographyVariant?: TypographyProps['variant'];
	children?: ReactNode;
}) => {
	return (
		<Typography
			element="h1"
			variant={props.typographyVariant ?? 'heading2Xl'}
			cssOverrides={css`
				align-items: center;
				gap: 7px;
				margin-bottom: ${semanticSpacing.stackSm};
			`}
		>
			{props.children}
		</Typography>
	);
};

const H2 = (props: {
	typographyVariant?: TypographyProps['variant'];
	children?: ReactNode;
}) => {
	return (
		<Typography
			element="h2"
			variant={props.typographyVariant ?? 'headingMd'}
			cssOverrides={css`
				margin-bottom: ${semanticSpacing.stackSm};
				align-items: center;
				gap: 7px;
			`}
		>
			{props.children}
		</Typography>
	);
};
const H3 = (props: {
	typographyVariant?: TypographyProps['variant'];
	children?: ReactNode;
}) => {
	return (
		<Typography
			element="h3"
			variant={props.typographyVariant ?? 'headingSm'}
			cssOverrides={css`
				margin-bottom: ${semanticSpacing.stackSm};
				align-items: center;
				gap: 7px;
			`}
		>
			{props.children}
		</Typography>
	);
};
const TypographyP = (props: {
	typographyVariant?: TypographyProps['variant'];
	children?: ReactNode;
}) => {
	return (
		<Typography
			element="p"
			variant={props.typographyVariant ?? 'bodyMd'}
			cssOverrides={css`
				margin-bottom: ${semanticSpacing.stackMd};
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
				margin-bottom: ${semanticSpacing.stackXl};
				padding-left: 1.5em;
				:last-child {
					margin-bottom: 0;
				}
				p {
					margin-bottom: ${semanticSpacing.stackSm};
				}
			`}
		>
			{props.children}
		</ul>
	);
};

const TypographyLi = (props: {
	typographyVariant?: TypographyProps['variant'];
	typographyStrongVariant?: TypographyProps['variant'];
	children?: ReactNode;
}) => {
	return (
		<li
			css={css`
				${convertTypographyToEmotionStringStyle(
					semanticTypography[props.typographyVariant ?? 'bodyMd'],
				)}

				b {
					${convertTypographyToEmotionStringStyle(
						semanticTypography[props.typographyStrongVariant ?? 'bodyBoldMd'],
					)}
				}
			`}
		>
			{props.children}
		</li>
	);
};

const TypographyStrong = (props: {
	typographyVariant?: TypographyProps['variant'];
	children?: ReactNode;
}) => {
	return (
		<Typography
			element="b"
			variant={props.typographyVariant ?? 'bodyBoldMd'}
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
	bottomSpacing,
	componentTypographyOverrides,
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
				margin-bottom: ${bottomSpacing
					? semanticSpacing[bottomSpacing]
					: undefined};
			`}
		>
			<ReactMarkdown
				remarkPlugins={[
					remarkDirective,
					remarkIconDirective,
					remarkLinkDirective,
				]}
				components={
					{
						a: LinkWithNewTabIfExternal,
						h1: ({ children }) => (
							<H1 typographyVariant={componentTypographyOverrides?.H1}>
								{children}
							</H1>
						),
						h2: ({ children }) => (
							<H2 typographyVariant={componentTypographyOverrides?.H2}>
								{children}
							</H2>
						),
						h3: ({ children }) => (
							<H3 typographyVariant={componentTypographyOverrides?.H3}>
								{children}
							</H3>
						),
						p: ({ children }) => (
							<TypographyP typographyVariant={componentTypographyOverrides?.P}>
								{children}
							</TypographyP>
						),
						ul: UlMarginOverride,
						li: ({ children }) => (
							<TypographyLi
								typographyVariant={componentTypographyOverrides?.LI}
								typographyStrongVariant={
									componentTypographyOverrides?.LI_STRONG
								}
							>
								{children}
							</TypographyLi>
						),
						strong: ({ children }) => (
							<TypographyStrong
								typographyVariant={componentTypographyOverrides?.STRONG}
							>
								{children}
							</TypographyStrong>
						),
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
						link: ({ node, children }) => (
							<Link
								typography="bodySm"
								href={node?.properties.href as string}
								target={node?.properties.target as string | undefined}
								cssOverrides={css`
									/* this needs to be fixed in stand */
									color: ${semanticColors.fill.link};
								`}
							>
								{children}
							</Link>
						),
					} as React.ComponentProps<typeof ReactMarkdown>['components']
				}
			>
				{markdown}
			</ReactMarkdown>
		</div>
	);
};
