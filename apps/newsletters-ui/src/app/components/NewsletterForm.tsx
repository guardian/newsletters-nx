import { useState } from 'react';
import { newsletterSchema } from '@newsletters-nx/newsletters-data-client';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { NewsletterDetail } from './NewsletterDetails';
import type { FieldDef, FieldValue } from './SchemaForm';
import { getModification, SchemaForm } from './SchemaForm';

interface Props {
	existingIds: string[];
}

const VALID_TECHSCAPE: Newsletter = {
	identityName: 'tech-scape',
	name: 'TechScape',
	cancelled: false,
	restricted: false,
	paused: false,
	emailConfirmation: false,
	brazeNewsletterName: 'Editorial_TechScape',
	brazeSubscribeAttributeName: 'TechScape_Subscribe_Email',
	brazeSubscribeEventNamePrefix: 'tech_scape',
	theme: 'news',
	group: 'News in depth',
	description:
		"Alex Hern's weekly dive in to how technology is shaping our lives",
	frequency: 'Weekly',
	listIdV1: -1,
	listId: 6013,
	signupPage:
		'/info/2022/sep/20/sign-up-for-the-techscape-newsletter-our-free-technology-email',
	emailEmbed: {
		name: 'TechScape',
		title: 'Sign up for TechScape',
		description:
			"Alex Hern's weekly dive in to how technology is shaping our lives",
		successHeadline: 'Subscription confirmed',
		successDescription: "We'll send you TechScape every week",
		hexCode: '#DCDCDC',
	},
	campaignName: 'TechScape',
	campaignCode: 'techscape_email',
	brazeSubscribeAttributeNameAlternate: [
		'email_subscribe_tech_scape',
		'TechTonic_Subscribe_Email',
		'email_subscribe_tech_tonic',
	],
};

export const NewsletterForm = ({ existingIds }: Props) => {
	const [newsletter, setNewsletter] = useState<Newsletter>({
		...VALID_TECHSCAPE,
	});

	const manageChange = (value: FieldValue, key: FieldDef) => {
		const mod = getModification(value, key);

		const revisedData = {
			...newsletter,
			...mod,
		};

		const parseResult = newsletterSchema.safeParse(revisedData);

		if (parseResult.success) {
			setNewsletter(parseResult.data);
		} else {
			console.log('BAD', mod, parseResult.error);
		}
	};

	return (
		<div>
			<h2>Create newsletter form</h2>
			<p>EXISTING IDS: {existingIds.length}</p>

			<SchemaForm
				schema={newsletterSchema}
				data={newsletter}
				changeValue={manageChange}
				showUnsupported
				options={{ regionFocus: ['UK', 'AUS', 'US'] }}
			/>

			<NewsletterDetail newsletter={newsletter} />
		</div>
	);
};
