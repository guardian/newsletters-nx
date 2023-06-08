import {
	LocalFileEmailService,
	NoopEmailService,
} from '@newsletters-nx/email-service';
import { getEmailServiceType } from '../../apiDeploymentSettings';

const serviceType = getEmailServiceType();

const emailService =
	serviceType === 'local-file'
		? new LocalFileEmailService()
		: new NoopEmailService();

emailService
	.init()
	.then((report) => {
		console.log(report);
	})
	.catch((err) => {
		console.error(err);
	});

export { emailService };
