Feature: Newsletter workspace design preference
  Editors can choose to work in either the Legacy design or the Stand
  design. Once chosen, the design applies consistently to both the
  newsletter creation wizard and the rest of the workspace, until the
  editor switches it again.

  Background:
    Given a draft newsletter exists

  Scenario: Editor Erin's newsletter creation step reflects her chosen Stand design
    Given Editor Erin's workspace uses the Legacy design
    When Editor Erin opens the newsletter creation step using the Stand design
    Then Editor Erin sees the newsletter creation step in the Stand design

  Scenario: Editor Erin's newsletter creation step uses the Legacy design by default
    Given Editor Erin's workspace uses the Legacy design
    When Editor Erin opens the newsletter creation step
    Then Editor Erin sees the newsletter creation step in the Legacy design

  Scenario: Editor Erin's Stand design choice follows her to the drafts overview
    Given Editor Erin's workspace uses the Stand design
    When Editor Erin opens the drafts overview
    Then Editor Erin sees the drafts overview in the Stand design
