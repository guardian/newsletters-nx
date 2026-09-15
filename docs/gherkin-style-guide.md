# Corporate Gherkin Style Guide: Modern Playwright-BDD Architecture

Applies to `.feature` files in `apps/newsletters-e2e`, compiled by
[playwright-bdd](https://github.com/vitalets/playwright-bdd) into native
Playwright specs. Further reading on the standards behind each rule is linked
inline; start with [BDD 101](https://automationpanda.com/bdd/) and the
[Gherkin reference](https://cucumber.io/docs/gherkin/reference/) if you're new
to this.

---

## 1. Isolation, not sequence

Unlike legacy Cucumber/Selenium runners, `playwright-bdd` shards scenarios
across parallel, asynchronous workers — there is no shared browser session to
lean on. Every scenario must set up its own state and stand on its own.

* **Don't** rely on a newsletter created by a previous scenario still existing.
* **Do** create the draft you need via the API helpers in
  `helpers/draft-newsletter.ts` (`createDraftNewsletter`,
  `updateDraftNewsletter`) inside the scenario's own `Given`.

---

## 2. Declarative over imperative

Capture *what* the system does, not *how* the UI is driven. Push clicks,
field-filling and URL navigation down into step definitions/fixtures. See
[Cucumber's guidance on BDD](https://cucumber.io/docs/bdd/) for the underlying
rationale.

### ❌ BAD — imperative, brittle
```gherkin
Scenario: Launching a newsletter
  Given I navigate to "/drafts/newsletter-data?switch-stand=true"
  And I fill in "name" with "Weekend Reading"
  And I click "Save and continue"
  ...
  When I click "Request Launch"
  Then I should see "launched"
```
*Why it fails:* every wizard-copy tweak (button labels have already changed
from `Next`/`Request Launch` once, in the Stand redesign) breaks this file,
even though "a draft can be launched" hasn't changed.

### ✅ GOOD — declarative, fixture-driven
```gherkin
Scenario: Launching a newsletter that is ready
  Given a draft newsletter with all required data and rendering options
  When the admin submits the launch request
  Then the newsletter's status becomes launched
```
The fixture behind `Given` seeds the draft through the API helpers, bypassing
the wizard UI entirely.

---

## 3. One scenario, one behaviour

The [Cardinal Rule of BDD](https://automationpanda.com/bdd/): *one scenario,
one behaviour*. No "super-scenarios" stacking multiple `When`/`Then` pairs.

* Keep scenarios to **3–5 steps**; treat 8 as a hard ceiling.
* **Given** = past state, **When** = the action, **Then** = the assertion.

### ❌ BAD — multi-behaviour monolith
```gherkin
Scenario: Editing rendering options
  Given a draft with default rendering options
  When the admin sets the contact email
  Then the contact email is saved
  When the admin sets the series tag
  Then the series tag is saved
```

### ✅ GOOD — singular focus
```gherkin
Scenario: Contact email is saved after a reload
  Given a draft with default rendering options
  When the admin sets the contact email and reloads the page
  Then the saved contact email is shown
```
(This is the exact shape of bug #740 — a field-type-sensitive save failure
that only showed up on reload. Narrow scenarios like this are what catch it;
a monolith re-asserting three fields at once is what missed it.)

---

## 4. Background must be universal

Because scenarios run out of order across workers, nothing may depend on data
another scenario created.

* `Background` steps must apply to **every** scenario in the file — drop it
  rather than force a fit.

### ❌ BAD — leaking state
```gherkin
Feature: Newsletter drafts

Scenario: Create a draft
  When the admin creates a newsletter "Weekend Reading"
  Then it appears in the drafts list

Scenario: Launch the draft
  When the admin launches "Weekend Reading"
  Then its status becomes launched
```
This only passes today because CI forces `workers: 1`; it fails the moment
scenarios run out of order or on different workers.

### ✅ GOOD — atomic via fixtures
```gherkin
Feature: Newsletter drafts

Background:
  Given the newsletters API is available

Scenario: Launch a ready draft
  Given a draft newsletter with all required data and rendering options
  When the admin submits the launch request
  Then the newsletter's status becomes launched
```

---

## 5. Playwright-BDD specifics

### Scenario Outline titles
Row-index titles (`Example #1`) break test-history tracking when rows are
reordered. Always pin titles with
[`# title-format:`](https://vitalets.github.io/playwright-bdd/#/writing-features/customize-examples-title):

```gherkin
Scenario Outline: Launch readiness depends on newsletter category
  Given a draft newsletter with category "<category>"
  When the admin checks launch readiness
  Then rendering options are "<required>"

  # title-format: <category> newsletters require rendering options: <required>
  Examples:
    | category      | required |
    | article-based | yes      |
    | fronts-based  | no       |
```

### Native tags
Use playwright-bdd's built-in
[special tags](https://vitalets.github.io/playwright-bdd/#/writing-features/special-tags)
instead of custom skip/config step logic: `@skip`/`@fixme`, `@only`, `@slow`,
`@retries:N`.

```gherkin
@slow @retries:3
Scenario: Completing the full Stand creation wizard
  Given the admin starts a new newsletter in the Stand wizard
  When the admin completes every step through to review
  Then the draft is saved with all submitted data
```

---

## Further reading
* [Cucumber: What is BDD?](https://cucumber.io/docs/bdd/)
* [Gherkin reference](https://cucumber.io/docs/gherkin/reference/)
* [Automation Panda: BDD 101](https://automationpanda.com/bdd/)
* [playwright-bdd documentation](https://vitalets.github.io/playwright-bdd/)
