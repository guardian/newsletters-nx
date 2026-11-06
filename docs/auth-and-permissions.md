# Auth and permissions

How access to the newsletters tool is restricted.

## Authentication

The newsletters tool is protected at the load balancer using Google OIDC (`guardian.co.uk` accounts) (configured in `/cdk`).  
With `ENABLE_JWT_VERIFICATION=true`, the application verifies the `x-amzn-oidc-data` JWT forwarded by the ALB (see [AWS docs on ALB authentication](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html)),
using AWS's `aws-jwt-verify` library in [`get-user-profile.ts`](../apps/newsletters-api/src/app/get-user-profile.ts).
Verification checks the ES256 signature against the ALB's regional public-key endpoint,
the expected load-balancer ARN (`ALB_ARN`), and the Google OAuth client ID (`GOOGLE_CLIENT_ID`).
CDK enables verification and supplies both settings to the deployed tool. Public keys are cached and fetched again for new key IDs.

The issuer must be `https://accounts.google.com`, and the expiry in the signed ALB header
must be in the future. A verified payload must be a JSON object with a non-empty `sub`
and correctly typed profile fields. Malformed tokens, invalid signatures, missing configuration,
or public-key retrieval failures return no profile and therefore grant no user permissions.

The read-only API is a second deployment of the same code with the UI and write routes disabled. It has no user auth — instead, it's gated by an `X-Gu-API-Key` header matching the `readOnlyEndpointApiKey` SSM parameter (see [Infrastructure](./infrastructure.md#the-two-apps) and [Architecture](./architecture.md)).

## Authorisation

User permissions are read from the [permissions tool](https://permissions.gutools.co.uk/definitions) ([github](https://github.com/guardian/permissions)), refreshed once a minute.

New permissions can be added by editing [Permission.scala](https://github.com/guardian/permissions/blob/4ece6793e07c7698591f1944eb41402eec38e734/shared/src/main/scala/com/gu/permissions/models/Permission.scala) in the permissions tool and adding a corresponding id to [guardian-permissions-utils.ts](../apps/newsletters-api/src/services/permissions/guardian-permissions-utils.ts) in this repo.

## Legacy authorisation

> [!NOTE]
> This authorisation method is deprecated and disabled by default.
> To enable it, edit `cdk/lib/newsletters-tool.ts` and set `Environment=USE_GUARDIAN_PERMISSIONS=true`.

User permissions are stored in an AWS [SSM parameter store](https://eu-west-1.console.aws.amazon.com/systems-manager/parameters/?region=eu-west-1&tab=Table#list_parameter_filters=Name:%3A:userPermissions), cached locally every 15 minutes.
The permissions are stored as (email_address, user_access_level) pairs, and must be manually updated. For a description of the user access levels, see [user-profile.ts](../libs/newsletters-data-client/src/lib/user-profile.ts)

## Local development auth and permissions

For local development the API will bypass ALB identity headers and may be configured to use or bypass [permissions tool](https://permissions.gutools.co.uk/definitions) based authorisation. See [Local development](./local-development.md#configuration).

The explicit `USE_DEVELOPER_PROFILE=true` option continues to bypass JWT verification.
Otherwise, verification runs only when `ENABLE_JWT_VERIFICATION` is exactly `true`;
`ALB_ARN` and `GOOGLE_CLIENT_ID` are required only in that mode.
The local environment example sets `ENABLE_JWT_VERIFICATION=false`. When false or unset,
JWTs are decoded without checking signatures or authentication claims, but their JSON
structure and profile fields are still validated. Only use this mode for local development.
`USE_FAKE_JWT` only supplies a fallback token when no identity header is present; that token
is handled according to the same verification flag as a received JWT.
