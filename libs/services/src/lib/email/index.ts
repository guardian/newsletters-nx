import type { EmailServiceAbstract } from './abstract';

export class EmailService implements EmailServiceAbstract {
	send(): { success: boolean; message?: string | undefined } {
		return {
			success: false,
			message: 'This is a test implementation that always fails',
		};
	}
}
