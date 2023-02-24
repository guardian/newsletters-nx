import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { NewslettersApi } from '../lib/newsletters-api';
import { NewslettersUi } from '../lib/newsletters-ui';

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
	/** @todo - this ought to be a .guardianapis.co.uk domain */
	domainName: `${newslettersApiAppName}.code.dev-gutools.co.uk`,
});

// new NewslettersApi(app, 'NewslettersApi-PROD', {
// 	...sharedProps,
// 	stage: 'PROD',
// 	app: newslettersApiAppName,
// /** @todo - this ought to be a .guardianapis.co.uk domain */
// 	domainName: `${newslettersApiAppName}.gutools.co.uk`,
// });

const newslettersUiAppName = 'newsletters-ui';

new NewslettersUi(app, 'NewslettersUi-CODE', {
	...sharedProps,
	stage: 'CODE',
	app: newslettersUiAppName,
	domainName: `${newslettersUiAppName}.code.dev-gutools.co.uk`,
});

// new NewslettersApi(app, 'NewslettersUi-PROD', {
// 	...sharedProps,
// 	stage: 'PROD',
// 	app: newslettersUiAppName,
// 	domainName: `${newslettersUiAppName}.gutools.co.uk`,
// });
