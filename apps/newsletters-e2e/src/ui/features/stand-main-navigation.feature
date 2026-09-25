Feature: Stand main navigation
	The Stand design's main navigation lists the areas of the workspace an
	editor can move between. All Newsletters is the entry point for browsing
	every newsletter regardless of its state, so it appears first.

	Scenario: All Newsletters is the first item in the Stand main navigation
		Given an editor goes to the tool with the stand design switch on
		Then they should see the following navigation
			| label                 | path                    |
			| All newsletters       | /all                    |
			| Launched newsletters  | /launched               |
			| Draft newsletters     | /drafts                 |
			| Email templates       | /templates              |
			| Newsletter layouts    | /layouts                |
			| Create new newsletter | /drafts/newsletter-data |

	Scenario Outline: Navigating to each item in the Stand main navigation
		Given an editor goes to the tool with the stand design switch on
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
