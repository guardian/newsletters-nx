# Auth and permissions

How access to the newsletters tool is restricted.

## Authentication

The newsletters tool is protected at the load balancer using Google OIDC (restricted to `@guardian.co.uk` accounts) configured in `/cdk`.
The ALB performs the OIDC authentication and passes a JWT to the application in the `x-amzn-oidc-data` header (see [AWS docs on ALB authentication](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html))

The application verifies the JWT is correctly signed (using [aws-jwt-verify](https://github.com/awslabs/aws-jwt-verify)) in [`get-user-profile.ts`](../apps/newsletters-api/src/app/get-user-profile.ts).

Verification can be disabled by setting `ENABLE_JWT_VERIFICATION=false`. Don't do this unless you have a very good reason.

Note that the verification requires loading public keys. These keys are automatically cached by the application, and new keys automatically loaded on key rotation, but this may occasionally cause a delay in response from the application.

The read-only API is a second deployment of the same code with the UI and write routes disabled. It has no user auth — instead, it's gated by an `X-Gu-API-Key` header matching the `readOnlyEndpointApiKey` SSM parameter (see [Infrastructure](./infrastructure.md#the-two-apps) and [Architecture](./architecture.md)).

## Authorisation

User permissions are read from the [permissions tool](https://permissions.gutools.co.uk/definitions) ([github](https://github.com/guardian/permissions)), refreshed once a minute.

New permissions can be added by editing [Permission.scala](https://github.com/guardian/permissions/blob/4ece6793e07c7698591f1944eb41402eec38e734/shared/src/main/scala/com/gu/permissions/models/Permission.scala) in the permissions tool and adding a corresponding id to [guardian-permissions-utils.ts](../apps/newsletters-api/src/services/permissions/guardian-permissions-utils.ts) in this repo.

## Local development auth and permissions

For local development the API will bypass ALB identity headers. Set `USE_LOCAL_USER_PERMISSIONS=true` to use the local `USER_PERMISSIONS` mapping; otherwise authorisation uses the [permissions tool](https://permissions.gutools.co.uk/definitions). See [Local development](./local-development.md#configuration).
