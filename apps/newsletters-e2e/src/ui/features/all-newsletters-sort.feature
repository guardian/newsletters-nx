Feature: Sort newsletters
	As an editor
	I want to order newsletters consistently
	So that I can scan the list in the order I need

	Background:
		Given the editor is using the Stand workspace
		And newsletters with different last-updated dates are available

	Scenario: Sort control defaults to most recent
		Given the editor is on the All newsletters page
		Then Sort by should be "Most recent"
		And the rows appear in this order:
			| newsletter       |
			| Morning Briefing |
			| Zeta Weekly      |
			| Alpha Digest     |

	Scenario: Sort by most recent updates the URL
		Given the URL contains a valid sort value
		When the editor changes "Sort by" to "Most recent"
		Then rows are reordered by "Most recent"
		And the URL includes sort "Most recent"

	Scenario: Sort by newsletter name orders rows alphabetically
		Given the editor is on the All newsletters page
		When the editor changes "Sort by" to "Newsletter name"
		Then rows are reordered by "Newsletter name"
		And the URL includes sort "Newsletter name"

	Scenario: Reload restores sort from the URL
		Given the URL contains a valid sort value
		When the editor reloads the All newsletters page
		Then the "Sort by" control is pre-populated from the URL
		And the visible row order matches that state
