import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { NewslettersData } from '../lib/newsletters-data';

const app = new App();

export const newslettersProps = {
	stack: 'newsletters',
	env: {
		account: 'frontend',
		region: 'eu-west-1'
	}
}

new NewslettersData(app, 'NewslettersData-DEV', {
	...newslettersProps,
	stage: 'DEV',
});
