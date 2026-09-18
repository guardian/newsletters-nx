Feature: All Newsletters in the Stand page shell
  Newsletters that have launched and newsletters still in draft are kept in
  two separate views. Editors working in the Stand design get a single All
  Newsletters view covering both, at its own route inside the Stand shell.
  It is part of the Stand design, so an editor on the Legacy design who
  navigates to it directly sees a message pointing them to the Stand design,
  rather than the view itself.

  Scenario: The All Newsletters view has its own route in the Stand shell
    Given an editor's workspace uses the Stand design
    When the editor opens the All Newsletters view
    Then the All Newsletters view is displayed inside the Stand shell

  Scenario: The All Newsletters view covers both launched and draft newsletters
    Given an existing draft newsletter
    And an editor's workspace uses the Stand design
    When the editor opens the All Newsletters view
    Then the All Newsletters view accounts for every newsletter from both

  Scenario: The Legacy design sees a message instead of the All Newsletters view
    Given an editor's workspace uses the Legacy design
    When the editor opens the All Newsletters view
    Then the editor sees a message to enable the Stand design
    And the launched newsletters overview still lists the launched newsletters
    And the drafts overview still lists the draft newsletters

  Scenario: The Legacy navigation is unchanged
    Given an editor's workspace uses the Legacy design
    When the editor opens the drafts overview
    Then the Legacy navigation keeps its Launched and Drafts entries
    And the Legacy navigation does not offer All Newsletters
