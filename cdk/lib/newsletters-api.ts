import { GuNodeApp } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuDistributionBucketParameter } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuS3Bucket } from '@guardian/cdk/lib/constructs/s3';
import { App, Duration } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class NewslettersApi extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const app = 'newsletters-api';
		const bucketParameterName = `/${this.stage}/${this.stack}/${app}/s3BucketName`;
		const bucketName = StringParameter.valueForStringParameter(
			this,
			bucketParameterName,
		);

		new GuS3Bucket(this, 'DataBucket', {
			bucketName,
			app,
			versioned: true,
		});

		const domainName =
			this.stage === 'PROD'
				? 'newsletters-api.gutools.co.uk'
				: 'newsletters-api.code.dev-gutools.co.uk';

		const distributionBucketParameter =
			GuDistributionBucketParameter.getInstance(this);

		const ec2App = new GuNodeApp(this, {
			access: { scope: AccessScope.PUBLIC },
			certificateProps: { domainName },
			roleConfiguration: {
				// ==> Commented out deliberately since copied from an example - might need later?
				// additionalPolicies: [
				// 	new GuAllowPolicy(this, "GetDistBucket", {
				// 		actions: ["s3:GetObject"],
				// 		resources: [`arn:aws:s3:::frontend-dist/*`],
				// 	}),
				// ],
			},
			monitoringConfiguration: { noMonitoring: true },
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
			scaling: {
				minimumInstances: 1,
				maximumInstances: 2,
			},
			userData: [
				'#!/bin/bash',
				'set -e',
				'set +x',
				`aws s3 cp s3://${distributionBucketParameter.valueAsString}/${this.stack}/${this.stage}/${app}/index.js /tmp`,
				'chown ubuntu /tmp/index.js', // change ownership of the file
				"su ubuntu -c 'node /tmp/index.js'", // run the file as ubuntu user
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
