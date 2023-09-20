export type EmailEnvInfo = {
	STAGE?: string | undefined;
	testRecipients: string[];
	areEmailNotificationsEnabled: boolean;
};

export type EmailRenderingWarning = {
	message: string;
};

export type EmailRenderingOutput = {
	html: string;
	warnings?: EmailRenderingWarning[];
};
