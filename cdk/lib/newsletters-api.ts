import { GuNodeApp } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import {
	GuDistributionBucketParameter,
	GuStack,
	type GuStackProps,
} from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuAllowPolicy } from '@guardian/cdk/lib/constructs/iam';
import { GuS3Bucket } from '@guardian/cdk/lib/constructs/s3';
import { type App, Duration } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export type NewslettersApiProps = GuStackProps & {
	domainName: string;
};

export class NewslettersApi extends GuStack {
	constructor(scope: App, id: string, props: NewslettersApiProps) {
		super(scope, id, props);

		const app = 'newsletters-api';

		const { domainName } = props;

		// const bucketParameterName = `/${this.stage}/${this.stack}/${app}/s3BucketName`;
		// const bucketName = StringParameter.valueForStringParameter(
		// 	this,
		// 	bucketParameterName,
		// );

		// new GuS3Bucket(this, 'DataBucket', {
		// 	bucketName,
		// 	app,
		// 	versioned: true,
		// });

		const distributionBucketParameter =
			GuDistributionBucketParameter.getInstance(this);

		const ec2App = new GuNodeApp(this, {
			access: { scope: AccessScope.PUBLIC },
			certificateProps: { domainName },
			monitoringConfiguration: { noMonitoring: true },
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			scaling: {
				minimumInstances: 1,
				maximumInstances: 2,
			},
			userData: [
				'#!/bin/bash',
				'set -e',
				'set +x',
				`aws s3 cp s3://${distributionBucketParameter.valueAsString}/${this.stack}/${this.stage}/${app}/index.cjs /tmp`,
				'chown ubuntu /tmp/index.cjs', // change ownership of the file
				`su ubuntu -c '/usr/local/node/pm2 start --name ${app} /tmp/index.cjs'`, // run the file as ubuntu user
			].join('\n'),
			app,
		});

		new GuCname(this, 'NewslettersAPICname', {
			app,
			domainName,
			ttl: Duration.hours(1),
			resourceRecord: ec2App.loadBalancer.loadBalancerDnsName,
		});
	}
}
