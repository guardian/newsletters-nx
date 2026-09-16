Feature: All Newsletters in the Stand page shell
  Newsletters that have launched and newsletters still in draft are kept in
  two separate views. Editors working in the Stand design get a single All
  Newsletters view covering both, at its own route inside the Stand shell.
  It is part of the Stand design, so editors still on the Legacy design see
  the workspace exactly as they do today.

  Scenario: The All Newsletters view has its own route in the Stand shell
    Given an editor's workspace uses the Stand design
    When the editor opens the All Newsletters view
    Then the All Newsletters view is displayed inside the Stand shell

  Scenario: The All Newsletters view covers both launched and draft newsletters
    Given an existing draft newsletter
    And an editor's workspace uses the Stand design
    When the editor opens the All Newsletters view
    Then the launched and the draft newsletters are loaded at the same time
    And the All Newsletters view accounts for every newsletter from both

  Scenario: The Legacy design has no All Newsletters view
    Given an editor's workspace uses the Legacy design
    When the editor opens the All Newsletters view
    Then the All Newsletters view is not available
    And the launched newsletters overview still lists the launched newsletters
    And the drafts overview still lists the draft newsletters

  Scenario: The Legacy navigation is unchanged
    Given an editor's workspace uses the Legacy design
    When the editor opens the drafts overview
    Then the Legacy navigation keeps its Launched and Drafts entries
    And the Legacy navigation does not offer All Newsletters
