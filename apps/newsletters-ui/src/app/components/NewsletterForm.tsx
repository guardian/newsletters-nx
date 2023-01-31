import { useState } from 'react';
import {
	deriveNewsletterFieldsFromName,
	emailEmbedSchema,
	illustrationSchema,
	newsletterSchema,
	newsletterSchemaAllowingEmptyStrings,
} from '@newsletters-nx/newsletters-data-client';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { ArrayInput } from './ArrayInput';
import { NewsletterDetail } from './NewsletterDetails';
import type { FieldDef, FieldValue } from './SchemaForm';
import { getModification, SchemaForm } from './SchemaForm';

interface Props {
	existingIds: string[];
}

const BLANK_FORM: Newsletter = {
	identityName: '',
	name: '',
	cancelled: false,
	restricted: false,
	paused: false,
	emailConfirmation: false,
	brazeNewsletterName: '',
	brazeSubscribeAttributeName: '',
	brazeSubscribeEventNamePrefix: '',
	theme: 'news',
	group: 'News in depth',
	description: '',
	frequency: 'Weekly',
	listIdV1: -1,
	listId: 6013,
	signupPage: '',
	emailEmbed: {
		name: '',
		title: '',
		description: '',
		successHeadline: 'Subscription confirmed',
		successDescription: '',
		hexCode: '#DCDCDC',
	},
	campaignName: '',
	campaignCode: '',
	brazeSubscribeAttributeNameAlternate: ['TEST VALUE 1', 'OTHER TEST VALUE'],
	illustration: {
		circle: '',
	},
};

export const NewsletterForm = ({ existingIds }: Props) => {
	const [newsletter, setNewsletter] = useState<Newsletter>({
		...BLANK_FORM,
	});

	const [warnings, setWarnings] = useState<
		Partial<Record<keyof Newsletter, string>>
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

	const manageArrayChange = (data: string[], field: keyof Newsletter) => {
		const revisedData: Partial<Record<keyof Newsletter, unknown>> = {
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

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- zod?
		const revisedData = {
			...newsletter,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- zod?
			...deriveNewsletterFieldsFromName(name),
		};
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- zod?
		updateDataAndWarnings(revisedData);
	};

	const updateDataAndWarnings = (
		revisedData: Partial<Record<keyof Newsletter, unknown>>,
	) => {
		setWarnings({});
		const parseResult = newsletterSchema.safeParse(revisedData);
		const issueMap: Partial<Record<keyof Newsletter, string>> = {};
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
						? (path[0] as keyof Newsletter)
						: undefined;

				if (key) {
					issueMap[key] = message || code;
				}
			});

			const parseResultAllowingEmptyStrings =
				newsletterSchemaAllowingEmptyStrings.safeParse(revisedData);
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
		<div>
			<h2>Create newsletter form</h2>
			<button onClick={deriveValuesFromName} disabled={newsletter.name === ''}>
				Derive values from name
			</button>

			<SchemaForm
				schema={newsletterSchema}
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
				Create Newsletter
			</button>

			<NewsletterDetail newsletter={newsletter} />
		</div>
	);
};
