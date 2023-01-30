import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { NewslettersAPI } from '../lib/newsletters-api';

const app = new App();
new NewslettersAPI(app, 'NewslettersAPI-DEV', {
	stack: 'newsletters',
	stage: 'DEV',
});
