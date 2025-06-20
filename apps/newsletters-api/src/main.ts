import ExpressApp from 'express';
import {
	isServingReadEndpoints,
	isServingReadWriteEndpoints,
	isServingUI,
} from './apiDeploymentSettings';
import { setCacheControlHeaderMiddleware } from './app/headers';
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

const expressApp = ExpressApp();

expressApp.use(setCacheControlHeaderMiddleware)


registerHealthRoute(expressApp);
if (isServingUI()) {
	// When running locally UI dev-server runs on :4200, even without this function.
	// but the UI should also be served on :3000, like it is on PROD
	// if registerUIServer is working locally, a ui route on :3000 (eg http://localhost:3000/launched) 
	// should serve the index.html and static assets from: dist/apps/newsletters-ui (if built with nx:build)
	registerUIServer(expressApp);
}
if (isServingReadWriteEndpoints()) {
	registerCurrentStepRoute(expressApp);
	registerUserRoute(expressApp);
	registerReadWriteNewsletterRoutes(expressApp);
	registerNotificationRoutes(expressApp);
	registerWriteLayoutRoutes(expressApp);
}
if (isServingReadEndpoints()) {
	registerReadNewsletterRoutes(expressApp);
	registerDraftsRoutes(expressApp);
	registerRenderingTemplatesRoutes(expressApp);
	registerReadLayoutRoutes(expressApp);
}


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

		await expressApp.listen(options);
	} catch (err) {
		// Errors are logged here
		console.error(err);
		process.exit(1);
	}
};

/* eslint-disable-next-line -- intentionally asynchronous */
start();
