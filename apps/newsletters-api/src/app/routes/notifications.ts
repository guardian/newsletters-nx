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
				const output = await sendEmailNotifications(
					'TEST',
					newsletterId,
					makeSesClient(),
					makeEmailEnvInfo(),
				);
				return res.status(200).send({
					message: 'Email sent from service',
					messageId: output.MessageId,
				});
			} catch (e) {
				console.log(Error);
				return res
					.status(500)
					.send({ message: 'Error sending email' + JSON.stringify(e) });
			}
		},
	);
}
