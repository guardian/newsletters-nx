Feature: Homepage draft and launched newsletter cards
  The homepage shows an editor what they are working on and lets them jump
  straight to it: a card of draft newsletters and a card of launched
  newsletters, each listing the most recently updated rows.

  Rule: The Stand homepage shows a card for each kind of newsletter

    Background:
      Given an editor's workspace uses the Stand design

    Scenario: Drafts and launched newsletters appear in their own cards
      Given a newsletter "Politics Weekly" with pillar "News" and category "article-based"
      And a launched newsletter "Fresh Launch" with status "live"
      When the editor opens the homepage
      Then the "Draft newsletters" card lists "Politics Weekly"
      And the "Draft newsletters" card does not list "Fresh Launch"
      And the "Launched newsletters" card lists "Fresh Launch"
      And the "Launched newsletters" card does not list "Politics Weekly"

    Scenario: Rows look the same as on the All Newsletters view
      Given a newsletter "Politics Weekly" with pillar "News" and category "article-based"
      When the editor opens the homepage
      Then the "Politics Weekly" row shows the title "Politics Weekly"
      And the "Politics Weekly" row shows the label "News | Article based"
      And the "Politics Weekly" row shows a last updated date

    Scenario: Selecting a row opens that newsletter
      Given a launched newsletter "Fresh Launch" with status "live"
      When the editor opens the homepage
      And the editor selects the "Fresh Launch" row
      Then the editor is taken to the "Fresh Launch" newsletter

  Rule: Cards list the most recently updated newsletters first

    # The Launched card is capped at 15; the Draft card is deliberately not.

    Background:
      Given an editor's workspace uses the Stand design

    Scenario: The Draft card lists every draft, most recently updated first
      Given 16 draft newsletters named "Cap Draft" with a number suffix, oldest first
      When the editor opens the homepage
      Then the "Draft newsletters" card lists "Cap Draft 16" first
      And the "Draft newsletters" card lists "Cap Draft 1"

    Scenario: The Launched card is capped at 15, most recently updated first
      Given 16 launched newsletters named "Cap Launch" with a number suffix, oldest first
      When the editor opens the homepage
      Then the "Launched newsletters" card lists 15 rows
      And the "Launched newsletters" card lists "Cap Launch 16" first
      And the "Launched newsletters" card does not list "Cap Launch 1"

  Rule: Actions in the card headers lead to the right place

    Background:
      Given an editor's workspace uses the Stand design

    Scenario: Create new starts the create-newsletter wizard
      When the editor opens the homepage
      And the editor selects "Create new" in the "Draft newsletters" card
      Then the editor is taken to the create-newsletter wizard

    Scenario: Create new is hidden without the 'edit everything' permission
      Given the user does not have the 'edit everything' permission to see the homepage action
      When the editor opens the homepage
      Then the "Draft newsletters" card has no "Create new" action

    Scenario: View all opens the All Newsletters page
      When the editor opens the homepage
      And the editor selects "View all" in the "Launched newsletters" card
      Then the editor is taken to the All Newsletters page

  Rule: The cards adapt to the screen size

    Background:
      Given an editor's workspace uses the Stand design

    Scenario: The cards sit side by side on a wide screen
      When the editor opens the homepage
      Then the "Draft newsletters" and "Launched newsletters" cards sit side by side

    Scenario: The cards stack on mobile
      Given the editor is using a mobile viewport
      When the editor opens the homepage
      Then the "Draft newsletters" and "Launched newsletters" cards are stacked

  Rule: The Legacy homepage is unchanged

    Scenario: The Legacy design keeps the button grid
      Given an editor's workspace uses the Legacy design
      When the editor opens the homepage
      Then the editor sees the Legacy homepage button grid
      And the homepage has no "Draft newsletters" card
