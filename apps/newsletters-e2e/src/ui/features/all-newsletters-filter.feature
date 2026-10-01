Feature: All newsletters filters
	As an editor
	I want to filter newsletters by key attributes
	So that I can narrow the list to relevant rows

	Background:
		Given the editor is using the Stand workspace
		And newsletters exist across multiple pillars, categories, and statuses

	Scenario: Filter defaults are applied on first load
		When the editor opens the All newsletters page
		Then Category should be "All"
		And Pillar should be "All"
		And Status should be "All"
		And all newsletters are shown

	Scenario Outline: Multi-select filters narrow results and update the URL
		Given the editor is on the All newsletters page
		When the editor filters <filter> to "<first>" and "<second>"
		Then only newsletters in <filter> "<first>" or "<second>" are shown
		And the <filter> control summarises "<first>" and "<second>"
		And the result count matches the visible rows
		And the URL includes <filter> "<first>" and "<second>"

		Examples:
			| filter   | first         | second |
			| Category | Article based | Other  |
			| Pillar   | News          | Sport  |
			| Status   | Live          | Draft  |

	Scenario Outline: De-selecting filters resets the control and clears URL state
		Given the editor has active <filter> filters
		When the editor de-selects the selected <filter> filters
		Then <filter> is reset to "All"
		And URL query parameters for the <filter> filter are removed

		Examples:
			| filter   |
			| Category |
			| Pillar   |
			| Status   |
