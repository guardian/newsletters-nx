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
	/** the email addresses replies shoudl be directed to */
	replyToAddresses: string[];
};

export type MessageContent = {
	subject: string;
	html: string;
	text: string;
};

export type TestMessageParams = {
	messageTemplateId: 'TEST';
	newsletterId: string;
	testTitle: string;
};
export type NewDraftMessageParams = {
	messageTemplateId: 'NEW_DRAFT';
	draft: DraftWithId;
};
export type NewsletterLaunchedMessageParams = {
	messageTemplateId: 'NEWSLETTER_LAUNCH';
	newsletter: NewsletterData;
};
export type RequestBrazeSetUpMessageParams = {
	messageTemplateId: 'BRAZE_SET_UP_REQUEST';
	newsletter: NewsletterData;
};
export type RequestTagCreationMessageParams = {
	messageTemplateId: 'TAG_CREATION_REQUEST';
	newsletter: NewsletterData;
};
export type MessageParams =
	| TestMessageParams
	| NewDraftMessageParams
	| NewsletterLaunchedMessageParams
	| RequestBrazeSetUpMessageParams
	| RequestTagCreationMessageParams;
