import { GuNodeApp } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import {
	GuDistributionBucketParameter,
	GuStack,
	GuStringParameter,
	type GuStackProps,
} from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { type App, Duration, SecretValue } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import {
	ListenerAction,
	UnauthenticatedAction,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export interface NewslettersToolProps extends GuStackProps {
	app: string; // Force app to be a required prop
	domainName: string;
}

export class NewslettersTool extends GuStack {
	constructor(scope: App, id: string, props: NewslettersToolProps) {
		super(scope, id, props);

		this.setUpNodeEc2(props);
	}

	/**
	 * Generates user data for startup of EC2 instance
	 * User data is a set of instructions to supply to the instance at launch
	 * @see https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html
	 */
	private getUserData = (app: NewslettersToolProps['app']) => {
		// Fetches distribution S3 bucket name from account
		const distributionBucketParameter =
			GuDistributionBucketParameter.getInstance(this);

		return [
			'#!/bin/bash', // "Shebang" to instruct the program loader to run this as a bash script
			'set -e', // Exits immediately if something returns a non-zero status (errors)
			'set +x', // Prevents shell from printing statements before execution
			`aws s3 cp s3://${distributionBucketParameter.valueAsString}/${this.stack}/${this.stage}/${app} /tmp`, // copies files from s3
			'chown -R ubuntu /tmp', // change ownership of the copied files to ubuntu user
			`su ubuntu -c '/usr/local/node/pm2 start --name ${app} /tmp/newsletters-api/main.cjs'`, // run the file as ubuntu user using pm2
		].join('\n');
	};

	private setUpNodeEc2 = (props: NewslettersToolProps) => {
		const { app, domainName } = props;
		/**
		 *  Sets up Node app to be run in EC2
		 */
		const ec2App = new GuNodeApp(this, {
			access: { scope: AccessScope.PUBLIC },
			certificateProps: { domainName },
			monitoringConfiguration: { noMonitoring: true },
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			scaling: { minimumInstances: 1, maximumInstances: 2 },
			userData: this.getUserData(app),
			app,
		});

		/**
		 * Adds authentication layer to the EC2 load balancer
		 */
		const clientId = new GuStringParameter(this, 'googleClientId', {
			description: 'Google OAuth client ID',
			default: `/${this.stage}/${this.stack}/${props.app}/googleClientId`,
			fromSSM: true,
		});

		ec2App.listener.addAction('Google Auth', {
			action: ListenerAction.authenticateOidc({
				authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
				issuer: 'https://accounts.google.com',
				scope: 'openid',
				authenticationRequestExtraParams: { hd: 'guardian.co.uk' },
				onUnauthenticatedRequest: UnauthenticatedAction.AUTHENTICATE,

				tokenEndpoint: 'https://oauth2.googleapis.com/token',

				userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
				clientId: clientId.valueAsString,
				clientSecret: SecretValue.secretsManager(
					`/${this.stage}/deploy/newsletters/clientSecret`,
				),
				next: ListenerAction.forward([ec2App.targetGroup]),
			}),
		});

		/**
		 * Sets up CNAME record for domainName specified
		 * @see https://en.wikipedia.org/wiki/CNAME_record
		 */
		new GuCname(this, 'CNAME', {
			app,
			domainName,
			ttl: Duration.hours(1),
			resourceRecord: ec2App.loadBalancer.loadBalancerDnsName,
		});
	};
}
