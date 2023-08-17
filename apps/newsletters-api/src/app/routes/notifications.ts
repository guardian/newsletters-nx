import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import type { FastifyInstance } from 'fastify';
// import { permissionService } from '../../services/permissions';
import { getStandardAwsConfig } from '../../services/storage/s3-client-factory';
import { getUserProfile } from '../get-user-profile';
import { makeAccessDeniedApiResponse } from '../responses';

export function registerNotificationRoutes(app: FastifyInstance) {
	app.get('/email', async (req, res) => {
		const user = getUserProfile(req);
		const accessDeniedError = await makeAccessDeniedApiResponse(
			user.profile,
			'editNewsletters',
		);
		if (accessDeniedError) {
			return res.status(403).send(accessDeniedError);
		}
		const emailer = new SESClient(getStandardAwsConfig());
		// now send an email
		const { STAGE } = process.env;
		try {
			await emailer.send(
				new SendEmailCommand({
					Source:
						STAGE !== 'PROD'
							? 'newsletters <notifications@newsletters-tool.code.dev-gutools.co.uk>'
							: 'newsletters CODE <notifications@newsletters-tool.gutools.co.uk>',
					Destination: {
						ToAddresses: ['phillip.barron@guardian.co.uk'],
					},
					ReplyToAddresses: ['phillip.barron@guardian.co.uk'],
					Message: {
						Subject: {
							Data: 'Some Test Email',
						},
						Body: {
							Text: { Data: 'Some Test Email' },
							Html: { Data: '<h1>Some Test Email</h1>' },
						},
					},
				}),
			);
			return res.status(200).send({ message: 'Email sent' });
		} catch (e) {
			console.error(e);
			return res.status(500).send({ error: JSON.stringify(e, null, 2) });
		}
	});
}
