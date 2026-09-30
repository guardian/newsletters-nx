Feature: All newsletters filters
	As an editor
	I want to filter newsletters by key attributes
	So that I can narrow the list to relevant rows

	Background:
		Given the editor is using the Stand workspace
		And newsletters exist across multiple pillars and categories

	Scenario: Filter defaults are applied on first load
		When the editor opens the All newsletters page
		Then Category is "All"
		And Pillar is "All"
		And all newsletters are shown

	Scenario: Category supports multi-select and updates the URL
		When the editor filters Category to "Article based" and "Other"
		Then only newsletters in Article based or Other are shown
		And the Category control shows a truncated selected-values summary
		And the URL includes the selected Category values

	Scenario: Pillar filter narrows results and updates the URL
		When the editor sets Pillar to "News"
		Then only rows matching Pillar "News" are shown
		And the result count matches the visible rows
		And the URL includes Pillar "News"

	Scenario: De-selecting Category filters resets the control and clears URL state
		Given the editor has active Category filters
		When the editor de-selects the selected Category filters
		Then Category is reset to "All"
		And URL query parameters for the Category filter are removed

	Scenario: De-selecting Pillar filters resets the control and clears URL state
		Given the editor has active Pillar filters
		When the editor de-selects the selected Pillar filters
		Then Pillar is reset to "All"
		And URL query parameters for the Pillar filter are removed
