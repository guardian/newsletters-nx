Feature: Stand main navigation
  The Stand design's main navigation lists the areas of the workspace an
  editor can move between. All Newsletters is the entry point for browsing
  every newsletter regardless of its state, so it appears first.

  Scenario: All Newsletters is the first item in the Stand main navigation
    Given an editor's workspace uses the Stand design
    When the editor opens the drafts overview
    Then the Stand main navigation lists All Newsletters before Launched newsletters

  Scenario: All Newsletters links to the All Newsletters view
    Given an editor's workspace uses the Stand design
    When the editor opens the drafts overview
    And the editor selects All Newsletters from the Stand main navigation
    Then the All Newsletters view is displayed inside the Stand shell
