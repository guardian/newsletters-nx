import type { Express, Request, Response } from 'express';
import type { NewsletterMessageId } from '@newsletters-nx/email-builder';
import { sendEmailNotifications } from '@newsletters-nx/email-builder';
import { makeEmailEnvInfo } from '../../services/notifications/email-env';
import { makeSesClient } from '../../services/notifications/email-service';
import { newsletterStore } from '../../services/storage';
import { hasPermission } from '../authorisation';
import { getUserProfile } from '../get-user-profile';
import {
	makeErrorResponse,
	mapStorageFailureReasonToStatusCode,
} from '../responses';

export function registerNotificationRoutes(app: Express) {
	const cannotTriggerNotification = async (
		request: Request,
		reply: Response,
	) => {
		const user = getUserProfile(request);
		const hasLaunchAccess = await hasPermission(
			user.profile,
			'editNewsletters',
		);

		if (!hasLaunchAccess) {
			void reply
				.status(403)
				.send(
					makeErrorResponse(
						'user does not have permission to send notifications',
					),
				);
			return true
		}

		return false
	};

	app.get(
		'/email/:newsletterId',
		async (req, res) => {

			try {

				const failedValidation = await cannotTriggerNotification(req, res);
				if (failedValidation) {
					return
				}

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
					getUserProfile(req).profile,
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

	app.get(
		'/api/email/:newsletterId/:action',
		async (req, res) => {
			const { newsletterId, action } = req.params;

			const actionMapping: Record<string, NewsletterMessageId> = {
				launch: 'NEWSLETTER_LAUNCH',
				brazeUpdate: 'BRAZE_UPDATE_REQUEST',
			};

			try {

				const failedValidation = await cannotTriggerNotification(req, res);
				if (failedValidation) {
					return
				}

				if (!Object.keys(actionMapping).includes(action)) {
					return res.status(400).send(makeErrorResponse(`Not a valid action`));
				}

				const storageResponse = await newsletterStore.readByName(newsletterId);

				if (!storageResponse.ok) {
					return res
						.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
						.send(makeErrorResponse(storageResponse.message));
				}
				const notificationRequiresSeriesTag = action === 'brazeUpdate';
				if (notificationRequiresSeriesTag && !storageResponse.data.seriesTag) {
					return res
						.status(400)
						.send(makeErrorResponse(`No series tag is present`));
				}
				const emailResult = await sendEmailNotifications(
					{
						messageTemplateId: actionMapping[action] as NewsletterMessageId,
						newsletter: storageResponse.data,
					},
					makeSesClient(),
					makeEmailEnvInfo(),
					getUserProfile(req).profile,
				);
				if (!emailResult.success) {
					return res
						.status(500)
						.send(makeErrorResponse('Email service failed'));
				}
				if (!emailResult.output) {
					return res.status(200).send({
						ok: false,
						message: 'Email service is not enabled',
					});
				}
				return res.status(200).send({
					ok: true,
					message: 'Email sent from service',
					messageId: emailResult.output.MessageId,
				});
			} catch (e) {
				console.log(e);
				return res.status(500).send(makeErrorResponse('Error sending email'));
			}
		},
	);
}
