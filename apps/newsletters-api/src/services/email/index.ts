import { LocalFileEmailService } from '@newsletters-nx/email-service';

const emailService = new LocalFileEmailService();
emailService
	.init()
	.then((report) => {
		console.log(report);
	})
	.catch((err) => {
		console.error(err);
	});

export { emailService };
