import {GuNodeApp} from '@guardian/cdk';
import {AccessScope} from '@guardian/cdk/lib/constants';
import {GuDistributionBucketParameter, GuStack, type GuStackProps,} from '@guardian/cdk/lib/constructs/core';
import {GuCname} from '@guardian/cdk/lib/constructs/dns';
import {type App, Duration} from 'aws-cdk-lib';
import {InstanceClass, InstanceSize, InstanceType} from 'aws-cdk-lib/aws-ec2';

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

		const {loadBalancer, targetGroup} = new GuNodeApp(this, {
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
				'groupadd newsletters',
				'useradd -r -m -s /usr/bin/nologin -g newsletters newsletters',
				'mkdir -p /usr/share/newsletters',
				'mkdir -p /usr/share/newsletters/logs',
				`aws s3 cp s3://${distributionBucketParameter.valueAsString}/${this.stack}/${this.stage}/${app}/index.cjs /usr/share/newsletters/index.cjs`,
				'chown -R newsletters:newsletters /usr/share/newsletters',
				'export PM2_HOME="/usr/share/newsletters"',
				'/usr/local/node/pm2 start --name newsletters --uid newsletters --gid newsletters /usr/share/newsletters/index.cjs',
			].join('\n'),
			app,
		});

		targetGroup.configureHealthCheck({
			...targetGroup.healthCheck,
			path: '/help',
		})

		new GuCname(this, 'NewslettersAPICname', {
			app,
			domainName,
			ttl: Duration.hours(1),
			resourceRecord: loadBalancer.loadBalancerDnsName,
		});
	}
}
