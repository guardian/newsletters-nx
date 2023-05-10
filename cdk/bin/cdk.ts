import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { NewslettersTool } from '../lib/newsletters-tool';
import { NewslettersApi } from '../lib/newsletters-api';

const app = new App();

// Shared props for all CDK apps
export const sharedProps = {
	stack: 'newsletters',
	env: { region: 'eu-west-1' },
};

/** The internal tool for newsletter management */
const newslettersToolAppName = 'newsletters-tool';
const readOnlyNewslettersApiName = 'read-only-newsletters';

new NewslettersTool(app, 'NewslettersTool-CODE', {
	...sharedProps,
	stage: 'CODE',
	app: newslettersToolAppName,
	domainName: `${newslettersToolAppName}.code.dev-gutools.co.uk`,
});
new NewslettersTool(app, 'NewslettersTool-PROD', {
	...sharedProps,
	stage: 'PROD',
	app: newslettersToolAppName,
	domainName: `${newslettersToolAppName}.gutools.co.uk`,
});

new NewslettersApi(app, 'NewslettersApi-CODE', {
	...sharedProps,
	stage: 'CODE',
	app: newslettersToolAppName,
	domainName: `${readOnlyNewslettersApiName}.code.dev-gutools.co.uk`,
});

new NewslettersApi(app, 'NewslettersApi-PROD', {
	...sharedProps,
	stage: 'PROD',
	app: newslettersToolAppName,
	domainName: `${readOnlyNewslettersApiName}.gutools.co.uk`,
});
