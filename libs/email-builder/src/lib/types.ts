import type {
	DraftWithId,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';

export type MessageConfig = {
	/** the emails addresses to send the message to */
	recipients: string[];
	/** the URL for the version of the tool to point recipients to */
	toolHost: string;
	/** the sender name  and email address to use in the message header*/
	source: string;
	/** the email addresses replies should be directed to */
	replyToAddresses: string[];
};

export type MessageContent = {
	subject: string;
	html: string;
	text: string;
};

export type NewDraftMessageParams = {
	messageTemplateId: 'NEW_DRAFT';
	draft: DraftWithId;
};

/**  The message Ids for MessageParams that take a newsletter
 * as the only other property
 */
export type NewsletterMessageId =
	| 'NEWSLETTER_LAUNCH'
	| 'SIGN_UP_PAGE_CREATION_REQUEST'
	| 'TAG_CREATION_REQUEST'
	| 'BRAZE_SET_UP_REQUEST';

export type MessageAboutNewsletterParams = {
	messageTemplateId: NewsletterMessageId;
	newsletter: NewsletterData;
};
export type MessageParams =
	| NewDraftMessageParams
	| MessageAboutNewsletterParams;

export type EmailRecipientConfiguration = {
	tagRecipients: string[];
	brazeRecipients: string[];
	signUpPageRecipients: string[];
	launchRecipients: string[];
};
