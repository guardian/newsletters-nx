Feature: Launched newsletter: open it and find my way around
  As a newsletter editor
  I want to open a launched newsletter, see which one I'm on and get to the part I need
  So that I don't change the wrong one or scroll through a long page

  # Drafts get their own feature files later, because their data comes from a
  # different source.

  Background:
    Given an editor's workspace uses the Stand design

  Rule: A launched newsletter opens on its own page

    Scenario: A newsletter's page can be opened from its address
      Given a launched newsletter "Afternoon update" with identity name "afternoon-update"
      When the editor goes to "/newsletters/afternoon-update"
      Then the detail page for "Afternoon update" is shown
      And the "Details" tab is selected

    Scenario: An address for a newsletter that doesn't exist shows an error
      When the editor goes to "/newsletters/no-such-newsletter"
      Then the editor sees the not found page

  Rule: The header identifies the newsletter

    Scenario: A launched newsletter shows its name, label and status
      Given a launched newsletter "Afternoon update" with status "pending" and region focus "AU"
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

  Rule: Tabs separate a newsletter's details from its layout

    Scenario: The page opens on the Details tab
      Given a launched newsletter "Afternoon update"
      When the editor opens the detail page for "Afternoon update"
      Then the "Details" tab is selected

    # Temporary until the Layout tab is built. It keeps the existing preview
    # reachable.
    Scenario: The Layout tab opens the existing preview
      Given a launched newsletter "Afternoon update"
      When the editor opens the detail page for "Afternoon update"
      And the editor selects the "Layout" tab
      Then the existing preview for "Afternoon update" is shown

  Rule: The header adapts to the screen size

    Scenario: The header stacks on a small screen
      Given the editor is using a small viewport
      When the editor opens the detail page for a launched newsletter
      Then the header shows the title above the graphic

    Scenario: The graphic is hidden on mobile
      Given the editor is using a mobile viewport
      When the editor opens the detail page for a launched newsletter
      Then the header does not show the newsletter graphic
