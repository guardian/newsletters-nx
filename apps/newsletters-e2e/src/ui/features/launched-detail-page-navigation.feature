Feature: Launched newsletter: find my way around the page
  As a newsletter editor
  I want to go straight to the part of a newsletter I need
  So that I don't have to scroll through a long page to find it

  Background:
    Given an editor's workspace uses the Stand design
    And a launched newsletter "Afternoon update"

  Rule: The Details tab lists every panel in a fixed order

    Scenario: The Details tab shows the panels in order
      When the editor opens the detail page for "Afternoon update"
      Then these panels are shown in this order:
        | panel                   |
        | Attributes              |
        | Launch                  |
        | Sign-up copy and images |
        | Tags and campaigns      |
        | Links                   |
        | Integrations            |
        | Technical output        |

  Rule: Tabs separate a newsletter's details from its layout

    Scenario: The page opens on the Details tab
      When the editor opens the detail page for "Afternoon update"
      Then the "Details" tab is selected

    # Temporary until the Layout tab is built. It keeps the existing
    # preview reachable.
    Scenario: The Layout tab opens the existing preview
      When the editor opens the detail page for "Afternoon update"
      And the editor selects the "Layout" tab
      Then the existing preview for "Afternoon update" is shown

  Rule: Jump to takes the editor straight to a panel

    Scenario: Jump to links to every panel
      When the editor opens the detail page for "Afternoon update"
      Then "Jump to" links to these panels:
        | panel                   |
        | Attributes              |
        | Launch                  |
        | Sign-up copy and images |
        | Tags and campaigns      |
        | Links                   |
        | Integrations            |
        | Technical output        |

    Scenario: Choosing a panel in Jump to scrolls to it
      When the editor opens the detail page for "Afternoon update"
      And the editor jumps to "Integrations"
      Then the "Integrations" panel is in view

    Scenario: A link to a panel opens the page at that panel
      When the editor follows a link to the "Integrations" panel of "Afternoon update"
      Then the "Integrations" panel is in view
