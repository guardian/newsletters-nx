import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { newslettersProps } from '../bin/cdk';
import { NewslettersData } from './newsletters-data';

describe('The Newsletters Data stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new NewslettersData(app, 'NewslettersData-TEST', {
			...newslettersProps,
			stage: 'TEST',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
