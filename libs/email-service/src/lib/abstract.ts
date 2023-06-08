import type { Email, EmailReport } from './types';

export abstract class EmailServiceAbstract {
	abstract send(message: Email): Promise<EmailReport>;
	abstract init(): Promise<EmailReport>;
}
