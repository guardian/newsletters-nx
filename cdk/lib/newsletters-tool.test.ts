import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { sharedProps } from '../bin/cdk';
import { NewslettersTool } from './newsletters-tool';

describe('The Newsletters stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new NewslettersTool(app, 'NewslettersTool-TEST', {
			...sharedProps,
			stage: 'TEST',
			app: 'newsletters-tool',
			domainName: 'newsletters-tool.test.dev-gutools.co.uk',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
