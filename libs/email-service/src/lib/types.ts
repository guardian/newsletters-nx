export type EmailReport = {
	success: boolean;
	message?: string;
};

export type Email = {
	recipients: string[];
	subject: string;
	body: string;
};
