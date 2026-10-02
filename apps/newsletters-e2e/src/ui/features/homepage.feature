Feature: Homepage draft and launched newsletter sections
	The Stand homepage shows an editor a section of draft newsletters and a
	section of launched newsletters.

	Background:
		Given an editor's workspace uses the Stand design

	Rule: Drafts appear in the draft section

		Scenario: Drafts appear in the draft section, not the launched section
			Given a newsletter "Politics Weekly" with pillar "News" and category "article-based"
			When the editor opens the homepage
			Then the "Draft newsletters" section lists "Politics Weekly"
			And the "Launched newsletters" section does not list "Politics Weekly"

	Rule: Create new leads to the wizard for permitted editors

		Scenario: Create new starts the create-newsletter wizard
			When the editor opens the homepage
			And the editor selects "Create new" in the "Draft newsletters" section
			Then the editor is taken to the create-newsletter wizard

		Scenario: Create new is hidden from editors who cannot edit newsletters
			Given the editor cannot edit newsletters
			When the editor opens the homepage
			Then the "Draft newsletters" section has no "Create new" action

	Rule: A failed data source shows an error without hiding the other section

		Scenario: Drafts still appear when the launched newsletters fail to load
			Given a newsletter "Politics Weekly" with pillar "News" and category "article-based"
			And the launched newsletters source fails to load
			When the editor opens the homepage
			Then the homepage shows an error that launched newsletters could not load
			And the "Draft newsletters" section lists "Politics Weekly"

		Scenario: Drafts failing to load shows an error on the homepage
			Given the draft newsletters source fails to load
			When the editor opens the homepage
			Then the homepage shows an error that draft newsletters could not load

	Rule: The sections adapt to the screen size

		Scenario: The sections sit side by side on a wide screen
			When the editor opens the homepage
			Then the "Draft newsletters" and "Launched newsletters" sections sit side by side

		Scenario: The sections stack on mobile
			Given the editor is using a mobile viewport
			When the editor opens the homepage
			Then the "Draft newsletters" and "Launched newsletters" sections are stacked
