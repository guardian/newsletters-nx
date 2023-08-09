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

const generateRenderingOptions = () => {
	return {
		displayDate: faker.datatype.boolean(),
		displayStandfirst: faker.datatype.boolean(),
		contactEmail: `${faker.lorem.word()}@example.com`,
		displayImageCaptions: faker.datatype.boolean(),
		mainBannerUrl: faker.helpers.arrayElement([
			'https://assets.guim.co.uk/images/email/banners/3aaee2fd94b67953a15b4e7a795c09b8/generic.png',
			'https://i.guim.co.uk/img/uploads/2022/10/21/default-newsletter-main-banner.png?dpr=2&quality=100&width=600&s=618cf82b457a343bf56650ad7acaad59',
		]),
		subheadingBannerUrl: faker.helpers.arrayElement([
			undefined,
			'https://i.guim.co.uk/img/uploads/2023/06/02/moving-the-goalposts-sub-heading.png?quality=100&dpr=2&width=650&s=f3bbf75a71f4a16c22d0dd6e12b5188d',
			'https://i.guim.co.uk/img/uploads/2022/10/21/default-template-sub-banner.png?dpr=2&quality=100&width=600&s=41c1744d1559a535e7b7cc77f8c6e037',
		]),
		darkSubheadingBannerUrl: faker.helpers.arrayElement([
			undefined,
			'https://i.guim.co.uk/img/uploads/2022/10/21/default-template-sub-banner.png?dpr=2&quality=100&width=600&s=41c1744d1559a535e7b7cc77f8c6e037',
		]),
	};
};

const generateNewsletter = () => {
	const name = `${initCap(faker.random.word())} ${initCap(
		faker.random.word(),
	)}`;

	const status = faker.helpers.arrayElement([
		'paused',
		'cancelled',
		'pending',
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
		'article-based-legacy',
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

	const illustrationCard = faker.helpers.arrayElement([
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		'https://i.guim.co.uk/img/media/28ffd9cfbf7125265a79a664afacea6444c19cf1/0_0_2560_1536/500.jpg?width=250&quality=45&s=58da4319f10510a0b374324a928b766b',
		'https://i.guim.co.uk/img/media/aa8b0d33b6d0c2ff8fa26f15cd42632d8a251a66/0_151_3000_1800/500.jpg?width=250&quality=45&s=e5d8298adae28ef97fbae18cde3f548b',
		'https://i.guim.co.uk/img/media/dc41d329183de03943d483df5e68f91a0f263a4e/0_0_5000_3000/500.jpg?width=250&quality=45&s=419ffb0a03b5f5c9cef62cd80c52053e',
		'https://i.guim.co.uk/img/media/0f029b430f0ce52d3e675b66dcfd7e9b86bf2b9b/0_1_1250_750/500.jpg?width=250&quality=45&s=971ab7ce3906642fa0582864443d3b06',
		'https://i.guim.co.uk/img/media/3cf73e88fb6102bd5dae53f58916e758817070cb/62_784_5052_3032/500.jpg?width=250&quality=45&s=3c6e7b89bdeea41918e9881c821260a3',
		'https://i.guim.co.uk/img/media/4ef30ca444a6980ad09f9c651b620000ede91d68/3623_5_3289_1976/500.png?width=250&quality=45&s=698ab2c29ad2f9163683dbeeb7990f18',
		'https://i.guim.co.uk/img/media/8b426d79fd6bcd67008b93835a38c8082c03c918/1355_0_3890_2336/500.jpg?width=250&quality=45&s=c42a70edf8e37c41b35574abf1c8905a',
	]);

	const newsletter = {
		identityName: newsletterId,
		name,
		category,
		description: initCap(faker.lorem.text()),
		signUpDescription: faker.lorem.sentence(),
		frequency,
		status,
		restricted: false,
		emailConfirmation: false,
		brazeNewsletterName: `Editorial_${slugConverter(idWithRegion, 'pascal')}`,
		brazeSubscribeAttributeName: `${slugConverter(
			idWithRegion,
			'pascal',
		)}_Subscribe_Email`,
		brazeSubscribeEventNamePrefix: slugConverter(
			idWithRegion,
			'snake',
		).toLowerCase(),
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
		signUpEmbedDescription: `We'll send you ${name} ${frequency.toLowerCase()}`,
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
		illustrationCard,
		renderingOptions:
			category === 'article-based' ? generateRenderingOptions() : undefined,
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
