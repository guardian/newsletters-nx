import { css } from '@emotion/react';
import { baseSpacing, semanticSizing } from '@guardian/stand';
import { TextArea } from '@guardian/stand/TextArea';
import { TextInput } from '@guardian/stand/TextInput';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { Field, listStyles } from './NewsletterDetailFields';
import { StandPanel } from './StandPanel';

const copyFields = [
	{ key: 'signUpHeadline', label: 'Headline' },
	{ key: 'signUpDescription', label: 'Sign-up description' },
	{ key: 'signUpEmbedDescription', label: 'Embed description' },
	{ key: 'mailSuccessDescription', label: 'Success message' },
	{ key: 'highlightCardTitle', label: 'Highlight card message' },
] as const;

const copySchema = newsletterDataSchema.pick({
	signUpHeadline: true,
	signUpDescription: true,
	signUpEmbedDescription: true,
	mailSuccessDescription: true,
	highlightCardTitle: true,
});

const copyFormStyle = css`
	grid-column: 1 / -1;
	display: grid;
	gap: ${baseSpacing['24Px']};
	min-width: 0;

	> div,
	input,
	textarea {
		width: 100%;
		max-width: none;
		box-sizing: border-box;
	}

	textarea {
		/* Approximate height for 2 lines of text. Stand does not expose the textArea rows
				attribute and adds some default css height. So we have to override that here */
		height: calc(
			2lh + ${baseSpacing['16Rem']} + 2 * ${semanticSizing.border.default}
		);
	}
`;

export const CopyPanel = ({ newsletter }: { newsletter: NewsletterData }) => {
	const [savedCopy, setSavedCopy] = useState<Partial<NewsletterData>>();
	const current = { ...newsletter, ...savedCopy };
	const [draft, setDraft] = useState<Partial<NewsletterData>>({});
	const save = async (): Promise<boolean | string> => {
		const parsed = copySchema.safeParse(draft);
		if (!parsed.success) {
			return parsed.error.issues.map((issue) => issue.message).join(' ');
		}
		const response = await requestNewsletterEdit(
			newsletter.listId,
			parsed.data,
		);
		if (!response.ok) {
			return response.message ?? false;
		}
		setSavedCopy(
			Object.fromEntries(
				copyFields.map(({ key }) => [key, response.data[key]]),
			),
		);
		return true;
	};

	return (
		<StandPanel
			name="Copy"
			id="copy"
			subgrid
			onSave={save}
			onEdit={() => {
				setDraft(
					Object.fromEntries(
						copyFields.map(({ key }) => [key, current[key] ?? '']),
					),
				);
			}}
			onCancel={() => {
				setDraft({});
			}}
		>
			{(isEditing) =>
				isEditing ? (
					<div css={copyFormStyle}>
						{copyFields.map(({ key, label }) => {
							const Input =
								key === 'signUpHeadline' || key === 'mailSuccessDescription'
									? TextInput
									: TextArea;
							return (
								<Input
									key={key}
									label={label}
									value={draft[key] ?? ''}
									isRequired={
										key === 'signUpDescription' ||
										key === 'signUpEmbedDescription'
									}
									onChange={(value) =>
										setDraft((previous) => ({ ...previous, [key]: value }))
									}
								/>
							);
						})}
					</div>
				) : (
					<dl css={listStyles}>
						{copyFields.map(({ key, label }) => (
							<Field key={key} label={label}>
								{current[key]}
							</Field>
						))}
					</dl>
				)
			}
		</StandPanel>
	);
};
