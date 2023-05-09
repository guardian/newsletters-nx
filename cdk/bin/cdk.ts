import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { NewslettersTool } from '../lib/newsletters-tool';

const app = new App();

// Shared props for all CDK apps
export const sharedProps = {
	stack: 'newsletters',
	env: { region: 'eu-west-1' },
};

/** The internal tool for newsletter management */
const newslettersToolAppName = 'newsletters-tool';
const newslettersApiName = 'readonly-newsletters';

new NewslettersTool(app, 'NewslettersTool-CODE', {
	...sharedProps,
	stage: 'CODE',
	app: newslettersToolAppName,
	domainNameTool: `${newslettersToolAppName}.code.dev-gutools.co.uk`,
	domainNameApi: `${newslettersApiName}.code.dev-gutools.co.uk`,
});

new NewslettersTool(app, 'NewslettersTool-PROD', {
	...sharedProps,
	stage: 'PROD',
	app: newslettersToolAppName,
	domainNameTool: `${newslettersToolAppName}.gutools.co.uk`,
	domainNameApi: `${newslettersApiName}.gutools.co.uk`,
});
