import { css } from '@emotion/react';
import { baseSpacing } from '@guardian/stand';
import { Radio, RadioGroup } from '@guardian/stand/RadioGroup';
import { Option, Select } from '@guardian/stand/Select';
import { TextInput } from '@guardian/stand/TextInput';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	dataCollectionSchema,
	newsletterDataSchema,
	regionFocusEnumSchema,
	themeEnumSchema,
} from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { useIsMobile } from '../hooks/useIsMobile';
import { humanize } from '../lib/format';
import { frequencyOptions } from '../lib/frequency-options';
import { Field, listStyles } from './NewsletterDetailFields';
import {
	getLaunchedStatusBadgeContent,
	NewsletterStatusBadge,
} from './NewsletterStatusBadge';
import { StandPanel } from './StandPanel';
import { StandRadioSelectInput } from './StandRedesignSchemaForm/RadioSelectInput';

const panelSchema = newsletterDataSchema.pick({
	name: true,
	status: true,
	theme: true,
	regionFocus: true,
	frequency: true,
	group: true,
});
type Attributes = Pick<NewsletterData, keyof typeof panelSchema.shape>;

const statuses: Array<NewsletterData['status']> = [
	'pending',
	'live',
	'paused',
	'cancelled',
];
const groupOptions = dataCollectionSchema.shape.group.options;

const formStyles = css`
	grid-column: 1 / -1;
	display: grid;
	gap: ${baseSpacing['24Px']};
	min-width: 0;
`;

const attributesOf = (newsletter: NewsletterData): Attributes => ({
	name: newsletter.name,
	status: newsletter.status,
	theme: newsletter.theme,
	regionFocus: newsletter.regionFocus,
	frequency: newsletter.frequency,
	group: newsletter.group,
});

/** Keep a group that isn't one of the options, so saving doesn't change it. */
const withCurrent = (options: readonly string[], current?: string) =>
	current && !options.includes(current) ? [...options, current] : options;

export const AttributesPanel = ({
	newsletter,
	onSaved,
}: {
	newsletter: NewsletterData;
	onSaved?: (newsletter: NewsletterData) => void;
}) => {
	const isMobile = useIsMobile();
	const [saved, setSaved] = useState<Attributes>();
	const current = saved ?? attributesOf(newsletter);
	const [draft, setDraft] = useState<Attributes>(current);
	const update = (changes: Partial<Attributes>) =>
		setDraft((previous) => ({ ...previous, ...changes }));
	const parsed = panelSchema.safeParse({
		...draft,
		name: draft.name.trim(),
		frequency: draft.frequency.trim(),
	});

	const save = async (): Promise<boolean | string> => {
		if (!parsed.success) {
			return false;
		}
		const response = await requestNewsletterEdit(
			newsletter.listId,
			parsed.data,
		);
		if (!response.ok) {
			return response.message ?? false;
		}
		setSaved(attributesOf(response.data));
		onSaved?.(response.data);
		return true;
	};

	const select = (
		label: string,
		value: string | undefined,
		options: ReadonlyArray<{ id: string; label: string }>,
		onChange?: (value: string) => void,
	) => (
		<Select
			label={label}
			placeholder="Not set"
			value={value ?? null}
			isDisabled={!onChange}
			onChange={(key) => {
				if (typeof key === 'string') {
					onChange?.(key);
				}
			}}
		>
			{options.map(({ id, label }) => (
				<Option key={id} id={id}>
					{label}
				</Option>
			))}
		</Select>
	);
	const plainOptions = (options: readonly string[]) =>
		options.map((option) => ({ id: option, label: option }));

	return (
		<StandPanel
			name="Attributes"
			id="attributes"
			subgrid
			onSave={save}
			canSave={parsed.success}
			onEdit={() => setDraft(current)}
		>
			{(isEditing) =>
				isEditing ? (
					<div css={formStyles}>
						<TextInput
							label="Name"
							fluid
							value={draft.name}
							onChange={(name) => update({ name })}
							isInvalid={!draft.name.trim()}
							error={draft.name.trim() ? undefined : 'Enter a name'}
						/>
						<RadioGroup
							label="Newsletter status"
							orientation={isMobile ? 'vertical' : 'horizontal'}
							value={draft.status}
							onChange={(value) =>
								update({ status: panelSchema.shape.status.parse(value) })
							}
						>
							{statuses.map((status) => (
								<Radio key={status} value={status}>
									{getLaunchedStatusBadgeContent(status).label}
								</Radio>
							))}
						</RadioGroup>
						{select(
							'Pillar',
							draft.theme,
							themeEnumSchema.options.map((theme) => ({
								id: theme,
								label: humanize(theme),
							})),
							(theme) => update({ theme: themeEnumSchema.parse(theme) }),
						)}
						{select(
							'Region focus',
							draft.regionFocus,
							plainOptions(regionFocusEnumSchema.unwrap().options),
							(regionFocus) =>
								update({
									regionFocus: regionFocusEnumSchema.parse(regionFocus),
								}),
						)}
						<StandRadioSelectInput
							label="Frequency"
							value={draft.frequency}
							options={frequencyOptions}
							otherInputLabel="Custom (please specify)"
							error={draft.frequency.trim() ? undefined : 'Enter a frequency'}
							inputHandler={(frequency) => {
								if (typeof frequency === 'string') {
									update({ frequency });
								}
							}}
						/>
						{select('Type of newsletter', newsletter.category, [
							{ id: newsletter.category, label: humanize(newsletter.category) },
						])}
						{select(
							'MMA group',
							draft.group,
							plainOptions(withCurrent(groupOptions, current.group)),
							(group) => update({ group }),
						)}
					</div>
				) : (
					<dl css={listStyles}>
						<Field label="Name">{current.name}</Field>
						<Field label="Newsletter status">
							<NewsletterStatusBadge
								newsletter={{ ...newsletter, status: current.status }}
								size="xs"
							/>
						</Field>
						<Field label="Pillar">{humanize(current.theme)}</Field>
						<Field label="Region focus">{current.regionFocus}</Field>
						<Field label="Frequency">{current.frequency}</Field>
						<Field label="Type of newsletter">
							{humanize(newsletter.category)}
						</Field>
						<Field label="MMA group">{current.group}</Field>
					</dl>
				)
			}
		</StandPanel>
	);
};
