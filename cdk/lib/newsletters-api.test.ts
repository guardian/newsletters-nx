import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NewslettersAPI } from './newsletters-api';

describe('The Newsletters API stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new NewslettersAPI(app, 'NewslettersAPI-TEST', {
			stack: 'newsletters',
			stage: 'TEST',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
