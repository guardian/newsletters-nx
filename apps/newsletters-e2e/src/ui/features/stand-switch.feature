Feature: Show the correct UI shell for the switch-stand flag

  Background:
    Given a draft newsletter exists

  Scenario: The Stand wizard shell renders once the switch is turned on
    Given the switch-stand flag is off
    When an editor turns the switch-stand flag on and opens the newsletter data step
    Then the Stand wizard shell is displayed

  Scenario: The MUI wizard shell renders by default
    Given the switch-stand flag is off
    When an editor opens the newsletter data step
    Then the MUI wizard shell is displayed

  Scenario: The switch-stand flag persists onto a non-wizard page
    Given the switch-stand flag is on
    When an editor opens the all-drafts page
    Then the Stand navigation is displayed
