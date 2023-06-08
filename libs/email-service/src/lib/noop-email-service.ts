import type { EmailServiceAbstract } from './abstract-email-service';
import type { Email } from './types';

export class NoopEmailService implements EmailServiceAbstract {
	async init() {
		return Promise.resolve({
			success: true,
			message: `NoopEmailService Initialised`,
		});
	}

	async send(message: Email) {
		return Promise.resolve({
			success: true,
			message: `No operation taken for email ${message.subject}.`,
		});
	}
}
