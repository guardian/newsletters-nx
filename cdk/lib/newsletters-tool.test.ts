import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { sharedProps } from '../bin/cdk';
import { NewslettersTool } from './newsletters-tool';

describe('The Newsletters stack', () => {
	let template: Template;
	beforeAll(() => {
		const app = new App();
		const stack = new NewslettersTool(app, 'NewslettersTool-TEST', {
			...sharedProps,
			stage: 'TEST',
			app: 'newsletters-tool',
			domainNameTool: 'newsletters-tool.test.dev-gutools.co.uk',
			domainNameApi: 'readonly-newsletters.test.dev-gutools.co.uk',
		});
		template = Template.fromStack(stack);
	});

	it('matches the snapshot', () => {
		expect(template.toJSON()).toMatchSnapshot();
	});

	describe.each(['CODE', 'PROD'])('WAF onboarding in %s', (stage) => {
		let stageTemplate: Template;
		beforeAll(() => {
			const stack = new NewslettersTool(new App(), `NewslettersTool-${stage}`, {
				...sharedProps,
				stage,
				domainNameTool: 'newsletters-tool.example.com',
				domainNameApi: 'readonly-newsletters.example.com',
			});
			stageTemplate = Template.fromStack(stack);
		});

		it.each(['newsletters-tool', 'newsletters-api'])(
			'publishes the %s ALB ARN',
			(appName) => {
				const albIds = Object.keys(
					stageTemplate.findResources(
						'AWS::ElasticLoadBalancingV2::LoadBalancer',
						{
							Properties: {
								Tags: Match.arrayWith([{ Key: 'App', Value: appName }]),
							},
						},
					),
				);
				expect(albIds).toHaveLength(1);
				stageTemplate.hasResourceProperties('AWS::SSM::Parameter', {
					Name: `/infosec/waf/services/${stage}/${appName}-alb-arn`,
					Description: `The ARN of the ALB for ${appName}-${stage}. This parameter is created via CDK.`,
					Type: 'String',
					Tier: 'Standard',
					DataType: 'text',
					Value: { Ref: albIds[0] },
				});
			},
		);

		it('publishes only the two ALB parameters and no WAF associations', () => {
			expect(
				Object.keys(
					stageTemplate.findResources('AWS::SSM::Parameter', {
						Properties: {
							Name: Match.stringLikeRegexp('^/infosec/waf/services/'),
						},
					}),
				),
			).toHaveLength(2);
			stageTemplate.resourceCountIs('AWS::WAFv2::WebACLAssociation', 0);
		});
	});

	it('resolves the shared logging stream from SSM', () => {
		template.hasParameter('LoggingStreamName', {
			Type: 'AWS::SSM::Parameter::Value<String>',
			Default: '/account/services/logging.stream.name',
		});
	});

	it.each(['newsletters-tool', 'newsletters-api'])(
		'enables journal collection and scoped Kinesis permissions for %s',
		(appName) => {
			template.hasResourceProperties('AWS::AutoScaling::AutoScalingGroup', {
				Tags: Match.arrayWith([
					{ Key: 'App', Value: appName, PropagateAtLaunch: true },
					{
						Key: 'LogKinesisStreamName',
						Value: { Ref: 'LoggingStreamName' },
						PropagateAtLaunch: true,
					},
					{
						Key: 'SystemdUnit',
						Value: 'newsletters-api.service',
						PropagateAtLaunch: true,
					},
				]),
			});
			const roleIds = Object.keys(
				template.findResources('AWS::IAM::Role', {
					Properties: {
						Tags: Match.arrayWith([{ Key: 'App', Value: appName }]),
					},
				}),
			);
			expect(roleIds).toHaveLength(1);
			template.hasResourceProperties('AWS::IAM::Policy', {
				Roles: Match.arrayWith(roleIds.map((id) => ({ Ref: id }))),
				PolicyDocument: {
					Version: '2012-10-17',
					Statement: [
						{
							Effect: 'Allow',
							Action: ['kinesis:Describe*', 'kinesis:Put*'],
							Resource: {
								'Fn::Join': [
									'',
									[
										'arn:aws:kinesis:eu-west-1:',
										{ Ref: 'AWS::AccountId' },
										':stream/',
										{ Ref: 'LoggingStreamName' },
									],
								],
							},
						},
					],
				},
			});
		},
	);
});
