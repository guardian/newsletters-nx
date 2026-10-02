Feature: Homepage draft and launched newsletter sections
	The Stand homepage shows an editor a section of draft newsletters and a
	section of launched newsletters.

	Background:
		Given an editor's workspace uses the Stand design

	Rule: The sections adapt to the screen size

		Scenario: The sections sit side by side on a wide screen
			When the editor opens the homepage
			Then the "Draft newsletters" and "Launched newsletters" sections sit side by side

		Scenario: The sections stack on mobile
			Given the editor is using a mobile viewport
			When the editor opens the homepage
			Then the "Draft newsletters" and "Launched newsletters" sections are stacked
