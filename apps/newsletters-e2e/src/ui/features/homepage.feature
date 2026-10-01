Feature: Homepage draft and launched newsletter cards
	The Stand homepage shows an editor what they are working on and lets them
	jump straight to it: a card of draft newsletters and a card of launched
	newsletters. Rows, their ordering and the launched card's cap of 15 are
	covered by the All Newsletters features and unit tests.

	Background:
		Given an editor's workspace uses the Stand design

	Rule: Each kind of newsletter has its own card

		Scenario: Drafts and launched newsletters appear in their own cards
			Given a newsletter "Politics Weekly" with pillar "News" and category "article-based"
			And a launched newsletter "Fresh Launch" with status "live"
			When the editor opens the homepage
			Then the "Draft newsletters" card lists "Politics Weekly"
			And the "Launched newsletters" card lists "Fresh Launch"
			And the "Launched newsletters" card does not list "Politics Weekly"

		Scenario: Selecting a row opens that newsletter
			Given a launched newsletter "Fresh Launch" with status "live"
			When the editor opens the homepage
			And the editor clicks the "Fresh Launch" row
			Then the editor sees the detail page for "Fresh Launch"

	Rule: Actions in the card headers lead to the right place

		Scenario: Create new starts the create-newsletter wizard
			When the editor opens the homepage
			And the editor selects "Create new" in the "Draft newsletters" card
			Then the editor is taken to the create-newsletter wizard

		Scenario: Create new is hidden from editors who cannot edit newsletters
			Given the editor cannot edit newsletters
			When the editor opens the homepage
			Then the "Draft newsletters" card has no "Create new" action

		Scenario: View all opens the All Newsletters page
			When the editor opens the homepage
			And the editor selects "View all" in the "Launched newsletters" card
			Then the editor is taken to the All Newsletters page

	Rule: The cards adapt to the screen size

		Scenario: The cards sit side by side on a wide screen
			When the editor opens the homepage
			Then the "Draft newsletters" and "Launched newsletters" cards sit side by side

		Scenario: The cards stack on mobile
			Given the editor is using a mobile viewport
			When the editor opens the homepage
			Then the "Draft newsletters" and "Launched newsletters" cards are stacked
