# Data model

How newsletter data is shaped, stored, and transformed in `newsletters-nx`.

## Source of truth

Newsletter data is defined by [Zod](https://zod.dev/) schemas in:

- `libs/newsletters-data-client/src/lib/schemas/`

TypeScript types are inferred from schemas (`z.infer`), so runtime validation and compile-time types stay aligned.

## Drafts vs launched newsletters

The model uses two closely related shapes:

- **Draft newsletter**
    - partial/in-progress data
    - can be saved mid-wizard
    - stored under draft storage paths

- **Launched newsletter**
    - validated complete data
    - includes launch-time identity fields
    - stored under launched storage paths

| Type     | Schema                       | Typical identifier              | Storage area            |
| -------- | ---------------------------- | ------------------------------- | ----------------------- |
| Draft    | draft schema (partial)       | `listId`                        | `draft-storage/`        |
| Launched | newsletter schema (complete) | `identityName` (+ list linkage) | `launched-newsletters/` |

## Storage model

Storage is abstracted behind interfaces in `newsletters-data-client`, with **S3-backed storage** as the standard model for persisted newsletter data.

For local/dev workflows, there is also an **in-memory storage** implementation selected at app startup by configuration (for example `USE_IN_MEMORY_STORAGE` and related env setup).

## Key services

Core service responsibilities are split between draft and launch concerns:

- **Draft service**
    - create/update/read draft data
    - supports wizard progression and partial saves

- **Launch service**
    - validates/assembles launchable data
    - persists launched newsletter records
    - sends the newsletter-launched, Braze set-up request, and central production tags/signup page request notification emails

## Compatibility / downstream consumers

A legacy-compatible transformation exists for older consumers (v1-style shape),
served at `/api/legacy/newsletters`. **It is deprecated — do not use it.**

The `listIdV1` field on the current (v2) newsletter data is a separate thing and
is still used by downstream systems — it is not part of this deprecation.

## What to update when changing the model

_TypeScript clients of `newsletters-api` do **not** import types from this repo.
They use [`@guardian/newsletter-types`](https://github.com/guardian/csnx/tree/main/libs/%40guardian/newsletter-types)_

When changing newsletter fields:

1. Update the relevant Zod schema(s)
2. If API response shape changes, raise a matching PR in `guardian/csnx` to update `@guardian/newsletter-types`
3. Update workflow validation/step layouts if user-editable
4. Update derived/computed generators if naming logic changes
5. Update storage readers/writers if persisted shape changes
6. Update docs:
    - this file (`docs/data-model.md`)
    - any impacted workflow docs (e.g. launch flow)
