import { faker } from 'https://cdn.skypack.dev/@faker-js/faker@v7.6.0';

const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365;

/** Capitalises the first character and lowercases the rest */
const initCap = (text) =>
	text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

/** Converts slug (or kebab-case) into camelCase or PascalCase ID */
const slugConverter = (text, resultCase) => {
	if (!['snake', 'pascal', 'camel', 'kebab'].includes(resultCase)) {
		return text;
	} else {
		return resultCase === 'snake'
			? text.replaceAll('-', '_')
			: text
					.split('-')
					.map((t, i) =>
						resultCase === 'camel' && i === 0 ? t.toLowerCase() : initCap(t),
					)
					.join('');
	}
};

const generateNewsletter = () => {
	const name = `${initCap(faker.random.word())} ${initCap(
		faker.random.word(),
	)}`;

	const status = faker.helpers.arrayElement([
		'paused',
		'cancelled',
		'live',
		'live',
	]);

	const frequency = faker.helpers.arrayElement([
		'Weekly',
		'Fortnightly',
		'Monthly',
	]);
	const regionFocus = faker.helpers.arrayElement(['UK', 'AU', 'US', undefined]);

	const category = faker.helpers.arrayElement([
		'article-based',
		'fronts-based',
		'manual-send',
		'other',
	]);

	const newsletterId = faker.helpers.slugify(name).toLowerCase();

	const idWithRegion = regionFocus
		? `${newsletterId}-${regionFocus}`
		: newsletterId;

	const timeStampForOneToTwoYearsAgo =
		Date.now() - YEAR_IN_MS - Math.floor(Math.random() * YEAR_IN_MS);
	const timeStampForZeroToOneYearsAgo =
		Date.now() - Math.floor(Math.random() * YEAR_IN_MS);

	const newsletter = {
		identityName: newsletterId,
		name,
		category,
		description: initCap(faker.lorem.text()),
		frequency,
		status,
		restricted: false,
		emailConfirmation: false,
		brazeNewsletterName: `Editorial_${slugConverter(idWithRegion, 'pascal')}`,
		brazeSubscribeAttributeName: `${slugConverter(
			idWithRegion,
			'pascal',
		)}_Subscribe_Email`,
		brazeSubscribeEventNamePrefix: slugConverter(idWithRegion, 'snake'),
		theme: faker.helpers.arrayElement([
			'news',
			'opinion',
			'features',
			'culture',
			'lifestyle',
			'sport',
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
			description: initCap(faker.lorem.text()),
			successHeadline: 'Subscription confirmed',
			successDescription: `We'll send you ${name} ${frequency.toLowerCase()}`,
			hexCode: '#DCDCDC',
		},
		campaignName: slugConverter(idWithRegion, 'pascal'),
		campaignCode: `${idWithRegion.replaceAll('-', '')}_email`,
		brazeSubscribeAttributeNameAlternate: [
			`email_subscribe_${slugConverter(idWithRegion, 'snake')}`,
		],
		creationTimeStamp: timeStampForOneToTwoYearsAgo,
		cancellationTimeStamp:
			status === 'cancelled' ? timeStampForZeroToOneYearsAgo : undefined,

		figmaIncludesThrashers: false,
		launchDate: new Date(87678876),
		signUpPageDate: new Date(87678876),
		thrasherDate: new Date(87678876),
		privateUntilLaunch: false,
		onlineArticle: 'Web for all sends',
	};
	return newsletter;
};

const numNewsletters = prompt(
	'How many newsletters do you want to generate?',
	5,
);
const data = new Array(parseInt(numNewsletters)).fill().map(generateNewsletter);
const filename = prompt(
	'What should the filename be called?',
	'newsletters.local.json',
);
const filepath = `./apps/newsletters-api/static/${filename}`;
Deno.writeTextFile(filepath, JSON.stringify(data));

console.log(`Written ${numNewsletters} newsletters to ${filepath}`);
