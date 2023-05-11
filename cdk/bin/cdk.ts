import 'source-map-support/register';
// import { App } from 'aws-cdk-lib';
import { GuRootExperimental } from "@guardian/cdk/lib/experimental/constructs/root";
import { NewslettersTool } from '../lib/newsletters-tool';
import { NewslettersApi } from '../lib/newsletters-api';

const app = new GuRootExperimental();

// Shared props for all CDK apps
export const sharedProps = {
	stack: 'newsletters',
	env: { region: 'eu-west-1' },
};

/** The internal tool for newsletter management */
const newslettersToolAppName = 'newsletters-tool';

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

/** The External API for reading newsletter */
const readOnlyNewslettersApiName = 'read-only-newsletters';

new NewslettersApi(app, 'NewslettersApi-CODE', {
	stack: 'newsletters-api',
	env: { region: 'eu-west-1' },
	stage: 'CODE',
	app: newslettersToolAppName,
	domainName: `${readOnlyNewslettersApiName}.code.dev-gutools.co.uk`,

});

new NewslettersApi(app, 'NewslettersApi-PROD', {
	stack: 'newsletters-api',
	env: { region: 'eu-west-1' },
	stage: 'PROD',
	app: newslettersToolAppName,
	domainName: `${readOnlyNewslettersApiName}.gutools.co.uk`,
});
