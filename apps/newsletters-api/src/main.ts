import Fastify from 'fastify';
import { registerCurrentStepRoute } from './app/routes/currentStep';
import { registerHealthRoute } from './app/routes/health';
import { registerNewsletterRoutes } from './app/routes/newsletters';

const app = Fastify();

registerHealthRoute(app);
registerNewsletterRoutes(app);
registerCurrentStepRoute(app);

const start = async () => {
	try {
		console.log('Starting newsletters-api server on http://localhost:3000');
		await app.listen({ port: 3000 });
	} catch (err) {
		// Errors are logged here
		console.error(err);
		process.exit(1);
	}
};

// This is just to please eslint for now. We should think about a more concrete solution!
start()
	.then(() => console.log('Running'))
	.catch((err) => console.error(err));
