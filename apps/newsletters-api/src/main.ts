import Fastify from 'fastify';
import Express, { Express as ExpressInterface } from 'express';
import {
	isServingReadEndpoints,
	isServingReadWriteEndpoints,
	isServingUI,
} from './apiDeploymentSettings';
import { setHeaderHook } from './app/headers';
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
import { registerUserRoute } from './app/routes/user';
import { registerUIServer } from './register-ui-server';

const fastifyApp = Fastify();
registerHealthRoute(fastifyApp as unknown as ExpressInterface);
if (isServingUI()) {
	registerUIServer(fastifyApp);
}
if (isServingReadWriteEndpoints()) {
	registerCurrentStepRoute(fastifyApp);
	registerUserRoute(fastifyApp);
	registerReadWriteNewsletterRoutes(fastifyApp);
	registerNotificationRoutes(fastifyApp);
	registerWriteLayoutRoutes(fastifyApp);
}
if (isServingReadEndpoints()) {
	registerReadNewsletterRoutes(fastifyApp);
	registerDraftsRoutes(fastifyApp);
	registerRenderingTemplatesRoutes(fastifyApp);
	registerReadLayoutRoutes(fastifyApp);
}

fastifyApp.addHook('onSend', setHeaderHook);

const expressApp = Express();
registerHealthRoute(expressApp);

const USE_EXPRESS = false as boolean;

const start = async () => {
	try {
		const options = {
			port: 3000,

			/**
			 * 0.0.0.0 so that we listen on every network interface.
			 * This is essential for running the app within AWS.
			 *
			 * See:
			 *   - https://www.fastify.io/docs/latest/Reference/Server/#listen
			 * 	 - https://serverfault.com/questions/78048/whats-the-difference-between-ip-address-0-0-0-0-and-127-0-0-1
			 */
			host: '0.0.0.0',
		};

		console.log(
			`Starting newsletters-api server on http://${options.host}:${options.port}`,
		);

		if (USE_EXPRESS) {
			await expressApp.listen(options);
		} else {
			await fastifyApp.listen(options);
		}
	} catch (err) {
		// Errors are logged here
		console.error(err);
		process.exit(1);
	}
};

/* eslint-disable-next-line -- intentionally asynchronous */
start();
