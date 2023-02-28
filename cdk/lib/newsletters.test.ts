import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { sharedProps } from '../bin/cdk';
import { Newsletters } from './newsletters';

describe('The Newsletters stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new Newsletters(app, 'Newsletters-TEST', {
			...sharedProps,
			stage: 'TEST',
			app: 'newsletters',
			domainName: 'newsletters.test.dev-gutools.co.uk',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
