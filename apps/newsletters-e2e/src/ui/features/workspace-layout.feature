Feature: Newsletter workspace design preference
  Editors can choose to work in either the Legacy design or the Stand
  design. Once chosen, the design applies consistently to both the
  newsletter creation wizard and the rest of the workspace, until the
  editor switches it again.

  Background:
    Given an existing draft newsletter

  Scenario: The newsletter creation step reflects a chosen Stand design
    Given an editor's workspace uses the Legacy design
    When the editor opens the newsletter creation step using the Stand design
    Then the newsletter creation step is displayed in the Stand design

  Scenario: The newsletter creation step uses the Legacy design by default
    Given an editor's workspace uses the Legacy design
    When the editor opens the newsletter creation step
    Then the newsletter creation step is displayed in the Legacy design

  Scenario: A chosen Stand design follows the editor to the drafts overview
    Given an editor's workspace uses the Stand design
    When the editor opens the drafts overview
    Then the drafts overview is displayed in the Stand design
