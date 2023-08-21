import type { FastifyInstance } from 'fastify';
import { sendEmailNotifications } from '@newsletters-nx/email-builder';
import {
	makeEmailEnvInfo,
	makeSesClient,
} from '../../services/email-client/make-client';
import { getUserProfile } from '../get-user-profile';
import { makeAccessDeniedApiResponse } from '../responses';

export function registerNotificationRoutes(app: FastifyInstance) {
	app.get<{ Params: { newsletterId: string } }>(
		'/email/:newsletterId',
		async (req, res) => {
			const user = getUserProfile(req);
			const accessDeniedError = await makeAccessDeniedApiResponse(
				user.profile,
				'editNewsletters',
			);
			if (accessDeniedError) {
				return res.status(403).send(accessDeniedError);
			}
			try {
				const { newsletterId } = req.params;
				const emailResult = await sendEmailNotifications(
					{
						messageTemplateId: 'TEST',
						newsletterId,
						testTitle: 'From the API',
					},
					makeSesClient(),
					makeEmailEnvInfo(),
				);
				if (!emailResult.success) {
					return res.status(500).send({
						message: 'Email service failed',
					});
				}
				return res.status(200).send({
					message: 'Email sent from service',
					messageId: emailResult.output.MessageId,
				});
			} catch (e) {
				console.log(e);
				return res.status(500).send({ message: 'Error sending email' });
			}
		},
	);
}
