import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Radio, RadioGroup } from '@guardian/stand/RadioGroup';
import { TextInput } from '@guardian/stand/TextInput';
import { TextListInput } from '@guardian/stand/TextListInput';
import { Typography } from '@guardian/stand/Typography';
import type {
	NewsletterData,
	WorkflowStatus,
} from '@newsletters-nx/newsletters-data-client';
import {
	brazeSubscribeEventName,
	brazeUnsubscribeEventName,
	newsletterDataSchema,
} from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { Field, listStyles } from './NewsletterDetailFields';
import { StandPanel } from './StandPanel';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

const brazeFields = [
	'brazeCampaignCreationStatus',
	'brazeNewsletterName',
	'brazeSubscribeAttributeName',
	'brazeSubscribeEventNamePrefix',
	'brazeSubscribeAttributeNameAlternate',
] as const;

const ophanFields = ['campaignName', 'campaignCode'] as const;

const integrationFields = [...brazeFields, ...ophanFields];
export type IntegrationKey = (typeof integrationFields)[number];

type IntegrationsDraft = Partial<Pick<NewsletterData, IntegrationKey>>;

type IntegrationsErrors = Partial<Record<IntegrationKey, string>>;

const integrationsSchema = newsletterDataSchema.pick({
	brazeCampaignCreationStatus: true,
	brazeNewsletterName: true,
	brazeSubscribeAttributeName: true,
	brazeSubscribeEventNamePrefix: true,
	brazeSubscribeAttributeNameAlternate: true,
	campaignName: true,
	campaignCode: true,
});

const listGroupStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	row-gap: ${semanticSpacing.stackSm};
	margin: 0;
`;

const hrStyles = css`
	height: 1px;

	background: ${semanticColors.border.weak};
	border: none;
	flex: 1 0 0;

	margin: 0;

	/** Prevent flex from shrinking it */
	min-height: 1px;
`;

/** For styling lists in a <Field /> */
const fieldListStyles = css`
	display: flex;
	flex-flow: column nowrap;
	gap: ${semanticSpacing.stackXxs};
	list-style: none;
`;

const groupHeaderStyles = css`
	display: flex;
	flex-flow: column nowrap;

	gap: ${baseSpacing['12Px']};

	/** Full width */
	width: 100%;

	/** Take up a full grid-row */
	grid-column: 1/-1;
`;

const editGroupStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;

	row-gap: ${baseSpacing['24Px']};
	margin: 0;
`;

const fullWidthInputStyles = css`
	/** Full width */
	width: 100%;

	/** Take up a full grid-row */
	grid-column: 1/-1;
`;

const toDraft = (newsletter: Partial<NewsletterData>): IntegrationsDraft => ({
	brazeCampaignCreationStatus:
		newsletter.brazeCampaignCreationStatus ?? 'NOT_REQUESTED',
	brazeNewsletterName: newsletter.brazeNewsletterName ?? '',
	brazeSubscribeAttributeName: newsletter.brazeSubscribeAttributeName ?? '',
	brazeSubscribeEventNamePrefix: newsletter.brazeSubscribeEventNamePrefix ?? '',
	brazeSubscribeAttributeNameAlternate: [
		...(newsletter.brazeSubscribeAttributeNameAlternate ?? []),
	],
	campaignName: newsletter.campaignName ?? '',
	campaignCode: newsletter.campaignCode ?? '',
});

const optionalValue = (value?: string) => {
	const trimmed = value?.trim();
	return trimmed === '' ? undefined : trimmed;
};

/** Drop blank rows, which TextListInput adds via "Add new item". */
const toAlternateNames = (values?: string[]) => {
	const names = (values ?? []).map((name) => name.trim()).filter(Boolean);
	return names.length ? names : undefined;
};

/** Normalises the draft: trims values and maps blank optional values to undefined */
const normaliseDraft = (draft: IntegrationsDraft): IntegrationsDraft => ({
	brazeCampaignCreationStatus: draft.brazeCampaignCreationStatus,
	brazeNewsletterName: draft.brazeNewsletterName?.trim() ?? '',
	brazeSubscribeAttributeName: draft.brazeSubscribeAttributeName?.trim() ?? '',
	brazeSubscribeEventNamePrefix:
		draft.brazeSubscribeEventNamePrefix?.trim() ?? '',
	brazeSubscribeAttributeNameAlternate: toAlternateNames(
		draft.brazeSubscribeAttributeNameAlternate,
	),
	campaignName: optionalValue(draft.campaignName),
	campaignCode: optionalValue(draft.campaignCode),
});

/** Normalises the draft, then validates it against the schema */
const parseDraft = (draft: IntegrationsDraft) =>
	integrationsSchema.safeParse(normaliseDraft(draft));

const formatParseErrors = (
	error: { issues: ReadonlyArray<{ path: PropertyKey[]; message: string }> },
	draft: IntegrationsDraft,
): string =>
	error.issues
		.map((issue) => {
			const [key, index] = issue.path;
			if (key === 'brazeSubscribeAttributeNameAlternate') {
				// There could issues with several of the alternate names. So list them all
				const value =
					normaliseDraft(draft).brazeSubscribeAttributeNameAlternate?.[
						Number(index)
					];
				return `${key} "${value}": ${issue.message}`;
			}
			return key === undefined
				? issue.message
				: `${String(key)}: ${issue.message}`;
		})
		.join(' ');

const validate = (draft: IntegrationsDraft): IntegrationsErrors => {
	const errors: IntegrationsErrors = {};

	const result = parseDraft(draft);

	// Issues for list items (e.g. an alternate name) are keyed by their field
	for (const issue of result.error?.issues ?? []) {
		const key = issue.path[0] as IntegrationKey | undefined;
		if (key !== undefined && errors[key] === undefined) {
			errors[key] = issue.message;
		}
	}
	return errors;
};

export const IntegrationsPanel = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => {
	const [savedIntegrations, setSavedIntegrations] =
		useState<Partial<NewsletterData>>();
	const current = { ...newsletter, ...savedIntegrations };
	const [draft, setDraft] = useState<IntegrationsDraft>({});
	const errors = validate(draft);

	const save = async (): Promise<boolean | string> => {
		const parsed = parseDraft(draft);
		if (!parsed.success) {
			return formatParseErrors(parsed.error, draft);
		}
		const response = await requestNewsletterEdit(
			newsletter.listId,
			parsed.data,
		);
		if (!response.ok) {
			return response.message ?? false;
		}
		setSavedIntegrations(
			Object.fromEntries(
				integrationFields.map((key) => [key, response.data[key]]),
			),
		);
		return true;
	};

	return (
		<StandPanel
			name="Integrations"
			id="integrations"
			subgrid
			onSave={save}
			canSave={Object.keys(errors).length === 0}
			onEdit={() => {
				setDraft(toDraft(current));
			}}
			onCancel={() => {
				setDraft({});
			}}
		>
			{(isEditing) =>
				isEditing ? (
					<EditIntegrations
						draft={draft}
						errors={errors}
						onChange={(changes) =>
							setDraft((previous) => ({ ...previous, ...changes }))
						}
					/>
				) : (
					<ViewIntegrations newsletter={current} />
				)
			}
		</StandPanel>
	);
};

const LabelWithAsterisk = ({ label }: { label: string }) => {
	return <span>{label} *</span>;
};

const EditIntegrations = ({
	draft,
	onChange,
	errors,
}: {
	draft: IntegrationsDraft;
	onChange: (changes: IntegrationsDraft) => void;
	errors: IntegrationsErrors;
}) => {
	return (
		<div
			css={css`
				display: grid;
				grid-template-columns: subgrid;

				grid-column: 1 / -1;

				row-gap: ${baseSpacing['36Px']};
			`}
		>
			<section
				css={editGroupStyles}
				aria-labelledby={'integrations-braze-values'}
			>
				<header css={groupHeaderStyles}>
					<Typography
						id={'integrations-braze-values'}
						element="h4"
						variant="labelFormInlineSm"
					>
						Braze values
					</Typography>
					<hr css={hrStyles} />
				</header>
				<RadioGroup
					isRequired
					renderLabel={(label) => <LabelWithAsterisk label={label} />}
					css={fullWidthInputStyles}
					orientation="horizontal"
					label="Braze campaign creation status"
					value={draft.brazeCampaignCreationStatus}
					onChange={(value) => {
						onChange({
							// N.B: In reality, value always is a WorkflowStatus
							brazeCampaignCreationStatus: value as WorkflowStatus,
						});
					}}
					isInvalid={Boolean(errors.brazeCampaignCreationStatus)}
					error={errors.brazeCampaignCreationStatus}
				>
					<Radio
						key={'NOT_REQUESTED'}
						value={'NOT_REQUESTED' satisfies WorkflowStatus}
					>
						Not Requested
					</Radio>
					<Radio key={'REQUESTED'} value={'REQUESTED' satisfies WorkflowStatus}>
						Requested
					</Radio>
					<Radio key={'COMPLETED'} value={'COMPLETED' satisfies WorkflowStatus}>
						Completed
					</Radio>
				</RadioGroup>
				<TextInput
					isRequired
					renderLabel={(label) => <LabelWithAsterisk label={label} />}
					css={fullWidthInputStyles}
					label="brazeNewsletterName"
					value={draft.brazeNewsletterName ?? ''}
					onChange={(value) => onChange({ brazeNewsletterName: value })}
					isInvalid={Boolean(errors.brazeNewsletterName)}
					error={errors.brazeNewsletterName}
				/>
				<TextInput
					isRequired
					renderLabel={(label) => <LabelWithAsterisk label={label} />}
					css={fullWidthInputStyles}
					label="brazeSubscribeAttributeName"
					value={draft.brazeSubscribeAttributeName ?? ''}
					onChange={(value) => onChange({ brazeSubscribeAttributeName: value })}
					isInvalid={Boolean(errors.brazeSubscribeAttributeName)}
					error={errors.brazeSubscribeAttributeName}
				/>
				<TextInput
					isRequired
					renderLabel={(label) => <LabelWithAsterisk label={label} />}
					css={fullWidthInputStyles}
					label="brazeSubscribeEventNamePrefix"
					value={draft.brazeSubscribeEventNamePrefix ?? ''}
					onChange={(value) =>
						onChange({ brazeSubscribeEventNamePrefix: value })
					}
					isInvalid={Boolean(errors.brazeSubscribeEventNamePrefix)}
					error={errors.brazeSubscribeEventNamePrefix}
				/>
				<TextListInput
					css={fullWidthInputStyles}
					label="brazeSubscribeAttributeNameAlternate"
					initialData={draft.brazeSubscribeAttributeNameAlternate}
					onChange={(values) =>
						onChange({ brazeSubscribeAttributeNameAlternate: values })
					}
					errorMessage={errors.brazeSubscribeAttributeNameAlternate}
				/>
			</section>
			<section
				css={editGroupStyles}
				aria-labelledby={'integrations-ophan-values'}
			>
				<header css={groupHeaderStyles}>
					<Typography
						id={'integrations-ophan-values'}
						element="h4"
						variant="labelFormInlineSm"
					>
						Ophan values
					</Typography>
					<hr css={hrStyles} />
				</header>
				<TextInput
					css={fullWidthInputStyles}
					label="Campaign name"
					value={draft.campaignName ?? ''}
					onChange={(value) => onChange({ campaignName: value })}
				/>
				<TextInput
					css={fullWidthInputStyles}
					label="Campaign code"
					value={draft.campaignCode ?? ''}
					onChange={(value) => onChange({ campaignCode: value })}
				/>
			</section>
		</div>
	);
};

const ViewIntegrations = ({ newsletter }: { newsletter: NewsletterData }) => (
	<div
		css={css`
			display: grid;
			grid-template-columns: subgrid;

			grid-column: 1 / -1;
			row-gap: ${baseSpacing['12Px']};
		`}
	>
		<section
			css={listGroupStyles}
			aria-labelledby={'integrations-braze-values'}
		>
			<Typography
				id={'integrations-braze-values'}
				element="h4"
				variant="bodyBoldMd"
			>
				Braze values
			</Typography>
			<dl css={listStyles}>
				<Field label="Braze campaign creation status">
					<WorkflowStatusBadge
						status={newsletter.brazeCampaignCreationStatus}
					/>
				</Field>
				<Field label="brazeNewsletterName">
					{newsletter.brazeNewsletterName}
				</Field>
				<Field label="brazeSubscribeAttributeName">
					{newsletter.brazeSubscribeAttributeName}
				</Field>
				<Field label="brazeSubscribeEventNamePrefix">
					{newsletter.brazeSubscribeEventNamePrefix}
				</Field>
				<Field label="brazeSubscribeAttributeNameAlternate">
					{newsletter.brazeSubscribeAttributeNameAlternate?.length ? (
						<ul css={fieldListStyles}>
							{newsletter.brazeSubscribeAttributeNameAlternate.map(
								(item, idx) => (
									<li key={idx}>{item}</li>
								),
							)}
						</ul>
					) : null}
				</Field>
				<Field label="braze subscribe event name">
					{newsletter.brazeSubscribeEventNamePrefix
						? brazeSubscribeEventName.generate(newsletter)
						: undefined}
				</Field>
				<Field label="braze unsubscribe event name">
					{newsletter.brazeSubscribeEventNamePrefix
						? brazeUnsubscribeEventName.generate(newsletter)
						: undefined}
				</Field>
			</dl>
		</section>
		<hr
			css={css`
				${hrStyles};
				/** Full width */
				grid-column: 1/-1;
				width: 100%;
			`}
		/>
		<section
			css={listGroupStyles}
			aria-labelledby={'integrations-ophan-values'}
		>
			<Typography
				id={'integrations-ophan-values'}
				element="h4"
				variant="bodyBoldMd"
			>
				Ophan values
			</Typography>
			<dl css={listStyles}>
				<Field label="Campaign name">{newsletter.campaignName}</Field>
				<Field label="Campaign code">{newsletter.campaignCode}</Field>
			</dl>
		</section>
	</div>
);
