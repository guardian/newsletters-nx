import { z } from 'zod';
import { nonEmptyString } from '../zod-helpers/schema-helpers';
import { emailEmbedSchema } from './emailEmbedSchema';
import { themeEnumSchema } from './themeEnumSchema';

export const illustrationSchema = z.object({
	circle: z.string(),
});

export const themeLegacyEnumSchema = z.enum([
	...themeEnumSchema.options,
	'cancelled',
	'work',
	'from the papers',
]);

const baseLegacyNewsletterSchema = z.object({
	identityName: nonEmptyString().describe('the unique id for the newsletter'),
	name: nonEmptyString().describe('the public name of the newsletter'),
	cancelled: z
		.boolean()
		.describe(
			'if true, the newsletter has been permanently discontinued, but must be retained on the list for data analysis and historical reports',
		),
	restricted: z
		.boolean()
		.describe(
			"The exact semantic meaning is not defined - believed to indicate the newsletter required payment or otherwise cannot be freely subscribed to by all users. Restricted newsletters don't appear on the all newsletters page and in-article promotions for them will not be rendered.",
		),
	paused: z
		.boolean()
		.describe(
			"Indicates the newsletter is not being sent currently, but may be (re)started in future. Paused newsletters don't appear on the all newsletters page and in-article promotions for them will not be rendered.",
		),
	emailConfirmation: z
		.boolean()
		.describe(
			'whether a confirmation email is sent to verify the subscription after a user submits a sign-up form',
		),
	brazeNewsletterName: z.string().optional(),
	brazeSubscribeAttributeName: z.string().optional(),
	brazeSubscribeEventNamePrefix: z.string().optional(),
	theme: themeLegacyEnumSchema,
	group: nonEmptyString().describe(
		'the name of the section of the newsletters page the newsletter will be listed under',
	),
	description: z
		.string()
		.optional()
		.describe('a short description of the newsletter to display to users'),
	regionFocus: z
		.string()
		.optional()
		.describe('Which region (AU, UK, US) the newsletter is targetted at'),
	frequency: z
		.string()
		.optional()
		.describe('how often the newsletter is sent.'),
	listId: z.number().describe('a unique reference number for the newsletter'),
	listIdV1: z
		.number()
		.describe(
			'a legacy reference number - no longer needed, but retained on older newsletters for reference.',
		),
	emailEmbed: emailEmbedSchema.optional(),
	campaignName: z.string().optional(),
	campaignCode: z.string().optional(),
	brazeSubscribeAttributeNameAlternate: z.array(z.string()).optional(),
	signupPage: z
		.string()
		.optional()
		.describe('the relative link to the sign-up page on theguardian.com'),
	exampleUrl: z
		.string()
		.optional()
		.describe(
			'a relative link to a page on theguardian.com rendering an example chapter of the newsletter',
		),
	illustration: illustrationSchema.optional(),
});

type Base = z.infer<typeof baseLegacyNewsletterSchema>;
export const getPropertyDescription = (key: keyof Base): string =>
	baseLegacyNewsletterSchema.shape[key].description ?? '';

export const legacyNewsletterSchema = baseLegacyNewsletterSchema.extend({
	description: nonEmptyString().describe(getPropertyDescription('description')),
	frequency: nonEmptyString().describe(getPropertyDescription('frequency')),
	brazeSubscribeAttributeName: nonEmptyString().describe(
		getPropertyDescription('brazeSubscribeAttributeName'),
	),
	brazeSubscribeEventNamePrefix: nonEmptyString().describe(
		getPropertyDescription('brazeSubscribeEventNamePrefix'),
	),
	brazeNewsletterName: nonEmptyString().describe(
		getPropertyDescription('brazeNewsletterName'),
	),
	emailEmbed: emailEmbedSchema.extend({
		description: z.string(),
	}),
});

export type LegacyNewsletter = z.infer<typeof legacyNewsletterSchema>;

export function isLegacyNewsletter(
	subject: unknown,
): subject is LegacyNewsletter {
	return (
		legacyNewsletterSchema.safeParse(subject).success ||
		cancelledLegacyNewsletterSchema.safeParse(subject).success
	);
}

export const cancelledLegacyNewsletterSchema =
	baseLegacyNewsletterSchema.extend({
		cancelled: z.literal(true),
	});

export type LegacyCancelledNewsletter = z.infer<
	typeof cancelledLegacyNewsletterSchema
>;

export function isLegacyCancelledNewsletter(
	subject: unknown,
): subject is LegacyCancelledNewsletter {
	return cancelledLegacyNewsletterSchema.safeParse(subject).success;
}

export function isPropertyOptionalOnLegacy(
	property: keyof LegacyNewsletter,
): boolean {
	return legacyNewsletterSchema.shape[property].isOptional();
}
