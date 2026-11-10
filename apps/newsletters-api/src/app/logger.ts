// Log fields follow Elastic Common Schema (ECS): https://www.elastic.co/docs/reference/ecs
// The shared ELK index requires client and url to be strings, not ECS objects.
type LogLevel = 'info' | 'warn' | 'error';

type LogContext = {
	client?: string;
	event?: {
		action: string;
		duration?: number;
		category?: string[];
		type?: string[];
		outcome?: 'success' | 'failure';
	};
	http?: {
		request: { method: string };
		response?: { status_code: number };
	};
	url?: string;
	error?: { type: string };
};

export const errorContext = (error: unknown): Pick<LogContext, 'error'> => ({
	error: { type: error instanceof Error ? error.name : 'UnknownError' },
});

export const log = (
	level: LogLevel,
	message: string,
	context: LogContext = {},
) => {
	console.log(
		JSON.stringify({
			'@timestamp': new Date().toISOString(),
			ecs: { version: '9.5.0' },
			log: { level },
			message,
			service: {
				name: process.env.APP ?? 'newsletters-api',
				environment: process.env.STAGE,
			},
			labels: { stack: process.env.STACK },
			...context,
		}),
	);
};
