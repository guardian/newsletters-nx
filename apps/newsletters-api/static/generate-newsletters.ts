import fs from 'fs';
import { faker } from '@faker-js/faker';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';

/** Capitalises the first character and lowercases the rest */
const initCap = (text: string): string =>
	text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

/** Converts slug (or kebab-case) into camelCase or PascalCase ID */
const slugConverter =
	(resultCase: 'pascal' | 'camel' | 'snake') =>
	(text: string): string =>
		resultCase === 'snake'
			? text.replace('-', '_')
			: text
					.split('-')
					.map((t, i) =>
						resultCase === 'camel' && i === 0 ? t.toLowerCase() : initCap,
					)
					.join('');

const generateNewsletter = (): Newsletter => {
	const name = `${faker.random.word()} ${faker.random.word()}`;

	const frequency = faker.helpers.arrayElement([
		'Weekly',
		'Fortnightly',
		'Monthly',
	]);
	const regionFocus = faker.helpers.arrayElement(['UK', 'AU', 'US', undefined]);

	const newsletterId = faker.helpers.slugify(name).toLowerCase();

	const idWithRegion = regionFocus
		? `${newsletterId}-${regionFocus}`
		: newsletterId;

	const newsletter: Newsletter = {
		identityName: newsletterId,
		name,
		description: faker.lorem.text(),
		frequency,
		paused: faker.datatype.boolean(),
		cancelled: faker.datatype.boolean(),
		restricted: false,
		emailConfirmation: false,
		brazeNewsletterName: `Editorial_${slugConverter('pascal')(idWithRegion)}`,
		brazeSubscribeAttributeName: `${slugConverter('pascal')(
			idWithRegion,
		)}_Subscribe_Email`,
		brazeSubscribeEventNamePrefix: slugConverter('snake')(idWithRegion),
		theme: faker.helpers.arrayElement([
			'news',
			'opinion',
			'features',
			'culture',
			'lifestyle',
			'sport',
			'work',
			'from the papers',
		]),
		group: faker.helpers.arrayElement([
			'News in depth',
			'News in brief',
			'Opinion',
			'Features',
			'Culture',
			'Lifestyle',
			'Sport',
			'Work',
			'From the papers',
		]),
		regionFocus: faker.helpers.arrayElement(['UK', 'AU', 'US', undefined]),
		listIdV1: faker.datatype.number({ max: 4000 }),
		listId: faker.datatype.number({ max: 6000 }),
		exampleUrl: `/world/series/series-${newsletterId}/latest/email`,
		signupPage: `/global/sign-up-for-the-${newsletterId}-newsletter-our-free-email`,
		emailEmbed: {
			name,
			title: `Sign up for ${name}`,
			description: faker.lorem.text(),
			successHeadline: 'Subscription confirmed',
			successDescription: `We'll send you ${name} every ${frequency.toLowerCase()}`,
			hexCode: '#DCDCDC',
		},
		campaignName: slugConverter('pascal')(idWithRegion),
		campaignCode: `${idWithRegion.replace('-', '')}_email`,
		brazeSubscribeAttributeNameAlternate: [
			`email_subscribe_${slugConverter('snake')(idWithRegion)}`,
		],
	};
	return newsletter;
};

export const generateNewsletterData = (env: 'LOCAL' | 'CODE' | 'PROD') => {
	const data = new Array(5).map(() => generateNewsletter()); // generate 5 newsletters
	const filepath = `./apps/newsletters-api/static/newsletters.${env.toLowerCase()}.json`;

	fs.writeFile(filepath, JSON.stringify(data), () =>
		console.log(`Saved file to ${filepath}`),
	);
};
