Feature: All newsletters search
	As an editor
	I want to search newsletters by text
	So that I can find a specific newsletter quickly

	Background:
		Given the editor is using the Stand workspace
		And newsletters exist:
			| name             |
			| Politics Weekly  |
			| Morning Briefing |
			| Culture Manual   |

	Scenario: Search narrows results and updates the URL
		When the editor searches for "Politics"
		Then only newsletters matching "Politics" are shown
		And the result count matches the visible rows
		And the URL includes the search term

	Scenario: Clearing search resets results and removes search from the URL
		Given the editor has searched for "Politics"
		When the editor clears the search term
		Then all newsletters are shown
		And the search input is empty
		And the URL no longer includes the search term

	Scenario: Search with no results says so
		When the editor searches for "NoSuchNewsletter"
		Then the editor sees "No results found"
		And the result count is "0 newsletters"
		And the URL includes the search term
