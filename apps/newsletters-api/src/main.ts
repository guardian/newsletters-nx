import ExpressApp, { json } from 'express';
import {
	areTestFixturesEnabled,
	isServingReadEndpoints,
	isServingReadWriteEndpoints,
	isServingUI,
} from './apiDeploymentSettings';
import { setCacheControlHeaderMiddleware } from './app/headers';
import { errorContext, log } from './app/logger';
import { requestLoggingMiddleware } from './app/request-logging';
import { registerCurrentStepRoute } from './app/routes/currentStep';
import { registerDraftsRoutes } from './app/routes/drafts';
import { registerHealthRoute } from './app/routes/health';
import {
	registerReadLayoutRoutes,
	registerWriteLayoutRoutes,
} from './app/routes/layouts';
import {
	registerReadNewsletterRoutes,
	registerReadWriteNewsletterRoutes,
} from './app/routes/newsletters';
import { registerNotificationRoutes } from './app/routes/notifications';
import { registerRenderingTemplatesRoutes } from './app/routes/rendering-templates';
import { registerSignupPathValidationRoute } from './app/routes/signup-path-validation';
import { registerTestFixtureRoutes } from './app/routes/test-fixtures';
import { registerUserRoute } from './app/routes/user';
import { registerUIServer } from './register-ui-server';

const app = ExpressApp();
// Deployed instances accept application traffic through a single ALB hop.
// Express trust proxy settings accept both boolean and number values with
// different meanings:
// true - Trust the entire forwarded chain; use the leftmost forwarded IP.
// false - Don’t trust forwarded headers; use the socket IP.
// 1 - Trust one proxy hop; use the address immediately beyond that proxy.
// 0 - Trust zero proxy hops—effectively the same as false
app.set('trust proxy', process.env.TRUST_ALB_PROXY === 'true' ? 1 : false);
app.use(setCacheControlHeaderMiddleware);
app.use(requestLoggingMiddleware);
app.use(json());

registerHealthRoute(app);

if (isServingReadWriteEndpoints()) {
	registerCurrentStepRoute(app);
	registerUserRoute(app);
	registerSignupPathValidationRoute(app);
	registerReadWriteNewsletterRoutes(app);
	registerNotificationRoutes(app);
	registerWriteLayoutRoutes(app);
}
if (isServingReadEndpoints()) {
	registerReadNewsletterRoutes(app);
	registerDraftsRoutes(app);
	registerRenderingTemplatesRoutes(app);
	registerReadLayoutRoutes(app);
}
if (areTestFixturesEnabled()) {
	log(
		'warn',
		'Test fixture routes are enabled. These allow newsletters to be written directly to storage and must never be served in production.',
	);
	registerTestFixtureRoutes(app);
}

const start = async () => {
	try {
		if (isServingUI()) {
			await registerUIServer(app);
		}
		const options = {
			port: 3000,

			/**
			 * 0.0.0.0 so that we listen on every network interface.
			 * This is essential for running the app within AWS.
			 *
			 * See:
			 * 	 - https://serverfault.com/questions/78048/whats-the-difference-between-ip-address-0-0-0-0-and-127-0-0-1
			 */
			host: '0.0.0.0',
		};

		log(
			'info',
			`Starting newsletters-api server on http://${options.host}:${options.port}`,
		);

		app.listen(options);

		// TO DO - start was "intentionally asynchronous" - is that essential??
		await new Promise(() => {
			//
		});
	} catch (err) {
		// Errors are logged here
		log('error', 'Failed to start newsletters-api server', errorContext(err));
		process.exit(1);
	}
};

/* eslint-disable-next-line -- intentionally asynchronous */
start();
