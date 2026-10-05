Feature: Clear all fields
	As an editor
	I want to reset search, filters and sort in one action
	So that I can quickly get back to the default view

	Background:
		Given the editor is using the Stand workspace
		And newsletters exist across multiple pillars, categories, and statuses

	Scenario Outline: Clear all resets controls and clears URL state
		Given the editor has active search and filters with "<result count>" results showing
		When the editor selects "Clear all"
		Then Category should be "All"
		And Pillar should be "All"
		And Status should be "All"
		And the search input is empty
		And Sort by should be "Most recent"
		And URL query parameters for search, filter, and sort are removed
		And all newsletters are shown
		And the result count matches the visible rows
		And the default newsletter row order is restored

		# title-format: Clear all resets a view with <result count> results
		Examples:
			| result count |
			| some         |
			| zero         |
