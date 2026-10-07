Feature: Edit a regional hub layout
	As an editor
	I want to open the edit page for a regional layout
	So that I can update its content

	Background:
		Given the editor is using the Stand workspace

	Scenario Outline: Read-only mode offers an edit action
		Given the editor is viewing the layout for region "<edition>" in read-only mode
		Then the "Edit layout" button is visible
		And the edit history controls are not visible
		And the "Publish layout" button is not visible

		Examples:
			| edition |
			| uk      |
			| us      |
			| au      |
			| int     |
			| eur     |

	Scenario Outline: Starting editing navigates to the edit page
		Given the editor is viewing the layout for region "<edition>" in read-only mode
		When the editor chooses to edit the layout
		Then the editor is viewing the edit page at "/layouts/edit/<edition>"

		Examples:
			| edition |
			| uk      |
			| us      |
			| au      |
			| int     |
			| eur     |

	Scenario: An empty layout explains how to add content
		Given the editor is viewing the layout for region "uk" in read-only mode
		Then a content box is displayed beneath the top section
		And the content box shows 'No content available. Click on "Edit layout" to add content.'
		And the "Edit layout" button is visible
