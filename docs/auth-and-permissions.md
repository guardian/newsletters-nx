# Auth and permissions

How users are authenticated at the load balancer, and how permissions are granted and cached.

## Google auth happens at the load balancer

The application never sees the OAuth flow. The ALB listener runs an `authenticateOidc` action against Google and only then forwards to the instance:

```ts
// cdk/lib/newsletters-tool.ts
ec2AppTool.listener.addAction('Google Auth', {
	action: ListenerAction.authenticateOidc({
		authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
		issuer: 'https://accounts.google.com',
		scope: 'openid email profile',
		authenticationRequestExtraParams: { hd: 'guardian.co.uk' },
		onUnauthenticatedRequest: UnauthenticatedAction.AUTHENTICATE,
		...
	}),
});
```

`hd: 'guardian.co.uk'` restricts the flow to Guardian accounts. The client id comes from the `googleClientId` SSM parameter and the secret from Secrets Manager. The web application auth configuration in the Google console lives in the `newsletter-source-api` project and can be accessed, with newsletters admin group membership, at <https://console.cloud.google.com/apis/credentials?project=newsletter-source-api>.

The app then reads the profile from the `x-amzn-oidc-data` header that the ALB adds:

```ts
// apps/newsletters-api/src/app/get-user-profile.ts
const jwtProfile =
	req.headers['x-amzn-oidc-data'] ?? getTestJwtProfileDataIfUsing();
```

`parseJwt` base64-decodes the payload **without verifying the signature**. That is acceptable only because the header is set by the ALB and the instance is not reachable except through it — worth knowing before anything is moved off that topology. Local development bypasses all of it with `USE_DEVELOPER_PROFILE=true`.

## Access levels and permissions

Two types, in [`user-profile.ts`](../libs/newsletters-data-client/src/lib/user-profile.ts): `UserAccessLevel` (an enum of roles — `Developer`, `Editor`, `Drafter`, `Viewer`, `CentralProduction`, `BrazeEditor`, `OphanEditor`) and `UserPermissions` (a flat record of ten booleans such as `editNewsletters`, `launchNewsletters`, `editBraze`, `editTags`).

`levelToPermissions` maps one to the other. Stored data holds only the level; permissions are always derived. The roles are deliberately narrow — `BrazeEditor` can edit Braze fields and write to drafts but cannot launch, and `CentralProduction` can edit tags and the sign-up page, matching the handoffs in the launch flow.

Enforcement is server-side, per route, via `hasPermission` and `isAuthorisedToMakeRequestedNewsletterUpdate` in [`authorisation.ts`](../apps/newsletters-api/src/app/authorisation.ts). The latter is the interesting one: a user without blanket `editNewsletters` can still submit an update, provided every key they are changing appears in the schema their permissions allow. The UI hides controls too, but that is presentation only.

## Per-stage SSM parameters and the 15-minute cache

Permissions live in Parameter Store, one parameter per stage:

- `/CODE/newsletters/newsletters-tool/userPermissions`
- `/DEV/newsletters/newsletters-tool/userPermissions`
- `/PROD/newsletters/newsletters-tool/userPermissions`

The path is built from environment variables in [`libs/util/src/lib/config-service.ts`](../libs/util/src/lib/config-service.ts):

```ts
const getPath = (key: string) => {
	const { STAGE, STACK, APP } = process.env;
	if (!(STAGE && STACK && APP)) {
		throw new Error('Missing environment variables');
	}
	return `/${STAGE}/${STACK}/${APP}/${key}`;
};
```

The parameter is JSON mapping email address to `UserAccessLevel`, validated with `permissionsDataSchema`. Anyone absent from it — and any user whose lookup fails — falls back to `Viewer`, which can see the tool but change nothing.

The cache is a 15-minute max age on the config read:

```ts
// apps/newsletters-api/src/services/permissions/ParamPermissions.ts
/** 15 minutes*/
const TIME_BETWEEN_PERMISSIONS_PARAM_CHECKS = 1000 * 60 * 15;
```

**So granting someone access takes up to 15 minutes to take effect** — and, because the cache is per instance and there can be two, it may appear to apply intermittently before it applies consistently.

Parameter Store is accessed via the `frontend` account, reachable through [Janus](https://janus.gutools.co.uk/).

> **TO DO** — it would be preferable for access to the tool to be managed using the existing [permissions system](https://github.com/guardian/permissions) rather than a hand-edited SSM parameter.

---

Part of the [newsletters-nx documentation](./README.md).
