Feature: All newsletters row interactions
  Each row in the All newsletters list is how an editor reaches that
  newsletter's detail page, by mouse or keyboard.

  Background:
    Given an editor's workspace uses the Stand design
    And a newsletter "Politics Weekly" with pillar "News" and category "article-based"
    When the editor opens the All Newsletters view

  Scenario: Editor opens a row by clicking
    When the editor clicks the "Politics Weekly" row
    Then the editor sees the detail page for "Politics Weekly"

  Scenario: Editor opens a row using the keyboard
    When the editor moves keyboard focus to the "Politics Weekly" row
    Then the "Politics Weekly" row shows a visible focus indicator
    When the editor presses "Enter"
    Then the editor sees the detail page for "Politics Weekly"

  Scenario: Editor does not see a row-level Edit action
    Then the "Politics Weekly" row shows no Edit action
