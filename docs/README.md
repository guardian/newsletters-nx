# Newsletters documentation

Documentation for `newsletters-nx`, the monorepo behind the Guardian's editorial newsletters tool.

Start with [Architecture](./architecture.md) for the system diagram and the monorepo map, then follow whichever subsystem you need.

| Document                                          | What it covers                                                                                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Architecture](./architecture.md)                 | System diagram, how the repo relates to email-rendering and the wider newsletter ecosystem, the monorepo map, and the full list of external services |
| [Data model](./data-model.md)                     | Zod schemas as the source of truth, drafts vs launched newsletters, in-memory vs S3 storage, derived fields                                          |
| [State machine](./state-machine.md)               | Wizards, steps, `WizardStepLayout`, validation, and the `currentStep` route                                                                          |
| [Launch flow](./launch-flow.md)                   | What `executeLaunch` does, the notification emails, and what `REQUESTED` actually means                                                              |
| [Auth and permissions](./auth-and-permissions.md) | Google auth via the ALB, `UserAccessLevel` / `UserPermissions`, per-stage SSM parameters and the 15-minute cache                                     |
| [Deployment](./deployment.md)                     | CDK, RiffRaff, CODE vs PROD, and the CI workflows                                                                                                    |

Every claim in these documents is cited against the code. Where the code does something surprising, the documentation describes what the code _does_, not what it looks like it does — see the [known defect in the launch flow](./launch-flow.md#known-defect-the-statuses-are-attributed-to-the-wrong-emails) for the clearest example.

## Conventions for this folder

- The first line of every file is its title, as a heading
- Mermaid goes inline in fenced blocks and is checked in — no external image services, so diagrams stay reviewable in pull requests. Use `<br>` for line breaks, not the deprecated `\n`
- Diagram first, prose after
- Cite the code behind each claim. Document what the code does, not what it is assumed to do — and when those differ, say so and link the ticket
- Any images go in an `images/` subfolder alongside the document
