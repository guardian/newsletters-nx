# Data model

How newsletter data is shaped, stored, and transformed in `newsletters-nx`.

## Source of truth

Newsletter data is defined by Zod schemas in:

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

| Type | Schema | Typical identifier | Storage area |
| --- | --- | --- | --- |
| Draft | draft schema (partial) | `listId` | `draft-storage/` |
| Launched | newsletter schema (complete) | `identityName` (+ list linkage) | `launched-newsletters/` |

## Storage model

Storage is abstracted behind interfaces in `newsletters-data-client`, with environment-dependent implementations:

- **In-memory storage** for local/dev workflows
- **S3-backed storage** for integrated/stage workflows

Selection is made at app startup by configuration (for example `USE_IN_MEMORY_STORAGE` and related env setup).

## Key services

Core service responsibilities are split between draft and launch concerns:

- **Draft service**
    - create/update/read draft data
    - supports wizard progression and partial saves

- **Launch service**
    - validates/assembles launchable data
    - persists launched newsletter records
    - coordinates post-launch side effects (notification handoffs)

## Derived and computed values

Some fields are generated from base newsletter inputs (for example naming/identity variants used by downstream systems).  
These are deterministic defaults, and editable where workflow allows.

There is also a set of **computed display/runtime values** used for UI and notification contexts; these are generated when needed rather than treated as user-authored source fields.

## Compatibility / downstream consumers

A legacy-compatible transformation exists for older consumers (v1-style shape).
There are currently no known active downstream consumers, so this path is a
candidate for removal once ownership confirms no external dependency remains.

## What to update when changing the model

When changing newsletter fields:

1. Update the relevant Zod schema(s)
2. Update workflow validation/step layouts if user-editable
3. Update derived/computed generators if naming logic changes
4. Update storage readers/writers if persisted shape changes
5. Update docs:
    - this file (`docs/data-model.md`)
    - any impacted workflow docs (e.g. launch flow)
