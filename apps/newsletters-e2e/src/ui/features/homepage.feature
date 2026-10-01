Feature: Homepage draft and launched newsletter cards
	The Stand homepage shows an editor a card of draft newsletters and a card
	of launched newsletters.

	Background:
		Given an editor's workspace uses the Stand design

	Rule: The cards adapt to the screen size

		Scenario: The cards sit side by side on a wide screen
			When the editor opens the homepage
			Then the "Draft newsletters" and "Launched newsletters" cards sit side by side

		Scenario: The cards stack on mobile
			Given the editor is using a mobile viewport
			When the editor opens the homepage
			Then the "Draft newsletters" and "Launched newsletters" cards are stacked
