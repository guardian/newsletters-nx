import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuS3Bucket } from "@guardian/cdk/lib/constructs/s3";
import type { App } from 'aws-cdk-lib';
import { StringParameter } from "aws-cdk-lib/aws-ssm"

export class NewslettersData extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const app = 'newsletters-data'
		const bucketParameterName = `/${this.stage}/${this.stack}/${app}/s3BucketName`
		const bucketName = StringParameter.valueForStringParameter(this, bucketParameterName)

		new GuS3Bucket(this, "DataBucket", {
      bucketName,
      app,
      versioned: true,
    });
	}
}
