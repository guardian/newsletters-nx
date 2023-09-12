import type { FastifyInstance } from 'fastify';
import { sendEmailNotifications } from '@newsletters-nx/email-builder';
import { makeEmailEnvInfo } from '../../services/notifications/email-env';
import { makeSesClient } from '../../services/notifications/email-service';
import { newsletterStore } from '../../services/storage';
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

				const newsletterResponse = await newsletterStore.readByName(
					newsletterId,
				);

				if (!newsletterResponse.ok) {
					return res.status(404).send(newsletterResponse);
				}

				const emailResult = await sendEmailNotifications(
					{
						messageTemplateId: 'NEWSLETTER_LAUNCH',
						newsletter: newsletterResponse.data,
					},
					makeSesClient(),
					makeEmailEnvInfo(),
				);
				if (!emailResult.success) {
					return res.status(500).send({
						message: 'Email service failed',
					});
				}

				if (!emailResult.output) {
					return res.status(200).send({
						message: 'Email service is not enabled',
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
