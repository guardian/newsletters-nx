import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { EmailServiceAbstract } from './abstract';
import type { Email } from './types';

const emailsFolder = join(__dirname, 'emails');

export class LocalFileEmailService implements EmailServiceAbstract {
	async init() {
		if (!existsSync(emailsFolder)) {
			mkdirSync(emailsFolder);
		}

		return Promise.resolve({
			success: true,
			message: `LocalFileEmailService Initialised`,
		});
	}

	async send(message: Email) {
		const { subject, recipients, body } = message;
		const timeStamp = Date.now();
		const fileName = `${timeStamp}-${subject}.json`;
		const content = { recipients, subject, body, timeStamp };
		const location = join(emailsFolder, fileName);

		writeFileSync(location, JSON.stringify(content), {});

		return Promise.resolve({
			success: true,
			message: `written to: ${location}`,
		});
	}
}
