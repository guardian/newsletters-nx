Feature: All newsletters table rows
  Each row in the All newsletters table shows enough information to scan at
  a glance.

  # #768's "Rows are operable" rule (click/Enter/Space navigation, visible
  # focus state, no row-level Edit action) is deferred to a follow-up and
  # isn't covered by this feature yet.

  Background:
    Given an editor's workspace uses the Stand design

  Rule: Rows are recognisable at a glance

    Scenario: Editor sees the core row information
      When the editor opens the All Newsletters view
      Then the "Playwright Launched Seed" row shows its title, pillar and category label, last updated date, and status badge
      And the "Playwright Launched Seed" row shows its thumbnail with meaningful alt text

    Scenario: Editor sees the supported category labels
      Given newsletters exist with these pillar and category values:
        | newsletter        | pillar  | category      |
        | Politics Weekly   | News    | article-based |
        | Morning Briefing  | News    | fronts-based  |
        | Culture Manual    | Culture | manual-send   |
        | Editor Picks      | News    | other         |
      When the editor opens the All Newsletters view
      Then rows show these pillar/category labels:
        | newsletter        | expected label          |
        | Politics Weekly   | News \| Article based   |
        | Morning Briefing  | News \| Fronts based    |
        | Culture Manual    | Culture \| Manual send  |
        | Editor Picks      | News \| Other           |

    Scenario: Editor sees a status badge on each row
      Given an existing draft newsletter
      When the editor opens the All Newsletters view
      Then the "Playwright Launched Seed" row shows a visible status badge
      And that draft's row shows a visible status badge

    Scenario: Editor sees a fallback image when a newsletter has no thumbnail
      Given an existing draft newsletter
      When the editor opens the All Newsletters view
      Then that draft's row shows a fallback image with meaningful alt text

  Rule: The list remains usable under different conditions

    Scenario: Editor sees key row information on mobile
      Given the editor is using a mobile viewport
      When the editor opens the All Newsletters view
      Then the "Playwright Launched Seed" row shows its title, pillar and category label, last updated date, and status badge
      And the "Playwright Launched Seed" row shows its last updated date below its pillar and category label
