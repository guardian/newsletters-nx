import { z } from 'zod';

const nonEmptyString = () =>
	z.string().min(1, { message: 'Must not be empty' });

export const illustrationSchema = z.object({
	circle: z.string(),
});

export const emailEmbedSchema = z.object({
	name: z.string(),
	title: z.string(),
	description: z.string().optional(),
	successHeadline: z.string(),
	successDescription: z.string(),
	hexCode: z.string(),
	imageUrl: z.string().optional(),
});

const themeEnumSchema = z.enum([
	'news',
	'opinion',
	'culture',
	'sport',
	'lifestyle',
	'features',
	'cancelled',
	'work',
	'from the papers',
]);
export type Theme = z.infer<typeof themeEnumSchema>;

export const baseNewsletterSchema = z.object({
	name: nonEmptyString(),
	identityName: nonEmptyString(),
	listId: z.number(),
	listIdV1: z.number(),
	theme: themeEnumSchema,
	group: nonEmptyString(),
	frequency: z.string().optional(),
	regionFocus: z.string().optional(),
	cancelled: z.boolean(),
	restricted: z.boolean(),
	paused: z.boolean(),
	emailConfirmation: z.boolean(),
	description: z.string().optional(),
	brazeNewsletterName: z.string().optional(),
	brazeSubscribeAttributeName: z.string().optional(),
	brazeSubscribeEventNamePrefix: z.string().optional(),
	emailEmbed: emailEmbedSchema.optional(),
	campaignName: z.string().optional(),
	campaignCode: z.string().optional(),
	brazeSubscribeAttributeNameAlternate: z.array(z.string()).optional(),
	signupPage: z.string().optional(),
	exampleUrl: z.string().optional(),
	illustration: illustrationSchema.optional(),
});

export const newsletterSchema = baseNewsletterSchema.extend({
	description: nonEmptyString(),
	frequency: nonEmptyString(),
	brazeSubscribeAttributeName: nonEmptyString(),
	brazeSubscribeEventNamePrefix: nonEmptyString(),
	brazeNewsletterName: nonEmptyString(),
	emailEmbed: emailEmbedSchema.extend({
		description: z.string(),
	}),
});

export const newsletterSchemaAllowingEmptyStrings = baseNewsletterSchema.extend(
	{
		name: z.string(),
		identityName: z.string(),
		group: z.string(),
		description: z.string(),
		frequency: z.string(),
		brazeSubscribeAttributeName: z.string(),
		brazeSubscribeEventNamePrefix: z.string(),
		brazeNewsletterName: z.string(),
		emailEmbed: emailEmbedSchema.extend({
			description: z.string(),
		}),
	},
);

export type Newsletter = z.infer<typeof newsletterSchema>;

export function isNewsletter(subject: unknown): subject is Newsletter {
	return (
		newsletterSchema.safeParse(subject).success ||
		cancelledNewsletterSchema.safeParse(subject).success
	);
}

export const cancelledNewsletterSchema = baseNewsletterSchema.extend({
	cancelled: z.literal(true),
});

export type CancelledNewsletter = z.infer<typeof cancelledNewsletterSchema>;

export function isCancelledNewsletter(
	subject: unknown,
): subject is CancelledNewsletter {
	return cancelledNewsletterSchema.safeParse(subject).success;
}
