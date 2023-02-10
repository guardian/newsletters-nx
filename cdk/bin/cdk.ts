import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { NewslettersApi } from '../lib/newsletters-api';

const app = new App();

// Shared props for all CDK apps
export const sharedProps = {
	stack: 'newsletters',
	env: {
		region: 'eu-west-1',
	},
};

const newslettersApiAppName = 'newsletters-api';

new NewslettersApi(app, 'NewslettersApi-CODE', {
	...sharedProps,
	stage: 'CODE',
	app: newslettersApiAppName,
	domainName: `${newslettersApiAppName}.code.dev-gutools.co.uk`,
});

// new NewslettersApi(app, 'NewslettersApi-PROD', {
// 	...sharedProps,
// 	stage: 'PROD',
// 	app: newslettersApiAppName,
// 	domainName: `${newslettersApiAppName}.gutools.co.uk`,
// });
