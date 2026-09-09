# Auth and permissions

How access to the newsletters tool is restricted.

## Authentication

The newsletters tool is protected at the load balancer using Google OIDC (`guardian.co.uk` accounts) (configured in `/cdk`).  
The application consumes identity headers forwarded by the ALB (see [AWS docs on ALB authentication](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html)),
decoded in [`get-user-profile.ts`](../apps/newsletters-api/src/app/get-user-profile.ts).

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

For local development the API can bypass ALB identity headers and SSM-backed
permissions entirely. See [Local development](./local-development.md#configuration).
