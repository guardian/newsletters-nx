Feature: Stand main navigation
	The Stand design's main navigation lists the areas of the workspace an
	editor can move between. All Newsletters is the entry point for browsing
	every newsletter regardless of its state, so it appears first.

	Scenario: The Stand main navigation displays in the correct order
		Given an editor's workspace uses the Stand design
		Then they should see the following navigation
			| label                 | path                    |
			| All newsletters       | /all                    |
			| Launched newsletters  | /launched               |
			| Draft newsletters     | /drafts                 |
			| Email templates       | /templates              |
			| Newsletter layouts    | /layouts                |
			| Create new newsletter | /drafts/newsletter-data |

	Scenario Outline: Navigating to each item in the Stand main navigation
		Given an editor's workspace uses the Stand design
		When they go to the <page> page
		Then they should be on the <page> page

		Examples:
			| page                  |
			| All newsletters       |
			| Launched newsletters  |
			| Draft newsletters     |
			| Email templates       |
			| Newsletter layouts    |
			| Create new newsletter |
