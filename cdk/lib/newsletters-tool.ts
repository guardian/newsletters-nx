import { GuNodeApp } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import {
	GuDistributionBucketParameter,
	GuStack,
	GuStringParameter,
	type GuStackProps,
} from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuHttpsEgressSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
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
			`aws s3 cp s3://${distributionBucketParameter.valueAsString}/${this.stack}/${this.stage}/${app}/${app}.zip /tmp`, // copies zipped file from s3
			`mkdir -p /opt/${app}`, // make more permanent directory for app to be unzipped into
			`unzip /tmp/${app}.zip -d /opt/${app}`, // unzip the downloaded zip from /tmp into directory in /opt instead
			`chown -R ubuntu /opt/${app}`, // change ownership of the copied files to ubuntu user
			`export NEWSLETTERS_API_READ=true`,
			`export NEWSLETTERS_API_READ_WRITE=true`,
			`export NEWSLETTERS_UI_SERVE=true`,
			`cd /opt/${app}`, // Run from the same folder as when running locally to reduce the difference.
			`su ubuntu -c '/usr/local/node/pm2 start --name ${app} dist/apps/newsletters-api/index.cjs'`, // run the main entrypoint file as ubuntu user using pm2
		].join('\n');
	};

	private setUpNodeEc2 = (props: NewslettersToolProps) => {
		const { app, domainName } = props;

		/** Sets up Node app to be run in EC2 */
		const ec2App = new GuNodeApp(this, {
			access: { scope: AccessScope.PUBLIC },
			certificateProps: { domainName },
			monitoringConfiguration: { noMonitoring: true },
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			// Minimum of 1 EC2 instance running at a time. If one fails, scales up to 2 before dropping back to 1 again
			scaling: { minimumInstances: 1, maximumInstances: 2 },
			// Instructions to set up the environment in the instance
			userData: this.getUserData(app),
			app,
			accessLogging: {
				enabled: true,
				prefix: `ELBLogs/${this.stack}/${app}/${this.stage}`,
			},
		});

		/** Security group to allow load balancer to egress to 443 for OIDC flow using Google auth */
		const lbEgressSecurityGroup = new GuHttpsEgressSecurityGroup(
			this,
			'IdP Access',
			{ app, vpc: ec2App.vpc },
		);

		/** Add security group to EC2 load balancer */
		ec2App.loadBalancer.addSecurityGroup(lbEgressSecurityGroup);

		/** Fetch Google clientId param from SSM */
		const clientId = new GuStringParameter(this, 'Google Client ID', {
			description: 'Google OAuth client ID',
			default: `/${this.stage}/${this.stack}/${props.app}/googleClientId`,
			fromSSM: true,
		});

		/** Add Google authentication layer to the EC2 load balancer */
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
