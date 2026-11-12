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

## WAF onboarding

Each deployed stack publishes the ARNs of both ALBs as CloudFormation-managed
SSM String parameters:

| App                               | Parameter                                                |
| --------------------------------- | -------------------------------------------------------- |
| `newsletters-tool`                | `/infosec/waf/services/<STAGE>/newsletters-tool-alb-arn` |
| `newsletters-api` (read-only API) | `/infosec/waf/services/<STAGE>/newsletters-api-alb-arn`  |

These parameters are for [guardian/waf](https://github.com/guardian/waf) to
use. Publishing them does **not** associate a WAF with either ALB or change
traffic handling. Each app is added to the WAF separately in `guardian/waf`.

For the read-only API, check on CODE that requests with a valid `X-Gu-API-Key`
header are still allowed after association, and that consumers of the API are
unaffected.

#### steps to check WAF implementation

Deploy the ALB ARN SSM parameter changes to CODE and confirm the parameter exists
(confirm the parameter store value matches the ARN of the load balancer in AWS console)
before deploying a WAF configuration that references it. In `guardian/waf`, add
`newsletters-tool` with `stages: ['CODE']` and `type: 'alb'` to the primary
WAF for the account hosting newsletters in `eu-west-1`.
After deploying the `guardian/waf` changes, verify login and its callback, newsletter
loading, editing/saving and form submissions, and inspect WAF decisions (look for legitimate
requests being blocked in the WAF settings in the AWS console).
Before enabling PROD in the WAF configuration, deploy the PROD parameter
and confirm it exists, then repeat the general e2e checks.

## Central application logging (ELK)

Both apps already enable `applicationLogging` in `GuNodeApp` (which extends
`GuEc2App`), with `systemdUnitName: 'newsletters-api'`. Both deployments run
`newsletters-api.service`. The `App` tags distinguishes the tool from the read-only API.

### AMIgo setup and rollout

Both AMI parameters in [`riff-raff.yaml`](../riff-raff.yaml) use the same
recipe, `newsletters-node-24-ubuntu-22`. Recipes are stored by AMIgo
outside this repository; a change to this YAML does not install a role.

In AMIgo, check that recipe and **add the `cdk-base` role to it if it is not there**.
Make sure to keep the existing roles. Bake a new AMI, then deploy it to CODE through
RiffRaff so that **both** Auto Scaling groups launch instances using the new bake.
After verifying deployment, roll it out to PROD.

Guardian's [cdk-base role](https://github.com/guardian/amigo/tree/main/roles/cdk-base)
installs instance-tag discovery and
[devx-logs](https://github.com/guardian/devx-logs/tree/main/ec2), which configures
Fluent Bit to collect the selected systemd journal and send it to Kinesis.

### ECS-based JSON output and shared-index compatibility

The API's own diagnostic and request logs use the shared
[`logger.ts`](../apps/newsletters-api/src/app/logger.ts), emitting one JSON line
to **stdout**, including errors and warnings. The systemd unit directs stdout
to the journal. Records use [Elastic Common Schema](https://www.elastic.co/docs/reference/ecs)
with nested JSON objects, except for `client` and `url` as described below:

- `@timestamp`, `ecs.version`, `log.level`, and `message`.
- `service.name` (identifies `newsletters-tool` or `newsletters-api`),
  `service.environment` (identifies the stage, and `labels.stack` identifies
  the stack. Local runs without `APP` use `newsletters-api`)
- Completed `/api/` requests include `event.action=newsletters_api_request`,
  `event.category=["web"]`, `event.type=["access"]`, `event.duration` (in
  **nanoseconds**), `http.request.method`, `http.response.status_code`, and
  `url` (the request path only). `event.outcome` uses the server perspective: 5xx is failure,
  other HTTP responses are success; 4xx still receives `log.level=warn`.
- Request logs also include `client` as an IP address string, obtained from Express's `req.ip`.
  Deployed apps trust one ALB proxy hop and use the address in
  `X-Forwarded-For` header from the load balancer.
  Locally, proxy trust is disabled and the socket address is used.
- Errors include `error.type`; raw exception messages, stacks, and arbitrary
  thrown objects are deliberately omitted because they can contain secrets.

The shared `logstash-*` indices have legacy mappings: `client` is mapped as
`text` in the PROD index inspected during diagnosis, and `url` is mapped as
`text` in other indices. Sending ECS objects (`client.ip` or `url.path`) to
those text fields can cause Elasticsearch to reject the whole record.
Both fields therefore deliberately use strings rather than standard ECS
objects. All application logs containing these fields use the same shape.
Client IPs remain personal data; do not copy raw request logs into tickets or chats.
Query strings, headers and request bodies are not logged.

Some shared indices also map `http.response.status_code` as text, so numeric
range queries on that field are not reliable across indices. Use
`event.outcome` or `log.level` to find failures.

### Verify on CODE

1. Check the recipe has `cdk-base` (in Amigo) and that both deployments use the new AMI.
2. Check each instance's `App`, `Stage`, `LogKinesisStreamName`, and
   `SystemdUnit` tags and confirm the collector service is running.
3. Make an API request against each deployment and inspect the ec2 instance:

    ```sh
    sudo journalctl -u newsletters-api -n 10 --no-pager -o cat
    sudo systemctl status td-agent-bit --no-pager
    ```

4. Confirm **request records**, not just startup or cloud-init records, reach
   central ELK for both app/stage. A running collector alone does not establish
   that Elasticsearch accepted the records. After deploying this compatibility
   change, generate fresh requests: previously rejected records may not be replayed.

An example Kibana search (using ECS fields) is:

```text
service.name : "newsletters-tool" and service.environment : "CODE"
and event.action : "newsletters_api_request" and event.outcome : "failure"
```

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
