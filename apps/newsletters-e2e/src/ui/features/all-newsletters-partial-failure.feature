Feature: All newsletters list survives a partial data-source failure
  The All Newsletters view merges launched newsletters and drafts from two
  separate sources. If one source fails to load, an editor should still see
  the rows from whichever source succeeded, with a non-blocking error naming
  the source that failed, rather than losing the whole list.

  Background:
    Given an editor's workspace uses the Stand design

  Scenario: Editor still sees draft newsletters when the launched newsletters fail to load
    Given a newsletter "Politics Weekly" with pillar "News" and category "article-based"
    And the launched newsletters source fails to load
    When the editor opens the All Newsletters view
    Then the "Politics Weekly" row shows the title "Politics Weekly"
    And a non-blocking error says launched newsletters failed to load

  Scenario: Editor still sees launched newsletters when the draft newsletters fail to load
    Given a launched newsletter "Fresh Launch" with status "live"
    And the draft newsletters source fails to load
    When the editor opens the All Newsletters view
    Then the "Fresh Launch" row shows the title "Fresh Launch"
    And a non-blocking error says draft newsletters failed to load
