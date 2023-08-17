import type { FastifyInstance } from 'fastify';
import { sendEmailNotifications } from '../../services/notifications/email-service';
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
				await sendEmailNotifications(newsletterId);
				return res.status(200).send({ message: 'Email sent' });
			} catch (e) {
				console.log(Error);
				return res
					.status(500)
					.send({ message: 'Error sending email' + JSON.stringify(e) });
			}
		},
	);
}
