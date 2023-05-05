type EmailReport = {
	success: boolean;
	message?: string;
};

export abstract class EmailServiceAbstract {
	abstract send(): EmailReport;
}
