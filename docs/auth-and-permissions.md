# Auth and permissions

How authentication works today, and where permissions are moving.

## Authentication

The newsletters tool is protected at the load balancer using Google OIDC (`guardian.co.uk` accounts).  
The application consumes identity headers forwarded by the ALB (see [AWS docs on ALB authentication](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html)),
decoded in [`get-user-profile.ts`](../apps/newsletters-api/src/app/get-user-profile.ts). This is unaffected by the user permissions migration described below.

## Authorisation (current state)

User permissions are currently read from per-stage SSM configuration and enforced server-side on API routes.

## Local development auth and permissions

For local development the API can bypass ALB identity headers and SSM-backed
permissions entirely. See [Local development](./local-development.md#configuration).

## In progress: migration to central permissions tooling

Permissions are being migrated away from SSM to the Guardian permissions system.

Tracking issue:

- https://github.com/guardian/newsletters-nx/issues/538

This document is intentionally brief while that migration is in flight.  
When #538 lands, update this page to describe the new source of truth and local-dev setup.
