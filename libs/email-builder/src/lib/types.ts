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

export type MessageTemplateId = 'TEST' | 'NEW_DRAFT';
