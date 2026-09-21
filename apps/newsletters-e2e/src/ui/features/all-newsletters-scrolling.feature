Feature: Scrolling the All Newsletters list
  The All Newsletters list can run well past a single screen. Editors scroll
  it as one page rather than a boxed-off pane, and the column headings stay
  in place while they do, so a row's date and status can still be read
  against the right heading no matter how far down the list they are.

  Scenario: Scrolling reveals later rows while the column headings stay pinned below the top bar
    Given an editor's workspace uses the Stand design
    And the All Newsletters list is longer than the screen
    When the editor opens the All Newsletters view
    Then the last newsletter is not yet in view
    When the editor scrolls down the All Newsletters list
    Then the last newsletter comes into view
    And the column headings have not moved
    And the column headings are still clear of the top bar
