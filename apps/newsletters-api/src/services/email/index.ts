import { LocalFileEmailService } from '@newsletters-nx/services';

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
