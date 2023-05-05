type EmailReport = {
	success: boolean;
	message?: string;
};

export abstract class EmailServiceAbstract {
	abstract send(
		recipients: string[],
		subject: string,
		body: string,
	): Promise<EmailReport>;

	abstract init(): Promise<EmailReport>;
}
