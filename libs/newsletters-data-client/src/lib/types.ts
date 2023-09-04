export type EmailEnvInfo = {
	STAGE?: string | undefined;
	testRecipients: string[];
	areEmailNotificationsEnabled: boolean;
};

export type DemoRenderWarning = {
	message: string;
};

export type DemoRenderData = {
	html: string;
	warnings?: DemoRenderWarning[];
};
