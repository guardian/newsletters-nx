import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Option, Select } from '@guardian/stand/Select';
import { TextInput } from '@guardian/stand/TextInput';
import {
	dataCollectionRenderingOptionsSchema,
	themeEnumSchema,
} from '@newsletters-nx/newsletters-data-client';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
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
	gap: ${semanticSpacing.stackSm};
	min-width: 0;
	margin: 0;
	padding: ${semanticSpacing.stackMd};
	border: 1px solid ${semanticColors.border.weak};
	border-radius: 4px;
`;

export const layoutFieldStack = css`
	display: grid;
	gap: ${semanticSpacing.stackSm};
	min-width: 0;
`;

const groupStyles = css`
	${blockStyles};
	background: ${semanticColors.bg.raisedLevel1};
	legend {
		font-weight: 700;
	}
`;

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

const namedFields: { key: NamedField; label: string }[] = [
	{ key: 'linkListSubheading', label: 'Link list' },
	{ key: 'questionBlockSubheading', label: 'Question block' },
	{ key: 'podcastSubheading', label: 'Podcast' },
	{ key: 'darkThemeSubheading', label: 'Dark theme' },
];

const EditableList = <T,>({
	label,
	initial,
	create,
	getName,
	onChange,
	group,
	renderItem,
}: {
	label: string;
	initial: Array<T> | undefined;
	create: () => T;
	getName: (value: T) => string;
	onChange: (value: Array<T> | undefined, target?: PreviewTarget) => void;
	group?: 'read-more' | 'automated-fronts';
	renderItem: (
		value: T,
		update: (value: T) => void,
		index: number,
	) => ReactNode;
}) => {
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
		<fieldset css={blockStyles}>
			<legend>{label}</legend>
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
					size="sm"
					variant="secondary"
					onPress={() =>
						change([...rows, { id: nextId.current++, value: create() }])
					}
				>
					Add {label.toLowerCase()}
				</Button>
			</div>
		</fieldset>
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
	return (
		<>
			<fieldset css={groupStyles}>
				<legend>Hero</legend>
				<Select
					label="Palette"
					value={settings.paletteOverride ?? 'default'}
					onChange={(key) => {
						const theme = themeEnumSchema.safeParse(key);
						onChange(
							'paletteOverride',
							theme.data,
							targetsForField.paletteOverride,
						);
					}}
				>
					<Option id="default">Newsletter default</Option>
					{themeEnumSchema.options.map((theme) => (
						<Option key={theme} id={theme}>
							{theme}
						</Option>
					))}
				</Select>
				{checkbox('displayDate', 'Display date')}
				{checkbox('displayStandfirst', 'Display standfirst')}
				{checkbox('darkHeadlineBackground', 'Dark headline background')}
			</fieldset>
			<fieldset css={groupStyles}>
				<legend>Body</legend>
				{checkbox('displayImageCaptions', 'Display image captions')}
				{checkbox('includeBreakingNews', 'Include breaking news')}
				<Select
					label="Bullet list style"
					value={settings.bulletListStyle ?? 'default'}
					onChange={(key) => {
						onChange(
							'bulletListStyle',
							key === 'bulleted' || key === 'lined' ? key : undefined,
							targetsForField.bulletListStyle,
						);
					}}
				>
					<Option id="default">Newsletter default</Option>
					<Option id="bulleted">Bulleted</Option>
					<Option id="lined">Lined</Option>
				</Select>
				{namedFields.map(({ key, label }) => (
					<EditableList
						key={key}
						label={label}
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
				))}
			</fieldset>
			<EditableList<ReadMore>
				label="Read more"
				initial={initial.readMoreSections}
				group="read-more"
				create={() => ({ subheading: '', wording: '' })}
				getName={({ subheading }) => subheading}
				onChange={(value, target) =>
					onChange('readMoreSections', value, target)
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
			<EditableList<AutomatedFront>
				label="Automated front"
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
							{!frontBuilderNames.safeParse(item.partBuilderFunction)
								.success && (
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
			<fieldset css={groupStyles}>
				<legend>Footer</legend>
				<TextInput
					label="Contact email"
					type="email"
					value={settings.contactEmail ?? ''}
					onInput={(event) => {
						const email = optional(event.currentTarget.value);
						onChange('contactEmail', email, { kind: 'footer', email });
					}}
				/>
			</fieldset>
		</>
	);
};
