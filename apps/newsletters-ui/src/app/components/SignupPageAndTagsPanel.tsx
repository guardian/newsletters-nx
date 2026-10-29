import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Link } from '@guardian/stand/Link';
import { Radio, RadioGroup } from '@guardian/stand/RadioGroup';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	newsletterDataSchema,
	workflowStatusEnumSchema,
} from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { workflowStatusLabels } from '../lib/workflow-status-labels';
import { Field, listStyles } from './NewsletterDetailFields';
import { SignupPathInput } from './SignupPathInput';
import type { SignupPathValidation } from './SignupPathInput';
import { StandPanel } from './StandPanel';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

const textFields = [
	{ key: 'signupPage', label: 'Path to sign-up page' },
	{ key: 'seriesTag', label: 'Series tag' },
	{ key: 'seriesTagDescription', label: 'Tag description' },
	{ key: 'composerTag', label: 'Campaign tag' },
	{ key: 'composerCampaignTag', label: 'Campaign description' },
] as const;

const panelSchema = newsletterDataSchema.pick({
	signupPageCreationStatus: true,
	signupPage: true,
	tagCreationStatus: true,
	seriesTag: true,
	seriesTagDescription: true,
	composerTag: true,
	composerCampaignTag: true,
});
type PanelData = Pick<NewsletterData, keyof typeof panelSchema.shape>;

const sectionStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	row-gap: ${semanticSpacing.stackSm};

	& + & {
		margin-top: ${baseSpacing['12Px']};
		padding-top: ${baseSpacing['12Px']};
		border-top: 1px solid ${semanticColors.border.weak};
	}
`;

const subheadingStyles = css`
	grid-column: 1 / -1;
	margin: 0;
`;

const formSectionStyles = css`
	grid-template-columns: minmax(0, 1fr);
	row-gap: ${baseSpacing['24Px']};

	& + & {
		margin-top: ${baseSpacing['32Px']};
		padding-top: 0;
		border-top: none;
	}

	> h4 {
		padding-bottom: ${baseSpacing['12Px']};
		border-bottom: 1px solid ${semanticColors.border.weak};
	}
`;

const valuesFor = (newsletter: NewsletterData): PanelData => ({
	signupPageCreationStatus: newsletter.signupPageCreationStatus,
	tagCreationStatus: newsletter.tagCreationStatus,
	...Object.fromEntries(textFields.map(({ key }) => [key, newsletter[key]])),
});

export const SignupPageAndTagsPanel = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => {
	const [savedValues, setSavedValues] = useState<PanelData>();
	const current = savedValues ?? valuesFor(newsletter);
	const [draft, setDraft] = useState<PanelData>(current);
	const [pathValidation, setPathValidation] = useState<SignupPathValidation>();

	const parseDraft = () =>
		panelSchema.safeParse({
			...draft,
			...Object.fromEntries(
				textFields.map(({ key }) => [
					key,
					draft[key] === '' ? undefined : draft[key],
				]),
			),
		});
	const validate = (): true | string => {
		if (
			draft.signupPage &&
			(pathValidation?.path !== draft.signupPage || !pathValidation.valid)
		) {
			return 'Please enter a valid path to sign-up page';
		}
		const parsed = parseDraft();
		return (
			parsed.success ||
			parsed.error.issues.map(({ message }) => message).join(' ')
		);
	};
	const save = async (): Promise<boolean | string> => {
		const validation = validate();
		if (validation !== true) {
			return validation;
		}
		const parsed = parseDraft();
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
		setSavedValues(valuesFor(response.data));
		return true;
	};

	const statusInput = (
		key: 'signupPageCreationStatus' | 'tagCreationStatus',
		label: string,
	) => (
		<RadioGroup
			label={label}
			orientation="horizontal"
			fluid
			value={draft[key]}
			onChange={(value) =>
				setDraft((previous) => ({
					...previous,
					[key]: workflowStatusEnumSchema.parse(value),
				}))
			}
		>
			{workflowStatusEnumSchema.options.map((status) => (
				<Radio key={status} value={status}>
					{workflowStatusLabels[status]}
				</Radio>
			))}
		</RadioGroup>
	);

	return (
		<StandPanel
			name="Sign-up page and tags"
			id="sign-up-page-and-tags"
			subgrid
			onSave={save}
			onValidate={validate}
			onEdit={() => {
				setPathValidation(undefined);
				setDraft(current);
			}}
			onCancel={() => setDraft(current)}
		>
			{(isEditing) => (
				<>
					<div css={[sectionStyles, isEditing && formSectionStyles]}>
						<Typography
							element="h4"
							variant={isEditing ? 'bodySm' : 'bodyBoldSm'}
							cssOverrides={subheadingStyles}
						>
							Sign-up page
						</Typography>
						{isEditing ? (
							<>
								{statusInput(
									'signupPageCreationStatus',
									'Sign-up page creation status',
								)}
								<SignupPathInput
									value={draft.signupPage ?? ''}
									onValidation={setPathValidation}
									onChange={(value) => {
										setPathValidation(undefined);
										setDraft((previous) => ({
											...previous,
											signupPage: value,
										}));
									}}
								/>
							</>
						) : (
							<dl css={listStyles}>
								<Field label="Sign-up page creation status">
									<WorkflowStatusBadge
										status={current.signupPageCreationStatus}
									/>
								</Field>
								<Field label="Path to sign-up page">
									{current.signupPage ? (
										<Link href={`https://theguardian.com${current.signupPage}`}>
											{current.signupPage}
										</Link>
									) : undefined}
								</Field>
							</dl>
						)}
					</div>
					<div css={[sectionStyles, isEditing && formSectionStyles]}>
						<Typography
							element="h4"
							variant={isEditing ? 'bodySm' : 'bodyBoldSm'}
							cssOverrides={subheadingStyles}
						>
							Tags
						</Typography>
						{isEditing ? (
							<>
								{statusInput('tagCreationStatus', 'Tag creation status')}
								{textFields.slice(1).map(({ key, label }) => (
									<TextInput
										key={key}
										label={label}
										fluid
										value={draft[key] ?? ''}
										onChange={(value) =>
											setDraft((previous) => ({ ...previous, [key]: value }))
										}
									/>
								))}
							</>
						) : (
							<dl css={listStyles}>
								<Field label="Tag creation status">
									<WorkflowStatusBadge status={current.tagCreationStatus} />
								</Field>
								{textFields.slice(1).map(({ key, label }) => (
									<Field key={key} label={label}>
										{current[key]}
									</Field>
								))}
							</dl>
						)}
					</div>
				</>
			)}
		</StandPanel>
	);
};
