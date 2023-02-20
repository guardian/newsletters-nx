import { GuNodeApp } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import {
	GuDistributionBucketParameter,
	GuStack,
	type GuStackProps,
} from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuS3Bucket } from '@guardian/cdk/lib/constructs/s3';
import { type App, Duration } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export interface NewslettersApiProps extends GuStackProps {
	app: string; // Force app to be a required prop
	domainName: string;
}

export class NewslettersApi extends GuStack {
	constructor(scope: App, id: string, props: NewslettersApiProps) {
		super(scope, id, props);

		const { app, domainName } = props;

		// Creates (empty) S3 bucket on initial build for the newsletters data to sit in.
		// To avoid exposing the bucket name publicly, fetches the bucket name from SSM (parameter store).
		const bucketSSMParameterName = `/${this.stage}/${this.stack}/${app}/s3BucketName`;
		const bucketName = StringParameter.valueForStringParameter(
			this,
			bucketSSMParameterName,
		);
		new GuS3Bucket(this, 'DataBucket', { bucketName, app, versioned: true });

		// Fetches distribution S3 bucket name from account
		const distributionBucketParameter =
			GuDistributionBucketParameter.getInstance(this);

		// Fetches distribution S3 bucket name from account
		const ec2App = new GuNodeApp(this, {
			access: { scope: AccessScope.PUBLIC },
			certificateProps: { domainName },
			monitoringConfiguration: { noMonitoring: true },
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			scaling: { minimumInstances: 1, maximumInstances: 2 },
			// User data is a set of instructions to supply to the instance at launch
			// @see https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html
			userData: [
				'#!/bin/bash', // "Shebang" to instruct the program loader to run this as a bash script
				'set -e', // Exits immediately if something returns a non-zero status (errors)
				'set +x', // Prevents shell from printing statements before execution
				`aws s3 cp s3://${distributionBucketParameter.valueAsString}/${this.stack}/${this.stage}/${app}/index.cjs /tmp`, // copies file from s3
				'chown ubuntu /tmp/index.cjs', // change ownership of the copied file to ubuntu user
				`su ubuntu -c '/usr/local/node/pm2 start --name ${app} /tmp/index.cjs'`, // run the file as ubuntu user using pm2
			].join('\n'),
			app,
		});

		// Sets up CNAME record for domainName specified
		// @see https://en.wikipedia.org/wiki/CNAME_record
		new GuCname(this, 'NewslettersAPICname', {
			app,
			domainName,
			ttl: Duration.hours(1),
			resourceRecord: 'dualstack.guardian.map.fastly.net.',
		});
	}
}
