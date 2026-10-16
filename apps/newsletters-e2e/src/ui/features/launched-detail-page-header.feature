Feature: Launched newsletter: page header
  As a newsletter editor
  I want to see straight away which newsletter I'm on and its status
  So that I don't change the wrong one and can get back to the list

  # Drafts get their own header feature (with the progress badge and Delete
  # draft), because their data comes from a different source.

  Background:
    Given an editor's workspace uses the Stand design

  Rule: The header identifies the newsletter

    Scenario: A launched newsletter shows its name, label and status
      Given a launched newsletter "Afternoon update" with status "pending"
      When the editor opens the detail page for "Afternoon update"
      Then the header shows the title "Afternoon update"
      And the header shows the label "News | Article based | Australia"
      And the header shows a "Pending" status badge

    Scenario: Details that are not set are left out of the label
      Given a launched newsletter "Afternoon update" with no region focus
      When the editor opens the detail page for "Afternoon update"
      Then the header shows the label "News | Article based"

  Rule: The header shows the newsletter's graphic

    Scenario: A newsletter with a graphic shows it
      Given a launched newsletter "Afternoon update" with a newsletter graphic
      When the editor opens the detail page for "Afternoon update"
      Then the header shows the newsletter graphic

    Scenario: A newsletter without a graphic shows a placeholder
      Given a launched newsletter "Afternoon update" with no newsletter graphic
      When the editor opens the detail page for "Afternoon update"
      Then the header shows "No image"

  Rule: The editor can get back to the list

    Scenario: Back to all newsletters opens the All Newsletters page
      Given a launched newsletter "Afternoon update" with status "live"
      When the editor opens the detail page for "Afternoon update"
      And the editor selects "Back to all newsletters"
      Then the editor is taken to the All Newsletters page

  Rule: The header adapts to the screen size

    Scenario: The header stacks on a small screen
      Given the editor is using a small viewport
      When the editor opens the detail page for a launched newsletter
      Then the header shows the title above the graphic

    Scenario: The graphic is hidden on mobile
      Given the editor is using a mobile viewport
      When the editor opens the detail page for a launched newsletter
      Then the header does not show the newsletter graphic
