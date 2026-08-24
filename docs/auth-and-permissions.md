# Auth and permissions

How authentication works today, and where permissions are moving.

## Authentication

The newsletters tool is protected at the load balancer using Google OIDC (`guardian.co.uk` accounts).  
The application consumes identity headers forwarded by the ALB.

## Authorisation (current state)

User permissions are currently read from per-stage SSM configuration and enforced server-side on API routes.

## Local development auth and permissions

For local development, the API supports bypassing ALB-provided identity headers
and SSM-backed permissions:

- `USE_DEVELOPER_PROFILE=true`
    - bypasses OIDC header parsing and uses a local developer profile.
- `USE_LOCAL_USER_PERMISSIONS=true`
    - uses `USER_PERMISSIONS` from environment instead of Parameter Store.
- `USER_PERMISSIONS='{"user@guardian.co.uk":0}'`
    - maps email to access level (for example `0 = Developer`).

This allows local setup/testing without relying on stage SSM permissions data.

## In progress: migration to central permissions tooling

Permissions are being migrated away from SSM to the Guardian permissions system.

Tracking issue:
- https://github.com/guardian/newsletters-nx/issues/538

This document is intentionally brief while that migration is in flight.  
When #538 lands, update this page to describe the new source of truth and local-dev setup.
