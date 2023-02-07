import { z } from 'zod';

const nonEmptyString = () =>
	z.string().min(1, { message: 'Must not be empty' });

const illustrationSchema = z.object({
	circle: z.string(),
});

const emailEmbedSchema = z.object({
	name: z.string(),
	title: z.string(),
	description: z.string().optional(),
	successHeadline: z.string(),
	successDescription: z.string(),
	hexCode: z.string(),
	imageUrl: z.string().optional(),
});

const baseNewsletterSchema = z.object({
	identityName: nonEmptyString().describe('The unique id for the newsletter'),
	name: nonEmptyString().describe('The public name of the newsletter'),
	cancelled: z.boolean(),
	restricted: z.boolean(),
	paused: z.boolean(),
	emailConfirmation: z.boolean(),
	brazeNewsletterName: z.string().optional(),
	brazeSubscribeAttributeName: z.string().optional(),
	brazeSubscribeEventNamePrefix: z.string().optional(),
	theme: nonEmptyString(),
	group: nonEmptyString(),
	description: z.string().optional(),
	regionFocus: z.string().optional(),
	frequency: z
		.string()
		.optional()
		.describe('How often the newsletter is sent. Value is displayed to users.'),
	listId: z.number().describe('a unique reference number for the newsletter'),
	listIdV1: z.number(),
	emailEmbed: emailEmbedSchema.optional(),
	campaignName: z.string().optional(),
	campaignCode: z.string().optional(),
	brazeSubscribeAttributeNameAlternate: z.array(z.string()).optional(),
	signupPage: z.string().optional(),
	exampleUrl: z.string().optional(),
	illustration: illustrationSchema.optional(),
});

type Base = z.infer<typeof baseNewsletterSchema>;
const getBaseDescription = (key: keyof Base): string =>
	baseNewsletterSchema.shape[key].description ?? '';

export const newsletterSchema = baseNewsletterSchema.extend({
	description: nonEmptyString().describe(getBaseDescription('description')),
	frequency: nonEmptyString().describe(getBaseDescription('frequency')),
	brazeSubscribeAttributeName: nonEmptyString().describe(
		getBaseDescription('brazeSubscribeAttributeName'),
	),
	brazeSubscribeEventNamePrefix: nonEmptyString().describe(
		getBaseDescription('brazeSubscribeEventNamePrefix'),
	),
	brazeNewsletterName: nonEmptyString().describe(
		getBaseDescription('brazeNewsletterName'),
	),
	emailEmbed: emailEmbedSchema.extend({
		description: z.string(),
	}),
});

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
