import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Option, Select } from '@guardian/stand/Select';
import { TextInput } from '@guardian/stand/TextInput';
import { Tooltip } from '@guardian/stand/Tooltip';
import { Typography } from '@guardian/stand/Typography';
import {
	dataCollectionRenderingOptionsSchema,
	themeEnumSchema,
} from '@newsletters-nx/newsletters-data-client';
import type { ReactNode } from 'react';
import { useId, useRef, useState } from 'react';
import type { LayoutSettings } from '../lib/newsletter-layout';
import type {
	LayoutRow,
	PreviewTarget,
} from '../lib/newsletter-preview-target';
import {
	diffLayoutRows,
	targetsForField,
} from '../lib/newsletter-preview-target';

const blockStyles = css`
	display: grid;
	gap: ${semanticSpacing.stackXs};
	min-width: 0;
	padding: ${semanticSpacing.stackMd};
	background: ${semanticColors.bg.raisedLevel1};
	border: 1px solid ${semanticColors.border.weak};
	border-radius: ${semanticRadius.cornerSm};
	@media (600px < width < 1280px) {
		padding: ${semanticSpacing.stackXs};
	}
`;

const layoutFieldStack = css`
	display: grid;
	gap: ${semanticSpacing.stackSm};
	min-width: 0;
`;

const sectionsStyles = css`
	> section + section {
		margin-top: ${semanticSpacing.stackLg};
		padding-top: ${semanticSpacing.stackLg};
		border-top: 1px solid ${semanticColors.border.weak};
	}
`;

const sectionStyles = css`
	display: grid;
	min-width: 0;
	gap: ${baseSpacing['24Px']};
`;

const bodySectionStyles = css`
	gap: ${semanticSpacing.stackMd};
`;

const headingStyles = css`
	margin: 0;
`;

const descriptionStyles = css`
	margin: ${semanticSpacing.stackXs} 0 0;
	color: ${semanticColors.text.weak};
`;

const heroOptionsStyles = css`
	display: grid;
	gap: ${baseSpacing['20Px']};
`;

const formControlStyles = css`
	width: 100%;
	max-width: 450px;
`;

const itemHeadingStyles = css`
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackXxs};
`;

const FieldSection = ({
	title,
	description,
	body,
	children,
}: {
	title: string;
	description?: string;
	body?: boolean;
	children: ReactNode;
}) => {
	const titleId = useId();
	return (
		<section
			aria-labelledby={titleId}
			css={[sectionStyles, body && bodySectionStyles]}
		>
			<div>
				<Typography
					element="h2"
					id={titleId}
					variant="headingXl"
					cssOverrides={headingStyles}
				>
					{title}
				</Typography>
				{description && (
					<Typography
						element="p"
						variant="helpTextFormMd"
						cssOverrides={descriptionStyles}
					>
						{description}
					</Typography>
				)}
			</div>
			{children}
		</section>
	);
};

type ChangeLayout = <K extends keyof LayoutSettings>(
	key: K,
	value: LayoutSettings[K],
	target?: PreviewTarget,
) => void;

type NamedField =
	| 'linkListSubheading'
	| 'questionBlockSubheading'
	| 'podcastSubheading'
	| 'darkThemeSubheading';
type ReadMore = NonNullable<LayoutSettings['readMoreSections']>[number];
type AutomatedFront = NonNullable<
	LayoutSettings['automatedFrontSections']
>[number];

const frontBuilderNames =
	dataCollectionRenderingOptionsSchema.shape.automatedFrontSections.unwrap()
		.element.shape.partBuilderFunction;
const frontBuilderLabels: Record<
	(typeof frontBuilderNames.options)[number],
	string
> = {
	buildLinkListPart: 'Link list',
	buildListPartWithTrailText: 'List with trail text',
	buildListPartWithKeyword: 'List with keyword',
	buildNumberedListPartWithKeyword: 'Numbered list with keyword',
	buildNumberedListPart: 'Numbered list',
	buildNumberedListPartWithContributors: 'Numbered list with contributors',
};

const EditableList = <T,>({
	label,
	title,
	help,
	initial,
	create,
	getName,
	onChange,
	group,
	renderItem,
}: {
	label: string;
	title: string;
	help: string;
	initial: T[] | undefined;
	create: () => T;
	getName: (value: T) => string;
	onChange: (value: T[] | undefined, target?: PreviewTarget) => void;
	group?: 'read-more' | 'automated-fronts';
	renderItem: (
		value: T,
		update: (value: T) => void,
		index: number,
	) => ReactNode;
}) => {
	const titleId = useId();
	const [rows, setRows] = useState<Array<LayoutRow<T>>>(() =>
		(initial ?? []).map((value, id) => ({ id, value })),
	);
	const nextId = useRef(rows.length);
	const change = (next: Array<LayoutRow<T>>) => {
		setRows(next);
		onChange(
			next.length || initial !== undefined
				? next.map(({ value }) => value)
				: undefined,
			diffLayoutRows(rows, next, getName, group),
		);
	};
	return (
		<section css={blockStyles} aria-labelledby={titleId}>
			<div css={itemHeadingStyles}>
				<Typography
					element="h3"
					id={titleId}
					variant="labelFormMd"
					cssOverrides={headingStyles}
				>
					{title}
				</Typography>
				<Tooltip placement="top">{help}</Tooltip>
			</div>
			{rows.map(({ id, value }, index) => (
				<div
					key={id}
					css={layoutFieldStack}
					role="group"
					aria-label={`${label} ${index + 1}`}
				>
					{renderItem(
						value,
						(updated) =>
							change(
								rows.map((row) =>
									row.id === id ? { id, value: updated } : row,
								),
							),
						index,
					)}
					<div>
						<Button
							size="sm"
							variant="tertiary"
							onPress={() => change(rows.filter((row) => row.id !== id))}
						>
							Remove {label.toLowerCase()} {index + 1}
						</Button>
					</div>
				</div>
			))}
			<div>
				<Button
					size="xs"
					variant="tertiary"
					icon="add"
					aria-label={`Add new item to ${title}`}
					onPress={() =>
						change([...rows, { id: nextId.current++, value: create() }])
					}
				>
					Add new item
				</Button>
			</div>
		</section>
	);
};

const optional = (value: string) => (value === '' ? undefined : value);

export const NewsletterLayoutFields = ({
	initial,
	settings,
	onChange,
}: {
	initial: LayoutSettings;
	settings: LayoutSettings;
	onChange: ChangeLayout;
}) => {
	const checkbox = (
		key:
			| 'displayDate'
			| 'displayStandfirst'
			| 'darkHeadlineBackground'
			| 'displayImageCaptions'
			| 'includeBreakingNews',
		label: string,
	) => (
		<Checkbox
			size="md"
			isSelected={settings[key] ?? false}
			onChange={(value) =>
				onChange(
					key,
					value,
					key === 'includeBreakingNews'
						? { kind: 'breaking', enabled: value }
						: targetsForField[key],
				)
			}
		>
			{label}
		</Checkbox>
	);
	const namedList = (
		key: NamedField,
		label: string,
		title: string,
		help: string,
	) => (
		<EditableList
			label={label}
			title={title}
			help={help}
			initial={initial[key]}
			create={() => ''}
			getName={(name) => name}
			onChange={(value, target) => onChange(key, value, target)}
			renderItem={(value, update, index) => (
				<TextInput
					label={`${label} subheading ${index + 1}`}
					value={value}
					isRequired
					onInput={(event) => update(event.currentTarget.value)}
				/>
			)}
		/>
	);
	const readMore = (
		<EditableList<ReadMore>
			label="Read more"
			title="Read more sections"
			help="Add a section linking readers to more Guardian coverage."
			initial={initial.readMoreSections}
			group="read-more"
			create={() => ({ subheading: '', wording: '' })}
			getName={({ subheading }) => subheading}
			onChange={(value, target) => onChange('readMoreSections', value, target)}
			renderItem={(item, update) => (
				<>
					<TextInput
						label="Subheading"
						value={item.subheading}
						isRequired
						onInput={(event) =>
							update({ ...item, subheading: event.currentTarget.value })
						}
					/>
					<TextInput
						label="Link wording"
						value={item.wording}
						isRequired
						onInput={(event) =>
							update({ ...item, wording: event.currentTarget.value })
						}
					/>
					<TextInput
						label="URL"
						type="url"
						value={item.url ?? ''}
						onInput={(event) =>
							update({ ...item, url: optional(event.currentTarget.value) })
						}
					/>
					<TextInput
						label="Guardian onward path"
						description="For example, /food"
						value={item.onwardPath ?? ''}
						onInput={(event) =>
							update({
								...item,
								onwardPath: optional(event.currentTarget.value),
							})
						}
					/>
					<Checkbox
						isSelected={item.isDarkTheme ?? false}
						onChange={(isDarkTheme) => update({ ...item, isDarkTheme })}
					>
						Use dark theme
					</Checkbox>
				</>
			)}
		/>
	);
	const automatedFronts = (
		<EditableList<AutomatedFront>
			label="Automated front"
			title="Automated Fronts sections"
			help="Insert articles from a Guardian Front automatically."
			initial={initial.automatedFrontSections}
			group="automated-fronts"
			create={() => ({
				subheading: '',
				frontPath: '',
				sectionName: '',
				insertPosition: 0,
				maxArticles: 3,
				partBuilderFunction: 'buildLinkListPart',
			})}
			getName={({ subheading }) => subheading}
			onChange={(value, target) =>
				onChange('automatedFrontSections', value, target)
			}
			renderItem={(item, update) => (
				<>
					<TextInput
						label="Subheading"
						value={item.subheading}
						isRequired
						onInput={(event) =>
							update({ ...item, subheading: event.currentTarget.value })
						}
					/>
					<TextInput
						label="Front path"
						value={item.frontPath}
						isRequired
						onInput={(event) =>
							update({ ...item, frontPath: event.currentTarget.value })
						}
					/>
					<TextInput
						label="Section name"
						value={item.sectionName}
						isRequired
						onInput={(event) =>
							update({ ...item, sectionName: event.currentTarget.value })
						}
					/>
					<TextInput
						label="Insert position"
						type="number"
						value={
							Number.isNaN(item.insertPosition)
								? ''
								: String(item.insertPosition)
						}
						isRequired
						onInput={(event) =>
							update({
								...item,
								insertPosition: event.currentTarget.valueAsNumber,
							})
						}
					/>
					<TextInput
						label="Maximum articles"
						type="number"
						value={
							Number.isNaN(item.maxArticles) ? '' : String(item.maxArticles)
						}
						isRequired
						onInput={(event) =>
							update({
								...item,
								maxArticles: event.currentTarget.valueAsNumber,
							})
						}
					/>
					<Select
						label="Section style"
						value={item.partBuilderFunction}
						onChange={(key) => {
							const selected = frontBuilderNames.safeParse(key);
							if (selected.success) {
								update({ ...item, partBuilderFunction: selected.data });
							}
						}}
					>
						{!frontBuilderNames.safeParse(item.partBuilderFunction).success && (
							<Option id={item.partBuilderFunction}>
								{item.partBuilderFunction}
							</Option>
						)}
						{frontBuilderNames.options.map((name) => (
							<Option key={name} id={name}>
								{frontBuilderLabels[name]}
							</Option>
						))}
					</Select>
				</>
			)}
		/>
	);
	return (
		<div css={sectionsStyles}>
			<FieldSection title="Overall theme">
				<Select
					label="Palette override"
					cssOverrides={formControlStyles}
					value={settings.paletteOverride ?? 'default'}
					onChange={(key) =>
						onChange(
							'paletteOverride',
							themeEnumSchema.safeParse(key).data,
							targetsForField.paletteOverride,
						)
					}
				>
					<Option id="default">Newsletter default</Option>
					{themeEnumSchema.options.map((theme) => (
						<Option key={theme} id={theme}>
							{theme}
						</Option>
					))}
				</Select>
			</FieldSection>
			<FieldSection
				title="Hero options"
				description="Controls the banner and headline block"
			>
				<div css={heroOptionsStyles}>
					{checkbox('displayDate', 'Show date')}
					{checkbox('displayStandfirst', 'Show standfirst')}
					{checkbox('displayImageCaptions', 'Show image captions')}
					{checkbox('darkHeadlineBackground', 'Dark headline background')}
				</div>
			</FieldSection>
			<FieldSection
				title="Body options"
				description="Controls body section options of the newsletter"
				body
			>
				<div css={blockStyles}>
					<Select
						label="Bullet list style"
						value={settings.bulletListStyle ?? 'default'}
						onChange={(key) =>
							onChange(
								'bulletListStyle',
								key === 'bulleted' || key === 'lined' ? key : undefined,
								targetsForField.bulletListStyle,
							)
						}
					>
						<Option id="default">None</Option>
						<Option id="bulleted">Bulleted</Option>
						<Option id="lined">Lined</Option>
					</Select>
				</div>
				<div css={blockStyles}>
					<Typography
						element="h3"
						variant="labelFormMd"
						cssOverrides={headingStyles}
					>
						Breaking news
					</Typography>
					{checkbox('includeBreakingNews', 'Include breaking news section')}
				</div>
				{namedList(
					'linkListSubheading',
					'Link list',
					'Link list sections',
					'Set the subheadings for link list sections.',
				)}
				{automatedFronts}
				{namedList(
					'questionBlockSubheading',
					'Question block',
					'Question block sections',
					'Set the subheadings for question block sections.',
				)}
				{namedList(
					'podcastSubheading',
					'Podcast',
					'Podcast sections',
					'Set the subheadings for podcast sections.',
				)}
				{readMore}
				{namedList(
					'darkThemeSubheading',
					'Dark theme',
					'Dark subheading sections',
					'Set which subheadings use the dark theme.',
				)}
			</FieldSection>
			<FieldSection title="Footer options">
				<TextInput
					label="Custom footer email"
					placeholder="Enter email address here"
					cssOverrides={formControlStyles}
					type="email"
					value={settings.contactEmail ?? ''}
					onInput={(event) => {
						const email = optional(event.currentTarget.value);
						onChange('contactEmail', email, { kind: 'footer', email });
					}}
				/>
			</FieldSection>
		</div>
	);
};
