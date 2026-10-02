Feature: Stand main navigation
	The Stand design's main navigation lists the areas of the workspace an
	editor can move between. All Newsletters is the entry point for browsing
	every newsletter regardless of its state, so it appears first.

	Scenario: The Stand top-bar 'home' link navigates to the dashboard
		Given an editor's workspace uses the Stand design
		When they use the 'Newsletter' button in the top bar
		Then they should see the home page

	Scenario: The Stand main navigation displays in the correct order
		Given an editor's workspace uses the Stand design
		Then they should see the following navigation
			| label                 | path                    |
			| All newsletters       | /all                    |
			| Newsletters hub       | /layouts                |
			| Create new newsletter | /drafts/newsletter-data |

	Scenario: The 'Create new newsletter' link is only visible with correct permissions
		Given an editor's workspace uses the Stand design
		And the user does not have the 'edit everything' permission
		Then the 'Create new newsletter' nav link should not be visible

	Scenario Outline: Navigating to each item in the Stand main navigation
		Given an editor's workspace uses the Stand design
		When they go to the <page> page
		Then they should be on the <page> page

		Examples:
			| page                  |
			| All newsletters       |
			| Newsletters hub       |
			| Create new newsletter |
