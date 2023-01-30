import { css } from '@emotion/react';
import { neutral, space } from '@guardian/source-foundations';
import { Button } from '@guardian/source-react-components';
import { useState } from 'react';
import {
	deriveNewsletterFieldsFromName,
	emailEmbedSchema,
	illustrationSchema,
	newsletterSchema,
	newsletterSchemaAllowingEmptyStrings,
} from '@newsletters-nx/newsletters-data-client';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
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
		description:
			"",
		successHeadline: 'Subscription confirmed',
		successDescription: "",
		hexCode: '#DCDCDC',
	},
	campaignName: '',
	campaignCode: '',
	brazeSubscribeAttributeNameAlternate: [],
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

	return (
		<div>
			<h2>Create newsletter form</h2>

			<Button priority='tertiary' onClick={deriveValuesFromName} disabled={newsletter.name === ''}>
				Derive values from name
			</Button>

			<SchemaForm
				schema={newsletterSchema}
				data={newsletter}
				changeValue={manageChange}
				showUnsupported
				options={{
					regionFocus: ['UK', 'AUS', 'US'],
				}}
				excludedKeys={['emailEmbed', 'illustration']}
				validationWarnings={warnings}
			/>

			<h3>emailEmbed</h3>
			<div
				css={css`
					padding-left: ${space[6]}px;
					border-left: 1px dashed ${neutral[20]};
				`}
			>
				<SchemaForm
					schema={emailEmbedSchema}
					data={newsletter.emailEmbed}
					changeValue={manageEmailEmbedChange}
					showUnsupported
					validationWarnings={{}}
				/>
			</div>

			{/* TO DO - controll to add the illustration field to the newsletter if undefined */}
			{newsletter.illustration && (
				<>
					<h3>illustration</h3>
					<div
						css={css`
							padding-left: ${space[6]}px;
							border-left: 1px dashed ${neutral[20]};
						`}
					>
						<SchemaForm
							schema={illustrationSchema}
							data={newsletter.illustration}
							changeValue={manageIllustrationChange}
							showUnsupported
							validationWarnings={{}}
						/>
					</div>
				</>
			)}

			<NewsletterDetail newsletter={newsletter} />
		</div>
	);
};
