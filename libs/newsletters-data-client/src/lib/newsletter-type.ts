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
	identityName: nonEmptyString(),
	name: nonEmptyString(),
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
	frequency: z.string().optional(),
	listId: z.number(),
	listIdV1: z.number(),
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
