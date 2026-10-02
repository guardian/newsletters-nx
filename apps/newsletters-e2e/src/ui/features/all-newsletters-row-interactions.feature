Feature: All newsletters row interactions
  Each row in the All newsletters list is how an editor reaches that
  newsletter's detail page, by clicking it or activating it with Enter
  while it holds keyboard focus.

  Background:
    Given an editor's workspace uses the Stand design
    And a newsletter "First Edition Click" with pillar "News" and category "article-based"
    And a newsletter "First Edition Press" with pillar "News" and category "article-based"
    And the editor opens the All Newsletters view

  Scenario: Editor opens a row by clicking
    When the editor clicks the "First Edition Click" row
    Then the editor sees the detail page for "First Edition Click"

  Scenario: Editor opens a row using the keyboard
    When the editor moves keyboard focus to the "First Edition Press" row
    Then the "First Edition Press" row shows a visible focus indicator
    When the editor presses "Enter"
    Then the editor sees the detail page for "First Edition Press"
