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
			"🤷 not being used. We think the idea was to use this for newsletters that you have to pay for or can't sign up for freely.",
		),
	paused: z
		.boolean()
		.describe(
			"🤔 we don't know what this should mean, but paused newsletters don't appear on the all newsletters page.",
		),
	emailConfirmation: z
		.boolean()
		.describe(
			'whether a confirmation email is sent to verify the subscription after a user submits a sign-up form',
		),
	brazeNewsletterName: z.string().optional(),
	brazeSubscribeAttributeName: z.string().optional(),
	brazeSubscribeEventNamePrefix: z.string().optional(),
	theme: nonEmptyString(),
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

type Base = z.infer<typeof baseNewsletterSchema>;
export const getPropertyDescription = (key: keyof Base): string =>
	baseNewsletterSchema.shape[key].description ?? '';

export const newsletterSchema = baseNewsletterSchema.extend({
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

export function isPropertyOptional(property: keyof Newsletter): boolean {
	return newsletterSchema.shape[property].isOptional();
}
