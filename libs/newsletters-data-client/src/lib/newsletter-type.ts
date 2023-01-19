import { z } from 'zod';

export const illustrationSchema = z.object({
  circle: z.string(),
});

export const emailEmbedSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  successHeadline: z.string(),
  successDescription: z.string(),
  hexCode: z.string(),
  imageUrl: z.string().optional(),
});

export const newsletterSchema = z.object({
  identityName: z.string().min(1),
  name: z.string().min(1),
  cancelled: z.boolean(),
  restricted: z.boolean(),
  paused: z.boolean(),
  emailConfirmation: z.boolean(),
  brazeNewsletterName: z.string().optional(),
  brazeSubscribeAttributeName: z.string().optional(),
  brazeSubscribeEventNamePrefix: z.string().optional(),
  theme: z.string().min(1),
  group: z.string().min(1),
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

export type Newsletter = z.infer<typeof newsletterSchema>;

export function isNewsletter(subject: unknown): subject is Newsletter {
  return newsletterSchema.safeParse(subject).success;
}
