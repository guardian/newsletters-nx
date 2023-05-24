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
	ApplicationListenerRule,
	ListenerAction,
	ListenerCondition,
	UnauthenticatedAction,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { GuPolicy } from '@guardian/cdk/lib/constructs/iam';
import { GuS3Bucket } from '@guardian/cdk/lib/constructs/s3';

export interface NewslettersToolProps extends GuStackProps {
	domainNameTool: string;
	domainNameApi: string;
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
	private getUserData = (
		app: string,
		bucketName: string,
		readOnly: boolean,
	) => {
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
			`# write out systemd file
cat >/etc/systemd/system/newsletters-api.service <<EOL
[Unit]
Description=${app}
After=network.target
[Service]
WorkingDirectory=/opt/${app}
Type=simple
User=ubuntu
ExecStart=/usr/bin/node /opt/${app}/dist/apps/newsletters-api/index.cjs
Restart=on-failure
Environment=STAGE=${this.stage}
Environment=NEWSLETTERS_API_READ=${readOnly ? 'true' : 'false'}
Environment=NEWSLETTERS_UI_SERVE=${readOnly ? 'false' : 'true'}
Environment=NEWSLETTER_BUCKET_NAME=${bucketName}
Environment=USE_IN_MEMORY_STORAGE=false
[Install]
WantedBy=multi-user.target
EOL`,
			`systemctl enable newsletters-api`, // enable the service
			`systemctl start newsletters-api`, // start the service
		].join('\n');
	};

	private setUpNodeEc2 = (props: NewslettersToolProps) => {
		const { domainNameTool, domainNameApi } = props;
		const toolAppName = 'newsletters-tool';
		const apiAppName = 'newsletters-api';

		// To avoid exposing the bucket name publicly, fetches the bucket name from SSM (parameter store).
		const bucketSSMParameterName = `/${this.stage}/${this.stack}/${apiAppName}/s3BucketName`;
		const bucketName = StringParameter.valueForStringParameter(
			this,
			bucketSSMParameterName,
		);
		const dataStorageBucket = new GuS3Bucket(this, 'DataBucket', {
			bucketName,
			app: toolAppName,
			versioned: true,
		});

		const s3AccessPolicy = new GuPolicy(this, `s3-access-policy`, {
			policyName: 'readWriteAccessToDataBucket',
			statements: [
				new PolicyStatement({
					sid: 'writeToDataStorageBucketPolicy',
					effect: Effect.ALLOW,
					actions: [
						's3:PutObject',
						's3:GetObject',
						's3:GetObjectVersion',
						's3:DeleteObject',
						's3:ListBucket',
						's3:DeleteObject',
						's3:DeleteObjectVersion',
					],
					resources: [
						`${dataStorageBucket.bucketArn}/*`,
						`${dataStorageBucket.bucketArn}`,
					],
				}),
			],
		});

		/** Sets up Node app to be run in EC2 */
		const ec2AppTool = new GuNodeApp(this, {
			access: { scope: AccessScope.PUBLIC },
			certificateProps: { domainName: domainNameTool },
			monitoringConfiguration: { noMonitoring: true },
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			// Minimum of 1 EC2 instance running at a time. If one fails, scales up to 2 before dropping back to 1 again
			scaling: { minimumInstances: 1, maximumInstances: 2 },
			// Instructions to set up the environment in the instance
			userData: this.getUserData(toolAppName, bucketName, false),
			roleConfiguration: {
				additionalPolicies: [s3AccessPolicy],
			},
			app: toolAppName,
			accessLogging: {
				enabled: true,
				prefix: `ELBLogs/${this.stack}/${toolAppName}/${this.stage}`,
			},
			applicationLogging: {
				enabled: true,
				systemdUnitName: 'newsletters-api',
			},
		});

		const ec2AppApi = new GuNodeApp(this, {
			access: { scope: AccessScope.PUBLIC },
			certificateProps: { domainName: domainNameApi },
			monitoringConfiguration: { noMonitoring: true },
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			scaling: { minimumInstances: 1, maximumInstances: 2 },
			userData: this.getUserData(apiAppName, bucketName, true),
			roleConfiguration: {
				additionalPolicies: [s3AccessPolicy],
			},
			app: apiAppName,
			applicationLogging: {
				enabled: true,
				systemdUnitName: 'newsletters-api',
			},
		});

		const readOnlyEndpointApiKeyParam = `/${this.stage}/${this.stack}/${apiAppName}/readOnlyEndpointApiKey`;
		const readOnlyEndpointApiKey = StringParameter.valueForStringParameter(
			this,
			readOnlyEndpointApiKeyParam,
		);

		new ApplicationListenerRule(this, 'ReadOnlyApiHeaderRule', {
			listener: ec2AppApi.listener,
			priority: 1,
			conditions: [
				ListenerCondition.httpHeader('X-Gu-API-Key', [readOnlyEndpointApiKey]),
			],
			targetGroups: [ec2AppApi.targetGroup],
		});
		new ApplicationListenerRule(this, 'BlockRequests', {
			listener: ec2AppApi.listener,
			priority: 2,
			conditions: [ListenerCondition.pathPatterns(['*'])],
			action: ListenerAction.fixedResponse(403, {
				contentType: 'application/json',
				messageBody:
					'{"error": "You are not authorised to access this endpoint"}',
			}),
		});

		/** Security group to allow load balancer to egress to 443 for OIDC flow using Google auth */
		const lbEgressSecurityGroup = new GuHttpsEgressSecurityGroup(
			this,
			'IdP Access',
			{ app: toolAppName, vpc: ec2AppTool.vpc },
		);

		/** Add security group to EC2 load balancer */
		ec2AppTool.loadBalancer.addSecurityGroup(lbEgressSecurityGroup);

		/** Fetch Google clientId param from SSM */
		const clientId = new GuStringParameter(this, 'Google Client ID', {
			description: 'Google OAuth client ID',
			default: `/${this.stage}/${this.stack}/${toolAppName}/googleClientId`,
			fromSSM: true,
		});

		/** Add Google authentication layer to the EC2 load balancer */
		ec2AppTool.listener.addAction('Google Auth', {
			action: ListenerAction.authenticateOidc({
				authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
				issuer: 'https://accounts.google.com',
				scope: 'openid%20profile%20email',
				authenticationRequestExtraParams: { hd: 'guardian.co.uk' },
				onUnauthenticatedRequest: UnauthenticatedAction.AUTHENTICATE,
				tokenEndpoint: 'https://oauth2.googleapis.com/token',
				userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
				clientId: clientId.valueAsString,
				clientSecret: SecretValue.secretsManager(
					`/${this.stage}/deploy/newsletters/clientSecret`,
				),
				next: ListenerAction.forward([ec2AppTool.targetGroup]),
			}),
		});

		/**
		 * Sets up CNAME record for domainName specified
		 * @see https://en.wikipedia.org/wiki/CNAME_record
		 */
		new GuCname(this, 'CNAME', {
			app: toolAppName,
			domainName: domainNameTool,
			ttl: Duration.hours(1),
			resourceRecord: ec2AppTool.loadBalancer.loadBalancerDnsName,
		});
		new GuCname(this, 'NewslettersAPICname', {
			app: apiAppName,
			domainName: domainNameApi,
			ttl: Duration.hours(1),
			resourceRecord: ec2AppApi.loadBalancer.loadBalancerDnsName,
		});
	};
}
