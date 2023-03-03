import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { Newsletters } from '../lib/newsletters';
import { NewslettersApi } from '../lib/newsletters-api';

const app = new App();

// Shared props for all CDK apps
export const sharedProps = {
	stack: 'newsletters',
	env: {
		region: 'eu-west-1',
	},
};

/** The internal tool for newsletter management */
const newslettersAppName = 'newsletters';

new Newsletters(app, 'Newsletters-CODE', {
	...sharedProps,
	stage: 'CODE',
	app: newslettersAppName,
	domainName: `${newslettersAppName}.code.dev-gutools.co.uk`,
});

// new NewslettersApi(app, 'NewslettersUi-PROD', {
// 	...sharedProps,
// 	stage: 'PROD',
// 	app: newslettersUiAppName,
// 	domainName: `${newslettersUiAppName}.gutools.co.uk`,
// });

/** The read-only newsletters API */
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
