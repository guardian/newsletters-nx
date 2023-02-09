import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { newslettersProps } from '../bin/cdk';
import { NewslettersApi } from './newsletters-api';

describe('The NewslettersApi stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new NewslettersApi(app, 'NewslettersApi-TEST', {
			...newslettersProps,
			stage: 'TEST',
			domainName: 'newsletters-api.test.dev-gutools.co.uk',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
