import { GuNodeApp } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import {
	GuDistributionBucketParameter,
	GuStack,
	type GuStackProps,
} from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { type App, Duration } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { GuPolicy } from '@guardian/cdk/lib/constructs/iam';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export interface NewslettersApiProps extends GuStackProps {
	app: string; // Force app to be a required prop
	domainName: string;
}

export class NewslettersApi extends GuStack {
	constructor(scope: App, id: string, props: NewslettersApiProps) {
		super(scope, id, props);

		this.setUpNodeEc2(props);
	}

	/**
	 * Generates user data for startup of EC2 instance
	 * User data is a set of instructions to supply to the instance at launch
	 * @see https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html
	 */
	private getUserData = (
		app: NewslettersApiProps['app'],
		bucketName: string,
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
			`export NEWSLETTERS_API_READ=true`,
			`export NEWSLETTERS_API_READ_WRITE=false`,
			`export NEWSLETTERS_UI_SERVE=false`,
			`export STAGE=${this.stage}`, // sets the stage environment variable
			`export NEWSLETTER_BUCKET_NAME=${bucketName}`, // sets the bucket name environment variable
			`cd /opt/${app}`, // Run from the same folder as when running locally to reduce the difference.
			`su ubuntu -c '/usr/local/node/pm2 start --name ${app} dist/apps/newsletters-api/index.cjs'`, // run the main entrypoint file as ubuntu user using pm2
		].join('\n');
	};

	private setUpNodeEc2 = (props: NewslettersApiProps) => {
		const { app, domainName } = props;
		const bucketSSMParameterName = `/${this.stage}/newsletters/newsletters-api/s3BucketName`;
		const bucketName = StringParameter.valueForStringParameter(
			this,
			bucketSSMParameterName,
		);
		const dataBucketName = s3.Bucket.fromBucketName(
			this,
			`${this.stack}-data-bucket=${this.stage}`,
			bucketName,
		);

		const s3AccessPolicy = new GuPolicy(this, `${app}-InstancePolicy`, {
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
						`${dataBucketName.bucketArn}/*`,
						`${dataBucketName.bucketArn}`,
					],
				}),
			],
		});
		/**
		 *  Sets up Node app to be run in EC2
		 */
		const ec2App = new GuNodeApp(this, {
			imageRecipe: 'newsletters-node',
			access: { scope: AccessScope.PUBLIC },
			certificateProps: { domainName },
			monitoringConfiguration: { noMonitoring: true },
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			scaling: { minimumInstances: 1, maximumInstances: 2 },
			userData: this.getUserData(app, dataBucketName.bucketName),
			roleConfiguration: {
				additionalPolicies: [s3AccessPolicy],
			},
			app,
		});

		/**
		 * Sets up CNAME record for domainName specified
		 * @see https://en.wikipedia.org/wiki/CNAME_record
		 */
		new GuCname(this, 'NewslettersAPICname', {
			app,
			domainName,
			ttl: Duration.hours(1),
			resourceRecord: ec2App.loadBalancer.loadBalancerDnsName,
		});
	};
}
