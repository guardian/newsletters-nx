Feature: All newsletters table rows
  Each row in the All newsletters table shows enough information to scan at
  a glance, and can be opened by mouse or keyboard.

  Background:
    Given an editor's workspace uses the Stand design

  Scenario: Editor sees the core row information
    When the editor opens the All Newsletters view
    Then the "Playwright Launched Seed" row shows its pillar and category label, and status badge
    And the "Playwright Launched Seed" row shows its thumbnail with meaningful alt text

  Scenario: Editor sees a fallback image when a newsletter has no thumbnail
    Given an existing draft newsletter
    When the editor opens the All Newsletters view
    Then that draft's row shows a fallback image with meaningful alt text

  Scenario: Editor opens a newsletter row by clicking it
    When the editor opens the All Newsletters view
    And the editor clicks the "Playwright Launched Seed" row
    Then the editor sees the detail page for "Playwright Launched Seed"

  Scenario: Editor opens a newsletter row by pressing Enter
    When the editor opens the All Newsletters view
    And the editor focuses the "Playwright Launched Seed" row and presses Enter
    Then the editor sees the detail page for "Playwright Launched Seed"
