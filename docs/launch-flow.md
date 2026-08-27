# Launch flow

What happens when a draft newsletter is launched, and what launch statuses mean.

## Overview

When a user launches a newsletter, the workflow does four things:

1. Creates a launched newsletter record from the draft
2. Attempts to remove the draft
3. Sends notification emails for downstream/manual setup steps
4. Sets creation status fields based on notification outcomes

This flow is initiated by the launch wizard (`doLaunch` step) and executed server-side.

## Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as newsletters-ui<br>(doLaunch step)
    participant Exec as executeLaunch
    participant Launch as LaunchService
    participant Draft as Draft storage
    participant Newsletter as Newsletter storage
    participant SES as SES (email-builder)

    User->>UI: Click "Request Launch"
    UI->>Exec: submit doLaunch step
    Exec->>Launch: launchDraft(draftId, extraValues)
    Launch->>Draft: readWithMeta(draftId)
    Draft-->>Launch: draft data
    Launch->>Launch: apply defaults/derived fields<br>+ merge extraValues
    Launch->>Newsletter: create(launched record)
    Newsletter-->>Launch: created newsletter
    Launch->>Draft: deleteItem(draftId)
    Note right of Draft: best-effort - failure is logged but doesn't fail launch
    Launch-->>Exec: created newsletter
    Exec-->>UI: launch success response
    Note over Exec,SES: Not awaited — UI response doesn't wait on notifications
    Exec->>SES: send 3 notification emails in parallel<br>(launch / Braze / Central Production)
    SES-->>Exec: 3 results (only 2 captured — see caveats)
    Exec->>Newsletter: updateCreationStatus(REQUESTED/NOT_REQUESTED)
```

## Status semantics (important)

`REQUESTED` means automated emails to editorial and production teams are sent.

- Braze campaign setup is manual
- Tag and sign-up page setup are manual

## Known caveats

- Status values reflect this system's request path, not guaranteed downstream completion.
- If email sending is disabled by environment/config (`ENABLE_EMAIL_SERVICE`), status behaviour may still indicate request success from the app's perspective.
- Notification results are mislabelled (see https://github.com/guardian/newsletters-nx/issues/727)

## Post-launch Braze update requests

After launch, Braze-related fields can be updated and a separate Braze update
notification can be requested via `GET /api/email/:newsletterId/brazeUpdate`.
This is a distinct path from the initial launch notification set.
