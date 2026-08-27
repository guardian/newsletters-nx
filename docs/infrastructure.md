# Infrastructure

What the deployed infrastructure consists of. For how to actually ship a change,
see [Deploying](./deployment.md).

## Stages and domains

The deployed stages are **CODE** and **PROD**. [`cdk/bin/cdk.ts`](../cdk/bin/cdk.ts)
instantiates the `NewslettersTool` stack once per stage:

| Stage | Tool                                      | Read-only API                                 |
| ----- | ----------------------------------------- | --------------------------------------------- |
| CODE  | `newsletters-tool.code.dev-gutools.co.uk` | `readonly-newsletters.code.dev-gutools.co.uk` |
| PROD  | `newsletters-tool.gutools.co.uk`          | `readonly-newsletters.gutools.co.uk`          |

`STAGE=DEV` appears in local `.env` examples but is **not** a deployed stage —
it only affects local runtime behaviour. See
[Local development](./local-development.md).

## The stack

Stack `newsletters`, region `eu-west-1`, defined with
[@guardian/cdk](https://github.com/guardian/cdk) in
[`cdk/lib/newsletters-tool.ts`](../cdk/lib/newsletters-tool.ts). It creates:

- Two `GuNodeApp`s on t4g.micro, each scaling 1–2 instances
- The S3 data bucket
- IAM policies for bucket and SES access
- SES domain identities
- CloudWatch alarms routed to the `newsletters-alerts` SNS topic
- CNAMEs for the domains above

## The two apps

Both apps run the same `newsletters-api` code, deployed twice with different
configuration:

|               | `newsletters-tool`                           | `readonly-newsletters` |
| ------------- | -------------------------------------------- | ---------------------- |
| Serves the UI | Yes                                          | No                     |
| Write routes  | Yes                                          | No                     |
| Auth          | Google OIDC at the load balancer             | `X-Gu-API-Key` header  |
| Email         | Per-stage `enableEmailService` SSM parameter | Always disabled        |

The read-only API has no user auth. Two listener rules on its load balancer
allow requests carrying an `X-Gu-API-Key` header matching the
`readOnlyEndpointApiKey` SSM parameter, and return a fixed 403 to everything
else.

## Instance configuration

Configuration is injected as environment variables through EC2 user data:

| Variable                       | Notes                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `NEWSLETTER_BUCKET_NAME`       | The S3 data bucket                                                                               |
| `STAGE`, `STACK`, `APP`        | Standard Guardian tagging                                                                        |
| `ENABLE_EMAIL_SERVICE`         | From the `enableEmailService` SSM parameter for the tool; always `'false'` for the read-only API |
| `NEWSLETTERS_API_READ`         | Differentiates the two deployments                                                               |
| `NEWSLETTERS_UI_SERVE`         | Differentiates the two deployments                                                               |
| `ENABLE_DYNAMIC_IMAGE_SIGNING` | Differentiates the two deployments                                                               |

Per-stage runtime configuration beyond this comes from SSM Parameter Store — see
[Architecture](./architecture.md#external-services).

## Change infrastructure

Infrastructure lives in [`cdk/`](../cdk). Run these from that directory:

| Command               | Use it to                                           |
| --------------------- | --------------------------------------------------- |
| `npm run diff`        | See what your change would do to a deployed stack   |
| `npm run synth`       | Generate the CloudFormation templates               |
| `npm run test`        | Run the snapshot test                               |
| `npm run test-update` | Regenerate the snapshot after an intentional change |
| `npm run lint`        | Lint the CDK code                                   |

The stack has a snapshot test, so **any infrastructure change needs
`npm run test-update`** or CI will fail. Commit the updated snapshot.

## RiffRaff

[`riff-raff.yaml`](../riff-raff.yaml) declares one CloudFormation deployment
(`newsletters-tool-cfn`) and two autoscaling deployments (`newsletters-tool` and
`newsletters-api`), both depending on it, for stages CODE and PROD.

AMIs come from Amigo, recipe `newsletters-node-24-ubuntu-22`.
