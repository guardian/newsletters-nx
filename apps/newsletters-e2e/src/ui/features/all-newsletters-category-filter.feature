Feature: All newsletters category filter
	As an editor
	I want to filter newsletters by category
	So that I can narrow the list to relevant rows

	Background:
		Given the editor is using the Stand workspace
		And newsletters exist across multiple categories

	Scenario: Filter defaults are applied on first load
		When the editor opens the All newsletters page
		Then Category is "All"
		And all newsletters are shown

	Scenario: Category supports multi-select and updates the URL
		When the editor filters Category to "Article based" and "Other"
		Then only newsletters in Article based or Other are shown
		And the Category control shows a truncated selected-values summary
		And the URL includes the selected Category values

	Scenario: Clear all fields resets controls and clears URL state
		Given the editor has active Category filters
		When the editor de-selects the selected Category filters
		Then Category is reset to "All"
		And URL query parameters for the Category filter are removed
