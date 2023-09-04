export type EmailEnvInfo = {
	STAGE?: string | undefined;
	testRecipients: string[];
	areEmailNotificationsEnabled: boolean;
};

export type EmailRenderData = {
	html: string;
	startTime: number;
	renderTime: number;
};
