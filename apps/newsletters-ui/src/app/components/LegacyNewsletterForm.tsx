import { css } from '@emotion/react';
import { useState } from 'react';
import {
	deriveNewsletterFieldsFromName,
	emailEmbedSchema,
	illustrationSchema,
	legacyNewsletterSchema,
	legacyNewsletterSchemaAllowingEmptyStrings,
} from '@newsletters-nx/newsletters-data-client';
import type { LegacyNewsletter } from '@newsletters-nx/newsletters-data-client';
import { makeBlankNewsletter } from '../blanks';
import { ContentWrapper } from '../ContentWrapper';
import { ArrayInput } from './ArrayInput';
import { LegacyNewsletterDetail } from './LegacyNewsletterDetails';
import type { FieldDef, FieldValue } from './SchemaForm';
import { getModification, SchemaForm } from './SchemaForm';

interface Props {
	existingIds: string[];
}

export const LegacyNewsletterForm = ({ existingIds }: Props) => {
	const [newsletter, setNewsletter] = useState<LegacyNewsletter>(
		makeBlankNewsletter(),
	);

	const [warnings, setWarnings] = useState<
		Partial<Record<keyof LegacyNewsletter, string>>
	>({});

	const hasWarnings = Object.values(warnings).some((warning) => !!warning);

	const manageChange = (value: FieldValue, key: FieldDef) => {
		const mod = getModification(value, key);
		const revisedData = {
			...newsletter,
			...mod,
		};

		if (typeof mod['identityName'] === 'string') {
			const newIdName = mod['identityName'];
			if (existingIds.includes(newIdName)) {
				setWarnings({
					identityName: `There is an existing newsletters with identityName "${newIdName}"`,
				});
			}
		}

		updateDataAndWarnings(revisedData);
	};

	const manageArrayChange = (data: string[], field: keyof LegacyNewsletter) => {
		const revisedData: Partial<Record<keyof LegacyNewsletter, unknown>> = {
			...newsletter,
		};
		revisedData[field] = data;
		updateDataAndWarnings(revisedData);
	};

	const manageEmailEmbedChange = (value: FieldValue, key: FieldDef) => {
		const mod = getModification(value, key);
		const revisedData = {
			...newsletter,
			emailEmbed: {
				...newsletter.emailEmbed,
				...mod,
			},
		};
		updateDataAndWarnings(revisedData);
	};
	const manageIllustrationChange = (value: FieldValue, key: FieldDef) => {
		const mod = getModification(value, key);
		const revisedData = {
			...newsletter,
			illustration: {
				...newsletter.illustration,
				...mod,
			},
		};
		updateDataAndWarnings(revisedData);
	};

	const deriveValuesFromName = () => {
		const { name } = newsletter;
		if (name === '') return;

		const revisedData = {
			...newsletter,
			...deriveNewsletterFieldsFromName(name),
		};
		updateDataAndWarnings(revisedData);
	};

	const updateDataAndWarnings = (
		revisedData: Partial<Record<keyof LegacyNewsletter, unknown>>,
	) => {
		setWarnings({});
		const parseResult = legacyNewsletterSchema.safeParse(revisedData);
		const issueMap: Partial<Record<keyof LegacyNewsletter, string>> = {};
		if (existingIds.includes(revisedData.identityName as string)) {
			issueMap.identityName =
				'There is an existing newsletters with this identityName';
		}

		if (parseResult.success) {
			setNewsletter(parseResult.data);
		} else {
			parseResult.error.issues.forEach((issue) => {
				const { message, path, code } = issue;
				const key =
					typeof path[0] === 'string'
						? (path[0] as keyof LegacyNewsletter)
						: undefined;

				if (key) {
					issueMap[key] = message || code;
				}
			});

			const parseResultAllowingEmptyStrings =
				legacyNewsletterSchemaAllowingEmptyStrings.safeParse(revisedData);
			if (parseResultAllowingEmptyStrings.success) {
				setNewsletter(parseResultAllowingEmptyStrings.data);
			}
		}
		setWarnings(issueMap);
	};

	const handleSubmit = () => {
		alert('not implemented');
	};

	return (
		<article
			css={css`
				display: flex;
			`}
		>
			<div
				css={css`
					flex-basis: 40rem;
				`}
			>
				<h2>Create newsletter form</h2>
				<button
					onClick={deriveValuesFromName}
					disabled={newsletter.name === ''}
				>
					Derive values from name
				</button>

				<SchemaForm
					schema={legacyNewsletterSchema}
					data={newsletter}
					changeValue={manageChange}
					showUnsupported
					options={{
						regionFocus: ['UK', 'AUS', 'US'],
					}}
					excludedKeys={[
						'emailEmbed',
						'illustration',
						'brazeSubscribeAttributeNameAlternate',
					]}
					readOnlyKeys={['listId']}
					validationWarnings={warnings}
				/>

				<ArrayInput
					label="brazeSubscribeAttributeNameAlternate"
					validationWarning={warnings.brazeSubscribeAttributeNameAlternate}
					data={newsletter.brazeSubscribeAttributeNameAlternate ?? []}
					change={(data) => {
						manageArrayChange(data, 'brazeSubscribeAttributeNameAlternate');
					}}
				/>

				<fieldset>
					<legend>emailEmbed</legend>
					<SchemaForm
						schema={emailEmbedSchema}
						data={newsletter.emailEmbed}
						changeValue={manageEmailEmbedChange}
						showUnsupported
						validationWarnings={{}}
					/>
				</fieldset>

				{/* TO DO - controll to add the illustration field to the newsletter if undefined */}
				{newsletter.illustration && (
					<fieldset>
						<legend>emailEmbed</legend>
						<SchemaForm
							schema={illustrationSchema}
							data={newsletter.illustration}
							changeValue={manageIllustrationChange}
							showUnsupported
							validationWarnings={{}}
						/>
					</fieldset>
				)}

				<button onClick={handleSubmit} disabled={hasWarnings}>
					Create LegacyNewsletter
				</button>
			</div>
			<ContentWrapper>
				<LegacyNewsletterDetail newsletter={newsletter} />
			</ContentWrapper>
		</article>
	);
};
