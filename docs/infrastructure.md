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
there's no CDK stack or running app for it. It only affects local runtime
behaviour, and it does have some artifacts in AWS: anything you write to a
real S3 bucket via `pnpm run dev:s3` lands there tagged as `DEV`, and there
are `DEV`-prefixed SSM parameters such as
[`/DEV/newsletters/newsletters-tool/userPermissions`](https://eu-west-1.console.aws.amazon.com/systems-manager/parameters/%252FDEV%252Fnewsletters%252Fnewsletters-tool%252FuserPermissions/description?region=eu-west-1&tab=Table).
These `DEV` artifacts are **not** managed by CDK — they're created ad hoc by
local usage, so they won't show up in `npm run diff`/`npm run synth` and
aren't torn down by any stack deletion. See
[Local development](./local-development.md#using-a-real-s3-bucket) for how
they get created.

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
