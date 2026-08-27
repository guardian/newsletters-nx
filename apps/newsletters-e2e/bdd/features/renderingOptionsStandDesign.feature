Feature: Stand design rendering options view and edit

  # Pilot BDD feature for the stand-design rendering options page.
  # Uses ?switch-stand=true to activate the stand design.
  # See: https://github.com/guardian/newsletters-nx/issues/744
  #
  # NOTE: No isVisible() conditional guards are used anywhere in the step
  # definitions.  The legacy renderingOptions.spec.ts wrapped contactEmail in
  # such a guard (lines 93-96), which silently masked the #740 save bug.
  # Steps here assert visibility then act — if a field is absent the test fails
  # loudly rather than silently skipping the assertion.

  Background:
    Given I am on the stand design rendering options page for the launched newsletter "playwright-article-test"

  Scenario: Core rendering option fields are visible in the stand design
    Then "Add the series tag" should be visible
    And "Display date?" should be visible
    And "Display standfirst?" should be visible
    And "Display image captions?" should be visible

  Scenario: Core rendering options persist after save and reload
    When I fill in "Add the series tag" with "tests/series/playwright-article-rendering"
    And I check "Display date?"
    And I check "Display standfirst?"
    And I check "Display image captions?"
    And I save the rendering options
    Then the rendering options are saved successfully
    When I reload the page
    Then "Add the series tag" should have the value "tests/series/playwright-article-rendering"
    And "Display date?" should be checked
    And "Display standfirst?" should be checked
    And "Display image captions?" should be checked

  # Explicit regression scenario for https://github.com/guardian/newsletters-nx/issues/740
  # The contactEmail field was silently skipped by an isVisible() guard in the
  # legacy spec, allowing a save bug to go undetected.  This scenario explicitly
  # asserts that the field is present (step 1), fills it in (step 2), saves,
  # reloads, and then asserts the value persisted (step 3).
  Scenario: Contact email is visible and persists after save and reload (regression #740)
    Then "Contact email" should be visible
    When I fill in "Contact email" with "playwright-test@guardian.co.uk"
    And I save the rendering options
    Then the rendering options are saved successfully
    When I reload the page
    Then "Contact email" should have the value "playwright-test@guardian.co.uk"
