import type { SSM } from 'aws-sdk';

export type EmailEnvInfo = {
	STAGE?: string | undefined;
	testRecipients: string[];
	areEmailNotificationsEnabled: boolean;
	ssmClient: SSM;
};

export type EmailRenderingWarning = {
	message: string;
};

export type EmailRenderingOutput = {
	html: string;
	warnings?: EmailRenderingWarning[];
};
