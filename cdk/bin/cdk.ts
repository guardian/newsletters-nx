import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { NewslettersApi } from '../lib/newsletters-api';

const app = new App();

export const newslettersProps = {
	stack: 'newsletters',
	env: {
		region: 'eu-west-1',
	},
};

new NewslettersApi(app, 'NewslettersApi-CODE', {
	...newslettersProps,
	stage: 'CODE',
});

// new NewslettersApi(app, 'NewslettersApi-PROD', {
// 	...newslettersProps,
// 	stage: 'PROD',
// });
