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

  Rule: The Details tab lists every panel in a fixed order

    Scenario: The Details tab shows the panels in order
      Given a launched newsletter "Afternoon update"
      When the editor opens the detail page for "Afternoon update"
      Then these panels are shown in this order:
        | panel                   |
        | Attributes              |
        | Launch                  |
        | Sign-up copy and images |
        | Sign-up page and tags   |
        | Links                   |
        | Integrations            |
        | Technical output        |

  Rule: Jump to takes the editor straight to a panel

    Scenario: Jump to links to every panel
      Given a launched newsletter "Afternoon update"
      When the editor opens the detail page for "Afternoon update"
      Then "Jump to" links to these panels:
        | panel                   |
        | Attributes              |
        | Launch                  |
        | Sign-up copy and images |
        | Sign-up page and tags   |
        | Links                   |
        | Integrations            |
        | Technical output        |

    Scenario: Choosing a panel in Jump to scrolls to it
      Given a launched newsletter "Afternoon update"
      When the editor opens the detail page for "Afternoon update"
      And the editor jumps to "Integrations"
      Then the "Integrations" panel is in view

    Scenario: A link to a panel opens the page at that panel
      Given a launched newsletter "Afternoon update"
      When the editor follows a link to the "Integrations" panel of "Afternoon update"
      Then the "Integrations" panel is in view

  # How editing works on every panel. The other feature files say which fields
  # can change and how they are checked. These use "Sign-up copy and images"
  # as the example panel.

  @edit
  Rule: Only editors with permission can edit

    Scenario Outline: Editors see Edit on each editable panel
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor opens the detail page for "Afternoon update"
      Then the "<panel>" panel has an "Edit" action

      # title-format: <panel> can be edited
      Examples:
        | panel                   |
        | Attributes              |
        | Sign-up copy and images |
        | Sign-up page and tags   |
        | Links                   |
        | Integrations            |

    Scenario: Editors without permission can't edit
      Given a launched newsletter "Afternoon update"
      And the editor can only view newsletters
      When the editor opens the detail page for "Afternoon update"
      Then no panel has an "Edit" action

  @edit
  Rule: Editing turns a panel into a form

    Scenario: Starting to edit shows the current values in inputs
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor starts editing the "Sign-up copy and images" panel
      Then the "Sign-up copy and images" panel is marked "Editing"
      And its fields show their current values in inputs
      And the panel offers "Cancel" and "Save changes"

  @edit
  Rule: Cancelling discards changes

    Scenario: Cancelled changes are not kept
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor changes "Success message" in the "Sign-up copy and images" panel and cancels
      Then the "Sign-up copy and images" panel shows the original "Success message"

  @edit
  Rule: Saved changes are kept

    Scenario: A saved change is still there after reloading
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor changes "Success message" to "See you this afternoon" in the "Sign-up copy and images" panel
      And the editor reloads the page
      Then the "Sign-up copy and images" panel shows "Success message" as "See you this afternoon"

  @edit
  Rule: A failed save doesn't lose the editor's work

    Scenario: The panel stays in edit mode when saving fails
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      And saving newsletters will fail
      When the editor changes "Success message" to "See you this afternoon" in the "Sign-up copy and images" panel
      Then the editor sees that the changes weren't saved
      And the "Sign-up copy and images" panel is still in edit mode with "See you this afternoon"

  Rule: Links to a launched newsletter open the new page

    # Nothing links to the new page until switch-over, once the Details tab is
    # complete.

    Scenario: Selecting a newsletter in the list opens its page
      Given a launched newsletter "Afternoon update"
      When the editor selects "Afternoon update" in the All Newsletters view
      Then the detail page for "Afternoon update" is shown

    Scenario: An old launched newsletter link opens the new page
      Given a launched newsletter "Afternoon update" with identity name "afternoon-update"
      When the editor goes to "/launched/afternoon-update"
      Then the detail page for "Afternoon update" is shown

  Rule: Editors on the Legacy design keep the current page

    Scenario: A Legacy editor still sees the current page
      Given the editor has switched their workspace to the Legacy design
      And a launched newsletter "Afternoon update" with identity name "afternoon-update"
      When the editor goes to "/launched/afternoon-update"
      Then the current newsletter page for "Afternoon update" is shown
